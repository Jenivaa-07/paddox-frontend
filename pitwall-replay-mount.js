/* Ensures the Pit Wall 2.0 workspace mounts even when its module loads after DOMContentLoaded. */
(function mountPitWallReplayNow(){
  'use strict';

  function mount(){
    if (document.getElementById('pit-replay-workspace')) {
      window.PaddoxReplay?.render?.();
      return;
    }
    const anchor = document.querySelector('.pit-kpi-grid');
    if (!anchor) return;

    anchor.insertAdjacentHTML('afterend', `
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
            <div class="pit-tower-list" id="pit-tower-list"><div class="pit-replay-empty-list">Load a session with real timing data to populate the timing tower.</div></div>
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
                <p>Driver markers appear only when PADDOX receives real OpenF1/FastF1 location samples. No synthetic circuit or car positions are substituted.</p>
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
            <div class="pit-driver-panel" id="pit-driver-panel"><div class="pit-replay-empty-list">Select a session to inspect a driver.</div></div>
          </aside>
        </div>
      </section>`);

    window.PaddoxReplay?.render?.();
    window.dispatchEvent(new CustomEvent('paddox:replay-mounted'));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once:true });
  else mount();
})();