/* ============================================================
   PADDOX — admin.js   |   Admin Dashboard Logic
   ============================================================ */
'use strict';
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
/* ══ DATA ══ */


const ADM_USERS = [
  { name:'Arjun Mehta',   email:'arjun@example.com',   tier:'Pro Fan', orders:7, pts:4820, joined:'Jan 2025', status:'s-act', stxt:'Active'   },
  { name:'Priya Sharma',  email:'priya@example.com',   tier:'Pro Fan', orders:5, pts:4210, joined:'Feb 2025', status:'s-act', stxt:'Active'   },
  { name:'Rohan Das',     email:'rohan@example.com',   tier:'Regular', orders:3, pts:3980, joined:'Mar 2025', status:'s-act', stxt:'Active'   },
  { name:'Kenji Tanaka',  email:'kenji@example.com',   tier:'Regular', orders:4, pts:3450, joined:'Mar 2025', status:'s-act', stxt:'Active'   },
  { name:'Sofia García',  email:'sofia@example.com',   tier:'Regular', orders:2, pts:3120, joined:'Apr 2025', status:'s-act', stxt:'Active'   },
  { name:'Liam Chen',     email:'liam@example.com',    tier:'New',     orders:1, pts:500,  joined:'May 2025', status:'s-act', stxt:'Active'   },
  { name:'Nadia Roy',     email:'nadia@example.com',   tier:'Regular', orders:2, pts:1800, joined:'Apr 2025', status:'s-ina', stxt:'Inactive' },
];



const ADM_MOD = [
  { type:'Review',      user:'anonymous_fan_99',  content:'"Absolute trash, never buying again. Service is terrible and product is fake."', flag:'Spam / Hostile',   time:'2 hours ago' },
  { type:'Poll Comment',user:'racer_dude_21',     content:'"Leclerc only wins because Ferrari cheats lol"',                                  flag:'Misinformation',   time:'5 hours ago' },
  { type:'Review',      user:'deleted_user_4821', content:'"Good product but took 3 weeks to arrive"',                                       flag:'Flagged by user',  time:'1 day ago'   },
];

const TRAFFIC_DATA    = [{ name:'Organic Search', pct:72, color:'var(--red)' },{ name:'Social Media', pct:54, color:'var(--blue)' },{ name:'Direct', pct:38, color:'var(--gold)' },{ name:'Referral', pct:22, color:'var(--green)' },{ name:'Email', pct:14, color:'var(--orange)' }];
const TOP_PRODUCTS    = [{ name:'Monaco Watch', val:'₹3.2L', pct:88, color:'var(--red)' },{ name:'F1 Helmet', val:'₹2.8L', pct:74, color:'var(--gold)' },{ name:'RB20 Tee', val:'₹1.9L', pct:60, color:'var(--blue)' },{ name:'SF-25 Cap', val:'₹1.4L', pct:48, color:'var(--green)' }];
const GEO_DATA        = [{ name:'🇮🇳 India', val:'65%', pct:65, color:'var(--red)' },{ name:'🇬🇧 United Kingdom', val:'12%', pct:12, color:'var(--blue)' },{ name:'🇯🇵 Japan', val:'8%', pct:8, color:'var(--gold)' },{ name:'🇩🇪 Germany', val:'6%', pct:6, color:'var(--green)' },{ name:'🌍 Others', val:'9%', pct:9, color:'var(--muted)' }];
const ENGAGEMENT_DATA = [{ name:'Poll Participation', val:'84%', pct:84, color:'var(--red)' },{ name:'Trivia Completion', val:'61%', pct:61, color:'var(--blue)' },{ name:'Wallpaper Downloads', val:'78%', pct:78, color:'var(--green)' },{ name:'Newsletter Open Rate', val:'42%', pct:42, color:'var(--gold)' }];

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
  overview:   { title:'OVERVIEW',        action:'+ Add Product',  fn:()=>openAddModal() },
  orders:     { title:'ORDERS',          action:'Export CSV',     fn:()=>showToast('📥 Exporting orders…') },
  products:   { title:'PRODUCTS',        action:'+ Add Product',  fn:()=>openAddModal() },
  inventory:  { title:'INVENTORY',       action:'Restock All',    fn:()=>showToast('✓ Restock request sent!') },
  assets: {
  title:'DIGITAL ASSETS',
  action:'+ Upload Asset',
  fn:()=>openAssetModal()
},
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
  if (actionBtn) { actionBtn.textContent = meta.action; actionBtn.onclick = meta.fn; }
  if (id === 'products') {
  loadProducts();
}

