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
          <h3>No live fan activity yet</h3>
          <p>Real Fan Hub posts, leaderboard users and fan-point activity will appear here automatically once fans start using PADDOX.</p>
          <a href="fanhub.html" class="empty-cta">Open Fan Hub →</a>
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
    const nextRaceSchedule = extractRaceList(data || {});
    if (nextRaceSchedule.length) {
      HOME_F1.schedule = nextRaceSchedule;
      updateHomeSeasonRaceCount(nextRaceSchedule);
    } else if (data.data?.seasonRaceCount || data.data?.totalRaces || race.totalRaces || race.seasonRaceCount) {
      updateHomeSeasonRaceCount(Array.from({ length: Number(data.data?.seasonRaceCount || data.data?.totalRaces || race.totalRaces || race.seasonRaceCount) }, (_, i) => ({ round: i + 1 })));
    }

    if (flagEl) {
      flagEl.title = race.country || race.name || 'Next Grand Prix';
      flagEl.setAttribute('aria-label', race.country || 'Grand Prix');
      setCountdownFlag(flagEl, race);
    }
    updateTickerFromAPI();
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
    if (flagEl) {
      flagEl.title = 'Grand Prix';
      flagEl.setAttribute('aria-label', 'Grand Prix');
      setCountdownFlag(flagEl, {});
    }
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

  const hoverSelectors = 'a, button, .pcard, .exp-card, .testi-card, .marquee-strip, .quote-inner';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(hoverSelectors)) cursor.classList.add('is-hovering');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(hoverSelectors)) cursor.classList.remove('is-hovering');
  });

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
  const card = document.querySelector('.quote-inner');
  if (!bar || !card) return;

  function animateBar() {
    if (typeof window.anime === 'function') {
      window.anime.remove(bar);
      window.anime({
        targets: bar,
        width: ['0%', '100%'],
        duration: 5200,
        easing: 'linear'
      });
    } else {
      bar.style.width = '100%';
    }
  }

  animateBar();
  setInterval(() => {
    card.classList.add('h3-quote-changing');
    setTimeout(() => card.classList.remove('h3-quote-changing'), 520);
    animateBar();
  }, 5400);
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
    initH311QuoteProgressAnimation();
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
  const bar = document.getElementById('quote-progress-bar');
  if (!bar) return;

  function run() {
    if (typeof window.anime === 'function') {
      window.anime.remove(bar);
      window.anime({
        targets: bar,
        width: ['0%', '100%'],
        duration: 5200,
        easing: 'linear'
      });
    } else {
      bar.style.transition = 'width 5.2s linear';
      bar.style.width = '100%';
    }
  }

  run();
  setInterval(run, 5400);
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
   PADDOX H3.2B — Hero + Countdown Premium Realtime Polish
   Uses existing backend-fed state: products, fan data, F1 schedule/standings.
   ============================================================ */
