const ROADMAP_STEPS = [
  { name: "Réception dossier & identification véhicule", dur: "Manuel", items: ["Dossier réceptionné", "Véhicule identifié"] },
  { name: "Enregistrement fiche SYDAM AUTO", dur: "Manuel", items: ["Fiche SYDAM AUTO enregistrée"] },
  { name: "Génération facture SGUASP", dur: "Auto", items: ["Facture générée"] },
  { name: "Paiement & émission reçu", dur: "Auto", items: ["Paiement confirmé", "Reçu émis"] },
  { name: "Vérification code importateur (SACO)", dur: "Manuel", items: ["Résultat SACO saisi"] },
  { name: "Vérification manifeste navire", dur: "Manuel", items: ["Manifeste vérifié"] },
  { name: "Visite douanière", dur: "Manuel", items: ["Visite douanière réalisée"] },
  { name: "Inspection RTI (Ministère Transports)", dur: "Manuel", items: ["Note RTI saisie"] },
  { name: "Photos CIVIO", dur: "Manuel / semi-auto", items: ["Photos prises et associées"] },
  { name: "BAD (Bon À Délivrer)", dur: "Manuel", items: ["BAD reçu et saisi"] },
  { name: "Débarquement / Retrait du navire", dur: "Manuel", items: ["Débarquement confirmé"] },
  { name: "Désignation emplacement stationnement", dur: "Manuel", items: ["Emplacement désigné"] },
  { name: "Visite technique", dur: "Manuel / semi-auto", items: ["Visite technique effectuée"] },
  { name: "Génération bon de sortie", dur: "Auto", items: ["Bon de sortie généré", "Dossier clôturé"] },
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
  // Progression réelle: basée sur les étapes validées (done:<ref>)
  const done = getJSON(`done:${ref}`, {});
  const doneCount = ROADMAP_STEPS.reduce((acc, _s, i) => acc + (done?.[String(i + 1)] ? 1 : 0), 0);
  return Math.max(0, Math.min(ROADMAP_STEPS.length, doneCount));
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
  const done = getJSON(`done:${ref}`, {});

  el('s-timeline').innerHTML = ROADMAP_STEPS.map((s, i) => {
    const isDone = Boolean(done?.[String(i + 1)]);
    const cls = isDone ? 'done' : i === idx ? 'now' : 'todo';
    const payNote = i === 3 && paid?.status === 'paid' ? `Paiement: ${paid.payref} • ${paid.amount} MAD` : '';
    return `
      <div class="tl ${cls}">
        <div class="tl-left">
          <div class="dot">${i + 1}</div>
          <div>
            <div class="tl-name">${s.name}</div>
            <div class="tl-meta">Durée: ${s.dur}${payNote ? ` • ${payNote}` : ''}</div>
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

