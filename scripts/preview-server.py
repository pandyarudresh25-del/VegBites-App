#!/usr/bin/env python3
"""
Zero-dependency static server for the Expo web export in ./dist.

Expo's static output writes one .html file per route (e.g. home.html), so a
plain file server 404s on /home. This maps clean URLs onto the exported files
and falls back to the customer home page for unknown paths.
"""
import http.server
import os
import socketserver
import sys

ROOT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "dist")
PORT = int(os.environ.get("PORT", "8081"))


class CleanUrlHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    GROUPS = ("(customer)", "(auth)", "(vendor)", "(delivery)")

    def _group_variants(self, local):
        """Route groups export as "(group)/route.html" — yield the group-prefixed form."""
        rel = os.path.relpath(local, ROOT)
        for group in self.GROUPS:
            yield os.path.join(ROOT, group, rel)

    @staticmethod
    def _is_dynamic(name):
        return name.startswith("[") and name.endswith("]")

    def _resolve(self, local, segments):
        """Walk the exported tree for a request path, letting any dynamic pattern
        (e.g. [id]) stand in for exactly one requested segment at any depth. This is what
        maps /tiffins/p1/thali -> dist/tiffins/[id]/thali.html and /restaurant/r1 ->
        dist/restaurant/[id].html, so detail routes are previewable too."""
        if not segments:
            if os.path.exists(local + ".html"):
                return local + ".html"
            index = os.path.join(local, "index.html")
            if os.path.exists(index):
                return index
            return None
        head, tail = segments[0], segments[1:]
        exact = os.path.join(local, head)
        if os.path.isdir(exact):
            found = self._resolve(exact, tail)
            if found:
                return found
        elif not tail and os.path.exists(exact + ".html"):
            return exact + ".html"
        try:
            names = os.listdir(local)
        except (FileNotFoundError, NotADirectoryError):
            return None
        # A dynamic pattern may stand in for the requested segment. Terminals export as
        # "[id].html"; nested ones export as directories named "[id]".
        for name in names:
            stem, ext = os.path.splitext(name)
            if not self._is_dynamic(stem):
                continue
            full = os.path.join(local, name)
            catch_all = "..." in stem
            optional = stem.startswith("[[")
            if catch_all:
                if os.path.isfile(full):
                    return full
                found = self._resolve(full, [])
                if found:
                    return found
                continue
            if ext == ".html":
                if not tail or optional:
                    return full
                continue
            if os.path.isdir(full):
                found = self._resolve(full, tail)
                if found:
                    return found
                if optional:
                    found = self._resolve(full, [])
                    if found:
                        return found
        return None

    def _dynamic_path(self, path):
        segments = [s for s in path.split("/") if s]
        for base in (ROOT, *(os.path.join(ROOT, g) for g in self.GROUPS)):
            found = self._resolve(base, segments)
            if found:
                return found
        return None

    def translate_path(self, path):
        local = super().translate_path(path)
        if os.path.isdir(local):
            index = os.path.join(local, "index.html")
            if os.path.exists(index):
                return index
        # NOTE: a directory is *not* a hit. Expo writes both `orders.html` and an
        # `orders/[id].html` directory for a page that also has child routes, so
        # returning the directory here made every such page answer 301 -> /orders/.
        if os.path.isfile(local):
            return local
        if not local.endswith(".html"):
            for candidate in (local + ".html", *self._group_variants(local + ".html")):
                if os.path.exists(candidate):
                    return candidate
            dynamic = self._dynamic_path(path)
            if dynamic:
                return dynamic
        return local

    def log_message(self, fmt, *args):
        sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))


class ReusableTCPServer(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


if __name__ == "__main__":
    if not os.path.isdir(ROOT):
        sys.exit("dist/ not found — run: npx expo export --platform web")
    with ReusableTCPServer(("0.0.0.0", PORT), CleanUrlHandler) as httpd:
        print(f"VegBites preview on http://0.0.0.0:{PORT} (serving {ROOT})", flush=True)
        httpd.serve_forever()
