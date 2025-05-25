import request from '../utils/request';
const invoiceService = {
  createInvoice: async ({ address, paymentMethod, purchasedItems, totalPrice, status }) => {
    try {
      const formData = new URLSearchParams();
      formData.append("address", address);
      formData.append("paymentMethod", paymentMethod);
      formData.append("purchasedItems", purchasedItems);
      formData.append("totalPrice", totalPrice);
      formData.append("status", status);

      const response = await request.post("/invoices", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const message = error.response?.data?.error || "Không thể tạo hóa đơn";
      return { success: false, message };
    }
  },

  getInvoicesByUser: async () => {
    try {
      const response = await request.get('/invoices/user');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const message = error.response?.data?.error || 'Không thể lấy danh sách hóa đơn';
      return { success: false, message };
    }
  },
};


export default invoiceService;
