/* ============================================================
   PADDOX — Quick View Gallery Controller V2
   Reliable Home + Shop product media galleries.
   ============================================================ */
(function initPaddoxQuickViewGalleryV2(){
  'use strict';

  if (window.__PADDOX_QUICKVIEW_GALLERY_V2__) return;
  window.__PADDOX_QUICKVIEW_GALLERY_V2__ = true;

  const PRODUCT_ENDPOINT = '/api/products?limit=100';
  let activeProductId = '';
  let productPromise = null;
  let syncTimer = 0;
  let rendering = false;
  let lastSignature = '';

  function injectStyles(){
    if (document.getElementById('pdx-qv-gallery-v2-style')) return;
    const style = document.createElement('style');
    style.id = 'pdx-qv-gallery-v2-style';
    style.textContent = `
      #modal-img-main.pdx-qv-stage,
      #modal-img-wrap.pdx-qv-stage{
        position:relative!important;
        overflow:hidden!important;
      }
      #modal-img-main .pdx-qv-main,
      #modal-img-wrap .pdx-qv-main{
        display:block!important;
        width:100%!important;
        height:100%!important;
        max-width:100%!important;
        max-height:100%!important;
        margin:0 auto!important;
        object-fit:contain!important;
        object-position:center!important;
        opacity:1!important;
        visibility:visible!important;
        transform:none!important;
        filter:none!important;
        background:#fff!important;
        position:relative!important;
        z-index:2!important;
      }
      #modal-img-thumbs.pdx-qv-thumbs{
        display:flex!important;
        visibility:visible!important;
        opacity:1!important;
        width:min(100%,450px)!important;
        min-height:72px!important;
        max-width:450px!important;
        align-items:center!important;
        justify-content:flex-start!important;
        gap:9px!important;
        padding:12px 2px 2px!important;
        margin:0 auto!important;
        overflow-x:auto!important;
        overflow-y:hidden!important;
        scrollbar-width:thin!important;
        background:transparent!important;
        position:relative!important;
        z-index:8!important;
      }
      #modal-img-thumbs.pdx-qv-thumbs:empty{display:none!important;}
      .pdx-qv-thumb{
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        width:62px!important;
        height:62px!important;
        min-width:62px!important;
        flex:0 0 62px!important;
        padding:3px!important;
        margin:0!important;
        overflow:hidden!important;
        border:1px solid rgba(255,255,255,.20)!important;
        border-radius:10px!important;
        background:#f3f3f3!important;
        cursor:pointer!important;
        opacity:1!important;
        visibility:visible!important;
        transition:border-color .18s ease,transform .18s ease,box-shadow .18s ease!important;
      }
      .pdx-qv-thumb:hover{
        transform:translateY(-2px)!important;
        border-color:rgba(232,0,45,.72)!important;
      }
      .pdx-qv-thumb.on,
      .pdx-qv-thumb.active{
        border-color:#e8002d!important;
        box-shadow:0 0 0 2px rgba(232,0,45,.18)!important;
      }
      .pdx-qv-thumb img{
        display:block!important;
        width:100%!important;
        height:100%!important;
        max-width:none!important;
        object-fit:contain!important;
        object-position:center!important;
        background:#fff!important;
        opacity:1!important;
        visibility:visible!important;
        filter:none!important;
        transform:none!important;
      }
      #modal-img-wrap.pdx-qv-home-stage{
        padding-bottom:92px!important;
      }
      .pdx-qv-home-thumbs{
        position:absolute!important;
        left:18px!important;
        right:18px!important;
        bottom:15px!important;
        z-index:9!important;
        display:flex!important;
        align-items:center!important;
        justify-content:flex-start!important;
        gap:8px!important;
        min-height:68px!important;
        padding:6px 8px!important;
        overflow-x:auto!important;
        overflow-y:hidden!important;
        border:1px solid rgba(255,255,255,.16)!important;
        border-radius:13px!important;
        background:rgba(8,8,10,.82)!important;
        backdrop-filter:blur(14px)!important;
        -webkit-backdrop-filter:blur(14px)!important;
        scrollbar-width:thin!important;
      }
      .pdx-qv-home-thumbs .pdx-qv-thumb{
        width:54px!important;
        height:54px!important;
        min-width:54px!important;
        flex-basis:54px!important;
      }
      @media(max-width:560px){
        #modal-img-wrap.pdx-qv-home-stage{padding-bottom:78px!important;}
        .pdx-qv-home-thumbs{left:10px!important;right:10px!important;bottom:10px!important;min-height:58px!important;}
        .pdx-qv-home-thumbs .pdx-qv-thumb,
        #modal-img-thumbs.pdx-qv-thumbs .pdx-qv-thumb{
          width:48px!important;height:48px!important;min-width:48px!important;flex-basis:48px!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function getId(product){
    return String(product?._id || product?.id || '').trim();
  }

  function mediaUrl(value){
    if (!value) return '';
    if (typeof value === 'string') return value.trim();
    return String(value.url || value.secure_url || value.secureUrl || value.src || '').trim();
  }

  function imagesFor(product){
    const candidates = [];
    if (Array.isArray(product?.images)) candidates.push(...product.images);
    if (product?.image) candidates.push(product.image);
    if (product?.imageUrl) candidates.push(product.imageUrl);
    if (product?.thumbnail) candidates.push(product.thumbnail);

    const seen = new Set();
    return candidates
      .map(mediaUrl)
      .map(url => url.replace(/^http:\/\//i, 'https://'))
      .filter(url => {
        if (!url) return false;
        if (!/^https?:\/\//i.test(url) && !/^data:image\//i.test(url) && !url.startsWith('/')) return false;
        if (seen.has(url)) return false;
        seen.add(url);
        return true;
      });
  }

  async function products(force = false){
    if (!productPromise || force) {
      productPromise = fetch(PRODUCT_ENDPOINT, {
        credentials:'include',
        headers:{ Accept:'application/json' },
        cache:'no-store'
      }).then(async response => {
        if (!response.ok) throw new Error(`products ${response.status}`);
        const payload = await response.json();
        if (Array.isArray(payload?.data)) return payload.data;
        if (Array.isArray(payload?.products)) return payload.products;
        if (Array.isArray(payload)) return payload;
        return [];
      }).catch(error => {
        productPromise = null;
        throw error;
      });
    }
    return productPromise;
  }

  function modalIsOpen(){
    const overlay = document.getElementById('modal-overlay');
    if (!overlay) return false;
    return overlay.classList.contains('open') || overlay.classList.contains('show') || overlay.getAttribute('aria-hidden') === 'false';
  }

  async function resolveProduct(){
    const rows = await products(false);
    const visibleName = String(document.getElementById('modal-name')?.textContent || '').trim();

    if (activeProductId) {
      const byId = rows.find(item => getId(item) === String(activeProductId));
      if (byId && (!visibleName || String(byId.name || '').trim() === visibleName)) return byId;
    }

    if (visibleName) {
      const byName = rows.find(item => String(item?.name || '').trim() === visibleName);
      if (byName) {
        activeProductId = getId(byName);
        return byName;
      }
    }

    return null;
  }

  function buildMainImage(url, name){
    const img = new Image();
    img.className = 'pdx-qv-main';
    img.alt = name || 'PADDOX product';
    img.decoding = 'async';
    img.loading = 'eager';
    img.referrerPolicy = 'no-referrer';
    img.src = url;
    return img;
  }

  function setMain(stage, urls, index, productName, thumbs){
    if (!stage || !urls.length) return;
    let selected = Math.max(0, Math.min(Number(index) || 0, urls.length - 1));
    let attempts = 0;

    const tryAt = current => {
      if (!stage.isConnected) return;
      selected = (current + urls.length) % urls.length;
      stage.querySelectorAll('.pdx-qv-main,.modal-product-img').forEach(node => node.remove());
      const img = buildMainImage(urls[selected], productName);
      img.addEventListener('error', () => {
        attempts += 1;
        if (attempts < urls.length) tryAt(selected + 1);
      }, { once:true });
      stage.prepend(img);
      thumbs?.querySelectorAll('.pdx-qv-thumb').forEach((thumb, i) => {
        thumb.classList.toggle('on', i === selected);
        thumb.classList.toggle('active', i === selected);
      });
    };

    tryAt(selected);
  }

  function thumbButton(urls, index, productName, select){
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `modal-thumb pdx-qv-thumb${index === 0 ? ' on active' : ''}`;
    button.setAttribute('aria-label', `View ${productName || 'product'} image ${index + 1}`);

    const img = new Image();
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.referrerPolicy = 'no-referrer';
    img.src = urls[index];
    button.appendChild(img);

    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      select(index);
    });
    return button;
  }

  function renderShop(product, urls){
    const stage = document.getElementById('modal-img-main');
    const thumbs = document.getElementById('modal-img-thumbs');
    if (!stage || !thumbs) return false;

    stage.classList.add('pdx-qv-stage');
    thumbs.classList.add('pdx-qv-thumbs');
    thumbs.replaceChildren();

    const select = index => setMain(stage, urls, index, product.name, thumbs);
    urls.forEach((url, index) => thumbs.appendChild(thumbButton(urls, index, product.name, select)));
    setMain(stage, urls, 0, product.name, thumbs);
    return true;
  }

  function renderHome(product, urls){
    const stage = document.getElementById('modal-img-wrap');
    if (!stage) return false;

    stage.classList.add('pdx-qv-stage', 'pdx-qv-home-stage', 'modal-img-has-photo');
    const gallery = document.createElement('div');
    gallery.className = 'pdx-qv-home-thumbs';
    gallery.setAttribute('aria-label', 'Product image gallery');

    const select = index => setMain(stage, urls, index, product.name, gallery);
    urls.forEach((url, index) => gallery.appendChild(thumbButton(urls, index, product.name, select)));

    stage.replaceChildren();
    stage.appendChild(gallery);
    setMain(stage, urls, 0, product.name, gallery);
    return true;
  }

  async function syncGallery(){
    if (rendering || !modalIsOpen()) return;
    rendering = true;
    try {
      const product = await resolveProduct();
      if (!product || !modalIsOpen()) return;
      const urls = imagesFor(product);
      if (!urls.length) return;

      const signature = `${getId(product)}:${urls.join('|')}`;
      const alreadyRendered = signature === lastSignature && (
        document.querySelector('#modal-img-thumbs.pdx-qv-thumbs .pdx-qv-thumb') ||
        document.querySelector('#modal-img-wrap .pdx-qv-home-thumbs .pdx-qv-thumb')
      );
      if (alreadyRendered) return;

      if (!renderShop(product, urls)) renderHome(product, urls);
      lastSignature = signature;
    } catch (error) {
      console.warn('[PADDOX Quick View] Gallery sync skipped:', error);
    } finally {
      rendering = false;
    }
  }

  function scheduleSync(delay = 30){
    clearTimeout(syncTimer);
    syncTimer = window.setTimeout(syncGallery, delay);
  }

  function captureProductFromClick(event){
    if (!(event.target instanceof Element)) return;
    if (event.target.closest('.pwish')) return;

    const trigger = event.target.closest('.quick-view,.quick-view-btn,.pcard');
    if (!trigger) return;
    const card = trigger.closest('.pcard') || trigger;
    const id = trigger.getAttribute('data-id') || card.getAttribute('data-id') || '';
    if (id) activeProductId = String(id);

    scheduleSync(20);
    window.setTimeout(() => scheduleSync(10), 140);
    window.setTimeout(() => scheduleSync(10), 420);
  }

  function installObserver(){
    const overlay = document.getElementById('modal-overlay');
    if (!overlay || overlay.dataset.pdxGalleryV2 === '1') return;
    overlay.dataset.pdxGalleryV2 = '1';

    const observer = new MutationObserver(mutations => {
      if (rendering) return;
      const relevant = mutations.some(mutation => {
        if (mutation.type === 'attributes') return mutation.target === overlay;
        const target = mutation.target instanceof Element ? mutation.target : mutation.target.parentElement;
        if (!target) return false;
        if (target.closest('.pdx-qv-home-thumbs,#modal-img-thumbs.pdx-qv-thumbs')) return false;
        return true;
      });
      if (relevant && modalIsOpen()) scheduleSync(45);
    });

    observer.observe(overlay, {
      attributes:true,
      attributeFilter:['class','aria-hidden'],
      childList:true,
      subtree:true,
      characterData:true
    });
  }

  injectStyles();
  document.addEventListener('click', captureProductFromClick, true);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      installObserver();
      scheduleSync(80);
    }, { once:true });
  } else {
    installObserver();
    scheduleSync(80);
  }

  window.addEventListener('pageshow', () => {
    installObserver();
    if (modalIsOpen()) scheduleSync(80);
  });
})();
