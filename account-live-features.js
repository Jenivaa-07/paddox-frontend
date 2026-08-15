/* ============================================================
   PADDOX ACCOUNT — live Collection + Fantasy ML
   ============================================================ */
(function initAccountLiveFeatures(){
  'use strict';

  if (window.__PADDOX_ACCOUNT_LIVE_FEATURES__) return;
  window.__PADDOX_ACCOUNT_LIVE_FEATURES__ = true;
  if (!/\/account(?:\.html)?\/?$/i.test(window.location.pathname)) return;

  let collectionLoading = false;
  let fantasyLoading = false;
  let fantasyLoadedAt = 0;
  let socket = null;

  const esc = (value = '') => String(value)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#039;');

  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

  const formatDate = value => {
    const date = new Date(value || '');
    if (Number.isNaN(date.getTime())) return 'Just unlocked';
    return date.toLocaleDateString(undefined,{ day:'2-digit',month:'short',year:'numeric' });
  };

  const formatTime = value => {
    const date = new Date(value || '');
    if (Number.isNaN(date.getTime())) return 'Live now';
    return date.toLocaleTimeString(undefined,{ hour:'2-digit',minute:'2-digit' });
  };

  async function api(path, options = {}) {
    const response = await fetch(`/api${path}`, {
      credentials:'include',
      cache:'no-store',
      ...options,
      headers:{
        ...(options.body ? {'Content-Type':'application/json'} : {}),
        ...(options.headers || {})
      }
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload.success === false) {
      const error = new Error(payload.message || payload.detail || `Request failed (${response.status})`);
      error.status = response.status;
      error.code = payload.code || '';
      error.detail = payload.detail || '';
      throw error;
    }
    return payload.data || payload;
  }

  function showLiveToast(message){
    if (typeof window.showToast === 'function') {
      window.showToast(message);
      return;
    }
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'),2600);
  }

  function renderCollection(data){
    const grid = document.getElementById('collection-grid');
    if (!grid) return;

    const summary = data.summary || {};
    const items = Array.isArray(data.items) ? data.items : [];
    const nextUnlocks = Array.isArray(data.nextUnlocks) ? data.nextUnlocks : [];

    const earnedEl = document.getElementById('col-summary-earned');
    const latestEl = document.getElementById('col-summary-latest');
    const sharedEl = document.getElementById('col-summary-shared');
    if (earnedEl) earnedEl.textContent = Number(summary.earned || 0).toLocaleString();
    if (latestEl) latestEl.textContent = summary.latest || '—';
    if (sharedEl) sharedEl.textContent = Number(summary.shared || 0).toLocaleString();

    const livebar = `
      <div class="pdx-collection-livebar">
        <span class="pdx-live-label">Live achievement sync</span>
        <span class="pdx-live-time">${esc(summary.fanTier || 'Regular')} · ${Number(summary.fanPoints || 0).toLocaleString()} pts · synced ${esc(formatTime(data.syncedAt))}</span>
      </div>`;

    const earnedCards = items.map(item => `
      <article class="pdx-collectible-card" data-rarity="${esc(item.rarity || 'Common')}">
        <div class="pdx-collectible-top">
          <span class="pdx-collectible-icon" aria-hidden="true">${esc(item.icon || '🏁')}</span>
          <span class="pdx-collectible-rarity">${esc(item.rarity || 'Common')}</span>
        </div>
        <h3>${esc(item.title || 'PADDOX Collectible')}</h3>
        <p>${esc(item.description || '')}</p>
        <div class="pdx-collectible-meta">Unlocked ${esc(formatDate(item.unlockedAt))} · Shared ${Number(item.sharedCount || 0)}×</div>
        <button class="pdx-collectible-share" type="button" data-collectible-share="${esc(item.code)}" data-collectible-title="${esc(item.title)}" data-collectible-description="${esc(item.description)}">Share collectible</button>
      </article>`).join('');

    const lockedCards = nextUnlocks.map(item => `
      <article class="pdx-next-unlock">
        <small>Next unlock · ${esc(item.rarity || 'Common')}</small>
        <h4>${esc(item.icon || '🏁')} ${esc(item.title || '')}</h4>
        <p>${esc(item.description || '')}</p>
        <div class="pdx-progress-track"><div class="pdx-progress-fill" style="width:${Math.max(0,Math.min(100,Number(item.progressPercent || 0)))}%"></div></div>
        <div class="pdx-progress-copy">${esc(item.progressLabel || '')}</div>
      </article>`).join('');

    grid.innerHTML = `
      <div class="pdx-collection-section-title">${items.length ? 'Earned collectibles' : 'No earned collectibles yet'}</div>
      ${earnedCards || '<div class="pdx-next-unlock"><small>Garage empty</small><h4>Start earning</h4><p>Poll votes, trivia, community posts, downloads, paid orders and Fan Points unlock collectibles automatically.</p></div>'}
      ${nextUnlocks.length ? '<div class="pdx-collection-section-title">Closest next unlocks</div>' + lockedCards : ''}`;

    const shell = grid.closest('.collection-premium-shell');
    if (shell && !shell.querySelector('.pdx-collection-livebar')) {
      shell.insertAdjacentHTML('afterbegin', livebar);
    } else if (shell) {
      shell.querySelector('.pdx-collection-livebar')?.remove();
      shell.insertAdjacentHTML('afterbegin', livebar);
    }
  }

  async function loadCollection(){
    if (collectionLoading) return;
    const grid = document.getElementById('collection-grid');
    if (!grid) return;
    collectionLoading = true;
    grid.innerHTML = '<div class="pdx-live-loading">Syncing your real PADDOX activity and achievements…</div>';
    try {
      const data = await api('/collection/me');
      renderCollection(data);
      if (Number(data.summary?.newlyUnlocked || 0) > 0) {
        showLiveToast(`🏁 ${data.summary.newlyUnlocked} new collectible${data.summary.newlyUnlocked === 1 ? '' : 's'} unlocked`);
      }
    } catch (err) {
      grid.innerHTML = `<div class="pdx-live-error">Could not sync My Collection: ${esc(err.message)}</div>`;
    } finally {
      collectionLoading = false;
    }
  }

  async function shareCollectible(button){
    const code = button.dataset.collectibleShare || '';
    const title = button.dataset.collectibleTitle || 'PADDOX Collectible';
    const description = button.dataset.collectibleDescription || '';
    if (!code) return;

    const text = `🏁 PADDOX // ${title}\n${description}\nUnlocked in my PADDOX Fan Garage.`;
    try {
      if (navigator.share) {
        await navigator.share({ title:`PADDOX — ${title}`, text });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        showLiveToast('✅ Collectible share text copied');
      }
      await api(`/collection/${encodeURIComponent(code)}/share`,{ method:'POST', body:'{}' });
      await loadCollection();
    } catch (err) {
      if (err?.name === 'AbortError') return;
      showLiveToast(`❌ ${err.message || 'Could not share collectible'}`);
    }
  }

  function renderFantasy(data){
    const container = document.getElementById('fantasy-results-container');
    if (!container) return;
    const lineup = Array.isArray(data.lineup) ? data.lineup : [];
    const race = data.race || {};
    const model = data.model || {};
    const quality = data.inputQuality || {};

    const cards = lineup.map((driver,index) => `
      <article class="pdx-fantasy-card">
        <div class="pdx-fantasy-rank">P${Number(driver.predictedRank || index + 1)}</div>
        <h3>${esc(driver.fullName || driver.code || 'Driver')}</h3>
        <div class="pdx-fantasy-team">${esc(driver.team || '')}</div>
        <div class="pdx-fantasy-points">${Number(driver.predictedFantasyPoints || 0).toFixed(1)}<span>projected pts</span></div>
        <div class="pdx-fantasy-inputs">Q input ${Number(driver.qualifyingPosition || 0)} · ${Number(driver.rollingAvgFinish || 0).toFixed(1)} recent avg<br>${esc(driver.inputSignal || '')}</div>
      </article>`).join('');

    container.innerHTML = `
      <div class="pdx-fantasy-livebar">
        <span class="pdx-live-label">Live F1 → Random Forest</span>
        <span class="pdx-live-time">Generated ${esc(formatTime(data.generatedAt))}${data.cached ? ' · 90s cache' : ''}</span>
      </div>
      <div class="pdx-fantasy-meta">
        <div class="pdx-fantasy-meta-card"><small>Target race</small><strong>${esc(race.name || 'Next Grand Prix')}</strong></div>
        <div class="pdx-fantasy-meta-card pdx-fantasy-quality" data-quality="${esc(quality.confidence || 'medium')}"><small>Input quality</small><strong>${esc(quality.label || 'PROVISIONAL')}</strong></div>
        <div class="pdx-fantasy-meta-card"><small>ML algorithm</small><strong>${esc(model.algorithm || 'Random Forest')}</strong></div>
        <div class="pdx-fantasy-meta-card"><small>Model version</small><strong>${esc(model.modelVersion || 'unknown')}</strong></div>
      </div>
      <div class="pdx-fantasy-note">${esc(quality.note || '')} Sources: ${(data.sources || []).map(esc).join(' + ')}.</div>
      <div class="pdx-fantasy-grid">${cards || '<div class="pdx-live-error">The model returned no driver predictions.</div>'}</div>`;
  }

  function fantasyLoadingMessage(container, text, detail = ''){
    if (!container) return;
    container.innerHTML = `
      <div class="pdx-live-loading">
        <strong>${esc(text)}</strong>
        ${detail ? `<div style="margin-top:7px;opacity:.72">${esc(detail)}</div>` : ''}
      </div>`;
  }

  async function loadFantasy(force = true){
    if (fantasyLoading) return;
    const container = document.getElementById('fantasy-results-container');
    if (!container) return;

    fantasyLoading = true;
    let stageTimer1 = null;
    let stageTimer2 = null;

    const startProgressMessages = () => {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      fantasyLoadingMessage(container,
        'Fetching current F1 inputs and running the trained Random Forest model…',
        'Live qualifying, recent finishes and constructor data are being prepared.'
      );
      stageTimer1 = setTimeout(() => {
        fantasyLoadingMessage(container,
          'Waking PADDOX AI on Render…',
          'A cold AI instance can take a little longer on the first prediction.'
        );
      }, 7000);
      stageTimer2 = setTimeout(() => {
        fantasyLoadingMessage(container,
          'Loading the trained fantasy model…',
          'The real Random Forest artifact is being prepared — no fake fallback is being used.'
        );
      }, 22000);
    };

    try {
      startProgressMessages();

      let lastError = null;
      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          const suffix = force || attempt > 0 ? '?refresh=1' : '';
          const data = await api(`/fantasy/next-race${suffix}`);
          fantasyLoadedAt = Date.now();
          clearTimeout(stageTimer1);
          clearTimeout(stageTimer2);
          renderFantasy(data);
          return;
        } catch (err) {
          lastError = err;
          const retryable = err.status === 503 && attempt === 0;
          if (!retryable) throw err;

          clearTimeout(stageTimer1);
          clearTimeout(stageTimer2);
          fantasyLoadingMessage(container,
            'PADDOX AI is warming up — retrying automatically…',
            err.code === 'MODEL_NOT_READY'
              ? 'The trained model is still loading inside the AI service.'
              : 'The first request woke the AI service. One automatic retry is starting.'
          );
          await delay(3500);
          startProgressMessages();
        }
      }

      if (lastError) throw lastError;
    } catch (err) {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      const detail = err.detail ? `<br><span style="opacity:.72">${esc(err.detail)}</span>` : '';
      container.innerHTML = `
        <div class="pdx-live-error">
          <strong>Fantasy ML could not start.</strong><br>
          ${esc(err.message)}${detail}<br><br>
          The page did not substitute fake predictions. If this remains after the fresh Render deploy, check paddox-ai model readiness.
        </div>`;
    } finally {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      fantasyLoading = false;
    }
  }

  function tuneFantasyCopy(){
    const page = document.getElementById('page-fantasy');
    if (!page) return;
    const card = page.querySelector('.set-card');
    const copy = card?.querySelector('p');
    if (copy) copy.textContent = 'Real F1 qualifying and recent race results are converted into the exact features expected by PADDOX’s trained Random Forest fantasy model.';
    const button = card?.querySelector('.save-btn');
    if (button) button.textContent = 'Run Live ML Prediction';
    const title = card?.querySelector('.set-title');
    if (title) {
      title.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE && /My AI Predicted Lineup/i.test(node.textContent || '')) {
          node.textContent = ' Live ML Predicted Lineup';
        }
      });
    }
  }

  function bindNavigation(){
    document.querySelector('.acc-nav-item[data-page="collection"]')?.addEventListener('click',() => setTimeout(loadCollection,0));
    document.querySelector('.acc-nav-item[data-page="fantasy"]')?.addEventListener('click',() => setTimeout(() => {
      if (!fantasyLoadedAt || Date.now() - fantasyLoadedAt > 90 * 1000) loadFantasy(false);
    },0));
  }

  function bindGlobalClicks(){
    document.addEventListener('click',event => {
      const share = event.target instanceof Element ? event.target.closest('[data-collectible-share]') : null;
      if (share) {
        event.preventDefault();
        shareCollectible(share);
      }
    });
  }

  function bindSocket(){
    if (typeof window.io !== 'function') return;
    try {
      socket = window.io('https://paddox-backend.onrender.com', {
        withCredentials:true,
        transports:['websocket','polling'],
        reconnection:true
      });
      socket.on('collection:unlocked',item => {
        showLiveToast(`🏆 Unlocked: ${item?.title || 'new collectible'}`);
        if (document.getElementById('page-collection')?.classList.contains('on')) loadCollection();
      });
      socket.on('collection:shared',() => {
        if (document.getElementById('page-collection')?.classList.contains('on')) loadCollection();
      });
      socket.on('race:session-update',() => {
        if (document.getElementById('page-fantasy')?.classList.contains('on') && Date.now() - fantasyLoadedAt > 60 * 1000) {
          loadFantasy(false);
        }
      });
    } catch (_) {}
  }

  function boot(){
    tuneFantasyCopy();
    bindNavigation();
    bindGlobalClicks();
    bindSocket();

    /* account.js defines a placeholder function. Replace it after the page's
       original script has executed. */
    window.fetchFantasyPredictions = () => loadFantasy(true);
    window.loadPaddoxCollection = loadCollection;

    if (document.getElementById('page-collection')?.classList.contains('on')) loadCollection();
    if (document.getElementById('page-fantasy')?.classList.contains('on')) loadFantasy(false);

    window.setInterval(() => {
      if (document.hidden) return;
      if (document.getElementById('page-collection')?.classList.contains('on')) loadCollection();
      if (document.getElementById('page-fantasy')?.classList.contains('on') && Date.now() - fantasyLoadedAt > 90 * 1000) loadFantasy(false);
    },90 * 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded',() => setTimeout(boot,0),{ once:true });
  } else {
    setTimeout(boot,0);
  }
})();
