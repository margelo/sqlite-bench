import http.server, json, pathlib, time
root=pathlib.Path(__file__).resolve().parents[1]/"review-artifacts"/"runs"
root.mkdir(exist_ok=True)
class Handler(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        body=self.rfile.read(int(self.headers["Content-Length"]))
        data=json.loads(body)
        path=root/f"{time.time_ns()}-{data.get('platform')}-{data.get('kind')}.json"
        path.write_bytes(body)
        print(path.name, flush=True)
        self.send_response(200); self.end_headers(); self.wfile.write(b"ok")
http.server.HTTPServer(("0.0.0.0",18766),Handler).serve_forever()
