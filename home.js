/* ============================================================
   PADDOX — home.js
   Landing Page Logic
   ============================================================ */

'use strict';

/* ── PRODUCTS DATA ── */
const PRODUCTS = [
  {
    id: 1,
    name: 'SF-25 Podium Cap',
    team: 'Scuderia Ferrari',
    cat: 'apparel',
    price: 2499,
    rating: 5,
    badge: 'new',
    emoji: '🧢',
    gradient: 'linear-gradient(135deg,#1a0800,#2d1200)',
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&q=80',
    desc: 'Official replica Ferrari team cap. Premium embroidered logo, moisture-wicking fabric. Worn on the Monaco podium.'
  },
  {
    id: 2,
    name: 'RB20 Team Tee',
    team: 'Oracle Red Bull Racing',
    cat: 'apparel',
    price: 3999,
    rating: 5,
    badge: 'hot',
    emoji: '👕',
    gradient: 'linear-gradient(135deg,#00071a,#00102e)',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
    desc: 'Premium cotton tee featuring the Red Bull Racing livery. Lightweight and breathable for everyday wear.'
  },
  {
    id: 3,
    name: 'W15 Collector Diecast',
    team: 'Mercedes-AMG Petronas',
    cat: 'collectibles',
    price: 8999,
    rating: 4,
    badge: 'ltd',
    emoji: '🏆',
    gradient: 'linear-gradient(135deg,#001a14,#002d22)',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&q=80',
    desc: '1:43 scale die-cast model of the W15. Limited to 500 units worldwide. Comes in collector display box.'
  },
  {
    id: 4,
    name: 'Monaco Circuit Watch',
    team: 'Paddox Edition',
    cat: 'accessories',
    price: 18999,
    rating: 5,
    badge: 'ltd',
    emoji: '⌚',
    gradient: 'linear-gradient(135deg,#0d0d0d,#1a1a1a)',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
    desc: 'Limited edition timepiece featuring Monaco circuit etching on dial. Swiss quartz movement. Only 200 units.'
  }
];

/* ── QUOTES DATA ── */
const QUOTES = [
  {
    text: 'I have no idea how I did that lap. Sometimes the car just talks to you and you have to listen.',
    driver: 'Max Verstappen',
    team: 'Oracle Red Bull Racing',
    av: '🔵'
  },
  {
    text: 'Every time I put on the helmet, I feel like I can conquer the world. That is what racing does to you.',
    driver: 'Lewis Hamilton',
    team: 'Scuderia Ferrari',
    av: '⭐'
  },
  {
    text: 'Monaco is not just a race — it is a statement. You either belong here or you do not.',
    driver: 'Charles Leclerc',
    team: 'Scuderia Ferrari',
    av: '🔴'
  },
  {
    text: 'Pressure is nothing more than the shadow of great opportunity. I embrace every moment on track.',
    driver: 'Lando Norris',
    team: 'McLaren F1 Team',
    av: '🟠'
  }
];

