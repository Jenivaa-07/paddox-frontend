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

async function authFetch(path, options = {}) {
  const sessionId = localStorage.getItem('paddox_session_id') || '';
  const existingHeaders = options.headers || {};
  const hasAuthHeader = Object.keys(existingHeaders).some(k => k.toLowerCase() === 'authorization');
  const accessToken = window.TokenManager?.getAccess?.() || profileToken?.() || '';

  const res = await fetch(`${PADDOX_API_BASE}${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken && !hasAuthHeader ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(sessionId ? { 'X-Paddox-Session-Id': sessionId } : {}),
      ...existingHeaders
    }
  });

  const responseSessionId = res.headers.get('X-Paddox-Session-Id');
  if (responseSessionId) localStorage.setItem('paddox_session_id', responseSessionId);

  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
}

async function startGoogleLogin() {
  try {
    const cfg = await authFetch('/auth/google/config');
    const clientId = cfg.data?.clientId || cfg.clientId || '';
    if (!clientId) {
      showToast('⚠️ Google login is not configured yet');
      return;
    }
    if (!window.google?.accounts?.id) {
      showToast('⚠️ Google is still loading. Try again in a second.');
      return;
    }
    google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleCredential
    });
    google.accounts.id.prompt(notification => {
      if (notification.isNotDisplayed?.() || notification.isSkippedMoment?.()) {
        showToast('Google popup was closed or blocked');
      }
    });
  } catch (err) {
    console.error(err);
    showToast(`❌ ${err.message}`);
  }
}

async function handleGoogleCredential(response) {
  try {
    showToast('🏁 Signing in with Google...');
    const data = await authFetch('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential: response.credential })
    });
    handleAuthSuccess(data);
  } catch (err) {
    console.error(err);
    showToast(`❌ ${err.message}`);
  }
}

function handleAuthSuccess(data) {
  if (data.data?.requires2FA) {
    pendingTwoFactorToken = data.data.twoFactorToken || '';
    showTwoFactorLogin(data.data.email, false);
    showToast('📩 Verification code sent');
    return;
  }
  if (data.data?.sessionId) localStorage.setItem('paddox_session_id', data.data.sessionId);
  TokenManager.setAccess(data.data.accessToken);
  loginUser(data.data.user);
}

function showTwoFactorLogin(email, sending = false) {
  const modal = document.getElementById('twofactor-login-modal');
  const copy = document.getElementById('twofactor-login-copy');
  const code = document.getElementById('twofactor-login-code');
  if (copy) {
    copy.textContent = sending
      ? `Sending a 6-digit code to ${email || 'your email'}...`
      : `We sent a 6-digit code to ${email || 'your email'}.`;
  }
  if (code) code.value = '';
  modal?.classList.add('show');
  setTimeout(() => code?.focus(), 80);
}

async function requestLoginTwoFactorCode(twoFactorToken = '', email = '') {
  const copy = document.getElementById('twofactor-login-copy');

  if (!twoFactorToken) {
    if (copy) copy.textContent = 'Your secure login session expired. Please login again.';
    showToast('⚠️ Login security session expired. Please login again.');
    return;
  }

  try {
    const data = await authFetch('/auth/2fa/send', {
      method: 'POST',
      body: JSON.stringify({ twoFactorToken })
    });

    pendingTwoFactorToken = data.data?.twoFactorToken || pendingTwoFactorToken;
    const sentTo = data.data?.emailTo || data.data?.email || email || 'your email';
    if (copy) copy.textContent = `We sent a 6-digit code to ${sentTo}.`;
    showToast('📩 Verification code sent');
  } catch (err) {
    console.error('PADDOX login 2FA send failed:', err);
    if (copy) copy.textContent = 'Could not send the code. Please cancel and login again.';
    showToast(`❌ ${err.message || '2FA code send failed'}`);
  }
}

function cancelTwoFactorLogin() {
  pendingTwoFactorToken = '';
  document.getElementById('twofactor-login-modal')?.classList.remove('show');
}

async function verifyTwoFactorLoginCode() {
  const code = document.getElementById('twofactor-login-code')?.value.trim();
  if (!pendingTwoFactorToken || !code) {
    showToast('⚠️ Enter the verification code');
    return;
  }
  try {
    showToast('🔐 Verifying code...');
    const data = await authFetch('/auth/2fa/verify', {
      method: 'POST',
      body: JSON.stringify({ twoFactorToken: pendingTwoFactorToken, code })
    });
    cancelTwoFactorLogin();
    if (data.data?.sessionId) localStorage.setItem('paddox_session_id', data.data.sessionId);
    TokenManager.setAccess(data.data.accessToken);
    loginUser(data.data.user);
    showToast('🔥 Secure login successful');
  } catch (err) {
    console.error(err);
    showToast(`❌ ${err.message}`);
  }
}

/* ══ AUTH ══ */
/* ══════════════════════════════════════
   AUTH SYSTEM
══════════════════════════════════════ */

let currentUser = null;
let pendingTwoFactorToken = '';
let pendingTwoFactorAction = 'enable';
const PADDOX_API_BASE = 'https://paddox-backend.onrender.com/api';

/* Phase 20.12B.3 — Auth helper non-conflict safety
   js/api.js already defines TokenManager/AuthAPI on some builds. Do NOT redeclare
   those names here because that stops the whole account page script. */
window.TokenManager = window.TokenManager || (typeof TokenManager !== 'undefined' ? TokenManager : {
  getAccess() {
    return localStorage.getItem('token') || localStorage.getItem('paddox_access_token') || localStorage.getItem('accessToken') || '';
  },
  setAccess(token = '') {
    if (!token) return;
    localStorage.setItem('token', token);
    localStorage.setItem('paddox_access_token', token);
    localStorage.setItem('accessToken', token);
  },
  clearAccess() {
    localStorage.removeItem('token');
    localStorage.removeItem('paddox_access_token');
    localStorage.removeItem('accessToken');
  }
});

window.AuthAPI = window.AuthAPI || (typeof AuthAPI !== 'undefined' ? AuthAPI : {
  login(payload) {
    return authFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload || {})
    });
  },
  register(payload) {
    return authFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload || {})
    });
  },
  logout() {
    const token = window.TokenManager.getAccess();
    return authFetch('/auth/logout', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    }).catch(() => ({ success: true }));
  },
  getMe() {
    const token = window.TokenManager.getAccess();
    return authFetch('/auth/me', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  }
});

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

/* FORGOT PASSWORD — A4.7C.1 Brevo live test */
document
  .querySelectorAll('.forgot-link')
  .forEach(link => {
    link.setAttribute('role', 'button');
    link.setAttribute('tabindex', '0');
    link.addEventListener('click', handleForgotPassword);
    link.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleForgotPassword();
      }
    });
  });

async function handleForgotPassword() {
  const emailInput = document.getElementById('li-email');
  const existingEmail = String(emailInput?.value || '').trim();
  const email = window.prompt('Enter your PADDOX account email for password reset:', existingEmail);

  if (email === null) return;

  const cleanEmail = String(email || '').trim().toLowerCase();

  if (!cleanEmail || !cleanEmail.includes('@')) {
    showToast('⚠️ Enter a valid email address');
    return;
  }

  if (emailInput) emailInput.value = cleanEmail;

  try {
    showToast('📩 Sending reset email...');

    const res = await fetch(`${PADDOX_API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || data.success === false) {
      throw new Error(data.message || 'Password reset request failed');
    }

    const payload = data.data || data;

    console.log('PADDOX forgot password response:', payload);

    if (payload.emailSent === false) {
      showToast('⚠️ Reset link generated, but email failed. Check Render/Brevo logs.');
      return;
    }

    showToast(`✅ Reset email sent to ${payload.emailTo || cleanEmail}`);
  } catch (err) {
    console.error('PADDOX forgot password failed:', err);
    showToast(`❌ ${err.message || 'Forgot password failed'}`);
  }
}

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

    if (!data || !data.success) {

      throw new Error(
        data.message ||
        'Login failed'
      );
    }

    handleAuthSuccess(data);

    showToast(data.data?.requires2FA ? '🔐 Verification code sent' : '🔥 Login successful');

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

    if (!data || !data.success) {

      throw new Error(
        data.message ||
        'Registration failed'
      );
    }

    handleAuthSuccess(data);

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
  hydrateSecurityState(user);

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
  initOrderNotificationInbox(user);
  initOrderNotificationSocket();
  scheduleSecuritySessionsRefresh(800);
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
    localStorage.removeItem('paddox_session_id');

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
    if(item.dataset.page === 'notifications') renderNotifications();
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

function wishlistImageMode(product) {
  const text = `${product.name || ''} ${product.category || ''} ${product.team || ''}`.toLowerCase();

  if (
    text.includes('shirt') ||
    text.includes('t-shirt') ||
    text.includes('tee') ||
    text.includes('jersey') ||
    text.includes('hoodie') ||
    text.includes('cap') ||
    text.includes('helmet')
  ) {
    return 'contain';
  }

  return 'cover';
}

function wishlistCategory(product) {
  return product.team || product.category || 'Paddox';
}

