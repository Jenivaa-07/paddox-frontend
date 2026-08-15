/* ============================================================
   PADDOX — Shared signed-in navbar account controller
   Uses the existing first-party HttpOnly cookie session.
   ============================================================ */
(function initPaddoxNavAuth(){
  'use strict';

  if (window.__PADDOX_NAV_AUTH__) return;
  window.__PADDOX_NAV_AUTH__ = true;

  let currentProfile = null;
  let syncPromise = null;

  const clean = value => String(value || '').trim();

  function initials(user = {}){
    const first = clean(user.firstName || user.name).split(/\s+/)[0] || '';
    const last = clean(user.lastName || user.name).split(/\s+/).slice(-1)[0] || '';
    return `${first[0] || ''}${last[0] || ''}`.toUpperCase() || 'PX';
  }

  function displayName(user = {}){
    const full = `${clean(user.firstName)} ${clean(user.lastName)}`.trim();
    return full || clean(user.name) || 'PADDOX Fan';
  }

  function firstName(user = {}){
    return clean(user.firstName) || displayName(user).split(/\s+/)[0] || 'Fan';
  }

  function avatarUrl(user = {}){
    const value = user.avatar?.url || user.avatar || user.profileImage?.url || user.profileImage || '';
    return typeof value === 'string' ? value.trim() : '';
  }

  function normalizedUser(payload = {}){
    const user = payload?.data?.user || payload?.data || payload?.user || null;
    if (!user || typeof user !== 'object') return null;
    return user;
  }

  async function fetchProfileOnce(){
    const res = await fetch('/api/users/profile', {
      credentials:'include',
      headers:{ Accept:'application/json' }
    });
    if (!res.ok) return null;
    const payload = await res.json().catch(() => ({}));
    if (payload?.success === false) return null;
    return normalizedUser(payload);
  }

  async function resolveProfile(){
    let user = await fetchProfileOnce().catch(() => null);
    if (user) return user;

    /* A valid refresh cookie may still exist even if the access session needs
       renewal. Refresh silently, then retry the profile once. */
    try {
      const refresh = await fetch('/api/auth/refresh', {
        method:'POST',
        credentials:'include',
        headers:{ Accept:'application/json' }
      });
      if (!refresh.ok) return null;
      user = await fetchProfileOnce().catch(() => null);
      return user;
    } catch (_) {
      return null;
    }
  }

  function makeAvatar(user, className){
    const avatar = document.createElement('span');
    avatar.className = className;
    avatar.setAttribute('aria-hidden','true');

    const src = avatarUrl(user);
    if (!src) {
      avatar.textContent = initials(user);
      return avatar;
    }

    const image = document.createElement('img');
    image.src = src;
    image.alt = '';
    image.decoding = 'async';
    image.loading = 'eager';
    image.addEventListener('error', () => {
      image.remove();
      avatar.textContent = initials(user);
    }, { once:true });
    avatar.appendChild(image);
    return avatar;
  }

  function renderDesktop(user){
    document.querySelectorAll('.nav-cta-btn').forEach(link => {
      if (!(link instanceof HTMLAnchorElement)) return;

      link.href = 'account.html';
      link.classList.add('pdx-nav-account-chip');
      link.setAttribute('aria-label', `Open account for ${displayName(user)}`);
      link.setAttribute('title', displayName(user));
      link.replaceChildren();

      link.appendChild(makeAvatar(user, 'pdx-nav-user-avatar'));

      const copy = document.createElement('span');
      copy.className = 'pdx-nav-user-copy';

      const name = document.createElement('strong');
      name.className = 'pdx-nav-user-name';
      name.textContent = firstName(user);

      const meta = document.createElement('span');
      meta.className = 'pdx-nav-user-meta';
      meta.textContent = clean(user.fanTier) || 'My Account';

      copy.append(name, meta);

      const chevron = document.createElement('span');
      chevron.className = 'pdx-nav-user-chevron';
      chevron.setAttribute('aria-hidden','true');

      link.append(copy, chevron);
    });
  }

  function renderMobile(user){
    document.querySelectorAll('.mobile-menu .mob-link[href*="account"]').forEach(link => {
      link.classList.add('pdx-mobile-account-user');
      link.setAttribute('aria-label', `Open account for ${displayName(user)}`);
      link.replaceChildren();

      link.appendChild(makeAvatar(user, 'pdx-mobile-account-avatar'));

      const copy = document.createElement('span');
      copy.className = 'pdx-mobile-account-copy';

      const name = document.createElement('strong');
      name.textContent = firstName(user);

      const meta = document.createElement('span');
      meta.textContent = 'My Account';

      copy.append(name, meta);
      link.appendChild(copy);
    });
  }

  function renderSignedIn(user){
    currentProfile = user;
    window.__PADDOX_NAV_USER__ = user;
    document.documentElement.classList.add('pdx-user-signed-in');
    renderDesktop(user);
    renderMobile(user);
    window.dispatchEvent(new CustomEvent('paddox:nav-auth-ready', { detail:{ user } }));
  }

  function renderSignedOut(){
    currentProfile = null;
    window.__PADDOX_NAV_USER__ = null;
    document.documentElement.classList.remove('pdx-user-signed-in');
    window.dispatchEvent(new CustomEvent('paddox:nav-auth-ready', { detail:{ user:null } }));
  }

  async function syncAuth({ force = false } = {}){
    if (syncPromise && !force) return syncPromise;

    syncPromise = (async () => {
      const user = await resolveProfile();
      if (user) renderSignedIn(user);
      else renderSignedOut();
      return user;
    })().finally(() => { syncPromise = null; });

    return syncPromise;
  }

  window.refreshPaddoxNavAuth = () => syncAuth({ force:true });

  function observeAccountLogin(){
    const authScreen = document.getElementById('auth-screen');
    if (!authScreen || authScreen.dataset.pdxNavObserved === '1') return;
    authScreen.dataset.pdxNavObserved = '1';

    let previousDisplay = getComputedStyle(authScreen).display;
    const observer = new MutationObserver(() => {
      const nextDisplay = getComputedStyle(authScreen).display;
      if (previousDisplay !== 'none' && nextDisplay === 'none') {
        window.setTimeout(() => syncAuth({ force:true }), 80);
      }
      previousDisplay = nextDisplay;
    });
    observer.observe(authScreen, { attributes:true, attributeFilter:['style','class'] });
  }

  function boot(){
    if (!document.getElementById('navbar')) return;
    observeAccountLogin();
    syncAuth();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once:true });
  } else {
    boot();
  }

  window.addEventListener('pageshow', event => {
    if (event.persisted || currentProfile) syncAuth({ force:true });
  });

  window.addEventListener('paddox:auth-changed', () => syncAuth({ force:true }));
})();
