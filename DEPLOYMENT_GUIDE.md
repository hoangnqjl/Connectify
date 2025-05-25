# 🚀 CONNECTIFY DEPLOYMENT GUIDE

## 📋 **OVERVIEW**
Hướng dẫn triển khai dự án Connectify cho người clone từ Git repository.

## 🔧 **PREREQUISITES**

### **1. Java 11**
```bash
# Kiểm tra Java version
java -version
# Cần: openjdk version "11.0.x" hoặc Oracle JDK 11

# Download Java 11:
# Windows: https://adoptium.net/
# Linux: sudo apt install openjdk-11-jdk
# macOS: brew install openjdk@11
```

### **2. Maven 3.6+**
```bash
# Kiểm tra Maven
mvn -version

# Download Maven:
# Windows: https://maven.apache.org/download.cgi
# Linux: sudo apt install maven
# macOS: brew install maven
```

### **3. MySQL 5.7+**
```bash
# Kiểm tra MySQL
mysql --version

# Start MySQL service:
# Windows: net start mysql
# Linux: sudo systemctl start mysql
# macOS: brew services start mysql
```

## 📥 **INSTALLATION STEPS**

### **Step 1: Clone Repository**
```bash
git clone <repository-url>
cd Connectify
```

### **Step 2: Database Setup**
```sql
-- Tạo database
CREATE DATABASE connectify_db;

-- Tạo user (optional)
CREATE USER 'connectify_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON connectify_db.* TO 'connectify_user'@'localhost';
FLUSH PRIVILEGES;
```

### **Step 3: Cấu hình Database**
Cập nhật file `Server/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/connectify_db
spring.datasource.username=connectify_user
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
```

### **Step 4: ⚠️ Cấu hình Image Directory**
**QUAN TRỌNG:** Cập nhật đường dẫn trong `ImageController.java`:

```java
// File: Server/src/main/java/com/qhoang/connectify/controller/ImageController.java
// Line 19: Thay đổi đường dẫn này

private final String UPLOAD_DIR = "YOUR_PATH_HERE";

// Ví dụ:
// Windows: "D:/Connectify/Data/"
// Linux: "/home/username/connectify/data/"
// macOS: "/Users/username/connectify/data/"
```

**Tạo thư mục:**
```bash
# Windows
mkdir "D:\Your\Path\To\Data"

# Linux/macOS
mkdir -p /your/path/to/data
chmod 755 /your/path/to/data
```

## 🏗️ **BUILD & RUN**

### **Step 1: Build Project**
```bash
cd Server
mvn clean install -DskipTests
```

### **Step 2: Run Application**
```bash
# Recommended: Tomcat7 Plugin
mvn tomcat7:run

# Alternative: Package and deploy
mvn clean package
# Deploy ROOT.war to Tomcat server
```

### **Step 3: Verify Deployment**
```bash
# Test API
curl http://localhost:1512/electronics

# Test Image serving
curl -I http://localhost:1512/uploads/sample.jpg
curl -I http://localhost:1512/images/sample.jpg
```

## 🌐 **ACCESS URLS**
- **API Base**: `http://localhost:1512`
- **Electronics**: `http://localhost:1512/electronics`
- **Images**: `http://localhost:1512/images/{filename}`
- **Uploads**: `http://localhost:1512/uploads/{filename}`

## ✅ **VERIFICATION CHECKLIST**
- [ ] Java 11 installed
- [ ] Maven 3.6+ installed
- [ ] MySQL running
- [ ] Database created
- [ ] Image directory created
- [ ] UPLOAD_DIR path updated
- [ ] Application builds successfully
- [ ] Application starts on port 1512
- [ ] API endpoints responding
- [ ] Images serving correctly

## 🔧 **TROUBLESHOOTING**
See TROUBLESHOOTING.md for common issues and solutions.

## 📞 **SUPPORT**
For issues, please check the troubleshooting guide or contact the development team.
