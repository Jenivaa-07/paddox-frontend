/* ============================================================
   PADDOX — fanhub.js   |   Digital Fan Hub Logic
   ============================================================ */
'use strict';
console.log('PADDOX Phase 18.2.7 driver stats repair + final polish loaded');

/* Phase 18.0.1 — PADDOX brand lockup used by quotes/share cards. */
const PADDOX_BRAND_LOCKUP = 'assets/paddox-logo-lockup-quote-clean.png?v=18_3_1';
const PADDOX_BRAND_ICON = 'assets/paddox-logo-icon-official.png?v=18_2_3';

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
    if (flagEl) flagEl.innerHTML = raceFlagHTML(race, 'cs-flag-img');

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
        <div class="fh-empty-mark fh-mark-loading"></div>
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
          <div class="rc-flag">${raceFlagHTML(r)}</div>
          <div class="rc-round">Round ${r.round}</div>
          <div class="rc-name">${r.name}</div>
          <div class="rc-circuit">${r.circuit} · ${r.location}</div>
          <div class="rc-date">${new Date(r.date).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}</div>
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
const FAN_DRIVER_PROFILE_API =
  'https://paddox-backend.onrender.com/api/fan/driver-profiles';

function teamEmojiFromName(name = '') {
  return '';
}


function teamColorFromName(name = '') {
  const n = String(name || '').toLowerCase();
  if (n.includes('red bull')) return '#1e5bff';
  if (n.includes('ferrari')) return '#e8002d';
  if (n.includes('mclaren')) return '#ff8700';
  if (n.includes('mercedes')) return '#00d2be';
  if (n.includes('aston')) return '#006f62';
  if (n.includes('alpine')) return '#2293d1';
  if (n.includes('williams')) return '#64c4ff';
  if (n.includes('haas')) return '#ffffff';
  if (n.includes('racing bulls') || n.includes('rb')) return '#6c4cff';
  if (n.includes('sauber') || n.includes('kick') || n.includes('audi')) return '#00e701';
  if (n.includes('cadillac')) return '#d4af37';
  return '#e8002d';
}

const NATIONALITY_FLAGS = {
  dutch:'nl', british:'gb', english:'gb',
  monégasque:'mc', monegasque:'mc',
  australian:'au', spanish:'es', mexican:'mx',
  canadian:'ca', french:'fr', german:'de',
  italian:'it', japanese:'jp', thai:'th',
  danish:'dk', finnish:'fi', chinese:'cn',
  brazilian:'br', american:'us', argentine:'ar',
  newzealander:'nz', 'new zealander':'nz'
};

function flagFromNationality(value = '') {
  const key = String(value || '').toLowerCase().trim();
  return NATIONALITY_FLAGS[key] || '';
}

/* Phase 17 — FlagCDN helpers: match Home page flag image method */
const FAN_FLAG_CODES = {
  australia:'au', australian:'au', melbourne:'au', 'albert park':'au', au:'au',
  china:'cn', chinese:'cn', shanghai:'cn', cn:'cn',
  japan:'jp', japanese:'jp', suzuka:'jp', jp:'jp',
  usa:'us', us:'us', america:'us', american:'us', miami:'us', lasvegas:'us', 'las vegas':'us', austin:'us', unitedstates:'us', 'united states':'us',
  canada:'ca', canadian:'ca', montreal:'ca', ca:'ca',
  monaco:'mc', monégasque:'mc', monegasque:'mc', montecarlo:'mc', 'monte carlo':'mc', mc:'mc',
  spain:'es', spanish:'es', barcelona:'es', es:'es',
  austria:'at', austrian:'at', spielberg:'at', at:'at',
  britain:'gb', british:'gb', english:'gb', silverstone:'gb', uk:'gb', 'united kingdom':'gb', gb:'gb',
  italy:'it', italian:'it', imola:'it', monza:'it', 'emilia romagna':'it', it:'it',
  netherlands:'nl', dutch:'nl', zandvoort:'nl', nl:'nl',
  germany:'de', german:'de', de:'de',
  france:'fr', french:'fr', fr:'fr',
  brazil:'br', brazilian:'br', sao:'br', 'são paulo':'br', 'sao paulo':'br', br:'br',
  mexico:'mx', mexican:'mx', mx:'mx',
  belgium:'be', belgian:'be', spa:'be', be:'be',
  hungary:'hu', hungarian:'hu', hungaroring:'hu', hu:'hu',
  singapore:'sg', sg:'sg',
  qatar:'qa', qa:'qa',
  bahrain:'bh', bh:'bh',
  saudi:'sa', 'saudi arabia':'sa', jeddah:'sa', sa:'sa',
  abu:'ae', 'abu dhabi':'ae', uae:'ae', 'united arab emirates':'ae', ae:'ae',
  thailand:'th', thai:'th', th:'th', denmark:'dk', danish:'dk', dk:'dk',
  finland:'fi', finnish:'fi', fi:'fi', argentina:'ar', argentine:'ar', argentinian:'ar', ar:'ar',
  newzealand:'nz', 'new zealand':'nz', newzealander:'nz', nz:'nz'
};

function fanFlagKey(value = '') {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function flagCodeFromText(value = '') {
  const key = fanFlagKey(value);
  if (!key) return '';
  if (FAN_FLAG_CODES[key]) return FAN_FLAG_CODES[key];
  const compact = key.replace(/\s+/g, '');
  if (FAN_FLAG_CODES[compact]) return FAN_FLAG_CODES[compact];
  for (const [name, code] of Object.entries(FAN_FLAG_CODES)) {
    const n = fanFlagKey(name);
    if (key.includes(n) || n.includes(key) || compact.includes(n.replace(/\s+/g, ''))) return code;
  }
  return '';
}

function flagCodeFromRace(race = {}) {
  const fields = [race.country, race.location, race.locality, race.name, race.raceName, race.circuit, race.flagCode, race.flag];
  for (const field of fields) {
    const code = flagCodeFromText(field);
    if (code) return code;
  }
  return '';
}

function flagCodeFromNationality(value = '') {
  return flagCodeFromText(value);
}

function fanFlagImgHTML(code = '', label = 'flag', className = 'fan-flag-img') {
  const cleanCode = String(code || '').toLowerCase().replace(/[^a-z]/g, '');
  const cleanLabel = String(label || 'flag').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  if (!cleanCode) return `<span class="fan-flag-fallback">F1</span>`;
  return `<img class="${className}" src="https://flagcdn.com/w80/${cleanCode}.png" srcset="https://flagcdn.com/w40/${cleanCode}.png 1x, https://flagcdn.com/w80/${cleanCode}.png 2x" alt="${cleanLabel} flag" loading="lazy" referrerpolicy="no-referrer" onerror="this.outerHTML='<span class=&quot;fan-flag-fallback&quot;>F1</span>'">`;
}

function driverFlagHTML(driver = {}, className = 'driver-flag-img') {
  const code = driver.flagCode || flagCodeFromNationality(driver.nationality || driver.country || driver.flag || '');
  return fanFlagImgHTML(code, driver.nationality || driver.country || driver.name || 'Driver', className);
}

function raceFlagHTML(race = {}, className = 'race-flag-img') {
  const code = race.flagCode || flagCodeFromRace(race);
  return fanFlagImgHTML(code, race.country || race.location || race.name || 'Race', className);
}

function bestString(value, keys = []) {
  if (!value) return '';
  if (typeof value === 'string') {
    if (value === '[object Object]' || value.toLowerCase() === 'object') return '';
    return value;
  }
  if (typeof value === 'number') return String(value);

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = bestString(item, keys);
      if (found) return found;
    }
    return '';
  }

  if (typeof value === 'object') {
    for (const key of keys) {
      const found = bestString(value[key], keys);
      if (found) return found;
    }
    for (const child of Object.values(value)) {
      const found = bestString(child, keys);
      if (found) return found;
    }
  }
  return '';
}

function extractTeamName(raw = {}) {
  return (
    bestString(raw.team, ['name','constructorName','teamName','fullName']) ||
    bestString(raw.constructor, ['name','constructorName','teamName','fullName']) ||
    bestString(raw.Constructors, ['name','constructorName','teamName','fullName']) ||
    bestString(raw.Constructor, ['name','constructorName','teamName','fullName']) ||
    bestString(raw.teamName, ['name','constructorName','teamName','fullName']) ||
    'Team TBA'
  );
}

function normalizeDriverName(driver = {}) {
  return (
    bestString(driver.fullName) ||
    bestString(driver.name) ||
    `${bestString(driver.givenName || driver.firstName)} ${bestString(driver.familyName || driver.lastName)}`.trim() ||
    bestString(driver.driverId) ||
    'F1 Driver'
  );
}

function normalizeDriverCode(driver = {}, name = '') {
  const code = bestString(driver.code) || bestString(driver.abbreviation);
  if (code) return code.toUpperCase();
  return name.split(' ').filter(Boolean).map(part => part[0]).join('').slice(0, 3).toUpperCase();
}

function extractDriverImage(driver = {}, raw = {}) {
  return (
    bestString(driver.image) || bestString(driver.imageUrl) ||
    bestString(driver.headshot) || bestString(driver.headshotUrl) ||
    bestString(driver.profileImage) || bestString(driver.photo) ||
    bestString(raw.image) || bestString(raw.imageUrl) ||
    bestString(raw.headshot) || bestString(raw.profileImage) || ''
  );
}

