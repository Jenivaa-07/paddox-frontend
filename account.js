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

/* ══ AUTH ══ */
let currentUser=null;

/* Tab switching */
document.querySelectorAll('.auth-tab').forEach(tab=>{
  tab.addEventListener('click',()=>{
    document.querySelectorAll('.auth-tab').forEach(t=>t.classList.remove('on'));
    document.querySelectorAll('.auth-form').forEach(f=>f.classList.remove('on'));
    tab.classList.add('on');
    document.getElementById(`form-${tab.dataset.tab}`).classList.add('on');
  });
});

/* Login */
document.getElementById('login-btn')?.addEventListener('click',doLogin);
document.getElementById('li-pass')?.addEventListener('keydown',e=>{if(e.key==='Enter')doLogin()});

function doLogin(){
  const email=document.getElementById('li-email').value.trim();
  const pass=document.getElementById('li-pass').value;
  if(!email||!pass){showToast('⚠️ Please fill in all fields');return}
  if(pass!=='paddox123'){showToast('⚠️ Wrong password. Try: paddox123');return}
  const fname=email.split('@')[0];
  loginUser({name:fname.charAt(0).toUpperCase()+fname.slice(1)+' Mehta',email,av:'🏎️'});
}

/* Register */
document.getElementById('register-btn')?.addEventListener('click',doRegister);
function doRegister(){
  const fname=document.getElementById('ri-fname').value.trim();
  const email=document.getElementById('ri-email').value.trim();
  const pass=document.getElementById('ri-pass').value;
  if(!fname||!email||!pass){showToast('⚠️ Fill in all required fields');return}
  if(pass.length<6){showToast('⚠️ Password must be at least 6 characters');return}
  loginUser({name:`${fname} ${document.getElementById('ri-lname').value.trim()}`.trim(),email,av:'🏎️'});
}

/* Demo login */
function demoLogin(){loginUser({name:'Arjun Mehta',email:'arjun@example.com',av:'🏎️'})}

function loginUser(user){
  currentUser=user;
  sessionStorage.setItem('paddox_user',JSON.stringify(user));

  /* Hide auth, show dashboard */
  document.getElementById('auth-screen').style.display='none';
  const accScreen=document.getElementById('acc-screen');
  accScreen.style.display='grid';

  /* Populate profile */
  document.getElementById('prof-avatar').textContent=user.av;
  document.getElementById('prof-name').textContent=user.name;
  document.getElementById('prof-email').textContent=user.email;
  document.getElementById('dash-greeting').textContent=`HEY, ${user.name.split(' ')[0].toUpperCase()}`;
  document.getElementById('pf-fn').value=user.name.split(' ')[0]||'';
  document.getElementById('pf-ln').value=user.name.split(' ')[1]||'';
  document.getElementById('pf-em').value=user.email;

  renderWishlist();
  renderNotifications();
  renderTeamPrefs();
  initReveal(accScreen);
  showToast(`✓ Welcome back, ${user.name.split(' ')[0]}! 🏁`);
}

/* Logout */
document.getElementById('logout-btn')?.addEventListener('click',()=>{
  currentUser=null;
  sessionStorage.removeItem('paddox_user');
  document.getElementById('acc-screen').style.display='none';
  document.getElementById('auth-screen').style.display='flex';
  showToast('Signed out successfully');
});

/* Auto-restore session */
(function(){
  const saved=sessionStorage.getItem('paddox_user');
  if(saved){try{loginUser(JSON.parse(saved))}catch(e){}}
})();

