/* ============================================================
   PADDOX — admin.js   |   Admin Dashboard Logic
   ============================================================ */
'use strict';

/* Phase A4.7A.2 — Safe shared state declared before any page initialiser. */
var PRODUCT_API_BASE = window.PRODUCT_API_BASE || 'https://paddox-backend.onrender.com/api/products';
var ASSET_API_BASE = window.ASSET_API_BASE || 'https://paddox-backend.onrender.com/api/assets';
var REAL_PRODUCTS = window.REAL_PRODUCTS || [];
var REAL_ASSETS = window.REAL_ASSETS || [];

/* ══════════════════════════════════════
   ADMIN AUTH GUARD
══════════════════════════════════════ */

function getAdminToken() {
  return (
    localStorage.getItem('token') ||
    localStorage.getItem('paddox_access_token') ||
    localStorage.getItem('accessToken') ||
    ''
  );
}

function redirectToLogin(message = 'Please login as admin') {
  alert(message);
  window.location.href = 'account.html';
}

async function checkAdminAccess() {
  const token = getAdminToken();

  if (!token) {
    redirectToLogin('Please login first');
    return false;
  }

  try {
    /*
      We verify admin access using an actual admin endpoint.
      This avoids false redirects when /api/auth/me does not return isAdmin.
    */
    const res = await fetch(
      'https://paddox-backend.onrender.com/api/orders/admin/all?limit=1',
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (res.ok) {
      return true;
    }

    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('paddox_access_token');
      localStorage.removeItem('accessToken');

      redirectToLogin('Admin session expired. Please login with admin account.');
      return false;
    }

    console.warn('Admin guard check returned:', res.status);
    return true;

  } catch (err) {
    console.error(err);
    /* Do not block admin page for temporary network issues. */
    return true;
  }
}



/* ══════════════════════════════════════
   PADDOX CLOUDINARY IMAGE UPLOAD BRIDGE
   Reusable for Product, Fan Quotes, Fan Drivers, and User Profile images.
══════════════════════════════════════ */
const PADDOX_UPLOAD_API = 'https://paddox-backend.onrender.com/api/uploads/image';

function dataUrlToFile(dataUrl, filename = 'paddox-image.jpg') {
  const parts = String(dataUrl || '').split(',');
  const mimeMatch = parts[0]?.match(/data:(.*?);base64/);
  const mime = mimeMatch?.[1] || 'image/jpeg';
  const binary = atob(parts[1] || '');
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new File([bytes], filename, { type: mime });
}

async function uploadImageToCloudinaryBridge(fileOrDataUrl, context = 'admin') {
  if (!fileOrDataUrl) return '';

  if (typeof fileOrDataUrl === 'string' && /^https?:\/\//i.test(fileOrDataUrl)) {
    return fileOrDataUrl;
  }

  const file =
    typeof fileOrDataUrl === 'string'
      ? dataUrlToFile(fileOrDataUrl, `paddox-${context}-${Date.now()}.jpg`)
      : fileOrDataUrl;

  const formData = new FormData();
  formData.append('image', file);
  formData.append('context', context);

  const res = await fetch(PADDOX_UPLOAD_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getAdminToken()}`
    },
    body: formData
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok || data.success === false) {
    throw new Error(data.message || 'Cloudinary upload failed');
  }

  return data.data?.url || data.url || data.secure_url || '';
}

/* ══════════════════════════════════════
   REALTIME ADMIN NOTIFICATION BRIDGE
══════════════════════════════════════ */
const ADMIN_SOCKET_URL = 'https://paddox-backend.onrender.com';
let adminSocket = null;

function initAdminNotificationSocket() {
  if (adminSocket?.connected || typeof window.io !== 'function') return;
  const token = getAdminToken();
  if (!token) return;
  adminSocket = window.io(ADMIN_SOCKET_URL, {
    transports: ['websocket', 'polling'],
    auth: { token },
    query: { token },
    withCredentials: true,
    reconnection: true
  });
}

function emitAdminDropNotification(kind, payload = {}) {
  try {
    initAdminNotificationSocket();
    adminSocket?.emit('admin:new-drop', { kind, ...payload });
  } catch (err) {
    console.warn('Admin drop notification failed:', err.message);
  }
}

function emitAdminRaceNotification(title, message, ref = '') {
  try {
    initAdminNotificationSocket();
    adminSocket?.emit('admin:race-alert', { title, message, ref });
    showToast('🏁 Race alert sent');
  } catch (err) {
    console.warn('Race notification failed:', err.message);
  }
}

window.sendPaddoxRaceNotification = emitAdminRaceNotification;

window.addEventListener('load', initAdminNotificationSocket);

/* ══ DATA ══ */


const ADM_USERS = [];



const ADM_MOD = [];

const TRAFFIC_DATA = [];
const TOP_PRODUCTS = [];
const GEO_DATA = [];
const ENGAGEMENT_DATA = [];

/* ══ PARTICLES ══ */
(function(){
  const canvas=document.getElementById('particles-canvas');if(!canvas)return;
  const ctx=canvas.getContext('2d');let W,H,p=[];
  function resize(){W=canvas.width=innerWidth;H=canvas.height=innerHeight}resize();
  window.addEventListener('resize',resize);
  class P{constructor(b=false){this.r(b)}
    r(b=false){this.b=b;this.t=Math.random()<.55?'s':'d';
      this.x=b?W*.5+(Math.random()-.5)*400:Math.random()*W;
      this.y=b?H*.4+(Math.random()-.5)*200:Math.random()*H;
      const sp=b?4+Math.random()*7:1.5+Math.random()*2.5,a=b?Math.random()*Math.PI*2:-.05+(Math.random()-.5)*.4;
      this.vx=Math.cos(a)*sp;this.vy=Math.sin(a)*sp-(b?0:.2);
      this.l=1;this.d=b?.018+Math.random()*.022:.003+Math.random()*.004;
      this.sz=this.t==='s'?.6+Math.random()*1.6:.5+Math.random()*1.2;
      const r=Math.random();this.c=r<.65?'rgba(232,0,45,':r<.82?'rgba(200,200,200,':'rgba(201,168,76,';}
    update(){this.x+=this.vx;this.y+=this.vy;this.vy+=.012;this.l-=this.d;
      if(this.l<=0||this.x>W+30||this.x<-30||this.y>H+30)this.r(false)}
    draw(){ctx.save();ctx.globalAlpha=Math.max(0,this.l*.72);
      if(this.t==='s'){ctx.strokeStyle=`${this.c}1)`;ctx.lineWidth=this.sz;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(this.x,this.y);ctx.lineTo(this.x-this.vx*7,this.y-this.vy*7);ctx.stroke()}
      else{ctx.fillStyle=`${this.c}.9)`;ctx.beginPath();ctx.arc(this.x,this.y,this.sz,0,Math.PI*2);ctx.fill()}ctx.restore()}}
  for(let i=0;i<60;i++)p.push(new P());
  setTimeout(function burst(){for(let i=0;i<28;i++)p.push(new P(true));setTimeout(burst,9e3+Math.random()*8e3)},5e3);
  function loop(){ctx.clearRect(0,0,W,H);p.forEach(x=>{x.update();x.draw()});p=p.filter(x=>x.l>0||!x.b);while(p.filter(x=>!x.b).length<60)p.push(new P());requestAnimationFrame(loop)}loop();
})();

/* ══ PAGE TRANSITION ══ */
(function(){
  const ov=document.getElementById('page-overlay');if(!ov)return;
  document.querySelectorAll('a[href]').forEach(a=>{
    const h=a.getAttribute('href');
    if(!h||h.startsWith('#')||h.startsWith('http')||h.startsWith('mailto'))return;
    a.addEventListener('click',e=>{e.preventDefault();ov.classList.add('slide-in');setTimeout(()=>location.href=h,480)});
  });
  window.addEventListener('load',()=>{ov.classList.remove('slide-in');ov.classList.add('slide-out');setTimeout(()=>ov.classList.remove('slide-out'),500)});
})();

/* ══ SCROLL REVEAL ══ */
function initReveal(root=document){
  const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in-view');obs.unobserve(e.target)}}),{threshold:.08,rootMargin:'0px 0px -20px 0px'});
  root.querySelectorAll('.reveal-up').forEach(el=>obs.observe(el));
}
initReveal();

/* ══ SIDEBAR TOGGLE ══ */
const sidebar    = document.getElementById('admin-sidebar');
const adminMain  = document.querySelector('.admin-main');
const menuBtn    = document.getElementById('adm-menu-btn');
let sidebarOpen  = true;

menuBtn?.addEventListener('click', () => {
  sidebarOpen = !sidebarOpen;
  sidebar.classList.toggle('collapsed', !sidebarOpen);
  adminMain.classList.toggle('expanded', !sidebarOpen);
  /* Mobile open class */
  if (window.innerWidth <= 900) {
    sidebar.classList.toggle('mobile-open', sidebarOpen);
    sidebar.classList.remove('collapsed');
    adminMain.classList.remove('expanded');
  }
});

/* Close sidebar on outside click (mobile) */
document.addEventListener('click', e => {
  if (window.innerWidth <= 900 && !sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
    sidebar.classList.remove('mobile-open');
    sidebarOpen = false;
  }
});

/* ══ NAV PAGE SWITCHING ══ */
const PAGE_META = {
  overview:   { title:'OVERVIEW',        action:'',  fn:null, hideAction:true },
  orders:     { title:'ORDERS',          action:'', hideAction:true, fn:null },
  products:   { title:'PRODUCTS',        action:'', hideAction:true, fn:null },
  coupons:    { title:'COUPONS',         action:'', hideAction:true, fn:null },
  inventory:  { title:'INVENTORY',       action:'Restock Low',    fn:()=>bulkRestockLowStock?.() },
  assets: {
  title:'DIGITAL ASSETS',
  action:'+ Upload Asset',
  fn:()=>openAssetModal()
},
  homebranding: { title:'HOME BRANDING', action:'+ Add Logo', fn:()=>resetHomeLogoForm() },
  fanquotes:  { title:'FAN QUOTES',      action:'+ Add Quote',   fn:()=>openQuoteModal() },
  fanpolls:   { title:'FAN POLLS',       action:'+ New Poll',    fn:()=>resetFanPollForm() },
  fantrivia:  { title:'FAN TRIVIA',      action:'+ New Trivia',  fn:()=>resetFanTriviaForm() },
  fandrivers: { title:'FAN DRIVERS',     action:'+ Add Image',   fn:()=>openDriverProfileModal() },
  users:      { title:'USERS',           action:'Export Users',   fn:()=>showToast('📥 Exporting users…') },
  analytics:  { title:'ANALYTICS',       action:'Download Report',fn:()=>showToast('📊 Report downloaded!') },
  moderation: { title:'MODERATION',      action:'Clear All',      fn:()=>showToast('✓ All items reviewed!') },
};

function switchPage(id) {
  document.querySelectorAll('.adm-page').forEach(p=>p.classList.remove('on'));
  document.querySelectorAll('.adm-nav-item').forEach(n=>n.classList.remove('on'));
  const page = document.getElementById(`adm-${id}`);
  if (page) { page.classList.add('on'); initReveal(page); }
  const navItem = document.querySelector(`.adm-nav-item[data-page="${id}"]`);
  if (navItem) navItem.classList.add('on');
  const meta = PAGE_META[id] || { title: id.toUpperCase(), action:'+ Add', fn:()=>{} };
  const titleEl = document.getElementById('adm-topbar-title');
  const actionBtn = document.getElementById('adm-action-btn');
  if (titleEl) titleEl.textContent = meta.title;
  if (actionBtn) {
    actionBtn.textContent = meta.action || '';
    actionBtn.onclick = meta.fn || null;
    actionBtn.hidden = !!meta.hideAction;
    actionBtn.classList.toggle('is-hidden', !!meta.hideAction);
  }
  if (id === 'products') {
  bindProductAdminControls();
  loadProducts();
}
if (id === 'coupons') {
  bindCouponAdminControls();
  loadCoupons();
}

if (id === 'assets') {
  loadAssets();
}
if (id === 'homebranding') {
  loadHomeMarqueeLogosAdmin();
  setTimeout(drawHomeLogoCropCanvas, 50);
}
if (id === 'orders') {
  adminPhase9BindOrderFilters?.();
  loadOrders();
}
if (id === 'inventory') {
  bindInventoryAdminControls();
  loadProducts();
}
if (id === 'users') {
  loadUsers();
}
if (id === 'analytics') {
  renderAnalyticsRealtime();
}
if (id === 'fanquotes') {
  loadAdminQuotes();
}
if (id === 'fanpolls') {
  loadFanPollsAdmin();
  resetFanPollForm(false);
}
if (id === 'fantrivia') {
  loadFanTriviaAdmin();
  resetFanTriviaForm(false);
}
if (id === 'fandrivers') {
  loadAdminDriverProfiles();
}
  window.scrollTo({ top:0, behavior:'smooth' });
}

document.querySelectorAll('.adm-nav-item').forEach(item => {
  item.addEventListener('click', () => {
    switchPage(item.dataset.page);
    /* Icon wiggle */
    const icon = item.querySelector('.adm-icon');
    if (icon) { icon.style.transform='scale(1.4) rotate(-8deg)'; setTimeout(()=>icon.style.transform='',350); }
    /* Close mobile sidebar */
    if (window.innerWidth <= 900) { sidebar.classList.remove('mobile-open'); sidebarOpen=false; }
  });
});

/* ══ BAR CHART ══ */
function renderBarChart() {
  const container = document.getElementById('bar-chart');
  if (!container) return;
  const data = [
    { m:'Jan', v:62 }, { m:'Feb', v:78 }, { m:'Mar', v:55 }, { m:'Apr', v:91 }, { m:'May', v:88 }
  ];
  const max = Math.max(...data.map(d=>d.v));
  container.innerHTML = data.map(d => `
    <div class="bc-col">
      <div class="bc-wrap">
        <div class="bc-bar" style="height:0%" data-v="₹${d.v}L" data-target="${(d.v/max)*100}%"></div>
      </div>
      <div class="bc-lbl">${d.m}</div>
    </div>
  `).join('');
  /* Animate bars in */
  setTimeout(() => {
    container.querySelectorAll('.bc-bar').forEach(bar => {
      bar.style.transition = 'height 1s cubic-bezier(.34,1.56,.64,1)';
      bar.style.height = bar.dataset.target;
    });
  }, 200);
}
renderBarChart();

/* ══ ORDERS TABLE ══ */
let REAL_ORDERS = [];

async function loadOrders() {
  try {
    const token = getAdminToken();

    if (!token) {
      REAL_ORDERS = [];
      renderOrders();
      return;
    }

    const res = await fetch('https://paddox-backend.onrender.com/api/orders/admin/all', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (res.status === 401 || res.status === 403) {
      REAL_ORDERS = [];
      renderOrders();
      redirectToLogin('Admin session expired. Please login with admin account.');
      return;
    }

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Failed to load orders');
    }

    REAL_ORDERS = data.data || data.orders || [];

    renderOrders();
    updateOverviewRealtime();
    updateAdminSidebarBadges();
  } catch (err) {
    console.error(err);
    showToast('❌ Failed to load orders');
  }
}

function money(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`;
}

