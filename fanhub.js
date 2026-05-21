/* ============================================================
   PADDOX — fanhub.js   |   Digital Fan Hub Logic
   ============================================================ */
'use strict';
/* ============================================================
   REAL F1 2026 DATA FUNCTIONS
   Replace all hardcoded arrays with live API calls
   ============================================================ */

/* ── Load next race countdown ── */
async function loadNextRaceCountdown() {
  try {
    const data = await PaddoxAPI.f1.nextRace();
    if (!data.success || !data.data.race) return;

    const { race, countdown } = data.data;

    /* Update race info */
    const nameEl = document.querySelector('.cs-name');
    if (nameEl) nameEl.textContent = race.name;

    const circEl = document.querySelector('.cs-circuit');
    if (circEl) circEl.textContent = `${race.circuit} · ${race.location}`;

    const flagEl = document.querySelector('.cs-flag');
    if (flagEl) flagEl.textContent = race.flag;

    const chipEl = document.querySelector('.cs-chip');
    if (chipEl) chipEl.textContent = `Round ${race.round} · Season ${race.season}`;

    /* Start live countdown */
    function tick() {
      const now  = new Date();
      const race_date = new Date(data.data.raceDate);
      const diff = race_date - now;
      if (diff <= 0) return;

      const d = Math.floor(diff / 864e5);
      const h = Math.floor((diff % 864e5) / 36e5);
      const m = Math.floor((diff % 36e5) / 6e4);
      const s = Math.floor((diff % 6e4) / 1e3);

      ['d','h','m','s'].forEach((key, i) => {
        const val = [d,h,m,s][i];
        const el  = document.getElementById(`cd-${key}`);
        if (el) el.textContent = String(val).padStart(2,'0');
      });
    }
    tick();
    setInterval(tick, 1000);

  } catch (err) {
    console.warn('Next race load failed — using fallback', err);
  }
}

/* ── Load real race calendar ── */
async function loadRealCalendar() {
  const grid = document.getElementById('race-grid');
  if (!grid) return;

  try {
    /* Show loading state */
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--muted)">
        <div style="font-size:2rem;margin-bottom:12px">🏎️</div>
        <p>Loading 2026 Race Calendar...</p>
      </div>`;

    const data = await PaddoxAPI.f1.schedule();
    if (!data.success) throw new Error('API failed');

    const races = data.data.races;

    /* Find the "next" race */
    const now     = new Date();
    let nextFound = false;
    const tagged  = races.map(r => {
      const rDate = new Date(`${r.date}T${r.time || '13:00:00Z'}`);
      const past  = rDate < now;
      let status  = past ? 'completed' : 'upcoming';
      if (!past && !nextFound) { status = 'next'; nextFound = true; }
      return { ...r, status };
    });

    grid.innerHTML = tagged.map((r, i) => {
      const isNext = r.status === 'next';
      const rDate  = new Date(`${r.date}T${r.time || '13:00:00Z'}`);
      const diff   = rDate - now;
      const d      = Math.max(0, Math.floor(diff / 864e5));
      const h      = Math.max(0, Math.floor((diff % 864e5) / 36e5));
      const m      = Math.max(0, Math.floor((diff % 36e5) / 6e4));

      return `
        <div class="rcard" style="animation-delay:${i * 0.05}s">
          <div class="rc-flag">${r.flag}</div>
          <div class="rc-round">Round ${r.round}</div>
          <div class="rc-name">${r.name}</div>
          <div class="rc-circuit">${r.circuit} · ${r.location}</div>
          <div class="rc-date">📅 ${new Date(r.date).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}</div>
          <span class="rc-status rs-${r.status === 'next' ? 'next' : r.status === 'completed' ? 'done' : 'up'}">
            ${r.status === 'next' ? '▶ Next Race' : r.status === 'completed' ? '✓ Completed' : 'Upcoming'}
          </span>
          ${isNext ? `
            <div class="rc-mini-cd">
              <div class="rcb"><div class="rcb-n">${String(d).padStart(2,'0')}</div><div class="rcb-l">Days</div></div>
              <div class="rcb"><div class="rcb-n">${String(h).padStart(2,'0')}</div><div class="rcb-l">Hrs</div></div>
              <div class="rcb"><div class="rcb-n">${String(m).padStart(2,'0')}</div><div class="rcb-l">Min</div></div>
            </div>` : ''}
        </div>`;
    }).join('');

  } catch (err) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--muted)">
        <p>⚠️ Could not load calendar. Using cached data.</p>
      </div>`;
    console.warn('Calendar load failed:', err);
    /* Fallback to existing renderCalendar() function */
    if (typeof renderCalendar === 'function') renderCalendar();
  }
}

