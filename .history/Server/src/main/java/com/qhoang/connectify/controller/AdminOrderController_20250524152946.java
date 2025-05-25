package com.qhoang.connectify.controller;

import com.qhoang.connectify.entities.Invoice;
import com.qhoang.connectify.service.InvoiceService;
import com.qhoang.connectify.service.AuthorizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin/orders")
@CrossOrigin(origins = "http://localhost:8000")
public class AdminOrderController {

    @Autowired
    private InvoiceService invoiceService;

    @Autowired
    private AuthorizationService authorizationService;

    /**
     * Lấy tất cả đơn hàng với bộ lọc
     */
    @GetMapping
    public ResponseEntity<?> getAllOrders(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "fromDate", required = false) String fromDate,
            @RequestParam(value = "toDate", required = false) String toDate,
            @RequestParam(value = "userId", required = false) String userId) {

        // Kiểm tra quyền admin
        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền xem đơn hàng"));
        }

        List<Invoice> allInvoices = invoiceService.getAllInvoices();
        List<Invoice> filteredInvoices = allInvoices.stream()
                .filter(invoice -> {
                    boolean matches = true;

                    // Lọc theo trạng thái
                    if (status != null && !status.trim().isEmpty()) {
                        matches = matches && status.equalsIgnoreCase(invoice.getStatus());
                    }

                    // Lọc theo user
                    if (userId != null && !userId.trim().isEmpty()) {
                        matches = matches && (invoice.getUser() != null && userId.equals(invoice.getUser().getUserId()));
                    }

                    // Lọc theo ngày
                    if (fromDate != null && !fromDate.trim().isEmpty()) {
                        try {
                            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
                            Date from = sdf.parse(fromDate);
                            matches = matches && (invoice.getCreatedAt() == null ||
                                    !invoice.getCreatedAt().before(from));
                        } catch (ParseException e) {
                            // Ignore invalid date format
                        }
                    }

                    if (toDate != null && !toDate.trim().isEmpty()) {
                        try {
                            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
                            Date to = sdf.parse(toDate);
                            // Add 1 day to include the entire toDate
                            Calendar cal = Calendar.getInstance();
                            cal.setTime(to);
                            cal.add(Calendar.DAY_OF_MONTH, 1);
                            to = cal.getTime();

                            matches = matches && (invoice.getCreatedAt() == null ||
                                    invoice.getCreatedAt().before(to));
                        } catch (ParseException e) {
                            // Ignore invalid date format
                        }
                    }

                    return matches;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(filteredInvoices);
    }

    /**
     * Lấy chi tiết đơn hàng
     */
    @GetMapping("/{invoiceId}")
    public ResponseEntity<?> getOrderDetails(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String invoiceId) {

        // Kiểm tra quyền admin
        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền xem chi tiết đơn hàng"));
        }

        Invoice invoice = invoiceService.getInvoiceById(invoiceId);
        if (invoice == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Không tìm thấy đơn hàng"));
        }

        return ResponseEntity.ok(invoice);
    }

    /**
     * Thống kê đơn hàng
     */
    @GetMapping("/statistics")
    public ResponseEntity<?> getOrderStatistics(@RequestHeader("Authorization") String authHeader) {
        // Kiểm tra quyền admin
        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền xem thống kê"));
        }

        List<Invoice> allInvoices = invoiceService.getAllInvoices();

        long totalOrders = allInvoices.size();
        long pendingOrders = allInvoices.stream()
                .filter(i -> "pending".equalsIgnoreCase(i.getStatus()))
                .count();
        long processingOrders = allInvoices.stream()
                .filter(i -> "processing".equalsIgnoreCase(i.getStatus()))
                .count();
        long processedOrders = allInvoices.stream()
                .filter(i -> "processed".equalsIgnoreCase(i.getStatus()))
                .count();
        long cancelledOrders = allInvoices.stream()
                .filter(i -> "cancelled".equalsIgnoreCase(i.getStatus()))
                .count();

        // Tính tổng doanh thu
        BigDecimal totalRevenue = allInvoices.stream()
                .filter(i -> !"cancelled".equalsIgnoreCase(i.getStatus()))
                .map(i -> BigDecimal.valueOf(i.getTotalPrice() != null ? i.getTotalPrice() : 0))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalOrders", totalOrders);
        stats.put("pendingOrders", pendingOrders);
        stats.put("processingOrders", processingOrders);
        stats.put("processedOrders", processedOrders);
        stats.put("cancelledOrders", cancelledOrders);
        stats.put("totalRevenue", totalRevenue);

        return ResponseEntity.ok(stats);
    }

    /**
     * Báo cáo doanh thu theo khoảng thời gian
     */
    @GetMapping("/revenue")
    public ResponseEntity<?> getRevenueReport(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(value = "fromDate", required = false) String fromDate,
            @RequestParam(value = "toDate", required = false) String toDate,
            @RequestParam(value = "groupBy", defaultValue = "day") String groupBy) {

        // Kiểm tra quyền admin
        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền xem báo cáo doanh thu"));
        }

        List<Invoice> allInvoices = invoiceService.getAllInvoices();

        // Lọc theo thời gian và trạng thái
        List<Invoice> filteredInvoices = allInvoices.stream()
                .filter(invoice -> !"cancelled".equalsIgnoreCase(invoice.getStatus()))
                .filter(invoice -> {
                    if (fromDate == null && toDate == null) return true;

                    try {
                        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
                        Date invoiceDate = invoice.getCreatedAt();

                        if (fromDate != null && !fromDate.trim().isEmpty()) {
                            Date from = sdf.parse(fromDate);
                            if (invoiceDate.before(from)) return false;
                        }

                        if (toDate != null && !toDate.trim().isEmpty()) {
                            Date to = sdf.parse(toDate);
                            Calendar cal = Calendar.getInstance();
                            cal.setTime(to);
                            cal.add(Calendar.DAY_OF_MONTH, 1);
                            to = cal.getTime();
                            if (invoiceDate.after(to)) return false;
                        }

                        return true;
                    } catch (ParseException e) {
                        return true;
                    }
                })
                .collect(Collectors.toList());

        // Nhóm theo thời gian
        Map<String, BigDecimal> revenueByPeriod = new HashMap<>();
        SimpleDateFormat groupFormat;

        switch (groupBy.toLowerCase()) {
            case "month":
                groupFormat = new SimpleDateFormat("yyyy-MM");
                break;
            case "year":
                groupFormat = new SimpleDateFormat("yyyy");
                break;
            default: // day
                groupFormat = new SimpleDateFormat("yyyy-MM-dd");
                break;
        }

        for (Invoice invoice : filteredInvoices) {
            String period = groupFormat.format(invoice.getCreatedAt());
            BigDecimal amount = BigDecimal.valueOf(invoice.getTotalPrice() != null ? invoice.getTotalPrice() : 0);
            revenueByPeriod.merge(period, amount, BigDecimal::add);
        }

        Map<String, Object> report = new HashMap<>();
        report.put("revenueByPeriod", revenueByPeriod);
        report.put("totalRevenue", revenueByPeriod.values().stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        report.put("totalOrders", filteredInvoices.size());

        return ResponseEntity.ok(report);
    }

    /**
     * Lấy đơn hàng cần xử lý (pending)
     */
    @GetMapping("/pending")
    public ResponseEntity<?> getPendingOrders(@RequestHeader("Authorization") String authHeader) {
        // Kiểm tra quyền admin
        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền xem đơn hàng"));
        }

        List<Invoice> allInvoices = invoiceService.getAllInvoices();
        List<Invoice> pendingInvoices = allInvoices.stream()
                .filter(i -> "pending".equalsIgnoreCase(i.getStatus()))
                .sorted((i1, i2) -> i2.getCreatedAt().compareTo(i1.getCreatedAt())) // Mới nhất trước
                .collect(Collectors.toList());

        return ResponseEntity.ok(pendingInvoices);
    }

    /**
     * Cập nhật trạng thái đơn hàng hàng loạt
     */
    @PutMapping("/bulk-status")
    public ResponseEntity<?> bulkUpdateStatus(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("invoiceIds") List<String> invoiceIds,
            @RequestParam("status") String status) {

        // Kiểm tra quyền admin
        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền cập nhật trạng thái"));
        }

        // Kiểm tra trạng thái hợp lệ
        List<String> validStatuses = Arrays.asList("pending", "processing", "processed", "cancelled");
        if (!validStatuses.contains(status.toLowerCase())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("error", "Trạng thái không hợp lệ"));
        }

        int updatedCount = 0;
        for (String invoiceId : invoiceIds) {
            boolean updated = invoiceService.updateInvoiceStatus(invoiceId, status);
            if (updated) {
                updatedCount++;
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Cập nhật trạng thái thành công");
        response.put("updatedCount", updatedCount);
        response.put("totalRequested", invoiceIds.size());

        return ResponseEntity.ok(response);
    }
}
