/* ══════════════════════════════
   DATA
══════════════════════════════ */
const IMP_DATA = [
  { ref: 'GSP-2024-0087', v: 'Toyota Land Cruiser 2022', c: 'Hiba Elbakkouri', d: '12 jan. 2025', e: 'Inspection — 6/8', s: 'cours' },
  { ref: 'GSP-2024-0086', v: 'Mercedes GLE 350 2023', c: 'Salma Elbakkouri', d: '08 jan. 2025', e: 'Documents — 2/8', s: 'cours' },
  { ref: 'GSP-2024-0081', v: 'BMW X5 xDrive 2021', c: 'Hiba Elbakkouri', d: '22 déc. 2024', e: 'Sortie véhicule — 8/8', s: 'cours' },
  { ref: 'GSP-2024-0074', v: 'Honda CR-V 2022', c: 'Sohaib Soussi', d: '15 déc. 2024', e: 'Sortie véhicule — 8/8', s: 'valide' },
  { ref: 'GSP-2024-0071', v: 'Hyundai Tucson 2023', c: 'Hiba Elbakkouri', d: '10 déc. 2024', e: 'Sortie véhicule — 8/8', s: 'valide' },
  { ref: 'GSP-2024-0068', v: 'Ford Ranger 2022', c: 'Damouh', d: '02 déc. 2024', e: 'Sortie véhicule — 8/8', s: 'valide' },
  { ref: 'GSP-2024-0063', v: 'Renault Duster 2021', c: 'Hiba Elbakkouri', d: '18 nov. 2024', e: 'Sortie véhicule — 8/8', s: 'valide' },
  { ref: 'GSP-2024-0058', v: 'Nissan Navara 2020', c: 'Sohaib Soussi', d: '05 nov. 2024', e: 'Vérification — 4/8', s: 'rejete' },
  { ref: 'GSP-2024-0055', v: 'Peugeot 3008 2023', c: 'Hiba Elbakkouri', d: '28 oct. 2024', e: 'Non soumis — 0/8', s: 'brouillon' },
  { ref: 'GSP-2024-0051', v: 'Mitsubishi Pajero 2022', c: 'Damouh', d: '20 oct. 2024', e: 'Non soumis — 0/8', s: 'brouillon' },
  { ref: 'GSP-2024-0048', v: 'VW Touareg 2021', c: 'Hiba Elbakkouri', d: '12 oct. 2024', e: 'Transfert vers parc — 5/8', s: 'cours' },
  { ref: 'GSP-2024-0044', v: 'Kia Sportage 2022', c: 'Salma Elbakkouri', d: '04 oct. 2024', e: 'Facturation & Paiement — 3/8', s: 'cours' },
];