function updateWishlistSummaryStrip() {
  const countEl = document.getElementById('wl-summary-count');
  const valueEl = document.getElementById('wl-summary-value');
  const teamEl = document.getElementById('wl-summary-teams');
  const statusEl = document.getElementById('wl-summary-status');

  if (!countEl || !valueEl || !teamEl || !statusEl) return;

  const count = REAL_WISHLIST.length;
  const total = REAL_WISHLIST.reduce((sum, product) => sum + wishlistPrice(product), 0);
  const teams = new Set(REAL_WISHLIST.map(wishlistCategory).filter(Boolean));

  countEl.textContent = count;
  valueEl.textContent = formatMoney(total);
  teamEl.textContent = teams.size || 0;
  statusEl.textContent = count ? 'Active' : 'Ready';
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

  updateWishlistSummaryStrip();
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

  updateWishlistSummaryStrip();

  if (!REAL_WISHLIST.length) {
    grid.innerHTML = `
      <div class="wishlist-empty-state">
        <span class="wishlist-empty-icon" aria-hidden="true"></span>
        <h3>No saved items yet</h3>
        <p>Start building your PADDOX garage by saving racewear, posters, and digital collectibles from the shop.</p>
        <a href="shop.html" class="wishlist-empty-btn">Go to Shop <span aria-hidden="true">→</span></a>
      </div>
    `;

    updateWishlistStats();
    updateDashboardSavedItems();
    return;
  }

  grid.innerHTML = REAL_WISHLIST.map(product => {
    const image = wishlistProductImage(product);
    const mode = wishlistImageMode(product);
    const category = wishlistCategory(product);
    const safeId = product._id || product.id || '';

    return `
      <article class="wl-card wl-premium-card">
        <button
          class="wl-remove-btn"
          onclick="removeWishlistProduct('${safeId}')"
          title="Remove from wishlist"
          aria-label="Remove ${product.name || 'product'} from wishlist"
        >
          <span aria-hidden="true">×</span>
        </button>

        <div class="wl-card-img wl-premium-img wl-img-${mode}">
          ${
            image
              ? `<img src="${image}" alt="${product.name || 'PADDOX product'}" loading="lazy">`
              : '<span class="wishlist-thumb-fallback" aria-hidden="true"></span>'
          }
        </div>

        <div class="wl-card-info wl-premium-info">
          <div class="wl-card-team">${category}</div>

          <div class="wl-card-name">
            ${product.name || 'PADDOX Product'}
          </div>

          <div class="wl-card-meta-row">
            <span class="wl-stock-dot"></span>
            <span>Saved to garage</span>
          </div>

          <div class="wl-card-foot wl-premium-foot">
            <span class="wl-card-price">
              ${formatMoney(wishlistPrice(product))}
            </span>

            <button
              class="wl-card-btn"
              onclick="window.location.href='shop.html'"
            >
              View in Shop <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </article>
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


function parseDownloadSizeToMB(sizeValue) {
  if (!sizeValue) return 0;
  if (typeof sizeValue === 'number') return sizeValue / (1024 * 1024);

  const raw = String(sizeValue).trim().toLowerCase();
  const num = parseFloat(raw.replace(/,/g, ''));

  if (Number.isNaN(num)) return 0;
  if (raw.includes('gb')) return num * 1024;
  if (raw.includes('kb')) return num / 1024;
  if (raw.includes('byte') || raw.includes(' b')) return num / (1024 * 1024);
  return num;
}

function formatDownloadSize(mb) {
  if (!mb || mb <= 0) return '0 MB';
  if (mb >= 1024) return `${(mb / 1024).toFixed(mb >= 10240 ? 0 : 1)} GB`;
  return `${mb.toFixed(mb >= 100 ? 0 : 1)} MB`;
}

function updateDownloadsSummary() {
  const count = REAL_DOWNLOADS.length;
  const countEl = document.getElementById('dl-summary-count');
  const sizeEl = document.getElementById('dl-summary-size');
  const latestEl = document.getElementById('dl-summary-latest');
  const typeEl = document.getElementById('dl-summary-type');

  if (countEl) countEl.textContent = count;

  const totalSize = REAL_DOWNLOADS.reduce((sum, asset) => {
    return sum + parseDownloadSizeToMB(asset.fileSize || asset.size || asset.meta?.fileSize || asset.meta?.size);
  }, 0);

  if (sizeEl) sizeEl.textContent = formatDownloadSize(totalSize);

  const latest = REAL_DOWNLOADS
    .map(assetDownloadedDate)
    .filter(Boolean)
    .map(date => new Date(date))
    .filter(date => !Number.isNaN(date.getTime()))
    .sort((a, b) => b - a)[0];

  if (latestEl) {
    latestEl.textContent = latest
      ? latest.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
      : '—';
  }

  const types = new Set(
    REAL_DOWNLOADS
      .map(asset => asset.type || asset.category || asset.assetType || 'Digital')
      .filter(Boolean)
  );

  if (typeEl) typeEl.textContent = types.size > 1 ? `${types.size} Types` : (types.values().next().value || 'Digital');
}

function downloadAssetTypeLabel(asset) {
  return asset.type || asset.category || asset.assetType || 'Digital Asset';
}

function downloadAssetMetaLine(asset, downloadedAt) {
  const resolution = asset.resolution || asset.meta?.resolution || 'HD';
  const size = asset.fileSize || asset.size || asset.meta?.fileSize || 'Digital Asset';
  const date = downloadedAt
    ? new Date(downloadedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Saved';

  return `${resolution} · ${size} · Downloaded ${date}`;
}

function updateDownloadStats() {
  const count = REAL_DOWNLOADS.length;

  const dashDownloads = document.getElementById('dash-downloads-count');
  if (dashDownloads) dashDownloads.textContent = count;

  const statNums = document.querySelectorAll('.ds-card .ds-num');
  if (statNums[2]) statNums[2].textContent = count;

  updateDownloadsSummary();
}

function renderDownloads() {
  const grid = document.getElementById('downloads-grid') || document.querySelector('.dl-grid');

  if (!grid) return;

  updateDownloadsSummary();

  if (!REAL_DOWNLOADS.length) {
    grid.innerHTML = `
      <div class="downloads-empty-state">
        <span class="downloads-empty-icon" aria-hidden="true"></span>
        <h3>No downloads yet</h3>
        <p>Go to Fan Hub and download wallpapers, posters, race-day visuals, or other PADDOX digital assets. Your saved files will appear here.</p>
        <button class="downloads-empty-btn" onclick="window.location.href='fanhub.html'">
          Explore Fan Hub <span aria-hidden="true">→</span>
        </button>
      </div>
    `;

    updateDownloadStats();
    return;
  }

  grid.innerHTML = REAL_DOWNLOADS.map(asset => {
    const image = assetImage(asset);
    const downloadedAt = assetDownloadedDate(asset);
    const name = asset.name || 'Paddox Digital Asset';
    const typeLabel = downloadAssetTypeLabel(asset);
    const metaLine = downloadAssetMetaLine(asset, downloadedAt);

    return `
      <div class="dl-card premium-download-card">
        <div class="dl-thumb download-thumb">
          ${
            image
              ? `<img src="${image}" alt="${name}"/>`
              : `<span class="download-thumb-fallback" aria-hidden="true"></span>`
          }
          <span class="download-type-pill">${typeLabel}</span>
        </div>

        <div class="dl-info download-info">
          <div class="dl-name download-name">${name}</div>
          <div class="dl-meta download-meta">${metaLine}</div>
        </div>

        <button
          class="dl-act download-action-btn"
          onclick="downloadAccountAsset('${asset._id}')"
          aria-label="Download ${name} again"
        >
          <span aria-hidden="true">↓</span>
          <span>Download Again</span>
        </button>
      </div>
    `;
  }).join('');

  updateDownloadStats();
}

function accountCloudinaryDownloadUrl(url) {
  if (!url || typeof url !== 'string') return '';

  if (url.includes('res.cloudinary.com') && url.includes('/image/upload/')) {
    if (url.includes('/image/upload/fl_attachment/')) return url;
    return url.replace('/image/upload/', '/image/upload/fl_attachment/');
  }

  return url;
}

function accountAssetVariantUrl(asset = {}, format = 'desktop') {
  if (!asset || typeof asset !== 'object') return '';

  const key = String(format || 'desktop').toLowerCase();
  const direct = asset[key];

  if (typeof direct === 'string' && direct) return direct;
  if (direct && typeof direct === 'object' && direct.url) return direct.url;

  if (key === 'mobile' && asset.mobile?.url) return asset.mobile.url;
  if (key === 'desktop' && asset.desktop?.url) return asset.desktop.url;

  return (
    asset.downloadUrl ||
    asset.url ||
    asset.fileUrl ||
    asset.desktop?.url ||
    asset.mobile?.url ||
    asset.image?.url ||
    asset.thumbnail?.url ||
    ''
  );
}

function accountAssetDownloadFormat(asset = {}, preferredFormat = '') {
  const raw =
    preferredFormat ||
    asset.format ||
    asset.downloadFormat ||
    asset.selectedFormat ||
    asset.meta?.format ||
    asset.purchase?.format ||
    asset.lastDownload?.format ||
    '';

  const cleaned = String(raw || '').toLowerCase().trim();
  if (['desktop', 'mobile'].includes(cleaned)) return cleaned;

  const orientation = String(asset.orientation || '').toLowerCase().trim();
  if (orientation === 'mobile') return 'mobile';
  if (orientation === 'desktop') return 'desktop';

  if (asset.desktop?.url || typeof asset.desktop === 'string') return 'desktop';
  if (asset.mobile?.url || typeof asset.mobile === 'string') return 'mobile';

  return 'desktop';
}

async function downloadAccountAsset(assetId, preferredFormat = '') {
  try {
    const token = profileToken();

    if (!token) {
      showToast('🔐 Please login first');
      return;
    }

    const asset = (REAL_DOWNLOADS || []).find(item => String(item?._id || item?.id || item?.assetId || '') === String(assetId));
    const format = accountAssetDownloadFormat(asset || {}, preferredFormat);
    const localUrl = accountAssetVariantUrl(asset || {}, format);
    const name = asset?.name || asset?.title || 'PADDOX Wallpaper';

    showToast('⏳ Preparing download...');

    /* Use the saved asset URL first. This makes Account → Downloads work for
       both free wallpapers and already-unlocked premium wallpapers, even when
       the protected API refuses a premium direct download. */
    if (localUrl) {
      const finalUrl = accountCloudinaryDownloadUrl(localUrl);
      window.open(finalUrl, '_blank', 'noopener');
      showToast(`✅ Downloading ${name}`);

      /* Best-effort backend sync for free downloads. Never block the user. */
      fetch(`${ACCOUNT_ASSETS_API}/${assetId}/download?format=${encodeURIComponent(format)}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => null);

      return;
    }

    const res = await fetch(`${ACCOUNT_ASSETS_API}/${assetId}/download?format=${encodeURIComponent(format)}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.success) {
      throw new Error(data?.message || 'Download failed');
    }

    const info = data.data || data;
    const downloadUrl =
      info.downloadUrl ||
      info.url ||
      info.desktop?.url ||
      info.mobile?.url ||
      info.image?.url;

    if (!downloadUrl) {
      throw new Error('Download URL missing');
    }

    window.open(accountCloudinaryDownloadUrl(downloadUrl), '_blank', 'noopener');

    showToast(`✅ Downloading ${info.name || name}`);

    await loadDownloads();
    await loadAccountProfile();

  } catch (err) {
    console.error(err);
    showToast(`❌ ${err?.message || 'Download failed'}`);
  }
}

/* ══ NOTIFICATIONS ══ */
const NOTIFICATION_DEFAULTS = {
  raceAlerts: true,
  newDrops: true,
  orderUpdates: true,
  fanPoints: false,
  community: false
};

const NOTIFICATION_META = {
  raceAlerts: {
    title: 'Race Day Alerts',
    text: 'Before every race weekend and live session reminder.',
    icon: 'notif-race-icon'
  },
  newDrops: {
    title: 'New Drops',
    text: 'Limited merchandise launches and digital asset drops.',
    icon: 'notif-drop-icon'
  },
  orderUpdates: {
    title: 'Order Updates',
    text: 'Order placed, shipping, delivery and receipt activity.',
    icon: 'notif-order-icon'
  },
  fanPoints: {
    title: 'Fan Points',
    text: 'Rewards, milestones and tier progress updates.',
    icon: 'notif-points-icon'
  },
  community: {
    title: 'Community Updates',
    text: 'Fan Hub polls, trivia, quote activity and community moments.',
    icon: 'notif-community-icon'
  }
};

let notificationSaveTimer = null;
let notificationSaving = false;

function getNotificationState() {
  const fromUser = currentUser?.notifications || {};
  return {
    ...NOTIFICATION_DEFAULTS,
    ...fromUser
  };
}

function notificationPayloadFromUI() {
  const payload = {};
  Object.keys(NOTIFICATION_DEFAULTS).forEach(key => {
    const input = document.querySelector(`[data-notification-key="${key}"]`);
    payload[key] = input ? !!input.checked : !!getNotificationState()[key];
  });
  return payload;
}

function setNotificationStatus(text = 'Synced with profile', state = 'synced') {
  const el = document.getElementById('notification-sync-status');
  if (!el) return;
  el.textContent = text;
  el.dataset.state = state;
}

function hydrateNotificationControls(notifications = {}) {
  const state = {
    ...NOTIFICATION_DEFAULTS,
    ...notifications
  };

  Object.entries(state).forEach(([key, value]) => {
    const input = document.querySelector(`[data-notification-key="${key}"]`);
    const card = document.querySelector(`[data-notification-card="${key}"]`);
    if (input) input.checked = !!value;
    if (card) card.classList.toggle('is-on', !!value);
  });

  injectNotificationSettingIcons();
  updateNotificationSummary(state);
  renderNotifications(state);
}

function updateNotificationSummary(state = notificationPayloadFromUI()) {
  const activeCount = Object.values(state).filter(Boolean).length;
  const activeEl = document.getElementById('notif-active-count');
  const orderEl = document.getElementById('notif-order-status');
  const communityEl = document.getElementById('notif-community-status');

  if (activeEl) activeEl.textContent = String(activeCount);
  if (orderEl) orderEl.textContent = state.orderUpdates ? 'On' : 'Off';
  if (communityEl) communityEl.textContent = state.community ? 'On' : 'Off';
}


function notificationIconKindFromType(type = '') {
  const key = String(type || '').toLowerCase();
  if (['race', 'racealerts', 'race_alert', 'race_day'].includes(key)) return 'race';
  if (['drop', 'newdrops', 'new_drop', 'product', 'asset'].includes(key)) return 'drop';
  if (['points', 'fanpoints', 'fan_points', 'rewards', 'reward'].includes(key)) return 'points';
  if (['community', 'fan', 'poll', 'trivia', 'quote', 'comment'].includes(key)) return 'community';
  if (['shipped', 'delivered', 'cancelled', 'order', 'processing', 'placed', 'out_for_delivery'].includes(key)) return 'order';
  return 'order';
}

function notificationIconSvg(kind = 'order') {
  const icons = {
    race: `
      <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
        <path d="M6 20V5"/>
        <path d="M7 5h9l-1.6 3L16 11H7"/>
      </svg>`,
    drop: `
      <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
        <path d="M12 4v10"/>
        <path d="M8 10l4 4 4-4"/>
        <path d="M5 19h14"/>
      </svg>`,
    order: `
      <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
        <path d="M7 8h10l1 12H6L7 8Z"/>
        <path d="M9 8a3 3 0 0 1 6 0"/>
      </svg>`,
    points: `
      <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
        <path d="M12 4l2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5L4.8 9.2l5-.7L12 4Z"/>
      </svg>`,
    community: `
      <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
        <path d="M5 6h14v10H9l-4 3V6Z"/>
        <path d="M8 10h8"/>
        <path d="M8 13h5"/>
      </svg>`
  };
  return icons[notificationIconKindFromType(kind)] || icons.order;
}

function notificationIconMarkup(type = 'order', className = 'notification-card-icon') {
  const kind = notificationIconKindFromType(type);
  return `<span class="${className} notif-${kind}-svg-icon" aria-hidden="true">${notificationIconSvg(kind)}</span>`;
}

function injectNotificationSettingIcons() {
  const settingIconMap = {
    raceAlerts: 'race',
    newDrops: 'drop',
    orderUpdates: 'order',
    fanPoints: 'points',
    community: 'community'
  };

  Object.entries(settingIconMap).forEach(([key, kind]) => {
    const icon = document.querySelector(`[data-notification-card="${key}"] .notification-card-icon`);
    if (!icon) return;
    icon.classList.add(`notif-${kind}-svg-icon`);
    icon.innerHTML = notificationIconSvg(kind);
  });
}

function notificationFilterKind(item = {}) {
  return notificationIconKindFromType(item.type || item.category || 'order');
}

function notificationCategoryCounts(notifications = []) {
  return {
    all: notifications.length,
    order: notifications.filter(n => notificationFilterKind(n) === 'order').length,
    race: notifications.filter(n => notificationFilterKind(n) === 'race').length,
    drop: notifications.filter(n => notificationFilterKind(n) === 'drop').length,
    points: notifications.filter(n => notificationFilterKind(n) === 'points').length,
    community: notifications.filter(n => notificationFilterKind(n) === 'community').length
  };
}

function setNotificationFilter(type = 'all') {
  CURRENT_NOTIFICATION_FILTER = type;
  renderNotifications();
}

function renderNotifications(){
  const list = document.getElementById('notif-list');
  if (!list) return;

  const notifications = getStoredAccountNotifications();
  updateNotificationInboxBadge();

  if (!notifications.length) {
    list.innerHTML = `
      <div class="notification-empty-state real-notification-empty">
        <span class="notification-empty-icon order-status-mini-icon" aria-hidden="true"></span>
        <h3>No notifications yet</h3>
        <p>Order updates appear live now. Race alerts, new drops, fan points and community updates will appear when those backend events are triggered.</p>
        <button class="notif-refresh-btn" onclick="loadMyOrders()">Refresh Orders</button>
      </div>
    `;
    return;
  }

  const unread = notifications.filter(item => !item.read).length;
  const latest = notifications[0];
  const counts = notificationCategoryCounts(notifications);
  const filtered = CURRENT_NOTIFICATION_FILTER === 'all'
    ? notifications
    : notifications.filter(item => notificationFilterKind(item) === CURRENT_NOTIFICATION_FILTER);

  const filterButtons = [
    ['all', 'All', counts.all],
    ['order', 'Orders', counts.order],
    ['race', 'Race', counts.race],
    ['drop', 'Drops', counts.drop],
    ['points', 'Points', counts.points],
    ['community', 'Community', counts.community]
  ].map(([key, label, count]) => `
    <button class="notif-filter-chip ${CURRENT_NOTIFICATION_FILTER === key ? 'on' : ''}" onclick="setNotificationFilter('${key}')">
      <span>${label}</span><b>${count}</b>
    </button>
  `).join('');

  list.innerHTML = `
    <div class="notification-command-bar">
      <div>
        <span>Notification Inbox</span>
        <strong>${unread} Unread</strong>
      </div>
      <div>
        <span>Latest Update</span>
        <strong>${latest ? timeAgo(latest.createdAt) : '-'}</strong>
      </div>
      <div>
        <span>Live Socket</span>
        <strong id="notif-socket-status">${orderSocketConnected ? 'Connected' : 'Waiting'}</strong>
      </div>
      <div class="notification-command-actions">
        <button onclick="markAllNotificationsRead()">Mark all read</button>
        <button onclick="clearAccountNotifications()">Clear</button>
      </div>
    </div>

    <div class="notification-filter-row">
      ${filterButtons}
    </div>

    ${filtered.length ? `
      <div class="real-notification-list">
        ${filtered.map(item => `
          <article class="real-notification-card ${item.read ? '' : 'unread'}" onclick="markNotificationRead('${item.id}')">
            ${notificationIconMarkup(item.type, 'real-notification-icon')}

            <div class="real-notification-body">
              <div class="real-notification-top">
                <strong>${escapeHtml(item.title || 'PADDOX Update')}</strong>
                ${item.read ? '' : '<span class="real-unread-dot" aria-hidden="true"></span>'}
              </div>
              <p>${escapeHtml(item.message || '')}</p>
              <div class="real-notification-meta">
                <span>${escapeHtml(item.orderNumber ? '#' + item.orderNumber : item.category || 'PADDOX')}</span>
                <span>${timeAgo(item.createdAt)}</span>
              </div>
            </div>

            ${item.orderId ? `<button class="real-notification-action" onclick="event.stopPropagation();openOrderFromNotification('${item.orderId}')">View</button>` : ''}
          </article>
        `).join('')}
      </div>
    ` : `
      <div class="notification-empty-state real-notification-empty compact">
        <h3>No ${CURRENT_NOTIFICATION_FILTER} notifications yet</h3>
        <p>This category is ready, but no matching update has been received yet.</p>
      </div>
    `}
  `;
}

/* ══════════════════════════════════════
   REAL NOTIFICATION INBOX + ORDER SOCKET
══════════════════════════════════════ */

const PADDOX_SOCKET_URL = 'https://paddox-backend.onrender.com';
let accountSocket = null;
let orderSocketConnected = false;
let ACCOUNT_ORDER_CACHE = [];
let CURRENT_NOTIFICATION_FILTER = 'all';

function accountNotificationKey() {
  const userId =
    currentUser?._id ||
    currentUser?.id ||
    currentUser?.email ||
    'guest';

  return `paddox_notifications_${userId}`;
}

function notificationDedupeKey(item = {}) {
  const kind = notificationIconKindFromType(item.type || item.category || 'order');
  const title = String(item.title || '').toLowerCase().replace(/\s+/g, ' ').trim();
  const status = String(item.status || '').toLowerCase().trim();
  const orderNumberMatch = title.match(/#?pdx[- ]?\d+/i);
  const orderNumber = String(item.orderNumber || (orderNumberMatch ? orderNumberMatch[0].replace('#', '') : '') || '').toLowerCase().trim();
  const orderId = String(item.orderId || '').toLowerCase().trim();
  const ref = String(item.ref || item.key || item.id || '').toLowerCase().trim();

  if (kind === 'order') {
    const orderRef = orderNumber || orderId || ref || title;
    const orderStatus = status || title.replace(/.*now\s+/i, '').trim() || String(item.message || '').toLowerCase().trim();
    return `order|${orderRef}|${orderStatus}`;
  }

  return `${kind}|${ref || title}|${status}`;
}

function dedupeAccountNotifications(items = []) {
  const map = new Map();

  items.forEach(item => {
    if (!item) return;
    const key = notificationDedupeKey(item);
    const existing = map.get(key);

    if (!existing) {
      map.set(key, { ...item, key: item.key || key });
      return;
    }

    const existingTime = new Date(existing.createdAt || 0).getTime();
    const itemTime = new Date(item.createdAt || 0).getTime();
    const base = itemTime >= existingTime ? item : existing;

    map.set(key, {
      ...existing,
      ...base,
      key,
      read: Boolean(existing.read && item.read),
      createdAt: itemTime >= existingTime ? item.createdAt : existing.createdAt
    });
  });

  return Array.from(map.values()).sort((a, b) =>
    new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );
}

function getStoredAccountNotifications() {
  try {
    const raw = localStorage.getItem(accountNotificationKey()) || '[]';
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const deduped = dedupeAccountNotifications(parsed).slice(0, 60);

    if (deduped.length !== parsed.length) {
      localStorage.setItem(accountNotificationKey(), JSON.stringify(deduped));
    }

    return deduped;
  } catch {
    return [];
  }
}

function setStoredAccountNotifications(items = []) {
  localStorage.setItem(
    accountNotificationKey(),
    JSON.stringify(dedupeAccountNotifications(items).slice(0, 60))
  );
  updateNotificationInboxBadge();
}

function notificationStatusLabel(status = '') {
  const labels = {
    placed: 'Placed',
    processing: 'Processing',
    shipped: 'Shipped',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    refunded: 'Refunded'
  };

  return labels[String(status || '').toLowerCase()] || String(status || 'Updated');
}

function notificationTypeIcon(type = '') {
  const kind = notificationIconKindFromType(type);
  return `notif-${kind}-svg-icon`;
}

function timeAgo(value) {
  const ts = new Date(value || Date.now()).getTime();
  const diff = Math.max(0, Date.now() - ts);
  const mins = Math.floor(diff / 60000);

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;

  return new Date(ts).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function addAccountNotification(notification = {}) {
  const type = notification.type || 'order';
  const status = String(notification.status || '').toLowerCase();
  const orderId = String(notification.orderId || '').trim();
  const orderNumber = String(notification.orderNumber || '').trim();
  const category = notification.category || '';
  const ref = String(notification.ref || notification.id || '').trim();

  const stableKey = notification.key || [
    notificationIconKindFromType(type),
    orderId || orderNumber || ref || category || 'paddox',
    status || String(notification.title || '').toLowerCase().trim()
  ].join('|');

  const id = notification.id || stableKey.replace(/[^a-z0-9|_-]+/gi, '-');

  const next = {
    id,
    key: stableKey,
    type,
    title: notification.title || 'PADDOX Update',
    message: notification.message || '',
    orderId,
    orderNumber,
    status,
    category,
    ref,
    createdAt: notification.createdAt || new Date().toISOString(),
    read: !!notification.read
  };

  const items = getStoredAccountNotifications();
  const nextDedupeKey = notificationDedupeKey(next);
  const duplicateIndex = items.findIndex(item => {
    if (item.key && item.key === stableKey) return true;
    if (notificationDedupeKey(item) === nextDedupeKey) return true;

    const itemKind = notificationIconKindFromType(item.type);
    const nextKind = notificationIconKindFromType(next.type);

    if (itemKind === 'order' && nextKind === 'order') {
      const sameOrder =
        (item.orderId && next.orderId && String(item.orderId) === String(next.orderId)) ||
        (item.orderNumber && next.orderNumber && String(item.orderNumber) === String(next.orderNumber));
      return sameOrder && String(item.status || '').toLowerCase() === next.status;
    }

    return itemKind === nextKind && item.ref && next.ref && String(item.ref) === String(next.ref);
  });

  if (duplicateIndex > -1) {
    const merged = [...items];
    merged[duplicateIndex] = {
      ...merged[duplicateIndex],
      ...next,
      read: merged[duplicateIndex].read && next.read,
      createdAt: merged[duplicateIndex].createdAt || next.createdAt
    };
    setStoredAccountNotifications(merged);
    renderNotifications();
    return;
  }

  setStoredAccountNotifications([next, ...items]);
  renderNotifications();
}

function updateNotificationInboxBadge() {
  const unread = getStoredAccountNotifications().filter(item => !item.read).length;
  const navItem = document.querySelector('.acc-nav-item[data-page="notifications"]');

  if (!navItem) return;

  let badge = navItem.querySelector('.notif-nav-badge');

  if (!badge) {
    badge = document.createElement('span');
    badge.className = 'notif-nav-badge';
    navItem.appendChild(badge);
  }

  badge.textContent = unread > 9 ? '9+' : String(unread);
  badge.style.display = unread ? 'inline-flex' : 'none';
}

function markNotificationRead(id) {
  const items = getStoredAccountNotifications().map(item =>
    item.id === id ? { ...item, read: true } : item
  );

  setStoredAccountNotifications(items);
  renderNotifications();
}

function markAllNotificationsRead() {
  const items = getStoredAccountNotifications().map(item => ({
    ...item,
    read: true
  }));

  setStoredAccountNotifications(items);
  renderNotifications();
  showToast('✓ Notifications marked as read');
}

function clearAccountNotifications() {
  setStoredAccountNotifications([]);
  renderNotifications();
  showToast('✓ Notification inbox cleared');
}

function openOrderFromNotification(orderId) {
  const order =
    ACCOUNT_ORDER_CACHE.find(item => String(item._id || item.id) === String(orderId));

  if (order && typeof showAccountOrderDetails === 'function') {
    showAccountOrderDetails(orderId);
    return;
  }

  document.querySelector('.acc-nav-item[data-page="orders"]')?.click();
  setTimeout(() => {
    const target = document.querySelector(`[data-order-id="${orderId}"]`);
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 250);
}

function initOrderNotificationInbox(user = currentUser) {
  if (!user) return;
  updateNotificationInboxBadge();
  renderNotifications();
}

function handleOrderStatusNotification(payload = {}) {
  const settings = getNotificationState();

  if (settings.orderUpdates === false) return;

  const status = String(payload.status || '').toLowerCase();
  const orderNumber =
    payload.orderNumber ||
    payload.order?.orderNumber ||
    payload.orderId ||
    'ORDER';

  const orderId =
    payload.orderId ||
    payload.order?._id ||
    payload.order?.id ||
    '';

  const label = notificationStatusLabel(status);
  const type =
    status === 'shipped'
      ? 'shipped'
      : status === 'delivered'
        ? 'delivered'
        : status === 'cancelled'
          ? 'cancelled'
          : 'order';

  addAccountNotification({
    type,
    orderId,
    orderNumber,
    status,
    title: `Order #${orderNumber} is now ${label}`,
    message: payload.message || `Your PADDOX order status was updated to ${label}.`,
    createdAt: new Date().toISOString(),
    key: `order|${orderId || orderNumber}|${status}`
  });

  showToast(`🔔 Order #${orderNumber} updated to ${label}`);
  loadMyOrders();
}