function makeDriverKey(name = '', code = '') {
  return String(code || name || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function driverInitials(name = '') {
  return name.split(' ').filter(Boolean).map(part => part[0]).slice(0, 2).join('').toUpperCase() || 'F1';
}


/* Home strip team-logo reuse for Fan Hub driver cards */
let FAN_HOME_STRIP_LOGOS = [];
let FAN_HOME_STRIP_LOGOS_READY = false;

function normalizeLogoKey(value = '') {
  return String(value || '')
    .toLowerCase()
    .replace(/f1\s*team|formula\s*1|scuderia|oracle|bwt|petronas|amg|racing|team/g, '')
    .replace(/[^a-z0-9]+/g, '')
    .trim();
}

async function loadFanHomeStripLogos() {
  if (FAN_HOME_STRIP_LOGOS_READY) return FAN_HOME_STRIP_LOGOS;
  FAN_HOME_STRIP_LOGOS_READY = true;
  try {
    const res = await fetch('https://paddox-backend.onrender.com/api/fan/home-marquee-logos');
    const data = await res.json().catch(() => ({}));
    const list = data?.data?.logos || data?.logos || data?.data || [];
    FAN_HOME_STRIP_LOGOS = (Array.isArray(list) ? list : [])
      .filter(item => item && item.name && item.image && item.isActive !== false)
      .map(item => ({
        name: String(item.name || ''),
        key: normalizeLogoKey(item.slug || item.name),
        image: String(item.image || ''),
        color: String(item.color || '#e8002d')
      }));
  } catch (err) {
    console.warn('Fan Hub home-strip logos unavailable', err);
    FAN_HOME_STRIP_LOGOS = [];
  }
  return FAN_HOME_STRIP_LOGOS;
}

function findTeamStripLogo(teamName = '') {
  const key = normalizeLogoKey(teamName);
  if (!key || !FAN_HOME_STRIP_LOGOS.length) return null;
  return FAN_HOME_STRIP_LOGOS.find(item => {
    const logoKey = normalizeLogoKey(item.name || item.key);
    return key.includes(logoKey) || logoKey.includes(key);
  }) || null;
}

function fanTeamLogoHTML(teamName = '', extraClass = '') {
  const item = findTeamStripLogo(teamName);
  if (!item?.image) return '';
  return `<span class="fan-team-logo ${extraClass}"><img src="${safeText(item.image)}" alt="${safeText(item.name || teamName)} logo" loading="lazy" referrerpolicy="no-referrer" onerror="this.closest('.fan-team-logo')?.remove()"></span>`;
}

function driverAvatarHTML(driver, size = 'small') {
  const image = driver.image || '';
  if (image && (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('data:image/'))) {
    return `<img src="${image}" alt="${driver.name}" class="drv-img-${size}" onerror="this.outerHTML='<span class=&quot;drv-initials&quot;>${driverInitials(driver.name)}</span>'"/>`;
  }
  return `<span class="drv-initials">${driverInitials(driver.name)}</span>`;
}

function isLikelyReserveOrPracticeDriver(raw = {}) {
  const text = JSON.stringify(raw || {}).toLowerCase();
  return text.includes('reserve') || text.includes('third driver') || text.includes('test driver') || text.includes('practice driver') || text.includes('fp1') || text.includes('free practice');
}

function normalizeGridDriver(raw = {}, standingsMap = new Map()) {
  const driver = raw.driver || raw.Driver || raw;
  const name = normalizeDriverName(driver);
  const code = normalizeDriverCode(driver, name);
  const teamName = extractTeamName(raw);
  const standing =
    standingsMap.get(String(driver.driverId || '').toLowerCase()) ||
    standingsMap.get(name.toLowerCase()) ||
    standingsMap.get(code.toLowerCase()) ||
    raw;

  const position = Number(standing.position || standing.positionText || raw.position || 0) || 0;
  const points = Number(standing.points || raw.points || 0) || 0;
  const wins = Number(standing.wins || raw.wins || 0) || 0;
  const nationality = bestString(driver.nationality || raw.nationality, ['name']) || '';

  return {
    id: bestString(driver.driverId) || bestString(driver._id) || name,
    name,
    code,
    number: bestString(driver.permanentNumber) || bestString(driver.number) || bestString(raw.number) || bestString(raw.permanentNumber) || '',
    nationality,
    flag: bestString(driver.flag || raw.flag) || flagFromNationality(nationality),
    flagCode: flagCodeFromNationality(nationality) || flagCodeFromText(bestString(driver.flag || raw.flag)),
    team: teamName,
    teamEmoji: teamEmojiFromName(teamName),
    teamColor: teamColorFromName(teamName),
    position,
    points,
    wins,
    image: extractDriverImage(driver, raw),
    isRaceDriver: !!position || raw.isRaceDriver === true || raw.role === 'race' || raw.type === 'race',
    isReserve: isLikelyReserveOrPracticeDriver(raw),
    raw
  };
}

function buildStandingsMap(standings = []) {
  const map = new Map();
  standings.forEach(item => {
    const driver = item.driver || item.Driver || item;
    const name = normalizeDriverName(driver);
    const code = normalizeDriverCode(driver, name);
    if (driver.driverId) map.set(String(driver.driverId).toLowerCase(), item);
    if (name) map.set(name.toLowerCase(), item);
    if (code) map.set(code.toLowerCase(), item);
  });
  return map;
}

function uniqueDriversByName(drivers = []) {
  const seen = new Set();
  return drivers.filter(driver => {
    const key = `${driver.name}-${driver.team}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function cleanRaceDriverList(drivers = []) {
  let list = drivers
    .filter(driver => driver.name && driver.name !== 'F1 Driver')
    .filter(driver => !driver.isReserve)
    .filter(driver => driver.team && driver.team !== 'Team TBA');

  const withStanding = list.filter(driver => Number(driver.position || 0) > 0);
  if (withStanding.length >= 20) list = withStanding;

  list = uniqueDriversByName(list);

  list.sort((a, b) => {
    if (a.position && b.position) return a.position - b.position;
    if (a.position) return -1;
    if (b.position) return 1;
    return b.points - a.points;
  });

  return list;
}

async function loadDriverProfileOverrides() {
  try {
    const res = await fetch(FAN_DRIVER_PROFILE_API);
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) return new Map();

    const profiles = data.data?.profiles || data.profiles || [];
    const map = new Map();

    profiles.forEach(profile => {
      const keys = [
        profile.driverKey,
        makeDriverKey(profile.name, profile.code),
        String(profile.code || '').toLowerCase(),
        String(profile.name || '').toLowerCase()
      ].filter(Boolean);

      keys.forEach(key => map.set(key, profile));
    });

    return map;
  } catch (err) {
    console.warn('Driver profile overrides unavailable', err);
    return new Map();
  }
}

function applyDriverProfileOverrides(drivers, profiles) {
  return drivers.map(driver => {
    const profile =
      profiles.get(makeDriverKey(driver.name, driver.code)) ||
      profiles.get(String(driver.code || '').toLowerCase()) ||
      profiles.get(String(driver.name || '').toLowerCase());

    if (!profile) return driver;

    return {
      ...driver,
      image: profile.image || driver.image,
      flag: profile.flagEmoji || driver.flag,
      nationality: profile.country || driver.nationality,
      flagCode: flagCodeFromNationality(profile.country || driver.nationality) || driver.flagCode,
      team: profile.team || driver.team
    };
  });
}

async function getRealtimeDriverGrid() {
  const standingsRes = await PaddoxAPI.f1.driverStands().catch(() => null);
  const standings = standingsRes?.data?.standings || standingsRes?.standings || [];
  const standingsMap = buildStandingsMap(standings);

  let drivers = Array.isArray(standings) && standings.length
    ? standings.map(raw => normalizeGridDriver(raw, standingsMap))
    : [];

  const driversRes = await PaddoxAPI.f1.drivers().catch(() => null);
  const rawDrivers = driversRes?.data?.drivers || driversRes?.drivers || driversRes?.data || [];

  if (!drivers.length && Array.isArray(rawDrivers) && rawDrivers.length) {
    drivers = rawDrivers.map(raw => normalizeGridDriver(raw, standingsMap));
  }

  if (drivers.length && Array.isArray(rawDrivers) && rawDrivers.length) {
    const detailMap = new Map();
    rawDrivers.forEach(raw => {
      const d = normalizeGridDriver(raw, standingsMap);
      detailMap.set(d.name.toLowerCase(), d);
      detailMap.set(d.code.toLowerCase(), d);
    });

    drivers = drivers.map(driver => {
      const details = detailMap.get(driver.name.toLowerCase()) || detailMap.get(driver.code.toLowerCase());
      return {
        ...driver,
        image: details?.image || driver.image,
        number: driver.number || details?.number,
        nationality: driver.nationality || details?.nationality,
        flag: driver.flag || details?.flag
      };
    });
  }

  drivers = cleanRaceDriverList(drivers);
  const profiles = await loadDriverProfileOverrides();
  drivers = applyDriverProfileOverrides(drivers, profiles);

  return cleanRaceDriverList(drivers);
}

/* ── Load real full driver grid ── */
async function loadRealDriverStandings() {
  const sel  = document.getElementById('drv-selector');
  const card = document.getElementById('drv-card');
  const bars = document.getElementById('stat-bars');
  const cmp  = document.getElementById('cmp-grid');
  const countEl = document.getElementById('driver-grid-count');
  const sourceEl = document.getElementById('driver-grid-source');

  if (!sel) return;

  try {
    sel.innerHTML = `<div class="drv-loading">Loading current race-driver grid...</div>`;

    const drivers = await getRealtimeDriverGrid();
    if (!drivers.length) throw new Error('No live race drivers returned');
    await loadFanHomeStripLogos();

    REAL_DRIVER_GRID_CACHE = drivers;

    const teamCount = new Set(drivers.map(driver => driver.team)).size;

    if (countEl) countEl.textContent = `${drivers.length} race drivers • ${teamCount} teams`;
    if (sourceEl) {
      sourceEl.textContent = '';
      sourceEl.style.display = 'none';
    }

    function renderDriver(index) {
      activeRealDriverIndex = index;
      const d = drivers[index];
      const topPoints = Math.max(...drivers.map(driver => Number(driver.points || 0)), 1);
      const topWins = Math.max(...drivers.map(driver => Number(driver.wins || 0)), 1);
      const maxPosition = Math.max(...drivers.map(driver => Number(driver.position || 0)), drivers.length);
      const positionScore = d.position ? Math.max(5, Math.round(((maxPosition - d.position + 1) / maxPosition) * 100)) : 0;

      sel.innerHTML = drivers.map((driver, idx) => `
        <div class="drv-pill ${idx === index ? 'on' : ''}" onclick="selectRealDriver(${idx})" style="--team-color:${driver.teamColor}">
          <div class="dp-av" style="background:${driver.teamColor}22;border-color:${driver.teamColor}">
            ${driverAvatarHTML(driver, 'small')}
          </div>
          <div>
            <div class="dp-name">${driver.code || driver.name}</div>
            <div class="dp-team">${fanTeamLogoHTML(driver.team, 'mini')}<span>${driver.team}</span></div>
          </div>
        </div>
      `).join('');

      if (card) {
        card.innerHTML = `
          <div class="drv-num-bg">${d.number || d.position || index + 1}</div>
          <div class="drv-card-shine"></div>
          <div class="drv-big-av premium-driver-avatar" style="border-color:${d.teamColor};--team-color:${d.teamColor}">
            ${driverAvatarHTML(d, 'large')}
          </div>
          <div class="drv-name">${d.name}</div>
          <div class="drv-team" style="color:${d.teamColor}">${fanTeamLogoHTML(d.team, 'card')}<span>${d.team}</span></div>
          <div class="drv-country">
            <span class="driver-flag-shell">${driverFlagHTML(d)}</span>
            <span>${d.nationality || 'Country TBA'}</span>
          </div>
          <div class="drv-tags">
            <span class="drv-tag">#${d.number || '?'}</span>
            <span class="drv-tag">${d.position ? `P${d.position}` : 'Grid'}</span>
            <span class="drv-tag">${Number(d.points || 0).toLocaleString('en-IN')} PTS</span>
          </div>
          <button class="drv-detail-btn" type="button" onclick="openDriverDetailModal(${index})">
            View Driver Details
          </button>
        `;
      }

      const statMap = [
        { label:'Championship Points', val:Math.round((Number(d.points || 0) / topPoints) * 100), raw:`${Number(d.points || 0).toLocaleString('en-IN')} pts` },
        { label:'Race Wins', val:Math.round((Number(d.wins || 0) / topWins) * 100), raw:`${Number(d.wins || 0)} wins` },
        { label:'Championship Position', val:positionScore, raw:d.position ? `P${d.position}` : 'TBA' },
        { label:'Race Grid', val:100, raw:`${drivers.length} drivers` }
      ];

      if (bars) {
        bars.innerHTML = statMap.map(st => `
          <div class="sb-row">
            <div class="sb-hd">
              <span class="sb-lbl">${st.label}</span>
              <span class="sb-val">${st.raw}</span>
            </div>
            <div class="sb-track">
              <div class="sb-fill" data-w="${Math.max(0, Math.min(100, st.val))}%" style="width:0%;background:${d.teamColor}"></div>
            </div>
          </div>
        `).join('');

        setTimeout(() => {
          bars.querySelectorAll('.sb-fill').forEach(bar => {
            bar.style.width = bar.dataset.w;
          });
        }, 80);
      }

      if (cmp) {
        cmp.innerHTML = `
          <div class="cmp-c"><div class="cmp-v">${d.position ? `P${d.position}` : '—'}</div><div class="cmp-l">Standing</div></div>
          <div class="cmp-c"><div class="cmp-v">${Number(d.points || 0).toLocaleString('en-IN')}</div><div class="cmp-l">Points</div></div>
          <div class="cmp-c"><div class="cmp-v">${Number(d.wins || 0)}</div><div class="cmp-l">Wins</div></div>
          <div class="cmp-c"><div class="cmp-v">${d.number || '—'}</div><div class="cmp-l">Car No.</div></div>
        `;
      }
    }

    window.selectRealDriver = (index) => {
      const nextIndex = Number(index) || 0;
      compareDriverAIndex = nextIndex;
      if (compareDriverBIndex === compareDriverAIndex && drivers.length > 1) {
        compareDriverBIndex = (compareDriverAIndex + 1) % drivers.length;
      }
      renderDriver(nextIndex);
      renderDriverComparePanel();
    };
    renderDriver(0);
    renderDriverComparePanel();

  } catch (err) {
    console.warn('Driver grid load failed', err);
    if (countEl) countEl.textContent = 'Driver grid unavailable';
    if (sourceEl) {
      sourceEl.textContent = '';
      sourceEl.style.display = 'none';
    }
    sel.innerHTML = `<div class="drv-empty">Could not load current F1 race-driver grid right now.</div>`;
    if (card) card.innerHTML = `<div class="drv-empty">No cached driver data shown, to avoid hardcoded/outdated grid.</div>`;
    if (bars) bars.innerHTML = '';
    if (cmp) cmp.innerHTML = '';
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
      ticker.textContent = `${race.name} Winner: ${race.winner.name} (${race.winner.team})`;
    }
  } catch (err) {
    console.warn('Last result load failed:', err);
  }
}
/* ══ DATA ══ */
const WALLPAPERS = [
  { name:'Ferrari SF-25 Dawn',  cat:'cars',     type:'free',    img:'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80',     res:'4K · 3840×2160', emoji:'' },
  { name:'Max Attack Mode',     cat:'drivers',  type:'premium', img:'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&q=80',     res:'4K · 3840×2160', emoji:'' },
  { name:'Silverstone Aerial',  cat:'circuits', type:'free',    img:'https://images.unsplash.com/photo-1504197832061-98658c95b13e?w=800&q=80',     res:'2K · 2560×1440', emoji:'' },
  { name:'McLaren Papaya Burst',cat:'cars',     type:'premium', img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',        res:'4K · 3840×2160', emoji:'' },
  { name:'Scuderia Fire Art',   cat:'art',      type:'free',    img:'https://images.unsplash.com/photo-1541005329-22a78da1b5f0?w=800&q=80',         res:'HD · 1920×1080', emoji:'' },
  { name:'Hamilton Era',        cat:'drivers',  type:'premium', img:'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',     res:'4K · 3840×2160', emoji:'' },
  { name:'Monaco Neon Circuit', cat:'circuits', type:'free',    img:'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&q=80',         res:'2K · 2560×1440', emoji:'' },
  { name:'Golden Lap Abstract', cat:'art',      type:'premium', img:'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80',     res:'4K · 3840×2160', emoji:'' },
];

const DRIVERS = [
  { num:1,  name:'Max Verstappen', team:'Red Bull Racing',   nat:'Netherlands', flagCode:'nl', av:'',
    stats:{ pace:98, racecraft:97, overtaking:95, defending:88, wetweather:96, consistency:92 },
    season:{ wins:6, podiums:10, poles:5, pts:195, pos:'1st' },
    img:'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&q=80' },
  { num:16, name:'Charles Leclerc', team:'Scuderia Ferrari', nat:'Monaco', flagCode:'mc',      av:'',
    stats:{ pace:96, racecraft:90, overtaking:88, defending:84, wetweather:89, consistency:85 },
    season:{ wins:4, podiums:9,  poles:7, pts:168, pos:'2nd' },
    img:'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400&q=80' },
  { num:44, name:'Lewis Hamilton',  team:'Scuderia Ferrari', nat:'United Kingdom', flagCode:'gb', av:'',
    stats:{ pace:94, racecraft:96, overtaking:96, defending:90, wetweather:98, consistency:90 },
    season:{ wins:2, podiums:7,  poles:3, pts:140, pos:'3rd' },
    img:'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80' },
  { num:4,  name:'Lando Norris',    team:'McLaren F1 Team',  nat:'United Kingdom', flagCode:'gb', av:'',
    stats:{ pace:95, racecraft:89, overtaking:91, defending:83, wetweather:87, consistency:88 },
    season:{ wins:3, podiums:8,  poles:4, pts:155, pos:'4th' },
    img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80' },
  { num:14, name:'Fernando Alonso', team:'Aston Martin F1',  nat:'Spain', flagCode:'es',      av:'',
    stats:{ pace:90, racecraft:99, overtaking:94, defending:96, wetweather:95, consistency:89 },
    season:{ wins:0, podiums:3,  poles:1, pts:72,  pos:'7th' },
    img:'https://images.unsplash.com/photo-1504197832061-98658c95b13e?w=400&q=80' },
];

const RACES = [
  { round:1,  name:'Bahrain Grand Prix',       circuit:"Bahrain Int'l Circuit",       date:'Mar 2',  flagCode:'bh', status:'completed', winner:'Verstappen' },
  { round:2,  name:'Saudi Arabian GP',         circuit:'Jeddah Corniche Circuit',     date:'Mar 9',  flagCode:'sa', status:'completed', winner:'Leclerc'    },
  { round:3,  name:'Australian Grand Prix',    circuit:'Albert Park Circuit',         date:'Mar 23', flagCode:'au', status:'completed', winner:'Norris'     },
  { round:4,  name:'Japanese Grand Prix',      circuit:'Suzuka Circuit',             date:'Apr 6',  flagCode:'jp', status:'completed', winner:'Verstappen' },
  { round:5,  name:'Chinese Grand Prix',       circuit:'Shanghai Int\'l Circuit',    date:'Apr 20', flagCode:'cn', status:'completed', winner:'Hamilton'   },
  { round:6,  name:'Miami Grand Prix',         circuit:'Miami Int\'l Autodrome',     date:'May 4',  flagCode:'us', status:'completed', winner:'Verstappen' },
  { round:7,  name:'Emilia Romagna GP',        circuit:'Autodromo Enzo Ferrari',     date:'May 18', flagCode:'it', status:'completed', winner:'Leclerc'    },
  { round:8,  name:'Monaco Grand Prix',        circuit:'Circuit de Monaco',          date:'May 25', flagCode:'mc', status:'next',      winner:null         },
  { round:9,  name:'Spanish Grand Prix',       circuit:'Circuit de Barcelona',       date:'Jun 1',  flagCode:'es', status:'upcoming',  winner:null         },
  { round:10, name:'Canadian Grand Prix',      circuit:'Circuit Gilles Villeneuve',  date:'Jun 15', flagCode:'ca', status:'upcoming',  winner:null         },
  { round:11, name:'Austrian Grand Prix',      circuit:'Red Bull Ring',              date:'Jun 29', flagCode:'at', status:'upcoming',  winner:null         },
  { round:12, name:'British Grand Prix',       circuit:'Silverstone Circuit',        date:'Jul 6',  flagCode:'gb', status:'upcoming',  winner:null         },
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

/* ══ TAB SWITCHING — Phase 17 polish ══ */
function activateHubTab(tabName = 'wallpapers', shouldScroll = false) {
  const tab = document.querySelector(`.hub-tab[data-tab="${tabName}"]`) ||
              document.querySelector('.hub-tab[data-tab="wallpapers"]');
  if (!tab) return;

  document.querySelectorAll('.hub-tab').forEach(t => t.classList.remove('on'));
  document.querySelectorAll('.hub-section').forEach(s => s.classList.remove('on'));

  tab.classList.add('on');
  const sec = document.getElementById(`sec-${tab.dataset.tab}`);
  if (sec) {
    sec.classList.add('on');
    initReveal(sec);
  }

  try { localStorage.setItem('paddox_fanhub_tab', tab.dataset.tab); } catch (_) {}

  const icon = tab.querySelector('.ht-icon');
  if (icon) {
    icon.style.transform = 'scale(1.28)';
    setTimeout(() => icon.style.transform = '', 260);
  }

  if (shouldScroll) {
    const tabsBar = document.getElementById('hub-tabs-bar');
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 68;
    if (tabsBar) {
      const target = tabsBar.getBoundingClientRect().top + window.scrollY - navH - 2;
      window.scrollTo({ top: Math.max(0, target), behavior:'smooth' });
    }
  }
}

document.querySelectorAll('.hub-tab').forEach(tab => {
  tab.addEventListener('click', () => activateHubTab(tab.dataset.tab, true));
});

window.addEventListener('load', () => {
  const fromHash = (location.hash || '').replace('#', '').replace('sec-', '');
  const saved = localStorage.getItem('paddox_fanhub_tab');
  const nextTab = fromHash || saved || 'wallpapers';
  if (document.querySelector(`.hub-tab[data-tab="${nextTab}"]`)) {
    activateHubTab(nextTab, false);
  }
});

/* ══ WALLPAPERS ══ */
let wpCat = 'all';

async function renderWallpapers() {
  const grid = document.getElementById('wp-grid');
  if (!grid) return;

  grid.classList.add('wp-grid-premium');
  grid.innerHTML = `
    <div class="fh-empty-state" style="grid-column:1/-1">
      <div class="fh-empty-mark fh-mark-loading"></div>
      <h3>Loading PADDOX wallpaper vault...</h3>
      <p>Checking desktop, mobile and premium access data.</p>
    </div>
  `;

  try {
    const res = await fetch('https://paddox-backend.onrender.com/api/assets?limit=60');
    const data = await res.json().catch(() => ({}));
    const assets = data.data?.assets || data.data || data.assets || [];

    if (!data.success || !assets.length) {
      renderWallpapersFallback();
      return;
    }

    const list = assets.filter(w => {
      const cat = String(w.category || '').toLowerCase();
      const type = String(w.type || 'free').toLowerCase();
      return wpCat === 'all' || (wpCat === 'free' ? type === 'free' : cat === wpCat);
    });

    if (!list.length) {
      grid.innerHTML = `
        <div class="fh-empty-state" style="grid-column:1/-1">
          <div class="fh-empty-mark fh-mark-wallpapers"></div>
          <h3>No wallpapers in this filter yet</h3>
          <p>Switch to All or add more digital assets from Admin → Digital Assets.</p>
        </div>
      `;
      return;
    }

    window.__PADDOX_ASSETS__ = {};
    list.forEach(w => {
      window.__PADDOX_ASSETS__[w._id] = {
        id: w._id,
        name: w.name,
        cover: w.thumbnail?.url || w.image?.url || w.desktop?.url || w.mobile?.url,
        desktop: w.desktop?.url || w.image?.url,
        mobile: w.mobile?.url,
        type: String(w.type || 'free').toLowerCase(),
        price: Number(w.price || 0),
        orientation: w.orientation || 'desktop',
        resolution: w.resolution || 'HD'
      };
    });

    grid.innerHTML = list.map((w, i) => {
      const asset = window.__PADDOX_ASSETS__[w._id];
      const isPremium = asset.type === 'premium';
      const hasDesktop = !!asset.desktop;
      const hasMobile = !!asset.mobile;
      const cover = asset.cover || asset.desktop || asset.mobile || '';
      const safeName = String(w.name || 'Wallpaper').replace(/'/g, "\\'");
      return `
        <article class="wp-card wp-card-premium ${isPremium ? 'is-premium' : 'is-free'}" style="animation-delay:${i * 0.06}s">
          <div class="wp-media-wrap">
            ${cover ? `<img class="wp-img" src="${cover}" alt="${w.name}" loading="lazy"/>` : '<div class="wp-thumb"></div>'}
            <span class="wp-tag wt-${isPremium ? 'prem' : 'free'}">${isPremium ? `Premium · ₹${Number(asset.price || 0).toLocaleString('en-IN')}` : 'Free · Login Required'}</span>
            <span class="wp-res">${asset.resolution}</span>
          </div>
          <div class="wp-info-panel">
            <div class="wp-category">${String(w.category || 'wallpaper').toUpperCase()}</div>
            <h3>${w.name || 'PADDOX Wallpaper'}</h3>
            <div class="wp-device-row">
              <span class="${hasDesktop ? 'on' : ''}">Desktop</span>
              <span class="${hasMobile ? 'on' : ''}">Mobile</span>
              <span>${String(asset.orientation || 'desktop').toUpperCase()}</span>
            </div>
            <p>${isPremium ? 'Unlock this premium PADDOX wallpaper pack after purchase.' : 'Sign in required for every PADDOX wallpaper download.'}</p>
            <div class="wp-action-grid ${hasDesktop && hasMobile ? 'two' : ''}">
              ${hasDesktop ? `<button class="wp-dl-btn" onclick="event.stopPropagation();handleWpDownload('${w._id}','desktop')">${isPremium ? `Buy Desktop · ₹${Number(asset.price || 0).toLocaleString('en-IN')}` : 'Download Desktop'}</button>` : ''}
              ${hasMobile ? `<button class="wp-dl-btn wp-dl-mobile" onclick="event.stopPropagation();handleWpDownload('${w._id}','mobile')">${isPremium ? `Buy Mobile · ₹${Number(asset.price || 0).toLocaleString('en-IN')}` : 'Download Mobile'}</button>` : ''}
              <button class="wp-prev-btn" onclick="event.stopPropagation();openPreview('${cover}', '${w._id}', '${safeName}')">Preview</button>
            </div>
            <div class="wp-download-count">↓ ${(w.downloads || 0).toLocaleString()} downloads</div>
          </div>
        </article>
      `;
    }).join('');

  } catch (err) {
    console.error('Wallpaper API failed:', err);
    renderWallpapersFallback();
  }
}

async function handleWpDownload(assetId, format = 'desktop') {
  try {
    const localAsset = window.__PADDOX_ASSETS__?.[assetId] || {};
    const token = (
      localStorage.getItem('token') ||
      localStorage.getItem('paddox_access_token') ||
      localStorage.getItem('accessToken') ||
      ''
    );

    if (!token) {
      showToast('🔒 Please login to download PADDOX wallpapers');
      setTimeout(() => {
        window.location.href = `account.html?redirect=${encodeURIComponent('fanhub.html#sec-wallpapers')}`;
      }, 900);
      return;
    }

    if (localAsset.type === 'premium') {
      showToast(`🏁 Premium wallpaper checkout coming next: ₹${Number(localAsset.price || 0).toLocaleString('en-IN')}`);
      return;
    }

    showToast(`⏳ Preparing ${format} wallpaper...`);

    const res = await fetch(`https://paddox-backend.onrender.com/api/assets/${assetId}/download?format=${encodeURIComponent(format)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json().catch(() => ({}));

    if (res.status === 401) {
      showToast('🔒 Please login to download PADDOX wallpapers');
      setTimeout(() => window.location.href = 'account.html?redirect=fanhub.html%23sec-wallpapers', 900);
      return;
    }

    if (!res.ok || data.success === false) {
      throw new Error(data.message || 'Download failed');
    }

    const info = data.data || data;
    const downloadUrl = info.downloadUrl || info.url || localAsset[format] || localAsset.desktop || localAsset.cover;
    const name = info.name || localAsset.name || 'Paddox Wallpaper';

    if (!downloadUrl) {
      showToast('❌ Download URL missing');
      return;
    }

    const finalUrl = makeCloudinaryDownloadUrl(downloadUrl);
    const safeName = `${name}_${format}`.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_') || 'paddox_wallpaper';

    const link = document.createElement('a');
    link.href = finalUrl;
    link.download = `${safeName}.jpg`;
    link.target = '_blank';
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    closePreview();
    showToast(`✅ Downloading ${format} wallpaper`);
    setTimeout(() => renderWallpapers(), 1200);

  } catch (err) {
    console.error('Download failed:', err);
    showToast(`❌ ${err.message || 'Download failed'}`);
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

  if (!list.length) {
    grid.innerHTML = `
      <div class="fh-empty-state">
        <div class="fh-empty-mark fh-mark-wallpapers"></div>
        <h3>No wallpapers in this filter yet</h3>
        <p>Try another category or upload new wallpapers from Admin.</p>
      </div>
    `;
    return;
  }

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
          onclick="event.stopPropagation();showToast('${w.type === 'free' ? 'Downloading...' : 'Sign in for premium'}')">
          ${w.type === 'free' ? 'Download' : 'Unlock'}
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
      <div class="rc-flag">${raceFlagHTML(r)}</div>
      <div class="rc-round">Round ${r.round}</div>
      <div class="rc-name">${r.name}</div>
      <div class="rc-circuit">${r.circuit}</div>
      <div class="rc-date">${r.date}, 2025</div>
      <span class="rc-status rs-${r.status==='next'?'next':r.status==='completed'?'done':'up'}">
        ${r.status==='next'?'▶ Next Race':r.status==='completed'?'✓ Completed':'Upcoming'}
      </span>
      ${r.winner?`<div class="rc-winner">Winner: ${r.winner}</div>`:''}
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
let REAL_DRIVER_GRID_CACHE = [];
let activeRealDriverIndex = 0;
let compareDriverAIndex = 0;
let compareDriverBIndex = 1;

function safeText(value = '') {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


function compareDriverValue(driver = {}, key = '') {
  if (!driver) return '—';
  if (key === 'position') return driver.position ? `P${driver.position}` : '—';
  if (key === 'points') return `${Number(driver.points || 0).toLocaleString('en-IN')} pts`;
  if (key === 'wins') return `${Number(driver.wins || 0)} wins`;
  if (key === 'team') return safeText(driver.team || 'Team TBA');
  if (key === 'number') return driver.number ? `#${safeText(driver.number)}` : '—';
  return '—';
}

function compareMetricWinner(a = {}, b = {}, key = '') {
  const av = Number(key === 'position' ? (a.position ? -a.position : -999) : a[key] || 0);
  const bv = Number(key === 'position' ? (b.position ? -b.position : -999) : b[key] || 0);
  if (av === bv) return 'tie';
  return av > bv ? 'a' : 'b';
}

function compareDriverCard(driver = {}, side = 'a') {
  const teamColor = driver.teamColor || '#e8002d';
  return `
    <div class="compare-driver-card compare-${side}" style="--team-color:${teamColor}">
      <div class="compare-driver-top">
        <div class="compare-avatar" style="border-color:${teamColor};background:${teamColor}18">
          ${driverAvatarHTML(driver, 'compare')}
        </div>
        <div>
          <div class="compare-side">Driver ${side.toUpperCase()}</div>
          <div class="compare-name">${safeText(driver.name || 'F1 Driver')}</div>
          <div class="compare-team">${fanTeamLogoHTML(driver.team, 'compare')}<span>${safeText(driver.team || 'Team TBA')}</span></div>
        </div>
      </div>
      <div class="compare-mini-tags">
        <span>${driver.position ? `P${driver.position}` : 'Grid'}</span>
        <span>${Number(driver.points || 0).toLocaleString('en-IN')} pts</span>
        <span>${driver.number ? `#${safeText(driver.number)}` : 'No.'}</span>
      </div>
    </div>`;
}

function renderDriverComparePanel() {
  const shell = document.getElementById('driver-compare-shell');
  const selectA = document.getElementById('compare-driver-a');
  const selectB = document.getElementById('compare-driver-b');
  const board = document.getElementById('compare-board');
  const drivers = REAL_DRIVER_GRID_CACHE || [];
  if (!shell || !selectA || !selectB || !board) return;

  if (!drivers.length) {
    shell.style.display = 'none';
    return;
  }
  shell.style.display = '';
  compareDriverAIndex = Math.min(Math.max(0, compareDriverAIndex || 0), drivers.length - 1);
  compareDriverBIndex = Math.min(Math.max(0, compareDriverBIndex || 1), drivers.length - 1);
  if (drivers.length > 1 && compareDriverAIndex === compareDriverBIndex) {
    compareDriverBIndex = (compareDriverAIndex + 1) % drivers.length;
  }

  const options = drivers.map((driver, idx) => `<option value="${idx}">${safeText(driver.code || driver.name)} — ${safeText(driver.team || 'Team')}</option>`).join('');
  selectA.innerHTML = options;
  selectB.innerHTML = options;
  selectA.value = String(compareDriverAIndex);
  selectB.value = String(compareDriverBIndex);
  selectA.onchange = () => selectCompareDriver('a', selectA.value);
  selectB.onchange = () => selectCompareDriver('b', selectB.value);

  const a = drivers[compareDriverAIndex];
  const b = drivers[compareDriverBIndex];
  const metrics = [
    ['position','Standing'],
    ['points','Points'],
    ['wins','Wins'],
    ['team','Team'],
    ['number','Car No.']
  ];

  board.innerHTML = `
    <div class="compare-driver-pair">
      ${compareDriverCard(a, 'a')}
      <div class="compare-vs">VS</div>
      ${compareDriverCard(b, 'b')}
    </div>
    <div class="compare-metrics">
      ${metrics.map(([key, label]) => {
        const winner = compareMetricWinner(a, b, key);
        const canWin = key !== 'team' && key !== 'number';
        return `
          <div class="compare-metric-row">
            <div class="cm-val ${canWin && winner === 'a' ? 'win' : ''}">${compareDriverValue(a, key)}</div>
            <div class="cm-label">${label}</div>
            <div class="cm-val ${canWin && winner === 'b' ? 'win' : ''}">${compareDriverValue(b, key)}</div>
          </div>`;
      }).join('')}
    </div>`;
}

function selectCompareDriver(side = 'a', value = 0) {
  const next = Number(value) || 0;
  if (side === 'a') compareDriverAIndex = next;
  else compareDriverBIndex = next;
  if (REAL_DRIVER_GRID_CACHE.length > 1 && compareDriverAIndex === compareDriverBIndex) {
    if (side === 'a') compareDriverBIndex = (compareDriverAIndex + 1) % REAL_DRIVER_GRID_CACHE.length;
    else compareDriverAIndex = (compareDriverBIndex + 1) % REAL_DRIVER_GRID_CACHE.length;
  }
  renderDriverComparePanel();
}
window.selectCompareDriver = selectCompareDriver;

function quoteTeamClass(team = '') {
  return String(team || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'paddox';
}

function findDriverQuote(driverName = '') {
  const key = String(driverName || '').toLowerCase();
  return REAL_QUOTES.find(q => String(q.driver || '').toLowerCase() === key) ||
         REAL_QUOTES.find(q => key && String(q.driver || '').toLowerCase().includes(key.split(' ').pop())) ||
         null;
}

function quoteImageValue(q = {}) {
  return (
    q.driverImage ||
    q.image ||
    q.imageUrl ||
    q.headshot ||
    q.avatar ||
    'PX'
  );
}

function quoteAvatarHTML(avatar, className = '', driverName = '') {
  const value = avatar || '';

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
        src="${safeText(value)}"
        alt="Quote driver image"
        class="${className}"
        loading="lazy"
        onerror="this.outerHTML='<span class=&quot;quote-avatar-fallback&quot;>${driverInitials(driverName || 'PADDOX')}</span>'"
      />
    `;
  }

  return `<span class="quote-avatar-fallback">${driverInitials(driverName || 'PADDOX')}</span>`;
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
        <div class="fh-empty-mark fh-mark-quotes"></div>
        No quotes found. Admin can add current-grid and legendary driver quotes.
      </div>
    `;

    list.innerHTML = '';
    return;
  }

  const q =
    REAL_QUOTES[quoteIdx] ||
    REAL_QUOTES[0];

  const teamColor =
    teamColorFromName(q.team || q.era || 'paddox') ||
    '#e8002d';

  const avatarValue = quoteImageValue(q);

  feat.innerHTML = `
    <div class="quote-progress"><span style="width:${((quoteIdx + 1) / REAL_QUOTES.length) * 100}%"></span></div>

    <div class="qf-premium-card" id="quote-share-card" style="--quote-team-color:${teamColor}">
      <div class="qf-card-glow"></div>

      <div class="qf-media">
        <div class="qf-image-ring">
          <div class="qf-driver-image">
            ${quoteAvatarHTML(avatarValue, 'qf-driver-img', q.driver)}
          </div>
        </div>
        <div class="qf-team-strip"></div>
      </div>

      <div class="qf-content">
        <div class="qf-topline">
          <span class="qf-pill">${safeText(q.era || 'current').toUpperCase()}</span>
          <span class="qf-dot">•</span>
          <span>${safeText(q.category || 'motivation').toUpperCase()}</span>
          ${q.isFeatured ? '<span class="qf-featured-badge">FEATURED</span>' : ''}
        </div>

        <div class="qf-bg">"</div>
        <div class="big-qm">"</div>

        <div class="qf-text">
          ${safeText(q.text)}
        </div>

        <div class="qf-footer">
          <div class="qf-drv">
            <div class="qf-ava">
              ${quoteAvatarHTML(avatarValue, '', q.driver)}
            </div>

            <div>
              <div class="qf-dname">
                ${safeText(q.driver)}
              </div>
              <div class="qf-dteam team-${quoteTeamClass(q.team)}">
                ${safeText(q.team || q.era || 'Paddox Quote Library')}
              </div>
            </div>
          </div>

          <div class="qf-brand qf-brand-mark compact qf-brand-final">
            <span class="qf-brand-icon-wrap"><img src="${PADDOX_BRAND_ICON}" alt="PADDOX logo" class="qf-brand-icon" loading="lazy"></span>
            <span class="qf-brand-wordmark">PADDO<span>X</span></span>
          </div>
        </div>
      </div>
    </div>

    <div class="qf-actions qf-premium-actions">
      <button class="qf-share qf-copy" onclick="copyQuoteText(${quoteIdx}, true)">
        Copy Text
      </button>
      <button class="qf-share" onclick="copyQuoteText(${quoteIdx})">
        Share Text
      </button>
      <button class="qf-share qf-download" onclick="shareQuoteImage(${quoteIdx})">
        Preview / Share Image
      </button>
    </div>
  `;

  list.innerHTML = REAL_QUOTES.map((qq, i) => {
    const miniAvatar = quoteImageValue(qq);
    return `
      <div class="qmini ${i === quoteIdx ? 'on' : ''}" onclick="setRealtimeQuote(${i})">
        <div class="qmini-head">
          <span class="qmini-era">${safeText(qq.era || 'current').toUpperCase()}</span>
          <div class="qm-actions">
            <button class="qm-share" onclick="event.stopPropagation();copyQuoteText(${i}, true)">Copy</button>
            <button class="qm-share" onclick="event.stopPropagation();shareQuoteImage(${i})">Image</button>
          </div>
        </div>

        <div class="qm-text">
          ${safeText(qq.text)}
        </div>

        <div class="qm-drv">
          <span class="qm-avatar">
            ${quoteAvatarHTML(miniAvatar)}
          </span>

          <div>
            <div class="qm-n">
              ${safeText(qq.driver)}
            </div>
            <div class="qm-t">
              ${safeText(qq.team || qq.era || 'Quote Library')}
            </div>
          </div>
        </div>

        <div class="qm-meta">
          ${safeText(qq.category || 'motivation').toUpperCase()}
        </div>
      </div>
    `;
  }).join('');
}

function setRealtimeQuote(index) {
  quoteIdx = index;
  renderRealtimeQuotes();
}

function downloadDataUrl(dataUrl, filename = 'paddox-quote.png') {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function loadQuoteImageForCanvas(src) {
  return new Promise(resolve => {
    if (!src || typeof src !== 'string') {
      resolve(null);
      return;
    }

    const img = new Image();

    if (src.startsWith('http')) {
      img.crossOrigin = 'anonymous';
    }

    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function drawPaddoxCanvasBrand(ctx, x, y, logo, options = {}) {
  const size = options.size || 68;
  const fontSize = options.fontSize || 62;
  let textX = x;

  if (logo) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + size / 2, y - size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(logo, x, y - size, size, size);
    ctx.restore();
    textX = x + size + (options.gap ?? 18);
  }

  ctx.save();
  ctx.textBaseline = 'alphabetic';
  ctx.font = `700 ${fontSize}px Bebas Neue, Impact, Arial Narrow, sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.fillText('PADDO', textX, y);
  const paddoWidth = ctx.measureText('PADDO').width;
  ctx.fillStyle = '#e8002d';
  ctx.fillText('X', textX + paddoWidth + (options.xGap ?? 0), y);
  ctx.restore();
}


function drawPaddoxLockupCanvas(ctx, x, y, logo, options = {}) {
  const maxW = options.width || 270;
  const maxH = options.height || 86;

  if (logo) {
    const ratio = Math.min(maxW / logo.width, maxH / logo.height);
    const w = logo.width * ratio;
    const h = logo.height * ratio;
    ctx.save();
    ctx.drawImage(logo, x, y, w, h);
    ctx.restore();
    return { width: w, height: h };
  }

  drawPaddoxCanvasBrand(ctx, x, y + 62, null, { fontSize: 62, gap: 0 });
  return { width: 210, height: 74 };
}

function drawPaddoxAlignedBrand(ctx, x, y, iconLogo, options = {}) {
  const size = options.size || 48;
  const fontSize = options.fontSize || 48;
  const gap = options.gap ?? 14;
  const tone = options.tone || '#ffffff';
  const accent = options.accent || '#e8002d';
  const letterGap = options.letterGap ?? 4;
  const centerY = y + size / 2;

  ctx.save();
  if (iconLogo) {
    ctx.drawImage(iconLogo, x, y, size, size);
  }

  const textX = x + size + gap;
  ctx.textBaseline = 'middle';
  ctx.font = `700 ${fontSize}px Bebas Neue, Impact, Arial Narrow, sans-serif`;

  let cursor = textX;
  const letters = ['P','A','D','D','O'];
  ctx.fillStyle = tone;
  letters.forEach((ch) => {
    ctx.fillText(ch, cursor, centerY + 1);
    cursor += ctx.measureText(ch).width + letterGap;
  });
  ctx.fillStyle = accent;
  ctx.fillText('X', cursor + Math.max(0, letterGap - 1), centerY + 1);
  ctx.restore();
}

function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 8) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;

    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;

      if (lines.length >= maxLines - 1) break;
    } else {
      line = test;
    }
  }

  if (line && lines.length < maxLines) lines.push(line);

  lines.forEach((l, i) => {
    ctx.fillText(l, x, y + i * lineHeight);
  });

  return y + lines.length * lineHeight;
}

function roundedRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

async function buildQuoteShareCanvas(q = {}) {
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  const teamColor = teamColorFromName(q.team || q.era || '') || '#e8002d';

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#050505');
  bg.addColorStop(.52, '#101010');
  bg.addColorStop(1, '#050505');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.globalAlpha = 0.20;
  ctx.strokeStyle = teamColor;
  ctx.lineWidth = 2;
  for (let x = -H; x < W; x += 74) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + H, H);
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = teamColor;
  ctx.filter = 'blur(80px)';
  ctx.beginPath();
  ctx.arc(870, 210, 230, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(190, 1130, 250, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.filter = 'none';

  roundedRect(ctx, 70, 70, W - 140, H - 140, 44);
  const cardGradient = ctx.createLinearGradient(70, 70, W - 70, H - 70);
  cardGradient.addColorStop(0, 'rgba(9,10,13,.96)');
  cardGradient.addColorStop(.52, 'rgba(12,13,16,.93)');
  cardGradient.addColorStop(1, 'rgba(17,12,14,.94)');
  ctx.fillStyle = cardGradient;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(255,255,255,.16)';
  ctx.stroke();

  ctx.fillStyle = teamColor;
  ctx.fillRect(70, 70, W - 140, 12);

  const brandLockup = await loadQuoteImageForCanvas(PADDOX_BRAND_LOCKUP);
  const brandLogo = await loadQuoteImageForCanvas(PADDOX_BRAND_ICON);
  drawPaddoxAlignedBrand(ctx, 110, 108, brandLogo, { size: 52, fontSize: 49, gap: 14, letterGap: 5 });

  ctx.font = '24px Inter, Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,.62)';
  ctx.fillText('DIGITAL FAN HUB QUOTE CARD', 110, 200);

  const imgSrc = quoteImageValue(q);
  const img = await loadQuoteImageForCanvas(imgSrc);

  ctx.save();
  ctx.beginPath();
  ctx.arc(810, 255, 122, 0, Math.PI * 2);
  ctx.fillStyle = '#141417';
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = teamColor;
  ctx.stroke();
  ctx.clip();

  if (img) {
    const size = Math.min(img.width, img.height);
    const sx = (img.width - size) / 2;
    const sy = (img.height - size) / 2;
    ctx.drawImage(img, sx, sy, size, size, 688, 133, 244, 244);
  } else if (brandLogo) {
    const logoSize = Math.min(brandLogo.width, brandLogo.height);
    const sx = (brandLogo.width - logoSize) / 2;
    const sy = (brandLogo.height - logoSize) / 2;
    ctx.drawImage(brandLogo, sx, sy, logoSize, logoSize, 688, 133, 244, 244);
  } else {
    ctx.font = '72px Bebas Neue, Arial Black, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('F1', 810, 255);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }
  ctx.restore();

  ctx.font = '140px Georgia, serif';
  ctx.fillStyle = 'rgba(232,0,45,.55)';
  ctx.fillText('“', 105, 430);

  ctx.font = '58px Barlow Condensed, Arial, sans-serif';
  ctx.fillStyle = '#ffffff';
  const quoteBottom = wrapCanvasText(ctx, q.text || '', 145, 500, 790, 72, 8);

  ctx.fillStyle = teamColor;
  roundedRect(ctx, 145, Math.min(quoteBottom + 52, 930), 150, 6, 4);
  ctx.fill();

  ctx.font = '54px Bebas Neue, Arial Black, sans-serif';
  ctx.fillStyle = '#ffffff';
  const driverY = Math.min(quoteBottom + 142, 1040);
  ctx.fillText(String(q.driver || 'F1 Driver').toUpperCase(), 145, driverY);

  ctx.font = '30px Inter, Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,.70)';
  ctx.fillText(String(q.team || q.era || 'PADDOX Quote Library'), 145, driverY + 48);

  ctx.font = '24px Inter, Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,.50)';
  ctx.fillText(`${String(q.era || 'CURRENT').toUpperCase()} • ${String(q.category || 'MOTIVATION').toUpperCase()}`, 145, driverY + 92);

  const footerGrad = ctx.createLinearGradient(110, 1160, W - 110, 1242);
  footerGrad.addColorStop(0, 'rgba(255,255,255,.08)');
  footerGrad.addColorStop(1, 'rgba(255,255,255,.05)');
  ctx.fillStyle = footerGrad;
  roundedRect(ctx, 110, 1160, W - 220, 82, 26);
  ctx.fill();

  ctx.font = '27px Barlow Condensed, Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,.78)';
  ctx.fillText('SAVE • SHARE • SUPPORT YOUR GRID', 145, 1213);

  drawPaddoxAlignedBrand(ctx, 780, 1180, brandLogo, { size: 30, fontSize: 29, gap: 9, letterGap: 2 });

  return canvas;
}

let quotePreviewState = { index: null, canvas: null, dataUrl: '', fileName: '' };

function ensureQuotePreviewModal() {
  let modal = document.getElementById('quote-image-preview-modal');
  if (modal) return modal;

  modal = document.createElement('div');
  modal.id = 'quote-image-preview-modal';
  modal.className = 'quote-preview-modal';
  modal.innerHTML = `
    <div class="quote-preview-backdrop" onclick="closeQuoteImagePreview(event)">
      <div class="quote-preview-card" onclick="event.stopPropagation()">
        <button class="quote-preview-close" type="button" onclick="closeQuoteImagePreview()">✕</button>
        <div class="quote-preview-kicker">PADDOX SHARE PREVIEW</div>
        <h3>Preview Quote Image</h3>
        <p>Check the final image before downloading or sharing.</p>
        <div class="quote-preview-frame">
          <img id="quote-preview-img" alt="PADDOX quote preview">
        </div>
        <div class="quote-preview-actions">
          <button type="button" onclick="downloadQuotePreviewImage()">Download Image</button>
          <button type="button" class="primary" onclick="nativeShareQuotePreviewImage()">Share Image</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(modal);
  return modal;
}

function closeQuoteImagePreview(event) {
  if (event && event.target && !event.target.classList.contains('quote-preview-backdrop')) return;
  const modal = document.getElementById('quote-image-preview-modal');
  if (modal) modal.classList.remove('show');
}

async function openQuoteImagePreview(index) {
  const q = REAL_QUOTES[index];
  if (!q) return;

  try {
    showToast('Building quote preview...');
    const canvas = await buildQuoteShareCanvas(q);
    const dataUrl = canvas.toDataURL('image/png');
    const fileName = `paddox-${String(q.driver || 'quote').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-quote.png`;

    quotePreviewState = { index, canvas, dataUrl, fileName };
    const modal = ensureQuotePreviewModal();
    const img = modal.querySelector('#quote-preview-img');
    if (img) img.src = dataUrl;
    modal.classList.add('show');
    showToast('Preview ready');
  } catch (err) {
    console.error(err);
    showToast('Could not create quote preview');
  }
}

function downloadQuotePreviewImage() {
  if (!quotePreviewState.dataUrl) return;
  downloadDataUrl(quotePreviewState.dataUrl, quotePreviewState.fileName || 'paddox-quote.png');
  showToast('Quote image saved!');
}

async function nativeShareQuotePreviewImage() {
  if (!quotePreviewState.canvas) return;
  const q = REAL_QUOTES[quotePreviewState.index] || {};

  quotePreviewState.canvas.toBlob(async blob => {
    if (!blob) {
      showToast('Could not build image');
      return;
    }

    const file = new File([blob], quotePreviewState.fileName || 'paddox-quote.png', { type: 'image/png' });

    try {
      if (navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
        await navigator.share({
          title: `PADDOX Quote — ${q.driver || 'F1'}`,
          text: `"${q.text || ''}" — ${q.driver || 'PADDOX'}`,
          files: [file]
        });
        showToast('Quote image shared!');
        closeQuoteImagePreview();
        return;
      }
    } catch (err) {
      console.warn('Native share unavailable, downloading instead:', err);
    }

    downloadQuotePreviewImage();
  }, 'image/png', 0.95);
}

async function shareQuoteImage(index) {
  await openQuoteImagePreview(index);
}

window.shareQuoteImage = shareQuoteImage;
window.closeQuoteImagePreview = closeQuoteImagePreview;
window.downloadQuotePreviewImage = downloadQuotePreviewImage;
window.nativeShareQuotePreviewImage = nativeShareQuotePreviewImage;

async function copyQuoteText(index, forceCopy = false) {
  const q = REAL_QUOTES[index];

  if (!q) return;

  const text = `"${q.text}" — ${q.driver}`;

  try {
    if (!forceCopy && navigator.share) {
      await navigator.share({
        title: `PADDOX Quote — ${q.driver}`,
        text
      });
      showToast('Quote shared!');
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


function driverModalMarkup(driver, index) {
  const q = findDriverQuote(driver.name);
  const teamColor = driver.teamColor || '#e8002d';
  const position = driver.position ? `P${driver.position}` : 'Grid TBA';
  const profileLine = `${driver.name} represents ${driver.team || 'Team TBA'} in the current PADDOX race-driver grid. ${driver.points ? `Current championship points: ${Number(driver.points).toLocaleString('en-IN')}.` : 'Stats will update from the live F1 source when available.'}`;

  return `
    <div class="driver-detail-backdrop" id="driver-detail-backdrop" onclick="if(event.target.id==='driver-detail-backdrop') closeDriverDetailModal()">
      <div class="driver-detail-modal" style="--team-color:${teamColor}">
        <button class="driver-detail-close" type="button" onclick="closeDriverDetailModal()">✕</button>

        <div class="driver-detail-hero">
          <div class="driver-detail-image">
            ${driverAvatarHTML(driver, 'large')}
          </div>

          <div class="driver-detail-info">
            <div class="driver-detail-kicker"><span class="driver-detail-flag">${driverFlagHTML(driver, 'driver-detail-flag-img')}</span> ${safeText(driver.nationality || 'Country TBA')}</div>
            <h3>${safeText(driver.name)}</h3>
            <div class="driver-detail-team">${safeText(driver.team || 'Team TBA')}</div>
            <p>${safeText(profileLine)}</p>

            <div class="driver-detail-tags">
              <span>${safeText(driver.code || 'F1')}</span>
              <span>#${safeText(driver.number || '?')}</span>
              <span>${position}</span>
            </div>
          </div>
        </div>

        <div class="driver-detail-stats">
          <div><b>${position}</b><span>Standing</span></div>
          <div><b>${Number(driver.points || 0).toLocaleString('en-IN')}</b><span>Points</span></div>
          <div><b>${Number(driver.wins || 0)}</b><span>Wins</span></div>
          <div><b class="driver-detail-flag-stat">${driverFlagHTML(driver, 'driver-detail-flag-img')}</b><span>Flag</span></div>
        </div>

        <div class="driver-detail-quote">
          <div class="driver-detail-quote-label">Driver Quote</div>
          <p>${q ? safeText(q.text) : 'No dedicated quote added for this driver yet. Add one from Admin → Fan Quotes.'}</p>
          <span>${q ? `— ${safeText(q.driver)}` : 'PADDOX Quote Library'}</span>
        </div>
      </div>
    </div>
  `;
}

function openDriverDetailModal(index = activeRealDriverIndex) {
  const driver = REAL_DRIVER_GRID_CACHE[index];
  if (!driver) {
    showToast('Driver details are still loading');
    return;
  }

  document.getElementById('driver-detail-backdrop')?.remove();
  const wrap = document.createElement('div');
  wrap.innerHTML = driverModalMarkup(driver, index);
  document.body.appendChild(wrap.firstElementChild);
  document.body.classList.add('modal-open');
}

function closeDriverDetailModal() {
  document.getElementById('driver-detail-backdrop')?.remove();
  document.body.classList.remove('modal-open');
}

window.openDriverDetailModal = openDriverDetailModal;
window.closeDriverDetailModal = closeDriverDetailModal;


/* ══ COMMUNITY — REALTIME ══ */
const FAN_API_BASE =
  'https://paddox-backend.onrender.com/api/fan';

/* Phase 17.5 — API alias safety
   Current js/api.js exposes getFeed/postFeed, while older Fan Hub code calls
   feed/post. Keep both names working without touching backend flow. */
(function ensureFanApiAliases(){
  const fan = window.PaddoxAPI?.fan;
  if (!fan) return;
  if (!fan.feed && fan.getFeed) fan.feed = fan.getFeed;
  if (!fan.post && fan.postFeed) fan.post = fan.postFeed;
  if (!fan.feed) {
    fan.feed = () => fetch(`${FAN_API_BASE}/feed`, { headers: fanAuthHeaders(false) }).then(r => r.json());
  }
  if (!fan.post) {
    fan.post = (text) => fetch(`${FAN_API_BASE}/feed`, {
      method:'POST',
      headers: fanAuthHeaders(true),
      body: JSON.stringify({ text })
    }).then(r => r.json());
  }
  if (!fan.likePost) {
    fan.likePost = (postId) => fetch(`${FAN_API_BASE}/feed/${encodeURIComponent(postId)}/like`, {
      method:'POST',
      headers: fanAuthHeaders(true)
    }).then(r => r.json());
  }
  if (!fan.commentPost) {
    fan.commentPost = (postId, text) => fetch(`${FAN_API_BASE}/feed/${encodeURIComponent(postId)}/comments`, {
      method:'POST',
      headers: fanAuthHeaders(true),
      body: JSON.stringify({ text })
    }).then(r => r.json());
  }
  if (!fan.deletePost) {
    fan.deletePost = (postId) => fetch(`${FAN_API_BASE}/feed/${encodeURIComponent(postId)}`, {
      method:'DELETE',
      headers: fanAuthHeaders(true)
    }).then(r => r.json());
  }
  if (!fan.deleteComment) {
    fan.deleteComment = (postId, commentId) => fetch(`${FAN_API_BASE}/feed/${encodeURIComponent(postId)}/comments/${encodeURIComponent(commentId)}`, {
      method:'DELETE',
      headers: fanAuthHeaders(true)
    }).then(r => r.json());
  }
})();

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
  showToast('Please login to use Fan Hub actions');

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


/* Community polish helpers */
const FAN_TIER_LEVELS = [
  { name:'Rookie Fan', min:0, next:500 },
  { name:'Pro Fan', min:500, next:2000 },
  { name:'Elite Fan', min:2000, next:5000 },
  { name:'Paddox Legend', min:5000, next:10000 }
];

function escapeHTML(value = '') {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getFanTier(points = 0) {
  const score = Number(points || 0);
  let tier = FAN_TIER_LEVELS[0];
  for (const level of FAN_TIER_LEVELS) {
    if (score >= level.min) tier = level;
  }
  const progress = tier.next
    ? Math.min(100, Math.round(((score - tier.min) / (tier.next - tier.min)) * 100))
    : 100;
  return { ...tier, progress, score };
}

function updateFanPointsDock({ votes, posts, topScore, userScore } = {}) {
  const voteEl = document.getElementById('fan-total-votes');
  const postEl = document.getElementById('fan-total-posts');
  const topEl = document.getElementById('fan-top-score');
  const tierTitle = document.getElementById('fan-tier-title');
  const tierSub = document.getElementById('fan-tier-sub');
  const tierProgress = document.getElementById('fan-tier-progress');

  if (voteEl && votes !== undefined) voteEl.textContent = Number(votes || 0).toLocaleString('en-IN');
  if (postEl && posts !== undefined) postEl.textContent = Number(posts || 0).toLocaleString('en-IN');
  if (topEl && topScore !== undefined) topEl.textContent = Number(topScore || 0).toLocaleString('en-IN');

  if (tierTitle || tierSub || tierProgress) {
    const tier = getFanTier(userScore || topScore || 0);
    if (tierTitle) tierTitle.textContent = tier.name;
    if (tierSub) {
      tierSub.textContent = tier.next
        ? `${tier.score.toLocaleString('en-IN')} pts · ${Math.max(0, tier.next - tier.score).toLocaleString('en-IN')} pts to next tier`
        : `${tier.score.toLocaleString('en-IN')} pts · Maximum tier unlocked`;
    }
    if (tierProgress) tierProgress.style.width = `${tier.progress}%`;
  }
}

function showPointsBurst(text = '+20 pts') {
  const burst = document.createElement('div');
  burst.className = 'points-burst';
  burst.textContent = text;
  document.body.appendChild(burst);
  requestAnimationFrame(() => burst.classList.add('show'));
  setTimeout(() => burst.remove(), 1500);
}

function initialsFromName(name = '') {
  return String(name || 'PF').split(/\s+/).filter(Boolean).map(x => x[0]).slice(0,2).join('').toUpperCase() || 'PF';
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
      <div class="poll-empty fh-action-empty">
        <div class="fh-empty-mark fh-mark-poll"></div>
        <strong>No active poll right now</strong>
        <span>Admin can create a poll later from the Fan Hub controls.</span>
      </div>
    `;
    if (metaEl) metaEl.textContent = 'Realtime poll inactive';
  }
}


function fanPollId(poll = {}) {
  return String(poll._id || poll.id || poll.question || 'active').replace(/[^a-zA-Z0-9_-]+/g, '-');
}

function fanPollVoteKey(poll = CURRENT_POLL) {
  return `paddox_poll_vote_${fanPollId(poll)}`;
}

function getStoredFanPollVote(poll = CURRENT_POLL) {
  try {
    const raw = localStorage.getItem(fanPollVoteKey(poll));
    if (raw === null || raw === undefined || raw === '') return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch (_) {
    return null;
  }
}

function storeFanPollVote(poll = CURRENT_POLL, optionIndex = 0) {
  try { localStorage.setItem(fanPollVoteKey(poll), String(optionIndex)); } catch (_) {}
}

function clearFanPollVote(poll = CURRENT_POLL) {
  try { localStorage.removeItem(fanPollVoteKey(poll)); } catch (_) {}
}

function getFanPollTotalVotes(poll = CURRENT_POLL, fallback = 0) {
  const options = Array.isArray(poll?.options) ? poll.options : [];
  const total = options.reduce((sum, option) => sum + Number(option.votes || 0), 0);
  return Number.isFinite(total) ? total : Number(fallback || 0);
}

function syncFanPollStoredVote(poll = CURRENT_POLL, totalVotes = 0) {
  const storedVote = getStoredFanPollVote(poll);
  if (storedVote === null) return null;

  const options = Array.isArray(poll?.options) ? poll.options : [];
  const total = Number(totalVotes || getFanPollTotalVotes(poll));

  if (storedVote < 0 || storedVote >= options.length) {
    clearFanPollVote(poll);
    return null;
  }

  /*
    Admin reset protection:
    If votes are reset to 0, or the previously selected option has no votes
    after a poll edit/reset, the browser's old localStorage vote is stale.
  */
  if (!total || Number(options[storedVote]?.votes || 0) <= 0) {
    clearFanPollVote(poll);
    return null;
  }

  return storedVote;
}


function cleanPollOptionLabel(value = '', index = 0) {
  return String(value || `Option ${index + 1}`)
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim() || `Option ${index + 1}`;
}

function pollOptionAccent(index = 0) {
  return ['#1e5bff', '#e8002d', '#ff8700', '#c9a84c', '#00d2be'][index % 5];
}



/* Phase 17.6.4 — Fan Hub real team logo resolver */
const FAN_POLL_REAL_TEAM_LOGOS = [
  { name:'Mercedes', slug:'mercedes', aliases:['mercedes', 'mercedes-amg', 'mercedes amg', 'kimi', 'george', 'russell', 'antonelli'], color:'#00d2be', image:'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2025/mercedes/2025mercedeslogowhite.webp' },
  { name:'Ferrari', slug:'ferrari', aliases:['ferrari', 'scuderia ferrari', 'charles', 'leclerc', 'lewis', 'hamilton'], color:'#e8002d', image:'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2025/ferrari/2025ferrarilogolight.webp' },
  { name:'McLaren', slug:'mclaren', aliases:['mclaren', 'mclaren racing', 'mclaren f1', 'lando', 'norris', 'oscar', 'piastri'], color:'#ff8700', image:'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2025/mclaren/2025mclarenlogowhite.webp' },
  { name:'Red Bull Racing', slug:'red-bull', aliases:['red bull', 'red bull racing', 'oracle red bull', 'verstappen', 'max', 'hadjar', 'isack'], color:'#1e5bff', image:'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2025/redbullracing/2025redbullracinglogowhite.webp' },
  { name:'Alpine', slug:'alpine', aliases:['alpine', 'bwt alpine', 'gasly', 'pierre', 'colapinto', 'franco'], color:'#2293d1', image:'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2025/alpine/2025alpinelogowhite.webp' },
  { name:'Racing Bulls', slug:'racing-bulls', aliases:['racing bulls', 'visa cash app rb', 'vcarb', 'rb', 'lawson', 'liam', 'lindblad', 'arvid'], color:'#6c4cff', image:'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2025/racingbulls/2025racingbullslogowhite.webp' },
  { name:'Haas F1 Team', slug:'haas', aliases:['haas', 'haas f1', 'haas f1 team', 'tgr haas', 'ocon', 'esteban', 'bearman', 'oliver'], color:'#ffffff', image:'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2025/haas/2025haaslogowhite.webp' },
  { name:'Williams', slug:'williams', aliases:['williams', 'williams racing', 'atlassian williams', 'albon', 'alexander', 'sainz', 'carlos'], color:'#64c4ff', image:'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2025/williams/2025williamslogowhite.webp' },
  { name:'Audi', slug:'audi', aliases:['audi', 'audi revolut', 'kick sauber', 'sauber', 'hulkenberg', 'nico', 'bortoleto', 'gabriel'], color:'#00e701', image:'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2026/audi/2026audilogowhite.webp' },
  { name:'Cadillac', slug:'cadillac', aliases:['cadillac', 'cadillac f1', 'cadillac formula 1', 'perez', 'sergio', 'bottas', 'valtteri'], color:'#d4af37', image:'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2026/cadillac/2026cadillaclogowhite.webp' },
  { name:'Aston Martin', slug:'aston-martin', aliases:['aston martin', 'aston martin aramco', 'alonso', 'fernando', 'stroll', 'lance'], color:'#006f62', image:'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2025/astonmartin/2025astonmartinlogowhite.webp' }
];

function fanPollTeamKey(value = '') {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function findRealFanPollTeam(value = '') {
  const key = fanPollTeamKey(value);
  if (!key) return null;
  return FAN_POLL_REAL_TEAM_LOGOS.find(team => {
    const names = [team.name, team.slug, ...(team.aliases || [])];
    return names.some(name => {
      const n = fanPollTeamKey(name);
      return key === n || key.includes(n) || n.includes(key);
    });
  }) || null;
}

function isGeneratedFanPollBadge(url = '') {
  const u = String(url || '');
  return u.startsWith('data:image/svg+xml') && (u.includes('%3Ctext') || u.includes('<text'));
}

function resolveFanPollLogoImage(rawLogo = '', name = '', key = '', color = '#e8002d') {
  const realTeam = findRealFanPollTeam(key) || findRealFanPollTeam(name);
  if (!rawLogo || fanPollLogoLooksBroken(rawLogo) || isGeneratedFanPollBadge(rawLogo)) {
    return realTeam?.image || fanPollTeamBadgeSvgURI(name || key || 'Team', color, key || name);
  }
  return rawLogo;
}

function fanPollTeamBadgeSvgURI(name = 'Team', color = '#e8002d', code = '') {
  const safeName = String(name || 'Team').replace(/[&<>"']/g, '');
  const safeColor = String(color || '#e8002d').match(/^#[0-9a-fA-F]{3,8}$/) ? color : '#e8002d';
  const initials = String(code || safeName)
    .replace(/F1|TEAM|RACING|FORMULA|SCUDERIA|ORACLE|PETRONAS|AMG|HP/gi, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map(w => w[0])
    .join('')
    .slice(0, 3)
    .toUpperCase() || 'PX';

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="#1b1b1f"/>
          <stop offset="1" stop-color="#050505"/>
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="${safeColor}" flood-opacity="0.30"/>
        </filter>
      </defs>
      <rect x="6" y="6" width="84" height="84" rx="18" fill="url(#g)" stroke="rgba(255,255,255,.22)" stroke-width="2"/>
      <path d="M19 66 H77" stroke="${safeColor}" stroke-width="5" stroke-linecap="round"/>
      <path d="M24 28 H72" stroke="${safeColor}" stroke-width="3" stroke-linecap="round" opacity=".55"/>
      <text x="48" y="56" text-anchor="middle" font-family="Arial Black,Impact,sans-serif" font-size="24" letter-spacing="2" fill="#fff" filter="url(#shadow)">${initials}</text>
    </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function fanPollLogoLooksBroken(url = '') {
  const u = String(url || '').trim().toLowerCase();
  if (!u) return true;
  return u.includes('media.formula1.com/content/dam/fom-website/teams/2026') ||
    u.includes('logo.clearbit.com') ||
    u.includes('wikimedia.org') ||
    u.includes('wikipedia.org') ||
    u.endsWith('/undefined') ||
    u.includes('undefined');
}

function isFormula1OfficialFanPollLogo(url = '') {
  const u = String(url || '').trim().toLowerCase();
  return u.startsWith('https://media.formula1.com/image/upload/') && u.includes('/common/f1/');
}

function pollOptionLogoHTML(option = {}, index = 0) {
  const rawLogo = String(option.logo || option.teamLogo || option.image || '').trim();
  const labelText = option.teamName || option.label || `Option ${index + 1}`;
  const label = escapeHTML(labelText);
  const colorRaw = option.teamColor || pollOptionAccent(index);
  const color = escapeHTML(colorRaw);
  const code = option.logoKey || option.teamName || option.label || `Option ${index + 1}`;
  const realTeam = findRealFanPollTeam(option.logoKey || option.teamName || option.label || option.text || '');
  const finalName = realTeam?.name || labelText;
  const finalColorRaw = realTeam?.color || colorRaw;
  const finalColor = escapeHTML(finalColorRaw);
  const finalLabel = escapeHTML(finalName);
  const logo = resolveFanPollLogoImage(rawLogo, finalName, option.logoKey || option.teamName || option.label || option.text || '', finalColorRaw);
  const fallback = fanPollTeamBadgeSvgURI(finalName, finalColorRaw, code);

  return `<span class="poll-team-logo" style="--poll-color:${finalColor}">
    <img src="${escapeHTML(logo)}" alt="${finalLabel}" loading="lazy" referrerpolicy="no-referrer" onerror="this.src='${escapeHTML(fallback)}';this.onerror=null;">
  </span>`;
}

function renderRealtimePoll(poll, totalVotes = 0) {
  const qEl = document.getElementById('poll-q');
  const optsEl = document.getElementById('poll-opts');
  const metaEl = document.getElementById('poll-meta');

  if (!poll || !qEl || !optsEl) return;

  const liveTotalVotes = Number(totalVotes || getFanPollTotalVotes(poll));
  const storedVote = syncFanPollStoredVote(poll, liveTotalVotes);
  const hasVoted = storedVote !== null && liveTotalVotes > 0;

  qEl.textContent = poll.question || 'Fan Poll';

  optsEl.innerHTML = (poll.options || []).map((option, index) => {
    const votes = Number(option.votes || 0);
    const pct = option.percentage ?? (totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0);
    const isSelected = hasVoted && Number(storedVote) === index;
    const realTeam = findRealFanPollTeam(option.logoKey || option.teamName || option.label || option.text || '');
    const accent = escapeHTML(realTeam?.color || option.teamColor || pollOptionAccent(index));

    return `
      <div class="popt ${hasVoted ? 'show-results' : ''} ${isSelected ? 'selected' : ''}" onclick="voteRealtimePoll(${index})" style="--poll-color:${accent}">
        <div class="popt-fill" style="width:${hasVoted ? pct : 0}%"></div>
        <span class="popt-lbl">
          ${pollOptionLogoHTML(option, index)}
          <span class="poll-option-copy">
            <span class="poll-option-name">${escapeHTML(cleanPollOptionLabel(option.label || option.text, index))}</span>
            ${isSelected ? '<span class="poll-selected-badge">Selected</span>' : ''}
          </span>
        </span>
        <span class="popt-pct">${hasVoted ? `${pct}%` : 'Vote'}</span>
      </div>
    `;
  }).join('');

  if (metaEl) {
    metaEl.textContent = hasVoted
      ? `${Number(liveTotalVotes || 0).toLocaleString('en-IN')} votes · Live results`
      : `${Number(liveTotalVotes || 0).toLocaleString('en-IN')} votes · Choose once to reveal live results`;
  }

  updateFanPointsDock({ votes: liveTotalVotes });
}

async function voteRealtimePoll(optionIndex) {
  try {
    if (!fanToken()) {
      fanLoginRequired();
      return;
    }

    if (!CURRENT_POLL?._id) {
      showToast('Poll not ready');
      return;
    }

    const currentTotalVotes = getFanPollTotalVotes(CURRENT_POLL);
    const validStoredVote = syncFanPollStoredVote(CURRENT_POLL, currentTotalVotes);

    if (validStoredVote !== null) {
      showToast('You already voted in this poll');
      await loadFanPoll();
      return;
    }

    showToast('Recording vote...');

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

    const updatedTotalVotes = data.data?.totalVotes || data.totalVotes || getFanPollTotalVotes(CURRENT_POLL);
    CURRENT_POLL.totalVotes = updatedTotalVotes;

    storeFanPollVote(CURRENT_POLL, optionIndex);

    renderRealtimePoll(
      CURRENT_POLL,
      updatedTotalVotes
    );

    showToast(data.message || 'Vote recorded! +50 Fan Points');
    showPointsBurst('+50 pts');

    loadFanLeaderboard();

  } catch (err) {
    console.error(err);
    const msg = String(err?.message || 'Vote failed');
    showToast(msg);

    /* If backend says this account already voted, reload the real poll state
       instead of keeping a stale selected/0-vote browser state. */
    if (/already voted/i.test(msg)) {
      clearFanPollVote(CURRENT_POLL);
      await loadFanPoll();
    }
  }
}

/* Leaderboard */
function leaderboardMedal(rank = 0) {
  const r = Number(rank || 0);
  if (r === 1) return 'P1';
  if (r === 2) return 'P2';
  if (r === 3) return 'P3';
  return `#${r || '-'}`;
}

function leaderboardRankLabel(rank = 0) {
  const r = Number(rank || 0);
  if (r === 1) return 'Pole Position';
  if (r === 2) return 'Front Row';
  if (r === 3) return 'Podium';
  return 'Grid Rank';
}

function leaderboardProgress(points = 0, max = 1) {
  const pct = max > 0 ? Math.round((Number(points || 0) / max) * 100) : 0;
  return Math.max(6, Math.min(100, pct));
}

async function loadFanLeaderboard() {
  const lbEl = document.getElementById('lb-list');

  if (!lbEl) return;

  lbEl.innerHTML = `
    <div class="lb-empty fh-action-empty">
      <div class="fh-empty-mark fh-mark-leaderboard"></div>
      <strong>Loading leaderboard...</strong>
      <span>Syncing the PADDOX fan grid.</span>
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
        <div class="lb-empty fh-action-empty">
          <div class="fh-empty-mark fh-mark-leaderboard"></div>
          <strong>No fan points yet</strong>
          <span>Votes, trivia, and fan posts will start the leaderboard.</span>
        </div>
      `;
      return;
    }

    const topThree = leaderboard.slice(0, 3);
    const remaining = leaderboard.slice(3, 10);
    const topScore = Number(leaderboard[0]?.fanPoints || 0);
    const userScore = Number(leaderboard.find(u => String(u.name || '').toLowerCase().includes('jenivaa'))?.fanPoints || topScore || 0);

    updateFanPointsDock({ topScore, userScore });

    const leader = leaderboard[0] || {};
    const leaderName = escapeHTML(leader.name || 'Paddox Fan');
    const leaderTier = getFanTier(leader.fanPoints);

    const headerHtml = `
      <div class="lb-header-card">
        <div>
          <div class="lb-kicker">Current Leader</div>
          <div class="lb-leader-name">${leaderName}</div>
          <div class="lb-leader-sub">${escapeHTML(leader.fanTier || leaderTier.name)} · ${Number(leader.fanPoints || 0).toLocaleString('en-IN')} pts</div>
        </div>
        <div class="lb-leader-chip">P1</div>
      </div>
    `;

    const podiumHtml = topThree.length ? `
      <div class="lb-podium lb-podium-premium">
        ${topThree.map(user => {
          const tier = getFanTier(user.fanPoints);
          const name = escapeHTML(user.name || 'Paddox Fan');
          const avatar = user.avatar;
          const rank = Number(user.rank || 0);
          const points = Number(user.fanPoints || 0);
          const progress = leaderboardProgress(points, topScore || points || 1);
          return `
            <div class="lb-podium-card rank-${rank} ${rank === 1 ? 'is-champion' : ''}">
              <div class="lb-card-glow"></div>
              <div class="lb-podium-topline">
                <span class="lb-podium-medal">${leaderboardMedal(rank)}</span>
                <span class="lb-rank-label">${leaderboardRankLabel(rank)}</span>
              </div>
              <div class="lb-podium-avatar">
                ${avatar ? `<img src="${escapeHTML(avatar)}" alt="${name}">` : `<span>${initialsFromName(name)}</span>`}
              </div>
              <div class="lb-podium-name">${name}</div>
              <div class="lb-podium-tier">${escapeHTML(user.fanTier || tier.name)}</div>
              <div class="lb-podium-points">${points.toLocaleString('en-IN')} pts</div>
              <div class="lb-progress-track"><span style="width:${progress}%"></span></div>
            </div>`;
        }).join('')}
      </div>` : '';

    const rowsHtml = remaining.length ? `
      <div class="lb-grid-list">
        ${remaining.map(user => {
          const tier = getFanTier(user.fanPoints);
          const name = escapeHTML(user.name || 'Paddox Fan');
          const avatar = user.avatar;
          const points = Number(user.fanPoints || 0);
          const progress = leaderboardProgress(points, topScore || points || 1);

          return `
            <div class="lb-row premium">
              <span class="lb-rank">#${user.rank || '-'}</span>
              <span class="lb-avatar">
                ${avatar ? `<img src="${escapeHTML(avatar)}" alt="${name}">` : initialsFromName(name)}
              </span>
              <span class="lb-main">
                <span class="lb-n">${name}</span>
                <span class="lb-row-track"><span style="width:${progress}%"></span></span>
              </span>
              <span class="lb-badge">${escapeHTML(user.fanTier || tier.name)}</span>
              <span class="lb-p">${points.toLocaleString('en-IN')} pts</span>
            </div>`;
        }).join('')}
      </div>` : '';

    lbEl.innerHTML = headerHtml + podiumHtml + rowsHtml;

  } catch (err) {
    console.error(err);

    lbEl.innerHTML = `
      <div class="lb-empty fh-action-empty">
        <div class="fh-empty-mark fh-mark-leaderboard"></div>
        <strong>Could not load leaderboard.</strong>
        <span>Try again after a quick refresh.</span>
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
      <div class="triv-empty fh-action-empty">
        <div class="fh-empty-mark fh-mark-trivia"></div>
        <strong>No trivia question available</strong>
        <span>Admin can add more F1 trivia questions later.</span>
      </div>
    `;
  }
}

function triviaDifficultyLabel(value = '') {
  const raw = String(value || 'medium').trim().toLowerCase();
  return raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : 'Medium';
}

function triviaOptionLetter(index = 0) {
  return ['A', 'B', 'C', 'D'][Number(index)] || String(Number(index) + 1);
}

function renderRealtimeTrivia() {
  const qEl = document.getElementById('triv-q');
  const optsEl = document.getElementById('triv-opts');
  const resEl = document.getElementById('triv-res');
  const nextBtn = document.getElementById('triv-next');

  if (!CURRENT_TRIVIA || !qEl || !optsEl) return;

  const points = Number(CURRENT_TRIVIA.points || 100);
  const difficulty = triviaDifficultyLabel(CURRENT_TRIVIA.difficulty);
  const category = triviaDifficultyLabel(CURRENT_TRIVIA.category || 'drivers');

  qEl.innerHTML = `
    <div class="triv-kicker">Paddox Quiz Challenge</div>
    <div class="triv-question-text">${safeText(CURRENT_TRIVIA.question || 'F1 Trivia')}</div>
    <div class="triv-meta-row">
      <span class="triv-chip triv-chip-points">${points} pts</span>
      <span class="triv-chip">${safeText(difficulty)}</span>
      <span class="triv-chip">${safeText(category)}</span>
    </div>
  `;

  optsEl.innerHTML = (CURRENT_TRIVIA.options || []).map((option, index) => `
    <button
      class="topt"
      data-index="${index}"
      onclick="answerRealtimeTrivia(${index})"
      type="button"
    >
      <span class="topt-key">${triviaOptionLetter(index)}</span>
      <span class="topt-text">${safeText(option)}</span>
      <span class="topt-status"></span>
    </button>
  `).join('');

  if (resEl) {
    resEl.className = 'triv-res';
    resEl.style.display = 'none';
    resEl.innerHTML = '';
  }

  if (nextBtn) {
    nextBtn.style.display = 'none';
    nextBtn.textContent = 'Next Question';
  }
}

async function answerRealtimeTrivia(answerIndex) {
  if (TRIVIA_ANSWERED) return;

  try {
    TRIVIA_ANSWERED = true;

    const resEl = document.getElementById('triv-res');
    const nextBtn = document.getElementById('triv-next');
    const optionButtons = [...document.querySelectorAll('.topt')];

    optionButtons.forEach((btn, index) => {
      btn.disabled = true;
      btn.classList.toggle('selected', Number(index) === Number(answerIndex));
    });

    const data = await PaddoxAPI.fan.answerTrivia(
      CURRENT_TRIVIA._id,
      answerIndex
    );

    if (!data.success) {
      throw new Error(data.message || 'Answer failed');
    }

    const result = data.data || data;
    const correctIndex = Number(result.correctIndex);

    optionButtons.forEach((btn, index) => {
      const status = btn.querySelector('.topt-status');
      if (Number(index) === correctIndex) {
        btn.classList.add('correct');
        if (status) status.textContent = 'Correct';
      } else if (Number(index) === Number(answerIndex) && !result.correct) {
        btn.classList.add('wrong');
        if (status) status.textContent = 'Wrong';
      } else {
        btn.classList.add('dimmed');
      }
    });

    if (resEl) {
      const earned = Number(result.pointsEarned || 0);
      resEl.className = `triv-res ${result.correct ? 'triv-res-correct' : 'triv-res-wrong'}`;
      resEl.style.display = 'block';
      resEl.innerHTML = result.correct
        ? `<strong>Correct answer!</strong><span>+${earned} Fan Points added to your grid score.</span>`
        : `<strong>Wrong answer</strong><span>Correct answer: ${safeText(result.correctAnswer || '')}</span>`;
    }

    if (nextBtn) nextBtn.style.display = 'inline-flex';

    if (result.correct) {
      showPointsBurst(`+${result.pointsEarned || 0} pts`);
      loadFanLeaderboard();
    }

  } catch (err) {
    console.error(err);
    TRIVIA_ANSWERED = false;
    document.querySelectorAll('.topt').forEach(btn => {
      btn.disabled = false;
      btn.classList.remove('selected');
    });
    showToast(`${err.message}`);
  }
}

document
  .getElementById('triv-next')
  ?.addEventListener('click', loadRealtimeTrivia);

/* Live Feed */
function feedPostId(post = {}) {
  return String(post._id || post.id || '');
}

function replaceFeedPost(updatedPost = {}) {
  const id = feedPostId(updatedPost);
  if (!id) return;
  LIVE_FEED_POSTS = LIVE_FEED_POSTS.map(post =>
    feedPostId(post) === id ? { ...post, ...updatedPost } : post
  );
}

function renderFeedComments(post = {}) {
  const comments = Array.isArray(post.comments) ? post.comments : [];
  const postId = feedPostId(post);
  const shown = comments.slice(-3);

  return `
    <div class="feed-comments" id="feed-comments-${postId}">
      ${shown.length ? `
        <div class="feed-comments-list">
          ${shown.map(comment => {
            const user = comment.user || {};
            const cname = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Paddox Fan';
            const commentId = String(comment._id || comment.id || '');
            const canDelete = !!comment.canDeleteComment && !!commentId;
            return `
              <div class="feed-comment-item" data-comment-id="${escapeHTML(commentId)}">
                <div class="feed-comment-av">${initialsFromName(cname)}</div>
                <div class="feed-comment-body">
                  <div class="feed-comment-meta">
                    <strong>@${escapeHTML(cname.replace(/\s+/g,'').toLowerCase())}</strong>
                    ${canDelete ? `<button class="feed-delete-btn feed-comment-delete-btn" type="button" title="Delete comment" aria-label="Delete comment" onclick="deleteFanPostComment('${postId}','${commentId}')"><span class="feed-delete-icon" aria-hidden="true"></span></button>` : ''}
                  </div>
                  <span>${escapeHTML(comment.text || '')}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>` : ''}
      <div class="feed-comment-box" id="feed-comment-box-${postId}">
        <input id="feed-comment-input-${postId}" type="text" maxlength="220" placeholder="Add a comment..." onkeydown="if(event.key==='Enter') submitFanPostComment('${postId}')" />
        <button type="button" onclick="submitFanPostComment('${postId}')">Post</button>
      </div>
    </div>
  `;
}

function renderFanFeed(posts = LIVE_FEED_POSTS) {
  const feedEl = document.getElementById('live-feed');

  if (!feedEl) return;

  if (!posts.length) {
    updateFanPointsDock({ posts: 0 });
    feedEl.innerHTML = `
      <div class="feed-empty fh-action-empty">
        <div class="fh-empty-mark fh-mark-feed"></div>
        <strong>No fan posts yet</strong>
        <span>Be the first on the PADDOX grid. Share a race thought above.</span>
      </div>
    `;
    return;
  }

  updateFanPointsDock({ posts: posts.length });

  feedEl.innerHTML = posts.map(post => {
    const user = post.user || {};
    const name =
      `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
      post.userName ||
      'Paddox Fan';

    const safeName = escapeHTML(name);
    const safeText = escapeHTML(post.text || '');
    const avatar = user.avatar?.url || post.avatar || '';
    const handle = safeName.replace(/\s+/g, '').toLowerCase();
    const likes = Number(post.likesCount || post.likedBy?.length || post.likes || 0);
    const commentsCount = Number(post.commentsCount || post.comments?.length || 0);
    const postId = feedPostId(post);
    const liked = !!post.likedByCurrentUser;
    const canDeletePost = !!post.canDeletePost;

    return `
      <div class="feed-item premium" data-post-id="${postId}">
        <div class="feed-av">
          ${avatar && avatar.startsWith('http')
            ? `<img src="${escapeHTML(avatar)}" alt="${safeName}">`
            : `<span>${initialsFromName(name)}</span>`}
        </div>

        <div class="feed-main">
          <div class="feed-head">
            <div>
              <div class="feed-user">@${handle || 'paddoxfan'}</div>
              <div class="feed-role">PADDOX GRID MEMBER</div>
            </div>
            <div class="feed-head-right">
              <div class="feed-time">${timeAgo(post.createdAt)}</div>
              ${canDeletePost ? `<button class="feed-delete-btn feed-post-delete-btn" type="button" title="Delete post" aria-label="Delete post" onclick="deleteFanPost('${postId}')"><span class="feed-delete-icon" aria-hidden="true"></span></button>` : ''}
            </div>
          </div>
          <div class="feed-txt">${safeText}</div>
          <div class="feed-actions">
            <button class="feed-action-btn like ${liked ? 'on' : ''}" type="button" onclick="toggleFanPostLike('${postId}')"><span class="feed-action-icon feed-like-icon" aria-hidden="true"></span><span>${liked ? 'Liked' : 'Like'}</span><strong>${likes}</strong></button>
            <button class="feed-action-btn comment" type="button" onclick="toggleFanPostCommentBox('${postId}')"><span class="feed-action-icon feed-comment-icon" aria-hidden="true"></span><span>Comment</span><strong>${commentsCount}</strong></button>
            <button class="feed-action-btn share" type="button" onclick="navigator.clipboard?.writeText(this.closest('.feed-item').querySelector('.feed-txt')?.textContent || ''); showToast('Post copied')"><span class="feed-action-icon feed-share-icon" aria-hidden="true"></span><span>Share</span></button>
          </div>
          ${renderFeedComments(post)}
        </div>
      </div>
    `;
  }).join('');
}

async function toggleFanPostLike(postId) {
  if (!fanToken()) {
    fanLoginRequired();
    return;
  }

  try {
    const data = await PaddoxAPI.fan.likePost(postId);

    if (!data.success) {
      throw new Error(data.message || 'Like failed');
    }

    const updated = data.data?.post || data.post;
    if (updated) {
      replaceFeedPost(updated);
      renderFanFeed();
    } else {
      await loadFanFeed();
    }
  } catch (err) {
    console.error(err);
    showToast(`${err.message}`);
  }
}

function toggleFanPostCommentBox(postId) {
  if (!fanToken()) {
    fanLoginRequired();
    return;
  }

  const box = document.getElementById(`feed-comment-box-${postId}`);
  if (!box) return;
  box.classList.toggle('open');
  if (box.classList.contains('open')) {
    setTimeout(() => document.getElementById(`feed-comment-input-${postId}`)?.focus(), 80);
  }
}

async function submitFanPostComment(postId) {
  if (!fanToken()) {
    fanLoginRequired();
    return;
  }

  const input = document.getElementById(`feed-comment-input-${postId}`);
  const text = String(input?.value || '').trim();

  if (!text) {
    showToast('Write a comment first');
    return;
  }

  try {
    const data = await PaddoxAPI.fan.commentPost(postId, text);

    if (!data.success) {
      throw new Error(data.message || 'Comment failed');
    }

    if (input) input.value = '';

    const updated = data.data?.post || data.post;
    if (updated) {
      replaceFeedPost(updated);
      renderFanFeed();
    } else {
      await loadFanFeed();
    }

    showToast(data.message || 'Comment added');
    showPointsBurst('+5 pts');
    await loadFanLeaderboard();
  } catch (err) {
    console.error(err);
    showToast(`${err.message}`);
  }
}


async function deleteFanPost(postId) {
  if (!fanToken()) {
    fanLoginRequired();
    return;
  }

  if (!confirm('Delete this post from the Fan Hub?')) return;

  try {
    const data = await PaddoxAPI.fan.deletePost(postId);

    if (!data.success) {
      throw new Error(data.message || 'Delete post failed');
    }

    LIVE_FEED_POSTS = LIVE_FEED_POSTS.filter(post => feedPostId(post) !== String(postId));
    renderFanFeed();
    showToast(data.message || 'Post deleted');
    await loadFanLeaderboard();
  } catch (err) {
    console.error(err);
    showToast(`${err.message}`);
  }
}

async function deleteFanPostComment(postId, commentId) {
  if (!fanToken()) {
    fanLoginRequired();
    return;
  }

  if (!confirm('Delete this comment?')) return;

  try {
    const data = await PaddoxAPI.fan.deleteComment(postId, commentId);

    if (!data.success) {
      throw new Error(data.message || 'Delete comment failed');
    }

    const updated = data.data?.post || data.post;
    if (updated) {
      replaceFeedPost(updated);
      renderFanFeed();
    } else {
      await loadFanFeed();
    }

    showToast(data.message || 'Comment deleted');
  } catch (err) {
    console.error(err);
    showToast(`${err.message}`);
  }
}

window.toggleFanPostLike = toggleFanPostLike;
window.toggleFanPostCommentBox = toggleFanPostCommentBox;
window.submitFanPostComment = submitFanPostComment;
window.deleteFanPost = deleteFanPost;
window.deleteFanPostComment = deleteFanPostComment;

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
    showToast('Write something first');
    return;
  }

  if (!fanToken()) {
    fanLoginRequired();
    return;
  }

  try {
    showToast('Posting to live feed...');

    const data = await (PaddoxAPI.fan.post || PaddoxAPI.fan.postFeed)(text);

    if (!data.success) {
      throw new Error(data.message || 'Post failed');
    }

    input.value = '';
    updateFeedCharCount();

    showToast(data.message || 'Posted! +20 Fan Points');
    showPointsBurst('+20 pts');

    await loadFanFeed();
    await loadFanLeaderboard();

  } catch (err) {
    console.error(err);
    showToast(`${err.message}`);
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
      const livePost = post.post || {
        text: post.text,
        userName: post.user,
        avatar: post.avatar,
        createdAt: new Date().toISOString()
      };

      const liveId = feedPostId(livePost);
      if (!liveId || !LIVE_FEED_POSTS.some(item => feedPostId(item) === liveId)) {
        LIVE_FEED_POSTS.unshift(livePost);
      }

      LIVE_FEED_POSTS = LIVE_FEED_POSTS.slice(0, 20);
      renderFanFeed();
    });

    socket.on('fan:post-like', payload => {
      const target = LIVE_FEED_POSTS.find(post => feedPostId(post) === String(payload.postId));
      if (target) {
        target.likesCount = payload.likesCount;
        renderFanFeed();
      }
    });

    socket.on('fan:post-comment', payload => {
      if (payload.post) {
        replaceFeedPost(payload.post);
        renderFanFeed();
      }
    });

    socket.on('fan:post-delete', payload => {
      const deletedId = String(payload?.postId || '');
      if (!deletedId) return;
      LIVE_FEED_POSTS = LIVE_FEED_POSTS.filter(post => feedPostId(post) !== deletedId);
      renderFanFeed();
    });

    socket.on('poll:vote-update', payload => {
      if (!CURRENT_POLL || payload.pollId !== CURRENT_POLL._id) return;

      CURRENT_POLL.options = payload.options;
      CURRENT_POLL.totalVotes = payload.totalVotes;
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

console.log('%cPADDOX — Fan Hub Loaded','color:#e8002d;font-size:14px;font-weight:bold;');