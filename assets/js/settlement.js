function moneyXOF(n) {
  const v = Number(n || 0);
  const safe = Number.isFinite(v) ? v : 0;
  try {
    return safe.toLocaleString('fr-FR') + ' XOF';
  } catch {
    return safe + ' XOF';
  }
}

function fmtDate(d) {
  try {
    return new Date(d).toLocaleString('fr-FR', { year: 'numeric', month: 'short', day: '2-digit' });
  } catch {
    return String(d || '—');
  }
}

function getAllPayments() {
  const out = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith('pay:')) continue;
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      const p = JSON.parse(raw);
      if (p && p.status === 'paid') out.push(p);
    }
  } catch {
    // ignore
  }
  return out;
}

function seedMockIfEmpty() {
  const existing = getAllPayments();
  if (existing.length) return;
  const demo = [
    { ref: 'GSP-2024-0087', amount: 42000, method: 'MobileMoney', payref: 'MM-7A21C3', status: 'paid', at: new Date(Date.now() - 864e5 * 3).toISOString() },
    { ref: 'GSP-2024-0074', amount: 38000, method: 'Carte', payref: 'CB-91F0A2', status: 'paid', at: new Date(Date.now() - 864e5 * 9).toISOString() },
    { ref: 'GSP-2024-0068', amount: 40000, method: 'Virement', payref: 'TR-4C221D', status: 'paid', at: new Date(Date.now() - 864e5 * 16).toISOString() },
    { ref: 'GSP-2024-0044', amount: 36000, method: 'MobileMoney', payref: 'MM-0B77A9', status: 'paid', at: new Date(Date.now() - 864e5 * 21).toISOString() },
  ];
  demo.forEach((p) => {
    try {
      localStorage.setItem(`pay:${p.ref}`, JSON.stringify(p));
    } catch {
      // ignore
    }
  });
}

function renderKpis(payments) {
  const total = payments.reduce((acc, p) => acc + Number(p.amount || 0), 0);
  const uniqueVehicles = new Set(payments.map((p) => p.ref)).size;
  const fees = document.getElementById('kpi-fees');
  const cleared = document.getElementById('kpi-cleared');
  if (fees) fees.textContent = moneyXOF(total);
  if (cleared) cleared.textContent = String(uniqueVehicles);
}

const WEEKLY = [
  { label: 'W1', value: 12 },
  { label: 'W2', value: 18 },
  { label: 'W3', value: 9 },
  { label: 'W4', value: 22 },
  { label: 'W5', value: 16 },
  { label: 'W6', value: 28 },
  { label: 'W7', value: 20 },
  { label: 'W8', value: 31 },
];

const MONTHLY = [
  { label: 'Jan', value: 58 },
  { label: 'Feb', value: 72 },
  { label: 'Mar', value: 64 },
  { label: 'Apr', value: 80 },
  { label: 'May', value: 77 },
  { label: 'Jun', value: 92 },
  { label: 'Jul', value: 88 },
  { label: 'Aug', value: 97 },
];

function renderChart(points) {
  const host = document.getElementById('rev-bars');
  const x = document.getElementById('rev-x');
  if (!host || !x) return;
  const max = Math.max(1, ...points.map((p) => p.value));
  host.innerHTML = points
    .map((p, i) => {
      const h = Math.max(6, Math.round((p.value / max) * 160));
      const isHi = i === points.length - 1;
      return `<div class="bar ${isHi ? 'on' : ''}" style="height:${h}px" title="${p.label}: ${p.value}"></div>`;
    })
    .join('');
  x.innerHTML = points.map((p) => `<div class="xlabel">${p.label}</div>`).join('');
}

function renderTransactions(payments) {
  const host = document.getElementById('rt-body');
  if (!host) return;

  const rows = payments
    .slice()
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 8)
    .map((p) => ({
      vehicleId: p.ref,
      importer: '—',
      fee: moneyXOF(Number(p.amount || 0)),
      stage: 'Stage 4 • Payment Verified',
      at: fmtDate(p.at),
      ok: true,
    }));

  // Fill with static-looking demo rows if needed (UI-only)
  const filler = [
    { vehicleId: 'GSP-2024-0081', importer: 'Hiba Elbakkouri', fee: moneyXOF(41000), stage: 'Stage 14 • Fee Cleared', at: fmtDate(Date.now() - 864e5 * 1), ok: true },
    { vehicleId: 'GSP-2024-0058', importer: 'Sohaib Soussi', fee: moneyXOF(0), stage: 'Stage 3 • Fee Calculated', at: fmtDate(Date.now() - 864e5 * 2), ok: false },
  ];

  const merged = rows.length ? rows : filler;

  host.innerHTML = merged
    .map(
      (r) => `
      <div class="rt-row">
        <div class="cell" data-lbl="Vehicle ID">${r.vehicleId}</div>
        <div class="cell" data-lbl="Importer">${r.importer}</div>
        <div class="cell money" data-lbl="Fee Amount">${r.fee}</div>
        <div class="cell" data-lbl="Stage Cleared">
          <span class="stage-pill ${r.ok ? '' : 'warn'}">${r.stage}</span>
        </div>
        <div class="cell mut" data-lbl="Date">${r.at}</div>
      </div>
    `
    )
    .join('');
}

function init() {
  seedMockIfEmpty();
  const payments = getAllPayments();
  renderKpis(payments);
  renderTransactions(payments);

  const weekBtn = document.getElementById('seg-week');
  const monthBtn = document.getElementById('seg-month');

  function setMode(mode) {
    const isWeek = mode === 'week';
    weekBtn?.classList.toggle('on', isWeek);
    monthBtn?.classList.toggle('on', !isWeek);
    renderChart(isWeek ? WEEKLY : MONTHLY);
  }

  weekBtn?.addEventListener('click', () => setMode('week'));
  monthBtn?.addEventListener('click', () => setMode('month'));
  setMode('week');
}

document.addEventListener('DOMContentLoaded', init);

