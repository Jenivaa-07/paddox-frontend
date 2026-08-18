/* ============================================================
   PADDOX ADMIN — Product image drag & drop enhancement
   Local files + images dragged directly from other web pages.
   Web images are imported into Cloudinary when the product saves.
   ============================================================ */
(function paddoxAdminProductDragDrop(){
  'use strict';

  const MAX_IMAGES = 10;
  const MAX_FILE_BYTES = 8 * 1024 * 1024;
  const ACCEPTED_TYPES = new Set(['image/jpeg','image/png','image/webp']);
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
      #pdx-product-dropzone{position:relative;min-height:128px!important;padding:20px!important;transition:.18s ease!important}
      #pdx-product-dropzone.is-dragover{border-color:#e8002d!important;background:rgba(232,0,45,.12)!important;box-shadow:0 0 0 3px rgba(232,0,45,.08)!important}
      #pdx-product-dropzone.is-dragover::after{content:'DROP IMAGE HERE — PADDOX WILL SAVE IT';position:absolute;inset:0;display:grid;place-items:center;padding:20px;background:rgba(8,10,14,.93);color:#fff;text-align:center;font:900 .68rem/1.4 var(--font-c,sans-serif);letter-spacing:.14em;pointer-events:none}
      .pdx-product-upload-status{display:flex;justify-content:space-between;gap:12px;margin-top:9px;color:rgba(255,255,255,.4);font:700 .5rem/1.45 var(--font-c,sans-serif);letter-spacing:.05em}
      .pdx-product-upload-status strong{color:#fff}
      .pdx-product-remote-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin-top:10px}
      .pdx-product-image-card{overflow:visible!important}.pdx-product-image-card img{width:100%;height:100%;object-fit:cover}
      .pdx-product-image-card.is-remote::after{content:'WEB';position:absolute;left:5px;top:5px;z-index:4;padding:4px 5px;background:rgba(4,6,10,.82);color:#fff;font:900 .4rem/1 var(--font-c,sans-serif);letter-spacing:.08em}
      .pdx-product-image-remove{position:absolute;right:5px;top:5px;z-index:5;width:25px;height:25px;display:grid;place-items:center;padding:0;border:1px solid rgba(255,255,255,.22);border-radius:50%;background:rgba(3,5,8,.92);color:#fff;font:900 .9rem/1 sans-serif;cursor:pointer}
      .pdx-product-image-remove:hover{background:#e8002d;border-color:#e8002d}
      @media(max-width:640px){.pdx-product-upload-status{flex-direction:column}.pdx-product-remote-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
    `;
    document.head.appendChild(style);
  }

  function localFiles(input){
    const stateFiles = window.PADDOX_ADMIN_PRODUCTS_STATE?.selectedFiles;
    return Array.isArray(stateFiles) && stateFiles.length ? stateFiles.slice() : Array.from(input?.files || []);
  }

  function applyFiles(input, files){
    const room = Math.max(0, MAX_IMAGES - remoteImages.length);
    const dt = new DataTransfer();
    files.slice(0, room).forEach(file => dt.items.add(file));
    input.files = dt.files;
    input.dispatchEvent(new Event('change',{ bubbles:true }));
  }

  function mergeLocalFiles(input, incoming){
    const room = Math.max(0, MAX_IMAGES - remoteImages.length);
    const existing = localFiles(input);
    const seen = new Set(existing.map(file => `${file.name}|${file.size}|${file.lastModified}`));
    const rejected = [];

    Array.from(incoming || []).forEach(file => {
      if (!ACCEPTED_TYPES.has(String(file.type || '').toLowerCase())) return rejected.push(`${file.name}: JPG, PNG or WebP only`);
      if (file.size > MAX_FILE_BYTES) return rejected.push(`${file.name}: over 8 MB`);
      const key = `${file.name}|${file.size}|${file.lastModified}`;
      if (!seen.has(key)) { seen.add(key); existing.push(file); }
    });

    applyFiles(input, existing.slice(0, room));
    if (rejected.length) toast(`❌ ${rejected[0]}`);
    else if (existing.length > room) toast(`⚠️ Maximum ${MAX_IMAGES} images total`);
    else toast('✅ Product image ready to save');
  }

  function removeLocalFile(input, index){
    const files = localFiles(input);
    files.splice(index,1);
    applyFiles(input, files);
  }

  function httpUrl(value){
    try {
      const url = new URL(String(value || '').trim());
      if (!['http:','https:'].includes(url.protocol)) return '';
      url.hash = '';
      return url.toString();
    } catch (_) { return ''; }
  }

  function imageUrlsFromHtml(html){
    if (!html) return [];
    try {
      const doc = new DOMParser().parseFromString(html,'text/html');
      return Array.from(doc.querySelectorAll('img')).flatMap(img => {
        const values = [];
        if (img.getAttribute('src')) values.push(img.getAttribute('src'));
        const srcset = img.getAttribute('srcset') || '';
        if (srcset) {
          const best = srcset.split(',').map(v => v.trim().split(/\s+/)[0]).filter(Boolean).pop();
          if (best) values.push(best);
        }
        return values;
      });
    } catch (_) { return []; }
  }

  function droppedWebImageUrls(dt){
    if (!dt) return [];
    const values = imageUrlsFromHtml(dt.getData('text/html'));
    const download = dt.getData('DownloadURL');
    const match = download && download.match(/^[^:]+:[^:]+:(https?:\/\/.*)$/i);
    if (match?.[1]) values.push(match[1]);

    const uriList = dt.getData('text/uri-list');
    if (uriList) uriList.split(/\r?\n/).filter(v => v && !v.startsWith('#')).forEach(v => values.push(v));

    const plain = httpUrl(dt.getData('text/plain'));
    if (plain) values.push(plain);

    return [...new Set(values.map(httpUrl).filter(Boolean))];
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
    const offset = localFiles(input).length;

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
      remove.addEventListener('click',() => { remoteImages.splice(index,1); renderRemote(input); updateStatus(input); });
      card.append(img,label,remove);
      grid.appendChild(card);
    });
  }

  function addRemote(input, urls){
    const room = Math.max(0, MAX_IMAGES - localFiles(input).length - remoteImages.length);
    const existing = new Set(remoteImages);
    const fresh = urls.filter(url => !existing.has(url)).slice(0,room);
    if (!fresh.length) return toast(room ? '❌ Drag the image itself, not the page link' : `⚠️ Maximum ${MAX_IMAGES} images total`);
    remoteImages.push(...fresh);
    renderRemote(input);
    updateStatus(input);
    toast('✅ Web image captured — it will be saved to Cloudinary when you create the product');
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
    const local = localFiles(input).length;
    const remote = remoteImages.length;
    const total = local + remote;
    status.innerHTML = total
      ? `<span><strong>${total}/${MAX_IMAGES}</strong> selected · ${local ? `${local} local` : ''}${local && remote ? ' + ' : ''}${remote ? `${remote} web` : ''}</span><span>First image becomes Shop cover</span>`
      : '<span>Drag an image directly from another website, or click to browse</span><span>Web drops save to Cloudinary automatically</span>';
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
      } catch (error) { console.warn('PADDOX remote image injection skipped:',error); }
      return originalFetch(input,init);
    };
  }

  function bind(){
    if (bound) return true;
    const dropzone = document.getElementById('pdx-product-dropzone');
    const input = document.getElementById('pdx-prod-images');
    const preview = document.getElementById('pdx-product-new-images');
    const modal = document.getElementById('pdx-product-editor');
    if (!dropzone || !input || !preview || !modal) return false;
    bound = true;
    wrapFetch();

    const title = dropzone.querySelector('strong');
    const helper = dropzone.querySelector('span');
    if (title) title.textContent = 'DRAG IMAGE HERE — NO DOWNLOAD NEEDED';
    if (helper) helper.textContent = 'Drag an image directly from another browser page, or click to browse · PADDOX saves web drops to Cloudinary automatically';

    let depth = 0;
    const stop = event => { event.preventDefault(); event.stopPropagation(); };
    dropzone.addEventListener('dragenter',event => { stop(event); depth++; dropzone.classList.add('is-dragover'); });
    dropzone.addEventListener('dragover',event => { stop(event); if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy'; dropzone.classList.add('is-dragover'); });
    dropzone.addEventListener('dragleave',event => { stop(event); depth = Math.max(0,depth - 1); if (!depth) dropzone.classList.remove('is-dragover'); });
    dropzone.addEventListener('drop',event => {
      stop(event); depth = 0; dropzone.classList.remove('is-dragover');
      const files = Array.from(event.dataTransfer?.files || []);
      if (files.length) return mergeLocalFiles(input,files);
      const urls = droppedWebImageUrls(event.dataTransfer);
      if (urls.length) return addRemote(input,urls);
      toast('❌ I could not read that image. Drag the image itself, not the surrounding page.');
    });

    input.addEventListener('change',() => setTimeout(() => decorateLocal(input),0));
    new MutationObserver(() => decorateLocal(input)).observe(preview,{ childList:true });

    let open = modal.classList.contains('is-open');
    new MutationObserver(() => {
      const now = modal.classList.contains('is-open');
      if (now !== open) { remoteImages.splice(0); renderRemote(input); updateStatus(input); }
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
