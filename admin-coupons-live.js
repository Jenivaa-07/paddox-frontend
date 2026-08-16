/* ============================================================
   PADDOX ADMIN — Coupons Live Controller
   Owns coupon management after legacy Admin initialises.
   ============================================================ */
(function paddoxAdminCouponsLive(){
  'use strict';

  const REFRESH_MS = 45000;
  const state = { coupons:[], filtered:[], syncing:false, editingId:null, error:'', lastSync:null };
  let refreshTimer = null;
  let bound = false;

  function esc(value=''){
    return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  }
  function norm(value=''){ return String(value || '').trim().toLowerCase(); }
  function money(value=0){ return `₹${Number(value || 0).toLocaleString('en-IN')}`; }
  function toast(message){ if (typeof window.showToast === 'function') window.showToast(message); else console.log(message); }
  function isCouponsPage(){ return document.getElementById('adm-coupons')?.classList.contains('on'); }
  function extract(payload={}){
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.coupons)) return payload.coupons;
    if (Array.isArray(payload?.data?.coupons)) return payload.data.coupons;
    return [];
  }
  function expired(coupon={}){ return !!(coupon?.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()); }
  function exhausted(coupon={}){ return !!(Number(coupon?.maxUses || 0) > 0 && Number(coupon?.usedCount || 0) >= Number(coupon.maxUses)); }
  function statusMeta(coupon={}){
    if (expired(coupon)) return { key:'expired', label:'EXPIRED', cls:'is-expired' };
    if (exhausted(coupon)) return { key:'inactive', label:'LIMIT REACHED', cls:'is-limit' };
    if (coupon?.isActive === false) return { key:'inactive', label:'INACTIVE', cls:'is-inactive' };
    return { key:'active', label:'ACTIVE', cls:'is-active' };
  }
  function audienceLabel(value='all'){
    return ({all:'ALL FANS',fans:'F1 FANS',new_users:'NEW USERS',vip:'VIP FANS'})[String(value)] || String(value).replace(/_/g,' ').toUpperCase();
  }
  function expiryLabel(value){
    if (!value) return 'NO EXPIRY';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return 'NO EXPIRY';
    return d.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}).toUpperCase();
  }

  function ensureStyles(){
    if (document.getElementById('pdx-admin-coupons-style')) return;
    const style = document.createElement('style');
    style.id = 'pdx-admin-coupons-style';
    style.textContent = `
      html:not([data-admin-page="products"]) #adm-action-btn{display:none!important}
      body.pdx-admin-runtime #adm-coupons .coupons-command-card{position:relative;overflow:hidden;margin-bottom:18px;padding:30px 31px;display:flex;align-items:center;justify-content:space-between;gap:24px;border:1px solid rgba(255,255,255,.09);border-left:4px solid #e8002d;background:radial-gradient(circle at 83% 10%,rgba(232,0,45,.16),transparent 31%),linear-gradient(112deg,rgba(232,0,45,.11),rgba(255,255,255,.018) 45%,rgba(255,255,255,.008));box-shadow:0 24px 60px rgba(0,0,0,.2)}
      body.pdx-admin-runtime #adm-coupons .coupons-command-card:after{content:"DEALS";position:absolute;right:25px;bottom:-38px;color:rgba(255,255,255,.025);font:900 7rem/1 var(--font-d);pointer-events:none}
      body.pdx-admin-runtime #adm-coupons .coupons-command-copy,body.pdx-admin-runtime #adm-coupons .coupons-command-btn{position:relative;z-index:2}
      body.pdx-admin-runtime #adm-coupons .coupons-live-kicker{display:flex;align-items:center;gap:8px;color:#e8002d;font:900 .54rem/1 var(--font-c);letter-spacing:.19em}
      body.pdx-admin-runtime #adm-coupons .coupons-live-kicker span{width:7px;height:7px;border-radius:50%;background:#35e5a8;box-shadow:0 0 13px rgba(53,229,168,.8)}
      body.pdx-admin-runtime #adm-coupons .coupons-command-copy h2{margin:11px 0 8px!important;color:#fff!important;font:900 clamp(2.25rem,3.2vw,3.7rem)/.9 var(--font-d)!important;letter-spacing:.025em!important}
      body.pdx-admin-runtime #adm-coupons .coupons-command-copy p{max-width:760px!important;margin:0!important;color:rgba(255,255,255,.46)!important;font-size:.69rem!important;line-height:1.6!important}
      body.pdx-admin-runtime #adm-coupons .coupons-command-btn{min-height:44px;padding:0 18px;border:1px solid #e8002d;background:#e8002d;color:#fff;font:900 .53rem/1 var(--font-c);letter-spacing:.11em;white-space:nowrap;cursor:pointer;box-shadow:0 12px 30px rgba(232,0,45,.18)}
      body.pdx-admin-runtime #adm-coupons .coupons-filter-row{display:grid!important;grid-template-columns:180px 190px minmax(280px,1fr) 110px;gap:9px!important;margin-bottom:14px!important;padding:12px!important;border:1px solid rgba(255,255,255,.075);background:rgba(255,255,255,.016)}
      body.pdx-admin-runtime #adm-coupons .coupons-filter-row .adm-select,body.pdx-admin-runtime #adm-coupons .coupons-filter-row .adm-input{min-height:42px!important;border-color:rgba(255,255,255,.09)!important;background:#090b0f!important}
      body.pdx-admin-runtime #adm-coupons #coupons-refresh-btn{border:1px solid rgba(255,255,255,.1)!important;background:#11141a!important;color:rgba(255,255,255,.62)!important;font:800 .5rem/1 var(--font-c)!important;letter-spacing:.1em!important;cursor:pointer}
      body.pdx-admin-runtime #adm-coupons .coupons-kpi-grid{grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:11px!important;margin-bottom:16px!important}
      body.pdx-admin-runtime #adm-coupons .coupons-mini-kpi{position:relative;min-height:105px!important;padding:18px 19px!important;overflow:hidden;border:1px solid rgba(255,255,255,.085)!important;background:linear-gradient(140deg,rgba(255,255,255,.033),rgba(255,255,255,.01)),#0b0d12!important}
      body.pdx-admin-runtime #adm-coupons .coupons-mini-kpi:before{content:"";position:absolute;left:0;top:0;width:3px;height:100%;background:#e8002d}
      body.pdx-admin-runtime #adm-coupons .coupons-mini-kpi span{display:block;color:rgba(255,255,255,.35)!important;font:800 .5rem/1 var(--font-c)!important;letter-spacing:.14em!important;text-transform:uppercase}
      body.pdx-admin-runtime #adm-coupons .coupons-mini-kpi strong{display:block;margin-top:13px;color:#fff!important;font:900 2.1rem/.9 var(--font-d)!important}
      body.pdx-admin-runtime #adm-coupons .coupons-table-wrap{overflow:auto!important;border:1px solid rgba(255,255,255,.08)!important;background:#080a0e!important;box-shadow:0 24px 70px rgba(0,0,0,.24)}
      body.pdx-admin-runtime #adm-coupons .coupons-table{min-width:1120px!important;border-collapse:separate!important;border-spacing:0!important}
      body.pdx-admin-runtime #adm-coupons .coupons-table thead th{position:sticky;top:0;z-index:2;height:46px;padding:0 14px!important;background:#0d0f14!important;border-bottom:1px solid rgba(255,255,255,.1)!important;color:rgba(255,255,255,.36)!important;font:800 .5rem/1 var(--font-c)!important;letter-spacing:.15em!important;white-space:nowrap}
      body.pdx-admin-runtime #adm-coupons .pdx-coupon-row td{padding:15px 14px!important;vertical-align:middle!important;border-bottom:1px solid rgba(255,255,255,.052)!important;background:rgba(255,255,255,.003)}
      body.pdx-admin-runtime #adm-coupons .pdx-coupon-row:hover td{background:rgba(232,0,45,.03)}
      .pdx-coupon-code{display:flex;flex-direction:column;gap:6px;min-width:210px}.pdx-coupon-code strong{color:#fff;font:900 1.12rem/1 var(--font-d);letter-spacing:.08em}.pdx-coupon-code small{max-width:230px;color:rgba(255,255,255,.32);font-size:.53rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .pdx-coupon-discount strong{display:block;color:#fff;font:900 1.38rem/1 var(--font-d)}.pdx-coupon-discount small{display:block;margin-top:5px;color:rgba(255,255,255,.3);font:750 .45rem/1 var(--font-c);letter-spacing:.08em}
      .pdx-coupon-limits{display:flex;flex-direction:column;gap:6px;color:rgba(255,255,255,.46);font-size:.56rem}.pdx-coupon-progress{width:120px;height:5px;overflow:hidden;border-radius:99px;background:rgba(255,255,255,.06)}.pdx-coupon-progress i{display:block;height:100%;background:#e8002d}
      .pdx-coupon-audience{display:inline-flex;padding:7px 9px;border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.025);color:rgba(255,255,255,.57);font:800 .47rem/1 var(--font-c);letter-spacing:.08em;white-space:nowrap}
      .pdx-coupon-expiry{display:flex;flex-direction:column;gap:5px;color:rgba(255,255,255,.55);font-size:.57rem}.pdx-coupon-expiry small{color:rgba(255,255,255,.25);font:750 .44rem/1 var(--font-c);letter-spacing:.06em}
      .pdx-coupon-status{display:inline-flex;align-items:center;gap:6px;padding:7px 9px;border:1px solid rgba(255,255,255,.09);border-radius:999px;background:rgba(255,255,255,.025);font:800 .46rem/1 var(--font-c);letter-spacing:.08em;white-space:nowrap}.pdx-coupon-status i{width:6px;height:6px;border-radius:50%;background:currentColor;box-shadow:0 0 10px currentColor}.pdx-coupon-status.is-active{color:#35e5a8;border-color:rgba(53,229,168,.2)}.pdx-coupon-status.is-inactive{color:#9e8bff;border-color:rgba(158,139,255,.22)}.pdx-coupon-status.is-expired,.pdx-coupon-status.is-limit{color:#ff617c;border-color:rgba(255,97,124,.22)}
      .pdx-coupon-actions{display:flex;gap:5px;white-space:nowrap}.pdx-coupon-actions button{min-height:32px;padding:0 9px;border:1px solid rgba(255,255,255,.09);background:#11141a;color:rgba(255,255,255,.55);font:800 .44rem/1 var(--font-c);letter-spacing:.07em;cursor:pointer}.pdx-coupon-actions .is-edit{border-color:rgba(232,0,45,.28);background:rgba(232,0,45,.09);color:#fff}.pdx-coupon-actions .is-toggle{color:#35e5a8;border-color:rgba(53,229,168,.16)}.pdx-coupon-actions .is-delete{color:#ff6a82;border-color:rgba(255,72,103,.17)}.pdx-coupon-actions .is-delete.is-armed{background:#c50026;color:#fff;border-color:#e8002d}
      .pdx-coupon-empty{padding:56px!important;text-align:center;color:rgba(255,255,255,.34)}.pdx-coupon-empty strong{display:block;margin-bottom:8px;color:#fff;font:900 1.25rem/1 var(--font-d);letter-spacing:.06em}
      .pdx-coupon-editor{display:none;position:fixed;inset:0;z-index:100600}.pdx-coupon-editor.is-open{display:block}.pdx-coupon-editor-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.8);backdrop-filter:blur(12px)}.pdx-coupon-editor-panel{position:absolute;top:0;right:0;width:min(700px,96vw);height:100%;overflow:auto;padding:28px;background:radial-gradient(circle at 100% 0,rgba(232,0,45,.13),transparent 31%),#080a0e;border-left:1px solid rgba(232,0,45,.25);box-shadow:-35px 0 90px rgba(0,0,0,.56)}
      .pdx-coupon-editor-head{display:flex;justify-content:space-between;gap:20px;padding-bottom:20px;border-bottom:1px solid rgba(255,255,255,.08)}.pdx-coupon-editor-head h2{margin:10px 0 6px;color:#fff;font:900 clamp(2.5rem,5vw,4rem)/.85 var(--font-d)}.pdx-coupon-editor-head p{margin:0;color:rgba(255,255,255,.36);font-size:.64rem}.pdx-coupon-editor-kicker{color:#e8002d;font:900 .51rem/1 var(--font-c);letter-spacing:.18em}.pdx-coupon-editor-close{width:39px;height:39px;border:1px solid rgba(255,255,255,.1);background:#101319;color:#fff;font-size:1.3rem;cursor:pointer}
      .pdx-coupon-grid{display:grid;grid-template-columns:1fr 1fr;gap:11px;padding:20px 0}.pdx-coupon-grid label{display:flex;flex-direction:column;gap:8px}.pdx-coupon-grid label.is-wide{grid-column:1/-1}.pdx-coupon-grid label>span{color:rgba(255,255,255,.36);font:800 .48rem/1 var(--font-c);letter-spacing:.13em}.pdx-coupon-grid input,.pdx-coupon-grid select,.pdx-coupon-grid textarea{width:100%;min-height:43px;padding:10px 11px;border:1px solid rgba(255,255,255,.095);outline:0;background:#0d1015;color:#fff;font-family:var(--font-b);font-size:.68rem}.pdx-coupon-grid textarea{min-height:95px;resize:vertical}.pdx-coupon-grid input:focus,.pdx-coupon-grid select:focus,.pdx-coupon-grid textarea:focus{border-color:rgba(232,0,45,.5);box-shadow:0 0 0 3px rgba(232,0,45,.06)}
      .pdx-coupon-active{grid-column:1/-1;min-height:43px;display:flex!important;flex-direction:row!important;align-items:center;gap:9px;padding:0 11px;border:1px solid rgba(255,255,255,.075);background:rgba(255,255,255,.018);cursor:pointer}.pdx-coupon-active input{width:15px!important;min-height:0!important;accent-color:#e8002d}.pdx-coupon-editor-foot{display:flex;align-items:center;gap:8px;padding-top:16px;border-top:1px solid rgba(255,255,255,.07)}.pdx-coupon-editor-foot span{margin-right:auto;color:rgba(255,255,255,.28);font-size:.54rem}.pdx-coupon-editor-foot button{min-height:40px;padding:0 14px;border:1px solid rgba(255,255,255,.1);background:#11141a;color:rgba(255,255,255,.62);font:900 .5rem/1 var(--font-c);letter-spacing:.1em;cursor:pointer}.pdx-coupon-editor-foot .is-save{border-color:#e8002d;background:#e8002d;color:#fff}.pdx-coupon-editor-foot .is-save:disabled{opacity:.5;cursor:wait}
      @media(max-width:900px){body.pdx-admin-runtime #adm-coupons .coupons-command-card{align-items:flex-start;flex-direction:column}body.pdx-admin-runtime #adm-coupons .coupons-filter-row{grid-template-columns:1fr 1fr}.coupons-filter-row .adm-input{grid-column:1/-1}body.pdx-admin-runtime #adm-coupons .coupons-kpi-grid{grid-template-columns:1fr 1fr}}
      @media(max-width:600px){body.pdx-admin-runtime #adm-coupons .coupons-filter-row{grid-template-columns:1fr}.coupons-filter-row .adm-input{grid-column:auto}.pdx-coupon-grid{grid-template-columns:1fr}.pdx-coupon-grid label.is-wide,.pdx-coupon-active{grid-column:auto}.pdx-coupon-editor-panel{width:100%;padding:19px}}
    `;
    document.head.appendChild(style);
  }

  function setText(id,value){ const el=document.getElementById(id); if(el) el.textContent=value; }
  function renderStats(){
    const active = state.coupons.filter(c=>statusMeta(c).key==='active').length;
    const targeted = state.coupons.filter(c=>String(c?.audience || 'all')!=='all').length;
    const usage = state.coupons.reduce((sum,c)=>sum + Math.max(0,Number(c?.usedCount || 0)),0);
    setText('coupons-total-stat',state.coupons.length.toLocaleString('en-IN'));
    setText('coupons-active-stat',active.toLocaleString('en-IN'));
    setText('coupons-fan-stat',targeted.toLocaleString('en-IN'));
    setText('coupons-usage-stat',usage.toLocaleString('en-IN'));
  }

  function applyFilters(){
    const status = document.getElementById('coupon-status-filter')?.value || 'all';
    const type = document.getElementById('coupon-type-filter')?.value || 'all';
    const search = norm(document.getElementById('coupon-search-input')?.value || '');
    state.filtered = state.coupons.filter(coupon=>{
      const meta = statusMeta(coupon);
      if (status!=='all' && meta.key!==status) return false;
      if (type!=='all' && String(coupon?.type)!==type) return false;
      if (!search) return true;
      return [coupon?.code,coupon?.title,coupon?.description,coupon?.audience,coupon?.type].map(norm).join(' ').includes(search);
    });
    renderRows();
  }

  function renderRows(){
    const tbody = document.getElementById('coupons-tbody');
    if (!tbody) return;
    if (state.error && !state.coupons.length) {
      tbody.innerHTML = `<tr><td colspan="7" class="pdx-coupon-empty"><strong>COUPON FEED UNAVAILABLE</strong>${esc(state.error)}</td></tr>`;
      return;
    }
    if (!state.filtered.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="pdx-coupon-empty"><strong>NO MATCHING COUPONS</strong>Try another status, discount type or search term.</td></tr>';
      return;
    }
    tbody.innerHTML = state.filtered.map(coupon=>{
      const id = esc(String(coupon?._id || ''));
      const meta = statusMeta(coupon);
      const used = Math.max(0,Number(coupon?.usedCount || 0));
      const max = Math.max(0,Number(coupon?.maxUses || 0));
      const pct = max > 0 ? Math.min(100,Math.round((used/max)*100)) : 0;
      const discount = coupon?.type==='fixed' ? money(coupon?.value) : `${Number(coupon?.value || 0)}%`;
      return `<tr class="pdx-coupon-row">
        <td><div class="pdx-coupon-code"><strong>${esc(coupon?.code || 'COUPON')}</strong><small>${esc(coupon?.title || coupon?.description || 'PADDOX fan offer')}</small></div></td>
        <td><div class="pdx-coupon-discount"><strong>${esc(discount)}</strong><small>${coupon?.type==='fixed'?'FIXED AMOUNT':'PERCENTAGE OFF'}</small></div></td>
        <td><div class="pdx-coupon-limits"><span>Min ${money(coupon?.minOrderValue || 0)}</span><span>${max ? `${used}/${max} USES` : `${used} USES · UNLIMITED`}</span>${max ? `<div class="pdx-coupon-progress"><i style="width:${pct}%"></i></div>`:''}</div></td>
        <td><span class="pdx-coupon-audience">${esc(audienceLabel(coupon?.audience))}</span></td>
        <td><div class="pdx-coupon-expiry"><strong>${esc(expiryLabel(coupon?.expiresAt))}</strong><small>${coupon?.expiresAt ? (expired(coupon)?'PAST DEADLINE':'AUTO EXPIRES') : 'ALWAYS ON'}</small></div></td>
        <td><span class="pdx-coupon-status ${meta.cls}"><i></i>${meta.label}</span></td>
        <td><div class="pdx-coupon-actions"><button class="is-edit" type="button" onclick="PADDOX_editCoupon('${id}')">EDIT</button><button class="is-toggle" type="button" onclick="PADDOX_toggleCoupon('${id}')">${coupon?.isActive===false?'ENABLE':'DISABLE'}</button><button class="is-delete" type="button" onclick="PADDOX_deleteCoupon('${id}',this)">DELETE</button></div></td>
      </tr>`;
    }).join('');
  }

  async function loadCoupons(silent=false){
    if (state.syncing) return state.coupons;
    state.syncing=true; state.error='';
    if (!silent) toast('⏳ Syncing live coupons...');
    try {
      const response = await fetch('/api/coupons/admin',{method:'GET',credentials:'include',cache:'no-store',headers:{Accept:'application/json'}});
      const payload = await response.json().catch(()=>({}));
      if (!response.ok || payload?.success===false) throw new Error(payload?.message || `Coupon sync failed (${response.status})`);
      state.coupons=extract(payload); state.lastSync=new Date();
      renderStats(); applyFilters();
      if (!silent) toast(`✅ ${state.coupons.length} coupons synced`);
      return state.coupons;
    } catch(error){
      state.error=error?.message || 'Coupons unavailable';
      console.warn('PADDOX Coupons sync failed:',error);
      renderStats(); applyFilters();
      if (!silent) toast(`❌ ${state.error}`);
      return state.coupons;
    } finally { state.syncing=false; }
  }

  function findCoupon(id){ return state.coupons.find(c=>String(c?._id || '')===String(id || '')) || null; }
  function dateInput(value){ if(!value)return ''; const d=new Date(value); if(Number.isNaN(d.getTime()))return ''; const off=d.getTimezoneOffset()*60000; return new Date(d.getTime()-off).toISOString().slice(0,10); }

  function ensureModal(){
    let modal=document.getElementById('pdx-coupon-editor');
    if(modal)return modal;
    modal=document.createElement('div');
    modal.id='pdx-coupon-editor'; modal.className='pdx-coupon-editor'; modal.setAttribute('aria-hidden','true');
    modal.innerHTML=`<div class="pdx-coupon-editor-backdrop"></div><div class="pdx-coupon-editor-panel" role="dialog" aria-modal="true" aria-label="Coupon editor"><form id="pdx-coupon-form">
      <div class="pdx-coupon-editor-head"><div><div class="pdx-coupon-editor-kicker">LIVE FAN DEAL CONTROL</div><h2 id="pdx-coupon-title">CREATE COUPON</h2><p id="pdx-coupon-sub">Publish a checkout-ready PADDOX fan offer.</p></div><button type="button" class="pdx-coupon-editor-close" onclick="PADDOX_closeCouponEditor()">×</button></div>
      <div class="pdx-coupon-grid">
        <label><span>COUPON CODE</span><input id="pdx-coupon-code" maxlength="24" required placeholder="RACEWEEK26"></label>
        <label><span>TITLE</span><input id="pdx-coupon-name" maxlength="100" placeholder="Race Week Offer"></label>
        <label><span>DISCOUNT TYPE</span><select id="pdx-coupon-type"><option value="percent">Percentage</option><option value="fixed">Fixed Amount</option></select></label>
        <label><span>DISCOUNT VALUE</span><input id="pdx-coupon-value" type="number" min="1" step="1" required placeholder="10"></label>
        <label><span>MIN ORDER ₹</span><input id="pdx-coupon-min" type="number" min="0" step="1" value="0"></label>
        <label><span>MAX USES</span><input id="pdx-coupon-max" type="number" min="0" step="1" value="0"><small>0 = unlimited</small></label>
        <label><span>AUDIENCE</span><select id="pdx-coupon-audience"><option value="all">All Fans</option><option value="fans">F1 Fans</option><option value="new_users">New Users</option><option value="vip">VIP Fans</option></select></label>
        <label><span>EXPIRY DATE</span><input id="pdx-coupon-expiry" type="date"></label>
        <label class="is-wide"><span>DESCRIPTION</span><textarea id="pdx-coupon-description" maxlength="500" placeholder="Optional campaign note"></textarea></label>
        <label class="pdx-coupon-active"><input id="pdx-coupon-active" type="checkbox" checked><span>COUPON ACTIVE AT CHECKOUT</span></label>
      </div>
      <div class="pdx-coupon-editor-foot"><span id="pdx-coupon-note">Checkout validates expiry, minimum order and usage limit automatically.</span><button type="button" onclick="PADDOX_closeCouponEditor()">CANCEL</button><button id="pdx-coupon-save" class="is-save" type="submit">CREATE COUPON</button></div>
    </form></div>`;
    document.body.appendChild(modal);
    modal.querySelector('.pdx-coupon-editor-backdrop')?.addEventListener('click',closeModal);
    modal.querySelector('#pdx-coupon-code')?.addEventListener('input',event=>{ event.target.value=event.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g,''); });
    modal.querySelector('#pdx-coupon-form')?.addEventListener('submit',saveCoupon);
    document.addEventListener('keydown',event=>{ if(event.key==='Escape' && modal.classList.contains('is-open'))closeModal(); });
    return modal;
  }

  function openModal(coupon=null){
    const modal=ensureModal(); state.editingId=coupon?._id ? String(coupon._id) : null;
    const set=(id,value='')=>{const el=modal.querySelector(`#${id}`);if(el)el.value=value ?? '';};
    set('pdx-coupon-code',coupon?.code || ''); set('pdx-coupon-name',coupon?.title || ''); set('pdx-coupon-type',coupon?.type || 'percent'); set('pdx-coupon-value',coupon?.value ?? '');
    set('pdx-coupon-min',coupon?.minOrderValue ?? 0); set('pdx-coupon-max',coupon?.maxUses ?? 0); set('pdx-coupon-audience',coupon?.audience || 'all'); set('pdx-coupon-expiry',dateInput(coupon?.expiresAt)); set('pdx-coupon-description',coupon?.description || '');
    modal.querySelector('#pdx-coupon-active').checked=coupon ? coupon?.isActive!==false : true;
    modal.querySelector('#pdx-coupon-title').textContent=coupon?'EDIT COUPON':'CREATE COUPON'; modal.querySelector('#pdx-coupon-sub').textContent=coupon?'Update campaign rules without resetting its usage count.':'Publish a checkout-ready PADDOX fan offer.'; modal.querySelector('#pdx-coupon-save').textContent=coupon?'UPDATE COUPON':'CREATE COUPON';
    modal.classList.add('is-open'); modal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; setTimeout(()=>modal.querySelector('#pdx-coupon-code')?.focus(),40);
  }
  function closeModal(){ const modal=document.getElementById('pdx-coupon-editor'); if(!modal)return; modal.classList.remove('is-open'); modal.setAttribute('aria-hidden','true'); document.body.style.overflow=''; state.editingId=null; }

  async function saveCoupon(event){
    event.preventDefault(); const modal=ensureModal();
    const payload={
      code:modal.querySelector('#pdx-coupon-code')?.value.trim().toUpperCase() || '', title:modal.querySelector('#pdx-coupon-name')?.value.trim() || '', type:modal.querySelector('#pdx-coupon-type')?.value || 'percent', value:Number(modal.querySelector('#pdx-coupon-value')?.value || 0), minOrderValue:Number(modal.querySelector('#pdx-coupon-min')?.value || 0), maxUses:Number(modal.querySelector('#pdx-coupon-max')?.value || 0), audience:modal.querySelector('#pdx-coupon-audience')?.value || 'all', expiresAt:modal.querySelector('#pdx-coupon-expiry')?.value || null, description:modal.querySelector('#pdx-coupon-description')?.value.trim() || '', isActive:!!modal.querySelector('#pdx-coupon-active')?.checked
    };
    if(payload.code.length<3)return toast('❌ Coupon code must be at least 3 characters');
    if(!(payload.value>0))return toast('❌ Discount value must be greater than zero');
    if(payload.type==='percent' && payload.value>90)return toast('❌ Percentage discount cannot exceed 90%');
    const button=modal.querySelector('#pdx-coupon-save'); if(button){button.disabled=true;button.textContent=state.editingId?'UPDATING…':'CREATING…';}
    try{
      const endpoint=state.editingId?`/api/coupons/admin/${encodeURIComponent(state.editingId)}`:'/api/coupons/admin';
      const response=await fetch(endpoint,{method:state.editingId?'PUT':'POST',credentials:'include',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(payload)});
      const data=await response.json().catch(()=>({})); if(!response.ok || data?.success===false)throw new Error(data?.message || `Coupon save failed (${response.status})`);
      toast(state.editingId?'✅ Coupon updated':'🔥 Coupon created'); closeModal(); await loadCoupons(true);
    }catch(error){console.error('PADDOX coupon save failed:',error);toast(`❌ ${error?.message || 'Coupon save failed'}`);}finally{if(button){button.disabled=false;button.textContent=state.editingId?'UPDATE COUPON':'CREATE COUPON';}}
  }

  async function toggleCoupon(id){
    const coupon=findCoupon(id); if(!coupon)return toast('❌ Coupon not found');
    try{
      const response=await fetch(`/api/coupons/admin/${encodeURIComponent(id)}`,{method:'PUT',credentials:'include',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({isActive:coupon?.isActive===false})});
      const data=await response.json().catch(()=>({})); if(!response.ok || data?.success===false)throw new Error(data?.message || `Coupon update failed (${response.status})`);
      toast(coupon?.isActive===false?'✅ Coupon enabled':'⏸ Coupon disabled'); await loadCoupons(true);
    }catch(error){toast(`❌ ${error?.message || 'Coupon update failed'}`);}
  }

  async function deleteCoupon(id,button){
    const coupon=findCoupon(id); if(!coupon)return;
    if(!button?.dataset?.armed){button.dataset.armed='1';button.textContent='CONFIRM';button.classList.add('is-armed');setTimeout(()=>{if(!button?.isConnected)return;delete button.dataset.armed;button.textContent='DELETE';button.classList.remove('is-armed');},4500);return;}
    try{
      const response=await fetch(`/api/coupons/admin/${encodeURIComponent(id)}`,{method:'DELETE',credentials:'include',headers:{Accept:'application/json'}}); const data=await response.json().catch(()=>({})); if(!response.ok || data?.success===false)throw new Error(data?.message || `Delete failed (${response.status})`);
      toast(`🗑️ ${coupon?.code || 'Coupon'} deleted`); await loadCoupons(true);
    }catch(error){toast(`❌ ${error?.message || 'Delete failed'}`);}
  }

  function bindControls(){
    if(bound)return; bound=true;
    document.getElementById('coupon-status-filter')?.addEventListener('change',applyFilters); document.getElementById('coupon-type-filter')?.addEventListener('change',applyFilters); document.getElementById('coupon-search-input')?.addEventListener('input',applyFilters); document.getElementById('coupons-refresh-btn')?.addEventListener('click',()=>loadCoupons(false));
    document.querySelectorAll('.adm-nav-item[data-page]').forEach(item=>item.addEventListener('click',()=>setTimeout(()=>{if(item.dataset.page==='coupons')loadCoupons(true);},0)));
    window.addEventListener('hashchange',()=>{if(window.location.hash==='#coupons')setTimeout(()=>loadCoupons(true),0);});
  }
  function installAutoRefresh(){ if(refreshTimer)return; refreshTimer=setInterval(()=>{if(isCouponsPage() && document.visibilityState!=='hidden')loadCoupons(true);},REFRESH_MS); }
  function bootstrap(){
    ensureStyles(); ensureModal(); bindControls(); installAutoRefresh();
    window.loadCoupons=loadCoupons; window.renderCoupons=applyFilters; window.openCouponModal=()=>openModal(null); window.closeCouponModal=closeModal; window.PADDOX_refreshCoupons=()=>loadCoupons(false); window.PADDOX_editCoupon=id=>{const coupon=findCoupon(id);if(coupon)openModal(coupon);else toast('❌ Coupon not found');}; window.PADDOX_toggleCoupon=toggleCoupon; window.PADDOX_deleteCoupon=deleteCoupon; window.PADDOX_closeCouponEditor=closeModal; window.PADDOX_ADMIN_COUPONS_STATE=state;
    loadCoupons(true);
  }

  ensureStyles();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bootstrap,{once:true}); else bootstrap();
})();