function notificationPreferenceAllows(type = '') {
  const settings = getNotificationState();
  const kind = notificationIconKindFromType(type);
  if (kind === 'order') return settings.orderUpdates !== false;
  if (kind === 'drop') return settings.newDrops !== false;
  if (kind === 'points') return settings.fanPoints !== false;
  if (kind === 'community') return settings.community !== false;
  if (kind === 'race') return settings.raceAlerts !== false;
  return true;
}

function addChannelNotification(type, title, message, extra = {}) {
  if (!notificationPreferenceAllows(type)) return;
  addAccountNotification({
    type,
    title,
    message,
    category: extra.category || notificationIconKindFromType(type).toUpperCase(),
    id: extra.id || `${type}-${extra.ref || Date.now()}`,
    createdAt: extra.createdAt || new Date().toISOString(),
    ...extra
  });
}

function handleCommunitySocketNotification(payload = {}, label = 'Fan Hub') {
  const ref = payload.postId || payload.commentId || payload.poll?._id || payload.trivia?._id || payload.deletedId || payload._id || Date.now();
  const title = payload.title || `${label} update`;
  const message = payload.message || payload.text || 'New Fan Hub activity is available in PADDOX.';
  addChannelNotification('community', title, message, { category: 'Fan Hub', ref });
}

