/* ============================================================
   PADDOX Fan Hub — LIVE GRID CHAT CLIENT
   Realtime room + persistent history + replies + reactions.
   ============================================================ */
(function initPaddoxLiveGridChat(){
  'use strict';

  const API = '/api/fan/chat';
  const SOCKET_URL = 'https://paddox-backend.onrender.com';
  const REACTIONS = ['❤️','🔥','😂','🏁','👍'];

  const state = {
    user:null,
    socket:null,
    messages:[],
    hasMore:false,
    before:null,
    replyTo:null,
    typingUsers:new Map(),
    typingTimer:0,
    isTyping:false,
    loading:false,
    unread:0,
  };

  const el = id => document.getElementById(id);
  const escapeHTML = value => String(value ?? '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#039;');

  function initials(name = 'PX') {
    return String(name || 'PX').split(/\s+/).filter(Boolean).map(x => x[0]).slice(0,2).join('').toUpperCase() || 'PX';
  }

  function timeLabel(value) {
    const date = new Date(value || Date.now());
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
    }
    return date.toLocaleDateString([], { day:'2-digit', month:'short' }) + ' · ' + date.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
  }

  function avatarHTML(user = {}, className = 'pdx-chat-avatar') {
    const name = user.name || 'PADDOX Fan';
    const image = String(user.avatar || '');
    if (/^https?:\/\//i.test(image) || image.startsWith('data:image/')) {
      return `<div class="${className}"><img src="${escapeHTML(image)}" alt="${escapeHTML(name)}" loading="lazy" onerror="this.outerHTML='${initials(name)}'"></div>`;
    }
    return `<div class="${className}">${escapeHTML(initials(name))}</div>`;
  }

  function currentUserId() {
    return String(state.user?.id || state.user?._id || '');
  }

  function isOwn(message) {
    return !!currentUserId() && String(message?.user?.id || '') === currentUserId();
  }

  function canDelete(message) {
    return !!state.user && (isOwn(message) || state.user.role === 'admin' || message.canDelete);
  }

  async function request(path = '', options = {}) {
    const res = await fetch(`${API}${path}`, {
      credentials:'include',
      ...options,
      headers:{
        ...(options.body ? { 'Content-Type':'application/json' } : {}),
        ...(window.TokenManager?.getAccess?.() ? { Authorization:`Bearer ${window.TokenManager.getAccess()}` } : {}),
        ...(options.headers || {})
      }
    });
    const data = await res.json().catch(() => ({ success:false, message:`Request failed (${res.status})` }));
    if (!res.ok || data.success === false) {
      const error = new Error(data.message || 'Chat request failed');
      error.status = res.status;
      throw error;
    }
    return data;
  }

  async function resolveCurrentUser() {
    try {
      const res = await fetch('/api/users/profile', { credentials:'include' });
      if (!res.ok) return null;
      const payload = await res.json().catch(() => ({}));
      const user = payload?.data?.user || payload?.data || payload?.user || null;
      if (!user) return null;

      if (!window.TokenManager?.getAccess?.()) {
        const refresh = await fetch('/api/auth/refresh', { method:'POST', credentials:'include' });
        if (refresh.ok) {
          const refreshed = await refresh.json().catch(() => ({}));
          const token = refreshed?.data?.accessToken || refreshed?.accessToken || '';
          if (token) window.TokenManager?.setAccess?.(token);
        }
      }

      return {
        id:String(user.id || user._id || ''),
        name:`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || 'PADDOX Fan',
        avatar:user.avatar?.url || user.avatar || '',
        fanTier:user.fanTier || 'Regular',
        role:user.role || 'user'
      };
    } catch {
      return null;
    }
  }

  function renderIdentity() {
    const wrap = el('pdx-chat-identity');
    if (!wrap) return;
    if (!state.user) {
      wrap.innerHTML = `
        <div class="pdx-chat-identity-av">PX</div>
        <div><div class="pdx-chat-identity-name">Guest Viewer</div><div class="pdx-chat-identity-tier">Sign in to chat</div></div>`;
      return;
    }
    wrap.innerHTML = `
      ${avatarHTML(state.user, 'pdx-chat-identity-av')}
      <div><div class="pdx-chat-identity-name">${escapeHTML(state.user.name)}</div><div class="pdx-chat-identity-tier">${escapeHTML(state.user.fanTier)}</div></div>`;
  }

  function renderComposerState() {
    const input = el('pdx-chat-input');
    const send = el('pdx-chat-send');
    const note = el('pdx-chat-login-note');
    if (!input || !send) return;

    if (!state.user) {
      input.disabled = true;
      send.disabled = true;
      input.placeholder = 'Sign in to join the PADDOX grid chat…';
      if (note) note.innerHTML = `Viewing is public. <a href="account.html">Sign in</a> to message, reply and react.`;
    } else {
      input.disabled = false;
      send.disabled = !input.value.trim();
      input.placeholder = 'Message the PADDOX grid…';
      if (note) note.textContent = 'Enter to send · Shift+Enter for a new line';
    }
  }

  function replyHTML(reply) {
    if (!reply) return '';
    return `<div class="pdx-chat-reply-block"><strong>↳ ${escapeHTML(reply.user?.name || 'PADDOX Fan')}</strong>${escapeHTML(reply.text || 'Message deleted')}</div>`;
  }

  function reactionHTML(message) {
    const byEmoji = new Map((message.reactions || []).map(item => [item.emoji,item]));
    return REACTIONS.map(emoji => {
      const item = byEmoji.get(emoji);
      if (!item?.count) return '';
      return `<button class="pdx-chat-reaction ${item.reactedByMe ? 'on' : ''}" type="button" data-chat-react="${escapeHTML(emoji)}" data-message-id="${escapeHTML(message.id)}">${emoji}<span>${Number(item.count || 0)}</span></button>`;
    }).join('');
  }

  function messageHTML(message) {
    const own = isOwn(message);
    const deleted = !!message.isDeleted;
    const user = message.user || {};
    return `
      <article class="pdx-chat-message ${own ? 'is-own' : ''} ${deleted ? 'deleted' : ''}" data-chat-message-id="${escapeHTML(message.id)}">
        ${avatarHTML(user)}
        <div class="pdx-chat-bubble">
          <div class="pdx-chat-meta">
            <span class="pdx-chat-user">${escapeHTML(user.name || 'PADDOX Fan')}</span>
            <span class="pdx-chat-tier">${escapeHTML(user.fanTier || 'Regular')}</span>
            <span class="pdx-chat-time">${escapeHTML(timeLabel(message.createdAt))}</span>
          </div>
          ${replyHTML(message.replyTo)}
          <div class="pdx-chat-text">${deleted ? 'Message deleted' : escapeHTML(message.text || '')}</div>
          ${deleted ? '' : `<div class="pdx-chat-actions">
            ${reactionHTML(message)}
            <button class="pdx-chat-action" type="button" data-chat-reply="${escapeHTML(message.id)}">Reply</button>
            <button class="pdx-chat-action" type="button" data-chat-quick-react="${escapeHTML(message.id)}">React</button>
            ${canDelete(message) ? `<button class="pdx-chat-action" type="button" data-chat-delete="${escapeHTML(message.id)}">Delete</button>` : ''}
            ${!own && state.user ? `<button class="pdx-chat-action" type="button" data-chat-report="${escapeHTML(message.id)}">Report</button>` : ''}
          </div>`}
        </div>
      </article>`;
  }

  function isNearBottom() {
    const box = el('pdx-chat-messages');
    if (!box) return true;
    return box.scrollHeight - box.scrollTop - box.clientHeight < 90;
  }

  function scrollToBottom(smooth = false) {
    const box = el('pdx-chat-messages');
    if (!box) return;
    box.scrollTo({ top:box.scrollHeight, behavior:smooth ? 'smooth' : 'auto' });
    state.unread = 0;
    renderUnread();
  }

  function renderUnread() {
    const button = el('pdx-chat-new-pill');
    if (!button) return;
    button.textContent = state.unread ? `${state.unread} new message${state.unread === 1 ? '' : 's'} ↓` : 'New messages ↓';
    button.classList.toggle('show', state.unread > 0);
  }

  function renderMessages({ preserveScroll = false } = {}) {
    const box = el('pdx-chat-messages');
    if (!box) return;
    const previousHeight = box.scrollHeight;
    const previousTop = box.scrollTop;

    if (!state.messages.length) {
      box.innerHTML = `
        <div class="pdx-chat-empty"><div class="pdx-chat-empty-inner">
          <div class="pdx-chat-empty-mark"><span class="fh-ico-chat"></span></div>
          <h3>The grid is quiet</h3>
          <p>Be the first fan to open the radio. Race talk, reactions and paddock opinions all live here.</p>
        </div></div>`;
      return;
    }

    const loadMore = state.hasMore ? `<button class="pdx-chat-load-more" type="button" id="pdx-chat-load-more">Load older transmissions</button>` : '';
    box.innerHTML = loadMore + state.messages.map(messageHTML).join('');

    if (preserveScroll) {
      box.scrollTop = box.scrollHeight - previousHeight + previousTop;
    }
  }

  function upsertMessage(message, { realtime = false } = {}) {
    if (!message?.id) return;
    const wasNearBottom = isNearBottom();
    const index = state.messages.findIndex(item => item.id === message.id);
    if (index >= 0) state.messages[index] = { ...state.messages[index], ...message };
    else state.messages.push(message);
    state.messages.sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));
    renderMessages();

    if (realtime && !wasNearBottom) {
      state.unread += 1;
      renderUnread();
    } else {
      scrollToBottom(realtime);
    }
  }

  async function loadMessages({ older = false } = {}) {
    if (state.loading) return;
    state.loading = true;
    try {
      const params = new URLSearchParams({ limit:'35' });
      if (older && state.before) params.set('before', state.before);
      const data = await request(`/messages?${params}`);
      const list = data?.data?.messages || [];
      state.hasMore = !!data?.data?.hasMore;
      state.before = data?.data?.nextBefore || state.before;

      if (older) {
        const ids = new Set(state.messages.map(item => item.id));
        state.messages = [...list.filter(item => !ids.has(item.id)), ...state.messages];
        renderMessages({ preserveScroll:true });
      } else {
        state.messages = list;
        renderMessages();
        requestAnimationFrame(() => scrollToBottom(false));
      }
    } catch (err) {
      const box = el('pdx-chat-messages');
      if (box) box.innerHTML = `<div class="pdx-chat-empty"><div class="pdx-chat-empty-inner"><h3>Radio unavailable</h3><p>${escapeHTML(err.message || 'Could not load chat history.')}</p></div></div>`;
    } finally {
      state.loading = false;
    }
  }

  function setReply(messageId) {
    const message = state.messages.find(item => item.id === messageId);
    if (!message || message.isDeleted) return;
    state.replyTo = message;
    const preview = el('pdx-chat-reply-preview');
    if (preview) {
      preview.innerHTML = `<span>Replying to <b>${escapeHTML(message.user?.name || 'PADDOX Fan')}</b> · ${escapeHTML(String(message.text || '').slice(0,90))}</span><button type="button" id="pdx-chat-cancel-reply">✕</button>`;
      preview.classList.add('show');
    }
    el('pdx-chat-input')?.focus();
  }

  function clearReply() {
    state.replyTo = null;
    const preview = el('pdx-chat-reply-preview');
    if (preview) { preview.classList.remove('show'); preview.innerHTML = ''; }
  }

  async function sendMessage() {
    if (!state.user) { window.location.href = 'account.html?redirect=fanhub.html%23sec-chat'; return; }
    const input = el('pdx-chat-input');
    const text = String(input?.value || '').trim();
    if (!text) return;

    const send = el('pdx-chat-send');
    if (send) send.disabled = true;
    try {
      const data = await request('/messages', {
        method:'POST',
        body:JSON.stringify({ text, replyTo:state.replyTo?.id || null })
      });
      input.value = '';
      input.style.height = '';
      updateCount();
      clearReply();
      stopTyping();
      upsertMessage(data?.data?.message || {}, { realtime:false });
    } catch (err) {
      if (typeof window.showToast === 'function') window.showToast(err.message);
      else alert(err.message);
    } finally {
      renderComposerState();
    }
  }

  async function toggleReaction(messageId, emoji) {
    if (!state.user) return;
    try {
      const data = await request(`/messages/${encodeURIComponent(messageId)}/reactions`, {
        method:'POST', body:JSON.stringify({ emoji })
      });
      const message = state.messages.find(item => item.id === messageId);
      if (message) message.reactions = data?.data?.reactions || [];
      renderMessages();
    } catch (err) {
      if (typeof window.showToast === 'function') window.showToast(err.message);
    }
  }

  async function deleteMessage(messageId) {
    if (!state.user || !confirm('Delete this chat message?')) return;
    try {
      await request(`/messages/${encodeURIComponent(messageId)}`, { method:'DELETE' });
      const message = state.messages.find(item => item.id === messageId);
      if (message) { message.isDeleted = true; message.text = ''; message.reactions = []; }
      renderMessages();
    } catch (err) {
      if (typeof window.showToast === 'function') window.showToast(err.message);
    }
  }

  async function reportMessage(messageId) {
    if (!state.user) return;
    const reason = prompt('Why are you reporting this message?', 'Inappropriate or abusive content');
    if (reason === null) return;
    try {
      await request(`/messages/${encodeURIComponent(messageId)}/report`, { method:'POST', body:JSON.stringify({ reason }) });
      if (typeof window.showToast === 'function') window.showToast('Report submitted');
    } catch (err) {
      if (typeof window.showToast === 'function') window.showToast(err.message);
    }
  }

  function quickReaction(messageId) {
    const emoji = prompt(`React with one of: ${REACTIONS.join('  ')}`, '🔥');
    if (!emoji || !REACTIONS.includes(emoji)) return;
    toggleReaction(messageId, emoji);
  }

  function updateCount() {
    const input = el('pdx-chat-input');
    const count = el('pdx-chat-count');
    if (count && input) count.textContent = `${input.value.length}/500`;
    renderComposerState();
  }

  function emitTyping(isTyping) {
    if (!state.socket?.connected || !state.user) return;
    state.socket.emit('chat:typing', { isTyping });
    state.isTyping = isTyping;
  }

  function stopTyping() {
    window.clearTimeout(state.typingTimer);
    if (state.isTyping) emitTyping(false);
  }

  function handleTypingInput() {
    updateCount();
    if (!state.user) return;
    if (!state.isTyping) emitTyping(true);
    window.clearTimeout(state.typingTimer);
    state.typingTimer = window.setTimeout(() => emitTyping(false), 1100);
  }

  function renderTyping() {
    const box = el('pdx-chat-typing');
    if (!box) return;
    const names = [...state.typingUsers.values()].map(item => item.name).filter(Boolean);
    if (!names.length) { box.innerHTML = ''; return; }
    const label = names.length === 1 ? `${names[0]} is typing` : `${names.slice(0,2).join(' & ')} are typing`;
    box.innerHTML = `<span class="pdx-chat-typing-dots"><i></i><i></i><i></i></span><span>${escapeHTML(label)}</span>`;
  }

  function connectSocket() {
    if (typeof io === 'undefined') return;
    const token = window.TokenManager?.getAccess?.() || '';
    state.socket = io(SOCKET_URL, {
      withCredentials:true,
      transports:['websocket','polling'],
      auth:token ? { token } : {}
    });

    const status = el('pdx-chat-socket-state');
    state.socket.on('connect', () => {
      status?.classList.add('live');
      if (status) status.textContent = 'Live link';
      state.socket.emit('chat:join');
    });
    state.socket.on('disconnect', () => {
      status?.classList.remove('live');
      if (status) status.textContent = 'Reconnecting';
    });
    state.socket.on('connect_error', () => {
      status?.classList.remove('live');
      if (status) status.textContent = 'REST mode';
    });
    state.socket.on('chat:presence', payload => {
      const count = el('pdx-chat-online');
      if (count) count.textContent = `${Number(payload?.online || 0)} fan${Number(payload?.online || 0) === 1 ? '' : 's'} online`;
    });
    state.socket.on('chat:joined', payload => {
      const count = el('pdx-chat-online');
      if (count) count.textContent = `${Number(payload?.online || 0)} fan${Number(payload?.online || 0) === 1 ? '' : 's'} online`;
    });
    state.socket.on('chat:new-message', message => upsertMessage(message, { realtime:true }));
    state.socket.on('chat:reaction-update', payload => {
      const message = state.messages.find(item => item.id === payload?.messageId);
      if (!message) return;
      message.reactions = (payload.reactions || []).map(item => ({ ...item, reactedByMe:false }));
      renderMessages();
    });
    state.socket.on('chat:message-deleted', payload => {
      const message = state.messages.find(item => item.id === payload?.messageId);
      if (!message) return;
      message.isDeleted = true; message.text = ''; message.reactions = [];
      renderMessages();
    });
    state.socket.on('chat:typing', payload => {
      const userId = String(payload?.user?.id || '');
      if (!userId || userId === currentUserId()) return;
      if (payload.isTyping) {
        state.typingUsers.set(userId, payload.user);
        window.clearTimeout(payload._timer);
        window.setTimeout(() => { state.typingUsers.delete(userId); renderTyping(); }, 2200);
      } else state.typingUsers.delete(userId);
      renderTyping();
    });
  }

  function bindEvents() {
    const input = el('pdx-chat-input');
    input?.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = `${Math.min(126, input.scrollHeight)}px`;
      handleTypingInput();
    });
    input?.addEventListener('keydown', event => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
      }
    });
    input?.addEventListener('blur', stopTyping);
    el('pdx-chat-send')?.addEventListener('click', sendMessage);
    el('pdx-chat-new-pill')?.addEventListener('click', () => scrollToBottom(true));
    el('pdx-chat-emoji-toggle')?.addEventListener('click', () => el('pdx-chat-emoji-row')?.classList.toggle('show'));
    el('pdx-chat-emoji-row')?.addEventListener('click', event => {
      const button = event.target.closest('button[data-emoji]');
      if (!button || !input) return;
      input.value += button.dataset.emoji;
      input.dispatchEvent(new Event('input'));
      input.focus();
    });

    el('pdx-chat-messages')?.addEventListener('scroll', () => {
      if (isNearBottom()) { state.unread = 0; renderUnread(); }
    }, { passive:true });

    document.addEventListener('click', event => {
      const loadMore = event.target.closest('#pdx-chat-load-more');
      if (loadMore) return loadMessages({ older:true });
      const cancelReply = event.target.closest('#pdx-chat-cancel-reply');
      if (cancelReply) return clearReply();
      const reply = event.target.closest('[data-chat-reply]');
      if (reply) return setReply(reply.dataset.chatReply);
      const quick = event.target.closest('[data-chat-quick-react]');
      if (quick) return quickReaction(quick.dataset.chatQuickReact);
      const reaction = event.target.closest('[data-chat-react]');
      if (reaction) return toggleReaction(reaction.dataset.messageId, reaction.dataset.chatReact);
      const del = event.target.closest('[data-chat-delete]');
      if (del) return deleteMessage(del.dataset.chatDelete);
      const report = event.target.closest('[data-chat-report]');
      if (report) return reportMessage(report.dataset.chatReport);
    });

    window.addEventListener('beforeunload', () => {
      stopTyping();
      state.socket?.emit('chat:leave');
    });
  }

  async function boot() {
    if (!el('sec-chat')) return;
    state.user = await resolveCurrentUser();
    renderIdentity();
    renderComposerState();
    bindEvents();
    await loadMessages();
    connectSocket();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true });
  else boot();
})();
