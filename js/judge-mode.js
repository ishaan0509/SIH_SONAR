/**
 * SONARIS — Judge Mode
 * Full-screen guided presentation with 10 slides, timer, and keyboard navigation.
 */
const JudgeMode = (() => {
  'use strict';

  let currentSlide = 0;
  let timerRunning = false;
  let timerInterval = null;
  let timeRemaining = 180; // 3 minutes

  const SLIDES = [
    {
      title: 'SONARIS',
      subtitle: 'Adaptive Underwater Signal Intelligence Platform',
      content: `
        <div style="text-align:center">
          <div class="hero-sonar" style="margin:var(--space-8) auto">
            <div class="sonar-core"></div>
            <div class="hero-ring"></div>
            <div class="hero-ring"></div>
            <div class="hero-ring"></div>
          </div>
          <h2 class="text-gradient" style="font-size:var(--text-4xl)">SONARIS</h2>
          <p style="color:var(--accent-cyan);font-family:var(--font-mono);font-size:var(--text-lg);margin-top:var(--space-4)">
            Sense. Adapt. Transmit. Detect.
          </p>
        </div>
      `,
      points: ['FPGA-based adaptive sonar system', 'Real-time waveform parameter adjustment', 'Environmental condition classification']
    },
    {
      title: 'The Problem',
      content: '',
      points: [
        'Conventional sonar uses fixed waveform parameters',
        'Ocean conditions vary dramatically — temperature, salinity, depth, turbidity',
        'Fixed parameters → suboptimal detection in changing environments',
        'Manual reconfiguration is slow and impractical for autonomous platforms'
      ]
    },
    {
      title: 'Our Solution',
      content: '',
      points: [
        'Real-time environmental sensing → automatic condition classification',
        '4 operating conditions (C1-C4) cover the full range of ocean environments',
        'FPGA-based DDS dynamically adjusts frequency, bandwidth, pulse width, TX power',
        'No manual intervention — fully adaptive pipeline'
      ]
    },
    {
      title: 'System Architecture',
      content: `<div id="judge-arch-plot" style="text-align:center;padding:var(--space-4)">
        <div class="flow-strip" style="justify-content:center">
          <div class="flow-node"><span class="flow-icon">🌊</span> Sensors</div>
          <span class="flow-connector">→</span>
          <div class="flow-node" style="border-color:var(--accent-green)"><span class="flow-icon">⚡</span> FPGA</div>
          <span class="flow-connector">→</span>
          <div class="flow-node" style="border-color:var(--accent-green)"><span class="flow-icon">🧠</span> Adaptive</div>
          <span class="flow-connector">→</span>
          <div class="flow-node" style="border-color:var(--accent-green)"><span class="flow-icon">🔄</span> DDS</div>
          <span class="flow-connector">→</span>
          <div class="flow-node"><span class="flow-icon">📡</span> Transducer</div>
        </div>
      </div>`,
      points: [
        '32-bit DDS phase accumulator for precise frequency control',
        'Condition classifier with automatic parameter mapping',
        'UART telemetry for real-time monitoring',
        'Modular design for easy expansion'
      ]
    },
    {
      title: 'Adaptive Conditions',
      content: `<div class="condition-grid" style="max-width:500px;margin:var(--space-4) auto">
        <div class="condition-card" style="border-color:#00e5ff"><div class="condition-id" style="color:#00e5ff">C1</div><div class="condition-desc">Shallow Warm Clear</div></div>
        <div class="condition-card" style="border-color:#00bfa5"><div class="condition-id" style="color:#00bfa5">C2</div><div class="condition-desc">Mid-depth Moderate</div></div>
        <div class="condition-card" style="border-color:#ffab00"><div class="condition-id" style="color:#ffab00">C3</div><div class="condition-desc">Deep Cold Saline</div></div>
        <div class="condition-card" style="border-color:#ff1744"><div class="condition-id" style="color:#ff1744">C4</div><div class="condition-desc">Turbid / Noisy</div></div>
      </div>`,
      points: [
        'C1: High frequency, short pulse — optimal for shallow, clear water',
        'C2: Mid frequency, medium pulse — balanced for moderate conditions',
        'C3: Low frequency, long pulse — penetrates deep, cold water',
        'C4: Coded pulse, high power — handles noisy coastal environments'
      ]
    },
    {
      title: 'FPGA Implementation',
      content: '',
      points: [
        'Xilinx FPGA with 100 MHz system clock',
        'DDS generates LFM chirp via phase accumulator + LUT',
        'DMA-driven DAC output for continuous waveform',
        'Timer-controlled pulse width matches condition parameters',
        'UART transmits telemetry to dashboard at 115200 baud'
      ]
    },
    {
      title: 'Signal Processing Pipeline',
      content: `<div id="judge-pipeline-plot" style="min-height:250px;margin:var(--space-4) 0"></div>`,
      points: [
        'LFM chirp generation with configurable bandwidth',
        'Cross-correlation for echo detection',
        'Matched filter maximizes SNR for target detection',
        'Range estimation: R = c⋅Δt / 2',
        'Spectrogram for time-frequency analysis'
      ]
    },
    {
      title: 'Live Demo',
      content: `<div id="judge-demo-plot" style="min-height:250px;margin:var(--space-4) 0"></div>`,
      points: [
        'Interactive Mission Control dashboard',
        'Real-time waveform generation and analysis',
        'All 7 DSP analysis stages running in browser',
        'CSV data import for FPGA/MATLAB validation'
      ]
    },
    {
      title: 'Social Impact',
      content: '',
      points: [
        'Enables efficient AUV surveys with adaptive sonar',
        'Adaptive power control reduces energy consumption',
        'Supports India\'s Deep Ocean Mission objectives',
        'Scalable from research to defense applications',
        'Field-upgradeable via FPGA firmware updates'
      ]
    },
    {
      title: 'Thank You',
      content: `
        <div style="text-align:center;padding:var(--space-8)">
          <h2 class="text-gradient" style="font-size:var(--text-3xl);margin-bottom:var(--space-4)">SONARIS</h2>
          <p style="color:var(--accent-cyan);font-family:var(--font-mono);font-size:var(--text-lg)">
            Sense. Adapt. Transmit. Detect.
          </p>
          <div class="divider" style="max-width:200px;margin:var(--space-6) auto"></div>
          <p class="text-muted">Questions?</p>
        </div>
      `,
      points: []
    }
  ];

  function init() {
    currentSlide = 0;
    timeRemaining = 180;
    renderSlide();
    renderProgress();
    setupKeyboard();
  }

  function renderSlide() {
    const slide = SLIDES[currentSlide];
    const container = document.getElementById('judge-slide');
    if (!container) return;

    let html = '';
    if (slide.title && currentSlide > 0 && currentSlide < SLIDES.length - 1) {
      html += `<h2>${slide.title}</h2>`;
    }
    if (slide.content) {
      html += `<div class="slide-visual">${slide.content}</div>`;
    }
    if (slide.points && slide.points.length > 0) {
      html += '<ul class="talking-points">';
      slide.points.forEach(p => {
        html += `<li class="talking-point">${p}</li>`;
      });
      html += '</ul>';
    }

    container.innerHTML = html;

    // Update counter
    const counter = document.getElementById('judge-slide-counter');
    if (counter) counter.textContent = `${currentSlide + 1} / ${SLIDES.length}`;

    // Render demo plots on specific slides
    renderSlidePlots(currentSlide);
  }

  function renderSlidePlots(idx) {
    requestAnimationFrame(() => {
      try {
        if (idx === 6 && document.getElementById('judge-pipeline-plot')) {
          const chirp = SonarEngine.generateLFM(50000, 70000, 0.005, 200000);
          const t = [], s = [];
          const step = Math.ceil(chirp.N / 500);
          for (let i = 0; i < chirp.N; i += step) { t.push(chirp.time[i]); s.push(chirp.signal[i]); }
          SonarPlots.plotWaveform('judge-pipeline-plot', t, s, { title: 'LFM Chirp — C1' });
        }
        if (idx === 7 && document.getElementById('judge-demo-plot')) {
          const chirp = SonarEngine.generateLFM(50000, 70000, 0.005, 200000);
          const echo = SonarEngine.generateEcho(chirp, 0.133, 0.3, 20);
          const mf = SonarEngine.matchedFilter(echo.signal, chirp.signal);
          const t = [], o = [];
          const step = Math.ceil(mf.N / 500);
          for (let i = 0; i < mf.N; i += step) { t.push(mf.time[i]); o.push(mf.output[i]); }
          SonarPlots.plotMatchedFilter('judge-demo-plot', t, o, { title: 'Matched Filter — Target Detection' });
        }
      } catch (e) { console.warn('Judge plot error:', e); }
    });
  }

  function renderProgress() {
    const progress = document.getElementById('judge-progress');
    if (!progress) return;

    progress.innerHTML = SLIDES.map((_, i) => {
      const cls = i < currentSlide ? 'completed' : i === currentSlide ? 'active' : '';
      return `<div class="progress-dot ${cls}"></div>`;
    }).join('');
  }

  function next() {
    if (currentSlide < SLIDES.length - 1) {
      currentSlide++;
      renderSlide();
      renderProgress();
    }
  }

  function prev() {
    if (currentSlide > 0) {
      currentSlide--;
      renderSlide();
      renderProgress();
    }
  }

  function toggleTimer() {
    timerRunning = !timerRunning;
    if (timerRunning) {
      timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        if (timeRemaining <= 0) {
          timerRunning = false;
          clearInterval(timerInterval);
          showToast('Time is up!', 'warning');
        }
      }, 1000);
    } else {
      clearInterval(timerInterval);
    }
  }

  function updateTimerDisplay() {
    const timerEl = document.getElementById('judge-timer');
    if (!timerEl) return;
    const mins = Math.floor(timeRemaining / 60);
    const secs = timeRemaining % 60;
    timerEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    if (timeRemaining <= 30) {
      timerEl.style.color = 'var(--accent-red)';
    } else if (timeRemaining <= 60) {
      timerEl.style.color = 'var(--accent-amber)';
    }
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  function exit() {
    clearInterval(timerInterval);
    timerRunning = false;
    window.location.hash = 'home';
  }

  function setupKeyboard() {
    const handler = (e) => {
      if (App.getCurrentPage() !== 'judge-mode') {
        document.removeEventListener('keydown', handler);
        return;
      }
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
      if (e.key === 'Escape') exit();
      if (e.key === 'f' || e.key === 'F') toggleFullscreen();
    };
    document.addEventListener('keydown', handler);
  }

  return { init, next, prev, toggleTimer, toggleFullscreen, exit };
})();
