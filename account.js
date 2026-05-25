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
  showToast('Google/Facebook sign-in coming soon. Please use email login.');
}

/* ══ AUTH ══ */
/* ══════════════════════════════════════
   REALTIME AUTH SYSTEM
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
  loadRealtimeProfile();
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

/* ══ WISHLIST — REALTIME ══ */
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
      <div style="
        padding:24px;
        text-align:center;
        color:#777;
        border-top:1px solid rgba(255,255,255,.08);
      ">
        No saved items yet.
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
              : '🏎️'
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
              : '🏎️'
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



/* ══ DOWNLOADS — REALTIME ══ */
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
    await loadRealtimeProfile();

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
const TEAMS=[{emoji:'🔴',name:'Ferrari'},{emoji:'🔵',name:'Red Bull'},{emoji:'⚫',name:'Mercedes'},{emoji:'🟠',name:'McLaren'},{emoji:'🟢',name:'Aston'},{emoji:'🔵',name:'Alpine'}];
function renderTeamPrefs(){
  const grid=document.getElementById('team-pref');if(!grid)return;
  const fav = currentUser?.preferences?.favouriteTeam || '';
  grid.innerHTML=TEAMS.map((t,i)=>`
    <button class="team-pref-btn ${(fav ? fav === t.name : i===0)?'on':''}" data-team="${t.name}" onclick="selectTeam(this)">${t.emoji} ${t.name}</button>
  `).join('');
}
function selectTeam(el){
  document.querySelectorAll('.team-pref-btn').forEach(b=>b.classList.remove('on'));
  el.classList.add('on');
}

/* ══════════════════════════════════════
   REALTIME PROFILE + ADDRESS + PREFERENCES
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
  return selected?.dataset?.team || selected?.textContent?.replace(/[🔴🔵⚫🟠🟢]/g, '').trim() || '';
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
    avatarEl.textContent = '🏎️';
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

  if (file.size > 5 * 1024 * 1024) {
    showToast('❌ Image must be below 5MB');
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

    await loadRealtimeProfile();

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

async function loadRealtimeProfile() {
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
   REALTIME ACCOUNT ORDERS
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

    const orders =
      data.data ||
      data.orders ||
      [];

    renderRealtimeOrders(orders);
    renderDashboardOrders(orders);
    updateAccountStats(orders);

  } catch (err) {
    console.error(err);
  }
}

function renderRealtimeOrders(orders) {
  const tbody =
    document.querySelector('.orders-table tbody');

  if (!tbody) return;

  if (!orders.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center;padding:35px;color:#777">
          No realtime orders yet
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = orders.map(order => {
    const products =
      (order.items || [])
        .map(i => i.name)
        .join(', ') || 'No products';

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
          <button
            class="trk-btn"
            onclick="showRealtimeOrderDetails('${order._id}')"
          >
            View
          </button>
        </td>
      </tr>
    `;
  }).join('');

  window.USER_REALTIME_ORDERS = orders;
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
    orders.slice(0, 3);

  recentCard.innerHTML = `
    <div class="dc-title">📦 Recent Orders</div>
    ${
      recent.length
        ? recent.map(order => {
            const firstItem =
              order.items?.[0];

            return `
              <div class="r-order">
                <div class="r-oicon">📦</div>

                <div>
                  <div class="r-oname">
                    ${firstItem?.name || 'Order'}
                  </div>

                  <div class="r-ometa">
                    ${
                      order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString()
                        : '-'
                    }
                    ·
                    <span class="ostatus ${statusClass(order.status)}">
                      ${order.status || 'placed'}
                    </span>
                  </div>
                </div>

                <div class="r-oprice">
                  ${formatMoney(order.pricing?.total)}
                </div>
              </div>
            `;
          }).join('')
        : `<div style="color:#777;padding:20px 0">No orders yet</div>`
    }
  `;
}

function updateAccountStats(orders) {
  const dashOrders = document.getElementById('dash-orders-count');
  if (dashOrders) dashOrders.textContent = orders.length;

  const statNums = document.querySelectorAll('.ds-card .ds-num');
  if (statNums[0]) statNums[0].textContent = orders.length;
}

function showRealtimeOrderDetails(orderId) {
  const orders =
    window.USER_REALTIME_ORDERS || [];

  const order =
    orders.find(o => o._id === orderId);

  if (!order) {
    showToast('❌ Order not found');
    return;
  }

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
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector('#close-user-order-modal').onclick =
    () => modal.remove();
}

window.addEventListener('DOMContentLoaded', () => {
  bindAvatarUpload();
  loadMyOrders();
  loadWishlist();
  loadDownloads();
});
console.log('%c👤 PADDOX — Account Page Loaded','color:#e8002d;font-size:14px;font-weight:bold;');

function clearHardcodedDashboard() {
  updateDashboardSavedItems();
  const dashFanPoints = document.getElementById('dash-fan-points');
  if (dashFanPoints && currentUser) {
    dashFanPoints.textContent = Number(currentUser.fanPoints || 0).toLocaleString('en-IN');
  }
}

window.addEventListener('DOMContentLoaded', () => {
  setTimeout(clearHardcodedDashboard, 300);
  setTimeout(clearHardcodedDashboard, 1200);
});
