/** Parse dates from Perplexity / categorization (YYYY-MM-DD or ISO-ish). */
export function parseResultDate(dateStr: string): Date | null {
  if (!dateStr || dateStr === 'N/A') return null;
  const trimmed = dateStr.trim();
  const ymd = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (ymd) {
    const y = Number(ymd[1]);
    const m = Number(ymd[2]) - 1;
    const d = Number(ymd[3]);
    const dt = new Date(y, m, d);
    return Number.isNaN(dt.getTime()) ? null : dt;
  }
  const ms = Date.parse(trimmed);
  if (Number.isNaN(ms)) return null;
  return new Date(ms);
}

export function resultInDateRange(
  dateStr: string,
  from: Date | null,
  to: Date | null,
  options: { includeUnknown?: boolean } = {}
): boolean {
  const { includeUnknown = true } = options;
  if (!from && !to) return true;
  const d = parseResultDate(dateStr);
  if (!d) return includeUnknown;
  const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (from) {
    const f = new Date(from.getFullYear(), from.getMonth(), from.getDate());
    if (dayStart < f) return false;
  }
  if (to) {
    const t = new Date(to.getFullYear(), to.getMonth(), to.getDate());
    if (dayStart > t) return false;
  }
  return true;
}
