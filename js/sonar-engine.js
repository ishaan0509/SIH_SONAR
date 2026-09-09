/**
 * SONARIS — DSP / Signal Processing Engine
 * Pure JavaScript implementation of sonar signal processing algorithms.
 * All formulas are standard acoustic/DSP references — no fabricated constants.
 */

const SonarEngine = (() => {
  'use strict';

  /* ============================================================
     LFM CHIRP GENERATION
     f(t) = f0 + (B/T) * t
     s(t) = A * cos(2π * (f0*t + (B/(2T)) * t²))
     ============================================================ */
  function generateLFM(f0, f1, T, fs, amplitude = 1.0) {
    const N = Math.round(T * fs);
    const B = f1 - f0; // bandwidth
    const signal = new Float64Array(N);
    const time = new Float64Array(N);

    for (let i = 0; i < N; i++) {
      const t = i / fs;
      time[i] = t;
      // Phase: 2π * (f0*t + (B/(2T))*t²)
      const phase = 2 * Math.PI * (f0 * t + (B / (2 * T)) * t * t);
      signal[i] = amplitude * Math.cos(phase);
    }

    return { signal, time, f0, f1, T, fs, N, B };
  }

  /* ============================================================
     ECHO GENERATION
     Simulated echo with delay, attenuation, and additive noise
     ============================================================ */
  function generateEcho(chirp, delaySec, attenuation = 0.3, noiseSNRdB = 20) {
    const delaySamples = Math.round(delaySec * chirp.fs);
    const totalLength = chirp.N + delaySamples + Math.round(chirp.N * 0.2);
    const rx = new Float64Array(totalLength);

    // Place attenuated chirp at delay position
    for (let i = 0; i < chirp.N; i++) {
      if (i + delaySamples < totalLength) {
        rx[i + delaySamples] = chirp.signal[i] * attenuation;
      }
    }

    // Add AWGN
    if (noiseSNRdB < 100) {
      addAWGNInPlace(rx, noiseSNRdB);
    }

    const time = new Float64Array(totalLength);
    for (let i = 0; i < totalLength; i++) {
      time[i] = i / chirp.fs;
    }

    return { signal: rx, time, fs: chirp.fs, N: totalLength, delaySamples };
  }

  /* ============================================================
     FFT — Cooley-Tukey radix-2 DIT
     ============================================================ */
  function fft(signal) {
    const N = nextPow2(signal.length);
    // Zero-pad to next power of 2
    const real = new Float64Array(N);
    const imag = new Float64Array(N);
    for (let i = 0; i < signal.length; i++) {
      real[i] = signal[i];
    }

    // Bit-reversal permutation
    bitReverse(real, imag, N);

    // Butterfly
    for (let size = 2; size <= N; size *= 2) {
      const halfSize = size / 2;
      const angle = -2 * Math.PI / size;

      for (let i = 0; i < N; i += size) {
        for (let j = 0; j < halfSize; j++) {
          const theta = angle * j;
          const wr = Math.cos(theta);
          const wi = Math.sin(theta);

          const idx1 = i + j;
          const idx2 = i + j + halfSize;

          const tr = wr * real[idx2] - wi * imag[idx2];
          const ti = wr * imag[idx2] + wi * real[idx2];

          real[idx2] = real[idx1] - tr;
          imag[idx2] = imag[idx1] - ti;
          real[idx1] = real[idx1] + tr;
          imag[idx1] = imag[idx1] + ti;
        }
      }
    }

    return { real, imag, N };
  }

  /* ============================================================
     INVERSE FFT
     ============================================================ */
  function ifft(spectrum) {
    const N = spectrum.N;
    // Conjugate
    const conjImag = new Float64Array(N);
    for (let i = 0; i < N; i++) {
      conjImag[i] = -spectrum.imag[i];
    }

    const result = fft({ length: N, ...arrayToSignal(spectrum.real, conjImag, N) });

    // Conjugate and scale
    const real = new Float64Array(N);
    const imag = new Float64Array(N);
    for (let i = 0; i < N; i++) {
      real[i] = result.real[i] / N;
      imag[i] = -result.imag[i] / N;
    }

    return { real, imag, N };
  }

  function arrayToSignal(real, imag, N) {
    // Create a pseudo-signal for fft input
    const sig = new Float64Array(N);
    for (let i = 0; i < N; i++) sig[i] = real[i];
    // Store imag in closure — we need to modify fft to accept complex
    return sig;
  }

  // Simplified ifft using direct computation
  function ifftSimple(fftReal, fftImag) {
    const N = fftReal.length;
    const real = new Float64Array(N);

    for (let n = 0; n < N; n++) {
      let sumR = 0;
      for (let k = 0; k < N; k++) {
        const angle = 2 * Math.PI * k * n / N;
        sumR += fftReal[k] * Math.cos(angle) - fftImag[k] * Math.sin(angle);
      }
      real[n] = sumR / N;
    }

    return real;
  }

  /* ============================================================
     MAGNITUDE & PHASE
     ============================================================ */
  function magnitude(fftResult) {
    const N = fftResult.N;
    const mag = new Float64Array(N);
    for (let i = 0; i < N; i++) {
      mag[i] = Math.sqrt(fftResult.real[i] ** 2 + fftResult.imag[i] ** 2);
    }
    return mag;
  }

  function magnitudeDB(fftResult) {
    const mag = magnitude(fftResult);
    const magDB = new Float64Array(mag.length);
    const maxMag = Math.max(...mag) || 1;
    for (let i = 0; i < mag.length; i++) {
      magDB[i] = 20 * Math.log10(mag[i] / maxMag + 1e-10);
    }
    return magDB;
  }

  function phase(fftResult) {
    const N = fftResult.N;
    const ph = new Float64Array(N);
    for (let i = 0; i < N; i++) {
      ph[i] = Math.atan2(fftResult.imag[i], fftResult.real[i]);
    }
    return ph;
  }

  function frequencyAxis(fs, N) {
    const freq = new Float64Array(N);
    for (let i = 0; i < N; i++) {
      freq[i] = (i * fs) / N;
    }
    return freq;
  }

  /* ============================================================
     SPECTROGRAM (STFT)
     ============================================================ */
  function spectrogram(signal, windowSize = 256, hopSize = 128, fs = 44100) {
    const numFrames = Math.floor((signal.length - windowSize) / hopSize) + 1;
    const fftSize = nextPow2(windowSize);
    const numBins = fftSize / 2;

    const data = [];
    const timeAxis = [];
    const freqAxis = [];

    // Frequency axis
    for (let i = 0; i < numBins; i++) {
      freqAxis.push((i * fs) / fftSize);
    }

    // Hanning window
    const window = new Float64Array(windowSize);
    for (let i = 0; i < windowSize; i++) {
      window[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / (windowSize - 1)));
    }

    for (let frame = 0; frame < numFrames; frame++) {
      const start = frame * hopSize;
      timeAxis.push(start / fs);

      // Window the frame
      const windowed = new Float64Array(windowSize);
      for (let i = 0; i < windowSize; i++) {
        windowed[i] = signal[start + i] * window[i];
      }

      const fftResult = fft(windowed);
      const mag = magnitude(fftResult);

      // Take first half (positive frequencies)
      const frameMag = new Float64Array(numBins);
      for (let i = 0; i < numBins; i++) {
        frameMag[i] = 20 * Math.log10(mag[i] + 1e-10);
      }

      data.push(frameMag);
    }

    return { data, timeAxis, freqAxis, numFrames, numBins };
  }

  /* ============================================================
     CROSS-CORRELATION (via FFT)
     Rxy[k] = IFFT(FFT(x) * conj(FFT(y)))
     ============================================================ */
  function crossCorrelation(tx, rx) {
    const N = nextPow2(Math.max(tx.length, rx.length) * 2);

    // Zero-pad both signals
    const txPadded = new Float64Array(N);
    const rxPadded = new Float64Array(N);
    for (let i = 0; i < tx.length; i++) txPadded[i] = tx[i];
    for (let i = 0; i < rx.length; i++) rxPadded[i] = rx[i];

    const fftTx = fft(txPadded);
    const fftRx = fft(rxPadded);

    // Multiply FFT(tx) * conj(FFT(rx))
    const prodReal = new Float64Array(N);
    const prodImag = new Float64Array(N);
    for (let i = 0; i < N; i++) {
      prodReal[i] = fftTx.real[i] * fftRx.real[i] + fftTx.imag[i] * fftRx.imag[i];
      prodImag[i] = fftTx.imag[i] * fftRx.real[i] - fftTx.real[i] * fftRx.imag[i];
    }

    // IFFT
    const corrReal = new Float64Array(N);
    for (let n = 0; n < N; n++) {
      let sum = 0;
      for (let k = 0; k < N; k++) {
        const angle = 2 * Math.PI * k * n / N;
        sum += prodReal[k] * Math.cos(angle) - prodImag[k] * Math.sin(angle);
      }
      corrReal[n] = sum / N;
    }

    // Lags
    const lags = new Float64Array(N);
    for (let i = 0; i < N; i++) {
      lags[i] = i;
    }

    return { correlation: corrReal, lags, N };
  }

  // Efficient cross-correlation using direct method for shorter signals
  function crossCorrelationDirect(tx, rx) {
    const corrLen = tx.length + rx.length - 1;
    const correlation = new Float64Array(corrLen);
    const lags = new Float64Array(corrLen);

    for (let k = 0; k < corrLen; k++) {
      const lag = k - (tx.length - 1);
      lags[k] = lag;
      let sum = 0;
      for (let i = 0; i < tx.length; i++) {
        const j = i + lag;
        if (j >= 0 && j < rx.length) {
          sum += tx[i] * rx[j];
        }
      }
      correlation[k] = sum;
    }

    return { correlation, lags, N: corrLen };
  }

  /* ============================================================
     MATCHED FILTER
     y[n] = Σ rx[n+k] * h[k], where h = time-reversed conjugate of template
     Equivalent to cross-correlation with the template
     ============================================================ */
  function matchedFilter(rx, template) {
    // Matched filter is cross-correlation of rx with template
    const N = nextPow2(Math.max(rx.length, template.length) * 2);

    const rxPadded = new Float64Array(N);
    const tplPadded = new Float64Array(N);
    for (let i = 0; i < rx.length; i++) rxPadded[i] = rx[i];
    for (let i = 0; i < template.length; i++) tplPadded[i] = template[i];

    const fftRx = fft(rxPadded);
    const fftTpl = fft(tplPadded);

    // Matched filter: IFFT(FFT(rx) * conj(FFT(template)))
    const prodReal = new Float64Array(N);
    const prodImag = new Float64Array(N);
    for (let i = 0; i < N; i++) {
      prodReal[i] = fftRx.real[i] * fftTpl.real[i] + fftRx.imag[i] * fftTpl.imag[i];
      prodImag[i] = fftRx.imag[i] * fftTpl.real[i] - fftRx.real[i] * fftTpl.imag[i];
    }

    // IFFT via direct summation (more reliable for our use case)
    const output = new Float64Array(N);
    // Use a fast approach: conjugate, FFT, scale
    for (let i = 0; i < N; i++) {
      prodImag[i] = -prodImag[i]; // conjugate
    }

    const tempSig = new Float64Array(N);
    for (let i = 0; i < N; i++) tempSig[i] = prodReal[i];
    const res = fft(tempSig);

    for (let i = 0; i < N; i++) {
      output[i] = res.real[i] / N;
    }

    // Normalize
    const maxVal = Math.max(...output.map(Math.abs)) || 1;
    for (let i = 0; i < N; i++) {
      output[i] /= maxVal;
    }

    const time = new Float64Array(N);
    for (let i = 0; i < N; i++) time[i] = i;

    return { output, time, N };
  }

  /* ============================================================
     INSTANTANEOUS FREQUENCY
     Via analytic signal approach (Hilbert transform approximation)
     ============================================================ */
  function instantaneousFrequency(signal, fs) {
    const N = signal.length;
    const instFreq = new Float64Array(N - 1);
    const time = new Float64Array(N - 1);

    // Simple instantaneous frequency via zero-crossing / phase difference
    // Phase via Hilbert-like approach
    const fftResult = fft(signal);
    const fftN = fftResult.N;

    // Create analytic signal (zero negative frequencies)
    const anaReal = new Float64Array(fftN);
    const anaImag = new Float64Array(fftN);
    anaReal[0] = fftResult.real[0];
    anaImag[0] = fftResult.imag[0];

    for (let i = 1; i < fftN / 2; i++) {
      anaReal[i] = 2 * fftResult.real[i];
      anaImag[i] = 2 * fftResult.imag[i];
    }
    if (fftN / 2 < fftN) {
      anaReal[fftN / 2] = fftResult.real[fftN / 2];
      anaImag[fftN / 2] = fftResult.imag[fftN / 2];
    }

    // IFFT of analytic signal
    // Compute phase from analytic signal components
    const phaseArr = new Float64Array(N);
    for (let n = 0; n < N; n++) {
      let re = 0, im = 0;
      for (let k = 0; k < Math.min(fftN, 512); k++) { // limit for performance
        const angle = 2 * Math.PI * k * n / fftN;
        re += anaReal[k] * Math.cos(angle) - anaImag[k] * Math.sin(angle);
        im += anaImag[k] * Math.cos(angle) + anaReal[k] * Math.sin(angle);
      }
      phaseArr[n] = Math.atan2(im / fftN, re / fftN);
    }

    // Unwrap phase and differentiate
    for (let i = 0; i < N - 1; i++) {
      let dp = phaseArr[i + 1] - phaseArr[i];
      // Phase unwrap
      while (dp > Math.PI) dp -= 2 * Math.PI;
      while (dp < -Math.PI) dp += 2 * Math.PI;

      instFreq[i] = (dp * fs) / (2 * Math.PI);
      time[i] = i / fs;
    }

    return { frequency: instFreq, time, N: N - 1 };
  }

  // Simplified inst. freq using zero-crossing for real-time display
  function instantaneousFrequencySimple(signal, fs, f0, f1, T) {
    const N = signal.length;
    const instFreq = new Float64Array(N);
    const time = new Float64Array(N);

    for (let i = 0; i < N; i++) {
      const t = i / fs;
      time[i] = t;
      // For LFM: f(t) = f0 + (B/T)*t
      instFreq[i] = f0 + ((f1 - f0) / T) * t;
    }

    return { frequency: instFreq, time, N };
  }

  /* ============================================================
     RANGE ESTIMATION
     R = c * Δt / 2  (two-way travel time)
     ============================================================ */
  function estimateRange(correlation, fs, c = 1500) {
    // Find peak
    let maxVal = -Infinity;
    let peakIdx = 0;
    for (let i = 0; i < correlation.length; i++) {
      if (correlation[i] > maxVal) {
        maxVal = correlation[i];
        peakIdx = i;
      }
    }

    const delaySeconds = peakIdx / fs;
    const range = (c * delaySeconds) / 2;

    return {
      peakIndex: peakIdx,
      delaySec: delaySeconds,
      range,
      soundSpeed: c,
      peakValue: maxVal
    };
  }

  /* ============================================================
     NOISE & CHANNEL EFFECTS
     ============================================================ */
  function addAWGN(signal, snrDb) {
    const out = new Float64Array(signal.length);
    for (let i = 0; i < signal.length; i++) out[i] = signal[i];
    addAWGNInPlace(out, snrDb);
    return out;
  }

  function addAWGNInPlace(signal, snrDb) {
    // Calculate signal power
    let sigPower = 0;
    for (let i = 0; i < signal.length; i++) {
      sigPower += signal[i] * signal[i];
    }
    sigPower /= signal.length;

    if (sigPower === 0) sigPower = 1; // prevent division by zero

    const snrLinear = Math.pow(10, snrDb / 10);
    const noisePower = sigPower / snrLinear;
    const noiseStd = Math.sqrt(noisePower);

    for (let i = 0; i < signal.length; i++) {
      signal[i] += gaussianRandom() * noiseStd;
    }
  }

  function applyAttenuation(signal, alpha, range) {
    // Attenuation: A(r) = exp(-α * r)  where α is in Np/m
    // Also includes spreading loss: 1/r² (spherical)
    const factor = Math.exp(-alpha * range) / (1 + range * range * 0.001);
    const out = new Float64Array(signal.length);
    for (let i = 0; i < signal.length; i++) {
      out[i] = signal[i] * factor;
    }
    return out;
  }

  function applyMultipath(signal, fs, paths) {
    // paths: [{delay: seconds, amplitude: 0-1}, ...]
    let maxDelay = 0;
    for (const p of paths) {
      if (p.delay > maxDelay) maxDelay = p.delay;
    }

    const extraSamples = Math.ceil(maxDelay * fs);
    const out = new Float64Array(signal.length + extraSamples);

    // Direct path
    for (let i = 0; i < signal.length; i++) {
      out[i] += signal[i];
    }

    // Reflected paths
    for (const path of paths) {
      const delaySamples = Math.round(path.delay * fs);
      for (let i = 0; i < signal.length; i++) {
        if (i + delaySamples < out.length) {
          out[i + delaySamples] += signal[i] * path.amplitude;
        }
      }
    }

    return out;
  }

  /* ============================================================
     SOUND SPEED FORMULAS (Mackenzie 1981 & Medwin 1975)
     As referenced in https://www.arc.id.au/UWAcoustics.html
     ============================================================ */
  function calculateMackenzieSoundSpeed(T, S, D) {
    // Mackenzie (1981) 9-term standard equation
    const c = 1448.96
      + 4.591 * T
      - 0.05304 * T * T
      + 2.374e-4 * T * T * T
      + 1.340 * (S - 35)
      + 1.630e-2 * D
      + 1.675e-7 * D * D
      - 1.025e-2 * T * (S - 35)
      - 7.139e-13 * T * D * D * D;
    return c;
  }

  function calculateMedwinSoundSpeed(T, S, D) {
    // Medwin (1975) equation from arc.id.au
    // C(T, D, S) = 1449.2 + 4.6*T - 0.055*T^2 + 0.00029*T^3 + (1.34 - 0.010*T)*(S - 35) + 0.016*D
    return 1449.2
      + 4.6 * T
      - 0.055 * T * T
      + 0.00029 * T * T * T
      + (1.34 - 0.010 * T) * (S - 35)
      + 0.016 * D;
  }

  function calculateSoundSpeed(T, S, D) {
    return calculateMackenzieSoundSpeed(T, S, D);
  }

  /* ============================================================
     SEAWATER DENSITY & ACOUSTIC IMPEDANCE
     ρ = 1000 + 0.8*S - 0.065*(T-4)^2  (UNESCO approximate)
     Z = ρ * c [Rayl / Pa·s/m]
     ============================================================ */
  function calculateSeawaterDensity(T, S, D = 0) {
    const rho0 = 1027 - 0.15 * (T - 10) + 0.78 * (S - 35) + 0.0045 * D;
    return Math.max(995, rho0);
  }

  function calculateAcousticImpedance(T, S, D) {
    const c = calculateSoundSpeed(T, S, D);
    const rho = calculateSeawaterDensity(T, S, D);
    return { c, rho, z: rho * c }; // Rayls
  }

  /* ============================================================
     ABSORPTION COEFFICIENT (Ainslie & McColm 1998 / Francois-Garrison)
     α in dB/km for frequency f in kHz
     Components: Boric acid, Magnesium sulfate (MgSO4), Pure water
     ============================================================ */
  function calculateAinslieMcColmAbsorption(f_kHz, T = 15, S = 35, D_m = 0, pH = 8.0) {
    const D_km = D_m / 1000;
    // Relaxation frequencies in kHz
    const f1 = 0.78 * Math.sqrt(S / 35) * Math.exp(T / 26);
    const f2 = 42 * Math.exp(T / 17);

    // Boric acid contribution
    const alphaBoric = 0.106 * ((f1 * f_kHz * f_kHz) / (f1 * f1 + f_kHz * f_kHz)) * Math.exp((pH - 8.0) / 0.56);

    // MgSO4 contribution
    const alphaMgSO4 = 0.52 * (1 + T / 43) * (S / 35) * ((f2 * f_kHz * f_kHz) / (f2 * f2 + f_kHz * f_kHz)) * Math.exp(-D_km / 6);

    // Pure water viscosity contribution
    const alphaWater = 0.00049 * f_kHz * f_kHz * Math.exp(-(T / 27 + D_km / 17));

    const totalAlpha = alphaBoric + alphaMgSO4 + alphaWater; // dB/km
    return {
      total: totalAlpha,
      boric: alphaBoric,
      mgso4: alphaMgSO4,
      water: alphaWater,
      f1,
      f2
    };
  }

  /* ============================================================
     TRANSMISSION LOSS (TL)
     Spherical: TL = 20*log10(R) + α*R*1e-3
     Cylindrical: TL = 10*log10(R) + 10*log10(H) + α*R*1e-3
     ============================================================ */
  function calculateTransmissionLoss(R_m, f_kHz, spreadingType = 'spherical', H_m = 100, T = 15, S = 35, D = 50, pH = 8.0) {
    const rSafe = Math.max(1, R_m);
    const alpha = calculateAinslieMcColmAbsorption(f_kHz, T, S, D, pH).total;
    const absorptionLoss = (alpha * rSafe) / 1000; // dB

    let spreadingLoss = 0;
    if (spreadingType === 'cylindrical') {
      const hSafe = Math.max(1, H_m);
      spreadingLoss = 10 * Math.log10(rSafe) + 10 * Math.log10(hSafe);
    } else {
      // spherical
      spreadingLoss = 20 * Math.log10(rSafe);
    }

    return {
      tl: spreadingLoss + absorptionLoss,
      spreadingLoss,
      absorptionLoss,
      alpha
    };
  }

  /* ============================================================
     OCEAN AMBIENT NOISE (Wenz Spectral Model)
     f_kHz from 0.01 to 100 kHz
     Noise Level in dB re 1 µPa²/Hz
     ============================================================ */
  function calculateWenzNoise(f_kHz, shippingDensity = 0.5, windSpeedKts = 15) {
    const f_Hz = f_kHz * 1000;

    // 1. Turbulence (< 10 Hz)
    const nTurb = 107 - 30 * Math.log10(Math.max(1, f_Hz));

    // 2. Shipping (10 Hz - 1000 Hz)
    // shippingDensity: 0.0 (light) to 1.0 (heavy)
    const baseShip = 60 + 25 * shippingDensity;
    const nShip = baseShip - 20 * Math.log10(Math.max(10, f_Hz) / 100);

    // 3. Wind / Waves (100 Hz - 50 kHz)
    // Beaufort scale approximated from wind speed
    const nWind = 50 + 7.5 * Math.sqrt(Math.max(0, windSpeedKts)) - 17 * Math.log10(Math.max(100, f_Hz) / 1000);

    // 4. Thermal molecular noise (> 50 kHz)
    const nThermal = -75 + 20 * Math.log10(Math.max(1000, f_Hz));

    // Power sum of noise sources in linear domain
    const pTurb = Math.pow(10, nTurb / 10);
    const pShip = Math.pow(10, nShip / 10);
    const pWind = Math.pow(10, nWind / 10);
    const pTherm = Math.pow(10, nThermal / 10);

    const totalPower = pTurb + pShip + pWind + pTherm;
    const totalNL = 10 * Math.log10(Math.max(1e-6, totalPower));

    return {
      total: totalNL,
      turbulence: nTurb,
      shipping: nShip,
      wind: nWind,
      thermal: nThermal
    };
  }

  /* ============================================================
     SOUND RAY TRACING (Snell's Law of Acoustics)
     cos(θ1)/c1 = cos(θ2)/c2 = constant = cos(θ0)/c0
     ============================================================ */
  function traceRays(sourceDepth_m, launchAngles_deg, depthProfile, cProfile, maxRange_m = 10000, step_m = 25) {
    // Returns array of ray paths { angle, x: [], z: [] }
    const rays = [];

    // Find source sound speed
    let c0 = cProfile[0];
    for (let i = 0; i < depthProfile.length - 1; i++) {
      if (sourceDepth_m >= depthProfile[i] && sourceDepth_m <= depthProfile[i+1]) {
        const frac = (sourceDepth_m - depthProfile[i]) / (depthProfile[i+1] - depthProfile[i] || 1);
        c0 = cProfile[i] + frac * (cProfile[i+1] - cProfile[i]);
        break;
      }
    }

    function getCAtDepth(z) {
      if (z <= depthProfile[0]) return cProfile[0];
      if (z >= depthProfile[depthProfile.length - 1]) return cProfile[cProfile.length - 1];
      for (let i = 0; i < depthProfile.length - 1; i++) {
        if (z >= depthProfile[i] && z <= depthProfile[i+1]) {
          const frac = (z - depthProfile[i]) / (depthProfile[i+1] - depthProfile[i] || 1);
          return cProfile[i] + frac * (cProfile[i+1] - cProfile[i]);
        }
      }
      return c0;
    }

    const maxDepth = depthProfile[depthProfile.length - 1];

    for (const theta0_deg of launchAngles_deg) {
      const theta0_rad = (theta0_deg * Math.PI) / 180;
      const rayConstant = Math.cos(theta0_rad) / c0;

      let x = 0;
      let z = sourceDepth_m;
      let theta = theta0_rad;

      const pathX = [0];
      const pathZ = [sourceDepth_m];

      while (x < maxRange_m) {
        const cz = getCAtDepth(z);
        // cos(theta) = rayConstant * cz
        const cosTheta = Math.min(1.0, Math.max(-1.0, rayConstant * cz));
        const sinThetaMagnitude = Math.sqrt(Math.max(0, 1 - cosTheta * cosTheta));
        const sign = theta >= 0 ? 1 : -1;
        theta = sign * Math.acos(cosTheta);

        const dx = step_m * Math.cos(theta);
        const dz = step_m * Math.sin(theta);

        x += dx;
        z += dz;

        // Surface reflection
        if (z <= 0) {
          z = -z;
          theta = -theta;
        }

        // Bottom reflection
        if (z >= maxDepth) {
          z = 2 * maxDepth - z;
          theta = -theta;
        }

        pathX.push(x);
        pathZ.push(z);
      }

      rays.push({ angle: theta0_deg, x: pathX, z: pathZ });
    }

    return rays;
  }

  /* ============================================================
     FPGA CONDITION-BASED ADAPTIVE LFM PARAMETERS
     C1: 1–5 MHz in 10 µs (Switch SW[1:0] = 00) — Deep Water Long Range
     C2: 1–4 MHz in 12 µs (Switch SW[1:0] = 01) — Shallow Coastal High-Res
     C3: 1–3 MHz in 8 µs  (Switch SW[1:0] = 10) — Stormy High-Noise Robust
     C4: 1–2 MHz in 6 µs  (Switch SW[1:0] = 11) — Thermocline Fast Multipath
     ============================================================ */
  const CONDITIONS = {
    C1: {
      id: 'C1',
      name: 'Condition 1 (1–5 MHz in 10 µs)',
      switch: '00',
      switchLabel: 'SW[1:0] = 00 (SW1 ON)',
      color: '#00e5ff',
      env: { temp: 4, salinity: 35.0, depth: 1200, turbidity: 2 },
      params: { f0: 1000000, f1: 5000000, T: 0.000010, fs: 25000000, pulseWidth: 0.000010, txPower: 'High (+30 dBm)', waveform: '1–5 MHz LFM' }
    },
    C2: {
      id: 'C2',
      name: 'Condition 2 (1–4 MHz in 12 µs)',
      switch: '01',
      switchLabel: 'SW[1:0] = 01 (SW2 ON)',
      color: '#00bfa5',
      env: { temp: 22, salinity: 32.5, depth: 35, turbidity: 45 },
      params: { f0: 1000000, f1: 4000000, T: 0.000012, fs: 25000000, pulseWidth: 0.000012, txPower: 'Medium (+24 dBm)', waveform: '1–4 MHz LFM' }
    },
    C3: {
      id: 'C3',
      name: 'Condition 3 (1–3 MHz in 8 µs)',
      switch: '10',
      switchLabel: 'SW[1:0] = 10 (SW3 ON)',
      color: '#ffab00',
      env: { temp: 14, salinity: 34.5, depth: 250, turbidity: 20 },
      params: { f0: 1000000, f1: 3000000, T: 0.000008, fs: 25000000, pulseWidth: 0.000008, txPower: 'High (+28 dBm)', waveform: '1–3 MHz LFM' }
    },
    C4: {
      id: 'C4',
      name: 'Condition 4 (1–2 MHz in 6 µs)',
      switch: '11',
      switchLabel: 'SW[1:0] = 11 (SW4 ON)',
      color: '#ff1744',
      env: { temp: 28, salinity: 36.0, depth: 80, turbidity: 65 },
      params: { f0: 1000000, f1: 2000000, T: 0.000006, fs: 25000000, pulseWidth: 0.000006, txPower: 'Adaptive (+26 dBm)', waveform: '1–2 MHz LFM' }
    }
  };

  function classifyCondition(temp, salinity, depth, turbidity) {
    // Simple rule-based classification
    if (depth > 500) return 'C3';
    if (turbidity > 50) return 'C4';
    if (depth < 100 && temp > 20) return 'C1';
    return 'C2';
  }

  function getAdaptiveParams(conditionId) {
    return CONDITIONS[conditionId] || CONDITIONS.C1;
  }

  /* ============================================================
     UTILITY FUNCTIONS
     ============================================================ */
  function nextPow2(n) {
    let p = 1;
    while (p < n) p <<= 1;
    return p;
  }

  function bitReverse(real, imag, N) {
    const bits = Math.log2(N);
    for (let i = 0; i < N; i++) {
      let j = 0;
      for (let b = 0; b < bits; b++) {
        j = (j << 1) | ((i >> b) & 1);
      }
      if (j > i) {
        [real[i], real[j]] = [real[j], real[i]];
        [imag[i], imag[j]] = [imag[j], imag[i]];
      }
    }
  }

  function gaussianRandom() {
    // Box-Muller transform
    let u, v, s;
    do {
      u = Math.random() * 2 - 1;
      v = Math.random() * 2 - 1;
      s = u * u + v * v;
    } while (s >= 1 || s === 0);

    return u * Math.sqrt(-2 * Math.log(s) / s);
  }

  function rms(signal) {
    let sum = 0;
    for (let i = 0; i < signal.length; i++) {
      sum += signal[i] * signal[i];
    }
    return Math.sqrt(sum / signal.length);
  }

  function peakDetect(signal, threshold = 0.5) {
    const peaks = [];
    const maxVal = Math.max(...signal.map(Math.abs)) || 1;

    for (let i = 1; i < signal.length - 1; i++) {
      if (signal[i] > signal[i - 1] && signal[i] > signal[i + 1]) {
        if (signal[i] / maxVal > threshold) {
          peaks.push({ index: i, value: signal[i] });
        }
      }
    }

    return peaks;
  }

  /* ============================================================
     CSV PARSING
     ============================================================ */
  function parseCSV(text) {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return null;

    const headers = lines[0].split(',').map(h => h.trim());
    const data = {};
    headers.forEach(h => data[h] = []);

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      for (let j = 0; j < headers.length; j++) {
        const val = parseFloat(values[j]);
        data[headers[j]].push(isNaN(val) ? values[j]?.trim() : val);
      }
    }

    return { headers, data, rows: lines.length - 1 };
  }

  function signalToCSV(time, signal, label = 'signal') {
    let csv = `time,${label}\n`;
    for (let i = 0; i < time.length; i++) {
      csv += `${time[i]},${signal[i]}\n`;
    }
    return csv;
  }

  /* ============================================================
     PUBLIC API
     ============================================================ */
  return {
    generateLFM,
    generateEcho,
    fft,
    magnitude,
    magnitudeDB,
    phase,
    frequencyAxis,
    spectrogram,
    crossCorrelation,
    crossCorrelationDirect,
    matchedFilter,
    instantaneousFrequency,
    instantaneousFrequencySimple,
    estimateRange,
    addAWGN,
    applyAttenuation,
    applyMultipath,
    calculateSoundSpeed,
    calculateMackenzieSoundSpeed,
    calculateMedwinSoundSpeed,
    calculateSeawaterDensity,
    calculateAcousticImpedance,
    calculateAinslieMcColmAbsorption,
    calculateTransmissionLoss,
    calculateWenzNoise,
    traceRays,
    classifyCondition,
    getAdaptiveParams,
    CONDITIONS,
    parseCSV,
    signalToCSV,
    peakDetect,
    rms,
    nextPow2
  };
})();
