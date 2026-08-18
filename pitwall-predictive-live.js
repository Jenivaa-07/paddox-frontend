/* ============================================================
   PADDOX Pit Wall — Real Predictive Intelligence
   Replaces the legacy demo/fallback predictor with the live backend route:
   POST /api/f1/pitwall/predict
   ============================================================ */
(function installPitWallLivePredictor(){
  'use strict';

  function safe(value=''){
    return String(value ?? '').replace(/[&<>'"]/g, ch => ({
      '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'
    }[ch]));
  }

  function clearPredictionChart(){
    try {
      if (typeof raceEvolutionChart !== 'undefined' && raceEvolutionChart) {
        raceEvolutionChart.destroy();
        raceEvolutionChart = null;
      }
    } catch (_) {}
  }

  function empty(message){
    return `<div class="pit-ai-empty">${safe(message)}</div>`;
  }

  function setUnavailable(message){
    clearPredictionChart();
    const canvas = document.getElementById('race-evolution-chart');
    if (canvas) {
      const wrap = canvas.parentElement;
      wrap?.querySelector('.pit-ai-chart-empty')?.remove();
      const note = document.createElement('div');
      note.className = 'pit-ai-empty pit-ai-chart-empty';
      note.textContent = message;
      canvas.style.display = 'none';
      wrap?.appendChild(note);
    }
    const outcomes = document.getElementById('driver-outcomes-list');
    const facts = document.getElementById('strategy-probs-list');
    if (outcomes) outcomes.innerHTML = empty('No prediction rows are being shown until the PADDOX model returns a real inference.');
    if (facts) facts.innerHTML = `
      <div class="pit-ai-fact"><span>Status</span><strong>Prediction service unavailable</strong></div>
      <div class="pit-ai-fact"><span>Data policy</span><strong>No simulated fallback values are displayed.</strong></div>`;
  }

  function restoreCanvas(){
    const canvas = document.getElementById('race-evolution-chart');
    if (!canvas) return;
    canvas.parentElement?.querySelector('.pit-ai-chart-empty')?.remove();
    canvas.style.display = 'block';
  }

  function renderPredictionChart(predictions){
    const canvas = document.getElementById('race-evolution-chart');
    if (!canvas || typeof Chart === 'undefined') return;
    restoreCanvas();
    clearPredictionChart();

    const rows = predictions.slice(0,10);
    const labels = rows.map(row => row.code || row.name || 'F1');
    const current = rows.map(row => Number(row.currentPosition || 0));
    const expected = rows.map(row => Number(row.expectedFinishPosition || 0));

    raceEvolutionChart = new Chart(canvas, {
      type:'bar',
      data:{
        labels,
        datasets:[
          {
            label:'Current position',
            data:current,
            backgroundColor:'rgba(255,255,255,.18)',
            borderColor:'rgba(255,255,255,.42)',
            borderWidth:1,
            borderRadius:4
          },
          {
            label:'Predicted finish',
            data:expected,
            backgroundColor:'rgba(232,0,45,.68)',
            borderColor:'#ff365e',
            borderWidth:1,
            borderRadius:4
          }
        ]
      },
      options:{
        responsive:true,
        maintainAspectRatio:false,
        animation:{ duration:450 },
        plugins:{
          legend:{ labels:{ color:'#c9ced6', boxWidth:10, boxHeight:10, font:{ size:10 } } },
          tooltip:{
            callbacks:{
              label(context){
                const value = Number(context.raw || 0);
                return `${context.dataset.label}: P${value.toFixed(value % 1 ? 1 : 0)}`;
              }
            }
          }
        },
        scales:{
          y:{
            reverse:false,
            beginAtZero:true,
            suggestedMax:Math.max(22,...current,...expected),
            ticks:{ color:'#737b86', stepSize:2 },
            grid:{ color:'rgba(255,255,255,.055)' },
            title:{ display:true, text:'Position', color:'#737b86', font:{ size:10 } }
          },
          x:{ ticks:{ color:'#9aa1ab' }, grid:{ display:false } }
        }
      }
    });
  }

  function renderPredictedOrder(predictions){
    const target = document.getElementById('driver-outcomes-list');
    if (!target) return;
    target.innerHTML = predictions.slice(0,7).map(row => {
      const expected = Number(row.expectedFinishPosition || 0);
      const top10 = Math.max(0,Math.min(1,Number(row.top10Probability || 0)));
      return `
        <div class="pit-ai-row">
          <div class="pit-ai-driver">
            <div>
              <b>${safe(row.code || row.name || 'F1')}</b>
              <small>${safe(row.team || row.name || 'Driver')} · current P${safe(row.currentPosition || '—')}</small>
            </div>
          </div>
          <div class="pit-ai-metric">
            <b>P${Number.isFinite(expected) ? expected.toFixed(expected % 1 ? 1 : 0) : '—'}</b>
            <small>${(top10 * 100).toFixed(1)}% top-10</small>
          </div>
        </div>`;
    }).join('');
  }

  function renderModelFacts(data){
    const target = document.getElementById('strategy-probs-list');
    if (!target) return;
    const coverage = data.coverage || {};
    const quality = data.inputQuality || {};
    const model = data.model || {};
    const generated = data.generatedAt ? new Date(data.generatedAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : 'Just now';

    target.innerHTML = `
      <div class="pit-ai-fact"><span>Model</span><strong>${safe(model.algorithm || 'PADDOX race predictor')}</strong></div>
      <div class="pit-ai-fact"><span>Input confidence</span><strong>${safe(quality.confidence || 'Session dependent')}</strong></div>
      <div class="pit-ai-fact"><span>Coverage</span><strong>${safe(coverage.predicted ?? '—')} predicted / ${safe(coverage.timingRows ?? '—')} timing rows</strong></div>
      <div class="pit-ai-fact"><span>Inference source</span><strong>Selected-session lap timing + recent race finishing averages</strong></div>
      <div class="pit-ai-fact"><span>Generated</span><strong>${safe(generated)}</strong></div>`;
  }

  async function realLoadPredictiveData(){
    const layout = document.getElementById('predictive-layout');
    if (layout) layout.style.display = 'grid';

    const rows = (typeof latestRows !== 'undefined' && Array.isArray(latestRows)) ? latestRows : [];
    if (!rows.length) {
      setUnavailable('Load a session with real timing rows before requesting a prediction.');
      return;
    }

    const button = document.getElementById('refresh-predictions');
    const previous = button?.textContent || 'Refresh Prediction';
    if (button) {
      button.disabled = true;
      button.textContent = 'Running model…';
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
      if (!response.ok || json.success === false) {
        throw new Error(json.message || 'PADDOX prediction service did not return an inference.');
      }

      const data = json.data || json;
      const predictions = Array.isArray(data.predictions) ? data.predictions : [];
      if (!predictions.length) throw new Error('No model predictions were returned for this session.');

      renderPredictionChart(predictions);
      renderPredictedOrder(predictions);
      renderModelFacts(data);
      if (typeof showToast === 'function') showToast(`AI prediction ready · ${predictions.length} drivers`);
    } catch (error) {
      console.warn('PADDOX real race prediction unavailable:',error);
      setUnavailable(error.message || 'Prediction service unavailable.');
      if (typeof showToast === 'function') showToast(error.message || 'Prediction service unavailable');
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = previous;
      }
    }
  }

  /* Global function declared by pitwall.js is intentionally replaced before
     DOMContentLoaded. Existing click/session handlers therefore use this live path. */
  window.loadPredictiveData = realLoadPredictiveData;
})();
