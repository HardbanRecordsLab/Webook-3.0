"""EPUB Generator for Webook projects"""
import zipfile
import io
from datetime import datetime
from pathlib import Path
from html.parser import HTMLParser


class HTMLToXHTMLConverter(HTMLParser):
    """Convert HTML to XHTML"""
    def __init__(self):
        super().__init__()
        self.output = []
        self.tag_stack = []

    def handle_starttag(self, tag, attrs):
        if tag in ['br', 'img', 'input', 'hr']:
            self.output.append(f"<{tag} {' '.join(f'{k}=\'{v}\'' for k, v in attrs)} />")
        else:
            self.output.append(f"<{tag} {' '.join(f'{k}=\'{v}\'' for k, v in attrs)}>")
            self.tag_stack.append(tag)

    def handle_endtag(self, tag):
        if self.tag_stack and self.tag_stack[-1] == tag:
            self.tag_stack.pop()
            self.output.append(f"</{tag}>")

    def handle_data(self, data):
        self.output.append(data)

    def get_xhtml(self):
        return ''.join(self.output)


class EPUBGenerator:
    """Generate EPUB files from Webook projects"""

    MIMETYPE = b"application/epub+zip"
    CONTAINER_XML = """<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>
"""

    def __init__(self, project, chapters, author="Author"):
        self.project = project
        self.chapters = chapters
        self.author = author
        self.epub_buffer = io.BytesIO()
        self.chapter_files = []

    def generate(self):
        """Generate EPUB file and return bytes"""
        with zipfile.ZipFile(self.epub_buffer, 'w', zipfile.ZIP_DEFLATED) as epub:
            # Add mimetype (must be uncompressed and first)
            epub.writestr('mimetype', self.MIMETYPE, compress_type=zipfile.ZIP_STORED)

            # Add META-INF/container.xml
            epub.writestr('META-INF/container.xml', self.CONTAINER_XML)

            # Add OEBPS/content.opf
            epub.writestr('OEBPS/content.opf', self._generate_opf())

            # Add OEBPS/toc.ncx
            epub.writestr('OEBPS/toc.ncx', self._generate_ncx())

            # Add chapter files
            for i, chapter in enumerate(self.chapters):
                chapter_xhtml = self._generate_chapter_xhtml(chapter)
                filename = f'OEBPS/chapter_{i:03d}.xhtml'
                epub.writestr(filename, chapter_xhtml)
                self.chapter_files.append(filename)

            # Add CSS
            epub.writestr('OEBPS/style.css', self._generate_css())

        self.epub_buffer.seek(0)
        return self.epub_buffer.getvalue()

    def _generate_opf(self):
        """Generate OPF (package) file"""
        manifest_items = '\n'.join(
            f'<item id="chapter_{i:03d}" href="chapter_{i:03d}.xhtml" media-type="application/xhtml+xml"/>'
            for i in range(len(self.chapters))
        )
        manifest_items += '\n<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>'
        manifest_items += '\n<item id="style" href="style.css" media-type="text/css"/>'

        spine_items = '\n'.join(
            f'<itemref idref="chapter_{i:03d}"/>'
            for i in range(len(self.chapters))
        )

        toc_items = '\n'.join(
            f'<navPoint id="chapter_{i:03d}" playOrder="{i+1}">
      <navLabel><text>{self.chapters[i].get("title", f"Chapter {i+1}")}</text></navLabel>
      <content src="chapter_{i:03d}.xhtml"/>
    </navPoint>'
            for i in range(len(self.chapters))
        )

        return f"""<?xml version="1.0" encoding="UTF-8"?>
<package unique-identifier="uuid_id" version="2.0"
    xmlns="http://www.idpf.org/2007/opf">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>{self.project.get('title', 'Untitled')}</dc:title>
    <dc:creator>{self.author}</dc:creator>
    <dc:description>{self.project.get('description', '')}</dc:description>
    <dc:date>{datetime.now().isoformat()}</dc:date>
    <dc:language>en</dc:language>
    <dc:identifier id="uuid_id">urn:uuid:{self.project.get('id', 'unknown')}</dc:identifier>
  </metadata>
  <manifest>
    {manifest_items}
  </manifest>
  <spine toc="ncx">
    {spine_items}
  </spine>
</package>
"""

    def _generate_ncx(self):
        """Generate NCX (navigation) file"""
        nav_points = '\n'.join(
            f'<navPoint id="chapter_{i:03d}" playOrder="{i+1}">
      <navLabel><text>{self.chapters[i].get("title", f"Chapter {i+1}")}</text></navLabel>
      <content src="chapter_{i:03d}.xhtml"/>
    </navPoint>'
            for i in range(len(self.chapters))
        )

        return f"""<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="urn:uuid:{self.project.get('id', 'unknown')}"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle>
    <text>{self.project.get('title', 'Untitled')}</text>
  </docTitle>
  <navMap>
    {nav_points}
  </navMap>
</ncx>
"""

    def _generate_chapter_xhtml(self, chapter):
        """Generate XHTML for a chapter"""
        content = chapter.get('content', '<p>Empty chapter</p>')

        # Convert HTML to XHTML
        converter = HTMLToXHTMLConverter()
        try:
            converter.feed(content)
            xhtml_content = converter.get_xhtml()
        except:
            xhtml_content = content

        return f"""<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en">
  <head>
    <meta charset="utf-8"/>
    <title>{chapter.get('title', 'Chapter')}</title>
    <link rel="stylesheet" type="text/css" href="style.css"/>
  </head>
  <body>
    <h1>{chapter.get('title', 'Chapter')}</h1>
    {xhtml_content}
  </body>
</html>
"""

    def _generate_css(self):
        """Generate CSS for EPUB"""
        return """
@namespace url(http://www.w3.org/1999/xhtml);

body {
    font-family: Georgia, serif;
    font-size: 1em;
    line-height: 1.6;
    margin: 0;
    padding: 1em;
}

h1, h2, h3, h4, h5, h6 {
    font-family: Georgia, serif;
    font-weight: bold;
    line-height: 1.3;
    margin-top: 1em;
    margin-bottom: 0.3em;
}

p {
    margin-bottom: 0.8em;
    text-align: justify;
}

strong, b {
    font-weight: bold;
}

em, i {
    font-style: italic;
}

blockquote {
    margin-left: 1.5em;
    margin-right: 1.5em;
    padding-left: 1em;
    border-left: 3px solid #ccc;
    font-style: italic;
}

pre, code {
    font-family: 'Courier New', monospace;
    background-color: #f4f4f4;
    padding: 0.5em;
    border-radius: 3px;
}

ul, ol {
    margin-bottom: 0.8em;
}

li {
    margin-bottom: 0.4em;
}

img {
    max-width: 100%;
    height: auto;
}

a {
    color: #0066cc;
    text-decoration: none;
}

a:hover {
    text-decoration: underline;
}
"""
