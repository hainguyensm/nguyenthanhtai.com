@echo off
echo.
echo ============================================================
echo           PREPARING CMS FOR RENDER.COM DEPLOYMENT
echo ============================================================
echo.

echo Step 1: Building React frontend for production...
cd cms-frontend
call npm run build
if errorlevel 1 (
    echo Error building frontend. Please check for errors above.
    pause
    exit /b 1
)

echo.
echo Step 2: Copying built frontend to backend...
cd ..
rmdir /s /q cms-backend\static 2>nul
mkdir cms-backend\static
xcopy /E /I /Y "cms-frontend\build\*" "cms-backend\static\"
if errorlevel 1 (
    echo Error copying files. Please check permissions.
    pause
    exit /b 1
)

echo.
echo Step 3: Checking required files...
if not exist "render.yaml" (
    echo ERROR: render.yaml not found!
    pause
    exit /b 1
)

if not exist "cms-backend\requirements.txt" (
    echo ERROR: requirements.txt not found!
    pause
    exit /b 1
)

echo.
echo ============================================================
echo                    DEPLOYMENT READY!
echo ============================================================
echo.
echo Your CMS is now ready for Render.com deployment.
echo.
echo Next steps:
echo 1. Push your code to GitHub:
echo    git add .
echo    git commit -m "Ready for Render deployment"  
echo    git push origin main
echo.
echo 2. Go to render.com and create a new Web Service
echo 3. Connect your GitHub repository
echo 4. Render will automatically detect render.yaml and deploy!
echo.
echo See DEPLOY-RENDER.md for detailed instructions.
echo.
pause