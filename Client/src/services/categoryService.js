// src/services/categoryService.js
import request from '@/utils/request';

const categoryService = {
  /**
   * Lấy tất cả danh mục
   * @returns {Promise<Object>} Kết quả trả về với thuộc tính success và data hoặc message
   */
  getAllCategories: async () => {
    try {
      const response = await request.get('/categories');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      const message = error.response?.data?.error || 'Không thể lấy danh sách danh mục.';
      console.error('Lỗi khi lấy danh mục:', message);
      return {
        success: false,
        message
      };
    }
  },


  /**
   * Lấy thông tin một danh mục theo ID
   * @param {string|number} id ID của danh mục cần lấy thông tin
   * @returns {Promise<Object>} Kết quả trả về với thuộc tính success và data hoặc message
   */
  getCategoryById: async (id) => {
    try {
      const response = await request.get(`/categories/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      const message = error.response?.data?.error || `Không tìm thấy danh mục với id ${id}.`;
      console.error('Lỗi khi lấy danh mục:', message);
      return {
        success: false,
        message
      };
    }
  },

};

export default categoryService;