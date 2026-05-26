/* ============================================================
   PADDOX — home.js
   Landing Page Logic
   ============================================================ */

'use strict';

/* ── HOME DATA STATE: loaded from backend only ── */
let PRODUCTS = [];
let QUOTES = [];
let HOME_F1 = { schedule: [], drivers: [], standings: [], constructors: [], nextRace: null };
let HOME_MARQUEE_LOGOS = [];

const HOME_MARKETING_STATS = { races: 24, products: 50, fans: 250 };

const USE_OFFICIAL_F1_LOGO_LIBRARY = true;

const PADDOX_HOME_TEAMS = [
  {
    name: 'PADDOX', slug: 'paddox', color: '#e8002d', type: 'brand',
    image: 'assets/teams/paddox.svg'
  },
  {
    name: 'Ferrari', slug: 'ferrari', color: '#e8002d',
    image: 'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2025/ferrari/2025ferrarilogolight.webp'
  },
  {
    name: 'Mercedes', slug: 'mercedes', color: '#00d2be',
    image: 'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2025/mercedes/2025mercedeslogowhite.webp'
  },
  {
    name: 'Red Bull Racing', slug: 'red-bull', color: '#1e5bff',
    image: 'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2025/redbullracing/2025redbullracinglogowhite.webp'
  },
  {
    name: 'McLaren', slug: 'mclaren', color: '#ff8700',
    image: 'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2025/mclaren/2025mclarenlogowhite.webp'
  },
  {
    name: 'Aston Martin', slug: 'aston-martin', color: '#006f62',
    image: 'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2025/astonmartin/2025astonmartinlogowhite.webp'
  },
  {
    name: 'Alpine', slug: 'alpine', color: '#2293d1',
    image: 'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2025/alpine/2025alpinelogowhite.webp'
  },
  {
    name: 'Williams', slug: 'williams', color: '#64c4ff',
    image: 'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2025/williams/2025williamslogowhite.webp'
  },
  {
    name: 'Haas F1 Team', slug: 'haas', color: '#ffffff',
    image: 'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2025/haas/2025haaslogowhite.webp'
  },
  {
    name: 'Racing Bulls', slug: 'racing-bulls', color: '#6c4cff',
    image: 'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2025/racingbulls/2025racingbullslogowhite.webp'
  },
  {
    name: 'Audi', slug: 'audi', color: '#00e701',
    image: 'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2026/audi/2026audilogowhite.webp'
  },
  {
    name: 'Cadillac', slug: 'cadillac', color: '#d4af37',
    image: 'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2026/cadillac/2026cadillaclogowhite.webp'
  },
];

function setHomeMarketingStats() {
  setCounter(document.getElementById('home-race-count'), HOME_MARKETING_STATS.races);
  setCounter(document.getElementById('home-product-count'), HOME_MARKETING_STATS.products);
  setCounter(document.getElementById('home-fan-count'), HOME_MARKETING_STATS.fans);
}

function homeTeamLogoSrc(slug = '') {
  return `assets/teams/${slug}.svg`;
}

window.homeLogoFallback = function homeLogoFallback(img) {
  if (!img) return;
  const base = img.dataset.base || '';
  const exts = ['.svg', '.png', '.webp', '.jpg', '.jpeg'];
  let attempt = Number(img.dataset.try || 0);
  attempt += 1;
  if (base && attempt < exts.length) {
    img.dataset.try = String(attempt);
    img.src = `${base}${exts[attempt]}`;
    return;
  }
  img.style.display = 'none';
  if (img.nextElementSibling) img.nextElementSibling.style.display = 'inline-block';
};


function safeText(value, fallback = '') {
  const text = String(value ?? '').trim();
  return text && text !== '[object Object]' ? text : fallback;
}

