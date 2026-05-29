/* ============================================================
   PADDOX — account.js   |   User Account Logic
   ============================================================ */
'use strict';
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
  for(let i=0;i<70;i++)p.push(new P());
  setTimeout(function burst(){for(let i=0;i<30;i++)p.push(new P(true));setTimeout(burst,8e3+Math.random()*7e3)},3e3);
  function loop(){ctx.clearRect(0,0,W,H);p.forEach(x=>{x.update();x.draw()});p=p.filter(x=>x.l>0||!x.b);while(p.filter(x=>!x.b).length<70)p.push(new P());requestAnimationFrame(loop)}loop();
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

/* ══ NAVBAR ══ */
(function(){
  const nb=document.getElementById('navbar'),hb=document.getElementById('hamburger'),
        mm=document.getElementById('mobile-menu'),sb=document.getElementById('nav-search-btn'),
        dr=document.getElementById('search-drawer'),sc=document.getElementById('search-close'),
        hw=document.getElementById('helmet-wrap');
  window.addEventListener('scroll',()=>nb.classList.toggle('scrolled',scrollY>60),{passive:true});
  hb?.addEventListener('click',()=>{hb.classList.toggle('open');mm.classList.toggle('open')});
  sb?.addEventListener('click',()=>dr.classList.add('open'));
  sc?.addEventListener('click',()=>dr.classList.remove('open'));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')dr.classList.remove('open')});
  if(hw){
    hw.addEventListener('mouseenter',()=>{hw.style.transform='rotate(-10deg) scale(1.18)';hw.style.boxShadow='0 0 22px rgba(232,0,45,.5)'});
    hw.addEventListener('mouseleave',()=>{hw.style.transform='';hw.style.boxShadow=''});
  }
  const badge=document.getElementById('cart-badge');
  const cart=JSON.parse(sessionStorage.getItem('paddox_cart')||'[]');
  if(badge)badge.textContent=cart.reduce((s,x)=>s+x.qty,0);
})();

/* ══ SPEED LINES ══ */
(function(){
  const c=document.getElementById('speed-lines');if(!c)return;
  [{top:'15%',w:'40%',d:'0s',dur:'2.8s',o:.45},{top:'32%',w:'25%',d:'.7s',dur:'2.2s',o:.35},{top:'55%',w:'55%',d:'1.3s',dur:'3.2s',o:.3},{top:'70%',w:'32%',d:'.4s',dur:'2.6s',o:.35},{top:'82%',w:'48%',d:'1.1s',dur:'3s',o:.25}]
  .forEach(cfg=>{const l=document.createElement('div');l.className='speed-line';l.style.cssText=`top:${cfg.top};width:${cfg.w};animation-delay:${cfg.d};animation-duration:${cfg.dur};opacity:${cfg.o}`;c.appendChild(l)});
})();

/* ══ SCROLL REVEAL ══ */
function initReveal(root=document){
  const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in-view');obs.unobserve(e.target)}}),{threshold:.1,rootMargin:'0px 0px -30px 0px'});
  root.querySelectorAll('.reveal-up').forEach(el=>obs.observe(el));
}
initReveal();

function demoLogin() {
  showToast('Social sign-in will be available soon. Please use email login.');
}

/* ══ AUTH ══ */
/* ══════════════════════════════════════
   AUTH SYSTEM
══════════════════════════════════════ */

let currentUser = null;

/* TAB SWITCH */
document.querySelectorAll('.auth-tab').forEach(tab => {

  tab.addEventListener('click', () => {

    document
      .querySelectorAll('.auth-tab')
      .forEach(t => t.classList.remove('on'));

    document
      .querySelectorAll('.auth-form')
      .forEach(f => f.classList.remove('on'));

    tab.classList.add('on');

    document
      .getElementById(`form-${tab.dataset.tab}`)
      .classList.add('on');
  });
});

/* LOGIN */
document
  .getElementById('login-btn')
  ?.addEventListener('click', doLogin);

/* REGISTER */
document
  .getElementById('register-btn')
  ?.addEventListener('click', doRegister);

/* ENTER KEY */
document
  .getElementById('li-pass')
  ?.addEventListener('keydown', e => {

    if (e.key === 'Enter')
      doLogin();
  });

/* LOGIN FUNCTION */
async function doLogin() {

  const email =
    document
      .getElementById('li-email')
      .value
      .trim();

  const password =
    document
      .getElementById('li-pass')
      .value;

  if (!email || !password) {

    showToast('⚠️ Fill all fields');

    return;
  }

  try {

    showToast('🏁 Signing in...');

    const data =
      await AuthAPI.login({
        email,
        password
      });

    if (!data.success) {

      throw new Error(
        data.message ||
        'Login failed'
      );
    }

    TokenManager.setAccess(data.data.accessToken);

    loginUser(data.data.user);

    showToast('🔥 Login successful');

  } catch (err) {

    console.error(err);

    showToast(
      `❌ ${err.message}`
    );
  }
}

/* REGISTER FUNCTION */
async function doRegister() {

  const firstName =
    document
      .getElementById('ri-fname')
      .value
      .trim();

  const lastName =
    document
      .getElementById('ri-lname')
      .value
      .trim();

  const email =
    document
      .getElementById('ri-email')
      .value
      .trim();

  const password =
    document
      .getElementById('ri-pass')
      .value;

  if (
    !firstName ||
    !email ||
    !password
  ) {

    showToast('⚠️ Fill required fields');

    return;
  }

  if (password.length < 6) {

    showToast(
      '⚠️ Password must be at least 6 characters'
    );

    return;
  }

  try {

    showToast('🏎️ Creating account...');

    const data =
      await AuthAPI.register({
        firstName,
        lastName,
        email,
        password,
        preferences: {
          favouriteTeam: document.getElementById('ri-team')?.value || ''
        }
      });

    if (!data.success) {

      throw new Error(
        data.message ||
        'Registration failed'
      );
    }

    TokenManager.setAccess(data.data.accessToken);

    loginUser(data.data.user);

    showToast('🔥 Account created');

  } catch (err) {

    console.error(err);

    showToast(
      `❌ ${err.message}`
    );
  }
}

/* LOGIN USER */
function loginUser(user) {

  currentUser = user;

  localStorage.setItem(
    'paddox_user',
    JSON.stringify(user)
  );

  document
    .getElementById('auth-screen')
    .style.display = 'none';

  const accScreen =
    document.getElementById('acc-screen');

  accScreen.style.display = 'grid';

  const fullName =
    `${user.firstName || ''} ${user.lastName || ''}`.trim();

  setProfileAvatar(user);

  document.getElementById('prof-name')
    .textContent = fullName;

  document.getElementById('prof-email')
    .textContent = user.email;

  document.getElementById('dash-greeting')
    .textContent =
      `HEY, ${(user.firstName || 'FAN').toUpperCase()}`;

  document.getElementById('pf-fn')
    .value = user.firstName || '';

  document.getElementById('pf-ln')
    .value = user.lastName || '';

  document.getElementById('pf-em')
    .value = user.email || '';

  renderWishlist();
  renderNotifications();
  renderTeamPrefs();
  hydrateProfile(user);
  bindAvatarUpload();

  initReveal(accScreen);
  loadAccountProfile();
  loadMyOrders();
  loadWishlist();
  setTimeout(updateDashboardSavedItems, 500);
  loadDownloads();
}

/* LOGOUT */
document
  .getElementById('logout-btn')
  ?.addEventListener('click', async () => {

    try {

      await AuthAPI.logout();

    } catch (err) {}

    TokenManager.clearAccess();

    localStorage.removeItem('paddox_user');

    location.reload();
  });

/* AUTO LOGIN */
(async function restoreSession() {

  const token =
    TokenManager.getAccess();

  if (!token) return;

  try {

    const data =
      await AuthAPI.getMe();

    if (
      data.success &&
      data.data
    ) {

      loginUser(data.data);
    }

  } catch (err) {

    console.error(err);

    TokenManager.clearAccess();
  }
})();
/* ══ ACCOUNT NAV PAGES ══ */
document.querySelectorAll('.acc-nav-item').forEach(item=>{
  item.addEventListener('click',()=>{
    document.querySelectorAll('.acc-nav-item').forEach(i=>i.classList.remove('on'));
    document.querySelectorAll('.acc-page').forEach(p=>p.classList.remove('on'));
    item.classList.add('on');
    const page=document.getElementById(`page-${item.dataset.page}`);
    if(page){page.classList.add('on');initReveal(page);}
    if(item.dataset.page === 'wishlist') loadWishlist();
    if(item.dataset.page === 'downloads') loadDownloads();
    /* Icon wiggle */
    const icon=item.querySelector('.ani-icon');
    if(icon){icon.style.transform='scale(1.3) rotate(-10deg)';setTimeout(()=>icon.style.transform='',300);}
  });
});

