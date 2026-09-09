/**
 * SONARIS — Page Templates & Layouts
 * Spacious, clean, friendly, futuristic dark aesthetic with neon accents.
 */

const Pages = (() => {
  'use strict';

  /* ============================================================
     1. LANDING / HOME PAGE (Spacious, Breathable, Innovative)
     ============================================================ */
  function renderLanding() {
    return `
      <div class="landing-container">
        <!-- Interactive Acoustic Hero Canvas Background -->
        <div class="hero-canvas-wrap">
          <canvas id="hero-acoustic-canvas" width="1200" height="420"></canvas>
        </div>

        <!-- Hero Section -->
        <section class="hero-section">
          <div class="hero-badge animate-pulse">
            <span class="pulse-dot"></span>
            <span>SONARIS v2.4 • REAL-TIME ADAPTIVE FPGA DSP & ACOUSTIC PLATFORM</span>
          </div>

          <h1 class="hero-title">
            Adaptive Underwater <br><span class="gradient-text">Signal Intelligence</span>
          </h1>

          <p class="hero-subtitle">
            Next-generation marine acoustics and FPGA mission control combining Snell's law acoustic ray tracing,
            empirical sound velocity profiles, and prototype switch-selectable LFM chirp generation.
          </p>

          <div class="hero-actions">
            <a href="#mission-control" class="sonar-btn btn-primary btn-lg glow-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/></svg>
              Launch Mission Control
            </a>
            <a href="#uw-acoustics" class="sonar-btn btn-secondary btn-lg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
              Underwater Acoustics Theory
            </a>
            <a href="#live-sonar" class="sonar-btn btn-ghost btn-lg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              FPGA Live Sonar
            </a>
          </div>
        </section>

        <!-- Live Sound Speed & Acoustic Telemetry HUD Widget -->
        <section class="home-hud-card">
          <div class="hud-header">
            <div style="display:flex;align-items:center;gap:12px">
              <span class="hud-dot"></span>
              <h3 style="margin:0;font-size:17px;color:#fff;font-weight:700">Live Mackenzie (1981) Acoustic Profile Calculator</h3>
            </div>
            <span class="hud-badge">UNESCO Standard</span>
          </div>

          <div class="hud-body">
            <div class="hud-metric">
              <span class="hud-metric-label">Sound Speed (c)</span>
              <span class="hud-metric-val" id="home-stat-c">1482.3 <span class="unit">m/s</span></span>
            </div>
            <div class="hud-metric">
              <span class="hud-metric-label">Acoustic Impedance (Z)</span>
              <span class="hud-metric-val" id="home-stat-z">1.524 <span class="unit">MRayl</span></span>
            </div>
            <div class="hud-metric">
              <span class="hud-metric-label">Absorption @ 30kHz</span>
              <span class="hud-metric-val" id="home-stat-a">5.42 <span class="unit">dB/km</span></span>
            </div>
            <div class="hud-metric">
              <span class="hud-metric-label">SOFAR Channel Depth</span>
              <span class="hud-metric-val" id="home-stat-sofar">950 <span class="unit">m</span></span>
            </div>
          </div>
        </section>

        <!-- Core Feature Cards Grid -->
        <section class="features-grid">
          <div class="feature-card" onclick="window.location.hash='uw-acoustics'">
            <div class="feature-icon" style="color:var(--accent-cyan);background:rgba(0,229,255,0.1)">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
            </div>
            <div class="feature-title">Underwater Acoustics</div>
            <p class="feature-desc">Comprehensive ocean sound propagation: Medwin & Mackenzie SVPs, Snell's law acoustic ray tracing, shadow zones, and Wenz ambient noise.</p>
            <span class="feature-link">Explore Acoustics &rarr;</span>
          </div>

          <div class="feature-card" onclick="window.location.hash='mission-control'">
            <div class="feature-icon" style="color:var(--accent-teal);background:rgba(0,191,165,0.1)">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/></svg>
            </div>
            <div class="feature-title">Adaptive Mission Control</div>
            <p class="feature-desc">Interactive PPI radar scan tracking 3 underwater contacts, 4 condition presets (C1–C4), and synchronized environmental sliders.</p>
            <span class="feature-link">Open Mission Control &rarr;</span>
          </div>

          <div class="feature-card" onclick="window.location.hash='live-sonar'">
            <div class="feature-icon" style="color:var(--accent-amber);background:rgba(255,171,0,0.1)">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            </div>
            <div class="feature-title">FPGA Live Sonar Lab</div>
            <p class="feature-desc">Prototype switch emulator for C1 (1–5 MHz in 10 µs), C2 (1–4 MHz in 12 µs), C3 (1–3 MHz in 8 µs), and C4 (1–2 MHz in 6 µs).</p>
            <span class="feature-link">Inspect Live Sonar &rarr;</span>
          </div>

          <div class="feature-card" onclick="window.location.hash='matlab-validation'">
            <div class="feature-icon" style="color:var(--accent-blue);background:rgba(41,121,255,0.1)">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
            </div>
            <div class="feature-title">MATLAB & Simulink Lab</div>
            <p class="feature-desc">Upload and run MATLAB (.m) scripts and Simulink (.slx) models, syntax-highlighted code viewer, and fixed-point validation.</p>
            <span class="feature-link">Run Simulation &rarr;</span>
          </div>
        </section>
      </div>
    `;
  }

  /* ============================================================
     2. UNDERWATER ACOUSTICS (arc.id.au)
     ============================================================ */
  function renderUWAcoustics() {
    return `
      <div class="page-container">
        <!-- Header -->
        <div class="page-header">
          <div>
            <h1 class="page-title">Underwater Acoustics & Sound Propagation</h1>
            <p class="page-subtitle">
              Theory, empirical formulas, and ray tracing simulation based on
              <a href="https://www.arc.id.au/UWAcoustics.html" target="_blank" style="color:var(--accent-cyan);text-decoration:underline">Dr. A.R. Collins' Underwater Sound Propagation Research</a>.
            </p>
          </div>
          <div class="header-actions">
            <span class="tag-chip tag-c1 active">Mackenzie & Medwin Equations</span>
          </div>
        </div>

        <!-- Profile Preset Switcher -->
        <div class="profile-switcher-card">
          <div style="font-size:13px;font-weight:600;color:#fff;margin-bottom:10px">Select Oceanographic Profile Preset:</div>
          <div class="profile-buttons-row">
            <button class="sonar-btn profile-btn active" data-profile="eastern-pacific">
              <strong>Figure 1: Eastern Pacific Winter</strong>
              <span>75m Mixed Layer @ 17°C, Thermocline, Deep SOFAR</span>
            </button>
            <button class="sonar-btn profile-btn" data-profile="polar-cold">
              <strong>Figure 2: Polar High-Latitude</strong>
              <span>Cold Surface (1.5°C), No Mixed Layer, Continuous Gradient</span>
            </button>
            <button class="sonar-btn profile-btn" data-profile="tropical-sofar">
              <strong>Tropical Deep Ocean</strong>
              <span>Warm Surface (26°C), Steep Thermocline, SOFAR Axis @ 850m</span>
            </button>
          </div>
        </div>

        <!-- Telemetry Summary HUD -->
        <div class="telemetry-bar">
          <div class="telemetry-item">
            <span class="tel-label">Surface Sound Speed</span>
            <span class="tel-val" id="uw-stat-surf-c">1512.4 <span class="unit">m/s</span></span>
          </div>
          <div class="telemetry-item">
            <span class="tel-label">Min Sound Speed (Axis)</span>
            <span class="tel-val" id="uw-stat-min-c" style="color:var(--accent-cyan)">1481.0 <span class="unit">m/s</span></span>
          </div>
          <div class="telemetry-item">
            <span class="tel-label">SOFAR Channel Axis Depth</span>
            <span class="tel-val" id="uw-stat-sofar-depth" style="color:var(--accent-amber)">900 <span class="unit">m</span></span>
          </div>
          <div class="telemetry-item">
            <span class="tel-label">Seawater Density (ρ)</span>
            <span class="tel-val" id="uw-stat-density">1026.8 <span class="unit">kg/m³</span></span>
          </div>
          <div class="telemetry-item">
            <span class="tel-label">Acoustic Impedance (Z)</span>
            <span class="tel-val" id="uw-stat-impedance">1.552 <span class="unit">MRayl</span></span>
          </div>
          <div class="telemetry-item">
            <span class="tel-label">Absorption α (30 kHz)</span>
            <span class="tel-val" id="uw-stat-alpha" style="color:var(--accent-green)">5.42 <span class="unit">dB/km</span></span>
          </div>
        </div>

        <!-- Interactive Sliders Panel -->
        <div class="card" style="margin-bottom:24px">
          <div class="card-header">
            <span class="card-title">Acoustic Environmental Control Parameters</span>
            <span class="card-subtitle">Adjust parameters to observe real-time refraction, sound velocity profiles, and ray tracing</span>
          </div>
          <div class="sliders-grid-6">
            <div class="slider-group">
              <div class="slider-header">
                <span class="slider-label">Surface Temperature</span>
                <span class="slider-value" id="uw-temp-val">17°C</span>
              </div>
              <input type="range" id="uw-temp-slider" min="0" max="32" step="0.5" value="17" class="sonar-slider">
            </div>

            <div class="slider-group">
              <div class="slider-header">
                <span class="slider-label">Mixed Layer Depth</span>
                <span class="slider-value" id="uw-mix-val">75 m</span>
              </div>
              <input type="range" id="uw-mix-slider" min="0" max="250" step="5" value="75" class="sonar-slider">
            </div>

            <div class="slider-group">
              <div class="slider-header">
                <span class="slider-label">Salinity</span>
                <span class="slider-value" id="uw-sal-val">35 PSU</span>
              </div>
              <input type="range" id="uw-sal-slider" min="25" max="40" step="0.5" value="35" class="sonar-slider">
            </div>

            <div class="slider-group">
              <div class="slider-header">
                <span class="slider-label">Source Depth</span>
                <span class="slider-value" id="uw-src-depth-val">50 m</span>
              </div>
              <input type="range" id="uw-src-depth-slider" min="5" max="1000" step="5" value="50" class="sonar-slider">
            </div>

            <div class="slider-group">
              <div class="slider-header">
                <span class="slider-label">Sonar Frequency</span>
                <span class="slider-value" id="uw-freq-val">30 kHz</span>
              </div>
              <input type="range" id="uw-freq-slider" min="1" max="120" step="1" value="30" class="sonar-slider">
            </div>

            <div class="slider-group">
              <div class="slider-header">
                <span class="slider-label">Sea State (Wind)</span>
                <span class="slider-value" id="uw-wind-val">3 SS</span>
              </div>
              <input type="range" id="uw-wind-slider" min="0" max="6" step="1" value="3" class="sonar-slider">
            </div>
          </div>
        </div>

        <!-- Section 1: Temperature Bathy & Sound Speed Profile (SVP) -->
        <div class="plot-grid-2" style="margin-bottom:24px">
          <div class="plot-card">
            <div class="plot-card-header">
              <span class="plot-title">Bathythermograph (Temperature vs Depth)</span>
              <span class="plot-meta">Fig 1a / 2a</span>
            </div>
            <div id="uw-bathy-plot" class="plot-container" style="height:360px"></div>
          </div>

          <div class="plot-card">
            <div class="plot-card-header">
              <span class="plot-title">Sound Velocity Profile (SVP)</span>
              <span class="plot-meta">Equation (1): C(T, D, S)</span>
            </div>
            <div id="uw-svp-plot" class="plot-container" style="height:360px"></div>
          </div>
        </div>

        <!-- Formula Callout -->
        <div class="formula-box" style="margin-bottom:24px">
          $$C(T, D, S) = 1449.2 + 4.6\,T - 0.055\,T^2 + 0.00029\,T^3 + (1.34 - 0.010\,T)(S - 35) + 0.016\,D$$
        </div>

        <!-- Section 2: Snell's Law Ray Tracing -->
        <div class="plot-card" style="margin-bottom:24px">
          <div class="plot-card-header">
            <span class="plot-title">Acoustic Ray Tracing & Refraction (Snell's Law of Acoustics)</span>
            <span class="plot-meta">\\(\\cos(\\theta)/c = \\text{const}\\)</span>
          </div>
          <div id="uw-ray-plot" class="plot-container" style="height:400px"></div>
        </div>

        <!-- Section 3: Absorption, Transmission Loss & Wenz Ambient Noise -->
        <div class="plot-grid-3">
          <div class="plot-card">
            <div class="plot-card-header">
              <span class="plot-title">Seawater Attenuation \\(\\alpha(f)\\)</span>
              <span class="plot-meta">Ainslie-McColm</span>
            </div>
            <div id="uw-absorption-plot" class="plot-container" style="height:280px"></div>
          </div>

          <div class="plot-card">
            <div class="plot-card-header">
              <span class="plot-title">Transmission Loss (TL)</span>
              <span class="plot-meta">Spreading + Absorption</span>
            </div>
            <div id="uw-tl-plot" class="plot-container" style="height:280px"></div>
          </div>

          <div class="plot-card">
            <div class="plot-card-header">
              <span class="plot-title">Ambient Ocean Noise (Wenz)</span>
              <span class="plot-meta">Spectral Level (dB)</span>
            </div>
            <div id="uw-noise-plot" class="plot-container" style="height:280px"></div>
          </div>
        </div>
      </div>
    `;
  }

  /* ============================================================
     3. MISSION CONTROL
     ============================================================ */
  function renderMissionControl() {
    return `
      <div class="page-container">
        <!-- Header -->
        <div class="page-header">
          <div>
            <h1 class="page-title">Adaptive Sonar Mission Control</h1>
            <p class="page-subtitle">Real-time radar target tracking, condition preset classification, and autonomous waveform synthesis.</p>
          </div>
          <div class="header-actions">
            <span class="tag-chip tag-c1 active" id="active-condition-chip">C1: SOFAR Deep</span>
          </div>
        </div>

        <!-- 4 Condition Preset Buttons with definitions -->
        <div class="condition-presets-grid" style="margin-bottom:20px">
          <div class="condition-preset-btn active" data-condition="C1">
            <div class="cond-btn-top">
              <span class="cond-badge" style="background:rgba(0,229,255,0.15);color:#00e5ff">C1</span>
              <strong style="color:#fff">Deep Ocean SOFAR</strong>
            </div>
            <div class="cond-btn-params">Depth: 1200m | Temp: 4°C | 5-15 kHz</div>
            <div class="cond-btn-desc">Long pulse (20ms), high power, ultra-long range SOFAR ducting.</div>
          </div>

          <div class="condition-preset-btn" data-condition="C2">
            <div class="cond-btn-top">
              <span class="cond-badge" style="background:rgba(0,191,165,0.15);color:#00bfa5">C2</span>
              <strong style="color:#fff">Shallow Coastal Harbor</strong>
            </div>
            <div class="cond-btn-params">Depth: 35m | Temp: 22°C | 50-70 kHz</div>
            <div class="cond-btn-desc">Short pulse (5ms), high resolution, boundary reverberation gating.</div>
          </div>

          <div class="condition-preset-btn" data-condition="C3">
            <div class="cond-btn-top">
              <span class="cond-badge" style="background:rgba(255,171,0,0.15);color:#ffab00">C3</span>
              <strong style="color:#fff">Stormy / High Noise</strong>
            </div>
            <div class="cond-btn-params">Depth: 250m | Temp: 14°C | 20-45 kHz</div>
            <div class="cond-btn-desc">Wideband chirp spread spectrum, BT=300, +24.7 dB matched filter gain.</div>
          </div>

          <div class="condition-preset-btn" data-condition="C4">
            <div class="cond-btn-top">
              <span class="cond-badge" style="background:rgba(255,23,68,0.15);color:#ff1744">C4</span>
              <strong style="color:#fff">Severe Thermocline</strong>
            </div>
            <div class="cond-btn-params">Depth: 80m | Temp: 28°C | 30-60 kHz</div>
            <div class="cond-btn-desc">Coded agile LFM, variable slope to defeat acute downward refraction.</div>
          </div>
        </div>

        <!-- Active Condition Definition Card -->
        <div class="card" id="condition-definition-card" style="margin-bottom:20px;border-left:4px solid var(--accent-cyan)">
          <!-- Rendered dynamically by MissionControl.js -->
        </div>

        <!-- Telemetry HUD & Parameter Sliders Grid -->
        <div class="grid-2-1" style="margin-bottom:20px">
          <!-- Environmental Sliders -->
          <div class="card">
            <div class="card-header">
              <span class="card-title">Environmental Profiling Sliders</span>
              <span class="card-subtitle">Sliders automatically sync when clicking condition buttons above, or drag manually</span>
            </div>
            <div class="sliders-grid">
              <div class="slider-group">
                <div class="slider-header">
                  <span class="slider-label">Water Temperature</span>
                  <span class="slider-value" id="mc-temp-val">4°C</span>
                </div>
                <input type="range" id="mc-temp-slider" min="0" max="32" step="0.5" value="4" class="sonar-slider">
              </div>

              <div class="slider-group">
                <div class="slider-header">
                  <span class="slider-label">Salinity</span>
                  <span class="slider-value" id="mc-sal-val">35 PSU</span>
                </div>
                <input type="range" id="mc-sal-slider" min="25" max="40" step="0.5" value="35" class="sonar-slider">
              </div>

              <div class="slider-group">
                <div class="slider-header">
                  <span class="slider-label">Operating Depth</span>
                  <span class="slider-value" id="mc-depth-val">1200 m</span>
                </div>
                <input type="range" id="mc-depth-slider" min="5" max="2500" step="10" value="1200" class="sonar-slider">
              </div>

              <div class="slider-group">
                <div class="slider-header">
                  <span class="slider-label">Turbidity & Particulates</span>
                  <span class="slider-value" id="mc-turb-val">2 NTU</span>
                </div>
                <input type="range" id="mc-turb-slider" min="0" max="100" step="1" value="2" class="sonar-slider">
              </div>
            </div>

            <div class="telemetry-bar-mini" style="margin-top:16px">
              <div class="tel-item-mini">
                <span class="tel-k">Sound Speed:</span>
                <span class="tel-v" id="mc-stat-speed">1485.4 m/s</span>
              </div>
              <div class="tel-item-mini">
                <span class="tel-k">Density:</span>
                <span class="tel-v" id="mc-stat-density">1032.2 kg/m³</span>
              </div>
              <div class="tel-item-mini">
                <span class="tel-k">Impedance:</span>
                <span class="tel-v" id="mc-stat-impedance">1.533 MRayl</span>
              </div>
              <div class="tel-item-mini">
                <span class="tel-k">Absorption @ f₀:</span>
                <span class="tel-v" id="mc-stat-alpha">0.32 dB/km</span>
              </div>
            </div>
          </div>

          <!-- Radar PPI Display -->
          <div class="card" style="display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative">
            <div style="font-size:12px;font-weight:600;color:var(--text-muted);margin-bottom:8px;align-self:flex-start">
              PLAN POSITION INDICATOR (PPI) RADAR
            </div>
            <canvas id="mc-radar-canvas" width="280" height="280" style="border-radius:50%;background:#060a12;border:1px solid rgba(0,229,255,0.2)"></canvas>
            <div style="font-size:11px;color:var(--text-muted);margin-top:6px">
              3 Detected Underwater Contacts | Sweep 360°
            </div>
          </div>
        </div>

        <!-- Adaptive Waveform & Power Spectrum Plots -->
        <div class="plot-grid-2">
          <div class="plot-card">
            <div class="plot-card-header">
              <span class="plot-title">Synthesized TX Waveform</span>
              <span class="plot-meta" id="mc-param-wave">LFM Chirp</span>
            </div>
            <div id="mc-tx-plot" class="plot-container" style="height:320px"></div>
          </div>

          <div class="plot-card">
            <div class="plot-card-header">
              <span class="plot-title">Frequency Spectrum (FFT)</span>
              <span class="plot-meta" id="mc-param-carrier">5.0 - 15.0 kHz</span>
            </div>
            <div id="mc-fft-plot" class="plot-container" style="height:320px"></div>
          </div>
        </div>
      </div>
    `;
  }

  /* ============================================================
     4. LIVE SONAR & FPGA PROTOTYPE SWITCH CONTROLLER
     ============================================================ */
  function renderLiveSonar() {
    return `
      <div class="page-container">
        <!-- Header -->
        <div class="page-header">
          <div>
            <h1 class="page-title">FPGA Live Sonar Oscilloscope & Switch Controller</h1>
            <p class="page-subtitle">Hardware prototype switch emulation controlling real-time MHz LFM chirp generation and high-speed pulse compression.</p>
          </div>
          <div class="header-actions">
            <span class="tag-chip tag-c1 active" id="fpga-active-reg">SW[1:0] = 00</span>
          </div>
        </div>

        <!-- FPGA Prototype DIP Switch Bank Card -->
        <div class="card" style="margin-bottom:24px">
          <div class="card-header">
            <span class="card-title">Hardware Prototype DIP Switch Selector (Emulating FPGA Environmental Controller)</span>
            <span class="card-subtitle">Click a hardware switch configuration to change the FPGA chirp mode</span>
          </div>

          <div class="fpga-switches-grid">
            <div class="fpga-switch-card active" data-condition="C1">
              <div class="switch-card-top">
                <span class="switch-led" style="background:#00c853;box-shadow:0 0 10px #00c853"></span>
                <span class="switch-title">SWITCH 1 (C1)</span>
                <span class="switch-badge">SW[1:0] = 00</span>
              </div>
              <div class="switch-freq">1–5 MHz in 10 µs</div>
              <div class="switch-meta">B = 4.0 MHz | k = 400 GHz/s | BT = 40.0 (+16.0 dB gain)</div>
            </div>

            <div class="fpga-switch-card" data-condition="C2">
              <div class="switch-card-top">
                <span class="switch-led"></span>
                <span class="switch-title">SWITCH 2 (C2)</span>
                <span class="switch-badge">SW[1:0] = 01</span>
              </div>
              <div class="switch-freq">1–4 MHz in 12 µs</div>
              <div class="switch-meta">B = 3.0 MHz | k = 250 GHz/s | BT = 36.0 (+15.6 dB gain)</div>
            </div>

            <div class="fpga-switch-card" data-condition="C3">
              <div class="switch-card-top">
                <span class="switch-led"></span>
                <span class="switch-title">SWITCH 3 (C3)</span>
                <span class="switch-badge">SW[1:0] = 10</span>
              </div>
              <div class="switch-freq">1–3 MHz in 8 µs</div>
              <div class="switch-meta">B = 2.0 MHz | k = 250 GHz/s | BT = 16.0 (+12.0 dB gain)</div>
            </div>

            <div class="fpga-switch-card" data-condition="C4">
              <div class="switch-card-top">
                <span class="switch-led"></span>
                <span class="switch-title">SWITCH 4 (C4)</span>
                <span class="switch-badge">SW[1:0] = 11</span>
              </div>
              <div class="switch-freq">1–2 MHz in 6 µs</div>
              <div class="switch-meta">B = 1.0 MHz | k = 166.7 GHz/s | BT = 6.0 (+7.8 dB gain)</div>
            </div>
          </div>
        </div>

        <!-- Active Mode Telemetry HUD -->
        <div class="telemetry-bar" style="margin-bottom:24px">
          <div class="telemetry-item">
            <span class="tel-label">Active Mode</span>
            <span class="tel-val" id="fpga-active-mode-title" style="color:#00e5ff;font-size:14px">Condition 1 (1–5 MHz in 10 µs)</span>
          </div>
          <div class="telemetry-item">
            <span class="tel-label">Bandwidth (B)</span>
            <span class="tel-val" id="fpga-stat-bw">4.0 <span class="unit">MHz</span></span>
          </div>
          <div class="telemetry-item">
            <span class="tel-label">Pulse Width (T)</span>
            <span class="tel-val" id="fpga-stat-pulse">10.0 <span class="unit">µs</span></span>
          </div>
          <div class="telemetry-item">
            <span class="tel-label">Chirp Slope (k)</span>
            <span class="tel-val" id="fpga-stat-slope">400.0 <span class="unit">GHz/s</span></span>
          </div>
          <div class="telemetry-item">
            <span class="tel-label">BT Product</span>
            <span class="tel-val" id="fpga-stat-bt" style="color:var(--accent-amber)">40.0</span>
          </div>
          <div class="telemetry-item">
            <span class="tel-label">Processing Gain</span>
            <span class="tel-val" id="fpga-stat-gain" style="color:var(--accent-green)">+16.02 dB</span>
          </div>
        </div>

        <!-- Oscilloscope & Spectrum Plots -->
        <div class="plot-grid-3">
          <div class="plot-card">
            <div class="plot-card-header">
              <span class="plot-title">TX Chirp Oscilloscope (µs)</span>
              <span class="plot-meta">DAC Output</span>
            </div>
            <div id="live-tx-oscilloscope" class="plot-container" style="height:320px"></div>
          </div>

          <div class="plot-card">
            <div class="plot-card-header">
              <span class="plot-title">RF Power Spectrum (MHz)</span>
              <span class="plot-meta">Passband</span>
            </div>
            <div id="live-rf-spectrum" class="plot-container" style="height:320px"></div>
          </div>

          <div class="plot-card">
            <div class="plot-card-header">
              <span class="plot-title">Matched Filter Pulse Compression</span>
              <span class="plot-meta">Target Peak</span>
            </div>
            <div id="live-mf-peak" class="plot-container" style="height:320px"></div>
          </div>
        </div>
      </div>
    `;
  }

  /* ============================================================
     5. FPGA HARDWARE LAB
     ============================================================ */
  function renderFPGALab() {
    return `
      <div class="page-container">
        <!-- Header -->
        <div class="page-header">
          <div>
            <h1 class="page-title">FPGA Hardware Acceleration Lab</h1>
            <p class="page-subtitle">Real-time hardware telemetry, 6-stage DSP pipeline inspection, and FPGA bitstream deployment.</p>
          </div>
          <div class="header-actions">
            <button class="sonar-btn btn-primary btn-sm" id="fpga-connect-btn">
              ⚡ Connect Hardware Bridge
            </button>
          </div>
        </div>

        <!-- Telemetry Summary -->
        <div class="telemetry-bar">
          <div class="telemetry-item">
            <span class="tel-label">FPGA Target</span>
            <span class="tel-val" style="color:#00e5ff">Xilinx Artix-7</span>
          </div>
          <div class="telemetry-item">
            <span class="tel-label">Clock Domain</span>
            <span class="tel-val">100.0 <span class="unit">MHz</span></span>
          </div>
          <div class="telemetry-item">
            <span class="tel-label">DDS Phase Acc</span>
            <span class="tel-val" style="color:var(--accent-teal)">32-bit NCO</span>
          </div>
          <div class="telemetry-item">
            <span class="tel-label">FFT Architecture</span>
            <span class="tel-val">1024-pt Radix-2</span>
          </div>
          <div class="telemetry-item">
            <span class="tel-label">Latency</span>
            <span class="tel-val" style="color:var(--accent-green)">21.3 <span class="unit">µs</span></span>
          </div>
          <div class="telemetry-item">
            <span class="tel-label">Link Status</span>
            <span class="tel-val" id="fpga-conn" style="color:var(--accent-amber)">Simulated</span>
          </div>
        </div>

        <!-- 6-Stage Hardware Pipeline Diagram -->
        <div class="card" style="margin-bottom:24px">
          <div class="card-header">
            <span class="card-title">FPGA Real-Time DSP Pipeline Stages</span>
            <span class="card-subtitle">Zero-overhead fixed-point digital signal processing stream</span>
          </div>
          <div class="pipeline-grid">
            <div class="pipeline-step">
              <div class="pipe-num">01</div>
              <div class="pipe-title">DDS NCO</div>
              <div class="pipe-desc">32-bit Phase Accumulator generating instantaneous phase increments \\(\\Delta \\theta\\).</div>
            </div>
            <div class="pipeline-step">
              <div class="pipe-num">02</div>
              <div class="pipe-title">CORDIC Sine/Cos</div>
              <div class="pipe-desc">16-stage CORDIC engine translating phase to 16-bit Q1.15 sinusoid.</div>
            </div>
            <div class="pipeline-step">
              <div class="pipe-num">03</div>
              <div class="pipe-title">DAC Transmit</div>
              <div class="pipe-desc">Class-D power amplifier driver delivering agile acoustic pings.</div>
            </div>
            <div class="pipeline-step">
              <div class="pipe-num">04</div>
              <div class="pipe-title">ADC Hydrophone</div>
              <div class="pipe-desc">14-bit dual-channel ADC capturing echo at 25 MS/s sampling rate.</div>
            </div>
            <div class="pipeline-step">
              <div class="pipe-num">05</div>
              <div class="pipe-title">Cooley-Tukey FFT</div>
              <div class="pipe-desc">Pipelined Radix-2 butterfly processors with Block Floating Point.</div>
            </div>
            <div class="pipeline-step">
              <div class="pipe-num">06</div>
              <div class="pipe-title">Matched Filter</div>
              <div class="pipe-desc">Complex MAC frequency-domain correlator for +16.02 dB SNR gain.</div>
            </div>
          </div>
        </div>

        <!-- Hardware Resource Utilization & Register Telemetry -->
        <div class="grid-2">
          <!-- Resource Utilization -->
          <div class="card">
            <div class="card-header">
              <span class="card-title">Hardware Resource Utilization (Artix-7 XC7A35T)</span>
            </div>
            <div class="resource-bar-wrap">
              <div class="res-label"><span>Look-Up Tables (LUTs)</span> <span>12,420 / 20,800 (59.7%)</span></div>
              <div class="progress-bar"><div class="progress-fill" style="width:59.7%;background:var(--accent-cyan)"></div></div>
            </div>
            <div class="resource-bar-wrap">
              <div class="res-label"><span>Flip-Flops (FFs)</span> <span>18,910 / 41,600 (45.4%)</span></div>
              <div class="progress-bar"><div class="progress-fill" style="width:45.4%;background:var(--accent-teal)"></div></div>
            </div>
            <div class="resource-bar-wrap">
              <div class="res-label"><span>DSP48E1 Slices (Multipliers)</span> <span>64 / 90 (71.1%)</span></div>
              <div class="progress-bar"><div class="progress-fill" style="width:71.1%;background:var(--accent-amber)"></div></div>
            </div>
            <div class="resource-bar-wrap">
              <div class="res-label"><span>Block RAM (BRAM 36Kb)</span> <span>28 / 50 (56.0%)</span></div>
              <div class="progress-bar"><div class="progress-fill" style="width:56%;background:var(--accent-purple)"></div></div>
            </div>
          </div>

          <!-- Register Telemetry -->
          <div class="card">
            <div class="card-header">
              <span class="card-title">Memory-Mapped Control Registers</span>
            </div>
            <table class="table-compact">
              <thead>
                <tr>
                  <th>Address</th>
                  <th>Register Name</th>
                  <th>Value</th>
                  <th>Access</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><code>0x0000</code></td><td>DDS_FREQ_START</td><td style="color:#00e5ff"><code>0x000F4240 (1.0 MHz)</code></td><td>R/W</td></tr>
                <tr><td><code>0x0004</code></td><td>DDS_FREQ_END</td><td style="color:#00e5ff"><code>0x004C4B40 (5.0 MHz)</code></td><td>R/W</td></tr>
                <tr><td><code>0x0008</code></td><td>PULSE_DURATION</td><td><code>0x0000000A (10 µs)</code></td><td>R/W</td></tr>
                <tr><td><code>0x000C</code></td><td>MF_THRESHOLD</td><td style="color:#00c853"><code>0x00004CCD (0.60)</code></td><td>R/W</td></tr>
                <tr><td><code>0x0010</code></td><td>SYS_STATUS_REG</td><td style="color:#00c853"><code>0x00000001 (ACTIVE)</code></td><td>RO</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  /* ============================================================
     6. MATLAB & SIMULINK SIMULATION LAB
     ============================================================ */
  function renderMATLABValidation() {
    return `
      <div class="page-container">
        <!-- Header -->
        <div class="page-header">
          <div>
            <h1 class="page-title">MATLAB & Simulink Simulation Workbench</h1>
            <p class="page-subtitle">Upload MATLAB (.m) scripts and Simulink (.slx/.mdl) acoustic models to execute simulations and validate against FPGA bitstream data.</p>
          </div>
          <div class="header-actions">
            <button class="sonar-btn btn-primary btn-sm" id="run-matlab-btn">
              ▶ Run MATLAB / Simulink Simulation
            </button>
          </div>
        </div>

        <!-- Sample Model Switcher & File Upload -->
        <div class="grid-2-1" style="margin-bottom:20px">
          <!-- Sample Scripts Selector -->
          <div class="card">
            <div class="card-header">
              <span class="card-title">Preloaded Benchmark MATLAB Scripts</span>
            </div>
            <div class="sample-scripts-row">
              <button class="sonar-btn matlab-sample-btn active" data-script="lfm_matched_filter.m">
                <strong>lfm_matched_filter.m</strong>
                <span>Adaptive LFM Chirp & Matched Filter Golden Model</span>
              </button>
              <button class="sonar-btn matlab-sample-btn" data-script="acoustic_multipath_model.slx">
                <strong>acoustic_multipath_model.slx</strong>
                <span>Simulink Ray Tracing & Multipath Channel</span>
              </button>
              <button class="sonar-btn matlab-sample-btn" data-script="fpga_fixedpoint_validation.m">
                <strong>fpga_fixedpoint_validation.m</strong>
                <span>16-bit Q1.15 Fixed-Point vs Double Precision</span>
              </button>
            </div>
          </div>

          <!-- File Upload Drop Zone -->
          <div class="card" id="matlab-upload-area" style="border:2px dashed rgba(0,229,255,0.3);text-align:center;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center">
            <input type="file" id="matlab-file-input" accept=".m,.slx,.mdl,.mat,.csv" style="display:none">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" stroke-width="2" style="margin-bottom:8px"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <div style="font-weight:600;color:#fff;margin-bottom:4px">Upload Custom MATLAB / Simulink File</div>
            <div style="font-size:11px;color:var(--text-muted)">Accepts <code>.m</code>, <code>.slx</code>, <code>.mdl</code>, or <code>.mat</code></div>
          </div>
        </div>

        <!-- Code Viewer & Terminal Output -->
        <div class="grid-2" style="margin-bottom:24px">
          <!-- Code Inspector -->
          <div class="card code-card">
            <div class="code-card-header">
              <span id="matlab-file-title" style="font-family:var(--font-mono);font-size:12px;color:#00e5ff">lfm_matched_filter.m</span>
              <span class="code-badge">MATLAB R2026b</span>
            </div>
            <div id="matlab-code-viewer" class="code-viewer-body"></div>
          </div>

          <!-- Terminal Output -->
          <div class="card term-card">
            <div class="code-card-header">
              <span style="font-family:var(--font-mono);font-size:12px;color:#00c853">Execution Console >></span>
              <span class="code-badge" style="background:rgba(0,200,83,0.15);color:#00c853">ONLINE</span>
            </div>
            <pre id="matlab-terminal-output" class="term-body">>> Ready to execute. Click "Run MATLAB / Simulink Simulation" above.</pre>
          </div>
        </div>

        <!-- Comparison & Residual Error Plots -->
        <div class="plot-grid-2">
          <div class="plot-card">
            <div class="plot-card-header">
              <span class="plot-title">MATLAB Golden Reference vs FPGA Fixed-Point RTL</span>
              <span class="plot-meta">Correlation: 99.98%</span>
            </div>
            <div id="matlab-overlay-plot" class="plot-container" style="height:320px"></div>
          </div>

          <div class="plot-card">
            <div class="plot-card-header">
              <span class="plot-title">Quantization Error Residual (Double vs Q1.15)</span>
              <span class="plot-meta">RMSE: 3.12e-5</span>
            </div>
            <div id="matlab-error-plot" class="plot-container" style="height:320px"></div>
          </div>
        </div>
      </div>
    `;
  }

  /* ============================================================
     7. PAST EXPERIMENTS & BENCHMARKS (with CSV download)
     ============================================================ */
  function renderExperiments() {
    return `
      <div class="page-container">
        <!-- Header -->
        <div class="page-header">
          <div>
            <h1 class="page-title">Past Experiments & Benchmark Trials</h1>
            <p class="page-subtitle">Recorded real-world oceanographic acoustic trial datasets with complete physical parameters and telemetry.</p>
          </div>
          <div class="header-actions">
            <button class="sonar-btn btn-primary btn-sm glow-btn" onclick="Experiments.downloadCSV()">
              📥 Download Dataset as CSV
            </button>
          </div>
        </div>

        <!-- Filter Bar & Search -->
        <div class="filter-search-bar" style="margin-bottom:16px">
          <div class="filter-chips">
            <button class="sonar-btn exp-filter-btn active" data-filter="ALL">All Conditions</button>
            <button class="sonar-btn exp-filter-btn" data-filter="C1">C1 (1–5 MHz in 10 µs)</button>
            <button class="sonar-btn exp-filter-btn" data-filter="C2">C2 (1–4 MHz in 12 µs)</button>
            <button class="sonar-btn exp-filter-btn" data-filter="C3">C3 (1–3 MHz in 8 µs)</button>
            <button class="sonar-btn exp-filter-btn" data-filter="C4">C4 (1–2 MHz in 6 µs)</button>
          </div>

          <div class="search-wrap">
            <input type="text" id="exp-search-input" placeholder="Search basin location, waveform, trial ID..." class="sonar-input">
            <span class="count-badge" id="experiments-count-badge">8 Trials</span>
          </div>
        </div>

        <!-- Experiments Table -->
        <div class="card" style="padding:0;overflow:hidden">
          <div class="table-responsive">
            <table class="table-styled">
              <thead>
                <tr>
                  <th>Trial ID</th>
                  <th>Basin Location & Date</th>
                  <th>Condition</th>
                  <th>Depth & Temp</th>
                  <th>Sound Speed</th>
                  <th>Waveform & Freq</th>
                  <th>Channel SNR</th>
                  <th>Measured Range</th>
                  <th>Peak SNR / Pd</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody id="experiments-table-body">
                <!-- Populated dynamically by Experiments.js -->
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  /* ============================================================
     8. SIMULATION LAB
     ============================================================ */
  function renderSimulationLab() {
    return `
      <div class="page-container">
        <div class="page-header">
          <div>
            <h1 class="page-title">Underwater Acoustic Channel Simulator</h1>
            <p class="page-subtitle">Multi-parameter marine channel modeling: SNR, absorption attenuation, multipath echoes, and propagation delay.</p>
          </div>
        </div>

        <div class="plot-grid-2">
          <div class="plot-card">
            <div class="plot-card-header">
              <span class="plot-title">Simulated RX Echo Signal</span>
              <span class="plot-meta">AWGN Channel</span>
            </div>
            <div id="sim-rx-plot" class="plot-container" style="height:340px"></div>
          </div>

          <div class="plot-card">
            <div class="plot-card-header">
              <span class="plot-title">Cross-Correlation Matched Filter Peak</span>
              <span class="plot-meta">Range Estimation</span>
            </div>
            <div id="sim-mf-plot" class="plot-container" style="height:340px"></div>
          </div>
        </div>
      </div>
    `;
  }

  return {
    renderLanding,
    renderUWAcoustics,
    renderMissionControl,
    renderLiveSonar,
    renderFPGALab,
    renderMATLABValidation,
    renderExperiments,
    renderSimulationLab
  };
})();

/* ============================================================
   SIMULATION LAB CONTROLLER
   ============================================================ */
const SimulationLab = (() => {
  'use strict';

  function init() {
    const chirp = SonarEngine.generateLFM(1000000, 5000000, 0.000010, 25000000);
    const echo = SonarEngine.generateEcho(chirp, 0.000015, 0.25, 12);

    const t_us = echo.time.map(t => t * 1e6);
    SonarPlots.plotWaveform('sim-rx-plot', t_us, echo.signal, {
      title: 'Simulated RX Hydrophone Signal (Echo + AWGN)',
      color: '#ffab00',
      xlabel: 'Time (µs)',
      ylabel: 'Voltage'
    });

    const corr = SonarEngine.crossCorrelationDirect(chirp.signal, echo.signal);
    const lag_us = Array.from(corr.lags).map(l => (l / 25000000) * 1e6);
    SonarPlots.plotCorrelation('sim-mf-plot', lag_us, corr.correlation, {
      title: 'Cross-Correlation Matched Filter Peak (Target Detected @ 15 µs)',
      color: '#00e5ff',
      xlabel: 'Lag Delay (µs)'
    });
  }

  return { init };
})();