/* ── Load real driver standings ── */
async function loadRealDriverStandings() {
  const sel  = document.getElementById('drv-selector');
  const card = document.getElementById('drv-card');
  const bars = document.getElementById('drv-bars');
  const cmp  = document.getElementById('cmp-grid');
  if (!sel) return;

  try {
    sel.innerHTML = `<div style="color:var(--muted);font-size:.85rem">Loading 2026 drivers...</div>`;

    const data = await PaddoxAPI.f1.driverStands();
    if (!data.success || !data.data.standings.length) throw new Error('No standings');

    const standings = data.data.standings;
    let active = 0;

    function renderDriver(i) {
      active = i;
      const s = standings[i];
      const d = s.driver;
      const t = s.team;

      /* Selector pills */
      sel.innerHTML = standings.slice(0, 10).map((st, idx) => `
        <div class="drv-pill ${idx === i ? 'on' : ''}" onclick="selectRealDriver(${idx})">
          <div class="dp-av">${st.team.emoji}</div>
          <div>
            <div class="dp-name">${st.driver.code || st.driver.lastName}</div>
            <div class="dp-team">${st.team.name}</div>
          </div>
        </div>`).join('');

      /* Driver card */
      if (card) card.innerHTML = `
        <div class="drv-num-bg">${d.number || i + 1}</div>
        <div class="drv-big-av">${t.emoji}</div>
        <div class="drv-name">${d.fullName}</div>
        <div class="drv-team">${t.name}</div>
        <div style="font-size:.8rem;color:#ccc;margin-bottom:14px">${d.flag} ${d.nationality}</div>
        <div class="drv-tags">
          <span class="drv-tag">#${d.number || '?'}</span>
          <span class="drv-tag">P${s.position}</span>
          <span class="drv-tag">${s.points} PTS</span>
        </div>`;

      /* Stat bars */
      const statMap = [
        { label:'Championship Points', val: Math.min(100, Math.round(s.points / standings[0].points * 100)) },
        { label:'Wins',     val: Math.min(100, Math.round(s.wins / Math.max(standings[0].wins, 1) * 100)) },
        { label:'Podiums',  val: Math.min(100, 80 - i * 5) },
        { label:'Pace',     val: Math.min(100, 99 - i * 2) },
        { label:'Racecraft',val: Math.min(100, 98 - i * 2) },
        { label:'Consistency', val: Math.min(100, 96 - i * 2) },
      ];
      if (bars) {
        bars.innerHTML = statMap.map(st => `
          <div class="sb-row">
            <div class="sb-hd">
              <span class="sb-lbl">${st.label}</span>
              <span class="sb-val">${st.val}</span>
            </div>
            <div class="sb-track">
              <div class="sb-fill" data-w="${st.val}%" style="width:0%;background:${t.color}"></div>
            </div>
          </div>`).join('');
        setTimeout(() => bars.querySelectorAll('.sb-fill').forEach(b => b.style.width = b.dataset.w), 80);
      }

      /* Stats grid */
      if (cmp) cmp.innerHTML = `
        <div class="cmp-c"><div class="cmp-v">${s.wins}</div><div class="cmp-l">Wins</div></div>
        <div class="cmp-c"><div class="cmp-v">${s.points}</div><div class="cmp-l">Points</div></div>
        <div class="cmp-c"><div class="cmp-v">P${s.position}</div><div class="cmp-l">Position</div></div>
        <div class="cmp-c"><div class="cmp-v">${d.number || '—'}</div><div class="cmp-l">Car No.</div></div>`;
    }

    /* Make selectRealDriver global */
    window.selectRealDriver = renderDriver;
    renderDriver(0);

  } catch (err) {
    console.warn('Driver standings failed — using fallback', err);
    if (typeof renderDriverSelector === 'function') {
      renderDriverSelector();
      renderDriverStats();
    }
  }
}

