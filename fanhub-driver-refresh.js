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
