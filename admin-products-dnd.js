/* ============================================================
   PADDOX ADMIN — Product image drag & drop enhancement
   Adds validated drag/drop, file merging, removal controls and
   upload feedback on top of admin-products-live.js.
   ============================================================ */
(function paddoxAdminProductDragDrop(){
  'use strict';

  const MAX_FILES = 10;
  const MAX_FILE_BYTES = 8 * 1024 * 1024;
  const ACCEPTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
  const ACCEPTED_EXTENSIONS = /\.(jpe?g|png|webp)$/i;
  let bound = false;
  let previewObserver = null;

  function showToast(message){
    if (typeof window.showToast === 'function') window.showToast(message);
    else console.log(message);
  }

  function injectStyles(){
    if (document.getElementById('pdx-product-dnd-style')) return;
    const style = document.createElement('style');
    style.id = 'pdx-product-dnd-style';
    style.textContent = `
      #pdx-product-dropzone{
        position:relative;
        min-height:118px!important;
        padding:20px!important;
        transition:border-color .18s ease,background .18s ease,transform .18s ease,box-shadow .18s ease!important;
      }
      #pdx-product-dropzone::before{
        content:'⇩';
        display:grid;
        place-items:center;
        width:34px;
        height:34px;
        margin-bottom:2px;
        border:1px solid rgba(232,0,45,.28);
        border-radius:50%;
        background:rgba(232,0,45,.08);
        color:#ff3158;
        font:900 1rem/1 sans-serif;
      }
      #pdx-product-dropzone strong{font-size:.64rem!important}
      #pdx-product-dropzone span{max-width:520px;text-align:center;line-height:1.55!important}
      #pdx-product-dropzone.is-dragover{
        border-color:#e8002d!important;
        background:linear-gradient(130deg,rgba(232,0,45,.15),rgba(255,255,255,.025))!important;
        box-shadow:0 0 0 3px rgba(232,0,45,.08),0 18px 38px rgba(0,0,0,.22)!important;
        transform:translateY(-1px);
      }
      #pdx-product-dropzone.is-dragover::after{
        content:'DROP IMAGES TO ADD';
        position:absolute;
        inset:0;
        display:grid;
        place-items:center;
        background:rgba(8,10,14,.9);
        color:#fff;
        font:900 .68rem/1 var(--font-c, sans-serif);
        letter-spacing:.16em;
        pointer-events:none;
      }
      .pdx-product-upload-status{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:12px;
        margin-top:9px;
        color:rgba(255,255,255,.38);
        font:700 .49rem/1.45 var(--font-c, sans-serif);
        letter-spacing:.06em;
      }
      .pdx-product-upload-status strong{color:rgba(255,255,255,.72);font-weight:800}
      .pdx-product-image-card{overflow:visible!important}
      .pdx-product-image-card img{overflow:hidden}
      .pdx-product-image-remove{
        position:absolute;
        top:5px;
        right:5px;
        z-index:5;
        width:25px;
        height:25px;
        display:grid;
        place-items:center;
        padding:0;
        border:1px solid rgba(255,255,255,.22);
        border-radius:50%;
        background:rgba(3,5,8,.9);
        color:#fff;
        font:900 .9rem/1 sans-serif;
        cursor:pointer;
        opacity:0;
        transform:scale(.92);
        transition:opacity .16s ease,transform .16s ease,background .16s ease;
      }
      .pdx-product-image-card:hover .pdx-product-image-remove,
      .pdx-product-image-remove:focus-visible{opacity:1;transform:scale(1)}
      .pdx-product-image-remove:hover{background:#e8002d;border-color:#e8002d}
      @media (max-width:640px){
        .pdx-product-upload-status{align-items:flex-start;flex-direction:column}
        .pdx-product-image-remove{opacity:1;transform:none}
      }
    `;
    document.head.appendChild(style);
  }

  function fileKey(file){
    return [file.name, file.size, file.lastModified, file.type].join('::');
  }

  function isAcceptedImage(file){
    if (!file) return false;
    if (ACCEPTED_TYPES.has(String(file.type || '').toLowerCase())) return true;
    return !file.type && ACCEPTED_EXTENSIONS.test(file.name || '');
  }

  function validateFiles(files){
    const valid = [];
    const rejected = [];

    Array.from(files || []).forEach(file => {
      if (!isAcceptedImage(file)) {
        rejected.push(`${file.name}: use JPG, PNG or WebP`);
        return;
      }
      if (file.size > MAX_FILE_BYTES) {
        rejected.push(`${file.name}: larger than 8 MB`);
        return;
      }
      valid.push(file);
    });

    return { valid, rejected };
  }

  function existingFiles(input){
    const live = window.PADDOX_ADMIN_PRODUCTS_STATE?.selectedFiles;
    if (Array.isArray(live) && live.length) return live.slice();
    return Array.from(input?.files || []);
  }

  function applyFiles(input, files){
    if (!input) return;
    const dt = new DataTransfer();
    files.slice(0, MAX_FILES).forEach(file => dt.items.add(file));
    input.files = dt.files;
    input.dispatchEvent(new Event('change', { bubbles:true }));
  }

  function mergeFiles(input, incoming){
    const { valid, rejected } = validateFiles(incoming);
    const combined = [];
    const seen = new Set();

    [...existingFiles(input), ...valid].forEach(file => {
      const key = fileKey(file);
      if (seen.has(key)) return;
      seen.add(key);
      combined.push(file);
    });

    const overflow = Math.max(0, combined.length - MAX_FILES);
    const selected = combined.slice(0, MAX_FILES);
    applyFiles(input, selected);

    if (rejected.length) showToast(`❌ ${rejected[0]}${rejected.length > 1 ? ` (+${rejected.length - 1} more)` : ''}`);
    else if (overflow) showToast(`⚠️ Maximum ${MAX_FILES} product images allowed`);
    else if (valid.length) showToast(`✅ ${selected.length} image${selected.length === 1 ? '' : 's'} ready to upload`);
  }

  function removeFile(input, index){
    const files = existingFiles(input);
    if (index < 0 || index >= files.length) return;
    files.splice(index, 1);
    applyFiles(input, files);
    showToast('✅ Image removed from upload queue');
  }

  function updateStatus(input){
    const host = document.querySelector('.pdx-product-upload');
    if (!host) return;
    let status = host.querySelector('.pdx-product-upload-status');
    if (!status) {
      status = document.createElement('div');
      status.className = 'pdx-product-upload-status';
      const grid = host.querySelector('#pdx-product-new-images');
      if (grid) host.insertBefore(status, grid);
      else host.appendChild(status);
    }

    const files = existingFiles(input);
    const totalBytes = files.reduce((sum, file) => sum + Number(file.size || 0), 0);
    const totalMB = totalBytes ? (totalBytes / (1024 * 1024)).toFixed(totalBytes > 10 * 1024 * 1024 ? 1 : 2) : '0';
    status.innerHTML = files.length
      ? `<span><strong>${files.length}/${MAX_FILES}</strong> selected · ${totalMB} MB total</span><span>First image is the Shop cover</span>`
      : '<span>Drag images here or click to browse</span><span>JPG · PNG · WebP · 8 MB each</span>';
  }

  function decoratePreviews(input){
    const grid = document.getElementById('pdx-product-new-images');
    if (!grid) return;
    const cards = Array.from(grid.querySelectorAll('.pdx-product-image-card'));

    cards.forEach((card, index) => {
      let remove = card.querySelector('.pdx-product-image-remove');
      if (!remove) {
        remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'pdx-product-image-remove';
        remove.setAttribute('aria-label', `Remove image ${index + 1}`);
        remove.textContent = '×';
        remove.addEventListener('click', event => {
          event.preventDefault();
          event.stopPropagation();
          const currentCards = Array.from(grid.querySelectorAll('.pdx-product-image-card'));
          removeFile(input, currentCards.indexOf(card));
        });
        card.appendChild(remove);
      }
    });

    updateStatus(input);
  }

  function bind(){
    if (bound) return true;
    const dropzone = document.getElementById('pdx-product-dropzone');
    const input = document.getElementById('pdx-prod-images');
    const previewGrid = document.getElementById('pdx-product-new-images');
    if (!dropzone || !input || !previewGrid) return false;

    bound = true;
    dropzone.querySelector('strong')?.replaceChildren(document.createTextNode('DRAG & DROP PRODUCT IMAGES'));
    const helper = dropzone.querySelector('span');
    if (helper) helper.textContent = 'Drop JPG / PNG / WebP here, or click to browse · up to 10 images · 8 MB each · first image becomes Shop cover';

    let dragDepth = 0;
    const prevent = event => {
      event.preventDefault();
      event.stopPropagation();
    };

    dropzone.addEventListener('dragenter', event => {
      prevent(event);
      dragDepth += 1;
      dropzone.classList.add('is-dragover');
    });

    dropzone.addEventListener('dragover', event => {
      prevent(event);
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
      dropzone.classList.add('is-dragover');
    });

    dropzone.addEventListener('dragleave', event => {
      prevent(event);
      dragDepth = Math.max(0, dragDepth - 1);
      if (!dragDepth) dropzone.classList.remove('is-dragover');
    });

    dropzone.addEventListener('drop', event => {
      prevent(event);
      dragDepth = 0;
      dropzone.classList.remove('is-dragover');
      const files = event.dataTransfer?.files;
      if (files?.length) mergeFiles(input, files);
    });

    input.addEventListener('change', () => setTimeout(() => decoratePreviews(input), 0));

    previewObserver = new MutationObserver(() => decoratePreviews(input));
    previewObserver.observe(previewGrid, { childList:true });

    updateStatus(input);
    decoratePreviews(input);
    return true;
  }

  function bootstrap(){
    injectStyles();
    if (bind()) return;

    const observer = new MutationObserver(() => {
      if (bind()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList:true, subtree:true });

    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      if (bind() || attempts >= 30) clearInterval(timer);
    }, 250);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootstrap, { once:true });
  else bootstrap();
})();
