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

  // 📦 API THÊM SẢN PHẨM MỚI
  createElectronic: async (productData) => {
    try {
      const formData = new FormData();

      // Thêm tất cả các field theo API spec
      formData.append('cat_id', productData.cat_id);
      formData.append('brand_id', productData.brand_id);
      formData.append('name', productData.name);
      formData.append('cpu', productData.cpu);
      formData.append('ram', productData.ram);
      formData.append('gpu', productData.gpu);
      formData.append('material', productData.material);
      formData.append('power_rating', productData.power_rating);
      formData.append('operating_system', productData.operating_system);
      formData.append('storage_capacity', productData.storage_capacity);
      formData.append('battery_life', productData.battery_life);
      formData.append('price', productData.price);
      formData.append('manufacture_year', productData.manufacture_year);
      formData.append('description', productData.description);
      formData.append('quantity', productData.quantity);
      formData.append('status', productData.status);

      // Thêm file ảnh nếu có
      if (productData.imageFile) {
        formData.append('imageFile', productData.imageFile);
      }

      const response = await request.post('/electronics', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Sản phẩm đã được thêm thành công'
      };
    } catch (error) {
      const message = error.response?.data?.error || 'Không thể thêm sản phẩm mới';
      return { success: false, message };
    }
  },

  // ✏️ API SỬA THÔNG TIN SẢN PHẨM
  updateElectronic: async (productData) => {
    try {
      const formData = new FormData();

      // ID là bắt buộc
      formData.append('id', productData.id);

      // Các field khác là optional
      if (productData.name !== undefined) formData.append('name', productData.name);
      if (productData.material !== undefined) formData.append('material', productData.material);
      if (productData.power_rating !== undefined) formData.append('power_rating', productData.power_rating);
      if (productData.operating_system !== undefined) formData.append('operating_system', productData.operating_system);
      if (productData.storage_capacity !== undefined) formData.append('storage_capacity', productData.storage_capacity);
      if (productData.battery_life !== undefined) formData.append('battery_life', productData.battery_life);
      if (productData.manufacture_year !== undefined) formData.append('manufacture_year', productData.manufacture_year);
      if (productData.description !== undefined) formData.append('description', productData.description);
      if (productData.quantity !== undefined) formData.append('quantity', productData.quantity);
      if (productData.status !== undefined) formData.append('status', productData.status);

      // Thêm file ảnh mới nếu có
      if (productData.imageFile) {
        formData.append('imageFile', productData.imageFile);
      }

      const response = await request.post('/electronics/update', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Sản phẩm đã được cập nhật thành công'
      };
    } catch (error) {
      const message = error.response?.data?.error || 'Không thể cập nhật sản phẩm';
      return { success: false, message };
    }
  },

  // 🗑️ API XÓA SẢN PHẨM
  deleteElectronic: async (productId) => {
    try {
      const response = await request.delete(`/electronics/${productId}`);

      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Sản phẩm đã được xóa thành công'
      };
    } catch (error) {
      const message = error.response?.data?.error || 'Không thể xóa sản phẩm';
      return { success: false, message };
    }
  },
};

export default electronicService;