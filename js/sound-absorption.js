/**
 * SONARIS — Sound Absorption in Sea (Francois & Garrison Equation)
 * Reference: https://gorbatschow.github.io/SonarDocs/sound_absorption_sea_francois.en/
 * Francois, R.E.; Garrison, G.R. (1982) J. Acoust. Soc. Am.
 */

const SoundAbsorption = (() => {
  'use strict';

  // Default ocean parameters
  let params = {
    T: 15.0,     // Temperature (°C)
    S: 35.0,     // Salinity (ppt / PSU)
    D: 500.0,    // Depth (m)
    pH: 8.0,     // pH (potential of hydrogen)
    f: 25.0      // Operating Frequency (kHz)
  };

  function init() {
    setupSliders();
    updateCalculations();
    renderPlots();
    renderMathJax();
  }

  function compute(T, S, D, f, pH) {
    const T_kel = 273.15 + T;

    // Sound speed (m/s)
    const C = 1412 + 3.21 * T + 1.19 * S + 0.0167 * D;

    // 1. Boric Acid Contribution
    const A1 = (8.86 / C) * Math.pow(10, 0.78 * pH - 5);
    const P1 = 1.0;
    const f1 = 2.8 * Math.sqrt(Math.max(0, S / 35)) * Math.pow(10, 4 - 1245 / T_kel); // kHz
    const boric = (A1 * P1 * f1 * (f * f)) / (f * f + f1 * f1);

    // 2. Magnesium Sulfate (MgSO4) Contribution
    const A2 = 21.44 * (S / C) * (1 + 0.025 * T);
    const P2 = 1 - 1.37e-4 * D + 6.2e-9 * (D * D);
    const f2 = (8.17 * Math.pow(10, 8 - 1990 / T_kel)) / (1 + 0.0018 * (S - 35)); // kHz
    const mgso4 = (A2 * P2 * f2 * (f * f)) / (f * f + f2 * f2);

    // 3. Pure Water (H2O) Viscous Contribution
    let A3;
    if (T <= 20) {
      A3 = 4.937e-4 - 2.590e-5 * T + 9.11e-7 * (T * T) - 1.5e-8 * (T * T * T);
    } else {
      A3 = 3.964e-4 - 1.146e-5 * T + 1.45e-7 * (T * T) - 6.5e-10 * (T * T * T);
    }
    const P3 = 1 - 3.83e-5 * D + 4.9e-10 * (D * D);
    const h2o = A3 * P3 * (f * f);

    // Total Absorption alpha (dB/km)
    const totalAlpha = boric + mgso4 + h2o;

    return {
      totalAlpha: Math.max(0, totalAlpha),
      boric: Math.max(0, boric),
      mgso4: Math.max(0, mgso4),
      h2o: Math.max(0, h2o),
      C,
      f1,
      f2,
      A1,
      A2,
      A3,
      P1,
      P2,
      P3
    };
  }

  function setupSliders() {
    const bindSlider = (id, valId, key, suffix, stepDec = 1) => {
      const slider = document.getElementById(id);
      const display = document.getElementById(valId);
      if (slider && display) {
        slider.value = params[key];
        display.textContent = params[key].toFixed(stepDec) + suffix;
        slider.oninput = () => {
          params[key] = parseFloat(slider.value);
          display.textContent = params[key].toFixed(stepDec) + suffix;
          updateCalculations();
          renderPlots();
        };
      }
    };

    bindSlider('fg-temp-slider', 'fg-temp-val', 'T', ' °C', 1);
    bindSlider('fg-sal-slider', 'fg-sal-val', 'S', ' PSU', 1);
    bindSlider('fg-depth-slider', 'fg-depth-val', 'D', ' m', 0);
    bindSlider('fg-ph-slider', 'fg-ph-val', 'pH', '', 2);
    bindSlider('fg-freq-slider', 'fg-freq-val', 'f', ' kHz', 1);
  }

  function setPreset(presetName) {
    if (presetName === 'surface') {
      params = { T: 20.0, S: 35.0, D: 10.0, pH: 8.1, f: 30.0 };
    } else if (presetName === 'deep-ocean') {
      params = { T: 4.0, S: 34.8, D: 2500.0, pH: 7.8, f: 20.0 };
    } else if (presetName === 'polar') {
      params = { T: 1.0, S: 33.5, D: 150.0, pH: 8.0, f: 40.0 };
    } else if (presetName === 'tropical-warm') {
      params = { T: 28.0, S: 36.5, D: 40.0, pH: 8.25, f: 50.0 };
    }

    // Update slider UI
    const updateUi = (id, valId, key, suffix, dec) => {
      const sl = document.getElementById(id);
      const val = document.getElementById(valId);
      if (sl) sl.value = params[key];
      if (val) val.textContent = params[key].toFixed(dec) + suffix;
    };
    updateUi('fg-temp-slider', 'fg-temp-val', 'T', ' °C', 1);
    updateUi('fg-sal-slider', 'fg-sal-val', 'S', ' PSU', 1);
    updateUi('fg-depth-slider', 'fg-depth-val', 'D', ' m', 0);
    updateUi('fg-ph-slider', 'fg-ph-val', 'pH', '', 2);
    updateUi('fg-freq-slider', 'fg-freq-val', 'f', ' kHz', 1);

    document.querySelectorAll('.fg-preset-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.preset === presetName);
    });

    updateCalculations();
    renderPlots();
    showToast(`Loaded ${presetName} oceanographic profile`, 'info');
  }

  function updateCalculations() {
    const res = compute(params.T, params.S, params.D, params.f, params.pH);

    // Update Telemetry HUD
    const setText = (id, txt) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = txt;
    };

    setText('fg-stat-total', `${res.totalAlpha < 0.01 ? res.totalAlpha.toExponential(2) : res.totalAlpha.toFixed(3)} <span class="unit">dB/km</span>`);
    setText('fg-stat-boric', `${res.boric < 0.01 ? res.boric.toExponential(2) : res.boric.toFixed(4)} <span class="unit">dB/km</span>`);
    setText('fg-stat-mgso4', `${res.mgso4 < 0.01 ? res.mgso4.toExponential(2) : res.mgso4.toFixed(4)} <span class="unit">dB/km</span>`);
    setText('fg-stat-h2o', `${res.h2o < 0.01 ? res.h2o.toExponential(2) : res.h2o.toFixed(4)} <span class="unit">dB/km</span>`);
    setText('fg-stat-c', `${res.C.toFixed(1)} <span class="unit">m/s</span>`);
    setText('fg-stat-f1', `${res.f1.toFixed(2)} <span class="unit">kHz</span>`);
    setText('fg-stat-f2', `${res.f2.toFixed(1)} <span class="unit">kHz</span>`);

    // Percent shares
    const total = res.totalAlpha || 1e-9;
    const pBoric = ((res.boric / total) * 100).toFixed(1);
    const pMgso4 = ((res.mgso4 / total) * 100).toFixed(1);
    const pH2o = ((res.h2o / total) * 100).toFixed(1);

    setText('fg-share-boric', `${pBoric}%`);
    setText('fg-share-mgso4', `${pMgso4}%`);
    setText('fg-share-h2o', `${pH2o}%`);

    const barBoric = document.getElementById('fg-bar-boric');
    const barMgso4 = document.getElementById('fg-bar-mgso4');
    const barH2o = document.getElementById('fg-bar-h2o');
    if (barBoric) barBoric.style.width = `${pBoric}%`;
    if (barMgso4) barMgso4.style.width = `${pMgso4}%`;
    if (barH2o) barH2o.style.width = `${pH2o}%`;
  }

  function renderPlots() {
    // 1. Spectral Breakdown Plot (Log-Log: 0.01 kHz to 500 kHz)
    const numPoints = 120;
    const fMin = 0.02; // 20 Hz in kHz
    const fMax = 500;  // 500 kHz
    const logMin = Math.log10(fMin);
    const logMax = Math.log10(fMax);
    const logStep = (logMax - logMin) / (numPoints - 1);

    const freqArr = [];
    const totalArr = [];
    const boricArr = [];
    const mgso4Arr = [];
    const h2oArr = [];

    for (let i = 0; i < numPoints; i++) {
      const f = Math.pow(10, logMin + i * logStep);
      freqArr.push(f);
      const res = compute(params.T, params.S, params.D, f, params.pH);
      totalArr.push(res.totalAlpha);
      boricArr.push(res.boric);
      mgso4Arr.push(res.mgso4);
      h2oArr.push(res.h2o);
    }

    const currentRes = compute(params.T, params.S, params.D, params.f, params.pH);

    const traceTotal = {
      x: freqArr,
      y: totalArr,
      name: 'Total Absorption α',
      type: 'scatter',
      mode: 'lines',
      line: { color: '#00e5ff', width: 3 }
    };

    const traceBoric = {
      x: freqArr,
      y: boricArr,
      name: 'Boric Acid (f₁ relaxation)',
      type: 'scatter',
      mode: 'lines',
      line: { color: '#b388ff', width: 2, dash: 'dash' }
    };

    const traceMgso4 = {
      x: freqArr,
      y: mgso4Arr,
      name: 'MgSO₄ (f₂ relaxation)',
      type: 'scatter',
      mode: 'lines',
      line: { color: '#ffab00', width: 2, dash: 'dot' }
    };

    const traceH2O = {
      x: freqArr,
      y: h2oArr,
      name: 'Pure H₂O Viscosity',
      type: 'scatter',
      mode: 'lines',
      line: { color: '#00c853', width: 2, dash: 'dashdot' }
    };

    // Operating point marker
    const tracePoint = {
      x: [params.f],
      y: [currentRes.totalAlpha],
      name: `Operating f = ${params.f} kHz`,
      type: 'scatter',
      mode: 'markers',
      marker: { color: '#ff1744', size: 10, symbol: 'circle' }
    };

    const layoutSpectrum = {
      title: false,
      xaxis: {
        title: { text: 'Frequency (kHz)', font: { color: '#8899aa', size: 11 } },
        type: 'log',
        tickfont: { color: '#8899aa', size: 10 },
        gridcolor: 'rgba(0, 229, 255, 0.08)'
      },
      yaxis: {
        title: { text: 'Absorption α (dB/km)', font: { color: '#8899aa', size: 11 } },
        type: 'log',
        tickfont: { color: '#8899aa', size: 10 },
        gridcolor: 'rgba(0, 229, 255, 0.08)'
      },
      legend: {
        font: { color: '#e0e8f0', size: 10 },
        bgcolor: 'rgba(10, 16, 28, 0.8)',
        bordercolor: 'rgba(0, 229, 255, 0.15)',
        borderwidth: 1,
        x: 0.02,
        y: 0.98
      },
      margin: { l: 60, r: 20, t: 20, b: 50 },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      hovermode: 'x unified'
    };

    Plotly.newPlot('fg-spectrum-plot', [traceTotal, traceBoric, traceMgso4, traceH2O, tracePoint], layoutSpectrum, {
      responsive: true,
      displayModeBar: false
    });

    // 2. Depth Profile Plot: Absorption α vs Depth (0 to 5000 m) at current frequency
    const depthArr = [];
    const alphaDepthArr = [];
    const cDepthArr = [];
    for (let d = 0; d <= 5000; d += 100) {
      depthArr.push(d);
      const r = compute(params.T, params.S, d, params.f, params.pH);
      alphaDepthArr.push(r.totalAlpha);
      cDepthArr.push(r.C);
    }

    const traceDepthAlpha = {
      x: alphaDepthArr,
      y: depthArr,
      name: `Absorption α @ ${params.f} kHz`,
      type: 'scatter',
      mode: 'lines',
      line: { color: '#00e5ff', width: 2.5 }
    };

    const layoutDepth = {
      title: false,
      xaxis: {
        title: { text: 'Absorption α (dB/km)', font: { color: '#8899aa', size: 11 } },
        tickfont: { color: '#8899aa', size: 10 },
        gridcolor: 'rgba(0, 229, 255, 0.08)'
      },
      yaxis: {
        title: { text: 'Depth (m)', font: { color: '#8899aa', size: 11 } },
        autorange: 'reversed', // Surface at top
        tickfont: { color: '#8899aa', size: 10 },
        gridcolor: 'rgba(0, 229, 255, 0.08)'
      },
      margin: { l: 60, r: 20, t: 20, b: 50 },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent'
    };

    Plotly.newPlot('fg-depth-plot', [traceDepthAlpha], layoutDepth, {
      responsive: true,
      displayModeBar: false
    });
  }

  function renderMathJax() {
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise();
    }
  }

  function copyMatlabCode() {
    const code = `function [alpha, Boric, MgSO4, H2O, C] = sound_absorption_sea_francois(T, S, D, f, pH)
% Francois & Garrison (1982) sound absorption in seawater
% Inputs:
%   T:  temperature (deg C)
%   S:  salinity (ppt/PSU)
%   D:  depth (m)
%   f:  frequency (kHz)
%   pH: potential of hydrogen
% Output:
%   alpha: absorption of sound in seawater (dB/km)

T_kel = 273 + T;

% Sound speed
C = 1412 + 3.21*T + 1.19*S + 0.0167*D;

% Boric acid contribution
A1 = (8.86./C).*10.^(0.78.*pH - 5);
P1 = 1;
f1 = 2.8 * sqrt(S./35).*10.^(4 - 1245./T_kel);
Boric = (A1.*P1.*f1.*(f.^2))./((f.^2) + (f1.^2));

% Magnesium sulfate (MgSO4) contribution
A2 = 21.44*(S./C).*(1 + 0.025*T);
P2 = 1 - (1.37e-4)*D + (6.2e-9)*(D.^2);
f2 = (8.17*(10.^(8 - 1990./T_kel)))./(1 + 0.0018*(S - 35));
MgSO4 = (A2.*P2.*f2.*(f.^2))./((f.^2) + (f2.^2));

% Pure water (H2O) contribution
if T <= 20
    A3 = (4.937e-4) - (2.590e-5)*T + (9.11e-7)*(T.^2) - (1.5e-8)*(T.^3);
else
    A3 = (3.964e-4) - (1.146e-5)*T + (1.45e-7)*(T.^2) - (6.5e-10)*(T.^3);
end
P3 = 1 - (3.83e-5)*D + (4.9e-10)*(D.^2);
H2O = A3.*P3.*(f.^2);

% Total absorption in dB/km
alpha = Boric + MgSO4 + H2O;
end`;

    navigator.clipboard.writeText(code).then(() => {
      showToast('Copied MATLAB code to clipboard!', 'success');
    }).catch(() => {
      showToast('Failed to copy code to clipboard', 'error');
    });
  }

  return { init, setPreset, copyMatlabCode, compute };
})();
