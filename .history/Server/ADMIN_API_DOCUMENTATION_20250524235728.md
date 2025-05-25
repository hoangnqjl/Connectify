# 🔒 **ADMIN API DOCUMENTATION - CONNECTIFY**

## 📋 **TỔNG QUAN**

Tài liệu này cung cấp đầy đủ thông tin về các Admin APIs cần triển khai cho hệ thống Connectify. Tất cả admin APIs đều yêu cầu authentication và authorization.

### **Base URL:** `http://localhost:1512`
### **Authentication:** `Authorization: Bearer {token}`
### **Admin Account:** `admin@connectify.com` / `admin123`

---

## 🔐 **AUTHENTICATION & AUTHORIZATION**

### **Kiểm tra quyền Admin:**
Tất cả admin endpoints cần kiểm tra:
```java
if (!authorizationService.hasAdminAccess(authHeader)) {
    return ResponseEntity.status(HttpStatus.FORBIDDEN)
        .body(Collections.singletonMap("error", "Bạn không có quyền truy cập"));
}
```

### **AuthorizationService cần implement:**
```java
@Service
public class AuthorizationService {
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private UserService userService;
    
    public boolean hasAdminAccess(String authHeader) {
        User user = getUserFromToken(authHeader);
        return user != null && "admin".equals(user.getType());
    }
    
    public User getUserFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        
        String token = authHeader.replace("Bearer ", "");
        if (!jwtUtil.validateToken(token)) {
            return null;
        }
        
        String userId = jwtUtil.extractUsername(token);
        return userService.getUserByUserId(userId);
    }
}
```

---

## 👥 **USER MANAGEMENT APIs**

### **1. User Statistics**
```http
GET /admin/users/statistics
Authorization: Bearer {token}
```

**Response:**
```json
{
  "totalUsers": 150,
  "adminCount": 5,
  "userCount": 145,
  "newUsersThisMonth": 25,
  "activeUsers": 120
}
```

### **2. Create User**
```http
POST /admin/users
Authorization: Bearer {token}
Content-Type: application/x-www-form-urlencoded
Body: email=user@example.com&fullname=John Doe&phonenumber=0123456789&password=password123&type=user
```

**Response:**
```json
{
  "message": "Tạo người dùng thành công",
  "userId": "user_1732440123456"
}
```

### **3. Update User**
```http
PUT /admin/users/{userId}
Authorization: Bearer {token}
Content-Type: application/x-www-form-urlencoded
Body: fullname=John Updated&phonenumber=0987654321&type=admin
```

### **4. Delete User**
```http
DELETE /admin/users/{userId}
Authorization: Bearer {token}
```

### **5. Get All Users**
```http
GET /admin/users
Authorization: Bearer {token}
```

### **6. Search Users**
```http
GET /admin/users/search?keyword=john&type=user
Authorization: Bearer {token}
```

---

## 📦 **PRODUCT MANAGEMENT APIs**

### **1. Product Statistics**
```http
GET /admin/products/statistics
Authorization: Bearer {token}
```

**Response:**
```json
{
  "totalProducts": 200,
  "activeProducts": 180,
  "inactiveProducts": 20,
  "lowStockProducts": 15,
  "totalValue": "5000000000"
}
```

### **2. Low Stock Products**
```http
GET /admin/products/low-stock?threshold=10
Authorization: Bearer {token}
```

### **3. Update Product Stock**
```http
PUT /admin/products/{productId}/stock
Authorization: Bearer {token}
Content-Type: application/json
Body: {"quantity": 50}
```

### **4. Statistics by Category**
```http
GET /admin/products/statistics/by-category
Authorization: Bearer {token}
```

### **5. Statistics by Brand**
```http
GET /admin/products/statistics/by-brand
Authorization: Bearer {token}
```

### **6. Products by Status**
```http
GET /admin/products/by-status?status=active
Authorization: Bearer {token}
```

### **7. Bulk Status Update**
```http
PUT /admin/products/bulk-status
Authorization: Bearer {token}
Content-Type: application/json
Body: {"productIds": ["id1", "id2"], "status": "inactive"}
```

### **8. Advanced Product Search**
```http
GET /admin/products/search?keyword=iphone&categoryId=1&brandId=apple&status=active
Authorization: Bearer {token}
```

---

