/* ══════════════════════════════
   Wizard: Dossier véhicule (1 page)
══════════════════════════════ */

const WORKFLOW_STEPS = [
  {
    id: 1,
    name: "Réception dossier & identification véhicule",
    dur: "Manuel",
    actor: "Transitaire + Importateur",
    entry: "Agent SGUASP (ou Transitaire pour BL)",
    trigger: "Manuel — dépôt physique du dossier à l'accueil",
    kind: "manual",
    items: ["Dossier réceptionné", "Véhicule identifié"],
  },
  {
    id: 2,
    name: "Enregistrement fiche SYDAM AUTO",
    dur: "Manuel",
    actor: "Agent SYDAM AUTO",
    entry: "Agent SGUASP (saisie manuelle)",
    trigger: "Manuel — transfert papier (intégration électronique prévue)",
    kind: "manual",
    items: ["Fiche SYDAM AUTO enregistrée"],
    deps: [1],
  },
  {
    id: 3,
    name: "Génération facture SGUASP",
    dur: "Auto",
    actor: "Système GUASP",
    entry: "Automatique",
    trigger: "Auto — calcul selon critères véhicule + tarifs opérateurs agréés",
    kind: "auto",
    items: ["Facture générée"],
    deps: [2],
  },
  {
    id: 4,
    name: "Paiement & émission reçu",
    dur: "Auto",
    actor: "Importateur / Transitaire",
    entry: "Automatique (caisse avancée bancaire)",
    trigger: "Auto — reçu généré dès confirmation paiement caisse",
    kind: "auto",
    items: ["Paiement confirmé", "Reçu émis"],
    deps: [3],
    isPayment: true,
  },
  {
    id: 5,
    name: "Vérification code importateur (SACO)",
    dur: "Manuel",
    actor: "Agent SACO",
    entry: "Agent SGUASP (intermédiaire)",
    trigger: "Manuel — SACO envoie résultat, SGUASP le saisit",
    kind: "manual",
    items: ["Résultat SACO saisi"],
    deps: [4],
  },
  {
    id: 6,
    name: "Vérification manifeste navire",
    dur: "Manuel",
    actor: "Transitaire",
    entry: "Agent SGUASP",
    trigger: "Manuel — le transitaire fournit l'information",
    kind: "manual",
    items: ["Manifeste vérifié"],
    deps: [4],
  },
  {
    id: 7,
    name: "Visite douanière",
    dur: "Manuel",
    actor: "Douane",
    entry: "Agent douane directement dans GUASP",
    trigger: "Manuel — douanier présent physiquement, saisit lui-même",
    kind: "manual",
    items: ["Visite douanière réalisée"],
    deps: [4],
  },
  {
    id: 8,
    name: "Inspection RTI (Ministère Transports)",
    dur: "Manuel",
    actor: "Ministère des Transports",
    entry: "Agent SGUASP (intermédiaire)",
    trigger: "Manuel — ministère envoie note, saisie par agent SGUASP",
    kind: "manual",
    items: ["Note RTI saisie"],
    deps: [4],
  },
  {
    id: 9,
    name: "Photos CIVIO",
    dur: "Manuel / semi-auto",
    actor: "Opérateur agréé CIVIO",
    entry: "Opérateur agréé OU agent SGUASP (à définir)",
    trigger: "Manuel ou semi-auto selon intégration retenue",
    kind: "manual",
    items: ["Photos prises et associées"],
    deps: [4],
  },
  {
    id: 10,
    name: "BAD (Bon À Délivrer)",
    dur: "Manuel",
    actor: "Agent Consignataire",
    entry: "Agent SGUASP (intermédiaire)",
    trigger: "Manuel — BAD transmis physiquement à l'agent SGUASP",
    kind: "manual",
    items: ["BAD reçu et saisi"],
    deps: [4],
  },
  {
    id: 11,
    name: "Débarquement / Retrait du navire",
    dur: "Manuel",
    actor: "Importateur → GUASP",
    entry: "Agent SGUASP",
    trigger: "Manuel — importateur informe GUASP à l'arrivée du RoRo",
    kind: "manual",
    items: ["Débarquement confirmé"],
    deps: [4],
  },
  {
    id: 12,
    name: "Désignation emplacement stationnement",
    dur: "Manuel",
    actor: "Importateur (validation)",
    entry: "Agent SGUASP",
    trigger: "Manuel — validé au guichet par l'importateur",
    kind: "manual",
    items: ["Emplacement désigné"],
    deps: [4],
  },
  {
    id: 13,
    name: "Visite technique",
    dur: "Manuel / semi-auto",
    actor: "Opérateur agréé",
    entry: "Opérateur agréé OU agent SGUASP (à définir)",
    trigger: "Manuel ou semi-auto selon intégration retenue",
    kind: "manual",
    items: ["Visite technique effectuée"],
    deps: [4],
  },
  {
    id: 14,
    name: "Génération bon de sortie",
    dur: "Auto",
    actor: "Système GUASP",
    entry: "Automatique",
    trigger: "Auto — généré quand toutes étapes + paiements validés",
    kind: "auto",
    items: ["Bon de sortie généré", "Dossier clôturé automatiquement"],
    deps: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    isFinal: true,
  },
];

