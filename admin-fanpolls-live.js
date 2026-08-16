/* PADDOX ADMIN — Live Fan Polls Controller */
(function(){
'use strict';

const API='/api/fan/admin/polls';
const LOGO_API='/api/fan/home-marquee-logos';
const REFRESH=30000;
const state={polls:[],editingId:null,options:[],logos:[],busy:false};
let timer=null,bound=false;

const $=id=>document.getElementById(id);
const toast=m=>typeof window.showToast==='function'?window.showToast(m):console.log(m);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const totalVotes=p=>Number.isFinite(+p?.totalVotes)?+p.totalVotes:(p?.options||[]).reduce((n,o)=>n+(+o.votes||0),0);
const pollStatus=p=>p?.endsAt&&new Date(p.endsAt).getTime()<Date.now()?'ended':p?.isActive?'live':'closed';
const localDate=v=>{if(!v)return'';const d=new Date(v);if(Number.isNaN(d.getTime()))return'';return new Date(d-d.getTimezoneOffset()*60000).toISOString().slice(0,16)};
const extractPolls=x=>Array.isArray(x?.data?.polls)?x.data.polls:Array.isArray(x?.polls)?x.polls:Array.isArray(x?.data)?x.data:[];
const extractLogos=x=>Array.isArray(x?.data?.logos)?x.data.logos:Array.isArray(x?.logos)?x.logos:[];

function normalize(value=''){
  return String(value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
}
function logoMatch(option={}){
  const wanted=[option.logoKey,option.teamName,option.label].map(normalize).filter(Boolean);
  if(!wanted.length||!state.logos.length)return null;
  let best=null;
  for(const logo of state.logos){
    if(logo?.isActive===false)continue;
    const keys=[logo.name,logo.slug].map(normalize).filter(Boolean);
    const hit=wanted.some(w=>keys.some(k=>w===k||w.includes(k)||k.includes(w)));
    if(hit){best=logo;break;}
  }
  return best;
}
function optionLogo(option={}){
  const local=logoMatch(option);
  if(local?.image)return local.image;
  const raw=String(option.logo||'').trim();
  return /^(https?:\/\/|data:image\/)/i.test(raw)?raw:'';
}
function optionColor(option={},index=0){
  return logoMatch(option)?.color||option.teamColor||['#00d2be','#e8002d','#ff8700','#1e5bff','#006f62'][index%5];
}
function logoTile(option={},index=0,size=42){
  const src=optionLogo(option);
  const color=esc(optionColor(option,index));
  const label=String(option.teamName||option.label||`Option ${index+1}`).trim();
  const initial=esc((label[0]||String(index+1)).toUpperCase());
  return `<span class="pdx-poll-logo-tile" data-logo-preview="${index}" style="position:relative;width:${size}px;height:${size}px;border-radius:10px;border:1px solid ${color}66;background:${color}12;display:grid;place-items:center;overflow:hidden;flex:0 0 auto">
    <span style="font:800 14px Inter,sans-serif;color:${color};opacity:.9">${initial}</span>
    ${src?`<img src="${esc(src)}" alt="${esc(label)} logo" style="position:absolute;inset:5px;width:calc(100% - 10px);height:calc(100% - 10px);object-fit:contain" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.display='none'">`:''}
  </span>`;
}

async function loadLogoLibrary(){
  try{
    const r=await fetch(LOGO_API,{credentials:'include',cache:'no-store',headers:{Accept:'application/json'}});
    const j=await r.json().catch(()=>({}));
    if(r.ok&&j.success!==false)state.logos=extractLogos(j);
  }catch{}
}

function ensureEnhancements(){
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

function readOptions(){
  state.options=[...document.querySelectorAll('#poll-options-admin .pdx-live-poll-option')].map(r=>({
    label:r.querySelector('[data-f=label]')?.value.trim()||'',
    votes:+r.dataset.votes||0,
    logo:r.querySelector('[data-f=logo]')?.value.trim()||'',
    teamName:r.querySelector('[data-f=team]')?.value.trim()||'',
    teamColor:r.querySelector('[data-f=color]')?.value||'#e8002d',
    logoKey:r.dataset.key||''
  }));
  return state.options;
}

function refreshPreview(index){
  const row=document.querySelector(`#poll-options-admin .pdx-live-poll-option[data-index="${index}"]`);
  if(!row)return;
  const old=row.querySelector('.pdx-poll-logo-tile');
  if(!old)return;
  const wrap=document.createElement('div');
  wrap.innerHTML=logoTile(state.options[index]||{},index,42);
  old.replaceWith(wrap.firstElementChild);
}

function renderOptions(){
  const host=$('poll-options-admin');
  if(!host)return;
  if(state.options.length<2)state.options=[makeOption(),makeOption()];
  const sum=state.options.reduce((n,o)=>n+(+o.votes||0),0);
  host.innerHTML=state.options.map((o,i)=>`
    <div class="pdx-live-poll-option" data-index="${i}" data-votes="${+o.votes||0}" data-key="${esc(o.logoKey)}"
      style="display:grid;grid-template-columns:34px 46px minmax(130px,1fr) 42px 36px;gap:8px;align-items:center;margin:8px 0;padding:10px;border:1px solid rgba(255,255,255,.08);background:#0b0d11">
      <b style="display:grid;place-items:center;color:#e8002d">${i+1}</b>
      ${logoTile(o,i,42)}
      <input class="adm-input" data-f="label" value="${esc(o.label)}" placeholder="Option ${i+1}">
      <input data-f="color" type="color" value="${/^#[0-9a-f]{6}$/i.test(o.teamColor)?o.teamColor:'#e8002d'}">
      <button type="button" class="adm-btn-ghost" onclick="PADDOX_removePollOption(${i})" ${state.options.length<=2?'disabled':''}>×</button>
      <div style="grid-column:3/-1;display:grid;grid-template-columns:1fr 1.4fr;gap:8px">
        <input class="adm-input" data-f="team" value="${esc(o.teamName)}" placeholder="Team name (e.g. Mercedes)">
        <input class="adm-input" data-f="logo" value="${esc(o.logo)}" placeholder="Logo URL (optional — PADDOX team logo auto-matches)">
      </div>
      <small style="grid-column:3/-1;color:#777">${+o.votes||0} votes · ${sum?Math.round((+o.votes||0)/sum*100):0}% · ${logoMatch(o)?'PADDOX logo matched':'custom/fallback logo'}</small>
    </div>`).join('');

  host.querySelectorAll('input').forEach(input=>input.addEventListener('input',()=>{
    const row=input.closest('.pdx-live-poll-option');
    const index=Number(row?.dataset.index||0);
    readOptions();
    refreshPreview(index);
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
    const tv=totalVotes(p);
    const st=pollStatus(p);
    const opts=(p.options||[]).map((o,i)=>`
      <div style="display:grid;grid-template-columns:32px 1fr auto;gap:8px;align-items:center;margin:8px 0;color:#aaa">
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
    if(!state.logos.length)await loadLogoLibrary();
    const r=await fetch(API,{credentials:'include',cache:'no-store',headers:{Accept:'application/json'}});
    const j=await r.json().catch(()=>({}));
    if(!r.ok||j.success===false)throw Error(j.message||`Poll sync failed (${r.status})`);
    state.polls=extractPolls(j);
    renderStats();
    renderRows();
    if(state.editingId)renderOptions();
    if(!silent)toast(`✅ ${state.polls.length} polls synced`);
  }catch(e){
    toast(`❌ ${e.message}`);
  }finally{
    state.busy=false;
  }
}

function reset(){
  state.editingId=null;
  state.options=[makeOption(),makeOption()];
  if($('poll-edit-id'))$('poll-edit-id').value='';
  if($('poll-question'))$('poll-question').value='';
  if($('poll-active'))$('poll-active').checked=true;
  if($('poll-reset-votes'))$('poll-reset-votes').checked=false;
  if($('poll-ends-at'))$('poll-ends-at').value='';
  if($('poll-admin-status'))$('poll-admin-status').textContent='Create a live Fan Hub poll with 2–5 options. Team logos auto-match from PADDOX branding.';
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
  $('poll-admin-status').textContent=`Editing poll · ${totalVotes(p)} votes preserved · PADDOX team logos auto-resolved`;
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
    const r=await fetch(url,{
      method:state.editingId?'PUT':'POST',
      credentials:'include',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(payload)
    });
    const j=await r.json().catch(()=>({}));
    if(!r.ok||j.success===false)throw Error(j.message||'Poll save failed');
    toast(state.editingId?'✅ Poll updated':'🔥 Poll published');
    reset();
    await load();
  }catch(e){
    toast(`❌ ${e.message}`);
  }
}

async function toggle(id){
  const p=state.polls.find(x=>String(x._id)===String(id));
  if(!p)return;
  try{
    const r=await fetch(`${API}/${encodeURIComponent(id)}/active`,{
      method:'PATCH',
      credentials:'include',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({isActive:!p.isActive})
    });
    const j=await r.json().catch(()=>({}));
    if(!r.ok||j.success===false)throw Error(j.message||'Poll update failed');
    toast(p.isActive?'⏸ Poll closed':'🟢 Poll is live');
    await load();
  }catch(e){
    toast(`❌ ${e.message}`);
  }
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
  }catch(e){
    toast(`❌ ${e.message}`);
  }
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

async function boot(){
  ensureEnhancements();
  bind();
  await loadLogoLibrary();
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
  await load();
  clearInterval(timer);
  timer=setInterval(()=>document.getElementById('adm-fanpolls')?.classList.contains('on')&&document.visibilityState!=='hidden'&&load(),REFRESH);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
})();
