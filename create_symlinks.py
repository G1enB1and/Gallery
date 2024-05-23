import os
import sys

def create_symlink(target, link_name):
    try:
        os.symlink(target, link_name)
        print(f"Created symlink: {link_name} -> {target}")
    except Exception as e:
        print(f"Failed to create symlink: {link_name} -> {target}")
        print(f"Error: {e}")

def main():
    # Define the directories to be linked
    symlinks = [
        {"target": "C:\\Pictures\\AI generated", "link_name": "C:\\Pictures\\Gallery\\Pictures\\AI_generated"},
        {"target": "C:\\Pictures\\Wallpaper", "link_name": "C:\\Pictures\\Gallery\\Pictures\\Wallpaper"}
    ]

    # Create each symlink
    for symlink in symlinks:
        create_symlink(symlink["target"], symlink["link_name"])

if __name__ == "__main__":
    if os.name == 'nt':  # Check if the system is Windows
        if not sys.platform.startswith('win'):
            print("This script is intended to be run on Windows.")
            sys.exit(1)
        main()
    else:
        print("This script is intended to be run on Windows.")