/* ══ ORDER TRACKING ══ */
function showTracking(id,step){
  const modal=document.getElementById('trk-modal');
  if(!modal)return;
  modal.classList.add('on');
  document.getElementById('trk-id').textContent=`Order #${id}`;
  const steps=[{ic:'📋',lbl:'Order Placed'},{ic:'🏭',lbl:'Processing'},{ic:'🚚',lbl:'Shipped'},{ic:'✅',lbl:'Delivered'}];
  document.getElementById('trk-steps').innerHTML=steps.map((s,i)=>`
    <div class="trk-step">
      <div class="step-c ${i<step?'done':i===step?'cur':''}">${s.ic}</div>
      <div class="step-lbl" style="color:${i<=step?'#fff':'var(--muted)'}">${s.lbl}</div>
    </div>
  `).join('');
  document.getElementById('trk-eta').textContent=step===3?'✓ Delivered successfully':'Estimated delivery in 2–3 business days';
  modal.scrollIntoView({behavior:'smooth',block:'nearest'});
}

/* ══ WISHLIST ══ */
const ACCOUNT_WISHLIST_API =
  'https://paddox-backend.onrender.com/api/wishlist';
const ACCOUNT_DOWNLOADS_API =
  'https://paddox-backend.onrender.com/api/users/downloads';
const ACCOUNT_ASSETS_API =
  'https://paddox-backend.onrender.com/api/assets';

let REAL_WISHLIST = [];

function wishlistProductImage(product) {
  return (
    product.images?.[0]?.url ||
    product.image ||
    ''
  );
}

function wishlistPrice(product) {
  return Number(
    product.effectivePrice ||
    product.salePrice ||
    product.price ||
    0
  );
}

async function loadWishlist() {
  try {
    const token = profileToken();

    if (!token) return;

    const res = await fetch(ACCOUNT_WISHLIST_API, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Wishlist load failed');
    }

    REAL_WISHLIST =
      data.data?.products ||
      data.products ||
      [];

    renderWishlist();
    updateWishlistStats();

  } catch (err) {
    console.error(err);
    showToast(`❌ ${err.message}`);
  }
}