function renderOrders() {
  const tbody = document.getElementById('orders-tbody');
  if (!tbody) return;

  if (!REAL_ORDERS.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center;padding:40px;color:#777">
          No orders yet
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = REAL_ORDERS.map(order => {
    const customer =
      `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim() ||
      order.shippingAddress?.name ||
      'Customer';

    const products =
      (order.items || []).map(i => i.name).join(', ') || 'No products';

    const date =
      order.createdAt
        ? new Date(order.createdAt).toLocaleDateString()
        : '-';

    const total =
      order.pricing?.total ||
      order.total ||
      0;

    return `
      <tr>
        <td><input type="checkbox"/></td>

        <td class="oid">
          #${order.orderNumber || order._id}
        </td>

        <td>${customer}</td>

        <td style="color:var(--muted2);font-size:.76rem">
          ${products}
        </td>

        <td style="color:var(--muted2)">
          ${date}
        </td>

        <td style="font-family:var(--font-d);font-size:1.1rem">
          ${money(total)}
        </td>

        <td>
          <span class="sb s-pr">
            ${order.status || 'placed'}
          </span>
        </td>

        <td>
          <button
            class="act-btn"
            onclick="openOrderView('${order._id}')"
          >
            View
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function openOrderView(orderId) {
  const order = REAL_ORDERS.find(o => o._id === orderId);

  if (!order) {
    showToast('❌ Order not found');
    return;
  }

  const customer =
    `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim() ||
    order.shippingAddress?.name ||
    'Customer';

  const email =
    order.user?.email || '-';

  const address = order.shippingAddress || {};

  const itemsHtml =
    (order.items || []).map(item => `
      <div style="
        display:flex;
        justify-content:space-between;
        gap:12px;
        padding:10px 0;
        border-bottom:1px solid rgba(255,255,255,.08);
      ">
        <div>
          <div style="font-weight:700;color:#fff">
            ${item.name}
          </div>
          <div style="color:#777;font-size:.82rem">
            Qty: ${item.quantity || 1}
          </div>
        </div>
        <div style="font-family:var(--font-d);color:#fff">
          ${money((item.price || 0) * (item.quantity || 1))}
        </div>
      </div>
    `).join('');

  const modal = document.createElement('div');

  modal.innerHTML = `
    <div class="preview-overlay" id="order-view-overlay">
      <div class="preview-card" style="
        max-width:720px;
        width:92vw;
        padding:28px;
        color:#fff;
        text-align:left;
      ">
        <button class="preview-close" id="order-view-close">
          ✕
        </button>

        <div style="
          font-family:var(--font-d);
          letter-spacing:4px;
          font-size:1.8rem;
          margin-bottom:10px;
        ">
          ORDER DETAILS
        </div>

        <div style="color:var(--red);font-family:var(--font-c);letter-spacing:2px;margin-bottom:24px">
          #${order.orderNumber || order._id}
        </div>

        <div style="
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:18px;
          margin-bottom:22px;
        ">
          <div>
            <div style="color:#777;font-size:.75rem;letter-spacing:2px">CUSTOMER</div>
            <div style="font-weight:700">${customer}</div>
            <div style="color:#777">${email}</div>
          </div>

          <div>
            <div style="color:#777;font-size:.75rem;letter-spacing:2px">STATUS</div>
            <select id="order-status-select" style="
              width:100%;
              padding:10px;
              background:#151515;
              color:#fff;
              border:1px solid rgba(255,255,255,.15);
              margin-top:6px;
            ">
              <option value="placed">placed</option>
              <option value="processing">processing</option>
              <option value="shipped">shipped</option>
              <option value="out_for_delivery">out_for_delivery</option>
              <option value="delivered">delivered</option>
              <option value="cancelled">cancelled</option>
            </select>
          </div>
        </div>

        <div style="margin-bottom:22px">
          <div style="color:#777;font-size:.75rem;letter-spacing:2px;margin-bottom:8px">
            PRODUCTS
          </div>
          ${itemsHtml || '<div style="color:#777">No items</div>'}
        </div>

        <div style="
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:18px;
          margin-bottom:22px;
        ">
          <div>
            <div style="color:#777;font-size:.75rem;letter-spacing:2px">SHIPPING ADDRESS</div>
            <div style="line-height:1.6;color:#ddd">
              ${address.name || customer}<br>
              ${address.line1 || ''}<br>
              ${address.city || ''}, ${address.state || ''}<br>
              ${address.pincode || ''}<br>
              ${address.phone || ''}
            </div>
          </div>

          <div>
            <div style="color:#777;font-size:.75rem;letter-spacing:2px">PAYMENT</div>
            <div style="line-height:1.8;color:#ddd">
              Subtotal: ${money(order.pricing?.subtotal)}<br>
              Shipping: ${money(order.pricing?.shipping)}<br>
              Tax: ${money(order.pricing?.tax)}<br>
              <strong style="font-size:1.3rem;color:#fff">
                Total: ${money(order.pricing?.total)}
              </strong>
            </div>
          </div>
        </div>

        <button
          class="act-btn"
          id="save-order-status"
          style="
            width:100%;
            padding:14px;
            background:var(--red);
            color:white;
            border:0;
            font-weight:800;
            letter-spacing:3px;
          "
        >
          UPDATE STATUS
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const select = modal.querySelector('#order-status-select');
  select.value = order.status || 'placed';

  modal.querySelector('#order-view-close').onclick = () => modal.remove();

  modal.querySelector('#order-view-overlay').onclick = e => {
    if (e.target.id === 'order-view-overlay') {
      modal.remove();
    }
  };

  modal.querySelector('#save-order-status').onclick = async () => {
    await updateOrderStatus(order._id, select.value);
    modal.remove();
  };
}

async function updateOrderStatus(orderId, status) {
  try {
    showToast('⏳ Updating order status...');

    const res = await fetch(
      `https://paddox-backend.onrender.com/api/orders/admin/${orderId}/status`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAdminToken()}`
        },
        body: JSON.stringify({
          status,
          message: `Order status changed to ${status}`
        })
      }
    );

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Status update failed');
    }

    showToast('🔥 Order status updated');

    await loadOrders();

  } catch (err) {
    console.error(err);
    showToast(`❌ ${err.message}`);
  }
}

renderOrders();
/* ══════════════════════════════════════
   ORDER DETAILS MODAL + STATUS UPDATE
══════════════════════════════════════ */

function ensureOrderModal() {
  if (document.getElementById('order-details-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'order-details-modal';
  modal.innerHTML = `
    <div class="order-modal-backdrop" onclick="closeOrderDetails(event)">
      <div class="order-modal-card" onclick="event.stopPropagation()">
        <div class="order-modal-head">
          <div>
            <div class="order-modal-kicker">ORDER DETAILS</div>
            <h2 id="od-title">#ORDER</h2>
          </div>
          <button class="order-modal-close" onclick="closeOrderDetails()">✕</button>
        </div>

        <div id="od-body"></div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const style = document.createElement('style');
  style.id = 'order-modal-style';
  style.textContent = `
    #order-details-modal{display:none;position:fixed;inset:0;z-index:99999}
    #order-details-modal.show{display:block}
    .order-modal-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.78);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:20px}
    .order-modal-card{width:min(900px,95vw);max-height:90vh;overflow:auto;background:#0b0b0d;border:1px solid rgba(255,255,255,.12);box-shadow:0 20px 80px rgba(0,0,0,.65);padding:26px;color:#fff}
    .order-modal-head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px solid rgba(255,255,255,.1);padding-bottom:18px;margin-bottom:18px}
    .order-modal-kicker{font-family:var(--font-c);letter-spacing:4px;color:var(--red);font-size:.75rem}
    .order-modal-head h2{font-family:var(--font-c);letter-spacing:3px;margin:6px 0 0;font-size:2rem}
    .order-modal-close{background:none;border:0;color:#fff;font-size:1.8rem;cursor:pointer}
    .od-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-bottom:18px}
    .od-box{background:#111;border:1px solid rgba(255,255,255,.08);padding:14px}
    .od-label{font-family:var(--font-c);letter-spacing:2px;color:#777;font-size:.75rem;margin-bottom:6px;text-transform:uppercase}
    .od-value{font-weight:700;font-size:1rem;color:#fff}
    .od-items{width:100%;border-collapse:collapse;margin-top:12px;background:#101010;border:1px solid rgba(255,255,255,.08)}
    .od-items th,.od-items td{padding:12px;border-bottom:1px solid rgba(255,255,255,.08);text-align:left}
    .od-items th{font-family:var(--font-c);letter-spacing:2px;color:#777;font-size:.75rem}
    .od-status-row{display:flex;gap:10px;align-items:center;margin-top:18px;background:#111;border:1px solid rgba(255,255,255,.08);padding:14px;flex-wrap:wrap}
    .od-select{background:#1b1b1f;color:#fff;border:1px solid rgba(255,255,255,.15);padding:12px;min-width:220px;font-family:var(--font-b)}
    .od-btn{background:var(--red);border:0;color:#fff;padding:12px 18px;font-family:var(--font-c);letter-spacing:2px;cursor:pointer;text-transform:uppercase}
    .od-btn:hover{filter:brightness(1.1)}
    @media(max-width:700px){.od-grid{grid-template-columns:1fr}.order-modal-card{padding:18px}}
  `;
  document.head.appendChild(style);
}

function formatMoney(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

function openOrderDetails(orderId) {
  ensureOrderModal();

  const order = REAL_ORDERS.find(o => String(o._id) === String(orderId));

  if (!order) {
    showToast('❌ Order not found');
    return;
  }

  const customerName = `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim() || 'Customer';
  const customerEmail = order.user?.email || 'No email';
  const items = order.items || [];
  const address = order.shippingAddress || {};

  document.getElementById('od-title').textContent = `#${order.orderNumber || order._id}`;

  document.getElementById('od-body').innerHTML = `
    <div class="od-grid">
      <div class="od-box">
        <div class="od-label">Customer</div>
        <div class="od-value">${customerName}</div>
        <div style="color:#888;margin-top:4px">${customerEmail}</div>
      </div>
      <div class="od-box">
        <div class="od-label">Order Date</div>
        <div class="od-value">${new Date(order.createdAt).toLocaleString()}</div>
      </div>
      <div class="od-box">
        <div class="od-label">Current Status</div>
        <div class="od-value"><span class="sb s-pr">${String(order.status || 'placed').toUpperCase()}</span></div>
      </div>
      <div class="od-box">
        <div class="od-label">Total Amount</div>
        <div class="od-value">${formatMoney(order.pricing?.total)}</div>
      </div>
    </div>

    <div class="od-box">
      <div class="od-label">Shipping Address</div>
      <div class="od-value">
        ${address.name || customerName}<br>
        ${address.line1 || address.address || ''}<br>
        ${address.city || ''}, ${address.state || ''} - ${address.pincode || ''}<br>
        ${address.country || 'India'} · ${address.phone || ''}
      </div>
    </div>

    <table class="od-items">
      <thead>
        <tr>
          <th>Product</th>
          <th>Qty</th>
          <th>Price</th>
          <th>Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${items.map(item => `
          <tr>
            <td>${item.name || item.product?.name || 'Product'}</td>
            <td>${item.quantity || 1}</td>
            <td>${formatMoney(item.price)}</td>
            <td>${formatMoney((item.price || 0) * (item.quantity || 1))}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="od-grid" style="margin-top:18px">
      <div class="od-box">
        <div class="od-label">Subtotal</div>
        <div class="od-value">${formatMoney(order.pricing?.subtotal)}</div>
      </div>
      <div class="od-box">
        <div class="od-label">Shipping</div>
        <div class="od-value">${formatMoney(order.pricing?.shipping)}</div>
      </div>
      <div class="od-box">
        <div class="od-label">Tax</div>
        <div class="od-value">${formatMoney(order.pricing?.tax)}</div>
      </div>
      <div class="od-box">
        <div class="od-label">Grand Total</div>
        <div class="od-value">${formatMoney(order.pricing?.total)}</div>
      </div>
    </div>

    <div class="od-status-row">
      <div class="od-label" style="margin:0;color:var(--red)">Update Status</div>
      <select class="od-select" id="od-status-select">
        ${['placed','processing','shipped','out_for_delivery','delivered','cancelled'].map(st => `
          <option value="${st}" ${order.status === st ? 'selected' : ''}>${st.replaceAll('_',' ').toUpperCase()}</option>
        `).join('')}
      </select>
      <button class="od-btn" onclick="updateOrderStatus('${order._id}')">Update</button>
    </div>
  `;

  document.getElementById('order-details-modal').classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeOrderDetails(event) {
  if (event && event.target !== event.currentTarget) return;

  document.getElementById('order-details-modal')?.classList.remove('show');
  document.body.style.overflow = '';
}

async function updateOrderStatus(orderId) {
  const status = document.getElementById('od-status-select')?.value;

  if (!status) return;

  try {
    showToast('⏳ Updating order status...');

    const res = await fetch(`${'https://paddox-backend.onrender.com/api/orders/admin'}/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAdminToken()}`
      },
      body: JSON.stringify({
        status,
        message: `Order marked as ${status.replaceAll('_',' ')}`
      })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || 'Status update failed');
    }

    showToast('🔥 Order status updated');

    await loadOrders();
    openOrderDetails(orderId);

  } catch (err) {
    console.error(err);
    showToast(`❌ ${err.message}`);
  }
}


/* ══════════════════════════════════════
   LIVE OVERVIEW DASHBOARD
   Safe patch: updates existing HTML only
══════════════════════════════════════ */

function formatOverviewMoney(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

function getOverviewTotal(order) {
  return Number(
    order?.pricing?.total ||
    order?.total ||
    order?.amount ||
    0
  );
}

function getOverviewCustomer(order) {
  return (
    `${order?.user?.firstName || ''} ${order?.user?.lastName || ''}`.trim() ||
    order?.shippingAddress?.name ||
    'Customer'
  );
}

function getOverviewStatusClass(status = '') {
  const s = String(status).toLowerCase();

  if (s === 'delivered') return 's-del';
  if (s === 'shipped') return 's-sh';
  if (s === 'out_for_delivery') return 's-sh';
  if (s === 'processing') return 's-pr';
  if (s === 'cancelled') return 's-out';

  return 's-pr';
}

function updateOverviewCards() {
  const overview = document.getElementById('adm-overview');
  if (!overview) return;

  const cards = overview.querySelectorAll('.kpi-card');
  if (!cards.length) return;

  const totalRevenue = REAL_ORDERS.reduce(
    (sum, order) => sum + getOverviewTotal(order),
    0
  );

  const uniqueUsers = new Set(
    REAL_ORDERS
      .map(order => order?.user?._id || order?.user?.email || order?.shippingAddress?.phone)
      .filter(Boolean)
  ).size;

  const lowStockCount = REAL_PRODUCTS.filter(
    product => Number(product.stock || 0) <= 10
  ).length;

  const values = [
    {
      label: 'Total Revenue',
      value: formatOverviewMoney(totalRevenue),
      change: 'Based on orders'
    },
    {
      label: 'Total Orders',
      value: REAL_ORDERS.length,
      change: 'Live orders'
    },
    {
      label: 'Order Customers',
      value: uniqueUsers,
      change: 'From order users'
    },
    {
      label: 'Low Stock',
      value: lowStockCount,
      change: 'From products'
    }
  ];

  cards.forEach((card, index) => {
    const data = values[index];
    if (!data) return;

    const label = card.querySelector('.kpi-label');
    const value = card.querySelector('.kpi-value');
    const change = card.querySelector('.kpi-change');

    if (label) label.textContent = data.label;
    if (value) value.textContent = data.value;
    if (change) change.textContent = data.change;
  });
}

function updateOverviewRecentOrders() {
  const overview = document.getElementById('adm-overview');
  if (!overview) return;

  const cards = [...overview.querySelectorAll('.table-card')];
  const recentCard = cards.find(card =>
    card.querySelector('.table-card-title')?.textContent
      ?.toLowerCase()
      .includes('recent orders')
  );

  const tbody = recentCard?.querySelector('tbody');
  if (!tbody) return;

  const recentOrders = REAL_ORDERS.slice(0, 4);

  if (!recentOrders.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center;padding:24px;color:#777">
          No orders yet
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = recentOrders.map(order => `
    <tr>
      <td class="oid">
        #${order.orderNumber || order._id}
      </td>

      <td>
        ${getOverviewCustomer(order)}
      </td>

      <td>
        ${formatOverviewMoney(getOverviewTotal(order))}
      </td>

      <td>
        <span class="sb ${getOverviewStatusClass(order.status)}">
          ${String(order.status || 'placed').replaceAll('_', ' ')}
        </span>
      </td>
    </tr>
  `).join('');
}

function updateOverviewLowStock() {
  const overview = document.getElementById('adm-overview');
  if (!overview) return;

  const cards = [...overview.querySelectorAll('.table-card')];
  const stockCard = cards.find(card =>
    card.querySelector('.table-card-title')?.textContent
      ?.toLowerCase()
      .includes('low stock')
  );

  const tbody = stockCard?.querySelector('tbody');
  if (!tbody) return;

  const products = REAL_PRODUCTS
    .filter(product => Number(product.stock || 0) <= 10)
    .slice(0, 4);

  if (!products.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="3" style="text-align:center;padding:24px;color:#777">
          No low stock products
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = products.map(product => {
    const stock = Number(product.stock || 0);
    const isOut = stock <= 0;

    return `
      <tr>
        <td>${product.name || 'Product'}</td>
        <td>${stock}</td>
        <td>
          <span class="sb ${isOut ? 's-out' : 's-low'}">
            ${isOut ? 'Out' : 'Low'}
          </span>
        </td>
      </tr>
    `;
  }).join('');
}

function updateOverviewRevenueChart() {
  const container = document.getElementById('bar-chart');
  if (!container) return;

  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];

  const monthTotals = labels.map((label, index) => {
    return REAL_ORDERS.reduce((sum, order) => {
      if (!order.createdAt) return sum;

      const d = new Date(order.createdAt);

      if (d.getMonth() === index) {
        return sum + getOverviewTotal(order);
      }

      return sum;
    }, 0);
  });

  const max = Math.max(...monthTotals, 1);

  container.innerHTML = labels.map((label, index) => {
    const total = monthTotals[index];
    const height = Math.max(8, (total / max) * 100);

    return `
      <div class="bc-col">
        <div class="bc-wrap">
          <div
            class="bc-bar"
            style="height:${height}%"
            data-v="${formatOverviewMoney(total)}"
          ></div>
        </div>
        <div class="bc-lbl">${label}</div>
      </div>
    `;
  }).join('');
}


function updateAdminSidebarBadges() {
  const navItems = document.querySelectorAll('.adm-nav-item');

  navItems.forEach(item => {
    const label =
      (item.textContent || '')
        .replace(/\d+/g, '')
        .trim()
        .toLowerCase();

    const badge = item.querySelector('.adm-badge');

    if (!badge) return;

    let count = 0;

    if (label.includes('orders')) {
      count = REAL_ORDERS.length;
    } else if (label.includes('moderation')) {
      count = 0;
    } else {
      count = 0;
    }

    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-flex' : 'none';
  });
}

function updateOverviewRealtime() {
  updateOverviewCards();
  updateOverviewRecentOrders();
  updateOverviewLowStock();
  updateOverviewRevenueChart();
  renderAnalyticsRealtime();
  updateAdminSidebarBadges();
}


/* ══ PRODUCTS TABLE ══ */
async function loadProducts() {

  try {

    const res =
      await fetch(PRODUCT_API_BASE);

    const data =
      await res.json();

    REAL_PRODUCTS =
      data.data ||
      data.products ||
      [];

    renderProducts();
    renderInventory();
    updateOverviewRealtime();
    updateAdminSidebarBadges();

  } catch(err) {

    console.error(err);

    showToast('❌ Failed to load products');
    REAL_PRODUCTS = Array.isArray(REAL_PRODUCTS) ? REAL_PRODUCTS : [];
    renderProducts?.();
  }
}

function escapeProductHTML(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function getProductCategoryLabel(value) {
  const v = String(value || 'custom').toLowerCase();
  return v.charAt(0).toUpperCase() + v.slice(1);
}

function getProductSaleInfo(product = {}) {
  const price = Number(product.price || 0);
  const sale = Number(product.salePrice || 0);
  const active = price > 0 && sale > 0 && sale < price;
  const percent = active ? Math.round(((price - sale) / price) * 100) : 0;
  const savings = active ? Math.max(0, price - sale) : 0;

  return { price, sale, active, percent, savings };
}

function getProductDiscountLabel(product = {}) {
  const info = getProductSaleInfo(product);
  return info.active ? `${info.percent}% OFF` : 'No discount';
}

function getProductPrice(product) {
  const info = getProductSaleInfo(product);

  if (info.active) {
    return `
      <div class="product-price-stack has-discount">
        <span class="product-sale-price">₹${info.sale.toLocaleString('en-IN')}</span>
        <span class="product-mrp">₹${info.price.toLocaleString('en-IN')}</span>
        <span class="product-discount-chip">${info.percent}% OFF</span>
      </div>
    `;
  }

  return `<span class="product-sale-price">₹${info.price.toLocaleString('en-IN')}</span>`;
}

function getProductStockPill(product) {
  const stock = Number(product.stock || 0);
  let cls = 'ok';
  let label = `${stock} units`;

  if (stock <= 0) {
    cls = 'out';
    label = 'Out';
  } else if (stock <= 10) {
    cls = 'low';
    label = `${stock} low`;
  }

  return `<span class="product-stock-pill ${cls}">${label}</span>`;
}

function getFilteredProducts() {
  const category = String(document.getElementById('product-category-filter')?.value || 'all').toLowerCase();
  const team = String(document.getElementById('product-team-filter')?.value || 'all').toLowerCase();
  const saleFilter = String(document.getElementById('product-sale-filter')?.value || 'all').toLowerCase();
  const search = String(document.getElementById('product-search-input')?.value || '').toLowerCase().trim();

  return REAL_PRODUCTS.filter(product => {
    const productCategory = String(product.category || '').toLowerCase();
    const productTeam = String(product.team || '').toLowerCase();
    const saleInfo = getProductSaleInfo(product);
    const haystack = [product.name, product.category, product.team, product.badge, product.description, getProductDiscountLabel(product)]
      .map(v => String(v || '').toLowerCase())
      .join(' ');

    const categoryOk = category === 'all' || productCategory === category;
    const teamOk = teamMatchesProductFilter(productTeam, team);
    const saleOk = saleFilter === 'all' || (saleFilter === 'sale' ? saleInfo.active : !saleInfo.active);
    const searchOk = !search || haystack.includes(search);

    return categoryOk && teamOk && saleOk && searchOk;
  });
}

function updateProductStats() {
  const total = REAL_PRODUCTS.length;
  const featured = REAL_PRODUCTS.filter(product => product.isFeatured || String(product.badge || '').toLowerCase() === 'featured').length;
  const saleDeals = REAL_PRODUCTS.filter(product => getProductSaleInfo(product).active).length;
  const low = REAL_PRODUCTS.filter(product => Number(product.stock || 0) <= 10).length;
  const units = REAL_PRODUCTS.reduce((sum, product) => sum + Number(product.stock || 0), 0);

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  setText('products-count-stat', total);
  setText('products-featured-stat', featured);
  setText('products-sale-stat', saleDeals);
  setText('products-low-stat', low);
  setText('products-stock-stat', units.toLocaleString('en-IN'));
}

function renderProducts() {

  const tbody =
    document.getElementById('products-tbody');

  if (!tbody) return;

  updateProductStats();

  const products = getFilteredProducts();

  if (!products.length) {

    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="products-empty-state">
          <div class="products-empty-icon">◇</div>
          <strong>No matching products</strong>
          <span>Adjust filters or add a new PADDOX product drop.</span>
        </td>
      </tr>
    `;

    return;
  }

  tbody.innerHTML =
    products.map(product => {

      const image =
        product.images?.[0]?.url ||
        'assets/paddox-logo-icon-official.png';

      const isFeatured = product.isFeatured || String(product.badge || '').toLowerCase() === 'featured';
      const badge = String(product.badge || '').toLowerCase();
      const saleInfo = getProductSaleInfo(product);
      const statusClass = product.isActive === false ? 's-out' : 's-act';
      const statusText = product.isActive === false ? 'Inactive' : 'Active';

      return `
        <tr>
          <td class="product-main-cell">
            <div class="product-admin-cardline">
              <img src="${escapeProductHTML(image)}" alt="${escapeProductHTML(product.name || 'Product')}" class="product-admin-thumb">
              <div class="product-admin-meta">
                <strong>${escapeProductHTML(product.name || 'Untitled product')}</strong>
                <span>${escapeProductHTML(product._id || product.slug || 'Live MongoDB product')}</span>
              </div>
            </div>
          </td>

          <td><span class="product-category-pill">${escapeProductHTML(getProductCategoryLabel(product.category))}</span></td>

          <td><span class="product-team-text">${escapeProductHTML(product.team || 'Paddox')}</span></td>

          <td>${getProductPrice(product)}</td>

          <td>${getProductStockPill(product)}</td>

          <td>
            <div class="product-flag-stack">
              ${isFeatured ? '<span class="product-flag featured">Featured</span>' : ''}
              ${badge && badge !== 'featured' ? `<span class="product-flag">${escapeProductHTML(badge.toUpperCase())}</span>` : ''}
              ${saleInfo.active ? `<span class="product-flag sale">${saleInfo.percent}% OFF</span>` : ''}
              ${!isFeatured && !badge && !saleInfo.active ? '<span class="product-flag muted">Standard</span>' : ''}
            </div>
          </td>

          <td>
            <span class="sb ${statusClass}">${statusText}</span>
          </td>

          <td>
            <div class="product-row-actions">
              <button class="act-btn" onclick="openProductEditModal('${product._id}')">Edit</button>
              <button class="act-btn product-delete-btn" onclick="deleteProduct('${product._id}')">Delete</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
}

function bindProductAdminControls() {
  ['product-category-filter', 'product-sale-filter', 'product-team-filter', 'product-search-input'].forEach(id => {
    const el = document.getElementById(id);
    if (el && !el.dataset.productBound) {
      const eventName = el.tagName === 'INPUT' ? 'input' : 'change';
      el.addEventListener(eventName, renderProducts);
      el.dataset.productBound = 'true';
    }
  });

  const refresh = document.getElementById('products-refresh-btn');
  if (refresh && !refresh.dataset.productBound) {
    refresh.addEventListener('click', async () => {
      showToast('⏳ Syncing products...');
      await loadProducts();
      showToast('🔥 Products synced');
    });
    refresh.dataset.productBound = 'true';
  }
}


/* ══ INVENTORY TABLE — REALTIME ══ */
const INVENTORY_REORDER_POINT = 10;
const INVENTORY_RESTOCK_TARGET = 30;
let INVENTORY_EDIT_ID = null;

function getInventoryStock(product = {}) {
  return Math.max(0, Number(product.stock || 0));
}

function getInventoryReorderPoint(product = {}) {
  return Math.max(1, Number(product.lowStockThreshold || product.reorderPoint || INVENTORY_REORDER_POINT));
}

function getProductStockStatus(product) {
  const stock = getInventoryStock(product);
  const reorderPoint = getInventoryReorderPoint(product);

  if (stock <= 0) {
    return {
      key: 'out',
      cls: 's-out',
      row: 'inventory-row-out',
      label: 'Out of Stock',
      bar: 'var(--red)'
    };
  }

  if (stock <= reorderPoint) {
    return {
      key: 'low',
      cls: 's-low',
      row: 'inventory-row-low',
      label: 'Low Stock',
      bar: 'var(--orange)'
    };
  }

  return {
    key: 'in',
    cls: 's-act',
    row: 'inventory-row-ok',
    label: 'In Stock',
    bar: 'var(--green)'
  };
}

function productSku(product, index) {
  if (product.sku) return product.sku;

  const category = String(product.category || 'PRD')
    .replace(/[^a-z0-9]/gi, '')
    .slice(0, 3)
    .toUpperCase() || 'PRD';

  return `PDX-${category}-${String(index + 1).padStart(3, '0')}`;
}

function getInventoryProducts() {
  const stockFilter = String(document.getElementById('inventory-stock-filter')?.value || 'all').toLowerCase();
  const search = String(document.getElementById('inventory-search-input')?.value || '').toLowerCase().trim();

  return (REAL_PRODUCTS || []).filter(product => {
    const status = getProductStockStatus(product);
    const haystack = [
      product.name,
      product.category,
      product.team,
      product.sku,
      product._id,
      productSku(product, REAL_PRODUCTS.indexOf(product)),
      status.label
    ].map(v => String(v || '').toLowerCase()).join(' ');

    const stockOk = stockFilter === 'all' || status.key === stockFilter;
    const searchOk = !search || haystack.includes(search);

    return stockOk && searchOk;
  });
}

function updateInventoryStats() {
  const products = REAL_PRODUCTS || [];
  const totalProducts = products.length;
  const totalUnits = products.reduce((sum, product) => sum + getInventoryStock(product), 0);
  const lowCount = products.filter(product => getProductStockStatus(product).key === 'low').length;
  const outCount = products.filter(product => getProductStockStatus(product).key === 'out').length;

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  setText('inventory-total-products', totalProducts.toLocaleString('en-IN'));
  setText('inventory-total-units', totalUnits.toLocaleString('en-IN'));
  setText('inventory-low-count', lowCount.toLocaleString('en-IN'));
  setText('inventory-out-count', outCount.toLocaleString('en-IN'));
}

function renderInventory() {
  const tbody = document.getElementById('inventory-tbody');

  if (!tbody) return;

  updateInventoryStats();

  const products = getInventoryProducts();

  if (!products.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="inventory-empty-state">
          <div class="inventory-empty-icon">▣</div>
          <strong>No inventory records found</strong>
          <span>Try another filter or sync your products again.</span>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = products.map((product, filteredIndex) => {
    const originalIndex = REAL_PRODUCTS.indexOf(product);
    const stock = getInventoryStock(product);
    const reorderPoint = getInventoryReorderPoint(product);
    const capacity = Math.max(INVENTORY_RESTOCK_TARGET, reorderPoint * 3, stock);
    const pct = stock <= 0 ? 0 : Math.max(4, Math.min(100, Math.round((stock / capacity) * 100)));
    const status = getProductStockStatus(product);

    const image = product.images?.[0]?.url || product.image || 'assets/paddox-logo-icon-official.png';

    return `
      <tr class="${status.row}">
        <td>
          <div class="inventory-product-line">
            <img src="${escapeProductHTML(image)}" alt="${escapeProductHTML(product.name || 'Product')}" class="inventory-thumb">
            <div class="inventory-product-copy">
              <strong>${escapeProductHTML(product.name || 'Product')}</strong>
              <span>${escapeProductHTML(product.category || '-')} · ${escapeProductHTML(product.team || '-')}</span>
            </div>
          </div>
        </td>

        <td><span class="inventory-sku">${escapeProductHTML(productSku(product, originalIndex >= 0 ? originalIndex : filteredIndex))}</span></td>

        <td>
          <div class="inventory-stock-count ${status.key}">${stock} units</div>
          ${stock <= reorderPoint && stock > 0 ? '<small class="inventory-warning">Needs restock</small>' : ''}
        </td>

        <td>
          <div class="inventory-level-wrap" title="${pct}% stock health">
            <div class="inventory-level-bar" style="width:${pct}%;background:${status.bar}"></div>
          </div>
          <div class="inventory-level-note">${pct}% capacity</div>
        </td>

        <td><span class="inventory-reorder-pill">${reorderPoint} units</span></td>

        <td><span class="sb ${status.cls}">${status.label}</span></td>

        <td>
          <div class="inventory-actions">
            <button class="act-btn" onclick="openRestockModal('${product._id}')">Restock</button>
            <button class="act-btn" onclick="quickSetStock('${product._id}', 0)">Mark Out</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function bindInventoryAdminControls() {
  ['inventory-stock-filter', 'inventory-search-input'].forEach(id => {
    const el = document.getElementById(id);
    if (el && !el.dataset.inventoryBound) {
      const eventName = el.tagName === 'INPUT' ? 'input' : 'change';
      el.addEventListener(eventName, renderInventory);
      el.dataset.inventoryBound = 'true';
    }
  });

  const refreshBtn = document.getElementById('inventory-refresh-btn');
  if (refreshBtn && !refreshBtn.dataset.inventoryBound) {
    refreshBtn.addEventListener('click', async () => {
      showToast('⏳ Syncing inventory...');
      await loadProducts();
      showToast('🔥 Inventory synced');
    });
    refreshBtn.dataset.inventoryBound = 'true';
  }

  const restockLowBtn = document.getElementById('inventory-restock-low-btn');
  if (restockLowBtn && !restockLowBtn.dataset.inventoryBound) {
    restockLowBtn.addEventListener('click', bulkRestockLowStock);
    restockLowBtn.dataset.inventoryBound = 'true';
  }
}

function ensureRestockModal() {
  if (document.getElementById('inventory-restock-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'inventory-restock-modal';
  modal.className = 'inventory-modal';
  modal.innerHTML = `
    <div class="inventory-modal-backdrop" onclick="closeRestockModal(event)">
      <div class="inventory-modal-card" onclick="event.stopPropagation()">
        <button class="inventory-modal-close" type="button" onclick="closeRestockModal()">✕</button>
        <div class="inventory-modal-kicker">STOCK UPDATE</div>
        <h3 id="inventory-modal-title">Restock Product</h3>
        <p id="inventory-modal-sub">Set a new stock quantity for this product.</p>
        <label class="inventory-modal-label" for="inventory-modal-stock">New stock quantity</label>
        <input id="inventory-modal-stock" class="inventory-modal-input" type="number" min="0" step="1" value="30">
        <div class="inventory-modal-actions">
          <button class="adm-btn-ghost" type="button" onclick="closeRestockModal()">Cancel</button>
          <button class="adm-btn-red" type="button" onclick="submitRestockModal()">Update Stock</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

function openRestockModal(productId) {
  ensureRestockModal();

  const product = REAL_PRODUCTS.find(p => String(p._id) === String(productId));

  if (!product) {
    showToast('❌ Product not found');
    return;
  }

  INVENTORY_EDIT_ID = productId;

  const currentStock = getInventoryStock(product);
  const targetStock = Math.max(currentStock, INVENTORY_RESTOCK_TARGET);

  const modal = document.getElementById('inventory-restock-modal');
  const title = document.getElementById('inventory-modal-title');
  const sub = document.getElementById('inventory-modal-sub');
  const input = document.getElementById('inventory-modal-stock');

  if (title) title.textContent = product.name || 'Restock Product';
  if (sub) sub.textContent = `Current stock: ${currentStock} units · Reorder point: ${getInventoryReorderPoint(product)} units`;
  if (input) {
    input.value = String(targetStock);
    setTimeout(() => input.focus(), 60);
  }

  modal?.classList.add('show');
}

function closeRestockModal(event) {
  if (event && event.target !== event.currentTarget) return;
  document.getElementById('inventory-restock-modal')?.classList.remove('show');
  INVENTORY_EDIT_ID = null;
}

async function submitRestockModal() {
  const input = document.getElementById('inventory-modal-stock');
  const stock = Number(input?.value || 0);

  if (!INVENTORY_EDIT_ID) {
    showToast('❌ Product not selected');
    return;
  }

  if (!Number.isFinite(stock) || stock < 0) {
    showToast('❌ Enter a valid stock number');
    return;
  }

  await updateProductStock(INVENTORY_EDIT_ID, stock);
  closeRestockModal();
}

function openRestockPrompt(productId) {
  openRestockModal(productId);
}

async function quickSetStock(productId, stock) {
  const product = REAL_PRODUCTS.find(p => String(p._id) === String(productId));
  const name = product?.name || 'this product';

  if (!confirm(`Mark ${name} as out of stock?`)) return;

  await updateProductStock(productId, stock);
}

async function updateProductStock(productId, stock) {
  try {
    showToast('⏳ Updating stock...');

    const res = await fetch(
      `${PRODUCT_API_BASE}/admin/${productId}/stock`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAdminToken()}`
        },
        body: JSON.stringify({ stock: Number(stock) })
      }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok || data.success === false) {
      throw new Error(data.message || 'Stock update failed');
    }

    const updated = data.data?.product || data.product;
    const index = REAL_PRODUCTS.findIndex(product => String(product._id) === String(productId));

    if (updated && index >= 0) {
      REAL_PRODUCTS[index] = updated;
      renderProducts();
      renderInventory();
      updateOverviewRealtime();
    } else {
      await loadProducts();
    }

    showToast('🔥 Stock updated');

  } catch (err) {
    console.error(err);
    showToast(`❌ ${err.message}`);
  }
}

async function bulkRestockLowStock() {
  const lowProducts = (REAL_PRODUCTS || []).filter(product => {
    const status = getProductStockStatus(product);
    return status.key === 'low' || status.key === 'out';
  });

  if (!lowProducts.length) {
    showToast('✅ Inventory already healthy');
    return;
  }

  if (!confirm(`Restock ${lowProducts.length} low/out-of-stock products to ${INVENTORY_RESTOCK_TARGET} units?`)) return;

  try {
    showToast('⏳ Restocking low stock products...');

    const res = await fetch(
      `${PRODUCT_API_BASE}/admin/inventory/restock-low`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAdminToken()}`
        },
        body: JSON.stringify({ targetStock: INVENTORY_RESTOCK_TARGET, threshold: INVENTORY_REORDER_POINT })
      }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok || data.success === false) {
      throw new Error(data.message || 'Bulk restock failed');
    }

    showToast(`🔥 Restocked ${data.data?.modifiedCount ?? data.modifiedCount ?? lowProducts.length} products`);
    await loadProducts();

  } catch (err) {
    console.error(err);
    showToast(`❌ ${err.message}`);
  }
}


/* ══ DIGITAL ASSETS GRID ══ */
/* ═══════════════════════════════════════
   REAL DIGITAL ASSETS SYSTEM
═══════════════════════════════════════ */

/* A4.7A.2: API bases and REAL_PRODUCTS are declared at top for hoist-safe loading. */
var PADDOX_PRODUCT_TEAMS = [
  { value: 'Ferrari', label: 'Ferrari', aliases: ['ferrari', 'scuderia ferrari'] },
  { value: 'Red Bull Racing', label: 'Red Bull Racing', aliases: ['red bull', 'red bull racing', 'oracle red bull', 'oracle red bull racing'] },
  { value: 'Mercedes', label: 'Mercedes', aliases: ['mercedes', 'mercedes-amg', 'mercedes amg'] },
  { value: 'McLaren', label: 'McLaren', aliases: ['mclaren', 'mclaren f1'] },
  { value: 'Aston Martin', label: 'Aston Martin', aliases: ['aston martin'] },
  { value: 'Alpine', label: 'Alpine', aliases: ['alpine', 'bwt alpine'] },
  { value: 'Williams', label: 'Williams', aliases: ['williams'] },
  { value: 'Haas F1 Team', label: 'Haas F1 Team', aliases: ['haas', 'haas f1', 'haas f1 team'] },
  { value: 'Racing Bulls', label: 'Racing Bulls', aliases: ['racing bulls', 'rb', 'visa cash app rb', 'vcarb'] },
  { value: 'Audi', label: 'Audi', aliases: ['audi', 'kick sauber', 'sauber', 'stake sauber'] },
  { value: 'Cadillac', label: 'Cadillac', aliases: ['cadillac'] },
  { value: 'PADDOX Original', label: 'PADDOX Original', aliases: ['paddox', 'paddox original', 'paddox originals'] },
  { value: 'Collector', label: 'Collector', aliases: ['collector', 'collectors'] }
];

function getProductTeamOptionsHTML(selected = '') {
  const selectedKey = String(selected || '').toLowerCase();
  const optionHtml = PADDOX_PRODUCT_TEAMS.map(team => {
    const aliases = [team.value, team.label, ...(team.aliases || [])].map(v => String(v).toLowerCase());
    const isSelected = aliases.includes(selectedKey);
    return `<option value="${team.value}" ${isSelected ? 'selected' : ''}>${team.label}</option>`;
  }).join('');

  return `
    <optgroup label="Shop Team Categories">
      ${optionHtml.split('</option>').slice(0, 11).filter(Boolean).map(x => x + '</option>').join('')}
    </optgroup>
    <optgroup label="PADDOX Collections">
      ${optionHtml.split('</option>').slice(11).filter(Boolean).map(x => x + '</option>').join('')}
    </optgroup>
  `;
}

function teamMatchesProductFilter(productTeam, selectedTeam) {
  const wanted = String(selectedTeam || 'all').toLowerCase();
  if (wanted === 'all') return true;

  const productValue = String(productTeam || '').toLowerCase();
  const team = PADDOX_PRODUCT_TEAMS.find(item =>
    [item.value, item.label, ...(item.aliases || [])]
      .map(v => String(v).toLowerCase())
      .includes(wanted)
  );

  if (!team) return productValue === wanted;

  return [team.value, team.label, ...(team.aliases || [])]
    .map(v => String(v).toLowerCase())
    .some(alias => productValue === alias || productValue.includes(alias));
}

function canonicalProductTeam(value = '') {
  const key = String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  if (!key) return 'PADDOX Original';

  const found = PADDOX_PRODUCT_TEAMS.find(team =>
    [team.value, team.label, ...(team.aliases || [])]
      .map(v => String(v).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim())
      .some(alias => key === alias || key.includes(alias) || alias.includes(key))
  );

  return found ? found.value : String(value || 'PADDOX Original').trim();
}


/* A4.7A.2: REAL_ASSETS declared at top. */
let EDIT_ASSET_ID = null;
/* LOAD ASSETS */
async function loadAssets() {
  try {
    const res = await fetch(ASSET_API_BASE);
    const data = await res.json();

    REAL_ASSETS = Array.isArray(data.data) ? data.data : (Array.isArray(data.assets) ? data.assets : []);

    renderAssets();

  } catch (err) {
    console.error(err);
    showToast('❌ Failed to load assets');
  }
}

/* RENDER ASSETS */
function renderAssets() {

  const grid = document.getElementById('assets-grid');

  if (!grid) return;

  if (!REAL_ASSETS.length) {
    grid.innerHTML = `
      <div style="
        padding:40px;
        color:#888;
        font-family:'Barlow Condensed';
        letter-spacing:2px;
      ">
        No assets uploaded yet.
      </div>
    `;
    return;
  }

  grid.innerHTML = REAL_ASSETS.map(asset => {

    const image =
      asset.previewUrl ||
      asset.image?.url ||
      asset.image ||
      asset.url ||
      'https://via.placeholder.com/400x300?text=Paddox';

    const name = asset.name || asset.title || 'Untitled';
    const category = asset.category || 'Wallpaper';
    const access = asset.type || asset.access || 'Free';

    return `
      <div class="asset-card">

        <div class="asset-thumb">
          <img src="${image}" alt="${name}">
        </div>

        <div class="asset-info">

          <div class="asset-name">
            ${name}
          </div>

          <div class="asset-meta">
            ${category} ·
            ${access}
          </div>

          <div class="asset-dl">
            ↓ ${(asset.downloads || 0).toLocaleString()} downloads
          </div>

          <div class="asset-actions">

            <button
              class="asset-btn"
              onclick="previewAsset('${encodeURIComponent(image)}')"
            >
              Preview
            </button>
<button
  class="asset-btn"
  onclick="editAsset(
    '${asset._id}',
    '${name}',
    '${category}',
    '${access}',
    '${asset.resolution || '4K'}'
  )"
>
  Edit
</button>
            <button
              class="asset-btn"
              onclick="deleteAsset('${asset._id}')"
            >
              Delete
            </button>

          </div>

        </div>

      </div>
    `;

  }).join('');
}

/* DELETE ASSET */
async function deleteAsset(id) {

  if (!confirm('Delete this asset?')) return;

  try {

    const res = await fetch(`${ASSET_API_BASE}/${id}`, {
      method: 'DELETE'
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Delete failed');
    }

    showToast('🗑️ Asset deleted');

    loadAssets();
    setInterval(loadAssets, 15000);

  } catch (err) {

    console.error(err);

    showToast('❌ Failed to delete asset');

  }
}
function editAsset(id, name, category, type, resolution = '4K') {
  EDIT_ASSET_ID = id;

  document.getElementById('edit-asset-name').value = name || '';
  document.getElementById('edit-asset-category').value = String(category || 'cars').toLowerCase();
  document.getElementById('edit-asset-type').value = String(type || 'free').toLowerCase();
  document.getElementById('edit-asset-resolution').value = resolution || '4K';

  document.getElementById('edit-asset-modal')?.classList.add('show');
}

function closeEditModal() {
  document.getElementById('edit-asset-modal')?.classList.remove('show');
  EDIT_ASSET_ID = null;
}

async function saveAssetEdit() {
  if (!EDIT_ASSET_ID) return;

  try {
    showToast('✏️ Updating asset...');

    const res = await fetch(`${ASSET_API_BASE}/${EDIT_ASSET_ID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: document.getElementById('edit-asset-name').value.trim(),
        category: document.getElementById('edit-asset-category').value,
        type: document.getElementById('edit-asset-type').value,
        resolution: document.getElementById('edit-asset-resolution').value.trim() || '4K'
      })
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'Update failed');

    showToast('🔥 Asset updated');
    closeEditModal();
    loadAssets();

  } catch (err) {
    console.error(err);
    showToast('❌ Update failed');
  }
}
/* PREVIEW */
function previewAsset(encodedImageUrl) {

  const imageUrl = decodeURIComponent(encodedImageUrl || '');

  const modal = document.createElement('div');

  modal.innerHTML = `
    <div class="preview-overlay">

      <div class="preview-card">

        <button class="preview-close">
          ✕
        </button>

        <img
          src="${imageUrl}"
          class="preview-image"
        />

        <div class="preview-watermark">
          PADDOX
        </div>

      </div>

    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector('.preview-close')
    .onclick = () => modal.remove();

  modal.querySelector('.preview-overlay')
    .onclick = e => {
      if (e.target.classList.contains('preview-overlay')) {
        modal.remove();
      }
    };
}

/* UPLOAD */
/* ═══════════════════════════════════
   ASSET MODAL SYSTEM
═══════════════════════════════════ */

function openAssetModal() {
  document
    .getElementById('asset-modal')
    ?.classList.add('show');
}

function closeAssetModal() {
  document
    .getElementById('asset-modal')
    ?.classList.remove('show');
}

async function submitAssetUpload() {

  const file =
    document.getElementById('asset-file').files[0];

  if (!file) {
    showToast('❌ Select a file');
    return;
  }

  const formData = new FormData();

  formData.append('asset', file);

  formData.append(
    'name',
    document.getElementById('asset-name').value
  );

  formData.append(
    'category',
    document.getElementById('asset-category').value
  );

  formData.append(
    'type',
    document.getElementById('asset-type').value
  );

  formData.append(
    'resolution',
    document.getElementById('asset-resolution').value
  );

  formData.append(
    'description',
    'Uploaded from PADDOX Admin'
  );

  try {

    showToast('⬆ Uploading...');

    const res = await fetch(
      `${ASSET_API_BASE}/upload`,
      {
        method:'POST',
        body:formData
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message);
    }

    const createdAsset = data.data?.asset || data.asset || data.data || {};

    showToast('🔥 Wallpaper uploaded');

    emitAdminDropNotification('asset', {
      id: createdAsset._id || createdAsset.id || document.getElementById('asset-name').value,
      name: createdAsset.name || document.getElementById('asset-name').value || 'New digital asset',
      category: createdAsset.category || document.getElementById('asset-category').value || 'Digital Asset',
      title: 'New digital asset',
      message: `${createdAsset.name || document.getElementById('asset-name').value || 'A new PADDOX asset'} is now available.`
    });

    closeAssetModal();

    loadAssets();

  } catch(err) {

    console.error(err);

    showToast('❌ Upload failed');
  }
}
/* INIT */
loadAssets();

/* ══════════════════════════════════════
   LIVE USERS SYSTEM
══════════════════════════════════════ */

const ADMIN_USERS_API =
  'https://paddox-backend.onrender.com/api/admin/users';

let REAL_USERS = [];

function getUserName(user) {
  return (
    `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
    user.name ||
    'Paddox User'
  );
}

function getUserTier(user) {
  if (user.fanTier) return user.fanTier;
  if (user.role === 'admin' || user.isAdmin) return 'Admin';
  if ((user.fanPoints || 0) >= 4000) return 'Pro Fan';
  if ((user.fanPoints || 0) >= 1000) return 'Regular';
  return 'New';
}

function getUserStatus(user) {
  if (user.isBanned) {
    return {
      cls: 's-out',
      text: 'Banned'
    };
  }

  return {
    cls: 's-act',
    text: 'Active'
  };
}

async function loadUsers() {
  try {
    const res = await fetch(
      `${ADMIN_USERS_API}?limit=100`,
      {
        headers: {
          Authorization: `Bearer ${getAdminToken()}`
        }
      }
    );

    if (res.status === 401 || res.status === 403) {
      redirectToLogin('Admin session expired. Please login with admin account.');
      return;
    }

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Failed to load users');
    }

    REAL_USERS =
      data.data ||
      data.users ||
      [];

    renderUsers();

  } catch (err) {
    console.error(err);
    showToast('❌ Failed to load users');
  }
}

async function toggleUserBan(userId) {
  try {
    showToast('⏳ Updating user...');

    const res = await fetch(
      `${ADMIN_USERS_API}/${userId}/ban`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${getAdminToken()}`
        }
      }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || 'User update failed');
    }

    showToast('🔥 User status updated');

    await loadUsers();

  } catch (err) {
    console.error(err);
    showToast(`❌ ${err.message}`);
  }
}

async function makeUserAdmin(userId) {
  try {
    if (!confirm('Make this user admin?')) return;

    showToast('⏳ Updating role...');

    const res = await fetch(
      `${ADMIN_USERS_API}/${userId}/role`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAdminToken()}`
        },
        body: JSON.stringify({
          role: 'admin'
        })
      }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || 'Role update failed');
    }

    showToast('🔥 User promoted to admin');

    await loadUsers();

  } catch (err) {
    console.error(err);
    showToast(`❌ ${err.message}`);
  }
}

function openUserView(userId) {
  const user = REAL_USERS.find(u => String(u._id) === String(userId));

  if (!user) {
    showToast('❌ User not found');
    return;
  }

  const modal = document.createElement('div');

  modal.innerHTML = `
    <div class="preview-overlay" id="user-view-overlay">
      <div class="preview-card" style="
        max-width:620px;
        width:92vw;
        padding:28px;
        color:#fff;
        text-align:left;
      ">
        <button class="preview-close" id="user-view-close">✕</button>

        <div style="
          font-family:var(--font-d);
          letter-spacing:4px;
          font-size:1.8rem;
          margin-bottom:8px;
        ">
          USER DETAILS
        </div>

        <div style="
          color:var(--red);
          font-family:var(--font-c);
          letter-spacing:2px;
          margin-bottom:22px;
        ">
          ${getUserName(user)}
        </div>

        <div style="
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:14px;
        ">
          <div>
            <div style="color:#777;font-size:.75rem;letter-spacing:2px">EMAIL</div>
            <div style="font-weight:700">${user.email || '-'}</div>
          </div>

          <div>
            <div style="color:#777;font-size:.75rem;letter-spacing:2px">ROLE</div>
            <div style="font-weight:700">${user.role || (user.isAdmin ? 'admin' : 'user')}</div>
          </div>

          <div>
            <div style="color:#777;font-size:.75rem;letter-spacing:2px">FAN POINTS</div>
            <div style="font-family:var(--font-d);font-size:1.3rem;color:var(--red)">
              ${(user.fanPoints || 0).toLocaleString()}
            </div>
          </div>

          <div>
            <div style="color:#777;font-size:.75rem;letter-spacing:2px">JOINED</div>
            <div style="font-weight:700">
              ${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
            </div>
          </div>
        </div>

        <div style="
          margin-top:22px;
          display:flex;
          gap:10px;
          flex-wrap:wrap;
        ">
          <button
            class="act-btn"
            onclick="toggleUserBan('${user._id}'); document.getElementById('user-view-overlay')?.remove();"
          >
            ${user.isBanned ? 'Unban User' : 'Ban User'}
          </button>

          <button
            class="act-btn"
            onclick="makeUserAdmin('${user._id}'); document.getElementById('user-view-overlay')?.remove();"
          >
            Make Admin
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector('#user-view-close').onclick = () => modal.remove();

  modal.querySelector('#user-view-overlay').onclick = e => {
    if (e.target.id === 'user-view-overlay') {
      modal.remove();
    }
  };
}

/* ══ USERS TABLE ══ */
function renderUsers() {
  const tbody = document.getElementById('users-tbody');

  if (!tbody) return;

  if (!REAL_USERS.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align:center;padding:40px;color:#777">
          No users yet
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = REAL_USERS.map(user => {
    const status = getUserStatus(user);
    const name = getUserName(user);
    const tier = getUserTier(user);
    const orders =
      user.ordersCount ||
      user.totalOrders ||
      0;

    return `
      <tr>
        <td>
          <input type="checkbox"/>
        </td>

        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <div style="
              width:30px;
              height:30px;
              border-radius:50%;
              background:linear-gradient(135deg,var(--red),#800016);
              display:flex;
              align-items:center;
              justify-content:center;
              font-size:.8rem;
              flex-shrink:0;
            ">
              👤
            </div>
            ${name}
          </div>
        </td>

        <td style="color:var(--muted2);font-size:.76rem">
          ${user.email || '-'}
        </td>

        <td>
          <span style="
            font-family:var(--font-c);
            font-size:.6rem;
            padding:2px 8px;
            background:rgba(201,168,76,.1);
            border:1px solid rgba(201,168,76,.2);
            color:var(--gold);
          ">
            ${tier}
          </span>
        </td>

        <td style="text-align:center">
          ${orders}
        </td>

        <td style="font-family:var(--font-d);font-size:1.1rem;color:var(--red)">
          ${(user.fanPoints || 0).toLocaleString()}
        </td>

        <td style="color:var(--muted2);font-size:.76rem">
          ${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
        </td>

        <td>
          <span class="sb ${status.cls}">
            ${status.text}
          </span>
        </td>

        <td>
          <button
            class="act-btn"
            onclick="openUserView('${user._id}')"
          >
            View
          </button>

          <button
            class="act-btn"
            onclick="toggleUserBan('${user._id}')"
          >
            ${user.isBanned ? 'Unban' : 'Ban'}
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

/* ══ ANALYTICS METRICS — REALTIME CLEANUP ══ */
function renderMetList(id, data) {
  const el = document.getElementById(id);
  if (!el) return;

  if (!data.length) {
    el.innerHTML = `
      <div style="padding:22px;color:#777;text-align:center">
        No data yet
      </div>
    `;
    return;
  }

  el.innerHTML = data.map(d => `
    <div class="met-row">
      <span class="met-name">${d.name}</span>
      <div class="met-bar-wrap">
        <div class="met-bar" style="width:0%;background:${d.color}" data-w="${d.pct}%"></div>
      </div>
      <span class="met-val">${d.val || d.pct + '%'}</span>
    </div>
  `).join('');

  setTimeout(() => {
    el.querySelectorAll('.met-bar').forEach(b => {
      b.style.transition = 'width 1s ease';
      b.style.width = b.dataset.w;
    });
  }, 200);
}

function renderAnalyticsRealtime() {
  const totalOrders = REAL_ORDERS.length || 0;
  const totalRevenue = REAL_ORDERS.reduce(
    (sum, order) => sum + Number(order?.pricing?.total || order?.total || 0),
    0
  );

  const productSales = {};
  REAL_ORDERS.forEach(order => {
    (order.items || []).forEach(item => {
      const name = item.name || 'Product';
      productSales[name] = (productSales[name] || 0) + Number(item.quantity || 1);
    });
  });

  const topProducts = Object.entries(productSales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const maxProductQty =
    Math.max(...topProducts.map(([, qty]) => qty), 1);

  renderMetList(
    'top-products-list',
    topProducts.map(([name, qty]) => ({
      name,
      val: `${qty} sold`,
      pct: Math.max(8, Math.round((qty / maxProductQty) * 100)),
      color: 'var(--red)'
    }))
  );

  renderMetList(
    'traffic-list',
    [
      {
        name: 'Orders',
        val: String(totalOrders),
        pct: totalOrders ? 100 : 0,
        color: 'var(--red)'
      },
      {
        name: 'Revenue',
        val: `₹${totalRevenue.toLocaleString('en-IN')}`,
        pct: totalRevenue ? 100 : 0,
        color: 'var(--gold)'
      },
      {
        name: 'Products',
        val: String(REAL_PRODUCTS.length || 0),
        pct: REAL_PRODUCTS.length ? 100 : 0,
        color: 'var(--blue)'
      },
      {
        name: 'Digital Assets',
        val: String(REAL_ASSETS.length || 0),
        pct: REAL_ASSETS.length ? 100 : 0,
        color: 'var(--green)'
      }
    ]
  );

  renderMetList(
    'geo-list',
    [
      {
        name: 'India',
        val: 'Primary market',
        pct: totalOrders ? 100 : 0,
        color: 'var(--red)'
      }
    ]
  );

  renderMetList(
    'engagement-list',
    [
      {
        name: 'Wishlist / Downloads',
        val: 'Active modules',
        pct: 100,
        color: 'var(--green)'
      },
      {
        name: 'Checkout Flow',
        val: 'Live',
        pct: 100,
        color: 'var(--red)'
      }
    ]
  );
}


/* ══ MODERATION — CLEAN EMPTY STATE ══ */
function renderModeration() {
  const list = document.getElementById('mod-list');
  if (!list) return;

  list.innerHTML = `
    <div style="
      padding:40px;
      color:#777;
      text-align:center;
      border:1px solid rgba(255,255,255,.08);
      background:#0d0d0d;
    ">
      No moderation queue yet.
      <br>
      <span style="font-size:.85rem;color:#555">
        Reviews/comments moderation can be connected later.
      </span>
    </div>
  `;
}

function modAction(i, action) {
  showToast('No moderation items right now');
}

renderModeration();
updateAdminSidebarBadges();



/* ══════════════════════════════════════
   PRODUCT IMAGE FILE HELPERS
   Uploads local image by converting it to compressed Data URL.
══════════════════════════════════════ */

function readImageFileAsDataUrl(file, maxWidth = 900, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve('');

    if (!file.type.startsWith('image/')) {
      reject(new Error('Please choose an image file'));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');

        const scale =
          img.width > maxWidth
            ? maxWidth / img.width
            : 1;

        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);

        const ctx = canvas.getContext('2d');

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        resolve(canvas.toDataURL('image/jpeg', quality));
      };

      img.onerror = () => reject(new Error('Could not read image'));

      img.src = reader.result;
    };

    reader.onerror = () => reject(new Error('Could not read image file'));

    reader.readAsDataURL(file);
  });
}

