import classNames from "classnames/bind";
import styles from "./Cart.module.scss";
import { IoIosArrowBack } from "react-icons/io";
import { GoPlus, GoDash } from "react-icons/go";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaTrash } from "react-icons/fa";

import cartService from "@/services/cartService";
import invoiceService from "@/services/invoiceService";
import { useUser } from "@/contexts/UserContext";

const cx = classNames.bind(styles);

function CartPage() {
  const { user, token } = useUser();
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [cartId, setCartId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const result = await cartService.getCart(token);
        console.log('Cart fetch result:', result);
        if (result.success) {
          const items = result.data.items || [];
          setCartId(result.data.cart_id);
          setCartItems(items);
          setSelectedItems(items.map(item => item.cart_item_id));
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError("Không thể tải giỏ hàng: " + err.message);
        console.error('Fetch cart error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [user, token]);

  const handleSelectItem = (cartItemId) => {
    setSelectedItems(prev =>
      prev.includes(cartItemId)
        ? prev.filter(id => id !== cartItemId)
        : [...prev, cartItemId]
    );
  };

  const handleDeleteItems = async () => {
    if (selectedItems.length === 0) {
      alert("Vui lòng chọn ít nhất một sản phẩm để xóa!");
      return;
    }

    const electronicIds = cartItems
      .filter(item => selectedItems.includes(item.cart_item_id))
      .map(item => item.electronic.electronic_id);

    try {
      const result = await cartService.deleteCartItems({
        cartId,
        electronicIds,
      });

      if (result.success) {
        setCartItems(prev => prev.filter(item => !selectedItems.includes(item.cart_item_id)));
        setSelectedItems([]);
        alert("Đã xóa các sản phẩm khỏi giỏ hàng!");
      } else {
        alert("Lỗi: " + result.message);
      }
    } catch (err) {
      alert("Không thể xóa sản phẩm: " + err.message);
    }
  };

  // Tính tổng giá và danh sách sản phẩm được chọn
  const { totalPrice, purchasedItems } = cartItems.reduce(
    (acc, item) => {
      if (selectedItems.includes(item.cart_item_id)) {
        const itemPrice = Number(item.electronic.price) * item.quantity;
        acc.totalPrice += itemPrice;
        acc.purchasedItems.push(`${item.electronic.name} SL${item.quantity}`);
      }
      return acc;
    },
    { totalPrice: 0, purchasedItems: [] }
  );

  const formattedPrice = totalPrice.toLocaleString("vi-VN") + " đ";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      alert("Vui lòng chọn ít nhất một sản phẩm để đặt hàng!");
      return;
    }

    const formData = new FormData(e.target);
    const invoicePayload = {
      address: `${formData.get("address")}, ${formData.get("ward")}, ${formData.get("province")}`,
      paymentMethod: formData.get("paymentMethod"),
      purchasedItems: purchasedItems.join(", "),
      totalPrice,
      status: "processing",
    };

    try {
      const result = await invoiceService.createInvoice(invoicePayload);
      if (result.success) {
        alert("Đặt hàng thành công!");
        setCartItems(prev => prev.filter(item => !selectedItems.includes(item.cart_item_id)));
      } else {
        alert("Lỗi: " + result.message);
      }
    } catch (err) {
      alert("Không thể tạo đơn hàng: " + err.message);
    }
  };

  if (loading) return <div className={cx("wrapper")}>Đang tải...</div>;
  if (error) return <div className={cx("wrapper")}>{error}</div>;

  return (
    <div className={cx("wrapper")}>
      <div className={cx("content")}>
        <Link to="/" className={cx("flex", "items-center", "mb-[20px]")}>
          <IoIosArrowBack className={cx("text-[25px]", "mr-[10px]", "cursor-pointer")} />
          <span className={cx("text-[18px]")}>Quay Lại</span>
        </Link>
        <div className={cx("body", "flex", "items-start", "justify-between")}>
          <div className={cx("product", "w-[40%]")}>
            <div className={cx("product-list", "max-h-[500px]", "overflow-y-auto")}>
              {cartItems.length > 0 ? (
                cartItems.map((item) => {
                  const imageSrc = item.electronic.image
                    ? `${process.env.REACT_APP_API_URL}${item.electronic.image}`
                    : "/images/item.png";
                  return (
                    <div key={item.cart_item_id} className={cx("product-item")}>
                      <div className={cx("choose")}>
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.cart_item_id)}
                          onChange={() => handleSelectItem(item.cart_item_id)}
                        />
                      </div>
                      <div className={cx("product-img")}>
                        <img alt={item.electronic.name} src={imageSrc} />
                      </div>
                      <div className={cx("product-name")}>
                        <h1 className={cx("font-bold", "text-[18px]")}>
                          {item.electronic.name}
                        </h1>
                        <div className={cx("flex", "items-center", "mt-[10px]")}>
                          <span className={cx("font-medium", "text-[16px]", "mr-[10px]")}>
                            Số lượng:
                          </span>
                          <div className={cx("flex", "items-center", "number", "justify-center")}>
                            <GoDash
                              className={cx("cursor-pointer")}
                              onClick={() => {
                                setCartItems((prev) =>
                                  prev.map((i) =>
                                    i.cart_item_id === item.cart_item_id
                                      ? { ...i, quantity: Math.max(1, i.quantity - 1) }
                                      : i
                                  )
                                );
                              }}
                            />
                            <span className={cx("mx-[20px]", "font-semibold")}>
                              {item.quantity}
                            </span>
                            <GoPlus
                              className={cx("cursor-pointer")}
                              onClick={() => {
                                setCartItems((prev) =>
                                  prev.map((i) =>
                                    i.cart_item_id === item.cart_item_id
                                      ? {
                                          ...i,
                                          quantity: item.electronic.quantity
                                            ? Math.min(item.electronic.quantity, i.quantity + 1)
                                            : i.quantity + 1,
                                        }
                                      : i
                                  )
                                );
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className={cx("text-[#888]", "p-[20px]")}>Giỏ hàng trống</div>
              )}
            </div>
            <div className={cx('flex','items-center')}>
              <div className={cx("price")}>
                <span className={cx("font-medium", "text-[16px]")}>Tổng giá trị:</span>
                <span className={cx("ml-[10px]", "font-bold", "text-red-500")}>
                  {formattedPrice}
                </span>
              </div>
              <div className={cx('btn-delete')} onClick={handleDeleteItems}>
                <FaTrash />
              </div>
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

export default CartPage;