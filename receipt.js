/* ============================================================
   PADDOX — receipt.js | Phase 18.0.1 professional receipt
   ============================================================ */
'use strict';
console.log('PADDOX Phase 18.0.12 centered receipt icon loaded');

const RECEIPT_ORDER_API = '/api/orders';
const BRAND_LOGO_PATH = 'assets/paddox-logo-lockup-receipt-clean.png?v=18_0_13';
const BRAND_ICON_PATH = 'assets/paddox-logo-icon-official.png?v=18_0_14';

function receiptToken() {
  return (
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

function paymentMethodLabel(method = '') {
  const key = String(method || '').toLowerCase();
  const labels = {
    upi: 'UPI',
    card: 'Credit / Debit Card',
    netbanking: 'Net Banking',
    wallet: 'Wallet',
    cod: 'Cash on Delivery',
    razorpay: 'Online Payment'
  };
  return labels[key] || (method ? String(method).toUpperCase() : '-');
}

function paymentStatusLabel(status = '') {
  const key = String(status || 'pending').toLowerCase();
  const labels = { paid: 'Paid', pending: 'Pending', failed: 'Failed', refunded: 'Refunded' };
  return labels[key] || 'Pending';
}

function paymentReference(payment = {}) {
  return payment.razorpayPaymentId || payment.transactionId || payment.reference || '-';
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString('en-IN', {
    day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'
  });
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
    const res = await fetch(`${RECEIPT_ORDER_API}/${encodeURIComponent(orderId)}`, { credentials: 'include',
      headers: { }
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || data.success === false) {
      throw new Error(data.message || 'Receipt could not be loaded');
    }

    const order = data.data?.order || data.data || data.order;
    if (!order) throw new Error('Order not found');

    renderReceipt(order);
    if (actions) {
      const items = Array.isArray(order.items) ? order.items : [];
      const isDigitalOrder = order.orderType === 'digital' || items.some(item => item.itemType === 'digital' || item.asset || item.downloadUrl);
      const primaryLink = actions.querySelector('a[href="account.html"]');
      const secondaryLink = actions.querySelector('a[href="shop.html"]');

      if (primaryLink) {
        primaryLink.href = isDigitalOrder ? 'account.html#downloads' : 'account.html#orders';
        primaryLink.textContent = isDigitalOrder ? 'My Downloads' : 'My Orders';
      }

      if (secondaryLink) {
        secondaryLink.href = isDigitalOrder ? 'fanhub.html' : 'shop.html';
        secondaryLink.textContent = isDigitalOrder ? 'Fan Hub' : 'Shop';
      }

      actions.style.display = 'flex';
    }
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
  const coupon = order.coupon || {};
  const couponCode = coupon.code || order.couponCode || '';
  const couponDiscount = Number(coupon.discount || pricing.discount || 0);
  const status = String(payment.status || order.paymentStatus || 'pending').toLowerCase();
  const paymentLabel = paymentStatusLabel(status);
  const methodLabel = paymentMethodLabel(payment.method || order.paymentMethod);
  const createdAt = formatDate(order.createdAt);
  const paidAt = formatDate(payment.paidAt || order.paidAt || order.createdAt);
  const orderNo = order.orderNumber || order._id || order.id || order.orderId;
  const items = Array.isArray(order.items) ? order.items : [];
  const isDigitalOrder = order.orderType === 'digital' || items.some(item => item.itemType === 'digital' || item.asset || item.downloadUrl);

  const effectiveItemsSubtotal = items.reduce((sum, item) => {
    const qty = Number(item.quantity || 1);
    const price = Number(item.price || item.salePrice || 0);
    return sum + price * qty;
  }, 0);

  const originalItemsSubtotal = items.reduce((sum, item) => {
    const qty = Number(item.quantity || 1);
    const price = Number(item.price || item.salePrice || 0);
    const productOriginal = Number(item.originalPrice || item.product?.price || price || 0);
    return sum + Math.max(productOriginal, price) * qty;
  }, 0);

  const productDiscount = Number(
    pricing.productDiscount ??
    Math.max(0, originalItemsSubtotal - effectiveItemsSubtotal)
  );
  const subtotalDisplay = Number(
    pricing.productDiscount !== undefined || productDiscount > 0
      ? Math.max(Number(pricing.subtotal || 0), originalItemsSubtotal)
      : Number(pricing.subtotal || originalItemsSubtotal || effectiveItemsSubtotal || 0)
  );

  const itemsHtml = items.map(item => {
    const qty = Number(item.quantity || 1);
    const price = Number(item.price || item.salePrice || 0);
    const originalPrice = Math.max(Number(item.originalPrice || item.product?.price || price), price);
    const itemSaved = Math.max(0, originalPrice - price) * qty;
    const meta = [
      item.size ? `Size: ${esc(item.size)}` : '',
      item.color ? `Color: ${esc(item.color)}` : '',
      item.format ? `Format: ${esc(String(item.format).toUpperCase())}` : '',
      item.itemType === 'digital' ? 'Digital wallpaper unlock' : '',
      itemSaved ? `Product discount: ${money(itemSaved)}` : ''
    ].filter(Boolean).join(' · ') || (isDigitalOrder ? 'Digital wallpaper' : 'Standard item');
    const img = item.image || item.asset?.thumbnail?.url || item.asset?.image?.url || item.asset?.desktop?.url || item.product?.images?.[0]?.url || item.product?.image || '';

    return `
      <div class="receipt-item">
        <div class="receipt-thumb">
          ${img ? `<img src="${esc(img)}" alt="${esc(item.name || 'Product')}" onerror="this.remove();this.parentElement.classList.add('empty')">` : '<span>PX</span>'}
        </div>
        <div class="receipt-item-info">
          <strong>${esc(item.name || item.product?.name || 'Product')}</strong>
          <span>${meta}</span>
        </div>
        <div class="receipt-qty">${qty}</div>
        <div class="receipt-price">${money(price * qty)}</div>
      </div>
    `;
  }).join('');

  card.innerHTML = `
    <div class="receipt-top-rule"></div>

    <header class="receipt-head">
      <div class="receipt-brand receipt-brand-system">
        <div class="receipt-logo-row" aria-label="PADDOX brand">
          <img src="${BRAND_ICON_PATH}" alt="PADDOX icon" class="receipt-logo-icon-clean">
          <div class="receipt-logo-word">PADDO<span>X</span></div>
        </div>
        <p>Premium motorsport merchandise<br>Official order payment receipt</p>
      </div>
      <div class="receipt-title-wrap">
        <div class="receipt-kicker">OFFICIAL RECEIPT</div>
        <h1>ORDER RECEIPT</h1>
        <div class="receipt-number">#${esc(orderNo)}</div>
      </div>
    </header>

    <section class="receipt-summary">
      <div class="receipt-chip ${status}">
        <span>Payment Status</span>
        <strong>${esc(paymentLabel)}</strong>
        <em>${esc(methodLabel)}</em>
      </div>
      <div class="receipt-small-line"><span>Issued</span><strong>${esc(createdAt)}</strong></div>
      <div class="receipt-small-line"><span>Payment Date</span><strong>${esc(paidAt)}</strong></div>
      <div class="receipt-small-line"><span>Transaction ID</span><strong>${esc(paymentReference(payment))}</strong></div>
    </section>

    <section class="receipt-two-col">
      <div class="receipt-box">
        <h3>ORDER DETAILS</h3>
        <div class="receipt-line"><span>Order ID</span><strong>#${esc(orderNo)}</strong></div>
        <div class="receipt-line"><span>Order Status</span><strong>${esc(order.status || 'placed')}</strong></div>
        <div class="receipt-line"><span>Payment Method</span><strong>${esc(methodLabel)}</strong></div>
        ${couponCode ? `<div class="receipt-line receipt-coupon-line"><span>Coupon Used</span><strong>${esc(couponCode)}</strong></div>` : ''}
      </div>
      <div class="receipt-box">
        <h3>${isDigitalOrder ? 'DIGITAL DELIVERY' : 'DELIVERY DETAILS'}</h3>
        <address>
          ${isDigitalOrder ? `
            <strong>${esc(address.name || '-')}</strong><br>
            Premium wallpaper unlocked in your PADDOX account.<br>
            Re-download anytime from Account → Downloads.<br>
            Receipt copy has been sent to your email.
          ` : `
            <strong>${esc(address.name || '-')}</strong><br>
            ${esc(address.line1 || address.address || '-')} ${address.line2 ? `<br>${esc(address.line2)}` : ''}<br>
            ${esc([address.city, address.state, address.pincode].filter(Boolean).join(', ') || '-')}<br>
            ${esc(address.country || 'India')}<br>
            Phone: ${esc(address.phone || '-')}
          `}
        </address>
      </div>
    </section>

    <section class="receipt-items">
      <div class="receipt-items-head">
        <span></span><span>Item</span><span>Qty</span><span>Amount</span>
      </div>
      ${itemsHtml || '<div class="receipt-item"><div></div><div>No items found</div><div></div><div></div></div>'}
    </section>

    <section class="receipt-bottom">
      <div class="receipt-note">
        <strong>Thank you for shopping with PADDOX.</strong>
        <span>${isDigitalOrder ? 'Your wallpaper is available in Account → Downloads.' : 'This is a system-generated receipt. Keep it for order tracking and support.'}</span>
      </div>
      <div class="receipt-total-box">
        <div><span>Subtotal</span><strong>${money(subtotalDisplay)}</strong></div>
        ${productDiscount ? `<div><span>Product Discount</span><strong>-${money(productDiscount)}</strong></div>` : ''}
        <div><span>Shipping</span><strong>${money(pricing.shipping)}</strong></div>
        ${couponDiscount ? `<div class="receipt-coupon-total"><span>Coupon Discount${couponCode ? ` · ${esc(couponCode)}` : ''}</span><strong>-${money(couponDiscount)}</strong></div>` : ''}
        <div><span>Tax</span><strong>${money(pricing.tax)}</strong></div>
        <div class="grand"><span>${status === 'paid' ? 'Total Paid' : 'Order Total'}</span><strong>${money(pricing.total)}</strong></div>
      </div>
    </section>

    <footer class="receipt-footer">
      <span>PADDOX • Premium Motorsport Store</span>
      <span>Generated on ${esc(createdAt)}</span>
    </footer>
  `;
}

document.getElementById('print-receipt')?.addEventListener('click', () => setTimeout(() => window.print(), 80));

loadReceipt();
