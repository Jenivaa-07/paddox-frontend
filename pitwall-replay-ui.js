/* PADDOX Pit Wall 2.0 — Vanilla JS replay/telemetry workspace */
(function installPaddoxReplayWorkspace(){
  'use strict';
  if (window.__PADDOX_REPLAY_WORKSPACE__) return;
  window.__PADDOX_REPLAY_WORKSPACE__ = true;

  const state = {
    selectedCode: '',
    replayReady: false,
    playing: false,
    speed: 1,
    frame: null,
    manifest: null
  };

  const safe = value => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const rows = () => (typeof latestRows !== 'undefined' && Array.isArray(latestRows)) ? latestRows : [];
  const selectedRow = () => rows().find(r => String(r.code || '').toUpperCase() === state.selectedCode) || rows()[0] || null;

  function workspaceMarkup(){
    return `
      <section class="pit-replay-workspace" id="pit-replay-workspace" aria-label="PADDOX replay and telemetry workspace">
        <div class="pit-replay-head">
          <div>
            <div class="pit-replay-eyebrow">02 · Replay & Telemetry</div>
            <h2>PIT WALL REPLAY</h2>
            <p>Race timing, circuit position and driver telemetry share one synchronized race clock. PADDOX displays real session data only — unavailable channels remain blank.</p>
          </div>
          <div class="pit-replay-status" id="pit-replay-status"><i></i><span>REAL DATA ONLY · WAITING</span></div>
        </div>

        <div class="pit-replay-grid">
          <section class="pit-replay-column tower-column">
            <div class="pit-replay-column-head"><span>Timing tower</span><strong id="pit-tower-count">0 DRIVERS</strong></div>
            <div class="pit-tower-list" id="pit-tower-list"></div>
          </section>

          <section class="pit-replay-column track-column">
            <div class="pit-replay-column-head"><span>Circuit position</span><strong id="pit-track-feed-state">AWAITING LOCATION</strong></div>
            <div class="pit-track-stage" id="pit-track-stage">
              <div class="pit-track-meta">
                <div class="pit-track-chip"><span>SESSION</span><b id="pit-replay-session">—</b></div>
                <div class="pit-track-chip"><span>LAP</span><b id="pit-replay-lap">— / —</b></div>
              </div>
              <div class="pit-track-empty" id="pit-track-empty">
                <div class="pit-track-empty-mark"></div>
                <h3>Track feed waiting</h3>
                <p>Driver markers will appear only when PADDOX receives real OpenF1/FastF1 location samples for the selected session. No synthetic circuit or car positions are substituted.</p>
              </div>
              <svg class="pit-track-svg" id="pit-track-svg" viewBox="0 0 1000 620" preserveAspectRatio="xMidYMid meet" hidden>
                <polyline class="pit-track-path-shadow" id="pit-track-shadow" points=""></polyline>
                <polyline class="pit-track-path" id="pit-track-path" points=""></polyline>
              </svg>
              <div id="pit-track-cars"></div>
              <div class="pit-replay-controls">
                <div class="pit-control-buttons">
                  <button class="pit-control-btn" data-replay-action="back30" disabled>−30</button>
                  <button class="pit-control-btn" data-replay-action="back5" disabled>−5</button>
                  <button class="pit-control-btn" id="pit-play-btn" data-replay-action="play" disabled>▶</button>
                  <button class="pit-control-btn" data-replay-action="forward5" disabled>+5</button>
                  <button class="pit-control-btn" data-replay-action="forward30" disabled>+30</button>
                  <button class="pit-control-btn" id="pit-speed-btn" data-replay-action="speed" disabled>1×</button>
                </div>
                <input class="pit-replay-range" id="pit-replay-range" type="range" min="0" max="1000" value="0" disabled aria-label="Replay timeline">
                <div class="pit-replay-time" id="pit-replay-time">00:00:00</div>
              </div>
            </div>
          </section>

          <aside class="pit-replay-column telemetry-column">
            <div class="pit-replay-column-head"><span>Driver telemetry</span><strong id="pit-driver-feed-state">SELECT DRIVER</strong></div>
            <div class="pit-driver-panel" id="pit-driver-panel"></div>
          </aside>
        </div>
      </section>`;
  }

  function mount(){
    if (document.getElementById('pit-replay-workspace')) return;
    const anchor = document.querySelector('.pit-kpi-grid');
    if (!anchor) return;
    anchor.insertAdjacentHTML('afterend', workspaceMarkup());
    bindControls();
    renderAll();
  }

  function renderTower(){
    const list = document.getElementById('pit-tower-list');
    const count = document.getElementById('pit-tower-count');
    if (!list) return;
    const data = rows();
    if (count) count.textContent = `${data.length} DRIVER${data.length === 1 ? '' : 'S'}`;
    if (!data.length) {
      list.innerHTML = '<div class="pit-replay-empty-list">Load a session with real timing data to populate the timing tower.</div>';
      return;
    }
    if (!state.selectedCode) state.selectedCode = String(data[0].code || '').toUpperCase();
    list.innerHTML = data.map((r, i) => {
      const code = String(r.code || '').toUpperCase();
      const selected = code === state.selectedCode ? ' is-selected' : '';
      return `<button class="pit-tower-row${selected}" type="button" data-pit-driver="${safe(code)}" style="--team:${safe(r.teamColor || '#e8002d')}">
        <span class="pit-tower-pos">${safe(r.position || i + 1)}</span>
        <span class="pit-tower-driver"><b>${safe(code || r.name || 'DRV')}</b><small>${safe(r.team || r.name || 'Formula 1')}</small></span>
        <span class="pit-tower-gap">${safe(r.gap || ((r.position || i + 1) === 1 ? 'LEADER' : '—'))}<small>${safe(r.tyre || '—')}${r.tyreAge !== null && r.tyreAge !== undefined ? ` · ${safe(r.tyreAge)}L` : ''}</small></span>
      </button>`;
    }).join('');
    list.querySelectorAll('[data-pit-driver]').forEach(btn => btn.addEventListener('click', () => {
      state.selectedCode = String(btn.dataset.pitDriver || '').toUpperCase();
      renderTower();
      renderDriver();
      highlightSelectedCar();
    }));
  }

  function telemetryValue(key){
    const frame = state.frame || {};
    const code = state.selectedCode;
    const item = (frame.telemetry || []).find(t => String(t.code || t.driver_code || '').toUpperCase() === code) || {};
    return item[key];
  }

  function renderDriver(){
    const panel = document.getElementById('pit-driver-panel');
    if (!panel) return;
    const r = selectedRow();
    if (!r) {
      panel.innerHTML = '<div class="pit-replay-empty-list">Select a session to inspect a driver.</div>';
      return;
    }
    state.selectedCode = String(r.code || state.selectedCode || '').toUpperCase();
    const speed = telemetryValue('speed');
    const throttle = telemetryValue('throttle');
    const brake = telemetryValue('brake');
    const gear = telemetryValue('gear') ?? telemetryValue('n_gear');
    const drsRaw = telemetryValue('drs');
    const drsOn = [10,12,14,true,'ON'].includes(drsRaw);
    const feed = document.getElementById('pit-driver-feed-state');
    if (feed) feed.textContent = speed !== undefined ? 'LIVE TELEMETRY' : 'TIMING ONLY';

    panel.innerHTML = `
      <div class="pit-driver-identity" style="--team:${safe(r.teamColor || '#e8002d')}">
        <div class="pit-driver-number">${safe(r.driverNumber || r.position || '—')}</div>
        <div><h3>${safe(r.name || r.code || 'Driver')}</h3><p>${safe(r.code || '')} · ${safe(r.team || 'Team')}</p></div>
      </div>
      <div class="pit-driver-facts">
        <div class="pit-driver-fact"><span>Position</span><b>P${safe(r.position || '—')}</b></div>
        <div class="pit-driver-fact"><span>Gap</span><b>${safe(r.gap || '—')}</b></div>
        <div class="pit-driver-fact"><span>Best lap</span><b>${safe(r.bestLap || '—')}</b></div>
        <div class="pit-driver-fact"><span>Last lap</span><b>${safe(r.lastLap || '—')}</b></div>
        <div class="pit-driver-fact"><span>Tyre</span><b>${safe(r.tyre || '—')}</b></div>
        <div class="pit-driver-fact"><span>Tyre age</span><b>${r.tyreAge !== null && r.tyreAge !== undefined ? `${safe(r.tyreAge)} L` : '—'}</b></div>
      </div>
      ${telemetryBlock('Speed', speed !== undefined ? `${Math.round(Number(speed))} km/h` : '—', speed !== undefined ? Math.min(100, Number(speed) / 3.6) : 0, '')}
      ${telemetryBlock('Throttle', throttle !== undefined ? `${Math.round(Number(throttle))}%` : '—', Number(throttle || 0), '')}
      ${telemetryBlock('Brake', brake !== undefined ? (Number(brake) > 0 ? 'ON' : 'OFF') : '—', Number(brake || 0), 'is-brake')}
      ${telemetryBlock('DRS', drsRaw !== undefined ? (drsOn ? 'OPEN' : 'CLOSED') : '—', drsOn ? 100 : 0, 'is-drs')}
      <div class="pit-telemetry-block"><div class="pit-telemetry-label"><span>Gear</span><b>${gear !== undefined ? safe(gear) : '—'}</b></div></div>`;
  }

  function telemetryBlock(label, text, value, cls){
    return `<div class="pit-telemetry-block"><div class="pit-telemetry-label"><span>${safe(label)}</span><b>${safe(text)}</b></div><div class="pit-telemetry-bar ${cls || ''}"><i style="--value:${Math.max(0,Math.min(100,Number(value || 0)))}%"></i></div></div>`;
  }

  function renderContext(){
    const sessionEl = document.getElementById('pit-replay-session');
    if (sessionEl) sessionEl.textContent = typeof currentSession !== 'undefined' ? String(currentSession || '—') : '—';
    const lapEl = document.getElementById('pit-replay-lap');
    if (lapEl) {
      const lap = state.frame?.lap ?? state.manifest?.currentLap ?? '—';
      const total = state.manifest?.totalLaps ?? '—';
      lapEl.textContent = `${lap} / ${total}`;
    }
  }

  function renderAll(){ renderTower(); renderDriver(); renderContext(); }

  function bindControls(){
    document.querySelectorAll('[data-replay-action]').forEach(btn => btn.addEventListener('click', () => {
      if (!state.replayReady) return;
      const action = btn.dataset.replayAction;
      window.dispatchEvent(new CustomEvent('paddox:replay-control', { detail: { action, speed: state.speed } }));
      if (action === 'play') {
        state.playing = !state.playing;
        btn.textContent = state.playing ? 'Ⅱ' : '▶';
      }
      if (action === 'speed') {
        const speeds = [.5,1,2,4,10,20];
        state.speed = speeds[(speeds.indexOf(state.speed) + 1) % speeds.length];
        btn.textContent = `${state.speed}×`;
      }
    }));
  }

  function setReplayReady(manifest = {}){
    state.manifest = manifest;
    state.replayReady = Boolean(manifest && manifest.sessionKey);
    document.querySelectorAll('[data-replay-action],#pit-replay-range').forEach(el => { el.disabled = !state.replayReady; });
    const status = document.querySelector('#pit-replay-status span');
    if (status) status.textContent = state.replayReady ? 'REAL DATA · REPLAY READY' : 'REAL DATA ONLY · WAITING';
    renderContext();
  }

  function scaleTrackPoints(points){
    const valid = (points || []).filter(p => Number.isFinite(Number(p.x)) && Number.isFinite(Number(p.y)));
    if (valid.length < 2) return [];
    const xs = valid.map(p => Number(p.x)), ys = valid.map(p => Number(p.y));
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const spanX = Math.max(1, maxX-minX), spanY = Math.max(1, maxY-minY);
    return valid.map(p => ({ ...p, sx: 70 + ((Number(p.x)-minX)/spanX)*860, sy: 70 + ((Number(p.y)-minY)/spanY)*480 }));
  }

  function renderTrack(frame){
    const points = scaleTrackPoints(frame?.trackPoints || []);
    const svg = document.getElementById('pit-track-svg');
    const empty = document.getElementById('pit-track-empty');
    const path = document.getElementById('pit-track-path');
    const shadow = document.getElementById('pit-track-shadow');
    const cars = document.getElementById('pit-track-cars');
    const feed = document.getElementById('pit-track-feed-state');
    if (!svg || !cars) return;

    if (points.length > 2) {
      const pointString = points.map(p => `${p.sx.toFixed(1)},${p.sy.toFixed(1)}`).join(' ');
      path?.setAttribute('points', pointString);
      shadow?.setAttribute('points', pointString);
      svg.hidden = false;
      if (empty) empty.hidden = true;
    }

    const locations = frame?.locations || [];
    cars.innerHTML = locations.map(loc => {
      const x = Number(loc.sx), y = Number(loc.sy);
      if (!Number.isFinite(x) || !Number.isFinite(y)) return '';
      const code = safe(loc.code || loc.driver_code || loc.driver_number || 'DRV');
      return `<div class="pit-track-car ${String(code).toUpperCase() === state.selectedCode ? 'is-selected' : ''}" data-car-code="${code}" style="--team:${safe(loc.teamColor || '#e8002d')};left:${(x/1000)*100}%;top:${(y/620)*100}%">${code}</div>`;
    }).join('');
    if (feed) feed.textContent = locations.length ? 'LOCATION STREAM' : 'AWAITING LOCATION';
  }

  function highlightSelectedCar(){
    document.querySelectorAll('.pit-track-car').forEach(el => el.classList.toggle('is-selected', String(el.dataset.carCode || '').toUpperCase() === state.selectedCode));
  }

  function applyFrame(frame = {}){
    state.frame = frame;
    if (frame.elapsedText) {
      const time = document.getElementById('pit-replay-time');
      if (time) time.textContent = String(frame.elapsedText);
    }
    const range = document.getElementById('pit-replay-range');
    if (range && Number.isFinite(Number(frame.progress))) range.value = Math.round(Number(frame.progress) * 1000);
    renderTrack(frame);
    renderDriver();
    renderContext();
  }

  function installTimingHook(){
    try {
      if (typeof renderTimingRows !== 'function' || renderTimingRows.__paddoxReplayWrapped) return;
      const original = renderTimingRows;
      const wrapped = function(){
        const result = original.apply(this, arguments);
        renderAll();
        return result;
      };
      wrapped.__paddoxReplayWrapped = true;
      renderTimingRows = wrapped;
    } catch (_) {}
  }

  window.PaddoxReplay = { setReplayReady, applyFrame, render: renderAll, state };
  document.addEventListener('DOMContentLoaded', () => { mount(); installTimingHook(); });
})();