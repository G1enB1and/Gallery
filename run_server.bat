@echo off
REM Get the directory of the batch file
SET "BATCH_DIR=%~dp0"

REM Change to the directory of the batch file
cd /d "%BATCH_DIR%"

REM Run the randomize script
python randomize.py

REM Change to the backend directory
cd /d "%BATCH_DIR%backend"
python server.py

REM Keep the terminal open to display any errors
echo.
echo Server is running. Press Ctrl+C to stop.
pause
