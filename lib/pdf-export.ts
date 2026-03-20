import { jsPDF } from 'jspdf';

interface ExportData {
  query: { artist?: string; album?: string };
  results: Array<{
    title?: string;
    url?: string;
    description?: string;
    date?: string;
    relevance?: string;
    content_type?: string;
    source?: string;
  }>;
}

export async function simplePdf(data: ExportData): Promise<Buffer> {
  const doc = new jsPDF({ orientation: 'landscape' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;

  doc.setFontSize(20);
  doc.text('Press Review Report', pageWidth / 2, y, { align: 'center' });
  y += 15;

  doc.setFontSize(12);
  const query = data.query;
  let info = `Generated: ${new Date().toLocaleString()}`;
  if (query.artist) info += ` | Artist: ${query.artist}`;
  if (query.album) info += ` | Album: ${query.album}`;
  info += ` | Results: ${data.results.length}`;
  doc.text(info, margin, y);
  y += 15;

  doc.setFontSize(10);
  for (const r of data.results) {
    if (y > 180) {
      doc.addPage('landscape');
      y = 20;
    }
    doc.setFont('helvetica', 'bold');
    doc.text((r.title || '').slice(0, 80), margin, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.text(`${r.source || ''} | ${r.date || ''} | ${r.content_type || ''}`, margin, y);
    y += 5;
    doc.text((r.description || '').slice(0, 120) + '...', margin, y);
    y += 6;
    doc.setTextColor(0, 119, 132);
    doc.text((r.url || '').slice(0, 80), margin, y);
    doc.setTextColor(0, 0, 0);
    y += 10;
  }

  doc.setFontSize(8);
  doc.text('Powered by Tosky Records® - Press Review Tool', pageWidth / 2, 195, {
    align: 'center',
  });

  return Buffer.from(doc.output('arraybuffer'));
}
