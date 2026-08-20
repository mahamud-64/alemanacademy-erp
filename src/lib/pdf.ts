/**
 * Tiny dependency-free PDF generator.
 * Produces a real, openable single/multi page PDF from plain text lines so that
 * every document in the Download Center can be previewed and downloaded.
 * When a backend is connected, swap these blob URLs for real file URLs.
 */

type PdfLine = { text: string; size?: number; bold?: boolean; gap?: number };

const esc = (s: string) =>
  s
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    // PDF base fonts are Latin-1; transliterate anything outside it.
    .replace(/[^\x20-\x7E]/g, "?");

export function buildPdf(title: string, lines: PdfLine[]): Blob {
  const pageHeight = 792;
  const pageWidth = 612;
  let y = pageHeight - 72;

  const parts: string[] = [];
  parts.push("BT /F2 20 Tf 60 " + y + " Td (" + esc(title) + ") Tj ET");
  y -= 14;
  parts.push(`0.06 0.32 0.20 RG 2 w 60 ${y} m ${pageWidth - 60} ${y} l S`);
  y -= 28;

  for (const line of lines) {
    if (y < 72) break;
    const size = line.size ?? 11;
    const font = line.bold ? "/F2" : "/F1";
    parts.push(`BT ${font} ${size} Tf 60 ${y} Td (${esc(line.text)}) Tj ET`);
    y -= (line.gap ?? size + 8);
  }

  const content = parts.join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>`,
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((obj, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xrefPos = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) pdf += `${String(off).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
}

export function pdfObjectUrl(title: string, lines: PdfLine[]): string {
  return URL.createObjectURL(buildPdf(title, lines));
}

export function downloadPdf(filename: string, title: string, lines: PdfLine[]) {
  const url = pdfObjectUrl(title, lines);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function printPage() {
  window.print();
}
