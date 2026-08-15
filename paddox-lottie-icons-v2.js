/* ============================================================
   PADDOX L2.0 — LOOPING LOTTIEFILES MOTION ICON PACK

   Uses real Lottie JSON animations from the open-source
   iconforest/flutter_animated_icons collection's LottieFiles set.
   The files remain remotely sourced from the public GitHub mirror so PADDOX
   does not depend on temporary LottieFiles preview URLs.

   Motion policy:
   - autoplay + infinite loop
   - bounce playback for micro-interaction assets so loop seams stay smooth
   - hover/focus gently increases speed instead of restarting the animation
   - prefers-reduced-motion stops continuous playback
   ============================================================ */
(function initPaddoxLottieMotionV2(){
  'use strict';

  if (window.__PADDOX_LOTTIE_V2__) return;
  window.__PADDOX_LOTTIE_V2__ = true;

  const RUNTIME_URL = 'https://cdn.jsdelivr.net/npm/@lottiefiles/dotlottie-wc@latest/dist/dotlottie-wc.js';
  const SOURCE = 'https://raw.githubusercontent.com/iconforest/flutter_animated_icons/main/assets/lottiefiles.com/';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let runtimeReady = false;

  /* Real LottieFiles-origin assets. Keep this map centralized so every page
     shares the same icon language. */
  const ICONS = {
    home:        { file:'66441-home-icon.json',                    speed:.62, mode:'bounce' },
    shop:        { file:'48977-shop-icon-animation.json',          speed:.64, mode:'bounce' },
    fanhub:      { file:'37056-community-icon.json',               speed:.58, mode:'bounce' },
    pitwall:     { file:'35729-insights-icon.json',                speed:.66, mode:'bounce' },
    account:     { file:'95473-animated-profile-icon.json',        speed:.62, mode:'bounce' },
    search:      { file:'86895-search-icon-animation.json',        speed:.72, mode:'bounce' },
    cart:        { file:'76018-shopping-cart-icon-animation.json', speed:.62, mode:'bounce' },
    wallpapers:  { file:'86897-gallery-icon-animation.json',       speed:.58, mode:'bounce' },
    drivers:     { file:'95473-animated-profile-icon.json',        speed:.60, mode:'bounce' },
    calendar:    { file:'99827-flipping-calendar-icon.json',       speed:.54, mode:'bounce' },
    quotes:      { file:'59477-message-icon.json',                 speed:.62, mode:'bounce' },
    community:   { file:'37056-community-icon.json',               speed:.58, mode:'bounce' },
    chat:        { file:'95474-animated-chats-icon.json',          speed:.60, mode:'bounce' },
    poll:        { file:'35729-insights-icon.json',                speed:.62, mode:'bounce' },
    leaderboard: { file:'86896-trophy-icon-animation.json',        speed:.58, mode:'bounce' },
    trivia:      { file:'33303-target-icon.json',                  speed:.62, mode:'bounce' },
    feed:        { file:'40251-network-activity-icon.json',        speed:.55, mode:'bounce' },
    refresh:     { file:'39432-repeat-icon-step-by-step.json',     speed:.70, mode:'bounce' },
    back:        { file:'38784-arrow-icon.json',                   speed:.68, mode:'bounce' }
  };

  const SELECTORS = [
    ['.nav-home-icon','home'],
    ['.nav-shop-icon','shop'],
    ['.nav-fanhub-icon','fanhub'],
    ['.nav-pitwall-icon','pitwall'],
    ['.nav-account-icon','account'],
    ['.search-icon-anim','search'],
    ['.search-mini-icon','search'],
    ['.cart-icon-anim','cart'],

    /* Fan Hub hero + sticky tabs */
    ['.fh-ico-wallpapers','wallpapers'],
    ['.fh-ico-drivers','drivers'],
    ['.fh-ico-calendar','calendar'],
    ['.fh-ico-quotes','quotes'],
    ['.fh-ico-community','community'],
    ['.fh-ico-pitwall','pitwall'],
    ['.fh-ico-chat','chat'],

    /* Fan Hub community / chat cards */
    ['.fh-ico-poll','poll'],
    ['.fh-ico-leaderboard','leaderboard'],
    ['.fh-ico-trivia','trivia'],
    ['.fh-ico-feed','feed'],

    /* Pit Wall controls also inherit the same motion language. */
    ['.pit-refresh-icon','refresh'],
    ['.pit-back-icon','back']
  ];

  function currentPageKey(){
    const name = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    if (!name || name === 'index.html') return 'home';
    if (name.startsWith('shop')) return 'shop';
    if (name.startsWith('fanhub')) return 'fanhub';
    if (name.startsWith('pitwall')) return 'pitwall';
    if (name.startsWith('account')) return 'account';
    if (name.startsWith('collectibles')) return 'account';
    return '';
  }

  function sourceFor(key){
    const def = ICONS[key] || ICONS.home;
    return `${SOURCE}${def.file}`;
  }

  function loadRuntime(){
    if (customElements.get('dotlottie-wc')) return Promise.resolve();

    if (!document.querySelector('script[data-pdx-dotlottie-runtime-v2]')) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = RUNTIME_URL;
      script.dataset.pdxDotlottieRuntimeV2 = '1';
      document.head.appendChild(script);
    }

    return Promise.race([
      customElements.whenDefined('dotlottie-wc'),
      new Promise((_, reject) => setTimeout(() => reject(new Error('dotLottie runtime timed out')), 12000))
    ]);
  }

  function makePlayer(key){
    const def = ICONS[key] || ICONS.home;
    const player = document.createElement('dotlottie-wc');
    player.className = 'pdx-lottie-v2-player';
    player.setAttribute('src', sourceFor(key));
    player.setAttribute('speed', String(def.speed));
    player.setAttribute('mode', def.mode || 'bounce');
    player.setAttribute('autoplay', '');
    player.setAttribute('loop', '');
    player.setAttribute('loopCount', '0');
    player.setAttribute('aria-hidden', 'true');
    player.tabIndex = -1;
    return player;
  }

  function setPlayerSpeed(player, multiplier = 1){
    const key = player?.closest('[data-pdx-lottie-v2]')?.dataset.pdxLottieV2 || 'home';
    const base = ICONS[key]?.speed || .62;
    try {
      player?.dotLottie?.setSpeed?.(Math.min(1.2, base * multiplier));
    } catch (_) { /* runtime can still be settling */ }
  }

  function bindMotionAccent(node, player){
    const trigger = node.closest(
      '.pdx-dock-item,.nav-link,.mob-link,.hub-tab,.hero-chip,.comm-card-title,' +
      '.nav-search-btn,.nav-cart-btn,.pdx-chat-room-mark,.pdx-chat-empty-mark,' +
      '.pit-primary,.pit-secondary'
    ) || node;

    if (trigger.dataset.pdxLottieV2Accent === '1') return;
    trigger.dataset.pdxLottieV2Accent = '1';

    trigger.addEventListener('pointerenter', () => setPlayerSpeed(player, 1.45), { passive:true });
    trigger.addEventListener('pointerleave', () => setPlayerSpeed(player, 1), { passive:true });
    trigger.addEventListener('focusin', () => setPlayerSpeed(player, 1.45));
    trigger.addEventListener('focusout', () => setPlayerSpeed(player, 1));
  }

  function upgrade(node, key){
    if (!runtimeReady || !node || node.dataset.pdxLottieV2) return;

    node.dataset.pdxLottieV2 = key;
    node.classList.add('pdx-lottie-v2-icon');

    /* Keep the original icon visible until the actual Lottie has loaded.
       This prevents blank buttons on a slow connection. */
    const player = makePlayer(key);
    node.appendChild(player);

    const markLoaded = () => {
      node.classList.add('pdx-lottie-v2-loaded');
      if (reduceMotion.matches) {
        try { player.dotLottie?.pause?.(); } catch (_) {}
      } else {
        try {
          player.dotLottie?.setLoop?.(true);
          player.dotLottie?.play?.();
        } catch (_) {}
      }
    };

    player.addEventListener('load', markLoaded, { once:true });
    player.addEventListener('error', () => {
      node.classList.remove('pdx-lottie-v2-loaded');
      player.remove();
      delete node.dataset.pdxLottieV2;
    }, { once:true });

    bindMotionAccent(node, player);
  }

  function upgradeAll(root = document){
    if (!runtimeReady || !root) return;

    SELECTORS.forEach(([selector, key]) => {
      if (root.matches?.(selector)) upgrade(root, key);
      root.querySelectorAll?.(selector).forEach(node => upgrade(node, key));
    });

    const dockItems = [];
    if (root.matches?.('.pdx-dock-item')) dockItems.push(root);
    root.querySelectorAll?.('.pdx-dock-item').forEach(item => dockItems.push(item));

    dockItems.forEach(item => {
      const label = String(item.getAttribute('aria-label') || item.querySelector('.pdx-dock-label')?.textContent || '').toLowerCase();
      let key = 'home';
      if (label.includes('shop')) key = 'shop';
      else if (label.includes('fan')) key = 'fanhub';
      else if (label.includes('pit')) key = 'pitwall';
      else if (label.includes('account')) key = 'account';
      const icon = item.querySelector('.pdx-dock-icon');
      if (icon) upgrade(icon, key);
    });
  }

  const DOCK_FALLBACKS = {
    home:'<svg viewBox="0 0 24 24"><path d="M3.5 10.5 12 3.7l8.5 6.8v9.2h-5.4v-6.2H8.9v6.2H3.5z"/></svg>',
    shop:'<svg viewBox="0 0 24 24"><path d="M5.2 8.2h13.6l1 11.3H4.2z"/><path d="M8.4 8.2V6.7a3.6 3.6 0 0 1 7.2 0v1.5"/></svg>',
    fanhub:'<svg viewBox="0 0 24 24"><circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M2.8 19c.5-3.5 2.4-5.3 5.2-5.3s4.7 1.8 5.2 5.3M13.2 15.1c1-.9 2.2-1.3 3.7-1.3 2.4 0 3.8 1.6 4.3 4.5"/></svg>',
    pitwall:'<svg viewBox="0 0 24 24"><path d="M4 18.5a8 8 0 1 1 16 0"/><path d="m12 18.5 4.6-6.2"/></svg>',
    account:'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.5"/><path d="M5.2 20c.5-4.1 2.8-6.2 6.8-6.2s6.3 2.1 6.8 6.2"/></svg>'
  };

  function mountGlobalDock(){
    const pageKey = currentPageKey();
    if (!pageKey) return;

    document.body?.classList.add('paddox-dock-global');

    let dock = document.getElementById('pdx-dock');
    if (!dock) {
      const destinations = [
        ['home','index.html','Home'],
        ['shop','shop.html','Shop'],
        ['fanhub','fanhub.html','Fan Hub'],
        ['pitwall','pitwall.html','Pit Wall'],
        ['account','account.html','Account']
      ];

      dock = document.createElement('nav');
      dock.id = 'pdx-dock';
      dock.className = 'pdx-dock-outer';
      dock.setAttribute('aria-label','Primary navigation');
      dock.innerHTML = `<div class="pdx-dock-panel" id="pdx-dock-panel" role="toolbar" aria-label="PADDOX destinations">${destinations.map(([key,href,label]) => {
        const active = key === pageKey;
        return `<a href="${href}" class="pdx-dock-item${active ? ' active' : ''}" aria-label="${label}"${active ? ' aria-current="page"' : ''} aria-describedby="pdx-dock-label-${key}"><span class="pdx-dock-icon" aria-hidden="true">${DOCK_FALLBACKS[key]}</span><span class="pdx-dock-label" id="pdx-dock-label-${key}" role="tooltip">${label}</span></a>`;
      }).join('')}</div>`;

      const navbar = document.getElementById('navbar');
      if (navbar) navbar.insertAdjacentElement('afterend', dock);
      else document.body.appendChild(dock);
    }

    dock.querySelectorAll('.pdx-dock-item').forEach(item => {
      const href = String(item.getAttribute('href') || '').toLowerCase();
      const active =
        (pageKey === 'home' && href.includes('index')) ||
        (pageKey === 'shop' && href.includes('shop')) ||
        (pageKey === 'fanhub' && href.includes('fanhub')) ||
        (pageKey === 'pitwall' && href.includes('pitwall')) ||
        (pageKey === 'account' && href.includes('account'));
      item.classList.toggle('active', active);
      if (active) item.setAttribute('aria-current','page');
      else item.removeAttribute('aria-current');
    });

    initDockMagnification(dock.querySelector('.pdx-dock-panel'));
    if (runtimeReady) upgradeAll(dock);
  }

  function initDockMagnification(panel){
    if (!panel || panel.dataset.pdxMagnifyReady === '1' || panel.dataset.pdxV2Magnify === '1') return;
    panel.dataset.pdxV2Magnify = '1';
    panel.dataset.pdxMagnifyReady = '1';

    const items = [...panel.querySelectorAll('.pdx-dock-item')];
    if (!items.length) return;

    const finePointer = matchMedia('(hover:hover) and (pointer:fine)');
    const BASE = 50, MAX = 70, DISTANCE = 180;
    const current = items.map(() => BASE);
    const targets = items.map(() => BASE);
    let frame = 0;

    const render = () => {
      let moving = false;
      items.forEach((item,index) => {
        const diff = targets[index] - current[index];
        current[index] += diff * (reduceMotion.matches ? 1 : .23);
        if (Math.abs(diff) > .08) moving = true;
        else current[index] = targets[index];
        item.style.setProperty('--pdx-dock-size', `${current[index].toFixed(2)}px`);
      });
      frame = moving ? requestAnimationFrame(render) : 0;
    };

    const schedule = () => { if (!frame) frame = requestAnimationFrame(render); };
    const reset = () => { targets.fill(BASE); schedule(); };

    panel.addEventListener('pointermove', event => {
      if (!finePointer.matches) return;
      items.forEach((item,index) => {
        const rect = item.getBoundingClientRect();
        const center = rect.left + rect.width / 2;
        const p = Math.max(0, 1 - Math.abs(event.clientX - center) / DISTANCE);
        const eased = 1 - Math.pow(1 - p, 3);
        targets[index] = BASE + (MAX - BASE) * eased;
      });
      schedule();
    }, { passive:true });
    panel.addEventListener('pointerleave', reset, { passive:true });
  }

  function removeLegacyFanSignal(){
    document.getElementById('pdx-fanhub-showcase')?.remove();
  }

  function observeDynamicIcons(){
    if (!('MutationObserver' in window) || document.documentElement.dataset.pdxLottieV2Observer === '1') return;
    document.documentElement.dataset.pdxLottieV2Observer = '1';

    new MutationObserver(records => {
      records.forEach(record => record.addedNodes.forEach(node => {
        if (!(node instanceof Element)) return;

        if (node.id === 'pdx-fanhub-showcase') {
          node.remove();
          return;
        }
        node.querySelector?.('#pdx-fanhub-showcase')?.remove();

        if (runtimeReady) upgradeAll(node);
        if (node.id === 'pdx-dock' || node.querySelector?.('#pdx-dock')) {
          initDockMagnification(document.querySelector('#pdx-dock-panel'));
        }
      }));
    }).observe(document.body, { childList:true, subtree:true });
  }

  function applyReducedMotion(){
    document.querySelectorAll('.pdx-lottie-v2-player').forEach(player => {
      try {
        if (reduceMotion.matches) player.dotLottie?.pause?.();
        else player.dotLottie?.play?.();
      } catch (_) {}
    });
  }

  reduceMotion.addEventListener?.('change', applyReducedMotion);

  function onDomReady(){
    mountGlobalDock();
    removeLegacyFanSignal();
    observeDynamicIcons();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', onDomReady, { once:true });
  else onDomReady();

  loadRuntime().then(() => {
    runtimeReady = true;
    upgradeAll(document);
    mountGlobalDock();
    document.documentElement.classList.add('pdx-lottie-v2-ready');
  }).catch(error => {
    console.warn('PADDOX Lottie V2 runtime unavailable; static fallbacks retained.', error?.message || error);
  });
})();
