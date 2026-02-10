import JSZip from 'jszip';

interface GenerateEPUBMessage {
  type: 'generate-epub';
  html: string;
  manifest?: { title?: string; author?: string; language?: string };
}

self.addEventListener('message', async (e: MessageEvent<GenerateEPUBMessage>) => {
  const msg = e.data;
  if (msg.type === 'generate-epub') {
    try {
      const zip = new JSZip();
      // According to EPUB spec, the first file must be 'mimetype' with no compression
      zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' as any });

      // META-INF/container.xml
      zip.file('META-INF/container.xml', `<?xml version="1.0"?>\n<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">\n  <rootfiles>\n    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>\n  </rootfiles>\n</container>`);

      // OEBPS/content.opf (very minimal)
      const id = 'bookid';
      const title = msg.manifest?.title || 'Untitled';
      const author = msg.manifest?.author || 'Unknown';
      const language = msg.manifest?.language || 'en';

      const contentOpf = `<?xml version="1.0" encoding="utf-8"?>\n<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid" version="2.0">\n  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">\n    <dc:title>${escapeXml(title)}</dc:title>\n    <dc:creator>${escapeXml(author)}</dc:creator>\n    <dc:language>${escapeXml(language)}</dc:language>\n    <dc:identifier id="bookid">${id}</dc:identifier>\n  </metadata>\n  <manifest>\n    <item id="chapter1" href="chapter1.xhtml" media-type="application/xhtml+xml"/>\n  </manifest>\n  <spine toc="ncx">\n    <itemref idref="chapter1"/>\n  </spine>\n</package>`;

      zip.file('OEBPS/content.opf', contentOpf);

      // Add the HTML as chapter1.xhtml (wrapped as minimal xhtml)
      const xhtml = `<?xml version="1.0" encoding="utf-8"?>\n<!DOCTYPE html>\n<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="${escapeXml(language)}">\n<head><title>${escapeXml(title)}</title><meta charset="utf-8"/></head>\n<body>${msg.html}</body>\n</html>`;
      zip.file('OEBPS/chapter1.xhtml', xhtml);

      const uint8 = await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' }, (meta) => {
        // send progress updates
        (self as any).postMessage({ progress: Math.round((meta.percent || 0)) });
      });

      (self as any).postMessage({ success: true, data: uint8, filename: `${(title || 'book').replace(/\s+/g, '_')}.epub` });
    } catch (err) {
      (self as any).postMessage({ success: false, error: String(err) });
    }
  }
});

function escapeXml(s: string) {
  return (s || '').replace(/[<>&\"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\"': return '&quot;';
      default: return c;
    }
  });
}