if (id === 'assets') {
  loadAssets();
}
if (id === 'orders') {
  loadOrders();
}
if (id === 'inventory') {
  loadProducts();
}
if (id === 'users') {
  loadUsers();
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
          No realtime orders yet
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
   REALTIME OVERVIEW DASHBOARD
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
      change: 'Realtime from orders'
    },
    {
      label: 'Total Orders',
      value: REAL_ORDERS.length,
      change: 'Realtime orders'
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
          No realtime orders yet
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

function updateOverviewRealtime() {
  updateOverviewCards();
  updateOverviewRecentOrders();
  updateOverviewLowStock();
  updateOverviewRevenueChart();
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

  } catch(err) {

    console.error(err);

    showToast('❌ Failed to load products');
  }
}

function renderProducts() {

  const tbody =
    document.getElementById('products-tbody');

  if (!tbody) return;

  if (!REAL_PRODUCTS.length) {

    tbody.innerHTML = `
      <tr>
        <td colspan="8"
          style="
            text-align:center;
            padding:40px;
            color:#777;
          ">
          No realtime products yet
        </td>
      </tr>
    `;

    return;
  }

  tbody.innerHTML =
    REAL_PRODUCTS.map(product => {

      const image =
        product.images?.[0]?.url ||
        'https://via.placeholder.com/80';

      return `
        <tr>

          <td>
            <input type="checkbox"/>
          </td>

          <td>
            <div style="
              display:flex;
              align-items:center;
              gap:10px;
            ">

              <img
                src="${image}"
                style="
                  width:42px;
                  height:42px;
                  object-fit:cover;
                  border-radius:8px;
                "
              >

              <span>${product.name}</span>
            </div>
          </td>

          <td>
            ${product.category}
          </td>

          <td>
            ${product.team}
          </td>

          <td>
            ₹${product.price}
          </td>

          <td>
            ${product.stock}
          </td>

          <td>
            <span class="sb s-act">
              Active
            </span>
          </td>

          <td>

            <button
              class="act-btn"
              onclick="openProductEditModal('${product._id}')"
            >
              Edit
            </button>

            <button
              class="act-btn"
              onclick="deleteProduct('${product._id}')"
            >
              Delete
            </button>

          </td>

        </tr>
      `;
    }).join('');
}


/* ══ INVENTORY TABLE — REALTIME ══ */
function getProductStockStatus(product) {
  const stock = Number(product.stock || 0);

  if (stock <= 0) {
    return {
      cls: 's-out',
      label: 'Out of Stock',
      bar: 'var(--red)'
    };
  }

  if (stock <= 10) {
    return {
      cls: 's-low',
      label: 'Low Stock',
      bar: 'var(--orange)'
    };
  }

  return {
    cls: 's-act',
    label: 'In Stock',
    bar: 'var(--green)'
  };
}

function productSku(product, index) {
  if (product.sku) return product.sku;

  const category =
    String(product.category || 'PRD')
      .slice(0, 3)
      .toUpperCase();

  return `PDX-${category}-${String(index + 1).padStart(3, '0')}`;
}

