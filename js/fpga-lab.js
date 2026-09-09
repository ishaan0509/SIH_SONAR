/**
 * SONARIS — FPGA Lab Module
 */
const FPGALab = (() => {
  'use strict';

  let ws = null;

  function init() {
    const connectBtn = document.getElementById('fpga-connect-btn');
    if (connectBtn) {
      connectBtn.addEventListener('click', connect);
    }
  }

  function connect() {
    try {
      ws = new WebSocket('ws://localhost:8765');
      updateStatus('connecting', 'Connecting...');

      ws.onopen = () => {
        updateStatus('connected', 'Connected');
        showToast('FPGA connected via WebSocket!', 'success');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          updateFPGAData(data);
        } catch (e) {
          console.warn('Invalid FPGA data:', event.data);
        }
      };

      ws.onclose = () => {
        updateStatus('disconnected', 'Disconnected');
        ws = null;
      };

      ws.onerror = () => {
        updateStatus('error', 'Error');
        showToast('WebSocket connection failed. Is the Python bridge running?', 'warning');
        ws = null;
      };
    } catch (e) {
      showToast('Could not create WebSocket connection', 'error');
    }
  }

  function updateStatus(state, text) {
    const statusEl = document.getElementById('fpga-connection-status');
    const connEl = document.getElementById('fpga-conn');

    const dotColors = {
      connected: 'green',
      connecting: 'amber',
      disconnected: 'amber',
      error: 'red'
    };

    if (statusEl) {
      statusEl.innerHTML = `
        <span class="status-dot ${dotColors[state] || 'amber'}"></span>
        <span>${text}</span>
      `;
    }

    if (connEl) {
      connEl.textContent = text;
      connEl.style.color = state === 'connected' ? 'var(--accent-green)' : 'var(--accent-amber)';
    }
  }

  function updateFPGAData(data) {
    if (data.condition) setText('fpga-condition', data.condition);
    if (data.clock) setText('fpga-clock', data.clock);
    if (data.baud) setText('fpga-baud', data.baud);
    if (data.waveform) setText('fpga-waveform', data.waveform);
  }

  function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  return { init };
})();

/**
 * SONARIS — Data Explorer Module
 */
