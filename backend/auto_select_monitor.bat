@echo off
setlocal enabledelayedexpansion

REM Auto-selection monitor script
REM Runs continuously and checks for expired bid deadlines every 2 seconds

echo Starting Cargo1212 Auto-Selection Monitor...
echo Checking for expired bids every 2 seconds
echo Press Ctrl+C to stop
echo.

REM Set Django environment
set DJANGO_SETTINGS_MODULE=config.settings

REM Get the directory where this script is located
for %%i in ("%~dp0.") do set "SCRIPT_DIR=%%~fi"

REM Navigate to backend directory (assuming script is in backend folder)
cd /d "%SCRIPT_DIR%"

REM Activate virtual environment
call ".\venv\Scripts\activate"

:loop
    REM Get current timestamp using environment variables
    set "timestamp=%date% %time%"

    REM Run auto-selection command
    echo ---
    echo [%timestamp%] Checking for expired bids...
    python manage.py auto_select_offers --quiet

    REM Wait 2 seconds before next check
    timeout /t 2 /nobreak > nul
goto loop

:end
echo Auto-selection monitor stopped.
pause
