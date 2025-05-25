package com.qhoang.connectify.service;

import com.qhoang.connectify.entities.Electronic;
import com.qhoang.connectify.entities.Invoice;
import com.qhoang.connectify.repository.ElectronicRepository;
import com.qhoang.connectify.repository.InvoiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;

    @Autowired
    private ElectronicService electronicService;
    @Autowired
    private ElectronicRepository electronicRepository;

    @Autowired
    public InvoiceService(InvoiceRepository invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }

    // Thêm mới hóa đơn
    public void addInvoice(Invoice invoice) {
        invoiceRepository.save(invoice);
    }

    // Lấy tất cả hóa đơn
    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll();
    }

    // Lấy hóa đơn theo userId
    public List<Invoice> getInvoicesByUserId(String userId) {
        return invoiceRepository.findByUser_UserId(userId);
    }

    // Cập nhật trạng thái hóa đơn
//    public boolean updateInvoiceStatus(String invoiceId, String status) {
//        int updatedRows = invoiceRepository.updateInvoiceStatus(invoiceId, status);
//        return updatedRows > 0;
//    }

    // Lấy hóa đơn theo ID
    public Invoice getInvoiceById(String invoiceId) {
        return invoiceRepository.findByInvoiceId(invoiceId).orElse(null);
    }

    public boolean updateInvoiceStatus(String invoiceId, String newStatus) {
        Optional<Invoice> optionalInvoice = invoiceRepository.findById(invoiceId);

        if (!optionalInvoice.isPresent()) return false;

        Invoice invoice = optionalInvoice.get();

        if ("processed".equalsIgnoreCase(newStatus) && !"processed".equalsIgnoreCase(invoice.getStatus())) {
            String purchasedItems = invoice.getPurchasedItems(); // VD: "Apple iPhone 16 Mini SL1, MacBook Air M3 SL2"
            String[] items = purchasedItems.split(",");

            for (String item : items) {
                item = item.trim();
                if (!item.contains("SL")) continue;

                String[] parts = item.split("SL");
                if (parts.length != 2) continue; // phòng trường hợp sai cú pháp

                String itemName = parts[0].trim();
                int quantity;

                try {
                    quantity = Integer.parseInt(parts[1].trim());
                } catch (NumberFormatException e) {
                    continue; // bỏ qua nếu không phải số
                }

                Electronic electronic = electronicRepository.findByName(itemName);
                if (electronic == null || electronic.getQuantity() < quantity) {
                    return false; // Không đủ hàng hoặc không tìm thấy sản phẩm
                }

                electronic.setQuantity(electronic.getQuantity() - quantity);
                electronicRepository.save(electronic);
            }
        }

        invoice.setStatus(newStatus);
        invoiceRepository.save(invoice);
        return true;
    }


}