/* ══════════════════════════════════════
   PARTICLES
══════════════════════════════════════ */
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], burst = false, burstTimer = null;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  /* Particle class */
  class Particle {
    constructor(isBurst = false) { this.reset(isBurst); }

    reset(isBurst = false) {
      this.isBurst = isBurst;
      this.type    = Math.random() < 0.55 ? 'spark' : 'dot';
      this.x       = isBurst ? W * 0.5 + (Math.random() - 0.5) * 300
                             : Math.random() * W;
      this.y       = isBurst ? H * 0.5 + (Math.random() - 0.5) * 100
                             : Math.random() * H;
      const speed  = isBurst ? 4 + Math.random() * 6 : 1.5 + Math.random() * 2.5;
      const angle  = isBurst ? Math.random() * Math.PI * 2
                             : -Math.PI * 0.05 + (Math.random() - 0.5) * 0.4;
      this.vx      = Math.cos(angle) * speed;
      this.vy      = Math.sin(angle) * speed - (isBurst ? 0 : 0.2);
      this.life    = 1;
      this.decay   = isBurst ? 0.016 + Math.random() * 0.02
                             : 0.003 + Math.random() * 0.004;
      this.size    = this.type === 'spark'
                     ? 0.6 + Math.random() * 1.6
                     : 0.5 + Math.random() * 1.2;
      const r      = Math.random();
      this.color   = r < 0.65 ? 'rgba(232,0,45,'
                   : r < 0.82 ? 'rgba(200,200,200,'
                               : 'rgba(201,168,76,';
    }

    update() {
      this.x    += this.vx;
      this.y    += this.vy;
      this.vy   += 0.012; // gentle gravity
      this.life -= this.decay;
      if (this.life <= 0 || this.x > W + 30 || this.x < -30 || this.y > H + 30) {
        this.reset(false);
      }
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.life * 0.75);
      if (this.type === 'spark') {
        ctx.strokeStyle = `${this.color}1)`;
        ctx.lineWidth   = this.size;
        ctx.lineCap     = 'round';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.vx * 7, this.y - this.vy * 7);
        ctx.stroke();
      } else {
        ctx.fillStyle = `${this.color}0.9)`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  /* Spawn base particles */
  for (let i = 0; i < 90; i++) particles.push(new Particle());

  /* Occasional speed burst */
  function triggerBurst() {
    for (let i = 0; i < 40; i++) particles.push(new Particle(true));
    burstTimer = setTimeout(triggerBurst, 6000 + Math.random() * 8000);
  }
  burstTimer = setTimeout(triggerBurst, 3000);

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    // Remove dead burst particles
    particles = particles.filter(p => p.life > 0 || !p.isBurst);
    // Keep base count stable
    while (particles.filter(p => !p.isBurst).length < 90) {
      particles.push(new Particle(false));
    }
    requestAnimationFrame(loop);
  }
  loop();
})();

/* ══════════════════════════════════════
   PAGE TRANSITION
══════════════════════════════════════ */
(function initPageTransition() {
  const overlay = document.getElementById('page-overlay');
  if (!overlay) return;

  /* Intercept internal nav clicks */
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) return;

    link.addEventListener('click', e => {
      e.preventDefault();
      overlay.classList.add('slide-in');
      setTimeout(() => { window.location.href = href; }, 480);
    });
  });

  /* Slide out on arrival */
  window.addEventListener('load', () => {
    overlay.classList.remove('slide-in');
    overlay.classList.add('slide-out');
    setTimeout(() => overlay.classList.remove('slide-out'), 500);
  });
})();

/* ══════════════════════════════════════
   NAVBAR
══════════════════════════════════════ */
(function initNavbar() {
  const navbar   = document.getElementById('navbar');
  const hamburger= document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const searchBtn  = document.getElementById('nav-search-btn');
  const searchDrawer = document.getElementById('search-drawer');
  const searchClose  = document.getElementById('search-close');
  const searchInput  = document.getElementById('search-input');

  /* Scroll shrink + glow */
  let lastY = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    navbar.classList.toggle('scrolled', y > 60);
    lastY = y;
  }, { passive: true });

  /* Hamburger toggle */
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });
  }

  /* Search drawer */
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      searchDrawer.classList.add('open');
      searchInput.focus();
    });
  }
  if (searchClose) {
    searchClose.addEventListener('click', () => {
      searchDrawer.classList.remove('open');
    });
  }
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') searchDrawer.classList.remove('open');
  });

  /* Helmet icon entrance is CSS-driven; add hover wiggle via JS for fun */
  const helmet = document.getElementById('helmet-wrap');
  if (helmet) {
    helmet.addEventListener('mouseenter', () => {
      helmet.style.transform = 'rotate(-10deg) scale(1.18)';
      helmet.style.boxShadow = '0 0 22px rgba(232,0,45,.5)';
    });
    helmet.addEventListener('mouseleave', () => {
      helmet.style.transform = '';
      helmet.style.boxShadow = '';
    });
  }
})();