// Mock data (aligné avec dashboard.js)
const IMP_DATA = [
  { ref: 'GSP-2024-0087', v: 'Toyota Land Cruiser 2022', c: 'Hiba Elbakkouri', d: '12 jan. 2025', e: 'Photos CIVIO — 9/14' },
  { ref: 'GSP-2024-0086', v: 'Mercedes GLE 350 2023', c: 'Salma Elbakkouri', d: '08 jan. 2025', e: 'Enregistrement SYDAM — 2/14' },
  { ref: 'GSP-2024-0081', v: 'BMW X5 xDrive 2021', c: 'Hiba Elbakkouri', d: '22 déc. 2024', e: 'Bon de sortie — 14/14' },
  { ref: 'GSP-2024-0074', v: 'Honda CR-V 2022', c: 'Sohaib Soussi', d: '15 déc. 2024', e: 'Bon de sortie — 14/14' },
  { ref: 'GSP-2024-0071', v: 'Hyundai Tucson 2023', c: 'Hiba Elbakkouri', d: '10 déc. 2025', e: 'Bon de sortie — 14/14' },
  { ref: 'GSP-2024-0068', v: 'Ford Ranger 2022', c: 'Damouh', d: '02 déc. 2024', e: 'Bon de sortie — 14/14' },
  { ref: 'GSP-2024-0063', v: 'Renault Duster 2021', c: 'Hiba Elbakkouri', d: '18 nov. 2024', e: 'Bon de sortie — 14/14' },
  { ref: 'GSP-2024-0058', v: 'Nissan Navara 2020', c: 'Sohaib Soussi', d: '05 nov. 2024', e: 'Paiement — 4/14' },
  { ref: 'GSP-2024-0055', v: 'Peugeot 3008 2023', c: 'Hiba Elbakkouri', d: '28 oct. 2024', e: 'Non soumis — 0/14' },
  { ref: 'GSP-2024-0051', v: 'Mitsubishi Pajero 2022', c: 'Damouh', d: '20 oct. 2024', e: 'Non soumis — 0/14' },
  { ref: 'GSP-2024-0048', v: 'VW Touareg 2021', c: 'Hiba Elbakkouri', d: '12 oct. 2024', e: 'BAD — 10/14' },
  { ref: 'GSP-2024-0044', v: 'Kia Sportage 2022', c: 'Salma Elbakkouri', d: '04 oct. 2024', e: 'Facture — 3/14' },
];

function parseStepProgress(eText) {
  const m = String(eText || '').match(/(\d+)\s*\/\s*(\d+)/);
  if (!m) return 0;
  const n = parseInt(m[1], 10);
  const total = WORKFLOW_STEPS.length;
  return Number.isFinite(n) ? Math.max(0, Math.min(total, n)) : 0;
}

