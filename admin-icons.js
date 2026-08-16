/* ============================================================
   PADDOX ADMIN — Runtime Bootstrap / Repair Layer
   Loaded last by admin.html.
   - repairs the historically missing admin-icons.js request
   - accepts both canonical data.user nesting and legacy top-level user
   - injects the Admin cinematic runtime stylesheet
   - removes stale AI-era presentation without touching live data logic
   ============================================================ */
(function paddoxAdminRuntimeBootstrap(){
  'use strict';

  const RUNTIME_VERSION = 'A5_0_0';
  const STYLE_ID = 'paddox-admin-runtime-style';

  function injectRuntimeStyles(){
    if (document.getElementById(STYLE_ID)) return;
    const link = document.createElement('link');
    link.id = STYLE_ID;
    link.rel = 'stylesheet';
    link.href = `admin-runtime.css?v=${RUNTIME_VERSION}`;
    document.head.appendChild(link);
  }

  function responseUser(payload){
    return payload?.data?.user || payload?.user || null;
  }

  async function requestCurrentUser(){
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json' }
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload?.success === false) {
      const error = new Error(payload?.message || 'Admin session unavailable');
      error.status = response.status;
      throw error;
    }

    return responseUser(payload);
  }

  /* Override the legacy checks before DOMContentLoaded fires. */
  window.checkAdminAccess = async function checkAdminAccess(){
    try {
      const user = await requestCurrentUser();
      if (!user || String(user.role || '').toLowerCase() !== 'admin') {
        window.location.replace('account.html');
        return false;
      }

      window.PADDOX_ADMIN_USER = user;
      document.documentElement.dataset.adminSession = 'verified';
      return true;
    } catch (error) {
      console.warn('PADDOX Admin access check failed:', error?.message || error);
      document.documentElement.dataset.adminSession = 'denied';
      window.location.replace('account.html');
      return false;
    }
  };

  window.fetchAdminIdentity = async function fetchAdminIdentity(){
    try {
      const user = window.PADDOX_ADMIN_USER || await requestCurrentUser();
      if (!user) return null;
      window.PADDOX_ADMIN_USER = user;

      const displayName =
        user.name ||
        user.fullName ||
        [user.firstName, user.lastName].filter(Boolean).join(' ') ||
        'PADDOX Admin';
      const email = user.email || 'Verified administrator';

      document.querySelectorAll('.admin-profile-name, #admin-profile-name').forEach(el => {
        el.textContent = displayName;
      });
      document.querySelectorAll('.admin-profile-email, #admin-profile-email').forEach(el => {
        el.textContent = email;
      });

      return user;
    } catch (error) {
      console.warn('PADDOX Admin identity refresh failed:', error?.message || error);
      return null;
    }
  };

  function installAdminBranding(){
    document.body.classList.add('pdx-admin-runtime');

    const title = document.querySelector('.adm-badge-label');
    if (title) title.textContent = 'Race Control';

    const topbarSub = document.querySelector('.adm-topbar-sub');
    if (topbarSub && !topbarSub.dataset.pdxRuntimeCopy) {
      topbarSub.dataset.pdxRuntimeCopy = '1';
      topbarSub.textContent = 'PADDOX OPERATIONS • LIVE COMMERCE + FAN CONTROL';
    }

    /* AI Prompt Studio was removed from PADDOX. Hide any stale AI-credit card
       left behind in the legacy Admin markup while keeping the user loader safe. */
    document.querySelectorAll('.users-ai-stat-card').forEach(card => {
      card.hidden = true;
      card.setAttribute('aria-hidden', 'true');
    });

    const usersGrid = document.querySelector('.users-stat-grid');
    if (usersGrid) usersGrid.classList.add('pdx-users-stat-grid-clean');

    /* Mark the primary operational pages for the cinematic CSS layer. */
    ['overview','orders','products','coupons','inventory','assets','fanquotes','fanpolls','collectibles','fantrivia','fandrivers','users','analytics','moderation']
      .forEach(name => document.getElementById(`adm-${name}`)?.classList.add('pdx-admin-operational-page'));
  }

  function bindNavigationTelemetry(){
    document.querySelectorAll('.adm-nav-item[data-page]').forEach(item => {
      if (item.dataset.pdxRuntimeBound === '1') return;
      item.dataset.pdxRuntimeBound = '1';
      item.addEventListener('click', () => {
        const page = item.dataset.page || 'overview';
        document.body.dataset.adminPage = page;
        history.replaceState(null, '', page === 'overview' ? 'admin.html' : `#${page}`);
      });
    });
  }

  function updateLiveClock(){
    const topbarSub = document.querySelector('.adm-topbar-sub');
    if (!topbarSub) return;
    const now = new Date();
    const stamp = now.toLocaleString('en-IN', {
      day:'2-digit', month:'short', year:'numeric',
      hour:'2-digit', minute:'2-digit'
    });
    topbarSub.textContent = `${stamp} • PADDOX OPERATIONS`;
  }

  function installGlobalRuntimeGuards(){
    window.addEventListener('unhandledrejection', event => {
      const message = String(event?.reason?.message || event?.reason || '');
      if (!message) return;
      console.warn('PADDOX Admin async module warning:', message);
    });

    window.addEventListener('error', event => {
      if (!event?.message) return;
      console.warn('PADDOX Admin runtime warning:', event.message);
    });
  }

  function finishBootstrap(){
    installAdminBranding();
    bindNavigationTelemetry();
    updateLiveClock();
    window.setInterval(updateLiveClock, 60 * 1000);

    requestAnimationFrame(() => {
      document.body.classList.add('pdx-admin-runtime-ready');
    });
  }

  injectRuntimeStyles();
  installGlobalRuntimeGuards();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', finishBootstrap, { once:true });
  } else {
    finishBootstrap();
  }
})();
