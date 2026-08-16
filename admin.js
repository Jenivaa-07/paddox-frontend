/* ============================================================
   PADDOX ADMIN — Stable JavaScript entrypoint
   Loads the complete legacy dashboard, runtime repair layer,
   authenticated fetch bridge, then the live Overview controller
   before DOMContentLoaded.
   ============================================================ */
'use strict';
(function paddoxAdminStableEntrypoint(){
  const legacy = '/admin-legacy.js?v=A5_BOOT_1';
  const repair = '/admin-icons.js?v=A5_BOOT_2';
  const authBridge = '/admin-auth-fetch.js?v=A5_AUTH_1';
  const overview = '/admin-overview-live.js?v=A5_OVERVIEW_1';

  if (document.readyState === 'loading') {
    document.write(`<script src="${legacy}"><\/script>`);
    document.write(`<script src="${repair}"><\/script>`);
    document.write(`<script src="${authBridge}"><\/script>`);
    document.write(`<script src="${overview}"><\/script>`);
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
    .then(() => loadScript(authBridge))
    .then(() => loadScript(overview))
    .catch(error => console.error('PADDOX Admin bootstrap failed:', error));
})();
