/* PADDOX Pit Wall — FastF1 historical replay controller */
(function installFastF1ReplayController(){
  'use strict';
  if (window.__PADDOX_FASTF1_REPLAY_CLIENT__) return;
  window.__PADDOX_FASTF1_REPLAY_CLIENT__ = true;

  const state = {
    manifest: null,
    at: 0,
    playing: false,
    speed: 1,
    tick: null,
    frameBusy: false,
    contextKey: '',
  };

  const speedSteps = [.5, 1, 2, 4, 10, 20];
  const $ = selector => document.querySelector(selector);

  function currentContext(){
    return {
      year: Number(typeof currentYear !== 'undefined' ? currentYear : new Date().getFullYear()),
      round: Number(typeof currentRound !== 'undefined' ? currentRound : 1),
      session: String(typeof currentSession !== 'undefined' ? currentSession : 'Race'),
    };
  }

  function contextKey(ctx = currentContext()){
    return `${ctx.year}:${ctx.round}:${ctx.session}`;
  }

  function apiData(json){
    if (!json || json.success === false) throw new Error(json?.message || 'Replay service unavailable');
    return json.data || json;
  }

  function setStatus(text, mode='waiting'){
    const status = $('#pit-replay-status');
    if (!status) return;
    status.dataset.mode = mode;
    const label = status.querySelector('span');
    if (label) label.textContent = text;
  }

  function setLoadButton(text, disabled=false){
    const button = $('#pit-fastf1-load');
    if (!button) return;
    button.textContent = text;
    button.disabled = disabled;
  }

  function mountLoadButton(){
    if ($('#pit-fastf1-load')) return;
    const status = $('#pit-replay-status');
    if (!status) return;

    const actions = document.createElement('div');
    actions.className = 'pit-replay-head-actions';
    actions.style.cssText = 'display:flex;align-items:center;gap:10px;flex-wrap:wrap;justify-content:flex-end';
    const button = document.createElement('button');
    button.id = 'pit-fastf1-load';
    button.type = 'button';
    button.className = 'mini-btn';
    button.textContent = 'Load FastF1 Replay';
    button.addEventListener('click', loadReplay);
    status.replaceWith(actions);
    actions.appendChild(status);
    actions.appendChild(button);
  }

  function stopPlayback(){
    state.playing = false;
    if (state.tick) {
      clearInterval(state.tick);
      state.tick = null;
    }
    const play = $('#pit-play-btn');
    if (play) play.textContent = '▶';
  }

  function disableOpenF1Polling(){
    try {
      if (typeof refreshTimer !== 'undefined' && refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = null;
      }
    } catch (_) {}
    try { if (typeof activeSessionRequest !== 'undefined') activeSessionRequest += 1; } catch (_) {}
  }

  function resetReplay(reason='FASTF1 REPLAY · READY TO LOAD'){
    stopPlayback();
    state.manifest = null;
    state.at = 0;
    state.frameBusy = false;
    state.contextKey = '';
    try { window.PaddoxReplay?.setReplayReady({}); } catch (_) {}
    setStatus(reason, 'waiting');
    setLoadButton('Load FastF1 Replay', false);
  }

  async function loadReplay(){
    const ctx = currentContext();
    if (!ctx.year || !ctx.round || !ctx.session) return;
    stopPlayback();
    disableOpenF1Polling();
    state.contextKey = contextKey(ctx);
    setLoadButton('Processing FastF1…', true);
    setStatus('FASTF1 · PROCESSING SESSION (FIRST LOAD CAN TAKE 1–3 MIN)', 'loading');

    try {
      const params = new URLSearchParams({ year: String(ctx.year), round: String(ctx.round), session: ctx.session });
      const response = await fetch(`/api/f1/pitwall/replay/manifest?${params}`, { credentials: 'include', cache: 'no-store' });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(json.message || `Replay manifest failed (${response.status})`);
      const manifest = apiData(json);
      if (contextKey() !== state.contextKey) return;

      state.manifest = manifest;
      state.at = 0;
      state.speed = 1;
      window.PaddoxReplay?.setReplayReady(manifest);
      setStatus(`FASTF1 · REPLAY READY · ${manifest.drivers?.length || 0} DRIVERS`, 'ready');
      setLoadButton('Reload Replay', false);
      await applyFrame(manifest.initialFrame || await fetchFrame(0), true);
      if (typeof showToast === 'function') showToast(`${manifest.eventName || 'F1 session'} replay ready`);
    } catch (error) {
      console.warn('FastF1 replay load failed:', error);
      setStatus('FASTF1 REPLAY UNAVAILABLE', 'error');
      setLoadButton('Retry FastF1 Replay', false);
      if (typeof setLiveNotice === 'function') setLiveNotice(error.message || 'FastF1 replay unavailable.', 'warn');
      if (typeof showToast === 'function') showToast('FastF1 replay could not be loaded');
    }
  }

  async function fetchFrame(at){
    if (!state.manifest) throw new Error('Replay is not loaded');
    const ctx = currentContext();
    const params = new URLSearchParams({
      year: String(ctx.year), round: String(ctx.round), session: ctx.session,
      at: String(Math.max(0, at)),
    });
    const response = await fetch(`/api/f1/pitwall/replay/frame?${params}`, { credentials: 'include', cache: 'no-store' });
    const json = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(json.message || `Replay frame failed (${response.status})`);
    return apiData(json);
  }

  async function applyFrame(frame, first=false){
    if (!frame || !state.manifest) return;
    state.at = Number(frame.at || 0);

    if (Array.isArray(frame.timingRows)) {
      try { latestRows = frame.timingRows; } catch (_) { window.latestRows = frame.timingRows; }
      try { latestDataQuality = 'FASTF1_REPLAY'; } catch (_) {}
      if (typeof renderTimingRows === 'function') renderTimingRows();
      if (typeof setText === 'function') {
        setText('signal-status', 'FASTF1 REPLAY');
        setText('socket-state', 'Historical replay');
        setText('last-sync', frame.elapsedText ? `Replay ${frame.elapsedText}` : 'Replay loaded');
        setText('kpi-grid', String(frame.timingRows.length || '--'));
      }
    }

    if (typeof renderRaceControl === 'function') renderRaceControl(frame.raceControl || [], { source: 'FastF1 Replay' });
    if (frame.weather && typeof setText === 'function') {
      const temp = frame.weather.trackTemp ?? frame.weather.airTemp;
      setText('kpi-weather', temp !== null && temp !== undefined ? `${Math.round(Number(temp))}°C` : '--°C');
      const rain = frame.weather.rainfall ? ' · Rain' : '';
      const air = frame.weather.airTemp !== null && frame.weather.airTemp !== undefined ? `Air ${Math.round(Number(frame.weather.airTemp))}°C` : 'Historical weather';
      setText('kpi-weather-sub', `${air}${rain}`);
    }

    if (typeof setLiveNotice === 'function') {
      setLiveNotice(`${state.manifest.eventName || 'Session'} · ${state.manifest.session} · FastF1 historical replay`, 'ok');
    }

    window.PaddoxReplay?.applyFrame({ ...frame, trackPoints: state.manifest.trackPoints || [] });
    if (first && typeof updateSelectedContext === 'function') {
      updateSelectedContext({ rows: frame.timingRows || [], dataQuality: 'FASTF1_REPLAY', source: 'FastF1 Replay' });
    }
  }

  async function seekTo(target){
    if (!state.manifest || state.frameBusy) return;
    const duration = Number(state.manifest.durationSeconds || 0);
    const nextAt = Math.max(0, Math.min(duration, Number(target || 0)));
    state.frameBusy = true;
    try {
      const frame = await fetchFrame(nextAt);
      if (state.manifest && contextKey() === state.contextKey) await applyFrame(frame);
    } catch (error) {
      console.warn('FastF1 frame failed:', error);
      stopPlayback();
      setStatus('FASTF1 · FRAME RETRY NEEDED', 'error');
    } finally {
      state.frameBusy = false;
    }
  }

  function startPlayback(){
    if (!state.manifest || state.tick) return;
    state.playing = true;
    state.tick = setInterval(async () => {
      if (!state.playing || state.frameBusy || !state.manifest) return;
      const duration = Number(state.manifest.durationSeconds || 0);
      const target = state.at + state.speed;
      if (target >= duration) {
        await seekTo(duration);
        stopPlayback();
        return;
      }
      await seekTo(target);
    }, 1000);
  }

  function togglePlayback(){
    if (!state.manifest) return;
    if (state.playing) stopPlayback();
    else startPlayback();
  }

  function cycleSpeed(){
    const index = speedSteps.indexOf(state.speed);
    state.speed = speedSteps[(index + 1) % speedSteps.length];
  }

  function bindReplayControls(){
    window.addEventListener('paddox:replay-control', event => {
      if (!state.manifest) return;
      const action = event.detail?.action;
      if (action === 'play') togglePlayback();
      else if (action === 'back30') seekTo(state.at - 30);
      else if (action === 'back5') seekTo(state.at - 5);
      else if (action === 'forward5') seekTo(state.at + 5);
      else if (action === 'forward30') seekTo(state.at + 30);
      else if (action === 'speed') cycleSpeed();
    });

    const range = $('#pit-replay-range');
    range?.addEventListener('change', event => {
      if (!state.manifest) return;
      const duration = Number(state.manifest.durationSeconds || 0);
      const progress = Math.max(0, Math.min(1000, Number(event.target.value || 0))) / 1000;
      seekTo(duration * progress);
    });
  }

  function bindContextChanges(){
    ['season-select', 'round-select', 'session-select'].forEach(id => {
      document.getElementById(id)?.addEventListener('change', () => resetReplay('FASTF1 REPLAY · CONTEXT CHANGED'));
    });
    document.getElementById('load-session-btn')?.addEventListener('click', () => {
      if (state.manifest && contextKey() !== state.contextKey) resetReplay();
    });
  }

  function boot(){
    mountLoadButton();
    bindReplayControls();
    bindContextChanges();
    setStatus('FASTF1 REPLAY · READY TO LOAD', 'waiting');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true });
  else boot();
})();
