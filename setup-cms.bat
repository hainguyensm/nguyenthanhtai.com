@echo off
echo CMS System Setup
echo =================
echo.

echo Setting up backend...
cd cms-backend

REM Create virtual environment if it doesn't exist
if not exist venv (
    echo Creating Python virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo Error creating virtual environment. Make sure Python 3.8+ is installed.
        pause
        exit /b 1
    )
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate

REM Install backend dependencies
echo Installing Python dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo Error installing Python dependencies.
    pause
    exit /b 1
)

cd ..

echo.
echo Setting up frontend...
cd cms-frontend

REM Install frontend dependencies
echo Installing Node.js dependencies...
npm install
if errorlevel 1 (
    echo Error installing Node.js dependencies. Make sure Node.js 16+ is installed.
    pause
    exit /b 1
)

cd ..

echo.
echo Setup completed successfully!
echo.
echo To start the CMS system, run: start-cms.bat
echo Or manually:
echo 1. Backend: cd cms-backend && venv\Scripts\activate && python app.py
echo 2. Frontend: cd cms-frontend && npm start
echo.
echo Default admin login:
echo Username: admin
echo Password: admin123
echo.
pause