function qs() {
  return new URLSearchParams(window.location.search);
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

function paymentComplete(ref) {
  // Support 2 formats:
  // - legacy: pay:<ref> = { status: 'paid', ... }
  // - multi:  payments:<ref> = [{ status: 'paid'|'pending'|'failed', ... }, ...]
  const single = getJSON(`pay:${ref}`, null);
  if (single && single.status === 'paid') return true;

  const payments = getJSON(`payments:${ref}`, null);
  if (!Array.isArray(payments) || payments.length === 0) return false;
  return payments.every((p) => p && p.status === 'paid');
}

function stepFieldKey(ref, stepId) {
  return `stepdata:${ref}:${stepId}`;
}

function getStepData(ref, stepId) {
  return getJSON(stepFieldKey(ref, stepId), { note: '' }) || { note: '' };
}

function setStepData(ref, stepId, data) {
  setJSON(stepFieldKey(ref, stepId), data);
}

const STATE = {
  ref: '',
  stepIdx: 0,
  done: Object.create(null), // key: `${stepId}` -> boolean
  role: 'imp', // 'imp' | 'agent'
};

function canEditStep(step) {
  if (!step) return false;
  if (step.kind === 'auto') return false;
  if (STATE.role === 'agent') {
    // agent SGUASP peut saisir tout ce qui n'est pas auto
    return true;
  }
  // importateur: seulement certaines étapes où il est acteur/valideur
  return [1, 4, 11, 12].includes(step.id);
}

function fieldInputHtml({ id, label, type }, value, editable) {
  const safeVal = String(value ?? '');
  const ro = editable ? '' : 'readonly';
  if (type === 'textarea') {
    return `
      <div class="field">
        <label>${label}</label>
        <textarea class="ta" data-fid="${id}" ${ro} placeholder="${editable ? 'Saisissez…' : ''}">${safeVal}</textarea>
      </div>
    `;
  }
  return `
    <div class="field">
      <label>${label}</label>
      <input class="inp" data-fid="${id}" value="${safeVal.replace(/"/g, '&quot;')}" ${ro} />
    </div>
  `;
}

function el(id) {
  return document.getElementById(id);
}

function initials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '—';
  const a = parts[0][0] || '';
  const b = parts.length > 1 ? (parts[parts.length - 1][0] || '') : '';
  return (a + b).toUpperCase();
}

