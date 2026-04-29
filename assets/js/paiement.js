function qs() {
  return new URLSearchParams(window.location.search);
}

function el(id) {
  return document.getElementById(id);
}

function nowISO() {
  return new Date().toISOString();
}

function init() {
  const ref = qs().get('ref') || 'NOUVEAU';
  const amount = qs().get('amount') || '';

  el('p-ref').value = ref;
  el('p-amount').value = amount;
  el('p-sub').textContent = `${ref} • ${new Date().toLocaleDateString('fr-FR')}`;

  // Étape 4 (Paiement) => index 3
  el('btn-cancel').href = `./dossier.html${ref && ref !== 'NOUVEAU' ? `?ref=${encodeURIComponent(ref)}&step=3` : ''}`;

  el('btn-pay').addEventListener('click', () => {
    el('p-ok').textContent = '';
    el('p-err').textContent = '';

    const amt = String(el('p-amount').value || '').trim();
    const method = String(el('p-method').value || '').trim();
    const payref = String(el('p-payref').value || '').trim();

    if (!amt) {
      el('p-err').textContent = 'Veuillez renseigner le montant.';
      return;
    }

    const payload = {
      ref,
      amount: amt,
      method,
      payref: payref || `${method}-${Math.random().toString(16).slice(2, 8).toUpperCase()}`,
      status: 'paid',
      at: nowISO(),
    };

    try {
      localStorage.setItem(`pay:${ref}`, JSON.stringify(payload));
    } catch {
      // ignore
    }

    el('p-ok').textContent = `Paiement enregistré (${payload.payref}). Retour au dossier...`;
    setTimeout(() => {
      const back = `./dossier.html${ref && ref !== 'NOUVEAU' ? `?ref=${encodeURIComponent(ref)}&step=3&paid=1` : '?step=3&paid=1'}`;
      window.location.href = back;
    }, 650);
  });
}

document.addEventListener('DOMContentLoaded', init);

