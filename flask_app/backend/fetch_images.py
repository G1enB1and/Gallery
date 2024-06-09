import json
import os
import random
import sys

def fetch_and_randomize_images(directory):
    images = []
    base_directory = os.path.relpath(directory, os.path.join(os.path.dirname(__file__), '..'))
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4')):
                full_path = os.path.join(root, file)
                relative_path = os.path.relpath(full_path, start=os.path.dirname(__file__)) # Ensure correct relative path
                relative_path = relative_path.replace("\\", "/")  # Convert backslashes to forward slashes
                images.append(relative_path)  # Ensure the path is relative to the root directory

    # Randomize the list of image paths
    random.shuffle(images)

    # Write the randomized list of image paths to the images.json file
    with open('images.json', 'w') as f:
        json.dump(images, f)

if __name__ == '__main__':
    if len(sys.argv) > 1:
        fetch_and_randomize_images(sys.argv[1])
    else:
        print("Usage: python fetch_images.py <directory>")
