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

export function formatPostedAgo(date) {
  if (!date) return '';
  const ms = Date.now() - new Date(date).getTime();
  if (Number.isNaN(ms) || ms < 0) return '';
  const minutes = Math.floor(ms / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Date(date).toLocaleDateString('en-US');
}

export function formatTaka(priceDisplay) {
  if (!priceDisplay) return '—';
  const text = String(priceDisplay);
  return text.includes('৳') ? text : `৳ ${text}`;
}

const BACHELOR_RE = /bachelor|seat|mess|single room|hostel/i;

export function isBachelorListing(item) {
  const haystack = [
    item?.propertyType,
    item?.subType,
    item?.title,
    item?.residentialNotes,
    item?.purpose,
  ]
    .filter(Boolean)
    .join(' ');
  return BACHELOR_RE.test(haystack);
}