/* Real F1 countdown — auto-detects next race */
async function initRealCountdown() {
  try {
    const data = await PaddoxAPI.f1.nextRace();
    if (!data.success || !data.data.race) return;

    const raceDate = new Date(data.data.raceDate);
    const race     = data.data.race;

    /* Update race name if element exists */
    const nameEl = document.querySelector('.race-meta h3');
    if (nameEl) nameEl.textContent = `${race.flag} ${race.name}`;
    const circEl = document.querySelector('.race-meta p');
    if (circEl) circEl.textContent = `${race.circuit} · ${race.location}, ${race.country}`;
    const chipEl = document.querySelector('.race-chip');
    if (chipEl) chipEl.textContent = `Round ${race.round} · ${race.season}`;

    function tick() {
      const diff = raceDate - new Date();
      if (diff <= 0) return;
      const d = Math.floor(diff / 864e5);
      const h = Math.floor((diff % 864e5) / 36e5);
      const m = Math.floor((diff % 36e5) / 6e4);
      const s = Math.floor((diff % 6e4) / 1e3);
      const cdD = document.getElementById('cd-d');
      const cdH = document.getElementById('cd-h');
      const cdM = document.getElementById('cd-m');
      const cdS = document.getElementById('cd-s');
      if (cdD) cdD.textContent = String(d).padStart(2,'0');
      if (cdH) cdH.textContent = String(h).padStart(2,'0');
      if (cdM) cdM.textContent = String(m).padStart(2,'0');
      if (cdS) cdS.textContent = String(s).padStart(2,'0');
    }
    tick();
    setInterval(tick, 1000);

  } catch (err) {
    console.warn('Countdown API failed — using fallback');
    /* Original hardcoded fallback */
    function fallbackTick() {
      const race = new Date('2026-12-31T13:00:00Z');
      const diff = race - new Date();
      if (diff <= 0) return;
      const cdD = document.getElementById('cd-d');
      const cdH = document.getElementById('cd-h');
      const cdM = document.getElementById('cd-m');
      const cdS = document.getElementById('cd-s');
      if (cdD) cdD.textContent = String(Math.floor(diff/864e5)).padStart(2,'0');
      if (cdH) cdH.textContent = String(Math.floor((diff%864e5)/36e5)).padStart(2,'0');
      if (cdM) cdM.textContent = String(Math.floor((diff%36e5)/6e4)).padStart(2,'0');
      if (cdS) cdS.textContent = String(Math.floor((diff%6e4)/1e3)).padStart(2,'0');
    }
    fallbackTick();
    setInterval(fallbackTick, 1000);
  }
}

/* Replace old updateCD() call with this */
initRealCountdown();

/* ══════════════════════════════════════
   HERO SPEED LINES
══════════════════════════════════════ */
(function initSpeedLines() {
  const container = document.getElementById('speed-lines');
  if (!container) return;
  const configs = [
    { top:'18%', width:'45%', delay:'0s',   dur:'2.8s', opacity:.5 },
    { top:'34%', width:'28%', delay:'.6s',  dur:'2.2s', opacity:.4 },
    { top:'52%', width:'60%', delay:'1.2s', dur:'3.2s', opacity:.35 },
    { top:'66%', width:'35%', delay:'.3s',  dur:'2.6s', opacity:.4 },
    { top:'78%', width:'50%', delay:'1s',   dur:'3s',   opacity:.3 }
  ];
  configs.forEach(c => {
    const line = document.createElement('div');
    line.className = 'speed-line';
    line.style.cssText = `top:${c.top};width:${c.width};animation-delay:${c.delay};animation-duration:${c.dur};opacity:${c.opacity}`;
    container.appendChild(line);
  });
})();

