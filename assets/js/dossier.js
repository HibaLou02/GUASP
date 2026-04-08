/* ══════════════════════════════
   Wizard: Dossier véhicule (1 page)
══════════════════════════════ */

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

// Mock data (aligné avec dashboard.js)
const IMP_DATA = [
  { ref: 'GSP-2024-0087', v: 'Toyota Land Cruiser 2022', c: 'Hiba Elbakkouri', d: '12 jan. 2025', e: 'Inspection — 6/8' },
  { ref: 'GSP-2024-0086', v: 'Mercedes GLE 350 2023', c: 'Salma Elbakkouri', d: '08 jan. 2025', e: 'Documents — 2/8' },
  { ref: 'GSP-2024-0081', v: 'BMW X5 xDrive 2021', c: 'Hiba Elbakkouri', d: '22 déc. 2024', e: 'Sortie véhicule — 8/8' },
  { ref: 'GSP-2024-0074', v: 'Honda CR-V 2022', c: 'Sohaib Soussi', d: '15 déc. 2024', e: 'Sortie véhicule — 8/8' },
  { ref: 'GSP-2024-0071', v: 'Hyundai Tucson 2023', c: 'Hiba Elbakkouri', d: '10 déc. 2024', e: 'Sortie véhicule — 8/8' },
  { ref: 'GSP-2024-0068', v: 'Ford Ranger 2022', c: 'Damouh', d: '02 déc. 2024', e: 'Sortie véhicule — 8/8' },
  { ref: 'GSP-2024-0063', v: 'Renault Duster 2021', c: 'Hiba Elbakkouri', d: '18 nov. 2024', e: 'Sortie véhicule — 8/8' },
  { ref: 'GSP-2024-0058', v: 'Nissan Navara 2020', c: 'Sohaib Soussi', d: '05 nov. 2024', e: 'Vérification — 4/8' },
  { ref: 'GSP-2024-0055', v: 'Peugeot 3008 2023', c: 'Hiba Elbakkouri', d: '28 oct. 2024', e: 'Non soumis — 0/8' },
  { ref: 'GSP-2024-0051', v: 'Mitsubishi Pajero 2022', c: 'Damouh', d: '20 oct. 2024', e: 'Non soumis — 0/8' },
  { ref: 'GSP-2024-0048', v: 'VW Touareg 2021', c: 'Hiba Elbakkouri', d: '12 oct. 2024', e: 'Transfert vers parc — 5/8' },
  { ref: 'GSP-2024-0044', v: 'Kia Sportage 2022', c: 'Salma Elbakkouri', d: '04 oct. 2024', e: 'Facturation & Paiement — 3/8' },
];

function parseStepProgress(eText) {
  const m = String(eText || '').match(/(\d+)\s*\/\s*(\d+)/);
  if (!m) return 0;
  const n = parseInt(m[1], 10);
  const total = ROADMAP_STEPS.length;
  return Number.isFinite(n) ? Math.max(0, Math.min(total, n)) : 0;
}

function qs() {
  return new URLSearchParams(window.location.search);
}