function handleNewDropSocketNotification(payload = {}) {
  const name = payload.name || payload.product?.name || payload.asset?.name || 'New PADDOX drop';
  addChannelNotification('drop', 'New drop is live', `${name} is now available.`, {
    category: 'New Drops',
    ref: payload._id || payload.id || payload.product?._id || payload.asset?._id || name
  });
}

function handleFanPointsSocketNotification(payload = {}) {
  const points = Number(payload.points || payload.fanPoints || payload.delta || 0);
  const message = points
    ? `Your fan points changed by ${points > 0 ? '+' : ''}${points}.`
    : 'Your PADDOX fan points were updated.';
  addChannelNotification('points', 'Fan points updated', message, {
    category: 'Rewards',
    ref: payload.ref || payload.reason || Date.now()
  });
}

function handleRaceSocketNotification(payload = {}) {
  addChannelNotification('race', payload.title || 'Race alert', payload.message || 'A PADDOX race alert is live.', {
    category: payload.category || 'Race Alerts',
    ref: payload.ref || payload.raceId || payload.round || payload.title || Date.now(),
    createdAt: payload.createdAt || new Date().toISOString()
  });
}

function reconcileFanPointsNotification(user = currentUser) {
  if (!user) return;
  const userId = user._id || user.id || user.email || 'guest';
  const key = `paddox_fan_points_snapshot_${userId}`;
  const nextPoints = Number(user.fanPoints || 0);
  const previousRaw = localStorage.getItem(key);

  if (previousRaw !== null) {
    const previous = Number(previousRaw || 0);
    if (Number.isFinite(previous) && nextPoints > previous && notificationPreferenceAllows('points')) {
      addChannelNotification(
        'points',
        'Fan points increased',
        `You earned ${nextPoints - previous} fan points. Total balance: ${nextPoints.toLocaleString('en-IN')}.`,
        { category: 'Rewards', ref: `${userId}-${nextPoints}` }
      );
    }
  }

  localStorage.setItem(key, String(nextPoints));
}

