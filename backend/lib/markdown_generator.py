"""Markdown Generator for Webook projects"""
import json
import zipfile
import io
from datetime import datetime


class MarkdownGenerator:
    """Generate Markdown files from Webook projects"""

    def __init__(self, project, chapters):
        self.project = project
        self.chapters = chapters
        self.buffer = io.BytesIO()

    def generate(self):
        """Generate Markdown files as ZIP and return bytes"""
        with zipfile.ZipFile(self.buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
            # Create README.md with table of contents
            readme = self._generate_readme()
            zf.writestr('README.md', readme)

            # Create chapter files
            for i, chapter in enumerate(self.chapters):
                filename = f'chapters/{i:02d}_{self._slugify(chapter.get("title", f"Chapter {i}"))}.md'
                chapter_md = self._generate_chapter_markdown(chapter, i)
                zf.writestr(filename, chapter_md)

            # Create metadata file
            metadata = {
                "title": self.project.get("title", "Untitled"),
                "description": self.project.get("description", ""),
                "created_at": self.project.get("created_at", datetime.now().isoformat()),
                "chapter_count": len(self.chapters),
                "export_date": datetime.now().isoformat()
            }
            zf.writestr('metadata.json', json.dumps(metadata, indent=2))

        self.buffer.seek(0)
        return self.buffer.getvalue()

    def _generate_readme(self):
        """Generate README.md with project overview and TOC"""
        toc = "\n".join(
            f"- [{i+1}. {chapter.get('title', f'Chapter {i+1}')}](chapters/{i:02d}_{self._slugify(chapter.get('title', f'Chapter {i+1}'))}.md)"
            for i, chapter in enumerate(self.chapters)
        )

        return f"""# {self.project.get('title', 'Untitled')}

{self.project.get('description', 'A Webook project.')}

**Export Date:** {datetime.now().strftime('%B %d, %Y')}

## Table of Contents

{toc}

---

*This markdown export was generated from a Webook project.*
"""

    def _generate_chapter_markdown(self, chapter, index):
        """Generate Markdown for a single chapter"""
        title = chapter.get('title', f'Chapter {index + 1}')
        reading_time = chapter.get('reading_time', 1)
        content = chapter.get('content', '')

        # Convert HTML to Markdown (basic)
        md_content = self._html_to_markdown(content)

        return f"""# {title}

**Original Index:** Chapter {index + 1}
**Reading Time:** {reading_time} minute{'s' if reading_time != 1 else ''}

---

{md_content}

---

*[Back to Table of Contents](../README.md)*
"""

    @staticmethod
    def _html_to_markdown(html):
        """Basic HTML to Markdown conversion"""
        import re

        # Remove script and style
        html = re.sub(r'<script.*?</script>', '', html, flags=re.DOTALL)
        html = re.sub(r'<style.*?</style>', '', html, flags=re.DOTALL)

        # Convert headings
        html = re.sub(r'<h1[^>]*>(.*?)</h1>', r'# \1', html, flags=re.IGNORECASE)
        html = re.sub(r'<h2[^>]*>(.*?)</h2>', r'## \1', html, flags=re.IGNORECASE)
        html = re.sub(r'<h3[^>]*>(.*?)</h3>', r'### \1', html, flags=re.IGNORECASE)
        html = re.sub(r'<h4[^>]*>(.*?)</h4>', r'#### \1', html, flags=re.IGNORECASE)

        # Convert text formatting
        html = re.sub(r'<strong[^>]*>(.*?)</strong>', r'**\1**', html, flags=re.IGNORECASE)
        html = re.sub(r'<b[^>]*>(.*?)</b>', r'**\1**', html, flags=re.IGNORECASE)
        html = re.sub(r'<em[^>]*>(.*?)</em>', r'*\1*', html, flags=re.IGNORECASE)
        html = re.sub(r'<i[^>]*>(.*?)</i>', r'*\1*', html, flags=re.IGNORECASE)

        # Convert lists
        html = re.sub(r'<li[^>]*>(.*?)</li>', r'- \1', html, flags=re.IGNORECASE)
        html = re.sub(r'<ul[^>]*>|</ul>', '', html, flags=re.IGNORECASE)
        html = re.sub(r'<ol[^>]*>|</ol>', '', html, flags=re.IGNORECASE)

        # Convert links
        html = re.sub(r'<a[^>]*href=["\']([^"\']*)["\'][^>]*>(.*?)</a>', r'[\2](\1)', html, flags=re.IGNORECASE)

        # Convert code
        html = re.sub(r'<code[^>]*>(.*?)</code>', r'`\1`', html, flags=re.IGNORECASE)
        html = re.sub(r'<pre[^>]*>(.*?)</pre>', r'```\n\1\n```', html, flags=re.IGNORECASE | re.DOTALL)

        # Convert blockquotes
        html = re.sub(r'<blockquote[^>]*>(.*?)</blockquote>', r'> \1', html, flags=re.IGNORECASE | re.DOTALL)

        # Convert line breaks
        html = re.sub(r'<br\s*/?>', '\n', html, flags=re.IGNORECASE)

        # Remove remaining HTML tags
        html = re.sub(r'<[^>]+>', '', html)

        # Handle HTML entities
        html = html.replace('&nbsp;', ' ')
        html = html.replace('&lt;', '<')
        html = html.replace('&gt;', '>')
        html = html.replace('&amp;', '&')

        # Clean up multiple newlines
        html = re.sub(r'\n\n\n+', '\n\n', html)

        return html.strip()

    @staticmethod
    def _slugify(text):
        """Convert text to slug format for filenames"""
        import re
        text = text.lower()
        text = re.sub(r'[^a-z0-9]+', '-', text)
        text = text.strip('-')
        return text[:50]  # Limit length
