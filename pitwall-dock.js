/* ============================================================
   PADDOX Pit Wall — Dock + Cinematic V3 runtime
   Shop-parity dock: 50px base · 70px magnification · 180px influence.
   Also installs the V3 layout and real predictive intelligence renderer.
   ============================================================ */
(function installPitWallV3(){
  'use strict';

  /* Load the V3 override after the legacy/premium sheets without changing the
     existing HTML asset order. This keeps the page cache-safe and reversible. */
  if (!document.getElementById('pitwall-cinematic-v3')) {
    const link = document.createElement('link');
    link.id = 'pitwall-cinematic-v3';
    link.rel = 'stylesheet';
    link.href = 'pitwall-cinematic-v3.css?v=PW3_1';
    document.head.appendChild(link);
  }

  function initDock(){
    const panel = document.getElementById('pdx-dock-panel');
    if (!panel) return;

    const items = Array.from(panel.querySelectorAll('.pdx-dock-item'));
    if (!items.length) return;

    const BASE_SIZE = 50;
    const MAGNIFIED_SIZE = 70;
    const DISTANCE = 180;
    const coarse = window.matchMedia('(hover:none), (pointer:coarse), (max-width:720px)');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let targetSizes = items.map(() => BASE_SIZE);
    let currentSizes = items.map(() => BASE_SIZE);
    let animationFrame = 0;

    function setTargets(pointerX){
      if (coarse.matches || !Number.isFinite(pointerX)) {
        targetSizes = items.map(() => BASE_SIZE);
      } else {
        targetSizes = items.map(item => {
          const rect = item.getBoundingClientRect();
          const center = rect.left + rect.width / 2;
          const distance = Math.abs(pointerX - center);
          const influence = Math.max(0, 1 - distance / DISTANCE);
          const eased = influence * influence * (3 - 2 * influence);
          return BASE_SIZE + (MAGNIFIED_SIZE - BASE_SIZE) * eased;
        });
      }
      requestRender();
    }

    function renderSizes(){
      let keepAnimating = false;
      items.forEach((item, index) => {
        const difference = targetSizes[index] - currentSizes[index];
        currentSizes[index] += difference * (reduceMotion.matches ? 1 : .24);
        if (Math.abs(difference) > .08) keepAnimating = true;
        else currentSizes[index] = targetSizes[index];
        item.style.setProperty('--pdx-dock-size', `${currentSizes[index].toFixed(2)}px`);
      });
      animationFrame = keepAnimating ? requestAnimationFrame(renderSizes) : 0;
    }

    function requestRender(){
      if (!animationFrame) animationFrame = requestAnimationFrame(renderSizes);
    }

    panel.addEventListener('pointermove', event => setTargets(event.clientX), { passive:true });
    panel.addEventListener('pointerleave', () => setTargets(NaN), { passive:true });
    panel.addEventListener('blur', () => setTargets(NaN), true);

    const reset = () => {
      targetSizes = items.map(() => BASE_SIZE);
      currentSizes = items.map(() => BASE_SIZE);
      items.forEach(item => item.style.setProperty('--pdx-dock-size', `${BASE_SIZE}px`));
    };

    coarse.addEventListener?.('change', reset);
    window.addEventListener('resize', reset, { passive:true });
    reset();
  }

  function safe(value=''){
    return String(value ?? '').replace(/[&<>'\"]/g, ch => ({
      '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'
    }[ch]));
  }

  function timingValue(row){
    return Boolean(
      row && !row.noTiming && (
        (row.bestLap && row.bestLap !== '—') ||
        (row.lastLap && row.lastLap !== '—') ||
        Number(row.bestSec) > 0 || Number(row.lastSec) > 0 ||
        Number(row.laps) > 0 || row.tyre
      )
    );
  }

  function upgradedRenderTimingRows(){
    const box = document.getElementById('timing-table');
    if (!box) return;

    const sourceRows = (typeof latestRows !== 'undefined' && Array.isArray(latestRows)) ? latestRows : [];
    let rows = [...sourceRows];
    const sortMode = typeof standingsSort !== 'undefined' ? standingsSort : 'position';

    if (sortMode === 'best') rows.sort((a,b)=>(a.bestSec||9999)-(b.bestSec||9999));
    else if (sortMode === 'last') rows.sort((a,b)=>(a.lastSec||9999)-(b.lastSec||9999));
    else rows.sort((a,b)=>(Number(a.position)||999)-(Number(b.position)||999));

    if (!rows.length) {
      box.classList.remove('position-only');
      if (typeof renderPremiumEmpty === 'function') {
        box.innerHTML = renderPremiumEmpty(
          'Timing data is not available yet',
          'Choose another completed session or check again after official timing data is returned.',
          'timer'
        );
      } else {
        box.innerHTML = '<div class="empty-row">Timing data is not available yet.</div>';
      }
      return;
    }

    const hasTiming = rows.some(timingValue);

    /* When OpenF1 has the driver order but not lap/sector timing, do not render
       six columns of dashes. Show the useful live order cleanly instead. */
    if (!hasTiming) {
      box.classList.add('position-only');
      const header = '<div class="timing-header"><span>POS</span><span>DRIVER</span><span class="position-team">TEAM</span><span>SESSION STATE</span></div>';
      const body = rows.map((row,index) => {
        const pos = row.position || index + 1;
        const color = row.teamColor || '#e8002d';
        const image = typeof driverImage === 'function' ? driverImage(row) : '';
        const name = typeof driverName === 'function' ? driverName(row) : (row.name || row.code || 'F1 Driver');
        const flag = typeof flagImgHTML === 'function' ? flagImgHTML(row.flag, name) : '';
        return `<div class="timing-row session-row waiting-row" style="--team-color:${safe(color)}">
          <div class="pos">P${safe(pos)}</div>
          <div class="driver-cell with-photo">${image}<div><div class="driver-name">${flag}<span>${safe(name)}</span></div><div class="driver-team">${safe(row.code || '')}</div></div></div>
          <div class="driver-team position-team">${safe(row.team || 'Team TBA')}</div>
          <div><span class="pit-waiting-chip">Awaiting lap timing</span></div>
        </div>`;
      }).join('');
      box.innerHTML = header + body;
      return;
    }

    box.classList.remove('position-only');
    const header = '<div class="timing-header"><span>POS</span><span>DRIVER</span><span>GAP</span><span>BEST</span><span>LAST</span><span>S1</span><span>S2</span><span>TYRE</span><span>LAPS</span></div>';
    const body = rows.map((row,index) => {
      const pos = row.position || index + 1;
      const color = row.teamColor || '#e8002d';
      const image = typeof driverImage === 'function' ? driverImage(row) : '';
      const name = typeof driverName === 'function' ? driverName(row) : (row.name || row.code || 'F1 Driver');
      const flag = typeof flagImgHTML === 'function' ? flagImgHTML(row.flag, name) : '';
      const tyre = typeof tyreHTML === 'function' ? tyreHTML(row.tyre, row.tyreAge) : safe(row.tyre || '—');
      return `<div class="timing-row session-row ${row.noTiming ? 'waiting-row' : ''}" style="--team-color:${safe(color)}">
        <div class="pos">P${safe(pos)}</div>
        <div class="driver-cell with-photo">${image}<div><div class="driver-name">${flag}<span>${safe(name)}</span></div><div class="driver-team">${safe(row.code || '')} · ${safe(row.team || 'Team TBA')}</div></div></div>
        <div class="gap">${safe(row.gap || (Number(pos) === 1 ? 'LEADER' : '—'))}</div>
        <div class="lap-time best">${safe(row.bestLap || '—')}</div>
        <div class="lap-time last">${safe(row.lastLap || '—')}</div>
        <div class="sector">${safe(row.s1 || '—')}</div>
        <div class="sector">${safe(row.s2 || '—')}</div>
        <div class="tyre-col">${tyre}</div>
        <div class="laps">${safe(row.laps ?? '—')} L</div>
      </div>`;
    }).join('');
    box.innerHTML = header + body;
  }

  function clearPredictionChart(){
    try {
      if (typeof raceEvolutionChart !== 'undefined' && raceEvolutionChart) {
        raceEvolutionChart.destroy();
        raceEvolutionChart = null;
      }
    } catch (_) {}
  }

  function predictionModeChip(data){
    const head = document.querySelector('.ai-panel .panel-head>div');
    if (!head) return;
    head.querySelector('.pit-ai-mode')?.remove();
    const mode = data?.model?.mode || 'unknown';
    const chip = document.createElement('span');
    chip.className = `pit-ai-mode ${mode === 'lstm' ? 'is-live' : 'is-fallback'}`;
    chip.textContent = mode === 'lstm' ? 'LSTM live' : mode === 'hybrid' ? 'Hybrid mode' : 'Race-form mode';
    head.appendChild(chip);
  }

  function predictionUnavailable(message){
    clearPredictionChart();
    const canvas = document.getElementById('race-evolution-chart');
    if (canvas) {
      const wrap = canvas.parentElement;
      wrap?.querySelector('.pit-ai-chart-empty')?.remove();
      canvas.style.display = 'none';
      const note = document.createElement('div');
      note.className = 'pit-ai-empty pit-ai-chart-empty';
      note.textContent = message;
      wrap?.appendChild(note);
    }
    const outcomes = document.getElementById('driver-outcomes-list');
    const facts = document.getElementById('strategy-probs-list');
    if (outcomes) outcomes.innerHTML = '<div class="pit-ai-empty">Prediction is waiting for usable session rows.</div>';
    if (facts) facts.innerHTML = '<div class="pit-ai-fact"><span>Status</span><strong>Waiting for prediction input</strong></div><div class="pit-ai-fact"><span>Policy</span><strong>No invented prediction values are displayed.</strong></div>';
  }

  function renderPredictionChart(predictions){
    const canvas = document.getElementById('race-evolution-chart');
    if (!canvas || typeof Chart === 'undefined') return;
    canvas.parentElement?.querySelector('.pit-ai-chart-empty')?.remove();
    canvas.style.display = 'block';
    clearPredictionChart();

    const rows = predictions.slice(0,10);
    const labels = rows.map(row => row.code || row.name || 'F1');
    const current = rows.map(row => Number(row.currentPosition || 0));
    const predicted = rows.map(row => Number(row.expectedFinishPosition || 0));
    const maxPosition = Math.max(22,...current,...predicted);

    raceEvolutionChart = new Chart(canvas, {
      type:'bar',
      data:{
        labels,
        datasets:[
          {
            label:'Current',
            data:current,
            backgroundColor:'rgba(255,255,255,.17)',
            borderColor:'rgba(255,255,255,.4)',
            borderWidth:1,
            borderRadius:5,
            barPercentage:.74,
          },
          {
            label:'Predicted',
            data:predicted,
            backgroundColor:'rgba(242,11,58,.72)',
            borderColor:'#ff4268',
            borderWidth:1,
            borderRadius:5,
            barPercentage:.74,
          }
        ]
      },
      options:{
        indexAxis:'y',
        responsive:true,
        maintainAspectRatio:false,
        animation:{ duration:480 },
        plugins:{
          legend:{ labels:{ color:'#cbd1d8', boxWidth:10, boxHeight:10, font:{ size:10 } } },
          tooltip:{ callbacks:{ label(context){ return `${context.dataset.label}: P${Number(context.raw || 0).toFixed(1)}`; } } }
        },
        scales:{
          x:{
            beginAtZero:true,
            suggestedMax:maxPosition,
            ticks:{ color:'#737d88', stepSize:2 },
            grid:{ color:'rgba(255,255,255,.05)' },
            title:{ display:true, text:'Race position', color:'#747e89', font:{size:10} }
          },
          y:{ ticks:{ color:'#aeb6c0' }, grid:{ display:false } }
        }
      }
    });
  }

  function renderPredictionRows(predictions){
    const target = document.getElementById('driver-outcomes-list');
    if (!target) return;
    target.innerHTML = predictions.slice(0,7).map((row,index) => {
      const expected = Number(row.expectedFinishPosition || 0);
      const top10 = Math.max(0,Math.min(1,Number(row.top10Probability || 0)));
      const source = row.inferenceSource === 'lstm' ? 'LSTM' : 'FORM';
      return `<div class="pit-ai-row">
        <div class="pit-ai-driver"><div><b>${String(index + 1).padStart(2,'0')} · ${safe(row.code || row.name || 'F1')}</b><small>${safe(row.team || row.name || 'Driver')} · current P${safe(row.currentPosition || '—')} · ${source}</small></div></div>
        <div class="pit-ai-metric"><b>P${Number.isFinite(expected) ? expected.toFixed(expected % 1 ? 1 : 0) : '—'}</b><small>${(top10 * 100).toFixed(1)}% top-10</small></div>
      </div>`;
    }).join('');
  }

  function renderPredictionFacts(data){
    const target = document.getElementById('strategy-probs-list');
    if (!target) return;
    const coverage = data.coverage || {};
    const quality = data.inputQuality || {};
    const model = data.model || {};
    const generated = data.generatedAt
      ? new Date(data.generatedAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})
      : 'Just now';
    const modeText = model.mode === 'lstm' ? 'Primary LSTM' : model.mode === 'hybrid' ? 'Hybrid LSTM + race form' : 'Race-form fallback';

    target.innerHTML = `
      <div class="pit-ai-fact"><span>Prediction mode</span><strong>${safe(modeText)}</strong></div>
      <div class="pit-ai-fact"><span>Model</span><strong>${safe(model.algorithm || 'PADDOX race intelligence')}</strong></div>
      <div class="pit-ai-fact"><span>Input confidence</span><strong>${safe(quality.confidence || 'Session dependent')}</strong></div>
      <div class="pit-ai-fact"><span>Coverage</span><strong>${safe(coverage.predicted ?? '—')} predicted / ${safe(coverage.timingRows ?? '—')} session rows</strong></div>
      <div class="pit-ai-fact"><span>Live pace rows</span><strong>${safe(quality.timedDrivers ?? 0)} drivers with usable timing</strong></div>
      <div class="pit-ai-fact"><span>Updated</span><strong>${safe(generated)}</strong></div>`;
  }

  async function upgradedLoadPredictiveData(){
    const layout = document.getElementById('predictive-layout');
    if (layout) layout.style.display = 'grid';

    const rows = (typeof latestRows !== 'undefined' && Array.isArray(latestRows)) ? latestRows : [];
    if (!rows.length) {
      predictionUnavailable('Load a session with driver rows before requesting a prediction.');
      return;
    }

    const button = document.getElementById('refresh-predictions');
    const previous = button?.textContent || 'Refresh Prediction';
    if (button) {
      button.disabled = true;
      button.textContent = 'Running intelligence…';
    }

    try {
      const response = await fetch('/api/f1/pitwall/predict', {
        method:'POST',
        credentials:'include',
        headers:{ 'Content-Type':'application/json', 'Accept':'application/json' },
        body:JSON.stringify({
          year:typeof currentYear !== 'undefined' ? currentYear : new Date().getFullYear(),
          round:typeof currentRound !== 'undefined' ? currentRound : 1,
          session:typeof currentSession !== 'undefined' ? currentSession : 'Session',
          rows:rows.map((row,index) => ({
            code:row.code || '',
            name:row.name || row.driver || row.code || `Driver ${index + 1}`,
            team:row.team || '',
            position:Number(row.position || index + 1),
            bestSec:Number(row.bestSec || 0),
            lastSec:Number(row.lastSec || 0),
            laps:Number(row.laps || 0)
          }))
        })
      });

      const json = await response.json().catch(() => ({}));
      if (!response.ok || json.success === false) throw new Error(json.message || 'Prediction endpoint is not ready yet.');

      const data = json.data || json;
      const predictions = Array.isArray(data.predictions) ? data.predictions : [];
      if (!predictions.length) throw new Error('No prediction rows were returned for this session.');

      predictionModeChip(data);
      renderPredictionChart(predictions);
      renderPredictionRows(predictions);
      renderPredictionFacts(data);
      if (typeof showToast === 'function') {
        const mode = data.model?.mode === 'lstm' ? 'LSTM' : data.model?.mode === 'hybrid' ? 'Hybrid' : 'Race-form';
        showToast(`${mode} prediction ready · ${predictions.length} drivers`);
      }
    } catch (error) {
      console.warn('PADDOX predictive intelligence unavailable:',error);
      predictionUnavailable(error.message || 'Prediction service is temporarily unavailable.');
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = previous;
      }
    }
  }

  /* Replace the legacy renderers declared by pitwall.js. The page's existing
     session/refresh handlers keep calling the same global names, so no workflow
     wiring changes are required. */
  try { renderTimingRows = upgradedRenderTimingRows; } catch (_) { window.renderTimingRows = upgradedRenderTimingRows; }
  try { loadPredictiveData = upgradedLoadPredictiveData; } catch (_) { window.loadPredictiveData = upgradedLoadPredictiveData; }

  initDock();

  /* If DOMContentLoaded already ran before this script was revalidated, repaint
     the currently visible table once with the V3 renderer. */
  const repaint = () => {
    try {
      if (typeof latestRows !== 'undefined' && Array.isArray(latestRows) && latestRows.length) upgradedRenderTimingRows();
    } catch (_) {}
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', repaint, { once:true });
  else setTimeout(repaint, 0);
})();
