/**
 * Client-side result text filter: fold accents, search URL, AND across whitespace tokens.
 */

export function foldForTextFilter(s: string): string {
  return s
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase();
}

export function matchesResultTextFilter(
  row: { title: string; description: string; source: string; url: string },
  rawQuery: string
): boolean {
  const trimmed = rawQuery.trim();
  if (!trimmed) return true;

  const hay = foldForTextFilter(
    `${row.title} ${row.description} ${row.source} ${row.url}`
  );

  const tokens = trimmed
    .split(/\s+/)
    .map(foldForTextFilter)
    .filter(Boolean);

  return tokens.every((tok) => hay.includes(tok));
}
