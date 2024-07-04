from http.server import SimpleHTTPRequestHandler, HTTPServer
from jinja2 import Environment, FileSystemLoader, TemplateNotFound
import json
import os
import subprocess
import urllib.parse
import webbrowser
import time
from PIL import Image
from PIL.ExifTags import TAGS
from mutagen import File as MutagenFile
import magic

# Define the root directory for the file tree
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
PICTURES_ROOT = os.path.join(PROJECT_ROOT, 'Pictures')
TEMPLATES_ROOT = os.path.join(PROJECT_ROOT, 'templates')
STATIC_ROOT = os.path.join(PROJECT_ROOT, 'static')

# Initialize Jinja2 environment
env = Environment(loader=FileSystemLoader(TEMPLATES_ROOT))

class RequestHandler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        """Translate a /-separated PATH to the local filename syntax."""
        path = urllib.parse.unquote(path)
        path = path.lstrip('/')
        if path.startswith('static/'):
            return os.path.join(STATIC_ROOT, path[len('static/'):])
        elif path.startswith('Pictures/'):
            return os.path.join(PICTURES_ROOT, path[len('Pictures/'):])
        return os.path.join(PROJECT_ROOT, path)

    def do_GET(self):
        parsed_path = urllib.parse.urlparse(self.path)
        query_params = urllib.parse.parse_qs(parsed_path.query)
        view = query_params.get('view', ['loading'])[0]  # Default to 'loading' view

        print(f"View parameter: {view}")  # Add logging to verify the view parameter

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
        elif parsed_path.path == '/get_image_info':
            self.handle_get_image_info(query_params)
        elif parsed_path.path == '/get_tags':
            self.handle_get_tags(query_params)
        elif parsed_path.path.startswith('/static/') or parsed_path.path.startswith('/Pictures/'):
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
                self.wfile.write(b'Static file not found')
        else:
            template_name = parsed_path.path.lstrip('/')
            if not template_name or template_name == 'index.html':
                template_name = 'index.html'
            try:
                self.render_template(template_name, {'view': view})
            except TemplateNotFound:
                self.send_response(404)
                self.end_headers()
                self.wfile.write(b'Template not found')

    def render_template(self, template_name, context={}):
        try:
            print(f"Rendering template: {template_name} with context: {context}")  # Add logging for template rendering
            template = env.get_template(template_name)
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            rendered = template.render(context)
            self.wfile.write(rendered.encode('utf-8'))
        except TemplateNotFound:
            raise
        except Exception as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(f'Error rendering template: {str(e)}'.encode())

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data)

        if self.path == '/update-images':
            directory = data.get('directory')
            if directory:
                full_path = os.path.join(PROJECT_ROOT, directory)
                process = subprocess.Popen(
                    ['python', 'backend/fetch_images.py', full_path],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    universal_newlines=True,
                )

                self.send_response(200)
                self.send_header('Content-type', 'text/plain')
                self.end_headers()

                for line in iter(process.stdout.readline, ''):
                    self.wfile.write(line.encode())
                process.stdout.close()
                process.wait()
            else:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(b'Missing directory parameter.')
        elif self.path == '/add_tag':
            self.handle_add_tag(data)
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b'Not Found')

    def handle_get_image_info(self, query_params):
        file_path = query_params.get('path', [''])[0]
        if file_path:
            info = get_image_info(file_path)
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(info).encode())
        else:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(b'Missing path parameter')

    def handle_get_tags(self, query_params):
        file_path = query_params.get('path', [''])[0]
        if file_path:
            tags = get_tags(file_path)
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(tags).encode())
        else:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(b'Missing path parameter')

    def handle_add_tag(self, data):
        file_path = data.get('path')
        new_tag = data.get('tag')
        if file_path and new_tag:
            success = add_tag(file_path, new_tag)
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'success': success}).encode())
        else:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(b'Missing path or tag parameter')

def get_file_tree(path):
    def build_tree(directory):
        tree = []
        for root, dirs, files in os.walk(directory):
            # Sort directories and files
            dirs.sort()
            files.sort()
            for dir in dirs:
                dir_path = os.path.join(root, dir)
                relative_path = os.path.relpath(dir_path, start=PROJECT_ROOT)
                tree.append({
                    'name': dir,
                    'path': relative_path,
                    'type': 'directory',
                    'children': build_tree(dir_path)  # Recursively build subdirectories
                })
            # Stop recursion for files in the current directory
            break
        return tree

    return build_tree(path)

def get_image_info(file_path):
    file_name = os.path.basename(file_path)
    file_size = os.path.getsize(file_path)
    
    mime = magic.Magic(mime=True)
    file_type = mime.from_file(file_path)
    
    info = {
        "File Name": file_name,
        "File Path": file_path,
        "File Size": f"{file_size / 1024:.2f} KB",
        "File Type": file_type,
    }
    
    if file_type.startswith('image'):
        with Image.open(file_path) as img:
            info["Dimensions"] = f"{img.width}x{img.height}"
            exif_data = img._getexif()
            if exif_data:
                for tag_id, value in exif_data.items():
                    tag = TAGS.get(tag_id, tag_id)
                    info[tag] = str(value)
    
    return info

def get_tags(file_path):
    if file_path.lower().endswith(('.jpg', '.jpeg', '.tiff')):
        with Image.open(file_path) as img:
            exif_data = img._getexif()
            if exif_data:
                for tag_id, value in exif_data.items():
                    if TAGS.get(tag_id) == 'UserComment':
                        return value.split(',')
    elif file_path.lower().endswith(('.mp4', '.avi', '.mov')):
        file = MutagenFile(file_path)
        if 'comment' in file.tags:
            return file.tags['comment'][0].split(',')
    return []

def add_tag(file_path, new_tag):
    tags = get_tags(file_path)
    if new_tag not in tags:
        tags.append(new_tag)
        if file_path.lower().endswith(('.jpg', '.jpeg', '.tiff')):
            with Image.open(file_path) as img:
                exif_data = img._getexif() or {}
                exif_data[TAGS['UserComment']] = ','.join(tags)
                img.save(file_path, exif=exif_data)
        elif file_path.lower().endswith(('.mp4', '.avi', '.mov')):
            file = MutagenFile(file_path)
            file.tags['comment'] = ','.join(tags)
            file.save()
    return True

def run_server():
    web_dir = os.path.join(os.path.dirname(__file__), '..')
    os.chdir(web_dir)
    server_address = ('', 8000)
    httpd = HTTPServer(server_address, RequestHandler)
    print('Server running at http://localhost:8000/')
    webbrowser.open('http://localhost:8000/')

    httpd.serve_forever()

if __name__ == '__main__':
    run_server()