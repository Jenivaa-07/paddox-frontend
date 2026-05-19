/* ============================================================
   PADDOX — admin.js   |   Admin Dashboard Logic
   ============================================================ */
'use strict';

/* ══ DATA ══ */
const ADM_ORDERS = [
  { id:'PDX-00819', customer:'Arjun Mehta',   products:'SF-25 Cap, RB20 Tee',   date:'May 11, 2026', amount:'₹6,498',  status:'s-pr', stxt:'Processing' },
  { id:'PDX-00818', customer:'Priya Sharma',   products:'SF-25 Podium Cap',       date:'May 10, 2026', amount:'₹2,499',  status:'s-sh', stxt:'Shipped'    },
  { id:'PDX-00817', customer:'Kenji Tanaka',   products:'F1 Helmet Replica',      date:'May 9, 2026',  amount:'₹14,999', status:'s-del', stxt:'Delivered' },
  { id:'PDX-00816', customer:'Rohan Das',      products:'RB20 Team Tee',          date:'May 8, 2026',  amount:'₹3,999',  status:'s-sh', stxt:'Shipped'    },
  { id:'PDX-00815', customer:'Sofia García',   products:'Aston Key Ring',         date:'May 7, 2026',  amount:'₹899',    status:'s-del', stxt:'Delivered' },
  { id:'PDX-00814', customer:'Liam Chen',      products:'McLaren Poster',         date:'May 6, 2026',  amount:'₹1,299',  status:'s-del', stxt:'Delivered' },
  { id:'PDX-00813', customer:'Nadia Roy',      products:'Monaco Circuit Watch',   date:'May 5, 2026',  amount:'₹18,999', status:'s-ca', stxt:'Cancelled'  },
];

const ADM_PRODUCTS = [
  { id:1,  icon:'🧢', name:'SF-25 Podium Cap',        cat:'Apparel',      team:'Ferrari',   price:'₹2,499',  stock:48, status:'s-act', stxt:'Active' },
  { id:2,  icon:'👕', name:'RB20 Team Tee',            cat:'Apparel',      team:'Red Bull',  price:'₹3,999',  stock:35, status:'s-act', stxt:'Active' },
  { id:3,  icon:'🏆', name:'W15 Collector Diecast',    cat:'Collectibles', team:'Mercedes',  price:'₹8,999',  stock:6,  status:'s-act', stxt:'Active' },
  { id:4,  icon:'🎽', name:'Fan Polo Jacket',          cat:'Apparel',      team:'Alpine',    price:'₹5,499',  stock:22, status:'s-act', stxt:'Active' },
  { id:5,  icon:'🖼️', name:'MCL38 Speed Poster',       cat:'Posters',      team:'McLaren',   price:'₹1,299',  stock:80, status:'s-act', stxt:'Active' },
  { id:6,  icon:'🪖', name:'F1 Helmet Replica',        cat:'Collectibles', team:'Collector', price:'₹14,999', stock:0,  status:'s-act', stxt:'Active' },
  { id:7,  icon:'⌚', name:'Monaco Circuit Watch',     cat:'Accessories',  team:'Paddox',    price:'₹18,999', stock:4,  status:'s-act', stxt:'Active' },
  { id:8,  icon:'📌', name:'Driver Enamel Pin Set',    cat:'Accessories',  team:'Multi',     price:'₹799',    stock:120,status:'s-act', stxt:'Active' },
];

const ADM_USERS = [
  { name:'Arjun Mehta',   email:'arjun@example.com',   tier:'Pro Fan', orders:7, pts:4820, joined:'Jan 2025', status:'s-act', stxt:'Active'   },
  { name:'Priya Sharma',  email:'priya@example.com',   tier:'Pro Fan', orders:5, pts:4210, joined:'Feb 2025', status:'s-act', stxt:'Active'   },
  { name:'Rohan Das',     email:'rohan@example.com',   tier:'Regular', orders:3, pts:3980, joined:'Mar 2025', status:'s-act', stxt:'Active'   },
  { name:'Kenji Tanaka',  email:'kenji@example.com',   tier:'Regular', orders:4, pts:3450, joined:'Mar 2025', status:'s-act', stxt:'Active'   },
  { name:'Sofia García',  email:'sofia@example.com',   tier:'Regular', orders:2, pts:3120, joined:'Apr 2025', status:'s-act', stxt:'Active'   },
  { name:'Liam Chen',     email:'liam@example.com',    tier:'New',     orders:1, pts:500,  joined:'May 2025', status:'s-act', stxt:'Active'   },
  { name:'Nadia Roy',     email:'nadia@example.com',   tier:'Regular', orders:2, pts:1800, joined:'Apr 2025', status:'s-ina', stxt:'Inactive' },
];