/* ── Load last race result for fan hub ── */
async function loadLastResult() {
  try {
    const data = await PaddoxAPI.f1.lastResult();
    if (!data.success || !data.data.race) return;

    const race = data.data.race;
    const ticker = document.getElementById('ticker-text');
    if (ticker && race.winner) {
      ticker.textContent = `🏆 ${race.name} Winner: ${race.winner.name} (${race.winner.team})`;
    }
  } catch (err) {
    console.warn('Last result load failed:', err);
  }
}
/* ══ DATA ══ */
const WALLPAPERS = [
  { name:'Ferrari SF-25 Dawn',  cat:'cars',     type:'free',    img:'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80',     res:'4K · 3840×2160', emoji:'🏎️' },
  { name:'Max Attack Mode',     cat:'drivers',  type:'premium', img:'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&q=80',     res:'4K · 3840×2160', emoji:'👤' },
  { name:'Silverstone Aerial',  cat:'circuits', type:'free',    img:'https://images.unsplash.com/photo-1504197832061-98658c95b13e?w=800&q=80',     res:'2K · 2560×1440', emoji:'🗺️' },
  { name:'McLaren Papaya Burst',cat:'cars',     type:'premium', img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',        res:'4K · 3840×2160', emoji:'🏎️' },
  { name:'Scuderia Fire Art',   cat:'art',      type:'free',    img:'https://images.unsplash.com/photo-1541005329-22a78da1b5f0?w=800&q=80',         res:'HD · 1920×1080', emoji:'🎨' },
  { name:'Hamilton Era',        cat:'drivers',  type:'premium', img:'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',     res:'4K · 3840×2160', emoji:'⭐' },
  { name:'Monaco Neon Circuit', cat:'circuits', type:'free',    img:'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&q=80',         res:'2K · 2560×1440', emoji:'🏙️' },
  { name:'Golden Lap Abstract', cat:'art',      type:'premium', img:'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80',     res:'4K · 3840×2160', emoji:'✨' },
];

const DRIVERS = [
  { num:1,  name:'Max Verstappen', team:'Red Bull Racing',   nat:'🇳🇱 Netherlands', av:'🔵',
    stats:{ pace:98, racecraft:97, overtaking:95, defending:88, wetweather:96, consistency:92 },
    season:{ wins:6, podiums:10, poles:5, pts:195, pos:'1st' },
    img:'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&q=80' },
  { num:16, name:'Charles Leclerc', team:'Scuderia Ferrari', nat:'🇲🇨 Monaco',      av:'🔴',
    stats:{ pace:96, racecraft:90, overtaking:88, defending:84, wetweather:89, consistency:85 },
    season:{ wins:4, podiums:9,  poles:7, pts:168, pos:'2nd' },
    img:'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400&q=80' },
  { num:44, name:'Lewis Hamilton',  team:'Scuderia Ferrari', nat:'🇬🇧 United Kingdom', av:'⭐',
    stats:{ pace:94, racecraft:96, overtaking:96, defending:90, wetweather:98, consistency:90 },
    season:{ wins:2, podiums:7,  poles:3, pts:140, pos:'3rd' },
    img:'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80' },
  { num:4,  name:'Lando Norris',    team:'McLaren F1 Team',  nat:'🇬🇧 United Kingdom', av:'🟠',
    stats:{ pace:95, racecraft:89, overtaking:91, defending:83, wetweather:87, consistency:88 },
    season:{ wins:3, podiums:8,  poles:4, pts:155, pos:'4th' },
    img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80' },
  { num:14, name:'Fernando Alonso', team:'Aston Martin F1',  nat:'🇪🇸 Spain',      av:'🟢',
    stats:{ pace:90, racecraft:99, overtaking:94, defending:96, wetweather:95, consistency:89 },
    season:{ wins:0, podiums:3,  poles:1, pts:72,  pos:'7th' },
    img:'https://images.unsplash.com/photo-1504197832061-98658c95b13e?w=400&q=80' },
];

const RACES = [
  { round:1,  name:'Bahrain Grand Prix',       circuit:"Bahrain Int'l Circuit",       date:'Mar 2',  flag:'🇧🇭', status:'completed', winner:'Verstappen' },
  { round:2,  name:'Saudi Arabian GP',         circuit:'Jeddah Corniche Circuit',     date:'Mar 9',  flag:'🇸🇦', status:'completed', winner:'Leclerc'    },
  { round:3,  name:'Australian Grand Prix',    circuit:'Albert Park Circuit',         date:'Mar 23', flag:'🇦🇺', status:'completed', winner:'Norris'     },
  { round:4,  name:'Japanese Grand Prix',      circuit:'Suzuka Circuit',             date:'Apr 6',  flag:'🇯🇵', status:'completed', winner:'Verstappen' },
  { round:5,  name:'Chinese Grand Prix',       circuit:'Shanghai Int\'l Circuit',    date:'Apr 20', flag:'🇨🇳', status:'completed', winner:'Hamilton'   },
  { round:6,  name:'Miami Grand Prix',         circuit:'Miami Int\'l Autodrome',     date:'May 4',  flag:'🇺🇸', status:'completed', winner:'Verstappen' },
  { round:7,  name:'Emilia Romagna GP',        circuit:'Autodromo Enzo Ferrari',     date:'May 18', flag:'🇮🇹', status:'completed', winner:'Leclerc'    },
  { round:8,  name:'Monaco Grand Prix',        circuit:'Circuit de Monaco',          date:'May 25', flag:'🇲🇨', status:'next',      winner:null         },
  { round:9,  name:'Spanish Grand Prix',       circuit:'Circuit de Barcelona',       date:'Jun 1',  flag:'🇪🇸', status:'upcoming',  winner:null         },
  { round:10, name:'Canadian Grand Prix',      circuit:'Circuit Gilles Villeneuve',  date:'Jun 15', flag:'🇨🇦', status:'upcoming',  winner:null         },
  { round:11, name:'Austrian Grand Prix',      circuit:'Red Bull Ring',              date:'Jun 29', flag:'🇦🇹', status:'upcoming',  winner:null         },
  { round:12, name:'British Grand Prix',       circuit:'Silverstone Circuit',        date:'Jul 6',  flag:'🇬🇧', status:'upcoming',  winner:null         },
];

const QUOTES = [
  { text:'I have no idea how I did that lap. Sometimes the car just talks to you and you have to listen.',    driver:'Max Verstappen',  team:'Oracle Red Bull Racing', av:'🔵' },
  { text:'Every time I put on the helmet, I feel like I can conquer the world. That is what racing does.',  driver:'Lewis Hamilton',   team:'Scuderia Ferrari',       av:'⭐' },
  { text:'Monaco is not just a race — it is a statement. You either belong here or you do not.',            driver:'Charles Leclerc', team:'Scuderia Ferrari',       av:'🔴' },
  { text:'Pressure is nothing more than the shadow of great opportunity. I embrace every moment on track.', driver:'Lando Norris',    team:'McLaren F1 Team',        av:'🟠' },
  { text:'After 20 years I am still hungry. The day you stop learning is the day you stop improving.',      driver:'Fernando Alonso', team:'Aston Martin F1',        av:'🟢' },
  { text:'Speed is my language, the track is my canvas, every lap a sentence written in fire.',             driver:'Max Verstappen',  team:'Oracle Red Bull Racing', av:'🔵' },
];

const TRIVIA = [
  { q:'Which driver holds the most F1 World Championships?', opts:['Ayrton Senna','Michael Schumacher','Lewis Hamilton','Sebastian Vettel'], correct:2 },
  { q:'How many laps is the Monaco Grand Prix?',             opts:['56 laps','78 laps','66 laps','52 laps'], correct:1 },
  { q:"Which team introduced the 'double diffuser' in 2009?", opts:['Ferrari','McLaren','Brawn GP','Red Bull'], correct:2 },
  { q:'What does DRS stand for?',                            opts:['Data Recording System','Drag Reduction System','Dynamic Race Strategy','Driver Radio Signal'], correct:1 },
  { q:'Which circuit is known as "The Cathedral of Speed"?', opts:['Monaco','Silverstone','Monza','Suzuka'], correct:2 },
];

/* ══ PARTICLES ══ */
(function() {
  const canvas = document.getElementById('particles-canvas'); if(!canvas) return;
  const ctx = canvas.getContext('2d'); let W,H,p=[];
  function resize(){W=canvas.width=innerWidth;H=canvas.height=innerHeight} resize();
  window.addEventListener('resize',resize);
  class P{ constructor(b=false){this.r(b)}
    r(b=false){this.b=b;this.t=Math.random()<.55?'s':'d';
      this.x=b?W*.5+(Math.random()-.5)*400:Math.random()*W;
      this.y=b?H*.4+(Math.random()-.5)*200:Math.random()*H;
      const sp=b?4+Math.random()*7:1.5+Math.random()*2.5,
            a=b?Math.random()*Math.PI*2:-.05+(Math.random()-.5)*.4;
      this.vx=Math.cos(a)*sp;this.vy=Math.sin(a)*sp-(b?0:.2);
      this.l=1;this.d=b?.018+Math.random()*.022:.003+Math.random()*.004;
      this.sz=this.t==='s'?.6+Math.random()*1.6:.5+Math.random()*1.2;
      const r=Math.random();this.c=r<.65?'rgba(232,0,45,':r<.82?'rgba(200,200,200,':'rgba(201,168,76,';}
    update(){this.x+=this.vx;this.y+=this.vy;this.vy+=.012;this.l-=this.d;
      if(this.l<=0||this.x>W+30||this.x<-30||this.y>H+30)this.r(false)}
    draw(){ctx.save();ctx.globalAlpha=Math.max(0,this.l*.72);
      if(this.t==='s'){ctx.strokeStyle=`${this.c}1)`;ctx.lineWidth=this.sz;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(this.x,this.y);ctx.lineTo(this.x-this.vx*7,this.y-this.vy*7);ctx.stroke()}
      else{ctx.fillStyle=`${this.c}.9)`;ctx.beginPath();ctx.arc(this.x,this.y,this.sz,0,Math.PI*2);ctx.fill()}ctx.restore()}}
  for(let i=0;i<80;i++)p.push(new P());
  setTimeout(function burst(){for(let i=0;i<35;i++)p.push(new P(true));setTimeout(burst,7e3+Math.random()*8e3)},4e3);
  function loop(){ctx.clearRect(0,0,W,H);p.forEach(x=>{x.update();x.draw()});p=p.filter(x=>x.l>0||!x.b);while(p.filter(x=>!x.b).length<80)p.push(new P());requestAnimationFrame(loop)}loop();
})();

/* ══ PAGE TRANSITION ══ */
(function() {
  const ov=document.getElementById('page-overlay'); if(!ov) return;
  document.querySelectorAll('a[href]').forEach(a=>{
    const h=a.getAttribute('href');
    if(!h||h.startsWith('#')||h.startsWith('http')||h.startsWith('mailto')) return;
    a.addEventListener('click',e=>{e.preventDefault();ov.classList.add('slide-in');setTimeout(()=>location.href=h,480)});
  });
  window.addEventListener('load',()=>{ov.classList.remove('slide-in');ov.classList.add('slide-out');setTimeout(()=>ov.classList.remove('slide-out'),500)});
})();

/* ══ NAVBAR ══ */
(function() {
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
})();

/* ══ SPEED LINES ══ */
(function() {
  const c=document.getElementById('speed-lines'); if(!c) return;
  [{top:'15%',w:'40%',d:'0s',dur:'2.8s',o:.5},{top:'32%',w:'25%',d:'.7s',dur:'2.2s',o:.4},{top:'55%',w:'55%',d:'1.3s',dur:'3.2s',o:.35},{top:'70%',w:'32%',d:'.4s',dur:'2.6s',o:.4},{top:'82%',w:'48%',d:'1.1s',dur:'3s',o:.3}]
  .forEach(cfg=>{const l=document.createElement('div');l.className='speed-line';l.style.cssText=`top:${cfg.top};width:${cfg.w};animation-delay:${cfg.d};animation-duration:${cfg.dur};opacity:${cfg.o}`;c.appendChild(l)});
})();

/* ══ SCROLL REVEAL ══ */
function initReveal(root=document){
  const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in-view');obs.unobserve(e.target)}}),{threshold:.1,rootMargin:'0px 0px -30px 0px'});
  root.querySelectorAll('.reveal-up,.reveal-left,.reveal-right').forEach(el=>obs.observe(el));
}
initReveal();

/* ══ TAB SWITCHING ══ */
document.querySelectorAll('.hub-tab').forEach(tab=>{
  tab.addEventListener('click',()=>{
    document.querySelectorAll('.hub-tab').forEach(t=>t.classList.remove('on'));
    document.querySelectorAll('.hub-section').forEach(s=>s.classList.remove('on'));
    tab.classList.add('on');
    const sec=document.getElementById(`sec-${tab.dataset.tab}`);
    if(sec){sec.classList.add('on');initReveal(sec);}
    const icon=tab.querySelector('.ht-icon');
    if(icon){icon.style.transform='scale(1.4)';setTimeout(()=>icon.style.transform='',300);}
  });
});

/* ══ WALLPAPERS ══ */
let wpCat='all';
function renderWallpapers(){
  const grid=document.getElementById('wp-grid'); if(!grid) return;
  const list=WALLPAPERS.filter(w=>wpCat==='all'||(wpCat==='free'?w.type==='free':w.cat===wpCat));
  grid.innerHTML=list.map((w,i)=>`
    <div class="wp-card" style="animation-delay:${i*.06}s">
      <img class="wp-img" src="${w.img}" alt="${w.name}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
      <div class="wp-thumb" style="display:none">${w.emoji}</div>
      <span class="wp-tag wt-${w.type==='free'?'free':'prem'}">${w.type==='free'?'Free':'Premium'}</span>
      <span class="wp-res">${w.res}</span>
      <div class="wp-overlay">
        <div class="wp-name">${w.name}</div>
        <button class="wp-dl-btn" onclick="event.stopPropagation();handleWpDownload('${w.name}','${w.type}')">
          ${w.type==='free'?'↓ Download':'🔒 Unlock Premium'}
        </button>
        <button class="wp-prev-btn">Preview</button>
      </div>
    </div>
  `).join('');
}
function handleWpDownload(name,type){showToast(type==='free'?`↓ Downloading: ${name}`:`🔒 Sign in to unlock premium wallpapers`)}

document.querySelectorAll('.wpf').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.wpf').forEach(b=>b.classList.remove('on'));
    btn.classList.add('on'); wpCat=btn.dataset.cat; renderWallpapers();
  });
});
renderWallpapers();

