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
  const bars = document.getElementById('stat-bars');
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
let wpCat = 'all';

async function renderWallpapers() {
  const grid = document.getElementById('wp-grid');
  if (!grid) return;

  grid.innerHTML = `
    <div style="grid-column:1/-1;text-align:center;padding:50px;color:var(--muted)">
      🖼️ Loading wallpapers...
    </div>
  `;

  try {
    const data = await PaddoxAPI.asset.getAll({ limit: 20 });

    const assets = data.data?.assets || data.data || [];

    if (!data.success || !assets.length) {
      renderWallpapersFallback();
      return;
    }

    const list = assets.filter(w =>
      wpCat === 'all' ||
      (wpCat === 'free' ? w.type === 'free' : w.category === wpCat)
    );

    window.__PADDOX_ASSETS__ = {};
    list.forEach(w => {
      window.__PADDOX_ASSETS__[w._id] = {
        id: w._id,
        name: w.name,
        url: w.image?.url,
        type: w.type,
        resolution: w.resolution
      };
    });

    grid.innerHTML = list.map((w, i) => `
      <div class="wp-card" style="animation-delay:${i * 0.06}s">
        <img class="wp-img"
          src="${w.image?.url}"
          alt="${w.name}"
          loading="lazy"
          onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
        />
        <div class="wp-thumb" style="display:none">🖼️</div>

        <span class="wp-tag wt-${w.type === 'free' ? 'free' : 'prem'}">
          ${w.type === 'free' ? 'Free' : 'Premium'}
        </span>

        <span class="wp-res">${w.resolution || 'HD'}</span>

        <div class="wp-overlay">
          <div class="wp-name">${w.name}</div>

          <button class="wp-dl-btn"
            onclick="event.stopPropagation();handleWpDownload('${w._id}')">
            ${w.type === 'free' ? '↓ Download' : '🔒 Unlock Premium'}
          </button>

          <button class="wp-prev-btn"
            onclick="event.stopPropagation();openPreview('${w.image?.url}', '${w._id}', '${String(w.name || 'Wallpaper').replace(/'/g, "\\'")}')">
            Preview
          </button>

          <div style="font-size:.65rem;color:rgba(255,255,255,.5);margin-top:4px">
            ↓ ${(w.downloads || 0).toLocaleString()} downloads
          </div>
        </div>
      </div>
    `).join('');

  } catch (err) {
    console.error('Wallpaper API failed:', err);
    renderWallpapersFallback();
  }
}

async function handleWpDownload(assetId) {
  try {
    showToast('⏳ Preparing HD wallpaper...');

    const localAsset = window.__PADDOX_ASSETS__?.[assetId] || {};
    let downloadUrl = localAsset.url;
    let name = localAsset.name || 'Paddox Wallpaper';

    try {
      const data = await PaddoxAPI.asset.download(assetId);
      console.log('DOWNLOAD RESPONSE:', data);

      if (data?.success) {
        const info = data.data || data;
        downloadUrl =
          info.downloadUrl ||
          info.url ||
          info.image?.url ||
          downloadUrl;
        name = info.name || name;
      }
    } catch (apiErr) {
      console.warn('Download API failed, using local Cloudinary URL:', apiErr);
    }

    if (!downloadUrl) {
      showToast('❌ Download URL missing');
      return;
    }

    const finalUrl = makeCloudinaryDownloadUrl(downloadUrl);
    const safeName = name.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_') || 'paddox_wallpaper';

    const link = document.createElement('a');
    link.href = finalUrl;
    link.download = `${safeName}.jpg`;
    link.target = '_blank';
    link.rel = 'noopener';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    closePreview();
    showToast(`✅ Downloading ${name}`);
    setTimeout(() => {
  renderWallpapers();
}, 1200);

  } catch (err) {
    console.error('Download failed:', err);
    showToast('❌ Download failed. Please try again.');
  }
}

