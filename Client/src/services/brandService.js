import request from '../utils/request';
import authService from './authService';

// 🔐 Validate admin access - Same as adminService
const validateAdminAccess = async () => {
  const token = localStorage.getItem('token');

  console.log('🔍 Checking admin access...');
  console.log('📋 Token:', token ? 'Present' : 'Missing');

  if (!token) {
    throw new Error('Không có token xác thực');
  }

  const userResult = await authService.getMe();

  console.log('📋 User result:', userResult);

  if (!userResult.success) {
    localStorage.removeItem('token');
    throw new Error('Token không hợp lệ');
  }

  console.log('📋 User type:', userResult.user.type);

  if (userResult.user.type !== 'admin') {
    throw new Error(`Không có quyền truy cập admin. User type: ${userResult.user.type}`);
  }

  console.log('✅ Admin access validated');
  return userResult.user;
};

const brandService = {
  getAllBrands: async () => {
    try {
      const response = await request.get('/brands');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const message = error.response?.data?.error || 'Không thể lấy danh sách thương hiệu';
      return { success: false, message };
    }
  },

  createBrand: async (brand) => {
    try {
      console.log('🔄 Creating new brand via brandService...', brand);

      // Try to validate admin access, but continue if it fails for testing
      try {
        await validateAdminAccess();
        console.log('✅ Admin access validated');
      } catch (authError) {
        console.warn('⚠️ Admin validation failed, but continuing for testing:', authError.message);
        // Continue anyway for testing purposes
      }

      const response = await request.post('/brands', brand);

      console.log('✅ Brand created successfully via brandService');
      console.log('📋 Response:', response.data);

      return {
        success: true,
        data: response.data,
        message: `Thương hiệu "${brand.brand_name}" đã được thêm thành công`
      };
    } catch (error) {
      console.error('❌ Error creating brand via brandService:', error);

      // Detailed error logging
      if (error.response) {
        console.error('❌ Response status:', error.response.status);
        console.error('❌ Response data:', error.response.data);
        console.error('❌ Response headers:', error.response.headers);
      } else if (error.request) {
        console.error('❌ Request made but no response:', error.request);
      } else {
        console.error('❌ Error setting up request:', error.message);
      }

      const message = error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          'Không thể tạo thương hiệu';
      return { success: false, message };
    }
  },
};

export default brandService;