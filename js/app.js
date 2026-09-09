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
    const radarCanvas = document.getElementById('home-radar-monitor');
    if (!radarCanvas) return;
    const rctx = radarCanvas.getContext('2d');

    let t = 0;
    const targets = [
      { angle: 0.82, dist: 0.65, id: 'TGT-1: 4,850m', type: 'Submersible' },
      { angle: 2.65, dist: 0.38, id: 'TGT-2: 2,720m', type: 'Seamount' },
      { angle: 4.88, dist: 0.82, id: 'TGT-3: 6,100m', type: 'Biologic' }
    ];

    function renderRadar() {
      const rw = radarCanvas.width;
      const rh = radarCanvas.height;

      // Dark background with slight phosphor trail effect
      rctx.fillStyle = '#060a14';
      rctx.fillRect(0, 0, rw, rh);

      const cx = rw / 2;
      const cy = rh / 2 - 12;
      const maxR = Math.min(cx, cy) - 14;

      // Subtle background grid
      rctx.strokeStyle = 'rgba(0, 229, 255, 0.05)';
      rctx.lineWidth = 1;
      for (let x = 0; x < rw; x += 20) {
        rctx.beginPath(); rctx.moveTo(x, 0); rctx.lineTo(x, rh); rctx.stroke();
      }
      for (let y = 0; y < rh; y += 20) {
        rctx.beginPath(); rctx.moveTo(0, y); rctx.lineTo(rw, y); rctx.stroke();
      }

      // Concentric Range Rings (1000m, 2500m, 5000m)
      const ringDistances = ['1.5 km', '3.0 km', '5.0 km'];
      for (let i = 1; i <= 3; i++) {
        const ringR = (maxR / 3) * i;
        rctx.beginPath();
        rctx.arc(cx, cy, ringR, 0, Math.PI * 2);
        rctx.strokeStyle = i === 3 ? 'rgba(0, 229, 255, 0.35)' : 'rgba(0, 229, 255, 0.18)';
        rctx.lineWidth = i === 3 ? 1.5 : 1;
        rctx.stroke();

        // Range ring label
        rctx.fillStyle = 'rgba(0, 229, 255, 0.45)';
        rctx.font = '9px JetBrains Mono, monospace';
        rctx.fillText(ringDistances[i - 1], cx + ringR - 22, cy - 4);
      }

      // Crosshair Cardinal Axes & Degree ticks
      rctx.strokeStyle = 'rgba(0, 229, 255, 0.2)';
      rctx.lineWidth = 1;
      rctx.beginPath();
      rctx.moveTo(cx - maxR, cy); rctx.lineTo(cx + maxR, cy);
      rctx.moveTo(cx, cy - maxR); rctx.lineTo(cx, cy + maxR);
      rctx.stroke();

      // Cardinal Labels
      rctx.fillStyle = 'rgba(0, 229, 255, 0.7)';
      rctx.font = 'bold 9px JetBrains Mono, monospace';
      rctx.textAlign = 'center';
      rctx.fillText('000° N', cx, cy - maxR - 4);
      rctx.fillText('090° E', cx + maxR + 18, cy + 3);
      rctx.fillText('180° S', cx, cy + maxR + 12);
      rctx.fillText('270° W', cx - maxR - 18, cy + 3);
      rctx.textAlign = 'left';

      // 360° Rotating Sweep Line & Trailing Beam
      const sweepAngle = (t * 0.032) % (Math.PI * 2);
      const beamSegments = 16;
      for (let b = 0; b < beamSegments; b++) {
        const aStart = sweepAngle - (b / beamSegments) * 0.45;
        const aEnd = sweepAngle - ((b + 1) / beamSegments) * 0.45;
        const alpha = Math.max(0, (1 - b / beamSegments) * 0.22);
        rctx.beginPath();
        rctx.moveTo(cx, cy);
        rctx.arc(cx, cy, maxR, aStart, aEnd, true);
        rctx.closePath();
        rctx.fillStyle = `rgba(0, 229, 255, ${alpha})`;
        rctx.fill();
      }

      // Main Sweep Ray
      rctx.beginPath();
      rctx.moveTo(cx, cy);
      rctx.lineTo(cx + maxR * Math.cos(sweepAngle), cy + maxR * Math.sin(sweepAngle));
      rctx.strokeStyle = '#00e5ff';
      rctx.lineWidth = 2;
      rctx.shadowColor = '#00e5ff';
      rctx.shadowBlur = 8;
      rctx.stroke();
      rctx.shadowBlur = 0;

      // Sonar Transducer Center Blip
      rctx.fillStyle = '#00e5ff';
      rctx.beginPath();
      rctx.arc(cx, cy, 3, 0, Math.PI * 2);
      rctx.fill();

      // Tracked Targets with Phosphor Persistence & Pulse Rings
      targets.forEach((tg, idx) => {
        const tx = cx + tg.dist * maxR * Math.cos(tg.angle);
        const ty = cy + tg.dist * maxR * Math.sin(tg.angle);
        const angleDiff = Math.abs(((sweepAngle - tg.angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
        const isHit = angleDiff < 0.25;
        const alpha = isHit ? 1.0 : Math.max(0.25, 1.0 - angleDiff / 2.2);

        const color = idx === 0 ? '#ff1744' : (idx === 1 ? '#ffab00' : '#00e5ff');

        // Target center dot
        rctx.fillStyle = color;
        rctx.beginPath();
        rctx.arc(tx, ty, 3.5, 0, Math.PI * 2);
        rctx.fill();

        // Pulsing acquisition ring
        if (isHit) {
          rctx.strokeStyle = color;
          rctx.lineWidth = 1.5;
          rctx.beginPath();
          rctx.arc(tx, ty, 6 + (t % 15) * 0.8, 0, Math.PI * 2);
          rctx.stroke();
        }

        // Target HUD Callout Tag
        rctx.fillStyle = `rgba(224, 232, 240, ${alpha})`;
        rctx.font = '8.5px JetBrains Mono, monospace';
        rctx.fillText(tg.id, tx + 7, ty - 3);
      });

      // Bottom Live Hydrophone Receiver Oscillogram
      const baseOy = rh - 16;
      rctx.fillStyle = 'rgba(8, 12, 22, 0.8)';
      rctx.fillRect(8, baseOy - 14, rw - 16, 26);
      rctx.strokeStyle = 'rgba(0, 229, 255, 0.15)';
      rctx.strokeRect(8, baseOy - 14, rw - 16, 26);

      rctx.fillStyle = '#8899aa';
      rctx.font = '8px JetBrains Mono, monospace';
      rctx.fillText('CH-1 RX HYDROPHONE:', 14, baseOy - 4);

      rctx.strokeStyle = '#00c853';
      rctx.lineWidth = 1.2;
      rctx.beginPath();
      for (let ox = 110; ox < rw - 14; ox += 3) {
        const sig = Math.sin(ox * 0.12 + t * 0.2) * 6 * Math.sin(ox * 0.03) + (Math.random() - 0.5) * 1.5;
        const oy = baseOy - 1 + sig;
        if (ox === 110) rctx.moveTo(ox, oy);
        else rctx.lineTo(ox, oy);
      }
      rctx.stroke();

      t++;
      heroCanvasAnimId = requestAnimationFrame(renderRadar);
    }

    renderRadar();
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