function renderInventory() {
  const tbody = document.getElementById('inventory-tbody');

  if (!tbody) return;

  if (!REAL_PRODUCTS.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;padding:40px;color:#777">
          No realtime inventory yet
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = REAL_PRODUCTS.map((product, index) => {
    const stock = Number(product.stock || 0);
    const maxStock = Math.max(100, stock, Number(product.originalStock || 0));
    const pct = Math.min(100, Math.round((stock / maxStock) * 100));
    const status = getProductStockStatus(product);

    const image =
      product.images?.[0]?.url ||
      product.image ||
      '';

    return `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            ${
              image
                ? `<img src="${image}" style="width:34px;height:34px;object-fit:cover;border-radius:8px">`
                : `<span style="font-size:1.2rem">📦</span>`
            }
            <div>
              <div style="font-weight:700;color:#fff">
                ${product.name || 'Product'}
              </div>
              <div style="font-size:.72rem;color:#777">
                ${product.category || '-'} · ${product.team || '-'}
              </div>
            </div>
          </div>
        </td>

        <td style="font-family:var(--font-c);letter-spacing:1px;color:var(--muted2)">
          ${productSku(product, index)}
        </td>

        <td style="font-weight:700;color:${stock <= 0 ? 'var(--red)' : stock <= 10 ? 'var(--orange)' : 'var(--white)'}">
          ${stock} units
        </td>

        <td>
          <div class="stk-bar-wrap">
            <div
              class="stk-bar"
              style="width:${pct}%;background:${status.bar}"
            ></div>
          </div>
        </td>

        <td style="color:var(--muted)">
          10 units
        </td>

        <td>
          <span class="sb ${status.cls}">
            ${status.label}
          </span>
        </td>

        <td>
          <button
            class="act-btn"
            onclick="openRestockPrompt('${product._id}')"
          >
            Restock
          </button>

          <button
            class="act-btn"
            onclick="quickSetStock('${product._id}', 0)"
          >
            Mark Out
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function openRestockPrompt(productId) {
  const product = REAL_PRODUCTS.find(p => String(p._id) === String(productId));

  if (!product) {
    showToast('❌ Product not found');
    return;
  }

  const currentStock = Number(product.stock || 0);

  const amount = prompt(
    `Enter new stock quantity for ${product.name}`,
    String(Math.max(currentStock, 10))
  );

  if (amount === null) return;

  const stock = Number(amount);

  if (Number.isNaN(stock) || stock < 0) {
    showToast('❌ Enter a valid stock number');
    return;
  }

  updateProductStock(productId, stock);
}

async function quickSetStock(productId, stock) {
  if (!confirm(`Set stock to ${stock}?`)) return;

  await updateProductStock(productId, stock);
}

async function updateProductStock(productId, stock) {
  try {
    showToast('⏳ Updating stock...');

    const res = await fetch(
      `${PRODUCT_API_BASE}/${productId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAdminToken()}`
        },
        body: JSON.stringify({
          stock: Number(stock)
        })
      }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || 'Stock update failed');
    }

    showToast('🔥 Stock updated');

    await loadProducts();
    updateOverviewRealtime();

  } catch (err) {
    console.error(err);
    showToast(`❌ ${err.message}`);
  }
}


/* ══ DIGITAL ASSETS GRID ══ */
/* ═══════════════════════════════════════
   REAL DIGITAL ASSETS SYSTEM
═══════════════════════════════════════ */

const ASSET_API_BASE = 'https://paddox-backend.onrender.com/api/assets';
const PRODUCT_API_BASE =
  'https://paddox-backend.onrender.com/api/products';

let REAL_PRODUCTS = [];

let REAL_ASSETS = [];
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

    showToast('🔥 Wallpaper uploaded');

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
   REALTIME USERS SYSTEM
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
          No realtime users yet
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

/* ══ ANALYTICS METRICS ══ */
function renderMetList(id, data) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = data.map(d => `
    <div class="met-row">
      <span class="met-name">${d.name}</span>
      <div class="met-bar-wrap">
        <div class="met-bar" style="width:0%;background:${d.color}" data-w="${d.pct}%"></div>
      </div>
      <span class="met-val">${d.val || d.pct+'%'}</span>
    </div>
  `).join('');
  /* Animate bars */
  setTimeout(() => {
    el.querySelectorAll('.met-bar').forEach(b => { b.style.transition = 'width 1s ease'; b.style.width = b.dataset.w; });
  }, 200);
}
renderMetList('traffic-list',    TRAFFIC_DATA);
renderMetList('top-products-list', TOP_PRODUCTS);
renderMetList('geo-list',        GEO_DATA);
renderMetList('engagement-list', ENGAGEMENT_DATA);

/* ══ MODERATION ══ */
function renderModeration() {
  const list = document.getElementById('mod-list');
  if (!list) return;
  list.innerHTML = ADM_MOD.map((m, i) => `
    <div class="mod-item" id="mod-item-${i}">
      <div class="mod-item-head">
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <span class="mod-type">${m.type}</span>
          <span class="mod-user">@${m.user} · ${m.time}</span>
        </div>
        <span class="mod-flag">⚑ ${m.flag}</span>
      </div>
      <div class="mod-content">${m.content}</div>
      <div class="mod-actions">
        <button class="act-btn" onclick="modAction(${i},'approve')">✓ Approve</button>
        <button class="act-btn" onclick="modAction(${i},'remove')">✗ Remove</button>
        <button class="act-btn" onclick="modAction(${i},'warn')">⚑ Warn User</button>
        <button class="act-btn" onclick="modAction(${i},'ban')">Ban User</button>
      </div>
    </div>
  `).join('');
}
renderModeration();

function modAction(i, action) {
  const item = document.getElementById(`mod-item-${i}`);
  if (item) { item.style.opacity = '.3'; item.style.pointerEvents = 'none'; }
  const msgs = { approve:'✓ Content approved', remove:'✗ Content removed', warn:'⚑ User warned', ban:'🚫 User banned' };
  showToast(msgs[action] || 'Action taken');
}



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
   REALTIME PRODUCT EDIT SYSTEM
══════════════════════════════════════ */

let EDIT_PRODUCT_ID = null;

function ensureProductEditModal() {
  if (document.getElementById('product-edit-modal')) return;

  const modal = document.createElement('div');

  modal.id = 'product-edit-modal';

  modal.innerHTML = `
    <div class="preview-overlay" id="product-edit-overlay">
      <div class="preview-card" style="
        max-width:720px;
        width:92vw;
        padding:28px;
        color:#fff;
        text-align:left;
      ">
        <button class="preview-close" id="product-edit-close">
          ✕
        </button>

        <div style="
          font-family:var(--font-d);
          letter-spacing:4px;
          font-size:1.8rem;
          margin-bottom:8px;
        ">
          EDIT PRODUCT
        </div>

        <div style="
          color:var(--red);
          font-family:var(--font-c);
          letter-spacing:2px;
          margin-bottom:22px;
        ">
          REALTIME MONGODB PRODUCT
        </div>

        <div style="
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:14px;
        ">
          <label style="display:flex;flex-direction:column;gap:6px">
            <span style="color:#777;font-size:.75rem;letter-spacing:2px">NAME</span>
            <input id="edit-product-name" class="edit-product-input">
          </label>

          <label style="display:flex;flex-direction:column;gap:6px">
            <span style="color:#777;font-size:.75rem;letter-spacing:2px">TEAM</span>
            <input id="edit-product-team" class="edit-product-input">
          </label>

          <label style="display:flex;flex-direction:column;gap:6px">
            <span style="color:#777;font-size:.75rem;letter-spacing:2px">CATEGORY</span>
            <select id="edit-product-category" class="edit-product-input">
              <option value="apparel">apparel</option>
              <option value="collectibles">collectibles</option>
              <option value="accessories">accessories</option>
              <option value="posters">posters</option>
              <option value="custom">custom</option>
            </select>
          </label>

          <label style="display:flex;flex-direction:column;gap:6px">
            <span style="color:#777;font-size:.75rem;letter-spacing:2px">BADGE</span>
            <select id="edit-product-badge" class="edit-product-input">
              <option value="">none</option>
              <option value="new">new</option>
              <option value="hot">hot</option>
              <option value="sale">sale</option>
              <option value="ltd">ltd</option>
            </select>
          </label>

          <label style="display:flex;flex-direction:column;gap:6px">
            <span style="color:#777;font-size:.75rem;letter-spacing:2px">PRICE</span>
            <input id="edit-product-price" type="number" min="0" class="edit-product-input">
          </label>

          <label style="display:flex;flex-direction:column;gap:6px">
            <span style="color:#777;font-size:.75rem;letter-spacing:2px">SALE PRICE</span>
            <input id="edit-product-sale-price" type="number" min="0" class="edit-product-input">
          </label>

          <label style="display:flex;flex-direction:column;gap:6px">
            <span style="color:#777;font-size:.75rem;letter-spacing:2px">STOCK</span>
            <input id="edit-product-stock" type="number" min="0" class="edit-product-input">
          </label>

          <label style="display:flex;flex-direction:column;gap:6px">
            <span style="color:#777;font-size:.75rem;letter-spacing:2px">STATUS</span>
            <select id="edit-product-active" class="edit-product-input">
              <option value="true">active</option>
              <option value="false">inactive</option>
            </select>
          </label>
        </div>

        <label style="
          display:flex;
          flex-direction:column;
          gap:6px;
          margin-top:14px;
        ">
          <span style="color:#777;font-size:.75rem;letter-spacing:2px">UPLOAD NEW IMAGE</span>
          <input id="edit-product-image-file" type="file" accept="image/*" class="edit-product-input">
          <small style="color:#777">Leave empty to keep current image.</small>
        </label>

        <label style="
          display:flex;
          flex-direction:column;
          gap:6px;
          margin-top:14px;
        ">
          <span style="color:#777;font-size:.75rem;letter-spacing:2px">DESCRIPTION</span>
          <textarea id="edit-product-description" class="edit-product-input" rows="4"></textarea>
        </label>

        <button
          class="act-btn"
          id="save-product-edit"
          style="
            width:100%;
            padding:14px;
            margin-top:20px;
            background:var(--red);
            color:white;
            border:0;
            font-weight:800;
            letter-spacing:3px;
          "
        >
          SAVE PRODUCT
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const style = document.createElement('style');
  style.id = 'product-edit-style';
  style.textContent = `
    .edit-product-input {
      width:100%;
      background:#151515;
      color:#fff;
      border:1px solid rgba(255,255,255,.15);
      padding:11px 12px;
      outline:none;
      font-family:var(--font-b);
    }
    .edit-product-input:focus {
      border-color:var(--red);
    }
    @media(max-width:700px) {
      #product-edit-modal .preview-card > div[style*="grid-template-columns"] {
        grid-template-columns:1fr !important;
      }
    }
  `;
  document.head.appendChild(style);

  modal.querySelector('#product-edit-close').onclick =
    closeProductEditModal;

  modal.querySelector('#product-edit-overlay').onclick = e => {
    if (e.target.id === 'product-edit-overlay') {
      closeProductEditModal();
    }
  };

  modal.querySelector('#save-product-edit').onclick =
    saveProductEdit;
}

function openProductEditModal(productId) {
  ensureProductEditModal();

  const product =
    REAL_PRODUCTS.find(p => String(p._id) === String(productId));

  if (!product) {
    showToast('❌ Product not found');
    return;
  }

  EDIT_PRODUCT_ID = productId;

  const image =
    product.images?.[0]?.url ||
    product.image ||
    '';

  document.getElementById('edit-product-name').value =
    product.name || '';

  document.getElementById('edit-product-team').value =
    product.team || '';

  document.getElementById('edit-product-category').value =
    String(product.category || 'apparel').toLowerCase();

  document.getElementById('edit-product-badge').value =
    String(product.badge || '').toLowerCase();

  document.getElementById('edit-product-price').value =
    Number(product.price || 0);

  document.getElementById('edit-product-sale-price').value =
    product.salePrice || '';

  document.getElementById('edit-product-stock').value =
    Number(product.stock || 0);

  document.getElementById('edit-product-active').value =
    String(product.isActive !== false);

  const editImageFile = document.getElementById('edit-product-image-file');
  if (editImageFile) editImageFile.value = '';

  document.getElementById('edit-product-description').value =
    product.description || '';

  document
    .getElementById('product-edit-modal')
    ?.classList.add('show');
}

function closeProductEditModal() {
  document
    .getElementById('product-edit-modal')
    ?.classList.remove('show');

  EDIT_PRODUCT_ID = null;
}

async function saveProductEdit() {
  if (!EDIT_PRODUCT_ID) return;

  try {
    const price =
      Number(document.getElementById('edit-product-price').value);

    const salePriceRaw =
      document.getElementById('edit-product-sale-price').value;

    const stock =
      Number(document.getElementById('edit-product-stock').value);

    if (!document.getElementById('edit-product-name').value.trim()) {
      showToast('❌ Product name required');
      return;
    }

    if (Number.isNaN(price) || price < 0) {
      showToast('❌ Valid price required');
      return;
    }

    if (Number.isNaN(stock) || stock < 0) {
      showToast('❌ Valid stock required');
      return;
    }

    const imageFile =
      document.getElementById('edit-product-image-file')?.files?.[0] || null;

    const imageUrl =
      imageFile ? await readImageFileAsDataUrl(imageFile) : '';

    const body = {
      name: document.getElementById('edit-product-name').value.trim(),
      team: document.getElementById('edit-product-team').value.trim(),
      category: normaliseCategory(document.getElementById('edit-product-category').value),
      badge: normaliseBadge(document.getElementById('edit-product-badge').value),
      price,
      stock,
      isActive: document.getElementById('edit-product-active').value === 'true',
      description: document.getElementById('edit-product-description').value.trim()
    };

    if (salePriceRaw !== '') {
      body.salePrice = Number(salePriceRaw);
      body.onSale = Number(salePriceRaw) > 0 && Number(salePriceRaw) < price;
    } else {
      body.salePrice = null;
      body.onSale = false;
    }

    if (imageUrl) {
      body.images = [
        {
          url: imageUrl,
          alt: body.name
        }
      ];
    }

    showToast('⏳ Saving product...');

    const res = await fetch(
      `${PRODUCT_API_BASE}/${EDIT_PRODUCT_ID}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAdminToken()}`
        },
        body: JSON.stringify(body)
      }
    );

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
   REALTIME ADD PRODUCT SYSTEM
══════════════════════════════════════ */

function getAddValue(id) {
  return document.getElementById(id)?.value?.trim() || '';
}

async function saveNewProduct() {
  try {
    const name = getAddValue('add-product-name');
    const team = getAddValue('add-product-team');
    const category = normaliseCategory(getAddValue('add-product-category'));
    const badge = normaliseBadge(getAddValue('add-product-badge'));
    const price = Number(getAddValue('add-product-price'));
    const stock = Number(getAddValue('add-product-stock'));
    const description =
      getAddValue('add-product-description') ||
      `${name} from Paddox store`;

    const imageFile =
      document.getElementById('add-product-image')?.files?.[0] || null;

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

    if (Number.isNaN(stock) || stock < 0) {
      showToast('❌ Valid stock required');
      return;
    }

    let imageUrl = '';

    if (imageFile) {
      showToast('🖼️ Preparing image...');
      imageUrl = await readImageFileAsDataUrl(imageFile);
    }

    const productPayload = {
      name,
      team,
      category,
      badge,
      price,
      stock,
      description,
      shortDesc: description.slice(0, 180),
      isActive: true,
      isFeatured: false,
      images: imageUrl
        ? [{ url: imageUrl, alt: name }]
        : [{
            url: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=80',
            alt: name
          }]
    };

    showToast('⏳ Saving product...');

    const res = await fetch(
      PRODUCT_API_BASE,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAdminToken()}`
        },
        body: JSON.stringify(productPayload)
      }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || 'Product create failed');
    }

    showToast('🔥 Product added successfully');

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
    'add-product-stock',
    'add-product-description',
    'add-product-image'
  ].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  const team = document.getElementById('add-product-team');
  if (team) team.value = 'Ferrari';

  const category = document.getElementById('add-product-category');
  if (category) category.value = 'apparel';

  const badge = document.getElementById('add-product-badge');
  if (badge) badge.value = '';
}

/* ══ ADD PRODUCT MODAL ══ */
function openAddModal() {
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
async function deleteProduct(id) {

  try {

    const res =
      await fetch(
        `${PRODUCT_API_BASE}/${id}`,
        {
          method:'DELETE'
        }
      );

    if (!res.ok)
      throw new Error();

    showToast('🔥 Product deleted');

    loadProducts();

  } catch(err) {

    console.error(err);

    showToast('❌ Delete failed');
  }
}


/* ══════════════════════════════════════
   SAFE INITIAL ADMIN LOAD
══════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', async () => {
  const allowed = await checkAdminAccess();

  if (!allowed) return;

  await Promise.allSettled([
    loadOrders(),
    loadProducts(),
    loadAssets(),
    loadUsers()
  ]);

  updateOverviewRealtime();
});

/* ══ INIT LOG ══ */
console.log('%c⚙️ PADDOX — Admin Dashboard Loaded', 'color:#e8002d;font-size:14px;font-weight:bold;');