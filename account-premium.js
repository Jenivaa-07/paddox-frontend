/* ============================================================
   PADDOX ACCOUNT 2.0 — presentation enhancements
   Keeps account.js as the source of truth for auth/account data.
   ============================================================ */
(function initPaddoxAccountPremium(){
  'use strict';

  if (window.__PADDOX_ACCOUNT_PREMIUM__) return;
  window.__PADDOX_ACCOUNT_PREMIUM__ = true;

  const ready = fn => {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once:true });
    else fn();
  };

  function upgradeBrandLockup(){
    const logo = document.querySelector('#navbar .nav-logo');
    if (!logo || logo.dataset.pdxAccountBrand === '1') return;
    logo.dataset.pdxAccountBrand = '1';
    logo.classList.add('paddox-brand-lockup');
    logo.setAttribute('aria-label','PADDOX Home');
    logo.innerHTML = '<img src="assets/paddox-logo-horizontal-white.png?v=ACC2_0" alt="PADDOX Motorsport Lifestyle" class="brand-lockup-logo" decoding="async">';
  }

  function mountDock(){
    if (document.getElementById('pdx-dock')) return;

    const destinations = [
      { key:'home', href:'index.html', label:'Home', icon:'<path d="M3.5 10.5 12 3.7l8.5 6.8v9.2h-5.4v-6.2H8.9v6.2H3.5z"/>' },
      { key:'shop', href:'shop.html', label:'Shop', icon:'<path d="M5.2 8.2h13.6l1 11.3H4.2z"/><path d="M8.4 8.2V6.7a3.6 3.6 0 0 1 7.2 0v1.5"/>' },
      { key:'fanhub', href:'fanhub.html', label:'Fan Hub', icon:'<circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M2.8 19c.5-3.5 2.4-5.3 5.2-5.3s4.7 1.8 5.2 5.3M13.2 15.1c1-.9 2.2-1.3 3.7-1.3 2.4 0 3.8 1.6 4.3 4.5"/>' },
      { key:'pitwall', href:'pitwall.html', label:'Pit Wall', icon:'<path d="M4 18.5a8 8 0 1 1 16 0"/><path d="m12 18.5 4.6-6.2"/><path d="M6.4 14.7 4.7 14M8.6 11.5 7.4 10M12 10V8M15.4 11.5l1.2-1.5M17.6 14.7l1.7-.7"/>' },
      { key:'account', href:'account.html', label:'Account', icon:'<circle cx="12" cy="8" r="3.5"/><path d="M5.2 20c.5-4.1 2.8-6.2 6.8-6.2s6.3 2.1 6.8 6.2"/>' }
    ];

    const dock = document.createElement('nav');
    dock.className = 'pdx-dock-outer';
    dock.id = 'pdx-dock';
    dock.setAttribute('aria-label','Primary navigation');
    dock.innerHTML = `
      <div class="pdx-dock-panel" id="pdx-dock-panel" role="toolbar" aria-label="Paddox destinations">
        ${destinations.map(item => `
          <a href="${item.href}" class="pdx-dock-item${item.key === 'account' ? ' active' : ''}" aria-label="${item.label}"${item.key === 'account' ? ' aria-current="page"' : ''} aria-describedby="pdx-dock-label-${item.key}">
            <span class="pdx-dock-icon" aria-hidden="true"><svg viewBox="0 0 24 24">${item.icon}</svg></span>
            <span class="pdx-dock-label" id="pdx-dock-label-${item.key}" role="tooltip">${item.label}</span>
          </a>`).join('')}
      </div>`;

    const navbar = document.getElementById('navbar');
    if (navbar) navbar.insertAdjacentElement('afterend', dock);
    else document.body.appendChild(dock);
    initDockMagnification();
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

    if (!document.getElementById('pdx-account-auth-editorial')) {
      const editorial = document.createElement('section');
      editorial.id = 'pdx-account-auth-editorial';
      editorial.className = 'pdx-auth-editorial';
      editorial.innerHTML = `
        <div class="pdx-auth-kicker">PADDOX // MEMBER ACCESS</div>
        <h1>YOUR PADDOX.<br><span>ONE GARAGE.</span></h1>
        <p>One fan identity connects your race-day preferences, merchandise, digital collection, community profile and secure account controls across PADDOX.</p>
        <div class="pdx-auth-feature-grid" aria-label="Connected account features">
          <article class="pdx-auth-feature"><small>01 // Identity</small><strong>Profile Sync</strong><span>Your avatar and fan identity follow you into Chat and the global navbar.</span></article>
          <article class="pdx-auth-feature"><small>02 // Personalise</small><strong>Race Preferences</strong><span>Favourite teams and drivers power recommendations and fan experiences.</span></article>
          <article class="pdx-auth-feature"><small>03 // Protect</small><strong>Secure Session</strong><span>HttpOnly cookie sessions, password controls and email 2FA stay in one place.</span></article>
        </div>
        <div class="pdx-auth-trustline"><span><i></i>First-party session</span><span><i></i>2FA ready</span><span><i></i>Cross-page profile sync</span></div>`;
      auth.insertBefore(editorial, box);
    }

    if (!box.querySelector('.pdx-auth-card-label')) {
      const label = document.createElement('div');
      label.className = 'pdx-auth-card-label';
      label.innerHTML = 'MEMBER GARAGE / <b>SECURE LINK</b>';
      box.insertBefore(label, box.firstChild);
    }
  }

  function mountGarageChrome(){
    const sidebar = document.getElementById('acc-sidebar');
    if (sidebar && !sidebar.querySelector('.pdx-account-rail-title')) {
      const title = document.createElement('div');
      title.className = 'pdx-account-rail-title';
      title.innerHTML = '<b>MY PADDOX</b><span>SYNCED</span>';
      sidebar.insertBefore(title, sidebar.firstChild);
    }

    const main = document.querySelector('.acc-main');
    if (main && !document.getElementById('pdx-account-context-bar')) {
      const bar = document.createElement('div');
      bar.id = 'pdx-account-context-bar';
      bar.className = 'pdx-account-context-bar';
      bar.innerHTML = `
        <div class="pdx-account-context-copy"><small>MEMBER GARAGE</small><strong id="pdx-account-context-page">Dashboard</strong></div>
        <div class="pdx-account-context-state"><span>Profile synced</span><span>Protected session</span></div>`;
      main.insertBefore(bar, main.firstChild);
    }

    const updateContext = () => {
      const active = document.querySelector('.acc-nav-item.on');
      const label = document.getElementById('pdx-account-context-page');
      if (!active || !label) return;
      label.textContent = active.textContent.trim().replace(/\s+/g,' ');
    };
    document.querySelectorAll('.acc-nav-item').forEach(item => {
      if (item.dataset.pdxAccountContext === '1') return;
      item.dataset.pdxAccountContext = '1';
      item.addEventListener('click', () => requestAnimationFrame(updateContext));
    });
    updateContext();
  }

  function syncModeClasses(){
    const auth = document.getElementById('auth-screen');
    const account = document.getElementById('acc-screen');
    const authVisible = auth && getComputedStyle(auth).display !== 'none';
    const accountVisible = account && getComputedStyle(account).display !== 'none';
    document.body.classList.toggle('pdx-account-auth-mode', !!authVisible);
    document.body.classList.toggle('pdx-account-garage-mode', !!accountVisible);
  }

  function observeMode(){
    const targets = [document.getElementById('auth-screen'), document.getElementById('acc-screen')].filter(Boolean);
    if (!targets.length) return;
    const observer = new MutationObserver(syncModeClasses);
    targets.forEach(target => observer.observe(target, { attributes:true, attributeFilter:['style','class'] }));
    syncModeClasses();
  }

  function bindPointerGlow(){
    const selector = [
      '.ds-card','.dash-card','.set-card','.security-card','.order-premium-card',
      '.wl-card','.dl-card','.collection-card','.notification-setting-card',
      '.security-summary-card','.session-premium-card','.pdx-auth-feature'
    ].join(',');

    const bind = node => {
      if (!node || node.dataset.pdxAccountGlow === '1') return;
      node.dataset.pdxAccountGlow = '1';
      node.classList.add('pdx-account-glow');
      node.addEventListener('pointermove', event => {
        const rect = node.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        node.style.setProperty('--mx', `${Math.max(0,Math.min(100,x)).toFixed(1)}%`);
        node.style.setProperty('--my', `${Math.max(0,Math.min(100,y)).toFixed(1)}%`);
      }, { passive:true });
      node.addEventListener('pointerleave', () => {
        node.style.removeProperty('--mx');
        node.style.removeProperty('--my');
      }, { passive:true });
    };

    document.querySelectorAll(selector).forEach(bind);
    const observer = new MutationObserver(records => {
      records.forEach(record => record.addedNodes.forEach(node => {
        if (!(node instanceof Element)) return;
        if (node.matches(selector)) bind(node);
        node.querySelectorAll?.(selector).forEach(bind);
      }));
    });
    observer.observe(document.body, { childList:true, subtree:true });
  }

  ready(() => {
    if (!/account(?:\.html)?$/i.test(window.location.pathname)) return;
    document.body.classList.add('pdx-account-v2','pdx-cinematic-page','paddox-dock-account');
    document.body.dataset.pdxPage = 'account';
    upgradeBrandLockup();
    mountDock();
    mountAuthEditorial();
    mountGarageChrome();
    observeMode();
    bindPointerGlow();
  });
})();