async function removeWishlistProduct(productId) {
  try {
    const token = profileToken();

    if (!token) return;

    const res = await fetch(
      `${ACCOUNT_WISHLIST_API}/remove/${productId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok || data.success === false) {
      throw new Error(data.message || 'Remove failed');
    }

    REAL_WISHLIST =
      REAL_WISHLIST.filter(product => String(product._id) !== String(productId));

    renderWishlist();
    updateWishlistStats();

    showToast('♡ Removed from wishlist');

  } catch (err) {
    console.error(err);
    showToast(`❌ ${err.message}`);
  }
}

function updateWishlistStats() {
  const count = REAL_WISHLIST.length;

  const dashCount = document.getElementById('dash-wishlist-count');
  if (dashCount) dashCount.textContent = count;

  const statNums = document.querySelectorAll('.ds-card .ds-num');
  if (statNums[1]) statNums[1].textContent = count;

  updateDashboardSavedItems();
}


function updateDashboardSavedItems() {
  const container = document.getElementById('dashboard-saved-items');

  if (!container) return;

  if (!REAL_WISHLIST.length) {
    container.innerHTML = `
      <div class="dashboard-empty-state">
        <span class="empty-orders-icon heart-mini-icon" aria-hidden="true"></span>
        <b>No saved items yet</b>
        <small>Your favourite PADDOX products will appear here.</small>
        <a href="shop.html">Explore shop</a>
      </div>
    `;
    return;
  }

  container.innerHTML = REAL_WISHLIST.slice(0, 3).map(product => {
    const image = wishlistProductImage(product);

    return `
      <div class="wi-row">
        <div class="wi-img" style="overflow:hidden;background:#151515">
          ${
            image
              ? `<img src="${image}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover">`
              : '<span class="order-thumb-fallback" aria-hidden="true"></span>'
          }
        </div>
        <div class="wi-name">${product.name || 'Product'}</div>
        <span class="wi-price">${formatMoney(wishlistPrice(product))}</span>
        <button class="wi-rm" onclick="removeWishlistProduct('${product._id}')">✕</button>
      </div>
    `;
  }).join('');
}

function renderWishlist(){
  const grid = document.getElementById('wl-grid');

  if (!grid) return;

  if (!REAL_WISHLIST.length) {
    grid.innerHTML = `
      <div style="
        grid-column:1/-1;
        padding:40px;
        text-align:center;
        color:#777;
        border:1px solid rgba(255,255,255,.08);
        background:#0d0d0d;
      ">
        No wishlist items yet. Go to Shop and click ♥ on any product.
      </div>
    `;

    updateWishlistStats();
    updateDashboardSavedItems();
    return;
  }

  grid.innerHTML = REAL_WISHLIST.map(product => {
    const image = wishlistProductImage(product);

    return `
      <div class="wl-card">
        <div class="wl-card-img" style="background:#111">
          ${
            image
              ? `<img src="${image}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover">`
              : '<span class="order-thumb-fallback" aria-hidden="true"></span>'
          }
        </div>

        <div class="wl-card-info">
          <div class="wl-card-team">
            ${product.team || product.category || 'Paddox'}
          </div>

          <div class="wl-card-name">
            ${product.name || 'Product'}
          </div>

          <div class="wl-card-foot">
            <span class="wl-card-price">
              ${formatMoney(wishlistPrice(product))}
            </span>

            <button
              class="wl-card-btn"
              onclick="window.location.href='shop.html'"
            >
              View in Shop
            </button>

            <button
              class="wi-rm"
              onclick="removeWishlistProduct('${product._id}')"
              title="Remove"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  updateWishlistStats();
  updateDashboardSavedItems();
}



/* ══ DOWNLOADS ══ */
let REAL_DOWNLOADS = [];

function assetImage(asset) {
  return (
    asset.image?.url ||
    asset.url ||
    ''
  );
}

function assetDownloadedDate(asset) {
  return (
    asset.downloadedAt ||
    asset.lastDownloadedAt ||
    asset.updatedAt ||
    asset.createdAt ||
    null
  );
}

async function loadDownloads() {
  try {
    const token = profileToken();

    if (!token) return;

    const res = await fetch(ACCOUNT_DOWNLOADS_API, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Downloads load failed');
    }

    REAL_DOWNLOADS =
      data.data?.assets ||
      data.data?.downloads ||
      data.assets ||
      [];

    renderDownloads();
    updateDownloadStats();

  } catch (err) {
    console.error(err);
    showToast(`❌ ${err.message}`);
  }
}

function updateDownloadStats() {
  const count = REAL_DOWNLOADS.length;

  const dashDownloads = document.getElementById('dash-downloads-count');
  if (dashDownloads) dashDownloads.textContent = count;

  const statNums = document.querySelectorAll('.ds-card .ds-num');
  if (statNums[2]) statNums[2].textContent = count;
}

function renderDownloads() {
  const grid = document.getElementById('downloads-grid') || document.querySelector('.dl-grid');

  if (!grid) return;

  if (!REAL_DOWNLOADS.length) {
    grid.innerHTML = `
      <div style="
        grid-column:1/-1;
        padding:40px;
        text-align:center;
        color:#777;
        border:1px solid rgba(255,255,255,.08);
        background:#0d0d0d;
      ">
        No downloads yet. Go to Fan Hub → Digital Assets and download a wallpaper.
      </div>
    `;

    updateDownloadStats();
    return;
  }

  grid.innerHTML = REAL_DOWNLOADS.map(asset => {
    const image = assetImage(asset);
    const downloadedAt = assetDownloadedDate(asset);

    return `
      <div class="dl-card">
        <div class="dl-thumb">
          ${
            image
              ? `<img src="${image}" alt="${asset.name || 'Digital Asset'}"/>`
              : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#111;font-size:2rem">🖼️</div>`
          }
        </div>

        <div class="dl-info">
          <div class="dl-name">
            ${asset.name || 'Paddox Digital Asset'}
          </div>
          <div class="dl-meta">
            ${asset.resolution || 'HD'} · ${asset.fileSize || 'Digital Asset'} · ${
              downloadedAt
                ? 'Downloaded ' + new Date(downloadedAt).toLocaleDateString()
                : 'Downloaded'
            }
          </div>
        </div>

        <button
          class="dl-act animate-icon"
          onclick="downloadAccountAsset('${asset._id}')"
        >
          ↓ Download Again
        </button>
      </div>
    `;
  }).join('');

  updateDownloadStats();
}

async function downloadAccountAsset(assetId) {
  try {
    const token = profileToken();

    if (!token) {
      showToast('🔐 Please login first');
      return;
    }

    showToast('⏳ Preparing download...');

    const res = await fetch(`${ACCOUNT_ASSETS_API}/${assetId}/download`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Download failed');
    }

    const info = data.data || data;
    const downloadUrl =
      info.downloadUrl ||
      info.url ||
      info.image?.url;

    if (!downloadUrl) {
      throw new Error('Download URL missing');
    }

    window.open(downloadUrl, '_blank');

    showToast(`✅ Downloading ${info.name || 'asset'}`);

    await loadDownloads();
    await loadAccountProfile();

  } catch (err) {
    console.error(err);
    showToast(`❌ ${err.message}`);
  }
}

/* ══ NOTIFICATIONS ══ */
const NOTIFS = [];

function renderNotifications(){
  const list = document.getElementById('notif-list');
  if (!list) return;

  list.innerHTML = `
    <div style="
      padding:40px;
      text-align:center;
      color:#777;
      border:1px solid rgba(255,255,255,.08);
      background:#0d0d0d;
    ">
      No notifications yet.
    </div>
  `;
}

/* ══ TEAM PREFS ══ */
const TEAMS=[{name:'Scuderia Ferrari'},{name:'Oracle Red Bull Racing'},{name:'Mercedes-AMG Petronas'},{name:'McLaren F1 Team'},{name:'Aston Martin F1'},{name:'BWT Alpine F1'},{name:'Williams Racing'},{name:'Haas F1 Team'},{name:'RB F1 Team'},{name:'Audi F1 Team'},{name:'Cadillac F1 Team'}];
function renderTeamPrefs(){
  const grid=document.getElementById('team-pref');if(!grid)return;
  const fav = currentUser?.preferences?.favouriteTeam || '';
  grid.innerHTML=TEAMS.map((t,i)=>`
    <button class="team-pref-btn ${(fav ? fav === t.name : i===0)?'on':''}" data-team="${t.name}" onclick="selectTeam(this)"><span class="team-pref-dot" aria-hidden="true"></span>${t.name}</button>
  `).join('');
}
function selectTeam(el){
  document.querySelectorAll('.team-pref-btn').forEach(b=>b.classList.remove('on'));
  el.classList.add('on');
}

/* ══════════════════════════════════════
   PROFILE + ADDRESS + PREFERENCES
══════════════════════════════════════ */

const USER_PROFILE_API =
  'https://paddox-backend.onrender.com/api/users/profile';
const USER_PREF_API =
  'https://paddox-backend.onrender.com/api/users/preferences';
const USER_AVATAR_API =
  'https://paddox-backend.onrender.com/api/users/avatar';

function profileToken() {
  return (
    localStorage.getItem('token') ||
    localStorage.getItem('paddox_access_token') ||
    localStorage.getItem('accessToken') ||
    ''
  );
}

function setFieldValue(id, value = '') {
  const el = document.getElementById(id);
  if (el) el.value = value || '';
}

function getSelectedTeam() {
  const selected = document.querySelector('.team-pref-btn.on');
  return selected?.dataset?.team || selected?.textContent?.trim() || '';
}


function setProfileAvatar(user = {}) {
  const avatarEl = document.getElementById('prof-avatar');

  if (!avatarEl) return;

  const avatarUrl =
    user.avatar?.url ||
    user.avatarUrl ||
    '';

  if (avatarUrl) {
    avatarEl.innerHTML = `
      <img
        src="${avatarUrl}"
        alt="Profile picture"
        style="
          width:100%;
          height:100%;
          object-fit:cover;
          border-radius:50%;
          display:block;
        "
      />
    `;
  } else {
    avatarEl.innerHTML = `<img src="assets/paddox-logo-icon-official.png?v=20_6_1" alt="PADDOX profile" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;"/>`;
  }
}

function openAvatarPicker() {
  const input = document.getElementById('avatar-file-input');

  if (!input) {
    showToast('❌ Avatar input not found');
    return;
  }

  input.click();
}

async function handleAvatarInput(input) {
  const file = input?.files?.[0];

  if (!file) return;

  if (!file.type.startsWith('image/')) {
    showToast('❌ Select a valid image');
    input.value = '';
    return;
  }

  if (file.size > 8 * 1024 * 1024) {
    showToast('❌ Image must be below 8MB');
    input.value = '';
    return;
  }

  await uploadProfileAvatar(file);
  input.value = '';
}

function bindAvatarUpload() {
  const editBtn = document.getElementById('avatar-edit-btn');
  const input = document.getElementById('avatar-file-input');

  if (editBtn) {
    editBtn.onclick = openAvatarPicker;
  }

  if (input) {
    input.onchange = () => handleAvatarInput(input);
  }
}

/* Extra safety: works even if inline onclick is blocked by cache/order */
document.addEventListener('click', e => {
  const btn = e.target.closest?.('#avatar-edit-btn, .avatar-edit-btn');

  if (!btn) return;

  e.preventDefault();
  e.stopPropagation();

  openAvatarPicker();
});

window.openAvatarPicker = openAvatarPicker;
window.handleAvatarInput = handleAvatarInput;

async function uploadProfileAvatar(file) {
  try {
    const token = profileToken();

    if (!token) {
      showToast('🔐 Please login first');
      return;
    }

    showToast('🖼️ Uploading profile picture...');

    const formData = new FormData();
    formData.append('avatar', file);

    const res = await fetch(USER_AVATAR_API, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Avatar upload failed');
    }

    const avatar =
      data.data?.avatar ||
      data.avatar;

    const updatedUser = {
      ...(currentUser || {}),
      avatar
    };

    hydrateProfile(updatedUser);

    showToast('🔥 Profile picture updated');

    await loadAccountProfile();

  } catch (err) {
    console.error(err);
    showToast(`❌ ${err.message}`);
  }
}

function hydrateProfile(user = {}) {
  currentUser = user;

  const fullName =
    `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
    user.name ||
    'Paddox Fan';

  document.getElementById('prof-name').textContent = fullName;
  document.getElementById('prof-email').textContent = user.email || '';
  document.getElementById('dash-greeting').textContent =
    `HEY, ${(user.firstName || 'FAN').toUpperCase()}`;

  setProfileAvatar(user);

  const realFanPoints = Number(user.fanPoints || 0).toLocaleString('en-IN');

  const fanPts = document.getElementById('fan-pts');
  if (fanPts) fanPts.textContent = realFanPoints;

  const dashFanPoints = document.getElementById('dash-fan-points');
  if (dashFanPoints) dashFanPoints.textContent = realFanPoints;

  setFieldValue('pf-fn', user.firstName || '');
  setFieldValue('pf-ln', user.lastName || '');
  setFieldValue('pf-em', user.email || '');
  setFieldValue('pf-phone', user.phone || '');

  setFieldValue('pf-address', user.address?.line1 || '');
  setFieldValue('pf-city', user.address?.city || '');
  setFieldValue('pf-pin', user.address?.pincode || '');
  setFieldValue('pf-state', user.address?.state || '');

  const driver = document.getElementById('pf-driver');
  if (driver && user.preferences?.favouriteDriver) {
    driver.value = user.preferences.favouriteDriver;
  }

  if (user.preferences?.favouriteTeam) {
    document.querySelectorAll('.team-pref-btn').forEach(btn => {
      btn.classList.toggle(
        'on',
        btn.dataset.team === user.preferences.favouriteTeam
      );
    });
  }

  localStorage.setItem('paddox_user', JSON.stringify(user));
}

async function loadAccountProfile() {
  try {
    const token = profileToken();

    if (!token) return;

    const res = await fetch(USER_PROFILE_API, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to load profile');
    }

    const user = data.data?.user || data.data;

    hydrateProfile(user);

  } catch (err) {
    console.error(err);
  }
}

async function saveProfile(){
  const firstName = document.getElementById('pf-fn').value.trim();
  const lastName  = document.getElementById('pf-ln').value.trim();
  const phone     = document.getElementById('pf-phone')?.value?.trim() || '';

  if (!firstName) {
    showToast('❌ First name required');
    return;
  }

  try {
    showToast('⏳ Saving profile...');

    const res = await fetch(USER_PROFILE_API, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${profileToken()}`
      },
      body: JSON.stringify({
        firstName,
        lastName,
        phone
      })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Profile save failed');
    }

    const user = data.data?.user || data.data;

    hydrateProfile(user);

    showToast('🔥 Profile updated');

  } catch (err) {
    console.error(err);
    showToast(`❌ ${err.message}`);
  }
}

