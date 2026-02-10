"""PDF Generator for Webook projects"""
import io
from datetime import datetime
from html.parser import HTMLParser


class PDFGenerator:
    """Generate PDF files from Webook projects using ReportLab"""

    def __init__(self, project, chapters, author="Author"):
        self.project = project
        self.chapters = chapters
        self.author = author
        self.pdf_buffer = io.BytesIO()

    def generate(self):
        """Generate PDF file and return bytes"""
        # Import here to avoid dependency if not used
        try:
            from reportlab.lib.pagesizes import letter, A4
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
            from reportlab.lib.units import inch
            from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
            from reportlab.lib import colors
            from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
        except ImportError:
            raise RuntimeError("reportlab not installed. Install with: pip install reportlab")

        # Create PDF document
        doc = SimpleDocTemplate(
            self.pdf_buffer,
            pagesize=A4,
            rightMargin=0.75*inch,
            leftMargin=0.75*inch,
            topMargin=1*inch,
            bottomMargin=0.75*inch
        )

        # Container for the 'Flowable' objects
        elements = []

        # Get styles
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=28,
            textColor=self._hex_to_rgb(self.project.get('settings', {}).get('primary_color', '#8B5CF6')),
            spaceAfter=30,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        )

        chapter_style = ParagraphStyle(
            'ChapterTitle',
            parent=styles['Heading2'],
            fontSize=16,
            textColor=self._hex_to_rgb(self.project.get('settings', {}).get('primary_color', '#8B5CF6')),
            spaceAfter=12,
            spaceBefore=12,
            fontName='Helvetica-Bold'
        )

        body_style = ParagraphStyle(
            'CustomBody',
            parent=styles['BodyText'],
            fontSize=11,
            alignment=TA_JUSTIFY,
            spaceAfter=12,
            leading=16
        )

        meta_style = ParagraphStyle(
            'Meta',
            parent=styles['Normal'],
            fontSize=9,
            textColor=colors.grey,
            spaceAfter=20,
            alignment=TA_LEFT
        )

        # Title page
        elements.append(Spacer(1, 1*inch))
        elements.append(Paragraph(self.project.get('title', 'Untitled'), title_style))

        if self.project.get('description'):
            elements.append(Spacer(1, 0.3*inch))
            elements.append(Paragraph(self.project['description'], styles['Normal']))

        elements.append(Spacer(1, 0.5*inch))
        elements.append(Paragraph(f"Author: <b>{self.author}</b>", meta_style))
        elements.append(Paragraph(f"Generated: <b>{datetime.now().strftime('%B %d, %Y')}</b>", meta_style))

        elements.append(PageBreak())

        # Table of Contents
        elements.append(Paragraph("Table of Contents", styles['Heading2']))
        elements.append(Spacer(1, 0.2*inch))

        toc_data = []
        for i, chapter in enumerate(self.chapters, 1):
            toc_data.append([
                Paragraph(f"{i}.", styles['Normal']),
                Paragraph(chapter.get('title', f'Chapter {i}'), styles['Normal'])
            ])

        if toc_data:
            toc_table = Table(toc_data, colWidths=[0.5*inch, 6*inch])
            toc_table.setStyle(TableStyle([
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('TOPPADDING', (0, 0), (-1, -1), 6),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ]))
            elements.append(toc_table)

        elements.append(PageBreak())

        # Chapters
        for i, chapter in enumerate(self.chapters, 1):
            # Chapter title
            elements.append(Paragraph(f"Chapter {i}: {chapter.get('title', 'Untitled')}", chapter_style))

            # Reading time meta
            reading_time = chapter.get('reading_time', 1)
            elements.append(Paragraph(f"<i>Reading time: {reading_time} minute{'s' if reading_time != 1 else ''}</i>", meta_style))

            # Chapter content (strip HTML tags for simple rendering)
            content = chapter.get('content', '')
            clean_content = self._strip_html_tags(content)

            if clean_content.strip():
                # Split content into paragraphs
                for para in clean_content.split('\n'):
                    if para.strip():
                        elements.append(Paragraph(para, body_style))
                        elements.append(Spacer(1, 0.1*inch))

            # Page break between chapters (except last)
            if i < len(self.chapters):
                elements.append(PageBreak())

        # Build PDF
        doc.build(elements)
        self.pdf_buffer.seek(0)
        return self.pdf_buffer.getvalue()

    @staticmethod
    def _hex_to_rgb(hex_color):
        """Convert hex color to RGB tuple for reportlab"""
        hex_color = hex_color.lstrip('#')
        if len(hex_color) == 6:
            return tuple(int(hex_color[i:i+2], 16)/255.0 for i in (0, 2, 4))
        return colors.HexColor(f"#{hex_color}")

    @staticmethod
    def _strip_html_tags(html):
        """Strip HTML tags from content"""
        import re
        # Remove script and style elements
        clean = re.compile('<script.*?</script>', re.DOTALL)
        html = clean.sub('', html)
        clean = re.compile('<style.*?</style>', re.DOTALL)
        html = clean.sub('', html)
        # Remove all HTML tags
        clean = re.compile('<.*?>')
        html = clean.sub('', html)
        # Handle common HTML entities
        html = html.replace('&nbsp;', ' ')
        html = html.replace('&lt;', '<')
        html = html.replace('&gt;', '>')
        html = html.replace('&amp;', '&')
        html = html.replace('<br>', '\n')
        html = html.replace('<br/>', '\n')
        html = html.replace('<br />', '\n')
        # Decode HTML entities
        import html as html_module
        html = html_module.unescape(html)
        return html
