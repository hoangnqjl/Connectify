import classNames from "classnames/bind";
import styles from "./Users.module.scss";
import { useState, useEffect } from "react";
import adminService from "@/services/adminService";
import { formatAvatarUrl } from "@/utils/formatPrice";
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdSearch,
  MdPeople,
  MdAdminPanelSettings
} from "react-icons/md";

const cx = classNames.bind(styles);

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterType, setFilterType] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching users...');
      const result = await adminService.getAllUsers();
      console.log('📊 Users result:', result);

      if (result.success) {
        console.log('✅ Users loaded successfully:', result.data.length, 'users');
        setUsers(result.data);
      } else {
        console.error('❌ Failed to load users:', result.message);
        alert('Lỗi: ' + result.message);
      }
    } catch (error) {
      console.error('💥 Error fetching users:', error);
      alert('Có lỗi xảy ra khi tải danh sách users');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    const result = await adminService.getUserStatistics();
    if (result.success) {
      setStats(result.data);
    }
  };

  const handleSearch = async () => {
    if (!searchKeyword && !filterType) {
      fetchUsers();
      return;
    }

    try {
      setLoading(true);
      const result = await adminService.searchUsers(searchKeyword, filterType);
      if (result.success) {
        setUsers(result.data);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    // Find user to get more info for confirmation
    const userToDelete = users.find(user => user.userId === userId);
    if (!userToDelete) {
      alert('Không tìm thấy user cần xóa');
      return;
    }

    // Show different confirmation message based on user type
    const confirmMessage = userToDelete.type === 'admin'
      ? `Bạn đang cố gắng xóa tài khoản ADMIN "${userToDelete.fullname}". Điều này không được phép!`
      : `Bạn có chắc chắn muốn xóa user "${userToDelete.fullname}" (${userToDelete.email})?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      const result = await adminService.deleteUser(userId);
      if (result.success) {
        alert('Xóa user thành công!');
        fetchUsers();
        fetchStats();
      } else {
        alert('Lỗi: ' + result.message);
      }
    } catch (error) {
      alert('Có lỗi xảy ra khi xóa user');
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading && users.length === 0) {
    return (
      <div className={cx("wrapper")}>
        <div className={cx("loading")}>Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <div className={cx("wrapper")}>
      <div className={cx("header")}>
        <div className={cx("title-section")}>
          <h1>Quản lý Users</h1>
          <p>Quản lý người dùng và phân quyền hệ thống</p>
        </div>

        <button
          className={cx("create-btn")}
          onClick={() => setShowCreateModal(true)}
        >
          <MdAdd />
          Tạo User Mới
        </button>
      </div>

      {/* Statistics */}
      <div className={cx("stats-row")}>
        <div className={cx("stat-card")}>
          <MdPeople className={cx("stat-icon")} />
          <div className={cx("stat-content")}>
            <h3>Tổng Users</h3>
            <span>{stats.totalUsers || 0}</span>
          </div>
        </div>
        <div className={cx("stat-card")}>
          <MdAdminPanelSettings className={cx("stat-icon")} />
          <div className={cx("stat-content")}>
            <h3>Admins</h3>
            <span>{stats.adminCount || 0}</span>
          </div>
        </div>
        <div className={cx("stat-card")}>
          <MdPeople className={cx("stat-icon")} />
          <div className={cx("stat-content")}>
            <h3>Users</h3>
            <span>{stats.userCount || 0}</span>
          </div>
        </div>
        <div className={cx("stat-card")}>
          <MdPeople className={cx("stat-icon")} />
          <div className={cx("stat-content")}>
            <h3>Hoạt động</h3>
            <span>{stats.activeUsers || 0}</span>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className={cx("search-section")}>
        <div className={cx("search-input-wrapper")}>
          <MdSearch className={cx("search-icon")} />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className={cx("search-input")}
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className={cx("filter-select")}
        >
          <option value="">Tất cả loại</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>

        <button onClick={handleSearch} className={cx("search-btn")}>
          Tìm kiếm
        </button>
      </div>

      {/* Users Table */}
      <div className={cx("table-container")}>
        <table className={cx("users-table")}>
          <thead>
            <tr>
              <th>Avatar</th>
              <th>Thông tin</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Loại</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.userId}>
                <td>
                  <img
                    src={formatAvatarUrl(user.avatar)}
                    alt="Avatar"
                    className={cx("user-avatar")}
                    onError={(e) => {
                      e.target.src = "/images/testavt.png";
                    }}
                  />
                </td>
                <td>
                  <div className={cx("user-info")}>
                    <strong>{user.fullname}</strong>
                    <span>{user.userId}</span>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>{user.phonenumber || user.phoneNumber}</td>
                <td>
                  <span className={cx("user-type", user.type)}>
                    {user.type === 'admin' ? 'Admin' : 'User'}
                  </span>
                </td>
                <td>{formatDate(user.createdAt)}</td>
                <td>
                  <div className={cx("action-buttons")}>
                    <button
                      onClick={() => handleEditUser(user)}
                      className={cx("edit-btn")}
                      title="Chỉnh sửa"
                    >
                      <MdEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.userId)}
                      className={cx("delete-btn", { "disabled": user.type === 'admin' })}
                      title={user.type === 'admin' ? "Không thể xóa admin" : "Xóa user"}
                      disabled={user.type === 'admin'}
                    >
                      <MdDelete />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && !loading && (
          <div className={cx("empty-state")}>
            <p>Không tìm thấy user nào</p>
          </div>
        )}
      </div>

      {/* Modals will be added here */}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            fetchUsers();
            fetchStats();
            setShowCreateModal(false);
          }}
        />
      )}

      {showEditModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            fetchUsers();
            fetchStats();
            setShowEditModal(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
}

// Create User Modal Component
function CreateUserModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    fullname: '',
    phonenumber: '',
    password: '',
    type: 'user'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await adminService.createUser(formData);
      if (result.success) {
        alert('Tạo user thành công!');
        onSuccess();
      } else {
        alert('Lỗi: ' + result.message);
      }
    } catch (error) {
      alert('Có lỗi xảy ra khi tạo user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cx("modal-overlay")}>
      <div className={cx("modal")}>
        <div className={cx("modal-header")}>
          <h3>Tạo User Mới</h3>
          <button onClick={onClose} className={cx("close-btn")}>×</button>
        </div>

        <form onSubmit={handleSubmit} className={cx("modal-form")}>
          <div className={cx("form-group")}>
            <label>Email:</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className={cx("form-group")}>
            <label>Họ tên:</label>
            <input
              type="text"
              required
              value={formData.fullname}
              onChange={(e) => setFormData({...formData, fullname: e.target.value})}
            />
          </div>

          <div className={cx("form-group")}>
            <label>Số điện thoại:</label>
            <input
              type="tel"
              required
              value={formData.phonenumber}
              onChange={(e) => setFormData({...formData, phonenumber: e.target.value})}
            />
          </div>

          <div className={cx("form-group")}>
            <label>Mật khẩu:</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <div className={cx("form-group")}>
            <label>Loại:</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className={cx("modal-actions")}>
            <button type="button" onClick={onClose} className={cx("cancel-btn")}>
              Hủy
            </button>
            <button type="submit" disabled={loading} className={cx("submit-btn")}>
              {loading ? 'Đang tạo...' : 'Tạo User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit User Modal Component
function EditUserModal({ user, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    fullname: user.fullname || '',
    phonenumber: user.phonenumber || user.phoneNumber || '',
    type: user.type || 'user'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await adminService.updateUser(user.userId, formData);
      if (result.success) {
        alert('Cập nhật user thành công!');
        onSuccess();
      } else {
        alert('Lỗi: ' + result.message);
      }
    } catch (error) {
      alert('Có lỗi xảy ra khi cập nhật user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cx("modal-overlay")}>
      <div className={cx("modal")}>
        <div className={cx("modal-header")}>
          <h3>Chỉnh sửa User</h3>
          <button onClick={onClose} className={cx("close-btn")}>×</button>
        </div>

        <form onSubmit={handleSubmit} className={cx("modal-form")}>
          <div className={cx("form-group")}>
            <label>Email:</label>
            <input type="email" value={user.email} disabled />
          </div>

          <div className={cx("form-group")}>
            <label>Họ tên:</label>
            <input
              type="text"
              required
              value={formData.fullname}
              onChange={(e) => setFormData({...formData, fullname: e.target.value})}
            />
          </div>

          <div className={cx("form-group")}>
            <label>Số điện thoại:</label>
            <input
              type="tel"
              required
              value={formData.phonenumber}
              onChange={(e) => setFormData({...formData, phonenumber: e.target.value})}
            />
          </div>

          <div className={cx("form-group")}>
            <label>Loại:</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className={cx("modal-actions")}>
            <button type="button" onClick={onClose} className={cx("cancel-btn")}>
              Hủy
            </button>
            <button type="submit" disabled={loading} className={cx("submit-btn")}>
              {loading ? 'Đang cập nhật...' : 'Cập nhật'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminUsers;