(function initH32BHeroCountdownPolish() {
  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
    else fn();
  }

  ready(() => {
    document.body.classList.add('h32b-home');
    stampH32BRealtimePills();
    initH32BHeroPointer();
    initH32BCountdownTickPulse();
    initH32BRealtimeRefreshBridge();
    setTimeout(syncH32BRealtimeHero, 700);
    setTimeout(syncH32BRealtimeHero, 1800);
    setTimeout(syncH32BRealtimeHero, 3600);
  });

  function stampH32BRealtimePills() {
    const ticker = document.querySelector('.hero-ticker');
    if (ticker && !ticker.querySelector('.h32b-sync-pill')) {
      const pill = document.createElement('span');
      pill.className = 'h32b-sync-pill';
      pill.textContent = 'Backend Live';
      ticker.appendChild(pill);
    }

    const csLabel = document.querySelector('.cs-label');
    if (csLabel && !csLabel.querySelector('.h32b-sync-pill')) {
      const pill = document.createElement('span');
      pill.className = 'h32b-sync-pill';
      pill.textContent = 'Realtime';
      csLabel.appendChild(pill);
    }
  }

  function initH32BHeroPointer() {
    const hero = document.getElementById('hero');
    if (!hero || hero.dataset.h32bPointer === '1') return;
    hero.dataset.h32bPointer = '1';
    hero.addEventListener('pointermove', (event) => {
      const rect = hero.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / Math.max(rect.width, 1)) * 100;
      const y = ((event.clientY - rect.top) / Math.max(rect.height, 1)) * 100;
      hero.style.setProperty('--hero-x', `${Math.max(0, Math.min(100, x))}%`);
      hero.style.setProperty('--hero-y', `${Math.max(0, Math.min(100, y))}%`);
    }, { passive: true });
  }

  function textValue(value, fallback = 'Loading') {
    if (typeof safeText === 'function') return safeText(value, fallback);
    const text = String(value ?? '').trim();
    return text || fallback;
  }

  function htmlEscape(value = '') {
    if (typeof escapeHTML === 'function') return escapeHTML(value);
    return String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  }

  function raceName(race = {}) {
    return textValue(race.name || race.raceName || race.grandPrix || race.roundName, 'Next Grand Prix');
  }

  function raceMeta(race = {}) {
    return [race.circuit || race.Circuit?.circuitName, race.country || race.location || race.Circuit?.Location?.country]
      .map(x => textValue(x, ''))
      .filter(Boolean)
      .join(' · ') || 'Live Formula 1 schedule';
  }

  function syncH32BRealtimeHero() {
    try {
      const grid = document.getElementById('hero-live-grid');
      if (!grid) return;
      const state = (typeof HOME_REALTIME_STATE !== 'undefined') ? HOME_REALTIME_STATE : {};
      const f1 = (typeof HOME_F1 !== 'undefined') ? HOME_F1 : {};
      const products = (typeof PRODUCTS !== 'undefined' && Array.isArray(PRODUCTS)) ? PRODUCTS : [];
      const nextRace = f1.nextRace || {};
      const standings = Array.isArray(f1.standings) ? f1.standings : [];
      const schedule = Array.isArray(f1.schedule) ? f1.schedule : [];
      const raceCount = typeof validRaceCount === 'function' ? validRaceCount(schedule) : schedule.length;
      const leader = (typeof bestLeaderName === 'function') ? bestLeaderName() : 'Live Standings';
      const drop = products[0]?.name || (state.productCount ? `${state.productCount} Products` : 'Shop Live');
      const fanLine = state.fanCount ? `${state.fanCount} fans` : 'Community sync';

      grid.innerHTML = `
        <div class="hero-live-card"><span>Next Race</span><strong>${htmlEscape(raceName(nextRace))}</strong><small>${htmlEscape(raceMeta(nextRace))}</small></div>
        <div class="hero-live-card"><span>Season Sync</span><strong>${htmlEscape(raceCount ? `${raceCount} Rounds` : 'Schedule Live')}</strong><small>${htmlEscape(leader && leader !== 'Loading' ? `Leader: ${leader}` : 'Driver standings')}</small></div>
        <div class="hero-live-card"><span>PADDOX Live</span><strong>${htmlEscape(drop)}</strong><small>${htmlEscape(fanLine)}</small></div>
      `;

      const ticker = document.getElementById('ticker-text');
      if (ticker && (!ticker.textContent || ticker.textContent.includes('loading') || ticker.textContent.includes('Loading'))) {
        ticker.textContent = nextRace && (nextRace.name || nextRace.raceName)
          ? `Next race: ${raceName(nextRace)} · ${raceMeta(nextRace)}`
          : 'PADDOX backend live sync active';
      }
    } catch (err) {
      console.warn('H3.2B realtime hero sync skipped', err);
    }
  }

  function initH32BCountdownTickPulse() {
    const ids = ['cd-d','cd-h','cd-m','cd-s'];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (!el || el.dataset.h32bObserved === '1') return;
      el.dataset.h32bObserved = '1';
      let last = el.textContent;
      const observer = new MutationObserver(() => {
        const current = el.textContent;
        if (current === last) return;
        last = current;
        const block = el.closest('.cd-block');
        if (!block) return;
        block.classList.remove('is-ticking');
        void block.offsetWidth;
        block.classList.add('is-ticking');
        setTimeout(() => block.classList.remove('is-ticking'), 480);
      });
      observer.observe(el, { childList: true, characterData: true, subtree: true });
    });
  }

  function initH32BRealtimeRefreshBridge() {
    if (window.__h32bRefreshBridge) return;
    window.__h32bRefreshBridge = true;
    const originalRenderHero = window.renderHeroLiveCards;
    // Function declarations in this file are not always window properties in strict mode,
    // so use safe interval sync instead of replacing existing logic.
    setInterval(syncH32BRealtimeHero, 8000);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) setTimeout(syncH32BRealtimeHero, 400);
    });
  }
})();
