/* ============================================================
   PADDOX Fan Hub — Quote Share Canvas V2
   Premium black / red motorsport share-card renderer.
   Loaded after fanhub.js so it replaces buildQuoteShareCanvas().
   ============================================================ */
(function installPaddoxQuoteCanvasV2(){
  'use strict';

  const RED = '#ed0038';
  const RED_BRIGHT = '#ff1748';
  const RED_DARK = '#6b0019';
  const WHITE = '#f7f7f9';
  const MUTED = 'rgba(255,255,255,.64)';
  const PANEL = '#090a0e';
  const BRAND_LOCKUP = 'assets/paddox-logo-horizontal-white.png?v=QCV2';
  const BRAND_ICON = 'assets/paddox-logo-icon-web.png?v=QCV2';

  function roundRectPath(ctx, x, y, w, h, r) {
    const radius = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }

  function strokeGlow(ctx, color, blur, width, draw) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.shadowColor = color;
    ctx.shadowBlur = blur;
    draw();
    ctx.stroke();
    ctx.restore();
  }

  function fillPanel(ctx, x, y, w, h, r, options = {}) {
    roundRectPath(ctx, x, y, w, h, r);
    if (options.gradient) ctx.fillStyle = options.gradient;
    else ctx.fillStyle = options.fill || PANEL;
    ctx.fill();

    if (options.stroke !== false) {
      ctx.lineWidth = options.lineWidth || 1.2;
      ctx.strokeStyle = options.stroke || 'rgba(255,255,255,.14)';
      ctx.stroke();
    }
  }

  function linearGlow(ctx, x1, y1, x2, y2, color = RED) {
    const g = ctx.createLinearGradient(x1, y1, x2, y2);
    g.addColorStop(0, 'rgba(237,0,56,0)');
    g.addColorStop(.18, color);
    g.addColorStop(.5, '#ffffff');
    g.addColorStop(.72, color);
    g.addColorStop(1, 'rgba(237,0,56,0)');
    return g;
  }

  function drawCarbon(ctx, x, y, w, h, opacity = .10, step = 18) {
    ctx.save();
    roundRectPath(ctx, x, y, w, h, 24);
    ctx.clip();
    ctx.globalAlpha = opacity;
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#ffffff';
    for (let i = x - h; i < x + w + h; i += step) {
      ctx.beginPath();
      ctx.moveTo(i, y);
      ctx.lineTo(i + h, y + h);
      ctx.stroke();
    }
    ctx.globalAlpha = opacity * .55;
    ctx.strokeStyle = RED;
    for (let i = x - h + step / 2; i < x + w + h; i += step * 2) {
      ctx.beginPath();
      ctx.moveTo(i, y);
      ctx.lineTo(i + h, y + h);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawDotMatrix(ctx, x, y, cols, rows, gap = 11, color = RED, alpha = .28) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const fade = 1 - (c / Math.max(1, cols)) * .68;
        ctx.globalAlpha = alpha * fade;
        ctx.fillRect(x + c * gap, y + r * gap, 2.2, 2.2);
      }
    }
    ctx.restore();
  }

  function loadImageSafe(src) {
    return new Promise(resolve => {
      if (!src || typeof src !== 'string' || src === 'PX') {
        resolve(null);
        return;
      }

      const img = new Image();
      let settled = false;
      const finish = value => {
        if (settled) return;
        settled = true;
        resolve(value);
      };

      if (!src.startsWith('data:') && !src.startsWith('blob:')) {
        img.crossOrigin = 'anonymous';
      }

      img.onload = () => finish(img);
      img.onerror = () => finish(null);
      window.setTimeout(() => finish(null), 4500);
      img.src = src;
    });
  }

  function quoteImage(q = {}) {
    return q.driverImage || q.image || q.imageUrl || q.headshot || q.avatar || '';
  }

  function drawCover(ctx, img, x, y, w, h, focusY = .38) {
    if (!img || !img.width || !img.height) return;
    const targetRatio = w / h;
    const imageRatio = img.width / img.height;
    let sx = 0, sy = 0, sw = img.width, sh = img.height;

    if (imageRatio > targetRatio) {
      sw = img.height * targetRatio;
      sx = (img.width - sw) / 2;
    } else {
      sh = img.width / targetRatio;
      const maxSy = Math.max(0, img.height - sh);
      sy = Math.max(0, Math.min(maxSy, maxSy * focusY));
    }
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  }

  function fitTextLines(ctx, text, maxWidth, maxHeight, options = {}) {
    const family = options.family || '"Barlow Condensed", Arial, sans-serif';
    const weight = options.weight || 600;
    const maxSize = options.maxSize || 68;
    const minSize = options.minSize || 38;
    const lineRatio = options.lineRatio || 1.14;
    const maxLines = options.maxLines || 7;
    const words = String(text || '').trim().split(/\s+/).filter(Boolean);

    function makeLines(size) {
      ctx.font = `${weight} ${size}px ${family}`;
      const lines = [];
      let line = '';
      for (const word of words) {
        const candidate = line ? `${line} ${word}` : word;
        if (ctx.measureText(candidate).width <= maxWidth || !line) {
          line = candidate;
        } else {
          lines.push(line);
          line = word;
        }
      }
      if (line) lines.push(line);
      return lines;
    }

    for (let size = maxSize; size >= minSize; size -= 1) {
      const lines = makeLines(size);
      const lineHeight = size * lineRatio;
      if (lines.length <= maxLines && lines.length * lineHeight <= maxHeight) {
        return { size, lines, lineHeight };
      }
    }

    const size = minSize;
    const lines = makeLines(size).slice(0, maxLines);
    return { size, lines, lineHeight: size * lineRatio };
  }

  function drawOpenQuotes(ctx, x, y, size = 102) {
    ctx.save();
    ctx.font = `700 ${size}px Georgia, serif`;
    ctx.fillStyle = 'rgba(237,0,56,.18)';
    ctx.strokeStyle = RED;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = RED;
    ctx.shadowBlur = 18;
    ctx.strokeText('“', x, y);
    ctx.fillText('“', x, y);
    ctx.restore();
  }

  function drawCloseQuotes(ctx, x, y, size = 102) {
    ctx.save();
    ctx.font = `700 ${size}px Georgia, serif`;
    ctx.fillStyle = 'rgba(237,0,56,.035)';
    ctx.strokeStyle = 'rgba(237,0,56,.42)';
    ctx.lineWidth = 1.7;
    ctx.strokeText('”', x, y);
    ctx.fillText('”', x, y);
    ctx.restore();
  }

  function drawShieldIcon(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = 'rgba(255,255,255,.90)';
    ctx.fillStyle = 'rgba(237,0,56,.12)';
    ctx.lineWidth = 2.3;
    ctx.beginPath();
    ctx.moveTo(16, 0);
    ctx.lineTo(29, 5);
    ctx.lineTo(27, 19);
    ctx.quadraticCurveTo(25, 29, 16, 35);
    ctx.quadraticCurveTo(7, 29, 5, 19);
    ctx.lineTo(3, 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = RED_BRIGHT;
    ctx.beginPath();
    ctx.moveTo(10, 17);
    ctx.lineTo(14, 21);
    ctx.lineTo(22, 12);
    ctx.stroke();
    ctx.restore();
  }

  function drawShareIcon(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = 'rgba(255,255,255,.90)';
    ctx.lineWidth = 2.4;
    roundRectPath(ctx, 0, 9, 31, 26, 7);
    ctx.stroke();
    ctx.strokeStyle = RED_BRIGHT;
    ctx.beginPath();
    ctx.moveTo(15.5, 21);
    ctx.lineTo(15.5, 0);
    ctx.moveTo(8.5, 7);
    ctx.lineTo(15.5, 0);
    ctx.lineTo(22.5, 7);
    ctx.stroke();
    ctx.restore();
  }

  function drawStarIcon(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    const outer = 16;
    const inner = 7;
    ctx.beginPath();
    for (let i = 0; i < 10; i += 1) {
      const r = i % 2 === 0 ? outer : inner;
      const a = -Math.PI / 2 + (Math.PI * i) / 5;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(237,0,56,.12)';
    ctx.strokeStyle = 'rgba(255,255,255,.90)';
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function drawLogoFallback(ctx, x, y, maxW = 280) {
    ctx.save();
    ctx.font = '800 58px "Bebas Neue", Impact, sans-serif';
    ctx.fillStyle = WHITE;
    ctx.fillText('PADDO', x, y + 58);
    const w = ctx.measureText('PADDO').width;
    ctx.fillStyle = RED_BRIGHT;
    ctx.fillText('X', x + w + 2, y + 58);
    ctx.font = '700 12px Inter, Arial, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,.62)';
    ctx.letterSpacing = '4px';
    ctx.fillText('MOTORSPORT LIFESTYLE', x + 4, y + 80);
    ctx.restore();
  }

  function drawBrand(ctx, img, x, y, maxW, maxH, opacity = 1) {
    if (!img) {
      drawLogoFallback(ctx, x, y, maxW);
      return;
    }
    const ratio = Math.min(maxW / img.width, maxH / img.height);
    const w = img.width * ratio;
    const h = img.height * ratio;
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.drawImage(img, x, y, w, h);
    ctx.restore();
  }

  function drawBadge(ctx, text, x, y, w, h) {
    roundRectPath(ctx, x, y, w, h, h / 2);
    const g = ctx.createLinearGradient(x, y, x + w, y + h);
    g.addColorStop(0, 'rgba(15,16,21,.98)');
    g.addColorStop(.55, 'rgba(45,7,16,.92)');
    g.addColorStop(1, 'rgba(8,8,11,.98)');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,23,72,.78)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.save();
    ctx.shadowColor = RED;
    ctx.shadowBlur = 20;
    ctx.strokeStyle = 'rgba(255,23,72,.26)';
    ctx.stroke();
    ctx.restore();

    ctx.font = '800 31px "Barlow Condensed", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = WHITE;
    ctx.fillText(String(text || 'CURRENT').toUpperCase(), x + w / 2, y + h / 2 - 2);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    ctx.fillStyle = linearGlow(ctx, x + 28, y + h - 15, x + w - 28, y + h - 15);
    ctx.fillRect(x + 28, y + h - 15, w - 56, 2);
  }

  function drawPortraitHUD(ctx, driverImg, fallbackIcon, cx, cy, radius = 106) {
    ctx.save();
    ctx.shadowColor = RED;
    ctx.shadowBlur = 40;
    ctx.fillStyle = 'rgba(237,0,56,.24)';
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 12, 0, Math.PI * 2);
    ctx.strokeStyle = RED_BRIGHT;
    ctx.lineWidth = 10;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 2, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,.88)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 5, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = '#0b0d12';
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
    if (driverImg) {
      drawCover(ctx, driverImg, cx - radius + 5, cy - radius + 5, (radius - 5) * 2, (radius - 5) * 2, .28);
    } else if (fallbackIcon) {
      const s = Math.min(fallbackIcon.width, fallbackIcon.height);
      const sx = (fallbackIcon.width - s) / 2;
      const sy = (fallbackIcon.height - s) / 2;
      ctx.globalAlpha = .78;
      ctx.drawImage(fallbackIcon, sx, sy, s, s, cx - 68, cy - 68, 136, 136);
    }
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,.72)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 24, -.72, .72);
    ctx.stroke();
    ctx.strokeStyle = RED;
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 29, 1.75, 4.30);
    ctx.stroke();

    for (let i = 0; i < 14; i += 1) {
      const a = -0.45 + i * .065;
      const x1 = cx + Math.cos(a) * (radius + 31);
      const y1 = cy + Math.sin(a) * (radius + 31);
      const x2 = cx + Math.cos(a) * (radius + 40 + (i % 3 === 0 ? 5 : 0));
      const y2 = cy + Math.sin(a) * (radius + 40 + (i % 3 === 0 ? 5 : 0));
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function fitNameFont(ctx, name, maxWidth) {
    let size = 60;
    while (size > 40) {
      ctx.font = `800 ${size}px "Bebas Neue", Impact, sans-serif`;
      if (ctx.measureText(name).width <= maxWidth) return size;
      size -= 2;
    }
    return size;
  }

  async function buildPaddoxQuoteCanvasV2(q = {}) {
    try { if (document.fonts?.ready) await document.fonts.ready; } catch (_) {}

    const W = 1080;
    const H = 1350;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error('Canvas 2D context unavailable');

    const [brandLogo, brandIcon, driverImg] = await Promise.all([
      loadImageSafe(BRAND_LOCKUP),
      loadImageSafe(BRAND_ICON),
      loadImageSafe(quoteImage(q))
    ]);

    /* BACKGROUND */
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#050509');
    bg.addColorStop(.48, '#07080d');
    bg.addColorStop(1, '#080106');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.globalAlpha = .18;
    ctx.strokeStyle = RED;
    ctx.lineWidth = 1;
    for (let x = -H; x < W + H; x += 36) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + H, H);
      ctx.stroke();
    }
    ctx.restore();

    const atmosphere = ctx.createRadialGradient(990, 650, 30, 990, 650, 500);
    atmosphere.addColorStop(0, 'rgba(237,0,56,.34)');
    atmosphere.addColorStop(.38, 'rgba(160,0,36,.13)');
    atmosphere.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = atmosphere;
    ctx.fillRect(500, 120, 580, 1050);

    /* OUTER FRAME */
    const fx = 54, fy = 42, fw = 972, fh = 1266;
    roundRectPath(ctx, fx, fy, fw, fh, 44);
    ctx.fillStyle = '#05060a';
    ctx.fill();

    strokeGlow(ctx, RED, 26, 2.2, () => roundRectPath(ctx, fx, fy, fw, fh, 44));
    ctx.strokeStyle = 'rgba(255,255,255,.16)';
    ctx.lineWidth = 1;
    roundRectPath(ctx, fx + 12, fy + 12, fw - 24, fh - 24, 36);
    ctx.stroke();

    ctx.fillStyle = linearGlow(ctx, fx, fy + 9, fx + fw, fy + 9);
    ctx.fillRect(fx + 20, fy + 8, fw - 40, 5);

    /* HEADER */
    const hx = 82, hy = 76, hw = 916, hh = 156;
    const hg = ctx.createLinearGradient(hx, hy, hx + hw, hy + hh);
    hg.addColorStop(0, '#16171d');
    hg.addColorStop(.52, '#0b0c11');
    hg.addColorStop(1, '#22020b');
    fillPanel(ctx, hx, hy, hw, hh, 28, { gradient: hg, stroke: 'rgba(255,255,255,.17)' });
    drawCarbon(ctx, hx, hy, hw, hh, .065, 16);

    /* header carbon blade */
    ctx.save();
    roundRectPath(ctx, hx, hy, hw, hh, 28);
    ctx.clip();
    const blade = ctx.createLinearGradient(hx + 300, hy, hx + 610, hy + hh);
    blade.addColorStop(0, 'rgba(255,255,255,.02)');
    blade.addColorStop(.48, 'rgba(255,255,255,.15)');
    blade.addColorStop(1, 'rgba(255,255,255,.015)');
    ctx.fillStyle = blade;
    ctx.beginPath();
    ctx.moveTo(hx + 420, hy);
    ctx.lineTo(hx + 610, hy);
    ctx.lineTo(hx + 475, hy + hh);
    ctx.lineTo(hx + 285, hy + hh);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    drawBrand(ctx, brandLogo, hx + 30, hy + 25, 340, 72, 1);
    ctx.font = '800 21px "Barlow Condensed", Arial, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,.78)';
    ctx.fillText('FAN HUB • VIP QUOTE CARD', hx + 32, hy + 119);

    drawBadge(ctx, String(q.era || 'CURRENT'), hx + hw - 222, hy + 26, 190, 64);

    /* QUOTE PANEL */
    const qx = 82, qy = 250, qw = 916, qh = 548;
    const qg = ctx.createLinearGradient(qx, qy, qx + qw, qy + qh);
    qg.addColorStop(0, '#090a0e');
    qg.addColorStop(.62, '#07080c');
    qg.addColorStop(1, '#170108');
    fillPanel(ctx, qx, qy, qw, qh, 18, { gradient: qg, stroke: 'rgba(255,255,255,.10)' });

    ctx.save();
    roundRectPath(ctx, qx, qy, qw, qh, 18);
    ctx.clip();
    const smoke = ctx.createRadialGradient(qx + qw - 40, qy + qh / 2, 30, qx + qw - 40, qy + qh / 2, 360);
    smoke.addColorStop(0, 'rgba(237,0,56,.24)');
    smoke.addColorStop(.48, 'rgba(120,0,28,.10)');
    smoke.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = smoke;
    ctx.fillRect(qx + 430, qy, 486, qh);
    ctx.restore();

    drawDotMatrix(ctx, qx + qw - 190, qy + 34, 13, 9, 10, RED, .24);
    drawOpenQuotes(ctx, qx + 34, qy + 112, 108);
    drawCloseQuotes(ctx, qx + qw - 126, qy + qh - 16, 100);

    ctx.fillStyle = linearGlow(ctx, qx + 96, qy + 130, qx + 280, qy + 130);
    ctx.fillRect(qx + 96, qy + 128, 170, 3);

    const quote = fitTextLines(ctx, String(q.text || 'PADDOX'), qw - 104, qh - 205, {
      maxSize: 64,
      minSize: 42,
      lineRatio: 1.16,
      maxLines: 6,
      family: '"Barlow Condensed", Arial, sans-serif',
      weight: 500
    });
    ctx.font = `500 ${quote.size}px "Barlow Condensed", Arial, sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,.96)';
    ctx.textBaseline = 'alphabetic';
    let textY = qy + 205;
    quote.lines.forEach((line, index) => {
      ctx.fillText(line, qx + 44, textY + index * quote.lineHeight);
    });

    ctx.save();
    ctx.shadowColor = RED;
    ctx.shadowBlur = 18;
    ctx.fillStyle = linearGlow(ctx, qx + 32, qy + qh - 7, qx + qw - 32, qy + qh - 7);
    ctx.fillRect(qx + 28, qy + qh - 6, qw - 56, 3);
    ctx.restore();

    /* DRIVER PANEL */
    const dx = 82, dy = 822, dw = 916, dh = 296;
    const dg = ctx.createLinearGradient(dx, dy, dx + dw, dy + dh);
    dg.addColorStop(0, '#131419');
    dg.addColorStop(.42, '#090a0f');
    dg.addColorStop(.78, '#35010f');
    dg.addColorStop(1, '#7a001c');
    fillPanel(ctx, dx, dy, dw, dh, 22, { gradient: dg, stroke: 'rgba(255,255,255,.19)', lineWidth: 1.3 });
    drawCarbon(ctx, dx, dy, dw, dh, .08, 16);

    ctx.save();
    roundRectPath(ctx, dx, dy, dw, dh, 22);
    ctx.clip();
    const slashG = ctx.createLinearGradient(dx + 250, dy, dx + 560, dy + dh);
    slashG.addColorStop(0, 'rgba(255,255,255,.02)');
    slashG.addColorStop(.48, 'rgba(237,0,56,.18)');
    slashG.addColorStop(1, 'rgba(255,255,255,.015)');
    ctx.fillStyle = slashG;
    for (let i = 0; i < 3; i += 1) {
      const off = i * 64;
      ctx.beginPath();
      ctx.moveTo(dx + 360 + off, dy);
      ctx.lineTo(dx + 430 + off, dy);
      ctx.lineTo(dx + 270 + off, dy + dh);
      ctx.lineTo(dx + 200 + off, dy + dh);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    ctx.fillStyle = RED_BRIGHT;
    ctx.font = '800 22px "Barlow Condensed", Arial, sans-serif';
    ctx.fillText('DRIVER', dx + 36, dy + 55);
    ctx.fillStyle = linearGlow(ctx, dx + 35, dy + 70, dx + 240, dy + 70);
    ctx.fillRect(dx + 34, dy + 67, 190, 3);

    const driverName = String(q.driver || 'F1 DRIVER').toUpperCase();
    const nameFont = fitNameFont(ctx, driverName, 560);
    ctx.font = `800 ${nameFont}px "Bebas Neue", Impact, sans-serif`;
    ctx.fillStyle = WHITE;
    ctx.shadowColor = 'rgba(0,0,0,.72)';
    ctx.shadowBlur = 12;
    ctx.fillText(driverName, dx + 36, dy + 139);
    ctx.shadowBlur = 0;

    ctx.font = '500 34px "Barlow Condensed", Arial, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,.68)';
    ctx.fillText(String(q.team || q.era || 'PADDOX Quote Library'), dx + 36, dy + 184);

    const tagText = `${String(q.era || 'CURRENT').toUpperCase()} • ${String(q.category || 'CURRENT-GRID').toUpperCase()}`;
    ctx.font = '800 20px "Barlow Condensed", Arial, sans-serif';
    const tagW = Math.min(335, Math.max(250, ctx.measureText(tagText).width + 42));
    roundRectPath(ctx, dx + 36, dy + 211, tagW, 48, 24);
    ctx.fillStyle = 'rgba(0,0,0,.30)';
    ctx.fill();
    ctx.strokeStyle = RED_BRIGHT;
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.88)';
    ctx.textBaseline = 'middle';
    ctx.fillText(tagText, dx + 57, dy + 235);
    ctx.textBaseline = 'alphabetic';

    drawDotMatrix(ctx, dx + 520, dy + 126, 10, 6, 9, RED, .22);
    drawPortraitHUD(ctx, driverImg, brandIcon, dx + dw - 171, dy + 150, 95);

    /* FOOTER */
    const bx = 82, by = 1140, bw = 916, bh = 122;
    const bgFoot = ctx.createLinearGradient(bx, by, bx + bw, by + bh);
    bgFoot.addColorStop(0, '#0c0d12');
    bgFoot.addColorStop(.65, '#090a0e');
    bgFoot.addColorStop(1, '#180108');
    fillPanel(ctx, bx, by, bw, bh, 24, { gradient: bgFoot, stroke: 'rgba(255,255,255,.18)', lineWidth: 1.4 });
    drawCarbon(ctx, bx, by, bw, bh, .055, 15);

    const itemY = by + 43;
    drawShieldIcon(ctx, bx + 35, itemY - 16);
    ctx.font = '800 24px "Barlow Condensed", Arial, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,.80)';
    ctx.fillText('SAVE', bx + 83, itemY + 10);

    ctx.strokeStyle = 'rgba(237,0,56,.70)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(bx + 185, by + 30); ctx.lineTo(bx + 185, by + 91); ctx.stroke();

    drawShareIcon(ctx, bx + 214, itemY - 16);
    ctx.fillStyle = 'rgba(255,255,255,.80)';
    ctx.fillText('SHARE', bx + 263, itemY + 10);

    ctx.beginPath(); ctx.moveTo(bx + 377, by + 30); ctx.lineTo(bx + 377, by + 91); ctx.stroke();

    drawStarIcon(ctx, bx + 413, itemY + 1);
    ctx.fillStyle = 'rgba(255,255,255,.80)';
    ctx.fillText('SUPPORT YOUR GRID', bx + 447, itemY + 10);

    ctx.beginPath(); ctx.moveTo(bx + 675, by + 30); ctx.lineTo(bx + 675, by + 91); ctx.stroke();
    drawBrand(ctx, brandLogo, bx + 704, by + 35, 180, 52, .96);

    /* vignette */
    const vignette = ctx.createRadialGradient(W / 2, H / 2, 300, W / 2, H / 2, 800);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,.26)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, W, H);

    return canvas;
  }

  /* Replace the original global function used by openQuoteImagePreview(). */
  try {
    window.buildQuoteShareCanvas = buildPaddoxQuoteCanvasV2;
  } catch (err) {
    console.error('PADDOX Quote Canvas V2 install failed:', err);
  }

  console.log('PADDOX Quote Share Canvas V2 loaded');
})();
