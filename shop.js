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
  '/api/products';

const WISHLIST_API_BASE =
  '/api/wishlist';

const ORDER_API_BASE =
  '/api/orders';

const COUPON_API_BASE =
  '/api/coupons';

const SHOP_USER_PROFILE_API =
  '/api/users/profile';

let USER_WISHLIST_IDS = new Set();
let SHOP_AUTHENTICATED = false;
let SHOP_SESSION_CHECK = null;

const SHOP_F1_TEAMS = [
  { name: 'Ferrari', aliases: ['ferrari', 'scuderia ferrari'] },
  { name: 'Red Bull Racing', aliases: ['red bull', 'red bull racing', 'oracle red bull', 'oracle red bull racing'] },
  { name: 'Mercedes', aliases: ['mercedes', 'mercedes-amg', 'mercedes amg'] },
  { name: 'McLaren', aliases: ['mclaren', 'mclaren f1'] },
  { name: 'Aston Martin', aliases: ['aston martin'] },
  { name: 'Alpine', aliases: ['alpine', 'bwt alpine'] },
  { name: 'Williams', aliases: ['williams'] },
  { name: 'Haas F1 Team', aliases: ['haas', 'haas f1', 'haas f1 team'] },
  { name: 'Racing Bulls', aliases: ['racing bulls', 'rb', 'visa cash app rb'] },
  { name: 'Audi', aliases: ['audi', 'kick sauber', 'sauber'] },
  { name: 'Cadillac', aliases: ['cadillac'] },
];