function initOrderNotificationSocket() {
  const token = profileToken();

  if (!token || typeof window.io !== 'function') {
    if (!token) return;

    setTimeout(initOrderNotificationSocket, 500);
    return;
  }

  if (accountSocket?.connected || accountSocket?.connecting) return;

  accountSocket = window.io(PADDOX_SOCKET_URL, {
    transports: ['websocket', 'polling'],
    auth: { token },
    query: { token },
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 800
  });

  accountSocket.on('connect', () => {
    orderSocketConnected = true;
    const status = document.getElementById('notif-socket-status');
    if (status) status.textContent = 'Connected';
    renderNotifications();
  });

  accountSocket.on('disconnect', () => {
    orderSocketConnected = false;
    const status = document.getElementById('notif-socket-status');
    if (status) status.textContent = 'Waiting';
    renderNotifications();
  });

  accountSocket.on('order:status-update', handleOrderStatusNotification);

  accountSocket.on('fan:new-post', payload => handleCommunitySocketNotification(payload, 'Fan Hub'));
  accountSocket.on('fan:post-comment', payload => handleCommunitySocketNotification(payload, 'Comment'));
  accountSocket.on('poll:changed', payload => handleCommunitySocketNotification(payload, 'Poll'));
  accountSocket.on('trivia:changed', payload => handleCommunitySocketNotification(payload, 'Trivia'));
  accountSocket.on('quote:changed', payload => handleCommunitySocketNotification(payload, 'Quote'));
  accountSocket.on('product:new-drop', handleNewDropSocketNotification);
  accountSocket.on('asset:new-drop', handleNewDropSocketNotification);
  accountSocket.on('fan:points-update', handleFanPointsSocketNotification);
  accountSocket.on('race:notification', handleRaceSocketNotification);
  accountSocket.on('community:notification', payload => {
    addChannelNotification('community', payload.title || 'Community update', payload.message || 'New PADDOX community activity is live.', {
      category: payload.category || 'Fan Hub',
      ref: payload.ref || payload.id || payload._id || payload.title || Date.now(),
      createdAt: payload.createdAt || new Date().toISOString()
    });
  });

  accountSocket.on('connect_error', err => {
    orderSocketConnected = false;
    console.warn('Order notification socket failed:', err.message);
  });
}

function reconcileOrderNotificationsFromOrders(orders = []) {
  const remembered = JSON.parse(localStorage.getItem('paddox_order_status_snapshot') || '{}');
  let changed = false;

  orders.forEach(order => {
    const orderId = String(order._id || order.id || '');
    const status = String(order.status || '').toLowerCase();

    if (!orderId || !status) return;

    if (remembered[orderId] && remembered[orderId] !== status) {
      handleOrderStatusNotification({
        orderId,
        orderNumber: order.orderNumber || orderId,
        status,
        message: `Order status changed to ${notificationStatusLabel(status)}`
      });
    }

    remembered[orderId] = status;
    changed = true;
  });

  if (changed) {
    localStorage.setItem('paddox_order_status_snapshot', JSON.stringify(remembered));
  }
}

window.markNotificationRead = markNotificationRead;
window.markAllNotificationsRead = markAllNotificationsRead;
window.clearAccountNotifications = clearAccountNotifications;
window.openOrderFromNotification = openOrderFromNotification;
window.setNotificationFilter = setNotificationFilter;

async function saveNotifications(options = {}) {
  const silent = !!options.silent;
  const payload = notificationPayloadFromUI();
  const previous = currentUser?.notifications ? { ...currentUser.notifications } : getNotificationState();

  if (notificationSaving) return;

  try {
    notificationSaving = true;
    if (!silent) showToast('⏳ Saving notification settings...');
    setNotificationStatus('Saving live changes...', 'saving');

    const res = await fetch(USER_NOTIFICATION_API, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${profileToken()}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || data.success === false) {
      throw new Error(data.message || 'Notification settings save failed');
    }

    const updatedNotifications =
      data.data?.notifications ||
      data.notifications ||
      payload;

    currentUser = {
      ...(currentUser || {}),
      notifications: {
        ...NOTIFICATION_DEFAULTS,
        ...updatedNotifications
      }
    };

    localStorage.setItem('paddox_user', JSON.stringify(currentUser));
    hydrateNotificationControls(currentUser.notifications);
    setNotificationStatus('Live sync active', 'synced');

    if (!silent) showToast('🔥 Notification settings saved');

  } catch (err) {
    console.error(err);
    if (currentUser) currentUser.notifications = previous;
    hydrateNotificationControls(previous);
    setNotificationStatus('Sync failed — restored previous settings', 'error');
    showToast(`❌ ${err.message}`);
  } finally {
    notificationSaving = false;
  }
}

function queueNotificationSave() {
  const state = notificationPayloadFromUI();
  Object.entries(state).forEach(([key, enabled]) => {
    document.querySelector(`[data-notification-card="${key}"]`)?.classList.toggle('is-on', enabled);
  });
  updateNotificationSummary(state);
  renderNotifications(state);
  setNotificationStatus('Saving live changes...', 'saving');

  clearTimeout(notificationSaveTimer);
  notificationSaveTimer = setTimeout(() => saveNotifications({ silent: true }), 450);
}

function bindNotificationControls() {
  document.querySelectorAll('[data-notification-key]').forEach(input => {
    if (input.dataset.bound === 'true') return;
    input.dataset.bound = 'true';
    input.addEventListener('change', queueNotificationSave);
  });
}

/* ══ TEAM PREFS ══ */
const PADDOX_F1_TEAMS = [
  {
    name: 'Mercedes', short: 'MER', color: '#00d2be',
    logo: 'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2025/mercedes/2025mercedeslogowhite.webp',
    drivers: ['George Russell', 'Kimi Antonelli']
  },
  {
    name: 'Ferrari', short: 'FER', color: '#e8002d',
    logo: 'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2025/ferrari/2025ferrarilogolight.webp',
    drivers: ['Charles Leclerc', 'Lewis Hamilton']
  },
  {
    name: 'McLaren', short: 'MCL', color: '#ff8700',
    logo: 'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2025/mclaren/2025mclarenlogowhite.webp',
    drivers: ['Lando Norris', 'Oscar Piastri']
  },
  {
    name: 'Red Bull Racing', short: 'RBR', color: '#1e5bff',
    logo: 'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2025/redbullracing/2025redbullracinglogowhite.webp',
    drivers: ['Max Verstappen', 'Isack Hadjar']
  },
  {
    name: 'Alpine', short: 'ALP', color: '#2293d1',
    logo: 'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2025/alpine/2025alpinelogowhite.webp',
    drivers: ['Pierre Gasly', 'Franco Colapinto']
  },
  {
    name: 'Racing Bulls', short: 'VCARB', color: '#6c4cff',
    logo: 'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2025/racingbulls/2025racingbullslogowhite.webp',
    drivers: ['Liam Lawson', 'Arvid Lindblad']
  },
  {
    name: 'Haas F1 Team', short: 'HAA', color: '#ffffff',
    logo: 'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2025/haas/2025haaslogowhite.webp',
    drivers: ['Esteban Ocon', 'Oliver Bearman']
  },
  {
    name: 'Williams', short: 'WIL', color: '#64c4ff',
    logo: 'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2025/williams/2025williamslogowhite.webp',
    drivers: ['Alexander Albon', 'Carlos Sainz']
  },
  {
    name: 'Audi', short: 'AUD', color: '#00e701',
    logo: 'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2026/audi/2026audilogowhite.webp',
    drivers: ['Nico Hulkenberg', 'Gabriel Bortoleto']
  },
  {
    name: 'Cadillac', short: 'CAD', color: '#d4af37',
    logo: 'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2026/cadillac/2026cadillaclogowhite.webp',
    drivers: ['Sergio Perez', 'Valtteri Bottas']
  },
  {
    name: 'Aston Martin', short: 'AMR', color: '#006f62',
    logo: 'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2025/astonmartin/2025astonmartinlogowhite.webp',
    drivers: ['Fernando Alonso', 'Lance Stroll']
  }
];

const TEAMS = PADDOX_F1_TEAMS;

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function populateDriverSelect(selectedValue = '') {
  const driverSelect = document.getElementById('pf-driver');
  if (!driverSelect) return;

  const current =
    selectedValue ||
    currentUser?.preferences?.favouriteDriver ||
    driverSelect.value ||
    '';

  driverSelect.innerHTML = PADDOX_F1_TEAMS.map(team => `
    <optgroup label="${escapeHtml(team.name)}">
      ${team.drivers.map(driver => `
        <option value="${escapeHtml(driver)}">${escapeHtml(driver)}</option>
      `).join('')}
    </optgroup>
  `).join('');

  if (current) driverSelect.value = current;

  driverSelect.onchange = updateFanPreferenceSummary;
  updateFanPreferenceSummary();
}

