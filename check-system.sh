#!/bin/bash

# 🔍 Connectify System Check Script
# This script verifies that all components are working correctly

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_BASE="http://localhost:1512"
TIMEOUT=10

# Function to print colored output
print_status() {
    echo -e "${BLUE}[CHECK]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# HTTP request function
http_check() {
    local url="$1"
    local expected_status="$2"
    local description="$3"
    
    print_status "Testing: $description"
    
    if command_exists curl; then
        response=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout $TIMEOUT "$url" 2>/dev/null)
        if [ "$response" = "$expected_status" ]; then
            print_success "$description - Status: $response"
            return 0
        else
            print_error "$description - Expected: $expected_status, Got: $response"
            return 1
        fi
    else
        print_warning "curl not available, skipping HTTP check for: $description"
        return 1
    fi
}

# Check prerequisites
check_prerequisites() {
    echo "🔧 Checking Prerequisites..."
    echo "=========================="
    
    # Java
    print_status "Checking Java..."
    if command_exists java; then
        java_version=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2)
        print_success "Java found: $java_version"
    else
        print_error "Java not found"
        return 1
    fi
    
    # Maven
    print_status "Checking Maven..."
    if command_exists mvn; then
        maven_version=$(mvn -version 2>/dev/null | head -n 1)
        print_success "Maven found: $maven_version"
    else
        print_error "Maven not found"
        return 1
    fi
    
    # MySQL
    print_status "Checking MySQL..."
    if command_exists mysql; then
        mysql_version=$(mysql --version 2>/dev/null)
        print_success "MySQL found: $mysql_version"
    else
        print_warning "MySQL command not found (may still be running as service)"
    fi
    
    echo
}

# Check if server is running
check_server() {
    echo "🚀 Checking Server Status..."
    echo "============================"
    
    # Check if port 1512 is listening
    print_status "Checking if port 1512 is open..."
    if command_exists netstat; then
        if netstat -tuln 2>/dev/null | grep -q ":1512 "; then
            print_success "Port 1512 is listening"
        else
            print_error "Port 1512 is not listening"
            print_info "Server may not be running. Start with: cd Server && mvn tomcat7:run"
            return 1
        fi
    elif command_exists ss; then
        if ss -tuln 2>/dev/null | grep -q ":1512 "; then
            print_success "Port 1512 is listening"
        else
            print_error "Port 1512 is not listening"
            return 1
        fi
    else
        print_warning "Cannot check port status (netstat/ss not available)"
    fi
    
    echo
}

# Test API endpoints
test_apis() {
    echo "🌐 Testing API Endpoints..."
    echo "=========================="
    
    local failed=0
    
    # Test public endpoints
    print_info "Testing public endpoints..."
    
    http_check "$API_BASE/electronics" "200" "Electronics list" || ((failed++))
    http_check "$API_BASE/categories" "200" "Categories list" || ((failed++))
    http_check "$API_BASE/brands" "200" "Brands list" || ((failed++))
    
    # Test auth endpoints
    print_info "Testing authentication endpoints..."
    
    http_check "$API_BASE/auth/login" "400" "Login endpoint (expects POST)" || ((failed++))
    http_check "$API_BASE/auth/signup" "400" "Signup endpoint (expects POST)" || ((failed++))
    
    # Test protected endpoints (should return 401 without auth)
    print_info "Testing protected endpoints..."
    
    http_check "$API_BASE/users/me" "401" "User profile (unauthorized)" || ((failed++))
    http_check "$API_BASE/admin/users/statistics" "401" "Admin stats (unauthorized)" || ((failed++))
    
    # Test image serving
    print_info "Testing image serving..."
    
    http_check "$API_BASE/images/test.jpg" "404" "Image serving endpoint" || ((failed++))
    http_check "$API_BASE/uploads/test.jpg" "404" "Upload serving endpoint" || ((failed++))
    
    echo
    if [ $failed -eq 0 ]; then
        print_success "All API tests passed!"
    else
        print_warning "$failed API tests failed"
    fi
    
    return $failed
}

