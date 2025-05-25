@echo off
REM 🚀 Connectify Auto Setup Script for Windows
REM This script automates the setup process for Connectify project

setlocal enabledelayedexpansion

echo 🚀 Starting Connectify Setup for Windows...
echo ==========================================

REM Check Java
echo [INFO] Checking Java installation...
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Java not found! Please install Java 11
    echo Download from: https://adoptium.net/
    pause
    exit /b 1
) else (
    echo [SUCCESS] Java found
)

REM Check Maven
echo [INFO] Checking Maven installation...
mvn -version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Maven not found! Please install Maven 3.6+
    echo Download from: https://maven.apache.org/download.cgi
    pause
    exit /b 1
) else (
    echo [SUCCESS] Maven found
)

REM Check MySQL
echo [INFO] Checking MySQL installation...
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] MySQL not found! Please install MySQL 5.7+
    echo Download from: https://dev.mysql.com/downloads/mysql/
) else (
    echo [SUCCESS] MySQL found
)

echo.
echo [INFO] All prerequisites checked!
echo.

REM Setup Database
set /p setup_db="Setup database? (y/n): "
if /i "%setup_db%"=="y" (
    echo [INFO] Setting up database...
    
    set /p db_name="Enter database name (default: connectify_db): "
    if "%db_name%"=="" set db_name=connectify_db
    
    set /p db_user="Enter database user (default: connectify_user): "
    if "%db_user%"=="" set db_user=connectify_user
    
    set /p db_password="Enter database password: "
    
    set /p mysql_root_password="Enter MySQL root password: "
    
    REM Create database
    echo CREATE DATABASE IF NOT EXISTS %db_name%; > temp_db_setup.sql
    echo CREATE USER IF NOT EXISTS '%db_user%'@'localhost' IDENTIFIED BY '%db_password%'; >> temp_db_setup.sql
    echo GRANT ALL PRIVILEGES ON %db_name%.* TO '%db_user%'@'localhost'; >> temp_db_setup.sql
    echo FLUSH PRIVILEGES; >> temp_db_setup.sql
    
    mysql -u root -p%mysql_root_password% < temp_db_setup.sql
    if %errorlevel% equ 0 (
        echo [SUCCESS] Database setup completed
        
        REM Update application.properties
        if exist "Server\src\main\resources\application.properties" (
            echo [INFO] Updating database configuration...
            powershell -Command "(Get-Content 'Server\src\main\resources\application.properties') -replace 'spring.datasource.url=.*', 'spring.datasource.url=jdbc:mysql://localhost:3306/%db_name%' | Set-Content 'Server\src\main\resources\application.properties'"
            powershell -Command "(Get-Content 'Server\src\main\resources\application.properties') -replace 'spring.datasource.username=.*', 'spring.datasource.username=%db_user%' | Set-Content 'Server\src\main\resources\application.properties'"
            powershell -Command "(Get-Content 'Server\src\main\resources\application.properties') -replace 'spring.datasource.password=.*', 'spring.datasource.password=%db_password%' | Set-Content 'Server\src\main\resources\application.properties'"
            echo [SUCCESS] Database configuration updated
        )
    ) else (
        echo [ERROR] Database setup failed
    )
    
    del temp_db_setup.sql
)

echo.

REM Setup Image Directory
set /p setup_img="Setup image directory? (y/n): "
if /i "%setup_img%"=="y" (
    echo [INFO] Setting up image directory...
    
    set /p image_dir="Enter image storage path (e.g., D:\Connectify\Data\): "
    
    if not "%image_dir%"=="" (
        REM Create directory
        if not exist "%image_dir%" mkdir "%image_dir%"
        
        REM Update ImageController
        if exist "Server\src\main\java\com\qhoang\connectify\controller\ImageController.java" (
            REM Escape backslashes for replacement
            set "escaped_path=!image_dir:\=\\!"
            powershell -Command "(Get-Content 'Server\src\main\java\com\qhoang\connectify\controller\ImageController.java') -replace 'private final String UPLOAD_DIR = \".*\";', 'private final String UPLOAD_DIR = \"!escaped_path!\";' | Set-Content 'Server\src\main\java\com\qhoang\connectify\controller\ImageController.java'"
            echo [SUCCESS] Image directory configured: %image_dir%
        ) else (
            echo [ERROR] ImageController.java not found
        )
    ) else (
        echo [WARNING] Image directory not configured. Please update manually.
    )
)

echo.

REM Build Project
set /p build_project="Build project? (y/n): "
if /i "%build_project%"=="y" (
    echo [INFO] Building project...
    
    cd Server
    mvn clean install -DskipTests
    
    if %errorlevel% equ 0 (
        echo [SUCCESS] Project built successfully
    ) else (
        echo [ERROR] Build failed
        cd ..
        pause
        exit /b 1
    )
    
    cd ..
)

echo.
echo [SUCCESS] Setup completed! 🎉
echo.
echo [INFO] To start the application:
echo   cd Server
echo   mvn tomcat7:run
echo.
echo [INFO] Application will be available at: http://localhost:1512
echo.
pause
