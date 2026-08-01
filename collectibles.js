/* ============================================================
   FILE: collectibles.js — PADDOX Digital Collectibles
   Phase 7 Step 8c
   ============================================================ */
'use strict';

/* ── State ── */
const state = {
  user         : null,
  collection   : [],
  catalogue    : [],
  activeTab    : 'collection',
  filter       : 'all',
  sort         : 'newest',
  activeItemId : null,
};

/* ── DOM refs ── */
const $ = id => document.getElementById(id);

// Panels
const panelCollection  = $('panel-collection');
const panelCatalogue   = $('panel-catalogue');
const tabs             = document.querySelectorAll('.tab');

// Collection
const authGate         = $('auth-gate');
const collectionLoading= $('collection-loading');
const collectionEmpty  = $('collection-empty');
const collectionGrid   = $('collection-grid');

// Catalogue
const catalogueLoading = $('catalogue-loading');
const catalogueEmpty   = $('catalogue-empty');
const catalogueGrid    = $('catalogue-grid');

// Stats
const statOwned        = $('stat-owned').querySelector('.stat-card__number');
const statRare         = $('stat-rare').querySelector('.stat-card__number');
const statShared       = $('stat-shared').querySelector('.stat-card__number');

// Filter/Sort
const filterBtns       = document.querySelectorAll('.filter-btn');
const sortSelect       = $('sort-select');

// Modal
const modal            = $('collectible-modal');
const modalBackdrop    = $('modal-backdrop');
const modalClose       = $('modal-close');
const modalImg         = $('modal-img');
const modalRarityBadge = $('modal-rarity-badge');
const modalTitle       = $('modal-title');
const modalDesc        = $('modal-desc');
const modalEdition     = $('modal-edition');
const modalIssuedAt    = $('modal-issued-at');
const modalCertId      = $('modal-cert-id');
const modalStatus      = $('modal-status');
const modalFingerprint = $('modal-fingerprint');
const modalFingerprintVersion = $('modal-fingerprint-version');
const modalVerifyLink  = $('modal-verify-link');
const modalVerifyBtn   = $('modal-verify-btn');
const sharingToggle    = $('sharing-toggle');
const sharingLinkWrap  = $('sharing-link-wrap');
const sharingLinkInput = $('sharing-link-input');
const copyLinkBtn      = $('copy-link-btn');
const sharingCopied    = $('sharing-copied');

// Toast
const toast            = $('toast');
let toastTimer         = null;

/* ── Utilities ── */
function showToast(msg, type = 'info') {
  clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.className = `toast toast--${type}`;
  toast.hidden = false;
  toastTimer = setTimeout(() => { toast.hidden = true; }, 4000);
}

function formatDate(iso) {
  if (!iso) return '–';
  return new Date(iso).toLocaleDateString(undefined, { year:'numeric', month:'short', day:'numeric' });
}

function rarityOrder(r) {
  const map = { legendary:0, epic:1, rare:2, uncommon:3, common:4 };
  return map[r] ?? 5;
}

function getPublicUrl(publicCertificateId) {
  return `${window.location.origin}/collectibles.html?verify=${encodeURIComponent(publicCertificateId)}`;
}

/* ── Tab switching ── */
function switchTab(tabName) {
  state.activeTab = tabName;
  tabs.forEach(t => {
    const active = t.dataset.tab === tabName;
    t.setAttribute('aria-selected', active);
    t.classList.toggle('tab--active', active);
  });
  panelCollection.hidden = tabName !== 'collection';
  panelCatalogue.hidden  = tabName !== 'catalogue';

  if (tabName === 'catalogue' && state.catalogue.length === 0) loadCatalogue();
}

tabs.forEach(t => {
  t.addEventListener('click', () => switchTab(t.dataset.tab));
  t.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); switchTab(t.dataset.tab); }
  });
});

/* ── Filter / Sort ── */
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    state.filter = btn.dataset.filter;
    filterBtns.forEach(b => b.classList.remove('filter-btn--active'));
    btn.classList.add('filter-btn--active');
    renderCollection();
  });
});

sortSelect.addEventListener('change', () => {
  state.sort = sortSelect.value;
  renderCollection();
});

/* ── Auth check ── */
async function checkAuth() {
  if (!window.PaddoxAPI) return null;
  try {
    const res = await PaddoxAPI.auth.getMe();
    return res.success ? res.data : null;
  } catch { return null; }
}

/* ── Load data ── */
async function loadCollection() {
  collectionLoading.hidden = false;
  collectionEmpty.hidden   = true;
  collectionGrid.hidden    = true;
  authGate.hidden          = true;

  const user = await checkAuth();
  state.user = user;

  collectionLoading.hidden = true;

  if (!user) {
    authGate.hidden = false;
    return;
  }

  try {
    const res = await PaddoxAPI.collectible.getMyCollection();
    state.collection = res.success ? (res.data || []) : [];
  } catch {
    state.collection = [];
    showToast('Could not load collection', 'error');
  }

  updateStats();
  renderCollection();
}

