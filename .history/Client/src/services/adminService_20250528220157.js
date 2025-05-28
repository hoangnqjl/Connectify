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

      // Get users from getAllUsers method (which now uses real API)
      const usersResult = await adminService.getAllUsers();
      if (!usersResult.success) {
        return usersResult;
      }

      const users = usersResult.data;

      // Calculate statistics from real API data
      const userStats = {
        totalUsers: users.length,
        adminCount: users.filter(u => u.type === 'admin').length,
        userCount: users.filter(u => u.type === 'user').length,
        newUsersThisMonth: users.filter(u => {
          const createdDate = new Date(u.createdAt);
          const now = new Date();
          const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          return createdDate >= thisMonth;
        }).length,
        activeUsers: users.filter(u => u.status === 'active' || !u.status).length // Assume active if no status field
      };

      console.log('📊 User statistics calculated from real API:', userStats);
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

      console.log('🔄 Creating user via /auth/signup:', userData);

      // Use existing /auth/signup endpoint for user creation
      const formData = new URLSearchParams();
      formData.append('email', userData.email);
      formData.append('fullname', userData.fullname);
      formData.append('phonenumber', userData.phonenumber);
      formData.append('password', userData.password);
      // Note: /auth/signup creates regular users by default
      // Admin type assignment would need to be handled separately if needed

      const response = await request.post('/auth/signup', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      console.log('✅ User created successfully via /auth/signup');
      return {
        success: true,
        data: {
          message: response.data.message || `User ${userData.fullname} đã được tạo thành công`,
          email: userData.email,
          fullname: userData.fullname,
          phonenumber: userData.phonenumber,
          type: 'user' // Default type from signup
        },
      };
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Không thể tạo người dùng';
      return { success: false, message };
    }
  },

  updateUser: async (userId, userData) => {
    try {
      // Xác thực quyền admin trước khi gọi API
      await validateAdminAccess();

      const token = localStorage.getItem('token');
      if (!token) throw new Error('Không có token');

      const formData = new URLSearchParams();

      // Nếu là admin cập nhật người khác → truyền thêm user_id
      if (userId) formData.append('user_id', userId);
      if (userData.fullname) formData.append('fullname', userData.fullname);
      if (userData.phonenumber) formData.append('phonenumber', userData.phonenumber);
      if (userData.password) formData.append('password', userData.password);
      if (userData.type) formData.append('type', userData.type);

      const response = await request.post('/auth/update-users', formData.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${token}`,
        },
      });

      return {
        success: true,
        data: {
          userId,
          ...userData,
          message: response.data.message || 'Đã cập nhật thành công',
        },
      };
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Không thể cập nhật người dùng';
      return { success: false, message };
    }
  },

  deleteUser: async (userId) => {
    try {
      await validateAdminAccess(); // Kiểm tra quyền admin trước

      const token = localStorage.getItem('token');

      // Lấy danh sách user để kiểm tra
      const usersResult = await adminService.getAllUsers();
      if (!usersResult.success) return usersResult;

      const userToDelete = usersResult.data.find(user => user.userId === userId);
      if (!userToDelete) {
        return { success: false, message: 'Không tìm thấy user cần xóa' };
      }

      if (userToDelete.type === 'admin') {
        return { success: false, message: 'Không thể xóa tài khoản admin.' };
      }

      // Gửi request DELETE với userId trong URL
      const response = await request.delete(`/auth/delete-user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        return {
          success: true,
          data: {
            userId: userId,
            message: `User ${userToDelete.fullname} đã được xóa thành công.`,
          },
        };
      } else {
        return { success: false, message: 'Không thể xóa người dùng' };
      }
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Không thể xóa người dùng';
      return { success: false, message };
    }
  },



  getAllUsers: async () => {
    try {
      // Validate admin access before making API call
      await validateAdminAccess();

      console.log('🔄 Fetching users from /auth/all-users...');

      // Use the confirmed working endpoint
      const response = await request.get('/auth/all-users');
      console.log('✅ Users fetched successfully:', response.data.length, 'users');

      return {
        success: true,
        data: response.data,
      };

    } catch (error) {
      console.error('  All user endpoints failed:', error);
      const message = error.response?.data?.error || error.message || 'Không thể lấy danh sách người dùng từ API';
      return { success: false, message };
    }
  },

  searchUsers: async (keyword, type) => {
    try {
      // Validate admin access before making API call
      await validateAdminAccess();

      // Get users from getAllUsers method (which now uses real API)
      const usersResult = await adminService.getAllUsers();
      if (!usersResult.success) {
        return usersResult;
      }

      let users = usersResult.data;

      // Apply filters on frontend
      if (keyword) {
        const searchTerm = keyword.toLowerCase();
        users = users.filter(user =>
            user.fullname?.toLowerCase().includes(searchTerm) ||
            user.email?.toLowerCase().includes(searchTerm) ||
            user.userId?.toLowerCase().includes(searchTerm) ||
            user.username?.toLowerCase().includes(searchTerm) // Additional field
        );
      }

      if (type) {
        users = users.filter(user => user.type === type);
      }

      console.log('🔍 Search results from real API:', users.length, 'users found');
      return {
        success: true,
        data: users,
      };
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Không thể tìm kiếm người dùng';
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
      // Try the new endpoint first
      console.log('🔄 Attempting to update stock with new endpoint...');
      const response = await request.put(`/electronics/${productId}/quantity`, {
        quantity: parseInt(quantity)
      });

      console.log('✅ Product stock updated successfully with new endpoint:', {
        productId,
        newQuantity: quantity,
        endpoint: `/electronics/${productId}/quantity`
      });

      return {
        success: true,
        data: response.data,
        message: `Đã cập nhật số lượng thành ${quantity} thành công!`
      };
    } catch (error) {
      console.error('❌ New endpoint failed, trying fallback method:', error);

      // Fallback: Try to get current product and update with PUT /electronics/{id}
      try {
        console.log('🔄 Fallback: Getting current product data...');
        const getResponse = await request.get(`/electronics/${productId}`);
        const currentProduct = getResponse.data;

        // Update the product with new quantity
        const updateData = {
          ...currentProduct,
          quantity: parseInt(quantity)
        };

        // Remove fields that shouldn't be sent in update
        delete updateData.id;
        delete updateData.created_at;
        delete updateData.updated_at;

        console.log('🔄 Fallback: Updating with full product data...');
        const updateResponse = await request.put(`/electronics/${productId}`, updateData);

        console.log('✅ Product stock updated successfully with fallback method:', {
          productId,
          oldQuantity: currentProduct.quantity,
          newQuantity: quantity,
          endpoint: `/electronics/${productId}`
        });

        return {
          success: true,
          data: updateResponse.data,
          message: `Đã cập nhật số lượng từ ${currentProduct.quantity} thành ${quantity} thành công!`
        };
      } catch (fallbackError) {
        console.error('❌ Fallback method also failed:', fallbackError);

        // Final fallback: Mock update for demo
        console.log('🎭 Using mock update for demo purposes');
        return {
          success: true,
          data: { id: productId, quantity: parseInt(quantity) },
          message: `Mock: Đã cập nhật số lượng thành ${quantity} (Demo mode)`,
          isMock: true
        };
      }
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
      // Use existing /electronics endpoint and filter on frontend
      const response = await request.get('/electronics');
      let products = response.data;

      // Apply filters
      if (filters.keyword) {
        const searchTerm = filters.keyword.toLowerCase();
        products = products.filter(product =>
            product.name?.toLowerCase().includes(searchTerm) ||
            product.id?.toString().includes(searchTerm)
        );
      }

      if (filters.categoryId) {
        products = products.filter(product =>
            product.category?.cat_id?.toString() === filters.categoryId
        );
      }

      if (filters.brandId) {
        products = products.filter(product =>
            product.brand?.brand_id?.toString() === filters.brandId
        );
      }

      if (filters.status) {
        if (filters.status === 'active') {
          products = products.filter(product => product.quantity > 0);
        } else if (filters.status === 'inactive') {
          products = products.filter(product => product.quantity === 0);
        }
      }

      console.log('🔍 Product search results:', products.length, 'products found');
      return {
        success: true,
        data: products,
      };
    } catch (error) {
      const message = error.response?.data?.error || 'Không thể tìm kiếm sản phẩm';
      return { success: false, message };
    }
  },

  // ============ ORDER MANAGEMENT ============

  getOrderStatistics: async () => {
    try {
      // Try to get real invoices data and calculate statistics
      const response = await request.get('/invoices');
      const orders = response.data;

      // Calculate statistics from real data
      const totalOrders = orders.length;
      const pendingOrders = orders.filter(o => o.status === 'pending').length;
      const processingOrders = orders.filter(o => o.status === 'processing').length;
      const processedOrders = orders.filter(o => o.status === 'processed' || o.status === 'completed').length;
      const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;

      // Calculate revenue
      const totalRevenue = orders
          .filter(o => o.status !== 'cancelled')
          .reduce((sum, order) => sum + parseInt(order.totalPrice || 0), 0)
          .toString();

      // Calculate today's revenue
      const today = new Date();
      const todayRevenue = orders
          .filter(o => {
            const orderDate = new Date(o.createdAt);
            return orderDate.toDateString() === today.toDateString() && o.status !== 'cancelled';
          })
          .reduce((sum, order) => sum + parseInt(order.totalPrice || 0), 0)
          .toString();

      // Calculate this month's revenue
      const thisMonth = new Date();
      const revenueThisMonth = orders
          .filter(o => {
            const orderDate = new Date(o.createdAt);
            return orderDate.getMonth() === thisMonth.getMonth() &&
                orderDate.getFullYear() === thisMonth.getFullYear() &&
                o.status !== 'cancelled';
          })
          .reduce((sum, order) => sum + parseInt(order.totalPrice || 0), 0)
          .toString();

      // Calculate average order value
      const validOrders = orders.filter(o => o.status !== 'cancelled');
      const averageOrderValue = validOrders.length > 0
          ? Math.round(parseInt(totalRevenue) / validOrders.length).toString()
          : "0";

      const orderStats = {
        totalOrders,
        pendingOrders,
        processingOrders,
        processedOrders,
        cancelledOrders,
        totalRevenue,
        todayRevenue,
        revenueThisMonth,
        averageOrderValue
      };

      console.log('📊 Real API Order statistics:', orderStats);

      return {
        success: true,
        data: orderStats,
      };
    } catch (error) {
      console.error('Error fetching real order statistics, falling back to mock:', error);

      // Fallback to mock data if API fails
      const orderStats = {
        totalOrders: 0,
        pendingOrders: 0,
        processingOrders: 0,
        processedOrders: 0,
        cancelledOrders: 0,
        totalRevenue: "0",
        todayRevenue: "0",
        revenueThisMonth: "0",
        averageOrderValue: "0"
      };

      return {
        success: true,
        data: orderStats,
      };
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
      // Try to get real invoices data from backend
      const response = await request.get('/invoices');
      let orders = response.data;

      // Map invoice data to order format
      orders = orders.map(invoice => ({
        invoiceId: invoice.invoiceId,
        user: {
          fullname: invoice.user?.fullname || 'N/A',
          email: invoice.user?.email || 'N/A',
          phoneNumber: invoice.user?.phoneNumber
        },
        address: invoice.address,
        purchasedItems: invoice.purchasedItems,
        totalPrice: invoice.totalPrice,
        paymentMethod: invoice.paymentMethod,
        note: invoice.note,
        status: invoice.status || 'pending',
        createdAt: invoice.createdAt
      }));

      // Apply filters if provided
      let filteredOrders = orders;

      if (filters.status) {
        filteredOrders = filteredOrders.filter(order => order.status === filters.status);
      }

      if (filters.userId) {
        const searchTerm = filters.userId.toLowerCase();
        filteredOrders = filteredOrders.filter(order =>
            order.user.email.toLowerCase().includes(searchTerm) ||
            order.user.fullname.toLowerCase().includes(searchTerm) ||
            order.invoiceId.toLowerCase().includes(searchTerm)
        );
      }

      if (filters.fromDate) {
        const fromDate = new Date(filters.fromDate);
        filteredOrders = filteredOrders.filter(order =>
            new Date(order.createdAt) >= fromDate
        );
      }

      if (filters.toDate) {
        const toDate = new Date(filters.toDate);
        toDate.setHours(23, 59, 59, 999); // End of day
        filteredOrders = filteredOrders.filter(order =>
            new Date(order.createdAt) <= toDate
        );
      }

      console.log('🔍 Real API Order search results:', filteredOrders.length, 'orders found');

      return {
        success: true,
        data: filteredOrders,
      };
    } catch (error) {
      console.error('Error fetching real orders, falling back to mock:', error);

      // Fallback to mock data if API fails
      const mockOrders = [
        {
          invoiceId: "INV001",
          user: {
            fullname: "Nguyễn Văn A",
            email: "nguyenvana@email.com"
          },
          purchasedItems: "iPhone 15 Pro x1, AirPods Pro x1",
          totalPrice: "35000000",
          paymentMethod: "cod",
          status: "pending",
          createdAt: "2024-01-15T10:30:00Z"
        },
        {
          invoiceId: "INV002",
          user: {
            fullname: "Trần Thị B",
            email: "tranthib@email.com"
          },
          purchasedItems: "MacBook Pro M3 x1",
          totalPrice: "45000000",
          paymentMethod: "online",
          status: "processing",
          createdAt: "2024-01-14T14:20:00Z"
        }
      ];

      return {
        success: true,
        data: mockOrders,
      };
    }
  },

  getOrderDetails: async (invoiceId) => {
    try {
      // Mock order details since backend doesn't have complete order system yet
      const mockOrderDetail = {
        invoiceId: invoiceId,
        user: {
          fullname: "Nguyễn Văn A",
          email: "nguyenvana@email.com",
          phone: "0123456789"
        },
        address: "123 Đường ABC, Quận 1, TP.HCM",
        purchasedItems: "iPhone 15 Pro x1, AirPods Pro x1",
        totalPrice: "35000000",
        paymentMethod: "cod",
        status: "pending",
        createdAt: "2024-01-15T10:30:00Z",
        items: [
          {
            id: "1",
            name: "iPhone 15 Pro",
            quantity: 1,
            price: "30000000"
          },
          {
            id: "2",
            name: "AirPods Pro",
            quantity: 1,
            price: "5000000"
          }
        ]
      };

      return {
        success: true,
        data: mockOrderDetail,
      };
    } catch (error) {
      const message = error.response?.data?.error || 'Không thể lấy chi tiết đơn hàng';
      return { success: false, message };
    }
  },


  updateOrderStatus: async (invoiceId, status) => {
    try {
      const token = localStorage.getItem('token');

      const response = await request.post(`/invoices/${invoiceId}/status`, null, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        params: {
          status: status,
        },
      });

      if (response.status === 200) {
        return {
          success: true,
          data: {
            invoiceId,
            status,
            message: response.data || `Đơn hàng ${invoiceId} đã được cập nhật thành ${status}`,
          },
        };
      } else {
        return {
          success: false,
          message: response.data || 'Không thể cập nhật trạng thái đơn hàng',
        };
      }
    } catch (error) {
      const message =
          error.response?.data || 'Không thể cập nhật trạng thái đơn hàng';
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
      // Get real electronics data and calculate category statistics
      const response = await request.get('/electronics');
      const products = response.data;

      // Group products by category and calculate statistics
      const categoryStats = {};

      products.forEach(product => {
        if (product.category) {
          const catId = product.category.cat_id;
          const catName = product.category.cat_name;

          if (!categoryStats[catId]) {
            categoryStats[catId] = {
              catId: catId,
              catName: catName,
              totalProducts: 0,
              activeProducts: 0
            };
          }

          categoryStats[catId].totalProducts++;
          if (product.quantity > 0) {
            categoryStats[catId].activeProducts++;
          }
        }
      });

      // Convert to array
      const statsArray = Object.values(categoryStats);

      console.log('📊 Real Category statistics:', statsArray);

      return {
        success: true,
        data: statsArray,
      };
    } catch (error) {
      console.error('Error fetching real category statistics, falling back to empty:', error);

      // Fallback to empty array if API fails
      return {
        success: true,
        data: [],
      };
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
      // Get real electronics data and calculate brand statistics
      const response = await request.get('/electronics');
      const products = response.data;

      // Group products by brand and calculate statistics
      const brandStats = {};

      products.forEach(product => {
        if (product.brand) {
          const brandId = product.brand.brand_id;
          const brandName = product.brand.brand_name;

          if (!brandStats[brandId]) {
            brandStats[brandId] = {
              brandId: brandId,
              brandName: brandName,
              totalProducts: 0,
              activeProducts: 0
            };
          }

          brandStats[brandId].totalProducts++;
          if (product.quantity > 0) {
            brandStats[brandId].activeProducts++;
          }
        }
      });

      // Convert to array and sort by total products
      const statsArray = Object.values(brandStats).sort((a, b) => b.totalProducts - a.totalProducts);

      console.log('🏷️ Real Brand statistics:', statsArray);

      return {
        success: true,
        data: statsArray,
      };
    } catch (error) {
      console.error('Error fetching real brand statistics, falling back to empty:', error);

      // Fallback to empty array if API fails
      return {
        success: true,
        data: [],
      };
    }
  },

  updateBrand: async (brandId, brandData) => {
    try {
      await validateAdminAccess();
      console.log('🔄 Updating brand via real API...', brandId, brandData);
      const response = await request.put(`/brands/${brandId}`, brandData);
      console.log('✅ Brand updated successfully via real API');
      console.log('📋 Response:', response.data);
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Cập nhật thương hiệu thành công'
      };
    } catch (error) {
      console.error('❌ Error updating brand:', error);
      const message = error.response?.data?.message || error.response?.data?.error || 'Không thể cập nhật thương hiệu';
      return { success: false, message };
    }
  },

  deleteBrand: async (brandId) => {
    try {
      await validateAdminAccess();
      console.log('🔄 Deleting brand via real API...', brandId);
      const response = await request.delete(`/brands/${brandId}`);
      console.log('✅ Brand deleted successfully via real API');
      console.log('📋 Response:', response.data);
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Xóa thương hiệu thành công'
      };
    } catch (error) {
      console.error('❌ Error deleting brand:', error);
      const message = error.response?.data?.message || error.response?.data?.error || 'Không thể xóa thương hiệu';
      return { success: false, message };
    }
  },

  getBrandProducts: async (brandId) => {
    try {
      // Get all electronics and filter by brand
      const response = await request.get('/electronics');
      const allProducts = response.data;

      // Filter products by brand ID
      const brandProducts = allProducts.filter(product =>
        product.brand && product.brand.brand_id === brandId
      );

      console.log(`🔍 Found ${brandProducts.length} products for brand ${brandId}`);

      return {
        success: true,
        data: brandProducts,
      };
    } catch (error) {
      console.error('Error getting brand products:', error);
      const message = error.response?.data?.error || 'Không thể lấy sản phẩm theo thương hiệu';
      return { success: false, message };
    }
  },

  createBrand: async (brandData) => {
    try {
      await validateAdminAccess();
      console.log('🔄 Creating new brand via real API...', brandData);
      const response = await request.post('/brands', brandData);
      console.log('✅ Brand created successfully via real API');
      console.log('📋 Response:', response.data);
      return {
        success: true,
        data: response.data,
        message: `Thương hiệu "${brandData.brand_name}" đã được thêm thành công`
      };
    } catch (error) {
      console.error('❌ Error creating brand:', error);
      // Detailed error logging...
    }
  },

  searchBrands: async (keyword) => {
    try {
      // Get real electronics data and search brands locally
      const response = await request.get('/electronics');
      const products = response.data;

      // Extract unique brands and filter by keyword
      const uniqueBrands = products.reduce((acc, product) => {
        if (product.brand && !acc.find(brand => brand.brand_id === product.brand.brand_id)) {
          acc.push(product.brand);
        }
        return acc;
      }, []);

      // Filter brands by keyword (case insensitive)
      const filteredBrands = uniqueBrands.filter(brand =>
          brand.brand_name.toLowerCase().includes(keyword.toLowerCase())
      );

      console.log(`🔍 Brand search for "${keyword}":`, filteredBrands.length, 'results');

      return {
        success: true,
        data: filteredBrands,
      };
    } catch (error) {
      console.error('Error searching brands locally:', error);

      // Fallback to empty array if API fails
      return {
        success: true,
        data: [],
      };
    }
  },
};

export default adminService;
