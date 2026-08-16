/* ============================================================
   PADDOX ADMIN — Inventory Live Controller
   Owns stock control after legacy Admin initialises.
   ============================================================ */
(function paddoxAdminInventoryLive(){
  'use strict';

  const REFRESH_MS = 45000;
  const state = { products:[], filtered:[], syncing:false, lastSync:null, error:'' };
  let refreshTimer = null;
  let listenersBound = false;

  function escapeHtml(value=''){
    return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  }
  function normalize(value=''){ return String(value || '').trim().toLowerCase(); }
  function imageUrl(product={}){ return product?.images?.[0]?.url || ''; }
  function thresholdOf(product={}){ return Math.max(0, Number(product?.lowStockThreshold ?? 10)); }
  function stockOf(product={}){ return Math.max(0, Number(product?.stock || 0)); }
  function isInventoryPage(){ return document.getElementById('adm-inventory')?.classList.contains('on'); }
  function showToast(message){ if (typeof window.showToast === 'function') window.showToast(message); else console.log(message); }
  function extractProducts(payload={}){
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.products)) return payload.products;
    if (Array.isArray(payload?.data?.products)) return payload.data.products;
    return [];
  }
  function stockMeta(product={}){
    const stock = stockOf(product);
    const threshold = thresholdOf(product);
    if (stock <= 0) return { key:'out', label:'OUT OF STOCK', cls:'is-out' };
    if (stock <= threshold) return { key:'low', label:'LOW STOCK', cls:'is-low' };
    return { key:'in', label:'HEALTHY', cls:'is-healthy' };
  }

  function ensureStyles(){
    if (document.getElementById('pdx-admin-inventory-style')) return;
    const link = document.createElement('link');
    link.id = 'pdx-admin-inventory-style';
    link.rel = 'stylesheet';
    link.href = '/admin-inventory-live.css?v=A5_INVENTORY_1';
    document.head.appendChild(link);
  }

  function setText(id, value){ const el=document.getElementById(id); if(el) el.textContent=value; }

  function renderStats(){
    const products = state.products;
    const units = products.reduce((sum,p)=>sum + stockOf(p),0);
    const low = products.filter(p=>stockOf(p)>0 && stockOf(p)<=thresholdOf(p)).length;
    const out = products.filter(p=>stockOf(p)<=0).length;
    setText('inventory-total-products', products.length.toLocaleString('en-IN'));
    setText('inventory-total-units', units.toLocaleString('en-IN'));
    setText('inventory-low-count', low.toLocaleString('en-IN'));
    setText('inventory-out-count', out.toLocaleString('en-IN'));
  }

  function applyFilters(){
    const stockFilter = document.getElementById('inventory-stock-filter')?.value || 'all';
    const search = normalize(document.getElementById('inventory-search-input')?.value || '');

    state.filtered = state.products.filter(product => {
      const meta = stockMeta(product);
      if (stockFilter !== 'all' && meta.key !== stockFilter) return false;
      if (!search) return true;
      const haystack = [product?.name, product?.sku, product?.team, product?.category, product?.slug]
        .map(normalize).join(' ');
      return haystack.includes(search);
    });
    renderRows();
  }

  function levelWidth(product={}){
    const stock = stockOf(product);
    const threshold = Math.max(1, thresholdOf(product));
    const healthyTarget = Math.max(30, threshold * 3);
    return Math.max(0, Math.min(100, Math.round((stock / healthyTarget) * 100)));
  }

  function renderRows(){
    const tbody = document.getElementById('inventory-tbody');
    if (!tbody) return;

    if (state.error && !state.products.length) {
      tbody.innerHTML = `<tr><td colspan="7" class="inventory-empty-cell"><div class="inventory-empty-state"><strong>INVENTORY FEED UNAVAILABLE</strong><span>${escapeHtml(state.error)}</span><button type="button" onclick="PADDOX_refreshInventory()">RETRY SYNC</button></div></td></tr>`;
      return;
    }

    if (!state.filtered.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="inventory-empty-cell"><div class="inventory-empty-state"><strong>NO MATCHING STOCK</strong><span>Try another stock state or search term.</span></div></td></tr>';
      return;
    }

    tbody.innerHTML = state.filtered.map(product => {
      const id = escapeHtml(String(product?._id || ''));
      const image = imageUrl(product);
      const stock = stockOf(product);
      const threshold = thresholdOf(product);
      const meta = stockMeta(product);
      const width = levelWidth(product);
      return `<tr class="pdx-inventory-row" data-product-id="${id}">
        <td>
          <div class="pdx-inventory-product">
            <span class="pdx-inventory-thumb">${image ? `<img src="${escapeHtml(image)}" alt="" loading="lazy">` : '<span>PDX</span>'}</span>
            <span class="pdx-inventory-copy"><strong>${escapeHtml(product?.name || 'Untitled Product')}</strong><small>${escapeHtml(product?.team || 'PADDOX')} · ${escapeHtml(String(product?.category || 'catalogue').toUpperCase())}</small></span>
          </div>
        </td>
        <td><span class="pdx-inventory-sku">${escapeHtml(product?.sku || product?.slug || 'NO SKU')}</span></td>
        <td><div class="pdx-stock-input-wrap"><input class="pdx-stock-input" id="inv-stock-${id}" type="number" min="0" step="1" value="${stock}" aria-label="Stock for ${escapeHtml(product?.name || 'product')}"><span>UNITS</span></div></td>
        <td><div class="pdx-stock-level"><div><i class="${meta.cls}" style="width:${width}%"></i></div><strong>${width}%</strong></div></td>
        <td><div class="pdx-threshold-input-wrap"><input class="pdx-threshold-input" id="inv-threshold-${id}" type="number" min="0" step="1" value="${threshold}" aria-label="Reorder point for ${escapeHtml(product?.name || 'product')}"></div></td>
        <td><span class="pdx-stock-status ${meta.cls}"><i></i>${meta.label}</span></td>
        <td><div class="pdx-inventory-actions"><button type="button" class="pdx-inventory-save" onclick="PADDOX_saveInventory('${id}',this)">SAVE</button><button type="button" class="pdx-inventory-restock" onclick="PADDOX_restockInventory('${id}')">RESTOCK</button><button type="button" class="pdx-inventory-out" onclick="PADDOX_markInventoryOut('${id}',this)">MARK OUT</button></div></td>
      </tr>`;
    }).join('');
  }

  async function loadInventory(silent=false){
    if (state.syncing) return state.products;
    state.syncing = true;
    state.error = '';
    if (!silent) showToast('⏳ Syncing live inventory...');
    try {
      const response = await fetch('/api/products/admin/all?limit=500&sort=newest', {
        method:'GET', credentials:'include', cache:'no-store', headers:{ Accept:'application/json' }
      });
      const payload = await response.json().catch(()=>({}));
      if (!response.ok || payload?.success === false) throw new Error(payload?.message || `Inventory sync failed (${response.status})`);
      state.products = extractProducts(payload);
      state.lastSync = new Date();
      window.REAL_PRODUCTS = state.products;
      renderStats();
      applyFilters();
      if (!silent) showToast(`✅ ${state.products.length} inventory items synced`);
      return state.products;
    } catch (error) {
      state.error = error?.message || 'Inventory unavailable';
      console.warn('PADDOX Inventory sync failed:', error);
      renderStats();
      applyFilters();
      if (!silent) showToast(`❌ ${state.error}`);
      return state.products;
    } finally {
      state.syncing = false;
    }
  }

  function findProduct(id){ return state.products.find(p=>String(p?._id || '')===String(id || '')) || null; }

  async function patchStock(id, stock, threshold){
    const response = await fetch(`/api/products/admin/${encodeURIComponent(id)}/stock`, {
      method:'PATCH',
      credentials:'include',
      headers:{ 'Content-Type':'application/json', Accept:'application/json' },
      body:JSON.stringify({ stock:Math.max(0,Number(stock || 0)), lowStockThreshold:Math.max(0,Number(threshold || 0)) })
    });
    const payload = await response.json().catch(()=>({}));
    if (!response.ok || payload?.success === false) throw new Error(payload?.message || `Stock update failed (${response.status})`);
    return payload?.data?.product || payload?.product || null;
  }

  async function saveInventory(id, button){
    const product = findProduct(id); if (!product) return showToast('❌ Product not found');
    const stock = Number(document.getElementById(`inv-stock-${CSS.escape(String(id))}`)?.value ?? product.stock ?? 0);
    const threshold = Number(document.getElementById(`inv-threshold-${CSS.escape(String(id))}`)?.value ?? product.lowStockThreshold ?? 10);
    if (!Number.isFinite(stock) || stock < 0) return showToast('❌ Stock must be zero or higher');
    if (!Number.isFinite(threshold) || threshold < 0) return showToast('❌ Reorder point must be zero or higher');
    const oldText = button?.textContent;
    if (button) { button.disabled=true; button.textContent='SAVING…'; }
    try {
      await patchStock(id, stock, threshold);
      showToast(`✅ ${product.name} stock updated`);
      await loadInventory(true);
      if (typeof window.PADDOX_refreshProducts === 'function') window.PADDOX_refreshProducts();
      if (typeof window.PADDOX_refreshAdminOverview === 'function') window.PADDOX_refreshAdminOverview();
    } catch (error) {
      console.error('PADDOX Inventory save failed:', error);
      showToast(`❌ ${error?.message || 'Stock update failed'}`);
    } finally {
      if (button) { button.disabled=false; button.textContent=oldText || 'SAVE'; }
    }
  }

  async function restockInventory(id){
    const product = findProduct(id); if (!product) return showToast('❌ Product not found');
    const target = Math.max(30, thresholdOf(product) * 3, stockOf(product));
    try {
      await patchStock(id, target, thresholdOf(product));
      showToast(`📦 ${product.name} restocked to ${target}`);
      await loadInventory(true);
      if (typeof window.PADDOX_refreshProducts === 'function') window.PADDOX_refreshProducts();
      if (typeof window.PADDOX_refreshAdminOverview === 'function') window.PADDOX_refreshAdminOverview();
    } catch (error) {
      console.error('PADDOX Inventory restock failed:', error);
      showToast(`❌ ${error?.message || 'Restock failed'}`);
    }
  }

  async function markInventoryOut(id, button){
    const product = findProduct(id); if (!product) return showToast('❌ Product not found');
    if (!button?.dataset?.armed) {
      if (button) {
        button.dataset.armed='1'; button.textContent='CONFIRM OUT'; button.classList.add('is-armed');
        setTimeout(()=>{ if(!button?.isConnected)return; delete button.dataset.armed; button.textContent='MARK OUT'; button.classList.remove('is-armed'); },4000);
      }
      return;
    }
    try {
      await patchStock(id, 0, thresholdOf(product));
      showToast(`⛔ ${product.name} marked out of stock`);
      await loadInventory(true);
      if (typeof window.PADDOX_refreshProducts === 'function') window.PADDOX_refreshProducts();
      if (typeof window.PADDOX_refreshAdminOverview === 'function') window.PADDOX_refreshAdminOverview();
    } catch (error) {
      console.error('PADDOX Inventory mark-out failed:', error);
      showToast(`❌ ${error?.message || 'Mark out failed'}`);
    }
  }

  async function restockAllLow(){
    const low = state.products.filter(p => stockOf(p) <= thresholdOf(p));
    if (!low.length) return showToast('✅ No low-stock products need restocking');
    const button = document.getElementById('inventory-restock-low-btn');
    const oldText = button?.textContent;
    if (button) { button.disabled=true; button.textContent=`RESTOCKING ${low.length}…`; }
    let updated=0, failed=0;
    for (const product of low) {
      const target = Math.max(30, thresholdOf(product) * 3);
      try { await patchStock(product._id, target, thresholdOf(product)); updated += 1; }
      catch (error) { failed += 1; console.warn('Bulk restock item failed:', product?.name, error); }
    }
    await loadInventory(true);
    if (typeof window.PADDOX_refreshProducts === 'function') window.PADDOX_refreshProducts();
    if (typeof window.PADDOX_refreshAdminOverview === 'function') window.PADDOX_refreshAdminOverview();
    showToast(failed ? `📦 Restocked ${updated}; ${failed} failed` : `🔥 Restocked ${updated} low-stock products`);
    if (button) { button.disabled=false; button.textContent=oldText || 'Restock All Low'; }
  }

  function bindControls(){
    if (listenersBound) return;
    listenersBound=true;
    document.getElementById('inventory-stock-filter')?.addEventListener('change', applyFilters);
    document.getElementById('inventory-search-input')?.addEventListener('input', applyFilters);
    document.getElementById('inventory-refresh-btn')?.addEventListener('click', ()=>loadInventory(false));
    document.getElementById('inventory-restock-low-btn')?.addEventListener('click', restockAllLow);
    document.querySelectorAll('.adm-nav-item[data-page]').forEach(item=>item.addEventListener('click',()=>{
      setTimeout(()=>{ if(item.dataset.page==='inventory') loadInventory(true); },0);
    }));
  }

  function installAutoRefresh(){
    if (refreshTimer) return;
    refreshTimer=setInterval(()=>{ if(isInventoryPage() && document.visibilityState!=='hidden') loadInventory(true); },REFRESH_MS);
    document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='visible' && isInventoryPage()) loadInventory(true); });
  }

  function bootstrap(){
    ensureStyles();
    bindControls();
    installAutoRefresh();
    window.loadInventory = loadInventory;
    window.PADDOX_refreshInventory = ()=>loadInventory(false);
    window.PADDOX_saveInventory = saveInventory;
    window.PADDOX_restockInventory = restockInventory;
    window.PADDOX_markInventoryOut = markInventoryOut;
    window.PADDOX_restockAllLowInventory = restockAllLow;
    window.PADDOX_ADMIN_INVENTORY_STATE = state;
    loadInventory(true);
  }

  ensureStyles();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootstrap, { once:true });
  else bootstrap();
})();
