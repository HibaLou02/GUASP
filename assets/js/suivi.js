const ROADMAP_STEPS = [
  { name: 'Création dossier', dur: '1–2 jours', items: ['Informations importateur', 'Informations véhicule'] },
  { name: 'Documents', dur: '1–2 jours', items: ['Upload des fichiers', 'Vérification de complétude'] },
  { name: 'Facturation & Paiement', dur: '1 jour', items: ['Génération facture', 'Paiement (CMI / API / manuel)'] },
  { name: 'Vérification', dur: '2–3 jours', items: ['Validation par admin', 'Gestion des blocages et rejets'] },
  { name: 'Transfert vers parc', dur: '1 jour', items: ['Envoi vers parc', 'Constat sommaire'] },
  { name: 'Inspection', dur: '1–2 jours', items: ['Inspection technique (RTI)', 'Upload des photos'] },
  { name: 'Immatriculation', dur: '2–4 jours', items: ['Transmission BVA', "Attribution du numéro d'immatriculation", 'Génération de la carte grise'] },
  { name: 'Sortie véhicule', dur: '1 jour', items: ['Autorisation de sortie', 'Clôture du dossier'] },
];

function qs() {
  return new URLSearchParams(window.location.search);
}
function el(id) {
  return document.getElementById(id);
}

function fmtDate(d) {
  try {
    return new Date(d).toLocaleString('fr-FR', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  } catch {
    return String(d || '');
  }
}

function getJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function setJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

function currentStep(ref) {
  const n = parseInt(localStorage.getItem(`step:${ref}`) || '0', 10);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(ROADMAP_STEPS.length - 1, n));
}

function renderHeader(ref) {
  el('s-title').textContent = `Dossier ${ref}`;
  el('s-sub').textContent = `Dernière mise à jour: ${new Date().toLocaleDateString('fr-FR')}`;
  el('btn-back').href = `./dossier.html?ref=${encodeURIComponent(ref)}`;
}

function renderTimeline(ref) {
  const idx = currentStep(ref);
  const pct = Math.round((idx / ROADMAP_STEPS.length) * 100);
  el('s-pct').textContent = `${pct}%`;

  const paid = getJSON(`pay:${ref}`, null);
  const ck = getJSON(`ck:${ref}`, {});

  el('s-timeline').innerHTML = ROADMAP_STEPS.map((s, i) => {
    const cls = i < idx ? 'done' : i === idx ? 'now' : 'todo';
    const payNote = i === 2 && paid?.status === 'paid' ? `Paiement: ${paid.payref} • ${paid.amount} MAD` : '';
    const items = (s.items || []).map((it, j) => {
      const key = `${i}:${j}`;
      const ok = ck?.[key] ? '✓ ' : '';
      return `<li>${ok}${it}</li>`;
    }).join('');

    return `
      <div class="tl ${cls}">
        <div class="tl-left">
          <div class="dot">${i + 1}</div>
          <div>
            <div class="tl-name">${s.name}</div>
            <div class="tl-meta">Durée: ${s.dur}${payNote ? ` • ${payNote}` : ''}</div>
            <ul>${items}</ul>
          </div>
        </div>
        <div class="tag">${i < idx ? 'Terminé' : i === idx ? 'En cours' : 'À faire'}</div>
      </div>
    `;
  }).join('');
}

function renderDocs(ref) {
  const docs = getJSON(`docs:${ref}`, []);
  const host = el('doc-list');
  if (!docs.length) {
    host.innerHTML = `<div class="doc"><div><div class="doc-name">Aucun document</div><div class="doc-sub">Ajoutez des fichiers ci-dessus.</div></div></div>`;
    return;
  }
  host.innerHTML = docs.map((d, i) => `
    <div class="doc">
      <div>
        <div class="doc-name">${d.name}</div>
        <div class="doc-sub">${d.type || '—'} • ${d.size || '—'} • ${fmtDate(d.at)}</div>
      </div>
      <button class="btn-ghost" type="button" data-del="${i}">Supprimer</button>
    </div>
  `).join('');

  host.querySelectorAll('[data-del]').forEach((b) => {
    b.addEventListener('click', () => {
      const idx = parseInt(b.getAttribute('data-del') || '-1', 10);
      const next = docs.slice();
      if (idx >= 0) next.splice(idx, 1);
      setJSON(`docs:${ref}`, next);
      pushHist(ref, `Document supprimé`);
      renderDocs(ref);
      renderHistory(ref);
    });
  });
}

function pushHist(ref, text) {
  const hist = getJSON(`hist:${ref}`, []);
  hist.unshift({ at: new Date().toISOString(), text });
  setJSON(`hist:${ref}`, hist);
}

function seedHistory(ref) {
  const hist = getJSON(`hist:${ref}`, null);
  if (hist && Array.isArray(hist) && hist.length) return;

  const paid = getJSON(`pay:${ref}`, null);
  const base = [
    { at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), text: 'Dossier créé' },
    { at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), text: 'Documents ajoutés (mock)' },
  ];
  if (paid?.status === 'paid') base.unshift({ at: paid.at, text: `Paiement effectué (${paid.payref})` });
  setJSON(`hist:${ref}`, base);
}

function renderHistory(ref) {
  const hist = getJSON(`hist:${ref}`, []);
  const host = el('hist');
  if (!hist.length) {
    host.innerHTML = `<div class="hrow"><div class="hwhen">—</div><div class="htext">Aucune action enregistrée.</div></div>`;
    return;
  }
  host.innerHTML = hist.map((h) => `
    <div class="hrow">
      <div class="hwhen">${fmtDate(h.at)}</div>
      <div class="htext">${h.text}</div>
    </div>
  `).join('');
}

function init() {
  const ref = qs().get('ref') || 'NOUVEAU';
  renderHeader(ref);
  seedHistory(ref);
  renderTimeline(ref);
  renderDocs(ref);
  renderHistory(ref);

  el('doc-add').addEventListener('click', () => {
    const input = el('doc-file');
    const files = Array.from(input.files || []);
    if (!files.length) return;
    const docs = getJSON(`docs:${ref}`, []);
    files.forEach((f) => {
      docs.unshift({
        name: f.name,
        type: f.type || 'fichier',
        size: `${Math.max(1, Math.round(f.size / 1024))} Ko`,
        at: new Date().toISOString(),
      });
    });
    setJSON(`docs:${ref}`, docs);
    pushHist(ref, `${files.length} document(s) ajouté(s)`);
    input.value = '';
    renderDocs(ref);
    renderHistory(ref);
  });

  el('hist-add').addEventListener('click', () => {
    const t = String(el('hist-text').value || '').trim();
    if (!t) return;
    pushHist(ref, t);
    el('hist-text').value = '';
    renderHistory(ref);
  });

  el('hist-clear').addEventListener('click', () => {
    setJSON(`hist:${ref}`, []);
    renderHistory(ref);
  });
}

document.addEventListener('DOMContentLoaded', init);

