package com.qhoang.connectify.controller;

import com.qhoang.connectify.entities.Invoice;
import com.qhoang.connectify.entities.User;
import com.qhoang.connectify.repository.InvoiceRepository;
import com.qhoang.connectify.repository.UserRepository;
import com.qhoang.connectify.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/invoices")
@CrossOrigin(origins = "*")
public class InvoiceController {
    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private final InvoiceRepository invoiceRepository;

    private User extractUserFromToken(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        if (jwtUtil.validateToken(token)) {
            String userId = jwtUtil.extractUsername(token);
            return userRepository.findByUserId(userId);
        }
        return null;
    }

    @Autowired
    public InvoiceController(InvoiceRepository invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }

    // GET all invoices
    @GetMapping
    public ResponseEntity<List<Invoice>> getAllInvoices() {
        List<Invoice> invoices = invoiceRepository.getAllInvoices();
        if (invoices.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NO_CONTENT).body(null); // Trả về 204 nếu không có hóa đơn
        }
        System.out.println("danh sach" + invoices);
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

        List<Invoice> invoices = invoiceRepository.getInvoicesByUserId(user.getUserId());

        if (invoices.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        return ResponseEntity.ok(invoices);
    }

    // POST new invoice
    @PostMapping
    public ResponseEntity<?> addInvoice(
            @RequestParam String address,
            @RequestParam String paymentMethod,
            @RequestParam String purchasedItems,
            @RequestParam Long totalPrice,
            @RequestParam String status,
            @RequestHeader("Authorization") String authHeader) {

        // Lấy user từ JWT
        User user = extractUserFromToken(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("error", "Token không hợp lệ hoặc không tìm thấy người dùng"));
        }


        int random_number = 1000 + new Random().nextInt(9000);
        String invoiceId = "hd@" + user.getUserId() + random_number;

        // Tạo đối tượng Invoice
        Invoice invoice = new Invoice();
        invoice.setInvoiceId(invoiceId);
        invoice.setUser(user);
        invoice.setAddress(address);
        invoice.setPaymentMethod(paymentMethod);
        invoice.setPurchasedItems(purchasedItems);
        invoice.setTotalPrice(totalPrice);
        invoice.setStatus(status);

        // Lưu hóa đơn vào cơ sở dữ liệu
        invoiceRepository.insertInvoice(invoice);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Tạo hóa đơn thành công");
        response.put("invoice", invoice);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }



    // PUT update invoice status
    @PostMapping("/{invoiceId}/status")
    public ResponseEntity<?> updateInvoiceStatus(@PathVariable String invoiceId, @RequestParam String status) {
        invoiceRepository.updateInvoiceStatus(invoiceId, status);
        return ResponseEntity.ok("Invoice status updated successfully");
    }


}
