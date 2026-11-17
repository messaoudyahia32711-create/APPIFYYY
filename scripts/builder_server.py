#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Appify APK Builder Microservice.

A lightweight HTTP server that accepts build configuration JSON,
invokes apk_builder.py, and returns the compiled, signed APK binary.

Can be deployed on Railway, Render, Fly.io, Koyeb, or any VPS/container platform.
"""

import json
import os
import subprocess
import sys
import tempfile
from http.server import HTTPServer, BaseHTTPRequestHandler

PORT = int(os.environ.get("PORT", 8080))
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BUILDER_SCRIPT = os.path.join(SCRIPT_DIR, "apk_builder.py")
PYTHON_BIN = sys.executable or "python3"


class BuilderHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path in ("/", "/health", "/status"):
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(
                json.dumps({
                    "status": "healthy",
                    "service": "appify-apk-builder",
                    "ready": os.path.exists(BUILDER_SCRIPT)
                }).encode("utf-8")
            )
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path not in ("/", "/build", "/api/build-apk"):
            self.send_response(404)
            self.end_headers()
            return

        content_length = int(self.headers.get("Content-Length", 0))
        if content_length == 0:
            self._send_error(400, "Empty request body")
            return

        body = self.rfile.read(content_length)
        try:
            payload = json.loads(body.decode("utf-8"))
        except Exception as e:
            self._send_error(400, f"Invalid JSON body: {str(e)}")
            return

        if not payload.get("app"):
            self._send_error(400, "Missing 'app' in build configuration")
            return

        # Prepare temporary build directory
        with tempfile.TemporaryDirectory(prefix="appify-build-") as tmp_dir:
            cfg_path = os.path.join(tmp_dir, "config.json")
            apk_path = os.path.join(tmp_dir, "app.apk")

            with open(cfg_path, "w", encoding="utf-8") as f:
                json.dump(payload, f)

            print(f"[*] Starting build for app: {payload.get('app', {}).get('name', 'app')}")

            try:
                proc = subprocess.run(
                    [PYTHON_BIN, BUILDER_SCRIPT, cfg_path, apk_path],
                    capture_output=True,
                    text=True,
                    timeout=240,
                )
            except subprocess.TimeoutExpired:
                self._send_error(504, "Build process timed out (exceeded 240 seconds)")
                return
            except Exception as e:
                self._send_error(500, f"Failed to execute builder process: {str(e)}")
                return

            if proc.returncode != 0:
                error_msg = proc.stderr.strip() or proc.stdout.strip() or "Unknown build error"
                print(f"[!] Build failed: {error_msg}")
                self._send_error(500, f"Builder error: {error_msg}")
                return

            if not os.path.exists(apk_path) or os.path.getsize(apk_path) == 0:
                self._send_error(500, "Builder produced no APK artifact")
                return

            apk_size = os.path.getsize(apk_path)
            app_name = payload.get("app", {}).get("name", "appify-app")
            safe_name = "".join(c if c.isalnum() or c in ".-" else "-" for c in app_name).strip("-") or "app"
            filename = f"{safe_name}.apk"

            print(f"[+] Build successful! APK size: {apk_size} bytes. Sending to client...")

            self.send_response(200)
            self.send_header("Content-Type", "application/vnd.android.package-archive")
            self.send_header("Content-Length", str(apk_size))
            self.send_header("Content-Disposition", f'attachment; filename="{filename}"')
            self.send_header("Cache-Control", "no-store")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()

            with open(apk_path, "rb") as f:
                while chunk := f.read(65536):
                    self.wfile.write(chunk)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def _send_error(self, code: int, message: str):
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps({"ok": False, "error": message}).encode("utf-8"))


def main():
    server_address = ("", PORT)
    httpd = HTTPServer(server_address, BuilderHandler)
    print(f"🚀 Appify APK Builder Microservice running on port {PORT}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down builder service...")
        httpd.server_close()


if __name__ == "__main__":
    main()
