/* ============================================================
   PADDOX Fan Hub — Instagram-style message reactions
   Visual enhancement only. Existing fanhub-chat.js remains the
   source of truth for API requests, realtime state and rendering.
   ============================================================ */
(function initPaddoxInstagramReactions(){
  'use strict';

  if (window.__PADDOX_CHAT_REACTIONS__) return;
  window.__PADDOX_CHAT_REACTIONS__ = true;

  const REACTIONS = [
    { emoji:'❤️', label:'Love' },
    { emoji:'🔥', label:'Fire' },
    { emoji:'😂', label:'Laugh' },
    { emoji:'🏁', label:'Race flag' },
    { emoji:'👍', label:'Like' }
  ];

  let picker = null;
  let trigger = null;
  let messageId = '';
  let closeTimer = 0;

  const isFanHub = () => /fanhub\.html$/i.test(window.location.pathname);

  function chatIsGuest(){
    const input = document.getElementById('pdx-chat-input');
    return !!input?.disabled;
  }

  function showSignInNotice(){
    if (typeof window.showToast === 'function') {
      window.showToast('Sign in to react to grid messages');
      return;
    }
    const note = document.getElementById('pdx-chat-login-note');
    if (note) {
      note.classList.add('pdx-chat-login-nudge');
      setTimeout(() => note.classList.remove('pdx-chat-login-nudge'), 900);
    }
  }

  function closePicker({ restoreFocus = false } = {}){
    window.clearTimeout(closeTimer);
    if (!picker) return;

    const oldPicker = picker;
    const oldTrigger = trigger;
    picker = null;
    trigger = null;
    messageId = '';

    oldTrigger?.setAttribute('aria-expanded','false');
    oldPicker.classList.remove('is-open');
    closeTimer = window.setTimeout(() => oldPicker.remove(), 180);

    if (restoreFocus) oldTrigger?.focus?.({ preventScroll:true });
  }

  function activeReactionFor(article, emoji){
    return [...(article?.querySelectorAll('.pdx-chat-reaction.on') || [])]
      .some(button => button.dataset.chatReact === emoji);
  }

  function buildPicker(article){
    const panel = document.createElement('div');
    panel.className = 'pdx-chat-insta-reactions';
    panel.setAttribute('role','menu');
    panel.setAttribute('aria-label','React to message');
    panel.dataset.placement = 'above';

    panel.innerHTML = REACTIONS.map(({ emoji, label }, index) => `
      <button
        type="button"
        class="pdx-chat-insta-reaction-option${activeReactionFor(article, emoji) ? ' is-active' : ''}"
        role="menuitem"
        aria-label="${label}"
        title="${label}"
        data-pdx-chat-picker-emoji="${emoji}"
        tabindex="${index === 0 ? '0' : '-1'}"
      >${emoji}</button>
    `).join('');

    return panel;
  }

  function positionPicker(){
    if (!picker || !trigger || !trigger.isConnected) {
      closePicker();
      return;
    }

    const triggerRect = trigger.getBoundingClientRect();
    const article = trigger.closest('.pdx-chat-message');
    const bubble = article?.querySelector('.pdx-chat-bubble');
    const bubbleRect = bubble?.getBoundingClientRect() || triggerRect;

    picker.style.visibility = 'hidden';
    picker.style.left = '0px';
    picker.style.top = '0px';
    const pickerRect = picker.getBoundingClientRect();

    const gutter = 12;
    const verticalGap = 11;
    const preferredCenter = Math.min(
      Math.max(triggerRect.left + triggerRect.width / 2, bubbleRect.left + 76),
      bubbleRect.right - 76
    );

    let left = preferredCenter - pickerRect.width / 2;
    left = Math.max(gutter, Math.min(left, window.innerWidth - pickerRect.width - gutter));

    let top = triggerRect.top - pickerRect.height - verticalGap;
    let placement = 'above';
    if (top < gutter) {
      top = triggerRect.bottom + verticalGap;
      placement = 'below';
    }

    const triggerCenter = triggerRect.left + triggerRect.width / 2;
    const tailX = Math.max(18, Math.min(pickerRect.width - 18, triggerCenter - left));

    picker.dataset.placement = placement;
    picker.style.setProperty('--pdx-react-tail-x', `${tailX}px`);
    picker.style.left = `${Math.round(left)}px`;
    picker.style.top = `${Math.round(top)}px`;
    picker.style.visibility = '';
  }

  function openPicker(button){
    if (!button) return;

    if (chatIsGuest()) {
      closePicker();
      showSignInNotice();
      return;
    }

    const id = button.dataset.chatQuickReact || '';
    if (!id) return;

    if (picker && trigger === button) {
      closePicker({ restoreFocus:true });
      return;
    }

    closePicker();

    trigger = button;
    messageId = id;
    trigger.setAttribute('aria-haspopup','menu');
    trigger.setAttribute('aria-expanded','true');

    const article = button.closest('.pdx-chat-message');
    picker = buildPicker(article);
    document.body.appendChild(picker);
    positionPicker();

    requestAnimationFrame(() => {
      if (!picker) return;
      picker.classList.add('is-open');
    });
  }

  /* Reuse fanhub-chat.js's existing delegated [data-chat-react] handler.
     This keeps the current API/state/socket flow untouched. */
  function dispatchExistingReaction(id, emoji){
    const proxy = document.createElement('button');
    proxy.type = 'button';
    proxy.hidden = true;
    proxy.dataset.chatReact = emoji;
    proxy.dataset.messageId = id;
    document.body.appendChild(proxy);
    proxy.click();
    proxy.remove();
  }

  function pickReaction(option){
    if (!picker || !messageId || !option) return;
    const emoji = option.dataset.pdxChatPickerEmoji;
    if (!emoji) return;

    option.classList.add('is-picking');
    dispatchExistingReaction(messageId, emoji);
    window.setTimeout(() => closePicker(), 110);
  }

  function moveFocus(direction){
    if (!picker) return;
    const options = [...picker.querySelectorAll('.pdx-chat-insta-reaction-option')];
    if (!options.length) return;
    let index = options.indexOf(document.activeElement);
    if (index < 0) index = 0;
    else index = (index + direction + options.length) % options.length;
    options.forEach((item, itemIndex) => item.tabIndex = itemIndex === index ? 0 : -1);
    options[index].focus({ preventScroll:true });
  }

  /* Capture phase is intentional: it stops fanhub-chat.js's legacy
     quickReaction(prompt(...)) handler before it can open a browser dialog. */
  document.addEventListener('click', event => {
    if (!isFanHub()) return;
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const option = target.closest('[data-pdx-chat-picker-emoji]');
    if (option) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      pickReaction(option);
      return;
    }

    const quick = target.closest('[data-chat-quick-react]');
    if (quick) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      openPicker(quick);
      return;
    }

    if (picker && !target.closest('.pdx-chat-insta-reactions')) closePicker();
  }, true);

  document.addEventListener('keydown', event => {
    if (!picker) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closePicker({ restoreFocus:true });
      return;
    }
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      moveFocus(1);
      return;
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      moveFocus(-1);
    }
  }, true);

  window.addEventListener('resize', positionPicker, { passive:true });
  window.addEventListener('scroll', positionPicker, { passive:true, capture:true });
  window.addEventListener('pagehide', () => closePicker());
})();
