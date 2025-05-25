import request from '../utils/request';

// Helper function to map API status to frontend status
const mapProductStatus = (product) => {
  return {
    ...product,
    status: product.quantity > 0 ? 'instock' : 'outofstock',
    // Keep original API status for reference
    apiStatus: product.status
  };
};

// Helper function to map array of products
const mapProductsArray = (products) => {
  return products.map(mapProductStatus);
};

const electronicService = {
  getAllElectronics: async () => {
    try {
      const response = await request.get('/electronics');
      return {
        success: true,
        data: mapProductsArray(response.data),
      };
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Không thể lấy danh sách electronics';
      return { success: false, message };
    }
  },

  getElectronicById: async (id) => {
    try {
      const response = await request.get(`/electronics/${id}`);
      return {
        success: true,
        data: mapProductStatus(response.data),
      };
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.message || "Không thể lấy chi tiết sản phẩm";
      return { success: false, message };
    }
  },

  searchElectronics: async (keyword) => {
    try {
      const response = await request.get(`/electronics/search`, {
        params: { keyword }
      });
      return {
        success: true,
        data: mapProductsArray(response.data),
      };
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Không thể tìm kiếm sản phẩm';
      return { success: false, message };
    }
  },
};

export default electronicService;
