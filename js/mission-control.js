/**
 * SONARIS — Mission Control Logic
 * 4 Condition Preset Buttons, Synchronized Sliders, Radar PPI, and Live Waveform Synthesis
 */

const MissionControl = (() => {
  'use strict';

  let currentCondition = 'C1';
  let envParams = { temp: 4, salinity: 35.0, depth: 1200, turbidity: 2 };

  // Condition Presets with full definitions and physical parameters
  const PRESETS = {
    C1: {
      id: 'C1',
      name: 'Deep Ocean SOFAR Channel',
      tagline: 'Ultra Long-Range Deep Acoustic Duct',
      badge: 'Deep Water / SOFAR',
      color: '#00e5ff',
      temp: 4,
      salinity: 35.0,
      depth: 1200,
      turbidity: 2,
      rangeKm: '8.5 km',
      snrExpected: '+24 dB',
      definition: 'Stable cold deep water utilizing the SOFAR minimum sound-velocity axis. Acoustic rays refract symmetrically around the axis, eliminating surface/bottom loss and enabling continental-scale propagation.',
      tradeoff: 'High transmit power required; low frequency (5-15 kHz) to minimize attenuation loss.',
      params: { f0: 5000, f1: 15000, T: 0.020, fs: 50000, pulseWidth: 0.020, txPower: 'High (+30 dBm)', waveform: 'LFM Chirp' }
    },
    C2: {
      id: 'C2',
      name: 'Shallow Coastal Harbor',
      tagline: 'Multipath Reverberant Waveguide',
      badge: 'Shallow Coastal',
      color: '#00bfa5',
      temp: 22,
      salinity: 32.5,
      depth: 35,
      turbidity: 45,
      rangeKm: '2.2 km',
      snrExpected: '+14 dB',
      definition: 'Warm, shallow littoral water with intense surface/bottom boundary reflections. High turbidity and suspended particulates cause volumetric scattering and severe boundary reverberation.',
      tradeoff: 'Short pulse (5 ms) and high frequency (50-70 kHz) for high range resolution and boundary reverberation gating.',
      params: { f0: 50000, f1: 70000, T: 0.005, fs: 200000, pulseWidth: 0.005, txPower: 'Low (+18 dBm)', waveform: 'High-Res LFM' }
    },
    C3: {
      id: 'C3',
      name: 'Stormy / High-Noise Sea',
      tagline: 'Ambient Noise Rejection & High BT Product',
      badge: 'High Noise / Sea State 6',
      color: '#ffab00',
      temp: 14,
      salinity: 34.5,
      depth: 250,
      turbidity: 20,
      rangeKm: '4.8 km',
      snrExpected: '+18 dB',
      definition: 'High wind speed (>30 kts, Sea State 5-6), surface breaking waves, and elevated ambient shipping noise floor (70-85 dB re 1 µPa²/Hz). Waveform requires maximum processing gain to defeat noise.',
      tradeoff: 'Wideband chirp with high Time-Bandwidth product (BT = 300) delivers +24.7 dB matched filter SNR processing gain.',
      params: { f0: 20000, f1: 45000, T: 0.012, fs: 120000, pulseWidth: 0.012, txPower: 'High (+28 dBm)', waveform: 'Chirp Spread Spectrum' }
    },
    C4: {
      id: 'C4',
      name: 'Severe Thermocline Multipath',
      tagline: 'Acute Downward Refraction & Shadow Zone',
      badge: 'Thermocline Gradient',
      color: '#ff1744',
      temp: 28,
      salinity: 36.0,
      depth: 80,
      turbidity: 65,
      rangeKm: '3.4 km',
      snrExpected: '+16 dB',
      definition: 'Intense solar surface heating creates a steep negative thermocline gradient (dT/dz = -0.15°C/m). Sound rays bend sharply downward, creating extensive shadow zones and multipath delay spread.',
      tradeoff: 'Coded agile LFM with dynamic slope modulation overcomes shadow zone multipath fading and Doppler distortion.',
      params: { f0: 30000, f1: 60000, T: 0.008, fs: 150000, pulseWidth: 0.008, txPower: 'Adaptive (+26 dBm)', waveform: 'Coded Agile LFM' }
    }
  };

  function init() {
    setupSliders();
    setupConditionButtons();
    // Default select C1
    selectCondition('C1', false);
    initRadarAnimation();
  }

  function setupConditionButtons() {
    document.querySelectorAll('.condition-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const condId = btn.dataset.condition;
        if (condId && PRESETS[condId]) {
          selectCondition(condId, true);
        }
      });
    });
  }

  function selectCondition(condId, updateSliders = true) {
    currentCondition = condId;
    const preset = PRESETS[condId] || PRESETS.C1;

    // 1. Update Buttons state
    document.querySelectorAll('.condition-preset-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.condition === condId);
    });

    // 2. If triggered by button, update sliders & envParams
    if (updateSliders) {
      envParams.temp = preset.temp;
      envParams.salinity = preset.salinity;
      envParams.depth = preset.depth;
      envParams.turbidity = preset.turbidity;

      setSlider('mc-temp-slider', 'mc-temp-val', preset.temp, '°C');
      setSlider('mc-sal-slider', 'mc-sal-val', preset.salinity, ' PSU');
      setSlider('mc-depth-slider', 'mc-depth-val', preset.depth, ' m');
      setSlider('mc-turb-slider', 'mc-turb-val', preset.turbidity, ' NTU');
    }

    // 3. Update Definition Box
    renderConditionDefinition(preset);

    // 4. Update all telemetry & waveform plots
    updateAll(preset);
  }

  function setupSliders() {
    const sliders = [
      { id: 'mc-temp-slider', valId: 'mc-temp-val', key: 'temp', unit: '°C' },
      { id: 'mc-sal-slider', valId: 'mc-sal-val', key: 'salinity', unit: ' PSU' },
      { id: 'mc-depth-slider', valId: 'mc-depth-val', key: 'depth', unit: ' m' },
      { id: 'mc-turb-slider', valId: 'mc-turb-val', key: 'turbidity', unit: ' NTU' }
    ];

    sliders.forEach(s => {
      const slider = document.getElementById(s.id);
      const valEl = document.getElementById(s.valId);
      if (!slider) return;

      slider.addEventListener('input', () => {
        const val = parseFloat(slider.value);
        envParams[s.key] = val;
        if (valEl) valEl.textContent = val + s.unit;

        // Auto-detect closest matching condition based on rules
        const autoCond = detectCondition(envParams);
        if (autoCond !== currentCondition) {
          currentCondition = autoCond;
          document.querySelectorAll('.condition-preset-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.condition === autoCond);
          });
        }

        const preset = PRESETS[currentCondition];
        renderConditionDefinition(preset);
        updateAll(preset);
      });
    });
  }

  function detectCondition(env) {
    if (env.depth > 600) return 'C1';
    if (env.turbidity > 50 && env.temp > 24) return 'C4';
    if (env.depth < 60 && env.turbidity > 30) return 'C2';
    if (env.temp < 18 && env.depth >= 150) return 'C3';
    return 'C2';
  }

  function setSlider(sliderId, valId, val, unit) {
    const s = document.getElementById(sliderId);
    const v = document.getElementById(valId);
    if (s) s.value = val;
    if (v) v.textContent = val + unit;
  }

  function renderConditionDefinition(preset) {
    const box = document.getElementById('condition-definition-card');
    if (!box) return;

    box.style.borderColor = preset.color;
    box.innerHTML = `
      <div class="def-header">
        <div style="display:flex;align-items:center;gap:10px">
          <span class="def-badge" style="background:${preset.color}22;color:${preset.color};border:1px solid ${preset.color}66">
            ${preset.id} • ${preset.badge}
          </span>
          <h4 style="margin:0;font-size:16px;color:#fff">${preset.name}</h4>
        </div>
        <div style="font-size:12px;color:var(--text-muted)">
          Expected Range: <strong style="color:#00e5ff">${preset.rangeKm}</strong> | Processing Gain: <strong style="color:#00c853">${preset.snrExpected}</strong>
        </div>
      </div>
      <p style="font-size:13px;color:#b0c4de;line-height:1.5;margin:8px 0 6px 0">${preset.definition}</p>
      <div style="font-size:12px;color:#8899aa;border-left:2px solid ${preset.color};padding-left:8px">
        <strong style="color:${preset.color}">Waveform Adaptation:</strong> ${preset.tradeoff}
      </div>
    `;
  }

  function updateAll(preset = PRESETS[currentCondition]) {
    const p = preset.params;
    const soundSpeed = SonarEngine.calculateMackenzieSoundSpeed(envParams.temp, envParams.salinity, envParams.depth);
    const density = SonarEngine.calculateSeawaterDensity(envParams.temp, envParams.salinity, envParams.depth);
    const impedance = (density * soundSpeed) / 1e6; // MRayl
    const absorption = SonarEngine.calculateAinslieMcColmAbsorption(p.f0 / 1000, envParams.temp, envParams.salinity, envParams.depth).total;

    // Update Telemetry chips & numbers
    setText('mc-stat-speed', `${soundSpeed.toFixed(1)} <span class="unit">m/s</span>`);
    setText('mc-stat-density', `${density.toFixed(1)} <span class="unit">kg/m³</span>`);
    setText('mc-stat-impedance', `${impedance.toFixed(3)} <span class="unit">MRayl</span>`);
    setText('mc-stat-alpha', `${absorption.toFixed(2)} <span class="unit">dB/km</span>`);

    setText('mc-param-carrier', `${(p.f0 / 1000).toFixed(1)} - ${(p.f1 / 1000).toFixed(1)} <span class="unit">kHz</span>`);
    setText('mc-param-bw', `${((p.f1 - p.f0) / 1000).toFixed(1)} <span class="unit">kHz</span>`);
    setText('mc-param-pulse', `${(p.T * 1000).toFixed(1)} <span class="unit">ms</span>`);
    setText('mc-param-fs', `${(p.fs / 1000).toFixed(0)} <span class="unit">kS/s</span>`);
    setText('mc-param-power', p.txPower);
    setText('mc-param-wave', p.waveform);

    // Synthesize and Plot Waveforms
    renderPlots(preset, p);
  }

  function renderPlots(preset, p) {
    try {
      const chirp = SonarEngine.generateLFM(p.f0, p.f1, p.T, p.fs);

      // Downsample for fast Plotly rendering
      const maxPoints = 1200;
      let tDisp = chirp.time;
      let sDisp = chirp.signal;

      if (chirp.N > maxPoints) {
        const step = Math.ceil(chirp.N / maxPoints);
        tDisp = [];
        sDisp = [];
        for (let i = 0; i < chirp.N; i += step) {
          tDisp.push(chirp.time[i]);
          sDisp.push(chirp.signal[i]);
        }
      }

      // TX Waveform
      SonarPlots.plotWaveform('mc-tx-plot', tDisp, sDisp, {
        title: `Adaptive TX LFM Waveform — [${preset.id}] ${preset.name}`,
        color: preset.color,
        xlabel: 'Time (s)',
        ylabel: 'Normalized Amplitude'
      });

      // Frequency Spectrum (FFT)
      const fftResult = SonarEngine.fft(chirp.signal);
      const mag = SonarEngine.magnitudeDB(fftResult);
      const freq = SonarEngine.frequencyAxis(p.fs, fftResult.N);

      SonarPlots.plotFFT('mc-fft-plot', freq, mag, {
        title: `TX Power Spectrum — Bandwidth: ${((p.f1 - p.f0)/1000).toFixed(1)} kHz`,
        color: preset.color,
        xlabel: 'Frequency (Hz)',
        ylabel: 'Magnitude (dB)'
      });
    } catch (e) {
      console.error('Mission control plot error:', e);
    }
  }

  let radarAngle = 0;
  let radarAnimId = null;

  function initRadarAnimation() {
    const canvas = document.getElementById('mc-radar-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Targets in polar coordinates: { angle (deg), dist (0..1), id, speed, type }
    const targets = [
      { angle: 45, dist: 0.65, id: 'TGT-01', type: 'Submersible (SSK)', speed: '8.4 kts' },
      { angle: 160, dist: 0.38, id: 'TGT-02', type: 'Unmanned UUV', speed: '4.2 kts' },
      { angle: 280, dist: 0.82, id: 'TGT-03', type: 'Surface Vessel', speed: '16.0 kts' }
    ];

    function draw() {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const r = Math.min(cx, cy) - 15;

      ctx.clearRect(0, 0, w, h);

      // Radar circles
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.15)';
      ctx.lineWidth = 1;
      for (let i = 1; i <= 4; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, (r / 4) * i, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy);
      ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r);
      ctx.stroke();

      // Sweep Beam (gradual fade cone)
      radarAngle = (radarAngle + 1.2) % 360;
      const rad = (radarAngle * Math.PI) / 180;

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, 'rgba(0, 229, 255, 0.4)');
      grad.addColorStop(1, 'rgba(0, 229, 255, 0.0)');

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, rad - 0.45, rad);
      ctx.closePath();
      ctx.fillStyle = 'rgba(0, 229, 255, 0.12)';
      ctx.fill();

      // Sweep line
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + r * Math.cos(rad), cy + r * Math.sin(rad));
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // Draw targets
      targets.forEach(tgt => {
        const tgtRad = (tgt.angle * Math.PI) / 180;
        const tx = cx + tgt.dist * r * Math.cos(tgtRad);
        const ty = cy + tgt.dist * r * Math.sin(tgtRad);

        // Blip brightness based on proximity to sweep beam
        const diff = Math.abs(((radarAngle - tgt.angle + 180) % 360) - 180);
        const alpha = diff < 30 ? 1.0 : Math.max(0.2, 1.0 - diff / 120);

        ctx.fillStyle = `rgba(255, 23, 68, ${alpha})`;
        ctx.beginPath();
        ctx.arc(tx, ty, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = `rgba(255, 23, 68, ${alpha * 0.7})`;
        ctx.beginPath();
        ctx.arc(tx, ty, 9, 0, Math.PI * 2);
        ctx.stroke();

        // Label
        ctx.fillStyle = `rgba(224, 232, 240, ${alpha})`;
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillText(`${tgt.id}`, tx + 8, ty - 4);
      });

      radarAnimId = requestAnimationFrame(draw);
    }

    if (radarAnimId) cancelAnimationFrame(radarAnimId);
    draw();
  }

  function setText(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  }

  function getCurrentParams() {
    const preset = PRESETS[currentCondition] || PRESETS.C1;
    return {
      condition: currentCondition,
      env: { ...envParams },
      waveform: preset.params,
      soundSpeed: SonarEngine.calculateMackenzieSoundSpeed(envParams.temp, envParams.salinity, envParams.depth)
    };
  }

  return { init, selectCondition, getCurrentParams };
})();
