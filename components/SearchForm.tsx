'use client';

import { useState, useCallback } from 'react';
import { useI18n } from '@/lib/i18n/context';

export type PeriodPreset = 'any' | '30d' | '90d' | '365d' | 'custom';

interface SearchFormProps {
  initialArtist?: string;
  initialAlbum?: string;
  onSearch: (params: {
    artist?: string;
    album?: string;
    language: string;
    max_results: number;
    content_filter: string;
    date_from?: string;
    date_to?: string;
  }) => Promise<void>;
  loading: boolean;
}

export function SearchForm({
  initialArtist = '',
  initialAlbum = '',
  onSearch,
  loading,
}: SearchFormProps) {
  const { t } = useI18n();
  const [artist, setArtist] = useState(initialArtist);
  const [album, setAlbum] = useState(initialAlbum);
  const [language, setLanguage] = useState('en');
  const [depth, setDepth] = useState(12);
  const [filter, setFilter] = useState('All');
  const [period, setPeriod] = useState<PeriodPreset>('any');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const computeDateRange = useCallback((): { date_from?: string; date_to?: string } => {
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    const today = new Date();
    if (period === 'any') return {};
    if (period === 'custom') {
      const o: { date_from?: string; date_to?: string } = {};
      if (customFrom.trim()) o.date_from = customFrom.trim();
      if (customTo.trim()) o.date_to = customTo.trim();
      return o;
    }
    const days = period === '30d' ? 30 : period === '90d' ? 90 : 365;
    const from = new Date(today);
    from.setDate(from.getDate() - days);
    return { date_from: fmt(from), date_to: fmt(today) };
  }, [period, customFrom, customTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artist.trim() && !album.trim()) {
      alert(t.search.needArtist);
      return;
    }
    await onSearch({
      artist: artist.trim() || undefined,
      album: album.trim() || undefined,
      language,
      max_results: depth,
      content_filter: filter,
      ...computeDateRange(),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[var(--tosky-card)] p-6 rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.1)] border border-[var(--tosky-card-border)] mb-8"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-[var(--tosky-dark)] mb-2 uppercase tracking-wide">
            {t.search.artist}
          </label>
          <input
            type="text"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            className="w-full px-4 py-3 border border-[var(--tosky-border)] rounded-[4px] bg-[var(--tosky-white)] text-[var(--tosky-dark)] focus:outline-none focus:border-[var(--tosky-primary)]"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[var(--tosky-dark)] mb-2 uppercase tracking-wide">
            {t.search.album}
          </label>
          <input
            type="text"
            value={album}
            onChange={(e) => setAlbum(e.target.value)}
            className="w-full px-4 py-3 border border-[var(--tosky-border)] rounded-[4px] bg-[var(--tosky-white)] text-[var(--tosky-dark)] focus:outline-none focus:border-[var(--tosky-primary)]"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[var(--tosky-dark)] mb-2 uppercase tracking-wide">
              {t.search.guiLang}
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-3 border border-[var(--tosky-border)] rounded-[4px] bg-[var(--tosky-white)] text-[var(--tosky-dark)] focus:outline-none focus:border-[var(--tosky-primary)]"
            >
              <option value="en">{t.search.langEn}</option>
              <option value="it">{t.search.langIt}</option>
              <option value="es">{t.search.langEs}</option>
              <option value="fr">{t.search.langFr}</option>
              <option value="multi">{t.search.multi}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--tosky-dark)] mb-2 uppercase tracking-wide">
              {t.search.depth}
            </label>
            <select
              value={depth}
              onChange={(e) => setDepth(Number(e.target.value))}
              className="w-full px-4 py-3 border border-[var(--tosky-border)] rounded-[4px] bg-[var(--tosky-white)] text-[var(--tosky-dark)] focus:outline-none focus:border-[var(--tosky-primary)]"
            >
              <option value={8}>{t.search.depthFast}</option>
              <option value={12}>{t.search.depthStd}</option>
              <option value={15}>{t.search.depthDeep}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--tosky-dark)] mb-2 uppercase tracking-wide">
              {t.search.focus}
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-4 py-3 border border-[var(--tosky-border)] rounded-[4px] bg-[var(--tosky-white)] text-[var(--tosky-dark)] focus:outline-none focus:border-[var(--tosky-primary)]"
            >
              <option value="All">{t.search.filterAll}</option>
              <option value="Reviews Only">{t.search.filterReviews}</option>
              <option value="Interviews Only">{t.search.filterInterviews}</option>
              <option value="News & Articles">{t.search.filterNews}</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="block text-sm font-semibold text-[var(--tosky-dark)] mb-2 uppercase tracking-wide">
              {t.search.period}
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as PeriodPreset)}
              className="w-full px-4 py-3 border border-[var(--tosky-border)] rounded-[4px] bg-[var(--tosky-white)] text-[var(--tosky-dark)] focus:outline-none focus:border-[var(--tosky-primary)]"
            >
              <option value="any">{t.search.periodAny}</option>
              <option value="30d">{t.search.period30d}</option>
              <option value="90d">{t.search.period90d}</option>
              <option value="365d">{t.search.period365d}</option>
              <option value="custom">{t.search.periodCustom}</option>
            </select>
          </div>
          {period === 'custom' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-[var(--tosky-dark)] mb-2 uppercase tracking-wide">
                  {t.search.dateFrom}
                </label>
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="w-full px-4 py-3 border border-[var(--tosky-border)] rounded-[4px] bg-[var(--tosky-white)] text-[var(--tosky-dark)] focus:outline-none focus:border-[var(--tosky-primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--tosky-dark)] mb-2 uppercase tracking-wide">
                  {t.search.dateTo}
                </label>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="w-full px-4 py-3 border border-[var(--tosky-border)] rounded-[4px] bg-[var(--tosky-white)] text-[var(--tosky-dark)] focus:outline-none focus:border-[var(--tosky-primary)]"
                />
              </div>
            </>
          )}
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full py-4 bg-[var(--tosky-dark)] text-white font-bolder rounded-[99px] hover:bg-[var(--tosky-mid-gray)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:text-[var(--tosky-white)]"
      >
        {loading ? t.search.searching : t.search.submit}
      </button>
    </form>
  );
}