/* ══ DRIVER STATS ══ */
let activeDriver=0;
function renderDriverSelector(){
  const el=document.getElementById('drv-selector'); if(!el) return;
  el.innerHTML=DRIVERS.map((d,i)=>`
    <div class="drv-pill ${i===activeDriver?'on':''}" onclick="selectDriver(${i})">
      <div class="dp-av">${d.av}</div>
      <div><div class="dp-name">${d.name}</div><div class="dp-team">${d.team}</div></div>
    </div>
  `).join('');
}
function selectDriver(i){
  activeDriver=i; loadRealDriverStandings();
}
function renderDriverStats(){
  const d=DRIVERS[activeDriver];
  const card=document.getElementById('drv-card');
  if(card) card.innerHTML=`
    <div class="drv-num-bg">${d.num}</div>
    <div class="drv-big-av">${d.av}</div>
    <div class="drv-name">${d.name}</div>
    <div class="drv-team">${d.team}</div>
    <div style="font-size:.8rem;color:#ccc;margin-bottom:14px">${d.nat}</div>
    <div class="drv-tags">
      <span class="drv-tag">#${d.num}</span>
      <span class="drv-tag">${d.season.pos}</span>
      <span class="drv-tag">${d.season.pts} PTS</span>
    </div>
  `;
  const labels={pace:'Pace',racecraft:'Racecraft',overtaking:'Overtaking',defending:'Defending',wetweather:'Wet Weather',consistency:'Consistency'};
  const barsEl=document.getElementById('stat-bars');
  if(barsEl){
    barsEl.innerHTML=Object.entries(d.stats).map(([k,v])=>`
      <div class="sb-row">
        <div class="sb-hd"><span class="sb-lbl">${labels[k]}</span><span class="sb-val">${v}</span></div>
        <div class="sb-track"><div class="sb-fill" data-w="${v}%"></div></div>
      </div>
    `).join('');
    setTimeout(()=>barsEl.querySelectorAll('.sb-fill').forEach(b=>b.style.width=b.dataset.w),80);
  }
  const cmpEl=document.getElementById('cmp-grid');
  if(cmpEl) cmpEl.innerHTML=`
    <div class="cmp-c"><div class="cmp-v">${d.season.wins}</div><div class="cmp-l">Wins</div></div>
    <div class="cmp-c"><div class="cmp-v">${d.season.podiums}</div><div class="cmp-l">Podiums</div></div>
    <div class="cmp-c"><div class="cmp-v">${d.season.poles}</div><div class="cmp-l">Poles</div></div>
    <div class="cmp-c"><div class="cmp-v">${d.season.pts}</div><div class="cmp-l">Points</div></div>
  `;
}
renderDriverSelector(); renderDriverStats();

