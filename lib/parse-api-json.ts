/**
 * Legge il body di una Response come JSON. Se il server risponde con HTML
 * (errore edge, timeout, redirect/login), evita JSON.parse e segnala esplicitamente.
 */
export async function parseJsonFromResponse(
  res: Response
): Promise<
  | { ok: true; data: unknown }
  | { ok: false; status: number; notJson: true }
> {
  const text = await res.text();
  const trimmed = text.trim();
  if (!trimmed) {
    return { ok: false, status: res.status, notJson: true };
  }
  const lower = trimmed.slice(0, 64).toLowerCase();
  if (
    lower.startsWith('<!doctype') ||
    lower.startsWith('<html') ||
    trimmed.startsWith('<!DOCTYPE') ||
    trimmed.startsWith('<HTML')
  ) {
    return { ok: false, status: res.status, notJson: true };
  }
  if (trimmed.startsWith('<')) {
    return { ok: false, status: res.status, notJson: true };
  }
  try {
    return { ok: true, data: JSON.parse(text) };
  } catch {
    return { ok: false, status: res.status, notJson: true };
  }
}
