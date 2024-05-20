import json
import os
import random

def randomize_images():
    images = []
    for root, dirs, files in os.walk('Pictures'):
        for file in files:
            if file.endswith(('.jpg', '.jpeg', '.png', '.gif', '.webp')):
                images.append(os.path.join(root, file))

    # Randomize the list of image paths
    random.shuffle(images)

    # Write the randomized list of image paths to the images.json file
    with open('images.json', 'w') as f:
        json.dump(images, f)

if __name__ == '__main__':
    randomize_images()
