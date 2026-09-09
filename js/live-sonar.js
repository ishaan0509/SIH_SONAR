/**
 * SONARIS — Live Sonar & FPGA Hardware Prototype Switch Controller
 * Implements FPGA adaptive controller selecting LFM chirp configurations via prototype switches:
 * C1: 1–5 MHz in 10 µs (SW[1:0] = 00)
 * C2: 1–4 MHz in 12 µs (SW[1:0] = 01)
 * C3: 1–3 MHz in 8 µs  (SW[1:0] = 10)
 * C4: 1–2 MHz in 6 µs  (SW[1:0] = 11)
 */

const LiveSonar = (() => {
  'use strict';

  let currentCondition = 'C1';
  let targetDistance_m = 120; // 120 meters
  let snr_dB = 15;
  let isStreaming = true;

  const FPGA_MODES = {
    C1: {
      id: 'C1',
      name: 'Condition 1: 1–5 MHz in 10 µs',
      switchBits: '00',
      switchIdx: 1,
      f0_MHz: 1.0,
      f1_MHz: 5.0,
      pulse_us: 10.0,
      bandwidth_MHz: 4.0,
      sweepRate_GHz_s: 400.0,
      timeBW_product: 40.0,
      processingGain_dB: '+16.02 dB',
      color: '#00e5ff',
      desc: 'Wideband Deep Penetration Chirp (SW1 Active)'
    },
    C2: {
      id: 'C2',
      name: 'Condition 2: 1–4 MHz in 12 µs',
      switchBits: '01',
      switchIdx: 2,
      f0_MHz: 1.0,
      f1_MHz: 4.0,
      pulse_us: 12.0,
      bandwidth_MHz: 3.0,
      sweepRate_GHz_s: 250.0,
      timeBW_product: 36.0,
      processingGain_dB: '+15.56 dB',
      color: '#00bfa5',
      desc: 'High Resolution Littoral Chirp (SW2 Active)'
    },
    C3: {
      id: 'C3',
      name: 'Condition 3: 1–3 MHz in 8 µs',
      switchBits: '10',
      switchIdx: 3,
      f0_MHz: 1.0,
      f1_MHz: 3.0,
      pulse_us: 8.0,
      bandwidth_MHz: 2.0,
      sweepRate_GHz_s: 250.0,
      timeBW_product: 16.0,
      processingGain_dB: '+12.04 dB',
      color: '#ffab00',
      desc: 'Fast Agility Noise Rejection Chirp (SW3 Active)'
    },
    C4: {
      id: 'C4',
      name: 'Condition 4: 1–2 MHz in 6 µs',
      switchBits: '11',
      switchIdx: 4,
      f0_MHz: 1.0,
      f1_MHz: 2.0,
      pulse_us: 6.0,
      bandwidth_MHz: 1.0,
      sweepRate_GHz_s: 166.7,
      timeBW_product: 6.0,
      processingGain_dB: '+7.78 dB',
      color: '#ff1744',
      desc: 'Ultra-Fast Coded Pulse (SW4 Active)'
    }
  };

  function init() {
    setupDipSwitches();
    setupControls();
    selectMode('C1');
  }

  function setupDipSwitches() {
    document.querySelectorAll('.fpga-switch-card').forEach(card => {
      card.addEventListener('click', () => {
        const cond = card.dataset.condition;
        if (cond && FPGA_MODES[cond]) {
          selectMode(cond);
        }
      });
    });
  }

  function setupControls() {
    const snrSlider = document.getElementById('live-snr-slider');
    const snrVal = document.getElementById('live-snr-val');
    if (snrSlider && snrVal) {
      snrSlider.addEventListener('input', () => {
        snr_dB = parseFloat(snrSlider.value);
        snrVal.textContent = (snr_dB > 0 ? '+' : '') + snr_dB + ' dB';
        renderLiveSignals();
      });
    }

    const distSlider = document.getElementById('live-dist-slider');
    const distVal = document.getElementById('live-dist-val');
    if (distSlider && distVal) {
      distSlider.addEventListener('input', () => {
        targetDistance_m = parseFloat(distSlider.value);
        distVal.textContent = targetDistance_m + ' m';
        renderLiveSignals();
      });
    }
  }

  function selectMode(condId) {
    currentCondition = condId;
    const mode = FPGA_MODES[condId] || FPGA_MODES.C1;

    // Update active switch styling & LEDs
    document.querySelectorAll('.fpga-switch-card').forEach(card => {
      const isThis = card.dataset.condition === condId;
      card.classList.toggle('active', isThis);
      const led = card.querySelector('.switch-led');
      if (led) {
        led.style.background = isThis ? '#00c853' : '#334455';
        led.style.boxShadow = isThis ? '0 0 10px #00c853' : 'none';
      }
    });

    // Update Telemetry Header
    setText('fpga-active-mode-title', mode.name);
    setText('fpga-active-reg', `SW[1:0] = ${mode.switchBits}`);
    setText('fpga-stat-bw', `${mode.bandwidth_MHz.toFixed(1)} <span class="unit">MHz</span>`);
    setText('fpga-stat-pulse', `${mode.pulse_us.toFixed(1)} <span class="unit">µs</span>`);
    setText('fpga-stat-slope', `${mode.sweepRate_GHz_s.toFixed(1)} <span class="unit">GHz/s</span>`);
    setText('fpga-stat-bt', mode.timeBW_product.toFixed(1));
    setText('fpga-stat-gain', mode.processingGain_dB);

    renderLiveSignals();
  }

  function renderLiveSignals() {
    const mode = FPGA_MODES[currentCondition] || FPGA_MODES.C1;

    // Synthesize MHz LFM Chirp at Fs = 25 MHz
    const Fs = 25e6; // 25 MHz sampling rate
    const f0 = mode.f0_MHz * 1e6;
    const f1 = mode.f1_MHz * 1e6;
    const T = mode.pulse_us * 1e-6;
    const B = mode.bandwidth_MHz * 1e6;
    const N = Math.round(T * Fs);

    const time_us = [];
    const tx_signal = [];
    const phase_rad = [];

    for (let i = 0; i < N; i++) {
      const t = i / Fs;
      time_us.push(t * 1e6); // Microseconds
      const phi = 2 * Math.PI * (f0 * t + (B / (2 * T)) * t * t);
      phase_rad.push(phi % (2 * Math.PI));
      tx_signal.push(Math.cos(phi));
    }

    // 1. Plot TX Chirp Oscilloscope (Microseconds)
    const elOsc = document.getElementById('live-tx-oscilloscope');
    if (elOsc) {
      const traceOsc = {
        x: time_us,
        y: tx_signal,
        type: 'scatter',
        mode: 'lines',
        line: { color: mode.color, width: 2 },
        hovertemplate: 't=%{x:.2f} µs<br>V=%{y:.3f} V<extra></extra>'
      };

      const layoutOsc = {
        ...SonarPlots.DARK_THEME,
        title: { text: `<span style="color:#e0e8f0">FPGA DAC Output — [${mode.id}] ${mode.f0_MHz}–${mode.f1_MHz} MHz Chirp</span>`, x: 0.02 },
        xaxis: { ...SonarPlots.DARK_THEME.xaxis, title: 'Time (µs)' },
        yaxis: { ...SonarPlots.DARK_THEME.yaxis, title: 'Normalized Voltage (V)', range: [-1.2, 1.2] },
        margin: { l: 50, r: 20, t: 45, b: 40 }
      };

      Plotly.newPlot(elOsc, [traceOsc], layoutOsc, SonarPlots.PLOT_CONFIG);
    }

    // 2. Plot RF Power Spectrum (Megahertz)
    const elSpec = document.getElementById('live-rf-spectrum');
    if (elSpec) {
      // Frequency axis from 0 to 8 MHz
      const freq_MHz = [];
      const spectrum_dB = [];

      for (let f = 0; f <= 8; f += 0.05) {
        freq_MHz.push(f);
        if (f >= mode.f0_MHz && f <= mode.f1_MHz) {
          // Flat passband with slight ripple
          const ripple = Math.sin((f - mode.f0_MHz) * 12) * 0.8;
          spectrum_dB.push(0 + ripple);
        } else {
          // Stopband attenuation
          const dist = f < mode.f0_MHz ? (mode.f0_MHz - f) : (f - mode.f1_MHz);
          spectrum_dB.push(-45 - dist * 25);
        }
      }

      const traceSpec = {
        x: freq_MHz,
        y: spectrum_dB,
        type: 'scatter',
        mode: 'lines',
        line: { color: '#00c853', width: 2 },
        fill: 'tozeroy',
        fillcolor: 'rgba(0, 200, 83, 0.12)',
        hovertemplate: 'f=%{x:.2f} MHz<br>P=%{y:.1f} dB<extra></extra>'
      };

      const layoutSpec = {
        ...SonarPlots.DARK_THEME,
        title: { text: `<span style="color:#e0e8f0">RF Power Spectrum (${mode.bandwidth_MHz} MHz Passband)</span>`, x: 0.02 },
        xaxis: { ...SonarPlots.DARK_THEME.xaxis, title: 'Frequency (MHz)', range: [0, 8] },
        yaxis: { ...SonarPlots.DARK_THEME.yaxis, title: 'Power (dB)', range: [-60, 5] },
        margin: { l: 50, r: 20, t: 45, b: 40 }
      };

      Plotly.newPlot(elSpec, [traceSpec], layoutSpec, SonarPlots.PLOT_CONFIG);
    }

    // 3. Plot Pipelined Matched Filter Pulse Compression Peak
    const elMF = document.getElementById('live-mf-peak');
    if (elMF) {
      const lag_us = [];
      const corr_out = [];

      // Simulated matched filter output over 30 µs window
      const peakLag = 15.0; // 15 µs target echo delay
      for (let t = 0; t <= 30; t += 0.1) {
        lag_us.push(t);
        const diff = t - peakLag;
        // Sinc envelope representing pulse compression peak of width ~ 1/B
        const sincArg = Math.PI * mode.bandwidth_MHz * diff;
        const mainLobe = sincArg === 0 ? 1 : Math.sin(sincArg) / sincArg;
        const noise = (Math.random() - 0.5) * Math.pow(10, -snr_dB / 20) * 0.4;
        const val = Math.abs(mainLobe) + noise;
        corr_out.push(Math.max(0, val));
      }

      const traceMF = {
        x: lag_us,
        y: corr_out,
        type: 'scatter',
        mode: 'lines',
        line: { color: '#ffab00', width: 2 },
        hovertemplate: 'Lag=%{x:.2f} µs<br>Correlation=%{y:.3f}<extra></extra>'
      };

      const layoutMF = {
        ...SonarPlots.DARK_THEME,
        title: { text: `<span style="color:#e0e8f0">Matched Filter Pulse Compression Peak (Gain: ${mode.processingGain_dB})</span>`, x: 0.02 },
        xaxis: { ...SonarPlots.DARK_THEME.xaxis, title: 'Time Delay Lag (µs)', range: [0, 30] },
        yaxis: { ...SonarPlots.DARK_THEME.yaxis, title: 'Normalized Correlation Output', range: [0, 1.2] },
        annotations: [
          {
            x: 15.0,
            y: 1.0,
            text: `Target Peak (${mode.processingGain_dB})`,
            showarrow: true,
            arrowhead: 2,
            arrowcolor: '#00e5ff',
            font: { color: '#00e5ff', size: 10, family: "'JetBrains Mono'" },
            bgcolor: 'rgba(17,27,46,0.9)',
            bordercolor: '#00e5ff'
          }
        ],
        margin: { l: 50, r: 20, t: 45, b: 40 }
      };

      Plotly.newPlot(elMF, [traceMF], layoutMF, SonarPlots.PLOT_CONFIG);
    }
  }

  function setText(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  }

  return { init, selectMode };
})();
