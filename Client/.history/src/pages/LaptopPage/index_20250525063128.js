import classNames from "classnames/bind";
import styles from './LaptopPage.module.css';
import Item from "@/components/Item";
import { useState, useEffect, useMemo } from "react";
import electronicService from "@/services/electronicService";
import brandService from "@/services/brandService"; // Import brandService

const cx = classNames.bind(styles);

function LaptopPage() {
  const [allLaptops, setAllLaptops] = useState([]);
  const [brands, setBrands] = useState([]); // State cho danh sách thương hiệu
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedBrand, setSelectedBrand] = useState(""); // "dell", "hp",...
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sortBy, setSortBy] = useState(""); // "newest", "priceAsc", "priceDesc"

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy danh sách sản phẩm
        const productResult = await electronicService.getAllElectronics();
        // Lấy danh sách thương hiệu
        const brandResult = await brandService.getAllBrands();

        if (productResult.success && brandResult.success) {
          // Lọc các sản phẩm thuộc danh mục laptop (cat_id = 2)
          const filteredLaptops = productResult.data.filter(
            (product) => product.category.cat_id === 2
          );
          setAllLaptops(filteredLaptops);

          // Lọc các thương hiệu có sản phẩm laptop
          const laptopBrandIds = new Set(
            filteredLaptops.map((product) => product.brand.brand_id.toLowerCase())
          );
          const filteredBrands = brandResult.data.filter((brand) =>
            laptopBrandIds.has(brand.brand_id.toLowerCase())
          );
          setBrands(filteredBrands);
        } else {
          setError(
            productResult.message || brandResult.message || "Không thể tải dữ liệu"
          );
        }
      } catch (err) {
        setError("Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Lọc và sắp xếp danh sách laptop theo tiêu chí
  const laptops = useMemo(() => {
    let result = [...allLaptops];

    if (selectedBrand) {
      result = result.filter(
        (product) => product.brand.brand_id.toLowerCase() === selectedBrand
      );
    }

    if (onlyInStock) {
      result = result.filter((product) => product.status === "instock");
    }

    if (sortBy === "newest") {
      result.sort((a, b) => b.manufacture_year - a.manufacture_year);
    } else if (sortBy === "priceAsc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "priceDesc") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [allLaptops, selectedBrand, onlyInStock, sortBy]);

  if (loading) return <div className={cx("wrapper")}>Đang tải...</div>;
  if (error) return <div className={cx("wrapper")}>{error}</div>;

  return (
    <div className={cx('wrapper', 'w-full', 'flex', 'flex-col')}>
      <h1 className={cx('font-bold', 'text-[20px]', 'my-[20px]', 'text-[#263646]')}>
        Chọn theo tiêu chí
      </h1>

      <div className={cx('tabs')}>
        <div className={cx('tab-item')}>
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
          >
            <option value="">Tất cả hãng</option>
            {brands.map((brand) => (
              <option key={brand.brand_id} value={brand.brand_id}>
                {brand.brand_name}
              </option>
            ))}
          </select>
        </div>
        <div className={cx('tab-item')}>
          <label>
            <input
              type="checkbox"
              checked={onlyInStock}
              onChange={(e) => setOnlyInStock(e.target.checked)}
            />
            <span style={{ marginLeft: '6px' }}>Có sẵn</span>
          </label>
        </div>
        <div className={cx('tab-item')}>
          <button
            className={cx({ active: sortBy === "newest" })}
            onClick={() => setSortBy("newest")}
          >
            Mới nhất
          </button>
        </div>
        <div className={cx('tab-item')}>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="">Giá cả</option>
            <option value="priceAsc">Tăng dần</option>
            <option value="priceDesc">Giảm dần</option>
          </select>
        </div>
      </div>

      <div className={cx('w-full', 'flex', 'flex-wrap', 'gap-[10px]')}>
        {laptops.length > 0 ? (
          laptops.map((product) => (
            <Item key={product.id} product={product} />
          ))
        ) : (
          <div className={cx('text-[#888]', 'mt-[20px]')}>
            Không có sản phẩm phù hợp
          </div>
        )}
      </div>
    </div>
  );
}

export default LaptopPage;