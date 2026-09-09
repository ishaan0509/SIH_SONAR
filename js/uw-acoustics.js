/**
 * SONARIS — Underwater Acoustics & Sound Propagation Module
 * Physics, formulas, and interactive plots based on Dr. A.R. Collins (arc.id.au/UWAcoustics.html)
 */

const UWAcoustics = (() => {
  'use strict';

  let currentProfile = 'eastern-pacific';
  let customParams = {
    surfaceTemp: 17,
    mixedLayerDepth: 75,
    deepTemp: 3.5,
    salinity: 35,
    sourceDepth: 50,
    frequency_kHz: 30,
    seaState: 3,
    shippingDensity: 0.5
  };

  function init() {
    setupProfileButtons();
    setupSliders();
    renderAll();
  }

  function setupProfileButtons() {
    document.querySelectorAll('.profile-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.profile-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentProfile = btn.dataset.profile;
        loadProfilePreset(currentProfile);
      });
    });
  }

  function loadProfilePreset(profile) {
    if (profile === 'eastern-pacific') {
      // Fig 1: Mixed layer 75m @ 17°C, then drops to 3.5°C at 1000m
      customParams.surfaceTemp = 17;
      customParams.mixedLayerDepth = 75;
      customParams.deepTemp = 3.5;
      customParams.salinity = 35;
      customParams.sourceDepth = 50;
    } else if (profile === 'polar-cold') {
      // Fig 2: High latitude: cold surface (1.5°C), no mixed layer, continuous gradient
      customParams.surfaceTemp = 1.5;
      customParams.mixedLayerDepth = 0;
      customParams.deepTemp = 0.5;
      customParams.salinity = 34.2;
      customParams.sourceDepth = 25;
    } else if (profile === 'tropical-sofar') {
      // Warm surface (26°C), mixed layer 50m, steep thermocline, SOFAR axis @ 850m
      customParams.surfaceTemp = 26;
      customParams.mixedLayerDepth = 50;
      customParams.deepTemp = 2.8;
      customParams.salinity = 35.5;
      customParams.sourceDepth = 850;
    }

    syncSliders();
    renderAll();
  }

  function setupSliders() {
    const sliderMap = [
      { id: 'uw-temp-slider', key: 'surfaceTemp', valId: 'uw-temp-val', unit: '°C' },
      { id: 'uw-mix-slider', key: 'mixedLayerDepth', valId: 'uw-mix-val', unit: ' m' },
      { id: 'uw-sal-slider', key: 'salinity', valId: 'uw-sal-val', unit: ' PSU' },
      { id: 'uw-src-depth-slider', key: 'sourceDepth', valId: 'uw-src-depth-val', unit: ' m' },
      { id: 'uw-freq-slider', key: 'frequency_kHz', valId: 'uw-freq-val', unit: ' kHz' },
      { id: 'uw-wind-slider', key: 'seaState', valId: 'uw-wind-val', unit: ' SS' }
    ];

    sliderMap.forEach(s => {
      const el = document.getElementById(s.id);
      const valEl = document.getElementById(s.valId);
      if (!el) return;

      el.addEventListener('input', () => {
        customParams[s.key] = parseFloat(el.value);
        if (valEl) valEl.textContent = el.value + s.unit;
        renderAll();
      });
    });
  }

  function syncSliders() {
    setSliderVal('uw-temp-slider', 'uw-temp-val', customParams.surfaceTemp, '°C');
    setSliderVal('uw-mix-slider', 'uw-mix-val', customParams.mixedLayerDepth, ' m');
    setSliderVal('uw-sal-slider', 'uw-sal-val', customParams.salinity, ' PSU');
    setSliderVal('uw-src-depth-slider', 'uw-src-depth-val', customParams.sourceDepth, ' m');
    setSliderVal('uw-freq-slider', 'uw-freq-val', customParams.frequency_kHz, ' kHz');
    setSliderVal('uw-wind-slider', 'uw-wind-val', customParams.seaState, ' SS');
  }

  function setSliderVal(sliderId, valId, val, unit) {
    const s = document.getElementById(sliderId);
    const v = document.getElementById(valId);
    if (s) s.value = val;
    if (v) v.textContent = val + unit;
  }

  function generateBathyProfile() {
    const depths = [];
    const temps = [];
    const soundSpeedsMedwin = [];
    const soundSpeedsMackenzie = [];

    const maxDepth = 1200;
    const step = 20;

    for (let d = 0; d <= maxDepth; d += step) {
      depths.push(d);

      let t = customParams.deepTemp;
      if (d <= customParams.mixedLayerDepth) {
        // Isothermal mixed surface layer
        t = customParams.surfaceTemp;
      } else if (d < 650) {
        // Thermocline region (temperature drops)
        const frac = (d - customParams.mixedLayerDepth) / (650 - customParams.mixedLayerDepth);
        t = customParams.surfaceTemp - frac * (customParams.surfaceTemp - customParams.deepTemp);
      } else {
        // Deep isothermal layer with steady pressure gradient
        t = customParams.deepTemp - 0.0003 * (d - 650);
      }
      temps.push(t);

      const cMed = SonarEngine.calculateMedwinSoundSpeed(t, customParams.salinity, d);
      const cMack = SonarEngine.calculateMackenzieSoundSpeed(t, customParams.salinity, d);
      soundSpeedsMedwin.push(cMed);
      soundSpeedsMackenzie.push(cMack);
    }

    return { depths, temps, soundSpeedsMedwin, soundSpeedsMackenzie };
  }

  function renderAll() {
    const profile = generateBathyProfile();

    // 1. Update Live Stats HUD
    updateStatsHUD(profile);

    // 2. Plot Temperature Bathy & Sound Speed Profile
    plotBathyAndSVP(profile);

    // 3. Plot Ray Tracing
    plotRayTracing(profile);

    // 4. Plot Absorption vs Frequency
    plotAbsorption();

    // 5. Plot Transmission Loss
    plotTransmissionLoss();

    // 6. Plot Ambient Noise (Wenz Curves)
    plotAmbientNoise();
  }

  function updateStatsHUD(profile) {
    const surfC = profile.soundSpeedsMackenzie[0];
    const minC = Math.min(...profile.soundSpeedsMackenzie);
    const minIdx = profile.soundSpeedsMackenzie.indexOf(minC);
    const sofarDepth = profile.depths[minIdx];

    const density = SonarEngine.calculateSeawaterDensity(customParams.surfaceTemp, customParams.salinity, 0);
    const impedance = SonarEngine.calculateAcousticImpedance(customParams.surfaceTemp, customParams.salinity, 0);
    const alpha = SonarEngine.calculateAinslieMcColmAbsorption(customParams.frequency_kHz, customParams.surfaceTemp, customParams.salinity, 50).total;

    setText('uw-stat-surf-c', `${surfC.toFixed(1)} <span class="unit">m/s</span>`);
    setText('uw-stat-min-c', `${minC.toFixed(1)} <span class="unit">m/s</span>`);
    setText('uw-stat-sofar-depth', `${sofarDepth} <span class="unit">m</span>`);
    setText('uw-stat-density', `${density.toFixed(1)} <span class="unit">kg/m³</span>`);
    setText('uw-stat-impedance', `${(impedance.z / 1e6).toFixed(3)} <span class="unit">MRayl</span>`);
    setText('uw-stat-alpha', `${alpha.toFixed(2)} <span class="unit">dB/km</span>`);
  }

  function plotBathyAndSVP(profile) {
    // Left: Temperature Bathythermograph
    const elTemp = document.getElementById('uw-bathy-plot');
    if (elTemp) {
      const traceTemp = {
        x: profile.temps,
        y: profile.depths,
        type: 'scatter',
        mode: 'lines',
        name: 'Water Temp (°C)',
        line: { color: '#ff1744', width: 2.5 },
        hovertemplate: 'Depth=%{y}m<br>Temp=%{x:.1f}°C<extra></extra>'
      };

      const layoutTemp = {
        ...SonarPlots.DARK_THEME,
        title: { text: '<span style="color:#e0e8f0">Bathythermograph (Temperature vs Depth)</span>', x: 0.02 },
        yaxis: {
          ...SonarPlots.DARK_THEME.yaxis,
          title: 'Depth (m)',
          autorange: 'reversed'
        },
        xaxis: {
          ...SonarPlots.DARK_THEME.xaxis,
          title: 'Temperature (°C)',
          range: [0, 32]
        },
        margin: { l: 55, r: 20, t: 50, b: 45 }
      };

      Plotly.newPlot(elTemp, [traceTemp], layoutTemp, SonarPlots.PLOT_CONFIG);
    }

    // Right: Sound Velocity Profile (SVP)
    const elSVP = document.getElementById('uw-svp-plot');
    if (elSVP) {
      const traceMackenzie = {
        x: profile.soundSpeedsMackenzie,
        y: profile.depths,
        type: 'scatter',
        mode: 'lines',
        name: 'Mackenzie 9-Term (1981)',
        line: { color: '#00e5ff', width: 2.5 },
        hovertemplate: 'Depth=%{y}m<br>c=%{x:.1f} m/s (Mackenzie)<extra></extra>'
      };

      const traceMedwin = {
        x: profile.soundSpeedsMedwin,
        y: profile.depths,
        type: 'scatter',
        mode: 'lines',
        name: 'Medwin Eq. 1 (arc.id.au)',
        line: { color: '#00bfa5', width: 1.5, dash: 'dot' },
        hovertemplate: 'Depth=%{y}m<br>c=%{x:.1f} m/s (Medwin)<extra></extra>'
      };

      const layoutSVP = {
        ...SonarPlots.DARK_THEME,
        title: { text: '<span style="color:#e0e8f0">Sound Velocity Profile (SVP)</span>', x: 0.02 },
        yaxis: {
          ...SonarPlots.DARK_THEME.yaxis,
          title: 'Depth (m)',
          autorange: 'reversed'
        },
        xaxis: {
          ...SonarPlots.DARK_THEME.xaxis,
          title: 'Sound Speed C (m/s)',
          autorange: true
        },
        legend: {
          font: { size: 10, color: '#8899aa' },
          bgcolor: 'rgba(17,27,46,0.85)',
          bordercolor: 'rgba(0,229,255,0.15)',
          x: 0.55,
          y: 0.05
        },
        margin: { l: 55, r: 20, t: 50, b: 45 }
      };

      Plotly.newPlot(elSVP, [traceMackenzie, traceMedwin], layoutSVP, SonarPlots.PLOT_CONFIG);
    }
  }

  function plotRayTracing(profile) {
    const el = document.getElementById('uw-ray-plot');
    if (!el) return;

    // Launch angles from -14° to +14°
    const angles = [-14, -10, -7, -4, -1.5, 0, 1.5, 4, 7, 10, 14];
    const rays = SonarEngine.traceRays(
      customParams.sourceDepth,
      angles,
      profile.depths,
      profile.soundSpeedsMackenzie,
      8000, // 8 km range
      25
    );

    const traces = rays.map(ray => {
      const isUp = ray.angle < 0;
      const col = isUp ? 'rgba(0, 229, 255, 0.75)' : 'rgba(0, 200, 83, 0.75)';
      return {
        x: ray.x.map(x => x / 1000), // convert to km
        y: ray.z,
        type: 'scatter',
        mode: 'lines',
        line: { color: col, width: 1.2 },
        hoverinfo: 'none',
        showlegend: false
      };
    });

    // Add source marker
    traces.push({
      x: [0],
      y: [customParams.sourceDepth],
      type: 'scatter',
      mode: 'markers',
      marker: { color: '#ffab00', size: 12, symbol: 'star' },
      name: `Source (${customParams.sourceDepth}m)`,
      showlegend: true
    });

    const layout = {
      ...SonarPlots.DARK_THEME,
      title: { text: `<span style="color:#e0e8f0">Snell's Law Acoustic Ray Tracing — Refraction & Shadow Zones</span> <span style="font-size:11px;color:#8899aa">(Source: ${customParams.sourceDepth}m)</span>`, x: 0.02 },
      xaxis: {
        ...SonarPlots.DARK_THEME.xaxis,
        title: 'Propagation Range (km)',
        range: [0, 8]
      },
      yaxis: {
        ...SonarPlots.DARK_THEME.yaxis,
        title: 'Depth (m)',
        autorange: 'reversed',
        range: [1200, 0]
      },
      annotations: [
        {
          x: 4.2,
          y: Math.min(650, customParams.sourceDepth + 200),
          text: 'Shadow Zone (Acoustic Blind Spot)',
          showarrow: true,
          arrowhead: 2,
          arrowcolor: '#ff1744',
          font: { color: '#ff1744', size: 11, family: "'JetBrains Mono'" },
          bgcolor: 'rgba(17,27,46,0.9)',
          bordercolor: '#ff1744'
        }
      ],
      legend: {
        font: { size: 10, color: '#8899aa' },
        bgcolor: 'rgba(17,27,46,0.85)',
        x: 0.82,
        y: 0.95
      },
      margin: { l: 55, r: 20, t: 50, b: 45 }
    };

    Plotly.newPlot(el, traces, layout, SonarPlots.PLOT_CONFIG);
  }

  function plotAbsorption() {
    const el = document.getElementById('uw-absorption-plot');
    if (!el) return;

    const freqs_kHz = [];
    const totalAlpha = [];
    const boricAlpha = [];
    const mgso4Alpha = [];
    const waterAlpha = [];

    // Frequency from 1 kHz to 120 kHz
    for (let f = 1; f <= 120; f += 2) {
      freqs_kHz.push(f);
      const res = SonarEngine.calculateAinslieMcColmAbsorption(
        f,
        customParams.surfaceTemp,
        customParams.salinity,
        50,
        8.0
      );
      totalAlpha.push(res.total);
      boricAlpha.push(res.boric);
      mgso4Alpha.push(res.mgso4);
      waterAlpha.push(res.water);
    }

    const traces = [
      {
        x: freqs_kHz,
        y: totalAlpha,
        type: 'scatter',
        mode: 'lines',
        name: 'Total Absorption α',
        line: { color: '#00e5ff', width: 2.5 }
      },
      {
        x: freqs_kHz,
        y: boricAlpha,
        type: 'scatter',
        mode: 'lines',
        name: 'Boric Acid (f₁ ≈ 1 kHz)',
        line: { color: '#ffab00', width: 1.5, dash: 'dash' }
      },
      {
        x: freqs_kHz,
        y: mgso4Alpha,
        type: 'scatter',
        mode: 'lines',
        name: 'MgSO₄ (f₂ ≈ 80-100 kHz)',
        line: { color: '#00c853', width: 1.5, dash: 'dash' }
      },
      {
        x: freqs_kHz,
        y: waterAlpha,
        type: 'scatter',
        mode: 'lines',
        name: 'Pure Water Viscosity (f²)',
        line: { color: '#aa00ff', width: 1.5, dash: 'dot' }
      }
    ];

    const layout = {
      ...SonarPlots.DARK_THEME,
      title: { text: '<span style="color:#e0e8f0">Seawater Attenuation α(f) [dB/km]</span>', x: 0.02 },
      xaxis: {
        ...SonarPlots.DARK_THEME.xaxis,
        title: 'Frequency (kHz)'
      },
      yaxis: {
        ...SonarPlots.DARK_THEME.yaxis,
        title: 'Absorption α (dB/km)'
      },
      legend: {
        font: { size: 9, color: '#8899aa' },
        bgcolor: 'rgba(17,27,46,0.85)',
        x: 0.02,
        y: 0.98
      },
      margin: { l: 50, r: 15, t: 45, b: 40 }
    };

    Plotly.newPlot(el, traces, layout, SonarPlots.PLOT_CONFIG);
  }

  function plotTransmissionLoss() {
    const el = document.getElementById('uw-tl-plot');
    if (!el) return;

    const ranges_km = [];
    const tlSpherical = [];
    const tlCylindrical = [];
    const tlHighFreq = [];

    for (let r = 0.1; r <= 15; r += 0.25) {
      const r_m = r * 1000;
      ranges_km.push(r);

      // Spherical at current freq
      const sLoss = SonarEngine.calculateTransmissionLoss(
        r_m,
        customParams.frequency_kHz,
        'spherical',
        100,
        customParams.surfaceTemp,
        customParams.salinity
      ).tl;
      tlSpherical.push(sLoss);

      // Cylindrical (shallow waveguide H=80m)
      const cLoss = SonarEngine.calculateTransmissionLoss(
        r_m,
        customParams.frequency_kHz,
        'cylindrical',
        80,
        customParams.surfaceTemp,
        customParams.salinity
      ).tl;
      tlCylindrical.push(cLoss);

      // High freq (80 kHz) spherical for comparison
      const hLoss = SonarEngine.calculateTransmissionLoss(
        r_m,
        80,
        'spherical',
        100,
        customParams.surfaceTemp,
        customParams.salinity
      ).tl;
      tlHighFreq.push(hLoss);
    }

    const traces = [
      {
        x: ranges_km,
        y: tlSpherical,
        type: 'scatter',
        mode: 'lines',
        name: `Spherical (${customParams.frequency_kHz} kHz, Deep)`,
        line: { color: '#00e5ff', width: 2 }
      },
      {
        x: ranges_km,
        y: tlCylindrical,
        type: 'scatter',
        mode: 'lines',
        name: `Cylindrical (${customParams.frequency_kHz} kHz, Shallow H=80m)`,
        line: { color: '#00c853', width: 2 }
      },
      {
        x: ranges_km,
        y: tlHighFreq,
        type: 'scatter',
        mode: 'lines',
        name: 'High Freq Absorption (80 kHz)',
        line: { color: '#ff1744', width: 1.5, dash: 'dash' }
      }
    ];

    const layout = {
      ...SonarPlots.DARK_THEME,
      title: { text: '<span style="color:#e0e8f0">Transmission Loss (TL) vs Range</span>', x: 0.02 },
      xaxis: {
        ...SonarPlots.DARK_THEME.xaxis,
        title: 'Range (km)'
      },
      yaxis: {
        ...SonarPlots.DARK_THEME.yaxis,
        title: 'Loss TL (dB)',
        autorange: 'reversed'
      },
      legend: {
        font: { size: 9, color: '#8899aa' },
        bgcolor: 'rgba(17,27,46,0.85)',
        x: 0.02,
        y: 0.05
      },
      margin: { l: 50, r: 15, t: 45, b: 40 }
    };

    Plotly.newPlot(el, traces, layout, SonarPlots.PLOT_CONFIG);
  }

  function plotAmbientNoise() {
    const el = document.getElementById('uw-noise-plot');
    if (!el) return;

    const freqs_kHz = [];
    const nlTotal = [];
    const nlTurb = [];
    const nlShip = [];
    const nlWind = [];
    const nlTherm = [];

    const windKts = customParams.seaState * 6 + 5;

    for (let f = 0.01; f <= 100; f *= 1.3) {
      freqs_kHz.push(f);
      const res = SonarEngine.calculateWenzNoise(f, customParams.shippingDensity, windKts);
      nlTotal.push(res.total);
      nlTurb.push(res.turbulence);
      nlShip.push(res.shipping);
      nlWind.push(res.wind);
      nlTherm.push(res.thermal);
    }

    const traces = [
      {
        x: freqs_kHz,
        y: nlTotal,
        type: 'scatter',
        mode: 'lines',
        name: `Total Ambient Noise (SS ${customParams.seaState})`,
        line: { color: '#ffab00', width: 2.5 }
      },
      {
        x: freqs_kHz,
        y: nlTurb,
        type: 'scatter',
        mode: 'lines',
        name: 'Turbulence (<10 Hz)',
        line: { color: '#aa00ff', width: 1.2, dash: 'dot' }
      },
      {
        x: freqs_kHz,
        y: nlShip,
        type: 'scatter',
        mode: 'lines',
        name: 'Shipping Traffic (10-1000 Hz)',
        line: { color: '#2979ff', width: 1.2, dash: 'dash' }
      },
      {
        x: freqs_kHz,
        y: nlWind,
        type: 'scatter',
        mode: 'lines',
        name: 'Wind / Waves (1-50 kHz)',
        line: { color: '#00e5ff', width: 1.2, dash: 'dash' }
      },
      {
        x: freqs_kHz,
        y: nlTherm,
        type: 'scatter',
        mode: 'lines',
        name: 'Thermal Noise (>50 kHz)',
        line: { color: '#78909c', width: 1.2, dash: 'dot' }
      }
    ];

    const layout = {
      ...SonarPlots.DARK_THEME,
      title: { text: `<span style="color:#e0e8f0">Ocean Ambient Noise (Wenz Model)</span>`, x: 0.02 },
      xaxis: {
        ...SonarPlots.DARK_THEME.xaxis,
        title: 'Frequency (kHz)',
        type: 'log'
      },
      yaxis: {
        ...SonarPlots.DARK_THEME.yaxis,
        title: 'Noise Level NL (dB re 1 µPa²/Hz)',
        range: [20, 110]
      },
      legend: {
        font: { size: 9, color: '#8899aa' },
        bgcolor: 'rgba(17,27,46,0.85)',
        x: 0.55,
        y: 0.98
      },
      margin: { l: 50, r: 15, t: 45, b: 40 }
    };

    Plotly.newPlot(el, traces, layout, SonarPlots.PLOT_CONFIG);
  }

  function setText(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  }

  return { init, loadProfilePreset };
})();
