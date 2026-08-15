/* PADDOX Account 2.0 — reuse the navbar horizontal logo inside auth surfaces. */
(function initAccount2BrandFix(){
  'use strict';

  const LOGO_SRC = 'assets/paddox-logo-horizontal-white.png?v=ACC_SAFE_BRAND_1';

  function upgradeLockup(node){
    if (!(node instanceof Element) || node.dataset.pdxHorizontalBrand === '1') return;
    node.dataset.pdxHorizontalBrand = '1';
    node.classList.add('pdx-account2-horizontal-brand');
    node.innerHTML = `<img src="${LOGO_SRC}" alt="PADDOX Motorsport Lifestyle" decoding="async">`;
  }

  function apply(){
    if (!/\/account(?:\.html)?\/?$/i.test(window.location.pathname)) return;
    document.querySelectorAll('.auth-brand-lockup').forEach(upgradeLockup);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply, { once:true });
  else apply();

  const observer = new MutationObserver(records => {
    records.forEach(record => record.addedNodes.forEach(node => {
      if (!(node instanceof Element)) return;
      if (node.matches?.('.auth-brand-lockup')) upgradeLockup(node);
      node.querySelectorAll?.('.auth-brand-lockup').forEach(upgradeLockup);
    }));
  });

  const startObserver = () => {
    if (!document.body) return;
    observer.observe(document.body,{ childList:true,subtree:true });
  };
  if (document.body) startObserver();
  else document.addEventListener('DOMContentLoaded',startObserver,{ once:true });
})();
