/* ============================================================
   PADDOX Fan Hub — Driver Statistics Enhancements
   Adds live career-win context without altering season standings.
   ============================================================ */
(function initPaddoxDriverCareerWins(){
  'use strict';

  const careerCache = new Map();
  let refreshTimer = 0;
  let lastIdentifier = '';

  function promoteRefreshStylesheet() {
    const link = document.querySelector('link[href*="fanhub-driver-refresh.css"]');
    if (link && link.parentNode === document.head) document.head.appendChild(link);
  }

  function selectedDriverIdentifier() {
    const code = document.querySelector('#drv-selector .drv-pill.on .dp-name')?.textContent?.trim();
    const name = document.querySelector('#drv-card .drv-name')?.textContent?.trim();
    return code || name || '';
  }

  function ensureCareerCard() {
    const grid = document.getElementById('cmp-grid');
    if (!grid) return null;

    let card = grid.querySelector('.career-wins-card');
    if (!card) {
      card = document.createElement('div');
      card.className = 'cmp-c career-wins-card is-loading';
      card.innerHTML = '<div class="cmp-v" data-career-wins>—</div><div class="cmp-l">Overall Wins</div>';
      grid.appendChild(card);
    }
    return card;
  }

  function ensureCareerBar() {
    const bars = document.getElementById('stat-bars');
    if (!bars) return null;

    let row = bars.querySelector('.career-wins-row');
    if (!row) {
      row = document.createElement('div');
      row.className = 'sb-row career-wins-row';
      row.innerHTML = `
        <div class="sb-hd">
          <span class="sb-lbl">Overall Career Wins</span>
          <span class="sb-val" data-career-wins-label>Loading…</span>
        </div>
        <div class="sb-track">
          <div class="sb-fill career-wins-fill" style="width:0%;background:#d7b85f"></div>
        </div>`;
      bars.appendChild(row);
    }
    return row;
  }

  function renderCareerWins(wins, state = 'ready') {
    const card = ensureCareerCard();
    const row = ensureCareerBar();
    const safeWins = Number.isFinite(Number(wins)) ? Number(wins) : null;

    if (card) {
      const value = card.querySelector('[data-career-wins]');
      if (state === 'loading') {
        card.classList.add('is-loading');
        if (value) value.textContent = '—';
      } else if (state === 'error' || safeWins === null) {
        card.classList.remove('is-loading');
        if (value) value.textContent = 'N/A';
      } else {
        card.classList.remove('is-loading');
        if (value) value.textContent = safeWins.toLocaleString('en-IN');
      }
    }

    if (row) {
      const label = row.querySelector('[data-career-wins-label]');
      const fill = row.querySelector('.career-wins-fill');
      if (state === 'loading') {
        if (label) label.textContent = 'Loading…';
        if (fill) fill.style.width = '0%';
      } else if (state === 'error' || safeWins === null) {
        if (label) label.textContent = 'Unavailable';
        if (fill) fill.style.width = '0%';
      } else {
        if (label) label.textContent = `${safeWins.toLocaleString('en-IN')} wins`;
        if (fill) fill.style.width = `${Math.min(100, Math.max(6, safeWins))}%`;
      }
    }
  }

  async function fetchCareerWins(identifier) {
    if (!identifier) return null;
    const key = identifier.toLowerCase();
    if (careerCache.has(key)) return careerCache.get(key);

    const request = fetch(`/api/f1/drivers/${encodeURIComponent(identifier)}/career`, {
      credentials: 'include',
      headers: { Accept: 'application/json' }
    })
      .then(async response => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || payload.success === false) {
          throw new Error(payload.message || 'Career stats unavailable');
        }
        const wins = Number(payload?.data?.career?.wins ?? payload?.career?.wins);
        return Number.isFinite(wins) ? wins : null;
      })
      .catch(error => {
        console.warn('PADDOX career wins lookup failed:', error.message || error);
        careerCache.delete(key);
        return null;
      });

    careerCache.set(key, request);
    return request;
  }

  async function refreshCareerContext() {
    const identifier = selectedDriverIdentifier();
    if (!identifier) return;

    const card = ensureCareerCard();
    ensureCareerBar();

    if (identifier === lastIdentifier && card && !card.classList.contains('is-loading')) return;
    lastIdentifier = identifier;
    renderCareerWins(null, 'loading');

    const wins = await fetchCareerWins(identifier);
    if (identifier !== selectedDriverIdentifier()) return;
    renderCareerWins(wins, wins === null ? 'error' : 'ready');
  }

  function scheduleRefresh() {
    window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(refreshCareerContext, 60);
  }

  function bind() {
    promoteRefreshStylesheet();

    const driverSection = document.getElementById('sec-drivers');
    if (!driverSection) return;

    const observer = new MutationObserver(scheduleRefresh);
    observer.observe(driverSection, { childList: true, subtree: true, characterData: true });

    driverSection.addEventListener('click', event => {
      if (event.target.closest('.drv-pill')) scheduleRefresh();
    });

    scheduleRefresh();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind, { once:true });
  } else {
    bind();
  }
})();


