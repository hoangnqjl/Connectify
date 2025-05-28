package com.qhoang.connectify.service;

import com.qhoang.connectify.entities.Brand;
import com.qhoang.connectify.repository.BrandRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BrandService {

    @Autowired
    private BrandRepository brandRepository;

    // Lấy tất cả các brand
    public List<Brand> getAllBrands() {
        return brandRepository.findAll();
    }

    // Thêm brand mới
    public void addBrand(Brand brand) {
        brandRepository.save(brand);
    }

    // Lấy brand theo ID
    public Optional<Brand> getBrandById(String id) {
        return brandRepository.findById(id);
    }

    // Cập nhật brand
    public Brand updateBrand(Brand brand) {
        return brandRepository.save(brand);
    }

    // Xóa brand
    public void deleteBrand(String id) {
        brandRepository.deleteById(id);
    }

    // Kiểm tra brand có tồn tại không
    public boolean existsById(String id) {
        return brandRepository.existsById(id);
    }
}
