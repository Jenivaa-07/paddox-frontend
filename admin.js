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
    const res = await fetch('https://paddox-backend.onrender.com/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      localStorage.removeItem('token');
      localStorage.removeItem('paddox_access_token');
      localStorage.removeItem('accessToken');

      redirectToLogin('Session expired. Please login again.');
      return false;
    }

    const user = data.data?.user || data.data;

    if (!user?.isAdmin) {
      redirectToLogin('Admin access only. Please login with admin account.');
      return false;
    }

    return true;

  } catch (err) {
    console.error(err);
    redirectToLogin('Unable to verify admin access');
    return false;
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
      redirectToLogin('Please login as admin first');
      return;
    }

    const res = await fetch('https://paddox-backend.onrender.com/api/orders/admin/all', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json().catch(() => ({}));

    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('paddox_access_token');
      localStorage.removeItem('accessToken');

      redirectToLogin('Admin session expired. Please login again.');
      return;
    }

    if (!res.ok) {
      throw new Error(data.message || 'Failed to load orders');
    }

    REAL_ORDERS = data.data || data.orders || [];

    renderOrders();
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
    const token = getAdminToken();

    if (!token) {
      redirectToLogin('Please login as admin first');
      return;
    }

    showToast('⏳ Updating order status...');

    const res = await fetch(
      `https://paddox-backend.onrender.com/api/orders/admin/${orderId}/status`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status,
          message: `Order status changed to ${status}`
        })
      }
    );

    const data = await res.json().catch(() => ({}));

    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('paddox_access_token');
      localStorage.removeItem('accessToken');

      redirectToLogin('Admin session expired. Please login again.');
      return;
    }

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
              onclick="showToast('✏ Edit coming next')"
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


/* ══ INVENTORY TABLE ══ */
function renderInventory() {
  const tbody = document.getElementById('inventory-tbody');
  if (!tbody) return;
  const skus = ['PDX-APP-001','PDX-APP-002','PDX-COL-001','PDX-APP-003','PDX-ART-001','PDX-COL-002','PDX-ACC-001','PDX-ACC-002'];
  tbody.innerHTML = REAL_PRODUCTS.map((p, i) => {
    const pct    = Math.min(100, Math.round(p.stock / 130 * 100));
    const sc     = p.stock === 0 ? 's-out' : p.stock < 10 ? 's-low' : 's-act';
    const sl     = p.stock === 0 ? 'Out of Stock' : p.stock < 10 ? 'Low Stock' : 'In Stock';
    const barClr = p.stock === 0 ? 'var(--red)' : p.stock < 10 ? 'var(--orange)' : 'var(--green)';
    return `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:1.1rem">${p.icon}</span> ${p.name}
          </div>
        </td>
        <td style="font-family:var(--font-c);letter-spacing:1px;color:var(--muted2)">${skus[i]}</td>
        <td style="font-weight:600;color:${p.stock===0?'var(--red)':p.stock<10?'var(--orange)':'var(--white)'}">${p.stock} units</td>
        <td>
          <div class="stk-bar-wrap">
            <div class="stk-bar" style="width:${pct}%;background:${barClr}"></div>
          </div>
        </td>
        <td style="color:var(--muted)">10 units</td>
        <td><span class="sb ${sc}">${sl}</span></td>
        <td><button class="act-btn" onclick="showToast('✓ Restock order placed for ${p.name}!')">Restock</button></td>
      </tr>
    `;
  }).join('');
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
/* ══ USERS TABLE ══ */
function renderUsers() {
  const tbody = document.getElementById('users-tbody');
  if (!tbody) return;
  tbody.innerHTML = ADM_USERS.map(u => `
    <tr>
      <td><input type="checkbox"/></td>
      <td>
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,var(--red),#800016);display:flex;align-items:center;justify-content:center;font-size:.8rem;flex-shrink:0">👤</div>
          ${u.name}
        </div>
      </td>
      <td style="color:var(--muted2);font-size:.76rem">${u.email}</td>
      <td>
        <span style="font-family:var(--font-c);font-size:.6rem;padding:2px 8px;background:rgba(201,168,76,.1);border:1px solid rgba(201,168,76,.2);color:var(--gold)">${u.tier}</span>
      </td>
      <td style="text-align:center">${u.orders}</td>
      <td style="font-family:var(--font-d);font-size:1.1rem;color:var(--red)">${u.pts.toLocaleString()}</td>
      <td style="color:var(--muted2);font-size:.76rem">${u.joined}</td>
      <td><span class="sb ${u.status}">${u.stxt}</span></td>
      <td>
        <button class="act-btn" onclick="showToast('Viewing ${u.name} profile')">View</button>
        <button class="act-btn" onclick="showToast('${u.name} suspended')">Suspend</button>
      </td>
    </tr>
  `).join('');
}
renderUsers();

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
   ADMIN PAGE SAFE INIT
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  const allowed = await checkAdminAccess();

  if (!allowed) return;

  const activePage =
    document.querySelector('.adm-nav-item.on')?.dataset.page ||
    document.querySelector('.adm-page.on')?.id?.replace('adm-', '') ||
    'overview';

  if (activePage === 'orders') {
    loadOrders();
  }

  if (activePage === 'products' || activePage === 'inventory') {
    loadProducts();
  }

  if (activePage === 'assets') {
    loadAssets();
  }
});

/* ══ INIT LOG ══ */
console.log('%c⚙️ PADDOX — Admin Dashboard Loaded', 'color:#e8002d;font-size:14px;font-weight:bold;');