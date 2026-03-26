import { jsPDF } from 'jspdf';

/** PDF export palette (RGB 0–255) */
const BRAND = {
  red: [237, 53, 58] as const,
  teal: [0, 119, 132] as const,
  dark: [51, 51, 51] as const,
  muted: [102, 102, 102] as const,
  line: [221, 221, 221] as const,
  paper: [255, 255, 255] as const,
  band: [245, 245, 240] as const,
};

interface ExportData {
  query: { artist?: string; album?: string; language?: string };
  results: Array<{
    title?: string;
    url?: string;
    description?: string;
    date?: string;
    relevance?: string;
    content_type?: string;
    source?: string;
    language?: string;
  }>;
}

function measureResultBlock(doc: jsPDF, r: ExportData['results'][0], innerW: number): number {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  const titleH = doc.splitTextToSize((r.title || '—').trim() || '—', innerW).length * 5.2;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const meta = [r.source, r.date, r.content_type, r.relevance].filter(Boolean).join('  ·  ');
  const metaH = meta ? doc.splitTextToSize(meta, innerW).length * 4.2 : 0;

  doc.setFontSize(8.5);
  const desc = (r.description || '').trim();
  const descH = desc ? doc.splitTextToSize(desc, innerW).length * 4.2 : 0;

  doc.setFontSize(8);
  const urlH = r.url ? doc.splitTextToSize(r.url, innerW).length * 4.3 : 0;

  return 6 + titleH + (metaH ? metaH + 2 : 0) + (descH ? descH + 3 : 0) + (urlH ? urlH + 3 : 0) + 8;
}

export async function simplePdf(data: ExportData): Promise<Buffer> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentW = pageW - margin * 2;
  const innerW = contentW - 6;
  const footerH = 12;
  const maxY = pageH - margin - footerH;

  const drawPageHeader = (firstPage: boolean): number => {
    doc.setFillColor(...BRAND.red);
    doc.rect(0, 0, pageW, firstPage ? 32 : 14, 'F');
    doc.setTextColor(...BRAND.paper);
    doc.setFont('helvetica', 'bold');
    if (firstPage) {
      doc.setFontSize(17);
      doc.text('Press Review Tool', margin, 14);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text('LabelTools', margin, 22);
    } else {
      doc.setFontSize(9);
      doc.text('Press Review Tool · LabelTools', margin, 10);
    }
    doc.setTextColor(...BRAND.dark);
    return firstPage ? 40 : 22;
  };

  const drawFooters = () => {
    const total = doc.getNumberOfPages();
    for (let p = 1; p <= total; p++) {
      doc.setPage(p);
      doc.setFontSize(7.5);
      doc.setTextColor(...BRAND.muted);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generato il ${new Date().toLocaleString('it-IT')} · LabelTools`, margin, pageH - 8);
      doc.text(`Pag. ${p} / ${total}`, pageW - margin, pageH - 8, { align: 'right' });
      doc.setDrawColor(...BRAND.line);
      doc.setLineWidth(0.2);
      doc.line(margin, pageH - 10, pageW - margin, pageH - 10);
      doc.setTextColor(...BRAND.dark);
    }
  };

  let y = drawPageHeader(true);

  doc.setFillColor(...BRAND.band);
  doc.roundedRect(margin, y, contentW, 22, 2, 2, 'F');
  doc.setDrawColor(...BRAND.line);
  doc.roundedRect(margin, y, contentW, 22, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.dark);
  const q = data.query;
  const subtitle = [q.artist && `Artista: ${q.artist}`, q.album && `Album: ${q.album}`]
    .filter(Boolean)
    .join(' · ');
  doc.text(subtitle || 'Rassegna stampa', margin + 4, y + 9);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...BRAND.muted);
  doc.text(`${data.results.length} risultati`, margin + 4, y + 16);
  y += 30;

  for (const r of data.results) {
    const need = measureResultBlock(doc, r, innerW);
    if (y + need > maxY) {
      doc.addPage();
      y = drawPageHeader(false);
    }

    doc.setDrawColor(...BRAND.teal);
    doc.setLineWidth(0.4);
    doc.line(margin, y, margin + 12, y);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.dark);
    const titleLines = doc.splitTextToSize((r.title || 'Senza titolo').trim(), innerW);
    doc.text(titleLines, margin + 3, y + 5);
    y += 5 + titleLines.length * 5.2;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...BRAND.muted);
    const meta = [r.source, r.date, r.content_type, r.relevance].filter(Boolean).join('  ·  ');
    if (meta) {
      const metaLines = doc.splitTextToSize(meta, innerW);
      doc.text(metaLines, margin + 3, y + 2);
      y += metaLines.length * 4.2 + 2;
    }

    const desc = (r.description || '').trim();
    if (desc) {
      doc.setTextColor(...BRAND.dark);
      doc.setFontSize(8.5);
      const descLines = doc.splitTextToSize(desc, innerW);
      doc.text(descLines, margin + 3, y + 2);
      y += descLines.length * 4.2 + 3;
    }

    if (r.url) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...BRAND.teal);
      const urlLines = doc.splitTextToSize(r.url, innerW);
      let linkY = y + 2;
      for (const line of urlLines) {
        doc.textWithLink(line, margin + 3, linkY, { url: r.url });
        linkY += 4.3;
      }
      y = linkY + 2;
    }

    y += 6;
  }

  drawFooters();

  return Buffer.from(doc.output('arraybuffer'));
}
