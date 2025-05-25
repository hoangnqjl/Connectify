import classNames from "classnames/bind";
import styles from "./Categories.module.scss";
import { useState, useEffect } from "react";
import adminService from "@/services/adminService";
import categoryService from "@/services/categoryService";
import { MdCategory, MdEdit, MdDelete, MdAdd } from "react-icons/md";

const cx = classNames.bind(styles);

function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    fetchCategories();
    fetchStats();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const result = await categoryService.getAllCategories();
      if (result.success) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    const result = await adminService.getCategoryStatistics();
    if (result.success) {
      setStats(result.data);
    }
  };

  const handleUpdateCategory = async (categoryId, categoryData) => {
    try {
      const result = await adminService.updateCategory(categoryId, categoryData);
      if (result.success) {
        alert('Cập nhật danh mục thành công!');
        fetchCategories();
        fetchStats();
        setShowEditModal(false);
        setSelectedCategory(null);
      } else {
        alert('Lỗi: ' + result.message);
      }
    } catch (error) {
      alert('Có lỗi xảy ra khi cập nhật danh mục');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;

    try {
      const result = await adminService.deleteCategory(categoryId);
      if (result.success) {
        alert('Xóa danh mục thành công!');
        fetchCategories();
        fetchStats();
      } else {
        alert('Lỗi: ' + result.message);
      }
    } catch (error) {
      alert('Có lỗi xảy ra khi xóa danh mục');
    }
  };

  if (loading) {
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
          <h1>Quản lý Danh mục</h1>
          <p>Quản lý categories sản phẩm</p>
        </div>
      </div>

      {/* Statistics */}
      <div className={cx("stats-row")}>
        {stats.map((stat) => (
          <div key={stat.catId} className={cx("stat-card")}>
            <MdCategory className={cx("stat-icon")} />
            <div className={cx("stat-content")}>
              <h3>{stat.catName}</h3>
              <span>{stat.totalProducts} sản phẩm</span>
              <small>{stat.activeProducts} đang hoạt động</small>
            </div>
          </div>
        ))}
      </div>

      {/* Categories Table */}
      <div className={cx("table-container")}>
        <table className={cx("categories-table")}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên danh mục</th>
              <th>Tổng sản phẩm</th>
              <th>Sản phẩm hoạt động</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => {
              const categoryStats = stats.find(s => s.catId === category.cat_id) || {};
              return (
                <tr key={category.cat_id}>
                  <td>{category.cat_id}</td>
                  <td>
                    <div className={cx("category-info")}>
                      <strong>{category.cat_name}</strong>
                    </div>
                  </td>
                  <td>{categoryStats.totalProducts || 0}</td>
                  <td>{categoryStats.activeProducts || 0}</td>
                  <td>
                    <div className={cx("action-buttons")}>
                      <button
                        onClick={() => {
                          setSelectedCategory(category);
                          setShowEditModal(true);
                        }}
                        className={cx("edit-btn")}
                        title="Chỉnh sửa"
                      >
                        <MdEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.cat_id)}
                        className={cx("delete-btn")}
                        title="Xóa"
                      >
                        <MdDelete />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {categories.length === 0 && (
          <div className={cx("empty-state")}>
            <p>Không có danh mục nào</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedCategory && (
        <EditCategoryModal 
          category={selectedCategory}
          onClose={() => {
            setShowEditModal(false);
            setSelectedCategory(null);
          }}
          onUpdate={handleUpdateCategory}
        />
      )}
    </div>
  );
}

// Edit Category Modal Component
function EditCategoryModal({ category, onClose, onUpdate }) {
  const [categoryName, setCategoryName] = useState(category.cat_name);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onUpdate(category.cat_id, { cat_name: categoryName });
    setLoading(false);
  };

  return (
    <div className={cx("modal-overlay")}>
      <div className={cx("modal")}>
        <div className={cx("modal-header")}>
          <h3>Chỉnh sửa Danh mục</h3>
          <button onClick={onClose} className={cx("close-btn")}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className={cx("modal-form")}>
          <div className={cx("form-group")}>
            <label>ID danh mục:</label>
            <input type="text" value={category.cat_id} disabled />
          </div>
          
          <div className={cx("form-group")}>
            <label>Tên danh mục:</label>
            <input
              type="text"
              required
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            />
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

export default AdminCategories;
