import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

interface GeneratePDFMessage {
  type: 'generate-pdf';
  html: string;
  title?: string;
}

self.addEventListener('message', async (e: MessageEvent<GeneratePDFMessage>) => {
  const msg = e.data;
  if (msg.type === 'generate-pdf') {
    try {
      // Basic HTML -> plain text extraction (worker can't access DOM)
      const text = msg.html.replace(/<[^>]+>/g, '\n').replace(/\s{2,}/g, ' ').trim();

      const doc = await PDFDocument.create();
      const page = doc.addPage();
      const { width, height } = page.getSize();
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const fontSize = 11;
      const margin = 40;
      const maxWidth = width - margin * 2;

      const lines = wrapTextToLines(text, fontSize, font, maxWidth);

      let cursorY = height - margin;
      for (const line of lines) {
        if (cursorY < margin) {
          // new page
          cursorY = height - margin;
          const p = doc.addPage();
          const newPage = p;
          newPage.drawText(line, { x: margin, y: cursorY, size: fontSize, font, color: rgb(0, 0, 0) });
          cursorY -= fontSize * 1.5;
        } else {
          page.drawText(line, { x: margin, y: cursorY, size: fontSize, font, color: rgb(0, 0, 0) });
          cursorY -= fontSize * 1.5;
        }
      }

      const bytes = await doc.save();

      (self as any).postMessage({ success: true, data: bytes, filename: `${(msg.title || 'document').replace(/\s+/g, '_')}.pdf` });
    } catch (err) {
      (self as any).postMessage({ success: false, error: String(err) });
    }
  }
});

function wrapTextToLines(text: string, fontSize: number, font: any, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const w of words) {
    const test = (current ? current + ' ' : '') + w;
    const width = font.widthOfTextAtSize(test, fontSize);
    if (width > maxWidth) {
      if (current) lines.push(current);
      current = w;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}
