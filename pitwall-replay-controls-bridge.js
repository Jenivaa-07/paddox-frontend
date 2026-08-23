/* Guarantees replay controls work even when the replay workspace mounts dynamically. */
(function installReplayControlBridge(){
  'use strict';
  if (window.__PADDOX_REPLAY_CONTROL_BRIDGE__) return;
  window.__PADDOX_REPLAY_CONTROL_BRIDGE__ = true;

  const speeds = ['0.5×', '1×', '2×', '4×', '10×', '20×'];

  document.addEventListener('click', event => {
    const button = event.target.closest?.('[data-replay-action]');
    if (!button || button.disabled) return;

    /* Capture before any late/duplicate module listeners so exactly one replay
       command reaches the FastF1 controller. */
    event.preventDefault();
    event.stopImmediatePropagation();

    const action = String(button.dataset.replayAction || '');
    window.dispatchEvent(new CustomEvent('paddox:replay-control', { detail: { action } }));

    if (action === 'play') {
      button.textContent = button.textContent.trim() === '▶' ? 'Ⅱ' : '▶';
    } else if (action === 'speed') {
      const current = button.textContent.trim();
      const index = speeds.indexOf(current);
      button.textContent = speeds[(index + 1) % speeds.length];
    }
  }, true);
})();
