import request from '../utils/request';

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
      const response = await request.post('/brands', brand);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const message = error.response?.data?.error || 'Không thể tạo thương hiệu';
      return { success: false, message };
    }
  },
};

export default brandService;