function escapeHTML(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function homeMoney(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

function productEmoji(category = '') {
  const c = String(category || '').toLowerCase();
  if (c.includes('apparel') || c.includes('shirt') || c.includes('hoodie')) return '👕';
  if (c.includes('collect')) return '🏆';
  if (c.includes('access')) return '⌚';
  if (c.includes('poster')) return '🖼️';
  return '🏎️';
}

function teamEmojiFromName(name = '') {
  const n = String(name || '').toLowerCase();
  if (n.includes('ferrari')) return '🔴';
  if (n.includes('red bull')) return '🔵';
  if (n.includes('mclaren')) return '🟠';
  if (n.includes('mercedes')) return '⚫';
  if (n.includes('aston')) return '🟢';
  if (n.includes('alpine')) return '🔷';
  if (n.includes('williams')) return '🔵';
  if (n.includes('haas')) return '⚪';
  if (n.includes('racing bulls') || n === 'rb') return '🟣';
  if (n.includes('sauber') || n.includes('kick') || n.includes('audi')) return '🟢';
  if (n.includes('cadillac')) return '🟡';
  return '🏁';
}

function normalizeHomeProduct(p = {}) {
  const image = Array.isArray(p.images)
    ? (p.images[0]?.url || p.images[0] || '')
    : (p.image || '');
  const price = Number(p.effectivePrice || p.salePrice || p.price || 0);
  return {
    id: p._id || p.id,
    name: safeText(p.name, 'Paddox Product'),
    team: safeText(p.team, 'PADDOX'),
    cat: safeText(p.category, 'merch'),
    price,
    rating: Math.max(0, Math.min(5, Math.round(Number(p.ratings?.average || p.rating || 0)))) || 5,
    badge: safeText(p.badge || (p.onSale ? 'sale' : ''), ''),
    emoji: safeText(p.emoji, productEmoji(p.category)),
    image,
    gradient: 'linear-gradient(135deg,#111,#1a1a1a)',
    desc: safeText(p.shortDesc || p.description, 'Premium PADDOX merchandise.'),
  };
}

function getNestedString(obj = {}, keys = []) {
  for (const key of keys) {
    const value = obj?.[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (value && typeof value === 'object') {
      const nested = getNestedString(value, keys);
      if (nested) return nested;
    }
  }
  return '';
}

function extractHomeTeamName(raw = {}) {
  const candidates = [
    raw.team,
    raw.constructor,
    raw.Constructor,
    raw.Constructors,
    raw.teamName,
    raw.constructorName,
  ];
  for (const item of candidates) {
    if (typeof item === 'string' && item.trim()) return item.trim();
    if (item && typeof item === 'object') {
      const found = getNestedString(item, ['name','constructorName','teamName','fullName']);
      if (found) return found;
    }
    if (Array.isArray(item)) {
      for (const child of item) {
        const found = extractHomeTeamName({ team: child });
        if (found) return found;
      }
    }
  }
  return '';
}

function normalizeDriverFromAny(raw = {}) {
  const driver = raw.driver || raw.Driver || raw;
  const given = safeText(driver.givenName || driver.firstName, '');
  const family = safeText(driver.familyName || driver.lastName, '');
  const name = safeText(driver.fullName || driver.name || `${given} ${family}`.trim() || raw.name, 'F1 Driver');
  const code = safeText(driver.code || driver.abbreviation || raw.code, name.split(' ').map(x => x[0]).join('').slice(0, 3).toUpperCase());
  const team = safeText(extractHomeTeamName(raw), 'Team');
  return { name, code, team };
}

function normalizeConstructorName(raw = {}) {
  return (
    safeText(raw.name || raw.constructorName || raw.teamName || raw.fullName, '') ||
    safeText(raw.constructor?.name || raw.Constructor?.name, '') ||
    safeText(raw.Constructor?.constructorName || raw.constructor?.constructorName, '') ||
    extractHomeTeamName(raw)
  );
}

function uniqueCleanNames(values = []) {
  const seen = new Set();
  const out = [];
  values.forEach(value => {
    const name = safeText(value, '');
    if (!name) return;
    const key = name.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    if (!key || seen.has(key)) return;
    seen.add(key);
    out.push(name);
  });
  return out;
}

function renderQuoteAvatar(el, avatar, driver = 'PADDOX') {
  if (!el) return;
  const av = safeText(avatar, '🏁');
  const isImage = av.startsWith('http://') || av.startsWith('https://') || av.startsWith('data:image/');
  if (isImage) {
    el.classList.add('has-image');
    el.innerHTML = `<img src="${escapeHTML(av)}" alt="${escapeHTML(driver)}" loading="lazy"/>`;
  } else {
    el.classList.remove('has-image');
    el.textContent = av || '🏁';
  }
}

async function loadHomeProducts() {
  const grid = document.getElementById('products-grid');
  if (grid) grid.innerHTML = '<div class="home-empty-card">Loading shop products...</div>';
  try {
    const data = await PaddoxAPI.product.getAll({ limit: 12 });
    const list = data?.data?.products || data?.data || data?.products || [];
    const active = list.filter(p => p && p.isActive !== false);
    const ordered = [...active].sort((a, b) => {
      const fa = a.isFeatured ? 1 : 0;
      const fb = b.isFeatured ? 1 : 0;
      if (fb !== fa) return fb - fa;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
    PRODUCTS = ordered.slice(0, 4).map(normalizeHomeProduct).filter(p => p.id);
    renderHomeProducts();
    /* Home hero stats stay as brand milestones, not raw API counts. */
  } catch (err) {
    console.warn('Home products unavailable', err);
    PRODUCTS = [];
    renderHomeProducts();
  }
}

async function loadHomeQuotes() {
  try {
    const res = await fetch('https://paddox-backend.onrender.com/api/fan/quotes');
    const data = await res.json();
    const list = data?.data?.quotes || data?.quotes || data?.data || [];
    QUOTES = list
      .filter(q => q && q.text)
      .slice(0, 6)
      .map(q => ({
        text: safeText(q.text),
        driver: safeText(q.driver || q.name, 'PADDOX Fan'),
        team: safeText(q.team || q.category, 'Fan Quote'),
        av: safeText(q.avatar || q.image || q.driverImage, teamEmojiFromName(q.team)),
      }));
    renderHomeQuotes();
  } catch (err) {
    console.warn('Home quotes unavailable', err);
    QUOTES = [];
    renderHomeQuotes();
  }
}


async function loadHomeMarqueeLogos() {
  try {
    const data = window.PaddoxAPI?.fan?.marqueeLogos
      ? await PaddoxAPI.fan.marqueeLogos()
      : await fetch('https://paddox-backend.onrender.com/api/fan/home-marquee-logos').then(r => r.json());

    const list = data?.data?.logos || data?.logos || data?.data || [];
    HOME_MARQUEE_LOGOS = list
      .filter(item => item && item.name && item.image)
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
      .map(item => ({
        name: safeText(item.name, 'PADDOX'),
        slug: safeText(item.slug || item.name, 'paddox').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        image: safeText(item.image),
        color: safeText(item.color, '#e8002d'),
      }));
    renderHomeMarquee();
  } catch (err) {
    console.warn('Home marquee logos unavailable', err);
    HOME_MARQUEE_LOGOS = [];
    renderHomeMarquee();
  }
}

async function loadHomeF1Data() {
  try {
    const [scheduleData, driverData, standingsData, constructorData] = await Promise.allSettled([
      PaddoxAPI.f1.schedule(),
      PaddoxAPI.f1.drivers(),
      PaddoxAPI.f1.driverStands(),
      PaddoxAPI.f1.consStands(),
    ]);
    HOME_F1.schedule = scheduleData.value?.data?.races || scheduleData.value?.data || [];
    HOME_F1.drivers = driverData.value?.data?.drivers || driverData.value?.data || [];
    HOME_F1.standings = standingsData.value?.data?.standings || standingsData.value?.data?.drivers || standingsData.value?.data || [];
    HOME_F1.constructors = constructorData.value?.data?.standings || constructorData.value?.data?.constructors || constructorData.value?.data || [];
    renderHomeMarquee();
    /* Current grid count can include reserve/test drivers in APIs, so hero keeps brand milestones. */
    updateTickerFromAPI();
  } catch (err) {
    console.warn('Home F1 data unavailable', err);
    renderHomeMarquee();
  }
}

async function loadHomeFanStories() {
  const grid = document.getElementById('testi-grid');
  if (!grid) return;
  try {
    const [feedData, leaderboardData] = await Promise.allSettled([
      PaddoxAPI.fan.getFeed(),
      PaddoxAPI.fan.leaderboard(),
    ]);
    const posts = feedData.value?.data?.posts || feedData.value?.data?.feed || feedData.value?.posts || [];
    const leaders = leaderboardData.value?.data?.leaderboard || leaderboardData.value?.data || [];
    /* Fan count is shown as a brand/community milestone on the landing hero. */
    const stories = posts.slice(0, 3);
    if (!stories.length) {
      grid.innerHTML = '<div class="home-empty-card">Fan stories will appear here after community posts are added.</div>';
      return;
    }
    grid.innerHTML = stories.map((post, i) => {
      const user = post.user || post.author || {};
      const name = safeText(`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || post.username, 'PADDOX Fan');
      const initials = name.split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase();
      const text = safeText(post.text || post.content || post.message, '');
      const date = post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : 'Community post';
      return `
        <div class="testi-card reveal-up delay-${i + 1}">
          <div class="testi-stars">★★★★★</div>
          <p class="testi-text">"${escapeHTML(text)}"</p>
          <div class="testi-author">
            <div class="testi-avatar">${escapeHTML(initials || 'PF')}</div>
            <div>
              <div class="testi-name">${escapeHTML(name)}</div>
              <div class="testi-loc">🏁 ${escapeHTML(date)}</div>
            </div>
          </div>
          <div class="testi-badge">Fan Community</div>
        </div>`;
    }).join('');
    initRevealObserver(grid.querySelectorAll('.reveal-up'));
  } catch (err) {
    console.warn('Fan stories unavailable', err);
    grid.innerHTML = '<div class="home-empty-card">Fan stories are unavailable right now.</div>';
  }
}

function setCounter(el, value) {
  if (!el) return;
  el.dataset.count = String(value || 0);
  el.textContent = '0';
  animateSingleCounter(el);
}

function updateHomeRaceStat(count) { setCounter(document.getElementById('home-race-count'), count); }
function updateHomeProductStat(count) { setCounter(document.getElementById('home-product-count'), count); }
function updateHomeFanStat(count) { setCounter(document.getElementById('home-fan-count'), count); }

function animateSingleCounter(el) {
  const target = parseInt(el.dataset.count || '0', 10);
  if (!target) { el.textContent = '0'; return; }
  let current = 0;
  const dur = 900;
  const step = 20;
  const inc = Math.max(1, target / (dur / step));
  clearInterval(el._counterTimer);
  el._counterTimer = setInterval(() => {
    current = Math.min(current + inc, target);
    el.textContent = String(Math.floor(current));
    if (current >= target) clearInterval(el._counterTimer);
  }, step);
}

/* ══════════════════════════════════════
   PARTICLES
══════════════════════════════════════ */
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], burst = false, burstTimer = null;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  /* Particle class */
  class Particle {
    constructor(isBurst = false) { this.reset(isBurst); }

    reset(isBurst = false) {
      this.isBurst = isBurst;
      this.type    = Math.random() < 0.55 ? 'spark' : 'dot';
      this.x       = isBurst ? W * 0.5 + (Math.random() - 0.5) * 300
                             : Math.random() * W;
      this.y       = isBurst ? H * 0.5 + (Math.random() - 0.5) * 100
                             : Math.random() * H;
      const speed  = isBurst ? 4 + Math.random() * 6 : 1.5 + Math.random() * 2.5;
      const angle  = isBurst ? Math.random() * Math.PI * 2
                             : -Math.PI * 0.05 + (Math.random() - 0.5) * 0.4;
      this.vx      = Math.cos(angle) * speed;
      this.vy      = Math.sin(angle) * speed - (isBurst ? 0 : 0.2);
      this.life    = 1;
      this.decay   = isBurst ? 0.016 + Math.random() * 0.02
                             : 0.003 + Math.random() * 0.004;
      this.size    = this.type === 'spark'
                     ? 0.6 + Math.random() * 1.6
                     : 0.5 + Math.random() * 1.2;
      const r      = Math.random();
      this.color   = r < 0.65 ? 'rgba(232,0,45,'
                   : r < 0.82 ? 'rgba(200,200,200,'
                               : 'rgba(201,168,76,';
    }

    update() {
      this.x    += this.vx;
      this.y    += this.vy;
      this.vy   += 0.012; // gentle gravity
      this.life -= this.decay;
      if (this.life <= 0 || this.x > W + 30 || this.x < -30 || this.y > H + 30) {
        this.reset(false);
      }
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.life * 0.75);
      if (this.type === 'spark') {
        ctx.strokeStyle = `${this.color}1)`;
        ctx.lineWidth   = this.size;
        ctx.lineCap     = 'round';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.vx * 7, this.y - this.vy * 7);
        ctx.stroke();
      } else {
        ctx.fillStyle = `${this.color}0.9)`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  /* Spawn base particles */
  for (let i = 0; i < 90; i++) particles.push(new Particle());

  /* Occasional speed burst */
  function triggerBurst() {
    for (let i = 0; i < 40; i++) particles.push(new Particle(true));
    burstTimer = setTimeout(triggerBurst, 6000 + Math.random() * 8000);
  }
  burstTimer = setTimeout(triggerBurst, 3000);

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    // Remove dead burst particles
    particles = particles.filter(p => p.life > 0 || !p.isBurst);
    // Keep base count stable
    while (particles.filter(p => !p.isBurst).length < 90) {
      particles.push(new Particle(false));
    }
    requestAnimationFrame(loop);
  }
  loop();
})();

/* ══════════════════════════════════════
   PAGE TRANSITION
══════════════════════════════════════ */
(function initPageTransition() {
  const overlay = document.getElementById('page-overlay');
  if (!overlay) return;

  /* Intercept internal nav clicks */
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) return;

    link.addEventListener('click', e => {
      e.preventDefault();
      overlay.classList.add('slide-in');
      setTimeout(() => { window.location.href = href; }, 480);
    });
  });

  /* Slide out on arrival */
  window.addEventListener('load', () => {
    overlay.classList.remove('slide-in');
    overlay.classList.add('slide-out');
    setTimeout(() => overlay.classList.remove('slide-out'), 500);
  });
})();

/* ══════════════════════════════════════
   NAVBAR
══════════════════════════════════════ */
(function initNavbar() {
  const navbar   = document.getElementById('navbar');
  const hamburger= document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const searchBtn  = document.getElementById('nav-search-btn');
  const searchDrawer = document.getElementById('search-drawer');
  const searchClose  = document.getElementById('search-close');
  const searchInput  = document.getElementById('search-input');

  /* Scroll shrink + glow */
  let lastY = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    navbar.classList.toggle('scrolled', y > 60);
    lastY = y;
  }, { passive: true });

  /* Hamburger toggle */
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });
  }

  /* Search drawer */
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      searchDrawer.classList.add('open');
      searchInput.focus();
    });
  }
  if (searchClose) {
    searchClose.addEventListener('click', () => {
      searchDrawer.classList.remove('open');
    });
  }
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') searchDrawer.classList.remove('open');
  });

  /* Helmet icon entrance is CSS-driven; add hover wiggle via JS for fun */
  const helmet = document.getElementById('helmet-wrap');
  if (helmet) {
    helmet.addEventListener('mouseenter', () => {
      helmet.style.transform = 'rotate(-10deg) scale(1.18)';
      helmet.style.boxShadow = '0 0 22px rgba(232,0,45,.5)';
    });
    helmet.addEventListener('mouseleave', () => {
      helmet.style.transform = '';
      helmet.style.boxShadow = '';
    });
  }
})();

/* Real F1 countdown — auto-detects next race */
async function initRealCountdown() {
  const nameEl = document.querySelector('.cs-name');
  const circEl = document.querySelector('.cs-circuit');
  const chipEl = document.querySelector('.cs-chip');
  const flagEl = document.querySelector('.cs-flag');

  try {
    const data = await PaddoxAPI.f1.nextRace();
    if (!data.success || !data.data?.race) throw new Error('No next race data');

    const raceDate = new Date(data.data.raceDate);
    const race = data.data.race;
    HOME_F1.nextRace = race;

    if (flagEl) flagEl.textContent = race.flag || '🏁';
    if (nameEl) nameEl.textContent = race.name || 'Next Grand Prix';
    if (circEl) circEl.textContent = [race.circuit, race.location, race.country].filter(Boolean).join(' · ');
    if (chipEl) chipEl.textContent = `Round ${race.round || '—'} · Season ${race.season || new Date().getFullYear()}`;

    function tick() {
      const diff = raceDate - new Date();
      const values = diff > 0
        ? [
            Math.floor(diff / 864e5),
            Math.floor((diff % 864e5) / 36e5),
            Math.floor((diff % 36e5) / 6e4),
            Math.floor((diff % 6e4) / 1e3),
          ]
        : [0, 0, 0, 0];
      ['d','h','m','s'].forEach((key, i) => {
        const el = document.getElementById(`cd-${key}`);
        if (el) el.textContent = String(values[i]).padStart(2, '0');
      });
    }
    tick();
    setInterval(tick, 1000);
  } catch (err) {
    console.warn('Countdown unavailable', err);
    if (flagEl) flagEl.textContent = '🏁';
    if (nameEl) nameEl.textContent = 'Race schedule unavailable';
    if (circEl) circEl.textContent = 'Please check again shortly.';
    if (chipEl) chipEl.textContent = 'F1 schedule data unavailable';
  }
}

initRealCountdown();

/* ══════════════════════════════════════
   HERO SPEED LINES
══════════════════════════════════════ */
(function initSpeedLines() {
  const container = document.getElementById('speed-lines');
  if (!container) return;
  const configs = [
    { top:'18%', width:'45%', delay:'0s',   dur:'2.8s', opacity:.5 },
    { top:'34%', width:'28%', delay:'.6s',  dur:'2.2s', opacity:.4 },
    { top:'52%', width:'60%', delay:'1.2s', dur:'3.2s', opacity:.35 },
    { top:'66%', width:'35%', delay:'.3s',  dur:'2.6s', opacity:.4 },
    { top:'78%', width:'50%', delay:'1s',   dur:'3s',   opacity:.3 }
  ];
  configs.forEach(c => {
    const line = document.createElement('div');
    line.className = 'speed-line';
    line.style.cssText = `top:${c.top};width:${c.width};animation-delay:${c.delay};animation-duration:${c.dur};opacity:${c.opacity}`;
    container.appendChild(line);
  });
})();

/* ══════════════════════════════════════
   COUNTER ANIMATION (stats)
══════════════════════════════════════ */
(function initCounters() {
  const counters = document.querySelectorAll('.stat-num[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el    = entry.target;
      const target= parseInt(el.dataset.count, 10);
      const dur   = 1800;
      const step  = 16;
      const inc   = target / (dur / step);
      let current = 0;
      const timer = setInterval(() => {
        current = Math.min(current + inc, target);
        el.textContent = Math.floor(current);
        if (current >= target) clearInterval(timer);
      }, step);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
})();

/* ══════════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════════ */
(function initReveal() {
  const items = document.querySelectorAll(
    '.reveal-up, .reveal-left, .reveal-right, .reveal-section'
  );
  if (!items.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  items.forEach(el => observer.observe(el));
})();

/* ══════════════════════════════════════
   PARALLAX (quote section bg)
══════════════════════════════════════ */
(function initParallax() {
  const sections = document.querySelectorAll('.parallax-section');
  if (!sections.length) return;

  function onScroll() {
    const scrollY = window.scrollY;
    sections.forEach(sec => {
      const rect   = sec.getBoundingClientRect();
      const center = rect.top + rect.height / 2 - window.innerHeight / 2;
      const bg     = sec.querySelector('.quote-bg-img');
      if (bg) bg.style.transform = `scale(1.06) translateY(${center * 0.12}px)`;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ══════════════════════════════════════
   PRODUCTS RENDER — API backed
══════════════════════════════════════ */
function renderHomeProducts() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  if (!PRODUCTS.length) {
    grid.innerHTML = '<div class="home-empty-card">Featured products are unavailable right now.</div>';
    return;
  }

  grid.innerHTML = PRODUCTS.map((p, i) => `
    <div class="pcard reveal-up delay-${i + 1}" data-id="${escapeHTML(p.id)}">
      <div class="pcard-img-wrap">
        ${p.image ? `
          <img
            class="pcard-img"
            src="${escapeHTML(p.image)}"
            alt="${escapeHTML(p.name)}"
            loading="lazy"
            onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
          />` : ''}
        <div class="pcard-gradient" style="background:${p.gradient};${p.image ? 'display:none' : 'display:flex'}">
          ${escapeHTML(p.emoji)}
        </div>
        <div class="pcard-img-overlay"></div>
        <div class="pcard-overlay">
          <button class="ov-btn add-to-cart" data-id="${escapeHTML(p.id)}">Add to Cart 🛒</button>
          <button class="ov-btn outline quick-view" data-id="${escapeHTML(p.id)}">Quick View 👁️</button>
        </div>
      </div>
      ${p.badge ? `<span class="pbadge b-${escapeHTML(p.badge)}">${escapeHTML(String(p.badge).toUpperCase())}</span>` : ''}
      <button class="pwish" data-id="${escapeHTML(p.id)}" aria-label="Wishlist">
        <span class="icon-anim">♡</span>
      </button>
      <div class="pcard-info">
        <div class="pcard-team">${escapeHTML(p.team)}</div>
        <div class="pcard-name">${escapeHTML(p.name)}</div>
        <div class="pcard-foot">
          <div class="pcard-price">${homeMoney(p.price)}</div>
          <div class="pcard-rating">${'★'.repeat(p.rating)}${'☆'.repeat(5 - p.rating)}</div>
        </div>
      </div>
    </div>
  `).join('');

  initRevealObserver(grid.querySelectorAll('.reveal-up'));

  grid.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      addToCart(btn.dataset.id);
    });
  });

  grid.querySelectorAll('.quick-view').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openModal(btn.dataset.id);
    });
  });

  grid.querySelectorAll('.pwish').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      btn.classList.toggle('on');
      const icon = btn.querySelector('.icon-anim');
      if (icon) icon.textContent = btn.classList.contains('on') ? '♥' : '♡';
      showToast(btn.classList.contains('on') ? '♥ Added to wishlist' : 'Removed from wishlist');
    });
  });

  grid.querySelectorAll('.pcard').forEach(card => {
    card.addEventListener('click', () => openModal(card.dataset.id));
  });
}

/* shared reveal observer helper */
function initRevealObserver(elements) {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  elements.forEach(el => obs.observe(el));
}

/* ══════════════════════════════════════
   CART STATE
══════════════════════════════════════ */
let cart = JSON.parse(sessionStorage.getItem('paddox_cart') || '[]');

function saveCart() {
  sessionStorage.setItem('paddox_cart', JSON.stringify(cart));
  updateCartBadge();
}

function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;
  const total = cart.reduce((s, x) => s + x.qty, 0);
  badge.textContent = total;
  badge.style.transform = 'scale(1.4)';
  setTimeout(() => badge.style.transform = '', 300);
}

function addToCart(id) {
  const product = PRODUCTS.find(p => String(p.id) === String(id));
  if (!product) return;
  const existing = cart.find(x => String(x.id) === String(id));
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, qty: 1, emoji: product.emoji, image: product.image });
  }
  saveCart();
  showToast(`✓ ${product.name} added to cart!`);
}

updateCartBadge();

/* ══════════════════════════════════════
   PRODUCT MODAL
══════════════════════════════════════ */
const modalOverlay = document.getElementById('modal-overlay');
const modalClose   = document.getElementById('modal-close');

function openModal(id) {
  const p = PRODUCTS.find(x => String(x.id) === String(id));
  if (!p || !modalOverlay) return;

  /* Populate */
  document.getElementById('modal-team').textContent  = p.team;
  document.getElementById('modal-name').textContent  = p.name;
  document.getElementById('modal-rating').textContent= '★'.repeat(p.rating) + '☆'.repeat(5 - p.rating) + `  (${p.rating}.0)`;
  document.getElementById('modal-price').textContent = `₹${p.price.toLocaleString('en-IN')}`;
  document.getElementById('modal-desc').textContent  = p.desc;

  /* Image */
  const wrap = document.getElementById('modal-img-wrap');
  wrap.style.background = p.gradient || 'linear-gradient(135deg,#111,#1a1a1a)';
  wrap.innerHTML = `
    <img src="${p.image}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;filter:brightness(.85)"
      onerror="this.outerHTML='<span style=font-size:6rem>${p.emoji}</span>'"/>
  `;

  /* Size buttons */
  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  /* Add btn */
  const addBtn = document.getElementById('modal-add-btn');
  addBtn.onclick = () => {
    addToCart(p.id);
    closeModal();
  };

  /* Wish btn */
  const wishBtn = document.getElementById('modal-wish-btn');
  wishBtn.onclick = () => {
    showToast('♥ Added to wishlist!');
    wishBtn.style.borderColor = '#e8002d';
    wishBtn.style.color = '#fff';
  };

  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  if (modalOverlay) modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

if (modalClose) modalClose.addEventListener('click', closeModal);
if (modalOverlay) {
  modalOverlay.addEventListener('click', e => {
    if (e.target === modalOverlay) closeModal();
  });
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

/* ══════════════════════════════════════
   DRIVER QUOTES — API backed
══════════════════════════════════════ */
function renderHomeQuotes() {
  let current = 0;
  const textEl = document.getElementById('quote-text');
  const avEl   = document.getElementById('quote-avatar');
  const nameEl = document.getElementById('quote-name');
  const teamEl = document.getElementById('quote-team');
  const dotsEl = document.getElementById('quote-dots');
  if (!textEl) return;

  if (!QUOTES.length) {
    textEl.textContent = 'Fan quotes are unavailable right now.';
    renderQuoteAvatar(avEl, '🏁', 'PADDOX');
    if (nameEl) nameEl.textContent = 'PADDOX';
    if (teamEl) teamEl.textContent = 'Quote Library';
    if (dotsEl) dotsEl.innerHTML = '';
    return;
  }

  function renderDots() {
    if (!dotsEl) return;
    dotsEl.innerHTML = QUOTES.map((_, i) =>
      `<div class="q-dot ${i === current ? 'on' : ''}" data-i="${i}"></div>`
    ).join('');
    dotsEl.querySelectorAll('.q-dot').forEach(dot => {
      dot.addEventListener('click', () => setQuote(parseInt(dot.dataset.i, 10)));
    });
  }

  function setQuote(i, animate = true) {
    current = i;
    const q = QUOTES[i];
    const apply = () => {
      textEl.textContent = q.text;
      renderQuoteAvatar(avEl, q.av || '🏁', q.driver);
      if (nameEl) nameEl.textContent = q.driver;
      if (teamEl) teamEl.textContent = q.team;
      renderDots();
    };

    if (animate) {
      textEl.style.opacity = '0';
      textEl.style.transform = 'translateY(10px)';
      setTimeout(() => {
        apply();
        textEl.style.opacity = '1';
        textEl.style.transform = 'translateY(0)';
        textEl.style.transition = 'opacity .4s, transform .4s';
      }, 250);
    } else {
      apply();
    }
  }

  setQuote(0, false);
  let autoplay = setInterval(() => setQuote((current + 1) % QUOTES.length), 6500);
  const section = document.getElementById('quote-section');
  if (section) {
    section.addEventListener('mouseenter', () => clearInterval(autoplay));
    section.addEventListener('mouseleave', () => {
      autoplay = setInterval(() => setQuote((current + 1) % QUOTES.length), 6500);
    });
  }
}

/* ══════════════════════════════════════
   NEWSLETTER
══════════════════════════════════════ */
(function initNewsletter() {
  const btn   = document.getElementById('nl-btn');
  const input = document.getElementById('nl-email');
  const form  = document.getElementById('nl-form');
  if (!btn || !input) return;

  btn.addEventListener('click', () => {
    const val = input.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) {
      showToast('⚠️ Please enter a valid email address');
      input.focus();
      input.style.borderColor = 'var(--red)';
      setTimeout(() => input.style.borderColor = '', 2000);
      return;
    }
    /* Success */
    if (form) {
      form.innerHTML = `
        <div style="
          color:#e8002d;
          font-family:'Barlow Condensed',sans-serif;
          font-size:1.2rem;
          letter-spacing:2px;
          padding:16px;
          border:1px solid rgba(232,0,45,.3);
          background:rgba(232,0,45,.06);
          width:100%;
          text-align:center;
        ">
          ✓ YOU'RE IN THE PADDOCK! 🏁
        </div>
      `;
    }
    showToast('🏁 Welcome to the Paddox Paddock!');
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') btn.click();
  });
})();

/* ══════════════════════════════════════
   ICON ANIMATIONS (bounce on load)
══════════════════════════════════════ */
(function initIconAnimations() {
  /* Stagger bounce-in for all animate-icon elements */
  const icons = document.querySelectorAll('.animate-icon, .exp-icon');
  icons.forEach((icon, i) => {
    icon.style.animationDelay = `${i * 0.15}s`;

    /* Wiggle on hover */
    icon.addEventListener('mouseenter', () => {
      icon.style.animation = 'none';
      icon.style.transform = 'scale(1.3) rotate(-10deg)';
    });
    icon.addEventListener('mouseleave', () => {
      icon.style.transform = '';
      /* Resume float animation */
      setTimeout(() => {
        icon.style.animation = `iconFloat 3s ${i * 0.15}s ease-in-out infinite`;
      }, 300);
    });
  });

  /* Nav icon wiggle */
  document.querySelectorAll('.nl-icon').forEach(icon => {
    const link = icon.closest('.nav-link');
    if (!link) return;
    link.addEventListener('mouseenter', () => {
      icon.style.transform = 'scale(1.3) rotate(-8deg)';
    });
    link.addEventListener('mouseleave', () => {
      icon.style.transform = '';
    });
  });

  /* Cart bounce on add */
  const cartIcon = document.querySelector('.cart-icon-anim');
  if (cartIcon) {
    document.addEventListener('cartUpdated', () => {
      cartIcon.style.transform = 'scale(1.4) rotate(-12deg)';
      setTimeout(() => cartIcon.style.transform = '', 400);
    });
  }
})();

/* ══════════════════════════════════════
   TOAST
══════════════════════════════════════ */
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 3000);
}

/* ══════════════════════════════════════
   MARQUEE + TICKER — API backed
══════════════════════════════════════ */
function renderHomeMarquee() {
  const track = document.getElementById('marquee-track');
  if (!track) return;

  let teams = [];

  if (USE_OFFICIAL_F1_LOGO_LIBRARY) {
    const apiTeamNames = uniqueCleanNames((HOME_F1.constructors || []).map(normalizeConstructorName));
    const byName = new Map(apiTeamNames.map(name => [name.toLowerCase().replace(/[^a-z0-9]+/g, ''), name]));
    teams = PADDOX_HOME_TEAMS.map(team => {
      const key = team.name.toLowerCase().replace(/[^a-z0-9]+/g, '');
      const liveName = team.type === 'brand' ? team.name : (byName.get(key) || team.name);
      return { ...team, name: liveName };
    });
  } else {
    teams = HOME_MARQUEE_LOGOS.length ? [...HOME_MARQUEE_LOGOS] : [...PADDOX_HOME_TEAMS];
  }

  const renderLogo = team => {
    const primary = team.image || homeTeamLogoSrc(team.slug);
    return `<img class="team-badge-img" src="${escapeHTML(primary)}" data-base="${escapeHTML(`assets/teams/${team.slug}`)}" data-try="0" alt="${escapeHTML(team.name)} badge" loading="lazy" referrerpolicy="no-referrer" onerror="window.homeLogoFallback && window.homeLogoFallback(this)"/>`;
  };

  const renderItem = team => `
    <span class="marquee-team" title="${escapeHTML(team.name)}">
      <span class="team-logo-wrap">
        ${renderLogo(team)}
        <i class="team-badge-dot" style="--team-color:${escapeHTML(team.color || '#e8002d')}"></i>
      </span>
      <span class="marquee-team-name">${escapeHTML(team.name)}</span>
    </span>`;

  track.innerHTML = [...teams, ...teams, ...teams].map(renderItem).join('');
}

function updateTickerFromAPI() {
  const tickerEl = document.getElementById('ticker-text');
  if (!tickerEl) return;

  const messages = [];
  if (HOME_F1.nextRace) {
    messages.push(`🏁 Next race: ${HOME_F1.nextRace.name || 'Grand Prix'}`);
  }
  if (HOME_F1.schedule.length) {
    messages.push(`📅 ${HOME_F1.schedule.length} Grand Prix rounds this season`);
  }
  if (HOME_F1.standings.length) {
    const leader = normalizeDriverFromAny(HOME_F1.standings[0]);
    messages.push(`🏆 Current standings leader: ${leader.name}`);
  }
  if (PRODUCTS.length) {
    messages.push(`🛒 Latest shop drops are live now`);
  }

  if (!messages.length) {
    tickerEl.textContent = '🏁 PADDOX data loading...';
    return;
  }

  let ti = 0;
  tickerEl.textContent = messages[0];
  clearInterval(tickerEl._tickerTimer);
  tickerEl._tickerTimer = setInterval(() => {
    ti = (ti + 1) % messages.length;
    tickerEl.style.opacity = '0';
    tickerEl.style.transform = 'translateY(6px)';
    setTimeout(() => {
      tickerEl.textContent = messages[ti];
      tickerEl.style.opacity = '1';
      tickerEl.style.transform = 'translateY(0)';
      tickerEl.style.transition = 'opacity .4s, transform .4s';
    }, 300);
  }, 4000);
}


/* ══════════════════════════════════════
   SIZE BUTTON INTERACTION
══════════════════════════════════════ */
document.querySelectorAll('.size-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});


/* ══════════════════════════════════════
   HOME DATA INIT
══════════════════════════════════════ */
(function initHomeData() {
  setHomeMarketingStats();
  if (!window.PaddoxAPI) {
    console.warn('Paddox API not available on home page');
    renderHomeProducts();
    renderHomeQuotes();
    renderHomeMarquee();
    return;
  }
  loadHomeProducts().then(updateTickerFromAPI);
  loadHomeQuotes();
  loadHomeMarqueeLogos();
  loadHomeF1Data();
  loadHomeFanStories();
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();

/* ══════════════════════════════════════
   GLOBAL INIT LOG
══════════════════════════════════════ */
console.log('%c🏎️ PADDOX — Home Page Loaded', 'color:#e8002d;font-size:14px;font-weight:bold;');