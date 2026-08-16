/* ============================================================
   PADDOX ADMIN — Live Overview Controller
   Runs after the legacy dashboard + repair layer and owns only Overview.
   Replaces all demo fallback values with real backend data.
   ============================================================ */
(function paddoxAdminLiveOverview(){
  'use strict';

  const REFRESH_MS = 30000;
  let refreshTimer = null;
  let refreshInFlight = null;

  const state = {
    orders: [],
    products: [],
    users: [],
    errors: {}
  };

  function escapeHtml(value = '') {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({
      '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;'
    }[ch]));
  }

  function money(value = 0) {
    return `₹${Number(value || 0).toLocaleString('en-IN')}`;
  }

  function compactMoney(value = 0) {
    const n = Number(value || 0);
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(n >= 100000000 ? 0 : 1).replace(/\.0$/, '')}Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(n >= 1000000 ? 0 : 1).replace(/\.0$/, '')}L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '')}K`;
    return money(n);
  }

  function orderTotal(order = {}) {
    return Number(
      order?.pricing?.total ??
      order?.pricing?.grandTotal ??
      order?.total ??
      order?.amount ??
      0
    );
  }

  function orderStatus(order = {}) {
    return String(order.status || order.orderStatus || 'placed').toLowerCase().replace(/\s+/g, '_');
  }

  function orderIsCancelled(order = {}) {
    return ['cancelled','canceled','failed','refunded'].includes(orderStatus(order));
  }

  function customerName(order = {}) {
    return (
      [order?.user?.firstName, order?.user?.lastName].filter(Boolean).join(' ').trim() ||
      order?.user?.name ||
      order?.shippingAddress?.name ||
      order?.customer?.name ||
      'Customer'
    );
  }

  function statusClass(status = '') {
    const s = String(status).toLowerCase();
    if (['delivered','completed','fulfilled'].includes(s)) return 's-del';
    if (['shipped','out_for_delivery'].includes(s)) return 's-sh';
    if (['cancelled','canceled','failed','refunded'].includes(s)) return 's-out';
    return 's-pr';
  }

  function extractArray(payload, keys = []) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    for (const key of keys) {
      if (Array.isArray(payload?.[key])) return payload[key];
      if (Array.isArray(payload?.data?.[key])) return payload.data[key];
    }
    return [];
  }

  async function fetchJson(url) {
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
      headers: { Accept: 'application/json' }
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload?.success === false) {
      const error = new Error(payload?.message || `${response.status} ${response.statusText}`);
      error.status = response.status;
      throw error;
    }
    return payload;
  }

  function overviewActive() {
    return document.getElementById('adm-overview')?.classList.contains('on');
  }

  function syncTopbarAction() {
    const button = document.getElementById('adm-action-btn');
    if (!button) return;
    const activeId = document.querySelector('.adm-page.on')?.id || '';
    const hide = activeId === 'adm-overview' || activeId === 'adm-orders';
    button.hidden = hide;
    button.classList.toggle('is-hidden', hide);
    button.style.display = hide ? 'none' : '';
  }

  function overviewCards() {
    return [...document.querySelectorAll('#adm-overview .kpi-card')];
  }

  function setCard(card, label, value, note) {
    if (!card) return;
    const labelEl = card.querySelector('.kpi-label');
    const valueEl = card.querySelector('.kpi-value');
    const noteEl = card.querySelector('.kpi-change');
    if (labelEl) labelEl.textContent = label;
    if (valueEl) valueEl.textContent = value;
    if (noteEl) noteEl.textContent = note;
  }

  function clearDemoOverview() {
    const cards = overviewCards();
    setCard(cards[0], 'Total Revenue', '—', 'Syncing live orders…');
    setCard(cards[1], 'Total Orders', '—', 'Syncing live orders…');
    setCard(cards[2], 'Active Users', '—', 'Syncing registered users…');
    setCard(cards[3], 'Avg. Rating', '—', 'Syncing product ratings…');

    const recentBody = findOverviewTableBody('recent orders');
    if (recentBody) recentBody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:28px;color:#777">Syncing live orders…</td></tr>';

    const stockBody = findOverviewTableBody('low stock');
    if (stockBody) stockBody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:28px;color:#777">Syncing live inventory…</td></tr>';

    const chart = document.getElementById('bar-chart');
    if (chart) chart.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;min-height:180px;color:#666;font-family:var(--font-c);letter-spacing:2px">SYNCING LIVE REVENUE…</div>';
  }

  function renderKpis() {
    const cards = overviewCards();
    const revenue = state.orders
      .filter(order => !orderIsCancelled(order))
      .reduce((sum, order) => sum + orderTotal(order), 0);

    const activeUsers = state.users.filter(user => user?.isBanned !== true && user?.isActive !== false).length;
    const ratings = state.products
      .map(product => Number(product?.ratings?.average ?? product?.rating ?? 0))
      .filter(value => Number.isFinite(value) && value > 0);
    const avgRating = ratings.length
      ? ratings.reduce((sum, value) => sum + value, 0) / ratings.length
      : 0;

    setCard(
      cards[0],
      'Total Revenue',
      state.errors.orders ? '—' : compactMoney(revenue),
      state.errors.orders ? 'Orders API unavailable' : 'From live non-cancelled orders'
    );
    setCard(
      cards[1],
      'Total Orders',
      state.errors.orders ? '—' : state.orders.length.toLocaleString('en-IN'),
      state.errors.orders ? 'Orders API unavailable' : 'Live backend order count'
    );
    setCard(
      cards[2],
      'Active Users',
      state.errors.users ? '—' : activeUsers.toLocaleString('en-IN'),
      state.errors.users ? 'Users API unavailable' : 'Registered non-banned users'
    );
    setCard(
      cards[3],
      'Avg. Rating',
      state.errors.products ? '—' : (avgRating ? avgRating.toFixed(1) : '—'),
      state.errors.products ? 'Products API unavailable' : (ratings.length ? `${ratings.length} rated products` : 'No product ratings yet')
    );
  }

  function lastSixMonths() {
    const now = new Date();
    const rows = [];
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      rows.push({
        year: d.getFullYear(),
        month: d.getMonth(),
        label: d.toLocaleString('en-IN', { month:'short' }),
        full: d.toLocaleString('en-IN', { month:'long', year:'numeric' }),
        total: 0
      });
    }
    return rows;
  }

  function renderRevenueChart() {
    const container = document.getElementById('bar-chart');
    const sub = document.getElementById('overview-revenue-sub');
    if (!container) return;

    if (state.errors.orders) {
      container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;min-height:180px;color:#777">Live orders unavailable</div>';
      if (sub) sub.textContent = 'Revenue sync unavailable';
      return;
    }

    const months = lastSixMonths();
    state.orders.filter(order => !orderIsCancelled(order)).forEach(order => {
      const raw = order.createdAt || order.created_at || order.date;
      if (!raw) return;
      const d = new Date(raw);
      if (Number.isNaN(d.getTime())) return;
      const bucket = months.find(item => item.year === d.getFullYear() && item.month === d.getMonth());
      if (bucket) bucket.total += orderTotal(order);
    });

    const max = Math.max(...months.map(item => item.total), 1);
    if (sub) sub.textContent = `Live month-by-month revenue · ${months[0].label} – ${months[months.length - 1].label} ${months[months.length - 1].year}`;

    container.innerHTML = `
      <div class="revenue-gridlines" aria-hidden="true"><span></span><span></span><span></span></div>
      ${months.map((item, index) => {
        const height = item.total > 0 ? Math.max(14, (item.total / max) * 100) : 4;
        return `
          <div class="bc-col${index === months.length - 1 ? ' is-current-month' : ''}">
            <div class="bc-value">${item.total ? compactMoney(item.total) : '—'}</div>
            <div class="bc-wrap">
              <div class="bc-bar" style="height:${height}%" data-v="${escapeHtml(item.full)} · ${escapeHtml(money(item.total))}"></div>
            </div>
            <div class="bc-lbl">${escapeHtml(item.label)}</div>
          </div>`;
      }).join('')}
    `;
  }

  function productMaps() {
    const byId = new Map();
    const byName = new Map();
    state.products.forEach(product => {
      const id = String(product?._id || product?.id || '');
      const name = String(product?.name || '').trim().toLowerCase();
      if (id) byId.set(id, product);
      if (name) byName.set(name, product);
    });
    return { byId, byName };
  }

  function itemCategory(item = {}, maps) {
    if (item.category) return String(item.category);
    if (item?.product?.category) return String(item.product.category);

    const productId = String(item?.product?._id || item?.product || item?.productId || '');
    const itemName = String(item.name || item?.product?.name || '').trim().toLowerCase();
    const matched = (productId && maps.byId.get(productId)) || (itemName && maps.byName.get(itemName));
    return String(matched?.category || 'Other');
  }

  function categoryLabel(value = '') {
    const raw = String(value || 'Other').trim();
    return raw.replace(/[-_]/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase());
  }

  function renderCategoryChart() {
    const svg = document.getElementById('overview-category-svg');
    const legend = document.getElementById('overview-category-legend');
    const sub = document.getElementById('overview-category-sub');
    if (!svg || !legend) return;

    if (state.errors.orders) {
      svg.innerHTML = '<circle cx="75" cy="75" r="54" fill="none" stroke="#1e1e1e" stroke-width="22"/><text x="75" y="72" text-anchor="middle" fill="#fff" font-family="Bebas Neue" font-size="22">—</text><text x="75" y="88" text-anchor="middle" fill="#888" font-family="Inter" font-size="8">Offline</text>';
      legend.innerHTML = '<div class="overview-empty-note">Order categories unavailable</div>';
      if (sub) sub.textContent = 'Category sync unavailable';
      return;
    }

    const maps = productMaps();
    const totals = new Map();

    state.orders.filter(order => !orderIsCancelled(order)).forEach(order => {
      (order.items || []).forEach(item => {
        const category = categoryLabel(itemCategory(item, maps));
        const qty = Number(item.quantity || item.qty || 1);
        const price = Number(item.price ?? item?.product?.price ?? 0);
        const value = price > 0 ? price * Math.max(qty, 1) : Math.max(qty, 1);
        totals.set(category, (totals.get(category) || 0) + value);
      });
    });

    let entries = [...totals.entries()].filter(([, value]) => value > 0).sort((a,b) => b[1] - a[1]);
    if (entries.length > 4) {
      entries = [...entries.slice(0, 3), ['Other', entries.slice(3).reduce((sum, [, value]) => sum + value, 0)]];
    }

    const total = entries.reduce((sum, [, value]) => sum + value, 0);
    if (!total) {
      svg.innerHTML = '<circle cx="75" cy="75" r="54" fill="none" stroke="#1e1e1e" stroke-width="22"/><text x="75" y="72" text-anchor="middle" fill="#fff" font-family="Bebas Neue" font-size="22">0%</text><text x="75" y="88" text-anchor="middle" fill="#888" font-family="Inter" font-size="8">No data</text>';
      legend.innerHTML = '<div class="overview-empty-note">No order categories yet</div>';
      if (sub) sub.textContent = 'No category data in live orders yet';
      return;
    }

    const palette = ['#e8002d','#c9a84c','#0088ff','#00b400'];
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;
    const arcs = entries.map(([label, value], index) => {
      const dash = value / total * circumference;
      const markup = `<circle cx="75" cy="75" r="54" fill="none" stroke="${palette[index]}" stroke-width="22" stroke-dasharray="${dash.toFixed(2)} ${(circumference - dash).toFixed(2)}" stroke-dashoffset="${(-offset).toFixed(2)}" transform="rotate(-90 75 75)"/>`;
      offset += dash;
      return markup;
    }).join('');

    const leadPct = Math.round(entries[0][1] / total * 100);
    svg.innerHTML = `<circle cx="75" cy="75" r="54" fill="none" stroke="#1e1e1e" stroke-width="22"/>${arcs}<circle cx="75" cy="75" r="34" fill="#101012"/><text x="75" y="72" text-anchor="middle" fill="#fff" font-family="Bebas Neue" font-size="22">${leadPct}%</text><text x="75" y="88" text-anchor="middle" fill="#888" font-family="Inter" font-size="8">${escapeHtml(entries[0][0].slice(0, 11))}</text>`;

    legend.innerHTML = entries.map(([label, value], index) => `
      <div class="leg-item">
        <div class="leg-dot" style="background:${palette[index]}"></div>
        <span class="leg-lbl">${escapeHtml(label)}</span>
        <span class="leg-val">${Math.round(value / total * 100)}%</span>
      </div>`).join('');
    if (sub) sub.textContent = `Live category mix · ${entries.length} active ${entries.length === 1 ? 'category' : 'categories'}`;
  }

  function findOverviewTableBody(titleText) {
    const cards = [...document.querySelectorAll('#adm-overview .table-card')];
    const card = cards.find(item => String(item.querySelector('.table-card-title')?.textContent || '').toLowerCase().includes(titleText));
    return card?.querySelector('tbody') || null;
  }

  function renderRecentOrders() {
    const tbody = findOverviewTableBody('recent orders');
    if (!tbody) return;

    if (state.errors.orders) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:28px;color:#777">Live orders unavailable</td></tr>';
      return;
    }

    const rows = [...state.orders]
      .sort((a,b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 4);

    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:28px;color:#777">No orders yet</td></tr>';
      return;
    }

    tbody.innerHTML = rows.map(order => {
      const status = orderStatus(order);
      return `<tr>
        <td class="oid">#${escapeHtml(order.orderNumber || String(order._id || '').slice(-8) || 'ORDER')}</td>
        <td>${escapeHtml(customerName(order))}</td>
        <td>${escapeHtml(money(orderTotal(order)))}</td>
        <td><span class="sb ${statusClass(status)}">${escapeHtml(status.replaceAll('_', ' '))}</span></td>
      </tr>`;
    }).join('');
  }

  function renderLowStock() {
    const tbody = findOverviewTableBody('low stock');
    if (!tbody) return;

    if (state.errors.products) {
      tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:28px;color:#777">Live inventory unavailable</td></tr>';
      return;
    }

    const rows = state.products
      .filter(product => Number(product.stock ?? product.inventory ?? 0) <= 10)
      .sort((a,b) => Number(a.stock ?? a.inventory ?? 0) - Number(b.stock ?? b.inventory ?? 0))
      .slice(0, 4);

    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="3"><div class="overview-empty-state"><div class="overview-empty-icon">✓</div><div><div class="overview-empty-title">Inventory healthy</div><div class="overview-empty-sub">All monitored products are above safety stock.</div></div></div></td></tr>';
      return;
    }

    tbody.innerHTML = rows.map(product => {
      const stock = Math.max(0, Number(product.stock ?? product.inventory ?? 0));
      return `<tr>
        <td>${escapeHtml(product.name || 'Product')}</td>
        <td>${stock}</td>
        <td><span class="sb ${stock <= 0 ? 's-out' : 's-low'}">${stock <= 0 ? 'Out' : 'Low'}</span></td>
      </tr>`;
    }).join('');
  }

  function renderAll() {
    renderKpis();
    renderRevenueChart();
    renderCategoryChart();
    renderRecentOrders();
    renderLowStock();
    syncTopbarAction();
    document.documentElement.dataset.overviewLive = 'ready';
  }

  async function refreshLiveOverview() {
    if (refreshInFlight) return refreshInFlight;

    refreshInFlight = (async () => {
      const requests = {
        orders: fetchJson('/api/orders/admin/all'),
        products: fetchJson('/api/products?limit=200'),
        users: fetchJson('/api/admin/users?limit=200')
      };

      const [ordersResult, productsResult, usersResult] = await Promise.allSettled([
        requests.orders,
        requests.products,
        requests.users
      ]);

      state.errors = {};

      if (ordersResult.status === 'fulfilled') {
        state.orders = extractArray(ordersResult.value, ['orders']);
        try { window.REAL_ORDERS = state.orders; } catch (_) {}
      } else {
        state.orders = [];
        state.errors.orders = ordersResult.reason?.message || 'Orders unavailable';
      }

      if (productsResult.status === 'fulfilled') {
        state.products = extractArray(productsResult.value, ['products']);
        try { window.REAL_PRODUCTS = state.products; } catch (_) {}
      } else {
        state.products = [];
        state.errors.products = productsResult.reason?.message || 'Products unavailable';
      }

      if (usersResult.status === 'fulfilled') {
        state.users = extractArray(usersResult.value, ['users']);
        try { window.REAL_USERS = state.users; } catch (_) {}
      } else {
        state.users = [];
        state.errors.users = usersResult.reason?.message || 'Users unavailable';
      }

      renderAll();
      console.log('PADDOX Admin Overview live sync', {
        orders: state.orders.length,
        products: state.products.length,
        users: state.users.length,
        errors: state.errors
      });

      return state;
    })().finally(() => {
      refreshInFlight = null;
    });

    return refreshInFlight;
  }

  function bindOverviewRuntime() {
    clearDemoOverview();
    syncTopbarAction();

    document.querySelectorAll('.adm-nav-item[data-page]').forEach(item => {
      if (item.dataset.pdxOverviewBound === '1') return;
      item.dataset.pdxOverviewBound = '1';
      item.addEventListener('click', () => {
        setTimeout(() => {
          syncTopbarAction();
          if (item.dataset.page === 'overview') refreshLiveOverview();
        }, 0);
      });
    });

    if (!refreshTimer) {
      refreshTimer = window.setInterval(() => {
        if (overviewActive() && document.visibilityState !== 'hidden') refreshLiveOverview();
      }, REFRESH_MS);
    }

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && overviewActive()) refreshLiveOverview();
    });

    refreshLiveOverview();
  }

  window.PADDOX_refreshAdminOverview = refreshLiveOverview;
  window.PADDOX_ADMIN_OVERVIEW_STATE = state;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindOverviewRuntime, { once:true });
  } else {
    bindOverviewRuntime();
  }
})();