function normaliseBadge(value) {
  const v = String(value || '').toLowerCase();

  if (!v || v === 'none') return null;
  if (v === 'limited') return 'ltd';

  return v;
}

function normaliseCategory(value) {
  return String(value || 'apparel').toLowerCase();
}

/* ══════════════════════════════════════
   LIVE PRODUCT EDIT SYSTEM — Phase A4.1.5
   Mirrors Add Product UX: sticky modal, 10-image drag/drop, Cloudinary FormData.
══════════════════════════════════════ */

let EDIT_PRODUCT_ID = null;
let EDIT_PRODUCT_IMAGE_FILES = [];

function getProductImageList(product) {
  if (!product) return [];
  if (Array.isArray(product.images)) {
    return product.images
      .map(img => img?.url || img)
      .filter(Boolean)
      .slice(0, 10);
  }
  return product.image ? [product.image] : [];
}

function syncEditProductFileInput() {
  const input = document.getElementById('edit-product-images');
  if (!input) return;
  const transfer = new DataTransfer();
  EDIT_PRODUCT_IMAGE_FILES.slice(0, 10).forEach(file => transfer.items.add(file));
  input.files = transfer.files;
}

function setEditProductImageFiles(files, append = false) {
  const incoming = Array.from(files || []).filter(file => file && file.type && file.type.startsWith('image/'));
  const combined = append ? [...EDIT_PRODUCT_IMAGE_FILES, ...incoming] : incoming;
  const unique = [];
  const seen = new Set();

  combined.forEach(file => {
    const key = `${file.name}-${file.size}-${file.lastModified}`;
    if (!seen.has(key) && unique.length < 10) {
      seen.add(key);
      unique.push(file);
    }
  });

  EDIT_PRODUCT_IMAGE_FILES = unique;
  syncEditProductFileInput();
  updateEditProductImageCount();
}

function removeEditProductImage(index) {
  EDIT_PRODUCT_IMAGE_FILES.splice(index, 1);
  syncEditProductFileInput();
  updateEditProductImageCount();
}
window.removeEditProductImage = removeEditProductImage;

function renderEditProductCurrentImages(product) {
  const wrap = document.getElementById('edit-product-current-images');
  if (!wrap) return;

  const images = getProductImageList(product);

  if (!images.length) {
    wrap.innerHTML = `<div class="edit-current-empty">No current Cloudinary images</div>`;
    return;
  }

  wrap.innerHTML = images.map((src, index) => `
    <div class="edit-current-image-tile">
      <img src="${escapeProductHTML(src)}" alt="Current product image ${index + 1}">
      ${index === 0 ? '<span>Cover</span>' : `<span>${index + 1}</span>`}
    </div>
  `).join('');
}

function updateEditProductImageCount() {
  const countEl = document.getElementById('edit-product-image-count');
  const preview = document.getElementById('edit-product-image-preview');

  if (!countEl) return;

  const files = EDIT_PRODUCT_IMAGE_FILES;

  if (!files.length) {
    countEl.textContent = 'No replacement images selected';
    if (preview) preview.innerHTML = '';
    return;
  }

  countEl.textContent = `${files.length}/10 replacement image${files.length > 1 ? 's' : ''} selected`;

  if (!preview) return;

  preview.innerHTML = files.map((file, index) => `
    <div class="product-image-preview-tile">
      <img src="${URL.createObjectURL(file)}" alt="Replacement preview ${index + 1}">
      <button type="button" onclick="removeEditProductImage(${index})">×</button>
      ${index === 0 ? '<span>New cover</span>' : ''}
    </div>
  `).join('');
}

function initEditProductDropzone() {
  const zone = document.getElementById('edit-product-dropzone');
  const input = document.getElementById('edit-product-images');

  if (!zone || !input || zone.dataset.bound === 'true') return;
  zone.dataset.bound = 'true';

  zone.addEventListener('click', () => input.click());
  zone.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      input.click();
    }
  });

  ['dragenter', 'dragover'].forEach(type => {
    zone.addEventListener(type, e => {
      e.preventDefault();
      zone.classList.add('drag-over');
    });
  });

  ['dragleave', 'drop'].forEach(type => {
    zone.addEventListener(type, e => {
      e.preventDefault();
      zone.classList.remove('drag-over');
    });
  });

  zone.addEventListener('drop', e => {
    setEditProductImageFiles(e.dataTransfer?.files || [], true);
  });
}

function ensureProductEditModal() {
  if (document.getElementById('product-edit-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'product-edit-modal';
  modal.className = 'product-edit-modal-shell';

  modal.innerHTML = `
    <div class="product-edit-overlay" id="product-edit-overlay">
      <div class="product-edit-card">
        <div class="product-edit-head">
          <div>
            <div class="product-edit-kicker">MONGODB PRODUCT · CLOUDINARY MEDIA</div>
            <h2>EDIT PRODUCT</h2>
          </div>
          <button class="product-edit-close" id="product-edit-close" type="button">✕</button>
        </div>

        <div class="product-edit-body">
          <div class="product-edit-grid">
            <label class="product-edit-field">
              <span>Name</span>
              <input id="edit-product-name" class="edit-product-input">
            </label>

            <label class="product-edit-field">
              <span>Team</span>
              <select id="edit-product-team" class="edit-product-input">
${getProductTeamOptionsHTML()}
              </select>
            </label>

            <label class="product-edit-field">
              <span>Category</span>
              <select id="edit-product-category" class="edit-product-input">
                <option value="apparel">Apparel</option>
                <option value="collectibles">Collectibles</option>
                <option value="accessories">Accessories</option>
                <option value="posters">Posters</option>
                <option value="custom">Custom</option>
              </select>
            </label>

            <label class="product-edit-field">
              <span>Badge</span>
              <select id="edit-product-badge" class="edit-product-input">
                <option value="">None</option>
                <option value="new">New</option>
                <option value="hot">Hot</option>
                <option value="sale">Sale</option>
                <option value="ltd">Limited</option>
                <option value="featured">Featured</option>
              </select>
            </label>

            <label class="product-edit-field">
              <span>Price ₹</span>
              <input id="edit-product-price" type="number" min="0" class="edit-product-input">
            </label>

            <label class="product-edit-field">
              <span>Sale Price ₹</span>
              <input id="edit-product-sale-price" type="number" min="0" class="edit-product-input" placeholder="Optional">
              <em id="edit-product-discount-preview" class="product-discount-preview inline">No sale discount</em>
            </label>

            <label class="product-edit-field">
              <span>Stock</span>
              <input id="edit-product-stock" type="number" min="0" class="edit-product-input">
            </label>

            <label class="product-edit-field">
              <span>Rating</span>
              <select id="edit-product-rating" class="edit-product-input">
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
                <option value="0">0 Stars</option>
              </select>
            </label>

            <label class="product-edit-field">
              <span>Status</span>
              <select id="edit-product-active" class="edit-product-input">
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </label>
          </div>

          <div class="product-edit-media-block">
            <div class="product-edit-section-title">Current Cloudinary Images</div>
            <div id="edit-product-current-images" class="edit-current-image-grid"></div>
          </div>

          <div class="product-edit-media-block">
            <div class="product-edit-section-title">Replace / Upload Images</div>
            <div class="product-image-dropzone edit-product-dropzone" id="edit-product-dropzone" role="button" tabindex="0">
              <input id="edit-product-images" type="file" accept="image/*" multiple hidden>
              <div class="product-drop-icon">＋</div>
              <div>
                <strong>Drag & drop replacement images here</strong>
                <span>or click to browse · Max 10 images · First image becomes cover</span>
              </div>
            </div>
            <div class="product-image-meta-row">
              <small>Leave empty to keep the current Cloudinary images.</small>
              <div id="edit-product-image-count" class="product-image-count">No replacement images selected</div>
            </div>
            <div id="edit-product-image-preview" class="product-image-preview-grid"></div>
          </div>

          <label class="product-edit-field product-edit-description">
            <span>Description</span>
            <textarea id="edit-product-description" class="edit-product-input" rows="4"></textarea>
          </label>
        </div>

        <div class="product-edit-footer">
          <button class="adm-btn-ghost" type="button" onclick="closeProductEditModal()">Cancel</button>
          <button class="adm-btn-red" id="save-product-edit" type="button">Save Product</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector('#product-edit-close').onclick = closeProductEditModal;
  modal.querySelector('#product-edit-overlay').onclick = e => {
    if (e.target.id === 'product-edit-overlay') closeProductEditModal();
  };
  modal.querySelector('#save-product-edit').onclick = saveProductEdit;
  ['edit-product-price', 'edit-product-sale-price'].forEach(id => {
    modal.querySelector(`#${id}`)?.addEventListener('input', updateEditProductDiscountPreview);
  });
  modal.querySelector('#edit-product-images').addEventListener('change', e => {
    setEditProductImageFiles(e.target.files, false);
  });
  initEditProductDropzone();
}

function openProductEditModal(productId) {
  ensureProductEditModal();

  const product = REAL_PRODUCTS.find(p => String(p._id) === String(productId));

  if (!product) {
    showToast('❌ Product not found');
    return;
  }

  EDIT_PRODUCT_ID = productId;
  EDIT_PRODUCT_IMAGE_FILES = [];
  syncEditProductFileInput();

  document.getElementById('edit-product-name').value = product.name || '';
  document.getElementById('edit-product-team').value = canonicalProductTeam(product.team || 'Ferrari');
  document.getElementById('edit-product-category').value = String(product.category || 'apparel').toLowerCase();
  document.getElementById('edit-product-badge').value = String(product.badge || '').toLowerCase();
  document.getElementById('edit-product-price').value = Number(product.price || 0);
  document.getElementById('edit-product-sale-price').value = product.salePrice || '';
  document.getElementById('edit-product-stock').value = Number(product.stock || 0);
  document.getElementById('edit-product-rating').value = String(Math.round(Number(product.ratings?.average || product.rating || 5)));
  document.getElementById('edit-product-active').value = String(product.isActive !== false);
  document.getElementById('edit-product-description').value = product.description || '';
  updateEditProductDiscountPreview();

  renderEditProductCurrentImages(product);
  updateEditProductImageCount();

  document.getElementById('product-edit-modal')?.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeProductEditModal() {
  document.getElementById('product-edit-modal')?.classList.remove('show');
  EDIT_PRODUCT_ID = null;
  EDIT_PRODUCT_IMAGE_FILES = [];
  syncEditProductFileInput();
  updateEditProductImageCount();
  document.body.style.overflow = '';
}

async function saveProductEdit() {
  if (!EDIT_PRODUCT_ID) return;

  try {
    const name = document.getElementById('edit-product-name').value.trim();
    const team = canonicalProductTeam(document.getElementById('edit-product-team').value.trim());
    const category = normaliseCategory(document.getElementById('edit-product-category').value);
    const badge = normaliseBadge(document.getElementById('edit-product-badge').value);
    const price = Number(document.getElementById('edit-product-price').value);
    const salePriceRaw = document.getElementById('edit-product-sale-price').value;
    const stock = Number(document.getElementById('edit-product-stock').value);
    const rating = Number(document.getElementById('edit-product-rating').value || 5);
    const isActive = document.getElementById('edit-product-active').value === 'true';
    const description = document.getElementById('edit-product-description').value.trim();

    if (!name) return showToast('❌ Product name required');
    if (Number.isNaN(price) || price < 0) return showToast('❌ Valid price required');
    if (Number.isNaN(stock) || stock < 0) return showToast('❌ Valid stock required');

    if (salePriceRaw !== '') {
      const salePrice = Number(salePriceRaw);
      if (Number.isNaN(salePrice) || salePrice < 0) return showToast('❌ Valid sale price required');
      if (salePrice >= price) return showToast('❌ Sale price must be less than original price');
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('team', team);
    formData.append('category', category);
    formData.append('badge', badge);
    formData.append('isFeatured', String(badge === 'featured'));
    formData.append('price', String(price));
    formData.append('stock', String(stock));
    formData.append('isActive', String(isActive));
    formData.append('description', description);
    formData.append('shortDesc', description.slice(0, 180));
    formData.append('rating', String(rating));
    formData.append('ratings[average]', String(rating));
    formData.append('ratings[count]', String(rating > 0 ? 1 : 0));

    if (salePriceRaw !== '') {
      const salePrice = Number(salePriceRaw);
      const discountPercent = Math.round(((price - salePrice) / price) * 100);
      formData.append('salePrice', String(salePrice));
      formData.append('onSale', 'true');
      formData.append('discountPercent', String(discountPercent));
      if (!badge) formData.set('badge', 'sale');
    } else {
      formData.append('salePrice', '');
      formData.append('onSale', 'false');
      formData.append('discountPercent', '0');
    }

    EDIT_PRODUCT_IMAGE_FILES.slice(0, 10).forEach(file => {
      formData.append('images', file);
    });

    showToast(
      EDIT_PRODUCT_IMAGE_FILES.length
        ? `☁️ Updating product and uploading ${EDIT_PRODUCT_IMAGE_FILES.length} image${EDIT_PRODUCT_IMAGE_FILES.length > 1 ? 's' : ''}...`
        : '⏳ Updating product...'
    );

    const res = await fetch(`${PRODUCT_API_BASE}/${EDIT_PRODUCT_ID}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${getAdminToken()}`
      },
      body: formData
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || 'Product update failed');
    }

    showToast('🔥 Product updated');
    closeProductEditModal();
    await loadProducts();
    updateOverviewRealtime();

  } catch (err) {
    console.error(err);
    showToast(`❌ ${err.message}`);
  }
}

/* ══════════════════════════════════════
   LIVE ADD PRODUCT SYSTEM
══════════════════════════════════════ */

function getAddValue(id) {
  return document.getElementById(id)?.value?.trim() || '';
}

function discountPreviewText(priceValue, saleValue) {
  const price = Number(priceValue || 0);
  const sale = Number(saleValue || 0);

  if (!price || !sale) return 'No sale discount';
  if (sale >= price) return 'Sale price must be lower';

  const percent = Math.round(((price - sale) / price) * 100);
  const savings = price - sale;
  return `${percent}% OFF · saves ₹${savings.toLocaleString('en-IN')}`;
}

function updateAddProductDiscountPreview() {
  const el = document.getElementById('add-product-discount-preview');
  if (!el) return;
  el.textContent = discountPreviewText(
    document.getElementById('add-product-price')?.value,
    document.getElementById('add-product-sale-price')?.value
  );
  el.classList.toggle('active', el.textContent.includes('% OFF'));
  el.classList.toggle('error', el.textContent.includes('must be lower'));
}

function updateEditProductDiscountPreview() {
  const el = document.getElementById('edit-product-discount-preview');
  if (!el) return;
  el.textContent = discountPreviewText(
    document.getElementById('edit-product-price')?.value,
    document.getElementById('edit-product-sale-price')?.value
  );
  el.classList.toggle('active', el.textContent.includes('% OFF'));
  el.classList.toggle('error', el.textContent.includes('must be lower'));
}


let ADD_PRODUCT_IMAGE_FILES = [];

function syncAddProductFileInput() {
  const input = document.getElementById('add-product-image');
  if (!input) return;
  const transfer = new DataTransfer();
  ADD_PRODUCT_IMAGE_FILES.slice(0, 10).forEach(file => transfer.items.add(file));
  input.files = transfer.files;
}

function setAddProductImageFiles(files, append = false) {
  const incoming = Array.from(files || []).filter(file => file && file.type && file.type.startsWith('image/'));
  const combined = append ? [...ADD_PRODUCT_IMAGE_FILES, ...incoming] : incoming;
  const unique = [];
  const seen = new Set();

  combined.forEach(file => {
    const key = `${file.name}-${file.size}-${file.lastModified}`;
    if (!seen.has(key) && unique.length < 10) {
      seen.add(key);
      unique.push(file);
    }
  });

  ADD_PRODUCT_IMAGE_FILES = unique;
  syncAddProductFileInput();
  updateAddProductImageCount();
}

function removeAddProductImage(index) {
  ADD_PRODUCT_IMAGE_FILES.splice(index, 1);
  syncAddProductFileInput();
  updateAddProductImageCount();
}
window.removeAddProductImage = removeAddProductImage;

function updateAddProductImageCount() {
  const input = document.getElementById('add-product-image');
  const countEl = document.getElementById('add-product-image-count');
  const preview = document.getElementById('add-product-image-preview');

  if (!countEl) return;

  const files = ADD_PRODUCT_IMAGE_FILES.length
    ? ADD_PRODUCT_IMAGE_FILES
    : Array.from(input?.files || []);

  if (!files.length) {
    countEl.textContent = 'No images selected';
    if (preview) preview.innerHTML = '';
    return;
  }

  countEl.textContent = `${files.length}/10 image${files.length > 1 ? 's' : ''} selected`;

  if (!preview) return;

  preview.innerHTML = files.map((file, index) => `
    <div class="product-image-preview-tile">
      <img src="${URL.createObjectURL(file)}" alt="Product preview ${index + 1}">
      <button type="button" onclick="removeAddProductImage(${index})">×</button>
      ${index === 0 ? '<span>Cover</span>' : ''}
    </div>
  `).join('');
}

document.addEventListener('change', e => {
  if (e.target?.id === 'add-product-image') {
    setAddProductImageFiles(e.target.files, false);
  }
});

function initAddProductDropzone() {
  const zone = document.getElementById('add-product-dropzone');
  const input = document.getElementById('add-product-image');

  if (!zone || !input || zone.dataset.bound === 'true') return;
  zone.dataset.bound = 'true';

  zone.addEventListener('click', () => input.click());
  zone.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      input.click();
    }
  });

  ['dragenter', 'dragover'].forEach(type => {
    zone.addEventListener(type, e => {
      e.preventDefault();
      zone.classList.add('drag-over');
    });
  });

  ['dragleave', 'drop'].forEach(type => {
    zone.addEventListener(type, e => {
      e.preventDefault();
      zone.classList.remove('drag-over');
    });
  });

  zone.addEventListener('drop', e => {
    setAddProductImageFiles(e.dataTransfer?.files || [], true);
  });
}

window.addEventListener('load', initAddProductDropzone);

async function saveNewProduct() {
  try {
    const name = getAddValue('add-product-name');
    const team = getAddValue('add-product-team');
    const category = normaliseCategory(getAddValue('add-product-category'));
    const badge = normaliseBadge(getAddValue('add-product-badge'));
    const price = Number(getAddValue('add-product-price'));
    const salePriceRaw = getAddValue('add-product-sale-price');
    const stock = Number(getAddValue('add-product-stock'));
    const rating = Number(getAddValue('add-product-rating') || 5);
    const description =
      getAddValue('add-product-description') ||
      `${name} from Paddox store`;

    const imageFiles =
      (ADD_PRODUCT_IMAGE_FILES.length
        ? ADD_PRODUCT_IMAGE_FILES
        : Array.from(document.getElementById('add-product-image')?.files || []))
        .slice(0, 10);

    if (!name) {
      showToast('❌ Product name required');
      return;
    }

    if (!team) {
      showToast('❌ Team required');
      return;
    }

    if (Number.isNaN(price) || price <= 0) {
      showToast('❌ Valid price required');
      return;
    }

    if (salePriceRaw !== '') {
      const salePrice = Number(salePriceRaw);
      if (Number.isNaN(salePrice) || salePrice < 0) {
        showToast('❌ Valid sale price required');
        return;
      }
      if (salePrice >= price) {
        showToast('❌ Sale price must be less than original price');
        return;
      }
    }

    if (Number.isNaN(stock) || stock < 0) {
      showToast('❌ Valid stock required');
      return;
    }

    if (Number.isNaN(rating) || rating < 0 || rating > 5) {
      showToast('❌ Valid rating required');
      return;
    }

    const canonicalTeam = canonicalProductTeam(team);

    const productPayload = {
      name,
      team: canonicalTeam,
      category,
      badge: salePriceRaw !== '' && !badge ? 'sale' : badge,
      price,
      salePrice: salePriceRaw !== '' ? Number(salePriceRaw) : '',
      onSale: salePriceRaw !== '' && Number(salePriceRaw) > 0 && Number(salePriceRaw) < price,
      discountPercent: salePriceRaw !== '' ? Math.round(((price - Number(salePriceRaw)) / price) * 100) : 0,
      stock,
      description,
      shortDesc: description.slice(0, 180),
      isActive: true,
      isFeatured: badge === 'featured',
      ratings: {
        average: rating,
        count: rating > 0 ? 1 : 0
      }
    };

    const formData = new FormData();
    Object.entries(productPayload).forEach(([key, value]) => {
      if (key === 'ratings') {
        formData.append('rating', String(rating));
        formData.append('ratings[average]', String(rating));
        formData.append('ratings[count]', String(rating > 0 ? 1 : 0));
      } else {
        formData.append(key, String(value));
      }
    });

    imageFiles.forEach(file => {
      formData.append('images', file);
    });

    if (imageFiles.length) {
      showToast(`☁️ Uploading ${imageFiles.length} image${imageFiles.length > 1 ? 's' : ''} to Cloudinary...`);
    } else {
      showToast('⏳ Saving product...');
    }

    const res = await fetch(
      PRODUCT_API_BASE,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getAdminToken()}`
        },
        body: formData
      }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || 'Product create failed');
    }

    const createdProduct = data.data?.product || data.product || data.data || productPayload;

    showToast('🔥 Product added successfully');

    emitAdminDropNotification('product', {
      id: createdProduct._id || createdProduct.id || name,
      name: createdProduct.name || name,
      team: createdProduct.team || team,
      category: createdProduct.category || category,
      price: createdProduct.price || price,
      title: 'New product drop',
      message: `${createdProduct.name || name} is now live in the PADDOX shop.`
    });

    closeAddModal();

    clearAddProductForm();

    await loadProducts();
    updateOverviewRealtime();

  } catch (err) {
    console.error(err);
    showToast(`❌ ${err.message}`);
  }
}

function clearAddProductForm() {
  [
    'add-product-name',
    'add-product-price',
    'add-product-sale-price',
    'add-product-stock',
    'add-product-rating',
    'add-product-description',
    'add-product-image'
  ].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  ADD_PRODUCT_IMAGE_FILES = [];
  syncAddProductFileInput();
  updateAddProductImageCount();

  const team = document.getElementById('add-product-team');
  if (team) team.value = 'Ferrari';

  const category = document.getElementById('add-product-category');
  if (category) category.value = 'apparel';

  const badge = document.getElementById('add-product-badge');
  if (badge) badge.value = '';

  updateAddProductDiscountPreview();
}

/* ══ ADD PRODUCT MODAL ══ */
function openAddModal() {
  initAddProductDropzone();
  ['add-product-price', 'add-product-sale-price'].forEach(id => {
    const el = document.getElementById(id);
    if (el && !el.dataset.discountBound) {
      el.addEventListener('input', updateAddProductDiscountPreview);
      el.dataset.discountBound = 'true';
    }
  });
  updateAddProductDiscountPreview();
  document.getElementById('add-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeAddModal() {
  document.getElementById('add-modal').classList.remove('open');
  document.body.style.overflow = '';
}
document.getElementById('add-modal')?.addEventListener('click', e => {
  if (e.target === document.getElementById('add-modal')) closeAddModal();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAddModal(); });

/* ══ ICON ANIMATIONS ══ */
document.querySelectorAll('.animate-icon').forEach((icon, i) => {
  icon.style.animationDelay = `${i * 0.12}s`;
  icon.addEventListener('mouseenter', () => { icon.style.animation='none'; icon.style.transform='scale(1.35) rotate(-10deg)'; });
  icon.addEventListener('mouseleave', () => { icon.style.transform=''; setTimeout(() => icon.style.animation=`iconFloat 3s ${i*.12}s ease-in-out infinite`, 300); });
});

/* ══ TOPBAR SEARCH ══ */
document.querySelector('.adm-search')?.addEventListener('input', e => {
  const q = e.target.value.toLowerCase();
  if (q) showToast(`🔍 Searching for "${q}"…`);
});

/* ══ TOAST ══ */
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 3000);
}
function getProductById(productId) {
  return REAL_PRODUCTS.find(product => String(product._id) === String(productId));
}

function deleteProduct(productId) {
  const product = getProductById(productId);

  if (!product) {
    showToast('❌ Product not found');
    return;
  }

  openDeleteProductModal(product);
}

function openDeleteProductModal(product) {
  const oldModal = document.getElementById('delete-product-modal');
  if (oldModal) oldModal.remove();

  const image =
    product.images?.[0]?.url ||
    product.image ||
    '';

  const modal = document.createElement('div');
  modal.id = 'delete-product-modal';

  modal.innerHTML = `
    <div class="preview-overlay" id="delete-product-overlay">
      <div class="preview-card" style="
        max-width:560px;
        width:92vw;
        padding:28px;
        color:#fff;
        text-align:left;
      ">
        <button class="preview-close" id="delete-product-close">
          ✕
        </button>

        <div style="
          font-family:var(--font-d);
          letter-spacing:4px;
          font-size:1.8rem;
          margin-bottom:8px;
        ">
          DELETE PRODUCT
        </div>

        <div style="
          color:var(--red);
          font-family:var(--font-c);
          letter-spacing:2px;
          margin-bottom:22px;
        ">
          THIS ACTION CANNOT BE UNDONE
        </div>

        <div style="
          display:flex;
          gap:14px;
          align-items:center;
          padding:14px;
          background:#111;
          border:1px solid rgba(255,255,255,.08);
          margin-bottom:20px;
        ">
          ${
            image
              ? `<img src="${image}" style="width:76px;height:60px;object-fit:cover;border-radius:8px">`
              : `<div style="width:76px;height:60px;display:flex;align-items:center;justify-content:center;background:#191919;font-size:1.8rem">📦</div>`
          }

          <div>
            <div style="font-weight:800;color:#fff">
              ${product.name || 'Product'}
            </div>

            <div style="color:#777;font-size:.85rem">
              ${product.category || '-'} · ${product.team || '-'}
            </div>

            <div style="color:var(--red);font-family:var(--font-d);font-size:1.1rem;margin-top:4px">
              ₹${Number(product.price || 0).toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        <p style="color:#aaa;line-height:1.6;margin-bottom:18px">
          This product will be removed from:
          <br>• Admin Products
          <br>• Inventory
          <br>• Shop page
          <br>• Overview calculations
        </p>

        <label style="display:flex;flex-direction:column;gap:8px;margin-bottom:18px">
          <span style="color:#777;font-size:.75rem;letter-spacing:2px">
            TYPE DELETE TO CONFIRM
          </span>
          <input
            id="delete-confirm-input"
            class="edit-product-input"
            placeholder="DELETE"
            style="
              background:#151515;
              color:#fff;
              border:1px solid rgba(255,255,255,.15);
              padding:12px;
            "
          >
        </label>

        <div style="display:flex;gap:12px">
          <button
            class="act-btn"
            id="cancel-delete-product"
            style="flex:1;padding:14px"
          >
            Cancel
          </button>

          <button
            class="act-btn"
            id="confirm-delete-product"
            style="
              flex:1;
              padding:14px;
              background:var(--red);
              color:#fff;
              border-color:var(--red);
              opacity:.45;
              pointer-events:none;
            "
          >
            Delete Product
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const input = modal.querySelector('#delete-confirm-input');
  const confirmBtn = modal.querySelector('#confirm-delete-product');

  input?.addEventListener('input', () => {
    const ok = input.value.trim().toUpperCase() === 'DELETE';

    confirmBtn.style.opacity = ok ? '1' : '.45';
    confirmBtn.style.pointerEvents = ok ? 'auto' : 'none';
  });

  modal.querySelector('#delete-product-close').onclick = () => modal.remove();
  modal.querySelector('#cancel-delete-product').onclick = () => modal.remove();

  modal.querySelector('#delete-product-overlay').onclick = e => {
    if (e.target.id === 'delete-product-overlay') {
      modal.remove();
    }
  };

  confirmBtn.onclick = async () => {
    await confirmDeleteProduct(product._id);
    modal.remove();
  };

  setTimeout(() => input?.focus(), 80);
}

async function confirmDeleteProduct(id) {
  try {
    showToast('⏳ Deleting product...');

    const res = await fetch(
      `${PRODUCT_API_BASE}/${id}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${getAdminToken()}`
        }
      }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok || data.success === false) {
      throw new Error(data.message || 'Delete failed');
    }

    showToast('🔥 Product deleted');

    REAL_PRODUCTS = REAL_PRODUCTS.filter(product => String(product._id) !== String(id));

    renderProducts();
    renderInventory();
    updateOverviewRealtime();
    updateAdminSidebarBadges();

    await loadProducts();

  } catch(err) {
    console.error(err);
    showToast(`❌ ${err.message || 'Delete failed'}`);
  }
}



function safeJsonParseAdmin(value) {
  try { return value ? JSON.parse(value) : null; } catch (err) { return null; }
}

function decodeAdminJwtPayload(token = '') {
  try {
    const part = String(token).split('.')[1];
    if (!part) return null;
    const normalized = part.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - normalized.length % 4) % 4), '=');
    return JSON.parse(atob(padded));
  } catch (err) {
    return null;
  }
}

function pickAdminIdentityFromStorage() {
  const storageKeys = [
    'paddox_user',
    'paddoxUser',
    'user',
    'currentUser',
    'adminUser',
    'paddox_admin',
    'profile'
  ];

  for (const key of storageKeys) {
    const raw = localStorage.getItem(key) || sessionStorage.getItem(key);
    const saved = safeJsonParseAdmin(raw);
    if (!saved || typeof saved !== 'object') continue;

    const nested = saved.user || saved.data?.user || saved.profile || saved.account || saved.data || saved;
    const firstName = nested.firstName || nested.firstname || nested.given_name || '';
    const lastName = nested.lastName || nested.lastname || nested.family_name || '';
    const name =
      `${firstName} ${lastName}`.trim() ||
      nested.name ||
      nested.fullName ||
      nested.username ||
      '';
    const email = nested.email || nested.mail || nested.userEmail || '';

    if (name || email) return { name, email };
  }

  const tokenPayload = decodeAdminJwtPayload(getAdminToken());
  if (tokenPayload) {
    const name =
      tokenPayload.name ||
      `${tokenPayload.firstName || ''} ${tokenPayload.lastName || ''}`.trim() ||
      tokenPayload.username ||
      '';
    const email = tokenPayload.email || tokenPayload.userEmail || '';
    if (name || email) return { name, email };
  }

  return { name: '', email: '' };
}

function setAdminIdentityUI(identity = {}, loaded = false) {
  const cleanEmail = String(identity.email || '').trim();
  const cleanName = String(identity.name || '').trim();
  const displayName = cleanName || (cleanEmail ? cleanEmail.split('@')[0] : 'Signed-in Admin');
  const displayEmail = cleanEmail || 'Admin account';

  document.querySelectorAll('.admin-profile-name, .adm-profile-name, .super-admin-name, #admin-profile-name')
    .forEach(el => el.textContent = displayName);

  document.querySelectorAll('.admin-profile-email, .adm-profile-email, .super-admin-email, #admin-profile-email')
    .forEach(el => el.textContent = displayEmail);

  document.querySelectorAll('.adm-profile')
    .forEach(el => {
      el.classList.toggle('is-loaded', !!loaded || !!cleanEmail || !!cleanName);
      el.classList.toggle('is-fallback', !cleanEmail && !cleanName);
    });
}