async function saveAddress() {
  try {
    showToast('⏳ Saving address...');

    const body = {
      address: {
        line1: document.getElementById('pf-address')?.value?.trim() || '',
        city: document.getElementById('pf-city')?.value?.trim() || '',
        state: document.getElementById('pf-state')?.value?.trim() || '',
        pincode: document.getElementById('pf-pin')?.value?.trim() || '',
        country: 'India'
      }
    };

    const res = await fetch(USER_PROFILE_API, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${profileToken()}`
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Address save failed');
    }

    hydrateProfile(data.data?.user || data.data);

    showToast('🔥 Address saved');

  } catch (err) {
    console.error(err);
    showToast(`❌ ${err.message}`);
  }
}

async function savePreferences() {
  try {
    showToast('⏳ Saving preferences...');

    const favouriteTeam = getSelectedTeam();
    const favouriteDriver = document.getElementById('pf-driver')?.value || '';

    const res = await fetch(USER_PREF_API, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${profileToken()}`
      },
      body: JSON.stringify({
        favouriteTeam,
        favouriteDriver,
        newsletter: true
      })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Preferences save failed');
    }

    if (currentUser) {
      currentUser.preferences = data.data?.preferences || currentUser.preferences || {};
      currentUser.preferences.favouriteTeam = favouriteTeam;
      currentUser.preferences.favouriteDriver = favouriteDriver;
      hydrateProfile(currentUser);
    }

    showToast('🔥 Fan preferences saved');

  } catch (err) {
    console.error(err);
    showToast(`❌ ${err.message}`);
  }
}

/* ══ ICON ANIMATIONS ══ */
document.querySelectorAll('.animate-icon').forEach((icon,i)=>{
  icon.style.animationDelay=`${i*.15}s`;
  icon.addEventListener('mouseenter',()=>{icon.style.animation='none';icon.style.transform='scale(1.35) rotate(-10deg)'});
  icon.addEventListener('mouseleave',()=>{icon.style.transform='';setTimeout(()=>icon.style.animation=`iconFloat 3s ${i*.15}s ease-in-out infinite`,300)});
});

/* ══ TOAST ══ */
function showToast(msg){
  const t=document.getElementById('toast');if(!t)return;
  t.textContent=msg;t.classList.add('show');
  clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),3000);
}

/* ══════════════════════════════════════
   ACCOUNT ORDERS
══════════════════════════════════════ */

const ACCOUNT_ORDERS_API =
  'https://paddox-backend.onrender.com/api/orders';

function getUserToken() {
  return (
    localStorage.getItem('token') ||
    localStorage.getItem('paddox_access_token') ||
    localStorage.getItem('accessToken') ||
    ''
  );
}

function formatMoney(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`;
}

function accountEsc(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function orderSafeId(order = {}) {
  return order._id || order.id || order.orderId || order.orderNumber || '';
}

function statusClass(status = '') {
  const s = status.toLowerCase();

  if (s === 'delivered') return 'os-del';
  if (s === 'shipped') return 'os-sh';
  if (s === 'cancelled') return 'os-can';

  return 'os-sh';
}

async function loadMyOrders() {
  try {
    const token = getUserToken();

    if (!token) return;

    const res = await fetch(ACCOUNT_ORDERS_API, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to load orders');
    }

    const orders = Array.isArray(data.data)
      ? data.data
      : Array.isArray(data.data?.orders)
        ? data.data.orders
        : Array.isArray(data.orders)
          ? data.orders
          : [];

    renderAccountOrders(orders);
    renderDashboardOrders(orders);
    updateAccountStats(orders);

  } catch (err) {
    console.error(err);
  }
}

function renderAccountOrders(orders) {
  const tbody =
    document.querySelector('.orders-table tbody');

  if (!tbody) return;

  if (!orders.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center;padding:35px;color:#777">
          No orders yet
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = orders.map(order => {
    const products =
      (order.items || [])
        .map(i => accountEsc(i.name || 'Product'))
        .join(', ') || 'No products';
    const safeOrderId = accountEsc(orderSafeId(order));

    return `
      <tr>
        <td>
          <span class="oid">
            #${order.orderNumber || order._id}
          </span>
        </td>

        <td>${products}</td>

        <td>
          ${
            order.createdAt
              ? new Date(order.createdAt).toLocaleDateString()
              : '-'
          }
        </td>

        <td>
          ${formatMoney(order.pricing?.total)}
        </td>

        <td>
          <span class="ostatus ${statusClass(order.status)}">
            ${order.status || 'placed'}
          </span>
        </td>

        <td>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button
              class="trk-btn"
              onclick="showAccountOrderDetails('${safeOrderId}')"
            >
              View
            </button>
            <button
              class="trk-btn receipt-mini-btn"
              onclick="openOrderReceipt('${safeOrderId}')"
            >
              Receipt
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  window.USER_ACCOUNT_ORDERS = orders;
}

function renderDashboardOrders(orders) {
  const cards =
    [...document.querySelectorAll('.dash-card')];

  const recentCard =
    cards.find(card =>
      card.querySelector('.dc-title')?.textContent.includes('Recent Orders')
    );

  if (!recentCard) return;

  const recent =
    (orders || []).slice(0, 3);

  recentCard.innerHTML = `
    <div class="dc-title"><span class="section-mini-icon orders-mini-icon" aria-hidden="true"></span> Recent Orders</div>
    <div class="dashboard-mini-list">
      ${
        recent.length
          ? recent.map(order => {
              const firstItem = order.items?.[0] || {};
              const safeOrderId = accountEsc(orderSafeId(order));
              const status = order.status || 'placed';
              const itemCount = (order.items || []).reduce((sum, item) => sum + Number(item.quantity || 1), 0);

              return `
                <button class="r-order r-order-card" onclick="showAccountOrderDetails('${safeOrderId}')" type="button">
                  <div class="r-oicon r-oicon-thumb">
                    ${orderProductThumb(firstItem)}
                  </div>

                  <div class="r-order-info">
                    <div class="r-oname">
                      ${accountEsc(firstItem?.name || 'PADDOX Order')}
                    </div>

                    <div class="r-ometa">
                      ${orderDateLabel(order.createdAt)}
                      · ${itemCount || 1} item${itemCount === 1 ? '' : 's'}
                      · <span class="ostatus ${statusClass(status)}">${accountEsc(status)}</span>
                    </div>
                  </div>

                  <div class="r-oprice">
                    ${formatMoney(order.pricing?.total)}
                  </div>
                </button>
              `;
            }).join('')
          : `<div class="dashboard-empty-state"><span class="empty-orders-icon" aria-hidden="true"></span><b>No orders yet</b><small>Your latest PADDOX purchases will appear here.</small><a href="shop.html">Start shopping</a></div>`
      }
    </div>
  `;
}

function updateAccountStats(orders) {
  const dashOrders = document.getElementById('dash-orders-count');
  if (dashOrders) dashOrders.textContent = orders.length;

  const statNums = document.querySelectorAll('.ds-card .ds-num');
  if (statNums[0]) statNums[0].textContent = orders.length;
}

