from http.server import SimpleHTTPRequestHandler, HTTPServer
import json
import os
import subprocess
import urllib.parse
import webbrowser

# Define the root directory for the file tree
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
PICTURES_ROOT = os.path.join(PROJECT_ROOT, 'Pictures')

class RequestHandler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        """Translate a /-separated PATH to the local filename syntax."""
        path = urllib.parse.unquote(path)
        path = path.lstrip('/')
        return os.path.join(PROJECT_ROOT, path)

    def do_GET(self):
        parsed_path = urllib.parse.urlparse(self.path)
        if parsed_path.path == '/images.json':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            with open('images.json', 'r') as f:
                images = json.load(f)
            self.wfile.write(json.dumps(images).encode())
        elif parsed_path.path == '/file-tree':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(get_file_tree(PICTURES_ROOT)).encode())
        else:
            file_path = self.translate_path(parsed_path.path)
            if os.path.exists(file_path) and os.path.isfile(file_path):
                self.send_response(200)
                self.send_header('Content-type', self.guess_type(file_path))
                self.end_headers()
                with open(file_path, 'rb') as f:
                    self.wfile.write(f.read())
            else:
                self.send_response(404)
                self.end_headers()

    def do_POST(self):
        if self.path == '/update-images':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            directory = json.loads(post_data).get('directory')
            if directory:
                full_path = os.path.join(PROJECT_ROOT, directory)
                subprocess.run(['python', 'backend/randomize.py', full_path])
                self.send_response(200)
                self.end_headers()
                self.wfile.write(b'Images updated successfully.')
            else:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(b'Missing directory parameter.')

def get_file_tree(path):
    file_tree = []
    for root, dirs, files in os.walk(path):
        for dir in dirs:
            dir_path = os.path.join(root, dir)
            if os.path.islink(dir_path) or os.path.isdir(dir_path):
                relative_path = os.path.relpath(dir_path, start=PROJECT_ROOT)
                file_tree.append({'name': dir, 'path': relative_path, 'type': 'directory'})
        # Only process the top directory level
        break
    return file_tree

def run_server():
    web_dir = os.path.join(os.path.dirname(__file__), '..')
    os.chdir(web_dir)
    server_address = ('', 8000)
    httpd = HTTPServer(server_address, RequestHandler)
    print('Server running at http://localhost:8000/')
    webbrowser.open('http://localhost:8000/index_pinterest.html')

    httpd.serve_forever()

if __name__ == '__main__':
    run_server()