async function fetchAdminIdentity() {
  const token = getAdminToken();
  if (!token) return null;

  const endpoints = [
    'https://paddox-backend.onrender.com/api/auth/me',
    'https://paddox-backend.onrender.com/api/users/me',
    'https://paddox-backend.onrender.com/api/user/me'
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) continue;
      const data = await res.json().catch(() => ({}));
      const user = data.user || data.data?.user || data.data || data;
      if (!user || typeof user !== 'object') continue;

      const name =
        `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
        user.name ||
        user.fullName ||
        user.username ||
        '';
      const email = user.email || user.mail || user.userEmail || '';

      if (name || email) {
        localStorage.setItem('paddox_user', JSON.stringify(user));
        return { name, email };
      }
    } catch (err) {
      console.warn('Admin identity fetch skipped:', err.message);
    }
  }

  return null;
}

function updateAdminTopbarDate() {
  const sub = document.querySelector('.adm-topbar-sub');
  if (!sub) return;
  const dateText = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  sub.textContent = `${dateText} · Paddox Admin Panel`;
}

async function updateAdminIdentity() {
  const localIdentity = pickAdminIdentityFromStorage();
  setAdminIdentityUI(localIdentity, !!(localIdentity.name || localIdentity.email));
  updateAdminTopbarDate();

  const remoteIdentity = await fetchAdminIdentity();
  if (remoteIdentity && (remoteIdentity.name || remoteIdentity.email)) {
    setAdminIdentityUI(remoteIdentity, true);
  }
}


/* ══════════════════════════════════════
   ADMIN FAN QUOTES
══════════════════════════════════════ */
const ADMIN_QUOTES_API =
  'https://paddox-backend.onrender.com/api/fan/admin/quotes';

let REAL_QUOTES_ADMIN = [];
let EDIT_QUOTE_ID = null;

function quoteAdminHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getAdminToken()}`
  };
}

async function loadAdminQuotes() {
  const tbody = document.getElementById('quotes-tbody');

  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td colspan="7" style="text-align:center;padding:30px;color:#777">
        Loading quotes...
      </td>
    </tr>
  `;

  try {
    const res = await fetch(ADMIN_QUOTES_API, {
      headers: {
        Authorization: `Bearer ${getAdminToken()}`
      }
    });

    if (res.status === 401 || res.status === 403) {
      redirectToLogin('Admin session expired. Please login again.');
      return;
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok || data.success === false) {
      throw new Error(data.message || 'Quotes load failed');
    }

    REAL_QUOTES_ADMIN =
      data.data?.quotes ||
      data.quotes ||
      [];

    renderAdminQuotes();

  } catch (err) {
    console.error(err);

    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;padding:30px;color:#777">
          Failed to load quotes
        </td>
      </tr>
    `;
  }
}

function getFilteredAdminQuotes() {
  const era =
    document.getElementById('quote-era-filter')?.value || 'all';

  const search =
    document.getElementById('quote-search-admin')?.value?.trim()?.toLowerCase() || '';

  return REAL_QUOTES_ADMIN.filter(q => {
    const eraOk =
      era === 'all' ||
      q.era === era;

    const searchOk =
      !search ||
      `${q.driver} ${q.team} ${q.text} ${q.category}`
        .toLowerCase()
        .includes(search);

    return eraOk && searchOk;
  });
}

function renderAdminQuotes() {
  const tbody = document.getElementById('quotes-tbody');

  if (!tbody) return;

  const list = getFilteredAdminQuotes();

  if (!list.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;padding:30px;color:#777">
          No quotes found
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = list.map(q => `
    <tr>
      <td>
        <div style="display:flex;align-items:center;gap:10px">
          <span style="
            width:32px;
            height:32px;
            border-radius:50%;
            overflow:hidden;
            display:inline-flex;
            align-items:center;
            justify-content:center;
            background:#151515;
            font-size:1.4rem;
            flex-shrink:0;
          ">${adminQuoteAvatarHTML(q.avatar)}</span>
          <div>
            <div style="font-weight:800;color:#fff">${q.driver}</div>
            <div style="color:#777;font-size:.75rem">${q.team || '-'}</div>
          </div>
        </div>
      </td>

      <td style="max-width:380px;color:#ccc;line-height:1.45">
        "${q.text}"
      </td>

      <td>
        <span class="sb s-pr">
          ${q.era || 'current'}
        </span>
      </td>

      <td style="color:#aaa">
        ${q.category || '-'}
      </td>

      <td>
        ${q.isFeatured ? '⭐ Yes' : '—'}
      </td>

      <td>
        <span class="sb ${q.isActive ? 's-act' : 's-out'}">
          ${q.isActive ? 'Active' : 'Inactive'}
        </span>
      </td>

      <td>
        <button class="act-btn" onclick="openQuoteModal('${q._id}')">
          Edit
        </button>
        <button class="act-btn" onclick="deleteQuote('${q._id}')">
          Delete
        </button>
      </td>
    </tr>
  `).join('');
}

document.addEventListener('change', e => {
  if (e.target?.id === 'quote-era-filter') {
    renderAdminQuotes();
  }
});

document.addEventListener('input', e => {
  if (e.target?.id === 'quote-search-admin') {
    renderAdminQuotes();
  }
});


function isQuoteAvatarImage(value) {
  return (
    typeof value === 'string' &&
    (
      value.startsWith('http://') ||
      value.startsWith('https://') ||
      value.startsWith('data:image/')
    )
  );
}

function renderQuoteAvatarPreview(value = '🏎️') {
  const preview = document.getElementById('quote-avatar-preview');

  if (!preview) return;

  if (isQuoteAvatarImage(value)) {
    preview.innerHTML = `
      <img
        src="${value}"
        alt="Driver avatar"
        style="
          width:100%;
          height:100%;
          object-fit:cover;
          display:block;
        "
      />
    `;
  } else {
    preview.textContent = value || '🏎️';
  }
}


function renderAdminQuoteCardPreview() {
  const preview = document.getElementById('quote-card-live-preview');
  if (!preview) return;

  const text = document.getElementById('quote-text')?.value?.trim() || 'Your quote preview will appear here as you type.';
  const driver = document.getElementById('quote-driver')?.value?.trim() || 'Driver Name';
  const team = document.getElementById('quote-team')?.value?.trim() || 'Team / Era';
  const era = document.getElementById('quote-era')?.value || 'current';
  const category = document.getElementById('quote-category')?.value?.trim() || 'motivation';
  const avatar = document.getElementById('quote-avatar')?.value?.trim() || '🏎️';
  const avatarHtml = isQuoteAvatarImage(avatar)
    ? `<img src="${avatar}" alt="${driver}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block">`
    : avatar;

  preview.innerHTML = `
    <div style="
      margin-top:18px;
      padding:18px;
      border-radius:22px;
      background:linear-gradient(145deg,rgba(255,255,255,.055),rgba(255,255,255,.018));
      border:1px solid rgba(255,255,255,.1);
      border-top:2px solid var(--red);
      box-shadow:0 18px 45px rgba(0,0,0,.28);
    ">
      <div style="display:flex;align-items:center;gap:8px;color:var(--red);font-family:var(--font-c);letter-spacing:2px;text-transform:uppercase;font-size:.72rem;margin-bottom:12px">
        <span>${era}</span><span style="color:#555">•</span><span>${category}</span>
      </div>
      <div style="font-size:1.35rem;line-height:1.45;color:#fff;margin-bottom:18px">“${text}”</div>
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px">
        <div style="display:flex;align-items:center;gap:12px;min-width:0">
          <div style="width:48px;height:48px;border-radius:50%;overflow:hidden;background:#151515;border:1px solid rgba(232,0,45,.45);display:flex;align-items:center;justify-content:center;font-size:1.35rem;flex-shrink:0">${avatarHtml}</div>
          <div style="min-width:0">
            <div style="font-weight:900;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${driver}</div>
            <div style="color:#999;font-size:.82rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${team}</div>
          </div>
        </div>
        <button type="button" class="act-btn" style="padding:9px 12px;white-space:nowrap">Share Image</button>
      </div>
    </div>
  `;
}

function bindQuoteLivePreview() {
  ['quote-text','quote-driver','quote-team','quote-era','quote-category','quote-avatar'].forEach(id => {
    const el = document.getElementById(id);
    if (el && !el.dataset.previewBound) {
      el.dataset.previewBound = '1';
      el.addEventListener('input', renderAdminQuoteCardPreview);
      el.addEventListener('change', renderAdminQuoteCardPreview);
    }
  });
}

/* Premium image cropper used by Fan Quotes and Fan Drivers.
   Admin can upload a full image, drag/zoom it, and save a clean square headshot. */
function openPremiumImageCropper(file, options = {}) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type || !file.type.startsWith('image/')) {
      reject(new Error('Select a valid image'));
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      reject(new Error('Image must be below 8MB'));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();

      img.onload = () => {
        const outputSize = options.outputSize || 520;
        const cropSize = 320;
        let scale = Math.max(cropSize / img.width, cropSize / img.height);
        let minScale = scale;
        let maxScale = scale * 3.2;
        let offsetX = 0;
        let offsetY = 0;
        let dragging = false;
        let lastX = 0;
        let lastY = 0;
        let finished = false;

        const modal = document.createElement('div');
        modal.id = 'premium-image-cropper-modal';
        modal.innerHTML = `
          <div style="position:fixed;inset:0;background:rgba(0,0,0,.78);z-index:100000;display:flex;align-items:center;justify-content:center;padding:18px;backdrop-filter:blur(16px)">
            <div style="width:min(94vw,720px);background:linear-gradient(145deg,#111,#080808);border:1px solid rgba(255,255,255,.12);box-shadow:0 30px 90px rgba(0,0,0,.65);padding:24px;color:#fff">
              <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:16px">
                <div>
                  <div style="font-family:var(--font-d);letter-spacing:4px;font-size:1.75rem">${options.title || 'CROP DRIVER HEADSHOT'}</div>
                  <div style="color:#999;font-family:var(--font-c);letter-spacing:2px;font-size:.78rem;margin-top:4px">Drag to position • Zoom to keep only the face/headshot</div>
                </div>
                <button type="button" id="crop-cancel-x" style="width:38px;height:38px;color:#fff;border:1px solid rgba(255,255,255,.14);background:#171717">✕</button>
              </div>

              <div style="display:grid;grid-template-columns:340px 1fr;gap:20px;align-items:center">
                <div style="display:flex;justify-content:center">
                  <canvas id="premium-crop-canvas" width="320" height="320" style="width:320px;height:320px;border-radius:50%;background:transparent;border:1px solid rgba(255,255,255,.18);cursor:grab;box-shadow:inset 0 0 0 9999px rgba(0,0,0,.02)"></canvas>
                </div>
                <div>
                  <div style="color:#bbb;font-size:.86rem;line-height:1.65;margin-bottom:18px">
                    This removes the unwanted background area from your uploaded full image by saving only the cropped square headshot. The Fan Hub card will show it in a premium clean avatar without the old black block/neon glow.
                  </div>
                  <label style="display:block;color:#777;font-size:.72rem;letter-spacing:2px;margin-bottom:8px">ZOOM</label>
                  <input id="crop-zoom" type="range" min="0" max="100" value="0" style="width:100%;accent-color:var(--red)">
                  <button type="button" id="crop-reset" class="act-btn" style="width:100%;padding:10px;margin-top:14px">Reset Position</button>
                </div>
              </div>

              <div style="display:flex;gap:12px;margin-top:22px">
                <button type="button" id="crop-cancel" class="act-btn" style="flex:1;padding:13px;background:#171717;color:#fff;border:1px solid rgba(255,255,255,.12)">Cancel</button>
                <button type="button" id="crop-save" class="act-btn" style="flex:1;padding:13px;background:var(--red);color:#fff;border:0;font-weight:900;letter-spacing:2px">Save Cropped Headshot</button>
              </div>
            </div>
          </div>
        `;
        document.body.appendChild(modal);

        const canvas = modal.querySelector('#premium-crop-canvas');
        const ctx = canvas.getContext('2d');
        const zoom = modal.querySelector('#crop-zoom');

        function draw() {
          ctx.clearRect(0, 0, cropSize, cropSize);
          ctx.save();
          ctx.beginPath();
          ctx.arc(cropSize / 2, cropSize / 2, cropSize / 2 - 1, 0, Math.PI * 2);
          ctx.clip();
          const drawW = img.width * scale;
          const drawH = img.height * scale;
          const x = (cropSize - drawW) / 2 + offsetX;
          const y = (cropSize - drawH) / 2 + offsetY;
          ctx.drawImage(img, x, y, drawW, drawH);
          ctx.restore();
          ctx.beginPath();
          ctx.arc(cropSize / 2, cropSize / 2, cropSize / 2 - 1, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255,255,255,.35)';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        function clampOffsets() {
          const drawW = img.width * scale;
          const drawH = img.height * scale;
          const maxX = Math.max(0, (drawW - cropSize) / 2);
          const maxY = Math.max(0, (drawH - cropSize) / 2);
          offsetX = Math.max(-maxX, Math.min(maxX, offsetX));
          offsetY = Math.max(-maxY, Math.min(maxY, offsetY));
        }

        function closeWithCancel() {
          if (finished) return;
          finished = true;
          modal.remove();
          reject(new Error('Image crop cancelled'));
        }

        zoom.oninput = () => {
          const pct = Number(zoom.value || 0) / 100;
          scale = minScale + (maxScale - minScale) * pct;
          clampOffsets();
          draw();
        };

        canvas.addEventListener('pointerdown', e => {
          dragging = true;
          lastX = e.clientX;
          lastY = e.clientY;
          canvas.setPointerCapture(e.pointerId);
          canvas.style.cursor = 'grabbing';
        });

        canvas.addEventListener('pointermove', e => {
          if (!dragging) return;
          offsetX += e.clientX - lastX;
          offsetY += e.clientY - lastY;
          lastX = e.clientX;
          lastY = e.clientY;
          clampOffsets();
          draw();
        });

        canvas.addEventListener('pointerup', e => {
          dragging = false;
          canvas.releasePointerCapture(e.pointerId);
          canvas.style.cursor = 'grab';
        });

        modal.querySelector('#crop-reset').onclick = () => {
          offsetX = 0;
          offsetY = 0;
          zoom.value = 0;
          scale = minScale;
          draw();
        };

        modal.querySelector('#crop-cancel').onclick = closeWithCancel;
        modal.querySelector('#crop-cancel-x').onclick = closeWithCancel;

        modal.querySelector('#crop-save').onclick = () => {
          const out = document.createElement('canvas');
          out.width = outputSize;
          out.height = outputSize;
          const octx = out.getContext('2d');
          octx.clearRect(0, 0, outputSize, outputSize);
          octx.save();
          octx.beginPath();
          octx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
          octx.clip();
          const ratio = outputSize / cropSize;
          const drawW = img.width * scale * ratio;
          const drawH = img.height * scale * ratio;
          const x = (outputSize - drawW) / 2 + offsetX * ratio;
          const y = (outputSize - drawH) / 2 + offsetY * ratio;
          octx.drawImage(img, x, y, drawW, drawH);
          octx.restore();
          finished = true;
          modal.remove();
          resolve(out.toDataURL('image/jpeg', options.quality || 0.82));
        };

        draw();
      };

      img.onerror = () => reject(new Error('Could not read image'));
      img.src = reader.result;
    };

    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}


function readQuoteImageAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Select a valid image'));
      return;
    }

    if (file.size > 6 * 1024 * 1024) {
      reject(new Error('Image must be below 6MB'));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');

        const maxSize = 360;
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));

        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        resolve(canvas.toDataURL('image/jpeg', 0.78));
      };

      img.onerror = () => reject(new Error('Could not read image'));
      img.src = reader.result;
    };

    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

function bindQuoteAvatarUpload() {
  const uploadBtn = document.getElementById('quote-avatar-upload');
  const fileInput = document.getElementById('quote-avatar-file');
  const avatarInput = document.getElementById('quote-avatar');

  if (uploadBtn && fileInput) {
    uploadBtn.onclick = () => fileInput.click();

    fileInput.onchange = async () => {
      try {
        const file = fileInput.files?.[0];

        if (!file) return;

        showToast('🖼️ Opening quote driver image cropper...');

        const dataUrl = await openPremiumImageCropper(file, {
          title: 'CROP QUOTE DRIVER IMAGE',
          outputSize: 520,
          quality: 0.82
        });

        showToast('☁️ Uploading quote driver image to Cloudinary...');
        const cloudinaryUrl = await uploadImageToCloudinaryBridge(dataUrl, 'fan-quotes');

        avatarInput.value = cloudinaryUrl || dataUrl;
        renderQuoteAvatarPreview(avatarInput.value);
        renderAdminQuoteCardPreview();

        showToast('✅ Quote driver image saved to Cloudinary');

      } catch (err) {
        showToast(`❌ ${err.message}`);
      } finally {
        fileInput.value = '';
      }
    };
  }

  if (avatarInput) {
    avatarInput.oninput = () => {
      renderQuoteAvatarPreview(avatarInput.value.trim() || '🏎️');
    renderAdminQuoteCardPreview();
    };
  }
}

function adminQuoteAvatarHTML(value) {
  if (isQuoteAvatarImage(value)) {
    return `
      <img
        src="${value}"
        style="
          width:28px;
          height:28px;
          object-fit:cover;
          border-radius:50%;
          display:block;
        "
      />
    `;
  }

  return value || '🏎️';
}



/* Quote modal close safety */
document.addEventListener('click', e => {
  const closeBtn = e.target.closest?.('#quote-close, .quote-close, [data-quote-close]');

  if (closeBtn) {
    e.preventDefault();
    e.stopPropagation();
    closeQuoteModal();
    return;
  }

  if (e.target?.id === 'quote-overlay') {
    closeQuoteModal();
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && document.getElementById('quote-modal')?.classList.contains('show')) {
    closeQuoteModal();
  }
});

function ensureQuoteModal() {
  if (document.getElementById('quote-modal')) return;

  const modal = document.createElement('div');

  modal.id = 'quote-modal';

  modal.innerHTML = `
    <div class="preview-overlay" id="quote-overlay">
      <div class="preview-card" style="
        max-width:760px;
        width:92vw;
        padding:28px;
        color:#fff;
        text-align:left;
      ">
        <button class="preview-close" id="quote-close" type="button" onclick="closeQuoteModal()">✕</button>

        <div style="
          font-family:var(--font-d);
          letter-spacing:4px;
          font-size:1.8rem;
          margin-bottom:8px;
        " id="quote-modal-title">
          ADD QUOTE
        </div>

        <div style="
          color:var(--red);
          font-family:var(--font-c);
          letter-spacing:2px;
          margin-bottom:22px;
        ">
          FAN HUB QUOTE LIBRARY
        </div>

        <label style="display:flex;flex-direction:column;gap:6px;margin-bottom:14px">
          <span style="color:#777;font-size:.75rem;letter-spacing:2px">QUOTE TEXT</span>
          <textarea id="quote-text" class="edit-product-input" rows="4" maxlength="500"></textarea>
        </label>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
          <label style="display:flex;flex-direction:column;gap:6px">
            <span style="color:#777;font-size:.75rem;letter-spacing:2px">DRIVER</span>
            <input id="quote-driver" class="edit-product-input">
          </label>

          <label style="display:flex;flex-direction:column;gap:6px">
            <span style="color:#777;font-size:.75rem;letter-spacing:2px">TEAM</span>
            <input id="quote-team" class="edit-product-input">
          </label>

          <label style="display:flex;flex-direction:column;gap:6px">
            <span style="color:#777;font-size:.75rem;letter-spacing:2px">ERA</span>
            <select id="quote-era" class="edit-product-input">
              <option value="current">current</option>
              <option value="legend">legend</option>
              <option value="principal">principal</option>
              <option value="other">other</option>
            </select>
          </label>

          <label style="display:flex;flex-direction:column;gap:6px">
            <span style="color:#777;font-size:.75rem;letter-spacing:2px">CATEGORY</span>
            <input id="quote-category" class="edit-product-input" placeholder="motivation, champions, racecraft">
          </label>

          <label style="display:flex;flex-direction:column;gap:6px">
            <span style="color:#777;font-size:.75rem;letter-spacing:2px">DRIVER IMAGE / EMOJI</span>

            <div style="display:flex;gap:10px;align-items:center">
              <div id="quote-avatar-preview" style="
                width:54px;
                height:54px;
                border-radius:50%;
                background:#151515;
                border:1px solid rgba(255,255,255,.12);
                display:flex;
                align-items:center;
                justify-content:center;
                overflow:hidden;
                font-size:1.45rem;
                flex-shrink:0;
              ">🏎️</div>

              <div style="flex:1">
                <input id="quote-avatar-file" type="file" accept="image/*" style="display:none">
                <button type="button" class="act-btn" id="quote-avatar-upload" style="width:100%;padding:10px">
                  Upload / Crop Driver Image
                </button>
                <input id="quote-avatar" class="edit-product-input" placeholder="or emoji like 🏎️" style="margin-top:8px">
              </div>
            </div>

            <span style="color:#777;font-size:.72rem">
              JPG / PNG supported. Drag + zoom cropper saves a clean circular driver image for Fan Hub.
            </span>
          </label>

          <label style="display:flex;flex-direction:column;gap:6px">
            <span style="color:#777;font-size:.75rem;letter-spacing:2px">SOURCE</span>
            <input id="quote-source" class="edit-product-input" placeholder="optional">
          </label>

          <label style="display:flex;align-items:center;gap:10px;color:#aaa;margin-top:8px">
            <input id="quote-featured" type="checkbox">
            Featured quote
          </label>

          <label style="display:flex;align-items:center;gap:10px;color:#aaa;margin-top:8px">
            <input id="quote-active" type="checkbox" checked>
            Active
          </label>
        </div>

        <div id="quote-card-live-preview"></div>

        <button
          class="act-btn"
          id="quote-save"
          style="
            width:100%;
            padding:14px;
            margin-top:22px;
            background:var(--red);
            color:white;
            border:0;
            font-weight:800;
            letter-spacing:3px;
          "
        >
          SAVE QUOTE
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector('#quote-close').onclick = closeQuoteModal;

  modal.querySelector('#quote-overlay').onclick = e => {
    if (e.target.id === 'quote-overlay') closeQuoteModal();
  };

  modal.querySelector('#quote-save').onclick = saveQuote;

  bindQuoteAvatarUpload();
  bindQuoteLivePreview();
}


function openQuoteModal(id = null) {
  ensureQuoteModal();

  EDIT_QUOTE_ID = id;

  const quote =
    id
      ? REAL_QUOTES_ADMIN.find(q => String(q._id) === String(id))
      : null;

  document.getElementById('quote-modal-title').textContent =
    quote ? 'EDIT QUOTE' : 'ADD QUOTE';

  document.getElementById('quote-text').value = quote?.text || '';
  document.getElementById('quote-driver').value = quote?.driver || '';
  document.getElementById('quote-team').value = quote?.team || '';
  document.getElementById('quote-era').value = quote?.era || 'current';
  document.getElementById('quote-category').value = quote?.category || 'motivation';
  document.getElementById('quote-avatar').value = quote?.avatar || '🏎️';
  renderQuoteAvatarPreview(quote?.avatar || '🏎️');
  document.getElementById('quote-source').value = quote?.source || '';
  document.getElementById('quote-featured').checked = !!quote?.isFeatured;
  document.getElementById('quote-active').checked = quote?.isActive !== false;
  bindQuoteLivePreview();
  renderAdminQuoteCardPreview();

  const quoteModal = document.getElementById('quote-modal');
  quoteModal.style.display = 'block';
  quoteModal.removeAttribute('aria-hidden');
  quoteModal.classList.add('show');
}

function closeQuoteModal() {
  const modal = document.getElementById('quote-modal');
  const overlay = document.getElementById('quote-overlay');

  if (modal) {
    modal.classList.remove('show');
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
  }

  if (overlay) {
    overlay.classList.remove('show');
  }

  document.body.classList.remove('modal-open');
  EDIT_QUOTE_ID = null;
}

window.closeQuoteModal = closeQuoteModal;

async function saveQuote() {
  try {
    const body = {
      text: document.getElementById('quote-text').value.trim(),
      driver: document.getElementById('quote-driver').value.trim(),
      team: document.getElementById('quote-team').value.trim(),
      era: document.getElementById('quote-era').value,
      category: document.getElementById('quote-category').value.trim() || 'motivation',
      avatar: document.getElementById('quote-avatar').value.trim() || '🏎️',
      driverImage: document.getElementById('quote-avatar').value.trim() || '🏎️',
      image: document.getElementById('quote-avatar').value.trim() || '🏎️',
      source: document.getElementById('quote-source').value.trim(),
      isFeatured: document.getElementById('quote-featured').checked,
      isActive: document.getElementById('quote-active').checked
    };

    if (!body.text || !body.driver) {
      showToast('❌ Quote and driver required');
      return;
    }

    showToast('⏳ Saving quote...');

    const res = await fetch(
      EDIT_QUOTE_ID
        ? `${ADMIN_QUOTES_API}/${EDIT_QUOTE_ID}`
        : ADMIN_QUOTES_API,
      {
        method: EDIT_QUOTE_ID ? 'PUT' : 'POST',
        headers: quoteAdminHeaders(),
        body: JSON.stringify(body)
      }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok || data.success === false) {
      throw new Error(data.message || 'Save quote failed');
    }

    showToast('🔥 Quote saved');

    closeQuoteModal();

    await loadAdminQuotes();

  } catch (err) {
    console.error(err);
    showToast(`❌ ${err.message}`);
  }
}

async function deleteQuote(id) {
  try {
    const quote =
      REAL_QUOTES_ADMIN.find(q => String(q._id) === String(id));

    if (!confirm(`Delete quote by ${quote?.driver || 'this driver'}?`)) return;

    showToast('⏳ Deleting quote...');

    const res = await fetch(
      `${ADMIN_QUOTES_API}/${id}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${getAdminToken()}`
        }
      }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok || data.success === false) {
      throw new Error(data.message || 'Delete quote failed');
    }

    showToast('🔥 Quote deleted');

    await loadAdminQuotes();

  } catch (err) {
    console.error(err);
    showToast(`❌ ${err.message}`);
  }
}


/* ══════════════════════════════════════
   ADMIN FAN DRIVERS — IMAGE OVERRIDES
══════════════════════════════════════ */
const ADMIN_DRIVER_PROFILES_API =
  'https://paddox-backend.onrender.com/api/fan/admin/driver-profiles';

let REAL_DRIVER_PROFILES_ADMIN = [];
let EDIT_DRIVER_PROFILE_ID = null;

function driverProfileHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getAdminToken()}`
  };
}

function driverProfileImageHTML(profile) {
  if (profile.image && (profile.image.startsWith('http://') || profile.image.startsWith('https://') || profile.image.startsWith('data:image/'))) {
    return `<img src="${profile.image}" style="width:36px;height:36px;border-radius:50%;object-fit:cover"/>`;
  }
  return profile.flagEmoji || '🏎️';
}

async function loadAdminDriverProfiles() {
  const tbody = document.getElementById('driver-profiles-tbody');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:30px;color:#777">Loading driver profiles...</td></tr>`;

  try {
    const res = await fetch(ADMIN_DRIVER_PROFILES_API, {
      headers: { Authorization: `Bearer ${getAdminToken()}` }
    });

    if (res.status === 401 || res.status === 403) {
      redirectToLogin('Admin session expired. Please login again.');
      return;
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) throw new Error(data.message || 'Driver profiles load failed');

    REAL_DRIVER_PROFILES_ADMIN = data.data?.profiles || data.profiles || [];
    renderAdminDriverProfiles();

  } catch (err) {
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:30px;color:#777">Failed to load driver profiles</td></tr>`;
  }
}

