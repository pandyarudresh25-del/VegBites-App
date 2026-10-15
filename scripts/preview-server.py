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

    def translate_path(self, path):
        local = super().translate_path(path)
        if os.path.isdir(local):
            index = os.path.join(local, "index.html")
            if os.path.exists(index):
                return index
        if not os.path.exists(local) and not local.endswith(".html"):
            candidate = local + ".html"
            if os.path.exists(candidate):
                return candidate
            # route groups export as "(group)/route.html"
            for group in ("(customer)", "(auth)", "(vendor)", "(delivery)"):
                grouped = os.path.join(ROOT, group, os.path.relpath(local, ROOT) + ".html")
                if os.path.exists(grouped):
                    return grouped
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
