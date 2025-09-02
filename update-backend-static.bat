@echo off
echo Updating backend with latest frontend build...
echo.

echo Step 1: Building frontend...
cd cms-frontend
call npm run build
if errorlevel 1 (
    echo Error: Failed to build frontend
    pause
    exit /b 1
)
echo Frontend build completed successfully!
echo.

echo Step 2: Removing old static files from backend...
cd ..\cms-backend
if exist static\js rmdir /s /q static\js
if exist static\css rmdir /s /q static\css
echo Old files removed!
echo.

echo Step 3: Copying new static files to backend...
xcopy ..\cms-frontend\build\static\* static\ /E /Y /I /Q
if errorlevel 1 (
    echo Error: Failed to copy static files
    pause
    exit /b 1
)
echo Static files copied!
echo.

echo Step 4: Copying index.html to templates...
copy /Y ..\cms-frontend\build\index.html templates\index.html >nul
if errorlevel 1 (
    echo Error: Failed to copy index.html
    pause
    exit /b 1
)
echo index.html copied!
echo.

echo ========================================
echo Backend updated successfully with latest frontend build!
echo ========================================
echo.
echo You can now run the backend server to see the changes.
pause