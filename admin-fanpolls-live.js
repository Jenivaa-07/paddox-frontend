/* ============================================================
   PADDOX ADMIN — Fan Polls Live Controller
   Owns Fan Hub poll management after legacy Admin initialises.
   ============================================================ */
(function paddoxAdminFanPollsLive(){
  'use strict';

  const REFRESH_MS = 30000;
  const API = '/api/fan/admin/polls';
  const state = {
    polls: [],
    filtered: [],
    syncing: false,
    editingId: null,
    optionDrafts: [],
    error: '',
    lastSync: null
  };
  let timer = null;
  let bound = false;

  const $ = (id) => document.getElementById(id);
  const esc = (value='') => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  const norm = (value='') => String(value || '').trim().toLowerCase();
  const toast = (message) => typeof window.showToast === 'function' ? window.showToast(message) : console.log(message);
  const isPollPage = () => $('adm-fanpolls')?.classList.contains('on');

  function extract(payload={}){
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.polls)) return payload.polls;
    if (Array.isArray(payload?.data?.polls)) return payload.data.polls;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
  }

  function voteTotal(poll={}){
    if (Number.isFinite(Number(poll?.totalVotes))) return Number(poll.totalVotes);
    return (poll?.options || []).reduce((sum, option) => sum + Number(option?.votes || 0), 0);
  }

  function endMeta(poll={}){
    if (!poll?.endsAt) return { key: poll?.isActive ? 'live' : 'closed', label: poll?.isActive ? 'LIVE' : 'CLOSED', expired:false };
    const time = new Date(poll.endsAt).getTime();
    const expired = Number.isFinite(time) && time < Date.now();
    if (expired) return { key:'expired', label:'ENDED', expired:true };
    return { key: poll?.isActive ? 'live' : 'scheduled', label: poll?.isActive ? 'LIVE' : 'PAUSED', expired:false };
  }

  function formatDate(value){
    if (!value) return 'NO END TIME';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return 'NO END TIME';
    return d.toLocaleString('en-IN',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}).toUpperCase();
  }

  function localDateTimeValue(value){
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0,16);
  }

  function ensureStyles(){
    if ($('pdx-admin-fanpolls-style')) return;
    const style = document.createElement('style');
    style.id = 'pdx-admin-fanpolls-style';
    style.textContent = `
      body.pdx-admin-runtime #adm-fanpolls .poll-command-hero{position:relative;overflow:hidden;margin-bottom:18px!important;padding:31px 32px!important;border:1px solid rgba(255,255,255,.09)!important;border-left:4px solid #e8002d!important;background:radial-gradient(circle at 85% 8%,rgba(232,0,45,.18),transparent 33%),linear-gradient(112deg,rgba(232,0,45,.1),rgba(255,255,255,.012) 55%,rgba(255,255,255,.004))!important;box-shadow:0 24px 70px rgba(0,0,0,.22)}
      body.pdx-admin-runtime #adm-fanpolls .poll-command-hero:after{content:"VOTE";position:absolute;right:28px;bottom:-44px;color:rgba(255,255,255,.025);font:900 8.2rem/1 var(--font-d);pointer-events:none}
      body.pdx-admin-runtime #adm-fanpolls .poll-hero-kicker{color:#35e5a8!important;font:900 .53rem/1 var(--font-c)!important;letter-spacing:.2em!important;text-transform:uppercase}
      body.pdx-admin-runtime #adm-fanpolls .poll-command-hero h2{position:relative;z-index:1;margin:10px 0 8px!important;color:#fff!important;font:900 clamp(2.3rem,4vw,4rem)/.9 var(--font-d)!important;letter-spacing:.025em!important;text-transform:uppercase}
      body.pdx-admin-runtime #adm-fanpolls .poll-command-hero p{position:relative;z-index:1;max-width:820px!important;margin:0!important;color:rgba(255,255,255,.45)!important;font-size:.7rem!important;line-height:1.65!important}
      body.pdx-admin-runtime #adm-fanpolls .poll-hero-action{position:relative;z-index:2;min-height:44px!important;padding:0 18px!important;white-space:nowrap}
      body.pdx-admin-runtime #adm-fanpolls .poll-stat-grid{grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:11px!important;margin-bottom:14px!important}
      body.pdx-admin-runtime #adm-fanpolls .poll-stat-card{position:relative;min-height:108px!important;padding:19px!important;overflow:hidden;border:1px solid rgba(255,255,255,.085)!important;background:linear-gradient(145deg,rgba(255,255,255,.033),rgba(255,255,255,.008)),#0b0d12!important}
      body.pdx-admin-runtime #adm-fanpolls .poll-stat-card:before{content:"";position:absolute;left:0;top:0;width:3px;height:100%;background:#e8002d}
      body.pdx-admin-runtime #adm-fanpolls .poll-stat-card span{display:block;color:rgba(255,255,255,.34)!important;font:800 .49rem/1 var(--font-c)!important;letter-spacing:.14em!important;text-transform:uppercase}
      body.pdx-admin-runtime #adm-fanpolls .poll-stat-card strong{display:block;margin-top:14px;color:#fff!important;font:900 2.1rem/.9 var(--font-d)!important}
      body.pdx-admin-runtime #adm-fanpolls .poll-toolbar{display:grid!important;grid-template-columns:170px minmax(280px,1fr) auto;gap:9px!important;align-items:center!important;margin-bottom:14px!important;padding:12px!important;border:1px solid rgba(255,255,255,.075)!important;background:rgba(255,255,255,.015)!important}
      body.pdx-admin-runtime #adm-fanpolls .poll-toolbar .toolbar-filters{display:contents!important}
      body.pdx-admin-runtime #adm-fanpolls .poll-toolbar .adm-input,body.pdx-admin-runtime #adm-fanpolls .poll-toolbar select{min-height:42px!important;border:1px solid rgba(255,255,255,.09)!important;background:#090b0f!important;color:#fff!important}
      .pdx-poll-refresh{min-height:42px;padding:0 14px;border:1px solid rgba(255,255,255,.1);background:#11141a;color:rgba(255,255,255,.62);font:900 .48rem/1 var(--font-c);letter-spacing:.1em;cursor:pointer}
      body.pdx-admin-runtime #adm-fanpolls .fan-poll-admin-grid{grid-template-columns:minmax(330px,.72fr) minmax(0,1.28fr)!important;gap:14px!important;align-items:start!important}
      body.pdx-admin-runtime #adm-fanpolls .fan-poll-editor{position:sticky;top:88px;padding:20px!important;border:1px solid rgba(255,255,255,.085)!important;border-top:2px solid rgba(232,0,45,.55)!important;background:radial-gradient(circle at 100% 0,rgba(232,0,45,.09),transparent 32%),#0a0c10!important}
      body.pdx-admin-runtime #adm-fanpolls .poll-editor-head{margin-bottom:17px!important;padding-bottom:15px!important;border-bottom:1px solid rgba(255,255,255,.07)!important}
      body.pdx-admin-runtime #adm-fanpolls .poll-mode-pill{border:1px solid rgba(53,229,168,.2)!important;background:rgba(53,229,168,.06)!important;color:#35e5a8!important}
      body.pdx-admin-runtime #adm-fanpolls .adm-mini-label{display:block;margin:14px 0 7px!important;color:rgba(255,255,255,.36)!important;font:800 .48rem/1 var(--font-c)!important;letter-spacing:.13em!important;text-transform:uppercase}
      body.pdx-admin-runtime #adm-fanpolls .fan-poll-editor>.adm-input{min-height:43px!important;background:#0d1015!important;border-color:rgba(255,255,255,.09)!important}
      .pdx-poll-option-row{display:grid;grid-template-columns:34px minmax(120px,1.4fr) minmax(96px,.8fr) 44px;gap:6px;align-items:center;margin-bottom:7px;padding:7px;border:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.016)}
      .pdx-poll-option-index{display:grid;place-items:center;width:28px;height:28px;border:1px solid rgba(232,0,45,.25);background:rgba(232,0,45,.07);color:#fff;font:900 .65rem/1 var(--font-c)}
      .pdx-poll-option-row input{min-width:0;height:36px;padding:0 9px;border:1px solid rgba(255,255,255,.08);outline:0;background:#0c0f13;color:#fff;font-size:.62rem}
      .pdx-poll-option-row input[type=color]{width:38px;padding:3px;cursor:pointer}
      .pdx-poll-option-meta{grid-column:2/-1;display:grid;grid-template-columns:minmax(90px,.75fr) minmax(120px,1.25fr);gap:6px}
      .pdx-poll-option-votes{grid-column:2/-1;display:flex;align-items:center;gap:8px;color:rgba(255,255,255,.33);font:750 .46rem/1 var(--font-c);letter-spacing:.08em}.pdx-poll-option-votes i{display:block;height:4px;min-width:5px;border-radius:99px;background:#e8002d}
      .pdx-poll-remove{height:36px;border:1px solid rgba(255,80,110,.18);background:rgba(255,80,110,.04);color:#ff6680;font-size:1rem;cursor:pointer}
      .pdx-poll-ends{margin-top:11px;padding-top:11px;border-top:1px solid rgba(255,255,255,.06)}.pdx-poll-ends input{width:100%;min-height:41px;padding:8px 10px;border:1px solid rgba(255,255,255,.09);background:#0d1015;color:#fff;color-scheme:dark}
      body.pdx-admin-runtime #adm-fanpolls .poll-admin-row{margin-top:13px!important;padding:11px!important;border:1px solid rgba(255,255,255,.065)!important;background:rgba(255,255,255,.015)!important}.poll-admin-row label{color:rgba(255,255,255,.52)!important;font-size:.58rem!important}.poll-admin-row input{accent-color:#e8002d}
      body.pdx-admin-runtime #adm-fanpolls .poll-form-actions{display:flex!important;gap:7px!important;margin-top:12px!important}.poll-form-actions button{min-height:38px!important;flex:1}
      body.pdx-admin-runtime #adm-fanpolls .admin-hint{margin-top:11px!important;color:rgba(255,255,255,.3)!important;font-size:.53rem!important;line-height:1.55!important}
      body.pdx-admin-runtime #adm-fanpolls .fan-poll-table-wrap{overflow:auto!important;border:1px solid rgba(255,255,255,.08)!important;background:#080a0e!important;box-shadow:0 24px 70px rgba(0,0,0,.22)}
      body.pdx-admin-runtime #adm-fanpolls .poll-table-topline{padding:15px 16px!important;border-bottom:1px solid rgba(255,255,255,.07)!important;background:linear-gradient(90deg,rgba(232,0,45,.06),transparent 48%)!important}.poll-table-topline span{color:#e8002d!important;font:900 .49rem/1 var(--font-c)!important;letter-spacing:.13em!important}.poll-table-topline strong{display:block;margin-top:5px;color:#fff!important;font:900 1.13rem/1 var(--font-d)!important;letter-spacing:.04em!important}
      body.pdx-admin-runtime #adm-fanpolls .fan-poll-table-wrap table{min-width:940px!important}.fan-poll-table-wrap th{height:44px!important;padding:0 12px!important;background:#0d0f14!important;color:rgba(255,255,255,.34)!important;font:800 .48rem/1 var(--font-c)!important;letter-spacing:.13em!important}.fan-poll-table-wrap td{padding:14px 12px!important;border-bottom:1px solid rgba(255,255,255,.052)!important;vertical-align:middle!important}
      .pdx-poll-question{max-width:330px}.pdx-poll-question strong{display:block;color:#fff;font:800 .74rem/1.35 var(--font-b)}.pdx-poll-question small{display:block;margin-top:6px;color:rgba(255,255,255,.28);font:750 .45rem/1 var(--font-c);letter-spacing:.07em}
      .pdx-poll-table-options{display:flex;flex-direction:column;gap:7px;min-width:250px}.pdx-poll-table-option{display:grid;grid-template-columns:minmax(80px,1fr) 44px;gap:7px;align-items:center}.pdx-poll-table-option span{min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:rgba(255,255,255,.55);font-size:.55rem}.pdx-poll-table-option b{color:#fff;font:900 .56rem/1 var(--font-c);text-align:right}.pdx-poll-table-bar{grid-column:1/-1;height:3px;border-radius:99px;background:rgba(255,255,255,.05);overflow:hidden}.pdx-poll-table-bar i{display:block;height:100%;background:#e8002d}
      .pdx-poll-total strong{display:block;color:#fff;font:900 1.45rem/1 var(--font-d)}.pdx-poll-total small{display:block;margin-top:4px;color:rgba(255,255,255,.27);font:750 .44rem/1 var(--font-c);letter-spacing:.07em}
      .pdx-poll-status{display:inline-flex;align-items:center;gap:6px;padding:7px 9px;border:1px solid rgba(255,255,255,.09);border-radius:99px;font:900 .45rem/1 var(--font-c);letter-spacing:.08em}.pdx-poll-status i{width:6px;height:6px;border-radius:50%;background:currentColor;box-shadow:0 0 10px currentColor}.pdx-poll-status.is-live{color:#35e5a8;border-color:rgba(53,229,168,.2);background:rgba(53,229,168,.05)}.pdx-poll-status.is-closed{color:#9da6b4}.pdx-poll-status.is-ended{color:#ff687f;border-color:rgba(255,104,127,.2)}
      .pdx-poll-actions{display:flex;gap:5px;white-space:nowrap}.pdx-poll-actions button{min-height:31px;padding:0 8px;border:1px solid rgba(255,255,255,.09);background:#11141a;color:rgba(255,255,255,.57);font:900 .43rem/1 var(--font-c);letter-spacing:.06em;cursor:pointer}.pdx-poll-actions .is-edit{border-color:rgba(232,0,45,.25);background:rgba(232,0,45,.07);color:#fff}.pdx-poll-actions .is-live{color:#35e5a8;border-color:rgba(53,229,168,.16)}.pdx-poll-actions .is-delete{color:#ff687f;border-color:rgba(255,104,127,.17)}.pdx-poll-actions .is-delete.is-armed{background:#c50026;color:#fff;border-color:#e8002d}
      .pdx-poll-empty{padding:55px!important;text-align:center;color:rgba(255,255,255,.34)}.pdx-poll-empty strong{display:block;margin-bottom:8px;color:#fff;font:900 1.25rem/1 var(--font-d);letter-spacing:.06em}
      @media(max-width:1100px){body.pdx-admin-runtime #adm-fanpolls .fan-poll-admin-grid{grid-template-columns:1fr!important}body.pdx-admin-runtime #adm-fanpolls .fan-poll-editor{position:relative;top:auto}}
      @media(max-width:800px){body.pdx-admin-runtime #adm-fanpolls .poll-command-hero{align-items:flex-start!important;flex-direction:column!important}body.pdx-admin-runtime #adm-fanpolls .poll-stat-grid{grid-template-columns:1fr 1fr!important}body.pdx-admin-runtime #adm-fanpolls .poll-toolbar{grid-template-columns:1fr!important}.poll-toolbar .toolbar-filters{display:contents!important}}
      @media(max-width:560px){body.pdx-admin-runtime #adm-fanpolls .poll-stat-grid{grid-template-columns:1fr!important}.pdx-poll-option-row{grid-template-columns:30px 1fr 38px}.pdx-poll-option-meta{grid-column:2/-1;grid-template-columns:1fr}.pdx-poll-option-row>input[type=color]{display:none}}
    `;
    document.head.appendChild(style);
  }

  function ensureToolbar(){
    const toolbar = document.querySelector('#adm-fanpolls .poll-toolbar');
    if (!toolbar) return;
    const filters = toolbar.querySelector('.toolbar-filters');
    if (filters && !$('poll-status-filter')) {
      const select = document.createElement('select');
      select.id = 'poll-status-filter';
      select.className = 'adm-select';
      select.innerHTML = '<option value="all">All Polls</option><option value="live">Live</option><option value="closed">Closed</option><option value="ended">Ended</option>';
      filters.prepend(select);
    }
    if (!$('poll-refresh-btn')) {
      const btn = document.createElement('button');
      btn.id = 'poll-refresh-btn';
      btn.className = 'pdx-poll-refresh';
      btn.type = 'button';
      btn.textContent = 'REFRESH';
      toolbar.appendChild(btn);
    }
  }

  function ensureFourthStat(){
    const grid = document.querySelector('#adm-fanpolls .poll-stat-grid');
    if (!grid || $('poll-stat-options')) return;
    const card = document.createElement('div');
    card.className = 'poll-stat-card';
    card.innerHTML = '<span>Poll Options</span><strong id="poll-stat-options">0</strong>';
    grid.appendChild(card);
  }

  function ensureEndsAt(){
    const editor = document.querySelector('#adm-fanpolls .fan-poll-editor');
    const row = editor?.querySelector('.poll-admin-row');
    if (!editor || !row || $('poll-ends-at')) return;
    const wrap = document.createElement('div');
    wrap.className = 'pdx-poll-ends';
    wrap.innerHTML = '<label class="adm-mini-label" for="poll-ends-at">Poll Ends At <span style="opacity:.45">(optional)</span></label><input id="poll-ends-at" type="datetime-local"/>';
    row.before(wrap);
  }

  function currentEditingPoll(){
    return state.polls.find(p => String(p?._id || '') === String(state.editingId || '')) || null;
  }

  function makeDraft(source={}, index=0){
    return {
      label: String(source?.label || source?.text || ''),
      teamName: String(source?.teamName || source?.team || ''),
      logo: String(source?.logo || source?.teamLogo || source?.image || ''),
      teamColor: String(source?.teamColor || source?.color || '#e8002d'),
      logoKey: String(source?.logoKey || source?.key || ''),
      votes: Math.max(0, Number(source?.votes || 0)),
      percentage: Math.max(0, Number(source?.percentage || 0)),
      index
    };
  }

  function syncDraftFromDom(){
    const rows = [...document.querySelectorAll('#poll-options-admin .pdx-poll-option-row')];
    state.optionDrafts = rows.map((row, index) => ({
      label: row.querySelector('[data-field="label"]')?.value || '',
      teamName: row.querySelector('[data-field="teamName"]')?.value || '',
      logo: row.querySelector('[data-field="logo"]')?.value || '',
      teamColor: row.querySelector('[data-field="teamColor"]')?.value || '#e8002d',
      logoKey: row.dataset.logoKey || '',
      votes: Math.max(0, Number(row.dataset.votes || 0)),
      percentage: Math.max(0, Number(row.dataset.percentage || 0)),
      index
    }));
  }

  function renderOptionBuilder(){
    const host = $('poll-options-admin');
    if (!host) return;
    if (!state.optionDrafts.length) state.optionDrafts = [makeDraft({},0), makeDraft({},1)];
    const total = state.optionDrafts.reduce((sum,o)=>sum + Number(o.votes || 0),0);
    host.innerHTML = state.optionDrafts.map((option,index)=>{
      const pct = total > 0 ? Math.round((Number(option.votes || 0)/total)*100) : Number(option.percentage || 0);
      return `<div class="pdx-poll-option-row" data-index="${index}" data-votes="${Number(option.votes||0)}" data-percentage="${pct}" data-logo-key="${esc(option.logoKey||'')}">
        <span class="pdx-poll-option-index">${index+1}</span>
        <input data-field="label" maxlength="120" value="${esc(option.label)}" placeholder="Option ${index+1} label" aria-label="Poll option ${index+1}">
        <input data-field="teamColor" type="color" value="${/^#[0-9a-f]{6}$/i.test(option.teamColor || '') ? esc(option.teamColor) : '#e8002d'}" title="Team accent color">
        <button class="pdx-poll-remove" type="button" onclick="PADDOX_removePollOption(${index})" ${state.optionDrafts.length<=2?'disabled':''}>×</button>
        <div class="pdx-poll-option-meta">
          <input data-field="teamName" maxlength="80" value="${esc(option.teamName)}" placeholder="Team name (optional)">
          <input data-field="logo" maxlength="1000" value="${esc(option.logo)}" placeholder="Team logo URL (optional)">
        </div>
        <div class="pdx-poll-option-votes"><span>${Number(option.votes||0)} VOTES · ${pct}%</span><i style="width:${Math.max(4,pct)}%"></i></div>
      </div>`;
    }).join('');
    host.querySelectorAll('input').forEach(input => input.addEventListener('input', syncDraftFromDom));
  }

  function addOption(){
    syncDraftFromDom();
    if (state.optionDrafts.length >= 5) return toast('⚠️ Maximum 5 poll options');
    state.optionDrafts.push(makeDraft({},state.optionDrafts.length));
    renderOptionBuilder();
  }

  function removeOption(index){
    syncDraftFromDom();
    if (state.optionDrafts.length <= 2) return toast('⚡️ A poll needs at least 2 options');
    state.optionDrafts.splice(Number(index),1);
    renderOptionBuilder();
  }

  function renderStats(){
    const totalVotes = state.polls.reduce((sum,p)=>sum + voteTotal(p),0);
    const options = state.polls.reduce((sum,p)=>sum + (Array.isArray(p?.options)?p.options.length:0),0);
    if ($('poll-stat-total')) $('poll-stat-total').textContent = state.polls.length.toLocaleString('en-IN');
    if ($('poll-stat-active')) $('poll-stat-active').textContent = state.polls.filter(p=>p?.isActive).length.toLocaleString('en-IN');
    if ($('poll-stat-votes')) $('poll-stat-votes').textContent = totalVotes.toLocaleString('en-IN');
    if ($('poll-stat-options')) $('poll-stat-options').textContent = options.toLocaleString('en-IN');
  }

  function statusKey(poll){
    const meta = endMeta(poll);
    if (meta.expired) return 'ended';
    return poll?.isActive ? 'live' : 'closed';
  }

  function applyFilters(){
    const search = norm($('poll-search-admin')?.value || '');
    const status = $('poll-status-filter')?.value || 'all';
    state.filtered = state.polls.filter(poll => {
      if (status !== 'all' && statusKey(poll) !== status) return false;
      if (!search) return true;
      const hay = [poll?.question, ...(poll?.options || []).flatMap(o => [o?.label, o?.teamName, o?.logoKey])].map(norm).join(' ');
      return hay.includes(search);
    });
    renderRows();
  }

  function renderRows(){
    const tbody = $('fan-polls-tbody');
    if (!tbody) return;
    if (state.error && !state.polls.length) {
      tbody.innerHTML = `<tr><td colspan="5" class="pdx-poll-empty"><strong>POLL FEED UNAVAILABLE</strong>${esc(state.error)}</td></tr>`;
      return;
    }
    if (!state.filtered.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="pdx-poll-empty"><strong>NO MATCHING POLLS</strong>Try another search or status filter.</td></tr>';
      return;
    }
    tbody.innerHTML = state.filtered.map(poll => {
      const id = esc(String(poll?._id || ''));
      const total = voteTotal(poll);
      const meta = endMeta(poll);
      const statusClass = meta.expired ? 'is-ended' : poll?.isActive ? 'is-live' : 'is-closed';
      const options = (poll?.options || []).map(option => {
        const pct = total > 0 ? Math.round((Number(option?.votes||0)/total)*100) : 0;
        return `<div class="pdx-poll-table-option"><span>${esc(option?.label || 'Option')}</span><b>${Number(option?.votes||0)} · ${pct}%</b><div class="pdx-poll-table-bar"><i style="width:${pct}%"></i></div></div>`;
      }).join('');
      return `<tr>
        <td><div class="pdx-poll-question"><strong>${esc(poll?.question || 'Untitled poll')}</strong><small>${esc(formatDate(poll?.endsAt))}</small></div></td>
        <td><div class="pdx-poll-table-options">${options || '<span style="opacity:.4">No options</span>'}</div></td>
        <td><div class="pdx-poll-total"><strong>${total.toLocaleString('en-IN')}</strong><small>${(poll?.voters || []).length.toLocaleString('en-IN')} UNIQUE VOTERS</small></div></td>
        <td><span class="pdx-poll-status ${statusClass}"><i></i>${meta.expired ? 'ENDED' : poll?.isActive ? 'LIVE' : 'CLOSED'}</span></td>
        <td><div class="pdx-poll-actions"><button class="is-edit" type="button" onclick="PADDOX_editPoll('${id}')">EDIT</button><button class="is-live" type="button" onclick="PADDOX_togglePoll('${id}')">${poll?.isActive?'CLOSE':'SET LIVE'}</button><button class="is-delete" type="button" onclick="PADDOX_deletePoll('${id}',this)">DELETE</button></div></td>
      </tr>`;
    }).join('');
  }

  async function loadPolls(silent=false){
    if (state.syncing) return state.polls;
    state.syncing = true;
    state.error = '';
    if (!silent) toast('⏠ Syncing Fan Hub polls…');
    try {
      const response = await fetch(API,{credentials:'include',cache:'no-store',headers:{Accept:'application/json'}});
      const payload = await response.json().catch(()=>({}));
      if (!response.ok || payload?.success === false) throw new Error(payload?.message || `Poll sync failed (${response.status})`);
      state.polls = extract(payload);
      state.lastSync = new Date();
      renderStats();
      applyFilters();
      if (!silent) toast(`✅ ${state.polls.length} polls synced`);
      return state.polls;
    } catch(error){
      state.error = error?.message || 'Fan polls unavailable';
      console.warn('PADDOX Fan Poll sync failed:',error);
      renderStats();
      applyFilters();
      if (!silent) toast(`❌ ${state.error}`);
      return state.polls;
    } finally {
      state.syncing = false;
    }
  }

  function resetForm(){
    state.editingId = null;
    state.optionDrafts = [makeDraft({},0),makeDraft({},1)];
    if ($('poll-edit-id')) $('poll-edit-id').value = '';
    if ($('poll-question')) $('poll-question').value = '';
    if ($('poll-active')) $('poll-active').checked = true;
    if ($('poll-reset-votes')) $('poll-reset-votes').checked = false;
    if ($('poll-ends-at')) $('poll-ends-at').value = '';
    if ($('poll-admin-status')) $('poll-admin-status').textContent = 'Create a live Fan Hub poll with 2–5 options and optional team branding.';
    const title = document.querySelector('#adm-fanpolls .fan-poll-editor .adm-panel-title');
    if (title) title.textContent = 'Create / Edit Poll';
    renderOptionBuilder();
  }

  function editPoll(id){
    const poll = state.polls.find(p=>String(p?._id||'')===String(id||''));
    if (!poll) return toast('❌ Poll not found');
    state.editingId = String(poll._id);
    state.optionDrafts = (poll.options || []).map(makeDraft);
    if ($('poll-edit-id')) $('poll-edit-id').value = state.editingId;
    if ($('poll-question')) $('poll-question').value = poll.question || '';
    if ($('poll-active')) $('poll-active').checked = !!poll.isActive;
    if ($('poll-reset-votes')) $('poll-reset-votes').checked = false;
    if ($('poll-ends-at')) $('poll-ends-at').value = localDateTimeValue(poll.endsAt);
    if ($('poll-admin-status')) $('poll-admin-status').textContent = `Editing live poll data · ${voteTotal(poll)} votes preserved unless reset is checked.`;
    const title = document.querySelector(''adm-fanpolls .fan-poll-editor .adm-panel-title');
    if (title) title.textContent = 'Edit Poll';
    renderOptionBuilder();
    document.querySelector('#adm-fanpolls .fan-poll-editor')?.scrollIntoView({behavior:'smooth',block:'start'});
  }

  function readOptions(){
    syncDraftFromDom();
    return state.optionDrafts.map(option=>({
      label:String(option.label||'').trim(),
      votes:Number(option.votes||0),
      teamName:String(option.teamName||'').trim(),
      logo:String(option.logo||'').trim(),
      teamColor:String(option.teamColor||'#e8002d').trim(),
      logoKey:String(option.logoKey||'').trim()
    })).filter(option=>option.label).slice(0,5);
  }

  async function savePoll(){
    const question = String($('poll-question')?.value || '').trim();
    const options = readOptions();
    const resetVotes = !!$('poll-reset-votes')?.checked;
    if (!question) return toast('❌ Poll question is required');
    if (options.length < 2) return toast('❌ Add at least 2 poll options');
    const payload = {
      question,
      options,
      isActive: !!$('poll-active')?.checked,
      resetVotes,
      endsAt: $('poll-ends-at')?.value ? new Date($('poll-ends-at').value).toISOString() : null
    };
    const isEdit = !!state.editingId;
    const endpoint = isEdit ? `${API}/${encodeURIComponent(state.editingId)}` : API;
    const status = $('poll-admin-status');
    if (status) status.textContent = isEdit ? 'Updating poll…' : 'Publishing poll…';
    try {
      const response = await fetch(endpoint,{method:isEdit?'PUT':'POST',credentials:'include',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(payload)});
      const data = await response.json().catch(()=>({}));
      if (!response.ok || data?.success === false) throw new Error(data?.message || `Poll save failed (${response.status})`);
      toast(isEdit ? '✅ Poll updated' : '🔥 Poll published to Fan Hub');
      resetForm();
      await loadPolls(true);
    } catch(error){
      if (status) status.textContent = error?.message || 'Poll save failed';
      toast(`❌ ${error?.message || 'Poll save failed'}`);
    }
  }

  async function togglePoll(id){
    const poll = state.polls.find(p=>String(p?._id||'')===String(id||''));
    if (!poll) return;
    try {
      const response = await fetch(`${API}/${encodeURIComponent(id)}/active`,{method:'PATCH',credentials:'include',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({isActive:!poll.isActive})});
      const data = await response.json().catch(()=>({}));
      if (!response.ok || data?.success === false) throw new Error(data?.message || `Poll state update failed (${response.status})`);
      toast(poll.isActive ? '⏸ Poll closed' : '🟢 Poll is now live');
      await loadPolls(true);
    } catch(error){ toast(`❌ ${error?.message || 'Poll update failed'}`); }
  }

  async function deletePoll(id,button){
    const poll = state.polls.find(p=>String(p?._id||'')===String(id||''));
    if (!poll) return;
    if (!button?.dataset?.armed) {
      button.dataset.armed='1';
      button.textContent='CONFIRM';
      button.classList.add('is-armed');
      setTimeout(()=>{ if(!button/.isConnected)return; delete button.dataset.armed; button.textContent='DELETE'; button.classList.remove('is-armed'); },4500);
      return;
    }
    try {
      const response = await fetch(`${API}/${encodeURIComponent(id)}`,{method:'DELETE',credentials:'include',headers:{Accept:'application/json'}});
      const data = await response.json().catch(()=>({}));
      if (!response.ok || data?.success === false) throw new Error(data?.message || `Delete failed (${response.status})`);
      toast('🗑️ Poll deleted');
      if (String(state.editingId||'')===String(id)) resetForm();
      await loadPolls(true);
    } catch(error){ toast(`❌ ${error?.message || 'Delete failed'}`); }
  }

  function bind(){
    if (bound) return;
    bound = true;
    $('poll-search-admin')?.addEventListener('input',applyFilters);
    $('poll-status-filter')?.addEventListener('change',applyFilters);
    $('poll-refresh-btn')?.addEventListener('click',()=>loadPolls(false));
    document.querySelectorAll('.adm-nav-item[data-page]').forEach(item=>item.addEventListener('click',()=>setTimeout(()=>{if(item.dataset.page==='fanpolls')loadPolls(true);},0)));
    window.addEventListener('hashchange',()=>{if(window.location.hash==='#fanpolls')setTimeout(()=>loadPolls(true),0);});
  }

  function installAutoRefresh(){
    if (timer) return;
    timer = setInterval(()=>{ if(isPollPage() && document.visibilityState !== 'hidden') loadPolls(true); },REFRESH_MS);
  }

  function bootstrap(){
    ensureStyles();
    ensureToolbar();
    ensureFourthStat();
    ensureEndsAt();
    bind();
    installAutoRefresh();
    resetForm();

    window.loadFanPolls = loadPolls;
    window.resetFanPollForm = resetForm;
    window.addFanPollOption = addOption;
    window.saveFanPollAdmin = savePoll;
    window.PADDOX_removePollOption = removeOption;
    window.PADDOX_editPoll = editPoll;
    window.PADDOX_togglePoll = togglePoll;
    window.PADDOX_deletePoll = deletePoll;
    window.PADDOX_refreshFanPolls = () => loadPolls(false);
    window.PADDOX_ADMIN_POLLS_STATE = state;

    loadPolls(true);
  }

  ensureStyles();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',bootstrap,{once:true});
  else bootstrap();
})();
