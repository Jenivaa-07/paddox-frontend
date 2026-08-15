/* PADDOX Account 2.0 — runtime state guard */
(function initPaddoxAccountRuntime(){
  'use strict';
  if (window.__PADDOX_ACCOUNT_RUNTIME__) return;
  window.__PADDOX_ACCOUNT_RUNTIME__ = true;

  function isAccountPage(){
    return /\/account(?:\.html)?\/?$/i.test(window.location.pathname);
  }

  function sync(){
    if (!isAccountPage() || !document.body) return;

    document.body.classList.add('pdx-account-v2','pdx-cinematic-page','paddox-dock-account');
    document.body.dataset.pdxPage = 'account';

    const auth = document.getElementById('auth-screen');
    const garage = document.getElementById('acc-screen');
    if (!auth || !garage) return;

    const authInline = String(auth.style.display || '').toLowerCase();
    const garageInline = String(garage.style.display || '').toLowerCase();

    const garageVisible = authInline === 'none' || (garageInline && garageInline !== 'none');

    document.body.classList.toggle('pdx-account-garage-mode', garageVisible);
    document.body.classList.toggle('pdx-account-auth-mode', !garageVisible);
  }

  function boot(){
    sync();
    const auth = document.getElementById('auth-screen');
    const garage = document.getElementById('acc-screen');
    const observer = new MutationObserver(sync);
    [auth, garage].filter(Boolean).forEach(node => {
      observer.observe(node, { attributes:true, attributeFilter:['style','class'] });
    });

    window.addEventListener('paddox:auth-changed', sync);
    window.addEventListener('pageshow', sync);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true });
  else boot();
})();
