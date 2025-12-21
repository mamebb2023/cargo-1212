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

REM 7) Start the development server on port 8000
echo Starting server on http://127.0.0.1:8000 ...
python manage.py runserver 8000

:end
popd
endlocal

