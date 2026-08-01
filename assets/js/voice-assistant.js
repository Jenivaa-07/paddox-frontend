/**
 * PADDOX Voice Assistant 
 * Push-to-Talk, secure processing, and speech synthesis.
 */

class VoiceAssistant {
  constructor() {
    this.state = 'idle';
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.stream = null;
    this.timerInterval = null;
    this.secondsRemaining = 30;
    this.lastAnswer = null;
    this.speechSynthesis = window.speechSynthesis;
    this.utterance = null;
    
    this.initUI();
    this.bindEvents();
  }

  initUI() {
    // Inject the voice overlay HTML into the body if it doesn't exist
    if (!document.getElementById('voice-assistant-overlay')) {
      const overlayHTML = `
        <div id="voice-assistant-overlay" role="dialog" aria-label="PADDOX Voice Assistant" aria-live="polite">
          <div class="voice-header">
            <h3 class="voice-title">PADDOX Assistant</h3>
            <span class="voice-status" id="voice-status-text">Ready</span>
            <button class="voice-close" id="voice-close-btn" aria-label="Close Voice Assistant">&times;</button>
          </div>
          <div class="voice-content" id="voice-content-area">
            <div class="voice-transcript" id="voice-transcript" style="display:none;"></div>
            <div class="voice-answer" id="voice-answer">Hi! How can I help you? Push the mic to speak.</div>
            <div class="voice-citations" id="voice-citations" style="display:none;"></div>
          </div>
          <div class="voice-timer" id="voice-timer"></div>
          
          <div class="voice-controls">
            <button class="voice-btn" id="voice-record-btn" aria-label="Push to talk">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="22"></line>
              </svg>
            </button>
          </div>

          <div class="voice-playback-controls" id="voice-playback-controls" style="display:none;">
            <button class="voice-text-btn" id="voice-replay-btn" aria-label="Replay answer">Replay</button>
            <button class="voice-text-btn" id="voice-stop-btn" aria-label="Stop speaking">Stop</button>
          </div>
        </div>
        
        <button id="voice-fab-btn" aria-label="Open Voice Assistant" style="position: fixed; bottom: 30px; right: 30px; width: 60px; height: 60px; border-radius: 50%; background: #e10600; color: #fff; border: none; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 9998; display: flex; justify-content: center; align-items: center; transition: transform 0.2s;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            <line x1="12" y1="19" x2="12" y2="22"></line>
          </svg>
        </button>
      `;
      document.body.insertAdjacentHTML('beforeend', overlayHTML);
    }

    this.elements = {
      overlay: document.getElementById('voice-assistant-overlay'),
      fab: document.getElementById('voice-fab-btn'),
      statusText: document.getElementById('voice-status-text'),
      transcript: document.getElementById('voice-transcript'),
      answer: document.getElementById('voice-answer'),
      citations: document.getElementById('voice-citations'),
      recordBtn: document.getElementById('voice-record-btn'),
      closeBtn: document.getElementById('voice-close-btn'),
      timer: document.getElementById('voice-timer'),
      playbackControls: document.getElementById('voice-playback-controls'),
      replayBtn: document.getElementById('voice-replay-btn'),
      stopBtn: document.getElementById('voice-stop-btn')
    };
  }