/* ══ RACE CALENDAR ══ */
function renderCalendar(){
  const grid=document.getElementById('race-grid'); if(!grid) return;
  const next=new Date('2025-05-25T13:00:00Z'),now=new Date(),diff=next-now;
  const d=Math.max(0,Math.floor(diff/864e5)),h=Math.max(0,Math.floor((diff%864e5)/36e5)),m=Math.max(0,Math.floor((diff%36e5)/6e4));
  grid.innerHTML=RACES.map((r,i)=>`
    <div class="rcard" style="animation-delay:${i*.05}s">
      <div class="rc-flag">${r.flag}</div>
      <div class="rc-round">Round ${r.round}</div>
      <div class="rc-name">${r.name}</div>
      <div class="rc-circuit">${r.circuit}</div>
      <div class="rc-date">📅 ${r.date}, 2025</div>
      <span class="rc-status rs-${r.status==='next'?'next':r.status==='completed'?'done':'up'}">
        ${r.status==='next'?'▶ Next Race':r.status==='completed'?'✓ Completed':'Upcoming'}
      </span>
      ${r.winner?`<div class="rc-winner">🏆 Winner: ${r.winner}</div>`:''}
      ${r.status==='next'?`<div class="rc-mini-cd">
        <div class="rcb"><div class="rcb-n">${String(d).padStart(2,'0')}</div><div class="rcb-l">Days</div></div>
        <div class="rcb"><div class="rcb-n">${String(h).padStart(2,'0')}</div><div class="rcb-l">Hrs</div></div>
        <div class="rcb"><div class="rcb-n">${String(m).padStart(2,'0')}</div><div class="rcb-l">Min</div></div>
      </div>`:''}
    </div>
  `).join('');
}
loadRealCalendar();

