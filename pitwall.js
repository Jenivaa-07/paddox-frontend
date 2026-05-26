/* ============================================================
   PADDOX — pitwall.js | Phase 4 Pit Wall Live Page
   ============================================================ */
'use strict';

const API_BASE = 'https://paddox-backend.onrender.com/api';
let standingsSort = 'rank';
let countdownTimer = null;
let latestStandings = [];

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function showToast(message) {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.t);
  showToast.t = setTimeout(() => toast.classList.remove('show'), 2600);
}

async function api(path) {
  const res = await fetch(`${API_BASE}${path}`, { cache: 'no-store' });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) throw new Error(json.message || `Request failed: ${path}`);
  return json.data || json;
}

function fmtDate(dateValue) {
  if (!dateValue) return 'Date TBA';
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return String(dateValue);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtTime(dateValue) {
  if (!dateValue) return '--:--';
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return '--:--';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function normalizeRaceDate(race) {
  if (!race) return null;
  return new Date(`${race.date || ''}T${race.time || '13:00:00Z'}`);
}

function startCountdown(date) {
  if (countdownTimer) clearInterval(countdownTimer);
  function tick() {
    const diff = date - new Date();
    if (diff <= 0 || Number.isNaN(diff)) {
      ['d','h','m','s'].forEach(k => setText(`cd-${k}`, '00'));
      return;
    }
    const d = Math.floor(diff / 864e5);
    const h = Math.floor((diff % 864e5) / 36e5);
    const m = Math.floor((diff % 36e5) / 6e4);
    const s = Math.floor((diff % 6e4) / 1e3);
    setText('cd-d', String(d).padStart(2, '0'));
    setText('cd-h', String(h).padStart(2, '0'));
    setText('cd-m', String(m).padStart(2, '0'));
    setText('cd-s', String(s).padStart(2, '0'));
  }
  tick();
  countdownTimer = setInterval(tick, 1000);
}

async function loadNextRace() {
  try {
    const data = await api('/f1/next-race');
    const race = data.race;
    if (!race) throw new Error('No next race');
    setText('next-race-name', `${race.flag || '🏁'} ${race.name}`);
    setText('next-race-meta', `Round ${race.round} · ${race.circuit || 'Circuit TBA'} · ${race.location || race.country || ''}`);
    const raceDate = data.raceDate ? new Date(data.raceDate) : normalizeRaceDate(race);
    startCountdown(raceDate);
  } catch (err) {
    console.warn(err);
    setText('next-race-name', '🏁 Next Grand Prix');
    setText('next-race-meta', 'Live calendar will appear when backend responds');
  }
}

async function loadLiveSession() {
  try {
    const data = await api('/f1/live');
    const session = data.session || {};
    const drivers = data.drivers || [];
    const name = session.session_name || session.session_type || session.name || 'Latest F1 Session';
    const circuit = session.circuit_short_name || session.location || session.country_name || 'OpenF1 feed';
    setText('kpi-session', name);
    setText('kpi-session-sub', circuit);
    setText('kpi-grid', String(drivers.length || latestStandings.length || '--'));
    setText('signal-status', 'LIVE LINK');
    setText('socket-state', 'OpenF1 sync ready');
    setText('last-sync', `Last sync ${fmtTime(data.fetchedAt || new Date())}`);
  } catch (err) {
    console.warn(err);
    setText('kpi-session', 'Standby');
    setText('kpi-session-sub', 'Live data waiting');
    setText('signal-status', 'STANDBY');
    setText('socket-state', 'Polling mode');
  }
}

function teamColor(team = {}) {
  return team.color || '#e8002d';
}

function renderTiming() {
  const box = $('#timing-table');
  if (!box) return;
  let rows = [...latestStandings];
  if (standingsSort === 'points') rows.sort((a, b) => Number(b.points || 0) - Number(a.points || 0));
  else if (standingsSort === 'wins') rows.sort((a, b) => Number(b.wins || 0) - Number(a.wins || 0));
  else rows.sort((a, b) => Number(a.position || 999) - Number(b.position || 999));
  rows = rows.slice(0, 20);
  if (!rows.length) {
    box.innerHTML = '<div class="empty-row">No driver standings available right now.</div>';
    return;
  }
  box.innerHTML = rows.map((s, i) => {
    const d = s.driver || {};
    const name = d.fullName || `${d.firstName || ''} ${d.lastName || ''}`.trim() || 'F1 Driver';
    const code = d.code || name.split(' ').map(x => x[0]).join('').slice(0,3).toUpperCase();
    const team = s.team || {};
    const pos = s.position || i + 1;
    const leaderPts = Number(rows[0]?.points || 0);
    const gap = pos === 1 ? 'LEADER' : `-${Math.max(0, leaderPts - Number(s.points || 0)).toFixed(0)}`;
    return `
      <div class="timing-row" style="--team-color:${teamColor(team)}">
        <div class="pos">P${pos}</div>
        <div class="driver-cell">
          <div class="driver-code">${code}</div>
          <div>
            <div class="driver-name">${d.flag || ''} ${name}</div>
            <div class="driver-team">${team.emoji || '🏎️'} ${team.name || 'Team TBA'}</div>
          </div>
        </div>
        <div class="gap">${gap}</div>
        <div class="pts">${s.points || 0} PTS</div>
        <div class="wins">${s.wins || 0} W</div>
      </div>`;
  }).join('');
}

async function loadStandings() {
  try {
    const data = await api('/f1/standings/drivers');
    latestStandings = data.standings || [];
    setText('kpi-grid', String(latestStandings.length || '--'));
    renderTiming();
  } catch (err) {
    console.warn(err);
    latestStandings = fallbackStandings();
    renderTiming();
    showToast('Using cached demo timing tower');
  }
}

async function loadLastResult() {
  try {
    const data = await api('/f1/last-result');
    const race = data.race;
    if (!race) throw new Error('No result');
    setText('kpi-winner', race.winner?.name || 'Winner TBA');
    setText('kpi-winner-sub', `${race.flag || '🏁'} ${race.name || 'Latest GP'}`);
    renderPodium(race.top3 || []);
  } catch (err) {
    console.warn(err);
    setText('kpi-winner', 'Latest Winner');
    setText('kpi-winner-sub', 'Result feed standby');
    renderPodium([]);
  }
}

function renderPodium(top3) {
  const box = $('#podium-card');
  if (!box) return;
  if (!top3.length) {
    box.innerHTML = '<div class="empty-row">Podium will load from latest result.</div>';
    return;
  }
  const medals = ['🥇','🥈','🥉'];
  box.innerHTML = top3.slice(0,3).map((r, i) => `
    <div class="podium-row">
      <div class="podium-medal">${medals[i] || '🏁'}</div>
      <div><b>${r.flag || ''} ${r.name || 'Driver'}</b><small>${r.team || 'Team'} · ${r.points || 0} pts</small></div>
    </div>`).join('');
}

async function loadSessions() {
  const box = $('#session-grid');
  if (!box) return;
  try {
    const data = await api('/f1/sessions');
    const sessions = (data.sessions || []).slice(-8).reverse();
    if (!sessions.length) throw new Error('No sessions');
    box.innerHTML = sessions.slice(0, 8).map(s => {
      const date = s.date_start || s.session_start || s.date_end || s.date || '';
      return `
        <article class="session-card">
          <div class="session-name">${s.session_name || s.session_type || 'F1 Session'}</div>
          <div class="session-type">${s.meeting_name || s.country_name || 'Grand Prix'}</div>
          <div class="session-meta">
            ${s.circuit_short_name || s.location || 'Circuit TBA'}<br/>
            ${fmtDate(date)} · ${fmtTime(date)}
          </div>
        </article>`;
    }).join('');
  } catch (err) {
    console.warn(err);
    box.innerHTML = fallbackSessions().map(s => `
      <article class="session-card">
        <div class="session-name">${s.name}</div><div class="session-type">${s.type}</div><div class="session-meta">${s.meta}</div>
      </article>`).join('');
  }
}

function renderRaceControl() {
  const box = $('#race-control');
  if (!box) return;
  const now = new Date();
  const msgs = [
    ['NOW', 'Pit Wall dashboard online. Live data is refreshed from PADDOX F1 APIs.'],
    [fmtTime(now), 'Timing tower synced with current driver standings feed.'],
    ['AUTO', 'Next race countdown and session board running in command-center mode.'],
    ['INFO', 'During live race weekends, OpenF1 session information updates automatically.']
  ];
  box.innerHTML = msgs.map(([time, text]) => `<div class="rc-msg"><div class="rc-time">${time}</div><div class="rc-text">${text}</div></div>`).join('');
}

function fallbackStandings() {
  return [
    {position:1,points:0,wins:0,driver:{fullName:'Max Verstappen',code:'VER',flag:'🇳🇱'},team:{name:'Red Bull Racing',emoji:'🔵',color:'#3671C6'}},
    {position:2,points:0,wins:0,driver:{fullName:'Charles Leclerc',code:'LEC',flag:'🇲🇨'},team:{name:'Ferrari',emoji:'🔴',color:'#E8002D'}},
    {position:3,points:0,wins:0,driver:{fullName:'Lando Norris',code:'NOR',flag:'🇬🇧'},team:{name:'McLaren',emoji:'🟠',color:'#FF8000'}},
    {position:4,points:0,wins:0,driver:{fullName:'Lewis Hamilton',code:'HAM',flag:'🇬🇧'},team:{name:'Ferrari',emoji:'🔴',color:'#E8002D'}}
  ];
}

function fallbackSessions() {
  return [
    {name:'Race', type:'Upcoming Weekend', meta:'Session board waiting for OpenF1 schedule'},
    {name:'Qualifying', type:'Command Center', meta:'Timing feed ready'},
    {name:'Practice', type:'Telemetry', meta:'Weather and circuit status standby'},
    {name:'Sprint', type:'Race Control', meta:'Auto refresh enabled'}
  ];
}

function initNav() {
  const navbar = $('#navbar');
  window.addEventListener('scroll', () => navbar?.classList.toggle('scrolled', scrollY > 20));
  const searchBtn = $('#nav-search-btn');
  const drawer = $('#search-drawer');
  const close = $('#search-close');
  searchBtn?.addEventListener('click', () => drawer?.classList.toggle('open'));
  close?.addEventListener('click', () => drawer?.classList.remove('open'));
  const hamburger = $('#hamburger');
  const menu = $('#mobile-menu');
  hamburger?.addEventListener('click', () => { hamburger.classList.toggle('open'); menu?.classList.toggle('open'); });
  const overlay = $('#page-overlay');
  $$('a[href]').forEach(a => {
    const h = a.getAttribute('href');
    if (!h || h.startsWith('#') || h.startsWith('http') || h.startsWith('mailto')) return;
    a.addEventListener('click', e => {
      if (e.ctrlKey || e.metaKey || e.shiftKey) return;
      e.preventDefault();
      overlay?.classList.add('slide-in');
      setTimeout(() => location.href = h, 450);
    });
  });
  window.addEventListener('load', () => { overlay?.classList.remove('slide-in'); overlay?.classList.add('slide-out'); setTimeout(() => overlay?.classList.remove('slide-out'), 500); });
}

function initParticles() {
  const canvas = $('#particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, p = [];
  function resize(){ W = canvas.width = innerWidth; H = canvas.height = innerHeight; }
  resize(); window.addEventListener('resize', resize);
  class P{
    constructor(){ this.r(); }
    r(){ this.x=Math.random()*W; this.y=Math.random()*H; this.vx=1.5+Math.random()*4; this.vy=(Math.random()-.5)*.8; this.l=.3+Math.random()*.7; this.sz=.6+Math.random()*1.8; this.c=Math.random()<.72?'232,0,45':'201,168,76'; }
    u(){ this.x+=this.vx; this.y+=this.vy; this.l-=.002; if(this.x>W+50||this.l<=0) this.r(), this.x=-20; }
    d(){ ctx.fillStyle=`rgba(${this.c},${this.l})`; ctx.fillRect(this.x,this.y,this.sz*8,this.sz); }
  }
  for(let i=0;i<70;i++) p.push(new P());
  function loop(){ ctx.clearRect(0,0,W,H); p.forEach(x=>{x.u();x.d();}); requestAnimationFrame(loop); }
  loop();
}

function initSocket() {
  try {
    if (typeof io !== 'function') return;
    const socket = io('https://paddox-backend.onrender.com', { transports: ['websocket', 'polling'] });
    socket.on('connect', () => setText('socket-state', 'Socket connected'));
    socket.on('disconnect', () => setText('socket-state', 'Socket standby'));
    socket.on('race:session-update', data => {
      setText('last-sync', `Socket sync ${fmtTime(new Date())}`);
      if (data?.session) setText('kpi-session', data.session.session_name || data.session.session_type || 'Live Session');
    });
  } catch (err) { console.warn('Socket unavailable', err); }
}

async function loadAll(silent = false) {
  if (!silent) showToast('Refreshing Pit Wall data…');
  setText('last-sync', 'Syncing…');
  await Promise.allSettled([loadNextRace(), loadLiveSession(), loadStandings(), loadLastResult(), loadSessions()]);
  renderRaceControl();
  setText('last-sync', `Last sync ${fmtTime(new Date())}`);
  if (!silent) showToast('Pit Wall updated');
}

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initParticles();
  initSocket();
  $('#refresh-btn')?.addEventListener('click', () => loadAll(false));
  $('#sort-standings')?.addEventListener('click', e => {
    standingsSort = standingsSort === 'rank' ? 'points' : standingsSort === 'points' ? 'wins' : 'rank';
    e.currentTarget.textContent = `Sort: ${standingsSort[0].toUpperCase()}${standingsSort.slice(1)}`;
    renderTiming();
  });
  loadAll(true);
  setInterval(() => loadAll(true), 30000);
});
