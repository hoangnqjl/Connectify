import request from '../utils/request';

const adminService = {
  // ============ USER MANAGEMENT ============
  
  getUserStatistics: async () => {
    try {
      const response = await request.get('/admin/users/statistics');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const message = error.response?.data?.error || 'Không thể lấy thống kê người dùng';
      return { success: false, message };
    }
  },

  createUser: async (userData) => {
    try {
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
      const message = error.response?.data?.error || 'Không thể tạo người dùng';
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
      const response = await request.get('/admin/products/statistics');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const message = error.response?.data?.error || 'Không thể lấy thống kê sản phẩm';
      return { success: false, message };
    }
  },

  getLowStockProducts: async (threshold = 10) => {
    try {
      const response = await request.get(`/admin/products/low-stock?threshold=${threshold}`);
      return {
        success: true,
        data: response.data,
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
};

export default adminService;
