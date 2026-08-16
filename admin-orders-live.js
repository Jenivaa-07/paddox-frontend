/* ============================================================
   PADDOX ADMIN — Orders Live Controller
   Owns the Orders workspace after the legacy dashboard loads.
   ============================================================ */
(function paddoxAdminOrdersLive(){
  'use strict';

  const REFRESH_MS = 30000;
  const state = { orders:[], filtered:[], syncing:false, lastSync:null, error:'' };
  let refreshTimer = null;
  let listenersBound = false;
  const STATUS_OPTIONS = ['placed','processing','shipped','out_for_delivery','delivered','cancelled','refunded'];

  function escapeHtml(value=''){
    return String(value ?? '').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  }
  function money(value=0){ return `₹${Number(value||0).toLocaleString('en-IN')}`; }
  function compactMoney(value=0){
    const n=Number(value||0);
    if(n>=10000000)return `₹${(n/10000000).toFixed(1).replace(/\.0$/,'')}Cr`;
    if(n>=100000)return `₹${(n/100000).toFixed(1).replace(/\.0$/,'')}L`;
    if(n>=1000)return `₹${(n/1000).toFixed(1).replace(/\.0$/,'')}K`;
    return money(n);
  }
  function orderTotal(order={}){ return Number(order?.pricing?.total ?? order?.total ?? order?.amount ?? 0); }
  function statusOf(order={}){ return String(order?.status||'placed').toLowerCase(); }
  function statusLabel(status=''){ return String(status||'placed').replaceAll('_',' ').replace(/\b\w/g,ch=>ch.toUpperCase()); }
  function statusClass(status=''){
    const v=String(status).toLowerCase();
    if(v==='delivered')return'is-delivered';
    if(v==='shipped'||v==='out_for_delivery')return'is-shipped';
    if(v==='cancelled'||v==='refunded')return'is-cancelled';
    if(v==='processing')return'is-processing';
    return'is-placed';
  }
  function paymentClass(status=''){
    const v=String(status||'pending').toLowerCase();
    if(v==='paid')return'is-paid';
    if(v==='refunded')return'is-refunded';
    if(v==='failed')return'is-failed';
    return'is-pending';
  }
  function customerName(order={}){
    return [order?.user?.firstName,order?.user?.lastName].filter(Boolean).join(' ').trim()||order?.shippingAddress?.name||'PADDOX Customer';
  }
  function customerEmail(order={}){ return order?.user?.email||'No email'; }
  function formatDate(value){
    const d=value?new Date(value):null;
    if(!d||Number.isNaN(d.getTime()))return'—';
    return d.toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
  }
  function orderNumber(order={}){ return order?.orderNumber||String(order?._id||'').slice(-8).toUpperCase()||'ORDER'; }
  function itemSummary(order={}){
    const items=Array.isArray(order.items)?order.items:[];
    if(!items.length)return{primary:'No items',extra:'',count:0};
    const first=items[0]?.name||items[0]?.product?.name||'Item';
    const count=items.reduce((sum,item)=>sum+Math.max(1,Number(item.quantity||1)),0);
    return{primary:first,extra:items.length>1?`+${items.length-1} more`:'',count};
  }
  function extractOrders(payload={}){
    if(Array.isArray(payload))return payload;
    if(Array.isArray(payload?.data))return payload.data;
    if(Array.isArray(payload?.orders))return payload.orders;
    if(Array.isArray(payload?.data?.orders))return payload.data.orders;
    return[];
  }
  function isOrdersPage(){ return document.getElementById('adm-orders')?.classList.contains('on'); }
  function setSyncText(text,mode=''){
    const pill=document.getElementById('orders-sync-pill');
    if(!pill)return;
    pill.textContent=text;
    pill.dataset.mode=mode;
  }

  function installAdminBrandLockup(){
    const wrap=document.querySelector('.adm-logo-wrap');
    if(!wrap||wrap.dataset.pdxBrandInstalled==='1')return;
    wrap.dataset.pdxBrandInstalled='1';
    wrap.classList.add('pdx-admin-brand-wrap');
    wrap.innerHTML=`
      <a href="index.html" class="pdx-admin-brand-link" aria-label="PADDOX Home">
        <img src="assets/paddox-logo-horizontal-white.png?v=A5_ADMIN_BRAND_1" alt="PADDOX Motorsport Lifestyle" class="pdx-admin-brand-logo" width="1374" height="301" decoding="async">
      </a>
      <div class="pdx-admin-brand-mode"><span></span> RACE CONTROL / OPERATIONS</div>`;
  }

  function ensureOrdersStyles(){
    if(document.getElementById('pdx-admin-orders-style'))return;
    const link=document.createElement('link');
    link.id='pdx-admin-orders-style';link.rel='stylesheet';link.href='/admin-orders-live.css?v=A5_ORDERS_1';
    document.head.appendChild(link);
  }

  function ensureStatsGrid(){
    const page=document.getElementById('adm-orders');
    const command=page?.querySelector('.orders-command-strip');
    if(!page||!command)return null;
    let grid=document.getElementById('orders-live-stats');
    if(grid)return grid;
    grid=document.createElement('div');
    grid.id='orders-live-stats';grid.className='orders-live-stats';
    grid.innerHTML=`
      <article class="orders-live-stat stat-total"><span>All Orders</span><strong id="orders-stat-total">—</strong><small>Live database</small></article>
      <article class="orders-live-stat stat-active"><span>In Fulfilment</span><strong id="orders-stat-active">—</strong><small>Placed → delivery</small></article>
      <article class="orders-live-stat stat-delivered"><span>Delivered</span><strong id="orders-stat-delivered">—</strong><small>Completed orders</small></article>
      <article class="orders-live-stat stat-revenue"><span>Order Value</span><strong id="orders-stat-revenue">—</strong><small>Non-cancelled total</small></article>`;
    command.insertAdjacentElement('afterend',grid);
    return grid;
  }

  function renderStats(){
    ensureStatsGrid();
    const orders=state.orders;
    const active=orders.filter(o=>['placed','processing','shipped','out_for_delivery'].includes(statusOf(o))).length;
    const delivered=orders.filter(o=>statusOf(o)==='delivered').length;
    const value=orders.filter(o=>!['cancelled','refunded'].includes(statusOf(o))).reduce((sum,o)=>sum+orderTotal(o),0);
    const set=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=value;};
    set('orders-stat-total',orders.length.toLocaleString('en-IN'));
    set('orders-stat-active',active.toLocaleString('en-IN'));
    set('orders-stat-delivered',delivered.toLocaleString('en-IN'));
    set('orders-stat-revenue',compactMoney(value));
    const badge=document.querySelector('.adm-nav-item[data-page="orders"] .adm-badge');
    if(badge){badge.textContent=String(active);badge.style.display=active>0?'':'none';}
  }

  function matchesTime(order,filter){
    if(!filter||filter==='all')return true;
    const raw=order?.createdAt;if(!raw)return false;
    const date=new Date(raw);if(Number.isNaN(date.getTime()))return false;
    const now=new Date();
    if(filter==='today')return date.toDateString()===now.toDateString();
    if(filter==='week')return(now-date)<=7*24*60*60*1000;
    if(filter==='month')return date.getFullYear()===now.getFullYear()&&date.getMonth()===now.getMonth();
    return true;
  }

  function applyFilters(){
    const status=document.getElementById('admin-order-status-filter')?.value||'all';
    const time=document.getElementById('admin-order-time-filter')?.value||'all';
    const search=String(document.getElementById('admin-order-search')?.value||'').trim().toLowerCase();
    state.filtered=state.orders.filter(order=>{
      if(status!=='all'&&statusOf(order)!==status)return false;
      if(!matchesTime(order,time))return false;
      if(!search)return true;
      const haystack=[orderNumber(order),customerName(order),customerEmail(order),order?.shippingAddress?.phone,...(order.items||[]).map(item=>item?.name||item?.product?.name||'')].join(' ').toLowerCase();
      return haystack.includes(search);
    });
    renderRows();
  }

  function renderRows(){
    const tbody=document.getElementById('orders-tbody');if(!tbody)return;
    if(state.error&&!state.orders.length){
      tbody.innerHTML=`<tr><td colspan="8" class="orders-empty-cell"><div class="orders-empty-state"><strong>ORDER FEED UNAVAILABLE</strong><span>${escapeHtml(state.error)}</span><button type="button" onclick="adminA31RefreshOrders()">RETRY SYNC</button></div></td></tr>`;
      return;
    }
    if(!state.filtered.length){
      tbody.innerHTML='<tr><td colspan="8" class="orders-empty-cell"><div class="orders-empty-state"><strong>NO MATCHING ORDERS</strong><span>Try another status, time range or search term.</span></div></td></tr>';
      return;
    }
    tbody.innerHTML=state.filtered.map(order=>{
      const items=itemSummary(order),status=statusOf(order),payment=String(order?.payment?.status||'pending').toLowerCase(),method=String(order?.payment?.method||'—').toUpperCase(),id=escapeHtml(String(order?._id||''));
      return`<tr class="pdx-order-row" data-order-id="${id}">
        <td><button class="order-id-link" type="button" onclick="openOrderView('${id}')"><span>#${escapeHtml(orderNumber(order))}</span><small>${escapeHtml(String(order?.orderType||'merchandise').toUpperCase())}</small></button></td>
        <td><div class="order-customer-cell"><strong>${escapeHtml(customerName(order))}</strong><small>${escapeHtml(customerEmail(order))}</small></div></td>
        <td><div class="order-products-cell"><strong>${escapeHtml(items.primary)}</strong><small>${escapeHtml(items.extra||`${items.count} item${items.count===1?'':'s'}`)}</small></div></td>
        <td><div class="order-date-cell">${escapeHtml(formatDate(order?.createdAt))}</div></td>
        <td><div class="order-payment-cell"><span class="order-payment-badge ${paymentClass(payment)}">${escapeHtml(payment.toUpperCase())}</span><small>${escapeHtml(method)}</small></div></td>
        <td><strong class="order-amount">${escapeHtml(money(orderTotal(order)))}</strong></td>
        <td><button class="order-status-badge ${statusClass(status)}" type="button" onclick="openOrderView('${id}')"><span></span>${escapeHtml(statusLabel(status))}</button></td>
        <td><div class="order-row-actions"><button class="order-view-btn" type="button" onclick="openOrderView('${id}')">VIEW</button><button class="order-copy-btn" type="button" onclick="PADDOX_copyOrderId('${escapeHtml(orderNumber(order))}',this)">COPY</button></div></td>
      </tr>`;
    }).join('');
  }

  async function loadLiveOrders(silent=false){
    if(state.syncing)return state.orders;
    state.syncing=true;state.error='';
    if(!silent&&typeof window.showToast==='function')window.showToast('⏳ Syncing live orders...');
    setSyncText('Syncing live orders…','syncing');
    try{
      const response=await fetch('/api/orders/admin/all?limit=200',{method:'GET',credentials:'include',cache:'no-store',headers:{Accept:'application/json'}});
      const payload=await response.json().catch(()=>({}));
      if(!response.ok||payload?.success===false)throw new Error(payload?.message||`Order sync failed (${response.status})`);
      state.orders=extractOrders(payload);state.lastSync=new Date();window.REAL_ORDERS=state.orders;
      renderStats();applyFilters();
      const stamp=state.lastSync.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});
      setSyncText(`${state.orders.length} orders · synced ${stamp}`,'live');
      if(!silent&&typeof window.showToast==='function')window.showToast(`✅ ${state.orders.length} live orders synced`);
      return state.orders;
    }catch(error){
      state.error=error?.message||'Orders unavailable';setSyncText('Order sync unavailable','error');renderStats();applyFilters();
      console.warn('PADDOX Admin Orders sync failed:',error);
      if(!silent&&typeof window.showToast==='function')window.showToast(`❌ ${state.error}`);
      return state.orders;
    }finally{state.syncing=false;}
  }

  function findOrder(id){
    return state.orders.find(o=>String(o?._id||'')===String(id||''))||state.orders.find(o=>String(orderNumber(o))===String(id||''))||null;
  }

  function ensureOrderModal(){
    let modal=document.getElementById('pdx-live-order-modal');if(modal)return modal;
    modal=document.createElement('div');modal.id='pdx-live-order-modal';modal.className='pdx-live-order-modal';modal.setAttribute('aria-hidden','true');
    modal.innerHTML='<div class="pdx-order-modal-backdrop"></div><div class="pdx-order-modal-panel" role="dialog" aria-modal="true" aria-label="Order details"><div id="pdx-order-modal-content"></div></div>';
    document.body.appendChild(modal);
    modal.querySelector('.pdx-order-modal-backdrop')?.addEventListener('click',closeOrderModal);
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&modal.classList.contains('is-open'))closeOrderModal();});
    return modal;
  }
  function closeOrderModal(){
    const modal=document.getElementById('pdx-live-order-modal');if(!modal)return;
    modal.classList.remove('is-open');modal.setAttribute('aria-hidden','true');document.body.classList.remove('pdx-order-modal-open');
  }

  function renderOrderModal(order){
    const modal=ensureOrderModal(),content=modal.querySelector('#pdx-order-modal-content');if(!content)return;
    const status=statusOf(order),payment=String(order?.payment?.status||'pending').toLowerCase(),address=order?.shippingAddress||{},items=Array.isArray(order?.items)?order.items:[],history=Array.isArray(order?.statusHistory)?[...order.statusHistory].reverse():[],orderId=escapeHtml(String(order?._id||''));
    const itemRows=items.length?items.map(item=>{
      const qty=Math.max(1,Number(item?.quantity||1)),price=Number(item?.price||0),image=item?.image||item?.product?.images?.[0]?.url||'';
      return`<div class="pdx-order-item"><div class="pdx-order-item-media">${image?`<img src="${escapeHtml(image)}" alt="" loading="lazy">`:'<span>PDX</span>'}</div><div class="pdx-order-item-copy"><strong>${escapeHtml(item?.name||item?.product?.name||'PADDOX Item')}</strong><small>Qty ${qty}${item?.size?` · ${escapeHtml(item.size)}`:''}${item?.color?` · ${escapeHtml(item.color)}`:''}</small></div><div class="pdx-order-item-price">${escapeHtml(money(price*qty))}</div></div>`;
    }).join(''):'<div class="pdx-order-empty-line">No items attached to this order.</div>';
    const historyRows=history.length?history.slice(0,8).map(entry=>`<div class="pdx-order-history-row"><span class="history-dot ${statusClass(entry?.status||'')}"></span><div><strong>${escapeHtml(statusLabel(entry?.status||'updated'))}</strong><small>${escapeHtml(entry?.message||'')}</small></div><time>${escapeHtml(formatDate(entry?.timestamp))}</time></div>`).join(''):'<div class="pdx-order-empty-line">No status history yet.</div>';

    content.innerHTML=`
      <div class="pdx-order-modal-head"><div><div class="pdx-order-modal-kicker"><span></span> LIVE ORDER DOSSIER</div><h2>#${escapeHtml(orderNumber(order))}</h2><p>${escapeHtml(formatDate(order?.createdAt))} · ${escapeHtml(String(order?.orderType||'merchandise').toUpperCase())}</p></div><button class="pdx-order-modal-close" type="button" onclick="PADDOX_closeOrderModal()">×</button></div>
      <div class="pdx-order-modal-statusbar"><span class="order-status-badge ${statusClass(status)}"><span></span>${escapeHtml(statusLabel(status))}</span><span class="order-payment-badge ${paymentClass(payment)}">${escapeHtml(payment.toUpperCase())}</span><strong>${escapeHtml(money(orderTotal(order)))}</strong></div>
      <div class="pdx-order-info-grid"><section><label>CUSTOMER</label><strong>${escapeHtml(customerName(order))}</strong><span>${escapeHtml(customerEmail(order))}</span><span>${escapeHtml(address?.phone||'No phone')}</span></section><section><label>PAYMENT</label><strong>${escapeHtml(String(order?.payment?.method||'—').toUpperCase())}</strong><span>${escapeHtml(payment.toUpperCase())}</span><span>${escapeHtml(order?.payment?.razorpayPaymentId||order?.payment?.razorpayOrderId||'No gateway reference')}</span></section><section class="is-wide"><label>SHIPPING ADDRESS</label><strong>${escapeHtml(address?.name||customerName(order))}</strong><span>${escapeHtml([address?.line1,address?.line2,address?.city,address?.state,address?.pincode,address?.country].filter(Boolean).join(', ')||'No shipping address')}</span></section></div>
      <div class="pdx-order-modal-grid"><section class="pdx-order-items-panel"><div class="pdx-order-section-title">ORDER ITEMS <span>${items.length}</span></div>${itemRows}</section><section class="pdx-order-pricing-panel"><div class="pdx-order-section-title">PRICING</div><div><span>Subtotal</span><strong>${escapeHtml(money(order?.pricing?.subtotal||0))}</strong></div><div><span>Shipping</span><strong>${escapeHtml(money(order?.pricing?.shipping||0))}</strong></div><div><span>Discount</span><strong>−${escapeHtml(money(order?.pricing?.totalDiscount||order?.pricing?.discount||0))}</strong></div><div><span>Tax</span><strong>${escapeHtml(money(order?.pricing?.tax||0))}</strong></div><div class="is-total"><span>Total</span><strong>${escapeHtml(money(orderTotal(order)))}</strong></div></section></div>
      <section class="pdx-order-control-panel"><div><div class="pdx-order-section-title">FULFILMENT CONTROL</div><p>Change the order state. PADDOX saves it to the live backend and refreshes Overview automatically.</p></div><div class="pdx-order-control-actions"><select id="pdx-order-status-select" class="adm-select">${STATUS_OPTIONS.map(value=>`<option value="${value}" ${value===status?'selected':''}>${escapeHtml(statusLabel(value))}</option>`).join('')}</select><button class="pdx-order-update-btn" type="button" onclick="PADDOX_updateOrderFromModal('${orderId}')">UPDATE STATUS</button></div></section>
      <section class="pdx-order-history-panel"><div class="pdx-order-section-title">STATUS HISTORY</div>${historyRows}</section>
      <div class="pdx-order-modal-footer"><button class="pdx-order-copy-full" type="button" onclick="PADDOX_copyOrderId('${escapeHtml(orderNumber(order))}',this)">COPY ORDER ID</button><button class="pdx-order-delete-btn" id="pdx-order-delete-btn" type="button">DELETE ORDER</button></div>`;

    const deleteButton=content.querySelector('#pdx-order-delete-btn');
    if(deleteButton){
      let armed=false,timer=null;
      deleteButton.addEventListener('click',async()=>{
        if(!armed){armed=true;deleteButton.textContent='CLICK AGAIN TO CONFIRM';deleteButton.classList.add('is-armed');timer=setTimeout(()=>{armed=false;deleteButton.textContent='DELETE ORDER';deleteButton.classList.remove('is-armed');},4500);return;}
        if(timer)clearTimeout(timer);await deleteOrder(order._id);
      });
    }
    modal.classList.add('is-open');modal.setAttribute('aria-hidden','false');document.body.classList.add('pdx-order-modal-open');
  }

  function openOrderView(id){
    const order=findOrder(id);
    if(!order){if(typeof window.showToast==='function')window.showToast('❌ Order not found in live feed');return;}
    renderOrderModal(order);
  }

  async function updateOrderStatus(id,status){
    try{
      const response=await fetch(`/api/orders/admin/${encodeURIComponent(id)}/status`,{method:'PUT',credentials:'include',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({status,message:`Admin changed order status to ${statusLabel(status)}`})});
      const payload=await response.json().catch(()=>({}));
      if(!response.ok||payload?.success===false)throw new Error(payload?.message||`Status update failed (${response.status})`);
      if(typeof window.showToast==='function')window.showToast(`✅ Order → ${statusLabel(status)}`);
      closeOrderModal();await loadLiveOrders(true);
      if(typeof window.PADDOX_refreshAdminOverview==='function')window.PADDOX_refreshAdminOverview();
      return true;
    }catch(error){console.error('PADDOX order status update failed:',error);if(typeof window.showToast==='function')window.showToast(`❌ ${error?.message||'Status update failed'}`);return false;}
  }

  async function deleteOrder(id){
    try{
      const response=await fetch(`/api/orders/admin/${encodeURIComponent(id)}`,{method:'DELETE',credentials:'include',headers:{Accept:'application/json'}});
      const payload=await response.json().catch(()=>({}));
      if(!response.ok||payload?.success===false)throw new Error(payload?.message||`Delete failed (${response.status})`);
      closeOrderModal();if(typeof window.showToast==='function')window.showToast('🗑️ Order deleted from live backend');
      await loadLiveOrders(true);if(typeof window.PADDOX_refreshAdminOverview==='function')window.PADDOX_refreshAdminOverview();return true;
    }catch(error){console.error('PADDOX order delete failed:',error);if(typeof window.showToast==='function')window.showToast(`❌ ${error?.message||'Delete failed'}`);return false;}
  }

  function exportOrdersCSV(){
    const orders=state.filtered.length?state.filtered:state.orders;
    if(!orders.length){if(typeof window.showToast==='function')window.showToast('No orders to export');return;}
    const q=value=>`"${String(value??'').replaceAll('"','""')}"`;
    const rows=[['Order ID','Date','Customer','Email','Items','Payment','Method','Amount','Status'],...orders.map(order=>[orderNumber(order),formatDate(order?.createdAt),customerName(order),customerEmail(order),(order.items||[]).map(item=>`${item?.name||'Item'} x${item?.quantity||1}`).join(' | '),String(order?.payment?.status||'pending'),String(order?.payment?.method||''),orderTotal(order),statusOf(order)])];
    const csv=rows.map(row=>row.map(q).join(',')).join('\n');
    const blob=new Blob([csv],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');
    link.href=url;link.download=`paddox-orders-${new Date().toISOString().slice(0,10)}.csv`;document.body.appendChild(link);link.click();link.remove();URL.revokeObjectURL(url);
    if(typeof window.showToast==='function')window.showToast(`✅ Exported ${orders.length} orders`);
  }

  async function copyOrderId(value,button){
    try{await navigator.clipboard.writeText(String(value||''));if(button){const old=button.textContent;button.textContent='COPIED';setTimeout(()=>{button.textContent=old;},1200);}}
    catch(_){if(typeof window.showToast==='function')window.showToast('Copy unavailable in this browser');}
  }
  async function updateFromModal(id){const select=document.getElementById('pdx-order-status-select');if(select)await updateOrderStatus(id,select.value);}

  function bindFilters(){
    if(listenersBound)return;listenersBound=true;
    ['admin-order-status-filter','admin-order-time-filter'].forEach(id=>document.getElementById(id)?.addEventListener('change',applyFilters));
    document.getElementById('admin-order-search')?.addEventListener('input',applyFilters);
    document.querySelectorAll('.adm-nav-item[data-page]').forEach(item=>item.addEventListener('click',()=>setTimeout(()=>{if(item.dataset.page==='orders')loadLiveOrders(true);},0)));
  }
  function installAutoRefresh(){
    if(refreshTimer)return;
    refreshTimer=setInterval(()=>{if(isOrdersPage()&&document.visibilityState!=='hidden')loadLiveOrders(true);},REFRESH_MS);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&isOrdersPage())loadLiveOrders(true);});
  }

  function bootstrap(){
    ensureOrdersStyles();installAdminBrandLockup();ensureStatsGrid();bindFilters();installAutoRefresh();
    window.loadOrders=loadLiveOrders;window.renderOrders=applyFilters;window.openOrderView=openOrderView;window.updateOrderStatus=updateOrderStatus;window.adminA31RefreshOrders=loadLiveOrders;window.exportAdminOrdersCSV=exportOrdersCSV;
    window.PADDOX_closeOrderModal=closeOrderModal;window.PADDOX_updateOrderFromModal=updateFromModal;window.PADDOX_copyOrderId=copyOrderId;window.PADDOX_ADMIN_ORDERS_STATE=state;
    if(Array.isArray(window.REAL_ORDERS)&&window.REAL_ORDERS.length){state.orders=window.REAL_ORDERS;renderStats();applyFilters();}
    loadLiveOrders(true);
  }

  ensureOrdersStyles();installAdminBrandLockup();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bootstrap,{once:true});else bootstrap();
})();
