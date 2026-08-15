/* ============================================================
   PADDOX — Native navigation safety
   Keeps internal links reliable even if a decorative page-transition
   animation is restored from cache or another page script stalls.
   ============================================================ */
(function initPaddoxNativeNavigation(){
  'use strict';

  function loadFanHubEnhancements(){
    if (!/fanhub\.html$/i.test(window.location.pathname)) return;

    if (!document.getElementById('pdx-fanhub-chat-icon-fix')) {
      const iconStyle = document.createElement('link');
      iconStyle.id = 'pdx-fanhub-chat-icon-fix';
      iconStyle.rel = 'stylesheet';
      iconStyle.href = 'fanhub-chat-icon-fix.css?v=CHAT_ICON_1';
      document.head.appendChild(iconStyle);
    }

    if (!document.getElementById('pdx-fanhub-chat-reactions-style')) {
      const reactionStyle = document.createElement('link');
      reactionStyle.id = 'pdx-fanhub-chat-reactions-style';
      reactionStyle.rel = 'stylesheet';
      reactionStyle.href = 'fanhub-chat-reactions.css?v=REACTIONS_1';
      document.head.appendChild(reactionStyle);
    }

    if (!document.querySelector('script[data-pdx-chat-reactions]')) {
      const reactionScript = document.createElement('script');
      reactionScript.src = 'fanhub-chat-reactions.js?v=REACTIONS_1';
      reactionScript.defer = true;
      reactionScript.dataset.pdxChatReactions = '1';
      document.head.appendChild(reactionScript);
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
    document.addEventListener('DOMContentLoaded', () => {
      neutralizeTransition();
      loadFanHubEnhancements();
    }, { once: true });
  } else {
    neutralizeTransition();
    loadFanHubEnhancements();
  }

  window.addEventListener('pageshow', neutralizeTransition);
  window.addEventListener('load', neutralizeTransition, { once: true });
})();