/* ══════════════════════════════════════
   COUNTER ANIMATION (stats)
══════════════════════════════════════ */
(function initCounters() {
  const counters = document.querySelectorAll('.stat-num[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el    = entry.target;
      const target= parseInt(el.dataset.count, 10);
      const dur   = 1800;
      const step  = 16;
      const inc   = target / (dur / step);
      let current = 0;
      const timer = setInterval(() => {
        current = Math.min(current + inc, target);
        el.textContent = Math.floor(current);
        if (current >= target) clearInterval(timer);
      }, step);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
})();

/* ══════════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════════ */
(function initReveal() {
  const items = document.querySelectorAll(
    '.reveal-up, .reveal-left, .reveal-right, .reveal-section'
  );
  if (!items.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  items.forEach(el => observer.observe(el));
})();

/* ══════════════════════════════════════
   PARALLAX (quote section bg)
══════════════════════════════════════ */
(function initParallax() {
  const sections = document.querySelectorAll('.parallax-section');
  if (!sections.length) return;

  function onScroll() {
    const scrollY = window.scrollY;
    sections.forEach(sec => {
      const rect   = sec.getBoundingClientRect();
      const center = rect.top + rect.height / 2 - window.innerHeight / 2;
      const bg     = sec.querySelector('.quote-bg-img');
      if (bg) bg.style.transform = `scale(1.06) translateY(${center * 0.12}px)`;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ══════════════════════════════════════
   PRODUCTS RENDER
══════════════════════════════════════ */
(function initProducts() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  grid.innerHTML = PRODUCTS.map((p, i) => `
    <div class="pcard reveal-up delay-${i + 1}" data-id="${p.id}">
      <div class="pcard-img-wrap">
        <img
          class="pcard-img"
          src="${p.image}"
          alt="${p.name}"
          loading="lazy"
          onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
        />
        <div class="pcard-gradient" style="background:${p.gradient};display:none">
          ${p.emoji}
        </div>
        <div class="pcard-img-overlay"></div>
        <div class="pcard-overlay">
          <button class="ov-btn add-to-cart" data-id="${p.id}">Add to Cart 🛒</button>
          <button class="ov-btn outline quick-view" data-id="${p.id}">Quick View 👁️</button>
        </div>
      </div>
      ${p.badge ? `<span class="pbadge b-${p.badge}">${p.badge.toUpperCase()}</span>` : ''}
      <button class="pwish" data-id="${p.id}" aria-label="Wishlist">
        <span class="icon-anim">♡</span>
      </button>
      <div class="pcard-info">
        <div class="pcard-team">${p.team}</div>
        <div class="pcard-name">${p.name}</div>
        <div class="pcard-foot">
          <div class="pcard-price">₹${p.price.toLocaleString('en-IN')}</div>
          <div class="pcard-rating">${'★'.repeat(p.rating)}${'☆'.repeat(5 - p.rating)}</div>
        </div>
      </div>
    </div>
  `).join('');

  /* Trigger reveal observer for newly injected cards */
  initRevealObserver(grid.querySelectorAll('.reveal-up'));

  /* Add to cart */
  grid.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id, 10);
      addToCart(id);
    });
  });

  /* Quick view */
  grid.querySelectorAll('.quick-view').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id, 10);
      openModal(id);
    });
  });

  /* Wishlist */
  grid.querySelectorAll('.pwish').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      btn.classList.toggle('on');
      const icon = btn.querySelector('.icon-anim');
      if (icon) icon.textContent = btn.classList.contains('on') ? '♥' : '♡';
      showToast(btn.classList.contains('on') ? '♥ Added to wishlist' : 'Removed from wishlist');
    });
  });

  /* Card click → modal */
  grid.querySelectorAll('.pcard').forEach(card => {
    card.addEventListener('click', () => {
      const id = parseInt(card.dataset.id, 10);
      openModal(id);
    });
  });
})();

/* shared reveal observer helper */
function initRevealObserver(elements) {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  elements.forEach(el => obs.observe(el));
}

/* ══════════════════════════════════════
   CART STATE
══════════════════════════════════════ */
let cart = JSON.parse(sessionStorage.getItem('paddox_cart') || '[]');

function saveCart() {
  sessionStorage.setItem('paddox_cart', JSON.stringify(cart));
  updateCartBadge();
}

function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;
  const total = cart.reduce((s, x) => s + x.qty, 0);
  badge.textContent = total;
  badge.style.transform = 'scale(1.4)';
  setTimeout(() => badge.style.transform = '', 300);
}

