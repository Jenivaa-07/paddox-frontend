/* ============================================================
   PADDOX — Shared Quick View Image Controller
   Home + Shop

   Re-mounts product images with DOM Image elements instead of relying on
   fragile inline <img onerror="..."> markup. Product media is resolved from
   the live /api/products payload so both pages always use the Cloudinary URLs
   stored by the admin product workflow.
   ============================================================ */
(function initPaddoxQuickViewImages(){
  'use strict';

  if (window.__PADDOX_QUICKVIEW_IMAGES_V1__) return;
  window.__PADDOX_QUICKVIEW_IMAGES_V1__ = true;

  const PRODUCT_ENDPOINT = '/api/products?limit=100';
  const QUICK_VIEW_SELECTOR = '.quick-view,[data-quick-view],.product-quick-view';
  let productPromise = null;
  let lastProductId = '';
  let renderToken = 0;

  function injectStyles(){
    if (document.getElementById('pdx-qv-image-style')) return;
    const style = document.createElement('style');
    style.id = 'pdx-qv-image-style';
    style.textContent = `
      #modal-img-main.pdx-qv-stage,
      #modal-img-wrap.pdx-qv-stage{
        position:relative!important;
        overflow:hidden!important;
      }
      #modal-img-main .pdx-qv-main-image,
      #modal-img-wrap .pdx-qv-main-image{
        display:block!important;
        width:100%!important;
        height:100%!important;
        max-width:100%!important;
        max-height:100%!important;
        margin:auto!important;
        object-fit:contain!important;
        object-position:center!important;
        opacity:1!important;
        visibility:visible!important;
        filter:none!important;
        transform:none!important;
        position:relative!important;
        z-index:2!important;
      }
      #modal-img-wrap.pdx-qv-stage{
        padding-bottom:96px!important;
      }
      .pdx-qv-home-gallery{
        position:absolute;
        left:18px;
        right:18px;
        bottom:16px;
        z-index:5;
        display:flex;
        justify-content:center;
        gap:8px;
        padding:8px;
        border:1px solid rgba(255,255,255,.18);
        border-radius:14px;
        background:rgba(5,7,10,.78);
        backdrop-filter:blur(14px);
        -webkit-backdrop-filter:blur(14px);
      }
      .pdx-qv-thumb{
        width:58px;
        height:58px;
        flex:0 0 58px;
        padding:3px;
        overflow:hidden;
        border:1px solid rgba(255,255,255,.18);
        border-radius:9px;
        background:#f4f4f4;
        cursor:pointer;
        transition:border-color .18s ease,transform .18s ease,box-shadow .18s ease;
      }
      .pdx-qv-thumb:hover{transform:translateY(-2px);border-color:rgba(232,0,45,.7)}
      .pdx-qv-thumb.active{
        border-color:#e8002d;
        box-shadow:0 0 0 2px rgba(232,0,45,.18);
      }
      .pdx-qv-thumb img{
        display:block!important;
        width:100%!important;
        height:100%!important;
        object-fit:contain!important;
        object-position:center!important;
        opacity:1!important;
        visibility:visible!important;
        filter:none!important;
      }
      .pdx-qv-image-fallback{
        position:absolute;
        inset:0;
        z-index:2;
        display:grid;
        place-items:center;
        padding:28px;
        color:rgba(255,255,255,.65);
        background:linear-gradient(145deg,#15181d,#0b0d11);
        font:700 .72rem/1.5 Inter,Arial,sans-serif;
        letter-spacing:.08em;
        text-align:center;
        text-transform:uppercase;
      }
      #modal-img-thumbs .pdx-qv-thumb{
        width:64px!important;
        height:64px!important;
        flex-basis:64px!important;
      }
      #modal-img-thumbs.pdx-qv-thumbs{
        display:flex!important;
        flex-wrap:wrap!important;
        align-items:center!important;
        justify-content:center!important;
        gap:8px!important;
      }
      @media(max-width:560px){
        #modal-img-wrap.pdx-qv-stage{padding-bottom:78px!important}
        .pdx-qv-home-gallery{left:10px;right:10px;bottom:10px;padding:6px;gap:6px}
        .pdx-qv-thumb{width:48px;height:48px;flex-basis:48px}
        #modal-img-thumbs .pdx-qv-thumb{width:52px!important;height:52px!important;flex-basis:52px!important}
      }
    `;
    document.head.appendChild(style);
  }

  function imageUrl(value){
    if (!value) return '';
    if (typeof value === 'string') return value.trim();
    if (typeof value === 'object') {
      return String(value.url || value.secure_url || value.secureUrl || value.src || value.image || '').trim();
    }
    return '';
  }

  function normalizeImages(product){
    const candidates = [];
    if (Array.isArray(product?.images)) candidates.push(...product.images);
    if (product?.image) candidates.push(product.image);
    if (product?.imageUrl) candidates.push(product.imageUrl);
    if (product?.thumbnail) candidates.push(product.thumbnail);

    const seen = new Set();
    return candidates
      .map(imageUrl)
      .map(url => url.replace(/^http:\/\//i, 'https://'))
      .filter(url => {
        if (!/^https?:\/\//i.test(url) && !/^data:image\//i.test(url) && !url.startsWith('/')) return false;
        if (seen.has(url)) return false;
        seen.add(url);
        return true;
      });
  }

  function productId(product){
    return String(product?._id || product?.id || '').trim();
  }

  async function getProducts(force = false){
    if (!productPromise || force) {
      productPromise = fetch(PRODUCT_ENDPOINT, {
        credentials:'include',
        headers:{ Accept:'application/json' },
        cache:'no-store'
      })
        .then(async response => {
          if (!response.ok) throw new Error(`Product media request failed (${response.status})`);
          const payload = await response.json();
          const rows = Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload?.products)
              ? payload.products
              : [];
          return rows;
        })
        .catch(error => {
          productPromise = null;
          throw error;
        });
    }
    return productPromise;
  }

  async function getProduct(id){
    const key = String(id || '').trim();
    if (!key) return null;
    let rows = await getProducts(false);
    let product = rows.find(item => productId(item) === key) || null;
    if (!product) {
      rows = await getProducts(true);
      product = rows.find(item => productId(item) === key) || null;
    }
    return product;
  }

  function createImage(url, alt, onFailure){
    const image = new Image();
    image.className = 'pdx-qv-main-image';
    image.alt = alt || 'PADDOX product';
    image.decoding = 'async';
    image.loading = 'eager';
    image.referrerPolicy = 'no-referrer';
    image.addEventListener('error', () => onFailure?.(), { once:true });
    image.src = url;
    return image;
  }

  function showFallback(stage){
    if (!stage) return;
    stage.querySelectorAll('.pdx-qv-main-image,.pdx-qv-image-fallback').forEach(node => node.remove());
    const fallback = document.createElement('div');
    fallback.className = 'pdx-qv-image-fallback';
    fallback.textContent = 'Product image is temporarily unavailable';
    stage.appendChild(fallback);
  }

  function mountMain(stage, images, selectedIndex, alt, onSelected){
    if (!stage || !images.length) return showFallback(stage);
    const start = Math.max(0, Math.min(Number(selectedIndex) || 0, images.length - 1));
    let attempt = 0;

    const tryImage = index => {
      if (!stage.isConnected) return;
      const safeIndex = (index + images.length) % images.length;
      stage.querySelectorAll('.pdx-qv-main-image,.pdx-qv-image-fallback').forEach(node => node.remove());
      const image = createImage(images[safeIndex], alt, () => {
        attempt += 1;
        if (attempt < images.length) tryImage(safeIndex + 1);
        else showFallback(stage);
      });
      stage.prepend(image);
      onSelected?.(safeIndex);
    };

    tryImage(start);
  }

  function createThumb(images, index, alt, select){
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `pdx-qv-thumb${index === 0 ? ' active' : ''}`;
    button.setAttribute('aria-label', `View product image ${index + 1}`);

    const image = new Image();
    image.alt = '';
    image.decoding = 'async';
    image.loading = 'lazy';
    image.referrerPolicy = 'no-referrer';
    image.src = images[index];
    button.appendChild(image);

    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      select(index, button);
    });
    return button;
  }

  function setActiveThumb(container, index){
    if (!container) return;
    Array.from(container.querySelectorAll('.pdx-qv-thumb')).forEach((thumb, thumbIndex) => {
      thumb.classList.toggle('active', thumbIndex === index);
    });
  }

  function renderShopGallery(product, images){
    const stage = document.getElementById('modal-img-main');
    const thumbs = document.getElementById('modal-img-thumbs');
    if (!stage) return false;

    stage.classList.add('pdx-qv-stage');
    if (thumbs) {
      thumbs.classList.add('pdx-qv-thumbs');
      thumbs.replaceChildren();
    }

    const select = (index, button) => {
      mountMain(stage, images, index, product?.name, selected => {
        setActiveThumb(thumbs, selected);
      });
      if (button) setActiveThumb(thumbs, index);
    };

    images.forEach((_, index) => thumbs?.appendChild(createThumb(images, index, product?.name, select)));
    mountMain(stage, images, 0, product?.name, selected => setActiveThumb(thumbs, selected));
    return true;
  }

  function renderHomeGallery(product, images){
    const stage = document.getElementById('modal-img-wrap');
    if (!stage) return false;

    stage.classList.add('pdx-qv-stage', 'modal-img-has-photo');
    stage.querySelectorAll('.pdx-qv-home-gallery').forEach(node => node.remove());

    const gallery = document.createElement('div');
    gallery.className = 'pdx-qv-home-gallery';
    gallery.setAttribute('aria-label', 'Product image gallery');

    const select = (index, button) => {
      mountMain(stage, images, index, product?.name, selected => setActiveThumb(gallery, selected));
      if (button) setActiveThumb(gallery, index);
    };

    images.forEach((_, index) => gallery.appendChild(createThumb(images, index, product?.name, select)));
    stage.appendChild(gallery);
    mountMain(stage, images, 0, product?.name, selected => setActiveThumb(gallery, selected));
    return true;
  }

  async function repairQuickView(id){
    const token = ++renderToken;
    try {
      const product = await getProduct(id);
      if (token !== renderToken || !product) return;
      const images = normalizeImages(product);
      if (!images.length) return;

      /* Shop and Home use different modal media containers. Whichever exists
         on the current page is repaired without touching the modal's cart,
         pricing, sizing or wishlist logic. */
      if (!renderShopGallery(product, images)) renderHomeGallery(product, images);
    } catch (error) {
      console.warn('[PADDOX Quick View] Could not refresh product media:', error);
    }
  }

  function extractClickedProductId(target){
    if (!(target instanceof Element)) return '';
    const quick = target.closest(QUICK_VIEW_SELECTOR);
    if (!quick) return '';
    return String(
      quick.getAttribute('data-id') ||
      quick.getAttribute('data-product-id') ||
      quick.closest('[data-id]')?.getAttribute('data-id') ||
      quick.closest('[data-product-id]')?.getAttribute('data-product-id') ||
      ''
    ).trim();
  }

  function queueRepair(id){
    if (!id) return;
    lastProductId = id;
    /* Existing Home/Shop handlers run on the clicked button first. Scheduling
       the repair lets their modal content populate, then replaces only media. */
    window.setTimeout(() => repairQuickView(id), 0);
    window.setTimeout(() => repairQuickView(id), 180);
  }

  injectStyles();

  document.addEventListener('click', event => {
    const id = extractClickedProductId(event.target);
    if (id) queueRepair(id);
  }, false);

  /* Backup for modal-opening code paths that do not originate from the visible
     Quick View button (for example recommendation cards added later). */
  const installObserver = () => {
    const overlay = document.getElementById('modal-overlay');
    if (!overlay || overlay.dataset.pdxQvObserver === '1') return;
    overlay.dataset.pdxQvObserver = '1';
    new MutationObserver(() => {
      const open = overlay.classList.contains('open') || overlay.classList.contains('show') || overlay.getAttribute('aria-hidden') === 'false';
      if (open && lastProductId) window.setTimeout(() => repairQuickView(lastProductId), 20);
    }).observe(overlay, { attributes:true, attributeFilter:['class','aria-hidden'] });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', installObserver, { once:true });
  else installObserver();
})();
