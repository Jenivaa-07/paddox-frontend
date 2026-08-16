/* ============================================================
   PADDOX ADMIN — Stable JavaScript entrypoint
   Loads legacy dashboard, runtime repair, authenticated fetch bridge,
   live Overview, Orders, Products, Inventory, Coupons, Digital Assets,
   Fan Quotes, then deterministic navigation.
   ============================================================ */
'use strict';
(function paddoxAdminStableEntrypoint(){
  const legacy = '/admin-legacy.js?v=A5_BOOT_1';
  const repair = '/admin-icons.js?v=A5_BOOT_2';
  const authBridge = '/admin-auth-fetch.js?v=A5_AUTH_1';
  const overview = '/admin-overview-live.js?v=A5_OVERVIEW_1';
  const orders = '/admin-orders-live.js?v=A5_ORDERS_1';
  const products = '/admin-products-live.js?v=A5_PRODUCTS_1';
  const inventory = '/admin-inventory-live.js?v=A5_INVENTORY_1';
  const coupons = '/admin-coupons-live.js?v=A5_COUPONS_1';
  const assets = '/admin-assets-live.js?v=A5_ASSETS_1';
  const fanquotes = '/admin-fanquotes-live.js?v=A5_FANQUOTES_1';
  const navigation = '/admin-navigation-live.js?v=A5_NAV_3';

  if (document.readyState === 'loading') {
    document.write(`<script src="${legacy}"><\/script>`);
    document.write(`<script src="${repair}"><\/script>`);
    document.write(`<script src="${authBridge}"><\/script>`);
    document.write(`<script src="${overview}"><\/script>`);
    document.write(`<script src="${orders}"><\/script>`);
    document.write(`<script src="${products}"><\/script>`);
    document.write(`<script src="${inventory}"><\/script>`);
    document.write(`<script src="${coupons}"><\/script>`);
    document.write(`<script src="${assets}"><\/script>`);
    document.write(`<script src="${fanquotes}"><\/script>`);
    document.write(`<script src="${navigation}"><\/script>`);
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
    .then(() => loadScript(orders))
    .then(() => loadScript(products))
    .then(() => loadScript(inventory))
    .then(() => loadScript(coupons))
    .then(() => loadScript(assets))
    .then(() => loadScript(fanquotes))
    .then(() => loadScript(navigation))
    .catch(error => console.error('PADDOX Admin bootstrap failed:', error));
})();