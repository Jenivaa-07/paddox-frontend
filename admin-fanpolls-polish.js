/* PADDOX ADMIN — Fan Polls visual polish */
(function(){
  'use strict';

  function install(){
    if (document.getElementById('pdx-fanpoll-no-letter-fallback')) return;

    const style = document.createElement('style');
    style.id = 'pdx-fanpoll-no-letter-fallback';
    style.textContent = `
      #adm-fanpolls .pdx-poll-logo-tile > span {
        font-size: 0 !important;
        line-height: 0 !important;
        width: 16px !important;
        height: 12px !important;
        display: block !important;
        opacity: .72 !important;
        transform: skewX(-8deg);
        background:
          conic-gradient(
            from 90deg,
            var(--poll-logo-color) 0 25%,
            transparent 0 50%,
            var(--poll-logo-color) 0 75%,
            transparent 0
          ) 0 0 / 8px 8px;
        filter: drop-shadow(0 0 5px color-mix(in srgb, var(--poll-logo-color), transparent 50%));
      }

      #adm-fanpolls .pdx-poll-logo-tile img {
        z-index: 2 !important;
      }
    `;
    document.head.appendChild(style);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();