function addToCart(id) {
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return;
  const existing = cart.find(x => x.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id, name: product.name, price: product.price, qty: 1, emoji: product.emoji });
  }
  saveCart();
  showToast(`✓ ${product.name} added to cart!`);
}

updateCartBadge();

/* ══════════════════════════════════════
   PRODUCT MODAL
══════════════════════════════════════ */
const modalOverlay = document.getElementById('modal-overlay');
const modalClose   = document.getElementById('modal-close');

function openModal(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p || !modalOverlay) return;

  /* Populate */
  document.getElementById('modal-team').textContent  = p.team;
  document.getElementById('modal-name').textContent  = p.name;
  document.getElementById('modal-rating').textContent= '★'.repeat(p.rating) + '☆'.repeat(5 - p.rating) + `  (${p.rating}.0)`;
  document.getElementById('modal-price').textContent = `₹${p.price.toLocaleString('en-IN')}`;
  document.getElementById('modal-desc').textContent  = p.desc;

  /* Image */
  const wrap = document.getElementById('modal-img-wrap');
  wrap.style.background = p.gradient;
  wrap.innerHTML = `
    <img src="${p.image}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;filter:brightness(.85)"
      onerror="this.outerHTML='<span style=font-size:6rem>${p.emoji}</span>'"/>
  `;

  /* Size buttons */
  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  /* Add btn */
  const addBtn = document.getElementById('modal-add-btn');
  addBtn.onclick = () => {
    addToCart(p.id);
    closeModal();
  };

  /* Wish btn */
  const wishBtn = document.getElementById('modal-wish-btn');
  wishBtn.onclick = () => {
    showToast('♥ Added to wishlist!');
    wishBtn.style.borderColor = '#e8002d';
    wishBtn.style.color = '#fff';
  };

  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  if (modalOverlay) modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

if (modalClose) modalClose.addEventListener('click', closeModal);
if (modalOverlay) {
  modalOverlay.addEventListener('click', e => {
    if (e.target === modalOverlay) closeModal();
  });
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

/* ══════════════════════════════════════
   DRIVER QUOTES
══════════════════════════════════════ */
(function initQuotes() {
  let current = 0;
  const textEl = document.getElementById('quote-text');
  const avEl   = document.getElementById('quote-avatar');
  const nameEl = document.getElementById('quote-name');
  const teamEl = document.getElementById('quote-team');
  const dotsEl = document.getElementById('quote-dots');
  if (!textEl) return;

  function renderDots() {
    if (!dotsEl) return;
    dotsEl.innerHTML = QUOTES.map((_, i) =>
      `<div class="q-dot ${i === current ? 'on' : ''}" data-i="${i}"></div>`
    ).join('');
    dotsEl.querySelectorAll('.q-dot').forEach(dot => {
      dot.addEventListener('click', () => setQuote(parseInt(dot.dataset.i, 10)));
    });
  }

  function setQuote(i, animate = true) {
    current = i;
    const q = QUOTES[i];

    if (animate && textEl) {
      textEl.style.opacity = '0';
      textEl.style.transform = 'translateY(10px)';
      setTimeout(() => {
        textEl.textContent        = q.text;
        if (avEl)   avEl.textContent   = q.av;
        if (nameEl) nameEl.textContent = q.driver;
        if (teamEl) teamEl.textContent = q.team;
        textEl.style.opacity   = '1';
        textEl.style.transform = 'translateY(0)';
        textEl.style.transition = 'opacity .4s, transform .4s';
        renderDots();
      }, 250);
    } else {
      if (textEl) textEl.textContent  = q.text;
      if (avEl)   avEl.textContent    = q.av;
      if (nameEl) nameEl.textContent  = q.driver;
      if (teamEl) teamEl.textContent  = q.team;
      renderDots();
    }
  }

  setQuote(0, false);
  const autoplay = setInterval(() => setQuote((current + 1) % QUOTES.length), 6500);

  /* Pause autoplay on hover */
  const section = document.getElementById('quote-section');
  if (section) {
    section.addEventListener('mouseenter', () => clearInterval(autoplay));
  }
})();

/* ══════════════════════════════════════
   NEWSLETTER
══════════════════════════════════════ */
(function initNewsletter() {
  const btn   = document.getElementById('nl-btn');
  const input = document.getElementById('nl-email');
  const form  = document.getElementById('nl-form');
  if (!btn || !input) return;

  btn.addEventListener('click', () => {
    const val = input.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) {
      showToast('⚠️ Please enter a valid email address');
      input.focus();
      input.style.borderColor = 'var(--red)';
      setTimeout(() => input.style.borderColor = '', 2000);
      return;
    }
    /* Success */
    if (form) {
      form.innerHTML = `
        <div style="
          color:#e8002d;
          font-family:'Barlow Condensed',sans-serif;
          font-size:1.2rem;
          letter-spacing:2px;
          padding:16px;
          border:1px solid rgba(232,0,45,.3);
          background:rgba(232,0,45,.06);
          width:100%;
          text-align:center;
        ">
          ✓ YOU'RE IN THE PADDOCK! 🏁
        </div>
      `;
    }
    showToast('🏁 Welcome to the Paddox Paddock!');
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') btn.click();
  });
})();

