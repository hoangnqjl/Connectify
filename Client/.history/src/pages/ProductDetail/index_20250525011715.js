import classNames from "classnames/bind";
import styles from "./ProductDetail.module.scss";
import { LuShoppingCart } from "react-icons/lu";
import { useRef, useState, useEffect } from "react";
import Item from "@/components/Item";
import Scroll from "@/components/Scroll";
import { Link, useNavigate, useParams } from "react-router-dom";
import electronicService from "@/services/electronicService";
import cartService from "@/services/cartService";
import { useUser } from "@/contexts/UserContext";
import { formatPrice, formatImageUrl } from "@/utils/formatPrice";

const cx = classNames.bind(styles);

// Object cache để lưu trữ dữ liệu sản phẩm và sản phẩm liên quan
const cache = {
  products: {},
  relatedProducts: {},
};

function ProductDetail() {
  const { id } = useParams();
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useUser();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (cache.products[id]) {
        setProduct(cache.products[id]);
        setRelatedProducts(cache.relatedProducts[id] || []);
        setLoading(false);
        return;
      }

      try {
        const productResult = await electronicService.getElectronicById(id);
        if (productResult.success) {
          setProduct(productResult.data);
          cache.products[id] = productResult.data;
        } else {
          setError(productResult.message);
        }

        const allProductsResult = await electronicService.getAllElectronics();
        if (allProductsResult.success) {
          const related = allProductsResult.data
            .filter(
              (p) =>
                p.brand.brand_id === productResult.data.brand.brand_id &&
                p.id !== id &&
                p.status === "instock"
            )
            .slice(0, 9);
          setRelatedProducts(related);
          cache.relatedProducts[id] = related;
        } else {
          setError(allProductsResult.message);
        }

        setLoading(false);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("Không thể tải chi tiết sản phẩm");
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  const handleAddToCart = async () => {
    // Block admin from adding to cart
    if (user?.type === 'admin') {
      alert("Tài khoản Admin không thể sử dụng chức năng mua hàng!");
      return;
    }

    if (!product || product.status !== "instock") {
      alert("Sản phẩm không có sẵn để thêm vào giỏ hàng!");
      return;
    }

    try {
      const result = await cartService.addToCart({
        electronicId: product.id,
        quantity: 1,
      });
      if (result.success) {
        alert("Thêm thành công!");
        navigate('/cart');
      } else {
        alert("Lỗi: " + result.message);
      }
    } catch (err) {
      console.error("Add to cart error:", err);
      alert("Không thể thêm sản phẩm vào giỏ hàng: " + err.message);
    }
  };

  if (loading) return <div className={cx("wrapper")}>Đang tải...</div>;
  if (error) return <div className={cx("wrapper")}>{error}</div>;
  if (!product) return <div className={cx("wrapper")}>Sản phẩm không tồn tại</div>;

  const formattedPrice = formatPrice(product.price);
  const imageSrc = formatImageUrl(product.image);

  // Logic cho nút "Mua ngay"/"Hết hàng"
  const isInStock = product.status === "instock";
  const isAdmin = user?.type === 'admin';

  let buyButtonText, buyButtonLink, buyButtonClass;

  if (isAdmin) {
    buyButtonText = "Admin không thể mua";
    buyButtonLink = "#";
    buyButtonClass = cx("buy-btn", "disabled");
  } else if (isInStock) {
    buyButtonText = "Mua ngay";
    buyButtonLink = `/buy/${product.id}`;
    buyButtonClass = cx("buy-btn");
  } else {
    buyButtonText = "Hết hàng";
    buyButtonLink = "#";
    buyButtonClass = cx("buy-btn", "disabled");
  }

  return (
    <>
      <div className={cx("wrapper")}>
        <div className={cx("content")}>
          <div className={cx("info")}>
            <div className={cx("info-left")}>
              <h1>{product.name}</h1>
              <img
                alt={product.name}
                src={imageSrc}
                onError={(e) => {
                  e.target.src = "/images/item.jpg"; // Fallback image
                }}
              />
            </div>
            <div className={cx("info-right")}>
              <div className={cx("flex", "justify-between", "items-center")}>
                <div className={cx("price", "flex", "items-center", "justify-start")}>
                  <span className={cx("font-medium", "text-[16px]", "mr-[10px]")}>
                    Giá cả:
                  </span>
                  <span className={cx("font-semibold", "text-[18px]", "text-red-500")}>
                    {formattedPrice}
                  </span>
                </div>
                <div className={cx("buy", "flex", "items-center", "justify-center")}>
                  <button
                    onClick={handleAddToCart}
                    className={cx("cart", "mr-[10px]", { disabled: isAdmin })}
                    disabled={isAdmin}
                    title={isAdmin ? "Admin không thể thêm vào giỏ hàng" : "Thêm vào giỏ hàng"}
                  >
                    <LuShoppingCart className={cx("text-[20px]")} />
                  </button>
                  <Link
                    to={buyButtonLink}
                    className={buyButtonClass}
                    title={
                      isAdmin
                        ? "Admin không thể mua hàng"
                        : isInStock
                          ? ""
                          : "Sản phẩm hiện đã hết hàng"
                    }
                  >
                    {buyButtonText}
                    {!isAdmin && isInStock && product.quantity && (
                      <span className={cx("quantity-info")}>
                        (Còn {product.quantity})
                      </span>
                    )}
                  </Link>
                </div>
              </div>
              <div className={cx("infor-product")}>
                <h1 className={cx("text-[16px]", "font-semibold", "mb-[20px]")}>
                  Thông tin sản phẩm
                </h1>
                <div
                  className={cx(
                    "infor-product-item",
                    "w-full",
                    "flex",
                    "justify-between",
                    "items-center"
                  )}
                >
                  <span>Màn hình</span>
                  <p>{product.screen || "Không có thông tin"}</p>
                </div>
                <div
                  className={cx(
                    "infor-product-item",
                    "w-full",
                    "flex",
                    "justify-between",
                    "items-center"
                  )}
                >
                  <span>Vi xử lí</span>
                  <p>{product.cpu || "Không có thông tin"}</p>
                </div>
                <div
                  className={cx(
                    "infor-product-item",
                    "w-full",
                    "flex",
                    "justify-between",
                    "items-center"
                  )}
                >
                  <span>GPU</span>
                  <p>{product.gpu || "Không có thông tin"}</p>
                </div>
                <div
                  className={cx(
                    "infor-product-item",
                    "w-full",
                    "flex",
                    "justify-between",
                    "items-center"
                  )}
                >
                  <span>RAM</span>
                  <p>{product.ram || "Không có thông tin"}</p>
                </div>
                <div
                  className={cx(
                    "infor-product-item",
                    "w-full",
                    "flex",
                    "justify-between",
                    "items-center"
                  )}
                >
                  <span>Bộ nhớ trong</span>
                  <p>{product.storageCapacity || "Không có thông tin"}</p>
                </div>
                <div
                  className={cx(
                    "infor-product-item",
                    "w-full",
                    "flex",
                    "justify-between",
                    "items-center"
                  )}
                >
                  <span>Chất liệu</span>
                  <p>{product.material || "Không có thông tin"}</p>
                </div>
                <div
                  className={cx(
                    "infor-product-item",
                    "w-full",
                    "flex",
                    "justify-between",
                    "items-center"
                  )}
                >
                  <span>Hệ điều hành</span>
                  <p>{product.operatingSystem || "Không có thông tin"}</p>
                </div>
                <div
                  className={cx(
                    "infor-product-item",
                    "w-full",
                    "flex",
                    "justify-between",
                    "items-center"
                  )}
                >
                  <span>Dung lượng pin</span>
                  <p>{product.batteryLife || "Không có thông tin"}</p>
                </div>
                <div
                  className={cx(
                    "infor-product-item",
                    "w-full",
                    "flex",
                    "justify-between",
                    "items-center"
                  )}
                >
                  <span>Công suất sạc</span>
                  <p>{product.powerRating || "Không có thông tin"}</p>
                </div>
                <div
                  className={cx(
                    "infor-product-item",
                    "w-full",
                    "flex",
                    "justify-between",
                    "items-center"
                  )}
                >
                  <span>Năm sản xuất</span>
                  <p>{product.manufactureYear || "Không có thông tin"}</p>
                </div>
                <div
                  className={cx(
                    "infor-product-item",
                    "w-full",
                    "flex",
                    "justify-between",
                    "items-center"
                  )}
                >
                  <span>Trạng thái</span>
                  <p>{product.status === "instock" ? "Còn hàng" : "Hết hàng"}</p>
                </div>
                <div
                  className={cx(
                    "infor-product-item",
                    "w-full",
                    "flex",
                    "justify-between",
                    "items-center"
                  )}
                >
                  <span>Số lượng</span>
                  <p>{product.quantity || "Không có thông tin"}</p>
                </div>
              </div>
            </div>
          </div>
          <div className={cx("descript")}>
            <h1 className={cx("font-semibold", "text-[16px]", "mb-[10px]")}>
              Mô tả chi tiết
            </h1>
            <span className={cx("description")}>
              {product.description || "Không có mô tả"}
            </span>
          </div>
        </div>
      </div>
      <div className={cx("my-[20px]")}>
        <h1 className={cx("font-bold", "text-[18px]", "mb-[16px]", "mt-[30px]")}>
          Sản phẩm liên quan
        </h1>
        <div className={cx("product")}>
          <div className={cx("w-full", "relative")}>
            <div className={cx("products")} ref={scrollRef}>
              {relatedProducts.map((relatedProduct) => (
                <Item key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
            <Scroll scrollRef={scrollRef} />
          </div>
        </div>
      </div>
    </>
  );
}

export default ProductDetail;