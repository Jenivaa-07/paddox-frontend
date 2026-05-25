/* ============================================================
   PADDOX — shop.js
   Shop Page Logic — Filters · Cart · Modal · Animations
   ============================================================ */

'use strict';

/* ══════════════════════════════════════
   PRODUCTS DATA
══════════════════════════════════════ */
let PRODUCTS = [];

const PRODUCT_API_BASE =
  'https://paddox-backend.onrender.com/api/products';

const WISHLIST_API_BASE =
  'https://paddox-backend.onrender.com/api/wishlist';

let USER_WISHLIST_IDS = new Set();

function shopToken() {
  return (
    localStorage.getItem('token') ||
    localStorage.getItem('paddox_access_token') ||
    localStorage.getItem('accessToken') ||
    ''
  );
}

/* ══════════════════════════════════════
   STATE
══════════════════════════════════════ */
let state = {
  category  : 'all',
  teams     : [],
  maxPrice  : 20000,
  minRating : 0,
  badges    : [],
  sort      : 'featured',
  view      : 'grid',
  page      : 1,
  perPage   : 8,
  search    : '',
  modalQty  : 1,
  modalProduct : null,
};

let cart = JSON.parse(sessionStorage.getItem('paddox_cart') || '[]');
async function loadShopProducts() {
  try {
    const res = await fetch(PRODUCT_API_BASE);
    const data = await res.json();

    PRODUCTS = data.data || data.products || [];

    PRODUCTS = PRODUCTS.map(p => ({
      id: p._id,
      name: p.name,
      team: p.team,
      teamKey: p.team,
      cat: p.category,
      price: p.effectivePrice || p.price,
      rating: Number(p.ratings?.average || p.rating || 5),
      badge: p.badge,
      emoji: p.emoji || '🏎️',
      limited: !!p.isLimited,
      sale: !!p.onSale,
      isNew: p.badge === 'new',
      images: Array.isArray(p.images)
        ? p.images.map(img => img.url || img).filter(Boolean)
        : [],
      image: (Array.isArray(p.images)
        ? (p.images[0]?.url || p.images[0] || '')
        : ''),
      desc: p.description || p.shortDesc || '',
      stock: p.stock,
      sizes: Array.isArray(p.sizes) ? p.sizes : [],
      isSizedProduct:
        ['apparel', 'clothing', 'shirts', 'tshirts', 't-shirts', 'hoodies', 'pants', 'jackets']
          .includes(String(p.category || '').toLowerCase())
    }));

    renderProducts();
    syncWishlistButtons();
  } catch (err) {
    console.error(err);
    showToast('❌ Failed to load products');
  }
}

async function loadShopWishlist() {
  try {
    const token = shopToken();

    if (!token) {
      USER_WISHLIST_IDS = new Set();
      return;
    }

    const res = await fetch(WISHLIST_API_BASE, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.success) {
      USER_WISHLIST_IDS = new Set();
      return;
    }

    const products =
      data.data?.products ||
      data.products ||
      [];

    USER_WISHLIST_IDS =
      new Set(products.map(product => String(product._id || product.id)));

  } catch (err) {
    console.error(err);
    USER_WISHLIST_IDS = new Set();
  }
}

