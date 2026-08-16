/* ============================================================
   PADDOX ADMIN — Deterministic Page Navigation
   Owns sidebar/hash page switching after all legacy controllers load.
   ============================================================ */
(function paddoxAdminNavigationLive(){
  'use strict';

  const TITLES = {
    overview: 'OVERVIEW',
    orders: 'ORDERS',
    products: 'PRODUCTS',
    coupons: 'COUPONS',
    inventory: 'INVENTORY',
    assets: 'DIGITAL ASSETS',
    fanquotes: 'FAN QUOTES',
    fanpolls: 'FAN POLLS',
    collectibles: 'COLLECTIBLES',
    fantrivia: 'FAN TRIVIA',
    fandrivers: 'FAN DRIVERS',
    users: 'USERS',
    analytics: 'ANALYTICS',
    moderation: 'MODERATION'
  };

  function installVisibilityLock(){
    if (document.getElementById('pdx-admin-navigation-lock')) return;
    const style = document.createElement('style');
    style.id = 'pdx-admin-navigation-lock';
    style.textContent = `
      .adm-pages > .adm-page { display:none !important; }
      .adm-pages > .adm-page.on { display:block !important; }
    `;
    document.head.appendChild(style);
  }

  function normalizePage(page){
    const value = String(page || '').trim().toLowerCase().replace(/^#/, '');
    return document.getElementById(`adm-${value}`) ? value : 'overview';
  }

  function activePageFromHash(){
    return normalizePage(window.location.hash);
  }

  function updateTopbar(page){
    const title = document.getElementById('adm-topbar-title');
    if (title) title.textContent = TITLES[page] || String(page).toUpperCase();

    const action = document.getElementById('adm-action-btn');
    if (action) {
      const showProductAction = page === 'products';
      action.hidden = !showProductAction;
      action.classList.toggle('is-hidden', !showProductAction);
      action.style.display = showProductAction ? '' : 'none';
      if (showProductAction) {
        action.textContent = '+ ADD PRODUCT';
        action.onclick = () => {
          if (typeof window.openAddModal === 'function') window.openAddModal();
        };
      } else {
        action.onclick = null;
      }
    }
  }

  function syncPageSpecificData(page){
    try {
      if (page === 'overview' && typeof window.PADDOX_refreshAdminOverview === 'function') {
        window.PADDOX_refreshAdminOverview();
      }
      if (page === 'orders' && typeof window.loadOrders === 'function') {
        window.loadOrders(true);
      }
      if (page === 'products' && typeof window.loadProducts === 'function') {
        window.loadProducts(true);
      }
    } catch (error) {
      console.warn('PADDOX Admin page sync failed:', page, error);
    }
  }

  function activatePage(page, options = {}){
    const next = normalizePage(page);
    const updateHash = options.updateHash !== false;

    document.querySelectorAll('.adm-pages > .adm-page').forEach(section => {
      const isTarget = section.id === `adm-${next}`;
      section.classList.toggle('on', isTarget);
      section.setAttribute('aria-hidden', isTarget ? 'false' : 'true');
    });

    document.querySelectorAll('.adm-nav-item[data-page]').forEach(item => {
      const isTarget = item.dataset.page === next;
      item.classList.toggle('on', isTarget);
      if (isTarget) item.setAttribute('aria-current', 'page');
      else item.removeAttribute('aria-current');
    });

    updateTopbar(next);

    if (updateHash) {
      const desired = `#${next}`;
      if (window.location.hash !== desired) {
        history.pushState({ paddoxAdminPage: next }, '', desired);
      }
    }

    document.documentElement.dataset.adminPage = next;
    syncPageSpecificData(next);
    return next;
  }

  function bindNavigation(){
    installVisibilityLock();

    document.querySelectorAll('.adm-nav-item[data-page]').forEach(item => {
      if (item.dataset.pdxNavBound === '1') return;
      item.dataset.pdxNavBound = '1';
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');

      const select = () => {
        const page = item.dataset.page;
        activatePage(page, { updateHash:true });
        // Legacy listeners may run in the same click. Win last deterministically.
        window.setTimeout(() => activatePage(page, { updateHash:false }), 0);
      };

      item.addEventListener('click', select);
      item.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          select();
        }
      });
    });

    window.addEventListener('hashchange', () => {
      activatePage(activePageFromHash(), { updateHash:false });
    });

    window.addEventListener('popstate', () => {
      activatePage(activePageFromHash(), { updateHash:false });
    });

    // Override legacy helper used by Overview links/buttons.
    window.switchPage = function paddoxAdminSwitchPage(page){
      return activatePage(page, { updateHash:true });
    };

    const initial = window.location.hash ? activePageFromHash() : normalizePage(
      document.querySelector('.adm-nav-item.on[data-page]')?.dataset.page || 'overview'
    );
    activatePage(initial, { updateHash:false });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindNavigation, { once:true });
  } else {
    bindNavigation();
  }
})();
