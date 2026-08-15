/* ============================================================
   PADDOX ACCOUNT 2.0 — hard cleanup
   Removes legacy AI Credits UI from the rendered Account DOM.
   account.js remains untouched so auth/profile/order logic stays stable.
   ============================================================ */
(function initPaddoxAccountCleanup(){
  'use strict';

  if (window.__PADDOX_ACCOUNT_CLEANUP__) return;
  window.__PADDOX_ACCOUNT_CLEANUP__ = true;

  if (!/\/account(?:\.html)?\/?$/i.test(window.location.pathname)) return;

  function removeAiCredits(){
    const direct = [
      '.ai-credit-dash-card',
      '.ai-credits-box',
      '#dash-ai-credits',
      '#side-ai-credits'
    ];

    direct.forEach(selector => {
      document.querySelectorAll(selector).forEach(node => {
        const shell = node.matches('.ai-credit-dash-card,.ai-credits-box')
          ? node
          : node.closest('.ai-credit-dash-card,.ai-credits-box,.ds-card');
        (shell || node).remove();
      });
    });

    /* Defensive fallback for older cached Account markup. */
    document.querySelectorAll('.ds-card,.fan-pts-box,.prof-summary > div').forEach(node => {
      const label = (node.querySelector('.ds-lbl,.ai-credits-lbl')?.textContent || node.textContent || '')
        .replace(/\s+/g,' ')
        .trim()
        .toLowerCase();
      if (label.includes('ai credits')) node.remove();
    });
  }

  function run(){
    removeAiCredits();

    const root = document.getElementById('acc-screen') || document.body;
    if (!root || root.dataset.pdxAiCleanupObserver === '1') return;
    root.dataset.pdxAiCleanupObserver = '1';

    const observer = new MutationObserver(() => removeAiCredits());
    observer.observe(root,{ childList:true,subtree:true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded',run,{ once:true });
  } else {
    run();
  }

  window.addEventListener('pageshow',removeAiCredits);
  window.addEventListener('paddox:auth-changed',() => setTimeout(removeAiCredits,0));
})();
