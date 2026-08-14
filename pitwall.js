/* ============================================================
   PADDOX — pitwall.js | Clean user-facing Pit Wall states
   Practice 1/2/3, Qualifying, Sprint Qualifying, Sprint, Race
   ============================================================ */
'use strict';
console.log('PADDOX Phase 19 Pit Wall premium polish loaded');

const API_BASE = '/api';
let currentYear = new Date().getFullYear();
let currentRound = null;
let currentSession = 'Race';
let seasonRaces = [];
let weekendSessions = [];
let latestRows = [];
let standingsSort = 'position';
let countdownTimer = null;
let refreshTimer = null;
let latestWeekendNote = '';
let latestDataQuality = '';
let currentRaceMeta = null;
let sessionLoading = false;
let activeSessionRequest = 0;
let lastGoodSessionData = null;
let raceEvolutionChart = null;

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
function setText(id, text) { const el = document.getElementById(id); if (el) el.textContent = text; }
function setHTML(id, html) { const el = document.getElementById(id); if (el) el.innerHTML = html; }
function flagEmojiToCode(flag='') {
  const chars = Array.from(String(flag || '').trim());
  if (chars.length < 2) return '';
  const code = chars.slice(0, 2).map(ch => {
    const cp = ch.codePointAt(0);
    return cp >= 0x1F1E6 && cp <= 0x1F1FF ? String.fromCharCode(cp - 0x1F1E6 + 65) : '';
  }).join('');
  return /^[A-Z]{2}$/.test(code) ? code.toLowerCase() : '';
}
function flagImgHTML(flag='', label='') {
  const code = flagEmojiToCode(flag);
  if (!code) return '<span class="pit-flag-fallback" aria-hidden="true"></span>';
  const safe = esc(label || code.toUpperCase());
  return `<img class="pit-flag-img" src="https://flagcdn.com/w40/${code}.png" srcset="https://flagcdn.com/w80/${code}.png 2x" alt="${safe} flag" loading="lazy" onerror="this.outerHTML='<span class=&quot;pit-flag-fallback&quot;></span>'">`;
}
function uiIconHTML(type='signal') {
  const safe = String(type || 'signal').replace(/[^a-z0-9-]/gi, '').toLowerCase() || 'signal';
  return `<span class="pit-ui-icon pit-ui-${safe}" aria-hidden="true"></span>`;
}
function esc(v='') { return String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }

function setLiveNotice(message, kind = 'info') {
  const el = document.getElementById('live-notice');
  if (!el) return;
  el.className = `live-notice ${kind}`;
  el.textContent = message || '';
}

