"""
PageReader v4.344 — Advanced page content extraction with math summary.
"""

from bs4 import BeautifulSoup
from readability import Document


class PageReader:
    async def extract(self, html: str, url: str) -> dict:
        doc = Document(html)
        soup = BeautifulSoup(doc.summary(), "html.parser")
        text = soup.get_text("\n", strip=True)

        # Simple information density
        words = len(text.split())
        density = min(1.0, words / 2000)

        return {
            "url": url,
            "title": doc.title(),
            "text": text[:6000],
            "word_count": words,
            "info_density": round(density, 3)
        }