function renderTeamPrefs(){
  const grid=document.getElementById('team-pref');if(!grid)return;
  const fav = currentUser?.preferences?.favouriteTeam || '';

  grid.innerHTML=PADDOX_F1_TEAMS.map((t,i)=>`
    <button
      class="team-pref-btn team-pref-card ${(fav ? fav === t.name : i===1)?'on':''}"
      data-team="${escapeHtml(t.name)}"
      data-color="${escapeHtml(t.color)}"
      onclick="selectTeam(this)"
      style="--team-color:${escapeHtml(t.color)}"
      type="button"
    >
      <span class="team-card-glow" aria-hidden="true"></span>
      <span class="team-logo-box">
        <img src="${escapeHtml(t.logo)}" alt="${escapeHtml(t.name)} logo" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='inline-flex';"/>
        <b style="display:none">${escapeHtml(t.short)}</b>
      </span>
      <span class="team-card-name">${escapeHtml(t.name)}</span>
      <span class="team-card-drivers">${escapeHtml(t.drivers.join(' · '))}</span>
    </button>
  `).join('');

  populateDriverSelect();
  updateFanPreferenceSummary();
}

function selectTeam(el){
  document.querySelectorAll('.team-pref-btn').forEach(b=>b.classList.remove('on'));
  el.classList.add('on');
  updateFanPreferenceSummary();
}

function updateFanPreferenceSummary() {
  const team = getSelectedTeam();
  const driver = document.getElementById('pf-driver')?.value || '';

  const teamEl = document.getElementById('fan-summary-team');
  const driverEl = document.getElementById('fan-summary-driver');

  if (teamEl) teamEl.textContent = team || 'Select one';
  if (driverEl) driverEl.textContent = driver || 'Select one';
}

/* ══════════════════════════════════════
   PROFILE + ADDRESS + PREFERENCES
══════════════════════════════════════ */

const USER_PROFILE_API =
  'https://paddox-backend.onrender.com/api/users/profile';
const USER_PREF_API =
  'https://paddox-backend.onrender.com/api/users/preferences';
const USER_NOTIFICATION_API =
  'https://paddox-backend.onrender.com/api/users/notifications';
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


function hasProfileToken() {
  return !!String(profileToken() || '').trim();
}

function scheduleSecuritySessionsRefresh(delay = 650, showFeedback = false) {
  window.clearTimeout(window.__paddoxSecuritySessionTimer);
  window.__paddoxSecuritySessionTimer = window.setTimeout(() => {
    if (!hasProfileToken()) {
      console.log('PADDOX sessions sync skipped until auth token is ready');
      return;
    }
    refreshSecuritySessions(showFeedback);
  }, delay);
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
  hydrateSecurityState(user);

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

  populateDriverSelect(user.preferences?.favouriteDriver || '');

  if (user.preferences?.favouriteTeam) {
    document.querySelectorAll('.team-pref-btn').forEach(btn => {
      btn.classList.toggle(
        'on',
        btn.dataset.team === user.preferences.favouriteTeam
      );
    });
  }

  updateFanPreferenceSummary();
  hydrateNotificationControls(user.notifications || NOTIFICATION_DEFAULTS);
  bindNotificationControls();
  reconcileFanPointsNotification(user);

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

window.saveNotifications = saveNotifications;
window.bindNotificationControls = bindNotificationControls;
window.hydrateNotificationControls = hydrateNotificationControls;

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

    ACCOUNT_ORDER_CACHE = orders;
    reconcileOrderNotificationsFromOrders(orders);
    renderAccountOrders(orders);
    renderDashboardOrders(orders);
    updateAccountStats(orders);

  } catch (err) {
    console.error(err);
  }
}


function renderOrdersInsightBar(orders = []) {
  const bar = document.getElementById('orders-insight-bar');
  if (!bar) return;

  if (!orders.length) {
    bar.innerHTML = '';
    bar.classList.remove('on');
    return;
  }

  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + Number(order.pricing?.total || 0), 0);
  const paidOrders = orders.filter(order => paymentStatusLabel(order).toLowerCase() === 'paid').length;
  const latestOrder = [...orders].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))[0];

  bar.classList.add('on');
  bar.innerHTML = `
    <div class="orders-insight-card">
      <span>Total Orders</span>
      <strong>${totalOrders}</strong>
    </div>
    <div class="orders-insight-card">
      <span>Paid Orders</span>
      <strong>${paidOrders}</strong>
    </div>
    <div class="orders-insight-card">
      <span>Total Spent</span>
      <strong>${formatMoney(totalSpent)}</strong>
    </div>
    <div class="orders-insight-card">
      <span>Latest Order</span>
      <strong>${orderDateLabel(latestOrder?.createdAt)}</strong>
    </div>
  `;
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
  const orders = window.USER_ACCOUNT_ORDERS || [];
  const order = orders.find(o => String(orderSafeId(o)) === String(orderId) || String(o._id) === String(orderId));

  if (!order) {
    showToast('❌ Order not found');
    return;
  }

  const safeOrderId = accountEsc(orderSafeId(order));
  const address = order.shippingAddress || {};
  const items = order.items || [];
  const itemCount = items.reduce((sum, item) => sum + Number(item.quantity || 1), 0);
  const orderNo = order.orderNumber || order._id;
  const products = items.map(item => {
    const qty = Number(item.quantity || 1);
    const lineTotal = Number(item.price || 0) * qty;

    return `
      <div class="order-detail-item pdx-detail-product">
        <div class="order-detail-img">${orderProductThumb(item)}</div>
        <div class="order-detail-copy">
          <div class="order-detail-name">${accountEsc(item.name || 'Product')}</div>
          <div class="order-detail-meta">
            <span class="detail-qty-pill">Qty ${qty}</span>
            ${item.size ? `<span>Size ${accountEsc(item.size)}</span>` : ''}
            ${item.color ? `<span>${accountEsc(item.color)}</span>` : ''}
          </div>
        </div>
        <strong class="order-detail-price">${formatMoney(lineTotal)}</strong>
      </div>
    `;
  }).join('');

  const modal = document.createElement('div');
  modal.innerHTML = `
    <div class="order-detail-overlay">
      <div class="order-detail-modal pdx-order-modal">
        <button class="order-detail-close" type="button" aria-label="Close order details">✕</button>

        <div class="order-detail-top">
          <div>
            <div class="orders-kicker">Order garage</div>
            <h2>ORDER DETAILS</h2>
            <p>#${accountEsc(orderNo)} · ${orderDateLabel(order.createdAt)}</p>
          </div>
          <div class="order-status-stack">
            <span class="ostatus ${statusClass(order.status)}">${accountEsc(order.status || 'placed')}</span>
            <span class="payment-pill ${paymentStatusClass(order)}">${paymentStatusLabel(order)}</span>
          </div>
        </div>

        <div class="order-detail-meta-strip">
          <div><span>Order Total</span><strong>${formatMoney(order.pricing?.total)}</strong></div>
          <div><span>Payment</span><strong>${accountEsc(paymentMethodLabel(order))}</strong></div>
          <div><span>Items</span><strong>${itemCount}</strong></div>
          <div><span>Placed On</span><strong>${orderTimeLabel(order.createdAt)}</strong></div>
        </div>

        ${renderOrderTimeline(order)}

        <div class="order-detail-grid">
          <section class="order-detail-panel order-detail-items-panel">
            <h3>Items</h3>
            <div class="order-detail-items-list">
              ${products || '<p class="order-muted">No items returned.</p>'}
            </div>
          </section>
          <section class="order-detail-panel order-detail-delivery-panel">
            <h3>Delivery</h3>
            <div class="order-address-box">
              <p class="order-address-line"><b>${accountEsc(address.name || '-')}</b></p>
              <p class="order-address-line">${accountEsc(address.line1 || '')}</p>
              ${address.line2 ? `<p class="order-address-line">${accountEsc(address.line2)}</p>` : ''}
              <p class="order-address-line">${accountEsc([address.city, address.state, address.pincode].filter(Boolean).join(', '))}</p>
              <p class="order-address-line">${accountEsc(address.country || 'India')}</p>
              <p class="order-address-line">Phone: ${accountEsc(address.phone || '-')}</p>
            </div>
          </section>
        </div>

        <div class="order-detail-lower">
          <div class="order-detail-note">
            <b>PADDOX order support</b>
            <span>Keep this order ID handy for tracking, receipt access and delivery support.</span>
          </div>
          <div class="order-detail-summary">
            <div class="summary-title">Payment Summary</div>
            <div><span>Subtotal</span><b>${formatMoney(order.pricing?.subtotal)}</b></div>
            <div><span>Shipping</span><b>${formatMoney(order.pricing?.shipping)}</b></div>
            ${(Number(order.pricing?.discount || 0) > 0) ? `<div><span>Discount</span><b>${formatMoney(order.pricing?.discount)}</b></div>` : ''}
            <div><span>Tax</span><b>${formatMoney(order.pricing?.tax)}</b></div>
            <div class="grand"><span>Total</span><b>${formatMoney(order.pricing?.total)}</b></div>
          </div>
        </div>

        <div class="order-detail-actions">
          <button class="trk-btn detail-primary-action" onclick="openOrderReceipt('${safeOrderId}')">Open Receipt</button>
          <button class="trk-btn detail-secondary-action" onclick="showTracking('${accountEsc(orderNo)}', ${Math.max(orderStepIndex(order.status), 0)}); this.closest('.order-detail-overlay')?.remove();">Track Order</button>
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

window.addEventListener('DOMContentLoaded', () => {
  bindAvatarUpload();
  loadMyOrders();
  loadWishlist();
  loadDownloads();
  initOrderNotificationInbox(currentUser);
  initOrderNotificationSocket();
  scheduleSecuritySessionsRefresh(900);
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

  /* Phase 20.8: the hero row already shows the first product.
     Only show this preview strip when the order has additional products. */
  if (items.length <= 1) return '';

  return items.slice(1, 4).map(item => `
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
  `).join('') + (items.length > 4 ? `<div class="order-more-items">+${items.length - 4} more item${items.length - 4 > 1 ? 's' : ''}</div>` : '');
}


function renderOrdersInsightBar(orders = []) {
  const bar = document.getElementById('orders-insight-bar');
  if (!bar) return;

  if (!orders.length) {
    bar.innerHTML = '';
    bar.classList.remove('on');
    return;
  }

  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + Number(order.pricing?.total || 0), 0);
  const paidOrders = orders.filter(order => paymentStatusLabel(order).toLowerCase() === 'paid').length;
  const latestOrder = [...orders].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))[0];

  bar.classList.add('on');
  bar.innerHTML = `
    <div class="orders-insight-card">
      <span>Total Orders</span>
      <strong>${totalOrders}</strong>
    </div>
    <div class="orders-insight-card">
      <span>Paid Orders</span>
      <strong>${paidOrders}</strong>
    </div>
    <div class="orders-insight-card">
      <span>Total Spent</span>
      <strong>${formatMoney(totalSpent)}</strong>
    </div>
    <div class="orders-insight-card">
      <span>Latest Order</span>
      <strong>${orderDateLabel(latestOrder?.createdAt)}</strong>
    </div>
  `;
}

function renderAccountOrders(orders) {
  const grid = document.getElementById('orders-grid-premium');
  const tbody = document.querySelector('.orders-table tbody');

  window.USER_ACCOUNT_ORDERS = orders || [];
  renderOrdersInsightBar(window.USER_ACCOUNT_ORDERS);

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

        ${renderOrderItemsMini(order) ? `
          <div class="order-items-preview">
            ${renderOrderItemsMini(order)}
          </div>
        ` : ''}

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
  const items = order.items || [];
  const itemCount = items.reduce((sum, item) => sum + Number(item.quantity || 1), 0);
  const orderNo = order.orderNumber || order._id;
  const paymentLabel = paymentMethodLabel(order);

  const products = items.map(item => {
    const qty = Number(item.quantity || 1);
    const lineTotal = Number(item.price || 0) * qty;
    const meta = [
      `Qty ${qty}`,
      item.size ? `Size ${accountEsc(item.size)}` : '',
      item.color ? accountEsc(item.color) : ''
    ].filter(Boolean).join(' · ');

    return `
      <div class="order-detail-item pdx-detail-product-v2">
        <div class="order-detail-img pdx-detail-img-v2">${orderProductThumb(item)}</div>
        <div class="pdx-detail-product-copy">
          <div class="order-detail-name pdx-detail-product-name">${accountEsc(item.name || 'Product')}</div>
          <div class="order-detail-meta pdx-detail-product-meta">${meta}</div>
        </div>
        <strong class="order-detail-price pdx-detail-product-price">${formatMoney(lineTotal)}</strong>
      </div>
    `;
  }).join('');

  const modal = document.createElement('div');
  modal.innerHTML = `
    <div class="order-detail-overlay pdx-detail-overlay-v2">
      <div class="order-detail-modal pdx-order-modal-v2">
        <button class="order-detail-close pdx-detail-close-v2" type="button" aria-label="Close order details">✕</button>

        <div class="pdx-detail-hero-v2">
          <div>
            <div class="orders-kicker">Order garage</div>
            <h2>ORDER DETAILS</h2>
            <p>#${accountEsc(orderNo)} · ${orderDateLabel(order.createdAt)}</p>
          </div>
          <div class="order-status-stack pdx-detail-status-v2">
            <span class="ostatus ${statusClass(order.status)}">${accountEsc(order.status || 'placed')}</span>
            <span class="payment-pill ${paymentStatusClass(order)}">${paymentStatusLabel(order)}</span>
          </div>
        </div>

        <div class="pdx-detail-stats-v2">
          <div><span>Total Paid</span><strong>${formatMoney(order.pricing?.total)}</strong></div>
          <div><span>Payment</span><strong>${accountEsc(paymentLabel)}</strong></div>
          <div><span>Items</span><strong>${itemCount}</strong></div>
          <div><span>Placed</span><strong>${orderTimeLabel(order.createdAt)}</strong></div>
        </div>

        <div class="pdx-detail-timeline-v2">
          ${renderOrderTimeline(order)}
        </div>

        <div class="pdx-detail-layout-v2">
          <section class="pdx-detail-card-v2 pdx-detail-items-v2">
            <h3>Items in this order</h3>
            <div class="pdx-detail-items-list-v2">
              ${products || '<p class="order-muted">No items returned.</p>'}
            </div>
          </section>

          <aside class="pdx-detail-side-v2">
            <section class="pdx-detail-card-v2 pdx-detail-delivery-v2">
              <h3>Delivery details</h3>
              <div class="pdx-address-v2">
                <b>${accountEsc(address.name || '-')}</b>
                <span>${accountEsc(address.line1 || '')}</span>
                ${address.line2 ? `<span>${accountEsc(address.line2)}</span>` : ''}
                <span>${accountEsc([address.city, address.state, address.pincode].filter(Boolean).join(', '))}</span>
                <span>${accountEsc(address.country || 'India')}</span>
                <span>Phone: ${accountEsc(address.phone || '-')}</span>
              </div>
            </section>

            <section class="pdx-detail-card-v2 pdx-detail-summary-v2">
              <h3>Payment summary</h3>
              <div><span>Subtotal</span><b>${formatMoney(order.pricing?.subtotal)}</b></div>
              <div><span>Shipping</span><b>${formatMoney(order.pricing?.shipping)}</b></div>
              ${(Number(order.pricing?.discount || 0) > 0) ? `<div><span>Discount</span><b>${formatMoney(order.pricing?.discount)}</b></div>` : ''}
              <div><span>Tax</span><b>${formatMoney(order.pricing?.tax)}</b></div>
              <div class="grand"><span>Total</span><b>${formatMoney(order.pricing?.total)}</b></div>
            </section>
          </aside>
        </div>

        <div class="pdx-detail-footer-v2">
          <div class="pdx-detail-support-v2">
            <b>PADDOX support ready</b>
            <span>Use this order ID for receipt access, support and delivery tracking.</span>
          </div>
          <div class="order-detail-actions pdx-detail-actions-v2">
            <button class="trk-btn detail-primary-action" onclick="openOrderReceipt('${safeOrderId}')">Open Receipt</button>
            <button class="trk-btn detail-secondary-action" onclick="showTracking('${accountEsc(orderNo)}', ${Math.max(orderStepIndex(order.status), 0)}); this.closest('.order-detail-overlay')?.remove();">Track Order</button>
          </div>
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
  hydrateSecurityState(user);
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