/* ══ QUOTES ══ */
let qIdx=0;
function renderQuotes(){
  const q=QUOTES[qIdx];
  const feat=document.getElementById('quote-featured');
  if(feat) feat.innerHTML=`
    <div class="qf-bg">"</div>
    <div class="big-qm">"</div>
    <div class="qf-text">${q.text}</div>
    <div class="qf-drv">
      <div class="qf-ava">${q.av}</div>
      <div><div class="qf-dname">${q.driver}</div><div class="qf-dteam">${q.team}</div></div>
    </div>
  `;
  const list=document.getElementById('quotes-list');
  if(list) list.innerHTML=QUOTES.map((qq,i)=>`
    <div class="qmini ${i===qIdx?'on':''}" onclick="setQuote(${i})">
      <div class="qm-text">${qq.text}</div>
      <div class="qm-drv">
        <span style="font-size:1.1rem">${qq.av}</span>
        <div><div class="qm-n">${qq.driver}</div><div class="qm-t">${qq.team}</div></div>
      </div>
      <button class="qm-share" onclick="event.stopPropagation();showToast('🔗 Quote link copied!')">Share</button>
    </div>
  `).join('');
}
function setQuote(i){qIdx=i;renderQuotes()}
renderQuotes();
setInterval(()=>setQuote((qIdx+1)%QUOTES.length),7000);

