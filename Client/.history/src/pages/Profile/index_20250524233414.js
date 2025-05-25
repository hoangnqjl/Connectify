import classNames from "classnames/bind";
import styles from './Profile.module.scss'
import { MdOutlineArrowBackIos } from "react-icons/md";
import { Link } from "react-router-dom";
import { AiOutlineUser } from "react-icons/ai";
import { LiaMoneyCheckAltSolid } from "react-icons/lia";
import { MdProductionQuantityLimits } from "react-icons/md";
import { FaHistory } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import invoiceService from "@/services/invoiceService";
import { formatPrice, formatAvatarUrl } from "@/utils/formatPrice";

const cx = classNames.bind(styles)
function Profile() {
    const [activeTab, setActiveTab] = useState("info");
    const { user, token } = useUser();
    const [invoices, setInvoices] = useState([]);
    const [pendingInvoices, setPendingInvoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInvoices = async () => {
            setLoading(true);
            try {
                const result = await invoiceService.getInvoicesByUser();
                if (result.success) {
                    const processedInvoices = (result.data || []).filter(
                        invoice => invoice.status === "processed"
                    );
                    const processingInvoices = (result.data || []).filter(
                        invoice => invoice.status === "processing"
                    );
                    setInvoices(processedInvoices);
                    setPendingInvoices(processingInvoices);
                } else {
                    setError(result.message);
                }
            } catch (err) {
                setError("Không thể tải danh sách hóa đơn: " + err.message);
            } finally {
                setLoading(false);
            }
        };

        if (activeTab === "bill" || activeTab === "order") {
            fetchInvoices();
        }
    }, [activeTab, token]);

    return (
        <div className={cx('wrapper')}>
            <div className={cx('content')}>
                <div className={cx('sibar')}>
                    <div className={cx('flex','items-center','mb-[30px]')}>
                        <Link to='/'><MdOutlineArrowBackIos className={cx('text-[25px]','mr-[10px]')}/></Link>
                        <span className={cx('text-[20px]','font-medium','text-[#3F3F46]')}>Quay lại</span>
                    </div>

                   <div className={cx('tabs')}>
                    <div
                        className={cx('tab-item', { active: activeTab === "info" })}
                        onClick={() => setActiveTab("info")}
                    >
                        <AiOutlineUser className={cx('text-[20px]', 'mr-[10px]')} />
                        <span className={cx('text-[#263646]', 'text-[14px]', 'font-semibold')}>Thông tin cá nhân</span>
                    </div>

                    <div
                        className={cx('tab-item', { active: activeTab === "bill" })}
                        onClick={() => setActiveTab("bill")}
                    >
                        <LiaMoneyCheckAltSolid className={cx('text-[20px]', 'mr-[10px]')} />
                        <span className={cx('text-[#263646]', 'text-[14px]', 'font-semibold')}>Hóa đơn của bạn</span>
                    </div>

                    <div
                        className={cx('tab-item', { active: activeTab === "order" })}
                        onClick={() => setActiveTab("order")}
                    >
                        <MdProductionQuantityLimits className={cx('text-[20px]', 'mr-[10px]')} />
                        <span className={cx('text-[#263646]', 'text-[14px]', 'font-semibold')}>Đơn hàng chờ duyệt</span>
                    </div>

                    <Link to="/orders" className={cx('tab-item')}>
                        <FaHistory className={cx('text-[20px]', 'mr-[10px]')} />
                        <span className={cx('text-[#263646]', 'text-[14px]', 'font-semibold')}>Lịch sử đơn hàng</span>
                    </Link>
                    </div>

                </div>
                <div className={cx('content-tab')}>
                    {activeTab === "info" && <div className={cx('information')}>
                            <div className={cx('flex','items-center','mb-[20px]')}>
                                <img
                                  className={cx('avt')}
                                  alt=''
                                  src={formatAvatarUrl(user?.avatar)}
                                  onError={(e) => {
                                    e.target.src = "/images/testavt.png"; // Fallback avatar
                                  }}
                                />
                                <div className={cx('flex','flex-col')}>
                                    <h1 className={cx('text-[20px]','font-semibold','text-[#263646]')}>{user?.fullname || 'Fullname'}</h1>
                                    <span className={cx('text-[16px]','mt-[10px]')}>{user?.userId}</span>
                                </div>
                            </div>
                            <div className={cx('w-full')}>
                                <h1 className={cx('text-[18px]','text-[#263646]','font-medium','mb-[20px]')}>Thông tin của bạn</h1>
                                <form>
                                    <div className={cx('w-full','flex','justify-between','items-center')}>
                                        <div className={cx('form-group')}>
                                            <label>Họ và tên</label>
                                            <input placeholder={user?.fullname || 'fullname...'}/>
                                        </div>
                                         <div className={cx('form-group')}>
                                            <label>Username</label>
                                            <input placeholder={user?.username || 'username...'}/>
                                        </div>
                                    </div>
                                     <div className={cx('w-full','flex','justify-between','items-center','my-[20px]')}>
                                        <div className={cx('form-group')}>
                                            <label>Email</label>
                                            <input placeholder={user?.email || 'email...'}/>
                                        </div>
                                         <div className={cx('form-group')}>
                                            <label>Số điện thoại</label>
                                            <input placeholder={user?.phoneNumber || 'phonenumber...'}/>
                                        </div>
                                    </div>
                                    <button className={cx('btn-submit')}>Lưu thông tin</button>
                                </form>
                            </div>
                        </div>
                    }

                    {activeTab === "bill" && (
                        <div className={cx('bill')}>
                            {loading && <div className={cx('text-[#888]', 'p-[20px]')}>Đang tải...</div>}
                            {error && <div className={cx('text-[#888]', 'p-[20px]')}>{error}</div>}
                            {!loading && !error && invoices.length === 0 && (
                                <div className={cx('text-[#888]', 'p-[20px]')}>Không có hóa đơn nào</div>
                            )}
                            {!loading && !error && invoices.map((invoice) => (
                                <div key={invoice.invoiceId} className={cx('bill-item')}>
                                    <div className={cx('bill-infor', 'mb-[20px]', 'flex', 'items-center')}>
                                        <p className={cx('font-normal', 'text-[14px]')}>Tên khách hàng:</p>
                                        <span className={cx('font-medium', 'text-[14px]', 'ml-[6px]')}>
                                            {invoice.user?.fullname || 'Không xác định'}
                                        </span>
                                    </div>
                                    <div className={cx('bill-infor', 'mb-[20px]', 'flex', 'items-center')}>
                                        <p className={cx('font-normal', 'text-[14px]')}>Địa chỉ:</p>
                                        <span className={cx('font-medium', 'text-[14px]', 'ml-[6px]')}>
                                            {invoice.address}
                                        </span>
                                    </div>
                                    <div className={cx('bill-infor', 'mb-[20px]', 'flex', 'items-center')}>
                                        <p className={cx('font-normal', 'text-[14px]')}>SĐT:</p>
                                        <span className={cx('font-medium', 'text-[14px]', 'ml-[6px]')}>
                                            {invoice.user?.phoneNumber || 'Không xác định'}
                                        </span>
                                    </div>
                                    <div className={cx('bill-infor', 'mb-[20px]', 'flex', 'items-center')}>
                                        <p className={cx('font-normal', 'text-[14px]')}>Ngày đặt:</p>
                                        <span className={cx('font-medium', 'text-[14px]', 'ml-[6px]')}>
                                            {new Date(invoice.createdAt).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>
                                    <div className={cx('bill-infor', 'mb-[20px]', 'flex', 'items-center')}>
                                        <p className={cx('font-normal', 'text-[14px]')}>Mã hóa đơn:</p>
                                        <span className={cx('font-medium', 'text-[14px]', 'ml-[6px]')}>
                                            {invoice.invoiceId}
                                        </span>
                                    </div>
                                    <div className={cx('bill-infor', 'mb-[20px]', 'flex', 'items-center')}>
                                        <p className={cx('font-normal', 'text-[14px]')}>Hình thức thanh toán:</p>
                                        <span className={cx('font-medium', 'text-[14px]', 'ml-[6px]')}>
                                            {invoice.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'Thanh toán trực tuyến'}
                                        </span>
                                    </div>
                                    <div className={cx('bill-infor', 'mb-[20px]', 'flex', 'items-center')}>
                                        <p className={cx('font-normal', 'text-[14px]')}>Sản phẩm mua:</p>
                                        <span className={cx('font-medium', 'text-[14px]', 'ml-[6px]')}>
                                            {invoice.purchasedItems}
                                        </span>
                                    </div>
                                    <div className={cx('bill-infor', 'mb-[20px]', 'flex', 'items-center', 'ml-auto')}>
                                        <p className={cx('font-normal', 'text-[16px]', 'text-red-500')}>Tổng giá:</p>
                                        <span className={cx('font-medium', 'text-[16px]', 'ml-[6px]', 'text-red-500')}>
                                            {Number(invoice.totalPrice).toLocaleString('vi-VN')} (VNĐ)
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === "order" && (
                        <div className={cx('order')}>
                            {loading && <div className={cx('text-[#888]', 'p-[20px]')}>Đang tải...</div>}
                            {error && <div className={cx('text-[#888]', 'p-[20px]')}>{error}</div>}
                            {!loading && !error && pendingInvoices.length === 0 && (
                                <div className={cx('text-[#888]', 'p-[20px]')}>Không có đơn hàng chờ duyệt</div>
                            )}
                            {!loading && !error && pendingInvoices.map((invoice) => (
                                <div key={invoice.invoiceId} className={cx('bill-item')}>
                                    <div className={cx('flex', 'items-center', 'justify-between')}>
                                        <div className={cx('bill-infor', 'mb-[20px]', 'flex', 'items-center')}>
                                            <p className={cx('font-normal', 'text-[14px]')}>Tên khách hàng:</p>
                                            <span className={cx('font-medium', 'text-[14px]', 'ml-[6px]')}>
                                                {invoice.user?.fullname || 'Không xác định'}
                                            </span>
                                        </div>
                                        <span className={cx('font-semibold', 'text-[14px]', 'text-red-500')}>
                                            ĐANG XỬ LÝ
                                        </span>
                                    </div>
                                    <div className={cx('bill-infor', 'mb-[20px]', 'flex', 'items-center')}>
                                        <p className={cx('font-normal', 'text-[14px]')}>Địa chỉ:</p>
                                        <span className={cx('font-medium', 'text-[14px]', 'ml-[6px]')}>
                                            {invoice.address}
                                        </span>
                                    </div>
                                    <div className={cx('bill-infor', 'mb-[20px]', 'flex', 'items-center')}>
                                        <p className={cx('font-normal', 'text-[14px]')}>SĐT:</p>
                                        <span className={cx('font-medium', 'text-[14px]', 'ml-[6px]')}>
                                            {invoice.user?.phoneNumber || 'Không xác định'}
                                        </span>
                                    </div>
                                    <div className={cx('bill-infor', 'mb-[20px]', 'flex', 'items-center')}>
                                        <p className={cx('font-normal', 'text-[14px]')}>Ngày đặt:</p>
                                        <span className={cx('font-medium', 'text-[14px]', 'ml-[6px]')}>
                                            {new Date(invoice.createdAt).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>
                                    <div className={cx('bill-infor', 'mb-[20px]', 'flex', 'items-center')}>
                                        <p className={cx('font-normal', 'text-[14px]')}>Mã hóa đơn:</p>
                                        <span className={cx('font-medium', 'text-[14px]', 'ml-[6px]')}>
                                            {invoice.invoiceId}
                                        </span>
                                    </div>
                                    <div className={cx('bill-infor', 'mb-[20px]', 'flex', 'items-center')}>
                                        <p className={cx('font-normal', 'text-[14px]')}>Hình thức thanh toán:</p>
                                        <span className={cx('font-medium', 'text-[14px]', 'ml-[6px]')}>
                                            {invoice.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'Thanh toán trực tuyến'}
                                        </span>
                                    </div>
                                    <div className={cx('bill-infor', 'mb-[20px]', 'flex', 'items-center')}>
                                        <p className={cx('font-normal', 'text-[14px]')}>Sản phẩm mua:</p>
                                        <span className={cx('font-medium', 'text-[14px]', 'ml-[6px]')}>
                                            {invoice.purchasedItems}
                                        </span>
                                    </div>
                                    <div className={cx('bill-infor', 'mb-[20px]', 'flex', 'items-center', 'ml-auto')}>
                                        <p className={cx('font-normal', 'text-[16px]', 'text-red-500')}>Tổng giá:</p>
                                        <span className={cx('font-medium', 'text-[16px]', 'ml-[6px]', 'text-red-500')}>
                                            {Number(invoice.totalPrice).toLocaleString('vi-VN')} (VNĐ)
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
     );
}

export default Profile;