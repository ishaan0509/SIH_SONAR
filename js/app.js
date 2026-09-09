/**
 * SONARIS — App Router & Initialization
 */

const App = (() => {
  'use strict';

  let currentPage = 'home';
  let heroCanvasAnimId = null;

  const ROUTES = {
    'home':               { render: Pages.renderLanding,          init: initHeroCanvas,          title: 'Home — SONARIS' },
    'uw-acoustics':       { render: Pages.renderUWAcoustics,      init: () => UWAcoustics.init(), title: 'Underwater Acoustics' },
    'mission-control':    { render: Pages.renderMissionControl,   init: () => MissionControl.init(), title: 'Mission Control' },
    'live-sonar':         { render: Pages.renderLiveSonar,        init: () => LiveSonar.init(),    title: 'Live Sonar' },
    'simulation-lab':     { render: Pages.renderSimulationLab,    init: () => SimulationLab?.init?.(), title: 'Simulation Lab' },
    'fpga-lab':           { render: Pages.renderFPGALab,          init: () => FPGALab.init(),      title: 'FPGA Lab' },
    'matlab-validation':  { render: Pages.renderMATLABValidation, init: () => MATLABValidation.init(), title: 'MATLAB & Simulink Lab' },
    'experiments':        { render: Pages.renderExperiments,      init: () => Experiments.init(),  title: 'Past Experiments' }
  };

  function init() {
    // Init Firebase Auth
    if (window.FirebaseAuth) FirebaseAuth.init();

    // Set up router
    window.addEventListener('hashchange', handleRoute);
    handleRoute();

    // Set up nav clicks
    setupNavClicks();

    // Mobile menu
    setupMobileMenu();

    console.log('%c⚡ SONARIS Adaptive Platform Initialized', 'color: #00e5ff; font-size: 16px; font-weight: bold;');
  }

  function setupNavClicks() {
    document.querySelectorAll('.nav-item[data-page]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const page = item.dataset.page;
        window.location.hash = page;
      });
    });
  }

  function setupMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (menuBtn && sidebar) {
      menuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        if (overlay) overlay.classList.toggle('active');
      });
    }

    if (overlay && sidebar) {
      overlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
      });
    }
  }

  function handleRoute() {
    const hash = window.location.hash.replace('#', '') || 'home';
    navigateTo(hash);
  }

  function navigateTo(page) {
    const route = ROUTES[page];
    if (!route) {
      navigateTo('home');
      return;
    }

    if (heroCanvasAnimId) {
      cancelAnimationFrame(heroCanvasAnimId);
      heroCanvasAnimId = null;
    }

    currentPage = page;

    // Update content
    const app = document.getElementById('app');
    if (app) {
      app.innerHTML = route.render();
    }

    // Update nav active state
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.page === page);
    });

    // Update document title
    document.title = route.title + ' — SONARIS';

    // Run page init
    if (route.init) {
      requestAnimationFrame(() => {
        try {
          route.init();
        } catch (e) {
          console.error(`Page init error (${page}):`, e);
        }
      });
    }

    // Close mobile sidebar
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');

    // Scroll to top
    window.scrollTo(0, 0);
  }

  function initHeroCanvas() {
    const canvas = document.getElementById('hero-acoustic-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let t = 0;
    const particles = [];
    for (let i = 0; i < 45; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 1,
        speed: Math.random() * 0.4 + 0.2,
        phase: Math.random() * Math.PI * 2
      });
    }

    function renderCanvas() {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Acoustic Undulating Wave Grid (Thermocline & Sound Rays)
      const numLines = 5;
      for (let l = 0; l < numLines; l++) {
        ctx.beginPath();
        const baseOffset = (h / (numLines + 1)) * (l + 1);
        const freq = 0.004 + l * 0.001;
        const amp = 15 + l * 6;
        const colorAlpha = 0.12 + (l / numLines) * 0.15;

        for (let x = 0; x <= w; x += 10) {
          const y = baseOffset + Math.sin(x * freq + t * 0.03 + l) * amp + Math.cos(x * 0.002 - t * 0.02) * 8;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.strokeStyle = `rgba(0, 229, 255, ${colorAlpha})`;
        ctx.lineWidth = l === 2 ? 2 : 1.2;
        ctx.stroke();
      }

      // Floating acoustic particles
      particles.forEach(p => {
        p.x += p.speed;
        if (p.x > w) p.x = 0;
        const yOffset = Math.sin(t * 0.04 + p.phase) * 6;
        ctx.fillStyle = 'rgba(0, 191, 165, 0.45)';
        ctx.beginPath();
        ctx.arc(p.x, p.y + yOffset, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      t++;

      // Animate Home Radar Monitor Canvas if present
      const radarCanvas = document.getElementById('home-radar-monitor');
      if (radarCanvas) {
        const rctx = radarCanvas.getContext('2d');
        const rw = radarCanvas.width;
        const rh = radarCanvas.height;
        rctx.clearRect(0, 0, rw, rh);

        const cx = rw / 2;
        const cy = rh / 2 - 15;
        const r = Math.min(cx, cy) - 10;

        // Draw concentric range rings
        rctx.strokeStyle = 'rgba(0, 229, 255, 0.15)';
        rctx.lineWidth = 1;
        for (let i = 1; i <= 3; i++) {
          rctx.beginPath();
          rctx.arc(cx, cy, (r / 3) * i, 0, Math.PI * 2);
          rctx.stroke();
        }

        // Crosshairs
        rctx.beginPath();
        rctx.moveTo(cx - r, cy); rctx.lineTo(cx + r, cy);
        rctx.moveTo(cx, cy - r); rctx.lineTo(cx, cy + r);
        rctx.stroke();

        // Sweep line & Beam
        const sweepAngle = (t * 0.035) % (Math.PI * 2);
        rctx.save();
        rctx.beginPath();
        rctx.moveTo(cx, cy);
        rctx.arc(cx, cy, r, sweepAngle - 0.4, sweepAngle);
        rctx.closePath();
        rctx.fillStyle = 'rgba(0, 229, 255, 0.1)';
        rctx.fill();

        rctx.beginPath();
        rctx.moveTo(cx, cy);
        rctx.lineTo(cx + r * Math.cos(sweepAngle), cy + r * Math.sin(sweepAngle));
        rctx.strokeStyle = '#00e5ff';
        rctx.lineWidth = 2;
        rctx.stroke();
        rctx.restore();

        // Tracked Targets
        const tgts = [
          { a: 0.8, d: 0.65, id: 'TGT-1' },
          { a: 2.7, d: 0.42, id: 'TGT-2' },
          { a: 4.8, d: 0.80, id: 'TGT-3' }
        ];

        tgts.forEach(tg => {
          const tx = cx + tg.d * r * Math.cos(tg.a);
          const ty = cy + tg.d * r * Math.sin(tg.a);
          const diff = Math.abs(((sweepAngle - tg.a + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
          const alpha = diff < 0.5 ? 1.0 : Math.max(0.2, 1.0 - diff / 1.5);

          rctx.fillStyle = `rgba(255, 23, 68, ${alpha})`;
          rctx.beginPath();
          rctx.arc(tx, ty, 4, 0, Math.PI * 2);
          rctx.fill();

          rctx.strokeStyle = `rgba(255, 23, 68, ${alpha * 0.6})`;
          rctx.beginPath();
          rctx.arc(tx, ty, 7, 0, Math.PI * 2);
          rctx.stroke();

          rctx.fillStyle = `rgba(224, 232, 240, ${alpha})`;
          rctx.font = '9px JetBrains Mono, monospace';
          rctx.fillText(tg.id, tx + 8, ty - 2);
        });

        // Live Oscillogram Line at bottom of monitor
        rctx.strokeStyle = 'rgba(0, 200, 83, 0.75)';
        rctx.lineWidth = 1.5;
        rctx.beginPath();
        const baseOy = rh - 20;
        for (let ox = 10; ox < rw - 10; ox += 4) {
          const oy = baseOy + Math.sin(ox * 0.08 + t * 0.15) * 8 * Math.sin(ox * 0.02);
          if (ox === 10) rctx.moveTo(ox, oy);
          else rctx.lineTo(ox, oy);
        }
        rctx.stroke();
      }

      heroCanvasAnimId = requestAnimationFrame(renderCanvas);
    }

    renderCanvas();
  }

  function getCurrentPage() {
    return currentPage;
  }

  return { init, navigateTo, getCurrentPage };
})();

/* ============================================================
   GLOBAL TOAST HELPER
   ============================================================ */
function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/* ============================================================
   DOM READY
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