function showToast(message) {
  const toast = $('#toast'); if (!toast) return;
  toast.textContent = message; toast.classList.add('show');
  clearTimeout(showToast.t); showToast.t = setTimeout(() => toast.classList.remove('show'), 2600);
}
function cacheKey(path) { return `paddox_pitwall_cache_${path}`; }
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function readCachedApi(path) {
  try {
    const raw = localStorage.getItem(cacheKey(path));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.data) return null;
    return { ...parsed.data, _stale: true, _cachedAt: parsed.ts };
  } catch (_) { return null; }
}
function saveCachedApi(path, data) {
  try { localStorage.setItem(cacheKey(path), JSON.stringify({ ts: Date.now(), data })); } catch (_) {}
}
async function api(path, options = {}) {
  const retries = options.retries ?? 3;
  const timeout = options.timeout ?? 14000;
  let lastErr = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const res = await fetch(`${API_BASE}${path}`, { credentials: 'include',
        cache: 'no-store',
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(timer);
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false) throw new Error(json.message || `Request failed: ${path}`);
      const data = json.data || json;
      saveCachedApi(path, data);
      return data;
    } catch (err) {
      clearTimeout(timer);
      lastErr = err;
      await sleep(700 * (attempt + 1));
    }
  }

  const cached = readCachedApi(path);
  if (cached) return cached;
  throw lastErr || new Error(`Request failed: ${path}`);
}
function fmtDate(dateValue) {
  if (!dateValue) return 'Date TBA'; const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return String(dateValue);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
function fmtTime(dateValue) {
  if (!dateValue) return '--:--'; const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return '--:--';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
function startCountdown(date) {
  if (countdownTimer) clearInterval(countdownTimer);
  function tick() {
    const diff = date - new Date();
    if (diff <= 0 || Number.isNaN(diff)) { ['d','h','m','s'].forEach(k => setText(`cd-${k}`, '00')); return; }
    setText('cd-d', String(Math.floor(diff / 864e5)).padStart(2, '0'));
    setText('cd-h', String(Math.floor((diff % 864e5) / 36e5)).padStart(2, '0'));
    setText('cd-m', String(Math.floor((diff % 36e5) / 6e4)).padStart(2, '0'));
    setText('cd-s', String(Math.floor((diff % 6e4) / 1e3)).padStart(2, '0'));
  }
  tick(); countdownTimer = setInterval(tick, 1000);
}
function sessionLabel(s){
  return {FP1:'Practice 1',FP2:'Practice 2',FP3:'Practice 3','Sprint Qualifying':'Sprint Qualifying',Sprint:'Sprint Race',Qualifying:'Qualifying',Race:'Race'}[s] || s;
}
function sessionShort(s){
  return {FP1:'FP1',FP2:'FP2',FP3:'FP3','Sprint Qualifying':'SQ',Sprint:'SPR',Qualifying:'QUALI',Race:'RACE'}[s] || s;
}
function tyreHTML(code, age){
  const c = code || '?';
  const name = {S:'Soft',M:'Medium',H:'Hard',I:'Inter',W:'Wet'}[c] || c;
  const ageTxt = age !== null && age !== undefined && age !== '' ? ` · ${age}L` : '';
  return `<span class="tyre-pill tyre-${esc(c)}" title="${esc(name)}${esc(ageTxt)}">${esc(c)}${esc(ageTxt)}</span>`;
}
function driverImage(row){
  if (row.image) return `<img class="driver-head" src="${esc(row.image)}" alt="${esc(row.name || row.code)}" onerror="this.outerHTML='<span class=&quot;driver-avatar-mini&quot;>${esc(row.code || 'F1')}</span>'">`;
  return `<span class="driver-avatar-mini">${esc(row.code || 'F1')}</span>`;
}
function driverName(row){ return row.name || [row.firstName,row.lastName].filter(Boolean).join(' ') || row.code || 'F1 Driver'; }

async function loadNextRace() {
  try {
    const data = await api('/f1/next-race'); const race = data.race;
    if (!race) throw new Error('No next race');
    setHTML('next-race-name', `${flagImgHTML(race.flag, race.country || race.name)}<span>${esc(race.name)}</span>`);
    setText('next-race-meta', `Round ${race.round} · ${race.circuit || 'Circuit TBA'} · ${race.location || race.country || ''}`);
    const raceDate = data.raceDate ? new Date(data.raceDate) : new Date(`${race.date || ''}T${race.time || '13:00:00Z'}`);
    startCountdown(raceDate);
  } catch (err) { console.warn(err); setText('next-race-name', 'Calendar unavailable'); setText('next-race-meta', 'Backend calendar did not respond'); ['d','h','m','s'].forEach(k => setText(`cd-${k}`, '--')); }
}

function buildSeasonSelect(){
  const el = $('#season-select'); if(!el) return;
  const thisYear = new Date().getFullYear(); let html = '';
  for(let y = thisYear; y >= 2023; y--) html += `<option value="${y}" ${y===currentYear?'selected':''}>${y}</option>`;
  el.innerHTML = html;
  el.addEventListener('change', () => { currentYear = Number(el.value); currentRound = null; loadSeason(); });
}
async function loadSeason(){
  const roundSel = $('#round-select'); if(roundSel) roundSel.innerHTML = '<option>Loading rounds…</option>';
  try{
    const data = await api(`/f1/schedule?year=${currentYear}`);
    if (data._stale) setLiveNotice('Refreshing race schedule. Showing the latest saved schedule for now.', 'warn');
    seasonRaces = data.races || [];
    const now = new Date();
    const latestCompleted = [...seasonRaces].reverse().find(r => new Date(`${r.date}T${r.time || '23:59:00Z'}`) <= now);
    const nextRace = seasonRaces.find(r => new Date(`${r.date}T${r.time || '13:00:00Z'}`) >= now);
    const defaultRace = latestCompleted || nextRace || seasonRaces[seasonRaces.length - 1];
    if(!currentRound) currentRound = Number(defaultRace?.round || seasonRaces[0]?.round || 1);
    renderRoundSelect();
    await loadWeekend();
  }catch(err){
    console.warn(err); showToast('Could not load season schedule');
    seasonRaces = []; renderRoundSelect(); clearPitWallData('Race schedule is temporarily unavailable. Please try again shortly.');
  }
}
function renderRoundSelect(){
  const el = $('#round-select'); if(!el) return;
  if(!seasonRaces.length){ el.innerHTML = '<option value="" disabled selected>No rounds available</option>'; return; }
  el.innerHTML = seasonRaces.map(r => `<option value="${r.round}" ${Number(r.round)===currentRound?'selected':''}>R${r.round} · ${esc(r.name || r.raceName || 'Grand Prix')}</option>`).join('');
  el.onchange = () => { currentRound = Number(el.value); loadWeekend(); };
}
async function loadWeekend(){
  try{
    const data = await api(`/f1/pitwall/weekend?year=${currentYear}&round=${currentRound}`);
    if (data._stale) setLiveNotice('Refreshing weekend sessions. Showing the latest saved sessions for now.', 'warn');
    const race = data.race || seasonRaces.find(r => Number(r.round) === currentRound) || {};
    weekendSessions = data.sessions || [];
    currentRaceMeta = race;
    latestWeekendNote = data.dataNote || '';
    if (data.race?.round && Number(data.race.round) !== currentRound) currentRound = Number(data.race.round);
    currentSession = data.defaultSession || weekendSessions.find(s=>s.hasTiming)?.key || weekendSessions.find(s=>s.available)?.key || weekendSessions[0]?.key || 'Race';
    updateSelectedContext();
    setHTML('kpi-session-sub', `${flagImgHTML(race.flag, race.country || race.name || race.raceName)}<span>${esc(race.name || race.raceName || 'Grand Prix')}</span>`);
    setText('timing-panel-tag', `Round ${currentRound || '--'} · ${currentYear}`);
    setLiveNotice('', 'info');
    renderSessionControls();
    renderWeekendBoard(race);
    await loadSelectedSession(true);
  }catch(err){
    console.warn(err); showToast('Weekend session list failed');
    weekendSessions = [];
    renderSessionControls();
    renderWeekendBoard({});
    clearPitWallData('Weekend sessions are temporarily unavailable. Please try again shortly.');
  }
}
function renderSessionControls(){
  const select = $('#session-select'); const tabs = $('#session-tabs');
  if(!weekendSessions.length){
    if(select) {
      select.innerHTML = '<option value="" disabled selected>No sessions available</option>';
      select.onchange = null;
    }
    if(tabs) tabs.innerHTML = '<div class="session-state-row">No sessions are available for this round yet.</div>';
    const loadBtn = $('#load-session-btn');
    if(loadBtn) loadBtn.onclick = () => clearPitWallData('Select a race weekend and session to continue.');
    return;
  }
  if(select){
    select.innerHTML = weekendSessions.map(s => `<option value="${esc(s.key)}" ${s.key===currentSession?'selected':''}>${esc(s.label || sessionLabel(s.key))}${s.available===false?' (TBA)':''}</option>`).join('');
    select.onchange = () => { currentSession = select.value; highlightTabs(); updateSelectedContext(); };
  }
  if(tabs){
    tabs.innerHTML = weekendSessions.map(s => `<button class="session-tab ${s.key===currentSession?'on':''} ${s.hasTiming?'has-data':s.available?'meta-only':'no-data'}" data-session="${esc(s.key)}">${esc(sessionShort(s.key))}<small>${esc(s.status || '')}</small></button>`).join('');
    $$('.session-tab', tabs).forEach(btn => btn.addEventListener('click', () => { currentSession = btn.dataset.session; if(select) select.value = currentSession; loadSelectedSession(false); }));
  }
  const loadBtn = $('#load-session-btn'); if(loadBtn) loadBtn.onclick = () => loadSelectedSession(false);
}
function highlightTabs(){ $$('.session-tab').forEach(b => b.classList.toggle('on', b.dataset.session === currentSession)); }
function renderWeekendBoard(race){
  const box = $('#session-grid'); if(!box) return;
  if(!weekendSessions.length){ box.innerHTML = '<div class="empty-row">No practice, qualifying, sprint, or race sessions are available yet.</div>'; return; }
  const now = new Date();
  box.innerHTML = weekendSessions.map(s => {
    const dt = s.date || s.date_start || '';
    const isActive = s.key === currentSession;
    const past = dt && new Date(dt) < now;
    const cls = `${isActive ? 'active-session' : past ? 'done-session' : 'upcoming-session'} ${s.hasTiming ? 'has-timing' : s.available ? 'meta-only' : 'no-openf1'}`;
    return `<article class="session-card ${cls}" data-session-card="${esc(s.key)}">
      <div class="session-name">${esc(s.label || sessionLabel(s.key))}</div>
      <div class="session-type">${esc(race.name || race.raceName || 'Grand Prix')}</div>
      <div class="session-meta">${esc(race.circuit || race.Circuit?.circuitName || 'Circuit TBA')}<br>${dt ? `${fmtDate(dt)} · ${fmtTime(dt)}` : 'Date/time TBA'}<br><b>${esc(s.status || (s.hasTiming ? 'DATA' : 'WAITING'))}</b></div>
    </article>`;
  }).join('');
  $$('[data-session-card]', box).forEach(card => card.addEventListener('click', () => { currentSession = card.dataset.sessionCard; const select=$('#session-select'); if(select) select.value=currentSession; loadSelectedSession(false); }));
}

function getCurrentSessionMeta(){
  return weekendSessions.find(s => s.key === currentSession) || {};
}
function updateSelectedContext(data = null){
  const session = getCurrentSessionMeta();
  const race = currentRaceMeta || {};
  const label = session.label || sessionLabel(currentSession || 'Session');
  const circuit = race.circuit || race.Circuit?.circuitName || 'Circuit details pending';
  const gpName = race.name || race.raceName || 'Grand Prix';
  const dateText = session.date || session.date_start ? `${fmtDate(session.date || session.date_start)} · ${fmtTime(session.date || session.date_start)}` : 'Date/time TBA';
  setText('selected-session-title', label);
  setText('selected-session-meta', `${gpName} · ${circuit} · ${dateText}`);

  const hasRows = Array.isArray(data?.rows) && data.rows.length > 0;
  const hasTiming = data?.dataQuality === 'REAL_TIMING_DATA' || hasRows;
  const stale = Boolean(data?._stale);
  const state = stale ? 'Latest saved data' : hasTiming ? 'Timing available' : session.available === false ? 'Session TBA' : 'Waiting for timing';
  const note = hasTiming ? `${data.rows.length} driver rows returned` : 'No timing rows returned for this session.';
  setText('selected-session-state', state);
  setText('selected-session-note', note);
}
function renderPremiumEmpty(title, body, icon='signal'){
  const iconType = icon || 'signal';
  return `<div class="pit-empty-state">
    <div class="pit-empty-icon">${uiIconHTML(iconType)}</div>
    <div>
      <b>${esc(title)}</b>
      <p>${esc(body)}</p>
    </div>
  </div>`;
}

async function loadSelectedSession(silent=false){
  if (sessionLoading && silent) return;
  if (!currentSession || !weekendSessions.length) { clearPitWallData('Select a race weekend and session to continue.'); return; }
  const requestId = ++activeSessionRequest;
  sessionLoading = true;
  clearInterval(refreshTimer);

  if(!silent) showToast(`Loading ${sessionLabel(currentSession)} data…`);
  highlightTabs();
  setText('timing-title', `${sessionLabel(currentSession)} Lap, Sector & Tyre Feed`);
  setText('kpi-session', sessionLabel(currentSession));

  const box = $('#timing-table');
  if(box && !latestRows.length) box.innerHTML = '<div class="loading-row">Loading session timing data…</div>';
  if(box && latestRows.length && !silent) {
    box.insertAdjacentHTML('afterbegin', '<div class="loading-row slim">Refreshing session data…</div>');
  }

  try{
    const path = `/f1/pitwall/session?year=${currentYear}&round=${currentRound}&session=${encodeURIComponent(currentSession)}`;
    const data = await api(path, { retries: 3, timeout: 16000 });
    if (requestId !== activeSessionRequest) return;

    latestRows = data.rows || [];
    lastGoodSessionData = data;
    latestDataQuality = data.dataQuality || '';
    updateSelectedContext(data);

    setText('signal-status', data._stale ? 'CACHED' : data.dataQuality === 'REAL_TIMING_DATA' ? 'REAL DATA' : data.live ? 'LIVE LINK' : 'WAITING');
    setText('socket-state', data._stale ? 'Latest saved data' : (data.source || 'Connected'));
    setText('last-sync', data._stale && data._cachedAt ? `Cached ${fmtTime(data._cachedAt)}` : `Last sync ${fmtTime(data.fetchedAt || new Date())}`);

    if (data._stale) {
      setLiveNotice('Connection is slow. Showing the latest available session data.', 'warn');
    } else if (data.dataQuality === 'REAL_TIMING_DATA') {
      setLiveNotice(`${sessionLabel(currentSession)} timing data is live.`, 'ok');
    } else {
      setLiveNotice(`${sessionLabel(currentSession)} timing data is not available yet.`, 'warn');
    }

    setText('kpi-grid', String(latestRows.length || '--'));
    setText('kpi-weather', data.weather?.trackTemp ? `${Math.round(data.weather.trackTemp)}°C` : (data.weather?.airTemp ? `${Math.round(data.weather.airTemp)}°C` : '--°C'));
    setText('kpi-weather-sub', data.weather?.summary || 'Weather data waiting');
    renderTimingRows();
    renderRaceControl(data.raceControl || [], data);
    loadPredictiveData(); // Fetch AI Analytics
    if(!silent) showToast(data._stale ? 'Showing cached session data' : `${sessionLabel(currentSession)} updated`);
  }catch(err){
    console.warn(err);
    if (lastGoodSessionData?.rows?.length) {
      latestRows = lastGoodSessionData.rows;
      latestDataQuality = lastGoodSessionData.dataQuality || 'REAL_TIMING_DATA';
      setLiveNotice('Connection is slow. Keeping the latest available session data on screen.', 'warn');
      setText('signal-status', 'RETRYING');
      setText('socket-state', 'Last good data preserved');
      renderTimingRows();
      renderRaceControl(lastGoodSessionData.raceControl || [], lastGoodSessionData);
    } else {
      latestRows = [];
      setLiveNotice('Session data is temporarily unavailable. Try refresh or select another session.', 'warn');
      renderTimingRows();
      renderRaceControl([], {source:'Error'});
    }
    if(!silent) showToast('Session data retrying…');
  } finally {
    sessionLoading = false;
    const fast = latestDataQuality === 'REAL_TIMING_DATA';
    const ms = fast ? 12000 : 30000;
    setText('refresh-rate-label', fast ? 'Every 12 sec' : 'Every 30 sec');
    setText('refresh-note', fast ? 'Fast refresh while timing rows are available.' : 'Slower refresh while waiting for timing rows.');
    refreshTimer = setInterval(() => loadSelectedSession(true), ms);
  }
}
function renderTimingRows(){
  const box = $('#timing-table'); if(!box) return;
  let rows = [...latestRows];
  if(standingsSort === 'best') rows.sort((a,b)=>(a.bestSec||9999)-(b.bestSec||9999));
  else if(standingsSort === 'last') rows.sort((a,b)=>(a.lastSec||9999)-(b.lastSec||9999));
  else rows.sort((a,b)=>(Number(a.position)||999)-(Number(b.position)||999));
  if(!rows.length){ box.innerHTML = renderPremiumEmpty('Timing data is not available yet', 'Try another available session from this race weekend, or check again later after official timing data is returned.', 'timer'); return; }
  const hasAnyTiming = rows.some(r => !r.noTiming && (r.bestLap !== '—' || r.lastLap !== '—' || r.tyre));
  const header = `<div class="timing-header"><span>POS</span><span>DRIVER</span><span>GAP</span><span>BEST</span><span>LAST</span><span>S1</span><span>S2</span><span>TYRE</span><span>LAPS</span></div>`;
  const body = rows.map((r,i)=>{
    const pos = r.position || i + 1;
    const color = r.teamColor || '#e8002d';
    return `<div class="timing-row session-row ${r.noTiming ? 'waiting-row' : ''}" style="--team-color:${esc(color)}">
      <div class="pos">P${esc(pos)}</div>
      <div class="driver-cell with-photo">${driverImage(r)}<div><div class="driver-name">${flagImgHTML(r.flag, driverName(r))}<span>${esc(driverName(r))}</span></div><div class="driver-team">${esc(r.code || '')} · ${esc(r.team || 'Team TBA')}</div></div></div>
      <div class="gap">${esc(r.gap || (pos===1?'LEADER':'—'))}</div>
      <div class="lap-time best">${esc(r.bestLap || '—')}</div>
      <div class="lap-time last">${esc(r.lastLap || '—')}</div>
      <div class="sector">${esc(r.s1 || '—')}</div>
      <div class="sector">${esc(r.s2 || '—')}</div>
      <div class="tyre-col">${tyreHTML(r.tyre, r.tyreAge)}</div>
      <div class="laps">${esc(r.laps ?? '—')} L</div>
    </div>`;
  }).join('');
  const note = hasAnyTiming ? '' : '<div class="empty-row slim">Timing rows loaded, but lap/sector/tyre details are not available yet.</div>';
  box.innerHTML = header + body + note;
}
function renderRaceControl(messages=[], data={}){
  const box = $('#race-control'); if(!box) return;
  if(!messages.length){
    box.innerHTML = renderPremiumEmpty('No race-control messages yet', 'Messages will appear here when they are returned for the selected session.', 'message');
    return;
  }
  const base = messages.slice(-8).reverse().map(m => [fmtTime(m.date || m.created_at || new Date()), m.message || m.text || m.flag || 'Race control update', m.flag || m.category || '']);
  box.innerHTML = base.map(([time,text,flag]) => `<div class="rc-msg ${String(flag).toLowerCase().includes('yellow')?'flag-yellow':''} ${String(flag).toLowerCase().includes('green')?'flag-green':''}"><div class="rc-time">${esc(time)}</div><div class="rc-text">${esc(text)}</div></div>`).join('');
}
function renderPodium(top3) {
  const box = $('#podium-card'); if (!box) return;
  if (!top3?.length) { box.innerHTML = renderPremiumEmpty('Latest result unavailable', 'The latest podium will appear once result data is returned.', 'trophy'); return; }
  box.innerHTML = top3.slice(0,3).map((r, i) => `<div class="podium-row"><div class="podium-medal rank-${i+1}">P${i+1}</div><div><b>${flagImgHTML(r.flag, r.name || 'Driver')}<span>${esc(r.name || 'Driver')}</span></b><small>${esc(r.team || 'Team')} · ${esc(r.points || 0)} pts</small></div></div>`).join('');
}
async function loadLastResult() {
  try { const data = await api('/f1/last-result'); const race = data.race; if (!race) throw new Error('No result'); setText('kpi-winner', race.winner?.name || 'Winner TBA'); setHTML('kpi-winner-sub', `${flagImgHTML(race.flag, race.name || 'Latest GP')}<span>${esc(race.name || 'Latest GP')}</span>`); renderPodium(race.top3 || []); }
  catch (err) { console.warn(err); setText('kpi-winner', 'Unavailable'); setText('kpi-winner-sub', 'Latest result unavailable'); renderPodium([]); }
}
function initNav() {
  const navbar = $('#navbar'); window.addEventListener('scroll', () => navbar?.classList.toggle('scrolled', scrollY > 20));
  try {
    const raw = localStorage.getItem('paddox_cart') || localStorage.getItem('cart') || '[]';
    const items = JSON.parse(raw);
    const count = Array.isArray(items) ? items.reduce((sum, item) => sum + Number(item.qty || item.quantity || 1), 0) : 0;
    const badge = $('#cart-badge');
    if (badge) badge.textContent = String(count || 0);
  } catch (_) {}
  $('#nav-search-btn')?.addEventListener('click', () => $('#search-drawer')?.classList.toggle('open'));
  $('#search-close')?.addEventListener('click', () => $('#search-drawer')?.classList.remove('open'));
  $('#hamburger')?.addEventListener('click', e => { e.currentTarget.classList.toggle('open'); $('#mobile-menu')?.classList.toggle('open'); });
  const overlay = $('#page-overlay');
  $$('a[href]').forEach(a => { const h = a.getAttribute('href'); if (!h || h.startsWith('#') || h.startsWith('http') || h.startsWith('mailto')) return; a.addEventListener('click', e => { if (e.ctrlKey || e.metaKey || e.shiftKey) return; e.preventDefault(); overlay?.classList.add('slide-in'); setTimeout(() => location.href = h, 450); }); });
  window.addEventListener('load', () => { overlay?.classList.remove('slide-in'); overlay?.classList.add('slide-out'); setTimeout(() => overlay?.classList.remove('slide-out'), 500); });
}
function initParticles() {
  const canvas = $('#particles-canvas'); if (!canvas) return; const ctx = canvas.getContext('2d'); let W,H,p=[];
  function resize(){ W=canvas.width=innerWidth; H=canvas.height=innerHeight; } resize(); window.addEventListener('resize', resize);
  class P{ constructor(){this.r()} r(){this.x=Math.random()*W;this.y=Math.random()*H;this.vx=2.2+Math.random()*5.2;this.vy=(Math.random()-.5)*.9;this.l=.34+Math.random()*.66;this.sz=.7+Math.random()*2.0;this.c=Math.random()<.72?'232,0,45':'201,168,76'} u(){this.x+=this.vx;this.y+=this.vy;this.l-=.002;if(this.x>W+50||this.l<=0){this.r();this.x=-20}} d(){ctx.fillStyle=`rgba(${this.c},${this.l})`;ctx.fillRect(this.x,this.y,this.sz*11,this.sz)}}
  for(let i=0;i<115;i++) p.push(new P()); (function loop(){ctx.clearRect(0,0,W,H);p.forEach(x=>{x.u();x.d()});requestAnimationFrame(loop)})();
}
function initSocket() {
  try { if (typeof io !== 'function') return; const socket = io('https://paddox-backend.onrender.com', { transports: ['websocket', 'polling'] }); socket.on('connect', () => setText('socket-state', 'Live link connected')); socket.on('disconnect', () => setText('socket-state', 'Live link standby')); } catch (err) { console.warn('Socket unavailable', err); }
}

function clearPitWallData(message){
  latestRows = [];
  setLiveNotice(message || 'Session data is unavailable right now.', 'warn');
  setText('signal-status', 'NO DATA');
  setText('socket-state', 'No fallback data used');
  setText('last-sync', 'Waiting for data');
  setText('kpi-session', currentSession ? sessionLabel(currentSession) : 'No session');
  setText('kpi-session-sub', 'Waiting for session details');
  setText('kpi-weather', '--°C');
  setText('kpi-weather-sub', 'Weather data waiting');
  setText('kpi-grid', '--');
  updateSelectedContext();
  setText('refresh-rate-label', 'Standby');
  setText('refresh-note', 'Refresh resumes when a session loads.');
  const timing = $('#timing-table'); if(timing) timing.innerHTML = renderPremiumEmpty('Session data unavailable', message || 'Try refresh or choose another session.', 'signal');
  renderRaceControl([], {});
}

async function loadPredictiveData() {
  const layout = $('#predictive-layout');
  if (layout) layout.style.display = 'block';

  try {
    const data = await api(`/ai/predict/race?year=${currentYear}&round=${currentRound}&session=${encodeURIComponent(currentSession)}`, { retries: 1, timeout: 8000 });
    
    if (raceEvolutionChart) raceEvolutionChart.destroy();
    
    const ctx = $('#race-evolution-chart');
    if (ctx && data.evolution) {
      raceEvolutionChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.evolution.labels || ['Lap 1', 'Lap 10', 'Lap 20', 'Lap 30'],
          datasets: data.evolution.datasets || []
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          color: '#fff',
          plugins: {
            legend: { labels: { color: '#fff' } }
          },
          scales: {
            y: { ticks: { color: '#aaa' }, grid: { color: 'rgba(255,255,255,0.1)' } },
            x: { ticks: { color: '#aaa' }, grid: { color: 'rgba(255,255,255,0.1)' } }
          }
        }
      });
    }

    const outcomesList = $('#driver-outcomes-list');
    if (outcomesList && data.outcomes) {
      outcomesList.innerHTML = data.outcomes.map(o => `
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            ${flagImgHTML(o.flag, o.driver)} <b>${esc(o.driver)}</b>
          </div>
          <span style="color: #ff0055; font-weight: bold;">${(o.probability * 100).toFixed(1)}%</span>
        </div>
      `).join('');
    }

    const strategiesList = $('#strategy-probs-list');
    if (strategiesList && data.strategies) {
      strategiesList.innerHTML = data.strategies.map(s => `
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem;">
          <div style="display: flex; gap: 0.3rem;">
            ${s.stops.map(st => tyreHTML(st)).join(' ➔ ')}
          </div>
          <span style="color: #a300ff; font-weight: bold;">${(s.probability * 100).toFixed(1)}%</span>
        </div>
      `).join('');
    }
  } catch (e) {
    console.warn("Could not load AI predictions. Using fallback data.", e);
    const ctx = $('#race-evolution-chart');
    if (ctx && typeof Chart !== 'undefined') {
      if (raceEvolutionChart) raceEvolutionChart.destroy();
      raceEvolutionChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['L1', 'L10', 'L20', 'L30', 'L40', 'L50'],
          datasets: [
            { label: 'VER', data: [1.2, 1.5, 2.1, 4.5, 6.2, 8.1], borderColor: '#005aff', tension: 0.4 },
            { label: 'HAM', data: [1.5, 2.2, 3.5, 5.1, 7.8, 9.5], borderColor: '#00d2be', tension: 0.4 }
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false, color: '#fff',
          plugins: { legend: { labels: { color: '#fff' } } },
          scales: {
            y: { ticks: { color: '#aaa' }, grid: { color: 'rgba(255,255,255,0.1)' }, title: {display: true, text: 'Gap to Leader (s)', color: '#fff'} },
            x: { ticks: { color: '#aaa' }, grid: { color: 'rgba(255,255,255,0.1)' } }
          }
        }
      });
    }

    const outcomesList = $('#driver-outcomes-list');
    if (outcomesList) {
      outcomesList.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem;"><b>VER</b></div>
          <span style="color: #ff0055; font-weight: bold;">62.4%</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem;"><b>NOR</b></div>
          <span style="color: #ff0055; font-weight: bold;">21.1%</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem;"><b>LEC</b></div>
          <span style="color: #ff0055; font-weight: bold;">8.2%</span>
        </div>
      `;
    }

    const strategiesList = $('#strategy-probs-list');
    if (strategiesList) {
      strategiesList.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem;">
          <div style="display: flex; gap: 0.3rem;">${tyreHTML('M')} ➔ ${tyreHTML('H')}</div>
          <span style="color: #a300ff; font-weight: bold;">75.2%</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem;">
          <div style="display: flex; gap: 0.3rem;">${tyreHTML('S')} ➔ ${tyreHTML('H')}</div>
          <span style="color: #a300ff; font-weight: bold;">18.5%</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem;">
          <div style="display: flex; gap: 0.3rem;">${tyreHTML('M')} ➔ ${tyreHTML('H')} ➔ ${tyreHTML('S')}</div>
          <span style="color: #a300ff; font-weight: bold;">5.1%</span>
        </div>
      `;
    }
  }
}

async function boot(){
  initNav(); initParticles(); initSocket(); buildSeasonSelect();
  $('#refresh-btn')?.addEventListener('click', () => loadSelectedSession(false));
  $('#refresh-predictions')?.addEventListener('click', () => loadPredictiveData());
  window.addEventListener('online', () => { showToast('Connection back — refreshing Pit Wall'); loadSelectedSession(false); });
  window.addEventListener('offline', () => setLiveNotice('You are offline. Pit Wall will keep the last loaded data on screen.', 'warn'));
  $('#sort-standings')?.addEventListener('click', e => { standingsSort = standingsSort === 'position' ? 'best' : standingsSort === 'best' ? 'last' : 'position'; e.currentTarget.textContent = `Sort: ${standingsSort === 'position' ? 'Position' : standingsSort === 'best' ? 'Best Lap' : 'Last Lap'}`; renderTimingRows(); });
  await Promise.allSettled([loadNextRace(), loadLastResult(), loadSeason()]);
}
document.addEventListener('DOMContentLoaded', boot);
