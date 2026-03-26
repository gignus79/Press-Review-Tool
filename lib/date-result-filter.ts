/** Parse dates from Perplexity / categorization (YYYY-MM-DD anywhere, DD/MM/YYYY, ISO). */
export function parseResultDate(dateStr: string): Date | null {
  if (!dateStr || dateStr === 'N/A') return null;
  const trimmed = dateStr.trim();

  const fromYmd = (y: number, m0: number, d: number): Date | null => {
    const dt = new Date(y, m0, d);
    return Number.isNaN(dt.getTime()) ? null : dt;
  };

  // YYYY-MM-DD at start or embedded (e.g. "Debaser | 2025-04-25 | IT")
  const ymdAnywhere = trimmed.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (ymdAnywhere) {
    const y = Number(ymdAnywhere[1]);
    const m = Number(ymdAnywhere[2]) - 1;
    const d = Number(ymdAnywhere[3]);
    return fromYmd(y, m, d);
  }

  // DD/MM/YYYY or DD-MM-YYYY (European)
  const dmy = trimmed.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  if (dmy) {
    const d = Number(dmy[1]);
    const m = Number(dmy[2]) - 1;
    const y = Number(dmy[3]);
    return fromYmd(y, m, d);
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