const DataExplorer = (() => {
  'use strict';

  let loadedData = null;
  let filename = '';

  function init() {
    setupDropZone();
  }

  function setupDropZone() {
    const zone = document.getElementById('csv-drop-zone');
    const fileInput = document.getElementById('csv-file-input');
    if (!zone || !fileInput) return;

    zone.addEventListener('click', () => fileInput.click());

    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      zone.classList.add('drag-over');
    });

    zone.addEventListener('dragleave', () => {
      zone.classList.remove('drag-over');
    });

    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file) loadFile(file);
    });

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) loadFile(file);
    });
  }

  function loadFile(file) {
    filename = file.name;
    const reader = new FileReader();
    reader.onload = (e) => {
      const parsed = SonarEngine.parseCSV(e.target.result);
      if (!parsed) {
        showToast('Failed to parse CSV', 'error');
        return;
      }

      loadedData = parsed;
      showDataInfo(parsed);
      showPreview(parsed);
      showToast(`Loaded ${filename}: ${parsed.rows} rows, ${parsed.headers.length} columns`, 'success');
    };
    reader.readAsText(file);
  }

  function showDataInfo(data) {
    const info = document.getElementById('data-info');
    if (info) info.classList.remove('hidden');
    setText('csv-filename', filename);
    setText('csv-rows', data.rows);
    setText('csv-cols', data.headers.length);

    const analysis = document.getElementById('analysis-section');
    if (analysis) analysis.classList.remove('hidden');
  }

  function showPreview(data) {
    const preview = document.getElementById('data-preview');
    if (preview) preview.classList.remove('hidden');

    const thead = document.getElementById('csv-thead');
    const tbody = document.getElementById('csv-tbody');
    if (!thead || !tbody) return;

    thead.innerHTML = '<tr>' + data.headers.map(h => `<th>${h}</th>`).join('') + '</tr>';

    const maxRows = Math.min(20, data.rows);
    let rows = '';
    for (let i = 0; i < maxRows; i++) {
      rows += '<tr>';
      data.headers.forEach(h => {
        const val = data.data[h][i];
        rows += `<td>${typeof val === 'number' ? val.toFixed(6) : val}</td>`;
      });
      rows += '</tr>';
    }
    tbody.innerHTML = rows;
  }

  function analyzeFFT() {
    if (!loadedData) return;
    const col = loadedData.headers.length > 1 ? loadedData.headers[1] : loadedData.headers[0];
    const signal = loadedData.data[col].filter(v => typeof v === 'number');
    if (signal.length < 4) { showToast('Not enough data for FFT', 'error'); return; }

    const fftResult = SonarEngine.fft(new Float64Array(signal));
    const mag = SonarEngine.magnitudeDB(fftResult);
    const freq = SonarEngine.frequencyAxis(1, fftResult.N);

    SonarPlots.plotFFT('de-plot-1', freq, mag, { title: 'FFT — ' + col, source: 'csv' });
    showToast('FFT complete', 'info');
  }

  function analyzeSpectrogram() {
    if (!loadedData) return;
    const col = loadedData.headers.length > 1 ? loadedData.headers[1] : loadedData.headers[0];
    const signal = loadedData.data[col].filter(v => typeof v === 'number');
    if (signal.length < 64) { showToast('Not enough data for spectrogram', 'error'); return; }

    const windowSize = Math.min(128, Math.floor(signal.length / 4));
    const spec = SonarEngine.spectrogram(new Float64Array(signal), windowSize, windowSize / 2, 1);
    SonarPlots.plotSpectrogram('de-plot-2', spec, { title: 'Spectrogram — ' + col, source: 'csv' });
    showToast('Spectrogram complete', 'info');
  }

  function analyzeCorrelation() {
    if (!loadedData || loadedData.headers.length < 2) {
      showToast('Need at least 2 columns for correlation', 'warning');
      return;
    }
    const sig1 = loadedData.data[loadedData.headers[0]].filter(v => typeof v === 'number');
    const sig2 = loadedData.data[loadedData.headers[1]].filter(v => typeof v === 'number');

    const corr = SonarEngine.crossCorrelationDirect(new Float64Array(sig1), new Float64Array(sig2));
    SonarPlots.plotCorrelation('de-plot-1', corr.lags, corr.correlation, {
      title: 'Cross-Correlation', source: 'csv'
    });
    showToast('Correlation complete', 'info');
  }

  function analyzeMatchedFilter() {
    if (!loadedData || loadedData.headers.length < 2) {
      showToast('Need at least 2 columns for matched filter', 'warning');
      return;
    }
    const rx = loadedData.data[loadedData.headers[1]].filter(v => typeof v === 'number');
    const template = loadedData.data[loadedData.headers[0]].filter(v => typeof v === 'number');

    const mf = SonarEngine.matchedFilter(new Float64Array(rx), new Float64Array(template));
    SonarPlots.plotMatchedFilter('de-plot-2', mf.time, mf.output, {
      title: 'Matched Filter', source: 'csv'
    });
    showToast('Matched filter complete', 'info');
  }

  function exportRaw() {
    if (!loadedData) return;
    let csv = loadedData.headers.join(',') + '\n';
    for (let i = 0; i < loadedData.rows; i++) {
      csv += loadedData.headers.map(h => loadedData.data[h][i]).join(',') + '\n';
    }
    downloadCSV(csv, `${filename.replace('.csv', '')}_raw.csv`);
  }

  function exportProcessed() {
    showToast('Processed export requires analysis first', 'info');
  }

  function downloadCSV(content, name) {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }

  function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  return { init, analyzeFFT, analyzeSpectrogram, analyzeCorrelation, analyzeMatchedFilter, exportRaw, exportProcessed };
})();
