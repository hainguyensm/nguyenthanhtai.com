@echo off
echo.
echo ============================================================
echo             CMS SYSTEM - UNIFIED APPLICATION
echo ============================================================
echo.
echo Starting unified CMS (Frontend + Backend)...
echo.

cd cms-backend
echo Activating Python virtual environment...
call venv\Scripts\activate 2>nul

echo Starting server...
python app_unified.py

pause