# Test database connection
test_database() {
    echo "🗄️ Testing Database Connection..."
    echo "================================"
    
    if command_exists mysql; then
        print_status "Attempting to connect to database..."
        
        # Try to connect (will prompt for password if needed)
        if mysql -u root -e "SHOW DATABASES;" >/dev/null 2>&1; then
            print_success "Database connection successful"
            
            # Check if connectify_db exists
            if mysql -u root -e "USE connectify_db; SHOW TABLES;" >/dev/null 2>&1; then
                print_success "Connectify database found"
                
                # Count records in main tables
                electronics_count=$(mysql -u root -e "USE connectify_db; SELECT COUNT(*) FROM electronics;" 2>/dev/null | tail -n 1)
                users_count=$(mysql -u root -e "USE connectify_db; SELECT COUNT(*) FROM users;" 2>/dev/null | tail -n 1)
                
                print_info "Electronics: $electronics_count records"
                print_info "Users: $users_count records"
            else
                print_warning "Connectify database not found"
            fi
        else
            print_warning "Cannot connect to database (may need password)"
        fi
    else
        print_warning "MySQL client not available for testing"
    fi
    
    echo
}

# Check file system
check_filesystem() {
    echo "📁 Checking File System..."
    echo "========================="
    
    # Check if project structure exists
    print_status "Checking project structure..."
    
    if [ -d "Server" ]; then
        print_success "Server directory found"
    else
        print_error "Server directory not found"
        return 1
    fi
    
    if [ -f "Server/pom.xml" ]; then
        print_success "Maven POM file found"
    else
        print_error "Maven POM file not found"
        return 1
    fi
    
    # Check for compiled classes
    if [ -d "Server/target" ]; then
        print_success "Target directory found (project has been built)"
    else
        print_warning "Target directory not found (project may need building)"
    fi
    
    # Check image directory
    print_status "Checking image directory configuration..."
    
    if [ -f "Server/src/main/java/com/qhoang/connectify/controller/ImageController.java" ]; then
        upload_dir=$(grep "UPLOAD_DIR" "Server/src/main/java/com/qhoang/connectify/controller/ImageController.java" | head -n 1)
        print_info "Image directory config: $upload_dir"
        
        # Extract path from the line
        dir_path=$(echo "$upload_dir" | sed 's/.*"\(.*\)".*/\1/')
        if [ -d "$dir_path" ]; then
            print_success "Image directory exists: $dir_path"
        else
            print_warning "Image directory does not exist: $dir_path"
            print_info "Create with: mkdir -p \"$dir_path\""
        fi
    else
        print_error "ImageController.java not found"
    fi
    
    echo
}

# Generate system report
generate_report() {
    echo "📊 System Report"
    echo "==============="
    
    echo "Date: $(date)"
    echo "System: $(uname -a 2>/dev/null || echo 'Unknown')"
    
    if command_exists java; then
        echo "Java: $(java -version 2>&1 | head -n 1)"
    fi
    
    if command_exists mvn; then
        echo "Maven: $(mvn -version 2>/dev/null | head -n 1)"
    fi
    
    if command_exists mysql; then
        echo "MySQL: $(mysql --version 2>/dev/null)"
    fi
    
    echo "API Base: $API_BASE"
    echo "Working Directory: $(pwd)"
    
    echo
}

# Main function
main() {
    echo "🔍 Connectify System Check"
    echo "========================="
    echo "This script will verify that all components are working correctly."
    echo
    
    local total_errors=0
    
    # Run all checks
    check_prerequisites || ((total_errors++))
    check_server || ((total_errors++))
    test_apis || ((total_errors++))
    test_database || ((total_errors++))
    check_filesystem || ((total_errors++))
    
    # Generate report
    generate_report
    
    # Summary
    echo "🎯 Summary"
    echo "========="
    
    if [ $total_errors -eq 0 ]; then
        print_success "All checks passed! System is ready. 🎉"
        echo
        print_info "You can now:"
        echo "  • Access API at: $API_BASE"
        echo "  • View products: $API_BASE/electronics"
        echo "  • Test login: $API_BASE/auth/login"
        echo
    else
        print_warning "$total_errors issues found. Check the output above for details."
        echo
        print_info "Common solutions:"
        echo "  • Start server: cd Server && mvn tomcat7:run"
        echo "  • Build project: cd Server && mvn clean install"
        echo "  • Check database: mysql -u root -p"
        echo "  • See troubleshooting: cat TROUBLESHOOTING.md"
        echo
    fi
}

# Run main function
main "$@"
