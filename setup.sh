#!/bin/bash

# 🚀 Connectify Auto Setup Script
# This script automates the setup process for Connectify project

set -e  # Exit on any error

echo "🚀 Starting Connectify Setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Java
check_java() {
    print_status "Checking Java installation..."
    if command_exists java; then
        JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2)
        print_success "Java found: $JAVA_VERSION"
        
        # Check if Java 11
        if [[ $JAVA_VERSION == 11.* ]]; then
            print_success "Java 11 detected ✓"
        else
            print_warning "Java 11 recommended, found: $JAVA_VERSION"
        fi
    else
        print_error "Java not found! Please install Java 11"
        exit 1
    fi
}

# Check Maven
check_maven() {
    print_status "Checking Maven installation..."
    if command_exists mvn; then
        MAVEN_VERSION=$(mvn -version | head -n 1)
        print_success "Maven found: $MAVEN_VERSION"
    else
        print_error "Maven not found! Please install Maven 3.6+"
        exit 1
    fi
}

# Check MySQL
check_mysql() {
    print_status "Checking MySQL installation..."
    if command_exists mysql; then
        MYSQL_VERSION=$(mysql --version)
        print_success "MySQL found: $MYSQL_VERSION"
    else
        print_warning "MySQL not found! Please install MySQL 5.7+"
    fi
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    read -p "Enter MySQL root password: " -s MYSQL_ROOT_PASSWORD
    echo
    
    read -p "Enter database name (default: connectify_db): " DB_NAME
    DB_NAME=${DB_NAME:-connectify_db}
    
    read -p "Enter database user (default: connectify_user): " DB_USER
    DB_USER=${DB_USER:-connectify_user}
    
    read -p "Enter database password: " -s DB_PASSWORD
    echo
    
    # Create database and user
    mysql -u root -p$MYSQL_ROOT_PASSWORD -e "
        CREATE DATABASE IF NOT EXISTS $DB_NAME;
        CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
        GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
        FLUSH PRIVILEGES;
    " 2>/dev/null
    
    if [ $? -eq 0 ]; then
        print_success "Database setup completed"
        
        # Update application.properties
        PROPS_FILE="Server/src/main/resources/application.properties"
        if [ -f "$PROPS_FILE" ]; then
            print_status "Updating database configuration..."
            sed -i.bak "s|spring.datasource.url=.*|spring.datasource.url=jdbc:mysql://localhost:3306/$DB_NAME|g" "$PROPS_FILE"
            sed -i.bak "s|spring.datasource.username=.*|spring.datasource.username=$DB_USER|g" "$PROPS_FILE"
            sed -i.bak "s|spring.datasource.password=.*|spring.datasource.password=$DB_PASSWORD|g" "$PROPS_FILE"
            print_success "Database configuration updated"
        fi
    else
        print_error "Database setup failed"
        exit 1
    fi
}

# Setup image directory
setup_image_directory() {
    print_status "Setting up image directory..."
    
    read -p "Enter image storage path (e.g., /home/user/connectify/data/): " IMAGE_DIR
    
    if [ ! -z "$IMAGE_DIR" ]; then
        # Create directory
        mkdir -p "$IMAGE_DIR"
        chmod 755 "$IMAGE_DIR"
        
        # Update ImageController
        CONTROLLER_FILE="Server/src/main/java/com/qhoang/connectify/controller/ImageController.java"
        if [ -f "$CONTROLLER_FILE" ]; then
            # Escape path for sed
            ESCAPED_PATH=$(echo "$IMAGE_DIR" | sed 's/[[\.*^$()+?{|]/\\&/g')
            sed -i.bak "s|private final String UPLOAD_DIR = \".*\";|private final String UPLOAD_DIR = \"$ESCAPED_PATH\";|g" "$CONTROLLER_FILE"
            print_success "Image directory configured: $IMAGE_DIR"
        else
            print_error "ImageController.java not found"
        fi
    else
        print_warning "Image directory not configured. Please update manually."
    fi
}

# Build project
build_project() {
    print_status "Building project..."
    
    cd Server
    mvn clean install -DskipTests
    
    if [ $? -eq 0 ]; then
        print_success "Project built successfully"
    else
        print_error "Build failed"
        exit 1
    fi
    
    cd ..
}

# Main setup function
main() {
    echo "🚀 Connectify Auto Setup"
    echo "========================"
    
    # Check prerequisites
    check_java
    check_maven
    check_mysql
    
    echo
    print_status "All prerequisites checked!"
    echo
    
    # Setup components
    read -p "Setup database? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        setup_database
    fi
    
    echo
    read -p "Setup image directory? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        setup_image_directory
    fi
    
    echo
    read -p "Build project? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        build_project
    fi
    
    echo
    print_success "Setup completed! 🎉"
    echo
    print_status "To start the application:"
    echo "  cd Server"
    echo "  mvn tomcat7:run"
    echo
    print_status "Application will be available at: http://localhost:1512"
}

# Run main function
main "$@"