/* Phase 20.11C — Notification live sync bootstrap */
document.addEventListener('DOMContentLoaded', () => {
  bindNotificationControls();
  const cachedUser = JSON.parse(localStorage.getItem('paddox_user') || 'null');
  if (cachedUser?.notifications) hydrateNotificationControls(cachedUser.notifications);
});


/* Phase 20.11C.2 — fan preferences restore */
document.addEventListener('DOMContentLoaded', () => {
  renderTeamPrefs();
  populateDriverSelect();
  updateFanPreferenceSummary();
});


/* ══════════════════════════════════════
   PHASE 20.12 — SECURITY SECTION PREMIUM POLISH
══════════════════════════════════════ */
function securityPasswordScore(value = '') {
  let score = 0;
  if (value.length >= 8) score++;
  if (value.length >= 12) score++;
  if (/[A-Z]/.test(value)) score++;
  if (/[a-z]/.test(value)) score++;
  if (/[0-9]/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;
  return Math.min(score, 6);
}

function updateSecurityStrength() {
  const pass = document.getElementById('sec-new-pass')?.value || '';
  const confirm = document.getElementById('sec-confirm-pass')?.value || '';
  const bar = document.getElementById('password-strength-bar');
  const copy = document.getElementById('password-strength-copy');
  const hint = document.getElementById('password-match-hint');
  const status = document.getElementById('sec-password-status');
  if (!bar || !copy || !hint) return;

  const score = securityPasswordScore(pass);
  const pct = pass ? Math.max(14, Math.round((score / 6) * 100)) : 0;
  bar.style.width = `${pct}%`;
  bar.style.background = score >= 5 ? '#00b400' : score >= 3 ? '#c9a84c' : '#e8002d';

  copy.className = 'password-strength-copy';
  if (!pass) {
    copy.textContent = 'Strength: waiting for password';
  } else if (score >= 5) {
    copy.textContent = 'Strength: strong';
    copy.classList.add('ok');
  } else if (score >= 3) {
    copy.textContent = 'Strength: medium — add more variety';
    copy.classList.add('warn');
  } else {
    copy.textContent = 'Strength: weak — use 8+ chars, numbers and symbols';
    copy.classList.add('bad');
  }

  hint.className = 'security-hint';
  if (!confirm) {
    hint.textContent = 'Confirm password to continue.';
  } else if (pass === confirm) {
    hint.textContent = 'Passwords match.';
    hint.classList.add('ok');
  } else {
    hint.textContent = 'Passwords do not match.';
    hint.classList.add('bad');
  }

  if (status) status.textContent = score >= 5 ? 'Strong' : pass ? 'Needs Work' : 'Protected';
}

function toggleSecurityPassword(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const show = input.type === 'password';
  input.type = show ? 'text' : 'password';
  if (btn) btn.textContent = show ? 'Hide' : 'Show';
}


async function submitSecurityPassword() {
  const current = document.getElementById('sec-current-pass')?.value || '';
  const pass = document.getElementById('sec-new-pass')?.value || '';
  const confirm = document.getElementById('sec-confirm-pass')?.value || '';
  const btn = document.getElementById('security-password-btn');
  const note = document.getElementById('security-password-status');

  if (!current || !pass || !confirm) {
    showToast('⚠️ Fill all password fields');
    return;
  }
  if (pass.length < 8) {
    showToast('⚠️ New password must be at least 8 characters');
    return;
  }
  if (pass !== confirm) {
    showToast('⚠️ Confirm password does not match');
    return;
  }
  if (securityPasswordScore(pass) < 3) {
    showToast('⚠️ Use a stronger password');
    return;
  }

  try {
    if (btn) btn.textContent = 'Updating...';
    const token = profileToken();
    await authFetch('/users/security/password', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ currentPassword: current, newPassword: pass })
    });

    if (note) note.textContent = 'Password updated. Please sign in again.';
    showToast('✅ Password updated — please login again');
    TokenManager.clearAccess();
    localStorage.removeItem('paddox_user');
    localStorage.removeItem('paddox_session_id');
    setTimeout(() => location.reload(), 1200);
  } catch (err) {
    console.error(err);
    if (btn) btn.textContent = 'Update Password ✓';
    showToast(`❌ ${err.message}`);
  }
}

