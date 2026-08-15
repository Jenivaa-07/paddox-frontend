/* ============================================================
   PADDOX — Lottie Motion Icon Pack
   - Uses LottieFiles' official dotLottie Web Component runtime.
   - Local PADDOX vector animation data avoids fragile remote icon URLs.
   - Plays once on load and replays on hover/focus.
   - Upgrades Fan Hub controls + primary nav + dock across core pages.
   ============================================================ */
(function initPaddoxLottieIcons(){
  'use strict';

  const RUNTIME_URL = 'https://cdn.jsdelivr.net/npm/@lottiefiles/dotlottie-wc@latest/dist/dotlottie-wc.js';
  const RED = '#ed0038';
  const WHITE = '#f5f6f8';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const blobUrls = new Map();
  let runtimeReady = false;

  const zeroTangents = points => points.map(() => [0,0]);
  const rgb = hex => {
    const clean = hex.replace('#','');
    const value = parseInt(clean.length === 3 ? clean.split('').map(c => c+c).join('') : clean, 16);
    return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255, 1];
  };

  function pathGroup(points, { color = WHITE, width = 3.2, closed = false, opacity = 100 } = {}) {
    return {
      ty:'gr',
      it:[
        { ty:'sh', ks:{ a:0, k:{ i:zeroTangents(points), o:zeroTangents(points), v:points, c:closed } }, nm:'Path' },
        { ty:'st', c:{a:0,k:rgb(color)}, o:{a:0,k:opacity}, w:{a:0,k:width}, lc:2, lj:2, ml:4, nm:'Stroke' },
        { ty:'tr', p:{a:0,k:[0,0]}, a:{a:0,k:[0,0]}, s:{a:0,k:[100,100]}, r:{a:0,k:0}, o:{a:0,k:100}, sk:{a:0,k:0}, sa:{a:0,k:0}, nm:'Transform' }
      ],
      nm:'Line Group'
    };
  }

  function ellipseGroup(cx, cy, w, h, { color = WHITE, width = 3.2, fill = null, opacity = 100 } = {}) {
    const items = [
      { ty:'el', p:{a:0,k:[cx,cy]}, s:{a:0,k:[w,h]}, d:1, nm:'Ellipse' }
    ];
    if (fill) items.push({ ty:'fl', c:{a:0,k:rgb(fill)}, o:{a:0,k:opacity}, r:1, nm:'Fill' });
    if (width > 0) items.push({ ty:'st', c:{a:0,k:rgb(color)}, o:{a:0,k:opacity}, w:{a:0,k:width}, lc:2, lj:2, nm:'Stroke' });
    items.push({ ty:'tr', p:{a:0,k:[0,0]}, a:{a:0,k:[0,0]}, s:{a:0,k:[100,100]}, r:{a:0,k:0}, o:{a:0,k:100}, sk:{a:0,k:0}, sa:{a:0,k:0}, nm:'Transform' });
    return { ty:'gr', it:items, nm:'Ellipse Group' };
  }

  function rectGroup(cx, cy, w, h, radius = 3, { color = WHITE, width = 3.2, fill = null, opacity = 100 } = {}) {
    const items = [
      { ty:'rc', p:{a:0,k:[cx,cy]}, s:{a:0,k:[w,h]}, r:{a:0,k:radius}, d:1, nm:'Rectangle' }
    ];
    if (fill) items.push({ ty:'fl', c:{a:0,k:rgb(fill)}, o:{a:0,k:opacity}, r:1, nm:'Fill' });
    if (width > 0) items.push({ ty:'st', c:{a:0,k:rgb(color)}, o:{a:0,k:opacity}, w:{a:0,k:width}, lc:2, lj:2, nm:'Stroke' });
    items.push({ ty:'tr', p:{a:0,k:[0,0]}, a:{a:0,k:[0,0]}, s:{a:0,k:[100,100]}, r:{a:0,k:0}, o:{a:0,k:100}, sk:{a:0,k:0}, sa:{a:0,k:0}, nm:'Transform' });
    return { ty:'gr', it:items, nm:'Rectangle Group' };
  }

  function glyphDefinitions(key) {
    const defs = {
      home: [
        pathGroup([[13,31],[32,15],[51,31]], {width:3.5}),
        pathGroup([[18,27],[18,49],[46,49],[46,27]], {width:3.5}),
        pathGroup([[27,49],[27,37],[37,37],[37,49]], {color:RED,width:3.2})
      ],
      shop: [
        rectGroup(32,36,34,29,4,{width:3.4}),
        pathGroup([[24,23],[24,19],[26,15],[30,13],[34,13],[38,15],[40,19],[40,23]],{color:RED,width:3.2}),
        pathGroup([[21,31],[43,31]],{width:2.6,opacity:70})
      ],
      fanhub: [
        ellipseGroup(24,23,13,13,{width:3.1}),
        ellipseGroup(43,26,10,10,{color:RED,width:3}),
        pathGroup([[12,49],[13,43],[16,38],[20,35],[24,34],[28,35],[32,38],[34,43],[35,49]],{width:3.1}),
        pathGroup([[34,39],[38,36],[43,35],[47,36],[51,39],[53,44],[53,48]],{color:RED,width:2.8})
      ],
      pitwall: [
        pathGroup([[13,45],[14,36],[18,28],[24,22],[32,20],[40,22],[46,28],[50,36],[51,45]],{width:3.2}),
        pathGroup([[32,43],[42,29]],{color:RED,width:3.8}),
        ellipseGroup(32,43,6,6,{color:RED,width:2,fill:RED}),
        pathGroup([[18,39],[15,37]],{width:2.4}), pathGroup([[22,30],[19,27]],{width:2.4}),
        pathGroup([[32,26],[32,21]],{width:2.4}), pathGroup([[42,30],[45,27]],{width:2.4})
      ],
      account: [
        ellipseGroup(32,21,16,16,{width:3.3}),
        pathGroup([[15,51],[16,45],[19,39],[24,35],[32,33],[40,35],[45,39],[48,45],[49,51]],{color:RED,width:3.3})
      ],
      wallpapers: [
        rectGroup(32,32,39,34,4,{width:3.2}),
        ellipseGroup(42,23,5,5,{color:RED,width:2.5}),
        pathGroup([[16,43],[25,33],[31,39],[36,34],[48,44]],{width:3.1})
      ],
      drivers: [
        ellipseGroup(32,27,25,25,{width:3.1}),
        pathGroup([[20,24],[44,24],[42,31],[35,34],[24,32],[20,28]],{color:RED,width:3}),
        pathGroup([[21,43],[26,39],[32,38],[38,39],[43,43]],{width:3})
      ],
      calendar: [
        rectGroup(32,34,38,35,4,{width:3.1}),
        pathGroup([[13,27],[51,27]],{color:RED,width:3.2}),
        pathGroup([[22,14],[22,22]],{width:3.2}), pathGroup([[42,14],[42,22]],{width:3.2}),
        pathGroup([[21,35],[27,35],[27,41],[21,41]],{color:RED,width:2.5,closed:true}),
        pathGroup([[34,35],[43,35]],{width:2.4}), pathGroup([[34,41],[43,41]],{width:2.4})
      ],
      quotes: [
        ellipseGroup(23,27,11,11,{color:RED,width:3}), ellipseGroup(41,27,11,11,{color:RED,width:3}),
        pathGroup([[19,31],[17,39],[25,39],[27,32]],{width:3.1}),
        pathGroup([[37,31],[35,39],[43,39],[45,32]],{width:3.1})
      ],
      community: [
        ellipseGroup(24,21,11,11,{width:3}), ellipseGroup(43,24,9,9,{color:RED,width:2.8}),
        pathGroup([[13,46],[15,40],[19,36],[24,35],[29,36],[33,40],[35,46]],{width:3}),
        pathGroup([[36,39],[40,36],[44,35],[48,37],[51,42],[52,46]],{color:RED,width:2.8})
      ],
      chat: [
        rectGroup(31,29,39,27,7,{width:3.2}),
        pathGroup([[20,43],[18,51],[28,44]],{color:RED,width:3.2}),
        pathGroup([[21,26],[41,26]],{width:2.5}), pathGroup([[21,33],[36,33]],{color:RED,width:2.5})
      ],
      poll: [
        pathGroup([[17,47],[17,36]],{width:5}),
        pathGroup([[30,47],[30,27]],{color:RED,width:5}),
        pathGroup([[43,47],[43,18]],{width:5}),
        pathGroup([[12,50],[49,50]],{width:2.5,opacity:70})
      ],
      leaderboard: [
        pathGroup([[22,16],[42,16],[40,28],[36,33],[32,35],[28,33],[24,28],[22,16]],{color:RED,width:3,closed:true}),
        pathGroup([[22,20],[16,20],[17,27],[21,31],[26,31]],{width:2.7}),
        pathGroup([[42,20],[48,20],[47,27],[43,31],[38,31]],{width:2.7}),
        pathGroup([[32,35],[32,44]],{width:3}), pathGroup([[24,48],[40,48]],{width:3.2})
      ],
      trivia: [
        pathGroup([[22,23],[24,18],[29,15],[35,15],[40,18],[42,23],[41,28],[37,31],[33,33],[32,39]],{width:3.2}),
        ellipseGroup(32,48,5,5,{color:RED,width:2,fill:RED})
      ],
      feed: [
        ellipseGroup(20,32,6,6,{color:RED,width:2,fill:RED}),
        pathGroup([[25,25],[29,27],[31,32],[29,37],[25,39]],{width:3}),
        pathGroup([[29,19],[36,23],[39,32],[36,41],[29,45]],{color:RED,width:3}),
        pathGroup([[35,14],[44,20],[48,32],[44,44],[35,50]],{width:3})
      ],
      search: [
        ellipseGroup(28,27,24,24,{width:3.3}),
        pathGroup([[37,36],[49,48]],{color:RED,width:4})
      ],
      cart: [
        pathGroup([[13,17],[18,17],[23,39],[45,39],[49,24],[21,24]],{width:3.1}),
        ellipseGroup(27,48,6,6,{color:RED,width:2.5}), ellipseGroup(43,48,6,6,{color:RED,width:2.5})
      ]
    };
    return defs[key] || defs.fanhub;
  }

  function makeAnimation(key) {
    const glyph = glyphDefinitions(key);
    const accentShapes = [ellipseGroup(32,32,44,44,{color:RED,width:2.2,opacity:75})];
    return {
      v:'5.12.2', fr:60, ip:0, op:42, w:64, h:64, nm:`PADDOX ${key} motion icon`, ddd:0, assets:[],
      layers:[
        {
          ddd:0, ind:1, ty:4, nm:'Red Accent Pulse', sr:1,
          ks:{
            o:{a:1,k:[{t:0,s:[72],e:[20]},{t:25,s:[20],e:[0]},{t:40,s:[0]}]},
            r:{a:0,k:0}, p:{a:0,k:[32,32,0]}, a:{a:0,k:[32,32,0]},
            s:{a:1,k:[{t:0,s:[68,68,100],e:[112,112,100]},{t:25,s:[112,112,100],e:[124,124,100]},{t:40,s:[124,124,100]}]}
          },
          ao:0, shapes:accentShapes, ip:0, op:42, st:0, bm:0
        },
        {
          ddd:0, ind:2, ty:4, nm:'Primary Glyph', sr:1,
          ks:{
            o:{a:1,k:[{t:0,s:[0],e:[100]},{t:8,s:[100]}]},
            r:{a:1,k:[{t:0,s:[-5],e:[4]},{t:12,s:[4],e:[0]},{t:26,s:[0]}]},
            p:{a:0,k:[32,32,0]}, a:{a:0,k:[32,32,0]},
            s:{a:1,k:[{t:0,s:[76,76,100],e:[110,110,100]},{t:12,s:[110,110,100],e:[100,100,100]},{t:26,s:[100,100,100]}]}
          },
          ao:0, shapes:glyph, ip:0, op:42, st:0, bm:0
        }
      ],
      markers:[]
    };
  }

  function animationUrl(key) {
    if (!blobUrls.has(key)) {
      const blob = new Blob([JSON.stringify(makeAnimation(key))], {type:'application/json'});
      blobUrls.set(key, URL.createObjectURL(blob));
    }
    return blobUrls.get(key);
  }

  const selectorMap = [
    ['.nav-home-icon','home'], ['.nav-shop-icon','shop'], ['.nav-fanhub-icon','fanhub'],
    ['.nav-pitwall-icon','pitwall'], ['.nav-account-icon','account'],
    ['.search-icon-anim','search'], ['.cart-icon-anim','cart'], ['.search-mini-icon','search'],
    ['.fh-ico-wallpapers','wallpapers'], ['.fh-ico-drivers','drivers'], ['.fh-ico-calendar','calendar'],
    ['.fh-ico-quotes','quotes'], ['.fh-ico-community','community'], ['.fh-ico-pitwall','pitwall'],
    ['.fh-ico-chat','chat'], ['.fh-ico-poll','poll'], ['.fh-ico-leaderboard','leaderboard'],
    ['.fh-ico-trivia','trivia'], ['.fh-ico-feed','feed']
  ];

  const dockKeyFromItem = item => {
    const label = String(item?.getAttribute('aria-label') || item?.querySelector('.pdx-dock-label')?.textContent || '').toLowerCase();
    if (label.includes('shop')) return 'shop';
    if (label.includes('fan')) return 'fanhub';
    if (label.includes('pit')) return 'pitwall';
    if (label.includes('account')) return 'account';
    return 'home';
  };

  function playerFor(node, key) {
    const player = document.createElement('dotlottie-wc');
    player.className = 'pdx-lottie-player';
    player.setAttribute('src', animationUrl(key));
    player.setAttribute('speed','1');
    player.setAttribute('aria-hidden','true');
    player.tabIndex = -1;
    return player;
  }

  function replay(player) {
    if (!player || reduceMotion.matches) return;
    const instance = player.dotLottie;
    if (!instance) return;
    try { instance.stop(); instance.play(); } catch (_) { /* player may still be loading */ }
  }

  function bindReplay(node, player) {
    const trigger = node.closest('.pdx-dock-item,.nav-link,.mob-link,.hub-tab,.hero-chip,.comm-card-title,.nav-search-btn,.nav-cart-btn,.pdx-chat-room-mark,.pdx-chat-empty-mark') || node;
    if (trigger.dataset.pdxLottieReplay === '1') return;
    trigger.dataset.pdxLottieReplay = '1';
    trigger.addEventListener('pointerenter', () => replay(player), {passive:true});
    trigger.addEventListener('focusin', () => replay(player));
  }

  function upgradeElement(node, key) {
    if (!runtimeReady || !node || node.dataset.pdxLottieKey) return;
    node.dataset.pdxLottieKey = key;
    node.classList.add('pdx-lottie-icon');
    node.replaceChildren();
    const player = playerFor(node, key);
    node.appendChild(player);

    player.addEventListener('load', () => {
      const instance = player.dotLottie;
      if (!instance) return;
      try {
        instance.setSpeed?.(1.05);
        if (reduceMotion.matches) instance.stop();
        else instance.play();
      } catch (_) { /* safe fallback */ }
    }, {once:true});

    bindReplay(node, player);
  }

  function upgradeAll(root = document) {
    if (!runtimeReady || !root?.querySelectorAll) return;
    selectorMap.forEach(([selector,key]) => {
      if (root.matches?.(selector)) upgradeElement(root,key);
      root.querySelectorAll(selector).forEach(node => upgradeElement(node,key));
    });

    const dockItems = [];
    if (root.matches?.('.pdx-dock-item')) dockItems.push(root);
    root.querySelectorAll('.pdx-dock-item').forEach(item => dockItems.push(item));
    dockItems.forEach(item => {
      const icon = item.querySelector('.pdx-dock-icon');
      if (icon) upgradeElement(icon, dockKeyFromItem(item));
    });
  }

  function currentPageKey() {
    const name = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    if (!name || name === 'index.html') return 'home';
    if (name.startsWith('shop')) return 'shop';
    if (name.startsWith('fanhub')) return 'fanhub';
    if (name.startsWith('pitwall')) return 'pitwall';
    if (name.startsWith('account')) return 'account';
    if (name.startsWith('collectibles')) return 'account';
    return '';
  }

  const dockFallbackSvg = {
    home:'<svg viewBox="0 0 24 24"><path d="M3.5 10.5 12 3.7l8.5 6.8v9.2h-5.4v-6.2H8.9v6.2H3.5z"/></svg>',
    shop:'<svg viewBox="0 0 24 24"><path d="M5.2 8.2h13.6l1 11.3H4.2z"/><path d="M8.4 8.2V6.7a3.6 3.6 0 0 1 7.2 0v1.5"/></svg>',
    fanhub:'<svg viewBox="0 0 24 24"><circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M2.8 19c.5-3.5 2.4-5.3 5.2-5.3s4.7 1.8 5.2 5.3M13.2 15.1c1-.9 2.2-1.3 3.7-1.3 2.4 0 3.8 1.6 4.3 4.5"/></svg>',
    pitwall:'<svg viewBox="0 0 24 24"><path d="M4 18.5a8 8 0 1 1 16 0"/><path d="m12 18.5 4.6-6.2"/></svg>',
    account:'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.5"/><path d="M5.2 20c.5-4.1 2.8-6.2 6.8-6.2s6.3 2.1 6.8 6.2"/></svg>'
  };

  function mountDock() {
    const pageKey = currentPageKey();
    if (!pageKey) return;
    document.body?.classList.add('paddox-dock-global');

    const existing = document.getElementById('pdx-dock');
    if (existing) {
      existing.querySelectorAll('.pdx-dock-item').forEach(item => {
        const href = String(item.getAttribute('href') || '').toLowerCase();
        const active = (pageKey === 'home' && href.includes('index')) ||
          (pageKey !== 'home' && href.includes(`${pageKey === 'fanhub' ? 'fanhub' : pageKey}.html`));
        item.classList.toggle('active', active);
        if (active) item.setAttribute('aria-current','page'); else item.removeAttribute('aria-current');
      });
      initDockMagnification(existing.querySelector('.pdx-dock-panel'));
      if (runtimeReady) upgradeAll(existing);
      return;
    }

    const destinations = [
      ['home','index.html','Home'], ['shop','shop.html','Shop'], ['fanhub','fanhub.html','Fan Hub'],
      ['pitwall','pitwall.html','Pit Wall'], ['account','account.html','Account']
    ];
    const dock = document.createElement('nav');
    dock.id = 'pdx-dock';
    dock.className = 'pdx-dock-outer';
    dock.setAttribute('aria-label','Primary navigation');
    dock.innerHTML = `<div class="pdx-dock-panel" id="pdx-dock-panel" role="toolbar" aria-label="PADDOX destinations">${destinations.map(([key,href,label]) => {
      const active = key === pageKey || (pageKey === 'account' && key === 'account');
      return `<a href="${href}" class="pdx-dock-item${active ? ' active' : ''}" aria-label="${label}"${active ? ' aria-current="page"' : ''} aria-describedby="pdx-dock-label-${key}"><span class="pdx-dock-icon" aria-hidden="true">${dockFallbackSvg[key]}</span><span class="pdx-dock-label" id="pdx-dock-label-${key}" role="tooltip">${label}</span></a>`;
    }).join('')}</div>`;

    const navbar = document.getElementById('navbar');
    if (navbar) navbar.insertAdjacentElement('afterend',dock); else document.body.appendChild(dock);
    initDockMagnification(dock.querySelector('.pdx-dock-panel'));
    if (runtimeReady) upgradeAll(dock);
  }

  function initDockMagnification(panel) {
    if (!panel || panel.dataset.pdxGlobalMagnify === '1' || panel.dataset.pdxMagnifyReady === '1') return;
    panel.dataset.pdxGlobalMagnify = '1';
    panel.dataset.pdxMagnifyReady = '1';
    const items = [...panel.querySelectorAll('.pdx-dock-item')];
    if (!items.length) return;
    const finePointer = window.matchMedia('(hover:hover) and (pointer:fine)');
    const base = 50, max = 70, distance = 180;
    let frame = 0;
    const current = items.map(() => base);
    const targets = items.map(() => base);

    const render = () => {
      let moving = false;
      items.forEach((item,index) => {
        const diff = targets[index] - current[index];
        current[index] += diff * (reduceMotion.matches ? 1 : .23);
        if (Math.abs(diff) > .1) moving = true; else current[index] = targets[index];
        item.style.setProperty('--pdx-dock-size',`${current[index].toFixed(2)}px`);
      });
      frame = moving ? requestAnimationFrame(render) : 0;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(render); };
    const reset = () => { targets.fill(base); schedule(); };

    panel.addEventListener('pointermove', event => {
      if (!finePointer.matches) return;
      items.forEach((item,index) => {
        const rect = item.getBoundingClientRect();
        const center = rect.left + rect.width / 2;
        const proximity = Math.max(0,1 - Math.abs(event.clientX - center) / distance);
        const eased = 1 - Math.pow(1 - proximity,3);
        targets[index] = base + (max - base) * eased;
      });
      schedule();
    }, {passive:true});
    panel.addEventListener('pointerleave',reset,{passive:true});
  }

  function removeLegacyFanSignal() {
    document.getElementById('pdx-fanhub-showcase')?.remove();
  }

  function observeDom() {
    if (!('MutationObserver' in window) || document.documentElement.dataset.pdxLottieObserver === '1') return;
    document.documentElement.dataset.pdxLottieObserver = '1';
    const observer = new MutationObserver(records => {
      records.forEach(record => record.addedNodes.forEach(node => {
        if (!(node instanceof Element)) return;
        if (node.id === 'pdx-fanhub-showcase') { node.remove(); return; }
        if (node.querySelector?.('#pdx-fanhub-showcase')) node.querySelector('#pdx-fanhub-showcase')?.remove();
        if (runtimeReady) upgradeAll(node);
        if (node.id === 'pdx-dock' || node.querySelector?.('#pdx-dock')) {
          const panel = document.querySelector('#pdx-dock-panel');
          initDockMagnification(panel);
        }
      }));
    });
    observer.observe(document.body,{childList:true,subtree:true});
  }

  function ensureRuntime() {
    if (customElements.get('dotlottie-wc')) return Promise.resolve();
    if (!document.querySelector('script[data-pdx-lottiefiles-runtime]')) {
      const runtime = document.createElement('script');
      runtime.type = 'module';
      runtime.src = RUNTIME_URL;
      runtime.dataset.pdxLottiefilesRuntime = '1';
      document.head.appendChild(runtime);
    }
    return Promise.race([
      customElements.whenDefined('dotlottie-wc'),
      new Promise((_,reject) => setTimeout(() => reject(new Error('LottieFiles runtime timeout')),12000))
    ]);
  }

  function domReady() {
    mountDock();
    removeLegacyFanSignal();
    observeDom();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',domReady,{once:true});
  else domReady();

  ensureRuntime().then(() => {
    runtimeReady = true;
    upgradeAll(document);
    mountDock();
    document.documentElement.classList.add('pdx-lottie-ready');
  }).catch(error => {
    console.warn('PADDOX Lottie icon runtime unavailable; static icon fallback retained.',error.message || error);
  });
})();