async function toggleWishlist(productId) {
  try {
    const token = shopToken();

    if (!token) {
      showToast('🔐 Please login to use wishlist');
      setTimeout(() => {
        window.location.href = 'account.html';
      }, 700);
      return;
    }

    const isInWishlist = USER_WISHLIST_IDS.has(String(productId));

    const res = await fetch(
      isInWishlist
        ? `${WISHLIST_API_BASE}/remove/${productId}`
        : `${WISHLIST_API_BASE}/add/${productId}`,
      {
        method: isInWishlist ? 'DELETE' : 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok || data.success === false) {
      throw new Error(data.message || 'Wishlist update failed');
    }

    if (isInWishlist) {
      USER_WISHLIST_IDS.delete(String(productId));
      showToast('♡ Removed from wishlist');
    } else {
      USER_WISHLIST_IDS.add(String(productId));
      showToast('♥ Added to wishlist');
    }

    syncWishlistButtons(productId);

  } catch (err) {
    console.error(err);
    showToast(`❌ ${err.message}`);
  }
}

function syncWishlistButtons(productId = null) {
  const buttons =
    productId
      ? document.querySelectorAll(`[data-id="${productId}"].pwish, #modal-wish-btn`)
      : document.querySelectorAll('.pwish, #modal-wish-btn');

  buttons.forEach(btn => {
    const id =
      btn.dataset?.id ||
      state.modalProduct?.id;

    if (!id) return;

    const active =
      USER_WISHLIST_IDS.has(String(id));

    btn.classList.toggle('on', active);

    const icon =
      btn.querySelector('.wish-icon-wrap') ||
      btn.querySelector('#wish-icon') ||
      document.getElementById('wish-icon');

    if (icon) {
      icon.textContent = active ? '♥' : '♡';
    }
  });
}

/* ══════════════════════════════════════
   PARTICLES
══════════════════════════════════════ */
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor(burst = false) { this.reset(burst); }
    reset(burst = false) {
      this.burst = burst;
      this.type  = Math.random() < 0.55 ? 'spark' : 'dot';
      this.x     = burst ? W * 0.5 + (Math.random() - 0.5) * 400 : Math.random() * W;
      this.y     = burst ? H * 0.4 + (Math.random() - 0.5) * 200 : Math.random() * H;
      const spd  = burst ? 4 + Math.random() * 7 : 1.5 + Math.random() * 2.5;
      const ang  = burst ? Math.random() * Math.PI * 2 : -0.05 + (Math.random() - 0.5) * 0.4;
      this.vx    = Math.cos(ang) * spd;
      this.vy    = Math.sin(ang) * spd - (burst ? 0 : 0.2);
      this.life  = 1;
      this.decay = burst ? 0.018 + Math.random() * 0.022 : 0.003 + Math.random() * 0.004;
      this.size  = this.type === 'spark' ? 0.6 + Math.random() * 1.6 : 0.5 + Math.random() * 1.2;
      const r    = Math.random();
      this.color = r < 0.65 ? 'rgba(232,0,45,' : r < 0.82 ? 'rgba(200,200,200,' : 'rgba(201,168,76,';
    }
    update() {
      this.x += this.vx; this.y += this.vy; this.vy += 0.012; this.life -= this.decay;
      if (this.life <= 0 || this.x > W + 30 || this.x < -30 || this.y > H + 30) this.reset(false);
    }
    draw() {
      ctx.save(); ctx.globalAlpha = Math.max(0, this.life * 0.72);
      if (this.type === 'spark') {
        ctx.strokeStyle = `${this.color}1)`; ctx.lineWidth = this.size; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(this.x, this.y); ctx.lineTo(this.x - this.vx * 7, this.y - this.vy * 7); ctx.stroke();
      } else {
        ctx.fillStyle = `${this.color}0.9)`; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }
  }

  for (let i = 0; i < 80; i++) particles.push(new Particle());

  let burstTimer = setTimeout(function burst() {
    for (let i = 0; i < 35; i++) particles.push(new Particle(true));
    burstTimer = setTimeout(burst, 7000 + Math.random() * 8000);
  }, 4000);

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    particles = particles.filter(p => p.life > 0 || !p.burst);
    while (particles.filter(p => !p.burst).length < 80) particles.push(new Particle(false));
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
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) return;
    link.addEventListener('click', e => {
      e.preventDefault();
      overlay.classList.add('slide-in');
      setTimeout(() => { window.location.href = href; }, 480);
    });
  });
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
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu= document.getElementById('mobile-menu');
  const searchBtn = document.getElementById('nav-search-btn');
  const drawer    = document.getElementById('search-drawer');
  const searchClose = document.getElementById('search-close');
  const searchInput = document.getElementById('search-input');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  if (hamburger) hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  });

  if (searchBtn) searchBtn.addEventListener('click', () => { drawer.classList.add('open'); searchInput.focus(); });
  if (searchClose) searchClose.addEventListener('click', () => drawer.classList.remove('open'));
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      state.search = searchInput.value.trim().toLowerCase();
      state.page = 1;
      renderProducts();
    });
  }

  document.addEventListener('keydown', e => { if (e.key === 'Escape') drawer.classList.remove('open'); });

  /* Helmet hover */
  const helmet = document.getElementById('helmet-wrap');
  if (helmet) {
    helmet.addEventListener('mouseenter', () => { helmet.style.transform = 'rotate(-10deg) scale(1.18)'; helmet.style.boxShadow = '0 0 22px rgba(232,0,45,.5)'; });
    helmet.addEventListener('mouseleave', () => { helmet.style.transform = ''; helmet.style.boxShadow = ''; });
  }

  /* Cart btn */
  const cartBtn = document.getElementById('nav-cart-btn');
  if (cartBtn) cartBtn.addEventListener('click', () => toggleCart(true));
})();

