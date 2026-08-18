/* ============================================================
   PADDOX Pit Wall — Runtime Guard
   Keeps the live session refresh fast without re-running predictive inference
   every 12 seconds. New session = immediate inference; automatic refreshes are
   limited to once per minute; the user Refresh Prediction button always forces.
   ============================================================ */
(function installPitWallRuntimeGuard(){
  'use strict';

  const realPredict = typeof loadPredictiveData === 'function'
    ? loadPredictiveData
    : window.loadPredictiveData;
  if (typeof realPredict !== 'function') return;

  const MIN_AUTO_INTERVAL = 60 * 1000;
  let lastKey = '';
  let lastStartedAt = 0;
  let inFlight = false;
  let forceNext = false;

  function contextKey(){
    const year = typeof currentYear !== 'undefined' ? currentYear : new Date().getFullYear();
    const round = typeof currentRound !== 'undefined' ? currentRound : 'round';
    const session = typeof currentSession !== 'undefined' ? currentSession : 'session';
    return `${year}:${round}:${session}`;
  }

  const refreshButton = document.getElementById('refresh-predictions');
  refreshButton?.addEventListener('click', () => {
    forceNext = true;
  }, { capture:true });

  async function guardedPredictiveRefresh(){
    const now = Date.now();
    const key = contextKey();
    const forced = forceNext;
    forceNext = false;

    if (inFlight && !forced) return;
    if (!forced && key === lastKey && now - lastStartedAt < MIN_AUTO_INTERVAL) return;

    inFlight = true;
    lastKey = key;
    lastStartedAt = now;
    try {
      return await realPredict();
    } finally {
      inFlight = false;
    }
  }

  try { loadPredictiveData = guardedPredictiveRefresh; }
  catch (_) { window.loadPredictiveData = guardedPredictiveRefresh; }
})();
