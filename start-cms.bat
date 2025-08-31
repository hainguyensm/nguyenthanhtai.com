@echo off
echo Starting CMS System...
echo.

REM Start backend
echo Starting Flask backend...
cd cms-backend
start "CMS Backend" cmd /k "python app.py"
cd ..

REM Wait a moment for backend to start
timeout /t 3 /nobreak > nul

REM Start frontend
echo Starting React frontend...
cd cms-frontend
start "CMS Frontend" cmd /k "npm start"
cd ..

echo.
echo CMS System is starting up!
echo Backend: http://localhost:5001
echo Frontend: http://localhost:3000
echo Admin Panel: http://localhost:3000/admin
echo.
echo Default login:
echo Username: admin
echo Password: admin123
echo.
pause