function makeCloudinaryDownloadUrl(url) {
  if (!url || typeof url !== 'string') return url;

  if (url.includes('res.cloudinary.com') && url.includes('/image/upload/')) {
    if (url.includes('/image/upload/fl_attachment/')) return url;
    return url.replace('/image/upload/', '/image/upload/fl_attachment/');
  }

  return url;
}

/* ═════════ GLASSMORPHISM PREVIEW ═════════ */
function openPreview(img, assetId, name) {
  const modal = document.getElementById('preview-modal');
  const image = document.getElementById('preview-image');
  const title = document.getElementById('preview-title');
  const btn   = document.getElementById('preview-download-btn');

  if (!modal || !image || !btn) return;

  image.src = makeCloudinaryPreviewUrl(img);
image.alt = name || 'Wallpaper Preview';

/* Disable right click */
image.oncontextmenu = e => {
  e.preventDefault();
  showToast('🔒 Preview image saving is disabled.');
};

/* Disable dragging */
image.draggable = false;

/* Disable selecting */
image.style.userSelect = 'none';
image.style.webkitUserDrag = 'none';
image.style.pointerEvents = 'auto';

  if (title) title.textContent = name || 'Wallpaper Preview';

  btn.onclick = () => handleWpDownload(assetId);

  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closePreview() {
  const modal = document.getElementById('preview-modal');
  const image = document.getElementById('preview-image');

  if (modal) {
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
  }

  if (image) {
    setTimeout(() => {
      if (!modal?.classList.contains('show')) image.src = '';
    }, 250);
  }

  document.body.style.overflow = '';
}

function makeCloudinaryPreviewUrl(url) {
  if (!url || typeof url !== 'string') return url;

  if (url.includes('res.cloudinary.com') && url.includes('/image/upload/')) {
    return url.replace('/image/upload/', '/image/upload/w_900,q_auto:low/');
  }

  return url;
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closePreview();
});
/* ═════════ PREVIEW PROTECTION ═════════ */
document.addEventListener('contextmenu', e => {
  if (
    e.target.id === 'preview-image' ||
    e.target.closest('.preview-card')
  ) {
    e.preventDefault();
    showToast('🔒 Use Download HD for full wallpaper.');
  }
});
function renderWallpapersFallback() {
  const grid = document.getElementById('wp-grid');
  if (!grid || typeof WALLPAPERS === 'undefined') return;

  const list = WALLPAPERS.filter(w =>
    wpCat === 'all' ||
    (wpCat === 'free' ? w.type === 'free' : w.cat === wpCat)
  );

  grid.innerHTML = list.map((w, i) => `
    <div class="wp-card" style="animation-delay:${i * 0.06}s">
      <img class="wp-img" src="${w.img}" alt="${w.name}" loading="lazy"
        onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
      <div class="wp-thumb" style="display:none">${w.emoji}</div>

      <span class="wp-tag wt-${w.type === 'free' ? 'free' : 'prem'}">
        ${w.type === 'free' ? 'Free' : 'Premium'}
      </span>

      <span class="wp-res">${w.res}</span>

      <div class="wp-overlay">
        <div class="wp-name">${w.name}</div>
        <button class="wp-dl-btn"
          onclick="event.stopPropagation();showToast('${w.type === 'free' ? '↓ Downloading...' : '🔒 Sign in for premium'}')">
          ${w.type === 'free' ? '↓ Download' : '🔒 Unlock'}
        </button>
      </div>
    </div>
  `).join('');
}

document.querySelectorAll('.wpf').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.wpf').forEach(b => b.classList.remove('on'));
    btn.classList.add('on');
    wpCat = btn.dataset.cat;
    renderWallpapers();
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
loadRealDriverStandings();

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

/* ══ QUOTES — REALTIME LIBRARY ══ */
const QUOTES_API_BASE =
  'https://paddox-backend.onrender.com/api/fan/quotes';