async function loadCatalogue() {
  catalogueLoading.hidden = false;
  catalogueEmpty.hidden   = true;
  catalogueGrid.hidden    = true;

  try {
    const res = await PaddoxAPI.collectible.getCatalogue();
    state.catalogue = res.success ? (res.data || []) : [];
  } catch {
    state.catalogue = [];
  }

  catalogueLoading.hidden = true;

  if (state.catalogue.length === 0) {
    catalogueEmpty.hidden = false;
    return;
  }

  catalogueGrid.hidden = false;
  renderCatalogue();
}

/* ── Stats ── */
function updateStats() {
  const owned  = state.collection.length;
  const rareUp = state.collection.filter(c => {
    const r = c.collectibleDefinitionId?.rarity || '';
    return ['legendary','epic','rare'].includes(r);
  }).length;
  const shared = state.collection.filter(c => c.shareEnabled).length;

  statOwned.textContent = owned;
  statRare.textContent  = rareUp;
  statShared.textContent= shared;
}

/* ── Render collection ── */
function applyFilterSort(items) {
  let list = [...items];
  if (state.filter !== 'all') {
    list = list.filter(i => (i.collectibleDefinitionId?.rarity || '') === state.filter);
  }
  if (state.sort === 'newest') {
    list.sort((a,b) => new Date(b.issuedAt) - new Date(a.issuedAt));
  } else if (state.sort === 'rarity') {
    list.sort((a,b) => rarityOrder(a.collectibleDefinitionId?.rarity) - rarityOrder(b.collectibleDefinitionId?.rarity));
  } else if (state.sort === 'name') {
    list.sort((a,b) => (a.collectibleDefinitionId?.name||'').localeCompare(b.collectibleDefinitionId?.name||''));
  }
  return list;
}

