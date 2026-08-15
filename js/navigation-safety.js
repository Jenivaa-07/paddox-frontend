/* ============================================================
   PADDOX — Native navigation + route warm-up
   - keeps decorative transition overlays from blocking links
   - preserves native browser navigation / bfcache behaviour
   - prefetches the core PADDOX destinations before the click
   - mounts shared auth / Fan Hub / safe Account 2.0 layers
   ============================================================ */
(function initPaddoxNativeNavigation(){
  'use strict';

  if (window.__PADDOX_NAV_SAFETY_V2__) return;
  window.__PADDOX_NAV_SAFETY_V2__ = true;

  const CORE_ROUTES = [
    'index.html',
    'shop.html',
    'fanhub.html',
    'pitwall.html',
    'account.html'
  ];

  const ROUTE_ASSETS = {
    'index.html': ['home.css?v=H4_6_2', 'home.js?v=H4_6_2'],
    'shop.html': ['shop.css?v=S3_4', 'shop.js?v=S3_1', 'cinematic-pages.css?v=C1_0'],
    'fanhub.html': [
      'fanhub.css?v=F1_8_quote_canvas_premium_code',
      'fanhub-premium.css?v=FH2_0',
      'fanhub.js?v=F1_8_quote_canvas_premium_code_api1',
      'fanhub-chat.css?v=CHAT1_0',
      'fanhub-chat.js?v=CHAT1_0'
    ],
    'pitwall.html': ['pitwall.css?v=19_3', 'pitwall.js?v=19_4', 'cinematic-pages.css?v=C1_0'],
    'account.html': [
      'account.css?v=A4_7C_10',
      'account-v2-safe.css?v=ACC_SAFE_1',
      'account-v2-brand-fix.css?v=ACC_SAFE_BRAND_1',
      'account-v2-cleanup.css?v=ACC_SAFE_CLEANUP_2',
      'account.js?v=A4_7C_11',
      'account-v2-safe.js?v=ACC_SAFE_1',
      'account-v2-brand-fix.js?v=ACC_SAFE_BRAND_1',
      'account-v2-cleanup.js?v=ACC_SAFE_CLEANUP_2',
      'cinematic-pages.css?v=C1_0'
    ]
  };

  const prefetched = new Set();
  const warmedAssets = new Set();

  function appendStylesheet(id, href){
    let link = document.getElementById(id);
    if (!link) {
      link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
    }
    if (link.getAttribute('href') !== href) link.href = href;
    if (!link.isConnected) document.head.appendChild(link);
    return link;
  }

  function appendScript(selector, src, dataKey){
    let script = document.querySelector(selector);
    if (script) return script;
    script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.dataset[dataKey] = '1';
    document.head.appendChild(script);
    return script;
  }

  function loadGlobalNavAuth(){
    appendStylesheet('pdx-nav-auth-style', 'paddox-nav-auth.css?v=NAV_AUTH_3');
    appendScript('script[data-pdx-nav-auth]', 'paddox-nav-auth.js?v=NAV_AUTH_4', 'pdxNavAuth');
  }

  function loadAccount2Safe(){
    if (!/\/account(?:\.html)?\/?$/i.test(window.location.pathname)) return;

    const style = appendStylesheet('pdx-account2-safe-style', 'account-v2-safe.css?v=ACC_SAFE_1');
    let started = false;

    const start = () => {
      if (started) return;
      started = true;

      const boot = () => {
        if (!document.body) return;
        document.body.classList.add('pdx-account2-safe');
        appendStylesheet('pdx-account2-brand-style', 'account-v2-brand-fix.css?v=ACC_SAFE_BRAND_1');
        appendStylesheet('pdx-account2-cleanup-style', 'account-v2-cleanup.css?v=ACC_SAFE_CLEANUP_2');
        appendScript('script[data-pdx-account2-safe]', 'account-v2-safe.js?v=ACC_SAFE_1', 'pdxAccount2Safe');
        appendScript('script[data-pdx-account2-brand]', 'account-v2-brand-fix.js?v=ACC_SAFE_BRAND_1', 'pdxAccount2Brand');
        appendScript('script[data-pdx-account2-cleanup]', 'account-v2-cleanup.js?v=ACC_SAFE_CLEANUP_2', 'pdxAccount2Cleanup');
      };

      if (document.body) boot();
      else document.addEventListener('DOMContentLoaded', boot, { once:true });
    };

    if (style.sheet) start();
    else {
      style.addEventListener('load', start, { once:true });
      style.addEventListener('error', () => {
        document.body?.classList.remove('pdx-account2-safe');
      }, { once:true });
    }
  }

  function loadFanHubEnhancements(){
    if (!/\/fanhub(?:\.html)?\/?$/i.test(window.location.pathname)) return;

    appendStylesheet('pdx-fanhub-chat-icon-fix', 'fanhub-chat-icon-fix.css?v=CHAT_ICON_1');
    appendStylesheet('pdx-fanhub-chat-reactions-style', 'fanhub-chat-reactions.css?v=REACTIONS_1');
    appendScript('script[data-pdx-chat-reactions]', 'fanhub-chat-reactions.js?v=REACTIONS_1', 'pdxChatReactions');
  }

  function neutralizeTransition(){
    const overlay = document.getElementById('page-overlay');
    if (overlay) {
      overlay.classList.remove('slide-in', 'slide-out');
      overlay.setAttribute('aria-hidden', 'true');
      overlay.style.setProperty('display', 'none', 'important');
      overlay.style.setProperty('pointer-events', 'none', 'important');
    }

    if (document.body) {
      document.body.classList.remove('page-transition-init');
      document.body.style.opacity = '1';
    }
  }

  function normalizeInternalRoute(raw){
    if (!raw || raw.startsWith('#') || raw.startsWith('mailto:') || raw.startsWith('tel:') || raw.startsWith('javascript:')) return '';
    try {
      const url = new URL(raw, window.location.href);
      if (url.origin !== window.location.origin) return '';
      const name = url.pathname.split('/').filter(Boolean).pop() || 'index.html';
      if (!name.includes('.')) return `${name}.html`;
      return name;
    } catch (_) {
      return '';
    }
  }

  function isNavigableAnchor(link){
    if (!(link instanceof HTMLAnchorElement)) return false;
    if (link.hasAttribute('download') || link.target === '_blank') return false;
    return !!normalizeInternalRoute(link.getAttribute('href') || '');
  }

  function prefetchResource(href, as = ''){
    if (!href || warmedAssets.has(href)) return;
    warmedAssets.add(href);
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    if (as) link.as = as;
    link.fetchPriority = 'low';
    document.head.appendChild(link);
  }

  function warmRoute(route, includeAssets = false){
    if (!route || !CORE_ROUTES.includes(route)) return;

    const current = normalizeInternalRoute(window.location.pathname) || 'index.html';
    if (route !== current && !prefetched.has(route)) {
      prefetched.add(route);
      prefetchResource(route, 'document');
    }

    if (!includeAssets) return;
    (ROUTE_ASSETS[route] || []).forEach(asset => {
      const clean = asset.split('?')[0].toLowerCase();
      const as = clean.endsWith('.css') ? 'style' : clean.endsWith('.js') ? 'script' : '';
      prefetchResource(asset, as);
    });
  }

  function warmAnchor(anchor, includeAssets = true){
    if (!isNavigableAnchor(anchor)) return;
    warmRoute(normalizeInternalRoute(anchor.getAttribute('href') || ''), includeAssets);
  }

  function installSpeculationRules(){
    if (document.getElementById('pdx-route-speculation')) return;
    try {
      const current = normalizeInternalRoute(window.location.pathname) || 'index.html';
      const urls = CORE_ROUTES.filter(route => route !== current).map(route => `/${route}`);
      if (!urls.length) return;
      const script = document.createElement('script');
      script.id = 'pdx-route-speculation';
      script.type = 'speculationrules';
      script.textContent = JSON.stringify({
        prefetch: [{ source:'list', urls, eagerness:'moderate' }]
      });
      document.head.appendChild(script);
    } catch (_) {}
  }

  function scheduleIdleWarmup(){
    const run = () => {
      const current = normalizeInternalRoute(window.location.pathname) || 'index.html';
      CORE_ROUTES.filter(route => route !== current).forEach(route => warmRoute(route, false));
    };
    if ('requestIdleCallback' in window) window.requestIdleCallback(run, { timeout:1800 });
    else window.setTimeout(run, 900);
  }

  loadGlobalNavAuth();
  loadAccount2Safe();
  installSpeculationRules();

  document.addEventListener('pointerdown', event => {
    const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (!isNavigableAnchor(anchor)) return;
    neutralizeTransition();
    warmAnchor(anchor, true);
  }, { capture:true, passive:true });

  document.addEventListener('pointerover', event => {
    const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null;
    warmAnchor(anchor, true);
  }, { capture:true, passive:true });

  document.addEventListener('focusin', event => {
    const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null;
    warmAnchor(anchor, true);
  }, true);

  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (!isNavigableAnchor(anchor)) return;
    neutralizeTransition();
    warmAnchor(anchor, true);
    event.stopImmediatePropagation();
  }, true);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      neutralizeTransition();
      loadAccount2Safe();
      loadFanHubEnhancements();
      scheduleIdleWarmup();
    }, { once:true });
  } else {
    neutralizeTransition();
    loadAccount2Safe();
    loadFanHubEnhancements();
    scheduleIdleWarmup();
  }

  window.addEventListener('pageshow', () => {
    neutralizeTransition();
    loadAccount2Safe();
  });
})();
