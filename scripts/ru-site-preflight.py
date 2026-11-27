#!/usr/bin/env python3
"""Read-only inventory of external dependencies in a generated public tree."""
import argparse
import collections
import json
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit

URL_RE = re.compile(r"""(?:https?://|(?<![\w:])//)[a-zA-Z0-9.-]+(?::[0-9]+)?(?:/[^\s"'<>]*)?""", re.I)
ASSET_ATTRS = {"src", "poster", "data", "srcset"}
TEXT_SUFFIXES = {".html", ".htm", ".js", ".mjs", ".css", ".json", ".xml", ".svg"}
GLOBAL = "viiversion.com"
RU = "ru.viiversion.com"

def inventory(root):
    hosts = collections.defaultdict(lambda: {"counts": collections.Counter(), "examples": collections.defaultdict(set)})
    def add(url, kind, path):
        try:
            parts = urlsplit("https:" + url if url.startswith("//") else url)
            host = parts.hostname
        except ValueError:
            return
        if not host:
            return
        entry = hosts[host.lower()]
        entry["counts"][kind] += 1
        if len(entry["examples"][kind]) < 8:
            entry["examples"][kind].add(path)

    class PageParser(HTMLParser):
        def __init__(self, path):
            super().__init__(convert_charrefs=True)
            self.path = path
        def handle_starttag(self, tag, attrs):
            attrs = dict(attrs)
            rel = (attrs.get("rel") or "").lower().split()
            for attr, value in attrs.items():
                if not value:
                    continue
                kind = None
                if attr in ASSET_ATTRS:
                    kind = "embedded_resource"
                elif attr == "href":
                    kind = ("embedded_resource" if tag == "link" and any(r in rel for r in ("stylesheet","preload","modulepreload","icon","preconnect","dns-prefetch")) else "metadata" if tag == "link" else "navigation")
                elif attr == "action":
                    kind = "form_action"
                elif attr == "content" and (attrs.get("property") or "").startswith("og:"):
                    kind = "metadata"
                if kind:
                    for match in URL_RE.finditer(value):
                        add(match.group(), kind, self.path)

    files = 0
    skipped = []
    total_bytes = 0
    for p in sorted(root.rglob("*")):
        if p.is_symlink() or not p.is_file():
            continue
        files += 1
        total_bytes += p.stat().st_size
        if p.suffix.lower() not in TEXT_SUFFIXES:
            continue
        path = p.relative_to(root).as_posix()
        try:
            content = p.read_text(encoding="utf-8")
        except UnicodeError:
            skipped.append(path)
            continue
        if p.suffix.lower() in {".html", ".htm"}:
            PageParser(path).feed(content)
        # Heuristic raw references may repeat parsed references; this category is
        # intentionally not a count of network requests.
        for match in URL_RE.finditer(content):
            add(match.group(), "raw_reference", path)
    report = {}
    for host, entry in sorted(hosts.items()):
        report[host] = {
            "classification": "ru_target" if host == RU else "global_domain_review" if host == GLOBAL or host.endswith("." + GLOBAL) or host.endswith(".workers.dev") else "external_review",
            "counts": dict(entry["counts"]),
            "examples": {k: sorted(v) for k, v in entry["examples"].items()},
        }
    return {"files": files, "bytes": total_bytes, "unreadable_text_files": skipped,
            "hosts": report, "note": "Static heuristic; not network reachability or security certification. Raw references may overlap parsed references."}

def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("root", type=Path)
    ap.add_argument("--output", required=True, type=Path)
    args = ap.parse_args()
    for required in ("index.html", "en/index.html", "assets/viiversion.js"):
        if not (args.root / required).is_file():
            ap.error("Missing build output: " + required)
    report = inventory(args.root)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Inventory: {report['files']} files; {len(report['hosts'])} hosts; {len(report['unreadable_text_files'])} unreadable text files. Review required.")

if __name__ == "__main__":
    main()
