import webview
import threading
from app import app
import ctypes
import os
import time
import pygetwindow as gw

def start_flask_app():
    app.run()

def set_window_icon():
    # Allow some time for the window to be created
    time.sleep(1)

    # Get the path to the icon file
    icon_path = os.path.abspath("static/images/LogoIcon.ico")

    # Find the window by title
    windows = gw.getWindowsWithTitle('PicTagger')
    if not windows:
        return

    hwnd = windows[0]._hWnd

    # Load the icon
    icon = ctypes.windll.user32.LoadImageW(0, icon_path, 1, 0, 0, 0x00000010)

    # Set the icon for the window
    ctypes.windll.user32.SendMessageW(hwnd, 0x0080, 0, icon)  # WM_SETICON for small icon
    ctypes.windll.user32.SendMessageW(hwnd, 0x0080, 1, icon)  # WM_SETICON for big icon

if __name__ == '__main__':
    # Start Flask in a separate thread
    threading.Thread(target=start_flask_app).start()

    # Create a webview window with a custom title
    window = webview.create_window(
        title='PicTagger',
        url='http://127.0.0.1:5000',
        width=1200,
        height=768
    )

    # Set the window icon after the window has been created
    webview.start(set_window_icon)