function showAccountOrderDetails(orderId) {
  const orders =
    window.USER_ACCOUNT_ORDERS || [];

  const order =
    orders.find(o => o._id === orderId);

  if (!order) {
    showToast('❌ Order not found');
    return;
  }

  const safeOrderId = accountEsc(orderSafeId(order));

  const products =
    (order.items || [])
      .map(item => `
        <div style="
          display:flex;
          justify-content:space-between;
          gap:10px;
          padding:10px 0;
          border-bottom:1px solid rgba(255,255,255,.08);
        ">
          <div>
            <div style="font-weight:700;color:#fff">
              ${item.name}
            </div>
            <div style="color:#777;font-size:.85rem">
              Qty: ${item.quantity || 1}
            </div>
          </div>

          <div style="font-family:var(--font-d)">
            ${formatMoney((item.price || 0) * (item.quantity || 1))}
          </div>
        </div>
      `)
      .join('');

  const modal = document.createElement('div');

  modal.innerHTML = `
    <div class="trk-modal on" style="
      position:fixed;
      inset:0;
      z-index:9999;
      background:rgba(0,0,0,.82);
      display:flex;
      justify-content:center;
      align-items:center;
      padding:20px;
    ">
      <div style="
        width:min(650px,95vw);
        background:#0d0d0d;
        border:1px solid rgba(255,255,255,.14);
        padding:28px;
        color:white;
        position:relative;
      ">
        <button
          id="close-user-order-modal"
          style="
            position:absolute;
            top:16px;
            right:18px;
            background:#111;
            color:white;
            border:0;
            font-size:1.4rem;
            cursor:pointer;
          "
        >
          ✕
        </button>

        <div style="
          font-family:var(--font-d);
          letter-spacing:4px;
          font-size:1.8rem;
        ">
          ORDER DETAILS
        </div>

        <div style="
          color:var(--red);
          margin:8px 0 20px;
          font-family:var(--font-c);
          letter-spacing:2px;
        ">
          #${order.orderNumber || order._id}
        </div>

        <div style="margin-bottom:18px">
          <strong>Status:</strong>
          <span class="ostatus ${statusClass(order.status)}">
            ${order.status || 'placed'}
          </span>
        </div>

        <div style="margin-bottom:18px">
          <div style="color:#777;letter-spacing:2px;font-size:.8rem">
            PRODUCTS
          </div>
          ${products}
        </div>

        <div style="line-height:1.8">
          Subtotal: ${formatMoney(order.pricing?.subtotal)}<br>
          Shipping: ${formatMoney(order.pricing?.shipping)}<br>
          Tax: ${formatMoney(order.pricing?.tax)}<br>
          <strong style="font-size:1.3rem">
            Total: ${formatMoney(order.pricing?.total)}
          </strong>
        </div>

        <button
          class="trk-btn receipt-open-btn"
          onclick="openOrderReceipt('${safeOrderId}')"
          style="margin-top:20px;width:100%;padding:13px;background:var(--red);color:#fff;border:0;font-weight:800;letter-spacing:2px"
        >
          View Receipt
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector('#close-user-order-modal').onclick =
    () => modal.remove();
}


function openOrderReceipt(orderId) {
  if (!orderId) {
    showToast('❌ Order not found');
    return;
  }
  window.location.href = `receipt.html?orderId=${encodeURIComponent(orderId)}`;
}

window.addEventListener('DOMContentLoaded', () => {
  bindAvatarUpload();
  loadMyOrders();
  loadWishlist();
  loadDownloads();
});
console.log('%c👤 PADDOX — Account Page Loaded','color:#e8002d;font-size:14px;font-weight:bold;');

function clearStarterDashboard() {
  updateDashboardSavedItems();
  const dashFanPoints = document.getElementById('dash-fan-points');
  if (dashFanPoints && currentUser) {
    dashFanPoints.textContent = Number(currentUser.fanPoints || 0).toLocaleString('en-IN');
  }
}


function openOrderReceipt(orderId) {
  if (!orderId) {
    showToast('❌ Order not found');
    return;
  }
  window.location.href = `receipt.html?orderId=${encodeURIComponent(orderId)}`;
}

window.addEventListener('DOMContentLoaded', () => {
  setTimeout(clearStarterDashboard, 300);
  setTimeout(clearStarterDashboard, 1200);
});


/* ══════════════════════════════════════
   PHASE 8 — PREMIUM ACCOUNT ORDERS POLISH
   Uses only real order data returned by /api/orders.
══════════════════════════════════════ */

function orderDateLabel(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

function orderTimeLabel(value) {
  if (!value) return '-';
  return new Date(value).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit'
  });
}

function orderProductThumb(item = {}) {
  const img = item.image || item.product?.images?.[0]?.url || item.product?.image || '';
  if (img) {
    return `<img src="${accountEsc(img)}" alt="${accountEsc(item.name || 'Product')}" loading="lazy"/>`;
  }
  return `<span class="order-thumb-fallback" aria-hidden="true"></span>`;
}

function normalizePaymentStatus(order = {}) {
  return String(order.payment?.status || order.paymentStatus || 'pending').toLowerCase();
}

function paymentStatusClass(order = {}) {
  const s = normalizePaymentStatus(order);
  if (s.includes('paid')) return 'pay-paid';
  if (s.includes('refund')) return 'pay-refund';
  if (s.includes('fail') || s.includes('cancel')) return 'pay-failed';
  return 'pay-pending';
}

function paymentStatusLabel(order = {}) {
  const s = normalizePaymentStatus(order);
  if (s.includes('paid')) return 'Paid';
  if (s.includes('refund')) return 'Refunded';
  if (s.includes('fail')) return 'Failed';
  if (s.includes('cancel')) return 'Cancelled';
  return 'Pending';
}

function paymentMethodLabel(order = {}) {
  const raw = String(order.payment?.method || order.paymentMethod || order.payment?.paymentMethod || '').trim();
  if (!raw) return 'Payment method';
  return raw
    .replace(/_/g, ' ')
    .replace(/\b\w/g, ch => ch.toUpperCase());
}

function orderStepIndex(status = '') {
  const s = String(status || 'placed').toLowerCase();
  if (s.includes('cancel') || s.includes('refund')) return -1;
  if (s.includes('deliver')) return 3;
  if (s.includes('ship') || s.includes('out')) return 2;
  if (s.includes('process') || s.includes('pack') || s.includes('confirm')) return 1;
  return 0;
}

function renderOrderTimeline(order = {}) {
  const steps = [
    { key: 'placed', label: 'Placed' },
    { key: 'processing', label: 'Processing' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' }
  ];
  const idx = orderStepIndex(order.status);
  if (idx < 0) {
    return `<div class="order-timeline cancelled"><span></span><b>${order.status || 'Cancelled'}</b></div>`;
  }
  return `
    <div class="order-timeline">
      ${steps.map((step, i) => `
        <div class="order-step ${i < idx ? 'done' : i === idx ? 'active' : ''}">
          <span></span>
          <b>${accountEsc(step.label)}</b>
        </div>
      `).join('')}
    </div>
  `;
}

function renderOrderItemsMini(order = {}) {
  const items = order.items || [];
  if (!items.length) return `<div class="order-mini-empty">No products returned for this order.</div>`;
  return items.slice(0, 3).map(item => `
    <div class="order-mini-item">
      <div class="order-mini-img">${orderProductThumb(item)}</div>
      <div class="order-mini-info">
        <div class="order-mini-name">${accountEsc(item.name || 'Product')}</div>
        <div class="order-mini-meta">
          Qty ${item.quantity || 1}
          ${item.size ? ` · Size ${accountEsc(item.size)}` : ''}
          ${item.color ? ` · ${accountEsc(item.color)}` : ''}
        </div>
      </div>
      <div class="order-mini-price">${formatMoney((item.price || 0) * (item.quantity || 1))}</div>
    </div>
  `).join('') + (items.length > 3 ? `<div class="order-more-items">+${items.length - 3} more item${items.length - 3 > 1 ? 's' : ''}</div>` : '');
}

function renderAccountOrders(orders) {
  const grid = document.getElementById('orders-grid-premium');
  const tbody = document.querySelector('.orders-table tbody');

  window.USER_ACCOUNT_ORDERS = orders || [];

  if (tbody) tbody.innerHTML = '';
  if (!grid) return;

  if (!orders || !orders.length) {
    grid.innerHTML = `
      <div class="orders-empty-card">
        <div class="orders-empty-icon"><span class="empty-orders-icon" aria-hidden="true"></span></div>
        <h3>No orders yet</h3>
        <p>Your PADDOX purchases will appear here after checkout.</p>
        <a href="shop.html" class="orders-shop-link">Start Shopping</a>
      </div>
    `;
    return;
  }

  grid.innerHTML = orders.map(order => {
    const firstItem = order.items?.[0] || {};
    const orderNo = order.orderNumber || order._id;
    const safeOrderId = accountEsc(orderSafeId(order));
    const status = order.status || 'placed';
    const total = order.pricing?.total || 0;
    const itemCount = (order.items || []).reduce((sum, item) => sum + Number(item.quantity || 1), 0);

    return `
      <article class="order-premium-card">
        <div class="order-card-head">
          <div class="order-id-block">
            <span>Order ID</span>
            <strong>#${accountEsc(orderNo)}</strong>
          </div>
          <div class="order-status-stack">
            <span class="ostatus ${statusClass(status)}">${accountEsc(status)}</span>
            <span class="payment-pill ${paymentStatusClass(order)}">${paymentStatusLabel(order)}</span>
          </div>
        </div>

        <div class="order-card-main">
          <div class="order-primary-product">
            <div class="order-main-img">${orderProductThumb(firstItem)}</div>
            <div>
              <div class="order-main-name">${accountEsc(firstItem.name || 'PADDOX Order')}</div>
              <div class="order-main-meta">
                ${itemCount} item${itemCount === 1 ? '' : 's'} · ${orderDateLabel(order.createdAt)} · ${orderTimeLabel(order.createdAt)}
              </div>
              <div class="order-pay-method">${accountEsc(paymentMethodLabel(order))}</div>
            </div>
          </div>
          <div class="order-total-block">
            <span>Total</span>
            <strong>${formatMoney(total)}</strong>
          </div>
        </div>

        ${renderOrderTimeline(order)}

        <div class="order-items-preview">
          ${renderOrderItemsMini(order)}
        </div>

        <div class="order-card-actions">
          <button class="trk-btn order-action-main" onclick="showAccountOrderDetails('${safeOrderId}')">View Details</button>
          <button class="trk-btn receipt-mini-btn" onclick="openOrderReceipt('${safeOrderId}')">View Receipt</button>
          <button class="trk-btn" onclick="showTracking('${accountEsc(orderNo)}', ${Math.max(orderStepIndex(status), 0)})">Track</button>
        </div>
      </article>
    `;
  }).join('');
}

function showAccountOrderDetails(orderId) {
  const orders = window.USER_ACCOUNT_ORDERS || [];
  const order = orders.find(o => String(orderSafeId(o)) === String(orderId) || String(o._id) === String(orderId));

  if (!order) {
    showToast('❌ Order not found');
    return;
  }

  const safeOrderId = accountEsc(orderSafeId(order));
  const address = order.shippingAddress || {};
  const products = (order.items || []).map(item => `
    <div class="order-detail-item">
      <div class="order-detail-img">${orderProductThumb(item)}</div>
      <div>
        <div class="order-detail-name">${accountEsc(item.name || 'Product')}</div>
        <div class="order-detail-meta">
          Qty ${item.quantity || 1}
          ${item.size ? ` · Size ${accountEsc(item.size)}` : ''}
          ${item.color ? ` · ${accountEsc(item.color)}` : ''}
        </div>
      </div>
      <strong>${formatMoney((item.price || 0) * (item.quantity || 1))}</strong>
    </div>
  `).join('');

  const modal = document.createElement('div');
  modal.innerHTML = `
    <div class="order-detail-overlay">
      <div class="order-detail-modal">
        <button class="order-detail-close" type="button">✕</button>

        <div class="order-detail-top">
          <div>
            <div class="orders-kicker">Order garage</div>
            <h2>ORDER DETAILS</h2>
            <p>#${accountEsc(order.orderNumber || order._id)} · ${orderDateLabel(order.createdAt)}</p>
          </div>
          <div class="order-status-stack">
            <span class="ostatus ${statusClass(order.status)}">${accountEsc(order.status || 'placed')}</span>
            <span class="payment-pill ${paymentStatusClass(order)}">${paymentStatusLabel(order)}</span>
          </div>
        </div>

        ${renderOrderTimeline(order)}

        <div class="order-detail-grid">
          <section>
            <h3>Items</h3>
            ${products || '<p class="order-muted">No items returned.</p>'}
          </section>
          <section>
            <h3>Delivery</h3>
            <p class="order-address-line"><b>${accountEsc(address.name || '-')}</b></p>
            <p class="order-address-line">${accountEsc(address.line1 || '')}</p>
            ${address.line2 ? `<p class="order-address-line">${accountEsc(address.line2)}</p>` : ''}
            <p class="order-address-line">${accountEsc([address.city, address.state, address.pincode].filter(Boolean).join(', '))}</p>
            <p class="order-address-line">${accountEsc(address.country || 'India')}</p>
            <p class="order-address-line">Phone: ${accountEsc(address.phone || '-')}</p>
          </section>
        </div>

        <div class="order-detail-summary">
          <div><span>Subtotal</span><b>${formatMoney(order.pricing?.subtotal)}</b></div>
          <div><span>Shipping</span><b>${formatMoney(order.pricing?.shipping)}</b></div>
          <div><span>Tax</span><b>${formatMoney(order.pricing?.tax)}</b></div>
          <div class="grand"><span>Total</span><b>${formatMoney(order.pricing?.total)}</b></div>
        </div>

        <div class="order-detail-actions">
          <button class="trk-btn" onclick="openOrderReceipt('${safeOrderId}')">Open Receipt</button>
          <button class="trk-btn" onclick="showTracking('${accountEsc(order.orderNumber || order._id)}', ${Math.max(orderStepIndex(order.status), 0)})">Track Order</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  modal.querySelector('.order-detail-close').onclick = () => modal.remove();
  modal.querySelector('.order-detail-overlay').onclick = e => {
    if (e.target.classList.contains('order-detail-overlay')) modal.remove();
  };
}

