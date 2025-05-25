import classNames from "classnames/bind";
import styles from "./OrderHistory.module.scss";
import { IoIosArrowBack } from "react-icons/io";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import invoiceService from "@/services/invoiceService";
import { useUser } from "@/contexts/UserContext";
import { formatPrice } from "@/utils/formatPrice";

const cx = classNames.bind(styles);

function OrderHistory() {
  const { user } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const result = await invoiceService.getUserInvoices();
        if (result.success) {
          setOrders(result.data);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError("Không thể tải lịch sử đơn hàng: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600';
      case 'processing':
        return 'text-blue-600';
      case 'processed':
        return 'text-green-600';
      case 'cancelled':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Chờ xử lý';
      case 'processing':
        return 'Đang xử lý';
      case 'processed':
        return 'Đã hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <div className={cx("wrapper")}>Đang tải...</div>;
  if (error) return <div className={cx("wrapper")}>{error}</div>;

  return (
    <div className={cx("wrapper")}>
      <div className={cx("content")}>
        <Link to="/profile" className={cx("flex", "items-center", "mb-[20px]")}>
          <IoIosArrowBack className={cx("text-[25px]", "mr-[10px]", "cursor-pointer")} />
          <span className={cx("text-[18px]")}>Quay Lại</span>
        </Link>

        <h1 className={cx("title", "text-[24px]", "font-bold", "mb-[20px]")}>
          Lịch sử đơn hàng
        </h1>

        {orders.length > 0 ? (
          <div className={cx("orders-list")}>
            {orders.map((order) => (
              <div key={order.invoiceId} className={cx("order-item")}>
                <div className={cx("order-header")}>
                  <div className={cx("order-id")}>
                    <span className={cx("font-bold")}>Mã đơn hàng: </span>
                    <span>{order.invoiceId}</span>
                  </div>
                  <div className={cx("order-date")}>
                    <span className={cx("text-gray-600")}>
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                </div>

                <div className={cx("order-body")}>
                  <div className={cx("order-info")}>
                    <div className={cx("info-row")}>
                      <span className={cx("font-medium")}>Địa chỉ giao hàng: </span>
                      <span>{order.address}</span>
                    </div>
                    <div className={cx("info-row")}>
                      <span className={cx("font-medium")}>Phương thức thanh toán: </span>
                      <span>{order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'Thanh toán trực tuyến'}</span>
                    </div>
                    <div className={cx("info-row")}>
                      <span className={cx("font-medium")}>Sản phẩm: </span>
                      <span>{order.purchasedItems}</span>
                    </div>
                  </div>
                </div>

                <div className={cx("order-footer")}>
                  <div className={cx("order-status")}>
                    <span className={cx("font-medium")}>Trạng thái: </span>
                    <span className={cx(getStatusColor(order.status), "font-bold")}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  <div className={cx("order-total")}>
                    <span className={cx("font-medium")}>Tổng tiền: </span>
                    <span className={cx("font-bold", "text-red-600")}>
                      {formatPrice(order.totalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={cx("empty-state")}>
            <p className={cx("text-gray-600", "text-center", "py-[40px]")}>
              Bạn chưa có đơn hàng nào
            </p>
            <div className={cx("text-center")}>
              <Link
                to="/"
                className={cx("btn-shop-now")}
              >
                Mua sắm ngay
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderHistory;
