# 📊 **API RESPONSES DOCUMENTATION - CHO FRONTEND**

## 🔐 **AUTHENTICATION APIs**

### **1. Login API**
```
POST /auth/login
Content-Type: application/x-www-form-urlencoded
Body: email=admin@connectify.com&password=admin123
```

**Response Success (200):**
```json
{
  "message": "Đăng nhập thành công",
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbl8xNzI4NzQ5OTM3NzQ5IiwiaWF0IjoxNzMyNDM5ODI3LCJleHAiOjE3MzI0NDM0Mjd9.abc123...",
  "user": {
    "userId": "admin_1728749937749",
    "username": "admin",
    "fullname": "Administrator",
    "email": "admin@connectify.com",
    "type": "admin",
    "phoneNumber": "0905785819",
    "avatar": null,
    "createdAt": null,
    "updatedAt": null
  }
}
```

**⚠️ LƯU Ý: Chỉ có 2 role trong hệ thống:**
- **"admin"**: Toàn quyền truy cập
- **"user"**: Quyền user thông thường

---

## 👥 **USER MANAGEMENT APIs**

### **2. User Statistics**
```
GET /admin/users/statistics
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "totalUsers": 15,
  "adminCount": 2,
  "userCount": 13,
  "newUsersThisMonth": 5,
  "activeUsers": 12
}
```

### **3. Create User**
```
POST /admin/users
Authorization: Bearer {token}
Content-Type: application/x-www-form-urlencoded
Body: email=newuser@example.com&fullname=New User&phonenumber=0123456789&password=password123&type=user
```

**Response Success (200):**
```json
{
  "message": "Tạo user thành công",
  "user": {
    "userId": "user_1732440123456",
    "username": "newuser",
    "fullname": "New User",
    "email": "newuser@example.com",
    "type": "user",
    "phoneNumber": "0123456789",
    "avatar": null,
    "createdAt": "2024-11-24T10:30:00",
    "updatedAt": null
  }
}
```

---

## 📦 **PRODUCT MANAGEMENT APIs**

### **4. Product Statistics**
```
GET /admin/products/statistics
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "totalProducts": 150,
  "activeProducts": 120,
  "inactiveProducts": 30,
  "lowStockProducts": 15,
  "totalStock": 2500,
  "averagePrice": 15000000
}
```

### **5. Statistics by Category**
```
GET /admin/products/statistics/by-category
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "Laptop": {
    "count": 45,
    "cat_id": 1
  },
  "Smartphone": {
    "count": 30,
    "cat_id": 2
  },
  "Tablet": {
    "count": 25,
    "cat_id": 3
  },
  "Không có danh mục": {
    "count": 2,
    "cat_id": null
  }
}
```

### **6. Statistics by Brand**
```
GET /admin/products/statistics/by-brand
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "Apple": {
    "count": 35,
    "brand_id": "apple_brand_001"
  },
  "Samsung": {
    "count": 28,
    "brand_id": "samsung_brand_002"
  },
  "Dell": {
    "count": 20,
    "brand_id": "dell_brand_003"
  },
  "Không có thương hiệu": {
    "count": 3,
    "brand_id": null
  }
}
```

### **7. Low Stock Products**
```
GET /admin/products/low-stock?threshold=10
Authorization: Bearer {token}
```

**Response (200):**
```json
[
  {
    "id": "1_apple_brand_001_uuid123",
    "name": "iPhone 15 Pro Max",
    "quantity": 5,
    "price": "30000000",
    "status": "active",
    "category": {
      "cat_id": 2,
      "cat_name": "Smartphone"
    },
    "brand": {
      "brand_id": "apple_brand_001",
      "brand_name": "Apple"
    }
  }
]
```

### **8. Advanced Product Search**
```
GET /admin/products/search?keyword=laptop&categoryId=1&brandId=dell_brand_003&status=active
Authorization: Bearer {token}
```

**Response (200):**
```json
[
  {
    "id": "1_dell_brand_003_uuid456",
    "name": "Dell XPS 13",
    "image": "dell_xps13.jpg",
    "cpu": "Intel Core i7",
    "ram": "16GB",
    "gpu": "Intel Iris Xe",
    "material": "Aluminum",
    "powerRating": "65W",
    "operatingSystem": "Windows 11",
    "storageCapacity": "512GB SSD",
    "batteryLife": "12 hours",
    "price": "25000000",
    "manufactureYear": "2024",
    "description": "Laptop cao cấp cho doanh nhân",
    "quantity": 15,
    "status": "active",
    "category": {
      "cat_id": 1,
      "cat_name": "Laptop"
    },
    "brand": {
      "brand_id": "dell_brand_003",
      "brand_name": "Dell"
    }
  }
]
```

