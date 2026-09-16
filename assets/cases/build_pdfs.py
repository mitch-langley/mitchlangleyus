"""Build the downloadable case-study PDFs from their .md sources.

Each *.md in this folder becomes a two-page PDF styled by case.css
(the site's navy/serif design system, kept in sync with assets/site.css
tokens). Edit the .md, then re-run this script:

    python build_pdfs.py

Requires: pip install markdown playwright
A page break falls at the "<!-- page: 2 -->" marker in the source.
Rendering uses the machine's installed Chrome (via Playwright's
`channel="chrome"`), so nothing extra needs to download.
"""
import re
from pathlib import Path

import markdown
from playwright.sync_api import sync_playwright

HERE = Path(__file__).parent
CSS = (HERE / "case.css").read_text(encoding="utf-8")
PAGE_BREAK = re.compile(r"<!--\s*page:\s*2\s*-->", re.I)

FONTS_LINK = (
    '<link rel="preconnect" href="https://fonts.googleapis.com">'
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?'
    'family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700'
    '&family=Source+Sans+3:wght@400;600;700&display=swap">'
)

FOOTER_TEMPLATE = """
<div style="width:100%; font-family:Georgia,'Times New Roman',serif;
            font-size:7.5px; color:#69707D; padding:0 .85in;
            display:flex; justify-content:space-between;">
  <span>Mitchell Langley &mdash; Case study</span>
  <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
</div>
"""


def md_to_pages(md_path: Path) -> list[str]:
    text = md_path.read_text(encoding="utf-8")
    text = re.sub(r"<!--\s*page:\s*1\s*-->", "", text, flags=re.I)
    parts = PAGE_BREAK.split(text, maxsplit=1)
    if len(parts) != 2:
        raise ValueError(f"{md_path.name}: missing '<!-- page: 2 -->' marker")
    return [markdown.markdown(part.strip(), extensions=["tables"]) for part in parts]


def build_html(pages: list[str]) -> str:
    body = "".join(f'<section class="pdf-page">{p}</section>' for p in pages)
    return f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
{FONTS_LINK}
<style>{CSS}</style>
</head><body>{body}</body></html>"""


def build_pdf(browser, md_path: Path, pdf_path: Path) -> None:
    html = build_html(md_to_pages(md_path))
    page = browser.new_page()
    page.set_content(html, wait_until="networkidle")
    page.evaluate("document.fonts.ready")
    page.pdf(
        path=str(pdf_path),
        format="Letter",
        margin={"top": "0.7in", "bottom": "0.55in", "left": "0.85in", "right": "0.85in"},
        print_background=True,
        display_header_footer=True,
        header_template="<span></span>",
        footer_template=FOOTER_TEMPLATE,
    )
    page.close()


def main():
    md_files = sorted(HERE.glob("*.md"))
    if not md_files:
        print("No .md files found in assets/cases/")
        return
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome", headless=True)
        for md_path in md_files:
            pdf_path = md_path.with_suffix(".pdf")
            build_pdf(browser, md_path, pdf_path)
            print(f"built {pdf_path.name}")
        browser.close()


if __name__ == "__main__":
    main()
