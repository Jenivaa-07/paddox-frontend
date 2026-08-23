/* PADDOX Pit Wall — dedicated Socket.IO session stream */
(function installPitWallLiveStream(){
  'use strict';
  if (window.__PADDOX_PIT_LIVE_STREAM__) return;
  window.__PADDOX_PIT_LIVE_STREAM__ = true;

  function matchesCurrent(data){
    try {
      if (!data || typeof data !== 'object') return false;
      if (typeof currentYear !== 'undefined' && data.year && Number(data.year) !== Number(currentYear)) return false;
      if (typeof currentRound !== 'undefined' && currentRound && data.round && Number(data.round) !== Number(currentRound)) return false;
      if (typeof currentSession !== 'undefined' && currentSession && data.session && String(data.session) !== String(currentSession)) return false;
      return true;
    } catch (_) { return true; }
  }

  function apply(data){
    if (!matchesCurrent(data)) return;
    try {
      if (typeof latestRows !== 'undefined') latestRows = Array.isArray(data.rows) ? data.rows : [];
      if (typeof lastGoodSessionData !== 'undefined' && Array.isArray(data.rows) && data.rows.length) lastGoodSessionData = data;
      if (typeof latestDataQuality !== 'undefined') latestDataQuality = data.dataQuality || '';

      if (typeof updateSelectedContext === 'function') updateSelectedContext(data);
      if (typeof setText === 'function') {
        setText('signal-status', data.dataQuality === 'REAL_TIMING_DATA' ? 'REAL DATA' : data.live ? 'LIVE LINK' : 'WAITING');
        setText('socket-state', 'Live stream connected');
        setText('last-sync', `Stream ${typeof fmtTime === 'function' ? fmtTime(data.fetchedAt || new Date()) : 'now'}`);
        setText('kpi-grid', String((data.rows || []).length || '--'));
        setText('kpi-weather', data.weather?.trackTemp ? `${Math.round(data.weather.trackTemp)}°C` : (data.weather?.airTemp ? `${Math.round(data.weather.airTemp)}°C` : '--°C'));
        setText('kpi-weather-sub', data.weather?.summary || 'Weather data waiting');
      }
      if (typeof renderTimingRows === 'function') renderTimingRows();
      if (typeof renderRaceControl === 'function') renderRaceControl(data.raceControl || [], data);
      window.PaddoxReplay?.render?.();
    } catch (error) {
      console.warn('PADDOX live stream render failed:', error);
    }
  }

  function connect(){
    if (typeof io !== 'function') return;
    const socket = io('https://paddox-backend.onrender.com', {
      transports:['websocket','polling'],
      withCredentials:true,
      reconnection:true,
      reconnectionAttempts:Infinity,
      reconnectionDelay:900,
      reconnectionDelayMax:5000
    });

    socket.on('connect', () => {
      socket.emit('race:join', { sessionKey:'live' });
      if (typeof setText === 'function') setText('socket-state', 'Live stream connected');
    });
    socket.on('race:session-update', apply);
    socket.on('disconnect', () => { if (typeof setText === 'function') setText('socket-state', 'Live stream reconnecting'); });
    socket.on('connect_error', () => { if (typeof setText === 'function') setText('socket-state', 'REST fallback active'); });
    window.PaddoxPitSocket = socket;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', connect, { once:true });
  else connect();
})();