---

## 📋 **ORDER MANAGEMENT APIs**

### **9. Order Statistics**
```
GET /admin/orders/statistics
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "totalOrders": 250,
  "pendingOrders": 15,
  "processingOrders": 8,
  "processedOrders": 200,
  "cancelledOrders": 27,
  "totalRevenue": 2500000000
}
```

### **10. Revenue Report**
```
GET /admin/orders/revenue?fromDate=2024-01-01&toDate=2024-12-31&groupBy=month
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "revenueByPeriod": {
    "2024-01": 150000000,
    "2024-02": 200000000,
    "2024-03": 180000000,
    "2024-04": 220000000,
    "2024-05": 250000000
  },
  "totalRevenue": 1000000000,
  "totalOrders": 85
}
```

### **11. All Orders with Filters**
```
GET /admin/orders?status=pending&fromDate=2024-11-01&toDate=2024-11-30&userId=user123
Authorization: Bearer {token}
```

**Response (200):**
```json
[
  {
    "invoiceId": "invoice_1732440123456",
    "user": {
      "userId": "user_1728749937749",
      "username": "customer1",
      "fullname": "Nguyễn Văn A",
      "email": "customer1@example.com",
      "type": "customer"
    },
    "address": "123 Đường ABC, Quận 1, TP.HCM",
    "paymentMethod": "credit_card",
    "purchasedItems": "[{\"productId\":\"1_apple_001_uuid\",\"name\":\"iPhone 15\",\"quantity\":1,\"price\":25000000}]",
    "totalPrice": 25000000,
    "status": "pending",
    "createdAt": "2024-11-24T10:30:00"
  }
]
```

---

## 🏷️ **CATEGORY MANAGEMENT APIs**

### **12. Category Statistics**
```
GET /admin/categories/statistics
Authorization: Bearer {token}
```

**Response (200):**
```json
[
  {
    "catId": 1,
    "catName": "Laptop",
    "totalProducts": 45,
    "activeProducts": 40
  },
  {
    "catId": 2,
    "catName": "Smartphone",
    "totalProducts": 30,
    "activeProducts": 28
  }
]
```

---

## 🔖 **BRAND MANAGEMENT APIs**

### **13. Brand Statistics**
```
GET /admin/brands/statistics
Authorization: Bearer {token}
```

**Response (200):**
```json
[
  {
    "brandId": "apple_brand_001",
    "brandName": "Apple",
    "totalProducts": 35,
    "activeProducts": 32
  },
  {
    "brandId": "samsung_brand_002",
    "brandName": "Samsung",
    "totalProducts": 28,
    "activeProducts": 25
  }
]
```

### **14. Brand Search**
```
GET /admin/brands/search?keyword=apple
Authorization: Bearer {token}
```

**Response (200):**
```json
[
  {
    "brand_id": "apple_brand_001",
    "brand_name": "Apple"
  }
]
```

---

## ❌ **ERROR RESPONSES**

### **Authorization Error (403):**
```json
{
  "error": "Bạn không có quyền truy cập"
}
```

### **Not Found Error (404):**
```json
{
  "error": "Không tìm thấy dữ liệu"
}
```

### **Validation Error (400):**
```json
{
  "error": "Dữ liệu không hợp lệ"
}
```

### **Server Error (500):**
```json
{
  "error": "Lỗi server nội bộ"
}
```

---

## 🔑 **IMPORTANT NOTES FOR FRONTEND**

### **1. Authentication:**
- Tất cả admin APIs cần header: `Authorization: Bearer {token}`
- Token có thời hạn, cần handle token expiry
- Admin user mặc định: `admin@connectify.com` / `admin123`

### **2. Data Types:**
- **brand_id**: String (VD: "apple_brand_001")
- **cat_id**: Integer (VD: 1, 2, 3)
- **user_id**: String (VD: "user_1728749937749")
- **invoice_id**: String (VD: "invoice_1732440123456")
- **product_id**: String (VD: "1_apple_001_uuid123")

### **3. Status Values:**
- **Product status**: "active", "inactive"
- **Order status**: "pending", "processing", "processed", "cancelled"
- **User type**: "admin", "user"

### **4. Date Formats:**
- **Input dates**: "yyyy-MM-dd" (VD: "2024-11-24")
- **Response dates**: "yyyy-MM-ddTHH:mm:ss" (VD: "2024-11-24T10:30:00")

### **5. Price Format:**
- Tất cả giá đều là String (VD: "25000000")
- Frontend cần format hiển thị (VD: "25,000,000 VNĐ")

**🚀 Tất cả APIs đã được test và hoạt động ổn định với database hiện tại!**
