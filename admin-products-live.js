/* ============================================================
   PADDOX ADMIN — Products Live Controller
   Owns the Products workspace after legacy Admin initialises.
   ============================================================ */
(function paddoxAdminProductsLive(){
  'use strict';

  const REFRESH_MS = 45000;
  const state = {
    products: [],
    filtered: [],
    syncing: false,
    editingId: null,
    selectedFiles: [],
    lastSync: null,
    error: ''
  };
  let refreshTimer = null;
  let listenersBound = false;

  const TEAM_OPTIONS = [
    'Ferrari','Red Bull Racing','Mercedes','McLaren','Aston Martin','Alpine',
    'Williams','Haas F1 Team','Racing Bulls','Audi','Cadillac',
    'PADDOX Original','Collector'
  ];
  const CATEGORY_OPTIONS = [
    ['apparel','Apparel'],['collectibles','Collectibles'],['accessories','Accessories'],
    ['posters','Posters'],['custom','Custom']
  ];

  function escapeHtml(value=''){
    return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  }
  function money(value=0){ return `₹${Number(value || 0).toLocaleString('en-IN')}`; }
  function imageUrl(product={}){ return product?.images?.[0]?.url || ''; }
  function effectivePrice(product={}){
    return product?.onSale && Number(product?.salePrice) > 0 ? Number(product.salePrice) : Number(product?.price || 0);
  }
  function stockState(product={}){
    const stock = Number(product?.stock || 0);
    const threshold = Number(product?.lowStockThreshold ?? 10);
    if (stock <= 0) return ['OUT','is-out'];
    if (stock <= threshold) return ['LOW','is-low'];
    return ['IN STOCK','is-stocked'];
  }
  function normalize(value=''){ return String(value || '').trim().toLowerCase(); }
  function isProductsPage(){ return document.getElementById('adm-products')?.classList.contains('on'); }
  function extractProducts(payload={}){
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.products)) return payload.products;
    if (Array.isArray(payload?.data?.products)) return payload.data.products;
    return [];
  }
  function showToast(message){
    if (typeof window.showToast === 'function') window.showToast(message);
    else console.log(message);
  }

  function ensureStyles(){
    if (document.getElementById('pdx-admin-products-style')) return;
    const link = document.createElement('link');
    link.id = 'pdx-admin-products-style';
    link.rel = 'stylesheet';
    link.href = '/admin-products-live.css?v=A5_PRODUCTS_1';
    document.head.appendChild(link);
  }

  function setText(id, value){ const el = document.getElementById(id); if (el) el.textContent = value; }

  function renderStats(){
    const products = state.products;
    const featured = products.filter(p => p?.isFeatured).length;
    const sale = products.filter(p => p?.onSale && Number(p?.salePrice) > 0).length;
    const low = products.filter(p => Number(p?.stock || 0) <= Number(p?.lowStockThreshold ?? 10)).length;
    const units = products.reduce((sum,p) => sum + Math.max(0, Number(p?.stock || 0)), 0);
    setText('products-count-stat', products.length.toLocaleString('en-IN'));
    setText('products-featured-stat', featured.toLocaleString('en-IN'));
    setText('products-sale-stat', sale.toLocaleString('en-IN'));
    setText('products-low-stat', low.toLocaleString('en-IN'));
    setText('products-stock-stat', units.toLocaleString('en-IN'));
  }

  function teamMatches(productTeam, selected){
    const wanted = normalize(selected);
    if (!wanted || wanted === 'all') return true;
    const current = normalize(productTeam);
    if (current === wanted || current.includes(wanted) || wanted.includes(current)) return true;
    const aliases = {
      'red bull racing':['red bull','oracle red bull'],
      'haas f1 team':['haas'],
      'racing bulls':['rb','visa cash app rb'],
      'audi':['sauber','kick sauber'],
      'paddox original':['collector','original']
    };
    return (aliases[wanted] || []).some(alias => current.includes(alias));
  }

  function applyFilters(){
    const category = document.getElementById('product-category-filter')?.value || 'all';
    const sale = document.getElementById('product-sale-filter')?.value || 'all';
    const team = document.getElementById('product-team-filter')?.value || 'all';
    const search = normalize(document.getElementById('product-search-input')?.value || '');

    state.filtered = state.products.filter(product => {
      if (category !== 'all' && normalize(product?.category) !== normalize(category)) return false;
      if (sale === 'sale' && !(product?.onSale && Number(product?.salePrice) > 0)) return false;
      if (sale === 'regular' && product?.onSale && Number(product?.salePrice) > 0) return false;
      if (!teamMatches(product?.team, team)) return false;
      if (!search) return true;
      const haystack = [product?.name,product?.team,product?.category,product?.sku,product?.badge,product?.description]
        .map(normalize).join(' ');
      return haystack.includes(search);
    });

    renderRows();
  }

  function renderRows(){
    const tbody = document.getElementById('products-tbody');
    if (!tbody) return;

    if (state.error && !state.products.length) {
      tbody.innerHTML = `<tr><td colspan="8" class="products-empty-cell"><div class="products-empty-state"><strong>PRODUCT FEED UNAVAILABLE</strong><span>${escapeHtml(state.error)}</span><button type="button" onclick="PADDOX_refreshProducts()">RETRY SYNC</button></div></td></tr>`;
      return;
    }

    if (!state.filtered.length) {
      tbody.innerHTML = `<tr><td colspan="8" class="products-empty-cell"><div class="products-empty-state"><strong>NO MATCHING PRODUCTS</strong><span>Try another category, team, pricing filter or search term.</span></div></td></tr>`;
      return;
    }

    tbody.innerHTML = state.filtered.map(product => {
      const id = escapeHtml(String(product?._id || ''));
      const image = imageUrl(product);
      const [stockLabel, stockClass] = stockState(product);
      const saleActive = product?.onSale && Number(product?.salePrice) > 0;
      const flags = [
        product?.isFeatured ? '<span class="pdx-product-flag is-featured">FEATURED</span>' : '',
        saleActive ? `<span class="pdx-product-flag is-sale">-${Number(product?.discountPercent || Math.round(((Number(product.price)-Number(product.salePrice))/Math.max(1,Number(product.price)))*100))}%</span>` : '',
        product?.badge ? `<span class="pdx-product-flag">${escapeHtml(String(product.badge).toUpperCase())}</span>` : '',
        product?.isActive === false ? '<span class="pdx-product-flag is-paused">PAUSED</span>' : ''
      ].filter(Boolean).join('');

      return `<tr class="pdx-product-row" data-product-id="${id}">
        <td>
          <button type="button" class="pdx-product-main" onclick="PADDOX_editProduct('${id}')">
            <span class="pdx-product-thumb">${image ? `<img src="${escapeHtml(image)}" alt="" loading="lazy">` : '<span>PDX</span>'}</span>
            <span class="pdx-product-copy"><strong>${escapeHtml(product?.name || 'Untitled Product')}</strong><small>${escapeHtml(product?.sku || product?.slug || 'NO SKU')}</small></span>
          </button>
        </td>
        <td><span class="pdx-product-category">${escapeHtml(String(product?.category || '—').toUpperCase())}</span></td>
        <td><div class="pdx-product-team"><strong>${escapeHtml(product?.team || 'PADDOX')}</strong><small>${escapeHtml(product?.isLimited ? 'Limited programme' : 'Standard catalogue')}</small></div></td>
        <td><div class="pdx-product-price">${saleActive ? `<strong>${escapeHtml(money(product.salePrice))}</strong><del>${escapeHtml(money(product.price))}</del>` : `<strong>${escapeHtml(money(product.price))}</strong><small>REGULAR</small>`}</div></td>
        <td><div class="pdx-product-stock"><strong>${Number(product?.stock || 0).toLocaleString('en-IN')}</strong><span class="${stockClass}">${stockLabel}</span></div></td>
        <td><div class="pdx-product-flags">${flags || '<span class="pdx-product-flag is-muted">STANDARD</span>'}</div></td>
        <td><button type="button" class="pdx-product-status ${product?.isActive === false ? 'is-inactive' : 'is-active'}" onclick="PADDOX_toggleProductActive('${id}')"><span></span>${product?.isActive === false ? 'INACTIVE' : 'LIVE'}</button></td>
        <td><div class="pdx-product-actions"><button type="button" class="pdx-product-edit" onclick="PADDOX_editProduct('${id}')">EDIT</button><button type="button" class="pdx-product-feature ${product?.isFeatured ? 'is-on' : ''}" onclick="PADDOX_toggleProductFeatured('${id}')">${product?.isFeatured ? 'UNFEATURE' : 'FEATURE'}</button><button type="button" class="pdx-product-delete" onclick="PADDOX_deleteProduct('${id}',this)">DELETE</button></div></td>
      </tr>`;
    }).join('');
  }

  async function loadLiveProducts(silent=false){
    if (state.syncing) return state.products;
    state.syncing = true;
    state.error = '';
    if (!silent) showToast('⏳ Syncing live catalogue...');
    try {
      const response = await fetch('/api/products/admin/all?limit=500&sort=newest', {
        method:'GET', credentials:'include', cache:'no-store', headers:{ Accept:'application/json' }
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.success === false) throw new Error(payload?.message || `Product sync failed (${response.status})`);
      state.products = extractProducts(payload);
      state.lastSync = new Date();
      window.REAL_PRODUCTS = state.products;
      renderStats();
      applyFilters();
      if (!silent) showToast(`✅ ${state.products.length} live products synced`);
      return state.products;
    } catch (error) {
      state.error = error?.message || 'Products unavailable';
      console.warn('PADDOX Admin Products sync failed:', error);
      renderStats();
      applyFilters();
      if (!silent) showToast(`❌ ${state.error}`);
      return state.products;
    } finally {
      state.syncing = false;
    }
  }

  function findProduct(id){ return state.products.find(product => String(product?._id || '') === String(id || '')) || null; }

  function ensureModal(){
    let modal = document.getElementById('pdx-product-editor');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = 'pdx-product-editor';
    modal.className = 'pdx-product-editor';
    modal.setAttribute('aria-hidden','true');
    modal.innerHTML = `
      <div class="pdx-product-editor-backdrop"></div>
      <div class="pdx-product-editor-panel" role="dialog" aria-modal="true" aria-label="Product editor">
        <form id="pdx-product-form">
          <div class="pdx-product-editor-head">
            <div><div class="pdx-product-editor-kicker"><span></span> LIVE CATALOGUE CONTROL</div><h2 id="pdx-product-editor-title">ADD PRODUCT</h2><p id="pdx-product-editor-sub">Create a merchandise entry and sync it to the live Shop.</p></div>
            <button type="button" class="pdx-product-editor-close" onclick="PADDOX_closeProductEditor()">×</button>
          </div>

          <div class="pdx-product-editor-grid">
            <label class="is-wide"><span>PRODUCT NAME</span><input id="pdx-prod-name" required maxlength="120" placeholder="e.g. McLaren Race Week Tee"></label>
            <label><span>TEAM / COLLECTION</span><select id="pdx-prod-team">${TEAM_OPTIONS.map(team => `<option value="${escapeHtml(team)}">${escapeHtml(team)}</option>`).join('')}</select></label>
            <label><span>CATEGORY</span><select id="pdx-prod-category">${CATEGORY_OPTIONS.map(([value,label]) => `<option value="${value}">${label}</option>`).join('')}</select></label>
            <label><span>ORIGINAL PRICE ₹</span><input id="pdx-prod-price" type="number" min="1" step="1" required placeholder="2499"></label>
            <label><span>SALE PRICE ₹</span><input id="pdx-prod-sale" type="number" min="0" step="1" placeholder="Optional"></label>
            <label><span>STOCK</span><input id="pdx-prod-stock" type="number" min="0" step="1" required value="0"></label>
            <label><span>LOW STOCK ALERT</span><input id="pdx-prod-threshold" type="number" min="0" step="1" value="10"></label>
            <label><span>BADGE</span><select id="pdx-prod-badge"><option value="">None</option><option value="new">New</option><option value="hot">Hot</option><option value="ltd">Limited</option><option value="sale">Sale</option></select></label>
            <label><span>RATING</span><select id="pdx-prod-rating"><option value="0">Unrated</option><option value="5">5.0</option><option value="4.5">4.5</option><option value="4">4.0</option><option value="3.5">3.5</option><option value="3">3.0</option></select></label>
            <label><span>SKU</span><input id="pdx-prod-sku" maxlength="80" placeholder="Optional SKU"></label>
            <div class="pdx-product-toggle-group"><label><input id="pdx-prod-featured" type="checkbox"><span>FEATURED DROP</span></label><label><input id="pdx-prod-active" type="checkbox" checked><span>LIVE IN SHOP</span></label></div>
            <label class="is-wide"><span>DESCRIPTION</span><textarea id="pdx-prod-description" rows="4" maxlength="2000" placeholder="Product description"></textarea></label>
          </div>

          <div class="pdx-product-upload">
            <input id="pdx-prod-images" type="file" accept="image/jpeg,image/png,image/webp,image/*" multiple hidden>
            <button id="pdx-product-dropzone" type="button"><strong>＋ ADD PRODUCT IMAGES</strong><span>JPG / PNG / WebP · up to 10 files · first image becomes Shop cover</span></button>
            <div id="pdx-product-existing-images" class="pdx-product-image-grid"></div>
            <div id="pdx-product-new-images" class="pdx-product-image-grid"></div>
          </div>

          <div class="pdx-product-editor-footer"><div id="pdx-product-editor-note">Cloudinary images are preserved when no replacements are uploaded.</div><button type="button" class="pdx-product-cancel" onclick="PADDOX_closeProductEditor()">CANCEL</button><button id="pdx-product-save" type="submit" class="pdx-product-save">SAVE PRODUCT</button></div>
        </form>
      </div>`;
    document.body.appendChild(modal);

    modal.querySelector('.pdx-product-editor-backdrop')?.addEventListener('click', closeModal);
    modal.querySelector('#pdx-product-dropzone')?.addEventListener('click', () => modal.querySelector('#pdx-prod-images')?.click());
    modal.querySelector('#pdx-prod-images')?.addEventListener('change', event => {
      state.selectedFiles = Array.from(event.target.files || []).slice(0,10);
      renderNewFilePreviews();
    });
    modal.querySelector('#pdx-product-form')?.addEventListener('submit', saveProductFromForm);
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && modal.classList.contains('is-open')) closeModal(); });
    return modal;
  }

  function renderExistingImages(product){
    const host = document.getElementById('pdx-product-existing-images');
    if (!host) return;
    const images = Array.isArray(product?.images) ? product.images : [];
    host.innerHTML = images.length ? images.map((img,index) => `<div class="pdx-product-image-card"><img src="${escapeHtml(img?.url || '')}" alt="" loading="lazy"><span>${index === 0 ? 'CURRENT COVER' : `IMAGE ${index+1}`}</span></div>`).join('') : '';
  }

  function renderNewFilePreviews(){
    const host = document.getElementById('pdx-product-new-images');
    if (!host) return;
    host.innerHTML = '';
    state.selectedFiles.forEach((file,index) => {
      const card = document.createElement('div');
      card.className = 'pdx-product-image-card is-new';
      const url = URL.createObjectURL(file);
      card.innerHTML = `<img src="${url}" alt=""><span>${index === 0 ? 'NEW COVER' : `NEW IMAGE ${index+1}`}</span>`;
      card.querySelector('img')?.addEventListener('load', () => URL.revokeObjectURL(url), { once:true });
      host.appendChild(card);
    });
  }

  function openModal(product=null){
    const modal = ensureModal();
    state.editingId = product?._id ? String(product._id) : null;
    state.selectedFiles = [];
    modal.querySelector('#pdx-prod-images').value = '';
    modal.querySelector('#pdx-product-new-images').innerHTML = '';

    const set = (id,value='') => { const el = modal.querySelector(`#${id}`); if (el) el.value = value ?? ''; };
    set('pdx-prod-name', product?.name || '');
    set('pdx-prod-team', product?.team || 'PADDOX Original');
    set('pdx-prod-category', product?.category || 'apparel');
    set('pdx-prod-price', product?.price ?? '');
    set('pdx-prod-sale', product?.salePrice ?? '');
    set('pdx-prod-stock', product?.stock ?? 0);
    set('pdx-prod-threshold', product?.lowStockThreshold ?? 10);
    set('pdx-prod-badge', product?.badge || '');
    set('pdx-prod-rating', Number(product?.ratings?.average || 0));
    set('pdx-prod-sku', product?.sku || '');
    set('pdx-prod-description', product?.description || '');
    modal.querySelector('#pdx-prod-featured').checked = !!product?.isFeatured;
    modal.querySelector('#pdx-prod-active').checked = product ? product?.isActive !== false : true;

    modal.querySelector('#pdx-product-editor-title').textContent = product ? 'EDIT PRODUCT' : 'ADD PRODUCT';
    modal.querySelector('#pdx-product-editor-sub').textContent = product ? 'Update catalogue data without losing existing Cloudinary media.' : 'Create a merchandise entry and sync it to the live Shop.';
    modal.querySelector('#pdx-product-save').textContent = product ? 'UPDATE PRODUCT' : 'CREATE PRODUCT';
    renderExistingImages(product);
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden','false');
    document.body.classList.add('pdx-product-editor-open');
    setTimeout(() => modal.querySelector('#pdx-prod-name')?.focus(), 50);
  }

  function closeModal(){
    const modal = document.getElementById('pdx-product-editor');
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden','true');
    document.body.classList.remove('pdx-product-editor-open');
    state.editingId = null;
    state.selectedFiles = [];
  }

  function appendCoreProductFields(formData, source, overrides={}){
    const pick = (key, fallback='') => Object.prototype.hasOwnProperty.call(overrides,key) ? overrides[key] : source?.[key] ?? fallback;
    formData.append('name', String(pick('name','')).trim());
    formData.append('team', String(pick('team','PADDOX Original')).trim());
    formData.append('category', String(pick('category','apparel')).toLowerCase());
    formData.append('price', String(Number(pick('price',0))));
    const salePrice = pick('salePrice','');
    formData.append('salePrice', salePrice === null || salePrice === undefined ? '' : String(salePrice));
    formData.append('stock', String(Math.max(0, Number(pick('stock',0)))));
    formData.append('lowStockThreshold', String(Math.max(0, Number(pick('lowStockThreshold',10)))));
    formData.append('description', String(pick('description','')).trim());
    formData.append('shortDesc', String(pick('shortDesc',source?.shortDesc || pick('description',''))).trim().slice(0,300));
    formData.append('badge', String(pick('badge','') || ''));
    formData.append('isFeatured', String(Boolean(pick('isFeatured',false))));
    formData.append('isActive', String(Boolean(pick('isActive',true))));
    const rating = Number(overrides.rating ?? source?.ratings?.average ?? 0);
    formData.append('ratings[average]', String(Math.max(0,Math.min(5,rating))));
    formData.append('ratings[count]', String(Number(source?.ratings?.count || (rating > 0 ? 1 : 0))));
    const sku = String(pick('sku','') || '').trim();
    if (sku) formData.append('sku', sku);
    return formData;
  }

  async function saveProductFromForm(event){
    event.preventDefault();
    const modal = ensureModal();
    const values = {
      name: modal.querySelector('#pdx-prod-name')?.value.trim() || '',
      team: modal.querySelector('#pdx-prod-team')?.value || 'PADDOX Original',
      category: modal.querySelector('#pdx-prod-category')?.value || 'apparel',
      price: Number(modal.querySelector('#pdx-prod-price')?.value || 0),
      salePrice: modal.querySelector('#pdx-prod-sale')?.value === '' ? '' : Number(modal.querySelector('#pdx-prod-sale')?.value || 0),
      stock: Number(modal.querySelector('#pdx-prod-stock')?.value || 0),
      lowStockThreshold: Number(modal.querySelector('#pdx-prod-threshold')?.value || 10),
      badge: modal.querySelector('#pdx-prod-badge')?.value || '',
      rating: Number(modal.querySelector('#pdx-prod-rating')?.value || 0),
      sku: modal.querySelector('#pdx-prod-sku')?.value.trim() || '',
      description: modal.querySelector('#pdx-prod-description')?.value.trim() || '',
      isFeatured: !!modal.querySelector('#pdx-prod-featured')?.checked,
      isActive: !!modal.querySelector('#pdx-prod-active')?.checked
    };

    if (!values.name) return showToast('❌ Product name is required');
    if (!(values.price > 0)) return showToast('❌ Product price must be greater than zero');
    if (values.salePrice !== '' && Number(values.salePrice) >= values.price) return showToast('❌ Sale price must be less than original price');

    const existing = state.editingId ? findProduct(state.editingId) : null;
    const formData = appendCoreProductFields(new FormData(), existing || {}, values);
    state.selectedFiles.forEach(file => formData.append('images', file));

    const saveButton = modal.querySelector('#pdx-product-save');
    if (saveButton) { saveButton.disabled = true; saveButton.textContent = state.editingId ? 'UPDATING…' : 'CREATING…'; }

    try {
      const endpoint = state.editingId ? `/api/products/${encodeURIComponent(state.editingId)}` : '/api/products';
      const response = await fetch(endpoint, {
        method: state.editingId ? 'PUT' : 'POST',
        credentials:'include',
        body: formData,
        headers:{ Accept:'application/json' }
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.success === false) throw new Error(payload?.message || `Product save failed (${response.status})`);
      showToast(state.editingId ? '✅ Product updated' : '🔥 Product created');
      closeModal();
      await loadLiveProducts(true);
      if (typeof window.PADDOX_refreshAdminOverview === 'function') window.PADDOX_refreshAdminOverview();
    } catch (error) {
      console.error('PADDOX product save failed:', error);
      showToast(`❌ ${error?.message || 'Product save failed'}`);
    } finally {
      if (saveButton) { saveButton.disabled = false; saveButton.textContent = state.editingId ? 'UPDATE PRODUCT' : 'CREATE PRODUCT'; }
    }
  }

  async function updateCoreProduct(product, overrides){
    if (!product?._id) return false;
    const formData = appendCoreProductFields(new FormData(), product, overrides || {});
    try {
      const response = await fetch(`/api/products/${encodeURIComponent(product._id)}`, {
        method:'PUT', credentials:'include', body:formData, headers:{ Accept:'application/json' }
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.success === false) throw new Error(payload?.message || `Product update failed (${response.status})`);
      await loadLiveProducts(true);
      if (typeof window.PADDOX_refreshAdminOverview === 'function') window.PADDOX_refreshAdminOverview();
      return true;
    } catch (error) {
      console.error('PADDOX product quick update failed:', error);
      showToast(`❌ ${error?.message || 'Product update failed'}`);
      return false;
    }
  }

  async function toggleFeatured(id){
    const product = findProduct(id); if (!product) return;
    const next = !product.isFeatured;
    if (await updateCoreProduct(product,{ isFeatured:next })) showToast(next ? '⭐ Product featured' : '✅ Featured flag removed');
  }

  async function toggleActive(id){
    const product = findProduct(id); if (!product) return;
    const next = product.isActive === false;
    if (await updateCoreProduct(product,{ isActive:next })) showToast(next ? '✅ Product is live in Shop' : '⏸ Product paused from Shop');
  }

  async function deleteProduct(id, button){
    const product = findProduct(id); if (!product) return;
    if (!button?.dataset?.armed) {
      if (button) {
        button.dataset.armed = '1';
        button.textContent = 'CONFIRM';
        button.classList.add('is-armed');
        setTimeout(() => {
          if (!button?.isConnected) return;
          delete button.dataset.armed;
          button.textContent = 'DELETE';
          button.classList.remove('is-armed');
        }, 4500);
      }
      return;
    }
    try {
      const response = await fetch(`/api/products/${encodeURIComponent(id)}`, { method:'DELETE', credentials:'include', headers:{ Accept:'application/json' } });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.success === false) throw new Error(payload?.message || `Delete failed (${response.status})`);
      showToast(`🗑️ ${product.name || 'Product'} deleted`);
      await loadLiveProducts(true);
      if (typeof window.PADDOX_refreshAdminOverview === 'function') window.PADDOX_refreshAdminOverview();
    } catch (error) {
      console.error('PADDOX product delete failed:', error);
      showToast(`❌ ${error?.message || 'Delete failed'}`);
    }
  }

  function syncTopbarButton(){
    if (!isProductsPage()) return;
    const button = document.getElementById('adm-action-btn');
    if (!button) return;
    button.hidden = false;
    button.style.display = '';
    button.classList.remove('is-hidden');
    button.textContent = '+ ADD PRODUCT';
    button.onclick = () => openModal(null);
  }

  function bindFilters(){
    if (listenersBound) return;
    listenersBound = true;
    ['product-category-filter','product-sale-filter','product-team-filter'].forEach(id => document.getElementById(id)?.addEventListener('change', applyFilters));
    document.getElementById('product-search-input')?.addEventListener('input', applyFilters);
    document.getElementById('products-refresh-btn')?.addEventListener('click', () => loadLiveProducts(false));
    document.querySelectorAll('.adm-nav-item[data-page]').forEach(item => item.addEventListener('click', () => {
      setTimeout(() => {
        if (item.dataset.page === 'products') { syncTopbarButton(); loadLiveProducts(true); }
      }, 0);
    }));
    window.addEventListener('hashchange', () => { if (window.location.hash === '#products') setTimeout(() => { syncTopbarButton(); loadLiveProducts(true); },0); });
  }

  function installAutoRefresh(){
    if (refreshTimer) return;
    refreshTimer = setInterval(() => {
      if (isProductsPage() && document.visibilityState !== 'hidden') loadLiveProducts(true);
    }, REFRESH_MS);
  }

  function bootstrap(){
    ensureStyles();
    ensureModal();
    bindFilters();
    installAutoRefresh();

    window.loadProducts = loadLiveProducts;
    window.renderProducts = applyFilters;
    window.openAddModal = () => openModal(null);
    window.closeAddModal = closeModal;
    window.PADDOX_refreshProducts = () => loadLiveProducts(false);
    window.PADDOX_editProduct = id => { const product = findProduct(id); if (product) openModal(product); else showToast('❌ Product not found'); };
    window.PADDOX_toggleProductFeatured = toggleFeatured;
    window.PADDOX_toggleProductActive = toggleActive;
    window.PADDOX_deleteProduct = deleteProduct;
    window.PADDOX_closeProductEditor = closeModal;
    window.PADDOX_ADMIN_PRODUCTS_STATE = state;

    syncTopbarButton();
    loadLiveProducts(true);
  }

  ensureStyles();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootstrap, { once:true });
  else bootstrap();
})();