/* ══ COMMUNITY ══ */
/* Poll */
const POLL = { q:"Who will win the 2025 Drivers' Championship?",
  opts:[{lbl:'Max Verstappen 🔵',pct:42},{lbl:'Charles Leclerc 🔴',pct:24},{lbl:'Lando Norris 🟠',pct:19},{lbl:'Lewis Hamilton ⭐',pct:15}]};
let pollVoted=false;
function renderPoll(){
  const qEl=document.getElementById('poll-q'),optsEl=document.getElementById('poll-opts'),metaEl=document.getElementById('poll-meta');
  if(qEl) qEl.textContent=POLL.q;
  if(optsEl) optsEl.innerHTML=POLL.opts.map((o,i)=>`
    <div class="popt" onclick="votePoll(${i})">
      <div class="popt-fill" style="width:${pollVoted?o.pct:0}%"></div>
      <span class="popt-lbl">${o.lbl}</span>
      ${pollVoted?`<span class="popt-pct">${o.pct}%</span>`:''}
    </div>
  `).join('');
  if(metaEl) metaEl.textContent='84,312 votes · Updated live';
}
function votePoll(i){
  if(pollVoted) return; pollVoted=true;
  POLL.opts[i].pct=Math.min(POLL.opts[i].pct+3,100);
  renderPoll(); showToast('✓ Vote registered! Thanks for participating.');
}
renderPoll();

/* Leaderboard */
const LB=[{r:1,n:'Arjun Mehta',pts:4820,badge:'Season MVP'},{r:2,n:'Priya Sharma',pts:4210,badge:'Trivia King'},{r:3,n:'Rohan Das',pts:3980,badge:'Collector'},{r:4,n:'Kenji Tanaka',pts:3450,badge:''},{r:5,n:'Sofia García',pts:3120,badge:''}];
const lbEl=document.getElementById('lb-list');
if(lbEl) lbEl.innerHTML=LB.map(l=>`
  <div class="lb-row">
    <span class="lb-rank ${l.r===1?'g':l.r===2?'s':l.r===3?'b':''}">${l.r===1?'🥇':l.r===2?'🥈':l.r===3?'🥉':l.r}</span>
    <span style="font-size:1.3rem">👤</span>
    <span class="lb-n">${l.n}</span>
    ${l.badge?`<span class="lb-badge">${l.badge}</span>`:''}
    <span class="lb-p">${l.pts.toLocaleString()} pts</span>
  </div>
`).join('');