const ADM_ASSETS = [
  { name:'Ferrari SF-25 Dawn',   cat:'Cars',     type:'Free',    img:'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400&q=80', size:'8.2 MB',  dl:1240 },
  { name:'Max Attack Mode',      cat:'Drivers',  type:'Premium', img:'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&q=80', size:'10.1 MB', dl:890  },
  { name:'Silverstone Aerial',   cat:'Circuits', type:'Free',    img:'https://images.unsplash.com/photo-1504197832061-98658c95b13e?w=400&q=80', size:'6.8 MB',  dl:2100 },
  { name:'McLaren Papaya Burst', cat:'Cars',     type:'Premium', img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',   size:'9.4 MB',  dl:670  },
  { name:'Scuderia Fire Art',    cat:'Abstract', type:'Free',    img:'https://images.unsplash.com/photo-1541005329-22a78da1b5f0?w=400&q=80',    size:'5.2 MB',  dl:1830 },
  { name:'Hamilton Era',         cat:'Drivers',  type:'Premium', img:'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80', size:'11.3 MB', dl:440  },
  { name:'Monaco Neon Circuit',  cat:'Circuits', type:'Free',    img:'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=400&q=80',    size:'7.6 MB',  dl:2780 },
  { name:'Golden Lap Abstract',  cat:'Abstract', type:'Premium', img:'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&q=80', size:'9.1 MB',  dl:320  },
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
  assets:     { title:'DIGITAL ASSETS',  action:'+ Upload Asset', fn:()=>showToast('📁 File picker opened') },
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
function renderOrders() {
  const tbody = document.getElementById('orders-tbody');
  if (!tbody) return;
  tbody.innerHTML = ADM_ORDERS.map(o => `
    <tr>
      <td><input type="checkbox"/></td>
      <td class="oid">#${o.id}</td>
      <td>${o.customer}</td>
      <td style="color:var(--muted2);font-size:.76rem">${o.products}</td>
      <td style="color:var(--muted2)">${o.date}</td>
      <td style="font-family:var(--font-d);font-size:1.1rem">${o.amount}</td>
      <td><span class="sb ${o.status}">${o.stxt}</span></td>
      <td>
        <button class="act-btn" onclick="showToast('Viewing order #${o.id}')">View</button>
        <button class="act-btn" onclick="showToast('Status updated for #${o.id}')">Update</button>
      </td>
    </tr>
  `).join('');
}
renderOrders();

/* ══ PRODUCTS TABLE ══ */
function renderProducts() {
  const tbody = document.getElementById('products-tbody');
  if (!tbody) return;
  tbody.innerHTML = ADM_PRODUCTS.map(p => {
    const stkColor = p.stock === 0 ? 'var(--red)' : p.stock < 10 ? 'var(--orange)' : 'var(--white)';
    return `
      <tr>
        <td><input type="checkbox"/></td>
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <div style="width:32px;height:32px;background:var(--gray);display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0">${p.icon}</div>
            <span>${p.name}</span>
          </div>
        </td>
        <td style="color:var(--muted2)">${p.cat}</td>
        <td style="color:var(--muted2)">${p.team}</td>
        <td style="font-family:var(--font-d);font-size:1.1rem">${p.price}</td>
        <td style="font-weight:600;color:${stkColor}">${p.stock} units</td>
        <td><span class="sb ${p.status}">${p.stxt}</span></td>
        <td>
          <button class="act-btn" onclick="openAddModal()">Edit</button>
          <button class="act-btn" onclick="showToast('✓ Product deleted')">Delete</button>
        </td>
      </tr>
    `;
  }).join('');
}
renderProducts();

/* ══ INVENTORY TABLE ══ */
function renderInventory() {
  const tbody = document.getElementById('inventory-tbody');
  if (!tbody) return;
  const skus = ['PDX-APP-001','PDX-APP-002','PDX-COL-001','PDX-APP-003','PDX-ART-001','PDX-COL-002','PDX-ACC-001','PDX-ACC-002'];
  tbody.innerHTML = ADM_PRODUCTS.map((p, i) => {
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
renderInventory();

/* ══ DIGITAL ASSETS GRID ══ */
function renderAssets() {
  const grid = document.getElementById('assets-grid');
  if (!grid) return;
  grid.innerHTML = ADM_ASSETS.map(a => `
    <div class="asset-card">
      <div class="asset-thumb">
        <img src="${a.img}" alt="${a.name}"
          loading="lazy"
          onerror="this.style.display='none';this.nextSibling.style.display='flex'"
          style="width:100%;height:100%;object-fit:cover;transition:transform .5s,filter .4s;filter:brightness(.8)"/>
        <div class="asset-thumb-emoji" style="display:none">🖼️</div>
      </div>
      <div class="asset-info">
        <div class="asset-name">${a.name}</div>
        <div class="asset-meta">${a.cat} · ${a.type} · ${a.size}</div>
        <div class="asset-dl">↓ ${a.dl.toLocaleString()} downloads</div>
        <div class="asset-actions">
          <button class="asset-btn" onclick="showToast('Editing ${a.name}')">Edit</button>
          <button class="asset-btn" onclick="showToast('${a.name} deleted')">Delete</button>
        </div>
      </div>
    </div>
  `).join('');
}
renderAssets();

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

/* ══ UPLOAD ZONE ══ */
document.getElementById('upload-zone')?.addEventListener('click', () => {
  showToast('📁 File picker opened — drag & drop or browse to upload assets');
});

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

/* ══ INIT LOG ══ */
console.log('%c⚙️ PADDOX — Admin Dashboard Loaded', 'color:#e8002d;font-size:14px;font-weight:bold;');