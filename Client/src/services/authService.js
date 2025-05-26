// src/services/authService.js
import request from '@/utils/request';
import QueryString from 'qs';

const authService = {
  // Đăng nhập
  login: async (email, password) => {
    try {
      const response = await request.post(
        '/auth/login',
        QueryString.stringify({ email, password }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      const { token } = response.data;
      localStorage.setItem('token', token);
      return { success: true, token };
    } catch (error) {
      const message = error.response?.data?.error || 'Đăng nhập thất bại.';
      return { success: false, message };
    }
  },

  // Đăng ký
  signup: async (email, fullname, phonenumber, password) => {
    try {
      const response = await request.post(
        '/auth/signup',
        QueryString.stringify({
          email,
          fullname,
          phonenumber,
          password,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return {
        success: true,
        message: response.data.message || 'Đăng ký thành công',
      };
    } catch (error) {
      const message = error.response?.data?.error || 'Đăng ký thất bại.';
      return { success: false, message };
    }
  },

  getMe: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return { success: false, message: 'Chưa đăng nhập.' };
      }

      const response = await request.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return {
        success: true,
        user: response.data,
      };
    } catch (error) {
      const message = error.response?.data?.error || 'Không thể lấy thông tin người dùng.';
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
      }
      return { success: false, message };
    }
  },
  
 updateUser: async ({ username, fullname, phonenumber, password }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return { success: false, message: 'Chưa đăng nhập.' };
      }

      const params = {};
      if (username) params.username = username;
      if (fullname) params.fullname = fullname;
      if (phonenumber) params.phonenumber = phonenumber;
      if (password) params.password = password;

      const response = await request.post(
        '/auth/update-users',
        QueryString.stringify(params),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return {
        success: true,
        message: response.data.message || 'Cập nhật thông tin thành công',
      };
    } catch (error) {
      const message = error.response?.data?.error || 'Cập nhật thông tin thất bại.';
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
      }
      return { success: false, message };
    }
  },

  // Đăng xuất
  logout: () => {
    localStorage.removeItem('token');
  },

  // Lấy token hiện tại
  getToken: () => {
    return localStorage.getItem('token');
  },
};

export default authService;