function renderAdminDriverProfiles() {
  const tbody = document.getElementById('driver-profiles-tbody');
  if (!tbody) return;

  const search = document.getElementById('driver-profile-search')?.value?.trim()?.toLowerCase() || '';
  const list = REAL_DRIVER_PROFILES_ADMIN.filter(profile =>
    !search || `${profile.name} ${profile.code} ${profile.team} ${profile.country}`.toLowerCase().includes(search)
  );

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:30px;color:#777">No driver images added yet. Add driver profile images here.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(profile => `
    <tr>
      <td>
        <div style="display:flex;align-items:center;gap:10px">
          <span style="width:38px;height:38px;border-radius:50%;overflow:hidden;display:flex;align-items:center;justify-content:center;background:#151515;border:1px solid rgba(255,255,255,.12)">
            ${driverProfileImageHTML(profile)}
          </span>
          <div>
            <div style="font-weight:800;color:#fff">${profile.name}</div>
            <div style="color:#777;font-size:.75rem">${profile.driverKey}</div>
          </div>
        </div>
      </td>
      <td>${profile.code || '-'}</td>
      <td>${profile.team || '-'}</td>
      <td>${profile.flagEmoji || ''} ${profile.country || '-'}</td>
      <td><span class="sb ${profile.isActive ? 's-act' : 's-out'}">${profile.isActive ? 'Active' : 'Inactive'}</span></td>
      <td>
        <button class="act-btn" onclick="openDriverProfileModal('${profile._id}')">Edit</button>
        <button class="act-btn" onclick="deleteDriverProfile('${profile._id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

document.addEventListener('input', e => {
  if (e.target?.id === 'driver-profile-search') renderAdminDriverProfiles();
});

function ensureDriverProfileModal() {
  if (document.getElementById('driver-profile-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'driver-profile-modal';

  modal.innerHTML = `
    <div class="preview-overlay" id="driver-profile-overlay">
      <div class="preview-card" style="max-width:760px;width:92vw;padding:28px;color:#fff;text-align:left">
        <button class="preview-close" type="button" onclick="closeDriverProfileModal()">✕</button>
        <div style="font-family:var(--font-d);letter-spacing:4px;font-size:1.8rem;margin-bottom:8px" id="driver-profile-title">ADD DRIVER IMAGE</div>
        <div style="color:var(--red);font-family:var(--font-c);letter-spacing:2px;margin-bottom:22px">FAN HUB DRIVER STATS IMAGE OVERRIDE</div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
          <label style="display:flex;flex-direction:column;gap:6px"><span style="color:#777;font-size:.75rem;letter-spacing:2px">DRIVER NAME</span><input id="dp-name" class="edit-product-input" placeholder="George Russell"></label>
          <label style="display:flex;flex-direction:column;gap:6px"><span style="color:#777;font-size:.75rem;letter-spacing:2px">DRIVER CODE</span><input id="dp-code" class="edit-product-input" placeholder="RUS"></label>
          <label style="display:flex;flex-direction:column;gap:6px"><span style="color:#777;font-size:.75rem;letter-spacing:2px">TEAM</span><input id="dp-team" class="edit-product-input" placeholder="Mercedes"></label>
          <label style="display:flex;flex-direction:column;gap:6px"><span style="color:#777;font-size:.75rem;letter-spacing:2px">COUNTRY</span><input id="dp-country" class="edit-product-input" placeholder="British"></label>
          <label style="display:flex;flex-direction:column;gap:6px"><span style="color:#777;font-size:.75rem;letter-spacing:2px">FLAG EMOJI</span><input id="dp-flag" class="edit-product-input" placeholder="🇬🇧"></label>
          <label style="display:flex;align-items:center;gap:10px;color:#aaa;margin-top:26px"><input id="dp-active" type="checkbox" checked> Active</label>
        </div>

        <div style="margin-top:16px">
          <span style="display:block;color:#777;font-size:.75rem;letter-spacing:2px;margin-bottom:8px">DRIVER IMAGE</span>
          <div style="display:flex;gap:12px;align-items:center">
            <div id="dp-preview" style="width:72px;height:72px;border-radius:50%;background:#151515;border:1px solid rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;overflow:hidden;font-size:1.6rem;flex-shrink:0">🏎️</div>
            <div style="flex:1">
              <input id="dp-file" type="file" accept="image/*" style="display:none">
              <button type="button" class="act-btn" id="dp-upload" style="width:100%;padding:12px">Upload & Crop Headshot</button>
              <input id="dp-image" class="edit-product-input" placeholder="or paste image URL / cropped image data" style="margin-top:8px">
            </div>
          </div>
        </div>

        <button class="act-btn" id="dp-save" style="width:100%;padding:14px;margin-top:22px;background:var(--red);color:white;border:0;font-weight:800;letter-spacing:3px">SAVE DRIVER IMAGE</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector('#driver-profile-overlay').onclick = e => {
    if (e.target.id === 'driver-profile-overlay') closeDriverProfileModal();
  };

  modal.querySelector('#dp-save').onclick = saveDriverProfile;
  modal.querySelector('#dp-upload').onclick = () => modal.querySelector('#dp-file').click();

  modal.querySelector('#dp-file').onchange = async () => {
    try {
      const file = modal.querySelector('#dp-file').files?.[0];
      if (!file) return;
      showToast('🖼️ Opening headshot cropper...');
      const dataUrl = await openPremiumImageCropper(file, {
        title: 'CROP DRIVER HEADSHOT',
        outputSize: 520,
        quality: 0.82
      });

      showToast('☁️ Uploading driver headshot to Cloudinary...');
      const cloudinaryUrl = await uploadImageToCloudinaryBridge(dataUrl, 'fan-drivers');

      modal.querySelector('#dp-image').value = cloudinaryUrl || dataUrl;
      renderDriverProfilePreview(modal.querySelector('#dp-image').value);
      showToast('✅ Driver headshot saved to Cloudinary');
    } catch (err) {
      showToast(`❌ ${err.message}`);
    } finally {
      modal.querySelector('#dp-file').value = '';
    }
  };

  modal.querySelector('#dp-image').oninput = e => renderDriverProfilePreview(e.target.value.trim());
}

function renderDriverProfilePreview(value = '') {
  const box = document.getElementById('dp-preview');
  if (!box) return;

  if (value && (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:image/'))) {
    box.innerHTML = `<img src="${value}" style="width:100%;height:100%;object-fit:cover">`;
  } else {
    box.textContent = '🏎️';
  }
}

function openDriverProfileModal(id = null) {
  ensureDriverProfileModal();
  EDIT_DRIVER_PROFILE_ID = id;

  const profile = id ? REAL_DRIVER_PROFILES_ADMIN.find(p => String(p._id) === String(id)) : null;

  document.getElementById('driver-profile-title').textContent = profile ? 'EDIT DRIVER IMAGE' : 'ADD DRIVER IMAGE';
  document.getElementById('dp-name').value = profile?.name || '';
  document.getElementById('dp-code').value = profile?.code || '';
  document.getElementById('dp-team').value = profile?.team || '';
  document.getElementById('dp-country').value = profile?.country || '';
  document.getElementById('dp-flag').value = profile?.flagEmoji || '';
  document.getElementById('dp-image').value = profile?.image || '';
  document.getElementById('dp-active').checked = profile?.isActive !== false;

  renderDriverProfilePreview(profile?.image || '');

  const modal = document.getElementById('driver-profile-modal');
  modal.style.display = 'block';
  modal.classList.add('show');
}

function closeDriverProfileModal() {
  const modal = document.getElementById('driver-profile-modal');
  if (modal) {
    modal.classList.remove('show');
    modal.style.display = 'none';
  }
  EDIT_DRIVER_PROFILE_ID = null;
}

window.closeDriverProfileModal = closeDriverProfileModal;

async function saveDriverProfile() {
  try {
    const body = {
      name: document.getElementById('dp-name').value.trim(),
      code: document.getElementById('dp-code').value.trim().toUpperCase(),
      team: document.getElementById('dp-team').value.trim(),
      country: document.getElementById('dp-country').value.trim(),
      flagEmoji: document.getElementById('dp-flag').value.trim(),
      image: document.getElementById('dp-image').value.trim(),
      isActive: document.getElementById('dp-active').checked
    };

    if (!body.name) {
      showToast('❌ Driver name required');
      return;
    }

    showToast('⏳ Saving driver image...');

    const res = await fetch(
      EDIT_DRIVER_PROFILE_ID ? `${ADMIN_DRIVER_PROFILES_API}/${EDIT_DRIVER_PROFILE_ID}` : ADMIN_DRIVER_PROFILES_API,
      {
        method: EDIT_DRIVER_PROFILE_ID ? 'PUT' : 'POST',
        headers: driverProfileHeaders(),
        body: JSON.stringify(body)
      }
    );

    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) throw new Error(data.message || 'Save failed');

    showToast('🔥 Driver image saved');
    closeDriverProfileModal();
    await loadAdminDriverProfiles();

  } catch (err) {
    console.error(err);
    showToast(`❌ ${err.message}`);
  }
}

async function deleteDriverProfile(id) {
  try {
    const profile = REAL_DRIVER_PROFILES_ADMIN.find(p => String(p._id) === String(id));
    if (!confirm(`Delete image/profile for ${profile?.name || 'this driver'}?`)) return;

    const res = await fetch(`${ADMIN_DRIVER_PROFILES_API}/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getAdminToken()}` }
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) throw new Error(data.message || 'Delete failed');

    showToast('🔥 Driver profile deleted');
    await loadAdminDriverProfiles();

  } catch (err) {
    console.error(err);
    showToast(`❌ ${err.message}`);
  }
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && document.getElementById('driver-profile-modal')?.classList.contains('show')) {
    closeDriverProfileModal();
  }
});

/* ══════════════════════════════════════
   SAFE INITIAL ADMIN LOAD
══════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  updateAdminTopbarDate();
  const localIdentity = pickAdminIdentityFromStorage();
  setAdminIdentityUI(localIdentity, !!(localIdentity.name || localIdentity.email));
});

document.addEventListener('DOMContentLoaded', async () => {
  updateAdminTopbarDate();
  const allowed = await checkAdminAccess();

  if (!allowed) return;

  await Promise.allSettled([
    loadOrders(),
    loadProducts(),
    loadAssets(),
    loadUsers()
  ]);

  updateOverviewRealtime();
  updateAdminSidebarBadges();
  await updateAdminIdentity();
});

/* ══ INIT LOG ══ */
console.log('%c⚙️ PADDOX — Admin Dashboard Ready · A2.5', 'color:#e8002d;font-size:14px;font-weight:bold;');
/* ══════════════════════════════════════
   PHASE 9 — ADMIN ORDERS + ANALYTICS POLISH
   Real orders only · clean admin controls
══════════════════════════════════════ */
const ADMIN_PHASE9_STATUS_FLOW = ['placed','processing','shipped','out_for_delivery','delivered'];
const ADMIN_PHASE9_STATUS_OPTIONS = ['placed','processing','shipped','out_for_delivery','delivered','cancelled','refunded'];

function adminPhase9Text(value, fallback = '-') {
  return String(value ?? fallback).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
}

function adminPhase9Date(value) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
}

function adminPhase9DateTime(value) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

function adminPhase9OrderTotal(order = {}) {
  return Number(order?.pricing?.total || order?.total || 0);
}

function adminPhase9PaymentStatus(order = {}) {
  return String(order?.payment?.status || order?.paymentStatus || (adminPhase9OrderTotal(order) ? 'paid' : 'pending')).toLowerCase();
}

function adminPhase9PaymentMethod(order = {}) {
  const raw = order?.payment?.method || order?.paymentMethod || order?.payment?.gateway || 'Payment';
  return String(raw).replaceAll('_', ' ').toUpperCase();
}

function adminPhase9Customer(order = {}) {
  const name = `${order?.user?.firstName || ''} ${order?.user?.lastName || ''}`.trim() || order?.shippingAddress?.name || 'Customer';
  const email = order?.user?.email || order?.shippingAddress?.email || '';
  const phone = order?.shippingAddress?.phone || '';
  return { name, email, phone };
}

function adminPhase9StatusClass(status = '') {
  const s = String(status || '').toLowerCase();
  if (s === 'delivered') return 's-del';
  if (s === 'shipped' || s === 'out_for_delivery') return 's-sh';
  if (s === 'cancelled' || s === 'failed') return 's-out';
  if (s === 'placed' || s === 'processing') return 's-pr';
  return 's-pr';
}

function adminPhase9StatusOptions(current = 'placed') {
  const active = String(current || 'placed').toLowerCase();
  return ADMIN_PHASE9_STATUS_OPTIONS.map(status => `
    <option value="${status}" ${active === status ? 'selected' : ''}>${status.replaceAll('_', ' ').toUpperCase()}</option>
  `).join('');
}

function adminPhase9FilteredOrders() {
  const status = document.getElementById('admin-order-status-filter')?.value || 'all';
  const range = document.getElementById('admin-order-time-filter')?.value || 'all';
  const query = (document.getElementById('admin-order-search')?.value || '').trim().toLowerCase();
  const now = new Date();

  return (REAL_ORDERS || []).filter(order => {
    const orderStatus = String(order.status || 'placed').toLowerCase();
    if (status !== 'all' && orderStatus !== status) return false;

    if (range !== 'all') {
      const d = new Date(order.createdAt || order.updatedAt || 0);
      if (Number.isNaN(d.getTime())) return false;
      const diff = now - d;
      if (range === 'today' && d.toDateString() !== now.toDateString()) return false;
      if (range === 'week' && diff > 7 * 864e5) return false;
      if (range === 'month' && !(d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear())) return false;
    }

    if (query) {
      const c = adminPhase9Customer(order);
      const haystack = [
        order.orderNumber,
        order._id,
        c.name,
        c.email,
        c.phone,
        order.shippingAddress?.city,
        order.shippingAddress?.pincode,
        ...(order.items || []).map(item => item.name)
      ].filter(Boolean).join(' ').toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    return true;
  });
}

function renderOrders() {
  const tbody = document.getElementById('orders-tbody');
  if (!tbody) return;

  /* Phase A4.6.1 — keep the orders table locked to the left edge.
     Some browsers preserve horizontal scroll after deploy refresh, which
     can visually cut the order number column. */
  const ordersWrap = document.querySelector('#adm-orders .orders-table-wrap');
  if (ordersWrap) ordersWrap.scrollLeft = 0;

  const orders = adminPhase9FilteredOrders();
  adminPhase9RenderOrderSummaryChips(orders);

  if (!orders.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8">
          <div class="admin-empty-state">
            <strong>No matching orders</strong>
            Change the filter/search or wait for new orders.
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = orders.map(order => {
    const c = adminPhase9Customer(order);
    const items = order.items || [];
    const itemLabel = items.length
      ? `${items.length} item${items.length > 1 ? 's' : ''} · ${items.slice(0, 2).map(i => i.name || 'Product').join(', ')}${items.length > 2 ? ' +' + (items.length - 2) : ''}`
      : 'No items';
    const payStatus = adminPhase9PaymentStatus(order);
    const statusLabel = String(order.status || 'placed').replaceAll('_', ' ');

    return `
      <tr class="admin-order-row">
        <td>
          <div class="admin-order-code">#${adminPhase9Text(order.orderNumber || order._id)}</div>
          <div class="admin-order-sub">${adminPhase9Text(order._id || '')}</div>
        </td>
        <td>
          <div class="admin-customer-name">${adminPhase9Text(c.name)}</div>
          <div class="admin-customer-meta">${adminPhase9Text(c.email || c.phone || 'No contact')}</div>
        </td>
        <td><span class="admin-items-pill admin-items-pill-clean"><span class="admin-items-dot"></span>${adminPhase9Text(itemLabel)}</span></td>
        <td style="color:var(--muted2)">${adminPhase9Date(order.createdAt)}</td>
        <td>
          <span class="admin-pay-badge admin-pay-${adminPhase9Text(payStatus)}">
            ${payStatus === 'paid' ? '✓' : '•'} ${adminPhase9Text(adminPhase9PaymentMethod(order))}
          </span>
        </td>
        <td style="font-family:var(--font-d);font-size:1.12rem">${money(adminPhase9OrderTotal(order))}</td>
        <td><span class="sb ${adminPhase9StatusClass(order.status)}">${adminPhase9Text(statusLabel)}</span></td>
        <td>
          <div class="admin-order-actions admin-order-actions-wide">
            <button class="admin-mini-btn red" onclick="openOrderDetails('${order._id}')">View</button>
            <button class="admin-mini-btn" onclick="adminPhase9OpenReceipt('${order._id}')">Receipt</button>
            <button class="admin-mini-btn danger" onclick="deleteAdminOrder('${order._id}', '${(order.orderNumber || order._id)}')">Delete</button>
            <div class="admin-inline-status-wrap">
              <select class="admin-inline-status" id="admin-status-${order._id}">
                ${adminPhase9StatusOptions(order.status)}
              </select>
              <button class="admin-mini-btn" onclick="updateOrderStatus('${order._id}', document.getElementById('admin-status-${order._id}')?.value, false)">Update</button>
            </div>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function adminPhase9RenderOrderSummaryChips(orders = []) {
  const page = document.getElementById('adm-orders');
  if (!page) return;
  let strip = document.getElementById('admin-order-summary-chips');
  if (!strip) {
    strip = document.createElement('div');
    strip.id = 'admin-order-summary-chips';
    strip.className = 'admin-kpi-inline';
    const toolbar = page.querySelector('.page-toolbar');
    toolbar?.insertAdjacentElement('afterend', strip);
  }

  const total = orders.length;
  const revenue = orders.reduce((sum, order) => sum + adminPhase9OrderTotal(order), 0);
  const paid = orders.filter(order => adminPhase9PaymentStatus(order) === 'paid').length;
  const pending = orders.filter(order => !['delivered','cancelled'].includes(String(order.status || '').toLowerCase())).length;

  strip.innerHTML = `
    <div class="admin-kpi-chip">Orders <strong>${total}</strong></div>
    <div class="admin-kpi-chip">Revenue <strong>${money(revenue)}</strong></div>
    <div class="admin-kpi-chip">Paid <strong>${paid}</strong></div>
    <div class="admin-kpi-chip">Active Fulfilment <strong>${pending}</strong></div>
  `;
}

function adminPhase9OpenReceipt(orderId) {
  if (!orderId) return;
  window.open(`receipt.html?orderId=${encodeURIComponent(orderId)}`, '_blank');
}

function adminPhase9StatusTimeline(status = '') {
  const current = String(status || 'placed').toLowerCase();
  const isCancelled = current === 'cancelled';
  let currentIndex = ADMIN_PHASE9_STATUS_FLOW.indexOf(current);
  if (currentIndex < 0) currentIndex = 0;

  if (isCancelled) {
    return `<div class="admin-status-flow"><div class="admin-status-step now" style="grid-column:1/-1">Cancelled</div></div>`;
  }

  return `<div class="admin-status-flow">${ADMIN_PHASE9_STATUS_FLOW.map((step, index) => `
    <div class="admin-status-step ${index < currentIndex ? 'done' : index === currentIndex ? 'now' : ''}">
      ${step.replaceAll('_', ' ')}
    </div>
  `).join('')}</div>`;
}

function openOrderDetails(orderId) {
  ensureOrderModal();
  const order = (REAL_ORDERS || []).find(o => String(o._id) === String(orderId));
  if (!order) {
    showToast('❌ Order not found');
    return;
  }

  const c = adminPhase9Customer(order);
  const items = order.items || [];
  const address = order.shippingAddress || {};
  const payStatus = adminPhase9PaymentStatus(order);
  const payMethod = adminPhase9PaymentMethod(order);
  const transactionId = order.payment?.transactionId || order.payment?.razorpayPaymentId || order.payment?.paymentId || order.payment?.reference || order.payment?.demoPaymentId || '-';

  document.getElementById('od-title').textContent = `#${order.orderNumber || order._id}`;
  document.getElementById('od-body').innerHTML = `
    <div class="od-grid">
      <div class="od-box">
        <div class="od-label">Customer</div>
        <div class="od-value">${adminPhase9Text(c.name)}</div>
        <div style="color:#888;margin-top:4px">${adminPhase9Text(c.email || c.phone || 'No contact')}</div>
      </div>
      <div class="od-box">
        <div class="od-label">Order Date</div>
        <div class="od-value">${adminPhase9DateTime(order.createdAt)}</div>
      </div>
      <div class="od-box">
        <div class="od-label">Order Status</div>
        <div class="od-value"><span class="sb ${adminPhase9StatusClass(order.status)}">${adminPhase9Text(String(order.status || 'placed').replaceAll('_',' '))}</span></div>
      </div>
      <div class="od-box">
        <div class="od-label">Payment</div>
        <div class="od-value"><span class="admin-pay-badge admin-pay-${adminPhase9Text(payStatus)}">${adminPhase9Text(payStatus.toUpperCase())}</span></div>
        <div style="color:#888;margin-top:6px">${adminPhase9Text(payMethod)} · ${adminPhase9Text(transactionId)}</div>
      </div>
    </div>

    <div class="od-box">
      <div class="od-label">Fulfilment Timeline</div>
      ${adminPhase9StatusTimeline(order.status)}
    </div>

    <div class="od-grid" style="margin-top:14px">
      <div class="od-box">
        <div class="od-label">Shipping Address</div>
        <div class="od-value" style="line-height:1.65">
          ${adminPhase9Text(address.name || c.name)}<br>
          ${adminPhase9Text(address.line1 || address.address || '')}<br>
          ${adminPhase9Text(address.city || '')}, ${adminPhase9Text(address.state || '')} - ${adminPhase9Text(address.pincode || '')}<br>
          ${adminPhase9Text(address.country || 'India')} · ${adminPhase9Text(address.phone || '')}
        </div>
      </div>
      <div class="od-box">
        <div class="od-label">Amount Summary</div>
        <div class="od-value" style="line-height:1.85">
          Subtotal: ${money(order.pricing?.subtotal)}<br>
          Shipping: ${money(order.pricing?.shipping)}<br>
          Discount: ${money(order.pricing?.discount)}<br>
          Tax: ${money(order.pricing?.tax)}<br>
          <span style="font-size:1.35rem;color:#fff">Total: ${money(order.pricing?.total)}</span>
        </div>
      </div>
    </div>

    <table class="od-items">
      <thead><tr><th>Product</th><th>Size/Color</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead>
      <tbody>
        ${items.map(item => `
          <tr>
            <td>${adminPhase9Text(item.name || item.product?.name || 'Product')}</td>
            <td>${adminPhase9Text([item.size, item.color].filter(Boolean).join(' / ') || '-')}</td>
            <td>${Number(item.quantity || 1)}</td>
            <td>${money(item.price)}</td>
            <td>${money((item.price || 0) * (item.quantity || 1))}</td>
          </tr>
        `).join('') || '<tr><td colspan="5" style="color:#777;text-align:center">No items</td></tr>'}
      </tbody>
    </table>

    <div class="od-status-row">
      <div class="od-label" style="margin:0;color:var(--red)">Update Status</div>
      <select class="od-select" id="od-status-select">
        ${adminPhase9StatusOptions(order.status)}
      </select>
      <button class="od-btn" onclick="updateOrderStatus('${order._id}')">Update</button>
    </div>

    <div class="admin-order-modal-actions">
      <button class="admin-mini-btn red" onclick="adminPhase9OpenReceipt('${order._id}')">Open Receipt</button>
      <button class="admin-mini-btn danger" onclick="deleteAdminOrder('${order._id}', '${(order.orderNumber || order._id)}')">Delete Order</button>
    </div>
  `;

  document.getElementById('order-details-modal').classList.add('show');
  document.body.style.overflow = 'hidden';
}


async function deleteAdminOrder(orderId, orderLabel = '') {
  if (!orderId) return;

  const label = orderLabel || orderId;
  const ok = confirm(
    `Delete order #${label}?\n\nThis will permanently remove the order from PADDOX admin, customer orders, analytics, and receipt access. This action cannot be undone.`
  );

  if (!ok) return;

  try {
    showToast('⏳ Deleting order...');

    const res = await fetch(`https://paddox-backend.onrender.com/api/orders/admin/${orderId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${getAdminToken()}`
      }
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || data.success === false) {
      throw new Error(data.message || 'Delete order failed');
    }

    document.getElementById('order-details-modal')?.classList.remove('show');
    document.body.style.overflow = '';

    REAL_ORDERS = (REAL_ORDERS || []).filter(order => String(order._id) !== String(orderId));
    renderOrders();
    updateOverviewRealtime?.();
    updateAdminSidebarBadges?.();
    renderAnalyticsRealtime?.();

    showToast('🗑️ Order deleted permanently');

    await loadOrders();
  } catch (err) {
    console.error(err);
    showToast(`❌ ${err.message}`);
  }
}

async function updateOrderStatus(orderId, selectedStatus = null, reopenModal = true) {
  const status =
    selectedStatus ||
    document.getElementById('od-status-select')?.value ||
    document.getElementById('order-status-select')?.value ||
    document.getElementById(`admin-status-${orderId}`)?.value;

  if (!status) {
    showToast('Select an order status first');
    return;
  }

  try {
    showToast('⏳ Updating order status...');

    const res = await fetch(`https://paddox-backend.onrender.com/api/orders/admin/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAdminToken()}`
      },
      body: JSON.stringify({
        status,
        message: `Order marked as ${status.replaceAll('_',' ')}`
      })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) {
      throw new Error(data.message || 'Status update failed');
    }

    showToast(`🔥 Order moved to ${status.replaceAll('_',' ')}`);
    await loadOrders();

    const modalIsOpen = document.getElementById('order-details-modal')?.classList.contains('show');
    if (reopenModal && modalIsOpen) {
      openOrderDetails(orderId);
    }
  } catch (err) {
    console.error(err);
    showToast(`❌ ${err.message}`);
  }
}

function exportAdminOrdersCSV() {
  const orders = adminPhase9FilteredOrders();
  if (!orders.length) {
    showToast('No orders to export');
    return;
  }

  const rows = [[
    'Order Number','Order ID','Customer','Email','Phone','Date','Payment Method','Payment Status','Order Status','Subtotal','Shipping','Tax','Discount','Total','Items'
  ]];

  orders.forEach(order => {
    const c = adminPhase9Customer(order);
    rows.push([
      order.orderNumber || '',
      order._id || '',
      c.name,
      c.email,
      c.phone,
      adminPhase9DateTime(order.createdAt),
      adminPhase9PaymentMethod(order),
      adminPhase9PaymentStatus(order),
      order.status || 'placed',
      order.pricing?.subtotal || 0,
      order.pricing?.shipping || 0,
      order.pricing?.tax || 0,
      order.pricing?.discount || 0,
      order.pricing?.total || adminPhase9OrderTotal(order),
      (order.items || []).map(item => `${item.name || 'Product'} x ${item.quantity || 1}`).join(' | ')
    ]);
  });

  const csv = rows.map(row => row.map(cell => `"${String(cell ?? '').replaceAll('"','""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `paddox-orders-${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showToast('Orders CSV exported');
}

function updateOverviewCards() {
  const overview = document.getElementById('adm-overview');
  if (!overview) return;
  const cards = overview.querySelectorAll('.kpi-card');
  if (!cards.length) return;

  const totalRevenue = (REAL_ORDERS || []).reduce((sum, order) => sum + adminPhase9OrderTotal(order), 0);
  const paidOrders = (REAL_ORDERS || []).filter(order => adminPhase9PaymentStatus(order) === 'paid').length;
  const lowStockCount = (REAL_PRODUCTS || []).filter(product => Number(product.stock || 0) <= 10).length;
  const pendingFulfilment = (REAL_ORDERS || []).filter(order => !['delivered','cancelled'].includes(String(order.status || '').toLowerCase())).length;

  const values = [
    { label:'Total Revenue', value:money(totalRevenue), change:'From real orders' },
    { label:'Total Orders', value:REAL_ORDERS.length, change:'Live order list' },
    { label:'Paid Orders', value:paidOrders, change:'Payment confirmed' },
    { label:'Low Stock', value:lowStockCount, change:lowStockCount ? 'Products need restock' : 'Stock levels healthy' }
  ];

  cards.forEach((card, index) => {
    const data = values[index];
    if (!data) return;
    card.querySelector('.kpi-label').textContent = data.label;
    card.querySelector('.kpi-value').textContent = data.value;
    card.querySelector('.kpi-change').textContent = data.change;
  });
}

function updateOverviewRevenueChart() {
  const container = document.getElementById('bar-chart');
  if (!container) return;

  const now = new Date();
  const labels = [];
  for (let i = 4; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push({ month:d.getMonth(), year:d.getFullYear(), label:d.toLocaleString('en-IN', { month:'short' }) });
  }

  const monthTotals = labels.map(meta => (REAL_ORDERS || []).reduce((sum, order) => {
    if (!order.createdAt) return sum;
    const d = new Date(order.createdAt);
    return d.getMonth() === meta.month && d.getFullYear() === meta.year
      ? sum + adminPhase9OrderTotal(order)
      : sum;
  }, 0));

  const sub = document.getElementById('overview-revenue-sub');
  if (sub && labels.length) {
    sub.textContent = `Monthly revenue · ${labels[0].label} – ${labels[labels.length - 1].label} ${labels[labels.length - 1].year}`;
  }

  const max = Math.max(...monthTotals, 1);
  container.innerHTML = labels.map((meta, index) => {
    const total = monthTotals[index];
    const height = total > 0 ? Math.max(8, (total / max) * 100) : 3;
    return `
      <div class="bc-col">
        <div class="bc-wrap">
          <div class="bc-bar" style="height:${height}%" data-v="${money(total)}"></div>
        </div>
        <div class="bc-lbl">${meta.label}</div>
      </div>
    `;
  }).join('');
}

function renderAnalyticsRealtime() {
  const orders = REAL_ORDERS || [];
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + adminPhase9OrderTotal(order), 0);
  const paidOrders = orders.filter(order => adminPhase9PaymentStatus(order) === 'paid');
  const paidRevenue = paidOrders.reduce((sum, order) => sum + adminPhase9OrderTotal(order), 0);
  const delivered = orders.filter(order => String(order.status || '').toLowerCase() === 'delivered').length;
  const aov = totalOrders ? Math.round(totalRevenue / totalOrders) : 0;
  const fulfilmentRate = totalOrders ? Math.round((delivered / totalOrders) * 100) : 0;

  const paidRevenueEl = document.getElementById('analytics-paid-revenue');
  const aovEl = document.getElementById('analytics-aov');
  const fulfilEl = document.getElementById('analytics-fulfilment');
  if (paidRevenueEl) paidRevenueEl.textContent = money(paidRevenue);
  if (aovEl) aovEl.textContent = money(aov);
  if (fulfilEl) fulfilEl.textContent = `${fulfilmentRate}%`;

  const statusCounts = orders.reduce((acc, order) => {
    const s = String(order.status || 'placed').replaceAll('_', ' ');
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});
  const maxStatus = Math.max(...Object.values(statusCounts), 1);

  renderMetList('traffic-list', Object.entries(statusCounts).map(([name, count]) => ({
    name: name.replace(/\b\w/g, ch => ch.toUpperCase()),
    val: `${count} orders`,
    pct: Math.max(8, Math.round((count / maxStatus) * 100)),
    color: 'var(--red)'
  })));

  const productSales = {};
  orders.forEach(order => (order.items || []).forEach(item => {
    const name = item.name || 'Product';
    productSales[name] = (productSales[name] || 0) + Number(item.quantity || 1);
  }));
  const topProducts = Object.entries(productSales).sort((a,b) => b[1]-a[1]).slice(0,4);
  const maxQty = Math.max(...topProducts.map(([, qty]) => qty), 1);
  renderMetList('top-products-list', topProducts.length ? topProducts.map(([name, qty]) => ({
    name, val:`${qty} sold`, pct:Math.max(8, Math.round((qty / maxQty) * 100)), color:'var(--gold)'
  })) : [{ name:'No product sales yet', val:'Waiting for orders', pct:0, color:'var(--muted)' }]);

  const cityCounts = {};
  orders.forEach(order => {
    const city = order.shippingAddress?.city || order.shippingAddress?.state || 'Unknown';
    cityCounts[city] = (cityCounts[city] || 0) + 1;
  });
  const cities = Object.entries(cityCounts).sort((a,b) => b[1]-a[1]).slice(0,4);
  const maxCity = Math.max(...cities.map(([, count]) => count), 1);
  renderMetList('geo-list', cities.length ? cities.map(([city, count]) => ({
    name: city, val:`${count} orders`, pct:Math.max(8, Math.round((count / maxCity) * 100)), color:'var(--blue)'
  })) : [{ name:'No geography yet', val:'Waiting for orders', pct:0, color:'var(--muted)' }]);

  renderMetList('engagement-list', [
    { name:'Paid Orders', val:String(paidOrders.length), pct: totalOrders ? Math.round((paidOrders.length / totalOrders) * 100) : 0, color:'var(--green)' },
    { name:'Fulfilled Orders', val:String(delivered), pct:fulfilmentRate, color:'var(--gold)' },
    { name:'Products Listed', val:String((REAL_PRODUCTS || []).length), pct:(REAL_PRODUCTS || []).length ? 100 : 0, color:'var(--red)' },
    { name:'Low Stock Alerts', val:String((REAL_PRODUCTS || []).filter(p => Number(p.stock || 0) <= 10).length), pct:100, color:'var(--blue)' }
  ]);
}

function adminPhase9BindOrderFilters() {
  ['admin-order-status-filter','admin-order-time-filter','admin-order-search'].forEach(id => {
    const el = document.getElementById(id);
    if (!el || el.dataset.phase9Bound) return;
    el.dataset.phase9Bound = '1';
    el.addEventListener(id === 'admin-order-search' ? 'input' : 'change', () => renderOrders());
  });
}

document.addEventListener('DOMContentLoaded', () => {
  adminPhase9BindOrderFilters();
});

/* ══════════════════════════════════════
   HOME BRANDING — MARQUEE LOGO MANAGER
   Easy freestyle visual cropper
══════════════════════════════════════ */
const HOME_MARQUEE_API = 'https://paddox-backend.onrender.com/api/fan/admin/home-marquee-logos';
let ADMIN_HOME_LOGOS = [];
let HOME_LOGO_EDIT_ID = null;
let HOME_LOGO_SOURCE = '';
let HOME_LOGO_CROPPED = '';
let HOME_LOGO_IMG = null;
let HOME_LOGO_BIND_DONE = false;

let HOME_CROP = {
  x: 90,
  y: 90,
  w: 360,
  h: 150,
  zoom: 1,
  dragging: false,
  mode: '',
  startX: 0,
  startY: 0,
  ox: 0,
  oy: 0,
  ow: 0,
  oh: 0,
  imgBox: null
};

function homeLogoTokenHeaders() {
  const token = typeof getAdminToken === 'function' ? getAdminToken() : '';
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

function resetHomeLogoCrop() {
  const canvas = document.getElementById('home-logo-canvas');
  const w = canvas?.width || 880;
  const h = canvas?.height || 430;
  HOME_CROP = {
    ...HOME_CROP,
    x: Math.round(w * .30),
    y: Math.round(h * .30),
    w: Math.round(w * .40),
    h: Math.round(h * .22),
    zoom: Number(document.getElementById('home-crop-zoom')?.value || 100) / 100,
    dragging: false,
    mode: '',
    imgBox: null
  };
  drawHomeLogoCropCanvas();
}

function resetHomeLogoForm() {
  HOME_LOGO_EDIT_ID = null;
  HOME_LOGO_SOURCE = '';
  HOME_LOGO_CROPPED = '';
  HOME_LOGO_IMG = null;

  const set = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.value = value;
  };

  set('home-logo-name', '');
  set('home-logo-order', String((ADMIN_HOME_LOGOS || []).length + 1));
  set('home-logo-color', '#e8002d');
  set('home-crop-zoom', '100');

  const active = document.getElementById('home-logo-active');
  if (active) active.checked = true;

  const file = document.getElementById('home-logo-upload');
  if (file) file.value = '';

  const preview = document.getElementById('home-logo-preview');
  if (preview) preview.textContent = 'Preview';

  resetHomeLogoCrop();
  bindHomeLogoCropper();

  if (typeof switchPage === 'function') {
    document.querySelectorAll('.adm-page').forEach(p=>p.classList.remove('on'));
    document.querySelectorAll('.adm-nav-item').forEach(n=>n.classList.remove('on'));
    document.getElementById('adm-homebranding')?.classList.add('on');
    document.querySelector('.adm-nav-item[data-page="homebranding"]')?.classList.add('on');
    const titleEl = document.getElementById('adm-topbar-title');
    if (titleEl) titleEl.textContent = 'HOME BRANDING';
  }
}

async function loadHomeMarqueeLogosAdmin() {
  const tbody = document.getElementById('home-logos-tbody');
  if (tbody) tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:30px;color:#777">Loading marquee logos…</td></tr>';

  try {
    const res = await fetch(HOME_MARQUEE_API, { headers: homeLogoTokenHeaders() });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) throw new Error(data.message || 'Failed to load logos');

    ADMIN_HOME_LOGOS = data.data?.logos || data.logos || [];
    renderHomeLogosAdmin();
    bindHomeLogoCropper();

  } catch (err) {
    console.error(err);
    if (tbody) tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:30px;color:#777">Could not load marquee logos</td></tr>';
    if (typeof showToast === 'function') showToast('❌ Failed to load marquee logos');
  }
}

function renderHomeLogosAdmin() {
  const tbody = document.getElementById('home-logos-tbody');
  if (!tbody) return;

  const q = String(document.getElementById('home-logo-search')?.value || '').toLowerCase().trim();
  const list = (ADMIN_HOME_LOGOS || [])
    .filter(item => !q || String(item.name || '').toLowerCase().includes(q))
    .sort((a,b) => Number(a.order || 0) - Number(b.order || 0));

  if (!list.length) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:36px;color:#777">No marquee logos added yet</td></tr>';
    return;
  }

  tbody.innerHTML = list.map(item => `
    <tr>
      <td><div class="hb-mini-logo"><img src="${item.image || ''}" alt="${item.name || 'Logo'}"/></div></td>
      <td><strong>${item.name || 'Logo'}</strong><div style="color:#777;font-size:.75rem">${item.slug || ''}</div></td>
      <td>${Number(item.order || 0)}</td>
      <td><span class="hb-status ${item.isActive === false ? 'off' : 'on'}">${item.isActive === false ? 'Hidden' : 'Active'}</span></td>
      <td>
        <div class="hb-actions">
          <button onclick="editHomeMarqueeLogo('${item._id}')">Edit</button>
          <button class="danger" onclick="deleteHomeMarqueeLogo('${item._id}', '${String(item.name || 'logo').replace(/'/g, '')}')">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function editHomeMarqueeLogo(id) {
  const item = (ADMIN_HOME_LOGOS || []).find(x => String(x._id) === String(id));
  if (!item) return;

  HOME_LOGO_EDIT_ID = item._id;
  HOME_LOGO_SOURCE = item.image || '';
  HOME_LOGO_CROPPED = item.image || '';

  const set = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.value = value;
  };

  set('home-logo-name', item.name || '');
  set('home-logo-order', Number(item.order || 0));
  set('home-logo-color', item.color || '#e8002d');
  set('home-crop-zoom', '100');

  const active = document.getElementById('home-logo-active');
  if (active) active.checked = item.isActive !== false;

  const preview = document.getElementById('home-logo-preview');
  if (preview) preview.innerHTML = item.image ? `<img src="${item.image}" alt="${item.name || 'Logo'}"/>` : 'Preview';

  loadHomeLogoImage(item.image || '');
  if (typeof showToast === 'function') showToast('✏️ Logo loaded for editing');
}

function loadHomeLogoImage(src) {
  if (!src) {
    HOME_LOGO_IMG = null;
    drawHomeLogoCropCanvas();
    return;
  }

  const img = new Image();
  img.onload = () => {
    HOME_LOGO_IMG = img;
    resetHomeLogoCrop();
    cropHomeLogoPreview(false);
  };
  img.onerror = () => {
    HOME_LOGO_IMG = null;
    drawHomeLogoCropCanvas();
  };
  img.src = src;
}

function getHomeCropCanvasPoint(event) {
  const canvas = document.getElementById('home-logo-canvas');
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * (canvas.width / rect.width),
    y: (event.clientY - rect.top) * (canvas.height / rect.height)
  };
}

function homeCropHitMode(px, py) {
  const { x, y, w, h } = HOME_CROP;
  const handle = 18;
  const nearLeft = Math.abs(px - x) <= handle;
  const nearRight = Math.abs(px - (x + w)) <= handle;
  const nearTop = Math.abs(py - y) <= handle;
  const nearBottom = Math.abs(py - (y + h)) <= handle;

  if (nearLeft && nearTop) return 'nw';
  if (nearRight && nearTop) return 'ne';
  if (nearLeft && nearBottom) return 'sw';
  if (nearRight && nearBottom) return 'se';
  if (px >= x && px <= x + w && py >= y && py <= y + h) return 'move';
  return 'new';
}

function bindHomeLogoCropper() {
  const canvas = document.getElementById('home-logo-canvas');
  if (!canvas || HOME_LOGO_BIND_DONE) return;
  HOME_LOGO_BIND_DONE = true;

  canvas.addEventListener('pointerdown', event => {
    if (!HOME_LOGO_IMG) return;
    canvas.setPointerCapture(event.pointerId);
    const p = getHomeCropCanvasPoint(event);
    HOME_CROP.dragging = true;
    HOME_CROP.mode = homeCropHitMode(p.x, p.y);
    HOME_CROP.startX = p.x;
    HOME_CROP.startY = p.y;
    HOME_CROP.ox = HOME_CROP.x;
    HOME_CROP.oy = HOME_CROP.y;
    HOME_CROP.ow = HOME_CROP.w;
    HOME_CROP.oh = HOME_CROP.h;

    if (HOME_CROP.mode === 'new') {
      HOME_CROP.x = p.x;
      HOME_CROP.y = p.y;
      HOME_CROP.w = 1;
      HOME_CROP.h = 1;
    }
    drawHomeLogoCropCanvas();
  });

  canvas.addEventListener('pointermove', event => {
    if (!HOME_LOGO_IMG) return;
    const p = getHomeCropCanvasPoint(event);

    if (!HOME_CROP.dragging) {
      canvas.style.cursor =
        homeCropHitMode(p.x, p.y) === 'move' ? 'move' :
        ['nw','se'].includes(homeCropHitMode(p.x, p.y)) ? 'nwse-resize' :
        ['ne','sw'].includes(homeCropHitMode(p.x, p.y)) ? 'nesw-resize' :
        'crosshair';
      return;
    }

    const dx = p.x - HOME_CROP.startX;
    const dy = p.y - HOME_CROP.startY;
    const minW = 60;
    const minH = 40;
    const maxW = canvas.width;
    const maxH = canvas.height;

    if (HOME_CROP.mode === 'move') {
      HOME_CROP.x = Math.max(0, Math.min(maxW - HOME_CROP.ow, HOME_CROP.ox + dx));
      HOME_CROP.y = Math.max(0, Math.min(maxH - HOME_CROP.oh, HOME_CROP.oy + dy));
    } else if (HOME_CROP.mode === 'new') {
      HOME_CROP.x = Math.min(HOME_CROP.startX, p.x);
      HOME_CROP.y = Math.min(HOME_CROP.startY, p.y);
      HOME_CROP.w = Math.abs(p.x - HOME_CROP.startX);
      HOME_CROP.h = Math.abs(p.y - HOME_CROP.startY);
    } else {
      let x = HOME_CROP.ox;
      let y = HOME_CROP.oy;
      let w = HOME_CROP.ow;
      let h = HOME_CROP.oh;

      if (HOME_CROP.mode.includes('e')) w = HOME_CROP.ow + dx;
      if (HOME_CROP.mode.includes('s')) h = HOME_CROP.oh + dy;
      if (HOME_CROP.mode.includes('w')) { x = HOME_CROP.ox + dx; w = HOME_CROP.ow - dx; }
      if (HOME_CROP.mode.includes('n')) { y = HOME_CROP.oy + dy; h = HOME_CROP.oh - dy; }

      if (w < minW) { if (HOME_CROP.mode.includes('w')) x -= minW - w; w = minW; }
      if (h < minH) { if (HOME_CROP.mode.includes('n')) y -= minH - h; h = minH; }

      HOME_CROP.x = Math.max(0, Math.min(maxW - minW, x));
      HOME_CROP.y = Math.max(0, Math.min(maxH - minH, y));
      HOME_CROP.w = Math.max(minW, Math.min(maxW - HOME_CROP.x, w));
      HOME_CROP.h = Math.max(minH, Math.min(maxH - HOME_CROP.y, h));
    }

    drawHomeLogoCropCanvas();
  });

  const endDrag = () => {
    if (!HOME_CROP.dragging) return;
    HOME_CROP.dragging = false;
    cropHomeLogoPreview(false);
    drawHomeLogoCropCanvas();
  };

  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);
  canvas.addEventListener('pointerleave', () => {
    if (HOME_CROP.dragging) return;
    canvas.style.cursor = 'crosshair';
  });
}

function drawHomeLogoCropCanvas() {
  const canvas = document.getElementById('home-logo-canvas');
  if (!canvas) return;

  bindHomeLogoCropper();

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0,0,canvas.width,canvas.height);

  const bg = ctx.createLinearGradient(0,0,canvas.width,canvas.height);
  bg.addColorStop(0, '#050505');
  bg.addColorStop(1, '#111');
  ctx.fillStyle = bg;
  ctx.fillRect(0,0,canvas.width,canvas.height);

  ctx.strokeStyle = 'rgba(255,255,255,.06)';
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 44) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 44) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  if (!HOME_LOGO_IMG) {
    ctx.fillStyle = '#999';
    ctx.font = '26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Upload a logo sheet or single logo', canvas.width/2, canvas.height/2 - 8);
    ctx.fillStyle = '#666';
    ctx.font = '16px sans-serif';
    ctx.fillText('Then drag and resize the red crop box visually', canvas.width/2, canvas.height/2 + 24);
    return;
  }

  const img = HOME_LOGO_IMG;
  const zoom = Number(document.getElementById('home-crop-zoom')?.value || 100) / 100;
  HOME_CROP.zoom = zoom;

  const fit = Math.min(canvas.width / img.width, canvas.height / img.height) * zoom;
  const dw = img.width * fit;
  const dh = img.height * fit;
  const dx = (canvas.width - dw) / 2;
  const dy = (canvas.height - dh) / 2;
  HOME_CROP.imgBox = { dx, dy, dw, dh, fit };

  ctx.drawImage(img, dx, dy, dw, dh);

  const { x, y, w, h } = HOME_CROP;

  ctx.fillStyle = 'rgba(0,0,0,.56)';
  ctx.fillRect(0,0,canvas.width,y);
  ctx.fillRect(0,y,x,h);
  ctx.fillRect(x+w,y,canvas.width-(x+w),h);
  ctx.fillRect(0,y+h,canvas.width,canvas.height-(y+h));

  ctx.strokeStyle = '#e8002d';
  ctx.lineWidth = 4;
  ctx.strokeRect(x, y, w, h);

  ctx.fillStyle = 'rgba(232,0,45,.98)';
  ctx.fillRect(x, Math.max(0, y-30), 158, 30);
  ctx.fillStyle = '#fff';
  ctx.font = '700 13px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('SELECTED LOGO', x+12, Math.max(20, y-10));

  const handles = [
    [x,y], [x+w,y], [x,y+h], [x+w,y+h]
  ];
  handles.forEach(([hx, hy]) => {
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#e8002d';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(hx, hy, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });
}

function cropHomeLogoPreview(showToastMessage = true) {
  if (!HOME_LOGO_IMG) {
    if (showToastMessage && typeof showToast === 'function') showToast('Upload an image first');
    return;
  }

  const img = HOME_LOGO_IMG;
  const canvas = document.getElementById('home-logo-canvas');
  if (!canvas) return;

  const box = HOME_CROP.imgBox;
  if (!box) {
    drawHomeLogoCropCanvas();
    return;
  }

  const crop = {
    x: Math.max(HOME_CROP.x, box.dx),
    y: Math.max(HOME_CROP.y, box.dy),
    r: Math.min(HOME_CROP.x + HOME_CROP.w, box.dx + box.dw),
    b: Math.min(HOME_CROP.y + HOME_CROP.h, box.dy + box.dh)
  };

  const visibleW = crop.r - crop.x;
  const visibleH = crop.b - crop.y;

  if (visibleW < 8 || visibleH < 8) {
    if (showToastMessage && typeof showToast === 'function') showToast('Move crop box over the logo');
    return;
  }

  const sx = (crop.x - box.dx) / box.fit;
  const sy = (crop.y - box.dy) / box.fit;
  const sw = visibleW / box.fit;
  const sh = visibleH / box.fit;

  const out = document.createElement('canvas');
  out.width = 760;
  out.height = 280;

  const octx = out.getContext('2d');
  octx.clearRect(0,0,out.width,out.height);
  octx.fillStyle = '#050505';
  octx.fillRect(0,0,out.width,out.height);

  const outFit = Math.min(out.width / sw, out.height / sh) * .88;
  const dw = sw * outFit;
  const dh = sh * outFit;
  const dx = (out.width - dw) / 2;
  const dy = (out.height - dh) / 2;

  octx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);

  HOME_LOGO_CROPPED = out.toDataURL('image/png', .94);

  const preview = document.getElementById('home-logo-preview');
  if (preview) preview.innerHTML = `<img src="${HOME_LOGO_CROPPED}" alt="Logo preview"/>`;

  if (showToastMessage && typeof showToast === 'function') showToast('✓ Crop preview ready');
}

async function saveHomeMarqueeLogo() {
  const name = String(document.getElementById('home-logo-name')?.value || '').trim();
  if (!name) {
    if (typeof showToast === 'function') showToast('Enter team/brand name');
    return;
  }

  if (HOME_LOGO_IMG) cropHomeLogoPreview(false);

  if (!HOME_LOGO_CROPPED) {
    if (HOME_LOGO_SOURCE) HOME_LOGO_CROPPED = HOME_LOGO_SOURCE;
    else {
      if (typeof showToast === 'function') showToast('Upload and crop logo first');
      return;
    }
  }

  const payload = {
    name,
    image: HOME_LOGO_CROPPED,
    order: Number(document.getElementById('home-logo-order')?.value || 0),
    color: String(document.getElementById('home-logo-color')?.value || '#e8002d').trim(),
    isActive: !!document.getElementById('home-logo-active')?.checked,
  };

  try {
    const res = await fetch(HOME_LOGO_EDIT_ID ? `${HOME_MARQUEE_API}/${HOME_LOGO_EDIT_ID}` : HOME_MARQUEE_API, {
      method: HOME_LOGO_EDIT_ID ? 'PUT' : 'POST',
      headers: homeLogoTokenHeaders(),
      body: JSON.stringify(payload)
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) throw new Error(data.message || 'Save failed');

    if (typeof showToast === 'function') showToast('✓ Marquee logo saved');
    resetHomeLogoForm();
    loadHomeMarqueeLogosAdmin();

  } catch (err) {
    console.error(err);
    if (typeof showToast === 'function') showToast(`❌ ${err.message}`);
  }
}

async function deleteHomeMarqueeLogo(id, name = 'logo') {
  if (!confirm(`Delete ${name} from home marquee?`)) return;

  try {
    const res = await fetch(`${HOME_MARQUEE_API}/${id}`, { method:'DELETE', headers: homeLogoTokenHeaders() });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) throw new Error(data.message || 'Delete failed');

    if (typeof showToast === 'function') showToast('✓ Marquee logo deleted');
    loadHomeMarqueeLogosAdmin();

  } catch (err) {
    console.error(err);
    if (typeof showToast === 'function') showToast(`❌ ${err.message}`);
  }
}

document.addEventListener('input', e => {
  if (e.target?.id === 'home-crop-zoom') {
    drawHomeLogoCropCanvas();
    cropHomeLogoPreview(false);
  }
  if (e.target?.id === 'home-logo-search') renderHomeLogosAdmin();
});

document.addEventListener('change', e => {
  if (e.target?.id !== 'home-logo-upload') return;

  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    HOME_LOGO_SOURCE = String(reader.result || '');
    HOME_LOGO_CROPPED = '';
    loadHomeLogoImage(HOME_LOGO_SOURCE);
  };
  reader.readAsDataURL(file);
});



/* ══════════════════════════════════════
   FAN POLLS ADMIN MANAGER — Phase 17.6
   Realtime MongoDB polls + Home Branding logo dropdown
══════════════════════════════════════ */
const FAN_POLLS_ADMIN_API = 'https://paddox-backend.onrender.com/api/fan/admin/polls';
let ADMIN_FAN_POLLS = [];
let ADMIN_POLL_LOGOS = [];
let ADMIN_POLL_LOGOS_LOADED = false;


function pollTeamBadgeSvgURI(name = 'Team', color = '#e8002d', code = '') {
  const safeName = String(name || 'Team').replace(/[&<>"']/g, '');
  const safeColor = String(color || '#e8002d').match(/^#[0-9a-fA-F]{3,8}$/) ? color : '#e8002d';
  const initials = String(code || safeName)
    .replace(/F1|TEAM|RACING|FORMULA|SCUDERIA|ORACLE|PETRONAS|AMG|HP/gi, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map(w => w[0])
    .join('')
    .slice(0, 3)
    .toUpperCase() || 'PX';

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="#1b1b1f"/>
          <stop offset="1" stop-color="#050505"/>
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="${safeColor}" flood-opacity="0.28"/>
        </filter>
      </defs>
      <rect x="6" y="6" width="84" height="84" rx="18" fill="url(#g)" stroke="rgba(255,255,255,.22)" stroke-width="2"/>
      <path d="M19 66 H77" stroke="${safeColor}" stroke-width="5" stroke-linecap="round"/>
      <path d="M24 28 H72" stroke="${safeColor}" stroke-width="3" stroke-linecap="round" opacity=".55"/>
      <text x="48" y="56" text-anchor="middle" font-family="Arial Black,Impact,sans-serif" font-size="24" letter-spacing="2" fill="#fff" filter="url(#shadow)">${initials}</text>
    </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function pollLogoLooksBroken(url = '') {
  const u = String(url || '').trim().toLowerCase();
  if (!u) return true;
  return u.includes('media.formula1.com/content/dam/fom-website/teams/2026') ||
    u.includes('logo.clearbit.com') ||
    u.includes('wikimedia.org') ||
    u.includes('wikipedia.org') ||
    u.endsWith('/undefined') ||
    u.includes('undefined');
}

function isFormula1OfficialLogo(url = '') {
  const u = String(url || '').trim().toLowerCase();
  return u.startsWith('https://media.formula1.com/image/upload/') && u.includes('/common/f1/');
}



/* Phase 17.6.4 — real team logo resolver
   Priority: Home Branding uploaded logo -> official/public site logo -> PADDOX fallback badge. */
const ADMIN_POLL_REAL_TEAM_LOGOS = [
  { name:'Mercedes', slug:'mercedes', aliases:['mercedes', 'mercedes-amg', 'mercedes amg', 'kimi', 'george', 'russell', 'antonelli'], color:'#00d2be', image:'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2025/mercedes/2025mercedeslogowhite.webp' },
  { name:'Ferrari', slug:'ferrari', aliases:['ferrari', 'scuderia ferrari', 'charles', 'leclerc', 'lewis', 'hamilton'], color:'#e8002d', image:'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2025/ferrari/2025ferrarilogolight.webp' },
  { name:'McLaren', slug:'mclaren', aliases:['mclaren', 'mclaren racing', 'mclaren f1', 'lando', 'norris', 'oscar', 'piastri'], color:'#ff8700', image:'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2025/mclaren/2025mclarenlogowhite.webp' },
  { name:'Red Bull Racing', slug:'red-bull', aliases:['red bull', 'red bull racing', 'oracle red bull', 'verstappen', 'max', 'hadjar', 'isack'], color:'#1e5bff', image:'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2025/redbullracing/2025redbullracinglogowhite.webp' },
  { name:'Alpine', slug:'alpine', aliases:['alpine', 'bwt alpine', 'gasly', 'pierre', 'colapinto', 'franco'], color:'#2293d1', image:'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2025/alpine/2025alpinelogowhite.webp' },
  { name:'Racing Bulls', slug:'racing-bulls', aliases:['racing bulls', 'visa cash app rb', 'vcarb', 'rb', 'lawson', 'liam', 'lindblad', 'arvid'], color:'#6c4cff', image:'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2025/racingbulls/2025racingbullslogowhite.webp' },
  { name:'Haas F1 Team', slug:'haas', aliases:['haas', 'haas f1', 'haas f1 team', 'tgr haas', 'ocon', 'esteban', 'bearman', 'oliver'], color:'#ffffff', image:'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2025/haas/2025haaslogowhite.webp' },
  { name:'Williams', slug:'williams', aliases:['williams', 'williams racing', 'atlassian williams', 'albon', 'alexander', 'sainz', 'carlos'], color:'#64c4ff', image:'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2025/williams/2025williamslogowhite.webp' },
  { name:'Audi', slug:'audi', aliases:['audi', 'audi revolut', 'kick sauber', 'sauber', 'hulkenberg', 'nico', 'bortoleto', 'gabriel'], color:'#00e701', image:'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2026/audi/2026audilogowhite.webp' },
  { name:'Cadillac', slug:'cadillac', aliases:['cadillac', 'cadillac f1', 'cadillac formula 1', 'perez', 'sergio', 'bottas', 'valtteri'], color:'#d4af37', image:'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2026/cadillac/2026cadillaclogowhite.webp' },
  { name:'Aston Martin', slug:'aston-martin', aliases:['aston martin', 'aston martin aramco', 'alonso', 'fernando', 'stroll', 'lance'], color:'#006f62', image:'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2025/astonmartin/2025astonmartinlogowhite.webp' }
];

function adminPollTeamKey(value = '') {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function findRealAdminPollTeam(value = '') {
  const key = adminPollTeamKey(value);
  if (!key) return null;
  return ADMIN_POLL_REAL_TEAM_LOGOS.find(team => {
    const names = [team.name, team.slug, ...(team.aliases || [])];
    return names.some(name => {
      const n = adminPollTeamKey(name);
      return key === n || key.includes(n) || n.includes(key);
    });
  }) || null;
}

function isGeneratedPollBadge(url = '') {
  const u = String(url || '');
  return u.startsWith('data:image/svg+xml') && (u.includes('%3Ctext') || u.includes('<text'));
}

function officialAdminPollLogoFor(name = '', key = '') {
  const found = findRealAdminPollTeam(key) || findRealAdminPollTeam(name);
  return found ? found.image : '';
}

function resolveAdminPollLogoImage(rawLogo = '', name = '', key = '', color = '#e8002d') {
  const official = officialAdminPollLogoFor(name, key);

  // Phase 17.6.6: use Formula1.com logo assets only for F1 teams.
  // This replaces old Wikmedia/Clearbit/generated badge URLs even for already-saved polls.
  if (official) return official;

  if (!rawLogo || pollLogoLooksBroken(rawLogo) || isGeneratedPollBadge(rawLogo)) {
    return pollTeamBadgeSvgURI(name || key || 'Team', color, key || name);
  }
  return isFormula1OfficialLogo(rawLogo) ? rawLogo : pollTeamBadgeSvgURI(name || key || 'Team', color, key || name);
}
const ADMIN_POLL_FALLBACK_LOGOS = ADMIN_POLL_REAL_TEAM_LOGOS.map(team => ({
  name: team.name,
  slug: team.slug,
  color: team.color,
  image: team.image
})).concat([
  { name:'PADDOX', slug:'paddox', color:'#e8002d', image:'assets/paddox-logo-icon.png' }
]);

function pollAdminHeaders(json = false) {
  return {
    ...(json ? { 'Content-Type': 'application/json' } : {}),
    ...(getAdminToken() ? { Authorization: `Bearer ${getAdminToken()}` } : {})
  };
}

function setPollAdminStatus(message = '') {
  const el = document.getElementById('poll-admin-status');
  if (el) el.textContent = message;
}

function escapeAdminText(value='') {
  return String(value).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}

function pollLogoKey(value = '') {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function normalizeAdminPollLogo(item = {}) {
  const name = String(item.name || item.teamName || item.label || 'Team').trim();
  let image = String(item.image || item.logo || item.teamLogo || '').trim();
  const color = String(item.color || item.teamColor || '#e8002d').trim();
  const slug = String(item.slug || item.logoKey || pollLogoKey(name)).trim();
  const realTeam = findRealAdminPollTeam(slug) || findRealAdminPollTeam(name);
  const finalColor = realTeam?.color || color;
  image = resolveAdminPollLogoImage(image, name, slug, finalColor);

  return { name: realTeam?.name || name, image, color: finalColor, slug: realTeam?.slug || slug };
}

async function loadFanPollLogoOptions(force = false) {
  if (ADMIN_POLL_LOGOS_LOADED && !force) return ADMIN_POLL_LOGOS;

  /* Phase 17.6.5
     Always show all 11 current F1 teams in the dropdown.
     If Home Branding has a matching uploaded logo, use it.
     Otherwise use the real team logo URL from the fixed team list.
  */
  const officialTeams = ADMIN_POLL_FALLBACK_LOGOS.map(normalizeAdminPollLogo);

  try {
    const publicApi = 'https://paddox-backend.onrender.com/api/fan/home-marquee-logos';
    const adminApi = typeof HOME_MARQUEE_API !== 'undefined'
      ? HOME_MARQUEE_API
      : 'https://paddox-backend.onrender.com/api/fan/admin/home-marquee-logos';

    let logos = [];

    const publicRes = await fetch(publicApi);
    const publicData = await publicRes.json().catch(() => ({}));
    logos = publicData.data?.logos || publicData.logos || [];

    if (!Array.isArray(logos) || !logos.length) {
      const adminRes = await fetch(adminApi, { headers: pollAdminHeaders() });
      const adminData = await adminRes.json().catch(() => ({}));
      logos = adminData.data?.logos || adminData.logos || [];
    }

    const homeLogos = Array.isArray(logos)
      ? logos.map(normalizeAdminPollLogo)
      : [];

    ADMIN_POLL_LOGOS = officialTeams.map(team => {
      const home = homeLogos.find(item =>
        pollLogoKey(item.slug) === pollLogoKey(team.slug) ||
        pollLogoKey(item.name) === pollLogoKey(team.name)
      );

      const homeHasRealImage = home?.image && !pollLogoLooksBroken(home.image) && !isGeneratedPollBadge(home.image);

      return homeHasRealImage
        ? { ...team, image: home.image, color: home.color || team.color }
        : team;
    });

  } catch (err) {
    console.warn('Using fixed F1 poll logos', err);
    ADMIN_POLL_LOGOS = officialTeams;
  }

  ADMIN_POLL_LOGOS_LOADED = true;
  refreshPollOptionLogoSelects();
  return ADMIN_POLL_LOGOS;
}

function pollLogoOptionsHTML(selected = '') {
  const selectedKey = pollLogoKey(selected);
  const logos = ADMIN_POLL_LOGOS.length
    ? ADMIN_POLL_LOGOS
    : ADMIN_POLL_FALLBACK_LOGOS.map(normalizeAdminPollLogo);

  return `
    <option value="">No logo</option>
    ${logos.map(item => {
      const key = item.slug || pollLogoKey(item.name);
      return `<option value="${escapeAdminText(key)}" ${selectedKey === pollLogoKey(key) ? 'selected' : ''}>${escapeAdminText(item.name)}</option>`;
    }).join('')}
  `;
}

function findPollLogoByKey(key = '') {
  const clean = pollLogoKey(key);
  return (ADMIN_POLL_LOGOS.length ? ADMIN_POLL_LOGOS : ADMIN_POLL_FALLBACK_LOGOS.map(normalizeAdminPollLogo))
    .find(item => pollLogoKey(item.slug) === clean || pollLogoKey(item.name) === clean) || null;
}

function updatePollLogoPreview(row) {
  if (!row) return;

  const select = row.querySelector('.poll-logo-select');
  const preview = row.querySelector('.poll-logo-preview');
  const selected = findPollLogoByKey(select?.value || '');

  if (!preview) return;

  if (selected?.image) {
    const fallback = pollTeamBadgeSvgURI(selected.name, selected.color || '#e8002d', selected.slug || selected.name);
    const logo = resolveAdminPollLogoImage(selected.image, selected.name, selected.slug, selected.color || '#e8002d');
    preview.innerHTML = `<img src="${escapeAdminText(logo)}" alt="${escapeAdminText(selected.name)}" referrerpolicy="no-referrer" onerror="this.src='${escapeAdminText(fallback)}';this.onerror=null;">`;
  } else {
    preview.innerHTML = '<span>PX</span>';
  }

  preview.style.setProperty('--poll-admin-color', selected?.color || '#e8002d');
}


function adminPollMiniLogoHTML(option = {}) {
  const labelText = option.teamName || option.label || option.text || 'Team';
  const color = option.teamColor || '#e8002d';
  const rawLogo = String(option.logo || option.teamLogo || option.image || '').trim();
  const code = option.logoKey || option.teamName || option.label || option.text || 'PX';
  const realTeam = findRealAdminPollTeam(option.logoKey || option.teamName || option.label || option.text || '');
  const finalName = realTeam?.name || labelText;
  const finalColor = realTeam?.color || color;
  const logo = resolveAdminPollLogoImage(rawLogo, finalName, option.logoKey || option.teamName || option.label || option.text || '', finalColor);
  const fallback = pollTeamBadgeSvgURI(finalName, finalColor, option.logoKey || finalName);

  return `<img src="${escapeAdminText(logo || fallback)}" alt="${escapeAdminText(finalName)}" referrerpolicy="no-referrer" onerror="this.src='${escapeAdminText(fallback)}';this.onerror=null;">`;
}

function refreshPollOptionLogoSelects() {
  document.querySelectorAll('.poll-logo-select').forEach(select => {
    const current = select.value;
    select.innerHTML = pollLogoOptionsHTML(current);
    updatePollLogoPreview(select.closest('.poll-admin-option-row'));
  });
}

function addFanPollOption(value = '', logoKey = '') {
  const wrap = document.getElementById('poll-options-admin');
  if (!wrap) return;

  const row = document.createElement('div');
  row.className = 'poll-admin-option-row';
  row.innerHTML = `
    <div class="poll-admin-logo-cell">
      <div class="poll-logo-preview"><span>PX</span></div>
      <select class="adm-input poll-logo-select" onchange="updatePollLogoPreview(this.closest('.poll-admin-option-row'))">
        ${pollLogoOptionsHTML(logoKey)}
      </select>
    </div>
    <input class="adm-input poll-option-input" type="text" placeholder="Poll option" value="${escapeAdminText(value)}"/>
    <button type="button" class="adm-btn-ghost danger" onclick="this.closest('.poll-admin-option-row').remove()">Remove</button>
  `;

  wrap.appendChild(row);
  updatePollLogoPreview(row);
  loadFanPollLogoOptions();
}

function resetFanPollForm(clear = true) {
  const ids = ['poll-edit-id','poll-question'];
  ids.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });

  const active = document.getElementById('poll-active');
  const reset = document.getElementById('poll-reset-votes');
  if (active) active.checked = true;
  if (reset) reset.checked = false;

  const wrap = document.getElementById('poll-options-admin');
  if (wrap) {
    wrap.innerHTML = '';
    addFanPollOption('');
    addFanPollOption('');
  }

  loadFanPollLogoOptions();
  if (clear) setPollAdminStatus('Create a live Fan Hub poll with 2–5 options and optional team logos.');
}

async function loadFanPollsAdmin() {
  const tbody = document.getElementById('fan-polls-tbody');

  if (tbody) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:30px;color:#777">Loading polls…</td></tr>';
  }

  await loadFanPollLogoOptions();

  try {
    const res = await fetch(FAN_POLLS_ADMIN_API, { headers: pollAdminHeaders() });
    const data = await res.json().catch(() => ({}));

    if (!res.ok || data.success === false) {
      throw new Error(data.message || 'Poll admin API unavailable');
    }

    ADMIN_FAN_POLLS = data.data?.polls || data.polls || data.data || [];
    renderFanPollsAdmin();
    setPollAdminStatus('Poll manager connected. Active poll reflects on Fan Hub.');

  } catch (err) {
    console.warn(err);
    ADMIN_FAN_POLLS = [];

    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:34px;color:#777">${escapeAdminText(err.message)}. Check backend route /api/fan/admin/polls.</td></tr>`;
    }

    setPollAdminStatus('Backend endpoint expected: /api/fan/admin/polls');
  }
}