function cleanTeamText(value = '') {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function canonicalShopTeam(value = '') {
  const key = cleanTeamText(value);
  if (!key) return 'PADDOX Original';
  const found = SHOP_F1_TEAMS.find(team =>
    team.aliases.some(alias => key.includes(cleanTeamText(alias)) || cleanTeamText(alias).includes(key))
  );
  return found ? found.name : String(value || 'PADDOX Original').trim();
}


async function detectShopSession(force = false) {
  if (SHOP_AUTHENTICATED && !force) return true;
  if (SHOP_SESSION_CHECK && !force) return SHOP_SESSION_CHECK;

  SHOP_SESSION_CHECK = fetch('/api/auth/me', {
    credentials: 'include',
    headers: { Accept: 'application/json' }
  })
    .then(async res => {
      const data = await res.json().catch(() => ({}));
      const user = data.data?.user || data.data || data.user || null;
      SHOP_AUTHENTICATED = Boolean(
        res.ok &&
        data.success !== false &&
        user &&
        (user._id || user.id || user.email)
      );
      return SHOP_AUTHENTICATED;
    })
    .catch(() => {
      SHOP_AUTHENTICATED = false;
      return false;
    })
    .finally(() => {
      SHOP_SESSION_CHECK = null;
    });

  return SHOP_SESSION_CHECK;
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


function loadCartState() {
  try {
    const raw = localStorage.getItem('paddox_cart') || sessionStorage.getItem('paddox_cart') || '[]';
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

let cart = loadCartState();
let checkoutCoupon = null;

function resetCheckoutCoupon() {
  checkoutCoupon = null;
}

function getCartOriginalSubtotal() {
  return cart.reduce((s, x) => {
    const original = Math.max(Number(x.originalPrice || x.price || 0), Number(x.price || 0));
    return s + original * Number(x.qty || 1);
  }, 0);
}

function getCartProductDiscount() {
  return cart.reduce((s, x) => {
    const original = Math.max(Number(x.originalPrice || x.price || 0), Number(x.price || 0));
    const price = Number(x.price || 0);
    return s + Math.max(0, original - price) * Number(x.qty || 1);
  }, 0);
}

function getCheckoutPricingSnapshot() {
  const subtotal = getCartOriginalSubtotal();
  const productDiscount = getCartProductDiscount();
  const productDiscountedSubtotal = Math.max(0, subtotal - productDiscount);
  const shipping = cartShippingAmount(productDiscountedSubtotal);
  const discount = Math.max(0, Math.min(Number(checkoutCoupon?.discount || 0), productDiscountedSubtotal));
  const discountedSubtotal = Math.max(0, productDiscountedSubtotal - discount);
  const tax = Math.round(discountedSubtotal * 0.05);
  const total = discountedSubtotal + shipping + tax;

  return { subtotal, productDiscount, shipping, discount, tax, total };
}

function renderCheckoutSummary(modal = document.getElementById('paddox-checkout-modal')) {
  if (!modal) return;

  const summary = modal.querySelector('#pdx-checkout-summary');
  if (!summary) return;

  const pricing = getCheckoutPricingSnapshot();
  const coupon = checkoutCoupon;

  summary.innerHTML = `
    <div class="pdx-checkout-items">
      ${cart.map(item => `
        <div class="pdx-checkout-item">
          <span>${escapeCheckoutText(item.name)}${item.size ? ' · ' + escapeCheckoutText(item.size) : ''} × ${Number(item.qty || 1)}</span>
          <strong>₹${(Number(item.price || 0) * Number(item.qty || 1)).toLocaleString('en-IN')}</strong>
        </div>
      `).join('')}
    </div>
    <div><span>Items</span><strong>${getCartQuantity()}</strong></div>
    <div><span>Subtotal</span><strong>₹${pricing.subtotal.toLocaleString('en-IN')}</strong></div>
    ${pricing.productDiscount ? `
      <div class="pdx-checkout-discount-row">
        <span>Product discount</span>
        <strong>-₹${pricing.productDiscount.toLocaleString('en-IN')}</strong>
      </div>` : ''}
    <div><span>Shipping</span><strong>${pricing.shipping ? `₹${pricing.shipping.toLocaleString('en-IN')}` : 'FREE'}</strong></div>
    ${coupon ? `
      <div class="pdx-checkout-discount-row">
        <span>Coupon ${escapeCheckoutText(coupon.code)}</span>
        <strong>-₹${pricing.discount.toLocaleString('en-IN')}</strong>
      </div>` : ''}
    <div><span>Tax</span><strong>₹${pricing.tax.toLocaleString('en-IN')}</strong></div>
    <div class="pdx-checkout-total"><span>Total</span><strong>₹${pricing.total.toLocaleString('en-IN')}</strong></div>
  `;
}

function updateCouponPanel(message = '', state = '') {
  const modal = document.getElementById('paddox-checkout-modal');
  const panel = modal?.querySelector('#pdx-coupon-feedback');
  const removeBtn = modal?.querySelector('#pdx-remove-coupon');
  const input = modal?.querySelector('#co-coupon-code');

  if (panel) {
    panel.textContent = message;
    panel.className = `pdx-coupon-feedback ${state || ''}`.trim();
  }

  if (removeBtn) removeBtn.style.display = checkoutCoupon ? 'inline-flex' : 'none';
  if (input && checkoutCoupon) input.value = checkoutCoupon.code;
}

async function applyCheckoutCoupon() {
  const modal = document.getElementById('paddox-checkout-modal');
  const input = modal?.querySelector('#co-coupon-code');
  const applyBtn = modal?.querySelector('#pdx-apply-coupon');
  const code = String(input?.value || '').trim().toUpperCase();

  if (!code) {
    updateCouponPanel('Enter a coupon code first.', 'error');
    input?.focus();
    return;
  }

  try {
    if (applyBtn) {
      applyBtn.disabled = true;
      applyBtn.textContent = 'Checking...';
    }

    const res = await fetch(`${COUPON_API_BASE}/validate`, { credentials: 'include',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, orderTotal: Math.max(0, getCartOriginalSubtotal() - getCartProductDiscount()) })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || data.success === false) {
      throw new Error(data.message || 'Coupon could not be applied');
    }

    const coupon = data.coupon || data.data?.coupon || {};

    checkoutCoupon = {
      id: coupon.id || coupon._id || '',
      code: coupon.code || code,
      type: coupon.type || '',
      value: Number(coupon.value || 0),
      discount: Number(coupon.discount || data.pricing?.discount || 0)
    };

    updateCouponPanel(`${checkoutCoupon.code} applied. You saved ₹${checkoutCoupon.discount.toLocaleString('en-IN')}.`, 'success');
    renderCheckoutSummary(modal);
    showToast(`Coupon ${checkoutCoupon.code} applied`);
  } catch (err) {
    checkoutCoupon = null;
    renderCheckoutSummary(modal);
    updateCouponPanel(err.message || 'Coupon could not be applied', 'error');
  } finally {
    if (applyBtn) {
      applyBtn.disabled = false;
      applyBtn.textContent = 'Apply';
    }
  }
}

function removeCheckoutCoupon() {
  checkoutCoupon = null;
  const modal = document.getElementById('paddox-checkout-modal');
  const input = modal?.querySelector('#co-coupon-code');
  if (input) input.value = '';
  updateCouponPanel('Coupon removed.', '');
  renderCheckoutSummary(modal);
}

async function loadShopProducts() {
  try {
    const res = await fetch(PRODUCT_API_BASE);
    const data = await res.json();

    PRODUCTS = data.data || data.products || [];

    PRODUCTS = PRODUCTS.map(p => {
      const originalPrice = Number(p.price || 0);
      const effectivePrice = Number(
        p.effectivePrice ??
        (p.onSale && p.salePrice ? p.salePrice : p.price) ??
        0
      );
      const safeOriginalPrice = Math.max(originalPrice, effectivePrice);

      return {
      id: p._id,
      name: p.name,
      team: p.team,
      teamKey: canonicalShopTeam(p.team),
      cat: p.category,
      price: effectivePrice,
      originalPrice: safeOriginalPrice,
      rating: Number(p.ratings?.average || p.rating || 5),
      badge: p.badge,
      emoji: p.emoji || '',
      limited: !!p.isLimited,
      sale: !!p.onSale || safeOriginalPrice > effectivePrice,
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
      };
    });

    renderProducts();
    updateShopHeroStats();
    syncWishlistButtons();
    loadAIRecommendations();
  } catch (err) {
    console.error(err);
    showToast('Failed to load products');
  }
}

async function loadAIRecommendations() {
  const wrap = document.getElementById('ai-recommendations-wrap');
  const grid = document.getElementById('ai-products-grid');
  
  if (!wrap || !grid || PRODUCTS.length === 0) return;
  
  try {
    const res = await fetch(`/api/ai/recommendations`, {
      headers: { 'Accept': 'application/json' }
    });
    
    if (!res.ok) throw new Error('AI backend not available');
    const data = await res.json();
    let aiProducts = [];
    if (data.products && data.products.length > 0) {
       aiProducts = PRODUCTS.filter(p => data.products.includes(p.id)).slice(0, 4);
    }
    
    if (aiProducts.length > 0) {
      grid.innerHTML = aiProducts.map((p, i) => cardHTML(p, i)).join('');
      bindCardEvents(grid);
      const title = document.getElementById('recommendations-title');
      const mode = document.getElementById('recommendations-mode');
      if (title) title.textContent = 'Picked for you';
      if (mode) mode.textContent = 'AI picks';
      wrap.style.display = 'block';
    } else {
      throw new Error('No AI match');
    }
  } catch (e) {
    console.warn("AI Recommendations Fallback:", e);
    /* Do not label duplicated catalogue items as personalized AI results. */
    grid.innerHTML = '';
    wrap.style.display = 'none';
  }
}


function updateShopHeroStats() {
  const dropEl = document.getElementById('shop-drop-mode');
  const teamEl = document.getElementById('shop-team-count');
  const productEl = document.getElementById('shop-product-count');
  const catalogueEl = document.getElementById('catalogue-total');
  if (dropEl) dropEl.textContent = PRODUCTS.length ? 'Live' : 'Soon';
  if (teamEl) teamEl.textContent = String(SHOP_F1_TEAMS.length);
  if (productEl) productEl.textContent = String(PRODUCTS.length);
  if (catalogueEl) catalogueEl.textContent = String(PRODUCTS.length);
}


function productStockLimit(product = {}) {
  const stock = Number(product.stock ?? product.inventory ?? 99);
  if (!Number.isFinite(stock) || stock <= 0) return 99;
  return Math.max(1, Math.floor(stock));
}

function currentCartQuantity(productId, size = '') {
  return cart
    .filter(item => String(item.id) === String(productId) && String(item.size || '') === String(size || ''))
    .reduce((sum, item) => sum + Number(item.qty || 0), 0);
}

function getCartSubtotal() {
  return cart.reduce((s, x) => s + Number(x.price || 0) * Number(x.qty || 1), 0);
}

function getCartQuantity() {
  return cart.reduce((s, x) => s + Number(x.qty || 0), 0);
}

function cartShippingAmount(subtotal = getCartSubtotal()) {
  return subtotal >= 999 ? 0 : 99;
}

function getCartTotal() {
  const subtotal = getCartSubtotal();
  return subtotal + cartShippingAmount(subtotal);
}

async function loadShopWishlist() {
  try {
    if (!await detectShopSession()) {
      USER_WISHLIST_IDS = new Set();
      return;
    }

    const res = await fetch(WISHLIST_API_BASE, { credentials: 'include',
      headers: {
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
    if (!await detectShopSession()) {
      showToast('Please login to use wishlist');
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
    showToast(`${err.message}`);
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
  showToast('All filters cleared');
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
    case 'newest' : list.sort((a, b) => String(b.id).localeCompare(String(a.id))); break;
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
  const catalogueEl = document.getElementById('catalogue-total');
  if (catalogueEl) catalogueEl.textContent = total;

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
  const origPrice = p.sale && p.originalPrice > p.price
    ? `<span class="pcard-orig">₹${Math.round(p.originalPrice).toLocaleString('en-IN')}</span>`
    : '';

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
        <div class="pcard-img-gradient" style="background:${p.gradient};display:none"><span class="fallback-speedmark"></span></div>
        <div class="pcard-img-overlay"></div>
        <div class="pcard-overlay">
          <button class="ov-btn add-to-cart-btn" data-id="${p.id}">${needsSize(p) ? 'Select Size' : 'Add to Cart'}</button>
          <button class="ov-btn outline quick-view-btn" data-id="${p.id}">Quick View</button>
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
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const product = PRODUCTS.find(p => String(p.id) === String(btn.dataset.id));
      if (needsSize(product)) openModal(btn.dataset.id);
      else addToCart(btn.dataset.id);
    });
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

function saveCart() {
  resetCheckoutCoupon();
  const payload = JSON.stringify(cart);
  localStorage.setItem('paddox_cart', payload);
  sessionStorage.setItem('paddox_cart', payload);
  updateCartUI();
}



function addToCart(id, selectedSize = null, qtyToAdd = 1) {
  const p = PRODUCTS.find(x => String(x.id) === String(id));
  if (!p) return;

  const size = needsSize(p) ? (selectedSize || 'M') : '';
  const stockLimit = productStockLimit(p);
  const requestedQty = Math.max(1, Number(qtyToAdd || 1));
  const alreadyInCart = currentCartQuantity(id, size);
  const allowedQty = Math.max(0, stockLimit - alreadyInCart);

  if (allowedQty <= 0) {
    showToast('Stock limit reached for this item');
    return;
  }

  const qty = Math.min(requestedQty, allowedQty);
  const cartKey = size ? `${id}-${size}` : String(id);
  const ex = cart.find(x => String(x.cartKey || x.id) === String(cartKey));

  if (ex) {
    ex.qty = Number(ex.qty || 1) + qty;
  } else {
    cart.push({
      cartKey,
      id,
      name: p.name,
      team: p.team,
      price: p.price,
      originalPrice: p.originalPrice || p.price,
      productDiscount: Math.max(0, Number(p.originalPrice || p.price) - Number(p.price || 0)),
      emoji: p.emoji,
      gradient: p.gradient,
      image: p.image,
      size,
      qty
    });
  }

  saveCart();

  showToast(`${p.name}${size ? ' · ' + size : ''} added to cart`);

  const badge = document.getElementById('cart-badge');
  if (badge) {
    badge.style.transform = 'scale(1.5)';
    setTimeout(() => badge.style.transform = '', 350);
  }

  const icon = document.querySelector('.cart-icon-anim');
  if (icon) {
    icon.style.transform = 'scale(1.4) rotate(-12deg)';
    setTimeout(() => icon.style.transform = '', 400);
  }
}

function removeFromCart(key) {
  cart = cart.filter(x => String(x.cartKey || x.id) !== String(key));
  saveCart();
}


function changeQty(key, delta) {
  const item = cart.find(x => String(x.cartKey || x.id) === String(key));
  if (!item) return;

  const product = PRODUCTS.find(p => String(p.id) === String(item.id));
  const maxQty = product ? productStockLimit(product) : 99;
  const nextQty = Number(item.qty || 1) + Number(delta || 0);

  if (nextQty <= 0) {
    removeFromCart(key);
    return;
  }

  if (nextQty > maxQty) {
    item.qty = maxQty;
    saveCart();
    showToast('Stock limit reached for this item');
    return;
  }

  item.qty = nextQty;
  saveCart();
}


function updateCartUI() {
  const badge     = document.getElementById('cart-badge');
  const countLbl  = document.getElementById('cart-count-label');
  const itemsEl   = document.getElementById('cart-items');
  const footer    = document.getElementById('cart-footer');
  const subtotal  = document.getElementById('cart-subtotal');
  const totalEl   = document.getElementById('cart-total');

  const totalQty  = getCartQuantity();
  if (badge)    badge.textContent    = totalQty;
  if (countLbl) countLbl.textContent = `${totalQty} item${totalQty !== 1 ? 's' : ''}`;

  if (!cart.length) {
    if (itemsEl) itemsEl.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon" aria-hidden="true"></div>
        <p>Your cart is empty.<br/>Find your favourite PADDOX gear.</p>
        <button class="cart-empty-btn" id="cart-empty-btn">Browse Shop</button>
      </div>`;
    document.getElementById('cart-empty-btn')?.addEventListener('click', () => toggleCart(false));
    if (footer) footer.style.display = 'none';
    return;
  }

  if (footer) footer.style.display = 'block';
  const subTotalValue = getCartSubtotal();
  const shipping = cartShippingAmount(subTotalValue);
  const total = subTotalValue + shipping;

  if (subtotal) subtotal.textContent = `₹${subTotalValue.toLocaleString('en-IN')}`;
  if (totalEl)  totalEl.textContent  = `₹${total.toLocaleString('en-IN')}`;

  const cartSummary = footer?.querySelector('.cart-summary');
  if (cartSummary) {
    const leftForFree = Math.max(0, 999 - subTotalValue);
    const progress = Math.min(100, Math.round((subTotalValue / 999) * 100));
    const shippingRow = cartSummary.querySelector('.free-ship');
    if (shippingRow) shippingRow.textContent = shipping ? `₹${shipping}` : 'FREE';

    let progressEl = cartSummary.querySelector('.pdx-cart-free-progress');
    if (!progressEl) {
      progressEl = document.createElement('div');
      progressEl.className = 'pdx-cart-free-progress';
      cartSummary.prepend(progressEl);
    }

    progressEl.innerHTML = `
      <div class="pdx-free-label">${leftForFree ? `Add ₹${leftForFree.toLocaleString('en-IN')} more for free shipping` : 'Free shipping unlocked'}</div>
      <div class="pdx-free-track"><span style="width:${progress}%"></span></div>
    `;
  }

  if (itemsEl) {
    itemsEl.innerHTML = cart.map(item => `
      <div class="cart-item" data-key="${item.cartKey || item.id}">
        <div class="ci-img" style="background:${item.gradient}">
          <img src="${item.image}" alt="${escapeCheckoutText(item.name)}"
            onerror="this.outerHTML='<span class=&quot;fallback-speedmark small&quot;></span>'"
            style="width:100%;height:100%;object-fit:cover"/>
        </div>
        <div class="ci-info">
          <div class="ci-team">${escapeCheckoutText(item.team)}${item.size ? ' · Size ' + escapeCheckoutText(item.size) : ''}</div>
          <div class="ci-name">${escapeCheckoutText(item.name)}</div>
          <div class="ci-price">₹${(Number(item.price || 0) * Number(item.qty || 1)).toLocaleString('en-IN')}</div>
          <div class="ci-qty">
            <button class="qty-b" data-key="${item.cartKey || item.id}" data-delta="-1">−</button>
            <span class="qty-n">${item.qty}</span>
            <button class="qty-b" data-key="${item.cartKey || item.id}" data-delta="1">+</button>
          </div>
        </div>
        <button class="ci-rm" data-key="${item.cartKey || item.id}" aria-label="Remove ${escapeCheckoutText(item.name)}">✕</button>
      </div>
    `).join('');

    itemsEl.querySelectorAll('.qty-b').forEach(btn => {
      btn.addEventListener('click', () => changeQty(btn.dataset.key, parseInt(btn.dataset.delta, 10)));
    });
    itemsEl.querySelectorAll('.ci-rm').forEach(btn => {
      btn.addEventListener('click', () => removeFromCart(btn.dataset.key));
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



function escapeCheckoutText(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function readJsonStorage(key) {
  try {
    const value = localStorage.getItem(key) || sessionStorage.getItem(key) || '';
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function buildCheckoutAddressFromUser(user = {}) {
  const address = user.address || user.shippingAddress || {};
  const firstName = user.firstName || '';
  const lastName = user.lastName || '';
  return {
    name: String(user.name || `${firstName} ${lastName}`.trim() || '').trim(),
    phone: String(user.phone || address.phone || '').trim(),
    line1: String(address.line1 || address.address || '').trim(),
    line2: String(address.line2 || '').trim(),
    city: String(address.city || '').trim(),
    state: String(address.state || '').trim(),
    pincode: String(address.pincode || address.pinCode || address.zip || '').trim(),
    country: String(address.country || 'India').trim() || 'India'
  };
}

function normalizeCheckoutAddress(source = {}) {
  return {
    name: String(source.name || source.fullName || '').trim(),
    phone: String(source.phone || source.mobile || '').trim(),
    line1: String(source.line1 || source.address || source.addressLine1 || '').trim(),
    line2: String(source.line2 || source.addressLine2 || '').trim(),
    city: String(source.city || '').trim(),
    state: String(source.state || '').trim(),
    pincode: String(source.pincode || source.pinCode || source.zip || '').trim(),
    country: String(source.country || 'India').trim() || 'India'
  };
}

function checkoutAddressComplete(address = {}) {
  return !!(
    address.name &&
    address.phone &&
    address.line1 &&
    address.city &&
    address.state &&
    address.pincode
  );
}

function checkoutAddressLabel(address = {}) {
  const parts = [address.line1, address.line2, address.city, address.state, address.pincode]
    .filter(Boolean)
    .join(', ');
  return parts || 'No saved delivery address found yet.';
}

async function getSavedCheckoutAddress() {
  const savedAddress = normalizeCheckoutAddress(readJsonStorage('paddox_saved_address') || {});
  const savedUser = buildCheckoutAddressFromUser(readJsonStorage('paddox_user') || {});

  if (checkoutAddressComplete(savedAddress)) return savedAddress;
  if (checkoutAddressComplete(savedUser)) return savedUser;

  if (!await detectShopSession()) return savedAddress;

  try {
    const res = await fetch(SHOP_USER_PROFILE_API, { credentials: 'include',
      headers: { }
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) return savedAddress;

    const user = data.data?.user || data.data || data.user || {};
    const profileAddress = buildCheckoutAddressFromUser(user);
    if (checkoutAddressComplete(profileAddress)) {
      localStorage.setItem('paddox_saved_address', JSON.stringify(profileAddress));
      return profileAddress;
    }
  } catch (err) {
    console.warn('Saved address fetch skipped:', err);
  }

  return savedAddress;
}

function fillCheckoutAddress(address = {}) {
  const setValue = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.value = value || '';
  };

  setValue('co-name', address.name);
  setValue('co-phone', address.phone);
  setValue('co-line1', address.line1);
  setValue('co-line2', address.line2);
  setValue('co-city', address.city);
  setValue('co-state', address.state);
  setValue('co-pincode', address.pincode);
}

async function refreshSavedAddressPanel(modal) {
  if (!modal) return;

  const panel = modal.querySelector('#pdx-saved-address-panel');
  const body = modal.querySelector('#pdx-saved-address-text');
  const button = modal.querySelector('#pdx-use-saved-address');
  if (!panel || !body || !button) return;

  body.textContent = 'Checking saved profile address...';
  button.disabled = true;
  button.classList.remove('ready');

  const address = await getSavedCheckoutAddress();
  panel._savedAddress = address;

  if (checkoutAddressComplete(address)) {
    body.innerHTML = `
      <strong>${escapeCheckoutText(address.name)}</strong>
      <span>${escapeCheckoutText(checkoutAddressLabel(address))}</span>
      <em>${escapeCheckoutText(address.phone)}</em>
    `;
    button.disabled = false;
    button.classList.add('ready');
  } else {
    body.innerHTML = `
      <strong>No saved address yet</strong>
      <span>Save your address in Account → Profile Settings first, then use it here.</span>
    `;
  }
}

function applySavedCheckoutAddress() {
  const modal = document.getElementById('paddox-checkout-modal');
  const panel = modal?.querySelector('#pdx-saved-address-panel');
  const address = panel?._savedAddress;

  if (!checkoutAddressComplete(address || {})) {
    showToast('Save your address in Profile Settings first');
    return;
  }

  fillCheckoutAddress(address);
  modal.querySelector('#co-payment-method')?.focus();
  showToast('Saved address applied');
}

function ensureCheckoutModal() {
  let modal = document.getElementById('paddox-checkout-modal');
  if (modal) return modal;

  modal = document.createElement('div');
  modal.id = 'paddox-checkout-modal';
  modal.className = 'pdx-checkout-modal';
  modal.innerHTML = `
    <div class="pdx-checkout-backdrop" data-close-checkout="true"></div>
    <div class="pdx-checkout-card">
      <button class="pdx-checkout-close" type="button" data-close-checkout="true">✕</button>
      <div class="pdx-checkout-kicker"><span class="pdx-mini-lock" aria-hidden="true"></span> SECURE CHECKOUT</div>
      <div class="pdx-checkout-title">DELIVERY DETAILS</div>
      <p class="pdx-checkout-sub">Enter your delivery details and choose your preferred payment method to place the order.</p>

      <div class="pdx-saved-address-panel" id="pdx-saved-address-panel">
        <div class="pdx-saved-address-copy">
          <div class="pdx-saved-address-kicker">PROFILE ADDRESS</div>
          <div class="pdx-saved-address-text" id="pdx-saved-address-text">Checking saved profile address...</div>
        </div>
        <button class="pdx-use-saved-address" id="pdx-use-saved-address" type="button" disabled>
          Use saved address <span aria-hidden="true">→</span>
        </button>
      </div>

      <form id="paddox-checkout-form" class="pdx-checkout-form">
        <div class="pdx-checkout-grid">
          <label>Full Name<input id="co-name" required maxlength="80" autocomplete="name" placeholder="Receiver name"></label>
          <label>Phone<input id="co-phone" required maxlength="15" inputmode="tel" autocomplete="tel" placeholder="10 digit mobile number"></label>
        </div>
        <label>Address Line 1<input id="co-line1" required maxlength="160" autocomplete="address-line1" placeholder="House no, street, area"></label>
        <label>Address Line 2 <span>Optional</span><input id="co-line2" maxlength="160" autocomplete="address-line2" placeholder="Landmark / apartment"></label>
        <div class="pdx-checkout-grid pdx-checkout-grid-3">
          <label>City<input id="co-city" required maxlength="60" autocomplete="address-level2" placeholder="City"></label>
          <label>State<input id="co-state" required maxlength="60" autocomplete="address-level1" placeholder="State"></label>
          <label>Pincode<input id="co-pincode" required maxlength="10" inputmode="numeric" autocomplete="postal-code" placeholder="Pincode"></label>
        </div>
        <label>Payment Method
          <select id="co-payment-method" required>
            <option value="upi">UPI</option>
            <option value="card">Credit / Debit Card</option>
            <option value="netbanking">Net Banking</option>
            <option value="wallet">Wallet</option>
            <option value="cod">Cash on Delivery</option>
          </select>
        </label>
        <div class="pdx-payment-note">Choose a payment mode to complete your PADDOX order.</div>

        <div class="pdx-coupon-box">
          <div class="pdx-coupon-head">
            <div>
              <span>FAN DEAL CODE</span>
              <strong>Apply Coupon</strong>
            </div>
            <button id="pdx-remove-coupon" class="pdx-remove-coupon" type="button" style="display:none">Remove</button>
          </div>
          <div class="pdx-coupon-row">
            <input id="co-coupon-code" maxlength="24" autocomplete="off" placeholder="LAUNCH10 / RACEWEEK20">
            <button id="pdx-apply-coupon" type="button">Apply</button>
          </div>
          <div class="pdx-coupon-feedback" id="pdx-coupon-feedback">Enter an active PADDOX coupon code before placing order.</div>
        </div>

        <div class="pdx-checkout-summary" id="pdx-checkout-summary"></div>

        <button class="pdx-checkout-pay" type="submit">
          <span>Place Order</span><span class="checkout-arrow" aria-hidden="true"></span>
        </button>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  modal.addEventListener('click', e => {
    if (e.target?.dataset?.closeCheckout === 'true') closeCheckoutModal();
  });

  modal.querySelector('#paddox-checkout-form')?.addEventListener('submit', submitCheckoutForm);
  modal.querySelector('#pdx-use-saved-address')?.addEventListener('click', applySavedCheckoutAddress);
  modal.querySelector('#pdx-apply-coupon')?.addEventListener('click', applyCheckoutCoupon);
  modal.querySelector('#pdx-remove-coupon')?.addEventListener('click', removeCheckoutCoupon);
  modal.querySelector('#co-coupon-code')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      applyCheckoutCoupon();
    }
  });

  return modal;
}

async function openCheckoutModal() {
  if (!cart.length) {
    showToast('❌ Cart is empty');
    return;
  }

  if (!await detectShopSession()) {
    showToast('Please login first');
    setTimeout(() => {
      window.location.href = 'account.html';
    }, 900);
    return;
  }

  const modal = ensureCheckoutModal();
  refreshSavedAddressPanel(modal);
  resetCheckoutCoupon();
  const couponInput = modal.querySelector('#co-coupon-code');
  if (couponInput) couponInput.value = '';
  updateCouponPanel('Enter an active PADDOX coupon code before placing order.', '');
  renderCheckoutSummary(modal);

  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
  setTimeout(() => modal.querySelector('#co-name')?.focus(), 80);
}

function closeCheckoutModal() {
  const modal = document.getElementById('paddox-checkout-modal');
  modal?.classList.remove('show');
  document.body.style.overflow = '';
}

function getCheckoutFormData() {
  const field = id => document.getElementById(id)?.value?.trim() || '';

  const shippingAddress = {
    name: field('co-name'),
    phone: field('co-phone'),
    line1: field('co-line1'),
    line2: field('co-line2'),
    city: field('co-city'),
    state: field('co-state'),
    pincode: field('co-pincode'),
    country: 'India'
  };

  const missing = Object.entries(shippingAddress)
    .filter(([key, value]) => !value && !['line2'].includes(key))
    .map(([key]) => key);

  if (missing.length) {
    throw new Error('Please fill all required delivery fields');
  }

  if (!/^\d{6}$/.test(shippingAddress.pincode)) {
    throw new Error('Please enter a valid 6 digit pincode');
  }

  if (!/^\d{10}$/.test(shippingAddress.phone.replace(/\D/g, ''))) {
    throw new Error('Please enter a valid 10 digit phone number');
  }

  return {
    shippingAddress,
    paymentMethod: field('co-payment-method') || 'upi'
  };
}

async function submitCheckoutForm(e) {
  e.preventDefault();

  if (!await detectShopSession()) {
    showToast('Please login first');
    return;
  }

  const submitBtn = document.querySelector('.pdx-checkout-pay');

  try {
    const { shippingAddress, paymentMethod } = getCheckoutFormData();
    localStorage.setItem('paddox_saved_address', JSON.stringify(shippingAddress));

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Processing order...</span><span class="pdx-loading-dot" aria-hidden="true"></span>';

    const orderRes = await fetch(ORDER_API_BASE, { credentials: 'include',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        },
      body: JSON.stringify({
        items: cart.map(item => ({
          product: item.id,
          quantity: item.qty || 1,
          size: item.size || '',
          color: item.color || ''
        })),
        shippingAddress,
        paymentMethod,
        couponCode: checkoutCoupon?.code || '',
        notes: checkoutCoupon?.code
          ? `Checkout from shop page · Coupon ${checkoutCoupon.code}`
          : 'Checkout from shop page'
      })
    });

    const orderData = await orderRes.json().catch(() => ({}));

    if (!orderRes.ok || orderData.success === false) {
      throw new Error(orderData.message || 'Order could not be created');
    }

    const order = orderData.data?.order || orderData.order;
    if (!order?._id) throw new Error('Order created but order id was not returned');

    cart = [];
    saveCart();
    updateCartUI();

    submitBtn.classList.add('is-success');
    submitBtn.innerHTML = '<span>Order placed. Opening receipt...</span><span class="checkout-success-mark" aria-hidden="true"></span>';
    showToast('Order placed. Opening receipt...');

    setTimeout(() => {
      closeCheckoutModal();
      toggleCart(false);
      window.location.href = `receipt.html?orderId=${encodeURIComponent(order._id)}`;
    }, 850);

  } catch (err) {
    console.error(err);
    showToast(`${err.message}`);
    submitBtn.disabled = false;
    submitBtn.classList.remove('is-success');
    submitBtn.innerHTML = '<span>Place Order</span><span class="checkout-arrow" aria-hidden="true"></span>';
  }
}

document.getElementById('checkout-btn')?.addEventListener('click', openCheckoutModal);
updateCartUI();

/* ══════════════════════════════════════
   SHOP EXPERIENCE CONTROLS
══════════════════════════════════════ */
function scrollToShopCatalogue() {
  document.getElementById('shop-catalogue')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function selectShopCategory(category) {
  const tab = [...document.querySelectorAll('.cat-tab')]
    .find(item => item.dataset.cat === category);
  if (tab) tab.click();
  setTimeout(scrollToShopCatalogue, 80);
}

document.querySelectorAll('[data-shop-scroll="catalogue"]').forEach(button => {
  button.addEventListener('click', scrollToShopCatalogue);
});

document.querySelectorAll('[data-shop-category]').forEach(button => {
  button.addEventListener('click', () => selectShopCategory(button.dataset.shopCategory));
});

document.getElementById('footer-cart-btn')?.addEventListener('click', () => toggleCart(true));


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
      modalQty = 1;
      const qtyEl = document.getElementById('modal-qty');
      if (qtyEl) qtyEl.textContent = modalQty;
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
  if (origEl) origEl.textContent = p.sale && p.originalPrice > p.price
    ? `₹${Math.round(p.originalPrice).toLocaleString('en-IN')}`
    : '';

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
      onerror="this.outerHTML='<span class=&quot;fallback-speedmark large&quot;></span>'"/>
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
          onerror="this.outerHTML='<span class=&quot;fallback-speedmark small&quot;></span>'"
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
  if (badgesEl) badgesEl.innerHTML = p.badge ? `<span class="pbadge b-${p.badge}">${p.badge.toUpperCase()}</span>` : '';

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
      const selectedSize = needsSize(p) ? getSelectedModalSize() : '';
      const maxQty = Math.max(1, productStockLimit(p) - currentCartQuantity(p.id, selectedSize));
      if (modalQty >= maxQty) {
        showToast('Stock limit reached for this item');
        return;
      }
      modalQty++;
      document.getElementById('modal-qty').textContent = modalQty;
    };
  }

  /* Add to cart */
  const addBtn = document.getElementById('modal-add-btn');
  if (addBtn) {
    addBtn.onclick = () => {
      const selectedSize = needsSize(p) ? getSelectedModalSize() : '';

      addToCart(p.id, selectedSize, modalQty);
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
