/* PADDOX L2.0.1 — cleaner Shop motion icon override.
   Replaces the text-bearing shop animation with a pure animated shopping bag. */
(function paddoxLottieShopHotfix(){
  'use strict';

  const BAG_SRC = 'https://raw.githubusercontent.com/iconforest/flutter_animated_icons/main/assets/lottiefiles.com/38787-bag-icon.json';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function replaceShopPlayer(host){
    if (!host || host.dataset.pdxShopBagFixed === '1') return;
    if (host.dataset.pdxLottieV2 !== 'shop') return;

    const old = host.querySelector('.pdx-lottie-v2-player');
    if (!old) return;

    const player = document.createElement('dotlottie-wc');
    player.className = 'pdx-lottie-v2-player';
    player.setAttribute('src', BAG_SRC);
    player.setAttribute('speed', '.52');
    player.setAttribute('mode', 'bounce');
    player.setAttribute('autoplay', '');
    player.setAttribute('loop', '');
    player.setAttribute('aria-hidden', 'true');
    player.tabIndex = -1;

    host.dataset.pdxShopBagFixed = '1';
    host.classList.remove('pdx-lottie-v2-loaded');
    old.replaceWith(player);

    player.addEventListener('load', () => {
      host.classList.add('pdx-lottie-v2-loaded');
      try {
        player.dotLottie?.setLoop?.(true);
        if (reduceMotion.matches) player.dotLottie?.pause?.();
        else player.dotLottie?.play?.();
      } catch (_) {}
    }, { once:true });
  }

  function scan(root = document){
    if (root.matches?.('[data-pdx-lottie-v2="shop"]')) replaceShopPlayer(root);
    root.querySelectorAll?.('[data-pdx-lottie-v2="shop"]').forEach(replaceShopPlayer);
  }

  function start(){
    scan(document);

    if ('MutationObserver' in window) {
      new MutationObserver(records => {
        records.forEach(record => {
          const target = record.target instanceof Element ? record.target : null;
          if (target?.matches?.('[data-pdx-lottie-v2="shop"]')) replaceShopPlayer(target);
          record.addedNodes.forEach(node => {
            if (!(node instanceof Element)) return;
            const host = node.closest?.('[data-pdx-lottie-v2="shop"]');
            if (host) replaceShopPlayer(host);
            scan(node);
          });
        });
      }).observe(document.documentElement, { childList:true, subtree:true });
    }

    /* Covers the asynchronous initial Lottie upgrade without a permanent timer. */
    let passes = 0;
    const timer = setInterval(() => {
      scan(document);
      passes += 1;
      if (passes >= 20) clearInterval(timer);
    }, 350);
  }

  if (customElements.get('dotlottie-wc')) start();
  else customElements.whenDefined('dotlottie-wc').then(start).catch(() => {});
})();
