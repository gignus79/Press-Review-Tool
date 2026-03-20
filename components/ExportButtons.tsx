'use client';

import { useState } from 'react';

interface ExportButtonsProps {
  exportId: string;
}

export function ExportButtons({ exportId }: ExportButtonsProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleExport = async (format: string) => {
    setLoading(format);
    try {
      const res = await fetch(`/api/export/${exportId}/${format}`);
      if (!res.ok) throw new Error('Export failed');
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
      alert('Errore export: ' + (e instanceof Error ? e.message : 'Unknown'));
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={() => handleExport('pdf')}
        disabled={!!loading}
        className="px-6 py-3 bg-[var(--tosky-dark)] text-white font-bolder rounded-[99px] hover:bg-[var(--tosky-mid-gray)] transition-colors disabled:opacity-50 text-sm"
      >
        {loading === 'pdf' ? '...' : '📄 PDF'}
      </button>
      <button
        onClick={() => handleExport('xlsx')}
        disabled={!!loading}
        className="px-6 py-3 bg-[var(--tosky-dark)] text-white font-bolder rounded-[99px] hover:bg-[var(--tosky-mid-gray)] transition-colors disabled:opacity-50 text-sm"
      >
        {loading === 'xlsx' ? '...' : '📊 Excel'}
      </button>
      <button
        onClick={() => handleExport('json')}
        disabled={!!loading}
        className="px-6 py-3 bg-[var(--tosky-dark)] text-white font-bolder rounded-[99px] hover:bg-[var(--tosky-mid-gray)] transition-colors disabled:opacity-50 text-sm"
      >
        {loading === 'json' ? '...' : '💾 JSON'}
      </button>
      <button
        onClick={() => handleExport('csv')}
        disabled={!!loading}
        className="px-6 py-3 bg-[var(--tosky-dark)] text-white font-bolder rounded-[99px] hover:bg-[var(--tosky-mid-gray)] transition-colors disabled:opacity-50 text-sm"
      >
        {loading === 'csv' ? '...' : '📋 CSV'}
      </button>
    </div>
  );
}
