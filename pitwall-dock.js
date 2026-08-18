/* ============================================================
   PADDOX Pit Wall — Shop-parity Dock interaction
   Base 50px · magnification 70px · 180px influence distance.
   ============================================================ */
(function initPaddoxPitWallDock(){
  'use strict';

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
})();