/* ══════════════════════════════════════
   ICON ANIMATIONS (bounce on load)
══════════════════════════════════════ */
(function initIconAnimations() {
  /* Stagger bounce-in for all animate-icon elements */
  const icons = document.querySelectorAll('.animate-icon, .exp-icon');
  icons.forEach((icon, i) => {
    icon.style.animationDelay = `${i * 0.15}s`;

    /* Wiggle on hover */
    icon.addEventListener('mouseenter', () => {
      icon.style.animation = 'none';
      icon.style.transform = 'scale(1.3) rotate(-10deg)';
    });
    icon.addEventListener('mouseleave', () => {
      icon.style.transform = '';
      /* Resume float animation */
      setTimeout(() => {
        icon.style.animation = `iconFloat 3s ${i * 0.15}s ease-in-out infinite`;
      }, 300);
    });
  });

  /* Nav icon wiggle */
  document.querySelectorAll('.nl-icon').forEach(icon => {
    const link = icon.closest('.nav-link');
    if (!link) return;
    link.addEventListener('mouseenter', () => {
      icon.style.transform = 'scale(1.3) rotate(-8deg)';
    });
    link.addEventListener('mouseleave', () => {
      icon.style.transform = '';
    });
  });

  /* Cart bounce on add */
  const cartIcon = document.querySelector('.cart-icon-anim');
  if (cartIcon) {
    document.addEventListener('cartUpdated', () => {
      cartIcon.style.transform = 'scale(1.4) rotate(-12deg)';
      setTimeout(() => cartIcon.style.transform = '', 400);
    });
  }
})();

/* ══════════════════════════════════════
   TOAST
══════════════════════════════════════ */
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 3000);
}

/* ══════════════════════════════════════
   TICKER ROTATION
══════════════════════════════════════ */
(function initTicker() {
  const tickerEl = document.getElementById('ticker-text');
  if (!tickerEl) return;
  const tickers = [
  '🏁 Live F1 data connected',
  '🏎️ Next race loading from API',
  '📅 2026 race calendar active',
  '🔥 Paddox live deployment working'
];
  let ti = 0;
  setInterval(() => {
    ti = (ti + 1) % tickers.length;
    tickerEl.style.opacity = '0';
    tickerEl.style.transform = 'translateY(6px)';
    setTimeout(() => {
      tickerEl.textContent = tickers[ti];
      tickerEl.style.opacity = '1';
      tickerEl.style.transform = 'translateY(0)';
      tickerEl.style.transition = 'opacity .4s, transform .4s';
    }, 300);
  }, 4000);
})();

/* ══════════════════════════════════════
   SIZE BUTTON INTERACTION
══════════════════════════════════════ */
document.querySelectorAll('.size-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

/* ══════════════════════════════════════
   GLOBAL INIT LOG
══════════════════════════════════════ */
console.log('%c🏎️ PADDOX — Home Page Loaded', 'color:#e8002d;font-size:14px;font-weight:bold;');