/* ============================================================
   PADDOX Frontend — API Configuration
   Phase 7: Authentication via HttpOnly cookies only.
   Access and refresh tokens are never stored in localStorage
   or sessionStorage. All requests use credentials:'include'.
   ============================================================ */
const API_BASE = '/api';
const SOCKET_URL = 'https://paddox-backend.onrender.com';

/*
 * Production requests use Vercel's same-origin /api rewrite. This keeps the
 * HttpOnly session cookies first-party while Render remains the API host.
 */

let memoryAccessToken = '';

const TokenManager = {
  getAccess: () => memoryAccessToken,
  setAccess: (token = '') => { memoryAccessToken = String(token || ''); },
  clearAccess: () => { memoryAccessToken = ''; },
};

window.TokenManager = TokenManager;

const responseJson = async (res) => res.json().catch(() => ({
  success: false,
  message: `Request failed with status ${res.status}`,
}));

const captureAccessToken = (payload = {}) => {
  const token = payload?.data?.accessToken || payload?.accessToken || '';
  if (token) TokenManager.setAccess(token);
  return payload;
};

/* 🏆 Base API Request 🏆 */
const apiRequest = async (endpoint, options = {}) => {
  const config = {
    ...options,
    credentials: 'include',   // Always include cookies - no localStorage token
    headers: {
      'Content-Type': 'application/json',
      ...(TokenManager.getAccess() ? { Authorization: `Bearer ${TokenManager.getAccess()}` } : {}),
      ...options.headers,
    },
  };
  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }
  const res = await fetch(`${API_BASE}${endpoint}`, config);

  if (res.status !== 401) {
    return captureAccessToken(await responseJson(res));
  }

  /* Auto-refresh on 401 — backend sets new accessToken cookie via /auth/refresh */
  if (!endpoint.includes('/auth/refresh')) {
    const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST', credentials: 'include',
    });
    if (refreshRes.ok) {
      const refreshed = captureAccessToken(await responseJson(refreshRes));
      const retryConfig = {
        ...config,
        headers: {
          ...config.headers,
          ...(TokenManager.getAccess() ? { Authorization: `Bearer ${TokenManager.getAccess()}` } : {}),
        },
      };
      const retryRes = await fetch(`${API_BASE}${endpoint}`, retryConfig);
      return captureAccessToken(await responseJson(retryRes));
    }

    TokenManager.clearAccess();
    const expired = await responseJson(res);
    const onAccountPage = /\/account(?:\.html)?$/.test(window.location.pathname);
    if (!onAccountPage) window.location.assign('/account.html');
    return expired;
  }

  return responseJson(res);
};

/* ── Auth API ── */
const AuthAPI = {
  register : (data)  => apiRequest('/auth/register', { method:'POST', body:data }),
  login    : (data)  => apiRequest('/auth/login',    { method:'POST', body:data }),
  logout   : ()      => apiRequest('/auth/logout',   { method:'POST' }),
  getMe    : ()      => apiRequest('/auth/me'),
  refresh  : ()      => apiRequest('/auth/refresh',  { method:'POST' }),
};

/* ── Products API ── */
const ProductAPI = {
  getAll   : (params={}) => apiRequest(`/products?${new URLSearchParams(params)}`),
  getOne   : (id)        => apiRequest(`/products/${id}`),
  search   : (q)         => apiRequest(`/products?search=${encodeURIComponent(q)}`),
  addReview: (id, data)  => apiRequest(`/products/${id}/review`, { method:'POST', body:data }),
  getReviews:(id)        => apiRequest(`/products/${id}/reviews`),
};

/* ── Orders API ── */
const OrderAPI = {
  place     : (data) => apiRequest('/orders',        { method:'POST', body:data }),
  getAll    : ()     => apiRequest('/orders'),
  getOne    : (id)   => apiRequest(`/orders/${id}`),
  track     : (id)   => apiRequest(`/orders/${id}/track`),
  cancel    : (id, reason) => apiRequest(`/orders/${id}/cancel`, { method:'PUT', body:{ reason } }),
};

/* ── Cart API ── */
const CartAPI = {
  get     : ()                        => apiRequest('/cart'),
  add     : (productId, qty, size)    => apiRequest('/cart/add',   { method:'POST', body:{ productId, quantity:qty, size } }),
  update  : (productId, qty, size)    => apiRequest('/cart/update',{ method:'PUT',  body:{ productId, quantity:qty, size } }),
  remove  : (productId)               => apiRequest(`/cart/remove/${productId}`, { method:'DELETE' }),
  clear   : ()                        => apiRequest('/cart/clear', { method:'DELETE' }),
};

/* ── Wishlist API ── */
const WishlistAPI = {
  get    : ()   => apiRequest('/wishlist'),
  add    : (id) => apiRequest(`/wishlist/add/${id}`,    { method:'POST' }),
  remove : (id) => apiRequest(`/wishlist/remove/${id}`, { method:'DELETE' }),
};

/* ── Payments API ── */
const PaymentAPI = {
  createOrder : (orderId) => apiRequest('/payments/create-order', { method:'POST', body:{ orderId } }),
  verify      : (data)    => apiRequest('/payments/verify',       { method:'POST', body:data }),
  history     : ()        => apiRequest('/payments/history'),
};

