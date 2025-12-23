@echo off
setlocal

REM Navigate to the directory of this script
pushd "%~dp0"

echo ============================================
echo Setting up backend environment
echo ============================================

REM 1) Create virtual environment if it does not exist
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM 2) Activate virtual environment
echo Activating virtual environment...
call ".\venv\Scripts\activate.bat"

REM 3) Upgrade pip and install dependencies
echo Upgrading pip...
python -m pip install --upgrade pip

echo Installing requirements...
if exist "requirements.txt" (
    pip install -r requirements.txt
) else (
    echo requirements.txt not found. Please ensure it exists.
    goto :end
)

REM 4) Run database migrations
echo Applying migrations...
python manage.py migrate

REM 5) (Optional) Collect static files - uncomment if needed
REM python manage.py collectstatic --noinput

REM 6) Copy frontend environment file
echo Setting up frontend environment file...
if exist "..\frontend\.env.example" (
    if not exist "..\frontend\.env" (
        copy "..\frontend\.env.example" "..\frontend\.env"
        echo Frontend .env file created from .env.example
    ) else (
        echo Frontend .env file already exists
    )
) else (
    echo Frontend .env.example file not found
)

REM 7) Create database directory and file
echo Creating database directory and file...
if not exist "db" (
    mkdir db
    echo Database directory created
)
if not exist "db\db.sqlite3" (
    echo. > db\db.sqlite3
    echo Database file created
) else (
    echo Database file already exists
)

REM 8) Create admin user
echo Creating admin user...
python manage.py shell -c "
from django.contrib.auth import get_user_model
from django.core.management import execute_from_command_line
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cargo.settings')
django.setup()

User = get_user_model()

# Check if admin user already exists
if not User.objects.filter(email='admin@admin.com').exists():
    admin_user = User.objects.create_user(
        email='admin@admin.com',
        password='12345678Wertyui',
        full_name='Admin User',
        role='admin',
        is_verified=True
    )
    print('Admin user created successfully')
    print('Email: admin@admin.com')
    print('Password: 12345678Wertyui')
else:
    print('Admin user already exists')
"

REM 9) Start the development server on port 8000
echo Starting server on http://127.0.0.1:8000 ...
python manage.py runserver 8000

:end
popd
endlocal

