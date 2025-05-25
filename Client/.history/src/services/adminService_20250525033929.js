import request from '../utils/request';
import authService from './authService';

// Helper function to validate admin access before API calls
const validateAdminAccess = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Không có token xác thực');
  }

  const userResult = await authService.getMe();
  if (!userResult.success) {
    localStorage.removeItem('token');
    throw new Error('Token không hợp lệ');
  }

  if (userResult.user.type !== 'admin') {
    throw new Error('Không có quyền truy cập admin');
  }

  return userResult.user;
};

const adminService = {
  // ============ USER MANAGEMENT ============

  getUserStatistics: async () => {
    try {
      // Validate admin access before making API call
      await validateAdminAccess();

      // Use existing endpoint instead of non-existent admin endpoint
      const response = await request.get('/auth/all-users');
      const users = response.data;

      // Calculate statistics from raw data
      const userStats = {
        totalUsers: users.length,
        adminCount: users.filter(u => u.type === 'admin').length,
        userCount: users.filter(u => u.type === 'user').length,
        newUsersThisMonth: Math.min(8, users.length), // Mock data
        activeUsers: Math.max(0, users.length - 1)    // Mock data
      };

      return {
        success: true,
        data: userStats,
      };
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Không thể lấy thống kê người dùng';
      return { success: false, message };
    }
  },

  createUser: async (userData) => {
    try {
      // Validate admin access before making API call
      await validateAdminAccess();

      const formData = new URLSearchParams();
      Object.keys(userData).forEach(key => {
        formData.append(key, userData[key]);
      });

      const response = await request.post('/admin/users', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Không thể tạo người dùng';
      return { success: false, message };
    }
  },

  updateUser: async (userId, userData) => {
    try {
      const formData = new URLSearchParams();
      Object.keys(userData).forEach(key => {
        formData.append(key, userData[key]);
      });

      const response = await request.put(`/admin/users/${userId}`, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const message = error.response?.data?.error || 'Không thể cập nhật người dùng';
      return { success: false, message };
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await request.delete(`/admin/users/${userId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const message = error.response?.data?.error || 'Không thể xóa người dùng';
      return { success: false, message };
    }
  },

  getAllUsers: async () => {
    try {
      const response = await request.get('/admin/users');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const message = error.response?.data?.error || 'Không thể lấy danh sách người dùng';
      return { success: false, message };
    }
  },

  searchUsers: async (keyword, type) => {
    try {
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      if (type) params.append('type', type);

      const response = await request.get(`/admin/users/search?${params.toString()}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const message = error.response?.data?.error || 'Không thể tìm kiếm người dùng';
      return { success: false, message };
    }
  },

  // ============ PRODUCT MANAGEMENT ============

  getProductStatistics: async () => {
    try {
      // Use existing endpoint instead of non-existent admin endpoint
      const response = await request.get('/electronics');
      const products = response.data;

      // Calculate statistics from raw data
      const productStats = {
        totalProducts: products.length,
        activeProducts: products.filter(p => p.quantity > 0).length,
        inactiveProducts: products.filter(p => p.quantity === 0).length,
        totalStock: products.reduce((sum, p) => sum + p.quantity, 0),
        lowStockProducts: products.filter(p => p.quantity <= 10 && p.quantity > 0).length,
        outOfStockProducts: products.filter(p => p.quantity === 0).length
      };

      return {
        success: true,
        data: productStats,
      };
    } catch (error) {
      const message = error.response?.data?.error || 'Không thể lấy thống kê sản phẩm';
      return { success: false, message };
    }
  },

  getLowStockProducts: async (threshold = 10) => {
    try {
      // Use existing endpoint instead of non-existent admin endpoint
      const response = await request.get('/electronics');
      const products = response.data;

      // Filter low stock products
      const lowStockProducts = products
        .filter(p => p.quantity <= threshold && p.quantity > 0)
        .map(p => ({
          id: p.id,
          name: p.name,
          quantity: p.quantity,
          price: p.price,
          category: p.category?.cat_name || 'Unknown',
          brand: p.brand?.brand_name || 'Unknown'
        }));

      return {
        success: true,
        data: lowStockProducts,
      };
    } catch (error) {
      const message = error.response?.data?.error || 'Không thể lấy sản phẩm sắp hết hàng';
      return { success: false, message };
    }
  },

  updateProductStock: async (productId, quantity) => {
    try {
      const response = await request.put(`/admin/products/${productId}/stock`, {
        quantity: quantity
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const message = error.response?.data?.error || 'Không thể cập nhật số lượng sản phẩm';
      return { success: false, message };
    }
  },

  getProductStatisticsByCategory: async () => {
    try {
      const response = await request.get('/admin/products/statistics/by-category');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const message = error.response?.data?.error || 'Không thể lấy thống kê theo danh mục';
      return { success: false, message };
    }
  },

  getProductStatisticsByBrand: async () => {
    try {
      const response = await request.get('/admin/products/statistics/by-brand');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const message = error.response?.data?.error || 'Không thể lấy thống kê theo thương hiệu';
      return { success: false, message };
    }
  },

  getProductsByStatus: async (status) => {
    try {
      const response = await request.get(`/admin/products/by-status?status=${status}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const message = error.response?.data?.error || 'Không thể lấy sản phẩm theo trạng thái';
      return { success: false, message };
    }
  },

  bulkUpdateProductStatus: async (productIds, status) => {
    try {
      const response = await request.put('/admin/products/bulk-status', {
        productIds: productIds,
        status: status
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const message = error.response?.data?.error || 'Không thể cập nhật trạng thái sản phẩm';
      return { success: false, message };
    }
  },

  searchProducts: async (filters) => {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });

      const response = await request.get(`/admin/products/search?${params.toString()}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const message = error.response?.data?.error || 'Không thể tìm kiếm sản phẩm';
      return { success: false, message };
    }
  },

  // ============ ORDER MANAGEMENT ============

  getOrderStatistics: async () => {
    try {
      // Mock data since backend doesn't have complete order system yet
      const orderStats = {
        totalOrders: 25,
        pendingOrders: 5,
        processingOrders: 3,
        completedOrders: 15,
        cancelledOrders: 2,
        totalRevenue: "125000000",      // String format as backend expects
        todayRevenue: "5000000",        // String format
        revenueThisMonth: "45000000",   // String format
        averageOrderValue: "5000000"    // String format
      };

      return {
        success: true,
        data: orderStats,
      };
    } catch (error) {
      const message = error.response?.data?.error || 'Không thể lấy thống kê đơn hàng';
      return { success: false, message };
    }
  },

  getRevenueReport: async (fromDate, toDate, groupBy = 'month') => {
    try {
      const params = new URLSearchParams();
      if (fromDate) params.append('fromDate', fromDate);
      if (toDate) params.append('toDate', toDate);
      params.append('groupBy', groupBy);

      const response = await request.get(`/admin/orders/revenue?${params.toString()}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const message = error.response?.data?.error || 'Không thể lấy báo cáo doanh thu';
      return { success: false, message };
    }
  },

  getAllOrders: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });

      const response = await request.get(`/admin/orders?${params.toString()}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const message = error.response?.data?.error || 'Không thể lấy danh sách đơn hàng';
      return { success: false, message };
    }
  },

  getOrderDetails: async (invoiceId) => {
    try {
      const response = await request.get(`/admin/orders/${invoiceId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const message = error.response?.data?.error || 'Không thể lấy chi tiết đơn hàng';
      return { success: false, message };
    }
  },

  updateOrderStatus: async (invoiceId, status) => {
    try {
      const response = await request.put(`/admin/orders/${invoiceId}/status`, {
        status: status
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const message = error.response?.data?.error || 'Không thể cập nhật trạng thái đơn hàng';
      return { success: false, message };
    }
  },

  bulkUpdateOrderStatus: async (invoiceIds, status) => {
    try {
      const response = await request.put('/admin/orders/bulk-status', {
        invoiceIds: invoiceIds,
        status: status
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const message = error.response?.data?.error || 'Không thể cập nhật trạng thái đơn hàng';
      return { success: false, message };
    }
  },

  getPendingOrders: async () => {
    try {
      const response = await request.get('/admin/orders/pending');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const message = error.response?.data?.error || 'Không thể lấy đơn hàng chờ xử lý';
      return { success: false, message };
    }
  },

  // ============ CATEGORY MANAGEMENT ============

  getCategoryStatistics: async () => {
    try {
      const response = await request.get('/admin/categories/statistics');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const message = error.response?.data?.error || 'Không thể lấy thống kê danh mục';
      return { success: false, message };
    }
  },

  updateCategory: async (categoryId, categoryData) => {
    try {
      const response = await request.put(`/admin/categories/${categoryId}`, categoryData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const message = error.response?.data?.error || 'Không thể cập nhật danh mục';
      return { success: false, message };
    }
  },

  deleteCategory: async (categoryId) => {
    try {
      const response = await request.delete(`/admin/categories/${categoryId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const message = error.response?.data?.error || 'Không thể xóa danh mục';
      return { success: false, message };
    }
  },

  getCategoryProducts: async (categoryId) => {
    try {
      const response = await request.get(`/admin/categories/${categoryId}/products`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const message = error.response?.data?.error || 'Không thể lấy sản phẩm theo danh mục';
      return { success: false, message };
    }
  },

  // ============ BRAND MANAGEMENT ============

  getBrandStatistics: async () => {
    try {
      const response = await request.get('/admin/brands/statistics');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const message = error.response?.data?.error || 'Không thể lấy thống kê thương hiệu';
      return { success: false, message };
    }
  },

  updateBrand: async (brandId, brandData) => {
    try {
      const response = await request.put(`/admin/brands/${brandId}`, brandData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const message = error.response?.data?.error || 'Không thể cập nhật thương hiệu';
      return { success: false, message };
    }
  },

  deleteBrand: async (brandId) => {
    try {
      const response = await request.delete(`/admin/brands/${brandId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const message = error.response?.data?.error || 'Không thể xóa thương hiệu';
      return { success: false, message };
    }
  },

  getBrandProducts: async (brandId) => {
    try {
      const response = await request.get(`/admin/brands/${brandId}/products`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const message = error.response?.data?.error || 'Không thể lấy sản phẩm theo thương hiệu';
      return { success: false, message };
    }
  },

  searchBrands: async (keyword) => {
    try {
      const response = await request.get(`/admin/brands/search?keyword=${keyword}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const message = error.response?.data?.error || 'Không thể tìm kiếm thương hiệu';
      return { success: false, message };
    }
  },
};

export default adminService;
