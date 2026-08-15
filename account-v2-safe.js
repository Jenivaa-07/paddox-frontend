/* ============================================================
   PADDOX ACCOUNT 2.0 SAFE
   Presentation only. account.js remains source of truth.
   The dock is mounted only after account-v2-safe.css is confirmed loaded.
   ============================================================ */
(function initPaddoxAccount2Safe(){
  'use strict';

  if (window.__PADDOX_ACCOUNT2_SAFE__) return;
  window.__PADDOX_ACCOUNT2_SAFE__ = true;

  const isAccountPage = () => /\/account(?:\.html)?\/?$/i.test(window.location.pathname);
  if (!isAccountPage()) return;

  const ready = (fn) => {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once:true });
    else fn();
  };

  function cssReady(){
    if (!document.body) return false;
    return getComputedStyle(document.body).getPropertyValue('--pdx-account2-ready').trim() === '1';
  }

  function removeLegacyPremiumArtifacts(){
    ['pdx-account-premium-style','pdx-account-premium-runtime-style'].forEach(id => document.getElementById(id)?.remove());
    document.querySelectorAll('script[data-pdx-account-premium],script[data-pdx-account-runtime]').forEach(node => node.remove());
    document.body?.classList.remove('pdx-account-v2','pdx-account-auth-mode','pdx-account-garage-mode','paddox-dock-account');
  }

  function upgradeBrandLockup(){
    const logo = document.querySelector('#navbar .nav-logo');
    if (!logo || logo.dataset.pdxAccount2Brand === '1') return;
    logo.dataset.pdxAccount2Brand = '1';
    logo.classList.add('paddox-brand-lockup');
    logo.setAttribute('aria-label','PADDOX Home');
    logo.innerHTML = '<img src="assets/paddox-logo-horizontal-white.png?v=ACC_SAFE_1" alt="PADDOX Motorsport Lifestyle" class="brand-lockup-logo" decoding="async">';
  }

  const DOCK_ITEMS = [
    { key:'home', href:'index.html', label:'Home', icon:'<path d="M3.5 10.5 12 3.7l8.5 6.8v9.2h-5.4v-6.2H8.9v6.2H3.5z"/>' },
    { key:'shop', href:'shop.html', label:'Shop', icon:'<path d="M5.2 8.2h13.6l1 11.3H4.2z"/><path d="M8.4 8.2V6.7a3.6 3.6 0 0 1 7.2 0v1.5"/>' },
    { key:'fanhub', href:'fanhub.html', label:'Fan Hub', icon:'<circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M2.8 19c.5-3.5 2.4-5.3 5.2-5.3s4.7 1.8 5.2 5.3M13.2 15.1c1-.9 2.2-1.3 3.7-1.3 2.4 0 3.8 1.6 4.3 4.5"/>' },
    { key:'pitwall', href:'pitwall.html', label:'Pit Wall', icon:'<path d="M4 18.5a8 8 0 1 1 16 0"/><path d="m12 18.5 4.6-6.2"/><path d="M6.4 14.7 4.7 14M8.6 11.5 7.4 10M12 10V8M15.4 11.5l1.2-1.5M17.6 14.7l1.7-.7"/>' },
    { key:'account', href:'account.html', label:'Account', icon:'<circle cx="12" cy="8" r="3.5"/><path d="M5.2 20c.5-4.1 2.8-6.2 6.8-6.2s6.3 2.1 6.8 6.2"/>' }
  ];

  function mountShopDock(){
    if (!cssReady()) return;

    const existing = document.getElementById('pdx-dock');
    if (existing) existing.remove();

    const dock = document.createElement('nav');
    dock.className = 'pdx-dock-outer';
    dock.id = 'pdx-dock';
    dock.dataset.account2Safe = '1';
    dock.setAttribute('aria-label','Primary navigation');
    dock.style.display = 'none';
    dock.innerHTML = `
      <div class="pdx-dock-panel" id="pdx-dock-panel" role="toolbar" aria-label="Paddox destinations">
        ${DOCK_ITEMS.map(item => `
          <a href="${item.href}" class="pdx-dock-item${item.key === 'account' ? ' active' : ''}" aria-label="${item.label}"${item.key === 'account' ? ' aria-current="page"' : ''} aria-describedby="pdx-dock-label-${item.key}">
            <span class="pdx-dock-icon" aria-hidden="true"><svg viewBox="0 0 24 24">${item.icon}</svg></span>
            <span class="pdx-dock-label" id="pdx-dock-label-${item.key}" role="tooltip">${item.label}</span>
          </a>`).join('')}
      </div>`;

    const navbar = document.getElementById('navbar');
    if (navbar) navbar.insertAdjacentElement('afterend', dock);
    else document.body.appendChild(dock);

    requestAnimationFrame(() => {
      if (!cssReady()) {
        dock.remove();
        return;
      }
      dock.style.removeProperty('display');
      initDockMagnification();
    });
  }

  function initDockMagnification(){
    const panel = document.getElementById('pdx-dock-panel');
    if (!panel || panel.dataset.pdxMagnifyReady === '1') return;
    panel.dataset.pdxMagnifyReady = '1';

    const items = [...panel.querySelectorAll('.pdx-dock-item')];
    if (!items.length) return;

    const BASE = 50;
    const MAX = 70;
    const DISTANCE = 180;
    const current = items.map(() => BASE);
    const target = items.map(() => BASE);
    const fine = window.matchMedia('(hover:hover) and (pointer:fine)');
    const reduce = window.matchMedia('(prefers-reduced-motion:reduce)');
    let raf = 0;

    function render(){
      let moving = false;
      items.forEach((item,index) => {
        const diff = target[index] - current[index];
        current[index] += diff * (reduce.matches ? 1 : .22);
        if (Math.abs(diff) > .08) moving = true;
        else current[index] = target[index];
        item.style.setProperty('--pdx-dock-size', `${current[index].toFixed(2)}px`);
      });
      raf = moving ? requestAnimationFrame(render) : 0;
    }

    const request = () => { if (!raf) raf = requestAnimationFrame(render); };
    const reset = () => { target.fill(BASE); request(); };

    panel.addEventListener('pointermove', event => {
      if (!fine.matches) return;
      items.forEach((item,index) => {
        const rect = item.getBoundingClientRect();
        const center = rect.left + rect.width / 2;
        const proximity = Math.max(0, 1 - Math.abs(event.clientX - center) / DISTANCE);
        const eased = 1 - Math.pow(1 - proximity, 3);
        target[index] = BASE + (MAX - BASE) * eased;
      });
      request();
    }, { passive:true });

    panel.addEventListener('pointerleave', reset, { passive:true });

    items.forEach((item,activeIndex) => {
      item.addEventListener('focus', () => {
        if (!fine.matches) return;
        target.forEach((_,index) => {
          const offset = Math.abs(activeIndex - index);
          target[index] = offset === 0 ? MAX : offset === 1 ? 58 : BASE;
        });
        request();
      });
      item.addEventListener('blur', reset);
    });
  }

  function mountAuthEditorial(){
    const auth = document.getElementById('auth-screen');
    const box = auth?.querySelector('.auth-box');
    if (!auth || !box) return;

    if (!document.getElementById('pdx-account2-editorial')) {
      const editorial = document.createElement('section');
      editorial.id = 'pdx-account2-editorial';
      editorial.className = 'pdx-account2-editorial';
      editorial.innerHTML = `
        <div class="pdx-account2-kicker">PADDOX // MEMBER ACCESS</div>
        <h1>YOUR PADDOX.<br><span>ONE GARAGE.</span></h1>
        <p>Your fan identity, team preferences, orders, digital collection and security controls stay connected across every PADDOX experience.</p>
        <div class="pdx-account2-features" aria-label="Connected account features">
          <article class="pdx-account2-feature"><small>01 // Identity</small><strong>Profile Sync</strong><span>Your avatar and fan identity follow you into Chat and the sitewide account control.</span></article>
          <article class="pdx-account2-feature"><small>02 // Personalise</small><strong>Race Preferences</strong><span>Favourite teams and drivers power recommendations, polls and fan experiences.</span></article>
          <article class="pdx-account2-feature"><small>03 // Protect</small><strong>Secure Session</strong><span>Cookie sessions, password controls and email 2FA remain managed in one garage.</span></article>
        </div>
        <div class="pdx-account2-trust"><span><i></i>First-party session</span><span><i></i>2FA ready</span><span><i></i>Cross-page sync</span></div>`;
      auth.insertBefore(editorial, box);
    }

    if (!box.querySelector('.pdx-account2-card-label')) {
      const label = document.createElement('div');
      label.className = 'pdx-account2-card-label';
      label.innerHTML = 'MEMBER GARAGE / <b>SECURE LINK</b>';
      box.insertBefore(label, box.firstChild);
    }
  }

  function mountGarageChrome(){
    const sidebar = document.getElementById('acc-sidebar');
    if (sidebar && !sidebar.querySelector('.pdx-account2-rail-label')) {
      const rail = document.createElement('div');
      rail.className = 'pdx-account2-rail-label';
      rail.innerHTML = '<b>MY PADDOX</b><span>SYNCED</span>';
      sidebar.insertBefore(rail, sidebar.firstChild);
    }

    const main = document.querySelector('.acc-main');
    if (main && !document.getElementById('pdx-account2-context')) {
      const bar = document.createElement('div');
      bar.id = 'pdx-account2-context';
      bar.className = 'pdx-account2-context';
      bar.innerHTML = `
        <div><small>PADDOX // FAN GARAGE</small><strong id="pdx-account2-context-name">Dashboard</strong></div>
        <div class="pdx-account2-context-state"><span>Profile synced</span><span>Protected session</span></div>`;
      main.insertBefore(bar, main.firstChild);
    }

    const updateContext = () => {
      const active = document.querySelector('.acc-nav-item.on');
      const target = document.getElementById('pdx-account2-context-name');
      if (!target) return;
      target.textContent = active?.textContent?.replace(/\s+/g,' ').trim() || 'Dashboard';
    };

    document.querySelectorAll('.acc-nav-item').forEach(item => {
      if (item.dataset.account2Context === '1') return;
      item.dataset.account2Context = '1';
      item.addEventListener('click', () => requestAnimationFrame(updateContext));
    });
    updateContext();
  }

  function syncModeClass(){
    const auth = document.getElementById('auth-screen');
    const garage = document.getElementById('acc-screen');
    if (!auth || !garage) return;

    const authVisible = (auth.style.display || getComputedStyle(auth).display) !== 'none';
    const garageVisible = (garage.style.display || getComputedStyle(garage).display) !== 'none';
    document.body.classList.toggle('pdx-account2-auth', authVisible && !garageVisible);
    document.body.classList.toggle('pdx-account2-garage', garageVisible);
  }

  function observeMode(){
    const nodes = [document.getElementById('auth-screen'),document.getElementById('acc-screen')].filter(Boolean);
    if (!nodes.length) return;
    syncModeClass();
    const observer = new MutationObserver(syncModeClass);
    nodes.forEach(node => observer.observe(node,{ attributes:true,attributeFilter:['style','class'] }));
    window.addEventListener('pageshow',syncModeClass);
    window.addEventListener('paddox:auth-changed',syncModeClass);
  }

  function bindPointerGlow(){
    const selector = [
      '.ds-card','.dash-card','.set-card','.security-card','.order-premium-card',
      '.wishlist-command-card','.downloads-command-card','.collection-command-card',
      '.wl-card','.dl-card','.notification-setting-card','.session-premium-card','.pdx-account2-feature'
    ].join(',');

    const bind = node => {
      if (!node || node.dataset.account2Glow === '1') return;
      node.dataset.account2Glow = '1';
      node.classList.add('pdx-account2-glow');
      node.addEventListener('pointermove', event => {
        const rect = node.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const x = Math.max(0,Math.min(100,((event.clientX-rect.left)/rect.width)*100));
        const y = Math.max(0,Math.min(100,((event.clientY-rect.top)/rect.height)*100));
        node.style.setProperty('--mx',`${x.toFixed(1)}%`);
        node.style.setProperty('--my',`${y.toFixed(1)}%`);
      },{ passive:true });
    };

    document.querySelectorAll(selector).forEach(bind);
    const observer = new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => {
      if (!(node instanceof Element)) return;
      if (node.matches(selector)) bind(node);
      node.querySelectorAll?.(selector).forEach(bind);
    })));
    observer.observe(document.body,{ childList:true,subtree:true });
  }

  ready(() => {
    removeLegacyPremiumArtifacts();
    if (!cssReady()) return;

    document.body.classList.add('pdx-account2-safe');
    document.body.dataset.pdxPage = 'account';

    /* Verify the sentinel again after the class is set. If the CSS did not load,
       stop before inserting any SVG or presentation nodes. */
    if (!cssReady()) {
      document.body.classList.remove('pdx-account2-safe');
      return;
    }

    upgradeBrandLockup();
    mountAuthEditorial();
    mountGarageChrome();
    mountShopDock();
    observeMode();
    bindPointerGlow();
  });
})();