/* ══════════════════════════════
   ROADMAP (inline on dashboard)
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

function parseStepProgress(eText) {
  const m = String(eText || '').match(/(\d+)\s*\/\s*(\d+)/);
  if (!m) return 0;
  const n = parseInt(m[1], 10);
  const total = ROADMAP_STEPS.length;
  return Number.isFinite(n) ? Math.max(0, Math.min(total, n)) : 0;
}

function stepAvgDays(step) {
  const m = step.dur.match(/\d+/g);
  if (!m) return 1;
  return m.length === 2 ? Math.ceil((parseInt(m[0], 10) + parseInt(m[1], 10)) / 2) : parseInt(m[0], 10);
}
function daysSpent(stepIdx) {
  return ROADMAP_STEPS.slice(0, stepIdx).reduce((acc, s) => acc + stepAvgDays(s), 0);
}
function daysLeft(stepIdx) {
  if (stepIdx >= ROADMAP_STEPS.length) return 0;
  return ROADMAP_STEPS.slice(stepIdx).reduce((acc, s) => acc + stepAvgDays(s), 0);
}
function totalDays() {
  return ROADMAP_STEPS.reduce((acc, s) => acc + stepAvgDays(s), 0);
}

function closeRoadmap() {
  const modal = document.getElementById('rm-modal');
  const body = document.getElementById('rm-modal-body');
  if (body) body.innerHTML = '';
  if (modal) {
    modal.classList.remove('on');
    modal.setAttribute('aria-hidden', 'true');
  }
}
window.closeRoadmap = closeRoadmap;

function goToDossier(ref) {
  if (!ref) return;
  window.location.href = `./dossier.html?ref=${encodeURIComponent(ref)}`;
}
window.goToDossier = goToDossier;

function openRoadmap(ref) {
  const d = IMP_DATA.find((x) => x.ref === ref);
  const modal = document.getElementById('rm-modal');
  const body = document.getElementById('rm-modal-body');
  if (!modal || !body || !d) return;

  const step = parseStepProgress(d.e);
  const totalSteps = ROADMAP_STEPS.length;
  const pct = Math.round((step / totalSteps) * 100);
  const left = daysLeft(step);
  const spent = daysSpent(step);
  const total = totalDays();

  const lineH = step > 0 ? Math.min(Math.round((step / totalSteps) * 97), 97) + '%' : '0%';

  body.innerHTML = `
    <div class="imp-roadmap-inner view-transition">
      <div class="rm-top">
        <div>
          <div class="rm-eyebrow">Suivi étapes</div>
          <div class="rm-title">${d.v}</div>
          <div class="rm-sub">${d.ref} • ${d.c}</div>
        </div>
        <button class="rm-close" type="button" onclick="closeRoadmap()">Fermer</button>
      </div>

      <div class="progress-wrap">
        <div class="prog-header">
          <div class="prog-label">Progression globale</div>
          <div class="prog-pct">${pct}%</div>
        </div>
        <div class="prog-bar">
          <div class="prog-fill" style="width:0%" id="prog-fill-anim"></div>
        </div>
      </div>

      <div class="time-cards">
        <div class="tc" style="--tc-c:var(--gold)">
          <div class="tc-lbl">Temps écoulé</div>
          <div class="tc-val">${spent} jours</div>
          <div class="tc-sub">depuis le début</div>
        </div>
        <div class="tc" style="--tc-c:var(--black)">
          <div class="tc-lbl">Temps restant estimé</div>
          <div class="tc-val">${left > 0 ? left + ' jours' : 'Finalisé'}</div>
          <div class="tc-sub">${left > 0 ? 'avant la carte grise' : 'carte grise délivrée'}</div>
        </div>
        <div class="tc" style="--tc-c:var(--cream3)">
          <div class="tc-lbl">Durée totale du circuit</div>
          <div class="tc-val">${total} jours</div>
          <div class="tc-sub">durée moyenne estimée</div>
        </div>
      </div>

      <div class="roadmap-section-title">Détail des ${totalSteps} étapes</div>
      <div class="roadmap">
        <div class="roadmap-line"></div>
        <div class="roadmap-line-fill" id="rlfill" style="height:0"></div>

        ${ROADMAP_STEPS.map((s, i) => {
          const state = i < step ? 'done' : i === step ? 'active' : 'pending';
          const badgeCls = state === 'done' ? 'sb-done' : state === 'active' ? 'sb-active' : 'sb-pending';
          const badgeTxt = state === 'done' ? 'Terminé' : state === 'active' ? 'En cours' : 'À venir';
          const dateTxt = state === 'done' ? 'Complété' : state === 'active' ? 'En cours' : '~' + daysLeft(i + 1) + 'j restants';
          return `
            <div class="step ${state}">
              <div class="step-node"><div class="step-dot"></div></div>
              <div class="step-content">
                <div class="step-header">
                  <div class="step-num">Étape ${i + 1}</div>
                  <div class="step-name">${s.name}</div>
                  <span class="step-badge ${badgeCls}">${badgeTxt}</span>
                </div>
                <div class="step-desc">${(s.items || []).map((it) => `• ${it}`).join('<br>')}</div>
                <div class="step-meta">
                  <div class="step-dur">Durée : <span>${s.dur}</span></div>
                  <div class="step-date">${dateTxt}</div>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  modal.classList.add('on');
  modal.setAttribute('aria-hidden', 'false');

  requestAnimationFrame(() => {
    setTimeout(() => {
      const fill = document.getElementById('prog-fill-anim');
      if (fill) fill.style.width = pct + '%';
      const line = document.getElementById('rlfill');
      if (line) line.style.height = lineH;
    }, 80);
  });
}
window.openRoadmap = openRoadmap;

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeRoadmap();
});

const AGENT_DATA = [
  { ref: 'GSP-2024-0087', v: 'Toyota Land Cruiser 2022', imp: 'Hiba Elbakkouri', e: 'Vérification douanière', circ: 'C1', p: 'haute', s: 'urgent' },
  { ref: 'GSP-2024-0086', v: 'Mercedes GLE 350 2023', imp: 'Salma Elbakkouri', e: 'Réception au port', circ: 'C2', p: 'haute', s: 'urgent' },
  { ref: 'GSP-2024-0083', v: 'Range Rover Sport 2022', imp: 'Sohaib Soussi', e: 'Contrôle technique', circ: 'C1', p: 'haute', s: 'urgent' },
  { ref: 'GSP-2024-0081', v: 'BMW X5 xDrive 2021', imp: 'Hiba Elbakkouri', e: 'Signature carte grise', circ: 'C3', p: 'normale', s: 'assigne' },
  { ref: 'GSP-2024-0079', v: 'Ford F-150 2023', imp: 'Damouh', e: 'Dépôt documents', circ: 'C1', p: 'normale', s: 'attente' },
  { ref: 'GSP-2024-0076', v: 'Lexus GX 460 2022', imp: 'Salma Elbakkouri', e: 'Attente paiement', circ: 'C2', p: 'normale', s: 'attente' },
  { ref: 'GSP-2024-0072', v: 'Chevrolet Silverado 2021', imp: 'Sohaib Soussi', e: 'Vérification docs', circ: 'C1', p: 'basse', s: 'assigne' },
  { ref: 'GSP-2024-0069', v: 'Audi Q7 2022', imp: 'Damouh', e: 'Classement final', circ: 'C3', p: 'basse', s: 'assigne' },
];

/* ── Badge map ── */
const BM = {
  brouillon: { c: 'b-brouillon', l: 'Brouillon' },
  cours: { c: 'b-cours', l: 'En cours' },
  valide: { c: 'b-valide', l: 'Validé' },
  rejete: { c: 'b-rejete', l: 'Rejeté' },
  assigne: { c: 'b-assigne', l: 'Assigné' },
  attente: { c: 'b-attente', l: 'En attente' },
  urgent: { c: 'b-urgent', l: 'Urgent' },
};