function renderFanPollsAdmin() {
  const tbody = document.getElementById('fan-polls-tbody');
  if (!tbody) return;

  const q = String(document.getElementById('poll-search-admin')?.value || '').toLowerCase().trim();
  const list = ADMIN_FAN_POLLS.filter(p => !q || String(p.question || '').toLowerCase().includes(q));

  if (!list.length) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:36px;color:#777">No polls created yet</td></tr>';
    return;
  }

  tbody.innerHTML = list.map(p => {
    const opts = Array.isArray(p.options) ? p.options : [];
    const total = opts.reduce((s,o)=>s+Number(o.votes||0),0);

    return `
      <tr>
        <td style="max-width:360px"><strong>${escapeAdminText(p.question || 'Untitled poll')}</strong></td>
        <td>
          <div class="poll-admin-table-options">
            ${opts.map(o => `
              <span class="poll-admin-mini-option">
                ${adminPollMiniLogoHTML(o)}
                <span>${escapeAdminText(o.label || o.text || '')}</span>
              </span>
            `).join('')}
          </div>
        </td>
        <td>${total.toLocaleString('en-IN')}</td>
        <td><span class="sb ${p.isActive !== false ? 's-ok' : 's-pr'}">${p.isActive !== false ? 'Active' : 'Inactive'}</span></td>
        <td>
          <button class="act-btn" onclick="editFanPollAdmin('${p._id || p.id}')">Edit</button>
          <button class="act-btn" onclick="setFanPollActive('${p._id || p.id}')">Set Active</button>
          <button class="act-btn danger" onclick="deleteFanPollAdmin('${p._id || p.id}')">Delete</button>
        </td>
      </tr>`;
  }).join('');
}

function editFanPollAdmin(id) {
  const poll = ADMIN_FAN_POLLS.find(p => String(p._id || p.id) === String(id));
  if (!poll) return;

  document.getElementById('poll-edit-id').value = poll._id || poll.id || '';
  document.getElementById('poll-question').value = poll.question || '';

  const active = document.getElementById('poll-active');
  const reset = document.getElementById('poll-reset-votes');
  if (active) active.checked = poll.isActive !== false;
  if (reset) reset.checked = false;

  const wrap = document.getElementById('poll-options-admin');
  if (wrap) {
    wrap.innerHTML = '';
    (poll.options || []).forEach(o => addFanPollOption(
      o.label || o.text || '',
      o.logoKey || o.slug || o.teamName || ''
    ));
  }

  setPollAdminStatus('Editing existing poll.');
}

function collectFanPollOptions() {
  return [...document.querySelectorAll('.poll-admin-option-row')]
    .map(row => {
      const label = String(row.querySelector('.poll-option-input')?.value || '').trim();
      const logoKey = String(row.querySelector('.poll-logo-select')?.value || '').trim();
      const logo = findPollLogoByKey(logoKey);

      if (!label) return null;

      const realTeam = findRealAdminPollTeam(logoKey) || findRealAdminPollTeam(logo?.name || '');
      const teamName = realTeam?.name || logo?.name || '';
      const teamColor = realTeam?.color || logo?.color || '#e8002d';
      const teamLogo = resolveAdminPollLogoImage(logo?.image || '', teamName, logoKey, teamColor);
      return {
        label,
        logoKey: realTeam?.slug || logoKey,
        logo: teamLogo,
        teamName,
        teamColor
      };
    })
    .filter(Boolean)
    .slice(0, 5);
}

