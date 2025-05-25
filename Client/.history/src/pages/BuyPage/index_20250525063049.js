import classNames from "classnames/bind";
import styles from "./BuyPage.module.css";
import { IoIosArrowBack } from "react-icons/io";
import { GoPlus, GoDash } from "react-icons/go";
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import electronicService from "@/services/electronicService";
import { useUser } from "@/contexts/UserContext";
import invoiceService from "@/services/invoiceService";
import { formatPrice, formatImageUrl, parsePrice } from "@/utils/formatPrice";

const cx = classNames.bind(styles);

function BuyPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useUser();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError(
          <div>
            Không tìm thấy sản phẩm. Vui lòng chọn sản phẩm từ{" "}
            <Link to="/">trang chủ</Link>.
          </div>
        );
        setLoading(false);
        return;
      }

      try {
        const productResult = await electronicService.getElectronicById(id);
        if (productResult.success) {
          setProduct(productResult.data);
        } else {
          setError(productResult.message);
        }
      } catch (err) {
        console.error("BuyPage Fetch Error:", err);
        setError("Không thể tải thông tin sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Block admin from accessing buy page
  if (user?.type === 'admin') {
    return (
      <div className={cx("wrapper")}>
        <div className={cx("content")} style={{ textAlign: 'center', padding: '50px' }}>
          <h2 style={{ color: '#dc3545', marginBottom: '20px' }}>
            Truy cập bị từ chối
          </h2>
          <p style={{ color: '#6c757d', marginBottom: '30px' }}>
            Tài khoản Admin không thể sử dụng chức năng mua hàng.
          </p>
          <Link to="/" className={cx("btn-submit")} style={{ display: 'inline-block', textDecoration: 'none' }}>
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  if (loading) return <div className={cx("wrapper")}>Đang tải...</div>;
  if (error) return <div className={cx("wrapper")}>{error}</div>;
  if (!product) return <div className={cx("wrapper")}>Sản phẩm không tồn tại</div>;

  const totalPrice = parsePrice(product.price) * quantity;
  const formattedPrice = formatPrice(totalPrice);
  const imageSrc = formatImageUrl(product.image);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const purchasedItem = `${product.name} SL${quantity}`;

    const invoicePayload = {
      address: `${formData.get("address")}, ${formData.get("ward")}, ${formData.get("province")}`,
      paymentMethod: formData.get("paymentMethod"),
      purchasedItems: purchasedItem,
      totalPrice,
      status: "processing",
    };

    const result = await invoiceService.createInvoice(invoicePayload);

    if (result.success) {
      alert("Đặt hàng thành công!");
    } else {
      alert("Lỗi: " + result.message);
    }
  };

  return (
    <div className={cx("wrapper")}>
      <div className={cx("content")}>
        <Link to={`/product/${id}`} className={cx("flex", "items-center", "mb-[20px]")}>
          <IoIosArrowBack className={cx("text-[25px]", "mr-[10px]", "cursor-pointer")} />
          <span className={cx("text-[18px]")}>Quay Lại</span>
        </Link>
        <div className={cx("body", "flex", "items-start", "justify-between")}>
          <div className={cx("product", "w-[40%]")}>
            <div className={cx("product-item")}>
              <div className={cx("product-img")}>
                <img
                  alt={product.name}
                  src={imageSrc}
                  onError={(e) => {
                    e.target.src = "/images/item.jpg"; // Fallback image
                  }}
                />
              </div>
              <div className={cx("product-name")}>
                <h1 className={cx("font-bold", "text-[18px]")}>{product.name}</h1>
                <div className={cx("flex", "items-center", "mt-[10px]")}>
                  <span className={cx("font-medium", "text-[16px]", "mr-[10px]")}>
                    Số lượng:
                  </span>
                  <div className={cx("flex", "items-center", "number", "justify-center")}>
                    <GoDash
                      className={cx("cursor-pointer")}
                      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    />
                    <span className={cx("mx-[20px]", "font-semibold")}>{quantity}</span>
                    <GoPlus
                      className={cx("cursor-pointer")}
                      onClick={() =>
                        setQuantity((prev) =>
                          product.quantity ? Math.min(product.quantity, prev + 1) : prev + 1
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className={cx("price")}>
              <span className={cx("font-medium", "text-[16px]")}>Tổng giá trị:</span>
              <span className={cx("ml-[10px]", "font-bold", "text-red-500")}>
                {formattedPrice}
              </span>
            </div>
          </div>
          <div className={cx("info-place")}>
            <h1 className={cx("font-semibold", "text-[20px]", "mb-[16px]", "title")}>
              Thông tin địa chỉ giao hàng
            </h1>
            <span className={cx("font-medium", "text-[12px]", "subtitle")}>
              Bạn cần nhập đầy đủ các thông tin dưới đây!
            </span>
            <form className={cx("form")} onSubmit={handleSubmit}>
              <div className={cx("form-group")}>
                <input name="fullName" placeholder={user?.fullname || "fullname..."} />
              </div>
              <div className={cx("form-group")}>
                <input
                  name="phone"
                  placeholder={user?.phoneNumber || "phonenumber..."}
                  type="tel"
                  pattern="[0-9]{10,11}"
                />
              </div>
              <div className={cx("form-group")}>
                <input name="email" placeholder={user?.email || "email..."} type="email" />
              </div>
              <h1 className={cx("text-[#263646]", "mr-auto", "font-bold", "mb-[10px]")}>
                Nơi nhận hàng
              </h1>
              <div className={cx("w-full", "flex", "items-center", "justify-between")}>
                <div className={cx("w-[49%]")}>
                  <select
                    name="province"
                    className={cx("form-group", "text-[#a1a1a1]")}
                    required
                  >
                    <option value="" disabled selected>
                      Tỉnh/Thành phố...
                    </option>
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                  </select>
                </div>
                <div className={cx("w-[49%]")}>
                  <div className={cx("form-group")}>
                    <input name="ward" placeholder="Xã/Phường..." required />
                  </div>
                </div>
              </div>
              <div className={cx("form-group")}>
                <input name="address" placeholder="Địa chỉ nhận hàng..." required />
              </div>
              <div className={cx("form-group")}>
                <textarea name="note" placeholder="Ghi chú (nếu có)..." />
              </div>
              <div className={cx("w-full")}>
                <h1 className={cx("text-[#263646]", "mr-auto", "font-bold", "mb-[10px]")}>
                  Phương thức thanh toán
                </h1>
                <div className={cx("w-full", "flex", "justify-between", "items-center")}>
                  <div className={cx("pay-item")}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      defaultChecked
                      required
                    />
                    <span className={cx("text-[#263646]", "ml-[16px]")}>
                      Ngay sau khi nhận hàng
                    </span>
                  </div>
                  <div className={cx("pay-item")}>
                    <input type="radio" name="paymentMethod" value="online" required />
                    <span className={cx("text-[#263646]", "ml-[16px]")}>
                      Thanh toán trực tuyến
                    </span>
                  </div>
                </div>
              </div>
              <button type="submit" className={cx("btn-submit")}>
                Xác nhận mua hàng
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BuyPage;
