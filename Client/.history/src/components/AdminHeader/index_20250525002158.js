import classNames from "classnames/bind";
import styles from "./AdminHeader.module.scss";
import { MdNotifications, MdSearch, MdMenu } from "react-icons/md";
import { useState } from "react";

const cx = classNames.bind(styles);

function AdminHeader() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality
    console.log("Search:", searchQuery);
  };

  return (
    <header className={cx("wrapper")}>
      <div className={cx("left-section")}>
        <button className={cx("menu-toggle")}>
          <MdMenu />
        </button>
        
        <form onSubmit={handleSearch} className={cx("search-form")}>
          <div className={cx("search-input-wrapper")}>
            <MdSearch className={cx("search-icon")} />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cx("search-input")}
            />
          </div>
        </form>
      </div>

      <div className={cx("right-section")}>
        <button className={cx("notification-btn")}>
          <MdNotifications />
          <span className={cx("notification-badge")}>3</span>
        </button>
        
        <div className={cx("current-time")}>
          {new Date().toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
