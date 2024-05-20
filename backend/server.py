from http.server import SimpleHTTPRequestHandler, HTTPServer
import json
import os
import webbrowser

class RequestHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/images.json':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            with open('images.json', 'r') as f:
                images = json.load(f)
            self.wfile.write(json.dumps(images).encode())
        else:
            super().do_GET()

def run_server():
    # Change the working directory to the root of the project
    os.chdir('../')
    server_address = ('', 8000)
    httpd = HTTPServer(server_address, RequestHandler)
    print('Server running at http://localhost:8000/')
    webbrowser.open('http://localhost:8000/')
    httpd.serve_forever()

if __name__ == '__main__':
    run_server()
