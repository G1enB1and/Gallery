from flask import Flask, render_template, jsonify, request, send_from_directory
import json
import os
import random
import logging

app = Flask(__name__, static_folder='static')

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Endpoint to serve the main index page
@app.route('/')
def index():
    return render_template('index.html')

# Endpoint to fetch images
@app.route('/images.json')
def images():
    try:
        with open('images.json', 'r') as f:
            images = json.load(f)
        return jsonify(images)
    except Exception as e:
        app.logger.error(f"Error loading images: {e}")
        return jsonify({"error": "Failed to load images"}), 500

# Endpoint to update images
@app.route('/update-images', methods=['POST'])
def update_images():
    try:
        data = request.get_json()
        directory = data.get('directory')
        if directory:
            fetch_and_randomize_images(directory)
            return 'Images updated successfully.'
        return 'Missing directory parameter.', 400
    except Exception as e:
        app.logger.error(f"Error updating images: {e}")
        return 'Internal Server Error', 500

# Endpoint to serve the file tree
@app.route('/file-tree')
def file_tree():
    try:
        file_tree_data = get_file_tree(os.path.join(app.root_path, 'static', 'Pictures'))
        return jsonify(file_tree_data)
    except Exception as e:
        app.logger.error(f"Error fetching file tree: {e}")
        return jsonify({"error": "Failed to fetch file tree"}), 500

# Endpoint to serve images
@app.route('/Pictures/<path:filename>')
def serve_pictures(filename):
    return send_from_directory(os.path.join(app.root_path, 'static', 'Pictures'), filename)

# Function to fetch and randomize images
def fetch_and_randomize_images(directory):
    try:
        images = []
        base_directory = os.path.abspath(directory)
        static_index = base_directory.find('static') + len('static') + 1
        
        for root, dirs, files in os.walk(directory):
            for file in files:
                if file.endswith(('.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4')):
                    full_path = os.path.join(root, file)
                    relative_path = full_path[static_index:]  # Strip the base directory to get the relative path
                    
                    # Ensure the path uses forward slashes
                    relative_path = relative_path.replace("\\", "/")
                    
                    # Remove any leading "../"
                    if relative_path.startswith("../"):
                        relative_path = relative_path[3:]

                    images.append(relative_path)
        
        random.shuffle(images)
        images_json_path = os.path.join(app.root_path, 'static', 'images.json')
        with open(images_json_path, 'w') as f:
            json.dump(images, f)
    except Exception as e:
        app.logger.error(f"Error fetching and randomizing images: {e}")
        raise

# Function to get the file tree
def get_file_tree(path):
    def build_tree(directory):
        tree = []
        for root, dirs, files in os.walk(directory):
            dirs.sort()
            files.sort()
            for dir in dirs:
                dir_path = os.path.join(root, dir)
                relative_path = os.path.relpath(dir_path, start=os.path.dirname(__file__))
                tree.append({
                    'name': dir,
                    'path': relative_path,
                    'type': 'directory',
                    'children': build_tree(dir_path)
                })
            break
        return tree
    return build_tree(path)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
