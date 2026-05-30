(() => {
  'use strict';
  const API_BASE = 'https://paddox-backend.onrender.com/api/auth';
  const form = document.getElementById('reset-password-form');
  const pass = document.getElementById('new-password');
  const confirm = document.getElementById('confirm-password');
  const status = document.getElementById('reset-status');
  const button = document.getElementById('reset-submit');
  const toast = document.getElementById('toast');
  const token = new URLSearchParams(window.location.search).get('token') || '';

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 3200);
  }

  function setStatus(message, bad = false) {
    if (!status) return;
    status.textContent = message;
    status.style.color = bad ? '#ff6b6b' : '#9b9b9b';
  }

  if (!token) {
    setStatus('Reset token missing. Please request a fresh password reset link.', true);
    if (button) button.disabled = true;
  }

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const password = pass.value.trim();
    const confirmPassword = confirm.value.trim();

    if (password.length < 6) return showToast('Password must be at least 6 characters.');
    if (password !== confirmPassword) return showToast('Passwords do not match.');

    button.disabled = true;
    button.textContent = 'Updating...';
    setStatus('Securing your PADDOX account...');

    try {
      const res = await fetch(`${API_BASE}/reset-password/${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.success === false) {
        throw new Error(data.message || 'Password reset failed.');
      }

      showToast('Password updated successfully.');
      setStatus('Password updated. Redirecting to sign in...');
      setTimeout(() => { window.location.href = 'account.html'; }, 1400);
    } catch (err) {
      showToast(err.message || 'Password reset failed.');
      setStatus(err.message || 'Password reset failed.', true);
      button.disabled = false;
      button.textContent = 'Update Password →';
    }
  });

  const canvas = document.getElementById('particles-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, p = [];
    function resize(){ W = canvas.width = innerWidth; H = canvas.height = innerHeight; }
    resize(); addEventListener('resize', resize);
    class P {
      constructor(){ this.x=Math.random()*W; this.y=Math.random()*H; this.vx=1+Math.random()*4; this.vy=(Math.random()-.5)*.6; this.l=40+Math.random()*90; }
      step(){ this.x+=this.vx; this.y+=this.vy; this.l-=1; if(this.x>W+80||this.l<0){this.x=-80;this.y=Math.random()*H;this.l=40+Math.random()*90;} }
      draw(){ ctx.strokeStyle='rgba(232,0,45,.35)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(this.x,this.y); ctx.lineTo(this.x-42,this.y); ctx.stroke(); }
    }
    for(let i=0;i<70;i++) p.push(new P());
    (function loop(){ ctx.clearRect(0,0,W,H); p.forEach(x=>{x.step();x.draw();}); requestAnimationFrame(loop); })();
  }
})();
