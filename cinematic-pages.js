/* ============================================================
   PADDOX C1.1 - Shared Cinematic Page Interactions
   Page-aware cinematic shells, pointer highlights and Fan Hub dock.
   ============================================================ */
(function initPaddoxCinematicPages(){
  const pageConfigs = {
    shop: {
      hero: '.shop-hero-content',
      cards: [
        ['Inventory Live', 'Store Drops', 'Synced merch and team capsules'],
        ['Team Garage', 'Curated Kits', 'Apparel, posters, accessories'],
        ['Checkout Lane', 'Secure Cart', 'Wishlist and Razorpay-ready flow']
      ]
    },
    fanhub: {
      hero: '.hub-hero-content',
      cards: [
        ['Fan Hub', 'Digital Trackside', 'Wallpapers, stats, quotes, trivia'],
        ['Driver Vault', 'Live Profiles', 'Team and driver context in one view'],
        ['Community Signal', 'Fan Pulse', 'Polls, stories, and shared reactions']
      ]
    },
    pitwall: {
      hero: '.pit-hero-content',
      cards: [
        ['Timing Tower', 'Session Data', 'Race, qualifying, and result context'],
        ['Race Control', 'Live Messages', 'Operational updates at a glance'],
        ['AI Strategist', 'Ask PADDOX', 'Strategy prompts and race analysis']
      ]
    },
    account: {
      hero: '.auth-shell, .account-shell, main',
      cards: [
        ['Garage Profile', 'Fan Identity', 'Orders, wishlist, and preferences'],
        ['Security Bay', 'Protected Access', 'Password, sessions, and sign-in'],
        ['Order Lane', 'Tracked Flow', 'Receipts and purchase history']
      ]
    },
    collectibles: {
      hero: '.hero__content',
      cards: [
        ['Collection', 'Owned Badges', 'Progress across fan achievements'],
        ['Catalogue', 'Unlock Targets', 'Milestones and rarity status'],
        ['Verification', 'Proof Layer', 'Non-transferable digital identity']
      ]
    }
  };

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  function getPageKey() {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('shop')) return 'shop';
    if (path.includes('fanhub')) return 'fanhub';
    if (path.includes('pitwall')) return 'pitwall';
    if (path.includes('account')) return 'account';
    if (path.includes('collectibles')) return 'collectibles';
    return '';
  }

  function loadPageStylesheet(id, href) {
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }

  function makeCard([label, value, meta]) {
    const card = document.createElement('article');
    card.className = 'pdx-page-command-card';
    card.innerHTML = `
      <span class="pdx-page-command-label">${label}</span>
      <strong class="pdx-page-command-value">${value}</strong>
      <span class="pdx-page-command-meta">${meta}</span>
    `;
    return card;
  }

  function mountCommandDeck(config, pageKey) {
    const host = document.querySelector(config.hero);
    if (!host || document.getElementById(`pdx-${pageKey}-command-deck`)) return;

    const deck = document.createElement('div');
    deck.id = `pdx-${pageKey}-command-deck`;
    deck.className = 'pdx-page-command-deck';
    deck.setAttribute('aria-label', 'PADDOX page command snapshot');
    config.cards.forEach((card) => deck.appendChild(makeCard(card)));

    const anchor = host.querySelector('.shop-hero-stats, .hub-hero-chips, .pit-hero-actions, .hero__stats');
    if (anchor) {
      anchor.insertAdjacentElement('afterend', deck);
    } else {
      host.appendChild(deck);
    }
  }

  function mountPaddoxDock(pageKey) {
    if (document.getElementById('pdx-dock')) return;

    const destinations = [
      {
        key: 'home', href: 'index.html', label: 'Home',
        icon: '<path d="M3.5 10.5 12 3.7l8.5 6.8v9.2h-5.4v-6.2H8.9v6.2H3.5z"/>'
      },
      {
        key: 'shop', href: 'shop.html', label: 'Shop',
        icon: '<path d="M5.2 8.2h13.6l1 11.3H4.2z"/><path d="M8.4 8.2V6.7a3.6 3.6 0 0 1 7.2 0v1.5"/>'
      },
      {
        key: 'fanhub', href: 'fanhub.html', label: 'Fan Hub',
        icon: '<circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M2.8 19c.5-3.5 2.4-5.3 5.2-5.3s4.7 1.8 5.2 5.3M13.2 15.1c1-.9 2.2-1.3 3.7-1.3 2.4 0 3.8 1.6 4.3 4.5"/>'
      },
      {
        key: 'pitwall', href: 'pitwall.html', label: 'Pit Wall',
        icon: '<path d="M4 18.5a8 8 0 1 1 16 0"/><path d="m12 18.5 4.6-6.2"/><path d="M6.4 14.7 4.7 14M8.6 11.5 7.4 10M12 10V8M15.4 11.5l1.2-1.5M17.6 14.7l1.7-.7"/>'
      },
      {
        key: 'account', href: 'account.html', label: 'Account',
        icon: '<circle cx="12" cy="8" r="3.5"/><path d="M5.2 20c.5-4.1 2.8-6.2 6.8-6.2s6.3 2.1 6.8 6.2"/>'
      }
    ];

    const dock = document.createElement('nav');
    dock.className = 'pdx-dock-outer';
    dock.id = 'pdx-dock';
    dock.setAttribute('aria-label', 'Primary navigation');
    dock.innerHTML = `
      <div class="pdx-dock-panel" id="pdx-dock-panel" role="toolbar" aria-label="Paddox destinations">
        ${destinations.map((item) => {
          const active = item.key === pageKey;
          return `
            <a href="${item.href}" class="pdx-dock-item${active ? ' active' : ''}" aria-label="${item.label}"${active ? ' aria-current="page"' : ''} aria-describedby="pdx-dock-label-${item.key}">
              <span class="pdx-dock-icon" aria-hidden="true"><svg viewBox="0 0 24 24">${item.icon}</svg></span>
              <span class="pdx-dock-label" id="pdx-dock-label-${item.key}" role="tooltip">${item.label}</span>
            </a>`;
        }).join('')}
      </div>`;

    const navbar = document.getElementById('navbar');
    if (navbar) navbar.insertAdjacentElement('afterend', dock);
    else document.body.appendChild(dock);

    initPaddoxDockMagnification();
  }

  function initPaddoxDockMagnification() {
    const panel = document.getElementById('pdx-dock-panel');
    if (!panel || panel.dataset.pdxMagnifyReady === '1') return;
    panel.dataset.pdxMagnifyReady = '1';

    const items = [...panel.querySelectorAll('.pdx-dock-item')];
    if (!items.length) return;

    const BASE_SIZE = 50;
    const MAGNIFIED_SIZE = 70;
    const DISTANCE = 180;
    const currentSizes = items.map(() => BASE_SIZE);
    const targetSizes = items.map(() => BASE_SIZE);
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let animationFrame = 0;

    function renderSizes() {
      let keepAnimating = false;
      items.forEach((item, index) => {
        const difference = targetSizes[index] - currentSizes[index];
        const response = reduceMotion.matches ? 1 : 0.22;
        currentSizes[index] += difference * response;

        if (Math.abs(difference) > 0.08) keepAnimating = true;
        else currentSizes[index] = targetSizes[index];

        item.style.setProperty('--pdx-dock-size', `${currentSizes[index].toFixed(2)}px`);
      });
      animationFrame = keepAnimating ? requestAnimationFrame(renderSizes) : 0;
    }

    function requestRender() {
      if (!animationFrame) animationFrame = requestAnimationFrame(renderSizes);
    }

    function resetSizes() {
      targetSizes.fill(BASE_SIZE);
      requestRender();
    }

    function magnifyAround(clientX) {
      if (!finePointer.matches) return;
      items.forEach((item, index) => {
        const rect = item.getBoundingClientRect();
        const center = rect.left + rect.width / 2;
        const proximity = Math.max(0, 1 - Math.abs(clientX - center) / DISTANCE);
        const easedProximity = 1 - Math.pow(1 - proximity, 3);
        targetSizes[index] = BASE_SIZE + (MAGNIFIED_SIZE - BASE_SIZE) * easedProximity;
      });
      requestRender();
    }

    panel.addEventListener('pointermove', (event) => magnifyAround(event.clientX), { passive: true });
    panel.addEventListener('pointerleave', resetSizes, { passive: true });

    items.forEach((item, activeIndex) => {
      item.addEventListener('focus', () => {
        if (!finePointer.matches) return;
        targetSizes.forEach((_, index) => {
          const offset = Math.abs(activeIndex - index);
          targetSizes[index] = offset === 0 ? MAGNIFIED_SIZE : offset === 1 ? 58 : BASE_SIZE;
        });
        requestRender();
      });
      item.addEventListener('blur', resetSizes);
    });
  }

  function mountFanHubShowcase() {
    const hero = document.querySelector('.hub-hero');
    if (!hero || document.getElementById('pdx-fanhub-showcase')) return;

    const showcase = document.createElement('aside');
    showcase.id = 'pdx-fanhub-showcase';
    showcase.className = 'pdx-fanhub-showcase';
    showcase.setAttribute('aria-label', 'PADDOX Fan Hub live modules');
    showcase.innerHTML = `
      <div class="pdx-fanhub-showcase-head">
        <span class="pdx-fanhub-showcase-kicker">PADDOX // FAN SIGNAL</span>
        <span class="pdx-fanhub-showcase-live">Live Hub</span>
      </div>
      <div class="pdx-fanhub-main-signal">
        <span class="pdx-fanhub-signal-label">Digital Trackside</span>
        <strong>YOUR FAN UNIVERSE. ONE CONTROL ROOM.</strong>
        <p>Jump between the gallery, live grid, race calendar, driver voices and community without leaving the paddock.</p>
      </div>
      <div class="pdx-fanhub-module-grid">
        <button type="button" class="pdx-fanhub-module" data-fanhub-target="wallpapers">
          <img src="assets/home/wallpapers.svg" alt="" aria-hidden="true" loading="eager"/>
          <div><small>Gallery</small><strong>Wallpapers</strong><span>Track art & race visuals</span></div>
        </button>
        <button type="button" class="pdx-fanhub-module" data-fanhub-target="drivers">
          <img src="assets/home/driver-stats.svg" alt="" aria-hidden="true" loading="eager"/>
          <div><small>Live grid</small><strong>Driver Stats</strong><span>Standings & comparisons</span></div>
        </button>
        <button type="button" class="pdx-fanhub-module" data-fanhub-target="calendar">
          <img src="assets/home/race-calendar.svg" alt="" aria-hidden="true" loading="eager"/>
          <div><small>Season</small><strong>Race Calendar</strong><span>Circuits & next-race timing</span></div>
        </button>
        <button type="button" class="pdx-fanhub-module" data-fanhub-target="community">
          <img src="assets/home/fan-community.svg" alt="" aria-hidden="true" loading="eager"/>
          <div><small>Fan pulse</small><strong>Community</strong><span>Polls, trivia & live feed</span></div>
        </button>
      </div>`;

    hero.appendChild(showcase);
  }

  function activateFanHubTab(tabName, shouldScroll = true) {
    if (!tabName) return;

    if (typeof window.activateHubTab === 'function') {
      window.activateHubTab(tabName, shouldScroll);
      return;
    }

    const button = document.querySelector(`.hub-tab[data-tab="${tabName}"]`);
    if (!button) return;
    button.click();
    if (shouldScroll) {
      requestAnimationFrame(() => {
        document.getElementById(`sec-${tabName}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }

  function bindFanHubShortcuts() {
    document.querySelectorAll('[data-fanhub-target]').forEach((node) => {
      if (node.dataset.pdxFanShortcut === '1') return;
      node.dataset.pdxFanShortcut = '1';
      node.addEventListener('click', () => activateFanHubTab(node.dataset.fanhubTarget, true));
    });

    const chipTargets = ['wallpapers', 'drivers', 'calendar', 'community'];
    const chips = [...document.querySelectorAll('.hub-hero-chips .hero-chip')];
    chipTargets.forEach((tabName, index) => {
      const chip = chips[index];
      if (!chip || chip.tagName === 'A' || chip.dataset.pdxFanShortcut === '1') return;
      chip.dataset.pdxFanShortcut = '1';
      chip.setAttribute('role', 'button');
      chip.tabIndex = 0;
      chip.addEventListener('click', () => activateFanHubTab(tabName, true));
      chip.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        activateFanHubTab(tabName, true);
      });
    });
  }

  function bindPointerGlow() {
    const selector = [
      '.pcard',
      '.wall-card',
      '.driver-card',
      '.calendar-card',
      '.quote-card',
      '.community-card',
      '.pit-panel',
      '.stat-card',
      '.collectible-card',
      '.achievement-card',
      '.catalogue-card',
      '.security-card',
      '.auth-card',
      '.panel',
      '.hero-chip',
      '.cat-tab',
      '.filter-btn',
      '.pdx-page-command-card',
      '.wp-card',
      '.rcard',
      '.comm-card',
      '.drv-pill',
      '.drv-card',
      '.drv-stats-right',
      '.driver-compare-shell',
      '.qmini',
      '.fpd-card',
      '.pdx-fanhub-showcase',
      '.pdx-fanhub-module'
    ].join(',');

    const bind = (node) => {
      if (!node || node.dataset.pdxPageGlow === '1') return;
      node.dataset.pdxPageGlow = '1';
      node.addEventListener('pointermove', (event) => {
        const rect = node.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        node.style.setProperty('--mx', `${Math.max(0, Math.min(100, x)).toFixed(1)}%`);
        node.style.setProperty('--my', `${Math.max(0, Math.min(100, y)).toFixed(1)}%`);
      }, { passive: true });
      node.addEventListener('pointerleave', () => {
        node.style.removeProperty('--mx');
        node.style.removeProperty('--my');
      }, { passive: true });
    };

    document.querySelectorAll(selector).forEach(bind);

    if ('MutationObserver' in window) {
      const observer = new MutationObserver((records) => {
        records.forEach((record) => {
          record.addedNodes.forEach((node) => {
            if (!(node instanceof Element)) return;
            if (node.matches(selector)) bind(node);
            node.querySelectorAll(selector).forEach(bind);
          });
        });
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }

  ready(() => {
    const pageKey = getPageKey();
    const config = pageConfigs[pageKey];
    if (!config) return;

    document.body.classList.add('pdx-cinematic-page');
    document.body.dataset.pdxPage = pageKey;

    if (pageKey === 'fanhub') {
      loadPageStylesheet('pdx-fanhub-premium-css', 'fanhub-premium.css?v=FH2_0');
      document.body.classList.add('pdx-fanhub-v2', 'paddox-dock-fanhub');
      mountPaddoxDock(pageKey);
      mountFanHubShowcase();
      bindFanHubShortcuts();
    }

    bindPointerGlow();
  });
})();
