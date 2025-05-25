@echo off
REM 🔍 Connectify System Check Script for Windows
REM This script verifies that all components are working correctly

setlocal enabledelayedexpansion

echo 🔍 Connectify System Check
echo =========================
echo This script will verify that all components are working correctly.
echo.

set API_BASE=http://localhost:1512
set TOTAL_ERRORS=0

REM Check Prerequisites
echo 🔧 Checking Prerequisites...
echo ==========================

REM Check Java
echo [CHECK] Checking Java...
java -version >nul 2>&1
if %errorlevel% equ 0 (
    echo [PASS] Java found
    java -version 2>&1 | findstr "version"
) else (
    echo [FAIL] Java not found
    set /a TOTAL_ERRORS+=1
)

REM Check Maven
echo [CHECK] Checking Maven...
mvn -version >nul 2>&1
if %errorlevel% equ 0 (
    echo [PASS] Maven found
    mvn -version 2>&1 | findstr "Apache Maven"
) else (
    echo [FAIL] Maven not found
    set /a TOTAL_ERRORS+=1
)

REM Check MySQL
echo [CHECK] Checking MySQL...
mysql --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [PASS] MySQL found
    mysql --version
) else (
    echo [WARN] MySQL command not found (may still be running as service)
)

echo.

REM Check Server Status
echo 🚀 Checking Server Status...
echo ============================

echo [CHECK] Checking if port 1512 is open...
netstat -an | findstr ":1512" >nul 2>&1
if %errorlevel% equ 0 (
    echo [PASS] Port 1512 is listening
) else (
    echo [FAIL] Port 1512 is not listening
    echo [INFO] Server may not be running. Start with: cd Server ^&^& mvn tomcat7:run
    set /a TOTAL_ERRORS+=1
)

echo.

REM Test API Endpoints
echo 🌐 Testing API Endpoints...
echo ==========================

echo [INFO] Testing public endpoints...

REM Test Electronics API
echo [CHECK] Testing Electronics list...
powershell -Command "try { $response = Invoke-WebRequest -Uri '%API_BASE%/electronics' -TimeoutSec 10 -UseBasicParsing; if ($response.StatusCode -eq 200) { Write-Host '[PASS] Electronics list - Status: 200' } else { Write-Host '[FAIL] Electronics list - Status:' $response.StatusCode } } catch { Write-Host '[FAIL] Electronics list - Connection failed' }"

REM Test Categories API
echo [CHECK] Testing Categories list...
powershell -Command "try { $response = Invoke-WebRequest -Uri '%API_BASE%/categories' -TimeoutSec 10 -UseBasicParsing; if ($response.StatusCode -eq 200) { Write-Host '[PASS] Categories list - Status: 200' } else { Write-Host '[FAIL] Categories list - Status:' $response.StatusCode } } catch { Write-Host '[FAIL] Categories list - Connection failed' }"

REM Test Brands API
echo [CHECK] Testing Brands list...
powershell -Command "try { $response = Invoke-WebRequest -Uri '%API_BASE%/brands' -TimeoutSec 10 -UseBasicParsing; if ($response.StatusCode -eq 200) { Write-Host '[PASS] Brands list - Status: 200' } else { Write-Host '[FAIL] Brands list - Status:' $response.StatusCode } } catch { Write-Host '[FAIL] Brands list - Connection failed' }"

echo [INFO] Testing authentication endpoints...

REM Test Login endpoint (should return 400 for GET request)
echo [CHECK] Testing Login endpoint...
powershell -Command "try { $response = Invoke-WebRequest -Uri '%API_BASE%/auth/login' -TimeoutSec 10 -UseBasicParsing; Write-Host '[FAIL] Login endpoint - Unexpected success' } catch { if ($_.Exception.Response.StatusCode -eq 400) { Write-Host '[PASS] Login endpoint - Status: 400 (expected)' } else { Write-Host '[FAIL] Login endpoint - Status:' $_.Exception.Response.StatusCode } }"

echo [INFO] Testing protected endpoints...

REM Test protected endpoint (should return 401)
echo [CHECK] Testing User profile (unauthorized)...
powershell -Command "try { $response = Invoke-WebRequest -Uri '%API_BASE%/users/me' -TimeoutSec 10 -UseBasicParsing; Write-Host '[FAIL] User profile - Unexpected success' } catch { if ($_.Exception.Response.StatusCode -eq 401) { Write-Host '[PASS] User profile - Status: 401 (expected)' } else { Write-Host '[FAIL] User profile - Status:' $_.Exception.Response.StatusCode } }"

echo [INFO] Testing image serving...

