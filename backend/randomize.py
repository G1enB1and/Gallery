import json
import os
import random
import sys

def randomize_images(directory):
    images = []
    base_directory = os.path.relpath(directory, os.path.join(os.path.dirname(__file__), '..'))
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4')):
                relative_path = os.path.relpath(os.path.join(root, file), start=os.path.join(os.path.dirname(__file__), '..'))
                images.append(relative_path)  # Ensure the path is relative to the root directory

    # Randomize the list of image paths
    random.shuffle(images)

    # Write the randomized list of image paths to the images.json file
    with open('images.json', 'w') as f:
        json.dump(images, f)

if __name__ == '__main__':
    if len(sys.argv) > 1:
        randomize_images(sys.argv[1])
    else:
        print("Usage: python randomize.py <directory>")