'use client';

import { useState } from 'react';
import { IconFilePdf, IconTable, IconBraces, IconList } from '@/components/icons';
import { useI18n } from '@/lib/i18n/context';

interface ExportButtonsProps {
  exportId: string;
}

export function ExportButtons({ exportId }: ExportButtonsProps) {
  const { t } = useI18n();
  const [loading, setLoading] = useState<string | null>(null);

  const handleExport = async (format: string) => {
    setLoading(format);
    try {
      const res = await fetch(`/api/export/${exportId}/${format}`, {
        credentials: 'include',
      });
      const ct = res.headers.get('content-type') || '';
      if (!res.ok) {
        const errText = ct.includes('application/json')
          ? (await res.json()).error
          : await res.text();
        throw new Error(typeof errText === 'string' ? errText : 'Export failed');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `review_${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (e) {
      alert(`${t.export.error}: ${e instanceof Error ? e.message : 'Unknown'}`);
    } finally {
      setLoading(null);
    }
  };

  const btn =
    'inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--tosky-dark)] text-white font-bolder rounded-[99px] hover:bg-[var(--tosky-mid-gray)] transition-colors disabled:opacity-50 text-sm dark:text-[var(--tosky-white)]';

  return (
    <div className="flex flex-wrap gap-3">
      <button type="button" onClick={() => handleExport('pdf')} disabled={!!loading} className={btn}>
        <IconFilePdf />
        {loading === 'pdf' ? t.export.loading : t.export.pdf}
      </button>
      <button type="button" onClick={() => handleExport('xlsx')} disabled={!!loading} className={btn}>
        <IconTable />
        {loading === 'xlsx' ? t.export.loading : t.export.excel}
      </button>
      <button type="button" onClick={() => handleExport('json')} disabled={!!loading} className={btn}>
        <IconBraces />
        {loading === 'json' ? t.export.loading : t.export.json}
      </button>
      <button type="button" onClick={() => handleExport('csv')} disabled={!!loading} className={btn}>
        <IconList />
        {loading === 'csv' ? t.export.loading : t.export.csv}
      </button>
    </div>
  );
}
