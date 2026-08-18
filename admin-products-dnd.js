/* ============================================================
   PADDOX ADMIN — Browser-to-product image drag/drop
   Handles real local files AND image payloads dragged directly
   from another browser page without requiring a manual download.
   ============================================================ */
(function paddoxAdminProductDragDrop(){
  'use strict';

  const MAX_IMAGES = 10;
  const MAX_FILE_BYTES = 8 * 1024 * 1024;
  const remoteImages = [];
  let bound = false;
  let fetchWrapped = false;

  window.PADDOX_ADMIN_REMOTE_IMAGES = remoteImages;

  function toast(message){
    if (typeof window.showToast === 'function') window.showToast(message);
    else console.log(message);
  }

  function installStyles(){
    if (document.getElementById('pdx-product-dnd-style')) return;
    const style = document.createElement('style');
    style.id = 'pdx-product-dnd-style';
    style.textContent = `
      #pdx-product-dropzone{position:relative;min-height:132px!important;padding:20px!important;transition:.18s ease!important}
      #pdx-product-dropzone.is-dragover{border-color:#e8002d!important;background:rgba(232,0,45,.12)!important;box-shadow:0 0 0 3px rgba(232,0,45,.08)!important}
      #pdx-product-dropzone.is-dragover::after{content:'DROP IMAGE HERE — PADDOX WILL CAPTURE IT';position:absolute;inset:0;z-index:20;display:grid;place-items:center;padding:20px;background:rgba(8,10,14,.94);color:#fff;text-align:center;font:900 .68rem/1.4 var(--font-c,sans-serif);letter-spacing:.14em;pointer-events:none}
      .pdx-product-upload-status{display:flex;justify-content:space-between;gap:12px;margin-top:10px;color:rgba(255,255,255,.42);font:700 .5rem/1.45 var(--font-c,sans-serif);letter-spacing:.05em}
      .pdx-product-upload-status strong{color:#fff}
      .pdx-product-remote-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin-top:10px}
      .pdx-product-image-card{position:relative!important;overflow:hidden!important;background:#0c0e12}
      .pdx-product-image-card img{width:100%;height:100%;object-fit:contain;background:#111318}
      .pdx-product-image-card.is-remote::after{content:'WEB';position:absolute;left:5px;top:5px;z-index:4;padding:4px 5px;background:rgba(4,6,10,.86);color:#fff;font:900 .4rem/1 var(--font-c,sans-serif);letter-spacing:.08em}
      .pdx-product-image-remove{position:absolute;right:5px;top:5px;z-index:8;width:25px;height:25px;display:grid;place-items:center;padding:0;border:1px solid rgba(255,255,255,.25);border-radius:50%;background:rgba(3,5,8,.94);color:#fff;font:900 .9rem/1 sans-serif;cursor:pointer}
      .pdx-product-image-remove:hover{background:#e8002d;border-color:#e8002d}
      .pdx-product-capture-note{margin-top:8px;color:rgba(255,255,255,.28);font:700 .48rem/1.5 var(--font-c,sans-serif);letter-spacing:.05em}
      @media(max-width:640px){.pdx-product-upload-status{flex-direction:column}.pdx-product-remote-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
    `;
    document.head.appendChild(style);
  }

  function localFiles(input){
    const stateFiles = window.PADDOX_ADMIN_PRODUCTS_STATE?.selectedFiles;
    return Array.isArray(stateFiles) && stateFiles.length ? stateFiles.slice() : Array.from(input?.files || []);
  }

  function validLocalImage(file){
    return !!file && Number(file.size || 0) > 0 && Number(file.size || 0) <= MAX_FILE_BYTES && /^image\/(jpeg|jpg|png|webp)$/i.test(String(file.type || ''));
  }

  function applyFiles(input, files){
    if (!input) return;
    const room = Math.max(0, MAX_IMAGES - remoteImages.length);
    const dt = new DataTransfer();
    files.filter(validLocalImage).slice(0,room).forEach(file => dt.items.add(file));
    input.files = dt.files;
    input.dispatchEvent(new Event('change',{ bubbles:true }));
  }

  function mergeLocalFiles(input, incoming){
    const room = Math.max(0,MAX_IMAGES - remoteImages.length);
    const existing = localFiles(input).filter(validLocalImage);
    const seen = new Set(existing.map(file => `${file.name}|${file.size}|${file.lastModified}`));

    Array.from(incoming || []).filter(validLocalImage).forEach(file => {
      const key = `${file.name}|${file.size}|${file.lastModified}`;
      if (!seen.has(key)) { seen.add(key); existing.push(file); }
    });

    applyFiles(input,existing.slice(0,room));
    return existing.length > 0;
  }

  function removeLocalFile(input,index){
    const files = localFiles(input).filter(validLocalImage);
    files.splice(index,1);
    applyFiles(input,files);
  }

  function normalizeHttpUrl(value,base=''){
    try {
      const raw = String(value || '').trim();
      if (!raw || raw.startsWith('data:') || raw.startsWith('blob:')) return '';
      const url = base ? new URL(raw,base) : new URL(raw.startsWith('//') ? `https:${raw}` : raw);
      if (!['http:','https:'].includes(url.protocol)) return '';
      url.hash = '';
      return url.toString();
    } catch (_) { return ''; }
  }

  function srcsetUrls(value){
    return String(value || '').split(',').map(entry => entry.trim().split(/\s+/)[0]).filter(Boolean).reverse();
  }

  function urlsFromDraggedHtml(html,base=''){
    if (!html) return [];
    try {
      const doc = new DOMParser().parseFromString(html,'text/html');
      const values = [];
      doc.querySelectorAll('img,source').forEach(node => {
        ['src','data-src','data-original','data-lazy-src'].forEach(attr => {
          const value = node.getAttribute(attr);
          if (value) values.push(value);
        });
        ['srcset','data-srcset'].forEach(attr => values.push(...srcsetUrls(node.getAttribute(attr))));
      });
      return values.map(value => normalizeHttpUrl(value,base)).filter(Boolean);
    } catch (_) { return []; }
  }

  function directUrls(dt){
    const values = [];
    const uriList = dt?.getData('text/uri-list') || '';
    uriList.split(/\r?\n/).filter(line => line && !line.startsWith('#')).forEach(line => values.push(line));

    const moz = dt?.getData('text/x-moz-url') || '';
    if (moz) values.push(moz.split(/\r?\n/)[0]);

    const plain = dt?.getData('text/plain') || '';
    if (/^https?:\/\//i.test(plain.trim())) values.push(plain.trim());

    const download = dt?.getData('DownloadURL') || '';
    const match = download.match(/:(https?:\/\/.*)$/i);
    if (match?.[1]) values.push(match[1]);

    return values.map(value => normalizeHttpUrl(value)).filter(Boolean);
  }

  function likelyImageUrl(url){
    const text = String(url || '').toLowerCase();
    return /\.(?:jpe?g|png|webp|avif)(?:$|[?#])/.test(text) || /(?:image|images|img|media|cdn|product|fanatics|cloudinary|akamai)/.test(text);
  }

  function extractWebUrls(dt){
    if (!dt) return [];
    const fallback = directUrls(dt);
    const base = fallback[0] || '';
    const htmlUrls = urlsFromDraggedHtml(dt.getData('text/html') || '',base);

    // HTML <img> sources are the most reliable signal. Only fall back to
    // URI/plain-text payloads if the browser did not expose an image element.
    const candidates = htmlUrls.length ? htmlUrls : fallback.filter(likelyImageUrl);
    return [...new Set(candidates)].slice(0,MAX_IMAGES);
  }

  function remoteGrid(){
    const host = document.querySelector('.pdx-product-upload');
    if (!host) return null;
    let grid = host.querySelector('#pdx-product-remote-images');
    if (!grid) {
      grid = document.createElement('div');
      grid.id = 'pdx-product-remote-images';
      grid.className = 'pdx-product-remote-grid';
      host.appendChild(grid);
    }
    return grid;
  }

  function renderRemote(input){
    const grid = remoteGrid();
    if (!grid) return;
    grid.innerHTML = '';
    const offset = localFiles(input).filter(validLocalImage).length;

    remoteImages.forEach((url,index) => {
      const card = document.createElement('div');
      card.className = 'pdx-product-image-card is-new is-remote';

      const img = document.createElement('img');
      img.src = url;
      img.alt = `Dropped web image ${index + 1}`;
      img.referrerPolicy = 'no-referrer';

      const label = document.createElement('span');
      label.textContent = offset === 0 && index === 0 ? 'NEW COVER' : `WEB IMAGE ${offset + index + 1}`;

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'pdx-product-image-remove';
      remove.textContent = '×';
      remove.setAttribute('aria-label',`Remove web image ${index + 1}`);
      remove.addEventListener('click',() => {
        remoteImages.splice(index,1);
        renderRemote(input);
        updateStatus(input);
      });

      card.append(img,label,remove);
      grid.appendChild(card);
    });
  }

  function addRemote(input,urls){
    const localCount = localFiles(input).filter(validLocalImage).length;
    const room = Math.max(0,MAX_IMAGES - localCount - remoteImages.length);
    const seen = new Set(remoteImages);
    const fresh = urls.filter(url => !seen.has(url)).slice(0,room);
    if (!fresh.length) return false;
    remoteImages.push(...fresh);
    renderRemote(input);
    updateStatus(input);
    return true;
  }

  function updateStatus(input){
    const host = document.querySelector('.pdx-product-upload');
    if (!host) return;
    let status = host.querySelector('.pdx-product-upload-status');
    if (!status) {
      status = document.createElement('div');
      status.className = 'pdx-product-upload-status';
      host.appendChild(status);
    }

    const local = localFiles(input).filter(validLocalImage).length;
    const remote = remoteImages.length;
    const total = local + remote;
    status.innerHTML = total
      ? `<span><strong>${total}/${MAX_IMAGES}</strong> captured · ${local ? `${local} local` : ''}${local && remote ? ' + ' : ''}${remote ? `${remote} web` : ''}</span><span>First image becomes Shop cover</span>`
      : '<span>Drag the image itself from another browser page</span><span>No download needed</span>';
  }

  function decorateLocal(input){
    const grid = document.getElementById('pdx-product-new-images');
    if (!grid) return;
    Array.from(grid.querySelectorAll('.pdx-product-image-card')).forEach((card,index) => {
      if (card.querySelector('.pdx-product-image-remove')) return;
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'pdx-product-image-remove';
      remove.textContent = '×';
      remove.setAttribute('aria-label',`Remove image ${index + 1}`);
      remove.addEventListener('click',() => removeLocalFile(input,index));
      card.appendChild(remove);
    });
    renderRemote(input);
    updateStatus(input);
  }

  function wrapFetch(){
    if (fetchWrapped || typeof window.fetch !== 'function') return;
    fetchWrapped = true;
    const originalFetch = window.fetch.bind(window);
    window.fetch = function(input,init){
      try {
        const method = String(init?.method || 'GET').toUpperCase();
        const pathname = new URL(typeof input === 'string' ? input : input?.url || '',window.location.origin).pathname;
        const productWrite = (method === 'POST' && pathname === '/api/products') || (method === 'PUT' && /^\/api\/products\/[^/]+$/.test(pathname));
        if (productWrite && init?.body instanceof FormData && remoteImages.length) {
          init.body.delete('remoteImages');
          init.body.append('remoteImages',JSON.stringify(remoteImages.slice(0,MAX_IMAGES)));
        }
      } catch (error) {
        console.warn('PADDOX remote image injection skipped:',error);
      }
      return originalFetch(input,init);
    };
  }

  function bind(){
    if (bound) return true;
    const dropzone = document.getElementById('pdx-product-dropzone');
    const uploadHost = document.querySelector('.pdx-product-upload');
    const input = document.getElementById('pdx-prod-images');
    const preview = document.getElementById('pdx-product-new-images');
    const modal = document.getElementById('pdx-product-editor');
    if (!dropzone || !uploadHost || !input || !preview || !modal) return false;

    bound = true;
    wrapFetch();

    const title = dropzone.querySelector('strong');
    const helper = dropzone.querySelector('span');
    if (title) title.textContent = 'DRAG IMAGE HERE — NO DOWNLOAD NEEDED';
    if (helper) helper.textContent = 'Drag the product image itself from another website and release it here. PADDOX captures the browser image payload and saves it to Cloudinary.';

    let note = uploadHost.querySelector('.pdx-product-capture-note');
    if (!note) {
      note = document.createElement('div');
      note.className = 'pdx-product-capture-note';
      note.textContent = 'Tip: drag the actual product picture, not the page/card around it.';
      dropzone.insertAdjacentElement('afterend',note);
    }

    let depth = 0;
    const prevent = event => { event.preventDefault(); event.stopPropagation(); };

    uploadHost.addEventListener('dragenter',event => {
      prevent(event);
      depth += 1;
      dropzone.classList.add('is-dragover');
    },true);

    uploadHost.addEventListener('dragover',event => {
      prevent(event);
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
      dropzone.classList.add('is-dragover');
    },true);

    uploadHost.addEventListener('dragleave',event => {
      prevent(event);
      depth = Math.max(0,depth - 1);
      if (!depth) dropzone.classList.remove('is-dragover');
    },true);

    uploadHost.addEventListener('drop',event => {
      prevent(event);
      depth = 0;
      dropzone.classList.remove('is-dragover');

      const dt = event.dataTransfer;
      const droppedFiles = Array.from(dt?.files || []);
      const validFiles = droppedFiles.filter(validLocalImage);
      const urls = extractWebUrls(dt);

      let captured = false;
      if (validFiles.length) captured = mergeLocalFiles(input,validFiles) || captured;
      if (urls.length && localFiles(input).filter(validLocalImage).length < MAX_IMAGES) captured = addRemote(input,urls) || captured;

      decorateLocal(input);

      if (captured) {
        const count = localFiles(input).filter(validLocalImage).length + remoteImages.length;
        toast(`✅ Image captured! ${count}/${MAX_IMAGES} ready — click CREATE PRODUCT to save it`);
      } else {
        const types = Array.from(dt?.types || []).join(', ');
        console.warn('PADDOX could not capture dropped image payload. Drag types:',types);
        toast('❌ Browser did not expose that picture as an image. Drag the picture itself (not the product card/link).');
      }
    },true);

    input.addEventListener('change',() => setTimeout(() => decorateLocal(input),0));
    new MutationObserver(() => decorateLocal(input)).observe(preview,{ childList:true });

    let open = modal.classList.contains('is-open');
    new MutationObserver(() => {
      const now = modal.classList.contains('is-open');
      if (now !== open) {
        remoteImages.splice(0);
        renderRemote(input);
        updateStatus(input);
      }
      open = now;
    }).observe(modal,{ attributes:true,attributeFilter:['class'] });

    decorateLocal(input);
    return true;
  }

  function bootstrap(){
    installStyles();
    wrapFetch();
    if (bind()) return;
    const observer = new MutationObserver(() => { if (bind()) observer.disconnect(); });
    observer.observe(document.documentElement,{ childList:true,subtree:true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',bootstrap,{ once:true });
  else bootstrap();
})();