  bindEvents() {
    this.elements.fab.addEventListener('click', () => this.show());
    this.elements.recordBtn.addEventListener('click', () => this.toggleRecording());
    this.elements.closeBtn.addEventListener('click', () => this.close());
    this.elements.replayBtn.addEventListener('click', () => this.playLastAnswer());
    this.elements.stopBtn.addEventListener('click', () => this.stopSpeaking());
    
    // Add a global keyboard shortcut (Alt+Shift+V) to open voice assistant
    document.addEventListener('keydown', (e) => {
      // Ignore if typing in an input or textarea
      const active = document.activeElement;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
        return;
      }
      
      if (e.altKey && e.shiftKey && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        this.show();
      }
    });
  }

  show() {
    this.elements.overlay.classList.add('visible');
    this.elements.fab.style.transform = 'scale(0)';
    this.elements.recordBtn.focus();
  }

  close() {
    this.elements.overlay.classList.remove('visible');
    this.elements.fab.style.transform = 'scale(1)';
    if (this.state === 'listening') {
      this.stopRecording();
    }
    this.stopSpeaking();
  }

  setState(newState, statusMessage) {
    this.state = newState;
    this.elements.statusText.textContent = statusMessage || newState;
    
    // Announce for screen readers implicitly handled by aria-live
    if (newState === 'listening') {
      this.elements.recordBtn.classList.add('recording');
      this.elements.recordBtn.setAttribute('aria-label', 'Stop recording');
      this.elements.playbackControls.style.display = 'none';
      this.elements.transcript.style.display = 'none';
      this.elements.citations.style.display = 'none';
    } else {
      this.elements.recordBtn.classList.remove('recording');
      this.elements.recordBtn.setAttribute('aria-label', 'Push to talk');
    }
  }

  async toggleRecording() {
    if (this.state === 'idle' || this.state === 'answered' || this.state === 'error') {
      await this.startRecording();
    } else if (this.state === 'listening') {
      this.stopRecording();
    }
  }

  getPreferredMimeType() {
    const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg', 'audio/wav'];
    for (let type of types) {
      if (MediaRecorder.isTypeSupported(type)) return type;
    }
    return '';
  }

  async startRecording() {
    try {
      this.stopSpeaking();
      this.setState('requesting_permission', 'Requesting Mic...');
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mimeType = this.getPreferredMimeType();
      if (!mimeType) {
        throw new Error('No supported audio mime type found in browser.');
      }

      this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.audioChunks.push(e.data);
      };

      this.mediaRecorder.onstop = () => this.processAudio(mimeType);

      this.mediaRecorder.start();
      this.setState('listening', 'Listening...');
      this.elements.answer.textContent = 'Listening...';
      
      this.secondsRemaining = 30;
      this.elements.timer.textContent = `00:${this.secondsRemaining.toString().padStart(2, '0')}`;
      this.timerInterval = setInterval(() => {
        this.secondsRemaining--;
        if (this.secondsRemaining <= 0) {
          this.stopRecording();
        } else {
          this.elements.timer.textContent = `00:${this.secondsRemaining.toString().padStart(2, '0')}`;
        }
      }, 1000);
      
    } catch (err) {
      console.error(err);
      this.setState('error', 'Mic Access Denied');
      this.elements.answer.textContent = 'Please allow microphone access to use the voice assistant.';
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
      this.stream.getTracks().forEach(track => track.stop());
      clearInterval(this.timerInterval);
      this.elements.timer.textContent = '';
      this.setState('processing', 'Processing...');
      this.elements.answer.textContent = 'Thinking...';
    }
  }

  async processAudio(mimeType) {
    if (this.audioChunks.length === 0) {
      this.setState('error', 'Audio empty');
      return;
    }

    const audioBlob = new Blob(this.audioChunks, { type: mimeType });
    const formData = new FormData();
    // Use an extension based on mimeType
    const ext = mimeType.includes('mp4') ? 'mp4' : mimeType.includes('wav') ? 'wav' : mimeType.includes('ogg') ? 'ogg' : 'webm';
    formData.append('audio', audioBlob, `recording.${ext}`);
    
    try {
      // Fetch CSRF token for the POST request
      let csrfToken = '';
      try {
        const csrfRes = await fetch(`${window.API_BASE || 'https://paddox-backend.onrender.com/api'}/auth/csrf-token`, { credentials: 'include' });
        const csrfData = await csrfRes.json();
        csrfToken = csrfData.csrfToken || '';
      } catch (e) {
        console.warn('Failed to fetch CSRF token for voice', e);
      }

      const headers = {};
      if (csrfToken) headers['x-csrf-token'] = csrfToken;

      // Forward to Node API
      const res = await fetch('/api/voice/ask', {
        method: 'POST',
        credentials: 'include',
        headers,
        body: formData
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Server error');
      }

      this.displayAnswer(data);
      this.speakAnswer(data.spoken_answer);

    } catch (err) {
      console.error(err);
      this.setState('error', 'Error');
      
      let msg = "An unexpected error occurred.";
      if (err.message === 'no_speech_detected') msg = "I didn't catch that. Please try again.";
      else if (err.message === 'transcription_provider_unavailable') msg = "The speech service is currently unavailable.";
      else if (err.message === 'audio_too_large') msg = "The recording was too long.";
      
      this.elements.answer.textContent = msg;
    }
  }

  displayAnswer(data) {
    this.setState('answered', 'Answered');
    this.lastAnswer = data;
    
    this.elements.transcript.style.display = 'block';
    this.elements.transcript.textContent = `"${data.transcript}"`;
    
    this.elements.answer.textContent = data.answer; // Display full text

    if (data.citations && data.citations.length > 0) {
      this.elements.citations.style.display = 'block';
      this.elements.citations.textContent = `Sources: ${data.citations.join(', ')}`;
    } else {
      this.elements.citations.style.display = 'none';
    }

    this.elements.playbackControls.style.display = 'flex';
  }

  speakAnswer(text) {
    if (!this.speechSynthesis) return;
    
    this.stopSpeaking();
    
    this.utterance = new SpeechSynthesisUtterance(text);
    this.utterance.lang = 'en-GB'; // Default to a British accent for F1 vibes if available
    
    this.utterance.onstart = () => this.setState('speaking', 'Speaking...');
    this.utterance.onend = () => this.setState('answered', 'Ready');
    this.utterance.onerror = () => this.setState('answered', 'Ready');

    this.speechSynthesis.speak(this.utterance);
  }

  playLastAnswer() {
    if (this.lastAnswer && this.lastAnswer.spoken_answer) {
      this.speakAnswer(this.lastAnswer.spoken_answer);
    }
  }

  stopSpeaking() {
    if (this.speechSynthesis && this.speechSynthesis.speaking) {
      this.speechSynthesis.cancel();
      this.setState('answered', 'Ready');
    }
  }
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  window.paddoxVoice = new VoiceAssistant();
});
