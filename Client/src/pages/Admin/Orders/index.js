import classNames from "classnames/bind";
import styles from "./Orders.module.scss";
import { useState, useEffect } from "react";
import adminService from "@/services/adminService";
import { formatPrice } from "@/utils/formatPrice";
import {
  MdShoppingCart,
  MdPending,
  MdAutorenew,
  MdCheckCircle,
  MdCancel,
  MdSearch,
  MdFilterList,
  MdEdit
} from "react-icons/md";

const cx = classNames.bind(styles);

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({
    status: '',
    fromDate: '',
    toDate: '',
    userId: ''
  });
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, []);

  // Auto filter when filters or search change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const updatedFilters = { ...filters, userId: searchKeyword };
      fetchOrdersWithFilters(updatedFilters);
    }, 500); // Debounce 500ms

    return () => clearTimeout(timeoutId);
  }, [filters, searchKeyword]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const result = await adminService.getAllOrders();
      if (result.success) {
        setOrders(result.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrdersWithFilters = async (filterParams) => {
    try {
      setLoading(true);
      const result = await adminService.getAllOrders(filterParams);
      if (result.success) {
        setOrders(result.data);
      }
    } catch (error) {
      console.error('Error fetching filtered orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    const result = await adminService.getOrderStatistics();
    if (result.success) {
      setStats(result.data);
    }
  };



  const handleUpdateStatus = async (invoiceId, newStatus) => {
    try {
      const result = await adminService.updateOrderStatus(invoiceId, newStatus);
      if (result.success) {
        alert('Cập nhật trạng thái thành công!');
        fetchOrders();
        fetchStats();
        setShowStatusModal(false);
        setSelectedOrder(null);
      } else {
        alert('Lỗi: ' + result.message);
      }
    } catch (error) {
      alert('Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'pending';
      case 'processing': return 'processing';
      case 'processed': return 'processed';
      case 'cancelled': return 'cancelled';
      default: return 'pending';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'processing': return 'Đang xử lý';
      case 'processed': return 'Đã hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return MdPending;
      case 'processing': return MdAutorenew;
      case 'processed': return MdCheckCircle;
      case 'cancelled': return MdCancel;
      default: return MdPending;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && orders.length === 0) {
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
          <h1>Quản lý Đơn hàng</h1>
          <p>Quản lý orders và invoices</p>
        </div>
      </div>

      {/* Statistics */}
      <div className={cx("stats-row")}>
        <div className={cx("stat-card")}>
          <MdShoppingCart className={cx("stat-icon")} />
          <div className={cx("stat-content")}>
            <h3>Tổng đơn hàng</h3>
            <span>{stats.totalOrders || 0}</span>
          </div>
        </div>
        <div className={cx("stat-card", "pending")}>
          <MdPending className={cx("stat-icon")} />
          <div className={cx("stat-content")}>
            <h3>Chờ xử lý</h3>
            <span>{stats.pendingOrders || 0}</span>
          </div>
        </div>
        <div className={cx("stat-card", "processing")}>
          <MdAutorenew className={cx("stat-icon")} />
          <div className={cx("stat-content")}>
            <h3>Đang xử lý</h3>
            <span>{stats.processingOrders || 0}</span>
          </div>
        </div>
        <div className={cx("stat-card", "processed")}>
          <MdCheckCircle className={cx("stat-icon")} />
          <div className={cx("stat-content")}>
            <h3>Hoàn thành</h3>
            <span>{stats.processedOrders || 0}</span>
          </div>
        </div>
      </div>

      {/* Revenue Card */}
      <div className={cx("revenue-card")}>
        <div className={cx("revenue-content")}>
          <h3>Tổng doanh thu</h3>
          <div className={cx("revenue-amount")}>{formatPrice(stats.totalRevenue || 0)}</div>
          <span>Doanh thu tháng này: {formatPrice(stats.revenueThisMonth || 0)}</span>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className={cx("search-filter-section")}>
        {/* Search Box */}
        <div className={cx("search-section")}>
          <div className={cx("search-input-wrapper")}>
            <MdSearch className={cx("search-icon")} />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className={cx("search-input")}
              placeholder="Tìm kiếm theo mã đơn hàng, tên khách hàng, email..."
            />
          </div>
        </div>

        {/* Filter Section */}
        <div className={cx("filter-section")}>
          <div className={cx("filter-row")}>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className={cx("filter-select")}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="pending">Chờ xử lý</option>
              <option value="processing">Đang xử lý</option>
              <option value="processed">Đã hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>

            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) => setFilters({...filters, fromDate: e.target.value})}
              className={cx("filter-input")}
              placeholder="Từ ngày"
            />

            <input
              type="date"
              value={filters.toDate}
              onChange={(e) => setFilters({...filters, toDate: e.target.value})}
              className={cx("filter-input")}
              placeholder="Đến ngày"
            />

            <div className={cx("filter-info")}>
              <MdFilterList />
              <span>Tự động lọc</span>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className={cx("table-container")}>
        <table className={cx("orders-table")}>
          <thead>
            <tr>
              <th>Mã đơn hàng</th>
              <th>Khách hàng</th>
              <th>Sản phẩm</th>
              <th>Tổng tiền</th>
              <th>Phương thức TT</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const StatusIcon = getStatusIcon(order.status);
              return (
                <tr key={order.invoiceId}>
                  <td>
                    <div className={cx("order-id")}>
                      <strong>{order.invoiceId}</strong>
                    </div>
                  </td>
                  <td>
                    <div className={cx("customer-info")}>
                      <strong>{order.user?.fullname}</strong>
                      <span>{order.user?.email}</span>
                    </div>
                  </td>
                  <td>
                    <div className={cx("products-info")}>
                      {order.purchasedItems}
                    </div>
                  </td>
                  <td className={cx("total-price")}>
                    {formatPrice(order.totalPrice)}
                  </td>
                  <td>
                    <span className={cx("payment-method")}>
                      {order.paymentMethod === 'cod' ? 'COD' : 'Online'}
                    </span>
                  </td>
                  <td>
                    <div className={cx("status-wrapper")}>
                      <StatusIcon className={cx("status-icon", getStatusColor(order.status))} />
                      <span className={cx("status", getStatusColor(order.status))}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>
                    <div className={cx("action-buttons")}>
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowStatusModal(true);
                        }}
                        className={cx("edit-btn")}
                        title="Cập nhật trạng thái"
                      >
                        <MdEdit />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {orders.length === 0 && !loading && (
          <div className={cx("empty-state")}>
            <p>Không tìm thấy đơn hàng nào</p>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {showStatusModal && selectedOrder && (
        <StatusUpdateModal
          order={selectedOrder}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedOrder(null);
          }}
          onUpdate={handleUpdateStatus}
        />
      )}
    </div>
  );
}

// Status Update Modal Component
function StatusUpdateModal({ order, onClose, onUpdate }) {
  const [newStatus, setNewStatus] = useState(order.status);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onUpdate(order.invoiceId, newStatus);
    setLoading(false);
  };

  const statusOptions = [
    { value: 'pending', label: 'Chờ xử lý' },
    { value: 'processing', label: 'Đang xử lý' },
    { value: 'processed', label: 'Đã hoàn thành' },
    { value: 'cancelled', label: 'Đã hủy' }
  ];

  return (
    <div className={cx("modal-overlay")}>
      <div className={cx("modal")}>
        <div className={cx("modal-header")}>
          <h3>Cập nhật trạng thái đơn hàng</h3>
          <button onClick={onClose} className={cx("close-btn")}>×</button>
        </div>

        <div className={cx("modal-content")}>
          <div className={cx("order-preview")}>
            <div className={cx("preview-info")}>
              <strong>Đơn hàng: {order.invoiceId}</strong>
              <span>Khách hàng: {order.user?.fullname}</span>
              <span>Tổng tiền: {formatPrice(order.totalPrice)}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className={cx("modal-form")}>
            <div className={cx("form-group")}>
              <label>Trạng thái mới:</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                required
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
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
    </div>
  );
}

export default AdminOrders;
