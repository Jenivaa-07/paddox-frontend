/* ============================================================
   PADDOX — Native navigation safety
   Keeps internal links reliable even if a decorative page-transition
   animation is restored from cache or another page script stalls.
   Also boots the shared LottieFiles icon system used across PADDOX.
   ============================================================ */
(function initPaddoxNativeNavigation(){
  'use strict';

  function loadPaddoxLottieSystem(){
    if (!document.getElementById('pdx-lottie-icons-css')) {
      const style = document.createElement('link');
      style.id = 'pdx-lottie-icons-css';
      style.rel = 'stylesheet';
      style.href = 'paddox-lottie-icons-v4.css?v=L4_0';
      document.head.appendChild(style);
    }

    if (!document.getElementById('pdx-lottie-critical-style')) {
      const critical = document.createElement('style');
      critical.id = 'pdx-lottie-critical-style';
      critical.textContent = `
        .pdx-dock-panel{position:relative!important}
        .pdx-dock-icon svg{width:22px;height:22px;display:block;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
        .pdx-dock-icon svg circle{fill:none;stroke:currentColor}
      `;
      document.head.appendChild(critical);
    }

    if (!document.querySelector('script[data-pdx-lottie-icons]')) {
      const script = document.createElement('script');
      script.src = 'paddox-lottie-icons-v4.js?v=L4_0';
      script.defer = true;
      script.dataset.pdxLottieIcons = '4';
      script.onerror = () => console.warn('PADDOX Lottie icon system could not be loaded.');
      document.head.appendChild(script);
    }
  }

  function neutralizeTransition(){
    const overlay = document.getElementById('page-overlay');
    if (overlay) {
      overlay.classList.remove('slide-in', 'slide-out');
      overlay.setAttribute('aria-hidden', 'true');
      overlay.style.setProperty('display', 'none', 'important');
      overlay.style.setProperty('pointer-events', 'none', 'important');
    }

    if (document.body) {
      document.body.classList.remove('page-transition-init');
      document.body.style.opacity = '1';
    }
  }

  function isDirectInternalNavigation(link, event){
    if (!link || link.hasAttribute('download') || link.target === '_blank') return false;
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;

    const raw = link.getAttribute('href') || '';
    if (!raw || raw.startsWith('#') || raw.startsWith('mailto:') || raw.startsWith('tel:') || raw.startsWith('javascript:')) return false;

    try {
      const destination = new URL(raw, window.location.href);
      return destination.origin === window.location.origin;
    } catch (_) {
      return false;
    }
  }

  loadPaddoxLottieSystem();

  document.addEventListener('click', event => {
    const target = event.target;
    const link = target instanceof Element ? target.closest('a[href]') : null;
    if (!isDirectInternalNavigation(link, event)) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    neutralizeTransition();
    window.location.assign(link.href);
  }, true);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', neutralizeTransition, { once: true });
  } else {
    neutralizeTransition();
  }

  window.addEventListener('pageshow', neutralizeTransition);
  window.addEventListener('load', neutralizeTransition, { once: true });
})();
