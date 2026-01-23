@echo off
setlocal

REM Navigate to the directory of this script
pushd "%~dp0"

echo
echo Cargo1212 Backend Setup (PostgreSQL)
echo =====================================
echo.
echo This project uses PostgreSQL database exclusively.
echo Setting up PostgreSQL database...
echo.

REM Setup PostgreSQL database
call setup_postgres.bat
if errorlevel 1 (
    echo ERROR: PostgreSQL setup failed.
    echo Please ensure PostgreSQL is installed and running.
    goto :end
)

echo
echo Setting up Django backend environment
echo =====================================

REM 1) Create virtual environment if it does not exist
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
) else (
    echo Virtual environment already exists
)

REM 2) Activate virtual environment
echo Activating virtual environment...
call ".\venv\Scripts\activate"

REM 3) Upgrade pip
echo Upgrading pip...
python -m pip install --upgrade pip

REM 4) Install dependencies
if exist "requirements.txt" (
    echo Installing requirements...
    pip install -r requirements.txt
) else (
    echo ERROR: requirements.txt not found
    goto :end
)

REM 5) Create database directory
echo Ensuring database directory exists...
if not exist "db" (
    mkdir db
    echo Database directory created
) else (
    echo Database directory already exists
)

REM 6) Create SQLite database file
echo Ensuring SQLite database file exists...
if not exist "db\db.sqlite3" (
    type nul > "db\db.sqlite3"
    echo db.sqlite3 created
) else (
    echo db.sqlite3 already exists
)

REM 7) Run Django migrations
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

echo Creating Admin account...
python create_admin.py
if errorlevel 1 (
    echo ERROR: Admin Creation failed
    goto :end
)

REM
REM 8) Run Django system check
echo Running Django system checks...
python manage.py check
if errorlevel 1 (
    echo ERROR: Django check failed
    goto :end
)

REM 9) Test database connection
@REM echo
@REM echo Testing Database Connection
@REM echo ============================
@REM python test_db_connection.py
@REM if errorlevel 1 (
@REM     echo ERROR: Database connection test failed.
@REM     goto :end
@REM )

REM 10) Start auto-selection monitor in background
echo
echo Starting Auto-Selection Monitor
echo ===============================
start "Cargo1212 Auto-Selection" cmd /c "auto_select_monitor.bat"

REM Small delay to let the monitor start
timeout /t 2 /nobreak > nul

REM 11) Start development server
echo
echo Starting Django development server
echo ==================================
python manage.py runserver 8000

:end
echo.
echo Script finished
pause
