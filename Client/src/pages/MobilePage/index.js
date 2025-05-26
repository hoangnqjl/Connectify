import classNames from "classnames/bind";
import styles from './MobilePage.module.scss';
import Item from "@/components/Item";
import { useState, useEffect, useMemo } from "react";
import electronicService from "@/services/electronicService";
import brandService from "@/services/brandService";

const cx = classNames.bind(styles);

function MobilePage() {
  const [allMobiles, setAllMobiles] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedBrand, setSelectedBrand] = useState("");
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sortBy, setSortBy] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy danh sách sản phẩm
        const productResult = await electronicService.getAllElectronics();
        // Lấy danh sách thương hiệu
        const brandResult = await brandService.getAllBrands();

        console.log("Brand Result:", brandResult); // Log toàn bộ phản hồi từ /brands
        console.log("Product Result:", productResult); // Log toàn bộ phản hồi từ /electronics

        if (productResult.success && brandResult.success) {
          // Lọc các sản phẩm thuộc danh mục điện thoại (cat_id = 1)
          const filteredMobiles = productResult.data.filter(
            (product) => product.category.cat_id === 1
          );

          // Lấy danh sách brand_id từ filteredMobiles
          const mobileBrandIds = new Set(
            filteredMobiles.map((product) => {
              const brandId = product.brand.brand_id.toLowerCase();
              return brandId;
            })
          );

          // Lọc thương hiệu có sản phẩm điện thoại
          const filteredBrands = brandResult.data.filter((brand) => {
            const isIncluded = mobileBrandIds.has(brand.brand_id.toLowerCase());
            return isIncluded;
          });
          console.log("Filtered Brands:", filteredBrands); // Log danh sách thương hiệu sau lọc

          setAllMobiles(filteredMobiles);
          setBrands(filteredBrands);
        } else {
          setError(
            productResult.message || brandResult.message || "Không thể tải dữ liệu"
          );
        }
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Lọc và sắp xếp danh sách điện thoại theo tiêu chí
  const mobiles = useMemo(() => {
    let result = [...allMobiles];

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
  }, [allMobiles, selectedBrand, onlyInStock, sortBy]);

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
        {mobiles.length > 0 ? (
          mobiles.map((product) => (
            <Item key={product.id} product={product} className='min-w-[280px] flex-auto max-w-[380px] flex-grow ]' />
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

export default MobilePage;