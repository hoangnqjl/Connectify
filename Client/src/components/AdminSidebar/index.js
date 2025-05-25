import classNames from "classnames/bind";
import styles from "./AdminSidebar.module.scss";
import { NavLink, useNavigate } from "react-router-dom";
import {
  MdDashboard,
  MdPeople,
  MdInventory,
  MdShoppingCart,
  MdCategory,
  MdBrandingWatermark,
  MdLogout,
  MdHome
} from "react-icons/md";
import { useUser } from "@/contexts/UserContext";
import authService from "@/services/authService";
import { formatAvatarUrl } from "@/utils/formatPrice";

const cx = classNames.bind(styles);

function AdminSidebar({ isOpen, onClose }) {
  const { user, setUser } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    navigate('/');
  };

  const menuItems = [
    {
      path: '/admin/dashboard',
      icon: MdDashboard,
      label: 'Dashboard',
      description: 'Tổng quan hệ thống'
    },
    {
      path: '/admin/users',
      icon: MdPeople,
      label: 'Quản lý User',
      description: 'Người dùng & phân quyền'
    },
    {
      path: '/admin/products',
      icon: MdInventory,
      label: 'Quản lý Sản phẩm',
      description: 'Kho hàng & inventory'
    },
    {
      path: '/admin/orders',
      icon: MdShoppingCart,
      label: 'Quản lý Đơn hàng',
      description: 'Orders & invoices'
    },
    {
      path: '/admin/categories',
      icon: MdCategory,
      label: 'Danh mục',
      description: 'Categories management'
    },
    {
      path: '/admin/brands',
      icon: MdBrandingWatermark,
      label: 'Thương hiệu',
      description: 'Brands management'
    }
  ];

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <div className={cx("wrapper", { open: isOpen })}>
      <div className={cx("header")}>
        <div className={cx("logo")}>
          <h2>Connectify Admin</h2>
        </div>

        <div className={cx("admin-info")}>
          <img
            src={formatAvatarUrl(user?.avatar)}
            alt="Admin Avatar"
            className={cx("avatar")}
            onError={(e) => {
              e.target.src = "/images/testavt.png";
            }}
          />
          <div className={cx("info")}>
            <h4>{user?.fullname || 'Admin'}</h4>
            <span>{user?.email}</span>
          </div>
        </div>
      </div>

      <nav className={cx("navigation")}>
        <ul className={cx("menu-list")}>
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <li key={item.path} className={cx("menu-item")}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    cx("menu-link", { active: isActive })
                  }
                  onClick={handleLinkClick}
                >
                  <IconComponent className={cx("menu-icon")} />
                  <div className={cx("menu-content")}>
                    <span className={cx("menu-label")}>{item.label}</span>
                    <span className={cx("menu-description")}>{item.description}</span>
                  </div>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={cx("footer")}>
        <NavLink to="/" className={cx("back-to-site")}>
          <MdHome className={cx("icon")} />
          <span>Về trang chủ</span>
        </NavLink>

        <button onClick={handleLogout} className={cx("logout-btn")}>
          <MdLogout className={cx("icon")} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
}

export default AdminSidebar;
