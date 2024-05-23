import json
import os
import random
import sys

def randomize_images(directory):
    images = []
    base_directory = os.path.basename(directory)
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.jpg', '.jpeg', '.png', '.gif', '.webp')):
                relative_path = os.path.relpath(os.path.join(root, file), start=directory)
                images.append(os.path.join('Pictures', base_directory, relative_path))  # Ensure prefixing with "Pictures" and base directory

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
