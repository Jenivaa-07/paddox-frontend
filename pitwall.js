/* ============================================================
   PADDOX — pitwall.js | Phase 4.4 Pure API State Upgrade
   Practice 1/2/3, Qualifying, Sprint Qualifying, Sprint, Race
   Backend proxy: /api/f1/pitwall/* so browser does not hit OpenF1 directly
   ============================================================ */
'use strict';

const API_BASE = 'https://paddox-backend.onrender.com/api';
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

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
function setText(id, text) { const el = document.getElementById(id); if (el) el.textContent = text; }
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
      const res = await fetch(`${API_BASE}${path}`, {
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
    setText('next-race-name', `${race.flag || '🏁'} ${race.name}`);
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
    if (data._stale) setLiveNotice('Backend is waking up or OpenF1 is slow — showing last saved schedule until fresh data returns.', 'warn');
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
    seasonRaces = []; renderRoundSelect(); clearPitWallData('Season schedule is unavailable from the backend right now. No fallback rounds are shown.');
  }
}
function renderRoundSelect(){
  const el = $('#round-select'); if(!el) return;
  if(!seasonRaces.length){ el.innerHTML = '<option value="" disabled selected>No API rounds available</option>'; return; }
  el.innerHTML = seasonRaces.map(r => `<option value="${r.round}" ${Number(r.round)===currentRound?'selected':''}>R${r.round} · ${esc(r.name || r.raceName || 'Grand Prix')}</option>`).join('');
  el.onchange = () => { currentRound = Number(el.value); loadWeekend(); };
}
async function loadWeekend(){
  try{
    const data = await api(`/f1/pitwall/weekend?year=${currentYear}&round=${currentRound}`);
    if (data._stale) setLiveNotice('Using cached weekend/session list while backend reconnects. Fresh data will retry automatically.', 'warn');
    const race = data.race || seasonRaces.find(r => Number(r.round) === currentRound) || {};
    weekendSessions = data.sessions || [];
    currentRaceMeta = race;
    latestWeekendNote = data.dataNote || '';
    if (data.race?.round && Number(data.race.round) !== currentRound) currentRound = Number(data.race.round);
    currentSession = data.defaultSession || weekendSessions.find(s=>s.hasTiming)?.key || weekendSessions.find(s=>s.available)?.key || weekendSessions[0]?.key || 'Race';
    setText('kpi-session-sub', `${race.flag || '🏁'} ${race.name || race.raceName || 'Grand Prix'}`);
    setText('timing-panel-tag', `Round ${currentRound || '--'} · ${currentYear}`);
    setLiveNotice(latestWeekendNote, latestWeekendNote.includes('No OpenF1 token') ? 'warn' : 'ok');
    renderSessionControls();
    renderWeekendBoard(race);
    await loadSelectedSession(true);
  }catch(err){
    console.warn(err); showToast('Weekend session list failed');
    weekendSessions = [];
    renderSessionControls();
    renderWeekendBoard({});
    clearPitWallData('Weekend/session list is unavailable from the backend right now. No hardcoded session tabs are shown.');
  }
}
function renderSessionControls(){
  const select = $('#session-select'); const tabs = $('#session-tabs');
  if(!weekendSessions.length){
    if(select) {
      select.innerHTML = '<option value="" disabled selected>No API sessions available</option>';
      select.onchange = null;
    }
    if(tabs) tabs.innerHTML = '<div class="session-state-row">No session list returned by the backend.</div>';
    const loadBtn = $('#load-session-btn');
    if(loadBtn) loadBtn.onclick = () => clearPitWallData('No backend session is selected. Load a season/round that has API sessions.');
    return;
  }
  if(select){
    select.innerHTML = weekendSessions.map(s => `<option value="${esc(s.key)}" ${s.key===currentSession?'selected':''}>${esc(s.label || sessionLabel(s.key))}${s.available===false?' (TBA)':''}</option>`).join('');
    select.onchange = () => { currentSession = select.value; highlightTabs(); };
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
  if(!weekendSessions.length){ box.innerHTML = '<div class="empty-row">No practice/qualifying/sprint/race sessions returned from API.</div>'; return; }
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

async function loadSelectedSession(silent=false){
  if (sessionLoading && silent) return;
  if (!currentSession || !weekendSessions.length) { clearPitWallData('No backend session is selected. Nothing hardcoded is displayed.'); return; }
  const requestId = ++activeSessionRequest;
  sessionLoading = true;
  clearInterval(refreshTimer);

  if(!silent) showToast(`Loading ${sessionLabel(currentSession)} data…`);
  highlightTabs();
  setText('timing-title', `${sessionLabel(currentSession)} Lap, Sector & Tyre Feed`);
  setText('kpi-session', sessionLabel(currentSession));

  const box = $('#timing-table');
  if(box && !latestRows.length) box.innerHTML = '<div class="loading-row">Loading real F1 lap times, tyres and driver images…</div>';
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

    setText('signal-status', data._stale ? 'CACHED' : data.dataQuality === 'REAL_TIMING_DATA' ? 'REAL DATA' : data.live ? 'LIVE LINK' : 'WAITING');
    setText('socket-state', data._stale ? 'Cached fallback active' : (data.source || 'PADDOX backend proxy'));
    setText('last-sync', data._stale && data._cachedAt ? `Cached ${fmtTime(data._cachedAt)}` : `Last sync ${fmtTime(data.fetchedAt || new Date())}`);

    if (data._stale) {
      setLiveNotice('Fresh request failed once, so Pit Wall is showing the last saved real session data. It will keep retrying automatically.', 'warn');
    } else if (data.dataQuality === 'REAL_TIMING_DATA') {
      setLiveNotice(`${sessionLabel(currentSession)} is showing real lap/sector/tyre data from OpenF1 through your backend.`, 'ok');
    } else {
      setLiveNotice(data.message || `${sessionLabel(currentSession)} has no lap/tyre timing records yet. Choose another completed session, or add OPENF1_API_KEY for authenticated live access.`, 'warn');
    }

    setText('kpi-grid', String(latestRows.length || '--'));
    setText('kpi-weather', data.weather?.trackTemp ? `${Math.round(data.weather.trackTemp)}°C` : (data.weather?.airTemp ? `${Math.round(data.weather.airTemp)}°C` : '--°C'));
    setText('kpi-weather-sub', data.weather?.summary || 'Weather data waiting');
    renderTimingRows();
    renderRaceControl(data.raceControl || [], data);
    if(!silent) showToast(data._stale ? 'Showing cached session data' : `${sessionLabel(currentSession)} updated`);
  }catch(err){
    console.warn(err);
    if (lastGoodSessionData?.rows?.length) {
      latestRows = lastGoodSessionData.rows;
      latestDataQuality = lastGoodSessionData.dataQuality || 'REAL_TIMING_DATA';
      setLiveNotice('Backend/OpenF1 did not respond this time. Keeping the last loaded real data on screen and retrying automatically.', 'warn');
      setText('signal-status', 'RETRYING');
      setText('socket-state', 'Last good data preserved');
      renderTimingRows();
      renderRaceControl(lastGoodSessionData.raceControl || [], lastGoodSessionData);
    } else {
      latestRows = [];
      setLiveNotice('Could not reach backend/OpenF1 for this session. No fake timing data is shown. Try Refresh or select another completed session.', 'warn');
      renderTimingRows();
      renderRaceControl([], {source:'Error'});
    }
    if(!silent) showToast('Session data retrying…');
  } finally {
    sessionLoading = false;
    const fast = latestDataQuality === 'REAL_TIMING_DATA';
    refreshTimer = setInterval(() => loadSelectedSession(true), fast ? 12000 : 30000);
  }
}
function renderTimingRows(){
  const box = $('#timing-table'); if(!box) return;
  let rows = [...latestRows];
  if(standingsSort === 'best') rows.sort((a,b)=>(a.bestSec||9999)-(b.bestSec||9999));
  else if(standingsSort === 'last') rows.sort((a,b)=>(a.lastSec||9999)-(b.lastSec||9999));
  else rows.sort((a,b)=>(Number(a.position)||999)-(Number(b.position)||999));
  if(!rows.length){ box.innerHTML = '<div class="empty-row">No real lap/tyre timing data available for this session yet. Select a completed API session from the tabs.</div>'; return; }
  const hasAnyTiming = rows.some(r => !r.noTiming && (r.bestLap !== '—' || r.lastLap !== '—' || r.tyre));
  const header = `<div class="timing-header"><span>POS</span><span>DRIVER</span><span>GAP</span><span>BEST</span><span>LAST</span><span>S1</span><span>S2</span><span>TYRE</span><span>LAPS</span></div>`;
  const body = rows.map((r,i)=>{
    const pos = r.position || i + 1;
    const color = r.teamColor || '#e8002d';
    return `<div class="timing-row session-row ${r.noTiming ? 'waiting-row' : ''}" style="--team-color:${esc(color)}">
      <div class="pos">P${esc(pos)}</div>
      <div class="driver-cell with-photo">${driverImage(r)}<div><div class="driver-name">${esc(r.flag || '')} ${esc(driverName(r))}</div><div class="driver-team">${esc(r.code || '')} · ${esc(r.team || 'Team TBA')}</div></div></div>
      <div class="gap">${esc(r.gap || (pos===1?'LEADER':'—'))}</div>
      <div class="lap-time best">${esc(r.bestLap || '—')}</div>
      <div class="lap-time last">${esc(r.lastLap || '—')}</div>
      <div class="sector">${esc(r.s1 || '—')}</div>
      <div class="sector">${esc(r.s2 || '—')}</div>
      <div class="tyre-col">${tyreHTML(r.tyre, r.tyreAge)}</div>
      <div class="laps">${esc(r.laps ?? '—')} L</div>
    </div>`;
  }).join('');
  const note = hasAnyTiming ? '' : '<div class="empty-row slim">Driver images are real, but this selected session has no OpenF1 lap/stint/interval rows yet. This is not fake timing data.</div>';
  box.innerHTML = header + body + note;
}
function renderRaceControl(messages=[], data={}){
  const box = $('#race-control'); if(!box) return;
  if(!messages.length){
    box.innerHTML = '<div class="empty-row">No race-control messages returned by the selected API session.</div>';
    return;
  }
  const base = messages.slice(-8).reverse().map(m => [fmtTime(m.date || m.created_at || new Date()), m.message || m.text || m.flag || 'Race control update', m.flag || m.category || '']);
  box.innerHTML = base.map(([time,text,flag]) => `<div class="rc-msg ${String(flag).toLowerCase().includes('yellow')?'flag-yellow':''} ${String(flag).toLowerCase().includes('green')?'flag-green':''}"><div class="rc-time">${esc(time)}</div><div class="rc-text">${esc(text)}</div></div>`).join('');
}
function renderPodium(top3) {
  const box = $('#podium-card'); if (!box) return;
  if (!top3?.length) { box.innerHTML = '<div class="empty-row">Podium will load from latest result.</div>'; return; }
  const medals = ['🥇','🥈','🥉'];
  box.innerHTML = top3.slice(0,3).map((r, i) => `<div class="podium-row"><div class="podium-medal">${medals[i]}</div><div><b>${esc(r.flag || '')} ${esc(r.name || 'Driver')}</b><small>${esc(r.team || 'Team')} · ${esc(r.points || 0)} pts</small></div></div>`).join('');
}
async function loadLastResult() {
  try { const data = await api('/f1/last-result'); const race = data.race; if (!race) throw new Error('No result'); setText('kpi-winner', race.winner?.name || 'Winner TBA'); setText('kpi-winner-sub', `${race.flag || '🏁'} ${race.name || 'Latest GP'}`); renderPodium(race.top3 || []); }
  catch (err) { console.warn(err); setText('kpi-winner', 'Unavailable'); setText('kpi-winner-sub', 'No result returned by backend'); renderPodium([]); }
}
function initNav() {
  const navbar = $('#navbar'); window.addEventListener('scroll', () => navbar?.classList.toggle('scrolled', scrollY > 20));
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
  class P{ constructor(){this.r()} r(){this.x=Math.random()*W;this.y=Math.random()*H;this.vx=1.5+Math.random()*4;this.vy=(Math.random()-.5)*.8;this.l=.3+Math.random()*.7;this.sz=.6+Math.random()*1.8;this.c=Math.random()<.72?'232,0,45':'201,168,76'} u(){this.x+=this.vx;this.y+=this.vy;this.l-=.002;if(this.x>W+50||this.l<=0){this.r();this.x=-20}} d(){ctx.fillStyle=`rgba(${this.c},${this.l})`;ctx.fillRect(this.x,this.y,this.sz*8,this.sz)}}
  for(let i=0;i<70;i++) p.push(new P()); (function loop(){ctx.clearRect(0,0,W,H);p.forEach(x=>{x.u();x.d()});requestAnimationFrame(loop)})();
}
function initSocket() {
  try { if (typeof io !== 'function') return; const socket = io('https://paddox-backend.onrender.com', { transports: ['websocket', 'polling'] }); socket.on('connect', () => setText('socket-state', 'Socket connected')); socket.on('disconnect', () => setText('socket-state', 'Socket standby')); } catch (err) { console.warn('Socket unavailable', err); }
}

function clearPitWallData(message){
  latestRows = [];
  setLiveNotice(message || 'No API data available for the selected state.', 'warn');
  setText('signal-status', 'NO API DATA');
  setText('socket-state', 'No fallback data used');
  setText('last-sync', 'Waiting for real backend data');
  setText('kpi-session', currentSession ? sessionLabel(currentSession) : 'No session');
  setText('kpi-session-sub', 'No API metadata');
  setText('kpi-weather', '--°C');
  setText('kpi-weather-sub', 'No weather returned');
  setText('kpi-grid', '--');
  const timing = $('#timing-table'); if(timing) timing.innerHTML = '<div class="empty-row">' + esc(message || 'No API data available.') + '</div>';
  renderRaceControl([], {});
}

async function boot(){
  initNav(); initParticles(); initSocket(); buildSeasonSelect();
  $('#refresh-btn')?.addEventListener('click', () => loadSelectedSession(false));
  window.addEventListener('online', () => { showToast('Connection back — refreshing Pit Wall'); loadSelectedSession(false); });
  window.addEventListener('offline', () => setLiveNotice('You are offline. Pit Wall will keep the last loaded data on screen.', 'warn'));
  $('#sort-standings')?.addEventListener('click', e => { standingsSort = standingsSort === 'position' ? 'best' : standingsSort === 'best' ? 'last' : 'position'; e.currentTarget.textContent = `Sort: ${standingsSort === 'position' ? 'Position' : standingsSort === 'best' ? 'Best Lap' : 'Last Lap'}`; renderTimingRows(); });
  await Promise.allSettled([loadNextRace(), loadLastResult(), loadSeason()]);
}
document.addEventListener('DOMContentLoaded', boot);
