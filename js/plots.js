/**
 * SONARIS — Plotly.js Visualization Layer
 * Dark sonar-themed wrappers for all scientific plots.
 */

const SonarPlots = (() => {
  'use strict';

  /* ============================================================
     THEME CONFIG
     ============================================================ */
  const DARK_THEME = {
    plot_bgcolor: '#0a0e1a',
    paper_bgcolor: '#0d1525',
    font: {
      family: "'JetBrains Mono', monospace",
      size: 11,
      color: '#8899aa'
    },
    xaxis: {
      gridcolor: 'rgba(0, 229, 255, 0.06)',
      linecolor: 'rgba(0, 229, 255, 0.15)',
      zerolinecolor: 'rgba(0, 229, 255, 0.1)',
      tickfont: { size: 10, color: '#8899aa' },
      titlefont: { size: 12, color: '#e0e8f0' }
    },
    yaxis: {
      gridcolor: 'rgba(0, 229, 255, 0.06)',
      linecolor: 'rgba(0, 229, 255, 0.15)',
      zerolinecolor: 'rgba(0, 229, 255, 0.1)',
      tickfont: { size: 10, color: '#8899aa' },
      titlefont: { size: 12, color: '#e0e8f0' }
    },
    margin: { l: 60, r: 30, t: 50, b: 50 },
    colorway: ['#00e5ff', '#00bfa5', '#00c853', '#ffab00', '#ff1744', '#aa00ff', '#2979ff'],
    hoverlabel: {
      bgcolor: '#111b2e',
      bordercolor: '#00e5ff',
      font: { family: "'JetBrains Mono', monospace", size: 11, color: '#e0e8f0' }
    }
  };

  const PLOT_CONFIG = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    toImageButtonOptions: {
      format: 'png',
      filename: 'sonaris_plot',
      height: 600,
      width: 1000,
      scale: 2
    }
  };

  const SOURCE_LABELS = {
    fpga: '[FPGA]',
    matlab: '[MATLAB]',
    simulation: '[SIMULATION]',
    csv: '[CSV]',
    live: '[LIVE]'
  };

  function makeTitle(title, source = 'simulation') {
    const label = SOURCE_LABELS[source] || '';
    return `<span style="color:#e0e8f0">${title}</span> <span style="color:#556677;font-size:10px">${label}</span>`;
  }

  function makeLayout(overrides = {}) {
    return {
      ...DARK_THEME,
      ...overrides,
      xaxis: { ...DARK_THEME.xaxis, ...(overrides.xaxis || {}) },
      yaxis: { ...DARK_THEME.yaxis, ...(overrides.yaxis || {}) }
    };
  }

  /* ============================================================
     WAVEFORM PLOT (Time Domain)
     ============================================================ */
  function plotWaveform(divId, t, y, opts = {}) {
    const {
      title = 'Waveform',
      source = 'simulation',
      xlabel = 'Time (s)',
      ylabel = 'Amplitude',
      color = '#00e5ff',
      lineWidth = 1.5,
      showMarkers = false
    } = opts;

    const el = typeof divId === 'string' ? document.getElementById(divId) : divId;
    if (!el) return;

    const trace = {
      x: Array.from(t),
      y: Array.from(y),
      type: 'scatter',
      mode: showMarkers ? 'lines+markers' : 'lines',
      line: { color, width: lineWidth, shape: 'spline' },
      hovertemplate: 't=%{x:.6f}s<br>A=%{y:.4f}<extra></extra>'
    };
    if (showMarkers) {
      trace.marker = { size: 3, color };
    }

    const layout = makeLayout({
      title: { text: makeTitle(title, source), x: 0.02 },
      xaxis: { ...DARK_THEME.xaxis, title: xlabel },
      yaxis: { ...DARK_THEME.yaxis, title: ylabel }
    });

    Plotly.newPlot(el, [trace], layout, PLOT_CONFIG);
  }

  /* ============================================================
     FFT PLOT (Frequency Domain)
     ============================================================ */
  function plotFFT(divId, f, mag, opts = {}) {
    const el = typeof divId === 'string' ? document.getElementById(divId) : divId;
    if (!el) return;

    const {
      title = 'Frequency Spectrum',
      source = 'simulation',
      xlabel = 'Frequency (Hz)',
      ylabel = 'Magnitude (dB)',
      color = '#00bfa5',
      showHalf = true
    } = opts;

    const halfN = showHalf ? Math.floor(f.length / 2) : f.length;
    const fSlice = Array.from(f).slice(0, halfN);
    const mSlice = Array.from(mag).slice(0, halfN);

    const trace = {
      x: fSlice,
      y: mSlice,
      type: 'scatter',
      mode: 'lines',
      line: { color, width: 1.5 },
      fill: 'tozeroy',
      fillcolor: color.replace(')', ', 0.08)').replace('rgb', 'rgba').replace('#', ''),
      hovertemplate: 'f=%{x:.1f}Hz<br>Mag=%{y:.2f}dB<extra></extra>'
    };

    // Fix fillcolor for hex colors
    const fillcolor = `rgba(${parseInt(color.slice(1,3),16)}, ${parseInt(color.slice(3,5),16)}, ${parseInt(color.slice(5,7),16)}, 0.08)`;
    trace.fillcolor = fillcolor;

    const layout = makeLayout({
      title: { text: makeTitle(title, source), x: 0.02 },
      xaxis: { ...DARK_THEME.xaxis, title: xlabel },
      yaxis: { ...DARK_THEME.yaxis, title: ylabel }
    });

    Plotly.newPlot(el, [trace], layout, PLOT_CONFIG);
  }

  /* ============================================================
     SPECTROGRAM (Heatmap)
     ============================================================ */
  function plotSpectrogram(divId, spectData, opts = {}) {
    const el = typeof divId === 'string' ? document.getElementById(divId) : divId;
    if (!el) return;

    const {
      title = 'Spectrogram',
      source = 'simulation',
      xlabel = 'Time (s)',
      ylabel = 'Frequency (Hz)',
      colorscale = 'Viridis'
    } = opts;

    // Transpose data for Plotly heatmap (freqBins × timeFrames)
    const z = [];
    const numBins = spectData.data[0]?.length || 0;
    for (let b = 0; b < numBins; b++) {
      const row = [];
      for (let f = 0; f < spectData.data.length; f++) {
        row.push(spectData.data[f][b]);
      }
      z.push(row);
    }

    const trace = {
      z,
      x: spectData.timeAxis,
      y: spectData.freqAxis,
      type: 'heatmap',
      colorscale,
      colorbar: {
        title: { text: 'dB', font: { size: 10, color: '#8899aa' } },
        tickfont: { size: 9, color: '#8899aa' },
        thickness: 15,
        outlinecolor: 'rgba(0, 229, 255, 0.15)',
        outlinewidth: 1
      },
      hovertemplate: 't=%{x:.4f}s<br>f=%{y:.0f}Hz<br>%{z:.1f}dB<extra></extra>'
    };

    const layout = makeLayout({
      title: { text: makeTitle(title, source), x: 0.02 },
      xaxis: { ...DARK_THEME.xaxis, title: xlabel },
      yaxis: { ...DARK_THEME.yaxis, title: ylabel }
    });

    Plotly.newPlot(el, [trace], layout, PLOT_CONFIG);
  }

  /* ============================================================
     CROSS-CORRELATION PLOT
     ============================================================ */
  function plotCorrelation(divId, lags, corr, opts = {}) {
    const el = typeof divId === 'string' ? document.getElementById(divId) : divId;
    if (!el) return;

    const {
      title = 'Cross-Correlation',
      source = 'simulation',
      xlabel = 'Lag (samples)',
      ylabel = 'Correlation',
      color = '#ffab00',
      peakIdx = null
    } = opts;

    const traces = [{
      x: Array.from(lags),
      y: Array.from(corr),
      type: 'scatter',
      mode: 'lines',
      line: { color, width: 1.5 },
      hovertemplate: 'Lag=%{x}<br>Corr=%{y:.4f}<extra></extra>'
    }];

    // Add peak annotation
    const annotations = [];
    if (peakIdx !== null) {
      annotations.push({
        x: lags[peakIdx],
        y: corr[peakIdx],
        text: `Peak @ lag=${peakIdx}`,
        showarrow: true,
        arrowhead: 2,
        arrowcolor: '#ff1744',
        font: { color: '#ff1744', size: 11, family: "'JetBrains Mono'" },
        bgcolor: 'rgba(17,27,46,0.9)',
        bordercolor: '#ff1744',
        borderwidth: 1,
        borderpad: 4
      });

      // Peak marker
      traces.push({
        x: [lags[peakIdx]],
        y: [corr[peakIdx]],
        type: 'scatter',
        mode: 'markers',
        marker: { color: '#ff1744', size: 10, symbol: 'diamond' },
        showlegend: false,
        hoverinfo: 'skip'
      });
    }

    const layout = makeLayout({
      title: { text: makeTitle(title, source), x: 0.02 },
      xaxis: { ...DARK_THEME.xaxis, title: xlabel },
      yaxis: { ...DARK_THEME.yaxis, title: ylabel },
      annotations,
      showlegend: false
    });

    Plotly.newPlot(el, traces, layout, PLOT_CONFIG);
  }

  /* ============================================================
     MATCHED FILTER OUTPUT
     ============================================================ */
  function plotMatchedFilter(divId, t, output, opts = {}) {
    const el = typeof divId === 'string' ? document.getElementById(divId) : divId;
    if (!el) return;

    const {
      title = 'Matched Filter Output',
      source = 'simulation',
      xlabel = 'Sample',
      ylabel = 'Normalized Output',
      color = '#00c853',
      threshold = 0.5
    } = opts;

    const traces = [{
      x: Array.from(t),
      y: Array.from(output),
      type: 'scatter',
      mode: 'lines',
      line: { color, width: 1.5 },
      name: 'MF Output',
      hovertemplate: 'n=%{x}<br>Out=%{y:.4f}<extra></extra>'
    }];

    // Threshold line
    if (threshold > 0) {
      traces.push({
        x: [t[0], t[t.length - 1]],
        y: [threshold, threshold],
        type: 'scatter',
        mode: 'lines',
        line: { color: '#ff1744', width: 1, dash: 'dash' },
        name: `Threshold (${threshold})`,
        hoverinfo: 'skip'
      });
    }

    const layout = makeLayout({
      title: { text: makeTitle(title, source), x: 0.02 },
      xaxis: { ...DARK_THEME.xaxis, title: xlabel },
      yaxis: { ...DARK_THEME.yaxis, title: ylabel },
      legend: {
        font: { size: 10, color: '#8899aa' },
        bgcolor: 'rgba(17,27,46,0.8)',
        bordercolor: 'rgba(0,229,255,0.1)',
        borderwidth: 1
      }
    });

    Plotly.newPlot(el, traces, layout, PLOT_CONFIG);
  }

  /* ============================================================
     INSTANTANEOUS FREQUENCY
     ============================================================ */
  function plotInstFreq(divId, t, freq, opts = {}) {
    const el = typeof divId === 'string' ? document.getElementById(divId) : divId;
    if (!el) return;

    const {
      title = 'Instantaneous Frequency',
      source = 'simulation',
      xlabel = 'Time (s)',
      ylabel = 'Frequency (Hz)',
      color = '#aa00ff'
    } = opts;

    const trace = {
      x: Array.from(t),
      y: Array.from(freq),
      type: 'scatter',
      mode: 'lines',
      line: { color, width: 2 },
      hovertemplate: 't=%{x:.6f}s<br>f=%{y:.0f}Hz<extra></extra>'
    };

    const layout = makeLayout({
      title: { text: makeTitle(title, source), x: 0.02 },
      xaxis: { ...DARK_THEME.xaxis, title: xlabel },
      yaxis: { ...DARK_THEME.yaxis, title: ylabel }
    });

    Plotly.newPlot(el, [trace], layout, PLOT_CONFIG);
  }

  /* ============================================================
     COMPARISON PLOT (Overlay Two Traces)
     ============================================================ */
  function plotComparison(divId, data1, data2, opts = {}) {
    const el = typeof divId === 'string' ? document.getElementById(divId) : divId;
    if (!el) return;

    const {
      title = 'Comparison',
      xlabel = 'Time (s)',
      ylabel = 'Amplitude',
      label1 = 'FPGA',
      label2 = 'MATLAB',
      color1 = '#00c853',
      color2 = '#2979ff'
    } = opts;

    const traces = [
      {
        x: Array.from(data1.x),
        y: Array.from(data1.y),
        type: 'scatter',
        mode: 'lines',
        line: { color: color1, width: 1.5 },
        name: label1
      },
      {
        x: Array.from(data2.x),
        y: Array.from(data2.y),
        type: 'scatter',
        mode: 'lines',
        line: { color: color2, width: 1.5, dash: 'dash' },
        name: label2
      }
    ];

    const layout = makeLayout({
      title: { text: makeTitle(title, 'fpga'), x: 0.02 },
      xaxis: { ...DARK_THEME.xaxis, title: xlabel },
      yaxis: { ...DARK_THEME.yaxis, title: ylabel },
      legend: {
        font: { size: 10, color: '#8899aa' },
        bgcolor: 'rgba(17,27,46,0.8)',
        bordercolor: 'rgba(0,229,255,0.1)',
        borderwidth: 1,
        x: 0.99,
        y: 0.99,
        xanchor: 'right'
      }
    });

    Plotly.newPlot(el, traces, layout, PLOT_CONFIG);
  }

  /* ============================================================
     GENERIC LINE PLOT
     ============================================================ */
  function plotLine(divId, x, y, opts = {}) {
    const el = typeof divId === 'string' ? document.getElementById(divId) : divId;
    if (!el) return;

    const {
      title = 'Plot',
      source = 'simulation',
      xlabel = 'X',
      ylabel = 'Y',
      color = '#00e5ff',
      lineWidth = 1.5,
      fill = false
    } = opts;

    const trace = {
      x: Array.from(x),
      y: Array.from(y),
      type: 'scatter',
      mode: 'lines',
      line: { color, width: lineWidth },
    };

    if (fill) {
      trace.fill = 'tozeroy';
      const r = parseInt(color.slice(1,3),16);
      const g = parseInt(color.slice(3,5),16);
      const b = parseInt(color.slice(5,7),16);
      trace.fillcolor = `rgba(${r},${g},${b},0.08)`;
    }

    const layout = makeLayout({
      title: { text: makeTitle(title, source), x: 0.02 },
      xaxis: { ...DARK_THEME.xaxis, title: xlabel },
      yaxis: { ...DARK_THEME.yaxis, title: ylabel }
    });

    Plotly.newPlot(el, [trace], layout, PLOT_CONFIG);
  }

  /* ============================================================
     CLEAR PLOT
     ============================================================ */
  function clearPlot(divId) {
    const el = document.getElementById(divId);
    if (el) Plotly.purge(el);
  }

  /* ============================================================
     EXPORT PLOT AS PNG
     ============================================================ */
  function exportPlotPNG(divId, filename = 'sonaris_plot') {
    Plotly.downloadImage(divId, {
      format: 'png',
      width: 1200,
      height: 600,
      filename,
      scale: 2
    });
  }

  /* ============================================================
     PUBLIC API
     ============================================================ */
  return {
    plotWaveform,
    plotFFT,
    plotSpectrogram,
    plotCorrelation,
    plotMatchedFilter,
    plotInstFreq,
    plotComparison,
    plotLine,
    clearPlot,
    exportPlotPNG,
    DARK_THEME,
    PLOT_CONFIG,
    SOURCE_LABELS
  };
})();