/* ══════════════════════════════════════
   SPEED LINES
══════════════════════════════════════ */
(function initSpeedLines() {
  const container = document.getElementById('speed-lines');
  if (!container) return;
  [
    { top:'15%', width:'40%', delay:'0s',   dur:'2.8s', opacity:.5 },
    { top:'32%', width:'25%', delay:'.7s',  dur:'2.2s', opacity:.4 },
    { top:'55%', width:'55%', delay:'1.3s', dur:'3.2s', opacity:.35 },
    { top:'70%', width:'32%', delay:'.4s',  dur:'2.6s', opacity:.4 },
    { top:'82%', width:'48%', delay:'1.1s', dur:'3s',   opacity:.3 },
  ].forEach(c => {
    const l = document.createElement('div');
    l.className = 'speed-line';
    l.style.cssText = `top:${c.top};width:${c.width};animation-delay:${c.delay};animation-duration:${c.dur};opacity:${c.opacity}`;
    container.appendChild(l);
  });
})();

/* ══════════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════════ */
function initReveal(root = document) {
  const items = root.querySelectorAll('.reveal-up,.reveal-left,.reveal-right');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in-view'); obs.unobserve(e.target); } });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
  items.forEach(el => obs.observe(el));
}
initReveal();

/* ══════════════════════════════════════
   CATEGORY TABS
══════════════════════════════════════ */
document.querySelectorAll('.cat-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('on'));
    tab.classList.add('on');
    state.category = tab.dataset.cat;
    state.page = 1;
    renderProducts();
    updateActiveFilters();
    /* Animate icon */
    const icon = tab.querySelector('.ct-icon');
    if (icon) { icon.style.transform = 'scale(1.4)'; setTimeout(() => icon.style.transform = '', 300); }
  });
});

/* ══════════════════════════════════════
   SIDEBAR FILTERS
══════════════════════════════════════ */
/* Team checkboxes */
document.querySelectorAll('.team-filter').forEach(cb => {
  cb.addEventListener('change', () => {
    state.teams = [...document.querySelectorAll('.team-filter:checked')].map(c => c.value);
    state.page = 1;
    renderProducts();
    updateActiveFilters();
  });
});

/* Price slider */
const priceSlider = document.getElementById('price-slider');
const priceLbl    = document.getElementById('price-max-lbl');
if (priceSlider) {
  priceSlider.addEventListener('input', () => {
    state.maxPrice = parseInt(priceSlider.value, 10);
    priceLbl.textContent = `₹${state.maxPrice.toLocaleString('en-IN')}`;
    state.page = 1;
    renderProducts();
    updateActiveFilters();
  });
}

/* Rating radio */
document.querySelectorAll('.rating-filter').forEach(r => {
  r.addEventListener('change', () => {
    state.minRating = parseInt(r.value, 10);
    state.page = 1;
    renderProducts();
    updateActiveFilters();
  });
});

/* Availability checkboxes */
document.querySelectorAll('.avail-filter').forEach(cb => {
  cb.addEventListener('change', () => {
    state.badges = [...document.querySelectorAll('.avail-filter:checked')].map(c => c.value);
    state.page = 1;
    renderProducts();
    updateActiveFilters();
  });
});

/* Clear filters */
document.getElementById('clear-filters')?.addEventListener('click', clearAllFilters);
document.getElementById('empty-reset')?.addEventListener('click', clearAllFilters);

function clearAllFilters() {
  state.teams = []; state.maxPrice = 20000; state.minRating = 0;
  state.badges = []; state.category = 'all'; state.page = 1; state.search = '';
  document.querySelectorAll('.team-filter, .avail-filter').forEach(cb => cb.checked = false);
  document.querySelectorAll('.rating-filter').forEach(r => r.value === '0' ? r.checked = true : r.checked = false);
  if (priceSlider) { priceSlider.value = 20000; priceLbl.textContent = '₹20,000'; }
  document.querySelectorAll('.cat-tab').forEach(t => { t.classList.remove('on'); if (t.dataset.cat === 'all') t.classList.add('on'); });
  const si = document.getElementById('search-input'); if (si) si.value = '';
  renderProducts();
  updateActiveFilters();
  showToast('✓ All filters cleared');
}

/* ══════════════════════════════════════
   SORT & VIEW
══════════════════════════════════════ */
const sortSel = document.getElementById('sort-select');
if (sortSel) sortSel.addEventListener('change', () => { state.sort = sortSel.value; state.page = 1; renderProducts(); });

document.querySelectorAll('.view-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('on'));
    btn.classList.add('on');
    state.view = btn.dataset.view;
    const grid = document.getElementById('products-grid');
    if (grid) grid.classList.toggle('list-view', state.view === 'list');
  });
});

/* ══════════════════════════════════════
   FILTER SIDEBAR TOGGLE (mobile)
══════════════════════════════════════ */
const filterToggle = document.getElementById('filter-toggle');
const sidebar      = document.getElementById('shop-sidebar');
if (filterToggle && sidebar) {
  filterToggle.addEventListener('click', () => {
    sidebar.classList.toggle('mobile-open');
  });
  /* Close on outside click */
  document.addEventListener('click', e => {
    if (window.innerWidth <= 900 && !sidebar.contains(e.target) && !filterToggle.contains(e.target)) {
      sidebar.classList.remove('mobile-open');
    }
  });
}

