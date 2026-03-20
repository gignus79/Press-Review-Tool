'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { IconMail } from '@/components/icons';

function slugPart(s: string | undefined): string {
  if (!s) return 'export';
  return s
    .slice(0, 40)
    .replace(/[^\w\d]+/g, '-')
    .replace(/^-|-$/g, '') || 'export';
}

function fillExportTemplate(
  template: string,
  vars: { count: string; artist: string; album: string }
): string {
  return template
    .replace(/\{count\}/g, vars.count)
    .replace(/\{artist\}/g, vars.artist)
    .replace(/\{album\}/g, vars.album);
}

export function EmailPdfButton({
  exportId,
  artist,
  album,
  resultCount,
}: {
  exportId: string;
  artist?: string;
  album?: string;
  resultCount: number;
}) {
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);

  const openMailWithPdf = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/export/${exportId}/pdf`, { credentials: 'include' });
      const ct = res.headers.get('content-type') || '';
      if (!res.ok) {
        const errText = ct.includes('application/json')
          ? ((await res.json()) as { error?: string }).error
          : await res.text();
        throw new Error(typeof errText === 'string' ? errText : t.export.error);
      }
      const blob = await res.blob();
      const base = slugPart(artist) + (album ? `-${slugPart(album)}` : '');
      const filename = `press-review-${base}.pdf`;
      const file = new File([blob], filename, { type: 'application/pdf' });

      if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: t.export.emailSubject,
          text: fillExportTemplate(t.export.emailBody, {
            count: String(resultCount),
            artist: artist || '—',
            album: album || '—',
          }),
        });
        return;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      const subject = encodeURIComponent(t.export.emailSubject);
      const body = encodeURIComponent(
        fillExportTemplate(t.export.emailBody, {
          count: String(resultCount),
          artist: artist || '—',
          album: album || '—',
        })
      );
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    } catch (e) {
      alert(`${t.export.error}: ${e instanceof Error ? e.message : 'Unknown'}`);
    } finally {
      setBusy(false);
    }
  };

  const btn =
    'inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-[var(--tosky-secondary)] text-[var(--tosky-secondary)] font-bolder rounded-[99px] hover:bg-[var(--tosky-secondary)] hover:text-white transition-colors disabled:opacity-50 text-sm';

  return (
    <button type="button" onClick={() => void openMailWithPdf()} disabled={busy} className={btn}>
      <IconMail />
      {busy ? t.export.emailPdfBusy : t.export.emailPdf}
    </button>
  );
}
