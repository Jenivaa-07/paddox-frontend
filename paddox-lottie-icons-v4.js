/* ============================================================
   PADDOX L4.0 — MONOCHROME LOTTIEFILES MOTION SYSTEM

   Uses real LottieFiles-origin JSON animations from the public
   iconforest/flutter_animated_icons mirror, rendered with lottie-web SVG.
   SVG output lets PADDOX enforce one visual language:
   chrome/white by default, PADDOX red on active / hover.

   Motion policy:
   - continuous subtle loop
   - slower idle playback
   - mild hover/focus speed-up
   - reduced-motion pauses animation
   - original static icons remain as fallback until SVG is ready
   ============================================================ */
(function initPaddoxLottieMotionV4(){
  'use strict';

  if (window.__PADDOX_LOTTIE_V4__) return;
  window.__PADDOX_LOTTIE_V4__ = true;

  const LOTTIE_WEB = 'https://cdn.jsdelivr.net/npm/lottie-web@5.13.0/build/player/lottie.min.js';
  const SOURCE = 'https://raw.githubusercontent.com/iconforest/flutter_animated_icons/main/assets/lottiefiles.com/';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const dataCache = new Map();
  const mountedAnimations = new Set();
  let runtimeReady = false;

  const ICONS = {
    home:        { file:'66441-home-icon.json',                    speed:.42 },
    shop:        { file:'76018-shopping-cart-icon-animation.json', speed:.46 },
    fanhub:      { file:'37056-community-icon.json',               speed:.38 },
    pitwall:     { file:'35729-insights-icon.json',                speed:.44 },
    account:     { file:'95473-animated-profile-icon.json',        speed:.42 },
    search:      { file:'86895-search-icon-animation.json',        speed:.48 },
    cart:        { file:'76018-shopping-cart-icon-animation.json', speed:.46 },
    wallpapers:  { file:'86897-gallery-icon-animation.json',       speed:.40 },
    drivers:     { file:'95473-animated-profile-icon.json',        speed:.42 },
    calendar:    { file:'99827-flipping-calendar-icon.json',       speed:.36 },
    quotes:      { file:'59477-message-icon.json',                 speed:.42 },
    community:   { file:'37056-community-icon.json',               speed:.38 },
    chat:        { file:'95474-animated-chats-icon.json',          speed:.40 },
    poll:        { file:'35729-insights-icon.json',                speed:.42 },
    leaderboard: { file:'86896-trophy-icon-animation.json',        speed:.38 },
    trivia:      { file:'33303-target-icon.json',                  speed:.42 },
    feed:        { file:'40251-network-activity-icon.json',        speed:.36 },
    refresh:     { file:'39432-repeat-icon-step-by-step.json',     speed:.48 },
    back:        { file:'38784-arrow-icon.json',                   speed:.46 }
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
    return SOURCE + (ICONS[key] || ICONS.home).file;
  }

  function loadRuntime(){
    if (window.lottie?.loadAnimation) return Promise.resolve();

    let script = document.querySelector('script[data-pdx-lottie-web-v4]');
    if (!script) {
      script = document.createElement('script');
      script.src = LOTTIE_WEB;
      script.async = true;
      script.dataset.pdxLottieWebV4 = '1';
      document.head.appendChild(script);
    }

    return new Promise((resolve,reject) => {
      const started = Date.now();
      const poll = () => {
        if (window.lottie?.loadAnimation) return resolve();
        if (Date.now() - started > 15000) return reject(new Error('lottie-web runtime timed out'));
        setTimeout(poll,50);
      };
      script.addEventListener('error', () => reject(new Error('lottie-web runtime failed')), {once:true});
      poll();
    });
  }

  async function animationData(key){
    if (dataCache.has(key)) return dataCache.get(key);
    const promise = fetch(sourceFor(key), { mode:'cors', cache:'force-cache' })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      });
    dataCache.set(key,promise);
    try { return await promise; }
    catch (error) { dataCache.delete(key); throw error; }
  }

  function triggerFor(node){
    return node.closest(
      '.pdx-dock-item,.nav-link,.mob-link,.hub-tab,.hero-chip,.comm-card-title,' +
      '.nav-search-btn,.nav-cart-btn,.pdx-chat-room-mark,.pdx-chat-empty-mark,' +
      '.pit-primary,.pit-secondary'
    ) || node;
  }

  function setSpeed(node,multiplier){
    const anim = node.__pdxLottieV4Animation;
    const key = node.dataset.pdxLottieV4 || 'home';
    if (!anim) return;
    const base = (ICONS[key] || ICONS.home).speed || .42;
    try { anim.setSpeed(Math.min(.82, base * multiplier)); } catch (_) {}
  }

  function bindAccent(node){
    const trigger = triggerFor(node);
    if (trigger.dataset.pdxLottieV4Accent === '1') return;
    trigger.dataset.pdxLottieV4Accent = '1';

    trigger.addEventListener('pointerenter', () => setSpeed(node,1.45), {passive:true});
    trigger.addEventListener('pointerleave', () => setSpeed(node,1), {passive:true});
    trigger.addEventListener('focusin', () => setSpeed(node,1.45));
    trigger.addEventListener('focusout', () => setSpeed(node,1));
  }

  async function upgrade(node,key){
    if (!runtimeReady || !node || node.dataset.pdxLottieV4) return;

    node.dataset.pdxLottieV4 = key;
    node.classList.add('pdx-lottie-v4-icon');

    const host = document.createElement('span');
    host.className = 'pdx-lottie-v4-player';
    host.setAttribute('aria-hidden','true');
    node.appendChild(host);

    try {
      const data = await animationData(key);
      if (!node.isConnected || !host.isConnected) return;

      const anim = window.lottie.loadAnimation({
        container:host,
        renderer:'svg',
        loop:true,
        autoplay:!reduceMotion.matches,
        animationData:data,
        rendererSettings:{
          preserveAspectRatio:'xMidYMid meet',
          progressiveLoad:true,
          hideOnTransparent:true
        }
      });

      node.__pdxLottieV4Animation = anim;
      mountedAnimations.add(anim);
      anim.setSpeed((ICONS[key] || ICONS.home).speed || .42);

      const reveal = () => node.classList.add('pdx-lottie-v4-loaded');
      anim.addEventListener('DOMLoaded', reveal);
      anim.addEventListener('enterFrame', reveal);
      anim.addEventListener('data_failed', () => {
        node.classList.remove('pdx-lottie-v4-loaded');
        node.classList.add('pdx-lottie-v4-failed');
      });

      bindAccent(node);

      if (reduceMotion.matches) {
        try { anim.goToAndStop(0,true); } catch (_) {}
      }
    } catch (error) {
      host.remove();
      node.classList.add('pdx-lottie-v4-failed');
      delete node.dataset.pdxLottieV4;
      console.warn(`PADDOX Lottie icon failed: ${key}`, error?.message || error);
    }
  }

  function upgradeAll(root=document){
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
    if (!panel || panel.dataset.pdxV4Magnify === '1') return;
    panel.dataset.pdxV4Magnify = '1';

    const items = [...panel.querySelectorAll('.pdx-dock-item')];
    if (!items.length) return;
    const finePointer = matchMedia('(hover:hover) and (pointer:fine)');
    const BASE = 46, MAX = 61, DISTANCE = 165;
    const current = items.map(() => BASE);
    const targets = items.map(() => BASE);
    let frame = 0;

    const render = () => {
      let moving = false;
      items.forEach((item,index) => {
        const diff = targets[index] - current[index];
        current[index] += diff * (reduceMotion.matches ? 1 : .22);
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
        const eased = 1 - Math.pow(1 - proximity,3);
        targets[index] = BASE + (MAX - BASE) * eased;
      });
      schedule();
    }, {passive:true});
    panel.addEventListener('pointerleave',reset,{passive:true});
  }

  function removeLegacyFanSignal(){
    document.getElementById('pdx-fanhub-showcase')?.remove();
  }

  function observeDynamicIcons(){
    if (!('MutationObserver' in window) || document.documentElement.dataset.pdxLottieV4Observer === '1') return;
    document.documentElement.dataset.pdxLottieV4Observer = '1';

    new MutationObserver(records => {
      records.forEach(record => record.addedNodes.forEach(node => {
        if (!(node instanceof Element)) return;
        if (node.id === 'pdx-fanhub-showcase') { node.remove(); return; }
        node.querySelector?.('#pdx-fanhub-showcase')?.remove();
        if (runtimeReady) upgradeAll(node);
        if (node.id === 'pdx-dock' || node.querySelector?.('#pdx-dock')) {
          initDockMagnification(document.querySelector('#pdx-dock-panel'));
        }
      }));
    }).observe(document.body,{childList:true,subtree:true});
  }

  function applyReducedMotion(){
    mountedAnimations.forEach(anim => {
      try {
        if (reduceMotion.matches) anim.pause();
        else anim.play();
      } catch (_) {}
    });
  }
  reduceMotion.addEventListener?.('change',applyReducedMotion);

  function onDomReady(){
    mountGlobalDock();
    removeLegacyFanSignal();
    observeDynamicIcons();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',onDomReady,{once:true});
  else onDomReady();

  loadRuntime().then(() => {
    runtimeReady = true;
    upgradeAll(document);
    mountGlobalDock();
    document.documentElement.classList.add('pdx-lottie-v4-ready');
  }).catch(error => {
    console.warn('PADDOX Lottie V4 unavailable; static icons retained.', error?.message || error);
  });
})();
