/* ============================================================
   PADDOX C1.0 - Shared Cinematic Page Interactions
   Page-aware command decks plus card pointer highlights.
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
      '.pdx-page-command-card'
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
    bindPointerGlow();
  });
})();