/* ══════════════════════════════════════
   COLLAPSE FILTER GROUPS
══════════════════════════════════════ */
document.querySelectorAll('.filter-collapse-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = document.getElementById(btn.dataset.target);
    if (!target) return;
    const collapsed = target.classList.toggle('collapsed');
    btn.textContent = collapsed ? '+' : '−';
  });
});

/* ══════════════════════════════════════
   FILTER PRODUCTS
══════════════════════════════════════ */
function getFiltered() {
  let list = [...PRODUCTS];

  /* Category */
  if (state.category !== 'all') list = list.filter(p => p.cat === state.category);

  /* Teams */
  if (state.teams.length) list = list.filter(p => state.teams.includes(p.teamKey));

  /* Price */
  list = list.filter(p => p.price <= state.maxPrice);

  /* Rating */
  if (state.minRating > 0) list = list.filter(p => p.rating >= state.minRating);

  /* Availability badges */
  if (state.badges.length) {
    list = list.filter(p =>
      (state.badges.includes('ltd')  && p.limited) ||
      (state.badges.includes('sale') && p.sale)    ||
      (state.badges.includes('new')  && p.isNew)
    );
  }

  /* Search */
  if (state.search) {
    list = list.filter(p =>
      p.name.toLowerCase().includes(state.search) ||
      p.team.toLowerCase().includes(state.search) ||
      p.cat.toLowerCase().includes(state.search)
    );
  }

  /* Sort */
  switch (state.sort) {
    case 'pl'     : list.sort((a, b) => a.price - b.price);   break;
    case 'ph'     : list.sort((a, b) => b.price - a.price);   break;
    case 'rating' : list.sort((a, b) => b.rating - a.rating); break;
    case 'newest' : list.sort((a, b) => b.id - a.id);         break;
  }

  return list;
}

/* ══════════════════════════════════════
   RENDER PRODUCTS
══════════════════════════════════════ */
function renderProducts() {
  const grid      = document.getElementById('products-grid');
  const empty     = document.getElementById('empty-state');
  const countEl   = document.getElementById('results-num');
  if (!grid) return;

  const filtered  = getFiltered();
  const total     = filtered.length;
  const start     = (state.page - 1) * state.perPage;
  const paged     = filtered.slice(start, start + state.perPage);

  if (countEl) countEl.textContent = total;

  /* Empty state */
  if (!total) {
    grid.innerHTML = '';
    if (empty) empty.style.display = 'block';
    renderPagination(0);
    return;
  }
  if (empty) empty.style.display = 'none';

  /* Render cards */
  grid.innerHTML = paged.map((p, i) => cardHTML(p, i)).join('');
  if (state.view === 'list') grid.classList.add('list-view');
  else grid.classList.remove('list-view');

  /* Bind card events */
  bindCardEvents(grid);

  /* Pagination */
  renderPagination(total);

  /* Reveal animation trigger */
  grid.querySelectorAll('.pcard').forEach((card, i) => {
    card.style.animationDelay = `${i * 0.05}s`;
  });
}

/* ── Card HTML ── */
function cardHTML(p, i) {
  const roundedRating = Math.round(Number(p.rating || 0));
  const stars = '★'.repeat(roundedRating) + '☆'.repeat(5 - roundedRating);
  const origPrice = p.sale ? `<span class="pcard-orig">₹${Math.round(p.price * 1.2).toLocaleString('en-IN')}</span>` : '';

  return `
    <div class="pcard" data-id="${p.id}" role="button" tabindex="0" aria-label="View ${p.name}">
      <div class="pcard-img-wrap">
        <img
          class="pcard-img"
          src="${p.image}"
          alt="${p.name}"
          loading="lazy"
          onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
        />
        <div class="pcard-img-gradient" style="background:${p.gradient};display:none">${p.emoji}</div>
        <div class="pcard-img-overlay"></div>
        <div class="pcard-overlay">
          <button class="ov-btn add-to-cart-btn" data-id="${p.id}">Add to Cart 🛒</button>
          <button class="ov-btn outline quick-view-btn" data-id="${p.id}">Quick View 👁️</button>
        </div>
      </div>
      ${p.badge ? `<span class="pbadge b-${p.badge}">${p.badge.toUpperCase()}</span>` : ''}
      <button class="pwish ${USER_WISHLIST_IDS.has(String(p.id)) ? 'on' : ''}" data-id="${p.id}" aria-label="Add to wishlist">
        <span class="wish-icon-wrap">${USER_WISHLIST_IDS.has(String(p.id)) ? '♥' : '♡'}</span>
      </button>
      <div class="pcard-info">
        <div class="pcard-team">${p.team}</div>
        <div class="pcard-name">${p.name}</div>
        <div class="pcard-foot">
          <div>
            <span class="pcard-price">₹${p.price.toLocaleString('en-IN')}</span>
            ${origPrice}
          </div>
          <div class="pcard-rating">${stars}</div>
        </div>
      </div>
    </div>
  `;
}

