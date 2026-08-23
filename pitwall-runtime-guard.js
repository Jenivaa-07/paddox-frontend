/* PADDOX Pit Wall runtime loader — keeps the page HTML/CSS/JS architecture intact. */
(function loadPitWallModules(){
  'use strict';

  function addStyle(id, href){
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }

  function addScript(id, src, onload){
    const existing = document.getElementById(id);
    if (existing) {
      if (onload) onload();
      return;
    }
    const script = document.createElement('script');
    script.id = id;
    script.src = src;
    script.async = false;
    if (onload) script.addEventListener('load', onload, { once:true });
    document.head.appendChild(script);
  }

  addStyle('pitwall-hero-shop-parity', 'pitwall-hero-shop-parity.css?v=PW4_1');
  addStyle('pitwall-replay-ui-style', 'pitwall-replay-ui.css?v=PW_REPLAY_1');

  addScript('pitwall-replay-ui-script', 'pitwall-replay-ui.js?v=PW_REPLAY_1', () => {
    addScript('pitwall-replay-mount-script', 'pitwall-replay-mount.js?v=PW_REPLAY_2');
  });
  addScript('pitwall-live-stream-script', 'pitwall-live-stream.js?v=PW_STREAM_1');
})();