/* ── Priority map ── */
const PM = {
  haute: { c: 'p-haute', l: 'Haute' },
  normale: { c: 'p-normale', l: 'Normale' },
  basse: { c: '', l: 'Basse' },
};

/* ══════════════════════════════
   ROLE SWITCHER
══════════════════════════════ */
function switchRole(role) {
  document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
  document.querySelectorAll('.msw').forEach((b) => b.classList.remove('active'));
  document.getElementById('view-' + role)?.classList.add('active');
  // Update both sidebars' toggles (Importateur = index 0, Agent = index 1)
  document.querySelectorAll('.mode-switch').forEach((sw) => {
    const btns = sw.querySelectorAll('.msw');
    btns[role === 'imp' ? 0 : 1]?.classList.add('active');
  });
}
window.switchRole = switchRole;

/* ══════════════════════════════
   IMPORTATEUR FILTER + RENDER
══════════════════════════════ */
let IF = 'all';

function fi(f, idx) {
  IF = f;
  document.querySelectorAll('#view-imp .kpi').forEach((k, i) => k.classList.toggle('sel', i === idx));
  renderImp();
}
window.fi = fi;

function renderImp() {
  const q = (document.getElementById('imp-search')?.value || '').toLowerCase();
  const rows = IMP_DATA.filter((d) => {
    const ms = IF === 'all' || d.s === IF;
    const mq = !q || d.ref.toLowerCase().includes(q) || d.v.toLowerCase().includes(q) || d.c.toLowerCase().includes(q);
    return ms && mq;
  });

  const impCount = document.getElementById('imp-count');
  if (impCount) impCount.textContent = rows.length + ' dossier' + (rows.length !== 1 ? 's' : '');

  const body = document.getElementById('imp-body');
  const empty = document.getElementById('imp-empty');

  if (!body || !empty) return;
  if (!rows.length) {
    body.innerHTML = '';
    empty.classList.add('on');
    return;
  }
  empty.classList.remove('on');

  body.innerHTML = rows
    .map(
      (d, i) => `
    <div class="row-imp" style="animation-delay:${i * .03}s" onclick="goToDossier('${d.ref}')">
      <div>
        <div class="dref">${d.ref}</div>
        <div class="dveh">${d.v}</div>
      </div>
      <div class="dtxt">${d.c}</div>
      <div class="dmut">${d.d}</div>
      <div class="dmut">${d.e}</div>
      <div><span class="badge ${BM[d.s].c}"><span class="bd"></span>${BM[d.s].l}</span></div>
      <div class="dact"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></div>
    </div>
  `
    )
    .join('');
}
window.renderImp = renderImp;

/* ══════════════════════════════
   AGENT FILTER + RENDER
══════════════════════════════ */
let AF = 'all';

function fa(f, idx) {
  AF = f;
  document.querySelectorAll('#view-agent .kpi').forEach((k, i) => k.classList.toggle('sel', i === idx));
  renderAgent();
}
window.fa = fa;

function renderAgent() {
  const q = (document.getElementById('agent-search')?.value || '').toLowerCase();
  const circuit = document.getElementById('agent-circuit')?.value || '';

  const rows = AGENT_DATA.filter((d) => {
    const ms = AF === 'all' || d.s === AF;
    const mc = !circuit || d.circ === circuit;
    const mq = !q || d.ref.toLowerCase().includes(q) || d.imp.toLowerCase().includes(q) || d.v.toLowerCase().includes(q);
    return ms && mc && mq;
  });

  const agentCount = document.getElementById('agent-count');
  if (agentCount) agentCount.textContent = rows.length + ' cas';

  const body = document.getElementById('agent-body');
  const empty = document.getElementById('agent-empty');

  if (!body || !empty) return;
  if (!rows.length) {
    body.innerHTML = '';
    empty.classList.add('on');
    return;
  }
  empty.classList.remove('on');

  body.innerHTML = rows
    .map(
      (d, i) => `
    <div class="row-agent" style="animation-delay:${i * .03}s">
      <div>
        <div class="dref">${d.ref}</div>
        <div class="dveh">${d.v}</div>
      </div>
      <div class="dtxt">${d.imp}</div>
      <div class="dmut">${d.e}</div>
      <div class="dmut">${d.circ}</div>
      <div><span class="prio ${PM[d.p].c}"><span class="pd"></span>${PM[d.p].l}</span></div>
      <div><span class="badge ${BM[d.s].c}"><span class="bd"></span>${BM[d.s].l}</span></div>
      <div class="dact"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></div>
    </div>
  `
    )
    .join('');
}
window.renderAgent = renderAgent;

/* ── Init ── */
renderImp();
renderAgent();