/* ── Bind card events ── */
function bindCardEvents(root) {
  root.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); addToCart(btn.dataset.id); });
  });
  root.querySelectorAll('.quick-view-btn').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); openModal(btn.dataset.id); });
  });
  root.querySelectorAll('.pwish').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation();
      await toggleWishlist(btn.dataset.id);
    });
  });
  root.querySelectorAll('.pcard').forEach(card => {
    card.addEventListener('click', () => openModal(card.dataset.id));
    card.addEventListener('keydown', e => { if (e.key === 'Enter') openModal(card.dataset.id); });
  });
}

/* ══════════════════════════════════════
   ACTIVE FILTER CHIPS
══════════════════════════════════════ */
function updateActiveFilters() {
  const container = document.getElementById('active-filters');
  if (!container) return;
  const chips = [];

  if (state.category !== 'all') chips.push({ label: `Category: ${state.category}`, remove: () => { state.category = 'all'; document.querySelectorAll('.cat-tab').forEach(t => { t.classList.remove('on'); if (t.dataset.cat === 'all') t.classList.add('on'); }); } });
  state.teams.forEach(t => chips.push({ label: `Team: ${t}`, remove: () => { state.teams = state.teams.filter(x => x !== t); document.querySelectorAll('.team-filter').forEach(cb => { if (cb.value === t) cb.checked = false; }); } }));
  if (state.maxPrice < 20000) chips.push({ label: `Max: ₹${state.maxPrice.toLocaleString('en-IN')}`, remove: () => { state.maxPrice = 20000; if (priceSlider) { priceSlider.value = 20000; priceLbl.textContent = '₹20,000'; } } });
  if (state.minRating > 0) chips.push({ label: `${state.minRating}★ & up`, remove: () => { state.minRating = 0; document.querySelectorAll('.rating-filter').forEach(r => r.value === '0' ? r.checked = true : r.checked = false); } });
  state.badges.forEach(b => chips.push({ label: b === 'ltd' ? 'Limited Edition' : b === 'sale' ? 'On Sale' : 'New Arrivals', remove: () => { state.badges = state.badges.filter(x => x !== b); document.querySelectorAll('.avail-filter').forEach(cb => { if (cb.value === b) cb.checked = false; }); } }));

  container.innerHTML = chips.map((chip, i) => `
    <div class="filter-chip" data-chip="${i}">
      ${chip.label}
      <span class="chip-remove" data-chip="${i}">✕</span>
    </div>
  `).join('');

  container.querySelectorAll('.chip-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      chips[parseInt(btn.dataset.chip, 10)].remove();
      state.page = 1;
      renderProducts();
      updateActiveFilters();
    });
  });
}

/* ══════════════════════════════════════
   PAGINATION
══════════════════════════════════════ */
function renderPagination(total) {
  const container = document.getElementById('pagination');
  if (!container) return;
  const pages = Math.ceil(total / state.perPage);
  if (pages <= 1) { container.innerHTML = ''; return; }

  let html = '';
  if (state.page > 1) html += `<button class="page-btn" data-page="${state.page - 1}">←</button>`;
  for (let i = 1; i <= pages; i++) {
    html += `<button class="page-btn ${i === state.page ? 'on' : ''}" data-page="${i}">${i}</button>`;
  }
  if (state.page < pages) html += `<button class="page-btn" data-page="${state.page + 1}">→</button>`;
  container.innerHTML = html;

  container.querySelectorAll('.page-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.page = parseInt(btn.dataset.page, 10);
      renderProducts();
      window.scrollTo({ top: document.getElementById('shop-sidebar')?.offsetTop || 400, behavior: 'smooth' });
    });
  });
}

/* ══════════════════════════════════════
   CART
══════════════════════════════════════ */
function saveCart() { sessionStorage.setItem('paddox_cart', JSON.stringify(cart)); updateCartUI(); }