let REAL_QUOTES = [];
let quoteIdx = 0;
let quoteEraFilter = 'all';
let quoteSearchText = '';
let quoteAutoTimer = null;


function quoteAvatarHTML(avatar, className = '') {
  const value = avatar || '🏎️';

  if (
    typeof value === 'string' &&
    (
      value.startsWith('http://') ||
      value.startsWith('https://') ||
      value.startsWith('data:image/')
    )
  ) {
    return `
      <img
        src="${value}"
        alt="Quote avatar"
        class="${className}"
        style="
          width:100%;
          height:100%;
          object-fit:cover;
          border-radius:50%;
          display:block;
        "
      />
    `;
  }

  return value;
}

async function loadRealtimeQuotes() {
  const feat = document.getElementById('quote-featured');
  const list = document.getElementById('quotes-list');

  if (feat) {
    feat.innerHTML = `
      <div class="quote-empty">
        Loading quotes from Paddox quote library...
      </div>
    `;
  }

  if (list) list.innerHTML = '';

  try {
    const params = new URLSearchParams();

    params.set('limit', '120');

    if (quoteEraFilter !== 'all') {
      params.set('era', quoteEraFilter);
    }

    if (quoteSearchText) {
      params.set('search', quoteSearchText);
    }

    const res = await fetch(`${QUOTES_API_BASE}?${params.toString()}`);
    const data = await res.json().catch(() => ({}));

    if (!res.ok || data.success === false) {
      throw new Error(data.message || 'Quotes failed');
    }

    REAL_QUOTES =
      data.data?.quotes ||
      data.quotes ||
      [];

    quoteIdx = 0;

    renderRealtimeQuotes();

  } catch (err) {
    console.error(err);

    if (feat) {
      feat.innerHTML = `
        <div class="quote-empty">
          Could not load quotes right now.
        </div>
      `;
    }

    if (list) list.innerHTML = '';
  }
}

function renderRealtimeQuotes() {
  const feat = document.getElementById('quote-featured');
  const list = document.getElementById('quotes-list');
  const countEl = document.getElementById('quote-count');

  if (!feat || !list) return;

  if (countEl) {
    countEl.textContent =
      `${REAL_QUOTES.length} quote${REAL_QUOTES.length === 1 ? '' : 's'} loaded`;
  }

  if (!REAL_QUOTES.length) {
    feat.innerHTML = `
      <div class="quote-empty">
        <div style="font-size:2rem;margin-bottom:10px">💬</div>
        No quotes found. Admin can add current-grid and legendary driver quotes.
      </div>
    `;

    list.innerHTML = '';
    return;
  }

  const q =
    REAL_QUOTES[quoteIdx] ||
    REAL_QUOTES[0];

  feat.innerHTML = `
    <div class="qf-topline">
      <span class="qf-pill">${(q.era || 'current').toUpperCase()}</span>
      <span class="qf-dot">•</span>
      <span>${(q.category || 'motivation').toUpperCase()}</span>
    </div>

    <div class="qf-bg">"</div>
    <div class="big-qm">"</div>

    <div class="qf-text">
      ${q.text}
    </div>

    <div class="qf-footer">
      <div class="qf-drv">
        <div class="qf-ava">
          ${quoteAvatarHTML(q.avatar)}
        </div>

        <div>
          <div class="qf-dname">
            ${q.driver}
          </div>
          <div class="qf-dteam">
            ${q.team || q.era || 'Paddox Quote Library'}
          </div>
        </div>
      </div>

      <button class="qf-share" onclick="copyQuoteText(${quoteIdx})">
        🔗 Share Quote
      </button>
    </div>
  `;

  list.innerHTML = REAL_QUOTES.map((qq, i) => `
    <div class="qmini ${i === quoteIdx ? 'on' : ''}" onclick="setRealtimeQuote(${i})">
      <div class="qmini-head">
        <span class="qmini-era">${(qq.era || 'current').toUpperCase()}</span>
        <button class="qm-share" onclick="event.stopPropagation();copyQuoteText(${i})">
          Share
        </button>
      </div>

      <div class="qm-text">
        ${qq.text}
      </div>

      <div class="qm-drv">
        <span class="qm-avatar">
          ${quoteAvatarHTML(qq.avatar)}
        </span>

        <div>
          <div class="qm-n">
            ${qq.driver}
          </div>
          <div class="qm-t">
            ${qq.team || qq.era || 'Quote Library'}
          </div>
        </div>
      </div>

      <div class="qm-meta">
        ${(qq.category || 'motivation').toUpperCase()}
      </div>
    </div>
  `).join('');
}

