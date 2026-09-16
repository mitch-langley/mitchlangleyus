"""Copy partials/header.html and partials/footer.html into every top-level page.

Run after editing either partial:  python sync.py

Each page's <header class="doc-head"> and <footer class="site-footer"> blocks are
replaced wholesale. The nav link pointing at the page itself gets aria-current="page"
(plus is-current in the header), so the partials themselves never mark a page.
Pages in writing/ use their own essay header and are left alone.
"""
import re
from pathlib import Path

ROOT = Path(__file__).parent
BLOCKS = {
    "header": re.compile(r'<header class="doc-head">.*?</header>', re.S),
    "footer": re.compile(r'<footer class="site-footer">.*?</footer>', re.S),
}


def mark_current(block, page, in_header):
    # Only links inside list items, so the name link in the header never counts.
    link = re.compile(r'(<li><a\b[^>]*?\bhref="' + re.escape(page) + r'"[^>]*?)>')

    def mark(match):
        tag = match.group(1)
        if in_header:
            tag = re.sub(r'class="([^"]*)"', r'class="\1 is-current"', tag, count=1)
        return tag + ' aria-current="page">'

    return link.sub(mark, block)


def main():
    partials = {
        name: (ROOT / "partials" / f"{name}.html").read_text(encoding="utf-8").strip()
        for name in BLOCKS
    }
    changed = 0
    for path in sorted(ROOT.glob("*.html")):
        html = path.read_bytes().decode("utf-8")
        newline = "\r\n" if "\r\n" in html else "\n"
        updated = html
        for name, pattern in BLOCKS.items():
            block = mark_current(partials[name], path.name, name == "header")
            updated, found = pattern.subn(lambda _: block.replace("\n", newline), updated, count=1)
            if not found:
                print(f"  {path.name}: no {name} found, skipped")
        if updated != html:
            path.write_bytes(updated.encode("utf-8"))
            print(f"updated {path.name}")
            changed += 1
    print(f"{changed} page(s) updated")


if __name__ == "__main__":
    main()
