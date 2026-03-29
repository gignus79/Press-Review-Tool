const DEVELOPER_EMAIL = 'developer@toskyrecords.com';

/**
 * Invia copia del feedback a developer@toskyrecords.com (Resend).
 * Se RESEND_API_KEY non è configurata, l’operazione viene ignorata senza errore.
 */
export async function sendFeedbackEmailToDeveloper(payload: {
  message: string;
  page: string;
  clerkUserId: string;
}): Promise<void> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return;

  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    'Press Review Tool <onboarding@resend.dev>';

  const text = [
    `Pagina: ${payload.page}`,
    `Clerk user: ${payload.clerkUserId}`,
    '',
    payload.message,
  ].join('\n');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [DEVELOPER_EMAIL],
      subject: '[Press Review Tool] Nuovo feedback',
      text,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.warn('[feedback-email] Resend failed', res.status, body);
  }
}
