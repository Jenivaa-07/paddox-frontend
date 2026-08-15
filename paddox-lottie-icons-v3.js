/* ============================================================
   PADDOX L3.0 — REAL LOOPING LOTTIEFILES ICON ENGINE

   Fixes the L2 visibility bug by listening to lifecycle events on the
   underlying dotLottie instance exposed by <dotlottie-wc>, not on the
   wrapper element itself.

   Animation source: public LottieFiles-origin JSON assets mirrored by the
   MIT-licensed iconforest/flutter_animated_icons project.
   Runtime: official @lottiefiles/dotlottie-wc web component.
   ============================================================ */
(function initPaddoxLottieMotionV3(){
  'use strict';

  if (window.__PADDOX_LOTTIE_V3__) return;
  window.__PADDOX_LOTTIE_V3__ = true;

  const RUNTIME_URL = 'https://unpkg.com/@lottiefiles/dotlottie-wc@latest/dist/dotlottie-wc.js';
  const SOURCE = 'https://raw.githubusercontent.com/iconforest/flutter_animated_icons/main/assets/lottiefiles.com/';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let runtimeReady = false;

  const ICONS = {
    home:        { file:'66441-home-icon.json',                    speed:.62, mode:'bounce' },
    shop:        { file:'38787-bag-icon.json',                     speed:.58, mode:'bounce' },
    fanhub:      { file:'37056-community-icon.json',               speed:.56, mode:'bounce' },
    pitwall:     { file:'35729-insights-icon.json',                speed:.62, mode:'bounce' },
    account:     { file:'95473-animated-profile-icon.json',        speed:.58, mode:'bounce' },
    search:      { file:'86895-search-icon-animation.json',        speed:.72, mode:'bounce' },
    cart:        { file:'76018-shopping-cart-icon-animation.json', speed:.60, mode:'bounce' },
    wallpapers:  { file:'86897-gallery-icon-animation.json',       speed:.56, mode:'bounce' },
    drivers:     { file:'95473-animated-profile-icon.json',        speed:.58, mode:'bounce' },
    calendar:    { file:'99827-flipping-calendar-icon.json',       speed:.50, mode:'bounce' },
    quotes:      { file:'59477-message-icon.json',                 speed:.58, mode:'bounce' },
    community:   { file:'37056-community-icon.json',               speed:.56, mode:'bounce' },
    chat:        { file:'95474-animated-chats-icon.json',          speed:.56, mode:'bounce' },
    poll:        { file:'35729-insights-icon.json',                speed:.58, mode:'bounce' },
    leaderboard: { file:'86896-trophy-icon-animation.json',        speed:.54, mode:'bounce' },
    trivia:      { file:'33303-target-icon.json',                  speed:.58, mode:'bounce' },
    feed:        { file:'40251-network-activity-icon.json',        speed:.52, mode:'bounce' },
    refresh:     { file:'39432-repeat-icon-step-by-step.json',     speed:.66, mode:'bounce' },
    back:        { file:'38784-arrow-icon.json',                   speed:.64, mode:'bounce' }
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
    ['.fh-ico-wallpapers','wallpapers'],
    ['.fh-ico-drivers','drivers'],
    ['.fh-ico-calendar','calendar'],
    ['.fh-ico-quotes','quotes'],
    ['.fh-ico-community','community'],
    ['.fh-ico-pitwall','pitwall'],
    ['.fh-ico-chat','chat'],
    ['.fh-ico-poll','poll'],
    ['.fh-ico-leaderboard','leaderboard'],
    ['.fh-ico-trivia','trivia'],
    ['.fh-ico-feed','feed'],
    ['.pit-refresh-icon','refresh'],
    ['.pit-back-icon','back']
  ];

  function sourceFor(key){
    return SOURCE + (ICONS[key] || ICONS.home).file;
  }

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

  function loadRuntime(){
    if (customElements.get('dotlottie-wc')) return Promise.resolve();

    if (!document.querySelector('script[data-pdx-dotlottie-runtime-v3]')) {
      const runtime = document.createElement('script');
      runtime.type = 'module';
      runtime.src = RUNTIME_URL;
      runtime.dataset.pdxDotlottieRuntimeV3 = '1';
      document.head.appendChild(runtime);
    }

    return Promise.race([
      customElements.whenDefined('dotlottie-wc'),
      new Promise((_, reject) => setTimeout(() => reject(new Error('dotLottie runtime timed out')), 15000))
    ]);
  }

  function createPlayer(key){
    const def = ICONS[key] || ICONS.home;
    const player = document.createElement('dotlottie-wc');
    player.className = 'pdx-lottie-v3-player';
    player.setAttribute('src', sourceFor(key));
    player.setAttribute('autoplay', '');
    player.setAttribute('loop', '');
    player.setAttribute('speed', String(def.speed));
    player.setAttribute('mode', def.mode || 'bounce');
    player.setAttribute('aria-hidden', 'true');
    player.tabIndex = -1;
    return player;
  }

  function failPlayer(node, player){
    node.classList.remove('pdx-lottie-v3-loaded');
    node.classList.add('pdx-lottie-v3-failed');
    player.remove();
    delete node.dataset.pdxLottieV3;
  }

  function revealPlayer(node, player, instance, key){
    if (!node.isConnected || !player.isConnected) return;
    node.classList.add('pdx-lottie-v3-loaded');
    node.classList.remove('pdx-lottie-v3-failed');

    try {
      instance.setLoop?.(true);
      instance.setMode?.((ICONS[key] || ICONS.home).mode || 'bounce');
      instance.setSpeed?.((ICONS[key] || ICONS.home).speed || .6);
      if (reduceMotion.matches) instance.pause?.();
      else instance.play?.();
    } catch (_) {}
  }

  function wirePlayer(node, player, key){
    let attempts = 0;
    let wired = false;

    const attach = () => {
      if (!node.isConnected || !player.isConnected) return;
      const instance = player.dotLottie;

      if (!instance) {
        attempts += 1;
        if (attempts < 240) requestAnimationFrame(attach);
        else failPlayer(node, player);
        return;
      }
      if (wired) return;
      wired = true;

      let revealed = false;
      const show = () => {
        if (revealed) return;
        revealed = true;
        revealPlayer(node, player, instance, key);
      };
      const fail = () => failPlayer(node, player);

      /* dotLottie lifecycle events are emitted by the exposed player instance. */
      instance.addEventListener?.('load', show);
      instance.addEventListener?.('play', show);
      instance.addEventListener?.('frame', show);
      instance.addEventListener?.('render', show);
      instance.addEventListener?.('loadError', fail);

      /* If autoplay/load happened before listeners were attached, asking the
         instance to play gives us a reliable play/frame/render event. */
      try {
        instance.setLoop?.(true);
        instance.setSpeed?.((ICONS[key] || ICONS.home).speed || .6);
        if (!reduceMotion.matches) instance.play?.();
      } catch (_) {}

      /* Last-resort reveal: the wrapper has an initialized instance and the
         original fallback remains available if a later loadError fires. */
      setTimeout(() => {
        if (!revealed && node.isConnected && player.isConnected) show();
      }, 900);
    };

    requestAnimationFrame(attach);
  }

  function speedAccent(node, key){
    const player = node.querySelector(':scope > .pdx-lottie-v3-player');
    const instance = player?.dotLottie;
    if (!instance) return;
    const base = (ICONS[key] || ICONS.home).speed || .6;
    try { instance.setSpeed?.(Math.min(1.18, base * 1.45)); } catch (_) {}
  }

  function speedNormal(node, key){
    const player = node.querySelector(':scope > .pdx-lottie-v3-player');
    const instance = player?.dotLottie;
    if (!instance) return;
    try { instance.setSpeed?.((ICONS[key] || ICONS.home).speed || .6); } catch (_) {}
  }

  function bindAccent(node, key){
    const trigger = node.closest(
      '.pdx-dock-item,.nav-link,.mob-link,.hub-tab,.hero-chip,.comm-card-title,' +
      '.nav-search-btn,.nav-cart-btn,.pdx-chat-room-mark,.pdx-chat-empty-mark,' +
      '.pit-primary,.pit-secondary'
    ) || node;

    const token = `pdxV3Accent${key}`;
    if (trigger.dataset[token] === '1') return;
    trigger.dataset[token] = '1';
    trigger.addEventListener('pointerenter', () => speedAccent(node, key), { passive:true });
    trigger.addEventListener('pointerleave', () => speedNormal(node, key), { passive:true });
    trigger.addEventListener('focusin', () => speedAccent(node, key));
    trigger.addEventListener('focusout', () => speedNormal(node, key));
  }

  function upgrade(node, key){
    if (!runtimeReady || !node || node.dataset.pdxLottieV3) return;

    node.dataset.pdxLottieV3 = key;
    node.classList.add('pdx-lottie-v3-icon');
    const player = createPlayer(key);
    node.appendChild(player);
    wirePlayer(node, player, key);
    bindAccent(node, key);
  }

  function upgradeAll(root = document){
    if (!runtimeReady || !root) return;

    SELECTORS.forEach(([selector,key]) => {
      if (root.matches?.(selector)) upgrade(root,key);
      root.querySelectorAll?.(selector).forEach(node => upgrade(node,key));
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
      if (icon) upgrade(icon,key);
    });
  }

  const DOCK_FALLBACKS = {
    home:'<svg viewBox="0 0 24 24"><path d="M3.5 10.5 12 3.7l8.5 6.8v9.2h-5.4v-6.2H8.9v6.2H3.5z"/></svg>',
    shop:'<svg viewBox="0 0 24 24"><path d="M5.2 8.2h13.6l1 11.3H4.2z"/><path d="M8.4 8.2V6.7a3.6 3.6 0 0 1 7.2 0v1.5"/></svg>',
    fanhub:'<svg viewBox="0 0 24 24"><circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M2.8 19c.5-3.5 2.4-5.3 5.2-5.3s4.7 1.8 5.2 5.3M13.2 15.1c1-.9 2.2-1.3 3.7-1.3 2.4 0 3.8 1.6 4.3 4.5"/></svg>',
    pitwall:'<svg viewBox="0 0 24 24"><path d="M4 18.5a8 8 0 1 1 16 0"/><path d="m12 18.5 4.6-6.2"/></svg>',
    account:'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.5"/><path d="M5.2 20c.5-4.1 2.8-6.2 6.8-6.2s6.3 2.1 6.8 6.2"/></svg>'
  };

  function mountDock(){
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
      if (navbar) navbar.insertAdjacentElement('afterend',dock);
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
      item.classList.toggle('active',active);
      if (active) item.setAttribute('aria-current','page');
      else item.removeAttribute('aria-current');
    });

    initDockMagnification(dock.querySelector('.pdx-dock-panel'));
    if (runtimeReady) upgradeAll(dock);
  }

  function initDockMagnification(panel){
    if (!panel || panel.dataset.pdxMagnifyReady === '1') return;
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
        const proximity = Math.max(0,1 - Math.abs(event.clientX - center) / DISTANCE);
        targets[index] = BASE + (MAX - BASE) * (1 - Math.pow(1 - proximity,3));
      });
      schedule();
    }, { passive:true });
    panel.addEventListener('pointerleave',reset,{ passive:true });
  }

  function observeDynamic(){
    if (!('MutationObserver' in window) || document.documentElement.dataset.pdxLottieV3Observer === '1') return;
    document.documentElement.dataset.pdxLottieV3Observer = '1';
    new MutationObserver(records => {
      records.forEach(record => record.addedNodes.forEach(node => {
        if (!(node instanceof Element)) return;
        if (runtimeReady) upgradeAll(node);
        if (node.id === 'pdx-dock' || node.querySelector?.('#pdx-dock')) {
          initDockMagnification(document.querySelector('#pdx-dock-panel'));
        }
      }));
    }).observe(document.body,{childList:true,subtree:true});
  }

  function applyReducedMotion(){
    document.querySelectorAll('.pdx-lottie-v3-player').forEach(player => {
      try {
        if (reduceMotion.matches) player.dotLottie?.pause?.();
        else player.dotLottie?.play?.();
      } catch (_) {}
    });
  }
  reduceMotion.addEventListener?.('change',applyReducedMotion);

  function ready(){
    mountDock();
    observeDynamic();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',ready,{once:true});
  else ready();

  loadRuntime().then(() => {
    runtimeReady = true;
    upgradeAll(document);
    mountDock();
    document.documentElement.classList.add('pdx-lottie-v3-ready');
  }).catch(error => {
    console.warn('PADDOX Lottie V3 runtime unavailable; static icon fallback retained.',error?.message || error);
  });
})();