function setRealtimeQuote(index) {
  quoteIdx = index;
  renderRealtimeQuotes();
}

async function copyQuoteText(index) {
  const q = REAL_QUOTES[index];

  if (!q) return;

  const text = `"${q.text}" — ${q.driver}`;

  try {
    if (navigator.share) {
      await navigator.share({
        title: `PADDOX Quote — ${q.driver}`,
        text
      });
      showToast('🔥 Quote shared!');
      return;
    }

    await navigator.clipboard?.writeText(text);
    showToast('🔗 Quote copied!');
  } catch (err) {
    try {
      await navigator.clipboard?.writeText(text);
      showToast('🔗 Quote copied!');
    } catch {
      showToast('Copy not supported on this browser');
    }
  }
}

document.querySelectorAll('.quote-filter').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.quote-filter').forEach(b => b.classList.remove('on'));

    btn.classList.add('on');

    quoteEraFilter = btn.dataset.era || 'all';

    loadRealtimeQuotes();
  });
});

document.getElementById('quote-search')?.addEventListener('input', e => {
  clearTimeout(e.target._quoteTimer);

  e.target._quoteTimer = setTimeout(() => {
    quoteSearchText = e.target.value.trim();
    loadRealtimeQuotes();
  }, 350);
});

loadRealtimeQuotes();

quoteAutoTimer = setInterval(() => {
  if (!REAL_QUOTES.length) return;
  quoteIdx = (quoteIdx + 1) % REAL_QUOTES.length;
  renderRealtimeQuotes();
}, 7000);


/* ══ COMMUNITY — REALTIME ══ */
const FAN_API_BASE =
  'https://paddox-backend.onrender.com/api/fan';

let CURRENT_POLL = null;
let CURRENT_TRIVIA = null;
let TRIVIA_ANSWERED = false;
let LIVE_FEED_POSTS = [];

function fanToken() {
  return (
    localStorage.getItem('token') ||
    localStorage.getItem('paddox_access_token') ||
    localStorage.getItem('accessToken') ||
    ''
  );
}