/* ══ ACCOUNT NAV PAGES ══ */
document.querySelectorAll('.acc-nav-item').forEach(item=>{
  item.addEventListener('click',()=>{
    document.querySelectorAll('.acc-nav-item').forEach(i=>i.classList.remove('on'));
    document.querySelectorAll('.acc-page').forEach(p=>p.classList.remove('on'));
    item.classList.add('on');
    const page=document.getElementById(`page-${item.dataset.page}`);
    if(page){page.classList.add('on');initReveal(page);}
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
const WL_ITEMS=[
  {icon:'🪖',name:'F1 Helmet Replica',  team:"Collector's Edition", price:'₹14,999', bg:'linear-gradient(135deg,#111,#1e1e1e)'},
  {icon:'⌚',name:'Monaco Circuit Watch',team:'Paddox Edition',       price:'₹18,999', bg:'linear-gradient(135deg,#0d0d0d,#1e1a00)'},
  {icon:'📌',name:'Driver Enamel Pin Set',team:'Multi-Team',          price:'₹799',    bg:'linear-gradient(135deg,#111,#1e1e1e)'},
];
function renderWishlist(){
  const grid=document.getElementById('wl-grid');if(!grid)return;
  grid.innerHTML=WL_ITEMS.map(item=>`
    <div class="wl-card">
      <div class="wl-card-img" style="background:${item.bg}">${item.icon}</div>
      <div class="wl-card-info">
        <div class="wl-card-team">${item.team}</div>
        <div class="wl-card-name">${item.name}</div>
        <div class="wl-card-foot">
          <span class="wl-card-price">${item.price}</span>
          <button class="wl-card-btn" onclick="showToast('✓ Added to cart!')">Add to Cart</button>
        </div>
      </div>
    </div>
  `).join('');
}

/* ══ NOTIFICATIONS ══ */
const NOTIFS=[
  {ic:'🚚',title:'Order #PDX-00801 shipped!',       sub:'RB20 Team Tee is on its way. Expected: May 13.',           time:'2 hours ago',  unread:true},
  {ic:'🔥',title:'New Drop: Monaco GP Collection',  sub:'Exclusive Monaco art prints, helmets and caps just dropped.',time:'Yesterday',    unread:true},
  {ic:'🏆',title:'You earned 500 Fan Points!',       sub:'Keep shopping to unlock Pro Fan tier.',                     time:'3 days ago',   unread:false},
  {ic:'📊',title:'Fan Poll: Who wins Monaco 2025?',  sub:'Vote now and earn 50 fan points.',                          time:'4 days ago',   unread:false},
  {ic:'📦',title:'Order #PDX-00812 delivered!',      sub:'Your SF-25 Podium Cap has been delivered. Rate your order.',time:'May 2, 2025', unread:false},
];
function renderNotifications(){
  const list=document.getElementById('notif-list');if(!list)return;
  list.innerHTML=NOTIFS.map(n=>`
    <div class="nitem ${n.unread?'unread':''}">
      <div class="n-ic">${n.ic}</div>
      <div style="flex:1">
        <div class="n-title" style="font-weight:${n.unread?600:500}">${n.title}</div>
        <div class="n-sub">${n.sub}</div>
        <div class="n-time">${n.time}</div>
      </div>
      ${n.unread?'<div class="n-dot"></div>':''}
    </div>
  `).join('');
}

/* ══ TEAM PREFS ══ */
const TEAMS=[{emoji:'🔴',name:'Ferrari'},{emoji:'🔵',name:'Red Bull'},{emoji:'⚫',name:'Mercedes'},{emoji:'🟠',name:'McLaren'},{emoji:'🟢',name:'Aston'},{emoji:'🔵',name:'Alpine'}];
function renderTeamPrefs(){
  const grid=document.getElementById('team-pref');if(!grid)return;
  grid.innerHTML=TEAMS.map((t,i)=>`
    <button class="team-pref-btn ${i===0?'on':''}" onclick="selectTeam(this)">${t.emoji} ${t.name}</button>
  `).join('');
}
function selectTeam(el){
  document.querySelectorAll('.team-pref-btn').forEach(b=>b.classList.remove('on'));
  el.classList.add('on');
}

/* ══ PROFILE SAVE ══ */
function saveProfile(){
  const fn=document.getElementById('pf-fn').value.trim();
  const ln=document.getElementById('pf-ln').value.trim();
  if(fn){
    document.getElementById('prof-name').textContent=`${fn} ${ln}`.trim();
    document.getElementById('dash-greeting').textContent=`HEY, ${fn.toUpperCase()}`;
    if(currentUser){currentUser.name=`${fn} ${ln}`.trim();sessionStorage.setItem('paddox_user',JSON.stringify(currentUser));}
  }
  showToast('✓ Profile updated successfully!');
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

console.log('%c👤 PADDOX — Account Page Loaded','color:#e8002d;font-size:14px;font-weight:bold;');