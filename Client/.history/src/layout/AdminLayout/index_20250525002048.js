import classNames from "classnames/bind";
import styles from "./AdminLayout.module.scss";
import AdminSidebar from "@/components/AdminSidebar";
import AdminHeader from "@/components/AdminHeader";

const cx = classNames.bind(styles);

function AdminLayout({ children }) {
  return (
    <div className={cx("wrapper")}>
      <AdminSidebar />
      <div className={cx("main-content")}>
        <AdminHeader />
        <div className={cx("content")}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