function addToCart(id, selectedSize = null) {
  const p = PRODUCTS.find(x => x.id === id);

  if (!p) return;

  const size = needsSize(p)
    ? (selectedSize || 'M')
    : '';

  const cartKey = size
    ? `${id}-${size}`
    : id;

  const ex = cart.find(x => x.cartKey === cartKey || (!x.cartKey && x.id === id && !size));

  if (ex) {
    ex.qty++;
  } else {
    cart.push({
      cartKey,
      id,
      name: p.name,
      team: p.team,
      price: p.price,
      emoji: p.emoji,
      gradient: p.gradient,
      image: p.image,
      size,
      qty: 1
    });
  }

  saveCart();

  showToast(`✓ ${p.name}${size ? ' · ' + size : ''} added to cart!`);

  /* Badge pulse */
  const badge = document.getElementById('cart-badge');
  if (badge) {
    badge.style.transform = 'scale(1.5)';
    setTimeout(() => badge.style.transform = '', 350);
  }

  /* Cart icon wiggle */
  const icon = document.querySelector('.cart-icon-anim');
  if (icon) {
    icon.style.transform = 'scale(1.4) rotate(-12deg)';
    setTimeout(() => icon.style.transform = '', 400);
  }
}

function removeFromCart(id) {
  cart = cart.filter(x => x.id !== id);
  saveCart();
}

function changeQty(id, delta) {
  const item = cart.find(x => x.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id);
  else saveCart();
}

function updateCartUI() {
  const badge     = document.getElementById('cart-badge');
  const countLbl  = document.getElementById('cart-count-label');
  const itemsEl   = document.getElementById('cart-items');
  const footer    = document.getElementById('cart-footer');
  const subtotal  = document.getElementById('cart-subtotal');
  const totalEl   = document.getElementById('cart-total');

  const totalQty  = cart.reduce((s, x) => s + x.qty, 0);
  if (badge)    badge.textContent    = totalQty;
  if (countLbl) countLbl.textContent = `${totalQty} item${totalQty !== 1 ? 's' : ''}`;

  if (!cart.length) {
    if (itemsEl) itemsEl.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🏎️</div>
        <p>Your cart is empty.<br/>Find your favourite F1 gear!</p>
        <button class="cart-empty-btn" id="cart-empty-btn">Browse Shop</button>
      </div>`;
    document.getElementById('cart-empty-btn')?.addEventListener('click', () => toggleCart(false));
    if (footer) footer.style.display = 'none';
    return;
  }

  if (footer) footer.style.display = 'block';
  const total = cart.reduce((s, x) => s + x.price * x.qty, 0);
  if (subtotal) subtotal.textContent = `₹${total.toLocaleString('en-IN')}`;
  if (totalEl)  totalEl.textContent  = `₹${total.toLocaleString('en-IN')}`;

  if (itemsEl) {
    itemsEl.innerHTML = cart.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <div class="ci-img" style="background:${item.gradient}">
          <img src="${item.image}" alt="${item.name}"
            onerror="this.outerHTML='<span style=font-size:1.8rem>${item.emoji}</span>'"
            style="width:100%;height:100%;object-fit:cover"/>
        </div>
        <div class="ci-info">
          <div class="ci-team">${item.team}${item.size ? ' · Size ' + item.size : ''}</div>
          <div class="ci-name">${item.name}</div>
          <div class="ci-price">₹${(item.price * item.qty).toLocaleString('en-IN')}</div>
          <div class="ci-qty">
            <button class="qty-b" data-id="${item.id}" data-delta="-1">−</button>
            <span class="qty-n">${item.qty}</span>
            <button class="qty-b" data-id="${item.id}" data-delta="1">+</button>
          </div>
        </div>
        <button class="ci-rm" data-id="${item.id}">✕</button>
      </div>
    `).join('');

    itemsEl.querySelectorAll('.qty-b').forEach(btn => {
      btn.addEventListener('click', () => changeQty(btn.dataset.id, parseInt(btn.dataset.delta, 10)));
    });
    itemsEl.querySelectorAll('.ci-rm').forEach(btn => {
      btn.addEventListener('click', () => removeFromCart(btn.dataset.id));
    });
  }
}

function toggleCart(open) {
  const overlay = document.getElementById('cart-overlay');
  const drawer  = document.getElementById('cart-drawer');
  const isOpen  = drawer?.classList.contains('open');
  const show    = open !== undefined ? open : !isOpen;
  overlay?.classList.toggle('open', show);
  drawer?.classList.toggle('open', show);
  if (show) document.body.style.overflow = 'hidden';
  else document.body.style.overflow = '';
}

document.getElementById('cart-overlay')?.addEventListener('click', () => toggleCart(false));
document.getElementById('cart-close')?.addEventListener('click', () => toggleCart(false));
document.getElementById('continue-btn')?.addEventListener('click', () => toggleCart(false));


