import classNames from "classnames/bind";
import styles from "./HomePage.module.scss";
import Item from "@/components/Item";
import Scroll from "@/components/Scroll";
import { useRef, useState, useEffect } from "react";
import electronicService from "@/services/electronicService";

const cx = classNames.bind(styles);

function HomePage() {
  const scrollRefMobile = useRef(null);
  const scrollRefLaptop = useRef(null);
  const [phones, setPhones] = useState([]);
  const [laptops, setLaptops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Gọi API khi component mount
useEffect(() => {
  const fetchElectronics = async () => {
    try {
      const result = await electronicService.getAllElectronics();
      if (result.success) {
        // Lọc theo cat_id
        const filteredPhones = result.data.filter(
          (product) => product.category.cat_id === 1
        );
        const filteredLaptops = result.data.filter(
          (product) => product.category.cat_id === 2
        );
        setPhones(filteredPhones);
        setLaptops(filteredLaptops);
        setLoading(false);
      } else {
        setError(result.message);
        setLoading(false);
      }
    } catch (err) {
      setError("Không thể tải dữ liệu sản phẩm");
      setLoading(false);
    }
  };

  fetchElectronics();
}, []);


  if (loading) return <div className={cx("wrapper")}>Đang tải...</div>;
  if (error) return <div className={cx("wrapper")}>{error}</div>;

  return (
    <div className={cx("wrapper", "w-full", "flex", "flex-col")}>
      <div className={cx("content", "w-full")}>
        <div className={cx("mobile")}>
          <h1>Điện thoại nổi bật nhất</h1>
          <div className={cx("w-full", "relative")}>
            <div className={cx("products")} ref={scrollRefMobile}>
              {phones.map((product, index) => (
                <Item key={product.id} product={product} />
              ))}
            </div>
            <Scroll scrollRef={scrollRefMobile} />
          </div>
        </div>
        <div className={cx("laptop")}>
          <h1>Laptop nổi bật nhất</h1>
          <div className={cx("w-full", "relative")}>
            <div className={cx("products")} ref={scrollRefLaptop}>
              {laptops.map((product, index) => (
                <Item key={product.id} product={product} />
              ))}
            </div>
            <Scroll scrollRef={scrollRefLaptop} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;