/* PADDOX ADMIN — Live Fan Polls Controller */
(function(){
'use strict';

const API='/api/fan/admin/polls';
const REFRESH=30000;

const TEAM_CATALOG=[
  {key:'mercedes',name:'Mercedes',aliases:['mercedes-amg','mercedes amg','kimi','george','russell','antonelli'],color:'#00d2be',image:'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2025/mercedes/2025mercedeslogowhite.webp'},
  {key:'ferrari',name:'Ferrari',aliases:['scuderia ferrari','charles','leclerc','lewis','hamilton'],color:'#e8002d',image:'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2025/ferrari/2025ferrarilogolight.webp'},
  {key:'mclaren',name:'McLaren',aliases:['mclaren racing','mclaren f1','lando','norris','oscar','piastri'],color:'#ff8700',image:'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2025/mclaren/2025mclarenlogowhite.webp'},
  {key:'red-bull',name:'Red Bull Racing',aliases:['red bull','oracle red bull','verstappen','max','hadjar','isack'],color:'#1e5bff',image:'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2025/redbullracing/2025redbullracinglogowhite.webp'},
  {key:'aston-martin',name:'Aston Martin',aliases:['aston martin aramco','alonso','fernando','stroll','lance'],color:'#006f62',image:'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2025/astonmartin/2025astonmartinlogowhite.webp'},
  {key:'alpine',name:'Alpine',aliases:['bwt alpine','gasly','pierre','colapinto','franco'],color:'#2293d1',image:'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2025/alpine/2025alpinelogowhite.webp'},
  {key:'williams',name:'Williams',aliases:['williams racing','atlassian williams','albon','alexander','sainz','carlos'],color:'#64c4ff',image:'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2025/williams/2025williamslogowhite.webp'},
  {key:'haas',name:'Haas F1 Team',aliases:['haas f1','tgr haas','ocon','esteban','bearman','oliver'],color:'#ffffff',image:'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2025/haas/2025haaslogowhite.webp'},
  {key:'racing-bulls',name:'Racing Bulls',aliases:['visa cash app rb','vcarb','rb','lawson','liam','lindblad','arvid'],color:'#6c4cff',image:'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2025/racingbulls/2025racingbullslogowhite.webp'},
  {key:'audi',name:'Audi',aliases:['audi revolut','kick sauber','sauber','hulkenberg','nico','bortoleto','gabriel'],color:'#00e701',image:'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2026/audi/2026audilogowhite.webp'},
  {key:'cadillac',name:'Cadillac',aliases:['cadillac f1','cadillac formula 1','perez','sergio','bottas','valtteri'],color:'#d4af37',image:'https://media.formula1.com/image/upload/c_fit%2Ch_64/q_auto/v1740000001/common/f1/2026/cadillac/2026cadillaclogowhite.webp'}
];

const state={polls:[],editingId:null,options:[],busy:false};
let timer=null,bound=false;

const $=id=>document.getElementById(id);
const toast=m=>typeof window.showToast==='function'?window.showToast(m):console.log(m);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const totalVotes=p=>Number.isFinite(+p?.totalVotes)?+p.totalVotes:(p?.options||[]).reduce((n,o)=>n+(+o.votes||0),0);
const pollStatus=p=>p?.endsAt&&new Date(p.endsAt).getTime()<Date.now()?'ended':p?.isActive?'live':'closed';
const localDate=v=>{if(!v)return'';const d=new Date(v);if(Number.isNaN(d.getTime()))return'';return new Date(d-d.getTimezoneOffset()*60000).toISOString().slice(0,16)};
const extractPolls=x=>Array.isArray(x?.data?.polls)?x.data.polls:Array.isArray(x?.polls)?x.polls:Array.isArray(x?.data)?x.data:[];

function normalize(value=''){
  return String(value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
}
function teamByKey(key=''){
  const n=normalize(key);
  return TEAM_CATALOG.find(t=>normalize(t.key)===n||normalize(t.name)===n)||null;
}
function teamMatch(option={}){
  const values=[option.logoKey,option.teamName,option.label].map(normalize).filter(Boolean);
  if(!values.length)return null;
  return TEAM_CATALOG.find(team=>{
    const names=[team.key,team.name,...(team.aliases||[])].map(normalize);
    return values.some(v=>names.some(n=>v===n||v.includes(n)||n.includes(v)));
  })||null;
}
function optionColor(option={},index=0){
  return teamMatch(option)?.color||option.teamColor||['#00d2be','#e8002d','#ff8700','#1e5bff','#006f62'][index%5];
}
function optionLogo(option={}){
  const team=teamMatch(option);
  if(team?.image)return team.image;
  const raw=String(option.logo||'').trim();
  return /^(https?:\/\/|data:image\/)/i.test(raw)?raw:'';
}
function logoTile(option={},index=0,size=42){
  const src=optionLogo(option);
  const color=esc(optionColor(option,index));
  const label=String(teamMatch(option)?.name||option.teamName||option.label||`Option ${index+1}`).trim();
  const initial=esc((label[0]||String(index+1)).toUpperCase());
  return `<span class="pdx-poll-logo-tile" style="--poll-logo-color:${color};width:${size}px;height:${size}px">
    <span>${initial}</span>
    ${src?`<img src="${esc(src)}" alt="${esc(label)} logo" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.display='none'">`:''}
  </span>`;
}
function teamSelectHTML(option={},index=0){
  const matched=teamMatch(option);
  const current=matched?.key||'';
  const opts=TEAM_CATALOG.map(t=>`<option value="${esc(t.key)}" ${current===t.key?'selected':''}>${esc(t.name)}</option>`).join('');
  return `<select class="adm-select pdx-poll-team-select" data-f="team-select" aria-label="Team logo for option ${index+1}">
    <option value="">Select team logo</option>
    ${opts}
    <option value="custom" ${!matched&&(option.logo||option.teamName)?'selected':''}>Custom / no team logo</option>
  </select>`;
}
function injectStyles(){
  if($('pdx-live-fanpolls-style'))return;
  const style=document.createElement('style');
  style.id='pdx-live-fanpolls-style';
  style.textContent=`
    #adm-fanpolls .fan-poll-admin-grid{
      display:grid!important;
      grid-template-columns:minmax(430px,.92fr) minmax(0,1.28fr)!important;
      gap:22px!important;
      align-items:start!important;
    }
    #adm-fanpolls .fan-poll-editor,
    #adm-fanpolls .fan-poll-table-wrap{min-width:0!important;overflow:hidden!important}
    #adm-fanpolls .fan-poll-table-wrap{overflow-x:auto!important}
    #adm-fanpolls .fan-poll-table-wrap table{width:100%!important;min-width:760px!important;table-layout:fixed!important}
    #adm-fanpolls .fan-poll-table-wrap th:nth-child(1){width:31%}
    #adm-fanpolls .fan-poll-table-wrap th:nth-child(2){width:34%}
    #adm-fanpolls .fan-poll-table-wrap th:nth-child(3){width:12%}
    #adm-fanpolls .fan-poll-table-wrap th:nth-child(4){width:10%}
    #adm-fanpolls .fan-poll-table-wrap th:nth-child(5){width:13%}
    #adm-fanpolls .fan-poll-table-wrap td{vertical-align:top!important;white-space:normal!important}
    #adm-fanpolls .pdx-live-poll-option{
      display:grid!important;
      grid-template-columns:30px 50px minmax(120px,1fr) minmax(155px,.72fr) 42px 36px!important;
      gap:9px!important;
      align-items:center!important;
      padding:12px!important;
      margin:9px 0!important;
      border:1px solid rgba(255,255,255,.09)!important;
      background:linear-gradient(135deg,rgba(255,255,255,.025),rgba(232,0,45,.025))!important;
      border-radius:12px!important;
    }
    #adm-fanpolls .pdx-poll-option-index{display:grid;place-items:center;color:#ff003c;font:700 18px "Barlow Condensed",sans-serif}
    #adm-fanpolls .pdx-poll-logo-tile{
      position:relative;display:grid;place-items:center;overflow:hidden;flex:0 0 auto;
      border-radius:10px;border:1px solid color-mix(in srgb,var(--poll-logo-color),transparent 58%);
      background:color-mix(in srgb,var(--poll-logo-color),transparent 90%);
    }
    #adm-fanpolls .pdx-poll-logo-tile>span{font:800 14px Inter,sans-serif;color:var(--poll-logo-color);opacity:.9}
    #adm-fanpolls .pdx-poll-logo-tile img{position:absolute;inset:5px;width:calc(100% - 10px);height:calc(100% - 10px);object-fit:contain}
    #adm-fanpolls .pdx-poll-team-select{height:42px!important;width:100%!important;min-width:0!important;padding-right:30px!important}
    #adm-fanpolls .pdx-poll-choice-input{min-width:0!important;width:100%!important}
    #adm-fanpolls .pdx-poll-color{width:42px!important;height:42px!important;padding:3px!important;border:1px solid rgba(255,255,255,.12);background:#111}
    #adm-fanpolls .pdx-poll-remove{width:36px!important;height:42px!important;padding:0!important;display:grid!important;place-items:center!important}
    #adm-fanpolls .pdx-poll-option-meta{grid-column:3/-1!important;display:flex!important;gap:10px!important;align-items:center!important;min-width:0;color:#777;font-size:12px}
    #adm-fanpolls .pdx-poll-option-meta b{color:#aaa;font-weight:600}
    #adm-fanpolls .pdx-poll-library-option{display:grid;grid-template-columns:34px minmax(0,1fr) auto;gap:8px;align-items:center;margin:7px 0}
    #adm-fanpolls .poll-admin-row{display:grid!important;grid-template-columns:1fr 1fr!important;gap:12px!important;align-items:center!important}
    #adm-fanpolls .poll-form-actions{display:flex!important;gap:10px!important;flex-wrap:wrap!important}
    #adm-fanpolls .poll-toolbar .toolbar-filters{display:grid!important;grid-template-columns:180px minmax(220px,1fr)!important;gap:10px!important;min-width:0!important}
    #adm-fanpolls .poll-toolbar .toolbar-filters .adm-input,
    #adm-fanpolls .poll-toolbar .toolbar-filters .adm-select{width:100%!important;min-width:0!important}
    @media(max-width:1250px){
      #adm-fanpolls .fan-poll-admin-grid{grid-template-columns:1fr!important}
      #adm-fanpolls .pdx-live-poll-option{grid-template-columns:30px 48px minmax(140px,1fr) minmax(150px,.8fr) 40px 36px!important}
    }
    @media(max-width:760px){
      #adm-fanpolls .pdx-live-poll-option{grid-template-columns:28px 46px minmax(0,1fr) 36px!important}
      #adm-fanpolls .pdx-poll-team-select{grid-column:3/5!important}
      #adm-fanpolls .pdx-poll-color{grid-column:2!important;grid-row:2!important}
      #adm-fanpolls .pdx-poll-remove{grid-column:4!important;grid-row:1!important}
      #adm-fanpolls .pdx-poll-option-meta{grid-column:3/5!important}
      #adm-fanpolls .poll-toolbar .toolbar-filters{grid-template-columns:1fr!important}
    }
  `;
  document.head.appendChild(style);
}
function ensureEnhancements(){
  injectStyles();
  const filters=document.querySelector('#adm-fanpolls .toolbar-filters');
  if(filters&&!$('poll-status-filter')){
    const s=document.createElement('select');
    s.id='poll-status-filter';
    s.className='adm-select';
    s.innerHTML='<option value="all">All Polls</option><option value="live">Live</option><option value="closed">Closed</option><option value="ended">Ended</option>';
    filters.prepend(s);
  }
  const stats=document.querySelector('#adm-fanpolls .poll-stat-grid');
  if(stats&&!$('poll-stat-options')){
    const c=document.createElement('div');
    c.className='poll-stat-card';
    c.innerHTML='<span>Poll Options</span><strong id="poll-stat-options">0</strong>';
    stats.appendChild(c);
  }
  const anchor=document.querySelector('#adm-fanpolls .poll-admin-row');
  if(anchor&&!$('poll-ends-at')){
    const w=document.createElement('div');
    w.style.margin='14px 0';
    w.innerHTML='<label class="adm-mini-label" for="poll-ends-at">Poll Ends At <span style="opacity:.45">(optional)</span></label><input class="adm-input" id="poll-ends-at" type="datetime-local" style="color-scheme:dark">';
    anchor.before(w);
  }
}
function makeOption(o={}){
  return{
    label:String(o.label||''),
    votes:+o.votes||0,
    logo:String(o.logo||''),
    teamName:String(o.teamName||''),
    teamColor:String(o.teamColor||'#e8002d'),
    logoKey:String(o.logoKey||'')
  };
}
function applyTeam(option,key){
  if(!option)return;
  if(key==='custom'){
    option.logoKey='';
    return;
  }
  const team=teamByKey(key);
  if(!team){
    option.logoKey='';
    option.teamName='';
    option.logo='';
    return;
  }
  option.logoKey=team.key;
  option.teamName=team.name;
  option.logo=team.image;
  option.teamColor=team.color;
}
function readOptions(){
  state.options=[...document.querySelectorAll('#poll-options-admin .pdx-live-poll-option')].map((r,index)=>{
    const previous=state.options[index]||makeOption();
    const selected=r.querySelector('[data-f=team-select]')?.value||'';
    const item={
      ...previous,
      label:r.querySelector('[data-f=label]')?.value.trim()||'',
      votes:+r.dataset.votes||0,
      teamColor:r.querySelector('[data-f=color]')?.value||previous.teamColor||'#e8002d'
    };
    if(selected&&selected!=='custom')applyTeam(item,selected);
    else if(!selected){item.logoKey='';item.teamName='';item.logo='';}
    return item;
  });
  return state.options;
}
function renderOptions(){
  const host=$('poll-options-admin');
  if(!host)return;
  if(state.options.length<2)state.options=[makeOption(),makeOption()];
  const sum=state.options.reduce((n,o)=>n+(+o.votes||0),0);
  host.innerHTML=state.options.map((o,i)=>{
    const matched=teamMatch(o);
    return `<div class="pdx-live-poll-option" data-index="${i}" data-votes="${+o.votes||0}">
      <div class="pdx-poll-option-index">${i+1}</div>
      ${logoTile(o,i,46)}
      <input class="adm-input pdx-poll-choice-input" data-f="label" value="${esc(o.label)}" placeholder="Option ${i+1} / Driver name">
      ${teamSelectHTML(o,i)}
      <input class="pdx-poll-color" data-f="color" type="color" value="${/^#[0-9a-f]{6}$/i.test(optionColor(o,i))?optionColor(o,i):'#e8002d'}" aria-label="Team color">
      <button type="button" class="adm-btn-ghost pdx-poll-remove" onclick="PADDOX_removePollOption(${i})" ${state.options.length<=2?'disabled':''}>×</button>
      <div class="pdx-poll-option-meta">
        <span><b>${+o.votes||0}</b> votes · ${sum?Math.round((+o.votes||0)/sum*100):0}%</span>
        <span>${matched?`Logo: <b>${esc(matched.name)}</b>`:'Choose a team logo from the dropdown'}</span>
      </div>
    </div>`;
  }).join('');

  host.querySelectorAll('[data-f=label]').forEach(input=>input.addEventListener('input',readOptions));
  host.querySelectorAll('[data-f=color]').forEach(input=>input.addEventListener('input',readOptions));
  host.querySelectorAll('[data-f=team-select]').forEach(select=>select.addEventListener('change',()=>{
    const row=select.closest('.pdx-live-poll-option');
    const index=Number(row?.dataset.index||0);
    const current=readOptions()[index]||makeOption();
    applyTeam(current,select.value);
    state.options[index]=current;
    renderOptions();
  }));
}
function renderStats(){
  if($('poll-stat-total'))$('poll-stat-total').textContent=state.polls.length;
  if($('poll-stat-active'))$('poll-stat-active').textContent=state.polls.filter(p=>p.isActive).length;
  if($('poll-stat-votes'))$('poll-stat-votes').textContent=state.polls.reduce((n,p)=>n+totalVotes(p),0).toLocaleString('en-IN');
  if($('poll-stat-options'))$('poll-stat-options').textContent=state.polls.reduce((n,p)=>n+(p.options||[]).length,0);
}
function renderRows(){
  const body=$('fan-polls-tbody');
  if(!body)return;
  const q=($('poll-search-admin')?.value||'').trim().toLowerCase();
  const filter=$('poll-status-filter')?.value||'all';
  const list=state.polls.filter(p=>(filter==='all'||pollStatus(p)===filter)&&(!q||[p.question,...(p.options||[]).flatMap(o=>[o.label,o.teamName])].join(' ').toLowerCase().includes(q)));
  if(!list.length){
    body.innerHTML='<tr><td colspan="5" style="text-align:center;padding:42px;color:#777">No matching polls</td></tr>';
    return;
  }
  body.innerHTML=list.map(p=>{
    const tv=totalVotes(p),st=pollStatus(p);
    const opts=(p.options||[]).map((o,i)=>`<div class="pdx-poll-library-option">
      ${logoTile(o,i,30)}
      <span>${esc(o.label)}${o.teamName?` <small style="color:#666">· ${esc(o.teamName)}</small>`:''}</span>
      <b style="color:#fff">${+o.votes||0} · ${tv?Math.round((+o.votes||0)/tv*100):0}%</b>
    </div>`).join('');
    return `<tr>
      <td><strong style="color:#fff">${esc(p.question)}</strong><small style="display:block;margin-top:6px;color:#666">${p.endsAt?new Date(p.endsAt).toLocaleString('en-IN'):'No end time'}</small></td>
      <td>${opts}</td>
      <td><strong>${tv.toLocaleString('en-IN')}</strong></td>
      <td><span class="sb">${st.toUpperCase()}</span></td>
      <td><div style="display:flex;gap:5px;flex-wrap:wrap">
        <button class="act-btn" onclick="PADDOX_editPoll('${p._id}')">EDIT</button>
        <button class="act-btn" onclick="PADDOX_togglePoll('${p._id}')">${p.isActive?'CLOSE':'SET LIVE'}</button>
        <button class="act-btn" onclick="PADDOX_deletePoll('${p._id}',this)">DELETE</button>
      </div></td>
    </tr>`;
  }).join('');
}
async function load(silent=true){
  if(state.busy)return;
  state.busy=true;
  try{
    const r=await fetch(API,{credentials:'include',cache:'no-store',headers:{Accept:'application/json'}});
    const j=await r.json().catch(()=>({}));
    if(!r.ok||j.success===false)throw Error(j.message||`Poll sync failed (${r.status})`);
    state.polls=extractPolls(j);
    renderStats();
    renderRows();
    if(!silent)toast(`✅ ${state.polls.length} polls synced`);
  }catch(e){toast(`❌ ${e.message}`)}
  finally{state.busy=false}
}
function reset(){
  state.editingId=null;
  state.options=[makeOption(),makeOption()];
  if($('poll-edit-id'))$('poll-edit-id').value='';
  if($('poll-question'))$('poll-question').value='';
  if($('poll-active'))$('poll-active').checked=true;
  if($('poll-reset-votes'))$('poll-reset-votes').checked=false;
  if($('poll-ends-at'))$('poll-ends-at').value='';
  if($('poll-admin-status'))$('poll-admin-status').textContent='Create a live Fan Hub poll with 2–5 options. Pick each team logo from the dropdown.';
  renderOptions();
}
function edit(id){
  const p=state.polls.find(x=>String(x._id)===String(id));
  if(!p)return;
  state.editingId=String(id);
  state.options=(p.options||[]).map(makeOption);
  if($('poll-edit-id'))$('poll-edit-id').value=id;
  $('poll-question').value=p.question||'';
  $('poll-active').checked=!!p.isActive;
  $('poll-reset-votes').checked=false;
  if($('poll-ends-at'))$('poll-ends-at').value=localDate(p.endsAt);
  $('poll-admin-status').textContent=`Editing poll · ${totalVotes(p)} votes preserved`;
  renderOptions();
  document.querySelector('#adm-fanpolls .fan-poll-editor')?.scrollIntoView({behavior:'smooth',block:'start'});
}
function add(){
  readOptions();
  if(state.options.length>=5)return toast('⚠️ Maximum 5 options');
  state.options.push(makeOption());
  renderOptions();
}
function remove(i){
  readOptions();
  if(state.options.length<=2)return toast('⚠️ Minimum 2 options');
  state.options.splice(i,1);
  renderOptions();
}
async function save(){
  const question=($('poll-question')?.value||'').trim();
  const options=readOptions().filter(o=>o.label).slice(0,5);
  if(!question)return toast('❌ Poll question required');
  if(options.length<2)return toast('❌ Add at least 2 options');
  const payload={
    question,
    options,
    isActive:!!$('poll-active')?.checked,
    resetVotes:!!$('poll-reset-votes')?.checked,
    endsAt:$('poll-ends-at')?.value?new Date($('poll-ends-at').value).toISOString():null
  };
  try{
    const url=state.editingId?`${API}/${encodeURIComponent(state.editingId)}`:API;
    const r=await fetch(url,{method:state.editingId?'PUT':'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const j=await r.json().catch(()=>({}));
    if(!r.ok||j.success===false)throw Error(j.message||'Poll save failed');
    toast(state.editingId?'✅ Poll updated':'🔥 Poll published');
    reset();
    await load();
  }catch(e){toast(`❌ ${e.message}`)}
}
async function toggle(id){
  const p=state.polls.find(x=>String(x._id)===String(id));
  if(!p)return;
  try{
    const r=await fetch(`${API}/${encodeURIComponent(id)}/active`,{method:'PATCH',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({isActive:!p.isActive})});
    const j=await r.json().catch(()=>({}));
    if(!r.ok||j.success===false)throw Error(j.message||'Poll update failed');
    toast(p.isActive?'⏸ Poll closed':'🟢 Poll is live');
    await load();
  }catch(e){toast(`❌ ${e.message}`)}
}
async function del(id,btn){
  if(!btn.dataset.armed){
    btn.dataset.armed='1';
    btn.textContent='CONFIRM';
    setTimeout(()=>{if(btn.isConnected){delete btn.dataset.armed;btn.textContent='DELETE'}},4000);
    return;
  }
  try{
    const r=await fetch(`${API}/${encodeURIComponent(id)}`,{method:'DELETE',credentials:'include'});
    const j=await r.json().catch(()=>({}));
    if(!r.ok||j.success===false)throw Error(j.message||'Delete failed');
    toast('🗑️ Poll deleted');
    if(state.editingId===id)reset();
    await load();
  }catch(e){toast(`❌ ${e.message}`)}
}
function bind(){
  if(bound)return;
  bound=true;
  $('poll-search-admin')?.addEventListener('input',renderRows);
  $('poll-status-filter')?.addEventListener('change',renderRows);
  $('poll-refresh-btn')?.addEventListener('click',()=>load(false));
  document.querySelectorAll('.adm-nav-item[data-page="fanpolls"]').forEach(x=>x.addEventListener('click',()=>setTimeout(load,0)));
  window.addEventListener('hashchange',()=>location.hash==='#fanpolls'&&load());
}
function boot(){
  ensureEnhancements();
  bind();
  reset();
  window.loadFanPolls=load;
  window.resetFanPollForm=reset;
  window.addFanPollOption=add;
  window.saveFanPollAdmin=save;
  window.PADDOX_removePollOption=remove;
  window.PADDOX_editPoll=edit;
  window.PADDOX_togglePoll=toggle;
  window.PADDOX_deletePoll=del;
  window.PADDOX_refreshFanPolls=()=>load(false);
  window.PADDOX_ADMIN_POLLS_STATE=state;
  load();
  clearInterval(timer);
  timer=setInterval(()=>document.getElementById('adm-fanpolls')?.classList.contains('on')&&document.visibilityState!=='hidden'&&load(),REFRESH);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
})();