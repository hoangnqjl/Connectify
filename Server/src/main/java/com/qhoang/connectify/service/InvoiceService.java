package com.qhoang.connectify.service;

import com.qhoang.connectify.entities.Invoice;
import com.qhoang.connectify.repository.InvoiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;

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
    public boolean updateInvoiceStatus(String invoiceId, String status) {
        int updatedRows = invoiceRepository.updateInvoiceStatus(invoiceId, status);
        return updatedRows > 0;
    }
}
