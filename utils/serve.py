from argparse import ArgumentParser
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import json


CSP_CONFIG = Path(__file__).resolve().parent / "security_headers" / "csp.json"


def load_csp():
    try:
        return json.loads(CSP_CONFIG.read_text(encoding="utf-8")).get("policy", "")
    except Exception:
        return ""


class SecureHTTPRequestHandler(SimpleHTTPRequestHandler):
    csp_policy = load_csp()

    def end_headers(self):
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "SAMEORIGIN")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        if self.csp_policy:
            self.send_header("Content-Security-Policy", self.csp_policy)
        # HSTS is only meaningful over HTTPS; GitHub Pages handles it on the live site.
        super().end_headers()


def main():
    parser = ArgumentParser()
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", default=8000, type=int)
    parser.add_argument("--webfolder", default="docs", type=str)
    args = parser.parse_args()

    root = Path(__file__).resolve().parent.parent / args.webfolder
    handler = partial(SecureHTTPRequestHandler, directory=root)
    server = ThreadingHTTPServer((args.host, args.port), handler)
    print(f"Serving {root} at http://{args.host}:{args.port}")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
