/* ============================================================
   PADDOX Pit Wall — Live Runtime Guard V2
   - fixes predictive endpoint wiring
   - removes simulated/fake prediction fallbacks
   - consumes the existing race:session-update Socket.IO feed
   - throttles predictive inference while keeping user refresh immediate
   ============================================================ */
(function installPitWallLiveRuntimeV2(){
  'use strict';

  if (window.__PADDOX_PITWALL_LIVE_RUNTIME_V2__) return;
  window.__PADDOX_PITWALL_LIVE_RUNTIME_V2__ = true;

  /* Keep the telemetry/dashboard CSS intact and layer the hero redesign last. */
  if (!document.getElementById('pitwall-hero-shop-parity')) {
    const link = document.createElement('link');
    link.id = 'pitwall-hero-shop-parity';
    link.rel = 'stylesheet';
    link.href = 'pitwall-hero-shop-parity.css?v=PW4_1';
    document.head.appendChild(link);
  }

  const MIN_AUTO_PREDICT_INTERVAL = 60 * 1000;
  let lastPredictionKey = '';
  let lastPredictionStartedAt = 0;
  let predictionInFlight = false;
  let forceNextPrediction = false;
  let liveSocket = null;

  function contextKey(){
    const year = typeof currentYear !== 'undefined' ? currentYear : new Date().getFullYear();
    const round = typeof currentRound !== 'undefined' ? currentRound : 'round';
    const session = typeof currentSession !== 'undefined' ? currentSession : 'session';
    return `${year}:${round}:${session}`;
  }

  function currentRows(){
    return typeof latestRows !== 'undefined' && Array.isArray(latestRows) ? latestRows : [];
  }

  function safeEsc(value=''){
    if (typeof esc === 'function') return esc(value);
    return String(value ?? '').replace(/[&<>'\"]/g, char => ({
      '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'
    })[char]);
  }

  function predictionStateElement(){
    const canvas = document.getElementById('race-evolution-chart');
    if (!canvas) return null;
    let state = document.getElementById('prediction-chart-state');
    if (!state) {
      state = document.createElement('div');
      state.id = 'prediction-chart-state';
      state.className = 'pit-prediction-state';
      state.style.cssText = 'min-height:220px;display:none;align-items:center;justify-content:center;text-align:left;';
      canvas.insertAdjacentElement('afterend', state);
    }
    return state;
  }

  function setPredictionEmpty(title, body){
    if (typeof raceEvolutionChart !== 'undefined' && raceEvolutionChart) {
      try { raceEvolutionChart.destroy(); } catch (_) {}
      try { raceEvolutionChart = null; } catch (_) {}
    }

    const canvas = document.getElementById('race-evolution-chart');
    if (canvas) canvas.style.display = 'none';
    const state = predictionStateElement();
    if (state) {
      state.style.display = 'flex';
      state.innerHTML = typeof renderPremiumEmpty === 'function'
        ? renderPremiumEmpty(title, body, 'signal')
        : `<div><b>${safeEsc(title)}</b><p>${safeEsc(body)}</p></div>`;
    }

    const outcomes = document.getElementById('driver-outcomes-list');
    if (outcomes) {
      outcomes.innerHTML = typeof renderPremiumEmpty === 'function'
        ? renderPremiumEmpty('No prediction available', 'Driver predictions appear only when PADDOX receives real timing rows and the analytics service responds.', 'timer')
        : '<p>No prediction available.</p>';
    }

    const quality = document.getElementById('strategy-probs-list');
    if (quality) {
      quality.innerHTML = typeof renderPremiumEmpty === 'function'
        ? renderPremiumEmpty('Model standby', 'No synthetic strategy or probability values are shown when prediction is unavailable.', 'signal')
        : '<p>Model standby.</p>';
    }
  }

  function renderPredictionChart(predictions){
    const canvas = document.getElementById('race-evolution-chart');
    if (!canvas || typeof Chart === 'undefined') return;

    const state = predictionStateElement();
    if (state) state.style.display = 'none';
    canvas.style.display = 'block';

    if (typeof raceEvolutionChart !== 'undefined' && raceEvolutionChart) {
      try { raceEvolutionChart.destroy(); } catch (_) {}
    }

    const rowMap = new Map(currentRows().map(row => [String(row.code || '').toUpperCase(), row]));
    const labels = predictions.map(item => item.code || item.name || 'DRV');
    const currentPositions = predictions.map(item => Number(item.currentPosition || 0));
    const predictedPositions = predictions.map(item => Number(item.expectedFinishPosition || 0));
    const teamColors = predictions.map(item => rowMap.get(String(item.code || '').toUpperCase())?.teamColor || '#e8002d');

    raceEvolutionChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Current position',
            data: currentPositions,
            backgroundColor: 'rgba(255,255,255,0.20)',
            borderColor: 'rgba(255,255,255,0.55)',
            borderWidth: 1
          },
          {
            label: 'Predicted finish',
            data: predictedPositions,
            backgroundColor: teamColors,
            borderColor: teamColors,
            borderWidth: 1
          }
        ]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 350 },
        plugins: {
          legend: { labels: { color: '#fff', boxWidth: 14 } },
          tooltip: {
            callbacks: {
              label(context){
                const value = Number(context.raw || 0);
                return `${context.dataset.label}: P${value.toFixed(value % 1 ? 1 : 0)}`;
              }
            }
          }
        },
        scales: {
          x: {
            min: 1,
            suggestedMax: Math.max(currentRows().length || 20, 10),
            ticks: { color: '#aaa', stepSize: 1 },
            grid: { color: 'rgba(255,255,255,0.08)' },
            title: { display: true, text: 'Race position · lower is better', color: '#ddd' }
          },
          y: {
            ticks: { color: '#ddd' },
            grid: { display: false }
          }
        }
      }
    });
  }

  function renderPredictionDetails(data){
    const predictions = Array.isArray(data?.predictions) ? data.predictions : [];
    const outcomes = document.getElementById('driver-outcomes-list');
    const quality = document.getElementById('strategy-probs-list');

    if (outcomes) {
      outcomes.innerHTML = predictions.map((item, index) => {
        const probability = Number(item.top10Probability || 0) * 100;
        const source = item.inferenceSource === 'lstm' ? 'LSTM' : 'Race form';
        return `
          <div class="pdx-prediction-row" style="display:grid;grid-template-columns:42px 1fr auto;gap:10px;align-items:center;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.09)">
            <strong style="font-family:Orbitron,sans-serif">P${index + 1}</strong>
            <div><b>${safeEsc(item.code || item.name || 'Driver')}</b><small style="display:block;color:rgba(255,255,255,.55)">${safeEsc(source)} · now P${safeEsc(item.currentPosition || '—')}</small></div>
            <div style="text-align:right"><b>${Number(item.expectedFinishPosition || 0).toFixed(1)}</b><small style="display:block;color:rgba(255,255,255,.55)">${probability.toFixed(1)}% top 10</small></div>
          </div>`;
      }).join('');
    }

    if (quality) {
      const model = data?.model || {};
      const input = data?.inputQuality || {};
      const coverage = data?.coverage || {};
      const modeLabel = model.mode === 'lstm' ? 'Primary LSTM' : model.mode === 'hybrid' ? 'Hybrid' : 'Race-form fallback';
      quality.innerHTML = `
        <div class="pdx-model-facts" style="display:grid;gap:10px">
          <div style="display:flex;justify-content:space-between;gap:14px;border-bottom:1px solid rgba(255,255,255,.09);padding-bottom:9px"><span>Engine</span><b>${safeEsc(model.algorithm || modeLabel)}</b></div>
          <div style="display:flex;justify-content:space-between;gap:14px;border-bottom:1px solid rgba(255,255,255,.09);padding-bottom:9px"><span>Mode</span><b>${safeEsc(modeLabel)}</b></div>
          <div style="display:flex;justify-content:space-between;gap:14px;border-bottom:1px solid rgba(255,255,255,.09);padding-bottom:9px"><span>Input confidence</span><b>${safeEsc(input.confidence || 'guarded')}</b></div>
          <div style="display:flex;justify-content:space-between;gap:14px;border-bottom:1px solid rgba(255,255,255,.09);padding-bottom:9px"><span>Coverage</span><b>${safeEsc(coverage.predicted ?? 0)} / ${safeEsc(coverage.timingRows ?? currentRows().length)}</b></div>
          <div style="display:flex;justify-content:space-between;gap:14px"><span>Fallback active</span><b>${model.fallbackActive ? 'Yes · disclosed' : 'No'}</b></div>
          ${input.note ? `<p style="margin:6px 0 0;color:rgba(255,255,255,.58);line-height:1.55">${safeEsc(input.note)}</p>` : ''}
        </div>`;
    }
  }

  async function requestRealPrediction(){
    const rows = currentRows();
    if (!rows.length) {
      setPredictionEmpty('Prediction waiting for timing', 'PADDOX needs real timing rows from the selected session before it can run race intelligence.');
      return null;
    }

    const response = await fetch('/api/f1/pitwall/predict', {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        year: typeof currentYear !== 'undefined' ? currentYear : new Date().getFullYear(),
        round: typeof currentRound !== 'undefined' ? currentRound : 1,
        session: typeof currentSession !== 'undefined' ? currentSession : 'Race',
        rows
      })
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload.success === false) {
      throw new Error(payload.message || payload.code || `Prediction request failed (${response.status})`);
    }
    return payload.data || payload;
  }

  async function livePredictiveRefresh(){
    const now = Date.now();
    const key = contextKey();
    const forced = forceNextPrediction;
    forceNextPrediction = false;

    if (predictionInFlight && !forced) return;
    if (!forced && key === lastPredictionKey && now - lastPredictionStartedAt < MIN_AUTO_PREDICT_INTERVAL) return;

    predictionInFlight = true;
    lastPredictionKey = key;
    lastPredictionStartedAt = now;

    const outcomes = document.getElementById('driver-outcomes-list');
    const quality = document.getElementById('strategy-probs-list');
    if (outcomes && !outcomes.children.length) outcomes.innerHTML = '<div class="loading-row slim">Running race intelligence…</div>';
    if (quality && !quality.children.length) quality.innerHTML = '<div class="loading-row slim">Checking model quality…</div>';

    try {
      const data = await requestRealPrediction();
      if (!data) return;
      const predictions = Array.isArray(data.predictions) ? data.predictions : [];
      if (!predictions.length) {
        setPredictionEmpty('Prediction unavailable', 'The analytics service returned no driver predictions for this session.');
        return;
      }
      renderPredictionChart(predictions);
      renderPredictionDetails(data);
    } catch (error) {
      console.warn('PADDOX prediction unavailable:', error);
      setPredictionEmpty('Prediction temporarily unavailable', 'Live timing remains available. PADDOX will not substitute simulated driver probabilities or strategy values.');
    } finally {
      predictionInFlight = false;
    }
  }

  function payloadMatchesSelection(data){
    if (!data || typeof data !== 'object') return false;
    const year = typeof currentYear !== 'undefined' ? Number(currentYear) : null;
    const round = typeof currentRound !== 'undefined' ? Number(currentRound) : null;
    const session = typeof currentSession !== 'undefined' ? String(currentSession) : '';
    if (data.year && year && Number(data.year) !== year) return false;
    if (data.round && round && Number(data.round) !== round) return false;
    if (data.session && session && String(data.session) !== session) return false;
    return true;
  }

  function applySocketSessionPayload(data){
    if (!payloadMatchesSelection(data)) return;

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

      if (typeof setLiveNotice === 'function') {
        setLiveNotice(
          data.dataQuality === 'REAL_TIMING_DATA'
            ? `${typeof sessionLabel === 'function' ? sessionLabel(data.session || currentSession) : (data.session || 'Session')} timing updated from the live PADDOX stream.`
            : 'Live stream connected; waiting for timing rows.',
          data.dataQuality === 'REAL_TIMING_DATA' ? 'ok' : 'warn'
        );
      }

      if (typeof renderTimingRows === 'function') renderTimingRows();
      if (typeof renderRaceControl === 'function') renderRaceControl(data.raceControl || [], data);
      livePredictiveRefresh();
    } catch (error) {
      console.warn('Pit Wall socket payload could not be rendered:', error);
    }
  }

  function enhancedInitSocket(){
    try {
      if (typeof io !== 'function') {
        if (typeof setText === 'function') setText('socket-state', 'Live stream unavailable');
        return null;
      }

      liveSocket = io('https://paddox-backend.onrender.com', {
        transports: ['websocket', 'polling'],
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 900,
        reconnectionDelayMax: 5000
      });

      liveSocket.on('connect', () => {
        if (typeof setText === 'function') setText('socket-state', 'Live stream connected');
        liveSocket.emit('race:join', { sessionKey: 'live' });
      });
      liveSocket.on('race:session-update', applySocketSessionPayload);
      liveSocket.on('disconnect', () => {
        if (typeof setText === 'function') setText('socket-state', 'Live stream reconnecting');
      });
      liveSocket.on('connect_error', () => {
        if (typeof setText === 'function') setText('socket-state', 'REST fallback active');
      });
      return liveSocket;
    } catch (error) {
      console.warn('Pit Wall live socket unavailable:', error);
      if (typeof setText === 'function') setText('socket-state', 'REST fallback active');
      return null;
    }
  }

  const refreshButton = document.getElementById('refresh-predictions');
  refreshButton?.addEventListener('click', () => {
    forceNextPrediction = true;
  }, { capture: true });

  try { loadPredictiveData = livePredictiveRefresh; }
  catch (_) { window.loadPredictiveData = livePredictiveRefresh; }

  try { initSocket = enhancedInitSocket; }
  catch (_) { window.initSocket = enhancedInitSocket; }
})();