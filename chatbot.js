/* PADDOX grounded AI Pit Wall */
document.addEventListener('DOMContentLoaded', () => {
  const pitWallIcon = `
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path class="pitwall-icon-shell" d="M8 10.5h23.5L40 19v18.5H16L8 30z"/>
      <path class="pitwall-icon-trace" d="M12.5 26h5l3.2-8.5 5.2 16 4.2-11 2.1 3.5h4.3"/>
      <path class="pitwall-icon-flag" d="M31.5 10.5V17H38"/>
      <circle class="pitwall-icon-node" cx="12.5" cy="26" r="1.7"/>
    </svg>`;

  const widgetHTML = `
    <div id="paddox-chatbot" data-state="closed">
      <section id="paddox-chatbot-window" role="dialog" aria-label="PADDOX AI Pit Wall" aria-hidden="true">
        <header id="paddox-chatbot-header">
          <div class="paddox-chatbot-brand">
            <span class="paddox-chatbot-brand-mark">${pitWallIcon}</span>
            <span class="paddox-chatbot-brand-copy">
              <span class="paddox-chatbot-kicker">PADDOX RAG</span>
              <strong>AI PIT WALL</strong>
            </span>
          </div>
          <div class="paddox-chatbot-header-actions">
            <span class="paddox-chatbot-status" id="paddox-chatbot-status">
              <i aria-hidden="true"></i> Grounding ready
            </span>
            <button id="paddox-chatbot-clear" type="button" aria-label="Start a new conversation" title="New conversation">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.3-5.7M4 4v5h5"/></svg>
            </button>
            <button id="paddox-chatbot-close" type="button" aria-label="Close AI Pit Wall">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>
            </button>
          </div>
        </header>

        <div class="paddox-chatbot-context-strip">
          <span>VERIFIED PADDOX + F1 KNOWLEDGE</span>
          <span>RETRIEVAL ON</span>
        </div>

        <div id="paddox-chatbot-messages" role="log" aria-live="polite" aria-relevant="additions">
          <article class="chat-message bot">
            <span class="chat-message-avatar">${pitWallIcon}</span>
            <div class="chat-message-stack">
              <div class="chat-message-meta"><strong>AI PIT WALL</strong><span>NOW</span></div>
              <div class="chat-message-bubble">
                I remember this conversation and answer from verified PADDOX knowledge, live F1 data, and your fan profile when you are signed in.
              </div>
              <div class="chat-grounding-note"><span></span> Answers are grounded when evidence is found.</div>
            </div>
          </article>
        </div>

        <div class="paddox-chatbot-prompts" id="paddox-chatbot-prompts" aria-label="Suggested questions">
          <button type="button" data-prompt="When is the next Formula 1 race?">Next race</button>
          <button type="button" data-prompt="Who leads the driver standings?">Driver standings</button>
          <button type="button" data-prompt="What can I do on PADDOX?">Explore PADDOX</button>
        </div>

        <form id="paddox-chatbot-input-area">
          <label class="sr-only" for="paddox-chatbot-input">Ask the PADDOX AI Pit Wall</label>
          <textarea id="paddox-chatbot-input" rows="1" maxlength="600" placeholder="Ask the pit wall..."></textarea>
          <div class="paddox-chatbot-compose-meta">
            <span><b id="paddox-chatbot-count">0</b>/600</span>
            <span>Verified retrieval</span>
          </div>
          <button class="chatbot-send" id="paddox-chatbot-send" type="submit" aria-label="Send question">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 14-7-4.5 14-2.7-5.2z"/><path d="m11.8 13.8 3.8-3.8"/></svg>
          </button>
        </form>
      </section>

      <button id="paddox-chatbot-btn" type="button" aria-label="Open PADDOX AI Pit Wall" aria-expanded="false">
        <span class="paddox-chatbot-launch-icon">${pitWallIcon}</span>
        <span class="paddox-chatbot-launch-copy">
          <small>PADDOX AI</small>
          <strong>ASK THE PIT WALL</strong>
        </span>
        <span class="paddox-chatbot-launch-live" aria-hidden="true"></span>
      </button>
    </div>`;

  document.body.insertAdjacentHTML('beforeend', widgetHTML);

  const root = document.getElementById('paddox-chatbot');
  const launcher = document.getElementById('paddox-chatbot-btn');
  const panel = document.getElementById('paddox-chatbot-window');
  const closeButton = document.getElementById('paddox-chatbot-close');
  const clearButton = document.getElementById('paddox-chatbot-clear');
  const form = document.getElementById('paddox-chatbot-input-area');
  const input = document.getElementById('paddox-chatbot-input');
  const sendButton = document.getElementById('paddox-chatbot-send');
  const messages = document.getElementById('paddox-chatbot-messages');
  const prompts = document.getElementById('paddox-chatbot-prompts');
  const count = document.getElementById('paddox-chatbot-count');
  const status = document.getElementById('paddox-chatbot-status');
  const storageKey = 'paddox.aiPitWall.history.v2';
  const defaultSuggestions = [
    'When is the next Formula 1 race?',
    'Who leads the driver standings?',
    'What can I do on PADDOX?',
  ];
  let pending = false;

  const loadConversation = () => {
    try {
      const stored = JSON.parse(window.sessionStorage.getItem(storageKey) || '[]');
      return Array.isArray(stored) ? stored.slice(-8) : [];
    } catch (_) {
      return [];
    }
  };
  let conversation = loadConversation();

  const persistConversation = () => {
    try {
      window.sessionStorage.setItem(storageKey, JSON.stringify(conversation.slice(-8)));
    } catch (_) {}
  };

  const remember = ({ role, content, grounded = false, sources = [] }) => {
    conversation.push({
      role,
      content: String(content || '').slice(0, 1000),
      grounded: Boolean(grounded),
      sources: Array.isArray(sources) ? sources.slice(0, 3) : [],
    });
    conversation = conversation.slice(-8);
    persistConversation();
  };

  const sourceLabel = (source = {}) => source.title || source.label || source.source || 'Verified PADDOX source';

  const setOpen = (open) => {
    root.dataset.state = open ? 'open' : 'closed';
    panel.setAttribute('aria-hidden', String(!open));
    launcher.setAttribute('aria-expanded', String(open));
    launcher.setAttribute('aria-label', open ? 'Close PADDOX AI Pit Wall' : 'Open PADDOX AI Pit Wall');
    if (open) window.setTimeout(() => input.focus(), 180);
  };

  const setServiceState = (state, label) => {
    status.dataset.state = state;
    status.lastChild.textContent = ` ${label}`;
  };

  const scrollToLatest = () => {
    messages.scrollTop = messages.scrollHeight;
  };

  const renderSuggestions = (items = defaultSuggestions) => {
    const suggestions = (Array.isArray(items) ? items : defaultSuggestions)
      .map((item) => String(item || '').trim())
      .filter(Boolean)
      .slice(0, 3);
    prompts.replaceChildren();
    suggestions.forEach((suggestion) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.prompt = suggestion;
      button.textContent = suggestion;
      prompts.appendChild(button);
    });
    prompts.hidden = suggestions.length === 0;
  };

  const addMessage = ({ text, sender, sources = [], grounded = false, error = false }) => {
    const article = document.createElement('article');
    article.className = `chat-message ${sender}${error ? ' error' : ''}`;

    if (sender === 'bot') {
      const avatar = document.createElement('span');
      avatar.className = 'chat-message-avatar';
      avatar.innerHTML = pitWallIcon;
      article.appendChild(avatar);
    }

    const stack = document.createElement('div');
    stack.className = 'chat-message-stack';

    const meta = document.createElement('div');
    meta.className = 'chat-message-meta';
    const author = document.createElement('strong');
    author.textContent = sender === 'bot' ? 'AI PIT WALL' : 'YOU';
    const time = document.createElement('span');
    time.textContent = new Intl.DateTimeFormat([], { hour: '2-digit', minute: '2-digit' }).format(new Date());
    meta.append(author, time);

    const bubble = document.createElement('div');
    bubble.className = 'chat-message-bubble';
    bubble.textContent = text;
    stack.append(meta, bubble);

    if (sender === 'bot') {
      const grounding = document.createElement('div');
      grounding.className = `chat-grounding-note ${grounded ? 'is-grounded' : 'is-unverified'}`;
      const dot = document.createElement('span');
      grounding.append(dot, document.createTextNode(grounded ? ' Grounded in retrieved evidence' : ' No supporting evidence found'));
      stack.appendChild(grounding);
    }

    if (grounded && sources.length) {
      const sourceWrap = document.createElement('div');
      sourceWrap.className = 'chat-sources';
      const sourceTitle = document.createElement('span');
      sourceTitle.textContent = 'SOURCES';
      sourceWrap.appendChild(sourceTitle);
      sources.slice(0, 3).forEach((source) => {
        const chip = document.createElement('span');
        chip.className = 'chat-source-chip';
        chip.textContent = sourceLabel(source);
        sourceWrap.appendChild(chip);
      });
      stack.appendChild(sourceWrap);
    }

    article.appendChild(stack);
    messages.appendChild(article);
    scrollToLatest();
    return article;
  };

  const addTyping = () => {
    const row = document.createElement('article');
    row.className = 'chat-message bot chat-typing-row';
    row.innerHTML = `<span class="chat-message-avatar">${pitWallIcon}</span><div class="chat-message-stack"><div class="chat-message-meta"><strong>AI PIT WALL</strong><span>RETRIEVING</span></div><div class="chat-message-bubble chat-typing" aria-label="Searching verified sources"><i></i><i></i><i></i></div></div>`;
    messages.appendChild(row);
    scrollToLatest();
    return row;
  };

  const resizeInput = () => {
    input.style.height = 'auto';
    input.style.height = `${Math.min(input.scrollHeight, 112)}px`;
    count.textContent = String(input.value.length);
  };

  const ask = async (rawQuestion) => {
    const question = String(rawQuestion || '').trim();
    if (!question || pending) return;

    pending = true;
    const requestHistory = conversation.map(({ role, content }) => ({ role, content }));
    sendButton.disabled = true;
    input.disabled = true;
    prompts.hidden = true;
    addMessage({ text: question, sender: 'user' });
    remember({ role: 'user', content: question });
    input.value = '';
    resizeInput();
    setServiceState('working', 'Retrieving sources');
    const typing = addTyping();

    try {
      if (!window.ChatAPI || typeof window.ChatAPI.ask !== 'function') {
        throw new Error('Chat service is not available on this page.');
      }
      const payload = await window.ChatAPI.ask(question, requestHistory);
      typing.remove();

      if (!payload?.success) {
        throw new Error(payload?.message || 'The AI Pit Wall could not answer right now.');
      }

      const result = payload.data || {};
      addMessage({
        text: result.answer || 'No answer was returned.',
        sender: 'bot',
        grounded: Boolean(result.grounded),
        sources: Array.isArray(result.sources) ? result.sources : [],
      });
      remember({
        role: 'assistant',
        content: result.answer || 'No answer was returned.',
        grounded: Boolean(result.grounded),
        sources: Array.isArray(result.sources) ? result.sources : [],
      });
      renderSuggestions(result.suggestions);
      setServiceState(result.grounded ? 'ready' : 'caution', result.grounded ? 'Evidence verified' : 'No evidence found');
    } catch (error) {
      typing.remove();
      addMessage({
        text: error?.message || 'The AI Pit Wall is temporarily unavailable. Please try again.',
        sender: 'bot',
        error: true,
      });
      setServiceState('error', 'Service unavailable');
    } finally {
      pending = false;
      sendButton.disabled = false;
      input.disabled = false;
      input.focus();
    }
  };

  conversation.forEach((turn) => {
    addMessage({
      text: turn.content,
      sender: turn.role === 'assistant' ? 'bot' : 'user',
      grounded: Boolean(turn.grounded),
      sources: Array.isArray(turn.sources) ? turn.sources : [],
    });
  });
  renderSuggestions();

  launcher.addEventListener('click', () => setOpen(root.dataset.state !== 'open'));
  closeButton.addEventListener('click', () => setOpen(false));
  clearButton.addEventListener('click', () => {
    if (pending) return;
    conversation = [];
    persistConversation();
    messages.querySelectorAll('.chat-message:not(:first-child)').forEach((message) => message.remove());
    renderSuggestions();
    setServiceState('ready', 'Grounding ready');
    input.focus();
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    ask(input.value);
  });
  input.addEventListener('input', resizeInput);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      ask(input.value);
    }
  });
  prompts.addEventListener('click', (event) => {
    const button = event.target.closest('[data-prompt]');
    if (button) ask(button.dataset.prompt);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && root.dataset.state === 'open') setOpen(false);
  });
});
