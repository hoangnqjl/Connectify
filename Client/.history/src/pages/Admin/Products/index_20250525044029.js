import classNames from "classnames/bind";
import styles from "./Products.module.scss";
import { useState, useEffect } from "react";
import adminService from "@/services/adminService";
import electronicService from "@/services/electronicService";
import { formatPrice, formatImageUrl } from "@/utils/formatPrice";
import {
  MdInventory,
  MdWarning,
  MdEdit,
  MdSearch,
  MdFilterList,
  MdTrendingUp,
  MdTrendingDown
} from "react-icons/md";

const cx = classNames.bind(styles);

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [searchFilters, setSearchFilters] = useState({
    keyword: '',
    categoryId: '',
    brandId: '',
    status: ''
  });
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchStats();
    fetchLowStock();
    fetchCategories();
    fetchBrands();
  }, []);

  // Auto search when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchFilters.keyword || searchFilters.categoryId || searchFilters.brandId || searchFilters.status) {
        handleSearch();
      } else {
        fetchProducts(); // Reset to all products if no filters
      }
    }, 500); // Debounce 500ms

    return () => clearTimeout(timeoutId);
  }, [searchFilters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const result = await electronicService.getAllElectronics();
      if (result.success) {
        setProducts(result.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    const result = await adminService.getProductStatistics();
    if (result.success) {
      setStats(result.data);
    }
  };

  const fetchLowStock = async () => {
    const result = await adminService.getLowStockProducts(10);
    if (result.success) {
      setLowStockProducts(result.data);
    }
  };

  const fetchCategories = async () => {
    const result = await electronicService.getAllElectronics();
    if (result.success) {
      const uniqueCategories = result.data.reduce((acc, product) => {
        if (product.category && !acc.find(cat => cat.cat_id === product.category.cat_id)) {
          acc.push(product.category);
        }
        return acc;
      }, []);
      setCategories(uniqueCategories);
    }
  };

  const fetchBrands = async () => {
    const result = await electronicService.getAllElectronics();
    if (result.success) {
      const uniqueBrands = result.data.reduce((acc, product) => {
        if (product.brand && !acc.find(brand => brand.brand_id === product.brand.brand_id)) {
          acc.push(product.brand);
        }
        return acc;
      }, []);
      setBrands(uniqueBrands);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const result = await adminService.searchProducts(searchFilters);
      if (result.success) {
        setProducts(result.data);
      }
    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (productId, newQuantity) => {
    try {
      const result = await adminService.updateProductStock(productId, newQuantity);
      if (result.success) {
        alert('Cập nhật số lượng thành công!');
        fetchProducts();
        fetchStats();
        fetchLowStock();
        setShowStockModal(false);
        setSelectedProduct(null);
      } else {
        alert('Lỗi: ' + result.message);
      }
    } catch (error) {
      alert('Có lỗi xảy ra khi cập nhật số lượng');
    }
  };

  const getStatusColor = (quantity) => {
    if (quantity === 0) return 'out-of-stock';
    if (quantity < 10) return 'low-stock';
    return 'active'; // quantity > 0 means active
  };

  const getStatusText = (quantity) => {
    if (quantity === 0) return 'Hết hàng';
    if (quantity < 10) return 'Sắp hết';
    return 'Còn hàng'; // quantity > 0 means in stock
  };

  if (loading && products.length === 0) {
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
          <h1>Quản lý Sản phẩm</h1>
          <p>Quản lý kho hàng và inventory</p>
        </div>
      </div>

      {/* Statistics */}
      <div className={cx("stats-row")}>
        <div className={cx("stat-card")}>
          <MdInventory className={cx("stat-icon")} />
          <div className={cx("stat-content")}>
            <h3>Tổng sản phẩm</h3>
            <span>{stats.totalProducts || 0}</span>
          </div>
        </div>
        <div className={cx("stat-card", "active")}>
          <MdTrendingUp className={cx("stat-icon")} />
          <div className={cx("stat-content")}>
            <h3>Đang bán</h3>
            <span>{stats.activeProducts || 0}</span>
          </div>
        </div>
        <div className={cx("stat-card", "inactive")}>
          <MdTrendingDown className={cx("stat-icon")} />
          <div className={cx("stat-content")}>
            <h3>Ngừng bán</h3>
            <span>{stats.inactiveProducts || 0}</span>
          </div>
        </div>
        <div className={cx("stat-card", "warning")}>
          <MdWarning className={cx("stat-icon")} />
          <div className={cx("stat-content")}>
            <h3>Sắp hết hàng</h3>
            <span>{stats.lowStockProducts || 0}</span>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className={cx("alert-section")}>
          <div className={cx("alert-header")}>
            <MdWarning className={cx("alert-icon")} />
            <h3>Sản phẩm sắp hết hàng (≤ 10)</h3>
          </div>
          <div className={cx("alert-products")}>
            {lowStockProducts.slice(0, 5).map((product) => (
              <div key={product.id} className={cx("alert-product")}>
                <img
                  src={formatImageUrl(product.image)}
                  alt={product.name}
                  className={cx("alert-product-image")}
                />
                <div className={cx("alert-product-info")}>
                  <strong>{product.name}</strong>
                  <span>Còn {product.quantity} sản phẩm</span>
                </div>
                <button
                  className={cx("update-stock-btn")}
                  onClick={() => {
                    setSelectedProduct(product);
                    setShowStockModal(true);
                  }}
                >
                  Nhập hàng
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className={cx("search-section")}>
        <div className={cx("search-input-wrapper")}>
          <MdSearch className={cx("search-icon")} />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchFilters.keyword}
            onChange={(e) => setSearchFilters({...searchFilters, keyword: e.target.value})}
            className={cx("search-input")}
          />
        </div>

        <select
          value={searchFilters.categoryId}
          onChange={(e) => setSearchFilters({...searchFilters, categoryId: e.target.value})}
          className={cx("filter-select")}
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((category) => (
            <option key={category.cat_id} value={category.cat_id}>
              {category.cat_name}
            </option>
          ))}
        </select>

        <select
          value={searchFilters.brandId}
          onChange={(e) => setSearchFilters({...searchFilters, brandId: e.target.value})}
          className={cx("filter-select")}
        >
          <option value="">Tất cả thương hiệu</option>
          {brands.map((brand) => (
            <option key={brand.brand_id} value={brand.brand_id}>
              {brand.brand_name}
            </option>
          ))}
        </select>

        <select
          value={searchFilters.status}
          onChange={(e) => setSearchFilters({...searchFilters, status: e.target.value})}
          className={cx("filter-select")}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">Đang bán</option>
          <option value="inactive">Ngừng bán</option>
        </select>

        <button onClick={handleSearch} className={cx("search-btn")}>
          <MdFilterList />
          Lọc
        </button>
      </div>

      {/* Products Table */}
      <div className={cx("table-container")}>
        <table className={cx("products-table")}>
          <thead>
            <tr>
              <th>Hình ảnh</th>
              <th>Thông tin sản phẩm</th>
              <th>Danh mục</th>
              <th>Thương hiệu</th>
              <th>Giá</th>
              <th>Số lượng</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  <img
                    src={formatImageUrl(product.image)}
                    alt={product.name}
                    className={cx("product-image")}
                    onError={(e) => {
                      e.target.src = "/images/item.jpg";
                    }}
                  />
                </td>
                <td>
                  <div className={cx("product-info")}>
                    <strong>{product.name}</strong>
                    <span>{product.id}</span>
                  </div>
                </td>
                <td>{product.category?.cat_name || 'N/A'}</td>
                <td>{product.brand?.brand_name || 'N/A'}</td>
                <td className={cx("price")}>{formatPrice(product.price)}</td>
                <td>
                  <span className={cx("quantity", getStatusColor(product.quantity))}>
                    {product.quantity}
                  </span>
                </td>
                <td>
                  <span className={cx("status", getStatusColor(product.quantity))}>
                    {getStatusText(product.quantity)}
                  </span>
                </td>
                <td>
                  <div className={cx("action-buttons")}>
                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowStockModal(true);
                      }}
                      className={cx("stock-btn")}
                      title="Cập nhật số lượng"
                    >
                      <MdEdit />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && !loading && (
          <div className={cx("empty-state")}>
            <p>Không tìm thấy sản phẩm nào</p>
          </div>
        )}
      </div>

      {/* Stock Update Modal */}
      {showStockModal && selectedProduct && (
        <StockUpdateModal
          product={selectedProduct}
          onClose={() => {
            setShowStockModal(false);
            setSelectedProduct(null);
          }}
          onUpdate={handleUpdateStock}
        />
      )}
    </div>
  );
}

// Stock Update Modal Component
function StockUpdateModal({ product, onClose, onUpdate }) {
  const [newQuantity, setNewQuantity] = useState(product.quantity);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onUpdate(product.id, parseInt(newQuantity));
    setLoading(false);
  };

  return (
    <div className={cx("modal-overlay")}>
      <div className={cx("modal")}>
        <div className={cx("modal-header")}>
          <h3>Cập nhật số lượng</h3>
          <button onClick={onClose} className={cx("close-btn")}>×</button>
        </div>

        <div className={cx("modal-content")}>
          <div className={cx("product-preview")}>
            <img
              src={formatImageUrl(product.image)}
              alt={product.name}
              className={cx("preview-image")}
            />
            <div className={cx("preview-info")}>
              <strong>{product.name}</strong>
              <span>Hiện tại: {product.quantity} sản phẩm</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className={cx("modal-form")}>
            <div className={cx("form-group")}>
              <label>Số lượng mới:</label>
              <input
                type="number"
                min="0"
                required
                value={newQuantity}
                onChange={(e) => setNewQuantity(e.target.value)}
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
    </div>
  );
}

export default AdminProducts;
