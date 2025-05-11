package com.qhoang.connectify.repository;

import com.qhoang.connectify.entities.Invoice;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;
import java.util.List;

@Repository
public class InvoiceRepository {

    @PersistenceContext
    private EntityManager entityManager;

    @Transactional
    public void insertInvoice(Invoice invoice) {
        entityManager.persist(invoice);  // Sử dụng persist để thêm hóa đơn vào cơ sở dữ liệu
    }

    // Lấy tất cả hóa đơn
    @Transactional(readOnly = true)
    public List<Invoice> getAllInvoices() {
        String jpql = "SELECT i FROM Invoice i";
        TypedQuery<Invoice> query = entityManager.createQuery(jpql, Invoice.class);
        System.out.println("List" + query.getResultList());
        return query.getResultList();
    }

    // Lấy hóa đơn theo user_id
    @Transactional
    public List<Invoice> getInvoicesByUserId(String userId) {
        String jpql = "SELECT i FROM Invoice i WHERE i.user.userId = :userId";
        TypedQuery<Invoice> query = entityManager.createQuery(jpql, Invoice.class);
        query.setParameter("userId", userId);
        return query.getResultList();
    }

    // Cập nhật trạng thái hóa đơn từ processing sang processed
    @Transactional
    public void updateInvoiceStatus(String invoiceId, String status) {
        String jpql = "UPDATE Invoice i SET i.status = :status WHERE i.invoiceId = :invoiceId";
        int updatedCount = entityManager.createQuery(jpql)
                .setParameter("status", status)
                .setParameter("invoiceId", invoiceId)
                .executeUpdate();

        if (updatedCount > 0) {
            System.out.println("Invoice status updated successfully.");
        }
    }
}
