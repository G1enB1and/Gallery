import json
import os
import random
import sys

def fetch_and_randomize_images(directory):
    images = []
    base_directory = os.path.abspath(directory)

    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4')):
                full_path = os.path.abspath(os.path.join(root, file))
                relative_path = os.path.relpath(full_path, start=base_directory)

                # Ensure the path uses forward slashes
                relative_path = relative_path.replace("\\", "/")

                # Remove leading '../' if present
                while relative_path.startswith("../"):
                    relative_path = relative_path[3:]

                images.append(relative_path)

    random.shuffle(images)
    images_json_path = os.path.join(os.path.dirname(__file__), '..', 'images.json')
    with open(images_json_path, 'w') as f:
        json.dump(images, f)

if __name__ == '__main__':
    if len(sys.argv) > 1:
        fetch_and_randomize_images(sys.argv[1])
    else:
        print("Usage: python fetch_images.py <directory>")
