/* ============================================================
   PADDOX Frontend — API Configuration
   ============================================================ */
const API_BASE = 'https://paddox-backend.onrender.com/api';
const SOCKET_URL = 'https://paddox-backend.onrender.com';

/* ── Token Management ── */
const TokenManager = {
  getAccess  : ()      => localStorage.getItem('paddox_access_token'),
  setAccess  : (token) => localStorage.setItem('paddox_access_token', token),
  clearAccess: ()      => localStorage.removeItem('paddox_access_token'),
};

/* ── Base API Request ── */
const apiRequest = async (endpoint, options = {}) => {
  const token = TokenManager.getAccess();
  const config = {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };
  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }
  const res = await fetch(`${API_BASE}${endpoint}`, config);

  /* Auto-refresh token on 401 */
  if (res.status === 401 && !endpoint.includes('/auth/refresh')) {
    const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST', credentials: 'include',
    });
    if (refreshRes.ok) {
      const data = await refreshRes.json();
      TokenManager.setAccess(data.data.accessToken);
      config.headers.Authorization = `Bearer ${data.data.accessToken}`;
      return fetch(`${API_BASE}${endpoint}`, config).then(r => r.json());
    } else {
      TokenManager.clearAccess();
      window.location.href = '/account.html';
      return;
    }
  }
  return res.json();
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

/* ── WebSocket Connection ── */
const connectSocket = () => {
  if (typeof io === 'undefined') return null;
  const token = TokenManager.getAccess();
  const socket = io(SOCKET_URL, {
    auth       : { token },
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

/* Export all APIs */
window.PaddoxAPI = {
  auth: AuthAPI, product: ProductAPI, order: OrderAPI,
  cart: CartAPI, wishlist: WishlistAPI, payment: PaymentAPI,
  f1: F1API, asset: AssetAPI, fan: FanAPI, user: UserAPI,
  connectSocket, TokenManager,
};

console.log('🏎️ Paddox API client loaded');