function renderCollection() {
  const items = applyFilterSort(state.collection);
  collectionGrid.innerHTML = '';

  if (items.length === 0) {
    collectionGrid.hidden = true;
    collectionEmpty.hidden = false;
    return;
  }

  collectionEmpty.hidden = true;
  collectionGrid.hidden  = false;

  items.forEach(item => {
    const def    = item.collectibleDefinitionId || {};
    const rarity = def.rarity || 'common';
    const li = document.createElement('li');
    li.className = `collectible-card collectible-card--${rarity}`;
    li.setAttribute('role', 'button');
    li.setAttribute('tabindex', '0');
    li.setAttribute('aria-label', `${def.name || 'Collectible'}, ${rarity}`);
    li.dataset.id = item._id;

    li.innerHTML = `
      <div class="collectible-card__artwork-wrap">
        <img class="collectible-card__artwork" src="${def.imageUrl || '/assets/paddox-logo.png'}"
          alt="${def.name || 'Collectible artwork'}" width="300" height="300" loading="lazy" />
        <span class="collectible-card__owned-badge" aria-hidden="true">✓ Owned</span>
        <span class="collectible-card__rarity">
          <span class="rarity-badge rarity-badge--${rarity}" aria-label="Rarity: ${rarity}">${rarity}</span>
        </span>
        ${item.shareEnabled ? '<span class="collectible-card__share-icon" aria-label="Shared publicly">🔗</span>' : ''}
      </div>
      <div class="collectible-card__body">
        <p class="collectible-card__name">${escHtml(def.name || 'Collectible')}</p>
        ${item.editionNumber ? `<p class="collectible-card__edition">Edition #${item.editionNumber}</p>` : ''}
        <p class="collectible-card__issued">${formatDate(item.issuedAt)}</p>
      </div>`;

    li.addEventListener('click', () => openModal(item));
    li.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(item); } });
    collectionGrid.appendChild(li);
  });
}

function renderCatalogue() {
  catalogueGrid.innerHTML = '';
  const ownedIds = new Set(state.collection.map(c => c.collectibleDefinitionId?._id || c.collectibleDefinitionId));

  state.catalogue.forEach(def => {
    const rarity = def.rarity || 'common';
    const isOwned = ownedIds.has(String(def._id));
    const li = document.createElement('li');
    li.className = `collectible-card collectible-card--catalogue collectible-card--${rarity}`;
    li.setAttribute('aria-label', `${def.name || 'Collectible'}, ${rarity}${isOwned ? ', owned' : ''}`);

    li.innerHTML = `
      <div class="collectible-card__artwork-wrap">
        <img class="collectible-card__artwork" src="${def.imageUrl || '/assets/paddox-logo.png'}"
          alt="${def.name || 'Collectible artwork'}" width="300" height="300" loading="lazy" />
        ${isOwned ? '<span class="collectible-card__owned-badge" aria-hidden="true">✓ Owned</span>' : ''}
        <span class="collectible-card__rarity">
          <span class="rarity-badge rarity-badge--${rarity}" aria-label="Rarity: ${rarity}">${rarity}</span>
        </span>
      </div>
      <div class="collectible-card__body">
        <p class="collectible-card__name">${escHtml(def.name || 'Collectible')}</p>
        <p class="collectible-card__edition">${escHtml(def.category || '')}</p>
        <p class="collectible-card__issued">${escHtml(def.eligibilityRule || 'Manual')}</p>
      </div>`;
    catalogueGrid.appendChild(li);
  });
}

/* ── Modal ── */
function openModal(item) {
  const def    = item.collectibleDefinitionId || {};
  const rarity = def.rarity || 'common';
  state.activeItemId = item._id;

  modalImg.src = def.imageUrl || '/assets/paddox-logo.png';
  modalImg.alt = def.name || 'Collectible';
  modalRarityBadge.textContent = rarity;
  modalRarityBadge.className = `rarity-badge rarity-badge--${rarity}`;
  modalTitle.textContent = def.name || 'Collectible';
  modalDesc.textContent  = def.description || '';
  modalEdition.textContent = item.editionNumber ? `#${item.editionNumber}` : 'Open Edition';
  modalIssuedAt.textContent = formatDate(item.issuedAt);
  modalCertId.textContent   = item.publicCertificateId || '–';
  modalStatus.textContent   = item.status === 'revoked' ? '⛔ Revoked' : '✅ Valid';
  modalFingerprint.textContent = item.certificateFingerprint || '–';
  modalFingerprintVersion.textContent = item.fingerprintVersion || 'HMAC-SHA256-v1';

  const verifyUrl = item.publicCertificateId
    ? `/collectibles.html?verify=${encodeURIComponent(item.publicCertificateId)}`
    : '#';
  modalVerifyLink.href = verifyUrl;
  modalVerifyBtn.href  = verifyUrl;

  sharingToggle.checked = !!item.shareEnabled;
  updateSharingUI(item.shareEnabled, item.publicCertificateId);

  modal.hidden = false;
  document.body.style.overflow = 'hidden';

  // Focus management
  requestAnimationFrame(() => modalClose.focus());

  // Trap focus
  modal.addEventListener('keydown', trapFocus);
}

function closeModal() {
  modal.hidden = true;
  document.body.style.overflow = '';
  modal.removeEventListener('keydown', trapFocus);
  state.activeItemId = null;
}

function trapFocus(e) {
  if (e.key !== 'Tab') return;
  const focusable = [...modal.querySelectorAll('a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])')].filter(el => !el.hidden);
  const first = focusable[0];
  const last  = focusable[focusable.length - 1];
  if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
    e.preventDefault();
    (e.shiftKey ? last : first).focus();
  }
}

function updateSharingUI(enabled, publicCertificateId) {
  sharingLinkWrap.hidden = !enabled;
  if (enabled && publicCertificateId) {
    sharingLinkInput.value = getPublicUrl(publicCertificateId);
  }
}

modalClose.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', closeModal);
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });

sharingToggle.addEventListener('change', async () => {
  if (!state.activeItemId) return;
  const shareEnabled = sharingToggle.checked;
  try {
    const res = await PaddoxAPI.collectible.toggleSharing(state.activeItemId, shareEnabled);
    if (res.success) {
      // Update local state
      const item = state.collection.find(c => c._id === state.activeItemId);
      if (item) { item.shareEnabled = shareEnabled; }
      updateSharingUI(shareEnabled, res.data?.publicCertificateId);
      updateStats();
      showToast(shareEnabled ? '🔗 Certificate sharing enabled' : '🔒 Certificate sharing disabled', 'success');
    } else {
      sharingToggle.checked = !shareEnabled; // revert
      showToast('Failed to update sharing setting', 'error');
    }
  } catch {
    sharingToggle.checked = !shareEnabled;
    showToast('Failed to update sharing setting', 'error');
  }
});

copyLinkBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(sharingLinkInput.value);
    sharingCopied.hidden = false;
    setTimeout(() => { sharingCopied.hidden = true; }, 2500);
  } catch {
    sharingLinkInput.select();
    document.execCommand('copy');
    sharingCopied.hidden = false;
    setTimeout(() => { sharingCopied.hidden = true; }, 2500);
  }
});

/* ── URL verify flow ── */
function checkVerifyParam() {
  const params = new URLSearchParams(window.location.search);
  const certId = params.get('verify');
  if (!certId) return;
  // Show catalogue and attempt verification
  switchTab('catalogue');
  showToast(`🔍 Verifying certificate ${certId.slice(0,8)}…`);
}

/* ── Security helper ── */
function escHtml(str) {
  return String(str || '').replace(/[&<>"']/g, c =>
    ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])
  );
}

/* ── Init ── */
async function init() {
  checkVerifyParam();
  await loadCollection();
}

document.addEventListener('DOMContentLoaded', init);