/* ============================================================
   PADDOX Fan Hub — Quotes Repair
   1. Restores the missing canvas footer icon helpers used by the
      quote image generator.
   2. Fixes sticky-tab navigation so a newly selected Fan Hub tab
      always opens from the beginning of its section.
   3. Adds final quote-page layout guards after the cinematic CSS.
   ============================================================ */
(function initPaddoxQuoteRepairs(){
  'use strict';

  function installCanvasIconHelpers() {
    if (typeof window.drawQuoteIconShield !== 'function') {
      window.drawQuoteIconShield = function drawQuoteIconShield(ctx, x, y) {
        ctx.save();
        ctx.translate(x, y);
        ctx.strokeStyle = 'rgba(255,255,255,.86)';
        ctx.fillStyle = 'rgba(232,0,45,.13)';
        ctx.lineWidth = 2.6;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(15, 0);
        ctx.lineTo(28, 5);
        ctx.lineTo(26, 19);
        ctx.quadraticCurveTo(24, 29, 15, 35);
        ctx.quadraticCurveTo(6, 29, 4, 19);
        ctx.lineTo(2, 5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = '#e8002d';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(9, 17);
        ctx.lineTo(13.5, 21.5);
        ctx.lineTo(21.5, 12.5);
        ctx.stroke();
        ctx.restore();
      };
    }

    if (typeof window.drawQuoteIconShare !== 'function') {
      window.drawQuoteIconShare = function drawQuoteIconShare(ctx, x, y) {
        ctx.save();
        ctx.translate(x, y);
        ctx.strokeStyle = 'rgba(255,255,255,.86)';
        ctx.lineWidth = 2.6;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.roundRect?.(0, 8, 30, 25, 7);
        if (typeof ctx.roundRect !== 'function') {
          ctx.rect(0, 8, 30, 25);
        }
        ctx.stroke();

        ctx.strokeStyle = '#e8002d';
        ctx.beginPath();
        ctx.moveTo(15, 20);
        ctx.lineTo(15, 0);
        ctx.moveTo(8, 7);
        ctx.lineTo(15, 0);
        ctx.lineTo(22, 7);
        ctx.stroke();
        ctx.restore();
      };
    }

    if (typeof window.drawQuoteIconStar !== 'function') {
      window.drawQuoteIconStar = function drawQuoteIconStar(ctx, x, y) {
        const outer = 15;
        const inner = 6.5;
        ctx.save();
        ctx.translate(x, y);
        ctx.beginPath();
        for (let i = 0; i < 10; i += 1) {
          const radius = i % 2 === 0 ? outer : inner;
          const angle = -Math.PI / 2 + (Math.PI * i) / 5;
          const px = Math.cos(angle) * radius;
          const py = Math.sin(angle) * radius;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(232,0,45,.22)';
        ctx.strokeStyle = 'rgba(255,255,255,.86)';
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      };
    }
  }

  function absoluteOffsetTop(node) {
    let top = 0;
    let current = node;
    while (current) {
      top += Number(current.offsetTop || 0);
      current = current.offsetParent;
    }
    return top;
  }

  function scrollFanHubToStart(behavior = 'smooth') {
    const tabsBar = document.getElementById('hub-tabs-bar');
    if (!tabsBar) return;

    const navbar = document.getElementById('navbar');
    const navHeight = navbar?.getBoundingClientRect().height || 68;
    const target = Math.max(0, absoluteOffsetTop(tabsBar) - navHeight - 1);
    window.scrollTo({ top: target, behavior });
  }

  function repairTabNavigation() {
    document.querySelectorAll('.hub-tab').forEach(tab => {
      if (tab.dataset.pdxScrollRepair === '1') return;
      tab.dataset.pdxScrollRepair = '1';
      tab.addEventListener('click', () => {
        window.setTimeout(() => scrollFanHubToStart('smooth'), 36);
      });
    });

    document.querySelectorAll('.hub-hero-chips .hero-chip[role="button"]').forEach(chip => {
      if (chip.dataset.pdxScrollRepair === '1') return;
      chip.dataset.pdxScrollRepair = '1';
      chip.addEventListener('click', () => {
        window.setTimeout(() => scrollFanHubToStart('smooth'), 36);
      });
    });
  }

  function installQuoteLayoutGuards() {
    if (document.getElementById('pdx-quote-repair-style')) return;

    const style = document.createElement('style');
    style.id = 'pdx-quote-repair-style';
    style.textContent = `
      body.pdx-fanhub-v2 #sec-quotes{
        scroll-margin-top:170px !important;
      }
      body.pdx-fanhub-v2 #sec-quotes.on{
        padding-top:82px !important;
      }
      body.pdx-fanhub-v2 #sec-quotes .sec-header{
        margin-top:0 !important;
        margin-bottom:26px !important;
      }
      body.pdx-fanhub-v2 #sec-quotes .quote-controls{
        position:relative !important;
        z-index:2 !important;
        margin-bottom:22px !important;
      }
      body.pdx-fanhub-v2 #sec-quotes .quotes-layout{
        position:relative !important;
        z-index:1 !important;
        align-items:start !important;
      }
      body.pdx-fanhub-v2 #sec-quotes .quote-featured,
      body.pdx-fanhub-v2 #sec-quotes .quotes-list{
        min-width:0 !important;
      }
      body.pdx-fanhub-v2 #sec-quotes .qf-premium-card{
        min-height:520px !important;
      }
      body.pdx-fanhub-v2 #sec-quotes .qf-actions{
        position:relative !important;
        z-index:3 !important;
        margin-top:16px !important;
      }
      body.pdx-fanhub-v2 .quote-preview-modal{
        z-index:99999 !important;
      }
      body.pdx-fanhub-v2 .quote-preview-card{
        width:min(600px,94vw) !important;
        max-height:90vh !important;
      }
      body.pdx-fanhub-v2 .quote-preview-frame{
        max-height:62vh !important;
        overflow:auto !important;
      }
      @media(max-width:1080px){
        body.pdx-fanhub-v2 #sec-quotes .quotes-layout{
          grid-template-columns:1fr !important;
        }
      }
      @media(max-width:760px){
        body.pdx-fanhub-v2 #sec-quotes.on{
          padding-top:62px !important;
        }
        body.pdx-fanhub-v2 #sec-quotes .qf-premium-card{
          min-height:0 !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function verifyQuotePreviewRuntime() {
    installCanvasIconHelpers();

    if (typeof window.shareQuoteImage !== 'function') {
      console.warn('PADDOX quote image share handler is not available yet.');
    }
  }

  function bind() {
    installCanvasIconHelpers();
    installQuoteLayoutGuards();
    repairTabNavigation();
    verifyQuotePreviewRuntime();

    const repairStyle = document.getElementById('pdx-quote-repair-style');
    if (repairStyle?.parentNode === document.head) document.head.appendChild(repairStyle);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind, { once:true });
  } else {
    bind();
  }
})();

/* Load the premium quote-canvas renderer after fanhub.js has defined the
   original global builder. This keeps the large existing Fan Hub file intact. */
(function loadPaddoxQuoteCanvasV2(){
  if (document.querySelector('script[data-pdx-quote-canvas-v2]')) return;
  const script = document.createElement('script');
  script.src = 'fanhub-quote-canvas-v2.js?v=QCV2_1';
  script.async = false;
  script.dataset.pdxQuoteCanvasV2 = '1';
  script.onerror = () => console.error('PADDOX Quote Canvas V2 failed to load');
  document.head.appendChild(script);
})();