/* Trivia */
let tIdx=0,tAnswered=false;
function renderTrivia(){
  tAnswered=false; const t=TRIVIA[tIdx];
  const qEl=document.getElementById('triv-q'),optsEl=document.getElementById('triv-opts'),
        resEl=document.getElementById('triv-res'),nextBtn=document.getElementById('triv-next');
  if(qEl) qEl.textContent=`Q${tIdx+1}. ${t.q}`;
  if(optsEl) optsEl.innerHTML=t.opts.map((o,i)=>`<button class="topt" onclick="answerTrivia(${i})">${o}</button>`).join('');
  if(resEl){resEl.style.display='none';resEl.textContent=''}
  if(nextBtn) nextBtn.style.display='none';
}
function answerTrivia(i){
  if(tAnswered) return; tAnswered=true;
  const t=TRIVIA[tIdx];
  document.querySelectorAll('.topt').forEach((b,j)=>{
    if(j===t.correct) b.classList.add('correct');
    else if(j===i&&i!==t.correct) b.classList.add('wrong');
    b.disabled=true;
  });
  const resEl=document.getElementById('triv-res'),nextBtn=document.getElementById('triv-next');
  if(resEl){
    resEl.style.display='block';
    resEl.style.color=i===t.correct?'#00e000':'var(--red)';
    resEl.textContent=i===t.correct?'✓ Correct! +100 Fan Points':'✗ Wrong! Answer: '+t.opts[t.correct];
  }
  if(nextBtn) nextBtn.style.display='block';
}
document.getElementById('triv-next')?.addEventListener('click',()=>{tIdx=(tIdx+1)%TRIVIA.length;renderTrivia()});
renderTrivia();

/* Live Feed */
const FEED=[
  {av:'👤',user:'Arjun_F1Fan',   txt:'That Leclerc qualifying lap in Monaco was UNBELIEVABLE 🔥 Absolute masterclass',time:'2m ago'},
  {av:'👤',user:'PriyaRaces',    txt:'Just received my Ferrari SF-25 cap from Paddox! Quality is insane ⭐',         time:'5m ago'},
  {av:'👤',user:'RedBullRohan',  txt:'Verstappen to win Monaco? History says no, but Max doesn\'t care about history 😤',time:'8m ago'},
  {av:'👤',user:'McLarenMike',   txt:'Norris in P3 after FP2 — papaya is looking strong this weekend! 🟠',           time:'12m ago'},
  {av:'👤',user:'F1Forever',     txt:'Just unlocked the Monaco Circuit wallpaper pack. Absolutely stunning art! 🖼️',  time:'17m ago'},
];
const feedEl=document.getElementById('live-feed');
if(feedEl) feedEl.innerHTML=FEED.map(f=>`
  <div class="feed-item">
    <div class="feed-av">${f.av}</div>
    <div>
      <div class="feed-user">@${f.user}</div>
      <div class="feed-txt">${f.txt}</div>
      <div class="feed-time">${f.time}</div>
    </div>
  </div>
`).join('');

/* Simulate new feed items */
const newFeedItems=[
  {av:'👤',user:'SpeedKing_99',   txt:'Just got my Monaco Circuit Watch from Paddox — absolutely premium quality! 🏁',time:'Just now'},
  {av:'👤',user:'TifosiFan',      txt:'Leclerc pole in Monaco would be pure cinema 🎬 Come on Charles!',             time:'Just now'},
  {av:'👤',user:'F1DataNerd',     txt:'Verstappen\'s wet weather stat of 96 is genuinely absurd. GOAT tier 📊',       time:'Just now'},
];
let feedIdx=0;
setInterval(()=>{
  if(!feedEl) return;
  const item=newFeedItems[feedIdx%newFeedItems.length]; feedIdx++;
  const div=document.createElement('div'); div.className='feed-item';
  div.innerHTML=`<div class="feed-av">${item.av}</div><div><div class="feed-user">@${item.user}</div><div class="feed-txt">${item.txt}</div><div class="feed-time">${item.time}</div></div>`;
  feedEl.insertBefore(div,feedEl.firstChild);
  if(feedEl.children.length>8) feedEl.removeChild(feedEl.lastChild);
},8000);

/* ══ ICON ANIMATIONS ══ */
document.querySelectorAll('.animate-icon').forEach((icon,i)=>{
  icon.style.animationDelay=`${i*.15}s`;
  icon.addEventListener('mouseenter',()=>{icon.style.animation='none';icon.style.transform='scale(1.35) rotate(-10deg)'});
  icon.addEventListener('mouseleave',()=>{icon.style.transform='';setTimeout(()=>icon.style.animation=`iconFloat 3s ${i*.15}s ease-in-out infinite`,300)});
});

/* ══ CART BADGE ══ */
const cart=JSON.parse(sessionStorage.getItem('paddox_cart')||'[]');
const badge=document.getElementById('cart-badge');
if(badge) badge.textContent=cart.reduce((s,x)=>s+x.qty,0);

/* ══ TOAST ══ */
function showToast(msg){
  const t=document.getElementById('toast'); if(!t) return;
  t.textContent=msg; t.classList.add('show');
  clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove('show'),3000);
}
/* Load real F1 data on page load */
loadNextRaceCountdown();
loadLastResult();

console.log('%c🎮 PADDOX — Fan Hub Loaded','color:#e8002d;font-size:14px;font-weight:bold;');