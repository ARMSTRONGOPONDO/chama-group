export function formatCurrency(amount, currency = 'KSh') {
  if (amount == null || isNaN(amount)) return `${currency} 0`;
  return `${currency} ${Number(amount).toLocaleString()}`;
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
