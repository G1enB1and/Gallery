import json
import os
import random
import sys

def fetch_and_randomize_images(directory, show_hidden=False):
    images = []
    base_directory = os.path.abspath(directory)
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

    for root, dirs, files in os.walk(directory):
        if not show_hidden:
            # Remove hidden directories
            dirs[:] = [d for d in dirs if not d.startswith('.')]
            
        for file in files:
            if not show_hidden and file.startswith('.'):
                continue
            if file.endswith(('.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4')):
                full_path = os.path.abspath(os.path.join(root, file))
                relative_path = os.path.relpath(full_path, start=project_root)

                # Ensure the path uses forward slashes
                relative_path = relative_path.replace("\\", "/")

                images.append(relative_path)

    random.shuffle(images)
    images_json_path = os.path.join(os.path.dirname(__file__), '..', 'images.json')

    total_images = len(images)
    with open(images_json_path, 'w') as f:
        json.dump(images, f)
        for index, image in enumerate(images):
            progress = (index + 1) / total_images * 100
            print(f'Progress: {progress:.2f}%')
            f.flush()

if __name__ == '__main__':
    if len(sys.argv) > 1:
        show_hidden = json.loads(sys.argv[2].lower()) if len(sys.argv) > 2 else False
        fetch_and_randomize_images(sys.argv[1], show_hidden)
    else:
        print("Usage: python fetch_images.py <directory> [show_hidden]")