function renderNav() {
  const nav = el('step-nav');
  if (!nav) return;
  nav.innerHTML = WORKFLOW_STEPS.map((s, i) => {
    const on = i === STATE.stepIdx ? 'on' : '';
    const done = STATE.done[String(s.id)] ? '✓ ' : '';
    return `
      <div class="sn ${on}" role="button" tabindex="0" data-step="${i}" aria-label="Aller à l'étape ${i + 1}">
        <div class="sn-left">
          <div class="sn-num">${i + 1}</div>
          <div>
            <div class="sn-name">${done}${s.name}</div>
            <div class="sn-tag">${s.dur}</div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  nav.querySelectorAll('[data-step]').forEach((n) => {
    const idx = parseInt(n.getAttribute('data-step') || '0', 10);
    n.addEventListener('click', () => setStep(idx));
    n.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') setStep(idx);
    });
  });
}

function renderHeader(dossier) {
  el('veh-title').textContent = dossier?.v || 'Dossier';
  el('veh-sub').textContent = `${dossier?.ref || '—'} • ${dossier?.c || '—'} • ${dossier?.d || '—'}`;
  el('sb-uname').textContent = dossier?.c || 'Hiba Elbakkouri';
  el('sb-avatar').textContent = initials(dossier?.c || 'Hiba Elbakkouri');
}

function renderProgress() {
  const total = WORKFLOW_STEPS.length;
  const doneCount = WORKFLOW_STEPS.reduce((acc, s) => acc + (STATE.done[String(s.id)] ? 1 : 0), 0);
  const pct = Math.round((doneCount / total) * 100);
  el('prog-pct').textContent = `${pct}%`;
  el('prog-fill').style.width = `${pct}%`;
}

function checklistHtml(stepIdx) {
  // Cahier des charges: pas de mini-checklist par étape
  return '';
}

function stepBodyHtml(stepIdx, dossier) {
  const step = WORKFLOW_STEPS[stepIdx];
  if (!step) return '';

  const ref = STATE.ref || 'NOUVEAU';
  const done = Boolean(STATE.done[String(step.id)]);

  const pay = step.isPayment ? (getJSON(`pay:${ref}`, null) || null) : null;
  const paidOk = paymentComplete(ref);

  const allNonFinalOk = WORKFLOW_STEPS.filter((s) => !s.isFinal).every((s) => Boolean(STATE.done[String(s.id)]));
  const finalOk = step.isFinal ? allNonFinalOk && paidOk : true;

  let blockNote = '';
  if (step.isFinal && !paidOk) blockNote = `Blocage final absolu: tous les paiements ne sont pas effectués.`;
  if (step.isFinal && paidOk && !allNonFinalOk) blockNote = `Blocage final absolu: toutes les étapes doivent être validées.`;

  const meta = `
    <div class="grid2">
      <div class="field">
        <label>Acteur principal</label>
        <input class="inp" value="${step.actor}" readonly />
      </div>
      <div class="field">
        <label>Qui saisit dans GUASP</label>
        <input class="inp" value="${step.entry}" readonly />
      </div>
      <div class="field">
        <label>Déclenchement</label>
        <input class="inp" value="${step.trigger}" readonly />
      </div>
      <div class="field">
        <label>Référence dossier</label>
        <input class="inp" value="${ref}" readonly />
      </div>
    </div>
  `;

  const sd = getStepData(ref, step.id);
  const editableAllowed = canEditStep(step);

  // Champs par étape (selon cahier des charges)
  const fieldsByStep = {
    1: [
      { id: 'imp_name', label: 'Importateur', type: 'text' },
      { id: 'veh_desc', label: 'Véhicule', type: 'text' },
      { id: 'vin', label: 'VIN', type: 'text' },
      { id: 'bl', label: 'BL (si saisi par transitaire)', type: 'text' },
    ],
    2: [{ id: 'sydam_ref', label: 'Référence SYDAM AUTO', type: 'text' }],
    3: [
      { id: 'invoice_ref', label: 'Référence facture (auto)', type: 'text' },
      { id: 'invoice_amount', label: 'Montant (MAD) (auto)', type: 'text' },
    ],
    4: [
      { id: 'pay_status', label: 'Statut paiement (auto)', type: 'text' },
      { id: 'pay_ref', label: 'Référence paiement (auto)', type: 'text' },
    ],
    5: [{ id: 'saco_result', label: 'Résultat SACO', type: 'text' }],
    6: [{ id: 'manifest_ref', label: 'Référence manifeste navire', type: 'text' }],
    7: [{ id: 'customs_note', label: 'Compte rendu visite douanière', type: 'textarea' }],
    8: [{ id: 'rti_note', label: 'Note RTI (Ministère Transports)', type: 'textarea' }],
    9: [{ id: 'civio_photos', label: 'Références photos CIVIO', type: 'textarea' }],
    10: [{ id: 'bad_ref', label: 'Référence BAD', type: 'text' }],
    11: [{ id: 'disembark_at', label: 'Date/heure débarquement', type: 'text' }],
    12: [{ id: 'parking_spot', label: 'Emplacement stationnement', type: 'text' }],
    13: [{ id: 'tech_visit_result', label: 'Résultat visite technique', type: 'textarea' }],
    14: [{ id: 'bon_ref', label: 'Référence bon de sortie (auto)', type: 'text' }],
  };

  // Valeurs auto
  if (step.id === 1) {
    sd.imp_name = sd.imp_name ?? (dossier?.c || '');
    sd.veh_desc = sd.veh_desc ?? (dossier?.v || '');
  }
  if (step.id === 3) {
    if (!sd.invoice_ref) sd.invoice_ref = `FAC-${ref}-${String(Math.random()).slice(2, 6)}`;
    if (!sd.invoice_amount) sd.invoice_amount = '2500';
    setStepData(ref, step.id, sd);
  }
  if (step.id === 4) {
    const p = getJSON(`pay:${ref}`, null);
    sd.pay_status = paymentComplete(ref) ? 'Payé' : 'Non payé';
    sd.pay_ref = p?.payref || '';
    setStepData(ref, step.id, sd);
  }
  if (step.id === 14) {
    if (finalOk && !sd.bon_ref) {
      sd.bon_ref = `BS-${ref}-${String(Math.random()).slice(2, 6)}`;
      setStepData(ref, step.id, sd);
    }
  }

  const fields = (fieldsByStep[step.id] || [])
    .map((f) => {
      const isAutoField = step.kind === 'auto' || step.id === 4 || step.id === 3 || step.id === 14;
      const editable = editableAllowed && !isAutoField;
      return fieldInputHtml(f, sd?.[f.id], editable);
    })
    .join('');

  const noteBlock = `
    <div class="field" style="margin-top:12px">
      <label>Commentaire / observations</label>
      <textarea class="ta" id="step-note" placeholder="Saisissez une note pour cette étape...">${String(sd?.note || '')}</textarea>
    </div>
  `;

  const intro =
    step.id === 1
      ? `
        <div class="grid2">
          <div>
            <div class="field">
              <label>Importateur</label>
              <input class="inp" value="${dossier?.c || ''}" placeholder="Nom complet" />
            </div>
            <div class="field">
              <label>Email</label>
              <input class="inp" placeholder="ex: nom@exemple.com" />
            </div>
          </div>
          <div>
            <div class="field">
              <label>Véhicule</label>
              <input class="inp" value="${dossier?.v || ''}" placeholder="Marque / Modèle / Année" />
            </div>
            <div class="field">
              <label>VIN</label>
              <input class="inp" placeholder="Numéro de châssis (VIN)" />
            </div>
          </div>
        </div>
      `
      : '';

  const payLine =
    step.isPayment && paidOk
      ? `<div class="pay-ok">Paiement confirmé: <b>${pay.payref}</b> • ${pay.method} • ${pay.amount} MAD</div>`
      : step.isPayment
        ? `<div class="pay-hint">Paiement requis pour atteindre le bon de sortie (étape 14).</div>`
        : '';

  const actions = `
    <div class="pay-box" style="margin-top:12px">
      ${blockNote ? `<div class="pay-hint" style="color:#B94040">${blockNote}</div>` : ''}
      ${step.isPayment ? payLine : ''}
      ${step.isPayment ? `<a class="btn-paypage" href="./paiement.html?ref=${encodeURIComponent(ref)}&amount=2500">Ouvrir la page paiement</a>` : ''}
      <div style="margin-top:10px; display:flex; gap:10px; flex-wrap:wrap">
        <button class="btn-primary" type="button" id="btn-mark-done" ${((step.isFinal && !finalOk) || (step.isPayment && !paidOk)) ? 'disabled' : ''}>
          ${done ? 'Validée' : step.kind === 'auto' ? 'Valider (auto)' : "Valider l'étape"}
        </button>
        <button class="btn-ghost" type="button" id="btn-unmark-done" ${!done ? 'disabled' : ''}>Annuler validation</button>
      </div>
      ${step.isFinal ? `<div class="pay-hint" style="margin-top:10px">Clôture automatique: lorsque le bon de sortie est généré, le dossier est clôturé.</div>` : ''}
    </div>
  `;

  return `
    ${intro}
    ${meta}
    <div class="grid2" style="margin-top:12px">${fields}</div>
    ${noteBlock}
    ${actions}
  `;
}

function bindChecklist() {
  const body = el('step-body');
  if (!body) return;
  // No-op: checklist removed from UI
}

function persistDone() {
  setJSON(`done:${STATE.ref}`, STATE.done);
}

function markDone(stepId, done) {
  STATE.done[String(stepId)] = Boolean(done);
  persistDone();
}

function autoSyncPayment() {
  if (paymentComplete(STATE.ref)) markDone(4, true);
}

function autoSyncFinal() {
  const paidOk = paymentComplete(STATE.ref);
  const allNonFinalOk = WORKFLOW_STEPS.filter((s) => !s.isFinal).every((s) => Boolean(STATE.done[String(s.id)]));
  if (paidOk && allNonFinalOk) markDone(14, true);
}

function bindStepValidation() {
  const body = el('step-body');
  if (!body) return;
  const step = WORKFLOW_STEPS[STATE.stepIdx];
  if (!step) return;

  body.querySelectorAll('[data-fid]').forEach((node) => {
    const fid = node.getAttribute('data-fid');
    if (!fid) return;
    node.addEventListener('input', () => {
      const sd = getStepData(STATE.ref, step.id);
      sd[fid] = String(node.value || '');
      setStepData(STATE.ref, step.id, sd);
    });
  });

  const note = body.querySelector('#step-note');
  note?.addEventListener('input', () => {
    const sd = getStepData(STATE.ref, step.id);
    sd.note = String(note.value || '');
    setStepData(STATE.ref, step.id, sd);
  });

  const btnDone = body.querySelector('#btn-mark-done');
  const btnUndone = body.querySelector('#btn-unmark-done');

  btnDone?.addEventListener('click', () => {
    if (step.isPayment) {
      autoSyncPayment();
    } else if (step.isFinal) {
      autoSyncPayment();
      autoSyncFinal();
    } else {
      markDone(step.id, true);
    }
    autoSyncFinal();
    renderStep(IMP_DATA.find((x) => x.ref === STATE.ref) || null);
  });

  btnUndone?.addEventListener('click', () => {
    markDone(step.id, false);
    if (step.isFinal) markDone(14, false);
    renderStep(IMP_DATA.find((x) => x.ref === STATE.ref) || null);
  });
}

function renderStep(dossier) {
  const s = WORKFLOW_STEPS[STATE.stepIdx];
  el('step-kicker').textContent = `Étape ${STATE.stepIdx + 1} / ${WORKFLOW_STEPS.length}`;
  el('step-title').textContent = s.name;
  el('step-dur').textContent = `Durée estimée: ${s.dur}`;

  const btnPrev = el('btn-prev');
  const btnNext = el('btn-next');
  if (btnPrev) btnPrev.disabled = STATE.stepIdx === 0;
  if (btnNext) btnNext.textContent = STATE.stepIdx === WORKFLOW_STEPS.length - 1 ? 'Terminer' : 'Suivant';

  el('step-body').innerHTML = stepBodyHtml(STATE.stepIdx, dossier);
  bindChecklist();
  bindStepValidation();
  renderNav();
  renderProgress();
}

function setStep(idx) {
  const nextIdx = Math.max(0, Math.min(WORKFLOW_STEPS.length - 1, idx));
  STATE.stepIdx = nextIdx;
  const dossier = IMP_DATA.find((x) => x.ref === STATE.ref);
  renderStep(dossier || null);
  try {
    localStorage.setItem(`step:${STATE.ref}`, String(STATE.stepIdx));
  } catch {
    // ignore
  }
}

function init() {
  const ref = qs().get('ref'); // si absent => nouveau dossier
  const forcedStep = parseInt(qs().get('step') || '', 10);
  const role = String(qs().get('role') || '').toLowerCase();
  STATE.role = role === 'agent' ? 'agent' : 'imp';
  const dossier =
    (ref && IMP_DATA.find((x) => x.ref === ref)) ||
    ({
      ref: 'NOUVEAU',
      v: '',
      c: 'Hiba Elbakkouri',
      d: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
      e: 'Non soumis — 0/14',
    });

  STATE.ref = dossier.ref;

  STATE.done = getJSON(`done:${STATE.ref}`, Object.create(null));
  autoSyncPayment();
  autoSyncFinal();

  // position initiale: d'après "x/14" (nouveau => 0)
  STATE.stepIdx = Number.isFinite(forcedStep) ? Math.max(0, Math.min(WORKFLOW_STEPS.length - 1, forcedStep)) : parseStepProgress(dossier.e);
  try {
    const savedStep = parseInt(localStorage.getItem(`step:${STATE.ref}`) || '', 10);
    if (!Number.isNaN(savedStep) && !Number.isFinite(forcedStep)) STATE.stepIdx = Math.max(0, Math.min(WORKFLOW_STEPS.length - 1, savedStep));
  } catch {
    // ignore
  }

  renderHeader(dossier);
  renderNav();
  renderProgress();
  renderStep(dossier);

  const btnSuivi = document.getElementById('btn-suivi');
  if (btnSuivi) {
    btnSuivi.href = `./suivi.html?ref=${encodeURIComponent(STATE.ref)}`;
  }

  const btnPrev = el('btn-prev');
  const btnNext = el('btn-next');
  btnPrev?.addEventListener('click', () => setStep(STATE.stepIdx - 1));
  btnNext?.addEventListener('click', () => {
    if (STATE.stepIdx >= WORKFLOW_STEPS.length - 1) {
      window.location.href = './dashboard.html';
      return;
    }
    setStep(STATE.stepIdx + 1);
  });
}

document.addEventListener('DOMContentLoaded', init);