async function saveFanPollAdmin() {
  try {
    const id = String(document.getElementById('poll-edit-id')?.value || '').trim();
    const question = String(document.getElementById('poll-question')?.value || '').trim();
    const options = collectFanPollOptions();

    if (!question) throw new Error('Poll question is required');
    if (options.length < 2) throw new Error('Add at least 2 options');

    setPollAdminStatus('Saving poll…');

    const payload = {
      question,
      options,
      isActive: !!document.getElementById('poll-active')?.checked,
      resetVotes: !!document.getElementById('poll-reset-votes')?.checked
    };

    const res = await fetch(id ? `${FAN_POLLS_ADMIN_API}/${encodeURIComponent(id)}` : FAN_POLLS_ADMIN_API, {
      method: id ? 'PUT' : 'POST',
      headers: pollAdminHeaders(true),
      body: JSON.stringify(payload)
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || data.success === false) {
      throw new Error(data.message || 'Could not save poll');
    }

    showToast('Poll saved');
    resetFanPollForm(false);
    loadFanPollsAdmin();

  } catch (err) {
    console.error(err);
    showToast(`${err.message}`);
    setPollAdminStatus(err.message);
  }
}

async function setFanPollActive(id) {
  try {
    const res = await fetch(`${FAN_POLLS_ADMIN_API}/${encodeURIComponent(id)}/active`, {
      method:'PUT',
      headers: pollAdminHeaders(true),
      body: JSON.stringify({ isActive:true })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || data.success === false) {
      throw new Error(data.message || 'Could not activate poll');
    }

    showToast('Active poll updated');
    loadFanPollsAdmin();

  } catch (err) {
    showToast(`${err.message}`);
  }
}

async function deleteFanPollAdmin(id) {
  if (!confirm('Delete this poll?')) return;

  try {
    const res = await fetch(`${FAN_POLLS_ADMIN_API}/${encodeURIComponent(id)}`, {
      method:'DELETE',
      headers: pollAdminHeaders()
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || data.success === false) {
      throw new Error(data.message || 'Could not delete poll');
    }

    showToast('Poll deleted');
    loadFanPollsAdmin();

  } catch (err) {
    showToast(`${err.message}`);
  }
}

document.addEventListener('input', e => {
  if (e.target?.id === 'poll-search-admin') renderFanPollsAdmin();
});



/* ══════════════════════════════════════
   FAN TRIVIA ADMIN MANAGER — Phase 17.8
   Admin-controlled MongoDB trivia questions
══════════════════════════════════════ */
const FAN_TRIVIA_ADMIN_API = 'https://paddox-backend.onrender.com/api/fan/admin/trivia';
let ADMIN_FAN_TRIVIA = [];

function triviaAdminHeaders(json = false) {
  return {
    ...(json ? { 'Content-Type': 'application/json' } : {}),
    ...(getAdminToken() ? { Authorization: `Bearer ${getAdminToken()}` } : {})
  };
}

function setTriviaAdminStatus(message = '') {
  const el = document.getElementById('trivia-admin-status');
  if (el) el.textContent = message;
}

function escapeTriviaAdminText(value = '') {
  if (typeof escapeAdminText === 'function') return escapeAdminText(value);
  return String(value).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}

function buildTriviaOptionRows(options = []) {
  const wrap = document.getElementById('trivia-options-admin');
  if (!wrap) return;

  const safeOptions = Array.isArray(options) && options.length
    ? options.slice(0, 4)
    : ['', '', '', ''];

  while (safeOptions.length < 4) safeOptions.push('');

  wrap.innerHTML = safeOptions.slice(0, 4).map((value, index) => `
    <div class="trivia-admin-option-row">
      <div class="trivia-option-badge">${index + 1}</div>
      <input class="adm-input trivia-option-input" type="text" placeholder="Option ${index + 1}" value="${escapeTriviaAdminText(value)}"/>
    </div>
  `).join('');
}

function resetFanTriviaForm(clear = true) {
  const edit = document.getElementById('trivia-edit-id');
  const question = document.getElementById('trivia-question');
  const correct = document.getElementById('trivia-correct-index');
  const difficulty = document.getElementById('trivia-difficulty');
  const category = document.getElementById('trivia-category');
  const points = document.getElementById('trivia-points');
  const active = document.getElementById('trivia-active');

  if (edit) edit.value = '';
  if (question) question.value = '';
  if (correct) correct.value = '0';
  if (difficulty) difficulty.value = 'medium';
  if (category) category.value = 'drivers';
  if (points) points.value = '100';
  if (active) active.checked = true;

  buildTriviaOptionRows();
  if (clear) setTriviaAdminStatus('Create active trivia questions for Fan Hub.');
}

async function loadFanTriviaAdmin() {
  const tbody = document.getElementById('fan-trivia-tbody');
  if (tbody) tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:30px;color:#777">Loading trivia…</td></tr>';

  try {
    const res = await fetch(FAN_TRIVIA_ADMIN_API, { headers: triviaAdminHeaders() });
    const data = await res.json().catch(() => ({}));

    if (!res.ok || data.success === false) {
      throw new Error(data.message || 'Trivia admin API unavailable');
    }

    ADMIN_FAN_TRIVIA = data.data?.trivia || data.trivia || data.data || [];
    renderFanTriviaAdmin();
    setTriviaAdminStatus('Trivia manager connected.');
  } catch (err) {
    console.warn(err);
    ADMIN_FAN_TRIVIA = [];
    if (tbody) tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:34px;color:#777">${escapeTriviaAdminText(err.message)}. Backend route may need to be added.</td></tr>`;
    setTriviaAdminStatus('Backend endpoint expected: /api/fan/admin/trivia');
  }
}

function renderFanTriviaAdmin() {
  const tbody = document.getElementById('fan-trivia-tbody');
  if (!tbody) return;

  const q = String(document.getElementById('trivia-search-admin')?.value || '').toLowerCase().trim();
  const list = ADMIN_FAN_TRIVIA.filter(item => {
    const text = `${item.question || ''} ${(item.options || []).join(' ')} ${item.category || ''} ${item.difficulty || ''}`.toLowerCase();
    return !q || text.includes(q);
  });

  if (!list.length) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:36px;color:#777">No trivia questions created yet</td></tr>';
    return;
  }

  tbody.innerHTML = list.map(item => {
    const options = Array.isArray(item.options) ? item.options : [];
    const correctIndex = Number(item.correctIndex || 0);
    const correctText = options[correctIndex] || '-';
    return `
      <tr>
        <td class="trivia-question-cell"><strong>${escapeTriviaAdminText(item.question || 'Untitled trivia')}</strong></td>
        <td class="trivia-answer-cell">
          <span class="trivia-answer-pill">${escapeTriviaAdminText(correctText)}</span>
        </td>
        <td class="trivia-meta-cell">
          <div class="trivia-meta-stack">
            <span>${escapeTriviaAdminText(item.difficulty || 'medium')}</span>
            <span>${escapeTriviaAdminText(item.category || 'drivers')}</span>
            <span>${Number(item.points || 100)} pts</span>
          </div>
        </td>
        <td class="trivia-status-cell"><span class="sb ${item.isActive !== false ? 's-ok' : 's-pr'}">${item.isActive !== false ? 'Active' : 'Inactive'}</span></td>
        <td class="trivia-action-cell">
          <div class="trivia-action-stack">
            <button class="act-btn" onclick="editFanTriviaAdmin('${item._id || item.id}')">Edit</button>
            <button class="act-btn" onclick="toggleFanTriviaActive('${item._id || item.id}', ${item.isActive === false})">${item.isActive === false ? 'Activate' : 'Deactivate'}</button>
            <button class="act-btn danger" onclick="deleteFanTriviaAdmin('${item._id || item.id}')">Delete</button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

function editFanTriviaAdmin(id) {
  const item = ADMIN_FAN_TRIVIA.find(t => String(t._id || t.id) === String(id));
  if (!item) return;

  const edit = document.getElementById('trivia-edit-id');
  const question = document.getElementById('trivia-question');
  const correct = document.getElementById('trivia-correct-index');
  const difficulty = document.getElementById('trivia-difficulty');
  const category = document.getElementById('trivia-category');
  const points = document.getElementById('trivia-points');
  const active = document.getElementById('trivia-active');

  if (edit) edit.value = item._id || item.id || '';
  if (question) question.value = item.question || '';
  if (correct) correct.value = String(Number(item.correctIndex || 0));
  if (difficulty) difficulty.value = item.difficulty || 'medium';
  if (category) category.value = item.category || 'drivers';
  if (points) points.value = String(Number(item.points || 100));
  if (active) active.checked = item.isActive !== false;
  buildTriviaOptionRows(item.options || []);
  setTriviaAdminStatus('Editing existing trivia question.');
}

async function saveFanTriviaAdmin() {
  try {
    const id = String(document.getElementById('trivia-edit-id')?.value || '').trim();
    const question = String(document.getElementById('trivia-question')?.value || '').trim();
    const options = [...document.querySelectorAll('.trivia-option-input')]
      .map(input => String(input.value || '').trim());
    const correctIndex = Number(document.getElementById('trivia-correct-index')?.value || 0);
    const difficulty = String(document.getElementById('trivia-difficulty')?.value || 'medium');
    const category = String(document.getElementById('trivia-category')?.value || 'drivers');
    const points = Number(document.getElementById('trivia-points')?.value || 100);
    const isActive = !!document.getElementById('trivia-active')?.checked;

    if (!question) throw new Error('Trivia question is required');
    if (options.length !== 4 || options.some(option => !option)) throw new Error('Add all 4 answer options');
    if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex > 3) throw new Error('Select the correct answer');

    setTriviaAdminStatus('Saving trivia…');

    const payload = {
      question,
      options,
      correctIndex,
      difficulty,
      category,
      points: Number.isFinite(points) ? points : 100,
      isActive
    };

    const res = await fetch(id ? `${FAN_TRIVIA_ADMIN_API}/${encodeURIComponent(id)}` : FAN_TRIVIA_ADMIN_API, {
      method: id ? 'PUT' : 'POST',
      headers: triviaAdminHeaders(true),
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok || data.success === false) throw new Error(data.message || 'Could not save trivia');

    showToast('🔥 Trivia saved');
    resetFanTriviaForm(false);
    loadFanTriviaAdmin();
  } catch (err) {
    console.error(err);
    showToast(`❌ ${err.message}`);
    setTriviaAdminStatus(err.message);
  }
}

async function toggleFanTriviaActive(id, makeActive = true) {
  try {
    const res = await fetch(`${FAN_TRIVIA_ADMIN_API}/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: triviaAdminHeaders(true),
      body: JSON.stringify({ isActive: !!makeActive })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) throw new Error(data.message || 'Could not update trivia');
    showToast(makeActive ? '🔥 Trivia activated' : 'Trivia deactivated');
    loadFanTriviaAdmin();
  } catch (err) {
    showToast(`❌ ${err.message}`);
  }
}

async function deleteFanTriviaAdmin(id) {
  if (!confirm('Delete this trivia question?')) return;
  try {
    const res = await fetch(`${FAN_TRIVIA_ADMIN_API}/${encodeURIComponent(id)}`, {
      method:'DELETE',
      headers: triviaAdminHeaders()
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) throw new Error(data.message || 'Could not delete trivia');
    showToast('Trivia deleted');
    loadFanTriviaAdmin();
  } catch (err) {
    showToast(`❌ ${err.message}`);
  }
}

document.addEventListener('input', e => {
  if (e.target?.id === 'trivia-search-admin') renderFanTriviaAdmin();
});


/* ============================================================
   ADMIN PHASE A2.3 — Overview realtime category + premium sync
   ============================================================ */
function adminA23NormalizeCategory(value) {
  const raw = String(value || '').trim();
  if (!raw) return 'Other';
  return raw
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, ch => ch.toUpperCase());
}

function adminA23ProductForItem(item = {}) {
  const products = REAL_PRODUCTS || [];
  const productId = String(item.product?._id || item.product || item.productId || item.id || '');
  const itemName = String(item.name || item.product?.name || '').toLowerCase();

  return products.find(product => {
    const pId = String(product._id || product.id || '');
    const pName = String(product.name || '').toLowerCase();
    return (productId && pId && productId === pId) || (itemName && pName && itemName === pName);
  }) || null;
}

function adminA23ItemCategory(item = {}) {
  const matched = adminA23ProductForItem(item);
  return adminA23NormalizeCategory(
    item.category ||
    item.product?.category ||
    matched?.category ||
    matched?.type ||
    'Other'
  );
}

function updateOverviewCategoryChart() {
  const svg = document.getElementById('overview-category-svg');
  const legend = document.getElementById('overview-category-legend');
  const sub = document.getElementById('overview-category-sub');
  if (!svg || !legend) return;

  const categoryTotals = {};
  (REAL_ORDERS || []).forEach(order => {
    (order.items || []).forEach(item => {
      const category = adminA23ItemCategory(item);
      const amount = Number(item.price || item.product?.price || 0) * Number(item.quantity || 1);
      const fallbackQtyValue = Number(item.quantity || 1);
      categoryTotals[category] = (categoryTotals[category] || 0) + (amount > 0 ? amount : fallbackQtyValue);
    });
  });

  let entries = Object.entries(categoryTotals).filter(([, value]) => Number(value) > 0);
  entries.sort((a, b) => b[1] - a[1]);

  if (entries.length > 4) {
    const top = entries.slice(0, 3);
    const otherTotal = entries.slice(3).reduce((sum, [, value]) => sum + value, 0);
    entries = [...top, ['Other', otherTotal]];
  }

  const total = entries.reduce((sum, [, value]) => sum + value, 0);
  const palette = ['#e8002d', '#c9a84c', '#0088ff', '#00b400'];
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  if (!total) {
    svg.innerHTML = `
      <circle cx="75" cy="75" r="54" fill="none" stroke="#1e1e1e" stroke-width="22"/>
      <text x="75" y="72" text-anchor="middle" fill="#fff" font-family="Bebas Neue" font-size="22">0%</text>
      <text x="75" y="88" text-anchor="middle" fill="#888" font-family="Inter" font-size="8">No data</text>
    `;
    legend.innerHTML = '<div class="overview-empty-note">Waiting for live order categories</div>';
    if (sub) sub.textContent = 'Live category mix will appear after orders load';
    return;
  }

  const mainPercent = Math.round((entries[0][1] / total) * 100);
  const mainLabel = entries[0][0];

  const arcs = entries.map(([label, value], index) => {
    const dash = (value / total) * circumference;
    const circle = `
      <circle class="category-arc" cx="75" cy="75" r="54" fill="none"
        stroke="${palette[index % palette.length]}" stroke-width="22"
        stroke-dasharray="${dash.toFixed(2)} ${(circumference - dash).toFixed(2)}"
        stroke-dashoffset="${(-offset).toFixed(2)}"
        transform="rotate(-90 75 75)"/>`;
    offset += dash;
    return circle;
  }).join('');

  svg.innerHTML = `
    <circle cx="75" cy="75" r="54" fill="none" stroke="#1e1e1e" stroke-width="22"/>
    ${arcs}
    <circle cx="75" cy="75" r="34" fill="#101012" opacity=".96"/>
    <text x="75" y="72" text-anchor="middle" fill="#fff" font-family="Bebas Neue" font-size="22">${mainPercent}%</text>
    <text x="75" y="88" text-anchor="middle" fill="#888" font-family="Inter" font-size="8">${mainLabel.slice(0, 11)}</text>
  `;

  legend.innerHTML = entries.map(([label, value], index) => {
    const percent = Math.round((value / total) * 100);
    return `
      <div class="leg-item">
        <div class="leg-dot" style="background:${palette[index % palette.length]}"></div>
        <span class="leg-lbl">${label}</span>
        <span class="leg-val">${percent}%</span>
      </div>
    `;
  }).join('');

  if (sub) sub.textContent = `Live category mix · ${entries.length} active ${entries.length === 1 ? 'category' : 'categories'}`;
}

function updateOverviewRealtime() {
  updateOverviewCards();
  updateOverviewRecentOrders();
  updateOverviewLowStock();
  updateOverviewRevenueChart();
  updateOverviewCategoryChart();
  renderAnalyticsRealtime();
  updateAdminSidebarBadges();
}


/* ══════════════════════════════════════
   ADMIN PHASE A2.4 — OVERVIEW FINAL LOCK
   - Overview has no primary add-product CTA
   - Revenue chart is live month-after-month
   - Bell icon clarified with tooltip
   - Overview empty states polished
══════════════════════════════════════ */
(function adminPhaseA24OverviewLock(){
  const notif = document.querySelector('.adm-notif');
  if (notif) {
    notif.setAttribute('title', 'Admin notifications: live order, stock and fan activity alerts');
    notif.setAttribute('aria-label', 'Admin notifications');
  }

  const overviewAction = () => {
    const active = document.querySelector('.adm-page.on')?.id === 'adm-overview';
    const btn = document.getElementById('adm-action-btn');
    if (!btn) return;
    btn.hidden = active;
    btn.classList.toggle('is-hidden', active);
  };

  document.querySelectorAll('.adm-nav-item').forEach(item => {
    item.addEventListener('click', () => setTimeout(overviewAction, 0));
  });
  window.addEventListener('load', overviewAction);
  setTimeout(overviewAction, 0);
})();

function adminA24MonthLabel(date) {
  return date.toLocaleString('en-IN', { month: 'short' });
}

function adminA24MoneyShort(value) {
  const n = Number(value || 0);
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(n % 10000000 ? 1 : 0)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(n % 100000 ? 1 : 0)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(n % 1000 ? 1 : 0)}K`;
  return money(n);
}

function adminA24MomText(current, previous) {
  if (!previous && !current) return 'No orders';
  if (!previous && current) return 'New sales';
  const diff = ((current - previous) / previous) * 100;
  const sign = diff >= 0 ? '+' : '';
  return `${sign}${diff.toFixed(0)}% MoM`;
}

function updateOverviewRevenueChart() {
  const container = document.getElementById('bar-chart');
  if (!container) return;

  const now = new Date();
  const labels = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push({
      month: d.getMonth(),
      year: d.getFullYear(),
      label: adminA24MonthLabel(d),
      full: d.toLocaleString('en-IN', { month: 'long', year: 'numeric' })
    });
  }

  const monthTotals = labels.map(meta => (REAL_ORDERS || []).reduce((sum, order) => {
    if (!order.createdAt) return sum;
    const d = new Date(order.createdAt);
    return d.getMonth() === meta.month && d.getFullYear() === meta.year
      ? sum + adminPhase9OrderTotal(order)
      : sum;
  }, 0));

  const sub = document.getElementById('overview-revenue-sub');
  if (sub && labels.length) {
    sub.textContent = `Live month-by-month revenue · ${labels[0].label} – ${labels[labels.length - 1].label} ${labels[labels.length - 1].year}`;
  }

  const max = Math.max(...monthTotals, 1);
  container.innerHTML = `
    <div class="revenue-gridlines" aria-hidden="true"><span></span><span></span><span></span></div>
    ${labels.map((meta, index) => {
      const total = monthTotals[index];
      const prev = index > 0 ? monthTotals[index - 1] : 0;
      const height = total > 0 ? Math.max(18, (total / max) * 100) : 4;
      const active = index === labels.length - 1 ? ' is-current-month' : '';
      return `
        <div class="bc-col${active}">
          <div class="bc-value">${total ? adminA24MoneyShort(total) : '—'}</div>
          <div class="bc-wrap">
            <div class="bc-bar" style="height:${height}%" data-v="${meta.full} · ${money(total)} · ${adminA24MomText(total, prev)}"></div>
          </div>
          <div class="bc-lbl">${meta.label}</div>
          <div class="bc-mom">${adminA24MomText(total, prev)}</div>
        </div>
      `;
    }).join('')}
  `;
}

function updateOverviewLowStock() {
  const overview = document.getElementById('adm-overview');
  if (!overview) return;

  const cards = [...overview.querySelectorAll('.table-card')];
  const lowStockCard = cards.find(card =>
    card.querySelector('.table-card-title')?.textContent?.toLowerCase().includes('low stock')
  );
  const tbody = lowStockCard?.querySelector('tbody');
  if (!tbody) return;

  const lowStock = (REAL_PRODUCTS || [])
    .filter(product => Number(product.stock || 0) <= 10)
    .sort((a, b) => Number(a.stock || 0) - Number(b.stock || 0))
    .slice(0, 5);

  if (!lowStock.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="3">
          <div class="overview-empty-state">
            <div class="overview-empty-icon">✓</div>
            <div>
              <div class="overview-empty-title">Inventory healthy</div>
              <div class="overview-empty-sub">All monitored products are above safety stock.</div>
            </div>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = lowStock.map(product => `
    <tr>
      <td>${product.name || 'Product'}</td>
      <td>${Number(product.stock || 0)}</td>
      <td><span class="sb ${Number(product.stock || 0) === 0 ? 's-out' : 's-pr'}">${Number(product.stock || 0) === 0 ? 'Out' : 'Low'}</span></td>
    </tr>
  `).join('');
}

/* ══════════════════════════════════════
   ADMIN PHASE A2.5 — LIVE NOTIFICATION BELL
   - Clickable bell panel
   - New order polling fallback
   - Low stock alerts
   - Fan activity socket listeners when backend emits them
══════════════════════════════════════ */
const ADMIN_NOTIF_STORAGE_KEY = 'paddox_admin_notifications_v1';
const ADMIN_NOTIF_SEEN_ORDER_KEY = 'paddox_admin_seen_order_ids_v1';
let ADMIN_NOTIFICATIONS = [];
let adminNotifPanelReady = false;
let adminNotifPollingStarted = false;
let adminNotifLastSync = 0;

function adminNotifLoad() {
  try {
    ADMIN_NOTIFICATIONS = JSON.parse(localStorage.getItem(ADMIN_NOTIF_STORAGE_KEY) || '[]');
    if (!Array.isArray(ADMIN_NOTIFICATIONS)) ADMIN_NOTIFICATIONS = [];
  } catch (_) {
    ADMIN_NOTIFICATIONS = [];
  }
}

function adminNotifSave() {
  localStorage.setItem(ADMIN_NOTIF_STORAGE_KEY, JSON.stringify(ADMIN_NOTIFICATIONS.slice(0, 40)));
}

function adminNotifSeenOrders() {
  try {
    const ids = JSON.parse(localStorage.getItem(ADMIN_NOTIF_SEEN_ORDER_KEY) || '[]');
    return new Set(Array.isArray(ids) ? ids : []);
  } catch (_) {
    return new Set();
  }
}

function adminNotifSaveSeenOrders(set) {
  localStorage.setItem(ADMIN_NOTIF_SEEN_ORDER_KEY, JSON.stringify([...set].slice(0, 300)));
}

function adminNotifTimeAgo(ts) {
  const diff = Math.max(0, Date.now() - Number(ts || Date.now()));
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const d = Math.floor(hr / 24);
  return `${d} day${d > 1 ? 's' : ''} ago`;
}

function adminNotifIcon(type) {
  if (type === 'order') return 'OD';
  if (type === 'stock') return 'ST';
  if (type === 'fan') return 'FH';
  return 'AL';
}

function adminNotifAdd(item = {}, options = {}) {
  const id = item.id || `${item.type || 'system'}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  if (ADMIN_NOTIFICATIONS.some(n => n.id === id)) return;

  ADMIN_NOTIFICATIONS.unshift({
    id,
    type: item.type || 'system',
    title: item.title || 'Admin alert',
    message: item.message || 'New activity detected.',
    createdAt: item.createdAt || Date.now(),
    unread: options.unread !== false,
    ref: item.ref || ''
  });

  ADMIN_NOTIFICATIONS = ADMIN_NOTIFICATIONS.slice(0, 40);
  adminNotifSave();
  adminNotifRender();
  if (options.toast) showToast(options.toast);
}

function adminNotifUnreadCount() {
  return ADMIN_NOTIFICATIONS.filter(n => n.unread).length;
}

function adminNotifEnsurePanel() {
  if (adminNotifPanelReady) return;
  const bell = document.querySelector('.adm-notif');
  if (!bell) return;

  if (!bell.querySelector('.adm-notif-count')) {
    const count = document.createElement('span');
    count.className = 'adm-notif-count';
    count.textContent = '0';
    bell.appendChild(count);
  }

  const panel = document.createElement('div');
  panel.id = 'admin-notification-panel';
  panel.className = 'admin-notification-panel';
  panel.innerHTML = `
    <div class="admin-notification-head">
      <div>
        <div class="admin-notification-kicker">Live Alerts</div>
        <div class="admin-notification-title">Admin Notifications</div>
        <div class="admin-notification-sub">Orders, inventory health and Fan Hub activity appear here.</div>
      </div>
      <button class="admin-notification-close" type="button" aria-label="Close notifications">×</button>
    </div>
    <div class="admin-notification-list" id="admin-notification-list"></div>
    <div class="admin-notification-foot">
      <div class="admin-notification-status" id="admin-notification-status">Realtime watch active</div>
      <button class="admin-notification-clear" id="admin-notification-clear" type="button">Clear Read</button>
    </div>
  `;
  document.body.appendChild(panel);

  bell.addEventListener('click', event => {
    event.stopPropagation();
    panel.classList.toggle('show');
    if (panel.classList.contains('show')) {
      ADMIN_NOTIFICATIONS = ADMIN_NOTIFICATIONS.map(n => ({ ...n, unread: false }));
      adminNotifSave();
      adminNotifRender();
    }
  });

  panel.querySelector('.admin-notification-close')?.addEventListener('click', () => panel.classList.remove('show'));
  panel.addEventListener('click', event => event.stopPropagation());
  document.addEventListener('click', () => panel.classList.remove('show'));
  panel.querySelector('#admin-notification-clear')?.addEventListener('click', () => {
    ADMIN_NOTIFICATIONS = ADMIN_NOTIFICATIONS.filter(n => n.unread);
    adminNotifSave();
    adminNotifRender();
  });

  adminNotifPanelReady = true;
}

function adminNotifRender() {
  adminNotifEnsurePanel();
  const bell = document.querySelector('.adm-notif');
  const countEl = bell?.querySelector('.adm-notif-count');
  const list = document.getElementById('admin-notification-list');
  const status = document.getElementById('admin-notification-status');
  const unread = adminNotifUnreadCount();

  if (bell) bell.classList.toggle('has-unread', unread > 0);
  if (countEl) countEl.textContent = unread > 9 ? '9+' : String(unread);
  if (status) status.textContent = `Realtime watch active · ${ADMIN_NOTIFICATIONS.length} alert${ADMIN_NOTIFICATIONS.length === 1 ? '' : 's'}`;

  if (!list) return;

  if (!ADMIN_NOTIFICATIONS.length) {
    list.innerHTML = `
      <div class="admin-notification-empty">
        <div class="admin-notification-empty-icon">✓</div>
        <div class="admin-notification-empty-title">No alerts yet</div>
        <div class="admin-notification-empty-sub">New paid orders and low stock alerts will appear here automatically.</div>
      </div>
    `;
    return;
  }

  list.innerHTML = ADMIN_NOTIFICATIONS.slice(0, 20).map(n => `
    <div class="admin-notification-item ${n.type || 'system'} ${n.unread ? 'unread' : ''}">
      <div class="admin-notification-icon">${adminNotifIcon(n.type)}</div>
      <div>
        <div class="admin-notification-name">${escapeAdminText(n.title)}</div>
        <div class="admin-notification-msg">${escapeAdminText(n.message)}</div>
        <div class="admin-notification-time">${adminNotifTimeAgo(n.createdAt)}</div>
      </div>
    </div>
  `).join('');
}

function adminNotifPrimeFromExistingOrders() {
  const seen = adminNotifSeenOrders();
  const orders = (REAL_ORDERS || []).slice().sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  orders.forEach(order => {
    const id = String(order._id || order.orderNumber || '');
    if (id) seen.add(id);
  });
  adminNotifSaveSeenOrders(seen);

  if (!ADMIN_NOTIFICATIONS.length && orders.length) {
    orders.slice(0, 3).forEach(order => {
      const total = adminPhase9OrderTotal ? adminPhase9OrderTotal(order) : getOverviewTotal(order);
      adminNotifAdd({
        id: `recent-order-${order._id || order.orderNumber}`,
        type: 'order',
        title: `Recent order #${order.orderNumber || String(order._id || '').slice(-5)}`,
        message: `${getOverviewCustomer(order)} · ${money(total)} · ${(order.status || 'placed').replaceAll('_', ' ')}`,
        createdAt: order.createdAt ? new Date(order.createdAt).getTime() : Date.now(),
        ref: order._id || ''
      }, { unread: false });
    });
  }
}

async function adminNotifPollOrders() {
  const token = getAdminToken();
  if (!token) return;

  try {
    const res = await fetch('https://paddox-backend.onrender.com/api/orders/admin/all', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return;

    const orders = data.data || data.orders || [];
    const seen = adminNotifSeenOrders();
    let newCount = 0;

    orders
      .slice()
      .sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0))
      .forEach(order => {
        const id = String(order._id || order.orderNumber || '');
        if (!id || seen.has(id)) return;
        seen.add(id);
        newCount += 1;
        const total = adminPhase9OrderTotal ? adminPhase9OrderTotal(order) : getOverviewTotal(order);
        adminNotifAdd({
          id: `order-${id}`,
          type: 'order',
          title: `New order #${order.orderNumber || id.slice(-5)}`,
          message: `${getOverviewCustomer(order)} placed an order worth ${money(total)}.`,
          createdAt: order.createdAt ? new Date(order.createdAt).getTime() : Date.now(),
          ref: id
        }, { toast: '🔔 New order received' });
      });

    if (newCount) {
      REAL_ORDERS = orders;
      updateOverviewRealtime();
      updateAdminSidebarBadges();
    }

    adminNotifSaveSeenOrders(seen);
    adminNotifLastSync = Date.now();
  } catch (err) {
    console.warn('Admin notification order poll failed:', err.message);
  }
}

function adminNotifCheckLowStock() {
  const low = (REAL_PRODUCTS || []).filter(product => Number(product.stock || 0) <= 5);
  low.slice(0, 5).forEach(product => {
    const id = String(product._id || product.id || product.name);
    adminNotifAdd({
      id: `stock-${id}-${Number(product.stock || 0)}`,
      type: 'stock',
      title: 'Low stock alert',
      message: `${product.name || 'Product'} has only ${Number(product.stock || 0)} item${Number(product.stock || 0) === 1 ? '' : 's'} left.`,
      createdAt: Date.now(),
      ref: id
    }, { unread: false });
  });
}

function adminNotifBindSocketListeners() {
  try {
    initAdminNotificationSocket();
    if (!adminSocket || adminSocket.__paddoxNotifBound) return;
    adminSocket.__paddoxNotifBound = true;

    const addFan = (title, payload = {}) => adminNotifAdd({
      type: 'fan',
      title,
      message: payload.message || payload.title || payload.text || 'New Fan Hub activity detected.',
      createdAt: Date.now(),
      ref: payload.ref || payload.id || ''
    }, { toast: '🔔 New Fan Hub activity' });

    adminSocket.on('admin:new-order', payload => adminNotifAdd({
      type: 'order',
      title: payload?.title || 'New order received',
      message: payload?.message || 'A customer placed a new order.',
      createdAt: Date.now(),
      ref: payload?.orderId || payload?._id || ''
    }, { toast: '🔔 New order received' }));

    adminSocket.on('order:new', payload => addFan('Store activity', { message: payload?.message || 'New order activity detected.', ...payload }));
    adminSocket.on('order:created', payload => adminNotifAdd({ type:'order', title:'New order received', message: payload?.message || 'A customer placed a new order.', createdAt: Date.now(), ref: payload?.orderId || '' }, { toast:'🔔 New order received' }));
    adminSocket.on('fan:new-post', payload => addFan('New Fan Hub post', payload));
    adminSocket.on('fan:new-comment', payload => addFan('New Fan Hub comment', payload));
    adminSocket.on('fan:poll-vote', payload => addFan('New poll vote', payload));
    adminSocket.on('fan:trivia-answer', payload => addFan('New trivia answer', payload));
    adminSocket.on('fan:activity', payload => addFan('Fan Hub activity', payload));
    adminSocket.on('admin:notification', payload => adminNotifAdd({
      type: payload?.type || 'system',
      title: payload?.title || 'Admin alert',
      message: payload?.message || 'New admin notification.',
      createdAt: Date.now(),
      ref: payload?.ref || ''
    }, { toast: '🔔 New admin alert' }));
  } catch (err) {
    console.warn('Admin notification socket bind failed:', err.message);
  }
}

function adminNotifStartRealtimeWatch() {
  if (adminNotifPollingStarted) return;
  adminNotifPollingStarted = true;

  adminNotifLoad();
  adminNotifEnsurePanel();
  adminNotifRender();
  adminNotifPrimeFromExistingOrders();
  adminNotifCheckLowStock();
  adminNotifBindSocketListeners();
  adminNotifRender();

  setTimeout(adminNotifPollOrders, 1500);
  setInterval(adminNotifPollOrders, 30000);
  setInterval(() => {
    adminNotifCheckLowStock();
    adminNotifBindSocketListeners();
    adminNotifRender();
  }, 60000);
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(adminNotifStartRealtimeWatch, 1800);
});
window.addEventListener('load', () => {
  setTimeout(adminNotifStartRealtimeWatch, 2200);
});

console.log('%c🔔 PADDOX — Admin Notification Bell Live · A2.5', 'color:#e8002d;font-size:13px;font-weight:bold;');

/* ══════════════════════════════════════
   ADMIN PHASE A3.1 — ORDERS FINAL POLISH + LIVE BACKEND SYNC
   - Removes the empty topbar CTA on Orders
   - Keeps one export button inside the Orders command strip
   - Tightens row/action alignment
   - Auto-refreshes Orders from backend while Orders page is open
══════════════════════════════════════ */
function adminA31IsOrdersPage() {
  return document.getElementById('adm-orders')?.classList.contains('on');
}

function adminA31SetSyncText(text) {
  const el = document.getElementById('orders-sync-pill');
  if (el) el.textContent = text;
}

function adminA31SyncTopbarAction() {
  const btn = document.getElementById('adm-action-btn');
  if (!btn) return;
  const activeId = document.querySelector('.adm-page.on')?.id || '';
  const shouldHide = activeId === 'adm-overview' || activeId === 'adm-orders' || !btn.textContent.trim();
  btn.hidden = shouldHide;
  btn.classList.toggle('is-hidden', shouldHide);
  btn.style.display = shouldHide ? 'none' : '';
}

async function adminA31RefreshOrders(silent = false) {
  if (!silent) showToast('⏳ Syncing orders...');
  adminA31SetSyncText('Syncing live orders...');
  try {
    await loadOrders();
    const stamp = new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });
    adminA31SetSyncText(`Live backend sync · ${stamp}`);
    if (!silent) showToast('🔥 Orders synced');
  } catch (err) {
    adminA31SetSyncText('Sync paused · retrying');
    if (!silent) showToast('❌ Order sync failed');
  }
}

