/* ============================================================
   PADDOX ADMIN — Authenticated Fetch Bridge
   Keeps all legacy Admin requests on the same HttpOnly-cookie session flow.
   If an Admin API call gets 401, refresh once and retry all waiting requests.
   ============================================================ */
(function paddoxAdminAuthenticatedFetch(){
  'use strict';

  if (window.__PADDOX_ADMIN_FETCH_BRIDGE__) return;
  window.__PADDOX_ADMIN_FETCH_BRIDGE__ = true;

  const nativeFetch = window.fetch.bind(window);
  let refreshPromise = null;

  function apiUrl(input){
    try {
      if (input instanceof Request) return new URL(input.url, window.location.origin);
      return new URL(String(input), window.location.origin);
    } catch (_) {
      return null;
    }
  }

  function isSameOriginApi(url){
    return !!url && url.origin === window.location.origin && url.pathname.startsWith('/api/');
  }

  function isRefreshRequest(url){
    return !!url && url.pathname === '/api/auth/refresh';
  }

  async function refreshSessionOnce(){
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
      try {
        const response = await nativeFetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
          cache: 'no-store',
          headers: { Accept: 'application/json' }
        });

        if (!response.ok) return false;

        const payload = await response.clone().json().catch(() => ({}));
        const accessToken = payload?.data?.accessToken || payload?.accessToken || '';
        try {
          if (accessToken && window.TokenManager?.setAccess) {
            window.TokenManager.setAccess(accessToken);
          }
        } catch (_) {}

        return true;
      } catch (error) {
        console.warn('PADDOX Admin session refresh failed:', error?.message || error);
        return false;
      } finally {
        window.setTimeout(() => { refreshPromise = null; }, 0);
      }
    })();

    return refreshPromise;
  }

  window.fetch = async function paddoxAdminFetch(input, init){
    const url = apiUrl(input);
    const sameOriginApi = isSameOriginApi(url);

    let retryInput = input;
    try {
      if (input instanceof Request) retryInput = input.clone();
    } catch (_) {}

    const requestInit = sameOriginApi
      ? { ...(init || {}), credentials: 'include' }
      : init;

    let response = await nativeFetch(input, requestInit);

    if (
      response.status !== 401 ||
      !sameOriginApi ||
      isRefreshRequest(url)
    ) {
      return response;
    }

    const refreshed = await refreshSessionOnce();
    if (!refreshed) return response;

    try {
      return await nativeFetch(retryInput, requestInit);
    } catch (error) {
      console.warn('PADDOX Admin request retry failed:', url?.pathname || '', error?.message || error);
      return response;
    }
  };
})();
