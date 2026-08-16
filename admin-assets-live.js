/* ============================================================
   PADDOX ADMIN — Digital Assets Live Controller
   Owns wallpaper vault management after legacy Admin initialises.
   ============================================================ */
(function paddoxAdminAssetsLive(){
  'use strict';

  const REFRESH_MS = 45000;
  const state = {
    assets: [],
    filtered: [],
    syncing: false,
    editingId: null,
    error: '',
    lastSync: null,
    stagedDesktop: null,
    stagedMobile: null,
    stagedThumbnail: null
  };
  let refreshTimer = null;
  let bound = false;

  function esc(value=''){
    return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  }
  function norm(value=''){ return String(value || '').trim().toLowerCase(); }
  function money(value=0){ return `₹${Number(value || 0).toLocaleString('en-IN')}`; }
  function toast(message){ if (typeof window.showToast === 'function') window.showToast(message); else console.log(message); }
  function isAssetsPage(){ return document.getElementById('adm-assets')?.classList.contains('on'); }
  function extract(payload={}){
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.assets)) return payload.assets;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.data?.assets)) return payload.data.assets;
    return [];
  }
  function previewUrl(asset={}){
    return asset?.thumbnail?.url || asset?.image?.url || asset?.desktop?.url || asset?.mobile?.url || '';
  }
  function hasDesktop(asset={}){ return !!(asset?.desktop?.url || (asset?.orientation === 'desktop' && asset?.image?.url)); }
  function hasMobile(asset={}){ return !!(asset?.mobile?.url || (asset?.orientation === 'mobile' && asset?.image?.url)); }
  function accessLabel(asset={}){ return asset?.type === 'premium' ? `PREMIUM · ${money(asset?.price || 0)}` : 'FREE'; }
  function orientationLabel(value='desktop'){
    return ({desktop:'DESKTOP',mobile:'MOBILE',both:'DESKTOP + MOBILE'})[String(value)] || String(value).toUpperCase();
  }
  function categoryLabel(value='wallpaper'){ return String(value || 'wallpaper').replace(/_/g,' ').toUpperCase(); }

  function ensureStyles(){
    if (document.getElementById('pdx-admin-assets-style')) return;
    const style = document.createElement('style');
    style.id = 'pdx-admin-assets-style';
    style.textContent = `
      html:not([data-admin-page="products"]) #adm-action-btn{display:none!important}
      body.pdx-admin-runtime #adm-assets .assets-command-card{position:relative;overflow:hidden;margin-bottom:16px;padding:30px 31px;display:flex;justify-content:space-between;align-items:center;gap:24px;border:1px solid rgba(255,255,255,.09);border-left:4px solid #e8002d;background:radial-gradient(circle at 84% 8%,rgba(232,0,45,.16),transparent 31%),linear-gradient(112deg,rgba(232,0,45,.105),rgba(255,255,255,.018) 45%,rgba(255,255,255,.008));box-shadow:0 24px 60px rgba(0,0,0,.2)}
      body.pdx-admin-runtime #adm-assets .assets-command-card:after{content:"VAULT";position:absolute;right:24px;bottom:-38px;color:rgba(255,255,255,.024);font:900 7rem/1 var(--font-d);pointer-events:none}
      body.pdx-admin-runtime #adm-assets .assets-command-card>div,body.pdx-admin-runtime #adm-assets .assets-command-btn{position:relative;z-index:2}
      body.pdx-admin-runtime #adm-assets .assets-live-kicker{display:flex;align-items:center;gap:8px;color:#e8002d!important;font:900 .54rem/1 var(--font-c)!important;letter-spacing:.19em!important}
      body.pdx-admin-runtime #adm-assets .assets-live-kicker span{width:7px;height:7px;border-radius:50%;background:#35e5a8;box-shadow:0 0 13px rgba(53,229,168,.8)}
      body.pdx-admin-runtime #adm-assets .assets-command-card h2{margin:11px 0 8px!important;color:#fff!important;font:900 clamp(2.25rem,3.2vw,3.7rem)/.9 var(--font-d)!important;letter-spacing:.025em!important}
      body.pdx-admin-runtime #adm-assets .assets-command-card p{max-width:780px!important;margin:0!important;color:rgba(255,255,255,.46)!important;font-size:.69rem!important;line-height:1.6!important}
      body.pdx-admin-runtime #adm-assets .assets-command-btn{min-height:44px;padding:0 18px;border:1px solid #e8002d!important;background:#e8002d!important;color:#fff!important;font:900 .53rem/1 var(--font-c)!important;letter-spacing:.11em!important;cursor:pointer;box-shadow:0 12px 30px rgba(232,0,45,.18)}
      body.pdx-admin-runtime #adm-assets .pdx-assets-stat-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:11px;margin-bottom:14px}
      body.pdx-admin-runtime #adm-assets .pdx-assets-stat{position:relative;min-height:102px;padding:18px 19px;overflow:hidden;border:1px solid rgba(255,255,255,.085);background:linear-gradient(140deg,rgba(255,255,255,.033),rgba(255,255,255,.01)),#0b0d12}
      body.pdx-admin-runtime #adm-assets .pdx-assets-stat:before{content:"";position:absolute;left:0;top:0;width:3px;height:100%;background:#e8002d}
      body.pdx-admin-runtime #adm-assets .pdx-assets-stat:nth-child(2):before{background:#35e5a8}body.pdx-admin-runtime #adm-assets .pdx-assets-stat:nth-child(3):before{background:#d9b865}body.pdx-admin-runtime #adm-assets .pdx-assets-stat:nth-child(4):before{background:#5596ff}
      body.pdx-admin-runtime #adm-assets .pdx-assets-stat span{display:block;color:rgba(255,255,255,.34);font:800 .49rem/1 var(--font-c);letter-spacing:.14em;text-transform:uppercase}
      body.pdx-admin-runtime #adm-assets .pdx-assets-stat strong{display:block;margin-top:13px;color:#fff;font:900 2.05rem/.9 var(--font-d)}
      body.pdx-admin-runtime #adm-assets .upload-zone-pro{min-height:112px!important;margin-bottom:13px!important;padding:20px!important;border:1px dashed rgba(232,0,45,.28)!important;background:radial-gradient(circle at 18% 50%,rgba(232,0,45,.08),transparent 32%),#090b0f!important;cursor:pointer;transition:.2s ease}
      body.pdx-admin-runtime #adm-assets .upload-zone-pro:hover,body.pdx-admin-runtime #adm-assets .upload-zone-pro.is-dragging{border-color:rgba(232,0,45,.7)!important;background:rgba(232,0,45,.055)!important;transform:translateY(-1px)}
      body.pdx-admin-runtime #adm-assets .upload-zone-pro .upload-icon{color:#e8002d!important;font-size:1.55rem!important}
      body.pdx-admin-runtime #adm-assets .upload-zone-pro .upload-text{color:rgba(255,255,255,.42)!important;font-size:.65rem!important;line-height:1.55!important}.upload-zone-pro .upload-text strong{color:#fff!important}
      body.pdx-admin-runtime #adm-assets .assets-toolbar-pro{margin-bottom:14px!important;padding:12px!important;border:1px solid rgba(255,255,255,.075);background:rgba(255,255,255,.016)}
      body.pdx-admin-runtime #adm-assets .assets-toolbar-pro .toolbar-filters{display:grid!important;grid-template-columns:180px 170px 190px;gap:9px!important}
      body.pdx-admin-runtime #adm-assets .assets-toolbar-pro .adm-select{min-height:42px!important;border-color:rgba(255,255,255,.09)!important;background:#090b0f!important}
      body.pdx-admin-runtime #adm-assets .asset-meta-info{margin-left:auto;color:rgba(255,255,255,.34)!important;font:750 .48rem/1 var(--font-c)!important;letter-spacing:.08em!important;white-space:nowrap}
      body.pdx-admin-runtime #adm-assets .assets-grid-pro{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:13px!important}
      .pdx-asset-card{position:relative;overflow:hidden;border:1px solid rgba(255,255,255,.08);background:#0a0c10;box-shadow:0 22px 60px rgba(0,0,0,.2);transition:.22s ease}.pdx-asset-card:hover{transform:translateY(-2px);border-color:rgba(232,0,45,.24)}.pdx-asset-card.is-paused{opacity:.62}.pdx-asset-media{position:relative;aspect-ratio:16/10;overflow:hidden;background:linear-gradient(145deg,#151820,#07090d)}.pdx-asset-media img{width:100%;height:100%;object-fit:cover;transition:transform .45s ease}.pdx-asset-card:hover .pdx-asset-media img{transform:scale(1.035)}.pdx-asset-media:after{content:"";position:absolute;inset:auto 0 0;height:42%;background:linear-gradient(transparent,rgba(0,0,0,.86))}.pdx-asset-state{position:absolute;top:11px;left:11px;z-index:2;display:inline-flex;align-items:center;gap:6px;padding:7px 9px;border:1px solid rgba(255,255,255,.13);background:rgba(7,8,12,.8);backdrop-filter:blur(10px);color:#35e5a8;font:850 .44rem/1 var(--font-c);letter-spacing:.08em}.pdx-asset-state:before{content:"";width:6px;height:6px;border-radius:50%;background:currentColor;box-shadow:0 0 10px currentColor}.pdx-asset-state.is-paused{color:#ff6a82}.pdx-asset-access{position:absolute;top:11px;right:11px;z-index:2;padding:7px 9px;border:1px solid rgba(232,0,45,.28);background:rgba(232,0,45,.12);color:#fff;font:850 .44rem/1 var(--font-c);letter-spacing:.08em}.pdx-asset-body{padding:15px}.pdx-asset-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.pdx-asset-head h3{margin:0;max-width:75%;overflow:hidden;color:#fff;font:850 .83rem/1.25 var(--font-b);text-overflow:ellipsis;white-space:nowrap}.pdx-asset-head span{color:#e8002d;font:900 .73rem/1 var(--font-d);white-space:nowrap}.pdx-asset-meta{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}.pdx-asset-meta span{padding:6px 7px;border:1px solid rgba(255,255,255,.075);background:rgba(255,255,255,.018);color:rgba(255,255,255,.38);font:750 .43rem/1 var(--font-c);letter-spacing:.06em}.pdx-asset-variants{display:flex;align-items:center;gap:7px;margin-top:11px;color:rgba(255,255,255,.31);font-size:.53rem}.pdx-asset-variants b{color:rgba(255,255,255,.62)}.pdx-asset-actions{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:13px}.pdx-asset-actions button{min-height:34px;border:1px solid rgba(255,255,255,.09);background:#11141a;color:rgba(255,255,255,.57);font:850 .44rem/1 var(--font-c);letter-spacing:.07em;cursor:pointer}.pdx-asset-actions .is-edit{border-color:rgba(232,0,45,.28);background:rgba(232,0,45,.08);color:#fff}.pdx-asset-actions .is-toggle{color:#35e5a8;border-color:rgba(53,229,168,.17)}.pdx-asset-actions .is-delete{color:#ff6a82;border-color:rgba(255,72,103,.17)}.pdx-asset-actions .is-delete.is-armed{background:#c50026;color:#fff;border-color:#e8002d}.pdx-asset-actions button:hover{border-color:rgba(255,255,255,.22);color:#fff}
      .pdx-assets-empty{grid-column:1/-1;display:grid;place-items:center;min-height:260px;padding:35px;border:1px solid rgba(255,255,255,.075);background:#090b0f;text-align:center;color:rgba(255,255,255,.34)}.pdx-assets-empty strong{display:block;margin-bottom:8px;color:#fff;font:900 1.4rem/1 var(--font-d);letter-spacing:.07em}.pdx-assets-empty button{margin-top:12px;min-height:38px;padding:0 13px;border:1px solid rgba(232,0,45,.32);background:rgba(232,0,45,.09);color:#fff;font:850 .48rem/1 var(--font-c);letter-spacing:.08em;cursor:pointer}
      .pdx-asset-editor{display:none;position:fixed;inset:0;z-index:100700}.pdx-asset-editor.is-open{display:block}.pdx-asset-editor-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.82);backdrop-filter:blur(12px)}.pdx-asset-editor-panel{position:absolute;right:0;top:0;width:min(780px,97vw);height:100%;overflow:auto;padding:28px;background:radial-gradient(circle at 100% 0,rgba(232,0,45,.13),transparent 31%),#080a0e;border-left:1px solid rgba(232,0,45,.24);box-shadow:-35px 0 90px rgba(0,0,0,.58)}.pdx-asset-editor-head{display:flex;justify-content:space-between;gap:20px;padding-bottom:20px;border-bottom:1px solid rgba(255,255,255,.08)}.pdx-asset-editor-kicker{color:#e8002d;font:900 .51rem/1 var(--font-c);letter-spacing:.18em}.pdx-asset-editor-head h2{margin:10px 0 6px;color:#fff;font:900 clamp(2.5rem,5vw,4rem)/.85 var(--font-d)}.pdx-asset-editor-head p{margin:0;color:rgba(255,255,255,.36);font-size:.64rem}.pdx-asset-editor-close{width:40px;height:40px;border:1px solid rgba(255,255,255,.1);background:#101319;color:#fff;font-size:1.3rem;cursor:pointer}.pdx-asset-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:11px;padding:20px 0}.pdx-asset-form-grid label{display:flex;flex-direction:column;gap:8px}.pdx-asset-form-grid label.is-wide{grid-column:1/-1}.pdx-asset-form-grid label>span{color:rgba(255,255,255,.36);font:800 .48rem/1 var(--font-c);letter-spacing:.13em}.pdx-asset-form-grid input,.pdx-asset-form-grid select,.pdx-asset-form-grid textarea{width:100%;min-height:43px;padding:10px 11px;border:1px solid rgba(255,255,255,.095);outline:0;background:#0d1015;color:#fff;font-family:var(--font-b);font-size:.68rem}.pdx-asset-form-grid textarea{min-height:92px;resize:vertical}.pdx-asset-form-grid input:focus,.pdx-asset-form-grid select:focus,.pdx-asset-form-grid textarea:focus{border-color:rgba(232,0,45,.5);box-shadow:0 0 0 3px rgba(232,0,45,.06)}.pdx-asset-files{grid-column:1/-1;display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.pdx-asset-file{position:relative;min-height:112px;display:flex!important;align-items:center!important;justify-content:center!important;padding:12px;border:1px dashed rgba(255,255,255,.13);background:rgba(255,255,255,.017);cursor:pointer;text-align:center}.pdx-asset-file:hover{border-color:rgba(232,0,45,.45)}.pdx-asset-file input{position:absolute;inset:0;opacity:0;cursor:pointer}.pdx-asset-file strong{display:block;color:#fff;font:850 .52rem/1.2 var(--font-c);letter-spacing:.08em}.pdx-asset-file small{display:block;margin-top:6px;color:rgba(255,255,255,.28);font-size:.5rem;line-height:1.35}.pdx-asset-file.has-file{border-color:rgba(53,229,168,.3);background:rgba(53,229,168,.035)}.pdx-asset-editor-foot{display:flex;align-items:center;gap:8px;padding-top:16px;border-top:1px solid rgba(255,255,255,.07)}.pdx-asset-editor-foot span{margin-right:auto;color:rgba(255,255,255,.28);font-size:.54rem}.pdx-asset-editor-foot button{min-height:40px;padding:0 14px;border:1px solid rgba(255,255,255,.1);background:#11141a;color:rgba(255,255,255,.62);font:900 .5rem/1 var(--font-c);letter-spacing:.1em;cursor:pointer}.pdx-asset-editor-foot .is-save{border-color:#e8002d;background:#e8002d;color:#fff}.pdx-asset-editor-foot .is-save:disabled{opacity:.5;cursor:wait}
      @media(max-width:1120px){body.pdx-admin-runtime #adm-assets .assets-grid-pro{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
      @media(max-width:900px){body.pdx-admin-runtime #adm-assets .assets-command-card{align-items:flex-start;flex-direction:column}body.pdx-admin-runtime #adm-assets .pdx-assets-stat-grid{grid-template-columns:1fr 1fr}body.pdx-admin-runtime #adm-assets .assets-toolbar-pro{align-items:stretch!important;flex-direction:column!important}body.pdx-admin-runtime #adm-assets .assets-toolbar-pro .toolbar-filters{grid-template-columns:1fr 1fr 1fr}.asset-meta-info{margin-left:0!important}.pdx-asset-files{grid-template-columns:1fr}}
      @media(max-width:650px){body.pdx-admin-runtime #adm-assets .assets-grid-pro{grid-template-columns:1fr!important}body.pdx-admin-runtime #adm-assets .assets-toolbar-pro .toolbar-filters{grid-template-columns:1fr}body.pdx-admin-runtime #adm-assets .pdx-assets-stat-grid{grid-template-columns:1fr 1fr}.pdx-asset-form-grid{grid-template-columns:1fr}.pdx-asset-form-grid label.is-wide,.pdx-asset-files{grid-column:auto}.pdx-asset-editor-panel{width:100%;padding:19px}}
    `;
    document.head.appendChild(style);
  }

  function ensureStats(){
    if (document.getElementById('pdx-assets-stat-grid')) return;
    const command = document.querySelector('#adm-assets .assets-command-card');
    if (!command) return;
    const grid = document.createElement('div');
    grid.id = 'pdx-assets-stat-grid';
    grid.className = 'pdx-assets-stat-grid';
    grid.innerHTML = `
      <div class="pdx-assets-stat"><span>Total Assets</span><strong id="pdx-assets-total">0</strong></div>
      <div class="pdx-assets-stat"><span>Published</span><strong id="pdx-assets-published">0</strong></div>
      <div class="pdx-assets-stat"><span>Premium</span><strong id="pdx-assets-premium">0</strong></div>
      <div class="pdx-assets-stat"><span>Downloads</span><strong id="pdx-assets-downloads">0</strong></div>`;
    command.insertAdjacentElement('afterend', grid);
  }

  function setText(id,value){ const el=document.getElementById(id); if(el) el.textContent=value; }
  function renderStats(){
    setText('pdx-assets-total', state.assets.length.toLocaleString('en-IN'));
    setText('pdx-assets-published', state.assets.filter(a=>a?.isActive!==false).length.toLocaleString('en-IN'));
    setText('pdx-assets-premium', state.assets.filter(a=>a?.type==='premium').length.toLocaleString('en-IN'));
    setText('pdx-assets-downloads', state.assets.reduce((sum,a)=>sum+Math.max(0,Number(a?.downloads||0)),0).toLocaleString('en-IN'));
  }

  function applyFilters(){
    const category = document.getElementById('asset-category-filter')?.value || 'all';
    const access = document.getElementById('asset-access-filter')?.value || 'all';
    const device = document.getElementById('asset-device-filter')?.value || 'all';
    state.filtered = state.assets.filter(asset=>{
      if (category !== 'all' && norm(asset?.category) !== norm(category)) return false;
      if (access !== 'all' && norm(asset?.type) !== norm(access)) return false;
      if (device !== 'all' && norm(asset?.orientation) !== norm(device)) return false;
      return true;
    });
    renderGrid();
  }

  function renderGrid(){
    const grid = document.getElementById('assets-grid');
    if (!grid) return;
    const meta = document.querySelector('#adm-assets .asset-meta-info');
    if (meta) meta.textContent = `${state.filtered.length} shown · ${state.assets.length} total · ${state.lastSync ? `synced ${state.lastSync.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}` : 'syncing'}`;

    if (state.error && !state.assets.length) {
      grid.innerHTML = `<div class="pdx-assets-empty"><div><strong>DIGITAL VAULT UNAVAILABLE</strong><span>${esc(state.error)}</span><br><button type="button" onclick="PADDOX_refreshAssets()">RETRY SYNC</button></div></div>`;
      return;
    }
    if (!state.filtered.length) {
      grid.innerHTML = `<div class="pdx-assets-empty"><div><strong>NO MATCHING ASSETS</strong><span>Upload a wallpaper or change the current filters.</span><br><button type="button" onclick="openAssetModal()">UPLOAD WALLPAPER</button></div></div>`;
      return;
    }

    grid.innerHTML = state.filtered.map(asset=>{
      const id = esc(String(asset?._id || ''));
      const image = previewUrl(asset);
      const active = asset?.isActive !== false;
      return `<article class="pdx-asset-card ${active?'':'is-paused'}" data-asset-id="${id}">
        <div class="pdx-asset-media">
          ${image ? `<img src="${esc(image)}" alt="${esc(asset?.name || 'PADDOX wallpaper')}" loading="lazy">` : '<div class="pdx-assets-empty"><strong>PADDOX</strong></div>'}
          <span class="pdx-asset-state ${active?'':'is-paused'}">${active?'PUBLISHED':'PAUSED'}</span>
          <span class="pdx-asset-access">${esc(accessLabel(asset))}</span>
        </div>
        <div class="pdx-asset-body">
          <div class="pdx-asset-head"><h3 title="${esc(asset?.name || '')}">${esc(asset?.name || 'Untitled Wallpaper')}</h3><span>${Number(asset?.downloads || 0).toLocaleString('en-IN')} ↓</span></div>
          <div class="pdx-asset-meta"><span>${esc(categoryLabel(asset?.category))}</span><span>${esc(orientationLabel(asset?.orientation))}</span><span>${esc(asset?.resolution || '4K')}</span></div>
          <div class="pdx-asset-variants"><b>${hasDesktop(asset)?'DESKTOP ✓':'DESKTOP —'}</b><span>·</span><b>${hasMobile(asset)?'MOBILE ✓':'MOBILE —'}</b><span>·</span><span>${esc(asset?.fileSize || '0 MB')}</span></div>
          <div class="pdx-asset-actions">
            <button class="is-edit" type="button" onclick="PADDOX_editAsset('${id}')">EDIT</button>
            <button class="is-toggle" type="button" onclick="PADDOX_toggleAsset('${id}')">${active?'PAUSE':'PUBLISH'}</button>
            <button type="button" onclick="PADDOX_previewAsset('${id}')">PREVIEW</button>
            <button class="is-delete" type="button" onclick="PADDOX_deleteAsset('${id}',this)">DELETE</button>
          </div>
        </div>
      </article>`;
    }).join('');
  }

  async function loadAssets(silent=false){
    if (state.syncing) return state.assets;
    state.syncing = true; state.error = '';
    if (!silent) toast('⏳ Syncing Digital Vault...');
    try {
      const response = await fetch('/api/admin/assets', { method:'GET', credentials:'include', cache:'no-store', headers:{Accept:'application/json'} });
      const payload = await response.json().catch(()=>({}));
      if (!response.ok || payload?.success===false) throw new Error(payload?.message || `Asset sync failed (${response.status})`);
      state.assets = extract(payload); state.lastSync = new Date(); window.REAL_ASSETS = state.assets;
      renderStats(); applyFilters();
      if (!silent) toast(`✅ ${state.assets.length} digital assets synced`);
      return state.assets;
    } catch(error){
      state.error = error?.message || 'Digital assets unavailable';
      console.warn('PADDOX Digital Assets sync failed:', error);
      renderStats(); applyFilters();
      if (!silent) toast(`❌ ${state.error}`);
      return state.assets;
    } finally { state.syncing = false; }
  }

  function findAsset(id){ return state.assets.find(a=>String(a?._id || '')===String(id || '')) || null; }

  function resetFiles(){ state.stagedDesktop=null; state.stagedMobile=null; state.stagedThumbnail=null; }
  function ensureModal(){
    let modal = document.getElementById('pdx-asset-editor');
    if (modal) return modal;
    modal = document.createElement('div');
    modal.id = 'pdx-asset-editor'; modal.className = 'pdx-asset-editor'; modal.setAttribute('aria-hidden','true');
    modal.innerHTML = `<div class="pdx-asset-editor-backdrop"></div><div class="pdx-asset-editor-panel" role="dialog" aria-modal="true" aria-label="Digital asset editor"><form id="pdx-asset-form">
      <div class="pdx-asset-editor-head"><div><div class="pdx-asset-editor-kicker">PADDOX DIGITAL VAULT</div><h2 id="pdx-asset-editor-title">UPLOAD WALLPAPER</h2><p id="pdx-asset-editor-sub">Publish desktop and mobile fan wallpapers through Cloudinary.</p></div><button type="button" class="pdx-asset-editor-close" onclick="PADDOX_closeAssetEditor()">×</button></div>
      <div class="pdx-asset-form-grid">
        <label><span>WALLPAPER NAME</span><input id="pdx-asset-name" required maxlength="120" placeholder="Monaco Night Run"></label>
        <label><span>CATEGORY</span><select id="pdx-asset-category"><option value="cars">Cars</option><option value="drivers">Drivers</option><option value="circuits">Circuits</option><option value="abstract art">Abstract Art</option><option value="wallpaper">Wallpaper</option></select></label>
        <label><span>ACCESS</span><select id="pdx-asset-type"><option value="free">Free</option><option value="premium">Premium</option></select></label>
        <label><span>PRICE ₹</span><input id="pdx-asset-price" type="number" min="0" step="1" value="0"></label>
        <label><span>DEVICE TARGET</span><select id="pdx-asset-orientation"><option value="desktop">Desktop</option><option value="mobile">Mobile</option><option value="both">Desktop + Mobile</option></select></label>
        <label><span>MASTER RESOLUTION</span><input id="pdx-asset-resolution" value="4K" placeholder="3840×2160 / 4K"></label>
        <label><span>DESKTOP RESOLUTION</span><input id="pdx-asset-desktop-resolution" placeholder="3840×2160"></label>
        <label><span>MOBILE RESOLUTION</span><input id="pdx-asset-mobile-resolution" placeholder="1440×3200"></label>
        <label class="is-wide"><span>TAGS</span><input id="pdx-asset-tags" placeholder="ferrari, monaco, night, 2026"></label>
        <label class="is-wide"><span>DESCRIPTION</span><textarea id="pdx-asset-description" maxlength="600" placeholder="Wallpaper description shown in Fan Hub"></textarea></label>
        <div class="pdx-asset-files">
          <label class="pdx-asset-file" id="pdx-asset-desktop-box"><input id="pdx-asset-desktop" type="file" accept="image/png,image/jpeg,image/webp"><div><strong>DESKTOP FILE</strong><small id="pdx-asset-desktop-name">JPG / PNG / WebP</small></div></label>
          <label class="pdx-asset-file" id="pdx-asset-mobile-box"><input id="pdx-asset-mobile" type="file" accept="image/png,image/jpeg,image/webp"><div><strong>MOBILE FILE</strong><small id="pdx-asset-mobile-name">Optional portrait variant</small></div></label>
          <label class="pdx-asset-file" id="pdx-asset-thumb-box"><input id="pdx-asset-thumb" type="file" accept="image/png,image/jpeg,image/webp"><div><strong>THUMBNAIL</strong><small id="pdx-asset-thumb-name">Optional lightweight preview</small></div></label>
        </div>
      </div>
      <div class="pdx-asset-editor-foot"><span id="pdx-asset-editor-note">Free and premium downloads remain login-gated in Fan Hub.</span><button type="button" onclick="PADDOX_closeAssetEditor()">CANCEL</button><button id="pdx-asset-save" class="is-save" type="submit">UPLOAD ASSET</button></div>
    </form></div>`;
    document.body.appendChild(modal);
    modal.querySelector('.pdx-asset-editor-backdrop')?.addEventListener('click', closeModal);
    modal.querySelector('#pdx-asset-form')?.addEventListener('submit', saveAsset);
    modal.querySelector('#pdx-asset-type')?.addEventListener('change', syncPriceState);
    [['desktop','Desktop'],['mobile','Mobile'],['thumb','Thumbnail']].forEach(([key,label])=>{
      modal.querySelector(`#pdx-asset-${key}`)?.addEventListener('change', event=>{
        const file = event.target.files?.[0] || null;
        if (key==='desktop') state.stagedDesktop=file;
        if (key==='mobile') state.stagedMobile=file;
        if (key==='thumb') state.stagedThumbnail=file;
        updateFileBox(key,file,label);
      });
    });
    document.addEventListener('keydown', event=>{ if(event.key==='Escape' && modal.classList.contains('is-open')) closeModal(); });
    return modal;
  }

  function updateFileBox(key,file,label){
    const box = document.getElementById(`pdx-asset-${key}-box`);
    const name = document.getElementById(`pdx-asset-${key}-name`);
    if (box) box.classList.toggle('has-file', !!file);
    if (name) name.textContent = file ? `${file.name} · ${(file.size/1024/1024).toFixed(1)} MB` : (key==='desktop'?'JPG / PNG / WebP':key==='mobile'?'Optional portrait variant':'Optional lightweight preview');
  }
  function syncPriceState(){
    const type = document.getElementById('pdx-asset-type')?.value || 'free';
    const price = document.getElementById('pdx-asset-price');
    if (!price) return;
    price.disabled = type !== 'premium';
    if (type !== 'premium') price.value = '0';
  }
  function setValue(id,value=''){ const el=document.getElementById(id); if(el) el.value=value ?? ''; }

  function openModal(asset=null, droppedFile=null){
    ensureModal(); resetFiles(); state.editingId = asset?._id ? String(asset._id) : null;
    setValue('pdx-asset-name', asset?.name || '');
    setValue('pdx-asset-category', asset?.category || 'cars');
    setValue('pdx-asset-type', asset?.type || 'free');
    setValue('pdx-asset-price', asset?.type==='premium' ? Number(asset?.price || 0) : 0);
    setValue('pdx-asset-orientation', asset?.orientation || 'desktop');
    setValue('pdx-asset-resolution', asset?.resolution || '4K');
    setValue('pdx-asset-desktop-resolution', asset?.desktop?.resolution || '');
    setValue('pdx-asset-mobile-resolution', asset?.mobile?.resolution || '');
    setValue('pdx-asset-tags', Array.isArray(asset?.tags) ? asset.tags.join(', ') : '');
    setValue('pdx-asset-description', asset?.description || '');
    ['desktop','mobile','thumb'].forEach(key=>updateFileBox(key,null,key));
    if (droppedFile) {
      state.stagedDesktop = droppedFile;
      updateFileBox('desktop', droppedFile, 'Desktop');
    }
    syncPriceState();
    const title = document.getElementById('pdx-asset-editor-title');
    const sub = document.getElementById('pdx-asset-editor-sub');
    const save = document.getElementById('pdx-asset-save');
    const note = document.getElementById('pdx-asset-editor-note');
    if (title) title.textContent = asset ? 'EDIT WALLPAPER' : 'UPLOAD WALLPAPER';
    if (sub) sub.textContent = asset ? 'Update metadata or replace only the variants you choose.' : 'Publish desktop and mobile fan wallpapers through Cloudinary.';
    if (save) save.textContent = asset ? 'UPDATE ASSET' : 'UPLOAD ASSET';
    if (note) note.textContent = asset ? 'Existing Cloudinary files are preserved when no replacement file is selected.' : 'Upload at least a desktop or mobile wallpaper.';
    const modal = document.getElementById('pdx-asset-editor');
    modal?.classList.add('is-open'); modal?.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden';
    setTimeout(()=>document.getElementById('pdx-asset-name')?.focus(),40);
  }
  function closeModal(){ const modal=document.getElementById('pdx-asset-editor'); if(!modal)return; modal.classList.remove('is-open'); modal.setAttribute('aria-hidden','true'); document.body.style.overflow=''; state.editingId=null; resetFiles(); }

  async function saveAsset(event){
    event.preventDefault();
    const editing = !!state.editingId;
    if (!editing && !state.stagedDesktop && !state.stagedMobile) return toast('❌ Upload at least a desktop or mobile wallpaper');
    const type = document.getElementById('pdx-asset-type')?.value || 'free';
    const price = Number(document.getElementById('pdx-asset-price')?.value || 0);
    if (type==='premium' && !(price > 0)) return toast('❌ Premium wallpaper price must be greater than zero');

    const form = new FormData();
    form.set('name', document.getElementById('pdx-asset-name')?.value.trim() || 'PADDOX Wallpaper');
    form.set('category', document.getElementById('pdx-asset-category')?.value || 'cars');
    form.set('type', type);
    form.set('price', type==='premium' ? String(price) : '0');
    form.set('orientation', document.getElementById('pdx-asset-orientation')?.value || 'desktop');
    form.set('resolution', document.getElementById('pdx-asset-resolution')?.value.trim() || '4K');
    form.set('desktopResolution', document.getElementById('pdx-asset-desktop-resolution')?.value.trim() || '');
    form.set('mobileResolution', document.getElementById('pdx-asset-mobile-resolution')?.value.trim() || '');
    form.set('tags', document.getElementById('pdx-asset-tags')?.value.trim() || '');
    form.set('description', document.getElementById('pdx-asset-description')?.value.trim() || '');
    if (state.stagedDesktop) form.set('desktop', state.stagedDesktop);
    if (state.stagedMobile) form.set('mobile', state.stagedMobile);
    if (state.stagedThumbnail) form.set('thumbnail', state.stagedThumbnail);

    const button = document.getElementById('pdx-asset-save');
    if (button) { button.disabled=true; button.textContent=editing?'UPDATING…':'UPLOADING…'; }
    try {
      const endpoint = editing ? `/api/assets/${encodeURIComponent(state.editingId)}` : '/api/assets';
      const response = await fetch(endpoint, { method:editing?'PUT':'POST', credentials:'include', body:form, headers:{Accept:'application/json'} });
      const payload = await response.json().catch(()=>({}));
      if (!response.ok || payload?.success===false) throw new Error(payload?.message || `Asset save failed (${response.status})`);
      toast(editing ? '✅ Wallpaper updated' : '🔥 Wallpaper uploaded');
      closeModal(); await loadAssets(true);
    } catch(error){
      console.error('PADDOX asset save failed:', error); toast(`❌ ${error?.message || 'Asset save failed'}`);
    } finally {
      if (button) { button.disabled=false; button.textContent=editing?'UPDATE ASSET':'UPLOAD ASSET'; }
    }
  }

  async function toggleAsset(id){
    const asset = findAsset(id); if (!asset) return toast('❌ Asset not found');
    const next = asset?.isActive === false;
    try {
      const response = await fetch(`/api/admin/assets/${encodeURIComponent(id)}/status`, { method:'PATCH', credentials:'include', headers:{'Content-Type':'application/json',Accept:'application/json'}, body:JSON.stringify({isActive:next}) });
      const payload = await response.json().catch(()=>({}));
      if (!response.ok || payload?.success===false) throw new Error(payload?.message || `Publish update failed (${response.status})`);
      toast(next ? '✅ Wallpaper published to Fan Hub' : '⏸ Wallpaper paused from Fan Hub'); await loadAssets(true);
    } catch(error){ toast(`❌ ${error?.message || 'Publish update failed'}`); }
  }

  async function deleteAsset(id,button){
    const asset = findAsset(id); if (!asset) return;
    if (!button?.dataset?.armed) {
      button.dataset.armed='1'; button.textContent='CONFIRM'; button.classList.add('is-armed');
      setTimeout(()=>{ if(!button?.isConnected)return; delete button.dataset.armed; button.textContent='DELETE'; button.classList.remove('is-armed'); },4500);
      return;
    }
    try {
      const response = await fetch(`/api/assets/${encodeURIComponent(id)}`, { method:'DELETE', credentials:'include', headers:{Accept:'application/json'} });
      const payload = await response.json().catch(()=>({}));
      if (!response.ok || payload?.success===false) throw new Error(payload?.message || `Delete failed (${response.status})`);
      toast(`🗑️ ${asset?.name || 'Wallpaper'} deleted`); await loadAssets(true);
    } catch(error){ toast(`❌ ${error?.message || 'Delete failed'}`); }
  }

  function previewAsset(id){
    const asset = findAsset(id); if (!asset) return;
    const url = previewUrl(asset); if (!url) return toast('❌ Preview image unavailable');
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  function bindUploadZone(){
    const zone = document.getElementById('upload-zone');
    if (!zone || zone.dataset.pdxAssetsBound==='1') return;
    zone.dataset.pdxAssetsBound='1'; zone.setAttribute('role','button'); zone.setAttribute('tabindex','0');
    zone.addEventListener('click',()=>openModal(null));
    zone.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){e.preventDefault();openModal(null);} });
    ['dragenter','dragover'].forEach(type=>zone.addEventListener(type,e=>{e.preventDefault();zone.classList.add('is-dragging');}));
    ['dragleave','drop'].forEach(type=>zone.addEventListener(type,e=>{e.preventDefault();zone.classList.remove('is-dragging');}));
    zone.addEventListener('drop',e=>{ const file=[...(e.dataTransfer?.files||[])].find(f=>/^image\//.test(f.type)); if(file)openModal(null,file); else toast('❌ Drop a JPG, PNG or WebP wallpaper'); });
  }

  function bindControls(){
    if (bound) return; bound=true;
    document.getElementById('asset-category-filter')?.addEventListener('change',applyFilters);
    document.getElementById('asset-access-filter')?.addEventListener('change',applyFilters);
    document.getElementById('asset-device-filter')?.addEventListener('change',applyFilters);
    document.querySelectorAll('.adm-nav-item[data-page]').forEach(item=>item.addEventListener('click',()=>setTimeout(()=>{if(item.dataset.page==='assets')loadAssets(true);},0)));
    window.addEventListener('hashchange',()=>{if(window.location.hash==='#assets')setTimeout(()=>loadAssets(true),0);});
  }
  function installAutoRefresh(){ if(refreshTimer)return; refreshTimer=setInterval(()=>{if(isAssetsPage()&&document.visibilityState!=='hidden')loadAssets(true);},REFRESH_MS); }

  function bootstrap(){
    ensureStyles(); ensureStats(); ensureModal(); bindUploadZone(); bindControls(); installAutoRefresh();
    window.loadAssets=loadAssets;
    window.renderAssets=applyFilters;
    window.openAssetModal=()=>openModal(null);
    window.closeAssetModal=closeModal;
    window.PADDOX_refreshAssets=()=>loadAssets(false);
    window.PADDOX_editAsset=id=>{const asset=findAsset(id);if(asset)openModal(asset);else toast('❌ Asset not found');};
    window.PADDOX_toggleAsset=toggleAsset;
    window.PADDOX_deleteAsset=deleteAsset;
    window.PADDOX_previewAsset=previewAsset;
    window.PADDOX_closeAssetEditor=closeModal;
    window.PADDOX_ADMIN_ASSETS_STATE=state;
    loadAssets(true);
  }

  ensureStyles();
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',bootstrap,{once:true}); else bootstrap();
})();
