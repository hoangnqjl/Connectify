# 🚀 **CONNECTIFY API SUMMARY FOR FRONTEND**

## 📋 **QUICK REFERENCE**

### **Base URL:** `http://localhost:1512`
### **Authentication:** `Authorization: Bearer {token}`

---

## 🔐 **AUTHENTICATION**

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/auth/login` | `email`, `password` | `{ "token": "..." }` |
| POST | `/auth/signup` | `email`, `fullname`, `phonenumber`, `password` | `{ "message": "..." }` |
| GET | `/users/me` | - | User object |

---

## 📱 **ELECTRONICS**

| Method | Endpoint | Auth | Response |
|--------|----------|------|----------|
| GET | `/electronics` | ❌ | Array of electronics |
| GET | `/electronics/{id}` | ❌ | Single electronic |
| GET | `/electronics/search?keyword={keyword}` | ❌ | Filtered electronics |

---

## 🛒 **CART**

| Method | Endpoint | Auth | Body | Response |
|--------|----------|------|------|----------|
| POST | `/carts/add` | ✅ | `electronicId`, `quantity` | Success message |
| GET | `/carts/get` | ✅ | - | Cart with items |
| DELETE | `/carts/delete-items` | ❌ | `cartId`, `electronicIds[]` | Success message |

---

## 🏷️ **CATEGORIES & BRANDS**

| Method | Endpoint | Auth | Response |
|--------|----------|------|----------|
| GET | `/categories` | ❌ | Array of categories |
| GET | `/brands` | ❌ | Array of brands |

---

## 📋 **INVOICES**

| Method | Endpoint | Auth | Body | Response |
|--------|----------|------|------|----------|
| POST | `/invoices` | ✅ | `address`, `paymentMethod`, `purchasedItems`, `totalPrice`, `status` | Invoice ID |
| GET | `/invoices/user` | ✅ | - | User's invoices |

---

## 🖼️ **IMAGES**

| Method | Endpoint | Usage |
|--------|----------|-------|
| GET | `/images/{imageName}` | Product images |
| GET | `/uploads/{imageName}` | Alternative path |

**Frontend Usage:**
```javascript
const imageUrl = `${REACT_APP_API_URL}/images/${electronic.image}`;
```

---

## 📊 **DATA MODELS**

### **User Object:**
```json
{
  "userId": "string",
  "fullname": "string", 
  "email": "string",
  "phoneNumber": "string",
  "avatar": "string",
  "type": "admin" | "user"
}
```

### **Electronic Object:**
```json
{
  "id": "string",
  "name": "string",
  "price": "string",
  "image": "string",
  "status": "active" | "inactive",
  "quantity": number,
  "category": {
    "cat_id": 1 | 2,
    "cat_name": "Mobile" | "Laptop"
  },
  "brand": {
    "brand_id": "string",
    "brand_name": "string"
  }
}
```

### **Cart Object:**
```json
{
  "cart_id": "string",
  "user": User,
  "items": [
    {
      "cart_item_id": number,
      "quantity": number,
      "electronic": Electronic
    }
  ]
}
```

### **Category Object:**
```json
{
  "cat_id": 1 | 2,
  "cat_name": "Mobile" | "Laptop"
}
```

### **Brand Object:**
```json
{
  "brand_id": "string",
  "brand_name": "string"
}
```

### **Invoice Object:**
```json
{
  "invoiceId": "string",
  "user": User,
  "address": "string",
  "paymentMethod": "string",
  "purchasedItems": "string",
  "totalPrice": number,
  "status": "pending" | "processing" | "processed" | "cancelled",
  "createdAt": "string"
}
```

---

## ⚠️ **IMPORTANT NOTES**

### **1. Business Logic:**
- **cat_id = 1**: Mobile phones (HomePage, MobilePage)
- **cat_id = 2**: Laptops (HomePage, LaptopPage)
- **Price format**: String (e.g., "25000000") - Frontend needs to format display
- **Status mapping**: `quantity > 0` = "instock", `quantity = 0` = "outofstock"

### **2. Authentication:**
- Store token in localStorage with key 'token'
- Send as `Authorization: Bearer {token}`
- Auto-remove on 401 responses
- Login endpoint returns only `{ "token": "..." }`

### **3. Content Types:**
- Auth endpoints: `application/x-www-form-urlencoded`
- Other endpoints: `application/json`

### **4. Error Handling:**
```json
// 401 Unauthorized
{ "error": "Token không hợp lệ" }

// 404 Not Found  
{ "error": "Không tìm thấy dữ liệu" }

// 400 Bad Request
{ "error": "Dữ liệu không hợp lệ" }
```

---

## 🔧 **FRONTEND CONFIGURATION**

```javascript
// Environment variables
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:1512";

// Image URLs
const productImageUrl = `${API_URL}/images/${electronic.image}`;
const userAvatarUrl = `${API_URL}${user.avatar}`;

// Headers
const headers = {
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
};
```

---

**🚀 All APIs tested and working with current database!**
