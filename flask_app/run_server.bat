@echo off
REM Get the directory of the batch file
SET "BATCH_DIR=%~dp0"

REM Change to the project root directory (Gallery folder)
cd /d "%BATCH_DIR%..\flask_app"

REM Run the randomize script with the initial directory
python backend/fetch_images.py "Pictures/.."

REM Run the server script
python main.py

REM Keep the terminal open to display any errors
echo.
echo Server is running. Press Ctrl+C to stop.
pause
