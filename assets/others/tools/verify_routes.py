"""Refresh the test DOM from the actual HTML and run the Node interaction checks.

This is a DOM simulation and SVG export, not browser layout verification.
Dependencies: beautifulsoup4, Node.js. Artifacts go to ignored .impeccable/.
"""
from pathlib import Path
import json
import subprocess
from bs4 import BeautifulSoup, Tag

ROOT = Path(__file__).resolve().parents[3]
OUTPUT = ROOT / '.impeccable/routes-map'
OUTPUT.mkdir(parents=True, exist_ok=True)


def convert(node):
    return dict(tag=node.name,
                attrs={k: ' '.join(v) if isinstance(v, list) else v for k, v in node.attrs.items()},
                text=''.join(str(t) for t in node.children if not isinstance(t, Tag)),
                children=[convert(c) for c in node.children if isinstance(c, Tag)])


html = BeautifulSoup((ROOT / 'others/routes.html').read_text(encoding='utf-8'), 'html.parser')
(OUTPUT / 'dom.json').write_text(json.dumps(convert(html.html)), encoding='utf-8')
subprocess.run(['node', str(Path(__file__).with_suffix('.cjs'))], check=True, cwd=ROOT)