async function placeRealOrder() {
  if (!cart.length) {
    showToast('❌ Cart is empty');
    return;
  }

  const token =
    localStorage.getItem('paddox_access_token') ||
    localStorage.getItem('token');

  if (!token) {
    showToast('🔐 Please login first');
    setTimeout(() => {
      window.location.href = 'account.html';
    }, 900);
    return;
  }

  try {
    showToast('🏁 Placing order...');

    const res = await fetch('https://paddox-backend.onrender.com/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        items: cart.map(item => ({
          product: item.id,
          quantity: item.qty || 1,
          size: item.size || ''
        })),
        shippingAddress: {
          name: 'Paddox Fan',
          line1: 'Demo Address',
          city: 'Chennai',
          state: 'Tamil Nadu',
          pincode: '600001',
          phone: '9876543210',
          country: 'India'
        },
        paymentMethod: 'cod',
        notes: 'Demo checkout from shop page'
      })
    });

    const data = await res.json();

    if (!res.ok || data.success === false) {
      throw new Error(data.message || 'Order failed');
    }

    cart = [];
    saveCart();
    toggleCart(false);
    showToast('🔥 Order placed successfully');

    setTimeout(() => {
      window.location.href = 'account.html';
    }, 1200);

  } catch (err) {
    console.error(err);
    showToast(`❌ ${err.message}`);
  }
}

document.getElementById('checkout-btn')?.addEventListener('click', placeRealOrder);
updateCartUI();


/* ══════════════════════════════════════
   PRODUCT SIZE RULES
   Show size only for apparel/clothing
══════════════════════════════════════ */

function needsSize(product) {
  const cat = String(product?.cat || '').toLowerCase();

  return (
    product?.isSizedProduct ||
    ['apparel', 'clothing', 'shirts', 'tshirts', 't-shirts', 'hoodies', 'pants', 'jackets']
      .includes(cat)
  );
}

function getProductSizes(product) {
  if (!needsSize(product)) return [];

  if (Array.isArray(product?.sizes) && product.sizes.length) {
    return product.sizes;
  }

  return ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
}

function getSelectedModalSize() {
  const selected = document.querySelector('.sz.on');
  return selected?.dataset?.size || selected?.textContent?.trim() || 'M';
}

function findSizeSection() {
  const firstSizeButton = document.querySelector('.sz');
  if (!firstSizeButton) return null;

  let el = firstSizeButton.parentElement;

  while (el && el !== document.body) {
    const text = el.textContent || '';
    const sizeButtonCount = el.querySelectorAll('.sz').length;

    if (
      sizeButtonCount >= 2 &&
      text.toLowerCase().includes('size')
    ) {
      return el;
    }

    el = el.parentElement;
  }

  return firstSizeButton.parentElement;
}

function updateModalSizeUI(product) {
  const sizeSection = findSizeSection();

  if (!sizeSection) return;

  const sizes = getProductSizes(product);

  if (!sizes.length) {
    sizeSection.style.display = 'none';
    return;
  }

  sizeSection.style.display = '';

  const sizeButtonsWrap =
    sizeSection.querySelector('.size-options') ||
    sizeSection.querySelector('.sizes') ||
    sizeSection.querySelector('.modal-sizes') ||
    sizeSection.querySelector('.sz')?.parentElement ||
    sizeSection;

  const oldButtons = sizeButtonsWrap.querySelectorAll('.sz');

  if (oldButtons.length) {
    oldButtons.forEach(btn => btn.remove());
  }

  sizes.forEach((size, index) => {
    const btn = document.createElement('button');

    btn.className = `sz ${index === 2 || (sizes.length < 3 && index === 0) ? 'on' : ''}`;
    btn.type = 'button';
    btn.dataset.size = size;
    btn.textContent = size;

    btn.addEventListener('click', () => {
      document.querySelectorAll('.sz').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
    });

    sizeButtonsWrap.appendChild(btn);
  });
}

/* ══════════════════════════════════════
   QUICK VIEW MODAL
══════════════════════════════════════ */
const modalOverlay = document.getElementById('modal-overlay');
let modalQty = 1;

