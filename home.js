/* ============================================================
   PADDOX — home.js
   Landing Page Logic
   Phase H3.4C.4 FastF1 circuit maps integration
   ============================================================ */

'use strict';

/* PADDOX H4.0.6 — professional visual lock; realtime logic preserved. */

/* ── HOME DATA STATE: loaded from backend only ── */
let PRODUCTS = [];
let QUOTES = [];
let HOME_F1 = { schedule: [], drivers: [], standings: [], constructors: [], nextRace: null };
let HOME_MARQUEE_LOGOS = [];

const HOME_MARKETING_STATS = { races: null, products: null, fans: null };
const HOME_REALTIME_STATE = { productCount: 0, fanCount: 0, topFan: null, latestPost: null };

const USE_OFFICIAL_F1_LOGO_LIBRARY = true;

const PADDOX_HOME_TEAMS = [
  {
    name: 'Ferrari', slug: 'ferrari', color: '#e8002d',
    image: 'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2025/ferrari/2025ferrarilogolight.webp',
    carImage: 'https://media.formula1.com/image/upload/c_lfill%2Cw_3392/q_auto/v1740000001/common/f1/2026/ferrari/2026ferraricarright.webp'
  },
  {
    name: 'Mercedes', slug: 'mercedes', color: '#00d2be',
    image: 'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2025/mercedes/2025mercedeslogowhite.webp',
    carImage: 'https://media.formula1.com/image/upload/c_lfill%2Cw_3392/q_auto/v1740000001/common/f1/2026/mercedes/2026mercedescarright.webp'
  },
  {
    name: 'Red Bull Racing', slug: 'red-bull', color: '#1e5bff',
    image: 'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2025/redbullracing/2025redbullracinglogowhite.webp',
    carImage: 'https://media.formula1.com/image/upload/c_lfill%2Cw_3392/q_auto/v1740000001/common/f1/2026/redbullracing/2026redbullracingcarright.webp'
  },
  {
    name: 'McLaren', slug: 'mclaren', color: '#ff8700',
    image: 'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2025/mclaren/2025mclarenlogowhite.webp',
    carImage: 'https://media.formula1.com/image/upload/c_lfill%2Cw_3392/q_auto/v1740000001/common/f1/2026/mclaren/2026mclarencarright.webp'
  },
  {
    name: 'Aston Martin', slug: 'aston-martin', color: '#006f62',
    image: 'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2025/astonmartin/2025astonmartinlogowhite.webp',
    carImage: 'https://media.formula1.com/image/upload/c_lfill%2Cw_3392/q_auto/v1740000001/common/f1/2026/astonmartin/2026astonmartincarright.webp'
  },
  {
    name: 'Alpine', slug: 'alpine', color: '#2293d1',
    image: 'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2025/alpine/2025alpinelogowhite.webp',
    carImage: 'https://media.formula1.com/image/upload/c_lfill%2Cw_3392/q_auto/v1740000001/common/f1/2026/alpine/2026alpinecarright.webp'
  },
  {
    name: 'Williams', slug: 'williams', color: '#64c4ff',
    image: 'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2025/williams/2025williamslogowhite.webp',
    carImage: 'https://media.formula1.com/image/upload/c_lfill%2Cw_3392/q_auto/v1740000001/common/f1/2026/williams/2026williamscarright.webp'
  },
  {
    name: 'Haas F1 Team', slug: 'haas', color: '#b6b9bc',
    image: 'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2025/haas/2025haaslogowhite.webp',
    carImage: 'https://media.formula1.com/image/upload/c_lfill%2Cw_3392/q_auto/v1740000001/common/f1/2026/haas/2026haascarright.webp'
  },
  {
    name: 'Racing Bulls', slug: 'racing-bulls', color: '#315dff',
    image: 'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2025/racingbulls/2025racingbullslogowhite.webp',
    carImage: 'https://media.formula1.com/image/upload/c_lfill%2Cw_3392/q_auto/v1740000001/common/f1/2026/racingbulls/2026racingbullscarright.webp'
  },
  {
    name: 'Audi', slug: 'audi', color: '#d60000',
    image: 'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2026/audi/2026audilogowhite.webp',
    carImage: 'https://media.formula1.com/image/upload/c_lfill%2Cw_3392/q_auto/v1740000001/common/f1/2026/audi/2026audicarright.webp'
  },
  {
    name: 'Cadillac', slug: 'cadillac', color: '#8c939c',
    image: 'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2026/cadillac/2026cadillaclogowhite.webp',
    carImage: 'https://media.formula1.com/image/upload/c_lfill%2Cw_3392/q_auto/v1740000001/common/f1/2026/cadillac/2026cadillaccarright.webp'
  },
];

function setHomeMarketingStats() {
  setRaceStatLoading();
  const productEl = document.getElementById('home-product-count');
  const fanEl = document.getElementById('home-fan-count');
  if (productEl) { productEl.dataset.count = '0'; productEl.textContent = '—'; productEl.classList.add('is-loading'); }
  if (fanEl) { fanEl.dataset.count = '0'; fanEl.textContent = '—'; fanEl.classList.add('is-loading'); }
}

function setRaceStatLoading() {
  const el = document.getElementById('home-race-count');
  if (!el) return;
  el.dataset.count = '0';
  el.textContent = '—';
  el.classList.add('is-loading');
}

function extractRaceList(payload = {}) {
  if (Array.isArray(payload)) return payload;
  const candidates = [
    payload?.data?.races,
    payload?.data?.schedule,
    payload?.data?.calendar,
    payload?.data?.RaceTable?.Races,
    payload?.data?.MRData?.RaceTable?.Races,
    payload?.races,
    payload?.schedule,
    payload?.calendar,
    payload?.RaceTable?.Races,
    payload?.MRData?.RaceTable?.Races,
  ];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }
  return [];
}

function validRaceCount(list = []) {
  return list.filter(race => {
    if (!race) return false;
    if (typeof race === 'string') return race.trim().length > 0;
    return Boolean(race.name || race.raceName || race.round || race.date || race.raceDate || race.circuit || race.Circuit);
  }).length;
}