function fanAuthHeaders(json = false) {
  const token = fanToken();

  return {
    ...(json ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

function fanLoginRequired() {
  showToast('🔐 Please login to use Fan Hub actions');

  setTimeout(() => {
    window.location.href = 'account.html';
  }, 900);
}

function timeAgo(dateValue) {
  if (!dateValue) return 'Just now';

  const diff = Date.now() - new Date(dateValue).getTime();

  if (diff < 60000) return 'Just now';

  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;

  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;

  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

/* Poll */
async function loadFanPoll() {
  const qEl = document.getElementById('poll-q');
  const optsEl = document.getElementById('poll-opts');
  const metaEl = document.getElementById('poll-meta');

  if (!qEl || !optsEl) return;

  qEl.textContent = 'Loading fan poll...';
  optsEl.innerHTML = '';

  try {
    const data = await PaddoxAPI.fan.getPoll();

    if (!data.success) {
      throw new Error(data.message || 'No active poll');
    }

    CURRENT_POLL = data.data?.poll || data.poll;
    const totalVotes = data.data?.totalVotes || data.totalVotes || 0;

    renderRealtimePoll(CURRENT_POLL, totalVotes);

  } catch (err) {
    console.warn(err);

    qEl.textContent = 'No active poll right now';
    optsEl.innerHTML = `
      <div class="poll-empty">
        Admin can create a poll later.
      </div>
    `;
    if (metaEl) metaEl.textContent = 'Realtime poll inactive';
  }
}

function renderRealtimePoll(poll, totalVotes = 0) {
  const qEl = document.getElementById('poll-q');
  const optsEl = document.getElementById('poll-opts');
  const metaEl = document.getElementById('poll-meta');

  if (!poll || !qEl || !optsEl) return;

  qEl.textContent = poll.question || 'Fan Poll';

  optsEl.innerHTML = (poll.options || []).map((option, index) => {
    const pct =
      option.percentage ??
      (totalVotes > 0 ? Math.round((Number(option.votes || 0) / totalVotes) * 100) : 0);

    return `
      <div class="popt" onclick="voteRealtimePoll(${index})">
        <div class="popt-fill" style="width:${pct}%"></div>
        <span class="popt-lbl">${option.label}</span>
        <span class="popt-pct">${pct}%</span>
      </div>
    `;
  }).join('');

  if (metaEl) {
    metaEl.textContent =
      `${Number(totalVotes || 0).toLocaleString('en-IN')} votes · Realtime MongoDB poll`;
  }
}

async function voteRealtimePoll(optionIndex) {
  try {
    if (!fanToken()) {
      fanLoginRequired();
      return;
    }

    if (!CURRENT_POLL?._id) {
      showToast('❌ Poll not ready');
      return;
    }

    showToast('⏳ Recording vote...');

    const data = await PaddoxAPI.fan.vote(
      CURRENT_POLL._id,
      optionIndex
    );

    if (!data.success) {
      throw new Error(data.message || 'Vote failed');
    }

    CURRENT_POLL.options =
      data.data?.options ||
      data.options ||
      CURRENT_POLL.options;

    renderRealtimePoll(
      CURRENT_POLL,
      data.data?.totalVotes || data.totalVotes || 0
    );

    showToast(data.message || '🔥 Vote recorded! +50 Fan Points');

    loadFanLeaderboard();

  } catch (err) {
    console.error(err);
    showToast(`❌ ${err.message}`);
  }
}

/* Leaderboard */
async function loadFanLeaderboard() {
  const lbEl = document.getElementById('lb-list');

  if (!lbEl) return;

  lbEl.innerHTML = `
    <div class="lb-empty">
      Loading leaderboard...
    </div>
  `;

  try {
    const data = await PaddoxAPI.fan.leaderboard();

    if (!data.success) {
      throw new Error(data.message || 'Leaderboard failed');
    }

    const leaderboard =
      data.data?.leaderboard ||
      data.leaderboard ||
      [];

    if (!leaderboard.length) {
      lbEl.innerHTML = `
        <div class="lb-empty">
          No fan points yet.
        </div>
      `;
      return;
    }

    lbEl.innerHTML = leaderboard.slice(0, 8).map(user => {
      const medal =
        user.rank === 1 ? '🥇' :
        user.rank === 2 ? '🥈' :
        user.rank === 3 ? '🥉' :
        user.rank;

      return `
        <div class="lb-row">
          <span class="lb-rank ${user.rank === 1 ? 'g' : user.rank === 2 ? 's' : user.rank === 3 ? 'b' : ''}">
            ${medal}
          </span>

          <span style="
            width:28px;
            height:28px;
            border-radius:50%;
            overflow:hidden;
            display:inline-flex;
            align-items:center;
            justify-content:center;
            background:#151515;
            font-size:1.1rem;
          ">
            ${
              user.avatar
                ? `<img src="${user.avatar}" style="width:100%;height:100%;object-fit:cover">`
                : '👤'
            }
          </span>

          <span class="lb-n">${user.name || 'Paddox Fan'}</span>

          ${
            user.fanTier
              ? `<span class="lb-badge">${user.fanTier}</span>`
              : ''
          }

          <span class="lb-p">${Number(user.fanPoints || 0).toLocaleString('en-IN')} pts</span>
        </div>
      `;
    }).join('');

  } catch (err) {
    console.error(err);

    lbEl.innerHTML = `
      <div class="lb-empty">
        Could not load leaderboard.
      </div>
    `;
  }
}

/* Trivia */
async function loadRealtimeTrivia() {
  const qEl = document.getElementById('triv-q');
  const optsEl = document.getElementById('triv-opts');
  const resEl = document.getElementById('triv-res');
  const nextBtn = document.getElementById('triv-next');

  if (!qEl || !optsEl) return;

  TRIVIA_ANSWERED = false;
  CURRENT_TRIVIA = null;

  qEl.textContent = 'Loading trivia...';
  optsEl.innerHTML = '';
  if (resEl) {
    resEl.style.display = 'none';
    resEl.textContent = '';
  }
  if (nextBtn) nextBtn.style.display = 'none';

  try {
    const data = await PaddoxAPI.fan.getTrivia();

    if (!data.success) {
      throw new Error(data.message || 'Trivia unavailable');
    }

    CURRENT_TRIVIA =
      data.data?.trivia ||
      data.trivia;

    renderRealtimeTrivia();

  } catch (err) {
    console.warn(err);

    qEl.textContent = 'No trivia question available';
    optsEl.innerHTML = `
      <div class="triv-empty">
        Admin can add trivia questions later.
      </div>
    `;
  }
}

function renderRealtimeTrivia() {
  const qEl = document.getElementById('triv-q');
  const optsEl = document.getElementById('triv-opts');
  const resEl = document.getElementById('triv-res');
  const nextBtn = document.getElementById('triv-next');

  if (!CURRENT_TRIVIA || !qEl || !optsEl) return;

  const points =
    Number(CURRENT_TRIVIA.points || 100);

  qEl.textContent =
    `${CURRENT_TRIVIA.question} (${points} pts)`;

  optsEl.innerHTML =
    (CURRENT_TRIVIA.options || []).map((option, index) => `
      <button
        class="topt"
        onclick="answerRealtimeTrivia(${index})"
      >
        ${option}
      </button>
    `).join('');

  if (resEl) {
    resEl.style.display = 'none';
    resEl.textContent = '';
  }

  if (nextBtn) {
    nextBtn.style.display = 'none';
  }
}

async function answerRealtimeTrivia(answerIndex) {
  if (TRIVIA_ANSWERED) return;

  try {
    TRIVIA_ANSWERED = true;

    const resEl = document.getElementById('triv-res');
    const nextBtn = document.getElementById('triv-next');

    const data = await PaddoxAPI.fan.answerTrivia(
      CURRENT_TRIVIA._id,
      answerIndex
    );

    if (!data.success) {
      throw new Error(data.message || 'Answer failed');
    }

    const result = data.data || data;
    const correctIndex = result.correctIndex;

    document.querySelectorAll('.topt').forEach((btn, index) => {
      if (index === correctIndex) {
        btn.classList.add('correct');
      } else if (index === answerIndex && !result.correct) {
        btn.classList.add('wrong');
      }
    });

    if (resEl) {
      resEl.style.display = 'block';
      resEl.style.color = result.correct ? '#00e000' : 'var(--red)';
      resEl.textContent =
        result.correct
          ? `✓ Correct! +${result.pointsEarned || 0} Fan Points`
          : `✗ Wrong! Answer: ${result.correctAnswer}`;
    }

    if (nextBtn) nextBtn.style.display = 'block';

    if (result.correct) {
      loadFanLeaderboard();
    }

  } catch (err) {
    console.error(err);
    TRIVIA_ANSWERED = false;
    showToast(`❌ ${err.message}`);
  }
}

document
  .getElementById('triv-next')
  ?.addEventListener('click', loadRealtimeTrivia);

/* Live Feed */
function renderFanFeed(posts = LIVE_FEED_POSTS) {
  const feedEl = document.getElementById('live-feed');

  if (!feedEl) return;

  if (!posts.length) {
    feedEl.innerHTML = `
      <div class="feed-empty">
        No fan posts yet. Be the first on the grid.
      </div>
    `;
    return;
  }

  feedEl.innerHTML = posts.map(post => {
    const user = post.user || {};
    const name =
      `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
      post.userName ||
      'Paddox Fan';

    const avatar =
      user.avatar?.url ||
      post.avatar ||
      '';

    return `
      <div class="feed-item">
        <div class="feed-av">
          ${
            avatar && avatar.startsWith('http')
              ? `<img src="${avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`
              : '👤'
          }
        </div>

        <div>
          <div class="feed-user">@${name.replace(/\s+/g, '')}</div>
          <div class="feed-txt">${post.text || ''}</div>
          <div class="feed-time">${timeAgo(post.createdAt)}</div>
        </div>
      </div>
    `;
  }).join('');
}

async function loadFanFeed() {
  try {
    const data = await PaddoxAPI.fan.feed();

    if (!data.success) {
      throw new Error(data.message || 'Feed failed');
    }

    LIVE_FEED_POSTS =
      data.data?.posts ||
      data.posts ||
      [];

    renderFanFeed();

  } catch (err) {
    console.error(err);
    renderFanFeed([]);
  }
}

async function submitFanPost() {
  const input = document.getElementById('feed-post-input');

  if (!input) return;

  const text = input.value.trim();

  if (!text) {
    showToast('⚠️ Write something first');
    return;
  }

  if (!fanToken()) {
    fanLoginRequired();
    return;
  }

  try {
    showToast('⏳ Posting to live feed...');

    const data = await PaddoxAPI.fan.post(text);

    if (!data.success) {
      throw new Error(data.message || 'Post failed');
    }

    input.value = '';
    updateFeedCharCount();

    showToast(data.message || '🔥 Posted! +20 Fan Points');

    await loadFanFeed();
    await loadFanLeaderboard();

  } catch (err) {
    console.error(err);
    showToast(`❌ ${err.message}`);
  }
}

function updateFeedCharCount() {
  const input = document.getElementById('feed-post-input');
  const count = document.getElementById('feed-char-count');

  if (!input || !count) return;

  count.textContent =
    `${input.value.length}/280`;
}

document
  .getElementById('feed-post-btn')
  ?.addEventListener('click', submitFanPost);

document
  .getElementById('feed-post-input')
  ?.addEventListener('input', updateFeedCharCount);

document
  .getElementById('feed-post-input')
  ?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      submitFanPost();
    }
  });

/* Socket live updates */
try {
  if (typeof io !== 'undefined') {
    const socket = io('https://paddox-backend.onrender.com');

    socket.on('fan:new-post', post => {
      LIVE_FEED_POSTS.unshift({
        text: post.text,
        userName: post.user,
        avatar: post.avatar,
        createdAt: new Date().toISOString()
      });

      LIVE_FEED_POSTS = LIVE_FEED_POSTS.slice(0, 20);
      renderFanFeed();
    });

    socket.on('poll:vote-update', payload => {
      if (!CURRENT_POLL || payload.pollId !== CURRENT_POLL._id) return;

      CURRENT_POLL.options = payload.options;
      renderRealtimePoll(CURRENT_POLL, payload.totalVotes);
    });
  }
} catch (err) {
  console.warn('Fan socket unavailable', err);
}

async function initRealtimeCommunity() {
  await Promise.allSettled([
    loadFanPoll(),
    loadFanLeaderboard(),
    loadRealtimeTrivia(),
    loadFanFeed()
  ]);

  updateFeedCharCount();
}

initRealtimeCommunity();


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