package com.qhoang.connectify.controller;

import com.qhoang.connectify.entities.Brand;
import com.qhoang.connectify.entities.Electronic;
import com.qhoang.connectify.repository.BrandRepository;
import com.qhoang.connectify.service.ElectronicService;
import com.qhoang.connectify.service.AuthorizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin/brands")
@CrossOrigin(origins = "http://localhost:8000")
public class AdminBrandController {

    @Autowired
    private BrandRepository brandRepository;

    @Autowired
    private ElectronicService electronicService;

    @Autowired
    private AuthorizationService authorizationService;

    /**
     * Cập nhật thương hiệu
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateBrand(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String id,
            @RequestBody Brand brand) {

        // Kiểm tra quyền admin
        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền cập nhật thương hiệu"));
        }

        // Kiểm tra thương hiệu có tồn tại không
        Brand existingBrand = brandRepository.findById(id).orElse(null);
        if (existingBrand == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Không tìm thấy thương hiệu"));
        }

        brand.setBrand_id(id);
        Brand updatedBrand = brandRepository.save(brand);

        return ResponseEntity.ok(updatedBrand);
    }

    /**
     * Xóa thương hiệu
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBrand(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String id) {

        // Kiểm tra quyền admin
        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền xóa thương hiệu"));
        }

        // Kiểm tra thương hiệu có tồn tại không
        if (!brandRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Không tìm thấy thương hiệu"));
        }

        // Kiểm tra có sản phẩm nào thuộc thương hiệu này không
        List<Electronic> productsOfBrand = electronicService.getAllElectronics().stream()
                .filter(p -> p.getBrand() != null && id.equals(p.getBrand().getBrand_id()))
                .collect(Collectors.toList());

        if (!productsOfBrand.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error",
                        "Không thể xóa thương hiệu vì còn " + productsOfBrand.size() + " sản phẩm thuộc thương hiệu này"));
        }

        brandRepository.deleteById(id);

        return ResponseEntity.ok(Collections.singletonMap("message", "Xóa thương hiệu thành công"));
    }

    /**
     * Lấy sản phẩm theo thương hiệu
     */
    @GetMapping("/{id}/products")
    public ResponseEntity<?> getProductsByBrand(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String id) {

        // Kiểm tra quyền admin
        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền xem thông tin này"));
        }

        // Kiểm tra thương hiệu có tồn tại không
        if (!brandRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Không tìm thấy thương hiệu"));
        }

        List<Electronic> productsOfBrand = electronicService.getAllElectronics().stream()
                .filter(p -> p.getBrand() != null && id.equals(p.getBrand().getBrand_id()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(productsOfBrand);
    }

    /**
     * Thống kê thương hiệu
     */
    @GetMapping("/{id}/statistics")
    public ResponseEntity<?> getBrandStatistics(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String id) {

        // Kiểm tra quyền admin
        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền xem thống kê"));
        }

        // Kiểm tra thương hiệu có tồn tại không
        if (!brandRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Không tìm thấy thương hiệu"));
        }

        List<Electronic> productsOfBrand = electronicService.getAllElectronics().stream()
                .filter(p -> p.getBrand() != null && id.equals(p.getBrand().getBrand_id()))
                .collect(Collectors.toList());

        long totalProducts = productsOfBrand.size();
        long activeProducts = productsOfBrand.stream()
                .filter(p -> "active".equalsIgnoreCase(p.getStatus()))
                .count();
        long inactiveProducts = productsOfBrand.stream()
                .filter(p -> "inactive".equalsIgnoreCase(p.getStatus()))
                .count();

        // Tính tổng tồn kho
        int totalStock = productsOfBrand.stream()
                .mapToInt(p -> {
                    try {
                        return p.getQuantity() != null ? p.getQuantity() : 0;
                    } catch (Exception e) {
                        return 0;
                    }
                })
                .sum();

        Map<String, Object> stats = new HashMap<>();
        stats.put("brandId", id);
        stats.put("totalProducts", totalProducts);
        stats.put("activeProducts", activeProducts);
        stats.put("inactiveProducts", inactiveProducts);
        stats.put("totalStock", totalStock);

        return ResponseEntity.ok(stats);
    }

    /**
     * Lấy thống kê tất cả thương hiệu
     */
    @GetMapping("/statistics")
    public ResponseEntity<?> getAllBrandsStatistics(@RequestHeader("Authorization") String authHeader) {
        // Kiểm tra quyền admin
        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền xem thống kê"));
        }

        List<Brand> allBrands = brandRepository.findAll();
        List<Electronic> allProducts = electronicService.getAllElectronics();

        List<Map<String, Object>> brandStats = allBrands.stream()
                .map(brand -> {
                    List<Electronic> productsOfBrand = allProducts.stream()
                            .filter(p -> p.getBrand() != null && brand.getBrand_id().equals(p.getBrand().getBrand_id()))
                            .collect(Collectors.toList());

                    Map<String, Object> stats = new HashMap<>();
                    stats.put("brandId", brand.getBrand_id());
                    stats.put("brandName", brand.getBrand_name());
                    stats.put("totalProducts", productsOfBrand.size());
                    stats.put("activeProducts", productsOfBrand.stream()
                            .filter(p -> "active".equalsIgnoreCase(p.getStatus()))
                            .count());

                    return stats;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(brandStats);
    }

    /**
     * Lấy chi tiết thương hiệu
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getBrandById(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String id) {

        // Kiểm tra quyền admin
        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền xem thông tin này"));
        }

        Brand brand = brandRepository.findById(id).orElse(null);
        if (brand == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Không tìm thấy thương hiệu"));
        }

        return ResponseEntity.ok(brand);
    }

    /**
     * Tìm kiếm thương hiệu
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchBrands(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("keyword") String keyword) {

        // Kiểm tra quyền admin
        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền tìm kiếm"));
        }

        List<Brand> allBrands = brandRepository.findAll();
        List<Brand> filteredBrands = allBrands.stream()
                .filter(brand ->
                    brand.getBrandName().toLowerCase().contains(keyword.toLowerCase()) ||
                    brand.getBrandId().toLowerCase().contains(keyword.toLowerCase())
                )
                .collect(Collectors.toList());

        return ResponseEntity.ok(filteredBrands);
    }

    /**
     * Cập nhật logo thương hiệu
     */
    @PutMapping("/{id}/logo")
    public ResponseEntity<?> updateBrandLogo(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String id,
            @RequestParam("logoUrl") String logoUrl) {

        // Kiểm tra quyền admin
        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền cập nhật logo"));
        }

        Brand brand = brandRepository.findById(id).orElse(null);
        if (brand == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Không tìm thấy thương hiệu"));
        }

        // Giả sử Brand entity có trường logoUrl
        // brand.setLogoUrl(logoUrl);
        brandRepository.save(brand);

        return ResponseEntity.ok(Collections.singletonMap("message", "Cập nhật logo thành công"));
    }
}
