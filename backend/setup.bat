@echo off
setlocal

REM ============================================
REM Navigate to the directory of this script
REM ============================================
pushd "%~dp0"

echo ============================================
echo Setting up Django backend environment
echo ============================================

REM ============================================
REM 1) Create virtual environment if it does not exist
REM ============================================
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
) else (
    echo Virtual environment already exists
)

REM ============================================
REM 2) Activate virtual environment
REM ============================================
echo Activating virtual environment...
call ".\venv\Scripts\activate"

REM ============================================
REM 3) Upgrade pip
REM ============================================
echo Upgrading pip...
python -m pip install --upgrade pip

REM ============================================
REM 4) Install dependencies
REM ============================================
if exist "requirements.txt" (
    echo Installing requirements...
    pip install -r requirements.txt
) else (
    echo ERROR: requirements.txt not found
    goto :end
)

REM ============================================
REM 5) Create database directory
REM ============================================
echo Ensuring database directory exists...
if not exist "db" (
    mkdir db
    echo Database directory created
) else (
    echo Database directory already exists
)

REM ============================================
REM 6) Create SQLite database file
REM ============================================
echo Ensuring SQLite database file exists...
if not exist "db\db.sqlite3" (
    type nul > "db\db.sqlite3"
    echo db.sqlite3 created
) else (
    echo db.sqlite3 already exists
)

REM ============================================
REM 7) Run Django migrations
REM ============================================
echo Running makemigrations...
python manage.py makemigrations
if errorlevel 1 (
    echo ERROR: makemigrations failed
    goto :end
)

echo Running migrate...
python manage.py migrate
if errorlevel 1 (
    echo ERROR: migrate failed
    goto :end
)

REM
REM 8) Run Django system check
REM ============================================
echo Running Django system checks...
python manage.py check
if errorlevel 1 (
    echo ERROR: Django check failed
    goto :end
)

REM ============================================
REM 9) Start development server
REM ============================================
echo ============================================
echo Starting Django development server
echo ============================================
python manage.py runserver 8000

:end
echo.
echo Script finished
pause
