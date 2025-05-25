import classNames from "classnames/bind";
import styles from "./AdminLayout.module.scss";
import AdminSidebar from "@/components/AdminSidebar";
import AdminHeader from "@/components/AdminHeader";
import { useState } from "react";

const cx = classNames.bind(styles);

function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={cx("wrapper")}>
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className={cx("main-content")}>
        <AdminHeader onMenuToggle={handleMenuToggle} />
        <div className={cx("content")}>
          {children}
        </div>
      </div>
      {sidebarOpen && <div className={cx("overlay")} onClick={() => setSidebarOpen(false)} />}
    </div>
  );
}

export default AdminLayout;
