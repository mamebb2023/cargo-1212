@echo off
setlocal

REM PostgreSQL Setup Script for Cargo1212
REM This script sets up PostgreSQL database for the Cargo1212 application

echo Cargo1212 PostgreSQL Database Setup
echo ====================================

REM Check if PostgreSQL is installed
where psql >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: PostgreSQL is not installed or not in PATH.
    echo.
    echo Please install PostgreSQL first:
    echo 1. Download from: https://www.postgresql.org/download/windows/
    echo 2. Or use Chocolatey: choco install postgresql
    echo 3. Make sure psql.exe is in your PATH
    echo.
    echo After installation, run this script again.
    pause
    exit /b 1
)

echo ✅ PostgreSQL found. Proceeding with setup...

REM Set database credentials
set DB_NAME=cargo1212
set DB_USER=postgres
set DB_PASSWORD=password
set DB_HOST=localhost
set DB_PORT=5432

echo.
echo Database Configuration:
echo Name: %DB_NAME%
echo User: %DB_USER%
echo Host: %DB_HOST%
echo Port: %DB_PORT%
echo.

:create_database
echo Creating database '%DB_NAME%'...

REM Create database if it doesn't exist
psql -U %DB_USER% -h %DB_HOST% -p %DB_PORT% -c "SELECT 'Database already exists' WHERE EXISTS (SELECT 1 FROM pg_database WHERE datname = '%DB_NAME%');" | findstr "already exists" >nul
if %errorlevel% equ 0 (
    echo Database '%DB_NAME%' already exists.
) else (
    psql -U %DB_USER% -h %DB_HOST% -p %DB_PORT% -c "CREATE DATABASE %DB_NAME%;"
    if %errorlevel% equ 0 (
        echo SUCCESS: Database '%DB_NAME%' created successfully.
    ) else (
        echo ERROR: Failed to create database. Please check your PostgreSQL credentials.
        pause
        exit /b 1
    )
)

echo.
echo PostgreSQL setup completed successfully!
echo.
echo Next steps:
echo 1. Copy .env.example to .env and update the database settings if needed
echo 2. Run 'python manage.py migrate' to create tables
echo 3. Run 'python manage.py createsuperuser' to create admin user
echo 4. Run 'python manage.py runserver' to start the development server
echo.

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo Creating .env file with default settings...
    echo # Database Configuration > .env
    echo DB_NAME=%DB_NAME% >> .env
    echo DB_USER=%DB_USER% >> .env
    echo DB_PASSWORD=%DB_PASSWORD% >> .env
    echo DB_HOST=%DB_HOST% >> .env
    echo DB_PORT=%DB_PORT% >> .env
    echo. >> .env
    echo # Django Configuration >> .env
    echo SECRET_KEY=django-insecure-cargo-bidding-system-secret-key-change-in-production >> .env
    echo DEBUG=True >> .env
    echo ALLOWED_HOSTS=localhost,127.0.0.1 >> .env
    echo. >> .env
    echo # JWT Configuration >> .env
    echo JWT_SECRET_KEY=your-jwt-secret-key-here >> .env
    echo.
    echo .env file created. Please review and update the settings as needed.
)

pause
