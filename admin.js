/* ============================================================
   PADDOX ADMIN — Stable JavaScript entrypoint
   Loads the complete legacy dashboard first, then the A5 repair layer
   before DOMContentLoaded so legacy startup listeners use the repaired
   auth/session functions.
   ============================================================ */
'use strict';
(function paddoxAdminStableEntrypoint(){
  const legacy = '/admin-legacy.js?v=A5_BOOT_1';
  const repair = '/admin-icons.js?v=A5_BOOT_2';

  if (document.readyState === 'loading') {
    document.write(`<script src="${legacy}"><\/script>`);
    document.write(`<script src="${repair}"><\/script>`);
    return;
  }

  const loadScript = (src) => new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });

  loadScript(legacy)
    .then(() => loadScript(repair))
    .catch(error => console.error('PADDOX Admin bootstrap failed:', error));
})();