function openModal(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p || !modalOverlay) return;
  state.modalProduct = p;
  modalQty = 1;

  /* Populate */
  document.getElementById('modal-team').textContent   = p.team;
  document.getElementById('modal-name').textContent   = p.name;
  const modalRatingValue = Number(p.rating || 0);
  const modalRoundedRating = Math.round(modalRatingValue);
  document.getElementById('modal-rating').textContent =
    '★'.repeat(modalRoundedRating) +
    '☆'.repeat(5 - modalRoundedRating) +
    `  (${modalRatingValue.toFixed(1)})`;
  document.getElementById('modal-price').textContent  = `₹${p.price.toLocaleString('en-IN')}`;
  document.getElementById('modal-desc').textContent   = p.desc;
  document.getElementById('modal-qty').textContent    = modalQty;

  /* Original price */
  const origEl = document.getElementById('modal-original');
  if (origEl) origEl.textContent = p.sale ? `₹${Math.round(p.price * 1.2).toLocaleString('en-IN')}` : '';

  /* Main image */
  const imgMain = document.getElementById('modal-img-main');
  imgMain.style.background = p.gradient;
  const firstModalImage =
    (Array.isArray(p.images) && p.images.length)
      ? p.images[0]
      : p.image;

  imgMain.innerHTML = `
    <img src="${firstModalImage}" alt="${p.name}"
      style="width:100%;height:100%;object-fit:cover;filter:brightness(.88)"
      onerror="this.outerHTML='<span style=font-size:7rem>${p.emoji}</span>'"/>
  `;

  /* Thumbs — show exactly how many images were uploaded */
  const thumbsEl = document.getElementById('modal-img-thumbs');
  if (thumbsEl) {
    const modalImages =
      (Array.isArray(p.images) && p.images.length)
        ? p.images
        : [p.image];

    thumbsEl.innerHTML = modalImages.map((src, i) => `
      <div class="modal-thumb ${i === 0 ? 'on' : ''}" data-src="${src}">
        <img src="${src}" alt="View ${i + 1}"
          onerror="this.outerHTML='<span>${p.emoji}</span>'"
          style="width:100%;height:100%;object-fit:cover"/>
      </div>
    `).join('');

    thumbsEl.querySelectorAll('.modal-thumb').forEach(thumb => {
      thumb.addEventListener('click', () => {
        thumbsEl.querySelectorAll('.modal-thumb').forEach(t => t.classList.remove('on'));
        thumb.classList.add('on');

        const img = imgMain.querySelector('img');

        if (img) {
          img.src = thumb.dataset.src;
        }
      });
    });
  }

  /* Badges */
  const badgesEl = document.getElementById('modal-badges');
  if (badgesEl && p.badge) badgesEl.innerHTML = `<span class="pbadge b-${p.badge}">${p.badge.toUpperCase()}</span>`;

  /* Size buttons — only for apparel/clothing */
  updateModalSizeUI(p);

  /* Qty controls — use onclick so it does not duplicate every modal open */
  const modalQtyMinus = document.getElementById('modal-qty-minus');
  const modalQtyPlus = document.getElementById('modal-qty-plus');

  if (modalQtyMinus) {
    modalQtyMinus.onclick = () => {
      if (modalQty > 1) {
        modalQty--;
        document.getElementById('modal-qty').textContent = modalQty;
      }
    };
  }

  if (modalQtyPlus) {
    modalQtyPlus.onclick = () => {
      modalQty++;
      document.getElementById('modal-qty').textContent = modalQty;
    };
  }

  /* Add to cart */
  const addBtn = document.getElementById('modal-add-btn');
  if (addBtn) {
    addBtn.onclick = () => {
      const selectedSize = needsSize(p) ? getSelectedModalSize() : '';

      for (let i = 0; i < modalQty; i++) {
        addToCart(p.id, selectedSize);
      }

      closeModal();
    };
  }

  /* Wishlist */
  const wishBtn = document.getElementById('modal-wish-btn');
  if (wishBtn) {
    wishBtn.dataset.id = p.id;
    syncWishlistButtons(p.id);

    wishBtn.onclick = async () => {
      await toggleWishlist(p.id);
    };
  }

  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  if (modalOverlay) modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('modal-close')?.addEventListener('click', closeModal);
modalOverlay?.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ══════════════════════════════════════
   ICON ANIMATIONS
══════════════════════════════════════ */
(function initIconAnimations() {
  document.querySelectorAll('.animate-icon').forEach((icon, i) => {
    icon.style.animationDelay = `${i * 0.2}s`;
    icon.addEventListener('mouseenter', () => { icon.style.animation = 'none'; icon.style.transform = 'scale(1.35) rotate(-10deg)'; });
    icon.addEventListener('mouseleave', () => { icon.style.transform = ''; setTimeout(() => { icon.style.animation = `iconFloat 3s ${i * 0.2}s ease-in-out infinite`; }, 300); });
  });
  document.querySelectorAll('.nl-icon').forEach(icon => {
    const link = icon.closest('.nav-link');
    if (!link) return;
    link.addEventListener('mouseenter', () => { icon.style.transform = 'scale(1.3) rotate(-8deg)'; });
    link.addEventListener('mouseleave', () => { icon.style.transform = ''; });
  });
})();

/* ══════════════════════════════════════
   TOAST
══════════════════════════════════════ */
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), 3000);
}

/* ══════════════════════════════════════
   INIT
══════════════════════════════════════ */
updateActiveFilters();

(async function initShopRealtime() {
  await loadShopWishlist();
  await loadShopProducts();
})();

console.log('%c🛒 PADDOX — Shop Page Loaded', 'color:#e8002d;font-size:14px;font-weight:bold;');