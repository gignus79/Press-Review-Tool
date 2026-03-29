/**
 * Markup condiviso tra `opengraph-image` e `twitter-image` (next/og).
 */
export function OgBrandImageMarkup() {
  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        backgroundColor: '#0b0f18',
        backgroundImage:
          'linear-gradient(145deg, #0b0f18 0%, #111827 42%, #0f172a 100%)',
        padding: 72,
      }}
    >
      <div
        style={{
          fontSize: 64,
          fontWeight: 700,
          color: '#f8fafc',
          letterSpacing: '-0.03em',
          lineHeight: 1.05,
        }}
      >
        Press Review Tool
      </div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 600,
          color: '#94a3b8',
          marginTop: 20,
          letterSpacing: '0.02em',
        }}
      >
        LabelTools
      </div>
      <div
        style={{
          fontSize: 22,
          color: '#64748b',
          marginTop: 12,
          maxWidth: 900,
          lineHeight: 1.35,
        }}
      >
        Music press intelligence — search, AI classification, exports for labels & artists
      </div>
    </div>
  );
}
