# 🔧 TROUBLESHOOTING GUIDE

## ❌ **COMMON ISSUES & SOLUTIONS**

### **1. Port 1512 Already in Use**
```bash
# Tìm process đang dùng port
netstat -ano | findstr :1512

# Kill process (Windows)
taskkill /PID <process_id> /F

# Kill process (Linux/macOS)
sudo kill -9 <process_id>

# Hoặc thay đổi port trong pom.xml
<cargo.servlet.port>8080</cargo.servlet.port>
```

### **2. Database Connection Failed**
```bash
# Kiểm tra MySQL service
# Windows: services.msc → MySQL
# Linux: sudo systemctl status mysql
# macOS: brew services list | grep mysql

# Test connection
mysql -u root -p -h localhost -P 3306

# Common fixes:
# 1. Update connection string
spring.datasource.url=jdbc:mysql://localhost:3306/connectify_db?useSSL=false&allowPublicKeyRetrieval=true

# 2. Check MySQL is running
sudo systemctl start mysql

# 3. Verify database exists
SHOW DATABASES;
```

### **3. Images Not Loading (404)**
```java
// 1. Verify UPLOAD_DIR path
File uploadDir = new File(UPLOAD_DIR);
System.out.println("Upload dir exists: " + uploadDir.exists());
System.out.println("Upload dir path: " + uploadDir.getAbsolutePath());

// 2. Check file permissions (Linux/macOS)
chmod 755 /path/to/data

// 3. Verify files exist
ls -la /path/to/data/

// 4. Test image URLs
http://localhost:1512/uploads/filename.jpg
http://localhost:1512/images/filename.jpg
```

### **4. Java Version Issues**
```bash
# Check JAVA_HOME
echo $JAVA_HOME

# Set JAVA_HOME
# Windows: set JAVA_HOME=C:\Program Files\Java\jdk-11
# Linux/macOS: export JAVA_HOME=/usr/lib/jvm/java-11-openjdk

# Verify Java version
java -version
javac -version
```

### **5. Maven Build Failures**
```bash
# Clear Maven cache
mvn dependency:purge-local-repository

# Force update dependencies
mvn clean install -U

# Skip tests if failing
mvn clean install -DskipTests

# Check Maven settings
mvn help:effective-settings
```

### **6. Tomcat Plugin Issues**
```bash
# If tomcat7:run fails, try:
mvn clean package
# Then manually deploy ROOT.war

# Alternative: Use embedded Tomcat
mvn spring-boot:run

# Check Tomcat logs
tail -f target/tomcat/logs/catalina.out
```

### **7. CORS Issues**
```javascript
// If frontend can't access API, check CORS
// Controllers should have:
@CrossOrigin(origins = "http://localhost:8000")

// Test CORS headers
curl -H "Origin: http://localhost:8000" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     http://localhost:1512/electronics
```

### **8. Memory Issues**
```bash
# Increase Maven memory
export MAVEN_OPTS="-Xmx1024m -XX:MaxPermSize=256m"

# Increase Tomcat memory
export CATALINA_OPTS="-Xmx1024m -XX:MaxPermSize=256m"
```

## 🔍 **DEBUGGING TIPS**

### **Enable Debug Logging**
```properties
# Add to application.properties
logging.level.com.qhoang.connectify=DEBUG
logging.level.org.springframework.web=DEBUG
logging.level.org.hibernate.SQL=DEBUG
```

### **Check Application Health**
```bash
# Test basic connectivity
curl -v http://localhost:1512/electronics

# Check response headers
curl -I http://localhost:1512/electronics

# Test with verbose output
curl -v -H "Accept: application/json" http://localhost:1512/electronics
```

### **Database Debugging**
```sql
-- Check tables created
SHOW TABLES;

-- Check data
SELECT COUNT(*) FROM electronics;
SELECT COUNT(*) FROM users;

-- Check recent entries
SELECT * FROM electronics ORDER BY id DESC LIMIT 5;
```

## 📱 **FRONTEND INTEGRATION ISSUES**

### **API Base URL Mismatch**
```javascript
// Frontend should use:
const API_BASE = "http://localhost:1512";

// Not:
const API_BASE = "http://localhost:1512/Connectify";
```

### **Image Path Issues**
```javascript
// Correct image URL construction:
const imageUrl = `http://localhost:1512${product.image}`;
// product.image already contains "/uploads/filename.jpg"

// Test image loading:
fetch('http://localhost:1512/uploads/sample.jpg')
  .then(response => console.log('Image status:', response.status));
```

## 🆘 **EMERGENCY RESET**

### **Complete Reset**
```bash
# 1. Stop all processes
pkill -f tomcat
pkill -f maven

# 2. Clean everything
mvn clean
rm -rf target/

# 3. Reset database
DROP DATABASE connectify_db;
CREATE DATABASE connectify_db;

# 4. Fresh build
mvn clean install -DskipTests
mvn tomcat7:run
```

## 📞 **GET HELP**
If issues persist:
1. Check logs in `target/tomcat/logs/`
2. Verify all prerequisites are met
3. Follow deployment guide step by step
4. Contact development team with error logs
