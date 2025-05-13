package com.qhoang.connectify.repository;

import com.qhoang.connectify.entities.Brand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BrandRepository extends JpaRepository<Brand, Long> {
    // Bạn có thể thêm các truy vấn tùy chỉnh nếu cần
}