const STATE = {
  ref: '',
  stepIdx: 0,
  checklist: Object.create(null), // key: `${stepIdx}:${itemIdx}` -> boolean
};

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
  nav.innerHTML = ROADMAP_STEPS.map((s, i) => {
    const on = i === STATE.stepIdx ? 'on' : '';
    return `
      <div class="sn ${on}" role="button" tabindex="0" data-step="${i}" aria-label="Aller à l'étape ${i + 1}">
        <div class="sn-left">
          <div class="sn-num">${i + 1}</div>
          <div>
            <div class="sn-name">${s.name}</div>
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
  const pct = Math.round(((STATE.stepIdx) / ROADMAP_STEPS.length) * 100);
  el('prog-pct').textContent = `${pct}%`;
  el('prog-fill').style.width = `${pct}%`;
}

function checklistHtml(stepIdx) {
  const items = ROADMAP_STEPS[stepIdx]?.items || [];
  return `
    <div class="checklist">
      ${items.map((it, j) => {
        const key = `${stepIdx}:${j}`;
        const checked = STATE.checklist[key] ? 'checked' : '';
        return `
          <label class="ck">
            <input type="checkbox" data-ck="${key}" ${checked} />
            <span>${it}</span>
          </label>
        `;
      }).join('')}
    </div>
  `;
}

function stepBodyHtml(stepIdx, dossier) {
  switch (stepIdx) {
    case 0:
      return `
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
            <div class="field">
              <label>Téléphone</label>
              <input class="inp" placeholder="+212 ..." />
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
            <div class="field">
              <label>Origine</label>
              <select class="sel">
                <option>Europe</option>
                <option>USA</option>
                <option>Asie</option>
                <option>Autre</option>
              </select>
            </div>
          </div>
        </div>
        ${checklistHtml(stepIdx)}
      `;
    case 1:
      return `
        <div class="grid2">
          <div>
            <div class="field">
              <label>Carte grise (PDF)</label>
              <input class="inp" type="file" accept=".pdf" />
            </div>
            <div class="field">
              <label>Facture d'achat (PDF)</label>
              <input class="inp" type="file" accept=".pdf" />
            </div>
          </div>
          <div>
            <div class="field">
              <label>Photos véhicule</label>
              <input class="inp" type="file" accept="image/*" multiple />
            </div>
            <div class="field">
              <label>Notes</label>
              <textarea class="ta" placeholder="Informations utiles..."></textarea>
            </div>
          </div>
        </div>
        ${checklistHtml(stepIdx)}
      `;
    case 2:
      {
        const ref = STATE.ref || 'NOUVEAU';
        let pay = null;
        try {
          pay = JSON.parse(localStorage.getItem(`pay:${ref}`) || 'null');
        } catch {
          pay = null;
        }
        const payLine =
          pay && pay.status === 'paid'
            ? `<div class="pay-ok">Paiement enregistré: <b>${pay.payref}</b> • ${pay.method} • ${pay.amount} MAD</div>`
            : `<div class="pay-hint">Optionnel: vous pouvez effectuer le paiement sur une page dédiée.</div>`;

      return `
        <div class="grid2">
          <div>
            <div class="field">
              <label>Générer la facture</label>
              <select class="sel">
                <option>Automatique</option>
                <option>Manuel</option>
              </select>
            </div>
            <div class="field">
              <label>Montant (MAD)</label>
              <input class="inp" placeholder="ex: 2500" />
            </div>
          </div>
          <div>
            <div class="field">
              <label>Méthode de paiement</label>
              <select class="sel">
                <option>CMI</option>
                <option>API</option>
                <option>Manuel</option>
              </select>
            </div>
            <div class="field">
              <label>Référence paiement</label>
              <input class="inp" placeholder="ex: CMI-xxxx" />
            </div>
            <div class="pay-box">
              ${payLine}
              <a class="btn-paypage" href="./paiement.html?ref=${encodeURIComponent(ref)}&amount=2500">Ouvrir la page paiement</a>
            </div>
          </div>
        </div>
        ${checklistHtml(stepIdx)}
      `;
      }
    case 3:
      return `
        <div class="grid2">
          <div>
            <div class="field">
              <label>Décision admin</label>
              <select class="sel">
                <option>En attente</option>
                <option>Validé</option>
                <option>Rejeté</option>
              </select>
            </div>
            <div class="field">
              <label>Motif (si rejet)</label>
              <textarea class="ta" placeholder="Décrivez le blocage/rejet..."></textarea>
            </div>
          </div>
          <div>
            <div class="field">
              <label>Pièces manquantes</label>
              <textarea class="ta" placeholder="Liste des pièces manquantes..."></textarea>
            </div>
          </div>
        </div>
        ${checklistHtml(stepIdx)}
      `;
    case 4:
      return `
        <div class="grid2">
          <div>
            <div class="field">
              <label>Parc</label>
              <select class="sel">
                <option>Parc A</option>
                <option>Parc B</option>
                <option>Parc C</option>
              </select>
            </div>
            <div class="field">
              <label>Date d'envoi</label>
              <input class="inp" type="date" />
            </div>
          </div>
          <div>
            <div class="field">
              <label>Constat sommaire</label>
              <textarea class="ta" placeholder="Constat à l'arrivée au parc..."></textarea>
            </div>
          </div>
        </div>
        ${checklistHtml(stepIdx)}
      `;
    case 5:
      return `
        <div class="grid2">
          <div>
            <div class="field">
              <label>Résultat RTI</label>
              <select class="sel">
                <option>En cours</option>
                <option>Conforme</option>
                <option>Non conforme</option>
              </select>
            </div>
            <div class="field">
              <label>Rapport (PDF)</label>
              <input class="inp" type="file" accept=".pdf" />
            </div>
          </div>
          <div>
            <div class="field">
              <label>Photos inspection</label>
              <input class="inp" type="file" accept="image/*" multiple />
            </div>
            <div class="field">
              <label>Observations</label>
              <textarea class="ta" placeholder="Observations techniques..."></textarea>
            </div>
          </div>
        </div>
        ${checklistHtml(stepIdx)}
      `;
    case 6:
      return `
        <div class="grid2">
          <div>
            <div class="field">
              <label>Transmission BVA</label>
              <select class="sel">
                <option>Envoyée</option>
                <option>En attente</option>
              </select>
            </div>
            <div class="field">
              <label>N° immatriculation</label>
              <input class="inp" placeholder="ex: 12345-A-6" />
            </div>
          </div>
          <div>
            <div class="field">
              <label>Carte grise (PDF)</label>
              <input class="inp" type="file" accept=".pdf" />
            </div>
            <div class="field">
              <label>Notes</label>
              <textarea class="ta" placeholder="Notes immatriculation..."></textarea>
            </div>
          </div>
        </div>
        ${checklistHtml(stepIdx)}
      `;
    case 7:
      return `
        <div class="grid2">
          <div>
            <div class="field">
              <label>Autorisation de sortie</label>
              <select class="sel">
                <option>Non</option>
                <option>Oui</option>
              </select>
            </div>
            <div class="field">
              <label>Date de sortie</label>
              <input class="inp" type="date" />
            </div>
          </div>
          <div>
            <div class="field">
              <label>Clôture dossier</label>
              <select class="sel">
                <option>Non</option>
                <option>Oui</option>
              </select>
            </div>
            <div class="field">
              <label>Commentaire</label>
              <textarea class="ta" placeholder="Dernières notes..."></textarea>
            </div>
          </div>
        </div>
        ${checklistHtml(stepIdx)}
      `;
    default:
      return '';
  }
}

function bindChecklist() {
  const body = el('step-body');
  if (!body) return;
  body.querySelectorAll('input[type="checkbox"][data-ck]').forEach((c) => {
    c.addEventListener('change', () => {
      const key = c.getAttribute('data-ck');
      if (!key) return;
      STATE.checklist[key] = c.checked;
      try {
        localStorage.setItem(`ck:${STATE.ref}`, JSON.stringify(STATE.checklist));
      } catch {
        // ignore
      }
    });
  });
}

function renderStep(dossier) {
  const s = ROADMAP_STEPS[STATE.stepIdx];
  el('step-kicker').textContent = `Étape ${STATE.stepIdx + 1} / ${ROADMAP_STEPS.length}`;
  el('step-title').textContent = s.name;
  el('step-dur').textContent = `Durée estimée: ${s.dur}`;

  const btnPrev = el('btn-prev');
  const btnNext = el('btn-next');
  if (btnPrev) btnPrev.disabled = STATE.stepIdx === 0;
  if (btnNext) btnNext.textContent = STATE.stepIdx === ROADMAP_STEPS.length - 1 ? 'Terminer' : 'Suivant';

  el('step-body').innerHTML = stepBodyHtml(STATE.stepIdx, dossier);
  bindChecklist();
  renderNav();
  renderProgress();
}

function setStep(idx) {
  STATE.stepIdx = Math.max(0, Math.min(ROADMAP_STEPS.length - 1, idx));
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
  const dossier =
    (ref && IMP_DATA.find((x) => x.ref === ref)) ||
    ({
      ref: 'NOUVEAU',
      v: '',
      c: 'Hiba Elbakkouri',
      d: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
      e: 'Non soumis — 0/8',
    });

  STATE.ref = dossier.ref;

  // restore checklist (si existante)
  try {
    const raw = localStorage.getItem(`ck:${STATE.ref}`);
    if (raw) STATE.checklist = JSON.parse(raw) || STATE.checklist;
  } catch {
    // ignore
  }

  // position initiale: d'après "x/8" (nouveau => 0)
  STATE.stepIdx = Number.isFinite(forcedStep) ? Math.max(0, Math.min(ROADMAP_STEPS.length - 1, forcedStep)) : parseStepProgress(dossier.e);
  try {
    const savedStep = parseInt(localStorage.getItem(`step:${STATE.ref}`) || '', 10);
    if (!Number.isNaN(savedStep) && !Number.isFinite(forcedStep)) STATE.stepIdx = Math.max(0, Math.min(ROADMAP_STEPS.length - 1, savedStep));
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
    if (STATE.stepIdx >= ROADMAP_STEPS.length - 1) {
      window.location.href = './dashboard.html';
      return;
    }
    setStep(STATE.stepIdx + 1);
  });
}

document.addEventListener('DOMContentLoaded', init);

