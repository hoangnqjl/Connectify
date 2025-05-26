import classNames from "classnames/bind";
import styles from "./Brands.module.scss";
import { useState, useEffect } from "react";
import adminService from "@/services/adminService";
import electronicService from "@/services/electronicService";
import { MdBrandingWatermark, MdEdit, MdDelete, MdSearch, MdAdd } from "react-icons/md";
import brandService from "@/services/brandService";

const cx = classNames.bind(styles);

function AdminBrands() {
  const [brands, setBrands] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchBrands();
    fetchStats();
  }, []);

  // Auto search when keyword changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchKeyword.trim()) {
        handleSearch();
      } else {
        fetchBrands();
      }
    }, 500); // Debounce 500ms

    return () => clearTimeout(timeoutId);
  }, [searchKeyword]);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching brands from /brands API...');

      // Get brands directly from /brands API
      const result = await brandService.getAllBrands();

      console.log('📋 Brands API result:', result);

      if (result.success) {
        console.log('✅ Brands fetched successfully:', result.data.length, 'brands');
        setBrands(result.data);
      } else {
        console.error('❌ Failed to fetch brands:', result.message);
        // Fallback to electronics data if brands API fails
        console.log('🔄 Falling back to electronics data...');
        const electronicsResult = await electronicService.getAllElectronics();
        if (electronicsResult.success) {
          const uniqueBrands = electronicsResult.data.reduce((acc, product) => {
            if (product.brand && !acc.find(brand => brand.brand_id === product.brand.brand_id)) {
              acc.push(product.brand);
            }
            return acc;
          }, []);
          setBrands(uniqueBrands);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching brands:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    const result = await adminService.getBrandStatistics();
    if (result.success) {
      setStats(result.data);
    }
  };

  const handleSearch = async () => {
    if (!searchKeyword) {
      fetchBrands();
      return;
    }

    try {
      setLoading(true);
      const result = await adminService.searchBrands(searchKeyword);
      if (result.success) {
        setBrands(result.data);
      }
    } catch (error) {
      console.error('Error searching brands:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBrand = async (brandId, brandData) => {
    try {
      const result = await adminService.updateBrand(brandId, brandData);
      if (result.success) {
        alert('Cập nhật thương hiệu thành công!');
        fetchBrands();
        fetchStats();
        setShowEditModal(false);
        setSelectedBrand(null);
      } else {
        alert('Lỗi: ' + result.message);
      }
    } catch (error) {
      alert('Có lỗi xảy ra khi cập nhật thương hiệu');
    }
  };

  // 🏷️ Handler thêm thương hiệu mới
  const handleCreateBrand = async (brandData) => {
    try {
      console.log('🔄 Attempting to create brand:', brandData);

      const result = await brandService.createBrand(brandData);

      console.log('📋 Create brand result:', result);

      if (result.success) {
        alert('✅ ' + (result.message || 'Thêm thương hiệu thành công!'));

        console.log('🔄 Refreshing brands list...');
        await fetchBrands(); // Wait for brands to refresh

        console.log('🔄 Refreshing stats...');
        await fetchStats(); // Wait for stats to refresh

        setShowCreateModal(false);
        console.log('✅ Brand creation process completed');
      } else {
        console.error('❌ Create brand failed:', result.message);
        alert('❌ Lỗi: ' + result.message);
      }
    } catch (error) {
      console.error('❌ Exception during brand creation:', error);
      alert('❌ Có lỗi xảy ra khi thêm thương hiệu: ' + (error.message || 'Lỗi không xác định'));
    }
  };

  const handleDeleteBrand = async (brandId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thương hiệu này?')) return;

    try {
      const result = await adminService.deleteBrand(brandId);
      if (result.success) {
        alert('Xóa thương hiệu thành công!');
        fetchBrands();
        fetchStats();
      } else {
        alert('Lỗi: ' + result.message);
      }
    } catch (error) {
      alert('Có lỗi xảy ra khi xóa thương hiệu');
    }
  };

  if (loading && brands.length === 0) {
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
            <h1>Quản lý Thương hiệu</h1>
            <p>Quản lý brands sản phẩm</p>
          </div>
          <div className={cx("header-actions")}>
            <button
                onClick={() => setShowCreateModal(true)}
                className={cx("add-btn")}
                title="Thêm thương hiệu mới"
            >
              <MdAdd />
              Thêm thương hiệu mới
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className={cx("stats-row")}>
          {stats.slice(0, 4).map((stat) => (
              <div key={stat.brandId} className={cx("stat-card")}>
                <MdBrandingWatermark className={cx("stat-icon")} />
                <div className={cx("stat-content")}>
                  <h3>{stat.brandName}</h3>
                  <span>{stat.totalProducts} sản phẩm</span>
                  <small>{stat.activeProducts} đang hoạt động</small>
                </div>
              </div>
          ))}
        </div>

        {/* Search */}
        <div className={cx("search-section")}>
          <div className={cx("search-input-wrapper")}>
            <MdSearch className={cx("search-icon")} />
            <input
                type="text"
                placeholder="Tìm kiếm thương hiệu..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className={cx("search-input")}
            />
          </div>
          <button onClick={handleSearch} className={cx("search-btn")}>
            Tìm kiếm
          </button>
        </div>

        {/* Brands Table */}
        <div className={cx("table-container")}>
          <table className={cx("brands-table")}>
            <thead>
            <tr>
              <th>ID</th>
              <th>Tên thương hiệu</th>
              <th>Tổng sản phẩm</th>
              <th>Sản phẩm hoạt động</th>
              <th>Thao tác</th>
            </tr>
            </thead>
            <tbody>
            {brands.map((brand) => {
              const brandStats = stats.find(s => s.brandId === brand.brand_id) || {};
              return (
                  <tr key={brand.brand_id}>
                    <td>{brand.brand_id}</td>
                    <td>
                      <div className={cx("brand-info")}>
                        <strong>{brand.brand_name}</strong>
                      </div>
                    </td>
                    <td>{brandStats.totalProducts || 0}</td>
                    <td>{brandStats.activeProducts || 0}</td>
                    <td>
                      <div className={cx("action-buttons")}>
                        <button
                            onClick={() => {
                              setSelectedBrand(brand);
                              setShowEditModal(true);
                            }}
                            className={cx("edit-btn")}
                            title="Chỉnh sửa"
                        >
                          <MdEdit />
                        </button>
                        <button
                            onClick={() => handleDeleteBrand(brand.brand_id)}
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

          {brands.length === 0 && !loading && (
              <div className={cx("empty-state")}>
                <p>Không tìm thấy thương hiệu nào</p>
              </div>
          )}
        </div>

        {/* Create Brand Modal */}
        {showCreateModal && (
            <CreateBrandModal
                onClose={() => setShowCreateModal(false)}
                onSubmit={handleCreateBrand}
            />
        )}

        {/* Edit Modal */}
        {showEditModal && selectedBrand && (
            <EditBrandModal
                brand={selectedBrand}
                onClose={() => {
                  setShowEditModal(false);
                  setSelectedBrand(null);
                }}
                onUpdate={handleUpdateBrand}
            />
        )}
      </div>
  );
}

// 📦 Create Brand Modal Component
function CreateBrandModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    brand_id: '',
    brand_name: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.brand_id.trim()) {
      newErrors.brand_id = 'ID thương hiệu là bắt buộc';
    }

    if (!formData.brand_name.trim()) {
      newErrors.brand_name = 'Tên thương hiệu là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error creating brand:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className={cx("modal-overlay")}>
        <div className={cx("modal")}>
          <div className={cx("modal-header")}>
            <h3>Thêm thương hiệu mới</h3>
            <button onClick={onClose} className={cx("close-btn")}>×</button>
          </div>

          <form onSubmit={handleSubmit} className={cx("modal-form")}>
            <div className={cx("form-group")}>
              <label>ID thương hiệu *</label>
              <input
                  type="text"
                  name="brand_id"
                  value={formData.brand_id}
                  onChange={handleInputChange}
                  className={cx({ 'error': errors.brand_id })}
                  placeholder="VD: apple_001, samsung_002"
                  required
              />
              {errors.brand_id && <span className={cx("error-message")}>{errors.brand_id}</span>}
            </div>

            <div className={cx("form-group")}>
              <label>Tên thương hiệu *</label>
              <input
                  type="text"
                  name="brand_name"
                  value={formData.brand_name}
                  onChange={handleInputChange}
                  className={cx({ 'error': errors.brand_name })}
                  placeholder="VD: Apple, Samsung"
                  required
              />
              {errors.brand_name && <span className={cx("error-message")}>{errors.brand_name}</span>}
            </div>

            <div className={cx("modal-actions")}>
              <button type="button" onClick={onClose} className={cx("cancel-btn")}>
                Hủy
              </button>
              <button type="submit" disabled={loading} className={cx("submit-btn")}>
                {loading ? 'Đang thêm...' : 'Thêm thương hiệu'}
              </button>
            </div>
          </form>
        </div>
      </div>
  );
}

// Edit Brand Modal Component
function EditBrandModal({ brand, onClose, onUpdate }) {
  const [brandName, setBrandName] = useState(brand.brand_name);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onUpdate(brand.brand_id, { brand_name: brandName });
    setLoading(false);
  };

  return (
      <div className={cx("modal-overlay")}>
        <div className={cx("modal")}>
          <div className={cx("modal-header")}>
            <h3>Chỉnh sửa Thương hiệu</h3>
            <button onClick={onClose} className={cx("close-btn")}>×</button>
          </div>

          <form onSubmit={handleSubmit} className={cx("modal-form")}>
            <div className={cx("form-group")}>
              <label>ID thương hiệu:</label>
              <input type="text" value={brand.brand_id} disabled />
            </div>

            <div className={cx("form-group")}>
              <label>Tên thương hiệu:</label>
              <input
                  type="text"
                  required
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
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

export default AdminBrands;