REM Test image endpoints (should return 404 for non-existent image)
echo [CHECK] Testing Image serving endpoint...
powershell -Command "try { $response = Invoke-WebRequest -Uri '%API_BASE%/images/test.jpg' -TimeoutSec 10 -UseBasicParsing; Write-Host '[FAIL] Image serving - Unexpected success' } catch { if ($_.Exception.Response.StatusCode -eq 404) { Write-Host '[PASS] Image serving - Status: 404 (expected)' } else { Write-Host '[FAIL] Image serving - Status:' $_.Exception.Response.StatusCode } }"

echo.

REM Check Database
echo 🗄️ Testing Database Connection...
echo ================================

echo [CHECK] Attempting to connect to database...
mysql -u root -e "SHOW DATABASES;" >nul 2>&1
if %errorlevel% equ 0 (
    echo [PASS] Database connection successful
    
    REM Check if connectify_db exists
    mysql -u root -e "USE connectify_db; SHOW TABLES;" >nul 2>&1
    if %errorlevel% equ 0 (
        echo [PASS] Connectify database found
        
        REM Count records (if possible)
        echo [INFO] Checking database records...
        for /f %%i in ('mysql -u root -e "USE connectify_db; SELECT COUNT(*) FROM electronics;" 2^>nul ^| findstr /v "COUNT"') do set electronics_count=%%i
        for /f %%i in ('mysql -u root -e "USE connectify_db; SELECT COUNT(*) FROM users;" 2^>nul ^| findstr /v "COUNT"') do set users_count=%%i
        
        if defined electronics_count echo [INFO] Electronics: !electronics_count! records
        if defined users_count echo [INFO] Users: !users_count! records
    ) else (
        echo [WARN] Connectify database not found
    )
) else (
    echo [WARN] Cannot connect to database (may need password)
)

echo.

REM Check File System
echo 📁 Checking File System...
echo =========================

echo [CHECK] Checking project structure...

if exist "Server" (
    echo [PASS] Server directory found
) else (
    echo [FAIL] Server directory not found
    set /a TOTAL_ERRORS+=1
)

if exist "Server\pom.xml" (
    echo [PASS] Maven POM file found
) else (
    echo [FAIL] Maven POM file not found
    set /a TOTAL_ERRORS+=1
)

if exist "Server\target" (
    echo [PASS] Target directory found (project has been built)
) else (
    echo [WARN] Target directory not found (project may need building)
)

echo [CHECK] Checking image directory configuration...

if exist "Server\src\main\java\com\qhoang\connectify\controller\ImageController.java" (
    echo [INFO] ImageController.java found
    
    REM Extract upload directory path
    for /f "tokens=*" %%i in ('findstr "UPLOAD_DIR" "Server\src\main\java\com\qhoang\connectify\controller\ImageController.java"') do (
        echo [INFO] Image directory config: %%i
        
        REM Try to extract the path (basic extraction)
        for /f "tokens=2 delims==" %%j in ("%%i") do (
            set dir_path=%%j
            set dir_path=!dir_path: =!
            set dir_path=!dir_path:"=!
            set dir_path=!dir_path:;=!
            
            if exist "!dir_path!" (
                echo [PASS] Image directory exists: !dir_path!
            ) else (
                echo [WARN] Image directory does not exist: !dir_path!
                echo [INFO] Create with: mkdir "!dir_path!"
            )
        )
    )
) else (
    echo [FAIL] ImageController.java not found
    set /a TOTAL_ERRORS+=1
)

echo.

REM Generate System Report
echo 📊 System Report
echo ===============

echo Date: %date% %time%
echo System: Windows
echo API Base: %API_BASE%
echo Working Directory: %cd%

if exist "Server\pom.xml" (
    echo Maven Project: Found
) else (
    echo Maven Project: Not Found
)

echo.

REM Summary
echo 🎯 Summary
echo =========

if %TOTAL_ERRORS% equ 0 (
    echo [PASS] All checks passed! System is ready. 🎉
    echo.
    echo [INFO] You can now:
    echo   • Access API at: %API_BASE%
    echo   • View products: %API_BASE%/electronics
    echo   • Test login: %API_BASE%/auth/login
    echo.
) else (
    echo [WARN] %TOTAL_ERRORS% issues found. Check the output above for details.
    echo.
    echo [INFO] Common solutions:
    echo   • Start server: cd Server ^&^& mvn tomcat7:run
    echo   • Build project: cd Server ^&^& mvn clean install
    echo   • Check database: mysql -u root -p
    echo   • See troubleshooting: type TROUBLESHOOTING.md
    echo.
)

pause