function setSecuritySummaryClass(el, className) {
  if (!el) return;
  el.classList.remove('status-good', 'status-on', 'status-off', 'status-strong', 'status-watch', 'status-warn');
  if (className) el.classList.add(className);
}

function updateSecurityTips(enabled) {
  const tip = document.getElementById('security-2fa-tip');
  const title = document.getElementById('security-2fa-tip-title');
  const copy = document.getElementById('security-2fa-tip-copy');
  if (!tip) return;
  tip.classList.toggle('is-active', !!enabled);
  tip.classList.toggle('needs-action', !enabled);
  if (title) title.textContent = enabled ? '2FA active' : 'Secure sign-in';
  if (copy) copy.textContent = enabled
    ? 'Email verification is protecting your login.'
    : 'Email verification adds an extra login check.';
}

function hydrateSecurityState(user = currentUser || {}) {
  const enabled = !!user.security?.twoFactor?.enabled;
  const status = document.getElementById('sec-2fa-status');
  const toggle = document.getElementById('security-2fa-toggle');
  const chip = document.getElementById('sec-protection-chip') || document.querySelector('.twofa-premium-box')?.closest('.security-card')?.querySelector('.security-chip');
  if (status) {
    status.textContent = enabled ? 'ON' : 'OFF';
    setSecuritySummaryClass(status, enabled ? 'status-on' : 'status-off');
  }
  if (toggle) toggle.checked = enabled;
  if (chip) {
    chip.textContent = enabled ? '2FA ACTIVE' : 'SAFE MODE';
    chip.classList.toggle('ok', enabled);
    chip.classList.toggle('muted', !enabled);
  }
  const safety = document.getElementById('sec-safety-status');
  if (safety) {
    safety.textContent = enabled ? 'Strong' : 'Good';
    setSecuritySummaryClass(safety, enabled ? 'status-strong' : 'status-good');
  }
  const password = document.getElementById('sec-password-status');
  setSecuritySummaryClass(password, 'status-good');
  updateSecurityTips(enabled);
}

function prepareTwoFactorToggle(enable) {
  pendingTwoFactorAction = enable ? 'enable' : 'disable';
  const row = document.getElementById('twofa-code-row');
  const hint = document.getElementById('sec-2fa-hint');
  if (row) row.classList.remove('show');
  if (hint) hint.textContent = `${enable ? 'Enable' : 'Disable'} 2FA: enter your current password, then request a code.`;
}

async function sendSecurityTwoFactorCode() {
  const currentPassword = document.getElementById('sec-2fa-pass')?.value || '';
  const hint = document.getElementById('sec-2fa-hint');
  if (!currentPassword) {
    showToast('⚠️ Enter current password first');
    return;
  }
  try {
    const token = profileToken();
    showToast('📩 Sending security code...');
    const data = await authFetch('/users/security/2fa/send', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ currentPassword, action: pendingTwoFactorAction })
    });
    document.getElementById('twofa-code-row')?.classList.add('show');
    if (hint) hint.textContent = data.message || 'Code sent. Enter it below.';
    showToast('✅ Verification code sent');
  } catch (err) {
    console.error(err);
    showToast(`❌ ${err.message}`);
  }
}

async function verifySecurityTwoFactorCode() {
  const code = document.getElementById('sec-2fa-code')?.value.trim() || '';
  if (!code) {
    showToast('⚠️ Enter the 6-digit code');
    return;
  }
  try {
    const token = profileToken();
    const data = await authFetch('/users/security/2fa/verify', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ code })
    });
    if (data.data?.user) {
      currentUser = data.data.user;
      localStorage.setItem('paddox_user', JSON.stringify(currentUser));
      hydrateSecurityState(currentUser);
    }
    document.getElementById('twofa-code-row')?.classList.remove('show');
    document.getElementById('sec-2fa-pass').value = '';
    document.getElementById('sec-2fa-code').value = '';
    showToast(data.message || '✅ Two-factor settings updated');
  } catch (err) {
    console.error(err);
    showToast(`❌ ${err.message}`);
  }
}

function getSecurityBrowserName() {
  const ua = navigator.userAgent;
  if (/Edg\//.test(ua)) return 'Edge';
  if (/Chrome\//.test(ua) && !/Edg\//.test(ua)) return 'Chrome';
  if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) return 'Safari';
  if (/Firefox\//.test(ua)) return 'Firefox';
  return 'Current browser';
}

async function refreshSecuritySessions(showFeedback = false) {
  const list = document.getElementById('security-session-list');
  const count = document.getElementById('sec-session-count');
  const note = document.getElementById('security-session-note');
  if (!list) return;

  try {
    list.innerHTML = `
      <div class="session-premium-card current">
        <span class="session-device-icon" aria-hidden="true"></span>
        <div><div class="sess-name">Loading sessions...</div><div class="sess-meta">Checking trusted devices</div></div>
      </div>
    `;

    const token = profileToken();

    if (!token) {
      if (count) {
        count.textContent = 'Login Required';
        setSecuritySummaryClass(count, 'status-warn');
      }
      if (note) {
        note.textContent = 'Secure session sync will start after login is completed.';
      }
      list.innerHTML = `
        <div class="session-premium-card current">
          <span class="session-device-icon" aria-hidden="true"></span>
          <div>
            <div class="sess-name">Session sync waiting</div>
            <div class="sess-meta">Login token not ready yet</div>
          </div>
        </div>
      `;
      return;
    }

    const data = await authFetch('/users/security/sessions', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const sessions = data.data?.sessions || [];
    const activeCount = sessions.length || 1;
    if (count) {
      count.textContent = `${activeCount} Active`;
      setSecuritySummaryClass(count, activeCount > 1 ? 'status-warn' : 'status-good');
    }
    if (note) {
      note.textContent = activeCount > 1
        ? `${activeCount} trusted sessions are active. Revoke anything you do not recognize.`
        : 'Only this browser is active right now.';
    }

    if (!sessions.length) {
      const browser = getSecurityBrowserName();
      list.innerHTML = `
        <div class="session-premium-card current">
          <span class="session-device-icon" aria-hidden="true"></span>
          <div>
            <div class="sess-name">${browser} · Current device</div>
            <div class="sess-meta">Active now · Protected session</div>
          </div>
          <span class="sess-active">● Active</span>
        </div>
      `;
      return;
    }

    list.innerHTML = sessions.map(session => {
      const current = !!session.current;
      const deviceClass = /phone/i.test(session.device || '') ? 'phone' : '';
      const activeCopy = current ? 'Active now · Protected session' : `Last active ${formatSessionTime(session.lastActiveAt)}`;
      return `
        <div class="session-premium-card ${current ? 'current' : ''}">
          <span class="session-device-icon ${deviceClass}" aria-hidden="true"></span>
          <div>
            <div class="sess-name">${escapeHtml(session.browser || 'Browser')} · ${current ? 'Current device' : escapeHtml(session.device || 'Device')}</div>
            <div class="sess-meta">${escapeHtml(activeCopy)}</div>
          </div>
          ${current
            ? '<span class="sess-active">● Active</span>'
            : `<button class="revoke-btn" type="button" onclick="revokeSecuritySession('${escapeAttr(session.sessionId)}')">Revoke</button>`
          }
        </div>
      `;
    }).join('');

    if (showFeedback) showToast('✓ Sessions refreshed');
  } catch (err) {
    console.error(err);
    list.innerHTML = `
      <div class="session-premium-card current">
        <span class="session-device-icon" aria-hidden="true"></span>
        <div>
          <div class="sess-name">${getSecurityBrowserName()} · Current device</div>
          <div class="sess-meta">Active now · Protected session</div>
        </div>
        <span class="sess-active">● Active</span>
      </div>
      <div class="session-premium-card locked">
        <span class="session-device-icon phone" aria-hidden="true"></span>
        <div>
          <div class="sess-name">Session sync unavailable</div>
          <div class="sess-meta">Try again after backend deploy is live.</div>
        </div>
      </div>
    `;
    if (count) {
      count.textContent = '1 Active';
      setSecuritySummaryClass(count, 'status-watch');
    }
    if (note) note.textContent = 'Session sync could not refresh. Your current login is still active.';
    if (showFeedback) showToast(`❌ ${err.message}`);
  }
}

function formatSessionTime(dateValue) {
  if (!dateValue) return 'recently';
  const diff = Date.now() - new Date(dateValue).getTime();
  if (Number.isNaN(diff) || diff < 60000) return 'just now';
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.floor(hours / 24)} day ago`;
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(value = '') {
  return escapeHtml(value).replace(/`/g, '&#96;');
}

async function revokeSecuritySession(sessionId) {
  if (!sessionId) return;
  try {
    const token = profileToken();
    await authFetch(`/users/security/sessions/${encodeURIComponent(sessionId)}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    showToast('✅ Session revoked');
    scheduleSecuritySessionsRefresh(300, true);
  } catch (err) {
    console.error(err);
    showToast(`❌ ${err.message}`);
  }
}

window.revokeSecuritySession = revokeSecuritySession;
window.refreshSecuritySessions = refreshSecuritySessions;
window.scheduleSecuritySessionsRefresh = scheduleSecuritySessionsRefresh;

document.addEventListener('DOMContentLoaded', () => {
  updateSecurityStrength();
  hydrateSecurityState(JSON.parse(localStorage.getItem('paddox_user') || 'null') || currentUser || {});
  scheduleSecuritySessionsRefresh(900);
});



/* A4.7C.10 — Account deep-link polish for receipt buttons.
   Allows receipt.html to open Account directly on #orders or #downloads. */
(function initAccountDeepLinks(){
  function activateAccountHash(){
    const page = String(window.location.hash || '').replace('#', '').trim().toLowerCase();
    if (!page) return;

    const allowed = new Set(['dashboard','orders','wishlist','downloads','profile','security','notifications']);
    if (!allowed.has(page)) return;

    const item = document.querySelector(`.acc-nav-item[data-page="${page}"]`);
    if (item) {
      setTimeout(() => item.click(), 180);
    }
  }

  window.addEventListener('load', activateAccountHash);
  window.addEventListener('hashchange', activateAccountHash);
})();