function openOrderReceipt(orderId) {
  if (!orderId) {
    showToast('❌ Order not found');
    return;
  }
  window.location.href = `receipt.html?orderId=${encodeURIComponent(orderId)}`;
}

/* ============================================================
   Phase 20.6.1 — Profile-only navbar avatar + free crop studio
   ============================================================ */
(function(){
  const DEFAULT_PROFILE_IMG = 'assets/paddox-logo-icon-official.png?v=20_6_1';
  let cropState = {
    img: null,
    fileName: 'paddox-avatar.png',
    objectUrl: '',
    baseScale: 1,
    zoom: 1,
    panX: 0,
    panY: 0,
    dragging: false,
    startX: 0,
    startY: 0,
    startPanX: 0,
    startPanY: 0,
    croppedBlob: null,
    croppedUrl: ''
  };

  function avatarUrlFromUser(user = {}) {
    return user.avatar?.url || user.avatarUrl || user.profileImage || '';
  }

  function ensureAvatarStudio() {
    if (document.getElementById('avatar-studio-overlay')) return;

    const studio = document.createElement('div');
    studio.className = 'avatar-studio-overlay';
    studio.id = 'avatar-studio-overlay';
    studio.innerHTML = `
      <div class="avatar-studio-modal" role="dialog" aria-modal="true" aria-label="Profile picture editor">
        <button class="avatar-studio-close" id="avatar-studio-close" type="button" aria-label="Close">×</button>
        <div class="avatar-studio-head">
          <div class="avatar-studio-kicker">Profile garage</div>
          <div class="avatar-studio-title">UPDATE <span class="accent">AVATAR</span></div>
          <div class="avatar-studio-sub">Choose an image, drag and drop, then freely pan and zoom before saving.</div>
        </div>
        <div class="avatar-studio-grid">
          <div>
            <div class="avatar-dropzone" id="avatar-dropzone">
              <div>
                <span class="avatar-drop-icon acc-icon" aria-hidden="true"></span>
                <div class="avatar-drop-title">Drop image here</div>
                <div class="avatar-drop-text">PNG, JPG, JPEG, WEBP, GIF or any browser-supported image format. Drag, crop, preview, then save.</div>
                <button class="avatar-pick-btn" id="avatar-pick-btn" type="button">Choose File</button>
              </div>
            </div>
            <div class="avatar-crop-wrap" id="avatar-crop-wrap">
              <div class="avatar-crop-help">The white circle is your final profile photo. Drag the image until the face sits inside the circle, then zoom if needed.</div>
              <div class="avatar-stage" id="avatar-stage">
                <img id="avatar-crop-img" alt="Crop profile preview" draggable="false"/>
                <div class="avatar-crop-ring" aria-hidden="true"></div>
              </div>
              <div class="avatar-controls">
                <label class="avatar-zoom">Zoom <input id="avatar-zoom" type="range" min="1" max="4" step="0.01" value="1"/></label>
                <button class="avatar-reset-btn" id="avatar-reset-btn" type="button">Fit Image</button>
                <button class="avatar-face-btn" id="avatar-face-btn" type="button">Face Crop</button>
                <button class="avatar-change-btn" id="avatar-change-btn" type="button">Choose Different</button>
              </div>
            </div>
          </div>
          <div class="avatar-preview-panel">
            <h3>Live Preview</h3>
            <div class="avatar-preview-circle" id="avatar-live-preview">Preview</div>
            <p>This is how your profile image will appear in the sidebar and navbar.</p>
            <div class="avatar-preview-actions">
              <button class="avatar-save-btn" id="avatar-save-btn" type="button" disabled>Save Profile Picture</button>
            </div>
          </div>
        </div>
      </div>`;
    document.body.appendChild(studio);

    const view = document.createElement('div');
    view.className = 'avatar-view-overlay';
    view.id = 'avatar-view-overlay';
    view.innerHTML = `
      <div class="avatar-view-card" role="dialog" aria-modal="true" aria-label="Profile picture preview">
        <button class="avatar-view-close" id="avatar-view-close" type="button" aria-label="Close">×</button>
        <div class="avatar-studio-kicker">Current profile</div>
        <div class="avatar-view-title">PROFILE <span class="accent">PREVIEW</span></div>
        <img class="avatar-view-img" id="avatar-view-img" alt="Profile picture preview"/>
        <div class="avatar-view-actions">
          <button class="avatar-pick-btn" id="avatar-view-change" type="button">Update Image</button>
        </div>
      </div>`;
    document.body.appendChild(view);

    const fileInput = document.getElementById('avatar-file-input');
    const dropzone = document.getElementById('avatar-dropzone');
    const pickBtn = document.getElementById('avatar-pick-btn');
    const changeBtn = document.getElementById('avatar-change-btn');
    const closeBtn = document.getElementById('avatar-studio-close');
    const resetBtn = document.getElementById('avatar-reset-btn');
    const faceBtn = document.getElementById('avatar-face-btn');
    const saveBtn = document.getElementById('avatar-save-btn');
    const zoom = document.getElementById('avatar-zoom');
    const stage = document.getElementById('avatar-stage');

    pickBtn?.addEventListener('click', () => fileInput?.click());
    changeBtn?.addEventListener('click', () => fileInput?.click());
    closeBtn?.addEventListener('click', closeAvatarStudio);
    resetBtn?.addEventListener('click', fitAvatarCrop);
    faceBtn?.addEventListener('click', faceAvatarCrop);
    saveBtn?.addEventListener('click', saveCroppedAvatar);
    zoom?.addEventListener('input', () => {
      cropState.zoom = Number(zoom.value || 1);
      clampAvatarPan();
      renderAvatarCrop();
      renderAvatarPreview();
    });

    ['dragenter','dragover'].forEach(evt => {
      dropzone?.addEventListener(evt, e => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('dragover');
      });
    });

    ['dragleave','drop'].forEach(evt => {
      dropzone?.addEventListener(evt, e => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('dragover');
      });
    });

    dropzone?.addEventListener('drop', e => {
      const file = e.dataTransfer?.files?.[0];
      if (file) loadAvatarFile(file);
    });

    stage?.addEventListener('pointerdown', e => {
      if (!cropState.img) return;
      cropState.dragging = true;
      cropState.startX = e.clientX;
      cropState.startY = e.clientY;
      cropState.startPanX = cropState.panX;
      cropState.startPanY = cropState.panY;
      stage.setPointerCapture?.(e.pointerId);
    });

    stage?.addEventListener('pointermove', e => {
      if (!cropState.dragging) return;
      cropState.panX = cropState.startPanX + e.clientX - cropState.startX;
      cropState.panY = cropState.startPanY + e.clientY - cropState.startY;
      clampAvatarPan();
      renderAvatarCrop();
      renderAvatarPreview();
    });

    ['pointerup','pointercancel','pointerleave'].forEach(evt => {
      stage?.addEventListener(evt, () => {
        cropState.dragging = false;
      });
    });

    stage?.addEventListener('wheel', e => {
      if (!cropState.img) return;
      e.preventDefault();
      const nextZoom = Math.min(4, Math.max(1, cropState.zoom + (e.deltaY < 0 ? .08 : -.08)));
      cropState.zoom = nextZoom;
      clampAvatarPan();
      if (zoom) zoom.value = String(nextZoom);
      renderAvatarCrop();
      renderAvatarPreview();
    }, { passive: false });

    document.getElementById('avatar-view-close')?.addEventListener('click', closeAvatarPreview);
    document.getElementById('avatar-view-change')?.addEventListener('click', () => {
      closeAvatarPreview();
      openAvatarPicker();
    });

    studio.addEventListener('click', e => { if (e.target === studio) closeAvatarStudio(); });
    view.addEventListener('click', e => { if (e.target === view) closeAvatarPreview(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        closeAvatarStudio();
        closeAvatarPreview();
      }
    });
  }

  function openAvatarPicker() {
    ensureAvatarStudio();
    document.getElementById('avatar-studio-overlay')?.classList.add('on');
    showAvatarDropMode();
  }

  function closeAvatarStudio() {
    document.getElementById('avatar-studio-overlay')?.classList.remove('on');
  }

  function showAvatarDropMode() {
    document.getElementById('avatar-dropzone')?.style.setProperty('display', 'flex');
    document.getElementById('avatar-crop-wrap')?.classList.remove('on');
  }

  function showAvatarCropMode() {
    document.getElementById('avatar-dropzone')?.style.setProperty('display', 'none');
    document.getElementById('avatar-crop-wrap')?.classList.add('on');
  }

  function validateAvatarFile(file) {
    if (!file || !file.type || !file.type.startsWith('image/')) {
      showToast('❌ Select a valid image file');
      return false;
    }
    if (file.size > 8 * 1024 * 1024) {
      showToast('❌ Image must be below 8MB');
      return false;
    }
    return true;
  }


  const CROP_RING_SIZE = 300;

  function getStageSize() {
    const stage = document.getElementById('avatar-stage');
    return stage ? stage.getBoundingClientRect().width : 380;
  }

  function clampAvatarPan() {
    if (!cropState.img) return;
    const stageSize = getStageSize();
    const ringSize = Math.min(CROP_RING_SIZE, stageSize - 54);
    const scale = cropState.baseScale * cropState.zoom;
    const drawnW = cropState.img.naturalWidth * scale;
    const drawnH = cropState.img.naturalHeight * scale;
    const maxX = Math.max(0, (drawnW - ringSize) / 2);
    const maxY = Math.max(0, (drawnH - ringSize) / 2);
    cropState.panX = Math.max(-maxX, Math.min(maxX, cropState.panX));
    cropState.panY = Math.max(-maxY, Math.min(maxY, cropState.panY));
  }

  function loadAvatarFile(file) {
    ensureAvatarStudio();
    if (!validateAvatarFile(file)) return;

    if (cropState.objectUrl) URL.revokeObjectURL(cropState.objectUrl);
    cropState.objectUrl = URL.createObjectURL(file);
    cropState.fileName = file.name || 'paddox-avatar.png';

    const img = new Image();
    img.onload = () => {
      cropState.img = img;
      cropState.zoom = 1;
      cropState.panX = 0;
      cropState.panY = 0;
      cropState.baseScale = CROP_RING_SIZE / Math.min(img.naturalWidth, img.naturalHeight);
      const cropImg = document.getElementById('avatar-crop-img');
      if (cropImg) {
        cropImg.src = cropState.objectUrl;
        cropImg.style.width = `${img.naturalWidth}px`;
        cropImg.style.height = `${img.naturalHeight}px`;
      }
      const zoom = document.getElementById('avatar-zoom');
      if (zoom) zoom.value = '1';
      showAvatarCropMode();
      clampAvatarPan();
      renderAvatarCrop();
      renderAvatarPreview();
      const saveBtn = document.getElementById('avatar-save-btn');
      if (saveBtn) saveBtn.disabled = false;
    };
    img.onerror = () => showToast('❌ Could not load this image');
    img.src = cropState.objectUrl;
  }

  function renderAvatarCrop() {
    const cropImg = document.getElementById('avatar-crop-img');
    if (!cropImg || !cropState.img) return;
    const scale = cropState.baseScale * cropState.zoom;
    cropImg.style.transform = `translate(-50%, -50%) translate(${cropState.panX}px, ${cropState.panY}px) scale(${scale})`;
  }

  function makeCroppedCanvas(size = 512) {
    if (!cropState.img) return null;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#080808';
    ctx.fillRect(0, 0, size, size);
    const outputScale = size / CROP_RING_SIZE;
    ctx.save();
    ctx.translate(size / 2 + cropState.panX * outputScale, size / 2 + cropState.panY * outputScale);
    ctx.scale(cropState.baseScale * cropState.zoom * outputScale, cropState.baseScale * cropState.zoom * outputScale);
    ctx.drawImage(cropState.img, -cropState.img.naturalWidth / 2, -cropState.img.naturalHeight / 2);
    ctx.restore();
    return canvas;
  }

  function renderAvatarPreview() {
    const holder = document.getElementById('avatar-live-preview');
    if (!holder || !cropState.img) return;
    const canvas = makeCroppedCanvas(256);
    if (!canvas) return;
    if (cropState.croppedUrl) URL.revokeObjectURL(cropState.croppedUrl);
    canvas.toBlob(blob => {
      if (!blob) return;
      cropState.croppedBlob = blob;
      cropState.croppedUrl = URL.createObjectURL(blob);
      holder.innerHTML = `<img src="${cropState.croppedUrl}" alt="Avatar preview">`;
    }, 'image/png', .95);
  }

  function fitAvatarCrop() {
    cropState.zoom = 1;
    cropState.panX = 0;
    cropState.panY = 0;
    const zoom = document.getElementById('avatar-zoom');
    if (zoom) zoom.value = '1';
    clampAvatarPan();
    renderAvatarCrop();
    renderAvatarPreview();
  }

  function faceAvatarCrop() {
    cropState.zoom = 1.35;
    cropState.panX = 0;
    cropState.panY = 0;
    const zoom = document.getElementById('avatar-zoom');
    if (zoom) zoom.value = '1.35';
    clampAvatarPan();
    renderAvatarCrop();
    renderAvatarPreview();
  }

  async function saveCroppedAvatar() {
    if (!cropState.img) {
      showToast('❌ Choose an image first');
      return;
    }

    const canvas = makeCroppedCanvas(512);
    if (!canvas) return;

    const saveBtn = document.getElementById('avatar-save-btn');
    if (saveBtn) saveBtn.disabled = true;

    canvas.toBlob(async blob => {
      try {
        if (!blob) throw new Error('Crop failed');
        const safeName = cropState.fileName.replace(/\.[^.]+$/, '') || 'paddox-avatar';
        const file = new File([blob], `${safeName}-cropped.png`, { type: 'image/png' });
        await uploadProfileAvatar(file);
        closeAvatarStudio();
      } catch (err) {
        console.error(err);
        showToast(`❌ ${err.message || 'Avatar save failed'}`);
      } finally {
        if (saveBtn) saveBtn.disabled = false;
      }
    }, 'image/png', .95);
  }

  async function handleAvatarInput(input) {
    const file = input?.files?.[0];
    if (!file) return;
    ensureAvatarStudio();
    document.getElementById('avatar-studio-overlay')?.classList.add('on');
    loadAvatarFile(file);
    input.value = '';
  }

  function bindAvatarUpload() {
    ensureAvatarStudio();
    const editBtn = document.getElementById('avatar-edit-btn');
    const input = document.getElementById('avatar-file-input');
    const avatar = document.getElementById('prof-avatar');
    if (editBtn) editBtn.onclick = openAvatarPicker;
    if (input) input.onchange = () => handleAvatarInput(input);
    if (avatar) {
      avatar.onclick = e => {
        if (e.target.closest?.('#avatar-edit-btn')) return;
        openAvatarPreview();
      };
    }
  }

  function setProfileAvatar(user = {}) {
    currentUser = { ...(currentUser || {}), ...(user || {}) };
    const avatarEl = document.getElementById('prof-avatar');
    const avatarUrl = avatarUrlFromUser(user);

    if (avatarEl) {
      if (avatarUrl) {
        avatarEl.innerHTML = `<img src="${avatarUrl}" alt="Profile picture" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;"/>`;
      } else {
        avatarEl.innerHTML = `<img src="${DEFAULT_PROFILE_IMG}" alt="PADDOX profile" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;"/>`;
      }
    }

    syncNavUserProfile(user);
  }

  function resetNavSignup() {
    const cta = document.querySelector('.nav-cta-btn');
    if (!cta) return;
    cta.classList.remove('nav-profile-only');
    cta.removeAttribute('aria-label');
    cta.href = 'account.html';
    cta.onclick = null;
    cta.innerHTML = 'Sign Up <span class="cta-arrow" aria-hidden="true"></span>';
  }

  function accountDashboardIsVisible() {
    const auth = document.getElementById('auth-screen');
    const acc = document.getElementById('acc-screen');
    if (!acc) return false;
    const authVisible = auth && getComputedStyle(auth).display !== 'none';
    const accVisible = getComputedStyle(acc).display !== 'none';
    return accVisible && !authVisible;
  }

  function syncNavUserProfile(user = currentUser || {}) {
    const cta = document.querySelector('.nav-cta-btn');
    if (!cta || !user || !profileToken() || !accountDashboardIsVisible()) {
      resetNavSignup();
      return;
    }
    const avatarUrl = avatarUrlFromUser(user);
    cta.classList.add('nav-profile-only');
    cta.setAttribute('aria-label', 'Preview my profile picture');
    cta.href = 'account.html';
    cta.innerHTML = avatarUrl
      ? `<img class="nav-profile-img" src="${avatarUrl}" alt="Profile picture">`
      : `<span class="nav-profile-fallback" aria-hidden="true"></span>`;
    cta.onclick = e => {
      e.preventDefault();
      openAvatarPreview();
    };
  }

  function openAvatarPreview() {
    ensureAvatarStudio();
    const avatarUrl = avatarUrlFromUser(currentUser || {});
    const img = document.getElementById('avatar-view-img');
    if (img) img.src = avatarUrl || DEFAULT_PROFILE_IMG;
    document.getElementById('avatar-view-overlay')?.classList.add('on');
  }

  function closeAvatarPreview() {
    document.getElementById('avatar-view-overlay')?.classList.remove('on');
  }

  const oldUpload = window.uploadProfileAvatar || uploadProfileAvatar;
  async function uploadProfileAvatar(file) {
    try {
      const token = profileToken();
      if (!token) {
        showToast('🔐 Please login first');
        return;
      }
      showToast('🖼️ Uploading cropped profile picture...');

      const localPreviewUrl = URL.createObjectURL(file);
      setProfileAvatar({ ...(currentUser || {}), avatarUrl: localPreviewUrl });

      const formData = new FormData();
      formData.append('avatar', file);

      const res = await fetch(USER_AVATAR_API, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || 'Avatar upload failed');

      const avatar = data.data?.avatar || data.avatar;
      const updatedUser = { ...(currentUser || {}), avatar };
      hydrateProfile(updatedUser);
      setProfileAvatar(updatedUser);
      showToast('🔥 Profile picture updated');
      openAvatarPreview();
      await loadAccountProfile();
    } catch (err) {
      console.error(err);
      showToast(`❌ ${err.message}`);
    }
  }

  const oldHydrateProfile = window.hydrateProfile || hydrateProfile;
  function hydrateProfile(user = {}) {
    oldHydrateProfile(user);
    setProfileAvatar(user);
    bindAvatarUpload();
  }

  window.openAvatarPicker = openAvatarPicker;
  window.handleAvatarInput = handleAvatarInput;
  window.bindAvatarUpload = bindAvatarUpload;
  window.setProfileAvatar = setProfileAvatar;
  window.hydrateProfile = hydrateProfile;
  window.uploadProfileAvatar = uploadProfileAvatar;

  document.addEventListener('DOMContentLoaded', () => {
    ensureAvatarStudio();
    bindAvatarUpload();
    resetNavSignup();
  });
})();
