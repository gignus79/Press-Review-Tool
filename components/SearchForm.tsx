'use client';

import { useState } from 'react';

interface SearchFormProps {
  onSearch: (params: {
    artist?: string;
    album?: string;
    language: string;
    max_results: number;
    content_filter: string;
  }) => Promise<void>;
  loading: boolean;
}

export function SearchForm({ onSearch, loading }: SearchFormProps) {
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [language, setLanguage] = useState('en');
  const [depth, setDepth] = useState(50);
  const [filter, setFilter] = useState('All');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artist.trim() && !album.trim()) {
      alert('Inserisci almeno artista o album');
      return;
    }
    await onSearch({
      artist: artist.trim() || undefined,
      album: album.trim() || undefined,
      language,
      max_results: depth,
      content_filter: filter,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.1)] border border-[var(--tosky-border)] mb-8"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-[var(--tosky-dark)] mb-2 uppercase tracking-wide">
            Artista
          </label>
          <input
            type="text"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="es. Pink Floyd"
            className="w-full px-4 py-3 border border-[var(--tosky-border)] rounded-[4px] text-[var(--tosky-dark)] focus:outline-none focus:border-[var(--tosky-primary)]"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[var(--tosky-dark)] mb-2 uppercase tracking-wide">
            Album / EP / Single
          </label>
          <input
            type="text"
            value={album}
            onChange={(e) => setAlbum(e.target.value)}
            placeholder="es. The Wall"
            className="w-full px-4 py-3 border border-[var(--tosky-border)] rounded-[4px] text-[var(--tosky-dark)] focus:outline-none focus:border-[var(--tosky-primary)]"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[var(--tosky-dark)] mb-2 uppercase tracking-wide">
              Lingua
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-3 border border-[var(--tosky-border)] rounded-[4px] text-[var(--tosky-dark)] focus:outline-none focus:border-[var(--tosky-primary)]"
            >
              <option value="en">English</option>
              <option value="it">Italiano</option>
              <option value="multi">Multilingue</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--tosky-dark)] mb-2 uppercase tracking-wide">
              Profondità
            </label>
            <select
              value={depth}
              onChange={(e) => setDepth(Number(e.target.value))}
              className="w-full px-4 py-3 border border-[var(--tosky-border)] rounded-[4px] text-[var(--tosky-dark)] focus:outline-none focus:border-[var(--tosky-primary)]"
            >
              <option value={30}>Veloce (30)</option>
              <option value={50}>Standard (50)</option>
              <option value={100}>Approfondita (100)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--tosky-dark)] mb-2 uppercase tracking-wide">
              Focus
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-4 py-3 border border-[var(--tosky-border)] rounded-[4px] text-[var(--tosky-dark)] focus:outline-none focus:border-[var(--tosky-primary)]"
            >
              <option value="All">Tutti</option>
              <option value="Reviews Only">Solo recensioni</option>
              <option value="Interviews Only">Solo interviste</option>
              <option value="News & Articles">News e articoli</option>
            </select>
          </div>
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full py-4 bg-[var(--tosky-dark)] text-white font-bolder rounded-[99px] hover:bg-[var(--tosky-mid-gray)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Ricerca in corso...' : 'Avvia ricerca'}
      </button>
    </form>
  );
}
