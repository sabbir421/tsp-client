/** Stable number formatting for SSR/client hydration (always en-US). */
export function formatNumber(value) {
  const num = Number(value);
  if (!value || Number.isNaN(num)) return '—';
  return num.toLocaleString('en-US');
}

export function formatSqFt(value) {
  const formatted = formatNumber(value);
  return formatted === '—' ? '—' : `${formatted} sft`;
}
