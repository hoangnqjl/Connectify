import classNames from "classnames/bind";
import styles from "./Item.module.scss";
import { FaStar } from "react-icons/fa";
import { SlLike } from "react-icons/sl";
import { Link } from "react-router-dom";
import { formatPrice, formatImageUrl } from "@/utils/formatPrice";

const cx = classNames.bind(styles);

function Item({ product ,className }) {
  const rating = product.rating || 5.0;
  const imageSrc = formatImageUrl(product.image);
  const formattedPrice = formatPrice(product.price);

  return (
    <Link to={`/product/${product.id}`} className={cx("wrapper",className)}>
      <div className={cx("content")}>
        <div className={cx("rate", "flex", "items-center")}>
          <FaStar className={cx("text-[14px]", "text-white", "mr-[5px]")} />
          <span className={cx("text-[12px]", "text-white", "leading-[1]")}>
            {rating}
          </span>
        </div>
        <div className={cx("image-product flex justify-center mb-[10px]")}>
          <img
            alt={product.name}
            src={imageSrc}
            onError={(e) => {
              e.target.src = "/images/item.jpg";
            }}
          />
        </div>
        <div className={cx("info-product")}>
          <h2 className={cx("text-[16px]", "font-bold")}>{product.name}</h2>
          <span className={cx("text-[14px]", "text-red-600", "font-bold")}>
            {formattedPrice}
          </span>
          <div className={cx("btn-like")}>
            <span className={cx("text-[14px]", "font-medium", "mr-[6px]")}>
              Yêu thích
            </span>
            <SlLike />
          </div>
        </div>
      </div>
    </Link>
  );
}

export default Item;