function updateHomeSeasonRaceCount(list = HOME_F1.schedule) {
  const races = validRaceCount(Array.isArray(list) ? list : extractRaceList(list));
  if (races > 0) {
    const el = document.getElementById('home-race-count');
    if (el) el.classList.remove('is-loading');
    updateHomeRaceStat(races);
  } else {
    setRaceStatLoading();
  }
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


const COUNTRY_FLAG_CODES = {
  australia: 'au', bahrain: 'bh', china: 'cn', japan: 'jp', 'saudi arabia': 'sa',
  usa: 'us', 'united states': 'us', 'united states of america': 'us', miami: 'us', lasvegas: 'us', 'las vegas': 'us',
  italy: 'it', 'emilia romagna': 'it', monaco: 'mc', spain: 'es', canada: 'ca', austria: 'at',
  'united kingdom': 'gb', britain: 'gb', 'great britain': 'gb', silverstone: 'gb', belgium: 'be',
  hungary: 'hu', netherlands: 'nl', holland: 'nl', azerbaijan: 'az', singapore: 'sg', mexico: 'mx',
  brazil: 'br', qatar: 'qa', 'united arab emirates': 'ae', 'abu dhabi': 'ae', uae: 'ae'
};

function normalizeCountryKey(value = '') {
  return String(value || '')
    .toLowerCase()
    .replace(/grand prix|gp|circuit|autodromo|autodrome|street circuit/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function countryCodeFromRace(race = {}) {
  const fields = [race.country, race.location, race.locality, race.name, race.raceName, race.circuit];
  for (const field of fields) {
    const key = normalizeCountryKey(field);
    if (!key) continue;
    if (COUNTRY_FLAG_CODES[key]) return COUNTRY_FLAG_CODES[key];
    for (const [country, code] of Object.entries(COUNTRY_FLAG_CODES)) {
      if (key.includes(country) || country.includes(key)) return code;
    }
  }
  return '';
}

function setCountdownFlag(flagEl, race = {}) {
  if (!flagEl) return;
  const code = countryCodeFromRace(race);
  const label = safeText(race.country || race.location || race.name, 'Race flag');
  flagEl.classList.remove('flag-fallback');
  flagEl.innerHTML = '';

  if (!code) {
    flagEl.innerHTML = '<span class="cs-flag-fallback">F1</span>';
    flagEl.classList.add('flag-fallback');
    return;
  }

  flagEl.innerHTML = `
    <img
      class="cs-flag-img"
      src="https://flagcdn.com/w80/${code}.png"
      srcset="https://flagcdn.com/w40/${code}.png 1x, https://flagcdn.com/w80/${code}.png 2x"
      alt="${escapeHTML(label)} flag"
      loading="lazy"
      referrerpolicy="no-referrer"
      onerror="this.parentElement.classList.add('flag-fallback');this.outerHTML='<span class=&quot;cs-flag-fallback&quot;>F1</span>'"
    />`;
}


function renderHomeProductSkeletons(count = 4) {
  const grid = document.getElementById('products-grid');
  if (!grid) return;
  grid.innerHTML = Array.from({ length: count }, (_, i) => `
    <div class="pcard-skeleton reveal-up delay-${i + 1}" aria-hidden="true">
      <div class="sk-img"></div>
      <div class="sk-line short"></div>
      <div class="sk-line mid"></div>
      <div class="sk-line"></div>
    </div>
  `).join('');
  initRevealObserver(grid.querySelectorAll('.reveal-up'));
}

function uniqueFanCount(posts = [], leaders = []) {
  const ids = new Set();
  [...posts, ...leaders].forEach(item => {
    const user = item?.user || item?.author || item;
    const key = user?._id || user?.id || user?.email || user?.name || item?.username || item?.name;
    if (key) ids.add(String(key).toLowerCase());
  });
  return ids.size;
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
  renderHomeProductSkeletons(4);
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
    HOME_REALTIME_STATE.productCount = active.length || PRODUCTS.length;
    const productEl = document.getElementById('home-product-count');
    if (productEl) productEl.classList.remove('is-loading');
    updateHomeProductStat(HOME_REALTIME_STATE.productCount);
    renderHomeProducts();
    renderHeroLiveCards();
  } catch (err) {
    console.warn('Home products unavailable', err);
    PRODUCTS = [];
    const productEl = document.getElementById('home-product-count');
    if (productEl) productEl.classList.remove('is-loading');
    updateHomeProductStat(0);
    renderHomeProducts();
    renderHeroLiveCards();
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
    HOME_F1.schedule = extractRaceList(scheduleData.value || {});
    HOME_F1.drivers = driverData.value?.data?.drivers || driverData.value?.data || [];
    HOME_F1.standings = standingsData.value?.data?.standings || standingsData.value?.data?.drivers || standingsData.value?.data || [];
    HOME_F1.constructors = constructorData.value?.data?.standings || constructorData.value?.data?.constructors || constructorData.value?.data || [];
    renderHomeMarquee();
    updateHomeSeasonRaceCount();
    updateTickerFromAPI();
  } catch (err) {
    console.warn('Home F1 data unavailable', err);
    renderHomeMarquee();
  }
}


function fanDisplayName(item = {}) {
  const user = item.user || item.author || item;
  return safeText(`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || item.name || item.username, 'PADDOX Fan');
}

function fanInitials(name = '') {
  return safeText(name, 'PF').split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase() || 'PF';
}

function fanPointsFrom(item = {}) {
  const user = item.user || item.author || item;
  return Number(item.points || item.fanPoints || user.fanPoints || user.points || 0);
}

function fanDateLabel(value = '') {
  if (!value) return 'Live Fan Hub';
  try {
    return new Date(value).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
  } catch {
    return 'Live Fan Hub';
  }
}

function buildRealtimeFanCards(posts = [], leaders = []) {
  const cards = [];
  const used = new Set();

  posts
    .filter(post => safeText(post.text || post.content || post.message, ''))
    .slice(0, 3)
    .forEach(post => {
      const name = fanDisplayName(post);
      const text = safeText(post.text || post.content || post.message, '');
      const key = `post:${post._id || post.id || text}:${name}`.toLowerCase();
      if (used.has(key)) return;
      used.add(key);

      cards.push({
        type: 'Live Post',
        name,
        initials: fanInitials(name),
        text,
        meta: fanDateLabel(post.createdAt),
        badge: 'Live Fan Hub'
      });
    });

  leaders
    .filter(Boolean)
    .slice(0, 3)
    .forEach((leader, index) => {
      if (cards.length >= 3) return;
      const name = fanDisplayName(leader);
      const points = fanPointsFrom(leader);
      const key = `leader:${name}:${points}`.toLowerCase();
      if (used.has(key)) return;
      used.add(key);

      cards.push({
        type: index === 0 ? 'Top Fan' : 'Leaderboard',
        name,
        initials: fanInitials(name),
        text: points
          ? `${name} is climbing the PADDOX leaderboard with ${points.toLocaleString('en-IN')} Fan Points.`
          : `${name} is active in the PADDOX Fan Hub.`,
        meta: points ? `${points.toLocaleString('en-IN')} Fan Points` : 'Leaderboard synced',
        badge: index === 0 ? 'Top Fan' : 'Fan Points'
      });
    });

  return cards.slice(0, 3);
}

function renderRealtimeFanCards(grid, cards = []) {
  if (!grid) return;

  if (!cards.length) {
    grid.innerHTML = `
      <div class="home-empty-card fan-empty-card real-empty-card reveal-up">
        <div class="empty-icon" aria-hidden="true"></div>
        <div>
          <h3>Fan activity is warming up</h3>
          <p>Real Fan Hub posts, leaderboard heat and fan-point activity will appear here automatically.</p>
          <a href="fanhub.html" class="empty-cta">Enter Fan Hub →</a>
        </div>
      </div>`;
    initRevealObserver(grid.querySelectorAll('.reveal-up'));
    return;
  }

  grid.innerHTML = cards.map((card, i) => `
    <div class="testi-card fan-voice-card reveal-up delay-${i + 1}">
      <div class="fan-card-topline">
        <span class="fan-card-type">${escapeHTML(card.type)}</span>
        <span class="fan-card-rank">0${i + 1}</span>
      </div>
      <div class="testi-stars">★★★★★</div>
      <p class="testi-text">"${escapeHTML(card.text)}"</p>
      <div class="testi-author">
        <div class="testi-avatar">${escapeHTML(card.initials)}</div>
        <div>
          <div class="testi-name">${escapeHTML(card.name)}</div>
          <div class="testi-loc">${escapeHTML(card.meta)}</div>
        </div>
      </div>
      <a href="fanhub.html" class="testi-badge">${escapeHTML(card.badge)}</a>
    </div>
  `).join('');
  initRevealObserver(grid.querySelectorAll('.reveal-up'));
}


async function loadHomeFanStories() {
  const grid = document.getElementById('testi-grid');
  if (!grid) return;
  try {
    const [feedData, leaderboardData] = await Promise.allSettled([
      PaddoxAPI.fan.getFeed({ t: Date.now() }),
      PaddoxAPI.fan.leaderboard({ t: Date.now() }),
    ]);

    const posts = feedData.value?.data?.posts || feedData.value?.data?.feed || feedData.value?.posts || [];
    const leaders = leaderboardData.value?.data?.leaderboard || leaderboardData.value?.data || [];
    const safePosts = Array.isArray(posts) ? posts : [];
    const safeLeaders = Array.isArray(leaders) ? leaders : [];

    HOME_REALTIME_STATE.fanCount = Math.max(uniqueFanCount(safePosts, safeLeaders), safeLeaders.length);
    HOME_REALTIME_STATE.topFan = safeLeaders.length ? safeLeaders[0] : null;
    HOME_REALTIME_STATE.latestPost = safePosts.length ? safePosts[0] : null;

    const fanEl = document.getElementById('home-fan-count');
    if (fanEl) fanEl.classList.remove('is-loading');
    updateHomeFanStat(HOME_REALTIME_STATE.fanCount);
    renderHeroLiveCards();

    renderRealtimeFanCards(grid, buildRealtimeFanCards(safePosts, safeLeaders));
  } catch (err) {
    console.warn('Fan stories unavailable', err);
    renderRealtimeFanCards(grid, []);
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
      this.type    = Math.random() < 0.72 ? 'spark' : 'dot';
      this.x       = isBurst ? W * 0.5 + (Math.random() - 0.5) * 300
                             : Math.random() * W;
      this.y       = isBurst ? H * 0.5 + (Math.random() - 0.5) * 100
                             : Math.random() * H;
      const speed  = isBurst ? 5 + Math.random() * 5 : 1.1 + Math.random() * 1.8;
      const angle  = isBurst ? Math.random() * Math.PI * 2
                             : -Math.PI * 0.05 + (Math.random() - 0.5) * 0.4;
      this.vx      = Math.cos(angle) * speed;
      this.vy      = Math.sin(angle) * speed - (isBurst ? 0 : 0.05);
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
  for (let i = 0; i < 24; i++) particles.push(new Particle());

  /* Occasional speed burst */
  function triggerBurst() {
    for (let i = 0; i < 8; i++) particles.push(new Particle(true));
    burstTimer = setTimeout(triggerBurst, 9000 + Math.random() * 9000);
  }
  burstTimer = setTimeout(triggerBurst, 3000);

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    // Remove dead burst particles
    particles = particles.filter(p => p.life > 0 || !p.isBurst);
    // Keep base count stable
    while (particles.filter(p => !p.isBurst).length < 24) {
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
function normalizeHomeRaceDate(race = {}) {
  const raw = race.raceDate || race.date || race.startDate || race.sessionDate || '';
  if (!raw) return null;
  const time = race.time || race.raceTime || '13:00:00Z';
  const value = String(raw).includes('T') ? String(raw) : `${raw}T${time}`;
  const d = new Date(value);
  return Number.isFinite(d.getTime()) ? d : null;
}



/* H4.0.3 — verified schedule fallback + stale next-race guard
   Backend remains primary. This fallback only prevents the Home page from
   showing an already-finished GP as the next race when /api/f1/next-race is stale. */
const PADDOX_OFFICIAL_2026_F1_SCHEDULE = [
  { round: 1, season: 2026, name: 'Australian Grand Prix', raceName: 'Australian Grand Prix', circuit: 'Albert Park Circuit', location: 'Melbourne', country: 'Australia', date: '2026-03-08', time: '05:00:00Z' },
  { round: 2, season: 2026, name: 'Chinese Grand Prix', raceName: 'Chinese Grand Prix', circuit: 'Shanghai International Circuit', location: 'Shanghai', country: 'China', date: '2026-03-15', time: '07:00:00Z' },
  { round: 3, season: 2026, name: 'Japanese Grand Prix', raceName: 'Japanese Grand Prix', circuit: 'Suzuka Circuit', location: 'Suzuka', country: 'Japan', date: '2026-03-29', time: '05:00:00Z' },
  { round: 4, season: 2026, name: 'Miami Grand Prix', raceName: 'Miami Grand Prix', circuit: 'Miami International Autodrome', location: 'Miami', country: 'United States', date: '2026-05-03', time: '20:00:00Z' },
  { round: 5, season: 2026, name: 'Canadian Grand Prix', raceName: 'Canadian Grand Prix', circuit: 'Circuit Gilles Villeneuve', location: 'Montreal', country: 'Canada', date: '2026-05-24', time: '18:00:00Z' },
  { round: 6, season: 2026, name: 'Monaco Grand Prix', raceName: 'Monaco Grand Prix', circuit: 'Circuit de Monaco', location: 'Monte Carlo', country: 'Monaco', date: '2026-06-07', time: '13:00:00Z' },
  { round: 7, season: 2026, name: 'Barcelona-Catalunya Grand Prix', raceName: 'Barcelona-Catalunya Grand Prix', circuit: 'Circuit de Barcelona-Catalunya', location: 'Barcelona-Catalunya', country: 'Spain', date: '2026-06-14', time: '13:00:00Z' },
  { round: 8, season: 2026, name: 'Austrian Grand Prix', raceName: 'Austrian Grand Prix', circuit: 'Red Bull Ring', location: 'Spielberg', country: 'Austria', date: '2026-06-28', time: '13:00:00Z' },
  { round: 9, season: 2026, name: 'British Grand Prix', raceName: 'British Grand Prix', circuit: 'Silverstone Circuit', location: 'Silverstone', country: 'Great Britain', date: '2026-07-05', time: '14:00:00Z' },
  { round: 10, season: 2026, name: 'Belgian Grand Prix', raceName: 'Belgian Grand Prix', circuit: 'Circuit de Spa-Francorchamps', location: 'Spa-Francorchamps', country: 'Belgium', date: '2026-07-19', time: '13:00:00Z' },
  { round: 11, season: 2026, name: 'Hungarian Grand Prix', raceName: 'Hungarian Grand Prix', circuit: 'Hungaroring', location: 'Budapest', country: 'Hungary', date: '2026-07-26', time: '13:00:00Z' },
  { round: 12, season: 2026, name: 'Dutch Grand Prix', raceName: 'Dutch Grand Prix', circuit: 'Circuit Zandvoort', location: 'Zandvoort', country: 'Netherlands', date: '2026-08-23', time: '13:00:00Z' },
  { round: 13, season: 2026, name: 'Italian Grand Prix', raceName: 'Italian Grand Prix', circuit: 'Autodromo Nazionale Monza', location: 'Monza', country: 'Italy', date: '2026-09-06', time: '13:00:00Z' },
  { round: 14, season: 2026, name: 'Spanish Grand Prix', raceName: 'Spanish Grand Prix', circuit: 'Madring', location: 'Madrid', country: 'Spain', date: '2026-09-13', time: '13:00:00Z' },
  { round: 15, season: 2026, name: 'Azerbaijan Grand Prix', raceName: 'Azerbaijan Grand Prix', circuit: 'Baku City Circuit', location: 'Baku', country: 'Azerbaijan', date: '2026-09-27', time: '11:00:00Z' },
  { round: 16, season: 2026, name: 'Singapore Grand Prix', raceName: 'Singapore Grand Prix', circuit: 'Marina Bay Street Circuit', location: 'Singapore', country: 'Singapore', date: '2026-10-11', time: '12:00:00Z' },
  { round: 17, season: 2026, name: 'United States Grand Prix', raceName: 'United States Grand Prix', circuit: 'Circuit of The Americas', location: 'Austin', country: 'United States', date: '2026-10-25', time: '19:00:00Z' },
  { round: 18, season: 2026, name: 'Mexico City Grand Prix', raceName: 'Mexico City Grand Prix', circuit: 'Autodromo Hermanos Rodriguez', location: 'Mexico City', country: 'Mexico', date: '2026-11-01', time: '20:00:00Z' },
  { round: 19, season: 2026, name: 'São Paulo Grand Prix', raceName: 'São Paulo Grand Prix', circuit: 'Autodromo Jose Carlos Pace', location: 'São Paulo', country: 'Brazil', date: '2026-11-08', time: '17:00:00Z' },
  { round: 20, season: 2026, name: 'Las Vegas Grand Prix', raceName: 'Las Vegas Grand Prix', circuit: 'Las Vegas Strip Circuit', location: 'Las Vegas', country: 'United States', date: '2026-11-21', time: '06:00:00Z' },
  { round: 21, season: 2026, name: 'Qatar Grand Prix', raceName: 'Qatar Grand Prix', circuit: 'Lusail International Circuit', location: 'Lusail', country: 'Qatar', date: '2026-11-29', time: '16:00:00Z' },
  { round: 22, season: 2026, name: 'Abu Dhabi Grand Prix', raceName: 'Abu Dhabi Grand Prix', circuit: 'Yas Marina Circuit', location: 'Abu Dhabi', country: 'United Arab Emirates', date: '2026-12-06', time: '13:00:00Z' }
];
function isHomeRaceStillUpcoming(race = {}, raceDate = null) {
  const d = raceDate || normalizeHomeRaceDate(race);
  return Boolean(d && d.getTime() > Date.now());
}
function mergeHomeScheduleWithOfficial(schedule = []) {
  const live = extractRaceList(schedule || []);
  return live.length ? live : PADDOX_OFFICIAL_2026_F1_SCHEDULE;
}

function findHomeNextRaceFromSchedule(list = []) {
  const races = extractRaceList(list);
  if (!races.length) return null;
  const now = Date.now();
  const enriched = races
    .map(race => ({ race, date: normalizeHomeRaceDate(race) }))
    .filter(item => item.race && item.date);
  const future = enriched
    .filter(item => item.date.getTime() >= now)
    .sort((a, b) => a.date - b.date)[0];
  return (future || enriched.sort((a, b) => b.date - a.date)[0] || { race: races[0], date: null });
}

async function getHomeNextRaceSource() {
  let backendCandidate = null;

  /* 1) Try backend next-race endpoint, but reject stale/past races. */
  try {
    const data = await PaddoxAPI.f1.nextRace();
    const race = data?.data?.race || data?.race || null;
    if (data?.success !== false && race) {
      const raceDate = normalizeHomeRaceDate({ ...race, raceDate: data?.data?.raceDate || race.raceDate || race.date });
      backendCandidate = {
        race,
        raceDate,
        schedule: extractRaceList(data || {}),
        source: 'nextRace'
      };
      if (isHomeRaceStillUpcoming(race, raceDate)) return backendCandidate;
      console.warn('Backend next-race is stale/past; checking full schedule instead', race?.name || race?.raceName || race);
    }
  } catch (err) {
    console.warn('Next race endpoint unavailable, trying schedule fallback', err);
  }

  /* 2) Prefer full schedule endpoint for the true upcoming race. */
  try {
    const scheduleData = await PaddoxAPI.f1.schedule();
    const schedule = mergeHomeScheduleWithOfficial(scheduleData || {});
    const selected = findHomeNextRaceFromSchedule(schedule);
    if (selected?.race && isHomeRaceStillUpcoming(selected.race, selected.date)) {
      return { race: selected.race, raceDate: selected.date, schedule, source: 'schedule' };
    }
  } catch (err) {
    console.warn('Schedule fallback unavailable', err);
  }

  /* 3) Official 2026 calendar fallback prevents Monaco/track mismatches when APIs are stale. */
  const officialSelected = findHomeNextRaceFromSchedule(PADDOX_OFFICIAL_2026_F1_SCHEDULE);
  if (officialSelected?.race) {
    return { race: officialSelected.race, raceDate: officialSelected.date, schedule: PADDOX_OFFICIAL_2026_F1_SCHEDULE, source: 'official-fallback' };
  }

  /* 4) Last resort: show backend candidate even if stale instead of blank UI. */
  if (backendCandidate?.race) return backendCandidate;
  const existing = HOME_F1.nextRace ? { race: HOME_F1.nextRace, date: normalizeHomeRaceDate(HOME_F1.nextRace) } : findHomeNextRaceFromSchedule(HOME_F1.schedule || []);
  if (existing?.race) return { race: existing.race, raceDate: existing.date, schedule: HOME_F1.schedule || [], source: 'memory' };
  return null;
}

function updateCountdownDisplayFromRace(race = {}, raceDate = null, schedule = []) {
  const nameEl = document.querySelector('.cs-name');
  const circEl = document.querySelector('.cs-circuit');
  const chipEl = document.querySelector('.cs-chip');
  const flagEl = document.querySelector('.cs-flag');

  HOME_F1.nextRace = race;
  if (Array.isArray(schedule) && schedule.length) {
    HOME_F1.schedule = schedule;
    updateHomeSeasonRaceCount(schedule);
  } else if (race.totalRaces || race.seasonRaceCount) {
    updateHomeSeasonRaceCount(Array.from({ length: Number(race.totalRaces || race.seasonRaceCount) }, (_, i) => ({ round: i + 1 })));
  }
  window.HOME_F1 = HOME_F1;

  if (flagEl) {
    flagEl.title = race.country || race.location || race.name || 'Next Grand Prix';
    flagEl.setAttribute('aria-label', race.country || race.location || 'Grand Prix');
    setCountdownFlag(flagEl, race);
  }
  if (nameEl) nameEl.textContent = race.name || race.raceName || race.grandPrix || 'Next Grand Prix';
  if (circEl) circEl.textContent = [race.circuit, race.location || race.locality, race.country].filter(Boolean).join(' · ') || 'Circuit details syncing';
  if (chipEl) chipEl.textContent = `Round ${race.round || '—'} · Season ${race.season || new Date().getFullYear()}`;

  clearInterval(window.__PADDOX_COUNTDOWN_TIMER);
  function tick() {
    const date = raceDate || normalizeHomeRaceDate(race);
    const diff = date ? date.getTime() - Date.now() : 0;
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
  window.__PADDOX_COUNTDOWN_TIMER = setInterval(tick, 1000);
  updateTickerFromAPI();
}

async function initRealCountdown() {
  try {
    const source = await getHomeNextRaceSource();
    if (!source?.race) throw new Error('No next race data');
    updateCountdownDisplayFromRace(source.race, source.raceDate, source.schedule);
  } catch (err) {
    console.warn('Countdown unavailable', err);
    const nameEl = document.querySelector('.cs-name');
    const circEl = document.querySelector('.cs-circuit');
    const chipEl = document.querySelector('.cs-chip');
    const flagEl = document.querySelector('.cs-flag');
    if (flagEl) {
      flagEl.title = 'Grand Prix';
      flagEl.setAttribute('aria-label', 'Grand Prix');
      setCountdownFlag(flagEl, {});
    }
    if (nameEl) nameEl.textContent = 'Next race syncing';
    if (circEl) circEl.textContent = 'Live calendar reconnecting...';
    if (chipEl) chipEl.textContent = 'Schedule sync retrying';
  }
}

initRealCountdown();
/* Re-check the countdown source so the strip and Track Mode stay matched while the page is open. */
setInterval(initRealCountdown, 10 * 60 * 1000);

/* ══════════════════════════════════════
   HERO SPEED LINES
══════════════════════════════════════ */
(function initSpeedLines() {
  const container = document.getElementById('speed-lines');
  if (!container) return;
  const configs = [
    { top:'16%', width:'56%', delay:'0s',   dur:'2.9s', opacity:.42 },
    { top:'31%', width:'34%', delay:'.7s',  dur:'2.5s', opacity:.30 },
    { top:'49%', width:'64%', delay:'1.25s', dur:'3.4s', opacity:.34 },
    { top:'64%', width:'42%', delay:'.35s',  dur:'2.85s', opacity:.28 },
    { top:'78%', width:'58%', delay:'1.05s',   dur:'3.2s',   opacity:.24 }
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
      if (!Number.isFinite(target) || target <= 0) {
        observer.unobserve(el);
        return;
      }
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
    grid.innerHTML = '<div class="home-empty-card merch-empty-card reveal-up"><div class="empty-icon" aria-hidden="true"></div><div><h3>Featured drops are loading</h3><p>Open the shop to browse every PADDOX product.</p><a href="shop.html" class="empty-cta">Open Shop →</a></div></div>'; initRevealObserver(grid.querySelectorAll('.reveal-up'));
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
          <button class="ov-btn add-to-cart" data-id="${escapeHTML(p.id)}">Add to Cart</button>
          <button class="ov-btn outline quick-view" data-id="${escapeHTML(p.id)}">Quick View</button>
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
      showToast(btn.classList.contains('on') ? 'Added to wishlist' : 'Removed from wishlist');
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


function isApparelProduct(product = {}) {
  const text = `${product.name || ''} ${product.cat || ''} ${product.category || ''}`.toLowerCase();
  const nonApparelTerms = ['poster', 'collectible', 'collectibles', 'model', 'diecast', 'wallpaper', 'print', 'mug', 'keychain', 'sticker', 'cap', 'hat'];
  if (nonApparelTerms.some(term => text.includes(term))) return false;
  const apparelTerms = ['apparel', 'shirt', 't-shirt', 'tee', 'hoodie', 'jacket', 'jersey', 'polo', 'sweatshirt'];
  return apparelTerms.some(term => text.includes(term));
}

function renderFanEmptyState(grid, title, message) {
  renderRealtimeFanCards(grid, []);
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

function addToCart(id, qty = 1, size = '') {
  const product = PRODUCTS.find(p => String(p.id) === String(id));
  if (!product) return;
  const amount = Math.max(1, Number(qty) || 1);
  const sizeLabel = safeText(size, '');
  const existing = cart.find(x => String(x.id) === String(id) && safeText(x.size, '') === sizeLabel);
  if (existing) {
    existing.qty += amount;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      qty: amount,
      emoji: product.emoji,
      image: product.image,
      size: sizeLabel,
    });
  }
  saveCart();
  const optionText = sizeLabel ? ` (${sizeLabel})` : amount > 1 ? ` x${amount}` : '';
  showToast(`${product.name}${optionText} added to cart`);
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

  /* Product options: sizes only for apparel, quantity for all other categories */
  let modalQty = 1;
  let selectedSize = '';
  const optionsEl = document.getElementById('modal-options');
  if (optionsEl) {
    if (isApparelProduct(p)) {
      selectedSize = 'M';
      optionsEl.innerHTML = `
        <div class="modal-sizes">
          <div class="modal-size-label">Size</div>
          <div class="size-opts">
            ${['XS','S','M','L','XL','XXL'].map(size => `<button class="size-btn ${size === selectedSize ? 'active' : ''}" data-size="${size}">${size}</button>`).join('')}
          </div>
        </div>`;
      optionsEl.querySelectorAll('.size-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          selectedSize = btn.dataset.size || btn.textContent.trim();
          optionsEl.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        });
      });
    } else {
      optionsEl.innerHTML = `
        <div class="modal-qty-block">
          <div class="modal-size-label">Quantity</div>
          <div class="modal-qty-control">
            <button class="qty-btn" type="button" data-step="-1">−</button>
            <span class="qty-value">1</span>
            <button class="qty-btn" type="button" data-step="1">+</button>
          </div>
        </div>`;
      const qtyValue = optionsEl.querySelector('.qty-value');
      optionsEl.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          modalQty = Math.max(1, modalQty + Number(btn.dataset.step || 0));
          if (qtyValue) qtyValue.textContent = String(modalQty);
        });
      });
    }
  }

  /* Add btn */
  const addBtn = document.getElementById('modal-add-btn');
  addBtn.onclick = () => {
    addToCart(p.id, modalQty, selectedSize);
    closeModal();
  };

  /* Wish btn */
  const wishBtn = document.getElementById('modal-wish-btn');
  wishBtn.onclick = () => {
    showToast('Added to wishlist');
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
  const QUOTE_DURATION = 6500;
  const QUOTE_SWITCH_DELAY = 260;
  let current = 0;
  let quoteTimerToken = 0;
  let quoteFallbackTimer = null;

  const textEl = document.getElementById('quote-text');
  const avEl   = document.getElementById('quote-avatar');
  const nameEl = document.getElementById('quote-name');
  const teamEl = document.getElementById('quote-team');
  const dotsEl = document.getElementById('quote-dots');
  const card   = document.querySelector('.quote-inner');
  if (!textEl) return;

  function quoteBar() {
    return document.getElementById('quote-progress-bar');
  }

  function cancelQuoteTimer() {
    quoteTimerToken += 1;
    clearTimeout(quoteFallbackTimer);
    const bar = quoteBar();
    if (bar) bar.ontransitionend = null;
  }

  function startQuoteProgressTimer() {
    const bar = quoteBar();
    if (!bar || !QUOTES.length) return;

    cancelQuoteTimer();
    const token = quoteTimerToken;

    bar.ontransitionend = null;
    bar.style.transition = 'none';
    bar.style.width = '0%';
    bar.style.transformOrigin = 'left center';
    void bar.offsetWidth;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (token !== quoteTimerToken) return;

        bar.ontransitionend = (event) => {
          if (event.propertyName !== 'width') return;
          if (token !== quoteTimerToken) return;
          clearTimeout(quoteFallbackTimer);
          bar.ontransitionend = null;
          setQuote(current + 1, true);
        };

        bar.style.transition = `width ${QUOTE_DURATION}ms linear`;
        bar.style.width = '100%';

        /* Safety fallback only if transitionend is missed by the browser. */
        quoteFallbackTimer = window.setTimeout(() => {
          if (token !== quoteTimerToken) return;
          bar.ontransitionend = null;
          setQuote(current + 1, true);
        }, QUOTE_DURATION + 450);
      });
    });
  }

  window.PADDOX_RESTART_QUOTE_PROGRESS = startQuoteProgressTimer;

  if (!QUOTES.length) {
    textEl.textContent = 'Fan quotes are unavailable right now.';
    renderQuoteAvatar(avEl, '🏁', 'PADDOX');
    if (nameEl) nameEl.textContent = 'PADDOX';
    if (teamEl) teamEl.textContent = 'Quote Library';
    if (dotsEl) dotsEl.innerHTML = '';
    const bar = quoteBar();
    if (bar) {
      bar.style.transition = 'none';
      bar.style.width = '0%';
    }
    return;
  }

  function renderDots() {
    if (!dotsEl) return;
    dotsEl.innerHTML = QUOTES.map((_, i) =>
      `<div class="q-dot ${i === current ? 'on' : ''}" data-i="${i}" role="button" aria-label="Show quote ${i + 1}"></div>`
    ).join('');
    dotsEl.querySelectorAll('.q-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        setQuote(parseInt(dot.dataset.i, 10), true);
      });
    });
  }

  function setQuote(i, animate = true) {
    if (!QUOTES.length) return;
    cancelQuoteTimer();
    current = ((i % QUOTES.length) + QUOTES.length) % QUOTES.length;
    const q = QUOTES[current];

    const apply = () => {
      textEl.textContent = q.text;
      renderQuoteAvatar(avEl, q.av || '🏁', q.driver);
      if (nameEl) nameEl.textContent = q.driver;
      if (teamEl) teamEl.textContent = q.team;
      renderDots();
      startQuoteProgressTimer();
    };

    if (animate) {
      card?.classList.add('h33d-quote-changing');
      textEl.style.opacity = '0';
      textEl.style.transform = 'translateY(10px)';
      window.setTimeout(() => {
        apply();
        textEl.style.transition = 'opacity .4s, transform .4s';
        textEl.style.opacity = '1';
        textEl.style.transform = 'translateY(0)';
        window.setTimeout(() => card?.classList.remove('h33d-quote-changing'), 520);
      }, QUOTE_SWITCH_DELAY);
    } else {
      apply();
    }
  }

  setQuote(0, false);
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
      showToast('Please enter a valid email address');
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
          YOU'RE IN THE PADDOX CREW!
        </div>
      `;
    }
    showToast('Welcome to the PADDOX Crew');
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

  const renderCar = team => {
    if (!team.carImage) return '';
    return `<img class="team-car-img" src="${escapeHTML(team.carImage)}" alt="${escapeHTML(team.name)} car" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.display='none'"/>`;
  };

  const renderItem = team => `
    <span class="marquee-team" style="--team-color:${escapeHTML(team.color || '#e8002d')}" title="${escapeHTML(team.name)}">
      <span class="marquee-team-head">
        <span class="team-logo-orb">${renderLogo(team)}</span>
        <span class="marquee-team-name">${escapeHTML(team.name)}</span>
      </span>
      <span class="marquee-team-car-wrap">${renderCar(team)}</span>
    </span>`;

  track.innerHTML = [...teams, ...teams].map(renderItem).join('');
}


function bestLeaderName() {
  if (HOME_F1.standings.length) return normalizeDriverFromAny(HOME_F1.standings[0]).name;
  const fan = HOME_REALTIME_STATE.topFan;
  if (fan) {
    const user = fan.user || fan;
    return safeText(`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || fan.name || fan.username, 'Top Fan');
  }
  return 'Loading';
}

function latestDropName() {
  return PRODUCTS[0]?.name || (HOME_REALTIME_STATE.productCount ? `${HOME_REALTIME_STATE.productCount} Products` : 'Loading');
}

function renderHeroLiveCards() {
  const grid = document.getElementById('hero-live-grid');
  if (!grid) return;
  const nextRace = HOME_F1.nextRace || {};
  const raceTitle = safeText(nextRace.name || nextRace.raceName, 'Next Race');
  const raceMeta = [nextRace.circuit, nextRace.country].filter(Boolean).join(' · ') || 'Formula 1 schedule';
  const leader = bestLeaderName();
  const drop = latestDropName();
  grid.innerHTML = `
    <div class="hero-live-card"><span>Next Race</span><strong>${escapeHTML(raceTitle)}</strong><small>${escapeHTML(raceMeta)}</small></div>
    <div class="hero-live-card"><span>Live Leader</span><strong>${escapeHTML(leader)}</strong><small>${HOME_F1.standings.length ? 'Driver standings' : 'Community leaderboard'}</small></div>
    <div class="hero-live-card"><span>Latest Drop</span><strong>${escapeHTML(drop)}</strong><small>${HOME_REALTIME_STATE.productCount || PRODUCTS.length || 'Live'} shop items</small></div>
  `;
}

function updateTickerFromAPI() {
  const tickerEl = document.getElementById('ticker-text');
  if (!tickerEl) return;

  const messages = [];
  if (HOME_F1.nextRace) {
    messages.push(`Next race: ${HOME_F1.nextRace.name || 'Grand Prix'}`);
  }
  const liveRaceCount = validRaceCount(HOME_F1.schedule);
  if (liveRaceCount) {
    messages.push(`${liveRaceCount} Grand Prix rounds this season`);
  }
  if (HOME_F1.standings.length) {
    const leader = normalizeDriverFromAny(HOME_F1.standings[0]);
    messages.push(`Current standings leader: ${leader.name}`);
  }
  if (PRODUCTS.length) {
    messages.push(`Latest drop: ${PRODUCTS[0].name}`);
  }
  if (HOME_REALTIME_STATE.fanCount) {
    messages.push(`${HOME_REALTIME_STATE.fanCount} active PADDOX fans tracked from community data`);
  }
  renderHeroLiveCards();

  if (!messages.length) {
    tickerEl.textContent = 'PADDOX data loading...';
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
   H1 PREMIUM SCROLL + MOTION POLISH
══════════════════════════════════════ */
(function initHomeMotionPolish() {
  const progress = document.getElementById('scroll-progress');
  function updateProgress() {
    if (!progress) return;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    progress.style.width = `${Math.min(100, Math.max(0, (window.scrollY / max) * 100))}%`;
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();

  const hero = document.getElementById('hero');
  const spotlight = document.getElementById('hero-spotlight');
  if (hero && spotlight && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    hero.addEventListener('pointermove', e => {
      const rect = hero.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      spotlight.style.setProperty('--mx', `${x}%`);
      spotlight.style.setProperty('--my', `${y}%`);
    });
  }

  const magnetic = document.querySelectorAll('.btn-primary,.btn-outline,.nav-cta-btn,.see-all');
  magnetic.forEach(el => {
    el.classList.add('magnetic-ready');
    el.addEventListener('pointermove', e => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.12;
      const y = (e.clientY - r.top - r.height / 2) * 0.18;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
})();

/* ══════════════════════════════════════
   HOME DATA INIT
══════════════════════════════════════ */
(function initHomeData() {
  setHomeMarketingStats();
  renderHeroLiveCards();
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
console.log('%cPADDOX — Home Page Loaded', 'color:#e8002d;font-size:14px;font-weight:bold;');

/* ============================================================
   H1.3 — Safe Interactive Polish
   No floating cards. No hidden marquee. No risky section hiding.
   ============================================================ */
function initSafeViewportMotion() {
  document.body.classList.add('safe-motion-ready');

  const revealSelectors = [
    '.section-head',
    '.quote-inner',
    '.newsletter-inner',
    '.cs-left',
    '.cs-right'
  ];

  revealSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => el.classList.add('safe-reveal'));
  });

  ['#products-grid', '.exp-grid', '#testi-grid'].forEach(selector => {
    document.querySelectorAll(selector).forEach(el => el.classList.add('safe-stagger'));
  });

  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.safe-reveal,.safe-stagger').forEach(el => el.classList.add('safe-in'));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('safe-in');
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.14,
    rootMargin: '0px 0px -6% 0px'
  });

  document.querySelectorAll('.safe-reveal,.safe-stagger').forEach(el => observer.observe(el));
}

function refreshSafeMotionAfterAsyncRender() {
  ['#products-grid', '.exp-grid', '#testi-grid'].forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      el.classList.add('safe-stagger');
      requestAnimationFrame(() => el.classList.add('safe-in'));
    });
  });
}

function initSafeHeroDepth() {
  const hero = document.getElementById('hero');
  if (!hero) return;
  hero.classList.remove('hero-interactive');
  const content = document.getElementById('hero-content');
  const liveCards = document.querySelector('.hero-live-cards');
  const stats = document.querySelector('.hero-stats');
  if (content) content.style.transform = '';
  if (liveCards) liveCards.style.transform = '';
  if (stats) stats.style.transform = '';
}

function initSafeCardTilt() {
  const cards = document.querySelectorAll('.pcard,.exp-card,.testi-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      if (window.innerWidth < 900) return;
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - .5) * 6;
      card.style.setProperty('--safe-tilt', `${x}deg`);
    }, { passive: true });

    card.addEventListener('mouseleave', () => {
      card.style.removeProperty('--safe-tilt');
    });
  });
}

function initSafeMagneticButtons() {
  const buttons = document.querySelectorAll('.btn-primary,.btn-outline,.nav-cta-btn');
  buttons.forEach(btn => {
    btn.addEventListener('mousemove', e => {
      if (window.innerWidth < 900) return;
      const rect = btn.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * .10;
      const y = (e.clientY - rect.top - rect.height / 2) * .14;
      btn.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }, { passive: true });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

function initSafeCountdownFlip() {
  ['cd-d','cd-h','cd-m','cd-s'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    let last = el.textContent;

    setInterval(() => {
      if (el.textContent === last) return;
      last = el.textContent;
      const block = el.closest('.cd-block');
      if (!block) return;
      block.classList.remove('safe-flip');
      void block.offsetWidth;
      block.classList.add('safe-flip');
    }, 650);
  });
}

function ensureHomeMarqueeVisible() {
  const marquee = document.getElementById('marquee-track');
  if (!marquee) return;
  marquee.style.opacity = '1';
  marquee.style.visibility = 'visible';

  const strip = marquee.closest('.marquee-strip');
  if (strip) {
    strip.style.opacity = '1';
    strip.style.visibility = 'visible';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initSafeViewportMotion();
  initSafeHeroDepth();
  initSafeCardTilt();
  initSafeMagneticButtons();
  initSafeCountdownFlip();
  ensureHomeMarqueeVisible();

  setTimeout(() => {
    refreshSafeMotionAfterAsyncRender();
    initSafeCardTilt();
    ensureHomeMarqueeVisible();
  }, 900);

  setTimeout(() => {
    refreshSafeMotionAfterAsyncRender();
    initSafeCardTilt();
    ensureHomeMarqueeVisible();
  }, 2200);
});


/* H1.4.3 safety: remove hero mouse/depth transforms */
document.addEventListener('DOMContentLoaded', () => {
  const hero = document.getElementById('hero');
  const content = document.getElementById('hero-content');
  const liveCards = document.querySelector('.hero-live-cards');
  const stats = document.querySelector('.hero-stats');

  hero?.classList.remove('hero-interactive');
  if (content) content.style.transform = '';
  if (liveCards) liveCards.style.transform = '';
  if (stats) stats.style.transform = '';
});


/* H1.7 — true realtime refresh: no hardcoded fan cards */
document.addEventListener('DOMContentLoaded', () => {
  setInterval(() => {
    if (typeof loadHomeFanStories === 'function') loadHomeFanStories();
  }, 45000);
});


/* ============================================================
   H2 — Home Interactive Motion System
   Premium vanilla JS animations. Safe, no React required.
   ============================================================ */
function initH2MotionSystem() {
  document.body.classList.add('motion-ready');

  initH2ScrollProgress();
  initH2Cursor();
  initH2AmbientPointer();
  initH2ViewportReveal();
  initH2TiltCards();
  initH2MagneticElements();
  initH2CountdownFlip();
  initH2MarqueeControl();

  setTimeout(() => {
    refreshH2DynamicMotion();
    initH2TiltCards();
  }, 900);

  setTimeout(() => {
    refreshH2DynamicMotion();
    initH2TiltCards();
  }, 2400);
}

function initH2ScrollProgress() {
  const update = () => {
    const doc = document.documentElement;
    const max = Math.max(1, doc.scrollHeight - window.innerHeight);
    const pct = Math.min(100, Math.max(0, (window.scrollY / max) * 100));
    document.body.style.setProperty('--scroll-progress', `${pct}%`);
  };
  update();
  window.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
  window.addEventListener('resize', update, { passive: true });
}

function initH2Cursor() {
  const cursor = document.getElementById('motion-cursor');
  if (!cursor || window.innerWidth < 900) return;

  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  let tx = x;
  let ty = y;

  window.addEventListener('mousemove', e => {
    tx = e.clientX;
    ty = e.clientY;
    cursor.classList.add('is-visible');
  }, { passive: true });

  const hoverSelectors = '.btn-primary, .btn-outline, .ov-btn, .pcard, .exp-card, .testi-card, .marquee-strip, .quote-inner, .race-lab-card, .race-lab-btn, .fan-pulse-card';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(hoverSelectors)) cursor.classList.add('is-hovering');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(hoverSelectors)) cursor.classList.remove('is-hovering');
  });

  const navBar = document.getElementById('navbar');
  if (navBar) {
    navBar.addEventListener('mouseenter', () => cursor.classList.add('is-hidden-nav'));
    navBar.addEventListener('mouseleave', () => cursor.classList.remove('is-hidden-nav'));
  }

  const tick = () => {
    x += (tx - x) * 0.18;
    y += (ty - y) * 0.18;
    cursor.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(tick);
  };
  tick();
}

function initH2AmbientPointer() {
  const layer = document.getElementById('ambient-motion-layer');
  if (!layer || window.innerWidth < 900) return;

  window.addEventListener('mousemove', e => {
    const mx = (e.clientX / window.innerWidth) * 100;
    const my = (e.clientY / window.innerHeight) * 100;
    layer.style.setProperty('--mx', `${mx}%`);
    layer.style.setProperty('--my', `${my}%`);
  }, { passive: true });
}

function initH2ViewportReveal() {
  const revealSelectors = [
    '.section-head',
    '.quote-inner',
    '.newsletter-inner',
    '.cs-left',
    '.cs-right',
    '.hero-live-card',
    '.hero-stats'
  ];

  revealSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => el.classList.add('motion-reveal'));
  });

  ['#products-grid', '.exp-grid', '#testi-grid', '.cd-blocks'].forEach(selector => {
    document.querySelectorAll(selector).forEach(el => el.classList.add('motion-stagger'));
  });

  document.querySelectorAll('.section, .countdown-strip, .home-grid-strip-section, .quote-section, .newsletter-section')
    .forEach(el => el.classList.add('motion-section'));

  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.motion-reveal,.motion-stagger,.motion-section').forEach(el => el.classList.add('motion-in'));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('motion-in');
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.13,
    rootMargin: '0px 0px -7% 0px'
  });

  document.querySelectorAll('.motion-reveal,.motion-stagger,.motion-section').forEach(el => observer.observe(el));
}

function refreshH2DynamicMotion() {
  document.querySelectorAll('#products-grid, .exp-grid, #testi-grid').forEach(el => {
    el.classList.add('motion-stagger', 'motion-in');
  });
}

function initH2TiltCards() {
  const cards = document.querySelectorAll('.pcard,.exp-card,.testi-card');
  cards.forEach(card => {
    if (card.dataset.h2TiltReady === '1') return;
    card.dataset.h2TiltReady = '1';

    card.addEventListener('mousemove', e => {
      if (window.innerWidth < 900) return;
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty('--tilt-x', `${px * 7}deg`);
      card.style.setProperty('--tilt-y', `${py * -5}deg`);
    }, { passive: true });

    card.addEventListener('mouseleave', () => {
      card.style.removeProperty('--tilt-x');
      card.style.removeProperty('--tilt-y');
    });
  });
}

function initH2MagneticElements() {
  const elements = document.querySelectorAll('.btn-primary,.btn-outline,.nav-cta-btn,.see-all,.exp-link');
  elements.forEach(el => {
    if (el.dataset.h2MagneticReady === '1') return;
    el.dataset.h2MagneticReady = '1';

    el.addEventListener('mousemove', e => {
      if (window.innerWidth < 900) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * 0.12;
      const y = (e.clientY - rect.top - rect.height / 2) * 0.16;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }, { passive: true });

    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });
}

function initH2CountdownFlip() {
  ['cd-d','cd-h','cd-m','cd-s'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    let last = el.textContent;

    setInterval(() => {
      if (el.textContent === last) return;
      last = el.textContent;
      const block = el.closest('.cd-block');
      if (!block) return;
      block.classList.remove('h2-flip');
      void block.offsetWidth;
      block.classList.add('h2-flip');
    }, 650);
  });
}

function initH2MarqueeControl() {
  const strip = document.querySelector('.marquee-strip');
  const track = document.getElementById('marquee-track');
  if (!strip || !track) return;

  strip.addEventListener('mouseenter', () => {
    track.style.animationPlayState = 'paused';
  });

  strip.addEventListener('mouseleave', () => {
    track.style.animationPlayState = '';
    track.style.transform = '';
  });

  strip.addEventListener('mousemove', e => {
    if (window.innerWidth < 900) return;
    const rect = strip.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    track.style.transform = `translateX(${x * -18}px)`;
  }, { passive: true });
}

document.addEventListener('DOMContentLoaded', initH2MotionSystem);


/* ============================================================
   H3 — Anime.js Liquid Glass Motorsport Motion
   Progressive enhancement: if Anime.js fails, normal site still works.
   ============================================================ */
function initH3LiquidGlassAnime() {
  initH3LiquidPointer();
  initH3LiquidSurfaces();
  initH3AnimeHeroText();
  initH3AnimeViewport();
  initH3AnimeHoverSweeps();
  initH3AnimeCounters();
}

function h3AnimeAvailable() {
  return typeof window.anime === 'function';
}

function initH3LiquidPointer() {
  const layer = document.getElementById('liquid-glass-layer');
  if (!layer || window.innerWidth < 900) return;

  let raf = null;
  window.addEventListener('mousemove', e => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = null;
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      layer.style.setProperty('--lgx', `${x}%`);
      layer.style.setProperty('--lgy', `${y}%`);
    });
  }, { passive: true });
}

function initH3LiquidSurfaces() {
  document
    .querySelectorAll('.pcard,.exp-card,.testi-card,.quote-inner,.newsletter-inner,.hero-live-card,.cd-block')
    .forEach(el => el.classList.add('liquid-sweep'));
}

function splitH3Text(el) {
  if (!el || el.dataset.h3Split === '1') return;
  const text = el.textContent;
  el.dataset.h3Original = text;
  el.dataset.h3Split = '1';
  el.innerHTML = text.split('').map(ch => {
    if (ch === ' ') return '<span class="h3-char">&nbsp;</span>';
    return `<span class="h3-char">${ch}</span>`;
  }).join('');
}

function initH3AnimeHeroText() {
  const heroLines = document.querySelectorAll('.hero-h1 .h1-line');
  heroLines.forEach(splitH3Text);

  if (!h3AnimeAvailable()) return;

  window.anime({
    targets: '.hero-h1 .h3-char',
    translateY: [44, 0],
    translateX: [-18, 0],
    rotateZ: [-6, 0],
    opacity: [0, 1],
    filter: ['blur(10px)', 'blur(0px)'],
    delay: window.anime.stagger(18, { start: 180 }),
    duration: 980,
    easing: 'easeOutExpo'
  });

  window.anime({
    targets: '.hero-eyebrow, .hero-sub, .hero-btns, .hero-ticker',
    translateY: [22, 0],
    opacity: [0, 1],
    delay: window.anime.stagger(90, { start: 550 }),
    duration: 850,
    easing: 'easeOutExpo'
  });
}

function initH3AnimeViewport() {
  if (!('IntersectionObserver' in window)) return;

  const targets = document.querySelectorAll(
    '.section-head, .pcard, .exp-card, .testi-card, .quote-inner, .newsletter-inner, .cd-block'
  );

  targets.forEach(el => el.classList.add('h3-anime-init'));

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add('h3-anime-ready', 'motion-in');

      if (h3AnimeAvailable()) {
        window.anime({
          targets: el,
          translateY: [28, 0],
          scale: [0.985, 1],
          opacity: [0, 1],
          filter: ['blur(8px)', 'blur(0px)'],
          duration: 760,
          easing: 'easeOutExpo'
        });
      }

      if (el.classList.contains('liquid-sweep')) {
        el.classList.add('is-sweeping');
        setTimeout(() => el.classList.remove('is-sweeping'), 1100);
      }

      observer.unobserve(el);
    });
  }, {
    threshold: 0.16,
    rootMargin: '0px 0px -7% 0px'
  });

  targets.forEach(el => observer.observe(el));
}

function initH3AnimeHoverSweeps() {
  document.querySelectorAll('.liquid-sweep').forEach(el => {
    el.addEventListener('mouseenter', () => {
      el.classList.remove('is-sweeping');
      void el.offsetWidth;
      el.classList.add('is-sweeping');

      if (h3AnimeAvailable() && window.innerWidth >= 900) {
        window.anime({
          targets: el,
          scale: [1, 1.015],
          duration: 420,
          direction: 'alternate',
          easing: 'easeOutQuad'
        });
      }
    });
  });
}

function initH3AnimeCounters() {
  if (!h3AnimeAvailable()) return;

  const nums = document.querySelectorAll('.stat-num, .cd-num');
  nums.forEach(num => {
    num.addEventListener('DOMSubtreeModified', () => {
      window.anime({
        targets: num,
        translateY: [-6, 0],
        opacity: [0.55, 1],
        duration: 320,
        easing: 'easeOutQuad'
      });
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initH3LiquidGlassAnime, 80);
});


/* ============================================================
   H3.1 — Signature Interactive Home Upgrade
   Nav indicator + SVG track motion + quote carousel polish
   ============================================================ */
function initH31SignatureUpgrade() {
  initH31NavIndicator();
  initH31RaceControl();
  initH31QuoteProgress();
  initH31WordMotion();
}

function initH31NavIndicator() {
  const nav = document.getElementById('nav-links') || document.querySelector('.nav-links');
  const indicator = document.getElementById('nav-active-indicator');
  if (!nav || !indicator) return;

  const links = [...nav.querySelectorAll('.nav-link')];
  const active = links.find(a => a.classList.contains('active')) || links[0];

  function moveTo(el, instant = false) {
    if (!el) return;
    const navRect = nav.getBoundingClientRect();
    const rect = el.getBoundingClientRect();
    const x = rect.left - navRect.left + rect.width / 2;
    indicator.classList.add('is-ready');

    if (typeof window.anime === 'function' && !instant) {
      window.anime({
        targets: indicator,
        translateX: x - 22,
        width: Math.max(36, rect.width * 0.72),
        duration: 420,
        easing: 'easeOutExpo'
      });
    } else {
      indicator.style.transform = `translateX(${x - 22}px)`;
      indicator.style.width = `${Math.max(36, rect.width * 0.72)}px`;
    }
  }

  moveTo(active, true);

  links.forEach(link => {
    link.addEventListener('mouseenter', () => moveTo(link));
    link.addEventListener('focus', () => moveTo(link));
  });

  nav.addEventListener('mouseleave', () => moveTo(active));
  window.addEventListener('resize', () => moveTo(active, true), { passive: true });
}

function h31SafeText(value, fallback = '') {
  const text = String(value ?? '').trim();
  return text && text !== '[object Object]' ? text : fallback;
}

function h31RaceName(race = {}) {
  return h31SafeText(race.name || race.raceName || race.grandPrix || race.eventName, 'Next Grand Prix');
}

function h31RaceMeta(race = {}) {
  const circuit = h31SafeText(race.circuit || race.Circuit?.circuitName || race.circuitName, '');
  const location = h31SafeText(race.location || race.locality || race.country || race.Circuit?.Location?.country, '');
  return [circuit, location].filter(Boolean).join(' · ') || 'Live calendar sync';
}

function h31LeaderName(standings = []) {
  const first = Array.isArray(standings) ? standings[0] : null;
  if (!first) return 'Live Standings';
  const driver = first.driver || first.Driver || first;
  const given = h31SafeText(driver.givenName || driver.firstName, '');
  const family = h31SafeText(driver.familyName || driver.lastName, '');
  return h31SafeText(driver.name || driver.fullName || `${given} ${family}`.trim() || first.name, 'Championship Leader');
}

function updateH31RaceControlData() {
  const race = HOME_F1?.nextRace || (Array.isArray(HOME_F1?.schedule) ? HOME_F1.schedule[0] : null) || {};
  const name = h31RaceName(race);
  const meta = h31RaceMeta(race);
  const leader = h31LeaderName(HOME_F1?.standings || []);

  const nameEl = document.getElementById('rc-race-name');
  const metaEl = document.getElementById('rc-race-meta');
  const cdEl = document.getElementById('rc-countdown');
  const leaderEl = document.getElementById('rc-leader');
  const statusEl = document.getElementById('rc-status');

  if (nameEl) nameEl.textContent = name;
  if (metaEl) metaEl.textContent = meta;
  if (leaderEl) leaderEl.textContent = leader;
  if (statusEl) statusEl.textContent = 'Realtime Sync';

  const d = document.getElementById('cd-d')?.textContent || '--';
  const h = document.getElementById('cd-h')?.textContent || '--';
  const m = document.getElementById('cd-m')?.textContent || '--';
  if (cdEl) cdEl.textContent = `${d}D : ${h}H : ${m}M`;
}

function initH31RaceControl() {
  const path = document.getElementById('race-track-path');
  const dot = document.getElementById('race-track-dot');
  const glow = document.getElementById('race-track-dot-glow');

  updateH31RaceControlData();
  setInterval(updateH31RaceControlData, 15000);

  if (!path) return;

  const length = path.getTotalLength();
  path.style.strokeDasharray = length;
  path.style.strokeDashoffset = length;

  if (typeof window.anime === 'function') {
    window.anime({
      targets: path,
      strokeDashoffset: [length, 0],
      duration: 1900,
      easing: 'easeInOutSine',
      delay: 250
    });

    const motion = { progress: 0 };
    window.anime({
      targets: motion,
      progress: [0, 1],
      duration: 6200,
      easing: 'linear',
      loop: true,
      update: () => {
        const point = path.getPointAtLength(motion.progress * length);
        if (dot) {
          dot.setAttribute('cx', point.x);
          dot.setAttribute('cy', point.y);
        }
        if (glow) {
          glow.setAttribute('cx', point.x);
          glow.setAttribute('cy', point.y);
        }
      }
    });

    window.anime({
      targets: '#race-track-dot-glow',
      r: [14, 24],
      opacity: [0.4, 0.9],
      duration: 950,
      direction: 'alternate',
      loop: true,
      easing: 'easeInOutSine'
    });
  } else {
    path.style.strokeDashoffset = 0;
  }
}

function initH31QuoteProgress() {
  const bar = document.getElementById('quote-progress-bar');
  if (!bar) return;

  if (!window.PADDOX_RESTART_QUOTE_PROGRESS) {
    window.PADDOX_RESTART_QUOTE_PROGRESS = function restartQuoteProgressFallback() {
      bar.style.transition = 'none';
      bar.style.width = '0%';
      bar.offsetHeight;
      bar.style.transition = 'width 6500ms linear';
      bar.style.width = '100%';
    };
  }

  window.PADDOX_RESTART_QUOTE_PROGRESS();
}


function initH31WordMotion() {
  if (typeof window.anime !== 'function') return;
  const titles = document.querySelectorAll('.section-title, .grid-strip-title');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      if (el.dataset.h31Animated === '1') return;
      el.dataset.h31Animated = '1';

      window.anime({
        targets: el,
        translateX: [-18, 0],
        opacity: [0.55, 1],
        letterSpacing: ['0.02em', '-0.025em'],
        duration: 820,
        easing: 'easeOutExpo'
      });
      observer.unobserve(el);
    });
  }, { threshold: .4 });

  titles.forEach(el => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initH31SignatureUpgrade, 180);
});


/* ============================================================
   H3.1.1 — Signature Features Visibility Fix
   Creates missing DOM elements if HTML insertion did not land.
   ============================================================ */
function initH311SignatureVisibilityFix() {
  ensureH311NavIndicator();
  ensureH311QuoteProgress();
  ensureH311RaceControlSection();
  setTimeout(() => {
    moveH311NavIndicator();
    initH311TrackAnimation();
    updateH311RaceControlData();
    /* H3.3D.2: old standalone quote progress animation disabled.
       renderHomeQuotes() owns the timer so the bar never reverses or restarts halfway. */
  }, 120);
}

function ensureH311NavIndicator() {
  const nav = document.querySelector('.nav-links');
  if (!nav) return;
  if (!nav.id) nav.id = 'nav-links';

  let indicator = document.getElementById('nav-active-indicator');
  if (!indicator) {
    indicator = document.createElement('span');
    indicator.className = 'nav-active-indicator';
    indicator.id = 'nav-active-indicator';
    indicator.setAttribute('aria-hidden', 'true');
    nav.prepend(indicator);
  }

  nav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('mouseenter', () => moveH311NavIndicator(link));
    link.addEventListener('focus', () => moveH311NavIndicator(link));
  });

  nav.addEventListener('mouseleave', () => moveH311NavIndicator());
  window.addEventListener('resize', () => moveH311NavIndicator(), { passive: true });
}

function moveH311NavIndicator(target) {
  const nav = document.getElementById('nav-links') || document.querySelector('.nav-links');
  const indicator = document.getElementById('nav-active-indicator');
  if (!nav || !indicator) return;

  const active = target || nav.querySelector('.nav-link.active') || nav.querySelector('.nav-link');
  if (!active) return;

  const navRect = nav.getBoundingClientRect();
  const rect = active.getBoundingClientRect();
  const x = rect.left - navRect.left + rect.width / 2 - 23;
  const width = Math.max(38, rect.width * 0.74);

  indicator.style.width = `${width}px`;
  indicator.style.transform = `translateX(${x}px)`;
  indicator.classList.add('is-ready');
}

function ensureH311QuoteProgress() {
  const quote = document.querySelector('.quote-inner');
  if (!quote) return;
  if (document.getElementById('quote-progress-bar')) return;

  const progress = document.createElement('div');
  progress.className = 'quote-progress';
  progress.innerHTML = '<span id="quote-progress-bar"></span>';

  const dots = document.getElementById('quote-dots') || quote.querySelector('.quote-dots');
  if (dots) quote.insertBefore(progress, dots);
  else quote.appendChild(progress);
}

function ensureH311RaceControlSection() {
  if (document.getElementById('race-control-section')) return;

  const section = document.createElement('section');
  section.className = 'race-control-section section';
  section.id = 'race-control-section';
  section.innerHTML = `
    <div class="container">
      <div class="section-head race-control-head">
        <div>
          <span class="section-label">LIVE RACE CONTROL</span>
          <h2 class="section-title">TRACK <span>MODE</span></h2>
        </div>
        <p class="race-control-sub">Realtime next-race pulse, animated circuit path and PADDOX race-week status.</p>
      </div>

      <div class="race-control-panel liquid-sweep">
        <div class="race-track-stage">
          <svg class="race-track-svg" viewBox="0 0 620 360" role="img" aria-label="Animated race circuit">
            <defs>
              <linearGradient id="trackGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#ffffff" stop-opacity="0.88"/>
                <stop offset="45%" stop-color="#e8002d" stop-opacity="0.95"/>
                <stop offset="100%" stop-color="#ffffff" stop-opacity="0.62"/>
              </linearGradient>
            </defs>
            <path id="race-track-path" class="race-track-path" d="M86 214 C88 104 170 62 252 92 C333 121 341 202 419 178 C507 152 558 201 532 263 C506 326 401 313 333 286 C263 258 227 321 151 294 C96 274 78 244 86 214 Z"/>
            <path class="race-track-path ghost" d="M86 214 C88 104 170 62 252 92 C333 121 341 202 419 178 C507 152 558 201 532 263 C506 326 401 313 333 286 C263 258 227 321 151 294 C96 274 78 244 86 214 Z"/>
            <circle id="race-track-dot-glow" class="race-track-dot-glow" r="18" cx="86" cy="214"></circle>
            <circle id="race-track-dot" class="race-track-dot" r="8" cx="86" cy="214"></circle>
          </svg>
          <div class="track-label track-label-start">START</div>
          <div class="track-label track-label-sector">SECTOR</div>
        </div>

        <div class="race-control-info">
          <div class="race-control-kicker">NEXT EVENT</div>
          <h3 id="rc-race-name">Loading Grand Prix</h3>
          <p id="rc-race-meta">Syncing live race calendar...</p>

          <div class="race-control-grid">
            <div>
              <span>Countdown</span>
              <strong id="rc-countdown">-- : -- : --</strong>
            </div>
            <div>
              <span>Leader</span>
              <strong id="rc-leader">Live Standings</strong>
            </div>
            <div>
              <span>Status</span>
              <strong id="rc-status">Race Week Sync</strong>
            </div>
          </div>

          <a href="pitwall.html" class="race-control-cta">Open Pit Wall →</a>
        </div>
      </div>
    </div>
  `;

  const countdown = document.querySelector('.countdown-strip');
  const featured = document.querySelector('#featured, .featured-section, [data-section="featured"]');
  if (countdown && countdown.parentNode) countdown.insertAdjacentElement('afterend', section);
  else if (featured && featured.parentNode) featured.insertAdjacentElement('beforebegin', section);
  else document.body.appendChild(section);
}

function h311SafeText(value, fallback = '') {
  const text = String(value ?? '').trim();
  return text && text !== '[object Object]' ? text : fallback;
}

function h311RaceName(race = {}) {
  return h311SafeText(race.name || race.raceName || race.grandPrix || race.eventName, 'Next Grand Prix');
}

function h311RaceMeta(race = {}) {
  const circuit = h311SafeText(race.circuit || race.Circuit?.circuitName || race.circuitName, '');
  const location = h311SafeText(race.location || race.locality || race.country || race.Circuit?.Location?.country, '');
  return [circuit, location].filter(Boolean).join(' · ') || 'Live calendar sync';
}

function h311LeaderName(standings = []) {
  const first = Array.isArray(standings) ? standings[0] : null;
  if (!first) return 'Live Standings';
  const driver = first.driver || first.Driver || first;
  const given = h311SafeText(driver.givenName || driver.firstName, '');
  const family = h311SafeText(driver.familyName || driver.lastName, '');
  return h311SafeText(driver.name || driver.fullName || `${given} ${family}`.trim() || first.name, 'Championship Leader');
}

function updateH311RaceControlData() {
  const race = window.HOME_F1?.nextRace || (Array.isArray(window.HOME_F1?.schedule) ? window.HOME_F1.schedule[0] : null) || {};
  const nameEl = document.getElementById('rc-race-name');
  const metaEl = document.getElementById('rc-race-meta');
  const cdEl = document.getElementById('rc-countdown');
  const leaderEl = document.getElementById('rc-leader');
  const statusEl = document.getElementById('rc-status');

  if (nameEl) nameEl.textContent = h311RaceName(race);
  if (metaEl) metaEl.textContent = h311RaceMeta(race);
  if (leaderEl) leaderEl.textContent = h311LeaderName(window.HOME_F1?.standings || []);
  if (statusEl) statusEl.textContent = 'Realtime Sync';

  const d = document.getElementById('cd-d')?.textContent || '--';
  const h = document.getElementById('cd-h')?.textContent || '--';
  const m = document.getElementById('cd-m')?.textContent || '--';
  if (cdEl) cdEl.textContent = `${d}D : ${h}H : ${m}M`;
}

function initH311TrackAnimation() {
  const path = document.getElementById('race-track-path');
  const dot = document.getElementById('race-track-dot');
  const glow = document.getElementById('race-track-dot-glow');
  if (!path) return;

  const length = path.getTotalLength();
  path.style.strokeDasharray = length;
  path.style.strokeDashoffset = length;

  if (typeof window.anime === 'function') {
    window.anime({
      targets: path,
      strokeDashoffset: [length, 0],
      duration: 1600,
      easing: 'easeInOutSine'
    });

    const motion = { progress: 0 };
    window.anime({
      targets: motion,
      progress: [0, 1],
      duration: 6200,
      easing: 'linear',
      loop: true,
      update: () => {
        const point = path.getPointAtLength(motion.progress * length);
        if (dot) {
          dot.setAttribute('cx', point.x);
          dot.setAttribute('cy', point.y);
        }
        if (glow) {
          glow.setAttribute('cx', point.x);
          glow.setAttribute('cy', point.y);
        }
      }
    });

    window.anime({
      targets: '#race-track-dot-glow',
      r: [14, 25],
      opacity: [0.35, 0.9],
      duration: 950,
      direction: 'alternate',
      loop: true,
      easing: 'easeInOutSine'
    });
  } else {
    path.style.strokeDashoffset = 0;
  }
}

function initH311QuoteProgressAnimation() {
  /* H3.3D.2: disabled.
     Older H3.1.1 animation used its own 5.4s loop and fought the real quote carousel timer.
     The single source of truth is now renderHomeQuotes() -> restartProgress(). */
  if (typeof window.PADDOX_RESTART_QUOTE_PROGRESS === 'function') {
    window.PADDOX_RESTART_QUOTE_PROGRESS();
  }
}


document.addEventListener('DOMContentLoaded', () => {
  initH311SignatureVisibilityFix();
  setInterval(updateH311RaceControlData, 15000);
});

/* ============================================================
   H3.2A — AI Studio Removal + Premium Interactive Home Shell
   Brand direction: PADDOX = interactive motorsport experience, not AI Studio.
   ============================================================ */
(function initH32AInteractiveHomeShell() {
  const ready = (fn) => {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  };

  ready(() => {
    document.body.classList.add('h32a-home', 'h32a-section-ready');
    removeH32AAIStudioLinks();
    initH32ANavShell();
    initH32AHeroShell();
    initH32AQuoteShell();
    setTimeout(initH32ATrackShell, 420);
    setTimeout(syncH32AHomeState, 760);
    window.addEventListener('resize', h32ADebounce(() => {
      if (typeof moveH311NavIndicator === 'function') moveH311NavIndicator();
    }, 120), { passive: true });
  });

  function removeH32AAIStudioLinks() {
    const selectors = [
      'a[href*="aistudio"]',
      '.nav-ai-icon',
      '.mob-icon.nav-ai-icon'
    ];
    document.querySelectorAll(selectors.join(',')).forEach((el) => {
      const holder = el.closest('li') || el.closest('a') || el;
      holder.remove();
    });

    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.placeholder = 'Search products, drivers, circuits, fan posts…';
  }

  function initH32ANavShell() {
    const navbar = document.getElementById('navbar');
    const nav = document.getElementById('nav-links') || document.querySelector('.nav-links');
    if (navbar) navbar.classList.add('h32a-nav');
    if (!nav) return;

    if (!document.getElementById('nav-active-indicator') && typeof ensureH311NavIndicator === 'function') {
      ensureH311NavIndicator();
    }

    nav.querySelectorAll('.nav-link').forEach((link, index) => {
      link.style.setProperty('--nav-index', String(index));
      link.addEventListener('mouseenter', () => h32AAnimateNavPulse(link), { passive: true });
      link.addEventListener('click', () => h32AAnimateNavPulse(link));
    });

    setTimeout(() => {
      if (typeof moveH311NavIndicator === 'function') moveH311NavIndicator();
    }, 80);
  }

  function h32AAnimateNavPulse(link) {
    if (!link || typeof window.anime !== 'function') return;
    window.anime.remove(link);
    window.anime({
      targets: link,
      scale: [1, 1.045, 1],
      duration: 460,
      easing: 'easeOutElastic(1, .55)'
    });
  }

  function initH32AHeroShell() {
    const hero = document.getElementById('hero');
    if (!hero) return;
    hero.classList.add('h32a-hero');
    ensureH32ARaceRail(hero);
    splitH32ATextWords('.hero-h1 .h1-line, .section-title, .nl-title');
    animateH32AHeroWords();
    initH32APointerSpotlight(hero);
  }

  function ensureH32ARaceRail(hero) {
    if (document.getElementById('h32a-race-rail')) return;
    const rail = document.createElement('aside');
    rail.className = 'h32a-race-rail';
    rail.id = 'h32a-race-rail';
    rail.setAttribute('aria-hidden', 'true');
    rail.innerHTML = `
      <div class="h32a-rail-line">
        <span class="h32a-rail-dot"></span>
      </div>
      <p class="h32a-rail-caption">Interactive circuit pulse, live countdown and fan energy synced across the PADDOX experience.</p>
    `;
    hero.appendChild(rail);
  }

  function splitH32ATextWords(selector) {
    document.querySelectorAll(selector).forEach((el) => {
      if (!el || el.dataset.h32Split === '1') return;
      const children = Array.from(el.childNodes);
      const rebuilt = [];

      children.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const parts = node.textContent.split(/(\s+)/);
          parts.forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) rebuilt.push(document.createTextNode(part));
            else {
              const span = document.createElement('span');
              span.className = 'h32-word';
              span.textContent = part;
              rebuilt.push(span);
            }
          });
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          node.classList.add('h32-word');
          rebuilt.push(node);
        }
      });

      el.replaceChildren(...rebuilt);
      el.dataset.h32Split = '1';
    });
  }

  function animateH32AHeroWords() {
    const words = document.querySelectorAll('.hero-h1 .h32-word');
    if (!words.length) return;

    if (typeof window.anime === 'function') {
      window.anime.set(words, { opacity: 0, translateY: 55, rotateX: -24, filter: 'blur(10px)' });
      window.anime({
        targets: words,
        opacity: [0, 1],
        translateY: [55, 0],
        rotateX: [-24, 0],
        filter: ['blur(10px)', 'blur(0px)'],
        delay: window.anime.stagger(105, { start: 220 }),
        duration: 820,
        easing: 'easeOutExpo'
      });
    } else {
      words.forEach((word, i) => {
        word.style.animation = `fadeUp .75s ${i * 0.08}s forwards`;
      });
    }
  }

  function initH32APointerSpotlight(hero) {
    const railLine = document.querySelector('.h32a-rail-line');
    hero.addEventListener('pointermove', (event) => {
      const rect = hero.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      hero.style.setProperty('--hero-x', `${x}%`);
      hero.style.setProperty('--hero-y', `${y}%`);
      if (railLine) {
        railLine.style.setProperty('--mx', `${Math.max(8, Math.min(92, x))}%`);
        railLine.style.setProperty('--my', `${Math.max(8, Math.min(92, y))}%`);
      }
    }, { passive: true });
  }

  function initH32AQuoteShell() {
    const quoteSection = document.getElementById('quote-section') || document.querySelector('.quote-section');
    const quoteCard = document.querySelector('.quote-inner');
    if (quoteSection) quoteSection.classList.add('h32a-quotes');
    if (!quoteCard || quoteCard.querySelector('.h32a-quote-lottie')) return;

    const deco = document.createElement('div');
    deco.className = 'h32a-quote-lottie';
    deco.setAttribute('aria-hidden', 'true');
    deco.dataset.lottieSource = 'https://lottiefiles.com/free-animation/slideshow-FOHpasQNWU';
    deco.innerHTML = `
      <span class="h32a-slide-pill"></span>
      <span class="h32a-slide-pill"></span>
      <span class="h32a-slide-pill"></span>
      <span class="h32a-slide-pill"></span>
    `;
    quoteCard.prepend(deco);

    const bar = document.getElementById('quote-progress-bar');
    if (bar) bar.style.width = '0%';
  }

  function initH32ATrackShell() {
    const section = document.getElementById('race-control-section');
    if (!section) {
      if (typeof ensureH311RaceControlSection === 'function') ensureH311RaceControlSection();
    }

    const trackSection = document.getElementById('race-control-section');
    if (!trackSection) return;
    trackSection.classList.add('h32a-track-mode');

    const title = trackSection.querySelector('.section-title');
    if (title && !title.dataset.h32TrackTitle) {
      title.innerHTML = 'TRACK <span class="accent">MODE</span>';
      title.dataset.h32TrackTitle = '1';
    }

    const sub = trackSection.querySelector('.race-control-sub');
    if (sub) sub.textContent = 'Real circuit-style motion foundation for PADDOX: SVG route, animated race pulse, countdown sync and live Pit Wall bridge.';

    ensureH32ATrackChips(trackSection);
    ensureH32ACarMarker();
    initH32ATrackAnimation();
    syncH32AHomeState();
  }

  function ensureH32ATrackChips(trackSection) {
    const info = trackSection.querySelector('.race-control-info');
    if (!info || info.querySelector('.h32a-track-chip-row')) return;
    const row = document.createElement('div');
    row.className = 'h32a-track-chip-row';
    row.innerHTML = `
      <span class="h32a-track-chip">SVG Circuit</span>
      <span class="h32a-track-chip">Anime Motion</span>
      <span class="h32a-track-chip">Live Sync Ready</span>
    `;
    const grid = info.querySelector('.race-control-grid');
    if (grid) info.insertBefore(row, grid);
    else info.appendChild(row);
  }

  function ensureH32ACarMarker() {
    const svg = document.querySelector('.race-track-svg');
    const path = document.getElementById('race-track-path');
    if (!svg || !path || document.getElementById('h32a-car-marker')) return;

    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    marker.setAttribute('id', 'h32a-car-marker');
    marker.setAttribute('class', 'h32a-car-marker');
    marker.innerHTML = `
      <path d="M-17 -7 L12 -5 L22 0 L12 5 L-17 7 L-10 0 Z" fill="#e8002d" stroke="rgba(255,255,255,.78)" stroke-width="1.4"></path>
      <circle cx="-8" cy="7" r="2.5" fill="#050505"></circle>
      <circle cx="8" cy="5" r="2.5" fill="#050505"></circle>
    `;
    svg.appendChild(marker);
  }

  function initH32ATrackAnimation() {
    const path = document.getElementById('race-track-path');
    const dot = document.getElementById('race-track-dot');
    const glow = document.getElementById('race-track-dot-glow');
    const car = document.getElementById('h32a-car-marker');
    if (!path) return;

    const len = path.getTotalLength();
    if (!Number.isFinite(len) || len <= 0) return;

    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = len;

    const setAt = (progress) => {
      const point = path.getPointAtLength(progress * len);
      const ahead = path.getPointAtLength(Math.min(len, progress * len + 3));
      const angle = Math.atan2(ahead.y - point.y, ahead.x - point.x) * 180 / Math.PI;
      if (dot) {
        dot.setAttribute('cx', point.x);
        dot.setAttribute('cy', point.y);
      }
      if (glow) {
        glow.setAttribute('cx', point.x);
        glow.setAttribute('cy', point.y);
      }
      if (car) car.setAttribute('transform', `translate(${point.x} ${point.y}) rotate(${angle})`);
    };

    setAt(0);

    if (typeof window.anime === 'function') {
      window.anime.remove(path);
      window.anime({ targets: path, strokeDashoffset: [len, 0], duration: 1900, easing: 'easeInOutSine' });
      const motion = { progress: 0 };
      window.anime({
        targets: motion,
        progress: [0, 1],
        duration: 7200,
        easing: 'linear',
        loop: true,
        update: () => setAt(motion.progress)
      });
      window.anime({
        targets: '#h32a-car-marker',
        scale: [0.92, 1.06],
        duration: 780,
        direction: 'alternate',
        loop: true,
        easing: 'easeInOutSine'
      });
    } else {
      path.style.strokeDashoffset = 0;
    }
  }

  function syncH32AHomeState() {
    try {
      if (typeof HOME_F1 !== 'undefined') window.HOME_F1 = HOME_F1;
      if (typeof updateH311RaceControlData === 'function') updateH311RaceControlData();
    } catch (err) {
      console.warn('H3.2A home state sync skipped', err);
    }
  }

  function h32ADebounce(fn, wait) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), wait);
    };
  }
})();

/* H3.2A — keep legacy Track Mode bridge synced with loaded HOME_F1 state */
setInterval(() => {
  try {
    if (typeof HOME_F1 !== 'undefined') window.HOME_F1 = HOME_F1;
    if (typeof updateH311RaceControlData === 'function') updateH311RaceControlData();
  } catch (_) {}
}, 10000);

/* ============================================================
   PADDOX H3.2A.1 — Visual Balance Runtime Fix
   Removes the floating hero rail and protects quote readability.
   ============================================================ */
(function initH32A1VisualBalanceFix(){
  'use strict';

  function removeUnwantedRail(){
    document.querySelectorAll('.h32a-race-rail').forEach((rail) => rail.remove());
  }

  function lockQuoteReadability(){
    const quote = document.getElementById('quote-text');
    const name = document.getElementById('quote-name');
    const team = document.getElementById('quote-team');
    if (quote && (!quote.textContent || !quote.textContent.trim())) {
      quote.textContent = 'The paddock is not just a place. It is a feeling built by fans.';
    }
    if (name && (!name.textContent || !name.textContent.trim())) name.textContent = 'PADDOX';
    if (team && (!team.textContent || !team.textContent.trim())) team.textContent = 'Fan Quote Library';
  }

  function tuneAfterRender(){
    removeUnwantedRail();
    lockQuoteReadability();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tuneAfterRender);
  } else {
    tuneAfterRender();
  }

  window.addEventListener('load', tuneAfterRender);
  setTimeout(tuneAfterRender, 450);
  setTimeout(tuneAfterRender, 1400);
})();


/* ============================================================
   PADDOX H3.2A.2 — Runtime Polish 01
   Locks navbar to clean active-tab behavior and keeps hero/newsletter text balanced.
   ============================================================ */
(function initH32A2SectionPolish(){
  'use strict';

  function removeFloatingNavIndicator(){
    document.querySelectorAll('#nav-active-indicator, .nav-active-indicator').forEach((el) => el.remove());
  }

  function lockHeroRaceAccent(){
    document.querySelectorAll('.hero-h1 .h1-accent').forEach((el) => {
      el.textContent = el.textContent.trim();
      el.style.color = 'var(--red)';
      el.style.background = 'none';
    });
  }

  function alignNewsletterTitle(){
    const title = document.querySelector('.nl-title');
    if (!title || title.dataset.h32a2Aligned === '1') return;
    if (!title.querySelector('.nl-title-main')) {
      title.innerHTML = '<span class="nl-title-main">JOIN THE PADDO<span class="logo-x">X</span></span><span class="nl-title-sub">CREW</span>';
    }
    title.dataset.h32a2Aligned = '1';
  }

  function run(){
    removeFloatingNavIndicator();
    lockHeroRaceAccent();
    alignNewsletterTitle();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();

  window.addEventListener('load', run);
  setTimeout(run, 250);
  setTimeout(run, 900);
  setTimeout(run, 1800);
})();


/* ============================================================
   PADDOX H3.2A.3 — HARD VISIBLE RUNTIME GUARD
   Removes legacy nav indicator and forces hero/newsletter structure after all old scripts.
   ============================================================ */
(function initH32A3HardVisibleGuard(){
  'use strict';
  function run(){
    document.querySelectorAll('#nav-active-indicator, .nav-active-indicator').forEach(el => el.remove());
    document.querySelectorAll('a[href*="aistudio"]').forEach(el => {
      const li = el.closest('li');
      if (li) li.remove();
      else el.remove();
    });
    const h1 = document.querySelector('.hero-h1');
    if (h1 && h1.dataset.h32a3 !== '1') {
      h1.innerHTML = '<span class="h1-line animate-fade-up delay-2">LIVE</span><span class="h1-line animate-fade-up delay-3">THE</span><span class="h1-line h1-race-line animate-fade-up delay-4"><span class="h1-accent">RACE</span></span>';
      h1.dataset.h32a3 = '1';
    }
    const title = document.querySelector('.nl-title');
    if (title && title.dataset.h32a3 !== '1') {
      title.innerHTML = '<span class="nl-title-main">JOIN THE PADDO<span class="logo-x">X</span></span><span class="nl-title-sub">CREW</span>';
      title.dataset.h32a3 = '1';
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
  window.addEventListener('load', run);
  [50, 250, 700, 1500, 3000].forEach(ms => setTimeout(run, ms));
})();


/* ============================================================
   PADDOX H3.2C — Track Mode Real SVG Motion Foundation
   Keeps backend data intact; upgrades the visual circuit module only.
   ============================================================ */
(function initH32CTrackModeFoundation(){
  'use strict';

  const CIRCUITS = [
    {
      key: 'monaco',
      short: 'MON',
      name: 'Monaco Grand Prix',
      circuit: 'Circuit de Monaco',
      country: 'Monte Carlo',
      length: '3.337 KM',
      path: 'M86 214 C88 104 170 62 252 92 C333 121 341 202 419 178 C507 152 558 201 532 263 C506 326 401 313 333 286 C263 258 227 321 151 294 C96 274 78 244 86 214 Z',
      sectors: ['S1 Casino', 'S2 Tunnel', 'S3 Portier']
    },
    {
      key: 'silverstone',
      short: 'SIL',
      name: 'British Grand Prix',
      circuit: 'Silverstone Circuit',
      country: 'United Kingdom',
      length: '5.891 KM',
      path: 'M92 224 C126 112 237 86 329 121 C389 144 438 94 512 118 C573 138 564 207 502 219 C426 234 422 314 338 300 C269 288 253 226 187 259 C134 285 74 273 92 224 Z',
      sectors: ['S1 Abbey', 'S2 Maggots', 'S3 Hangar']
    },
    {
      key: 'suzuka',
      short: 'SUZ',
      name: 'Japanese Grand Prix',
      circuit: 'Suzuka Circuit',
      country: 'Japan',
      length: '5.807 KM',
      path: 'M74 227 C117 124 198 95 282 126 C362 156 388 237 468 209 C540 184 589 225 553 280 C518 333 419 306 350 274 C279 240 237 317 155 301 C94 289 51 269 74 227 Z M256 127 C224 178 245 222 307 230 C363 237 389 201 420 178',
      sectors: ['S1 Esses', 'S2 Degner', 'S3 130R']
    },
    {
      key: 'spa',
      short: 'SPA',
      name: 'Belgian Grand Prix',
      circuit: 'Spa-Francorchamps',
      country: 'Belgium',
      length: '7.004 KM',
      path: 'M78 249 C115 111 257 64 348 110 C425 149 418 229 509 210 C578 196 584 282 516 309 C445 338 390 284 328 311 C264 339 241 270 181 284 C121 297 62 306 78 249 Z',
      sectors: ['S1 Eau Rouge', 'S2 Pouhon', 'S3 Blanchimont']
    }
  ];

  let activeIndex = 0;
  let animationFrame = null;
  let startTime = 0;

  function safeText(value, fallback){
    const txt = String(value || '').trim();
    return txt || fallback || '';
  }

  function raceFromBackend(){
    try {
      const race = window.HOME_F1?.nextRace || HOME_F1?.nextRace || null;
      if (race) return race;
      const schedule = window.HOME_F1?.schedule || HOME_F1?.schedule || [];
      return Array.isArray(schedule) ? schedule[0] : null;
    } catch (err) { return null; }
  }

  function ensureSection(){
    if (!document.getElementById('race-control-section') && typeof window.ensureH311RaceControlSection === 'function') {
      window.ensureH311RaceControlSection();
    } else if (!document.getElementById('race-control-section') && typeof ensureH311RaceControlSection === 'function') {
      ensureH311RaceControlSection();
    }
    const section = document.getElementById('race-control-section');
    if (!section) return null;
    section.classList.add('h32c-track-foundation');
    section.classList.remove('h32a-track-mode');
    return section;
  }

  function ensureSvgDefs(svg){
    if (!svg) return;
    let defs = svg.querySelector('defs');
    if (!defs) {
      defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      svg.prepend(defs);
    }
    if (!svg.querySelector('#h32cTrackGlow')) {
      const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
      filter.setAttribute('id', 'h32cTrackGlow');
      filter.setAttribute('x', '-60%');
      filter.setAttribute('y', '-60%');
      filter.setAttribute('width', '220%');
      filter.setAttribute('height', '220%');
      filter.innerHTML = '<feGaussianBlur stdDeviation="4" result="blur"></feGaussianBlur><feMerge><feMergeNode in="blur"></feMergeNode><feMergeNode in="SourceGraphic"></feMergeNode></feMerge>';
      defs.appendChild(filter);
    }
  }

  function ensureCarMarker(svg){
    let car = document.getElementById('h32a-car-marker') || document.getElementById('h32c-car-marker');
    if (!svg || car) {
      if (car) {
        car.id = 'h32c-car-marker';
        car.classList.add('h32c-car-marker');
      }
      return car;
    }
    car = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    car.setAttribute('id', 'h32c-car-marker');
    car.setAttribute('class', 'h32c-car-marker');
    car.innerHTML = '<path d="M-18 -7 L12 -5 L24 0 L12 5 L-18 7 L-10 0 Z" fill="#e8002d" stroke="rgba(255,255,255,.82)" stroke-width="1.45"></path><circle cx="-8" cy="7" r="2.5" fill="#050505"></circle><circle cx="8" cy="5" r="2.5" fill="#050505"></circle>';
    svg.appendChild(car);
    return car;
  }

  function ensureSelectors(stage){
    if (!stage || stage.querySelector('.h32c-track-selectors')) return;
    const selectors = document.createElement('div');
    selectors.className = 'h32c-track-selectors';
    selectors.innerHTML = CIRCUITS.map((c, index) => `<button type="button" class="h32c-track-btn${index === activeIndex ? ' is-active' : ''}" data-track-index="${index}">${c.short} · ${c.circuit.split(' ')[0]}</button>`).join('');
    selectors.addEventListener('click', (event) => {
      const btn = event.target.closest('.h32c-track-btn');
      if (!btn) return;
      activeIndex = Number(btn.dataset.trackIndex || 0);
      selectors.querySelectorAll('.h32c-track-btn').forEach(el => el.classList.toggle('is-active', el === btn));
      applyCircuit(true);
    });
    stage.appendChild(selectors);
  }

  function ensureSectorStack(stage){
    if (!stage || stage.querySelector('.h32c-sector-stack')) return;
    const stack = document.createElement('div');
    stack.className = 'h32c-sector-stack';
    stage.appendChild(stack);
  }

  function ensureReadout(info){
    if (!info || info.querySelector('.h32c-motion-readout')) return;
    const readout = document.createElement('div');
    readout.className = 'h32c-motion-readout';
    readout.innerHTML = '<div class="h32c-readout-top"><span>Motion Path</span><strong id="h32c-motion-percent">00%</strong></div><div class="h32c-progress-rail"><span class="h32c-progress-fill" id="h32c-progress-fill"></span></div>';
    const grid = info.querySelector('.race-control-grid');
    if (grid) info.insertBefore(readout, grid);
    else info.appendChild(readout);
  }

  function syncInfo(circuit){
    const backendRace = raceFromBackend();
    const backendName = backendRace ? safeText(backendRace.name || backendRace.raceName || backendRace.grandPrix || backendRace.eventName, '') : '';
    const nameEl = document.getElementById('rc-race-name');
    const metaEl = document.getElementById('rc-race-meta');
    const statusEl = document.getElementById('rc-status');
    if (nameEl) nameEl.textContent = backendName && activeIndex === 0 ? backendName : circuit.name;
    if (metaEl) metaEl.textContent = `${circuit.circuit} · ${circuit.country} · ${circuit.length}`;
    if (statusEl) statusEl.textContent = backendRace ? 'Backend Synced' : 'Visual Foundation';
    const kicker = document.querySelector('.race-control-kicker');
    if (kicker) kicker.textContent = 'REAL SVG TRACK MODE';
  }

  function applyCircuit(restart){
    const circuit = CIRCUITS[activeIndex] || CIRCUITS[0];
    const path = document.getElementById('race-track-path');
    const ghost = document.querySelector('.race-track-path.ghost');
    const stage = document.querySelector('.race-track-stage');
    if (path) path.setAttribute('d', circuit.path);
    if (ghost) ghost.setAttribute('d', circuit.path);
    const sectorStack = stage?.querySelector('.h32c-sector-stack');
    if (sectorStack) {
      sectorStack.innerHTML = circuit.sectors.map((item, index) => `<span class="h32c-sector-pill"><strong>S${index + 1}</strong>${item.replace(/^S\d+\s*/, '')}</span>`).join('');
    }
    document.querySelectorAll('.track-label-start').forEach(el => { el.textContent = 'START / FINISH'; });
    document.querySelectorAll('.track-label-sector').forEach(el => { el.textContent = circuit.short; });
    syncInfo(circuit);
    if (restart) startTrackLoop(true);
  }

  function startTrackLoop(force){
    const path = document.getElementById('race-track-path');
    const dot = document.getElementById('race-track-dot');
    const glow = document.getElementById('race-track-dot-glow');
    const car = document.getElementById('h32c-car-marker') || document.getElementById('h32a-car-marker');
    if (!path) return;
    if (animationFrame) cancelAnimationFrame(animationFrame);
    if (window.__PADDOX_H32C_RAF) cancelAnimationFrame(window.__PADDOX_H32C_RAF);
    if (typeof window.anime === 'function') {
      try { window.anime.remove(path); window.anime.remove(dot); window.anime.remove(glow); window.anime.remove(car); } catch (err) {}
    }
    let len = 0;
    try { len = path.getTotalLength(); } catch (err) { len = 0; }
    if (!len) return;
    path.style.strokeDasharray = String(len);
    startTime = performance.now();
    const fill = document.getElementById('h32c-progress-fill');
    const percent = document.getElementById('h32c-motion-percent');
    const speed = force ? 9800 : 11200;

    function tick(now){
      const raw = ((now - startTime) % speed) / speed;
      const eased = raw < .5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2;
      let point, ahead;
      try {
        point = path.getPointAtLength(eased * len);
        ahead = path.getPointAtLength(Math.min(len, eased * len + 5));
      } catch (err) { return; }
      const angle = Math.atan2(ahead.y - point.y, ahead.x - point.x) * 180 / Math.PI;
      path.style.strokeDashoffset = String(len - eased * len);
      if (dot) { dot.setAttribute('cx', point.x); dot.setAttribute('cy', point.y); }
      if (glow) { glow.setAttribute('cx', point.x); glow.setAttribute('cy', point.y); }
      if (car) car.setAttribute('transform', `translate(${point.x} ${point.y}) rotate(${angle})`);
      const pct = Math.round(raw * 100);
      if (fill) fill.style.width = `${pct}%`;
      if (percent) percent.textContent = `${String(pct).padStart(2, '0')}%`;
      animationFrame = requestAnimationFrame(tick);
      window.__PADDOX_H32C_RAF = animationFrame;
    }
    animationFrame = requestAnimationFrame(tick);
    window.__PADDOX_H32C_RAF = animationFrame;
  }

  function boot(){
    const section = ensureSection();
    if (!section) return;
    const svg = section.querySelector('.race-track-svg');
    const stage = section.querySelector('.race-track-stage');
    const info = section.querySelector('.race-control-info');
    ensureSvgDefs(svg);
    ensureCarMarker(svg);
    ensureSelectors(stage);
    ensureSectorStack(stage);
    ensureReadout(info);
    applyCircuit(false);
    startTrackLoop(false);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  window.addEventListener('load', boot);
  [350, 1200, 2600].forEach(ms => setTimeout(boot, ms));
})();



/* ============================================================
   PADDOX H3.4C.4 — Strict Verified FastF1 Circuit Map Helpers
   Rule: never guess by country. Exact race/circuit identity first.
   Madrid/Madring is marked pending because no historical FastF1 telemetry exists yet.
   ============================================================ */
function pdxH34cText(value, fallback = '') {
  const text = String(value ?? '').trim();
  return text && text !== '[object Object]' ? text : fallback;
}
function pdxH34cEsc(value = '') {
  return String(value ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
function pdxH34cClean(value = '') {
  return String(value || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/grand prix|\bgp\b|circuit|autodromo|autodrome|international|street|de |of the|the/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}
function pdxH34cTracks() { return window.paddoxTracks || window.PADDOX_TRACKS || {}; }
function pdxH34cTrackByKey(key = '') {
  const tracks = pdxH34cTracks();
  return tracks[key] || null;
}
const PDX_H34C_VERIFIED_2026_ROUND_TRACKS = {
  1:'albert_park', 2:'shanghai', 3:'suzuka', 4:'miami', 5:'gilles_villeneuve', 6:'monaco',
  7:'barcelona_catalunya', 8:'red_bull_ring', 9:'silverstone', 10:'spa', 11:'hungaroring',
  12:'zandvoort', 13:'monza', 14:'madrid_madring', 15:'baku', 16:'marina_bay',
  17:'cota', 18:'mexico_city', 19:'interlagos', 20:'las_vegas', 21:'lusail', 22:'yas_marina'
};
const PDX_H34C_STRICT_ALIAS_TRACKS = [
  ['albert_park', ['australian albert park melbourne','australian melbourne','albert park','melbourne australia']],
  ['shanghai', ['chinese shanghai','shanghai china','shanghai']],
  ['suzuka', ['japanese suzuka','suzuka japan','suzuka']],
  ['miami', ['miami international autodrome','miami united states','miami']],
  ['gilles_villeneuve', ['canadian gilles villeneuve','circuit gilles villeneuve','montreal canada','canadian montreal','villeneuve']],
  ['monaco', ['monaco monte carlo','circuit monaco','monaco']],
  ['barcelona_catalunya', ['barcelona catalunya','barcelona catalunya spain','catalunya','montmelo','montmelo spain','barcelona grand prix']],
  ['red_bull_ring', ['austrian red bull ring','red bull ring','spielberg austria','austrian spielberg']],
  ['silverstone', ['british silverstone','silverstone great britain','silverstone united kingdom','silverstone']],
  ['spa', ['belgian spa francorchamps','spa francorchamps','francorchamps belgium','spa belgium']],
  ['hungaroring', ['hungarian hungaroring','hungaroring hungary','budapest hungary','hungaroring']],
  ['zandvoort', ['dutch zandvoort','zandvoort netherlands','zandvoort']],
  ['monza', ['italian monza','autodromo nazionale monza','monza italy','monza']],
  ['baku', ['azerbaijan baku','baku city','baku azerbaijan','baku']],
  ['marina_bay', ['singapore marina bay','marina bay singapore','marina bay']],
  ['cota', ['united states circuit americas','united states austin','circuit americas austin','cota','austin united states']],
  ['mexico_city', ['mexico city hermanos rodriguez','autodromo hermanos rodriguez','hermanos rodriguez','mexico city mexico']],
  ['interlagos', ['brazilian interlagos','sao paulo interlagos','jose carlos pace','interlagos','sao paulo brazil']],
  ['las_vegas', ['las vegas strip','las vegas united states','vegas strip','las vegas']],
  ['lusail', ['qatar lusail','qatar losail','lusail qatar','losail qatar','lusail']],
  ['yas_marina', ['abu dhabi yas marina','yas marina abu dhabi','yas marina united arab emirates','yas marina']]
];
function pdxH34cContainsAllWords(haystack, alias) {
  const hay = pdxH34cClean(haystack);
  const words = pdxH34cClean(alias).split(' ').filter(Boolean);
  if (!hay || !words.length) return false;
  return words.every(word => hay.includes(word));
}
function pdxH34cSourceText(source = {}) {
  return [source?.name, source?.raceName, source?.grandPrix, source?.eventName,
    source?.circuit, source?.circuitName, source?.Circuit?.circuitName,
    source?.location, source?.locality, source?.Circuit?.Location?.locality,
    source?.country, source?.Circuit?.Location?.country].filter(Boolean).join(' ');
}
function pdxH34cIsMadrid(source = {}) {
  const hay = pdxH34cClean(pdxH34cSourceText(source));
  return hay.includes('madrid') || hay.includes('madring');
}
function pdxH34cMatchTrack(source = {}, index = -1) {
  const tracks = pdxH34cTracks();
  const sourceText = pdxH34cSourceText(source);
  if (pdxH34cIsMadrid(source)) return null;
  for (const [key, aliases] of PDX_H34C_STRICT_ALIAS_TRACKS) {
    if (!tracks[key]) continue;
    if (aliases.some(alias => pdxH34cContainsAllWords(sourceText, alias))) return tracks[key];
  }
  const raceHay = pdxH34cClean(sourceText);
  const metadataMatch = Object.values(tracks).find(track => {
    const tokens = [track.id, track.circuitName, track.raceName, track.location]
      .map(v => pdxH34cClean(v)).filter(v => v && v.length >= 5);
    return tokens.some(t => raceHay && (raceHay.includes(t) || t.includes(raceHay)));
  });
  if (metadataMatch) return metadataMatch;
  const roundValue = Number(source?.round || source?.raceRound || source?.Round || 0) || (index >= 0 ? index + 1 : 0);
  const key = roundValue ? PDX_H34C_VERIFIED_2026_ROUND_TRACKS[roundValue] : '';
  if (key === 'madrid_madring') return null;
  if (key && tracks[key]) return tracks[key];
  return null;
}
function pdxH34cSectorSVG(track, mode = 'mini') {
  if (!track) return '<div class="h34c-track-missing">Madring map pending<br><small>No FastF1 telemetry yet</small></div>';
  const viewBox = pdxH34cEsc(track.viewBox || '0 0 300 180');
  const basePath = pdxH34cEsc(mode === 'mini' ? (track.miniPath || track.detailedPath) : (track.detailedPath || track.miniPath));
  const motionPath = pdxH34cEsc(track.detailedPath || track.miniPath || '');
  const sectors = Array.isArray(track.sectorPaths) ? track.sectorPaths : [];
  const sectorMarkup = sectors.map((sector, index) => {
    const label = pdxH34cEsc(String(sector.label || `S${index + 1}`).toUpperCase());
    const cls = label.toLowerCase();
    const delay = 120 + index * 170;
    return `<path class="pdx-fastf1-sector pdx-fastf1-${cls}" data-sector="${label}" style="--pdx-sector-delay:${delay}ms" d="${pdxH34cEsc(sector.path || '')}"></path>`;
  }).join('');
  const labels = mode === 'large' ? sectors.map((sector, index) => {
    const label = pdxH34cEsc(String(sector.label || `S${index + 1}`).toUpperCase());
    const point = track.sectors?.[index] || sector.end || sector.start || {};
    return `<text class="pdx-fastf1-label pdx-fastf1-${label.toLowerCase()}" x="${Number(point.x || 0)}" y="${Number(point.y || 0)}" fill="${pdxH34cEsc(sector.color || '#fff')}">${label}</text>`;
  }).join('') : '';
  const sf = track.startFinish || {};
  const sx = Number(sf.x || 0), sy = Number(sf.y || 0);
  const dotR = mode === 'large' ? 3.9 : 3.1;
  return `<svg class="pdx-fastf1-track-svg pdx-fastf1-${mode}" viewBox="${viewBox}" role="img" aria-label="${pdxH34cEsc(track.circuitName || track.raceName || 'Circuit map')}">
    <title>${pdxH34cEsc(track.circuitName || track.raceName || track.id)}</title>
    <path class="pdx-fastf1-shadow" d="${basePath}"></path>
    <path class="pdx-fastf1-glow" d="${basePath}"></path>
    <path class="pdx-fastf1-base" d="${basePath}"></path>
    ${sectorMarkup}
    <circle class="pdx-fastf1-start" cx="${sx}" cy="${sy}" r="${mode === 'large' ? 4.2 : 3.2}"></circle>
    <circle class="pdx-fastf1-dot" r="${dotR}"><animateMotion dur="${mode === 'large' ? 9 : 7}s" repeatCount="indefinite" path="${motionPath}"></animateMotion></circle>
    ${labels}
  </svg>`;
}


/* ============================================================
   Phase H3.4C.4 — Home Track Mode FastF1 True Sector Map
   Replaces Formula Timer images with Python/FastF1 generated SVG.
   ============================================================ */
(function initH34C1HomeFastF1TrackMode(){
  'use strict';
  let lastRenderKey = '';
  function getRace(){
    try {
      const race = window.HOME_F1?.nextRace || HOME_F1?.nextRace || null;
      if (race) return race;
      const schedule = mergeHomeScheduleWithOfficial(window.HOME_F1?.schedule || HOME_F1?.schedule || []);
      if (Array.isArray(schedule) && schedule.length) {
        const now = Date.now();
        return schedule.find(r => new Date(`${r.date || r.raceDate || ''}T${r.time || '13:00:00Z'}`).getTime() >= now) || schedule[0];
      }
    } catch (err) {}
    const name = document.querySelector('.cs-name')?.textContent || '';
    const circuit = document.querySelector('.cs-circuit')?.textContent || '';
    return { name, circuit, location: circuit };
  }
  function raceDate(race){
    const raw = race?.date || race?.raceDate || race?.startDate || '';
    if (!raw) return null;
    const d = new Date(`${raw}${String(raw).includes('T') ? '' : `T${race?.time || '13:00:00Z'}`}`);
    return Number.isFinite(d.getTime()) ? d : null;
  }
  function countdownText(race){
    const d = raceDate(race);
    if (!d) {
      const dd = document.getElementById('cd-d')?.textContent || '--';
      const hh = document.getElementById('cd-h')?.textContent || '--';
      const mm = document.getElementById('cd-m')?.textContent || '--';
      return `${dd}D · ${hh}H · ${mm}M`;
    }
    const diff = Math.max(0, d.getTime() - Date.now());
    const days = Math.floor(diff / 864e5);
    const hours = Math.floor((diff % 864e5) / 36e5);
    const mins = Math.floor((diff % 36e5) / 6e4);
    return `${String(days).padStart(2,'0')}D · ${String(hours).padStart(2,'0')}H · ${String(mins).padStart(2,'0')}M`;
  }
  function formatDate(race){
    const d = raceDate(race);
    if (!d) return 'Race date syncing';
    return d.toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });
  }
  function splitRaceName(name){
    const value = pdxH34cText(name, 'Next Grand Prix');
    const parts = value.replace(/Grand Prix/i, '').trim();
    return parts ? `${pdxH34cEsc(parts)} <span class="accent">GRAND PRIX</span>` : pdxH34cEsc(value);
  }
  function ensureSection(){
    let section = document.getElementById('race-control-section');
    if (!section) {
      section = document.createElement('section');
      section.id = 'race-control-section';
      section.className = 'race-control-section section';
      const countdown = document.querySelector('.countdown-strip');
      const featured = document.querySelector('#featured, .featured-section');
      if (countdown) countdown.insertAdjacentElement('afterend', section);
      else if (featured) featured.insertAdjacentElement('beforebegin', section);
      else document.body.appendChild(section);
    }
    return section;
  }
  function premiumCircuitAccent(track){
    const sectors = Array.isArray(track?.sectorPaths) ? track.sectorPaths : [];
    if (!sectors.length) return '';
    return `<div class="h34d2-sector-legend" aria-label="Circuit sector legend">
      <span><i style="background:#e10600"></i>Sector 1</span>
      <span><i style="background:#00d2ff"></i>Sector 2</span>
      <span><i style="background:#ffd400"></i>Sector 3</span>
    </div>`;
  }
  function render(){
    if (window.__PADDOX_H32C_RAF) { cancelAnimationFrame(window.__PADDOX_H32C_RAF); window.__PADDOX_H32C_RAF = null; }
    const race = getRace() || {};
    const track = pdxH34cMatchTrack(race, 0);
    const section = ensureSection();
    const raceName = pdxH34cText(race.name || race.raceName || race.grandPrix || race.eventName || track?.raceName, track?.raceName || 'Next Grand Prix');
    const circuitLabel = pdxH34cText(race.circuit || race.circuitName || track?.circuitName, track?.circuitName || 'Circuit map');
    const location = [race.location || race.locality || track?.location, race.country || track?.country].filter(Boolean).join(' · ') || circuitLabel;
    const round = pdxH34cText(race.round, '—');
    const season = pdxH34cText(race.season, new Date().getFullYear());
    section.className = 'race-control-section section h34c-fastf1-track h34d2-track-polish';
    section.innerHTML = `
      <div class="container">
        <div class="section-head race-control-head h34d2-head">
          <div class="reveal-up in-view">
            <div class="section-label">LIVE RACE CONTROL</div>
            <h2 class="section-title">TRACK <span class="accent">MODE</span></h2>
          </div>
          <p class="race-control-sub reveal-up in-view">Premium circuit view synced with the next-race countdown.</p>
        </div>
        <div class="h34c-fastf1-panel h34d2-panel liquid-sweep">
          <div class="h34c-fastf1-stage h34d2-stage">
            <div class="h34c-fastf1-frame h34d2-frame" id="h34c-fastf1-frame">
              ${pdxH34cSectorSVG(track, 'large')}
              ${premiumCircuitAccent(track)}
            </div>
          </div>
          <div class="h34c-fastf1-info h34d2-info">
            <div class="h34c-kicker h34d2-kicker">NEXT CIRCUIT</div>
            <h3 id="rc-race-name">${splitRaceName(raceName)}</h3>
            <p id="rc-race-meta">${pdxH34cEsc(circuitLabel)} · ${pdxH34cEsc(location)}</p>
            <div class="h34d2-countdown-card">
              <span>Race starts in</span>
              <strong id="h34c-track-countdown">${pdxH34cEsc(countdownText(race))}</strong>
            </div>
            <div class="h34c-chip-row h34d2-chip-row">
              <span class="h34c-chip">Round ${pdxH34cEsc(round)}</span>
              <span class="h34c-chip">Season ${pdxH34cEsc(season)}</span>
              <span class="h34c-chip">Live Countdown</span>
            </div>
            <div class="h33b-data-grid h34d2-data-grid">
              <div class="h33b-data-row"><span>Circuit</span><strong>${pdxH34cEsc(circuitLabel)}</strong></div>
              <div class="h33b-data-row"><span>Date</span><strong>${pdxH34cEsc(formatDate(race))}</strong></div>
              <div class="h33b-data-row"><span>Location</span><strong>${pdxH34cEsc(location)}</strong></div>
            </div>
            <a href="fanhub.html" class="h34c-track-cta h34d2-track-cta">View Race Calendar →</a>
          </div>
        </div>
      </div>`;
  }
  function refreshCountdownOnly(){
    const race = getRace() || {};
    const el = document.getElementById('h34c-track-countdown');
    if (el) el.textContent = countdownText(race);
  }
  function boot(){
    try {
      const race = getRace() || {};
      const track = pdxH34cMatchTrack(race, 0);
      const key = [race.name || race.raceName, race.date || race.raceDate, track?.id].join('|');
      if (key && key === lastRenderKey && document.querySelector('#h34c-fastf1-frame .pdx-fastf1-track-svg')) return;
      lastRenderKey = key;
      render();
    } catch (err) { console.warn('H3.4C.4 FastF1 Track Mode failed', err); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  window.addEventListener('load', boot);
  [900, 2200, 4200].forEach(ms => setTimeout(boot, ms));
  setInterval(refreshCountdownOnly, 1000);
  async function refreshTrackRaceSource(){
    try {
      if (window.PaddoxAPI?.f1?.schedule) {
        const scheduleData = await window.PaddoxAPI.f1.schedule();
        const list = extractRaceList(scheduleData || {});
        if (Array.isArray(list) && list.length) { HOME_F1.schedule = list; window.HOME_F1 = HOME_F1; }
      }
      if (window.PaddoxAPI?.f1?.nextRace) {
        const nextData = await window.PaddoxAPI.f1.nextRace();
        const next = nextData?.data?.race || nextData?.data || nextData?.race || null;
        if (next && typeof next === 'object') { HOME_F1.nextRace = next; window.HOME_F1 = HOME_F1; }
      }
      lastRenderKey = '';
      boot();
    } catch (err) { console.warn('FastF1 Track Mode auto refresh skipped', err); }
  }
  setInterval(refreshTrackRaceSource, 10 * 60 * 1000);
})();


/* Phase H3.3C: Featured Merch + Teams Strip visual polish uses CSS-only overrides; backend data flow preserved. */


/* Phase H3.3D: Quote Section Premium Polish Lock */
(function initH33DQuotePolish(){
  function boot(){
    const section = document.getElementById('quote-section');
    const card = document.querySelector('.quote-inner');
    if (!section || !card) return;
    section.classList.add('h33d-quotes');
    card.classList.add('h33d-quote-card');

    const label = card.querySelector('.quote-kicker-label') || card.querySelector('.section-label');
    if (label && label.textContent.trim().toLowerCase().includes('driver')) {
      label.textContent = 'Fan Voice Radio';
    }

    if (!card.querySelector('.quote-card-topline')) {
      const top = document.createElement('div');
      top.className = 'quote-card-topline';
      top.setAttribute('aria-hidden', 'true');
      top.innerHTML = '<span>Live Fan Quote</span><span>PADDOX Signal</span>';
      card.prepend(top);
    }

    const progress = document.querySelector('.quote-progress');
    const dots = document.getElementById('quote-dots');
    if (progress && dots && progress.nextElementSibling !== dots) {
      dots.parentNode.insertBefore(progress, dots);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  window.addEventListener('load', boot);
  setTimeout(boot, 1000);
})();


/* Phase H3.3D.1: Quote carousel line timer is now synchronized with card auto-advance. */


/* Phase H3.3D.2 — Quote Timer Direction Fix
   Keeps quote progress one-way left-to-right and prevents older timer loops from fighting it. */
(function initH33D2QuoteTimerGuard(){
  window.PADDOX_QUOTE_TIMER_OWNER = 'renderHomeQuotes';
})();

/* Phase H3.3D.3 — Quote Timer Completion Fix
   The quote card now advances only after the visible progress line has been started and completed. */


/* ============================================================
   Phase H3.3E.3 — PADDOX Race Lab three-feature lock
   Keeps Fantasy Race Prediction, Badge Vault and My Race Passport.
   Driver Mood Match removed from the brand flow.
   ============================================================ */
(function initPaddoxRaceLab(){
  const STORE_KEY = 'paddox_race_lab_v1';

  function readState(){
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || '{}') || {}; }
    catch (err) { return {}; }
  }
  function writeState(state){
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (err) {}
  }
  function nextRaceName(){
    const cs = document.querySelector('.cs-name');
    const txt = cs?.textContent?.trim();
    if (txt && !/loading|unavailable|fetching/i.test(txt)) return txt;
    const race = window.HOME_F1?.nextRace || window.HOME_F1?.schedule?.find?.(r => new Date(`${r.date || r.raceDate || ''}T${r.time || '13:00:00Z'}`) >= new Date());
    return race?.name || race?.raceName || 'Next Grand Prix';
  }
  function raceCode(name){
    const words = String(name || 'GP').replace(/grand prix|gp/ig,'').trim().split(/\s+/).filter(Boolean);
    return (words[0] || 'GP').slice(0,3).toUpperCase();
  }
  function setActiveButtons(container, value, attr){
    container?.querySelectorAll('button').forEach(btn => btn.classList.toggle('on', btn.dataset[attr] === value));
  }
  function updateBadges(state){
    const stamps = Array.isArray(state.stamps) ? state.stamps : [];
    const flags = {
      prediction: !!state.prediction,
      passport: stamps.length > 0,
      season: stamps.length >= 24
    };
    let count = 0;
    document.querySelectorAll('.vault-badge').forEach(badge => {
      const on = !!flags[badge.dataset.badge];
      badge.classList.toggle('unlocked', on);
      if (on) count += 1;
    });
    const status = document.getElementById('badge-status');
    if (status) {
      const suffix = stamps.length >= 24 ? 'Season complete' : stamps.length > 0 ? `${stamps.length} race stamp${stamps.length === 1 ? '' : 's'} saved` : 'Start with a prediction or race stamp';
      status.textContent = `${count} / 3 badges active · ${suffix}`;
    }
  }
  function updatePassport(state){
    const race = nextRaceName();
    const code = raceCode(race);
    const codeEl = document.getElementById('passport-stamp-code');
    const nameEl = document.getElementById('passport-stamp-name');
    const nextEl = document.getElementById('lab-next-race');
    const fill = document.getElementById('passport-progress-fill');
    if (codeEl) codeEl.textContent = code;
    if (nameEl) nameEl.textContent = `${race} stamp`;
    if (nextEl) nextEl.textContent = race;
    const stamps = Array.isArray(state.stamps) ? state.stamps : [];
    if (fill) fill.style.width = `${Math.min(100, Math.round((stamps.length / 24) * 100))}%`;
    const label = document.getElementById('passport-progress-label');
    if (label) label.textContent = `${Math.min(24, stamps.length)} / 24`;
    const claim = document.getElementById('passport-claim-btn');
    if (claim) claim.textContent = stamps.includes(race) ? 'Stamp Claimed' : 'Claim Stamp';
  }
  function render(){
    const state = readState();
    const predictionStatus = document.getElementById('prediction-status');
    if (predictionStatus) {
      predictionStatus.textContent = state.prediction
        ? `${state.prediction} saved for ${state.predictionRace || nextRaceName()}.`
        : 'No prediction locked yet.';
    }
    setActiveButtons(document.getElementById('prediction-picks'), state.prediction || '', 'pick');
    updatePassport(state);
    updateBadges(state);
  }
  function boot(){
    const root = document.getElementById('paddox-race-lab');
    if (!root || root.dataset.ready === '1') { render(); return; }
    root.dataset.ready = '1';

    document.getElementById('prediction-picks')?.addEventListener('click', e => {
      const btn = e.target.closest('button[data-pick]');
      if (!btn) return;
      const state = readState();
      state.prediction = btn.dataset.pick;
      state.predictionRace = nextRaceName();
      writeState(state);
      render();
      if (typeof showToast === 'function') showToast('Race prediction saved');
    });

    document.getElementById('passport-claim-btn')?.addEventListener('click', () => {
      const state = readState();
      const race = nextRaceName();
      state.stamps = Array.isArray(state.stamps) ? state.stamps : [];
      if (!state.stamps.includes(race)) state.stamps.push(race);
      writeState(state);
      render();
      if (typeof showToast === 'function') showToast('Race passport stamp claimed');
    });
    render();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  window.addEventListener('load', boot);
  [900, 2400, 5000].forEach(ms => setTimeout(render, ms));
})();


/* PADDOX H4.0.4: visual-only package; realtime logic preserved from H4.0.3. */
