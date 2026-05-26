/* ============================================================
   PADDOX — receipt.js | Demo payment order receipt
   ============================================================ */
'use strict';

const RECEIPT_ORDER_API = 'https://paddox-backend.onrender.com/api/orders';

function receiptToken() {
  return (
    localStorage.getItem('token') ||
    localStorage.getItem('paddox_access_token') ||
    localStorage.getItem('accessToken') ||
    ''
  );
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 3000);
}

function money(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

function esc(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function orderIdFromUrl() {
  return new URLSearchParams(window.location.search).get('orderId') || '';
}

async function loadReceipt() {
  const card = document.getElementById('receipt-card');
  const actions = document.getElementById('receipt-actions');
  const orderId = orderIdFromUrl();
  const token = receiptToken();

  if (!orderId) {
    card.innerHTML = `<div class="receipt-loading"><p>Order id missing.</p></div>`;
    return;
  }

  if (!token) {
    showToast('Please login to view receipt');
    setTimeout(() => window.location.href = 'account.html', 900);
    return;
  }

  try {
    const res = await fetch(`${RECEIPT_ORDER_API}/${encodeURIComponent(orderId)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || data.success === false) {
      throw new Error(data.message || 'Receipt could not be loaded');
    }

    const order = data.data?.order || data.order;
    if (!order) throw new Error('Order not found');

    renderReceipt(order);
    if (actions) actions.style.display = 'flex';
  } catch (err) {
    console.error(err);
    card.innerHTML = `<div class="receipt-loading"><p>${esc(err.message)}</p></div>`;
  }
}

function renderReceipt(order) {
  const card = document.getElementById('receipt-card');
  const address = order.shippingAddress || {};
  const payment = order.payment || {};
  const pricing = order.pricing || {};
  const status = String(payment.status || 'pending').toLowerCase();
  const isDemo = String(payment.method || '').toLowerCase() === 'demo';
  const paymentLabel = isDemo && status === 'paid' ? 'Demo Paid' : status === 'paid' ? 'Paid' : status === 'failed' ? 'Failed' : status === 'refunded' ? 'Refunded' : 'Pending';

  const itemsHtml = (order.items || []).map(item => {
    const meta = [
      `Qty: ${item.quantity || 1}`,
      item.size ? `Size: ${esc(item.size)}` : '',
      item.color ? `Color: ${esc(item.color)}` : ''
    ].filter(Boolean).join(' · ');

    return `
      <div class="receipt-item">
        <div class="receipt-img">
          ${item.image ? `<img src="${esc(item.image)}" alt="${esc(item.name)}">` : '🏁'}
        </div>
        <div>
          <div class="receipt-item-name">${esc(item.name)}</div>
          <div class="receipt-item-meta">${meta}</div>
        </div>
        <div class="receipt-item-price">${money(Number(item.price || 0) * Number(item.quantity || 1))}</div>
      </div>
    `;
  }).join('');

  card.innerHTML = `
    <div class="receipt-top">
      <div>
        <div class="receipt-title">ORDER RECEIPT</div>
        <div class="receipt-sub">
          Receipt for order <strong>#${esc(order.orderNumber || order._id)}</strong><br>
          ${order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN') : ''}
        </div>
      </div>
      <div class="receipt-status ${status}">
        <span>Payment Status</span>
        <strong>${paymentLabel}</strong>
        ${isDemo ? '<em>Demo checkout</em>' : ''}
      </div>
    </div>

    <div class="receipt-grid">
      <div class="receipt-box">
        <h3>ORDER DETAILS</h3>
        <div class="receipt-line"><span>Order ID</span><strong>#${esc(order.orderNumber || order._id)}</strong></div>
        <div class="receipt-line"><span>Order Status</span><strong>${esc(order.status || 'placed')}</strong></div>
        <div class="receipt-line"><span>Payment Method</span><strong>${isDemo ? 'Demo Payment' : esc(payment.method || '-')}</strong></div>
        <div class="receipt-line"><span>Payment Reference</span><strong>${esc(payment.razorpayPaymentId || '-')}</strong></div>
        <div class="receipt-line"><span>Confirmed At</span><strong>${payment.paidAt ? new Date(payment.paidAt).toLocaleString('en-IN') : '-'}</strong></div>
      </div>

      <div class="receipt-box">
        <h3>DELIVERY DETAILS</h3>
        <div class="receipt-address">
          <strong>${esc(address.name || '')}</strong><br>
          ${esc(address.line1 || '')}${address.line2 ? `<br>${esc(address.line2)}` : ''}<br>
          ${esc(address.city || '')}, ${esc(address.state || '')} - ${esc(address.pincode || '')}<br>
          ${esc(address.country || '')}<br>
          Phone: ${esc(address.phone || '')}
        </div>
      </div>
    </div>

    <div class="receipt-items">
      ${itemsHtml || '<div class="receipt-item"><div>No items found</div></div>'}
    </div>

    <div class="receipt-total-box">
      <div class="receipt-total-row"><span>Subtotal</span><strong>${money(pricing.subtotal)}</strong></div>
      <div class="receipt-total-row"><span>Shipping</span><strong>${money(pricing.shipping)}</strong></div>
      <div class="receipt-total-row"><span>Discount</span><strong>${money(pricing.discount)}</strong></div>
      <div class="receipt-total-row"><span>Tax</span><strong>${money(pricing.tax)}</strong></div>
      <div class="receipt-total-row receipt-grand"><span>Total</span><strong>${money(pricing.total)}</strong></div>
    </div>
  `;
}

document.getElementById('print-receipt')?.addEventListener('click', () => window.print());

loadReceipt();
