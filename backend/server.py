# server.py
from http.server import SimpleHTTPRequestHandler, HTTPServer
from jinja2 import Environment, FileSystemLoader, TemplateNotFound
import json
import os
import subprocess
import urllib.parse
import webbrowser
import time
from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS
from mutagen import File as MutagenFile
import magic
import piexif
import pyexiv2
import logging
from urllib.parse import unquote
import struct

# Set up logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

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
        path = unquote(path)
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

        logging.info(f"GET request: {self.path}")
        logging.info(f"View parameter: {view}")

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
            show_hidden = query_params.get('showHidden', ['false'])[0] == 'true'
            self.wfile.write(json.dumps(get_file_tree(PICTURES_ROOT, show_hidden)).encode())
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
            logging.info(f"Rendering template: {template_name} with context: {context}")
            template = env.get_template(template_name)
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            rendered = template.render(context)
            self.wfile.write(rendered.encode('utf-8'))
        except TemplateNotFound:
            raise
        except Exception as e:
            logging.error(f'Error rendering template: {str(e)}')
            self.send_response(500)
            self.end_headers()
            self.wfile.write(f'Error rendering template: {str(e)}'.encode())

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data)

        logging.info(f"POST request: {self.path}")

        if self.path == '/update-images':
            directory = data.get('directory')
            show_hidden = data.get('showHidden', False)
            if directory:
                full_path = os.path.join(PROJECT_ROOT, directory)
                process = subprocess.Popen(
                    ['python', 'backend/fetch_images.py', full_path, str(show_hidden)],
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
        elif self.path == '/update_hidden_files':
            show_hidden = data.get('showHidden', False)
            update_hidden_files(show_hidden)
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'success': True}).encode())
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b'Not Found')

    def handle_get_image_info(self, query_params):
        file_path = unquote(query_params.get('path', [''])[0])
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
        file_path = unquote(query_params.get('path', [''])[0])
        logging.info(f"Handling get_tags request for file: {file_path}")
        if file_path:
            tags = get_tags(file_path)
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(', '.join(tags)).encode())  # Join tags with comma and space
            logging.info(f"Sent tags: {tags}")
        else:
            logging.warning("Missing path parameter in get_tags request")
            self.send_response(400)
            self.end_headers()
            self.wfile.write(b'Missing path parameter')

    def handle_add_tag(self, data):
        file_path = unquote(data.get('path', ''))
        new_tag = data.get('tag')
        logging.info(f"Handling add_tag request for file: {file_path}, tag: {new_tag}")
        if file_path and new_tag:
            success, message = add_tag(file_path, new_tag)
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = json.dumps({'success': success, 'message': message})
            self.wfile.write(response.encode())
            logging.info(f"Add tag response: {response}")
        else:
            logging.warning("Missing path or tag parameter in add_tag request")
            self.send_response(400)
            self.end_headers()
            self.wfile.write(b'Missing path or tag parameter')

def get_file_tree(path, show_hidden=False):
    def build_tree(directory):
        tree = []
        for root, dirs, files in os.walk(directory):
            # Sort directories and files
            dirs.sort()
            files.sort()
            for dir in dirs:
                if not show_hidden and dir.startswith('.'):
                    continue
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

def update_hidden_files(show_hidden):
    # Update the images.json file based on the show_hidden setting
    with open('images.json', 'r') as f:
        images = json.load(f)

    if not show_hidden:
        # Filter out images from hidden folders
        images = [img for img in images if not any(part.startswith('.') for part in img.split('/')[1:])]

    with open('images.json', 'w') as f:
        json.dump(images, f)
        
    # Also update the file tree
    file_tree = get_file_tree(PICTURES_ROOT, show_hidden)
    with open('file_tree.json', 'w') as f:
        json.dump(file_tree, f)

def get_image_info(file_path):
    logging.info(f"Getting image info for: {file_path}")
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
        try:
            with Image.open(file_path) as img:
                info["Dimensions"] = f"{img.width}x{img.height}"
                exif_data = img._getexif()
                if exif_data:
                    for tag_id, value in exif_data.items():
                        tag = TAGS.get(tag_id, tag_id)
                        info[tag] = str(value)
        except Exception as e:
            logging.error(f"Error getting image info: {str(e)}")
    
    return info

def get_tags(file_path):
    logging.info(f"Getting tags for file: {file_path}")
    try:
        if file_path.lower().endswith(('.jpg', '.jpeg', '.tiff', '.png')):
            with pyexiv2.Image(file_path) as img:
                xmp_data = img.read_xmp()
                if 'Xmp.dc.subject' in xmp_data:
                    tags = xmp_data['Xmp.dc.subject']
                    logging.info(f"Tags found: {tags}")
                    return tags  # Return list of tags
                else:
                    logging.info("No tags found in XMP data")
                    return []
        elif file_path.lower().endswith(('.mp4', '.avi', '.mov')):
            file = MutagenFile(file_path)
            if 'comment' in file.tags:
                tags = file.tags['comment'][0].split(';')
                logging.info(f"Tags found: {tags}")
                return tags  # Return list of tags
            logging.info("No comment tag found in video file")
            return []
        else:
            logging.warning(f"Unsupported file type: {file_path}")
            return []
    except Exception as e:
        logging.error(f"Error getting tags for {file_path}: {str(e)}")
        return []


def add_tag(file_path, new_tag):
    logging.info(f"Attempting to add tag '{new_tag}' to file: {file_path}")
    try:
        tags = get_tags(file_path)
        if new_tag not in tags:
            tags.append(new_tag)
            if file_path.lower().endswith(('.jpg', '.jpeg', '.tiff', '.png')):
                with pyexiv2.Image(file_path) as img:
                    xmp_data = img.read_xmp()
                    xmp_data['Xmp.dc.subject'] = tags
                    img.modify_xmp(xmp_data)
                logging.info(f"Tag added successfully to image file. New tags: {tags}")
            elif file_path.lower().endswith(('.mp4', '.avi', '.mov')):
                file = MutagenFile(file_path)
                file.tags['comment'] = ';'.join(tags)
                file.save()
                logging.info(f"Tag added successfully to video file. New tags: {tags}")
            else:
                logging.warning(f"Unsupported file type: {file_path}")
                return False, "Unsupported file type"
            return True, "Tag added successfully"
        else:
            logging.info(f"Tag '{new_tag}' already exists")
            return True, "Tag already exists"
    except Exception as e:
        error_message = f"Error adding tag to {file_path}: {str(e)}"
        logging.error(error_message)
        return False, error_message

def run_server():
    web_dir = os.path.join(os.path.dirname(__file__), '..')
    os.chdir(web_dir)
    server_address = ('', 8000)
    httpd = HTTPServer(server_address, RequestHandler)
    print('Server running at http://localhost:8000/')
    webbrowser.open('http://localhost:8000/')

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    httpd.server_close()
    print("Server stopped.")

if __name__ == '__main__':
    run_server()