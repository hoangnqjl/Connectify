package com.qhoang.connectify.service;

import com.qhoang.connectify.entities.Brand;
import com.qhoang.connectify.repository.BrandRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

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
}