## 📋 **ORDER MANAGEMENT APIs**

### **1. Order Statistics**
```http
GET /admin/orders/statistics
Authorization: Bearer {token}
```

**Response:**
```json
{
  "totalOrders": 500,
  "pendingOrders": 25,
  "processingOrders": 30,
  "completedOrders": 400,
  "cancelledOrders": 45,
  "totalRevenue": "15000000000",
  "revenueThisMonth": "2000000000"
}
```

### **2. Revenue Report**
```http
GET /admin/orders/revenue?fromDate=2024-01-01&toDate=2024-12-31&groupBy=month
Authorization: Bearer {token}
```

### **3. All Orders with Filters**
```http
GET /admin/orders?status=pending&fromDate=2024-11-01&toDate=2024-11-30&userId=user123
Authorization: Bearer {token}
```

### **4. Order Details**
```http
GET /admin/orders/{invoiceId}
Authorization: Bearer {token}
```

### **5. Update Order Status**
```http
PUT /admin/orders/{invoiceId}/status
Authorization: Bearer {token}
Content-Type: application/json
Body: {"status": "processing"}
```

### **6. Bulk Status Update**
```http
PUT /admin/orders/bulk-status
Authorization: Bearer {token}
Content-Type: application/json
Body: {"invoiceIds": ["inv1", "inv2"], "status": "processed"}
```

### **7. Pending Orders**
```http
GET /admin/orders/pending
Authorization: Bearer {token}
```

---

## 🏷️ **CATEGORY MANAGEMENT APIs**

### **1. Category Statistics**
```http
GET /admin/categories/statistics
Authorization: Bearer {token}
```

### **2. Update Category**
```http
PUT /admin/categories/{categoryId}
Authorization: Bearer {token}
Content-Type: application/json
Body: {"cat_name": "New Category Name"}
```

### **3. Delete Category**
```http
DELETE /admin/categories/{categoryId}
Authorization: Bearer {token}
```

### **4. Category Products**
```http
GET /admin/categories/{categoryId}/products
Authorization: Bearer {token}
```

---

## 🔖 **BRAND MANAGEMENT APIs**

### **1. Brand Statistics**
```http
GET /admin/brands/statistics
Authorization: Bearer {token}
```

### **2. Update Brand**
```http
PUT /admin/brands/{brandId}
Authorization: Bearer {token}
Content-Type: application/json
Body: {"brand_name": "New Brand Name"}
```

### **3. Delete Brand**
```http
DELETE /admin/brands/{brandId}
Authorization: Bearer {token}
```

### **4. Brand Products**
```http
GET /admin/brands/{brandId}/products
Authorization: Bearer {token}
```

### **5. Brand Search**
```http
GET /admin/brands/search?keyword=apple
Authorization: Bearer {token}
```

---

## ❌ **ERROR RESPONSES**

### **403 Forbidden:**
```json
{
  "error": "Bạn không có quyền truy cập"
}
```

### **404 Not Found:**
```json
{
  "error": "Không tìm thấy dữ liệu"
}
```

### **400 Bad Request:**
```json
{
  "error": "Dữ liệu không hợp lệ"
}
```

---

## 🔧 **IMPLEMENTATION NOTES**

### **1. Controller Structure:**
```java
@RestController
@RequestMapping("/admin/users")
@CrossOrigin(origins = "http://localhost:8000")
public class AdminUserController {
    
    @Autowired
    private AuthorizationService authorizationService;
    
    @GetMapping("/statistics")
    public ResponseEntity<?> getUserStatistics(
            @RequestHeader("Authorization") String authHeader) {
        
        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Collections.singletonMap("error", "Bạn không có quyền truy cập"));
        }
        
        // Implementation logic here
    }
}
```

### **2. Data Initialization:**
Cần tạo admin user mặc định khi khởi động:
```java
@Component
public class DataInitializationService {
    
    @PostConstruct
    public void initializeAdminUser() {
        if (userService.getUserByEmail("admin@connectify.com") == null) {
            User admin = new User();
            admin.setUserId("admin_" + System.currentTimeMillis());
            admin.setEmail("admin@connectify.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setFullname("Administrator");
            admin.setType("admin");
            userService.saveUser(admin);
        }
    }
}
```

**🚀 Tài liệu này cung cấp đầy đủ thông tin để triển khai phần admin!**