function renderOrders() {
  const tbody = document.getElementById('orders-tbody');
  if (!tbody) return;

  /* Phase A4.6.1 — keep the orders table locked to the left edge.
     Some browsers preserve horizontal scroll after deploy refresh, which
     can visually cut the order number column. */
  const ordersWrap = document.querySelector('#adm-orders .orders-table-wrap');
  if (ordersWrap) ordersWrap.scrollLeft = 0;

  const orders = adminPhase9FilteredOrders();
  adminPhase9RenderOrderSummaryChips(orders);
  adminA31SyncTopbarAction();

  if (!orders.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8">
          <div class="admin-empty-state orders-empty-state">
            <div class="orders-empty-icon">✓</div>
            <strong>No matching orders</strong>
            <span>Change the filter/search or wait for the next live order.</span>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = orders.map(order => {
    const c = adminPhase9Customer(order);
    const items = order.items || [];
    const itemLabel = items.length
      ? `${items.length} item${items.length > 1 ? 's' : ''} · ${items.slice(0, 1).map(i => i.name || 'Product').join(', ')}${items.length > 1 ? ' +' + (items.length - 1) : ''}`
      : 'No items';
    const payStatus = adminPhase9PaymentStatus(order);
    const statusLabel = String(order.status || 'placed').replaceAll('_', ' ');

    return `
      <tr class="admin-order-row">
        <td>
          <div class="admin-order-code">#${adminPhase9Text(order.orderNumber || order._id)}</div>
          <div class="admin-order-sub">${adminPhase9Text(order._id || '')}</div>
        </td>
        <td>
          <div class="admin-customer-name">${adminPhase9Text(c.name)}</div>
          <div class="admin-customer-meta">${adminPhase9Text(c.email || c.phone || 'No contact')}</div>
        </td>
        <td>
          <span class="admin-items-pill admin-items-pill-clean" title="${adminPhase9Text((items || []).map(i => i.name || 'Product').join(', '))}">
            <span class="admin-items-dot"></span>${adminPhase9Text(itemLabel)}
          </span>
        </td>
        <td class="admin-date-cell">${adminPhase9Date(order.createdAt)}</td>
        <td>
          <span class="admin-pay-badge admin-pay-${adminPhase9Text(payStatus)}">
            ${payStatus === 'paid' ? '✓' : '•'} ${adminPhase9Text(adminPhase9PaymentMethod(order))}
          </span>
        </td>
        <td class="admin-amount-cell">${money(adminPhase9OrderTotal(order))}</td>
        <td><span class="sb ${adminPhase9StatusClass(order.status)}">${adminPhase9Text(statusLabel)}</span></td>
        <td>
          <div class="admin-order-actions admin-order-actions-final">
            <div class="admin-order-btn-row">
              <button class="admin-mini-btn red" onclick="openOrderDetails('${order._id}')">View</button>
              <button class="admin-mini-btn" onclick="adminPhase9OpenReceipt('${order._id}')">Receipt</button>
            </div>
            <div class="admin-inline-status-wrap">
              <select class="admin-inline-status" id="admin-status-${order._id}" aria-label="Update order status">
                ${adminPhase9StatusOptions(order.status)}
              </select>
              <button class="admin-mini-btn" onclick="updateOrderStatus('${order._id}', document.getElementById('admin-status-${order._id}')?.value, false)">Update</button>
            </div>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  requestAnimationFrame(() => {
    const ordersWrap = document.querySelector('#adm-orders .orders-table-wrap');
    if (ordersWrap) ordersWrap.scrollLeft = 0;
  });
}

(function adminA31InitOrdersLiveSync(){
  const sync = () => setTimeout(adminA31SyncTopbarAction, 0);
  document.querySelectorAll('.adm-nav-item').forEach(item => item.addEventListener('click', sync));
  window.addEventListener('load', sync);
  setTimeout(sync, 0);

  let lastOrdersRefresh = 0;
  setInterval(() => {
    if (!adminA31IsOrdersPage()) return;
    const now = Date.now();
    if (now - lastOrdersRefresh < 25000) return;
    lastOrdersRefresh = now;
    adminA31RefreshOrders(true);
  }, 30000);
})();

window.adminA31RefreshOrders = adminA31RefreshOrders;

/* ══════════════════════════════════════
   ADMIN PHASE A3.2 — ORDERS ALIGNMENT + ORDER VIEW MODAL LOCK
   - Final row/action alignment
   - Realtime backend controls stay connected through loadOrders/updateOrderStatus
   - Premium order details modal layout
══════════════════════════════════════ */
function adminA32CurrentSyncText() {
  const stamp = new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });
  return `Live backend sync · ${stamp}`;
}

function adminA32TouchSync(text = '') {
  const el = document.getElementById('orders-sync-pill');
  if (el) el.textContent = text || adminA32CurrentSyncText();
}

function renderOrders() {
  const tbody = document.getElementById('orders-tbody');
  if (!tbody) return;

  /* Phase A4.6.1 — keep the orders table locked to the left edge.
     Some browsers preserve horizontal scroll after deploy refresh, which
     can visually cut the order number column. */
  const ordersWrap = document.querySelector('#adm-orders .orders-table-wrap');
  if (ordersWrap) ordersWrap.scrollLeft = 0;

  const orders = adminPhase9FilteredOrders();
  adminPhase9RenderOrderSummaryChips(orders);
  adminA31SyncTopbarAction?.();
  adminA32TouchSync();

  if (!orders.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8">
          <div class="admin-empty-state orders-empty-state">
            <div class="orders-empty-icon">✓</div>
            <strong>No matching orders</strong>
            <span>Change filters or wait for the next live backend order.</span>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = orders.map(order => {
    const c = adminPhase9Customer(order);
    const items = order.items || [];
    const fullItems = (items || []).map(i => i.name || i.product?.name || 'Product').join(', ');
    const itemLabel = items.length
      ? `${items.length} item${items.length > 1 ? 's' : ''} · ${items.slice(0, 1).map(i => i.name || i.product?.name || 'Product').join(', ')}${items.length > 1 ? ' +' + (items.length - 1) : ''}`
      : 'No items';
    const payStatus = adminPhase9PaymentStatus(order);
    const statusLabel = String(order.status || 'placed').replaceAll('_', ' ');
    const id = String(order._id || '');

    return `
      <tr class="admin-order-row">
        <td>
          <div class="admin-order-code">#${adminPhase9Text(order.orderNumber || id)}</div>
          <div class="admin-order-sub" title="${adminPhase9Text(id)}">${adminPhase9Text(id)}</div>
        </td>
        <td>
          <div class="admin-customer-name">${adminPhase9Text(c.name)}</div>
          <div class="admin-customer-meta" title="${adminPhase9Text(c.email || c.phone || 'No contact')}">${adminPhase9Text(c.email || c.phone || 'No contact')}</div>
        </td>
        <td>
          <span class="admin-items-pill admin-items-pill-clean" title="${adminPhase9Text(fullItems)}">
            <span class="admin-items-dot"></span><span class="admin-items-label">${adminPhase9Text(itemLabel)}</span>
          </span>
        </td>
        <td class="admin-date-cell">${adminPhase9Date(order.createdAt)}</td>
        <td>
          <span class="admin-pay-badge admin-pay-${adminPhase9Text(payStatus)}" title="${adminPhase9Text(adminPhase9PaymentMethod(order))}">
            ${payStatus === 'paid' ? '✓' : '•'} ${adminPhase9Text(adminPhase9PaymentMethod(order))}
          </span>
        </td>
        <td class="admin-amount-cell">${money(adminPhase9OrderTotal(order))}</td>
        <td><span class="sb ${adminPhase9StatusClass(order.status)}">${adminPhase9Text(statusLabel)}</span></td>
        <td>
          <div class="admin-order-actions admin-order-actions-final">
            <div class="admin-order-btn-row">
              <button class="admin-mini-btn red" onclick="openOrderDetails('${id}')">View</button>
              <button class="admin-mini-btn" onclick="adminPhase9OpenReceipt('${id}')">Receipt</button>
            </div>
            <div class="admin-inline-status-wrap">
              <select class="admin-inline-status" id="admin-status-${id}" aria-label="Update order status">
                ${adminPhase9StatusOptions(order.status)}
              </select>
              <button class="admin-mini-btn" onclick="updateOrderStatus('${id}', document.getElementById('admin-status-${id}')?.value, false)">Update</button>
            </div>
            <span class="admin-row-sync-note">Backend connected</span>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function openOrderDetails(orderId) {
  ensureOrderModal();
  const order = (REAL_ORDERS || []).find(o => String(o._id) === String(orderId));
  if (!order) {
    showToast('❌ Order not found');
    return;
  }

  const c = adminPhase9Customer(order);
  const items = order.items || [];
  const address = order.shippingAddress || {};
  const payStatus = adminPhase9PaymentStatus(order);
  const payMethod = adminPhase9PaymentMethod(order);
  const transactionId = order.payment?.transactionId || order.payment?.razorpayPaymentId || order.payment?.paymentId || order.payment?.reference || order.payment?.demoPaymentId || '-';
  const statusText = String(order.status || 'placed').replaceAll('_',' ');

  document.getElementById('od-title').textContent = `#${order.orderNumber || order._id}`;
  document.getElementById('od-body').innerHTML = `
    <div class="od-grid">
      <div class="od-box">
        <div class="od-label">Customer</div>
        <div class="od-value"><strong>${adminPhase9Text(c.name)}</strong></div>
        <div style="color:#888;margin-top:5px;line-height:1.45">${adminPhase9Text(c.email || c.phone || 'No contact')}</div>
      </div>
      <div class="od-box">
        <div class="od-label">Order Date</div>
        <div class="od-value"><strong>${adminPhase9DateTime(order.createdAt)}</strong></div>
        <div style="color:#777;margin-top:5px">Live backend order record</div>
      </div>
      <div class="od-box">
        <div class="od-label">Order Status</div>
        <div class="od-value"><span class="sb ${adminPhase9StatusClass(order.status)}">${adminPhase9Text(statusText)}</span></div>
      </div>
      <div class="od-box">
        <div class="od-label">Payment</div>
        <div class="od-value"><span class="admin-pay-badge admin-pay-${adminPhase9Text(payStatus)}">${adminPhase9Text(payStatus.toUpperCase())}</span></div>
        <div style="color:#888;margin-top:7px;line-height:1.45">${adminPhase9Text(payMethod)} · ${adminPhase9Text(transactionId)}</div>
      </div>
    </div>

    <div class="od-box" style="margin-bottom:14px">
      <div class="od-label">Fulfilment Timeline</div>
      ${adminPhase9StatusTimeline(order.status)}
    </div>

    <div class="od-grid">
      <div class="od-box">
        <div class="od-label">Shipping Address</div>
        <div class="od-value" style="line-height:1.7">
          <strong>${adminPhase9Text(address.name || c.name)}</strong><br>
          ${adminPhase9Text(address.line1 || address.address || '')}<br>
          ${adminPhase9Text(address.city || '')}, ${adminPhase9Text(address.state || '')} - ${adminPhase9Text(address.pincode || '')}<br>
          ${adminPhase9Text(address.country || 'India')} · ${adminPhase9Text(address.phone || '')}
        </div>
      </div>
      <div class="od-box">
        <div class="od-label">Amount Summary</div>
        <div class="od-value" style="line-height:1.9">
          Subtotal: <strong>${money(order.pricing?.subtotal)}</strong><br>
          Shipping: <strong>${money(order.pricing?.shipping)}</strong><br>
          Discount: <strong>${money(order.pricing?.discount)}</strong><br>
          Tax: <strong>${money(order.pricing?.tax)}</strong><br>
          <span style="display:inline-block;margin-top:4px;font-size:1.45rem;color:#fff;font-family:var(--font-d);letter-spacing:1px">Total: ${money(order.pricing?.total || adminPhase9OrderTotal(order))}</span>
        </div>
      </div>
    </div>

    <table class="od-items">
      <thead><tr><th>Product</th><th>Size / Color</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead>
      <tbody>
        ${items.map(item => `
          <tr>
            <td>${adminPhase9Text(item.name || item.product?.name || 'Product')}</td>
            <td>${adminPhase9Text([item.size, item.color].filter(Boolean).join(' / ') || '-')}</td>
            <td>${Number(item.quantity || 1)}</td>
            <td>${money(item.price)}</td>
            <td>${money((item.price || 0) * (item.quantity || 1))}</td>
          </tr>
        `).join('') || '<tr><td colspan="5" style="color:#777;text-align:center">No items</td></tr>'}
      </tbody>
    </table>

    <div class="od-status-row">
      <div class="od-label" style="margin:0;color:var(--red)">Update Status</div>
      <select class="od-select" id="od-status-select">
        ${adminPhase9StatusOptions(order.status)}
      </select>
      <button class="od-btn" onclick="updateOrderStatus('${order._id}')">Update</button>
    </div>

    <div class="admin-order-modal-actions">
      <button class="admin-mini-btn red" onclick="adminPhase9OpenReceipt('${order._id}')">Open Receipt</button>
      <button class="admin-mini-btn danger" onclick="deleteAdminOrder('${order._id}', '${(order.orderNumber || order._id)}')">Delete Order</button>
    </div>
  `;

  document.getElementById('order-details-modal').classList.add('show');
  document.body.style.overflow = 'hidden';
}

console.log('%c🏁 PADDOX — Admin Orders A3.2 alignment + modal lock', 'color:#e8002d;font-size:13px;font-weight:bold;');

console.log('%c🏁 PADDOX — Admin Orders A3.3 product alignment + modal cleanup', 'color:#e8002d;font-size:13px;font-weight:bold;');


/* PADDOX Admin Phase A4.1 product controls bootstrap */
document.addEventListener('DOMContentLoaded', bindProductAdminControls);


/* Phase A4.1.1 — keep product team dropdowns synced with shop categories */
function syncProductTeamSelects() {
  ['add-product-team', 'product-team-filter'].forEach(id => {
    const select = document.getElementById(id);
    if (!select) return;
    const current = select.value || (id === 'product-team-filter' ? 'all' : 'Ferrari');
    const allOption = id === 'product-team-filter' ? '<option value="all">All Teams</option>' : '';
    select.innerHTML = allOption + getProductTeamOptionsHTML(current);
    select.value = current;
    if (id === 'product-team-filter' && !select.value) select.value = 'all';
    if (id === 'add-product-team' && !select.value) select.value = 'Ferrari';
  });
}
window.addEventListener('load', syncProductTeamSelects);


/* ══════════════════════════════════════
   COUPON CODE ADMIN SYSTEM — PHASE A4.3
══════════════════════════════════════ */
const COUPON_API_BASE = 'https://paddox-backend.onrender.com/api/coupons';
let REAL_COUPONS = [];
let EDIT_COUPON_ID = null;
let couponControlsBound = false;

function couponMoney(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

function formatCouponDate(value) {
  if (!value) return 'No expiry';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'No expiry';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function couponIsExpired(coupon) {
  return coupon?.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now();
}

function couponStatusLabel(coupon) {
  if (couponIsExpired(coupon)) return 'expired';
  return coupon?.isActive === false ? 'inactive' : 'active';
}

function couponDiscountText(coupon) {
  const type = String(coupon?.type || coupon?.discountType || 'percent').toLowerCase();
  const value = Number(coupon?.value ?? coupon?.discountValue ?? 0);
  return type === 'fixed' ? `${couponMoney(value)} OFF` : `${value}% OFF`;
}

function couponAudienceLabel(coupon) {
  const audience = String(coupon?.audience || 'all').toLowerCase();
  if (audience === 'fans') return 'F1 Fans';
  if (audience === 'new_users') return 'New Users';
  if (audience === 'vip') return 'VIP / Admin Pick';
  return 'All Users';
}

function getFilteredCoupons() {
  const status = document.getElementById('coupon-status-filter')?.value || 'all';
  const type = document.getElementById('coupon-type-filter')?.value || 'all';
  const search = (document.getElementById('coupon-search-input')?.value || '').trim().toLowerCase();

  return REAL_COUPONS.filter(coupon => {
    const st = couponStatusLabel(coupon);
    const couponType = String(coupon.type || coupon.discountType || 'percent').toLowerCase();
    const haystack = [coupon.code, coupon.title, coupon.description, coupon.audience]
      .join(' ')
      .toLowerCase();

    if (status !== 'all' && st !== status) return false;
    if (type !== 'all' && couponType !== type) return false;
    if (search && !haystack.includes(search)) return false;

    return true;
  });
}

function updateCouponStats() {
  const total = REAL_COUPONS.length;
  const active = REAL_COUPONS.filter(c => couponStatusLabel(c) === 'active').length;
  const fanDeals = REAL_COUPONS.filter(c => String(c.audience || '').toLowerCase() === 'fans').length;
  const usage = REAL_COUPONS.reduce((sum, c) => sum + Number(c.usedCount || 0), 0);

  const values = {
    'coupons-total-stat': total,
    'coupons-active-stat': active,
    'coupons-fan-stat': fanDeals,
    'coupons-usage-stat': usage
  };

  Object.entries(values).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  });
}

function renderCoupons() {
  const tbody = document.getElementById('coupons-tbody');
  if (!tbody) return;

  updateCouponStats();
  const coupons = getFilteredCoupons();

  if (!coupons.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="coupon-empty-cell">
          <div class="coupon-empty-state">
            <strong>No coupon codes found</strong>
            <span>Create your first PADDOX fan deal or adjust filters.</span>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = coupons.map(coupon => {
    const status = couponStatusLabel(coupon);
    const minOrder = Number(coupon.minOrderValue || 0);
    const maxUses = Number(coupon.maxUses || 0);
    const used = Number(coupon.usedCount || 0);

    return `
      <tr>
        <td class="coupon-code-cell">
          <div class="coupon-code-main">${coupon.code || 'COUPON'}</div>
          <div class="coupon-code-sub">${coupon.title || coupon.description || 'PADDOX discount code'}</div>
        </td>
        <td>
          <span class="coupon-discount-chip">${couponDiscountText(coupon)}</span>
        </td>
        <td>
          <div class="coupon-limit-stack">
            <span>Min: ${minOrder ? couponMoney(minOrder) : 'No minimum'}</span>
            <span>Used: ${used}${maxUses ? ` / ${maxUses}` : ''}</span>
          </div>
        </td>
        <td><span class="coupon-audience-pill">${couponAudienceLabel(coupon)}</span></td>
        <td>${formatCouponDate(coupon.expiresAt)}</td>
        <td><span class="coupon-status-pill ${status}">${status}</span></td>
        <td class="coupon-actions-cell">
          <button class="coupon-edit-btn" type="button" onclick="openCouponModal('${coupon._id}')">EDIT</button>
          <button class="coupon-toggle-btn" type="button" onclick="toggleCouponStatus('${coupon._id}')">${coupon.isActive === false ? 'ENABLE' : 'DISABLE'}</button>
          <button class="coupon-delete-btn" type="button" onclick="deleteCoupon('${coupon._id}')">DELETE</button>
        </td>
      </tr>
    `;
  }).join('');
}

async function loadCoupons() {
  try {
    const res = await fetch(`${COUPON_API_BASE}/admin`, {
      headers: { Authorization: `Bearer ${getAdminToken()}` }
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) throw new Error(data.message || 'Failed to load coupons');

    REAL_COUPONS = data.data || data.coupons || [];
    renderCoupons();
  } catch (err) {
    console.error(err);
    showToast(`❌ ${err.message}`);
  }
}

function bindCouponAdminControls() {
  if (couponControlsBound) return;
  couponControlsBound = true;

  ['coupon-status-filter', 'coupon-type-filter', 'coupon-search-input'].forEach(id => {
    const el = document.getElementById(id);
    if (el && !el.dataset.couponBound) {
      el.addEventListener(id === 'coupon-search-input' ? 'input' : 'change', renderCoupons);
      el.dataset.couponBound = 'true';
    }
  });

  const refresh = document.getElementById('coupons-refresh-btn');
  if (refresh && !refresh.dataset.couponBound) {
    refresh.addEventListener('click', () => loadCoupons().then(() => showToast('🔥 Coupons synced')));
    refresh.dataset.couponBound = 'true';
  }
}

function couponModalHTML() {
  return `
    <div class="coupon-modal-backdrop" onclick="closeCouponModal(event)">
      <div class="coupon-modal-card" onclick="event.stopPropagation()">
        <div class="coupon-modal-head">
          <div>
            <h2 id="coupon-modal-title">CREATE COUPON</h2>
            <p>Build limited PADDOX fan deals for checkout.</p>
          </div>
          <button class="coupon-modal-close" type="button" onclick="closeCouponModal()">×</button>
        </div>

        <div class="coupon-modal-body">
          <div class="coupon-form-grid">
            <label>
              <span>Coupon Code</span>
              <input id="coupon-code" type="text" placeholder="PADDOX25" maxlength="24"/>
            </label>
            <label>
              <span>Campaign Title</span>
              <input id="coupon-title" type="text" placeholder="Race Weekend Fan Deal"/>
            </label>
            <label>
              <span>Discount Type</span>
              <select id="coupon-type">
                <option value="percent">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </label>
            <label>
              <span>Discount Value</span>
              <input id="coupon-value" type="number" min="1" placeholder="25"/>
            </label>
            <label>
              <span>Minimum Order Value</span>
              <input id="coupon-min-order" type="number" min="0" placeholder="999"/>
            </label>
            <label>
              <span>Maximum Uses</span>
              <input id="coupon-max-uses" type="number" min="0" placeholder="100"/>
            </label>
            <label>
              <span>Expiry Date</span>
              <input id="coupon-expiry" type="date"/>
            </label>
            <label>
              <span>Audience</span>
              <select id="coupon-audience">
                <option value="all">All Users</option>
                <option value="fans">F1 Fans</option>
                <option value="new_users">New Users</option>
                <option value="vip">VIP / Admin Pick</option>
              </select>
            </label>
            <label>
              <span>Status</span>
              <select id="coupon-active">
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </label>
            <label class="coupon-form-wide">
              <span>Description</span>
              <textarea id="coupon-description" rows="3" placeholder="Short note for this coupon campaign..."></textarea>
            </label>
          </div>
          <div id="coupon-preview" class="coupon-preview-card">Preview: enter discount details</div>
        </div>

        <div class="coupon-modal-actions">
          <button type="button" class="coupon-cancel-btn" onclick="closeCouponModal()">CANCEL</button>
          <button type="button" class="coupon-save-btn" onclick="saveCoupon()">SAVE COUPON</button>
        </div>
      </div>
    </div>
  `;
}

function ensureCouponModal() {
  if (!document.getElementById('coupon-modal')) {
    const modal = document.createElement('div');
    modal.id = 'coupon-modal';
    modal.innerHTML = couponModalHTML();
    document.body.appendChild(modal);
  }

  ['coupon-code', 'coupon-type', 'coupon-value', 'coupon-min-order'].forEach(id => {
    const el = document.getElementById(id);
    if (el && !el.dataset.previewBound) {
      el.addEventListener('input', updateCouponPreview);
      el.addEventListener('change', updateCouponPreview);
      el.dataset.previewBound = 'true';
    }
  });
}

function updateCouponPreview() {
  const preview = document.getElementById('coupon-preview');
  if (!preview) return;

  const code = (document.getElementById('coupon-code')?.value || 'COUPON').trim().toUpperCase();
  const type = document.getElementById('coupon-type')?.value || 'percent';
  const value = Number(document.getElementById('coupon-value')?.value || 0);
  const min = Number(document.getElementById('coupon-min-order')?.value || 0);

  if (!value) {
    preview.textContent = 'Preview: enter discount details';
    return;
  }

  const discount = type === 'fixed' ? `${couponMoney(value)} OFF` : `${value}% OFF`;
  preview.textContent = `${code} · ${discount}${min ? ` · min order ${couponMoney(min)}` : ''}`;
}

function setCouponField(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value ?? '';
}

function openCouponModal(couponId = null) {
  ensureCouponModal();
  EDIT_COUPON_ID = couponId;

  const coupon = couponId ? REAL_COUPONS.find(c => String(c._id) === String(couponId)) : null;

  document.getElementById('coupon-modal-title').textContent = coupon ? 'EDIT COUPON' : 'CREATE COUPON';
  setCouponField('coupon-code', coupon?.code || '');
  setCouponField('coupon-title', coupon?.title || '');
  setCouponField('coupon-type', coupon?.type || coupon?.discountType || 'percent');
  setCouponField('coupon-value', coupon?.value ?? coupon?.discountValue ?? '');
  setCouponField('coupon-min-order', coupon?.minOrderValue ?? '');
  setCouponField('coupon-max-uses', coupon?.maxUses ?? '');
  setCouponField('coupon-audience', coupon?.audience || 'all');
  setCouponField('coupon-active', String(coupon?.isActive !== false));
  setCouponField('coupon-description', coupon?.description || '');

  if (coupon?.expiresAt) {
    const d = new Date(coupon.expiresAt);
    setCouponField('coupon-expiry', Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10));
  } else {
    setCouponField('coupon-expiry', '');
  }

  updateCouponPreview();
  document.getElementById('coupon-modal').classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeCouponModal(event) {
  if (event && event.target !== event.currentTarget) return;
  document.getElementById('coupon-modal')?.classList.remove('show');
  document.body.style.overflow = '';
  EDIT_COUPON_ID = null;
}

function getCouponPayload() {
  const code = (document.getElementById('coupon-code')?.value || '').trim().toUpperCase();
  const title = (document.getElementById('coupon-title')?.value || '').trim();
  const type = document.getElementById('coupon-type')?.value || 'percent';
  const value = Number(document.getElementById('coupon-value')?.value || 0);
  const minOrderValue = Number(document.getElementById('coupon-min-order')?.value || 0);
  const maxUses = Number(document.getElementById('coupon-max-uses')?.value || 0);
  const expiresAt = document.getElementById('coupon-expiry')?.value || '';
  const audience = document.getElementById('coupon-audience')?.value || 'all';
  const isActive = document.getElementById('coupon-active')?.value !== 'false';
  const description = (document.getElementById('coupon-description')?.value || '').trim();

  if (!code || code.length < 3) throw new Error('Coupon code must be at least 3 characters');
  if (!/^[A-Z0-9_-]+$/.test(code)) throw new Error('Coupon code can use only letters, numbers, hyphen and underscore');
  if (!value || value <= 0) throw new Error('Discount value must be greater than 0');
  if (type === 'percent' && value > 90) throw new Error('Percentage coupon cannot exceed 90%');
  if (minOrderValue < 0 || maxUses < 0) throw new Error('Limits cannot be negative');

  return { code, title, type, value, minOrderValue, maxUses, expiresAt, audience, isActive, description };
}

async function saveCoupon() {
  try {
    const payload = getCouponPayload();
    const url = EDIT_COUPON_ID ? `${COUPON_API_BASE}/admin/${EDIT_COUPON_ID}` : `${COUPON_API_BASE}/admin`;
    const method = EDIT_COUPON_ID ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAdminToken()}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Coupon save failed');

    showToast(EDIT_COUPON_ID ? '🔥 Coupon updated' : '🔥 Coupon created');
    closeCouponModal();
    await loadCoupons();
  } catch (err) {
    showToast(`❌ ${err.message}`);
  }
}

async function toggleCouponStatus(id) {
  const coupon = REAL_COUPONS.find(c => String(c._id) === String(id));
  if (!coupon) return showToast('❌ Coupon not found');

  try {
    const res = await fetch(`${COUPON_API_BASE}/admin/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAdminToken()}`
      },
      body: JSON.stringify({ isActive: coupon.isActive === false })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Status update failed');
    showToast('🔥 Coupon status updated');
    await loadCoupons();
  } catch (err) {
    showToast(`❌ ${err.message}`);
  }
}

async function deleteCoupon(id) {
  if (!confirm('Delete this coupon code?')) return;

  try {
    const res = await fetch(`${COUPON_API_BASE}/admin/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getAdminToken()}` }
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Delete failed');
    showToast('🔥 Coupon deleted');
    await loadCoupons();
  } catch (err) {
    showToast(`❌ ${err.message}`);
  }
}


/* ============================================================
   PADDOX Admin Phase A4.7A.2 — Digital Assets Final Polish
   Fixes product-state crashes and upgrades wallpaper upload UX.
   ============================================================ */
(function(){
  window.REAL_PRODUCTS = REAL_PRODUCTS;
  window.REAL_ASSETS = REAL_ASSETS;

  function assetToken() { return getAdminToken?.() || ''; }
  function assetMoney(n) { return `₹${Number(n || 0).toLocaleString('en-IN')}`; }
  function assetEsc(v='') { return String(v ?? '').replace(/[&<>"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m])); }
  function assetFileUrl(asset, kind='desktop') {
    return asset?.[kind]?.url || asset?.thumbnail?.url || asset?.image?.url || asset?.url || '';
  }

  function ensureAssetModalMarkup() {
    if (!document.getElementById('asset-modal')) {
      const modal = document.createElement('div');
      modal.id = 'asset-modal';
      modal.className = 'asset-modal-shell';
      modal.innerHTML = `
        <div class="asset-modal-backdrop" onclick="closeAssetModal(event)">
          <div class="asset-modal-card" onclick="event.stopPropagation()">
            <button class="asset-modal-close" type="button" onclick="closeAssetModal()">×</button>
            <div class="asset-modal-kicker">DIGITAL ASSET UPLOAD</div>
            <h2>WALLPAPER COMMAND UPLOAD</h2>
            <p class="asset-modal-sub">Upload desktop and mobile wallpaper variants, set free/premium access and display pricing from one PADDOX workspace.</p>

            <div class="asset-form-grid">
              <label><span>Wallpaper Title</span><input id="asset-name" class="adm-input" placeholder="Mercedes Silverstone Win"/></label>
              <label><span>Category</span><select id="asset-category" class="adm-select"><option value="cars">Cars</option><option value="drivers">Drivers</option><option value="circuits">Circuits</option><option value="abstract art">Abstract Art</option><option value="wallpaper">Wallpaper</option></select></label>
              <label><span>Access Type</span><select id="asset-type" class="adm-select" onchange="toggleAssetPriceField()"><option value="free">Free</option><option value="premium">Premium</option></select></label>
              <label><span>Premium Price</span><input id="asset-price" class="adm-input" type="number" min="0" value="0" placeholder="99" disabled/></label>
              <label><span>Wallpaper Type</span><select id="asset-orientation" class="adm-select"><option value="desktop">Desktop only</option><option value="mobile">Mobile only</option><option value="both">Desktop + Mobile</option></select></label>
              <label><span>Display Resolution</span><input id="asset-resolution" class="adm-input" value="4K" placeholder="4K / 8K / HD"/></label>
            </div>

            <div class="asset-upload-grid-modal">
              <label class="asset-drop-mini" id="asset-desktop-drop"><input id="asset-desktop-file" type="file" accept="image/*" hidden/><strong>Desktop Wallpaper</strong><span>16:9 / 4K recommended</span><em id="asset-desktop-name">No file selected</em></label>
              <label class="asset-drop-mini" id="asset-mobile-drop"><input id="asset-mobile-file" type="file" accept="image/*" hidden/><strong>Mobile Wallpaper</strong><span>9:16 / phone lockscreen</span><em id="asset-mobile-name">No file selected</em></label>
              <label class="asset-drop-mini" id="asset-thumb-drop"><input id="asset-thumb-file" type="file" accept="image/*" hidden/><strong>Thumbnail</strong><span>Optional preview cover</span><em id="asset-thumb-name">No file selected</em></label>
            </div>

            <label class="asset-desc-label"><span>Description / Tags</span><textarea id="asset-description" class="adm-input" rows="3" placeholder="Short description, tags, collection info"></textarea></label>

            <div class="asset-modal-actions">
              <button class="adm-btn-ghost" type="button" onclick="closeAssetModal()">Cancel</button>
              <button class="adm-btn-red" type="button" onclick="submitAssetUpload()">Upload Wallpaper</button>
            </div>
          </div>
        </div>`;
      document.body.appendChild(modal);
    }
    bindAssetMiniDrops();
    toggleAssetPriceField();
  }

  function bindAssetMiniDrops() {
    [
      ['asset-desktop-file','asset-desktop-name'],
      ['asset-mobile-file','asset-mobile-name'],
      ['asset-thumb-file','asset-thumb-name']
    ].forEach(([inputId, labelId]) => {
      const input = document.getElementById(inputId);
      const label = document.getElementById(labelId);
      if (!input || input.dataset.bound) return;
      input.dataset.bound = '1';
      input.addEventListener('change', () => {
        label.textContent = input.files?.[0]?.name || 'No file selected';
      });
    });
  }

  window.toggleAssetPriceField = function toggleAssetPriceField() {
    const type = document.getElementById('asset-type')?.value || 'free';
    const price = document.getElementById('asset-price');
    if (price) {
      price.disabled = type !== 'premium';
      if (type !== 'premium') price.value = '0';
    }
  };

  window.openAssetModal = function openAssetModal() {
    ensureAssetModalMarkup();
    document.getElementById('asset-modal')?.classList.add('show');
  };

  window.closeAssetModal = function closeAssetModal(event) {
    if (event && !event.target.classList.contains('asset-modal-backdrop')) return;
    document.getElementById('asset-modal')?.classList.remove('show');
  };

  window.submitAssetUpload = async function submitAssetUpload() {
    try {
      ensureAssetModalMarkup();
      const desktop = document.getElementById('asset-desktop-file')?.files?.[0] || null;
      const mobile = document.getElementById('asset-mobile-file')?.files?.[0] || null;
      const thumb = document.getElementById('asset-thumb-file')?.files?.[0] || null;
      if (!desktop && !mobile) return showToast('❌ Upload desktop or mobile wallpaper');

      const formData = new FormData();
      if (desktop) formData.append('desktop', desktop);
      if (mobile) formData.append('mobile', mobile);
      if (thumb) formData.append('thumbnail', thumb);
      formData.append('name', document.getElementById('asset-name')?.value || desktop?.name || mobile?.name || 'PADDOX Wallpaper');
      formData.append('category', document.getElementById('asset-category')?.value || 'wallpaper');
      formData.append('type', document.getElementById('asset-type')?.value || 'free');
      formData.append('price', document.getElementById('asset-price')?.value || '0');
      formData.append('orientation', document.getElementById('asset-orientation')?.value || (desktop && mobile ? 'both' : mobile ? 'mobile' : 'desktop'));
      formData.append('resolution', document.getElementById('asset-resolution')?.value || '4K');
      formData.append('description', document.getElementById('asset-description')?.value || 'Uploaded from PADDOX Admin');

      showToast('⬆ Uploading wallpaper...');
      const res = await fetch(`${ASSET_API_BASE}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${assetToken()}` },
        body: formData
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) throw new Error(data.message || 'Upload failed');
      closeAssetModal();
      showToast('🔥 Wallpaper uploaded');
      await loadAssets();
    } catch (err) {
      console.error(err);
      showToast(`❌ ${err.message}`);
    }
  };

  window.loadAssets = async function loadAssets() {
    try {
      const res = await fetch(`${ASSET_API_BASE}?limit=80`);
      const data = await res.json().catch(() => ({}));
      REAL_ASSETS = data.data?.assets || data.data || data.assets || [];
      window.REAL_ASSETS = REAL_ASSETS;
      renderAssets();
    } catch (err) {
      console.error(err);
      showToast('❌ Failed to load assets');
      REAL_ASSETS = [];
      renderAssets();
    }
  };

  window.renderAssets = function renderAssets() {
    const grid = document.getElementById('assets-grid');
    if (!grid) return;
    const totalEl = document.querySelector('.asset-meta-info');
    if (totalEl) {
      const premium = REAL_ASSETS.filter(a => a.type === 'premium').length;
      totalEl.textContent = `${REAL_ASSETS.length} assets · ${premium} premium · desktop/mobile ready`;
    }
    if (!REAL_ASSETS.length) {
      grid.innerHTML = `<div class="asset-empty-premium"><strong>No digital assets yet</strong><span>Upload desktop and mobile wallpaper versions from the command center.</span></div>`;
      return;
    }
    grid.innerHTML = REAL_ASSETS.map(asset => {
      const cover = asset.thumbnail?.url || asset.image?.url || asset.desktop?.url || asset.mobile?.url || '';
      const isPremium = asset.type === 'premium';
      const hasDesktop = !!(asset.desktop?.url || asset.image?.url);
      const hasMobile = !!asset.mobile?.url;
      return `
        <article class="asset-card asset-card-pro ${isPremium ? 'is-premium' : 'is-free'}">
          <div class="asset-thumb asset-thumb-pro">
            ${cover ? `<img src="${assetEsc(cover)}" alt="${assetEsc(asset.name)}"/>` : '<div class="asset-no-preview">PADDOX</div>'}
            <span class="asset-access-badge ${isPremium ? 'premium' : 'free'}">${isPremium ? `Premium · ${assetMoney(asset.price)}` : 'Free · Login required'}</span>
            <span class="asset-format-badge">${String(asset.orientation || 'desktop').toUpperCase()}</span>
          </div>
          <div class="asset-info asset-info-pro">
            <div class="asset-name">${assetEsc(asset.name || 'Untitled Wallpaper')}</div>
            <div class="asset-meta">${assetEsc(asset.category || 'wallpaper')} · ${assetEsc(asset.resolution || 'HD')}</div>
            <div class="asset-variant-row">
              <span class="${hasDesktop ? 'on' : ''}">Desktop</span>
              <span class="${hasMobile ? 'on' : ''}">Mobile</span>
              <span>${Number(asset.downloads || 0).toLocaleString()} downloads</span>
            </div>
            <div class="asset-actions asset-actions-pro">
              <button class="asset-btn" onclick="previewAsset('${assetEsc(cover)}')">Preview</button>
              <button class="asset-btn" onclick="openEditAsset('${asset._id}','${assetEsc(asset.name)}','${assetEsc(asset.category)}','${assetEsc(asset.type)}','${assetEsc(asset.resolution)}')">Edit</button>
              <button class="asset-btn danger" onclick="deleteAsset('${asset._id}')">Delete</button>
            </div>
          </div>
        </article>`;
    }).join('');
  };

  window.bindDigitalAssetPolish = function bindDigitalAssetPolish() {
    ensureAssetModalMarkup();
    const zone = document.getElementById('upload-zone');
    if (!zone || zone.dataset.a47a2Bound) return;
    zone.dataset.a47a2Bound = '1';
    zone.addEventListener('click', () => openAssetModal());
    ['dragenter','dragover'].forEach(ev => zone.addEventListener(ev, e => { e.preventDefault(); zone.classList.add('drag-over'); }));
    ['dragleave','drop'].forEach(ev => zone.addEventListener(ev, e => { e.preventDefault(); zone.classList.remove('drag-over'); }));
    zone.addEventListener('drop', e => {
      openAssetModal();
      const file = e.dataTransfer?.files?.[0];
      if (!file) return;
      const input = document.getElementById('asset-desktop-file');
      const dt = new DataTransfer();
      dt.items.add(file);
      input.files = dt.files;
      document.getElementById('asset-desktop-name').textContent = file.name;
      if (!document.getElementById('asset-name').value) document.getElementById('asset-name').value = file.name.replace(/\.[^.]+$/, '');
    });
  };

  const oldSwitchPage = window.switchPage || switchPage;
  if (typeof oldSwitchPage === 'function') {
    window.switchPage = function patchedSwitchPage(id) {
      oldSwitchPage(id);
      if (id === 'assets') {
        bindDigitalAssetPolish();
        loadAssets();
      }
    };
  }

  window.addEventListener('load', () => {
    ensureAssetModalMarkup();
    bindDigitalAssetPolish();
  });
})();
