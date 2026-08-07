/* PADDOX RAG Chatbot & Voice Assistant Logic */
document.addEventListener('DOMContentLoaded', () => {
  // Inject widget HTML into body
  const widgetHTML = `
    <div id="paddox-chatbot">
      <div id="paddox-chatbot-window">
        <div id="paddox-chatbot-header">
          <span>AI Pit Wall Support</span>
          <button id="paddox-chatbot-close">✕</button>
        </div>
        <div id="paddox-chatbot-messages">
          <div class="chat-message bot">Hello! I'm the PADDOX AI Support bot. Ask me about race telemetry, our products, or fan hub!</div>
        </div>
        <div id="paddox-chatbot-input-area">
          <input type="text" id="paddox-chatbot-input" placeholder="Ask AI..." />
          <button class="chatbot-btn" id="paddox-chatbot-mic" title="Voice Input">🎤</button>
          <button class="chatbot-btn" id="paddox-chatbot-send" title="Send">➤</button>
        </div>
      </div>
      <button id="paddox-chatbot-btn" title="Open AI Chat">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ai-sparkle-icon">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          <path d="m9.5 9.5 1.5-3 1.5 3 3 1.5-3 1.5-1.5 3-1.5-3-3-1.5z"></path>
        </svg>
      </button>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', widgetHTML);

  const btn = document.getElementById('paddox-chatbot-btn');
  const chatWindow = document.getElementById('paddox-chatbot-window');
  const closeBtn = document.getElementById('paddox-chatbot-close');
  const sendBtn = document.getElementById('paddox-chatbot-send');
  const micBtn = document.getElementById('paddox-chatbot-mic');
  const inputEl = document.getElementById('paddox-chatbot-input');
  const messagesEl = document.getElementById('paddox-chatbot-messages');

  let isRecording = false;

  btn.addEventListener('click', () => {
    chatWindow.classList.toggle('open');
    if (chatWindow.classList.contains('open')) {
      inputEl.focus();
    }
  });

  closeBtn.addEventListener('click', () => {
    chatWindow.classList.remove('open');
  });

  function addMessage(text, sender) {
    const msg = document.createElement('div');
    msg.className = `chat-message ${sender}`;
    msg.textContent = text;
    messagesEl.appendChild(msg);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  async function handleSend() {
    const text = inputEl.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    inputEl.value = '';

    // Mock AI delay & response
    setTimeout(() => {
      // Very simple mock logic based on keywords
      let response = "I'm not sure about that. Try asking about 'telemetry', 'shop', or 'fan points'!";
      const lower = text.toLowerCase();
      
      if (lower.includes('telemetry') || lower.includes('lap')) {
        response = "The live telemetry data predicts a 65% chance of a safety car based on current tyre degradation rates.";
      } else if (lower.includes('shop') || lower.includes('merch') || lower.includes('product')) {
        response = "We recommend the new aerodynamic windbreaker! It's currently trending in our AI 'For You' section.";
      } else if (lower.includes('fan') || lower.includes('point')) {
        response = "You can earn Fan Points by voting in polls, answering trivia, and posting in the Fan Hub!";
      } else if (lower.includes('hello') || lower.includes('hi')) {
        response = "Hi there! How can I assist you with PADDOX today?";
      }

      addMessage(response, 'bot');
    }, 800);
  }

  sendBtn.addEventListener('click', handleSend);
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSend();
  });

  micBtn.addEventListener('click', () => {
    if (isRecording) {
      // Stop recording simulation
      isRecording = false;
      micBtn.classList.remove('recording');
      inputEl.placeholder = "Ask AI...";
      // Simulate recognized text
      inputEl.value = "What is the latest race telemetry?";
      setTimeout(handleSend, 500);
    } else {
      // Start recording simulation
      isRecording = true;
      micBtn.classList.add('recording');
      inputEl.placeholder = "Listening...";
      inputEl.value = "";
    }
  });
});
