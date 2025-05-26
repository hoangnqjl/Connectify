package com.qhoang.connectify.controller;

import com.qhoang.connectify.entities.Invoice;
import com.qhoang.connectify.entities.User;
import com.qhoang.connectify.service.ElectronicService;
import com.qhoang.connectify.service.InvoiceService;
import com.qhoang.connectify.repository.UserRepository;
import com.qhoang.connectify.service.UserService;
import com.qhoang.connectify.service.AuthorizationService;
import com.qhoang.connectify.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/invoices")
@CrossOrigin(origins = "http://localhost:8000")
public class InvoiceController {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private InvoiceService invoiceService;
    @Autowired
    private UserService userService;
    @Autowired
    private AuthorizationService authorizationService;

    @Autowired
    private ElectronicService electronicService;

    private User extractUserFromToken(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        if (jwtUtil.validateToken(token)) {
            String userId = jwtUtil.extractUsername(token);
            return userService.getUserByUserId(userId);
        }
        return null;
    }

    // GET all invoices (chỉ admin)
    @GetMapping
    public ResponseEntity<?> getAllInvoices(@RequestHeader("Authorization") String authHeader) {
        // Kiểm tra quyền admin
        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Collections.singletonMap("error", "Bạn không có quyền xem tất cả hóa đơn"));
        }

        List<Invoice> invoices = invoiceService.getAllInvoices();
        if (invoices.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NO_CONTENT).body(null);
        }
        return ResponseEntity.ok(invoices);
    }

    // GET invoices by user_id
    @GetMapping("/user")
    public ResponseEntity<?> getInvoicesByUserId(@RequestHeader("Authorization") String authHeader) {
        User user = extractUserFromToken(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("error", "Token không hợp lệ hoặc không tìm thấy người dùng"));
        }

        List<Invoice> invoices = invoiceService.getInvoicesByUserId(user.getUserId());

        if (invoices.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        return ResponseEntity.ok(invoices);
    }

    // POST new invoice route laf /invoices
    @PostMapping
    public ResponseEntity<?> addInvoice(
            @RequestParam String address,
            @RequestParam String paymentMethod, // Phương thức thanh toán
            @RequestParam String purchasedItems, // ${tensanpham} SL {$sl}, ${tensanpham2} SL {SL_sp2}
            @RequestParam Long totalPrice, // tông gia tinh tren frontend
            @RequestParam String status, // mac dinh co gia tri là processing
            @RequestParam String note,
            @RequestHeader("Authorization") String authHeader) {

        User user = extractUserFromToken(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("error", "Token không hợp lệ hoặc không tìm thấy người dùng"));
        }

        int random_number = 1000 + new Random().nextInt(9000);
        String invoiceId = "hd@" + user.getUserId() + random_number;

        Invoice invoice = new Invoice();
        invoice.setInvoiceId(invoiceId);
        invoice.setUser(user);
        invoice.setAddress(address);
        invoice.setPaymentMethod(paymentMethod);
        invoice.setPurchasedItems(purchasedItems);
        invoice.setNote(note);
        invoice.setTotalPrice(totalPrice);
        invoice.setStatus(status);


        invoiceService.addInvoice(invoice);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Tạo hóa đơn thành công");
        response.put("invoice", invoice);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }


    @PostMapping("/{invoiceId}/status")
    public ResponseEntity<?> updateInvoiceStatus(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String invoiceId,
            @RequestParam String status) {

        // Kiểm tra quyền admin
        if (!authorizationService.hasAdminAccess(authHeader)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Bạn không có quyền cập nhật trạng thái đơn hàng");
        }

        boolean updated = invoiceService.updateInvoiceStatus(invoiceId, status);
        if (updated) {
            return ResponseEntity.ok("Cập nhật trạng thái đơn hàng thành công");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Không thể cập nhật (có thể không đủ hàng hoặc không tìm thấy đơn)");
        }
    }

}