/* ── F1 API ── */
const F1API = {
  nextRace     : ()       => apiRequest('/f1/next-race'),
  schedule     : ()       => apiRequest('/f1/schedule'),
  driverStands : ()       => apiRequest('/f1/standings/drivers'),
  consStands   : ()       => apiRequest('/f1/standings/constructors'),
  drivers      : ()       => apiRequest('/f1/drivers/all'),
  lastResult   : ()       => apiRequest('/f1/last-result'),
  liveSession  : ()       => apiRequest('/f1/live'),
};

/* ── Assets API ── */
const AssetAPI = {
  getAll    : (params={}) => apiRequest(`/assets?${new URLSearchParams(params)}`),
  download  : (id)        => apiRequest(`/assets/${id}/download`, { method:'POST' }),
};

/* ── Fan API ── */
const FanAPI = {
  getPoll       : ()          => apiRequest('/fan/poll'),
  vote          : (pollId, optionIndex) => apiRequest('/fan/poll/vote', { method:'POST', body:{ pollId, optionIndex } }),
  leaderboard   : ()          => apiRequest('/fan/leaderboard'),
  getTrivia     : ()          => apiRequest('/fan/trivia'),
  answerTrivia  : (triviaId, answerIndex) => apiRequest('/fan/trivia/answer', { method:'POST', body:{ triviaId, answerIndex } }),
  getFeed       : ()          => apiRequest('/fan/feed'),
  postFeed      : (text)      => apiRequest('/fan/feed', { method:'POST', body:{ text } }),
  likePost      : (postId)    => apiRequest(`/fan/feed/${postId}/like`, { method:'POST' }),
  commentPost   : (postId, text) => apiRequest(`/fan/feed/${postId}/comments`, { method:'POST', body:{ text } }),
  marqueeLogos  : ()          => apiRequest('/fan/home-marquee-logos'),
};

/* ── User API ── */
const UserAPI = {
  getProfile        : ()     => apiRequest('/users/profile'),
  updateProfile     : (data) => apiRequest('/users/profile',       { method:'PUT', body:data }),
  updatePrefs       : (data) => apiRequest('/users/preferences',   { method:'PUT', body:data }),
  updateNotifs      : (data) => apiRequest('/users/notifications', { method:'PUT', body:data }),
  getFanPoints      : ()     => apiRequest('/users/fan-points'),
  getDownloads      : ()     => apiRequest('/users/downloads'),
};

/* ── Collectibles API ── */
const CollectibleAPI = {
  getCatalogue  : ()     => apiRequest('/collectibles'),
  getOne        : (slug) => apiRequest(`/collectibles/${slug}`),
  getMyCollection: ()    => apiRequest('/collectibles/me'),
  getMyItem     : (id)   => apiRequest(`/collectibles/me/${id}`),
  toggleSharing : (id, shareEnabled) => apiRequest(`/collectibles/me/${id}/sharing`, { method:'PATCH', body:{ shareEnabled } }),
  verifyCertificate: (publicCertificateId, fingerprint) =>
    apiRequest(`/collectibles/verify/${publicCertificateId}${fingerprint ? `?fingerprint=${encodeURIComponent(fingerprint)}` : ''}`),
};

/* ── WebSocket Connection ── */
const connectSocket = () => {
  if (typeof io === 'undefined') return null;
  /* Phase 7: No token passed in socket auth — relies on credentialed cookie session */
  const socket = io(SOCKET_URL, {
    withCredentials: true,
    transports : ['websocket','polling'],
  });
  socket.on('connect',    () => console.log('🔌 Socket connected'));
  socket.on('disconnect', () => console.log('🔌 Socket disconnected'));
  socket.on('connect_error', e => console.warn('Socket error:', e.message));
  return socket;
};

/* ── Razorpay Payment Flow ── */
const initRazorpayPayment = async (orderId, userInfo, onSuccess, onError) => {
  try {
    const data = await PaymentAPI.createOrder(orderId);
    if (!data.success) return onError(data.message);

    const options = {
      key          : data.data.keyId,
      amount       : data.data.amount,
      currency     : data.data.currency,
      name         : 'Paddox F1',
      description  : `Order #${data.data.orderNumber}`,
      image        : '/assets/paddox-logo.png',
      order_id     : data.data.razorpayOrderId,
      prefill      : { name:userInfo.name, email:userInfo.email, contact:userInfo.phone || '' },
      theme        : { color:'#e8002d' },
      handler      : async (response) => {
        const verify = await PaymentAPI.verify({ ...response, orderId });
        if (verify.success) onSuccess(verify.data);
        else onError(verify.message);
      },
    };
    if (typeof Razorpay === 'undefined') {
      return onError('Razorpay SDK not loaded. Add script to HTML.');
    }
    new Razorpay(options).open();
  } catch (err) {
    onError(err.message);
  }
};

/*
 * MIGRATION: Purge all legacy auth tokens from localStorage on first load.
 * Authentication is now handled exclusively via HttpOnly cookies.
 */
(function migrateTokenStorage() {
  if (typeof localStorage !== 'undefined') {
    const authKeys = ['token', 'paddox_access_token', 'accessToken'];
    authKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.info(`[PADDOX] Removed legacy "${key}" from localStorage.`);
      }
    });
  }
})();

/* Export all APIs */
window.PaddoxAPI = {
  auth: AuthAPI, product: ProductAPI, order: OrderAPI,
  cart: CartAPI, wishlist: WishlistAPI, payment: PaymentAPI,
  f1: F1API, asset: AssetAPI, fan: FanAPI, user: UserAPI,
  collectible: CollectibleAPI,
  connectSocket,
};

console.log('🏎️ Paddox API client loaded (cookie-auth mode)');
