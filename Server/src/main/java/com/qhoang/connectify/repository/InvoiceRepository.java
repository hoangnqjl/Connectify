package com.qhoang.connectify.repository;

import com.qhoang.connectify.entities.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import javax.transaction.Transactional;
import java.util.List;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, String> {

    // Lấy danh sách hóa đơn theo userId
    List<Invoice> findByUser_UserId(String userId);

    // Cập nhật trạng thái hóa đơn
    @Modifying
    @Transactional
    @Query("UPDATE Invoice i SET i.status = :status WHERE i.invoiceId = :invoiceId")
    int updateInvoiceStatus(String invoiceId, String status);
}
