import classNames from "classnames/bind";
import styles from "./Dashboard.module.scss";
import { useState, useEffect } from "react";
import adminService from "@/services/adminService";
import { formatPrice } from "@/utils/formatPrice";
import { 
  MdPeople, 
  MdInventory, 
  MdShoppingCart, 
  MdAttachMoney,
  MdTrendingUp,
  MdWarning
} from "react-icons/md";

const cx = classNames.bind(styles);

function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: {},
    products: {},
    orders: {},
    revenue: {}
  });
  const [lowStockProducts, setLowStockProducts] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all statistics
        const [userStats, productStats, orderStats, lowStock] = await Promise.all([
          adminService.getUserStatistics(),
          adminService.getProductStatistics(),
          adminService.getOrderStatistics(),
          adminService.getLowStockProducts(10)
        ]);

        setStats({
          users: userStats.success ? userStats.data : {},
          products: productStats.success ? productStats.data : {},
          orders: orderStats.success ? orderStats.data : {},
        });

        if (lowStock.success) {
          setLowStockProducts(lowStock.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: "Tổng Users",
      value: stats.users.totalUsers || 0,
      icon: MdPeople,
      color: "blue",
      subtitle: `${stats.users.newUsersThisMonth || 0} user mới tháng này`
    },
    {
      title: "Tổng Sản phẩm",
      value: stats.products.totalProducts || 0,
      icon: MdInventory,
      color: "green",
      subtitle: `${stats.products.activeProducts || 0} đang hoạt động`
    },
    {
      title: "Tổng Đơn hàng",
      value: stats.orders.totalOrders || 0,
      icon: MdShoppingCart,
      color: "orange",
      subtitle: `${stats.orders.pendingOrders || 0} đang chờ xử lý`
    },
    {
      title: "Doanh thu",
      value: formatPrice(stats.orders.totalRevenue || 0),
      icon: MdAttachMoney,
      color: "purple",
      subtitle: `${formatPrice(stats.orders.revenueThisMonth || 0)} tháng này`
    }
  ];

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
        <h1>Dashboard</h1>
        <p>Tổng quan hệ thống Connectify</p>
      </div>

      {/* Statistics Cards */}
      <div className={cx("stats-grid")}>
        {statCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <div key={index} className={cx("stat-card", card.color)}>
              <div className={cx("stat-icon")}>
                <IconComponent />
              </div>
              <div className={cx("stat-content")}>
                <h3>{card.title}</h3>
                <div className={cx("stat-value")}>{card.value}</div>
                <div className={cx("stat-subtitle")}>{card.subtitle}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions & Alerts */}
      <div className={cx("dashboard-grid")}>
        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (
          <div className={cx("alert-card")}>
            <div className={cx("alert-header")}>
              <MdWarning className={cx("alert-icon")} />
              <h3>Sản phẩm sắp hết hàng</h3>
            </div>
            <div className={cx("alert-content")}>
              {lowStockProducts.slice(0, 5).map((product) => (
                <div key={product.id} className={cx("alert-item")}>
                  <span className={cx("product-name")}>{product.name}</span>
                  <span className={cx("stock-quantity")}>
                    Còn {product.quantity} sản phẩm
                  </span>
                </div>
              ))}
              {lowStockProducts.length > 5 && (
                <div className={cx("alert-more")}>
                  +{lowStockProducts.length - 5} sản phẩm khác
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className={cx("activity-card")}>
          <div className={cx("activity-header")}>
            <MdTrendingUp className={cx("activity-icon")} />
            <h3>Hoạt động gần đây</h3>
          </div>
          <div className={cx("activity-content")}>
            <div className={cx("activity-item")}>
              <span>Đơn hàng chờ xử lý: {stats.orders.pendingOrders || 0}</span>
            </div>
            <div className={cx("activity-item")}>
              <span>Đơn hàng đang xử lý: {stats.orders.processingOrders || 0}</span>
            </div>
            <div className={cx("activity-item")}>
              <span>Sản phẩm hết hàng: {stats.products.inactiveProducts || 0}</span>
            </div>
            <div className={cx("activity-item")}>
              <span>Users hoạt động: {stats.users.activeUsers || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
