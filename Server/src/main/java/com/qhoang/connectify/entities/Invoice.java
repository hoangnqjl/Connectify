package com.qhoang.connectify.entities;


import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonFormat;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.Date;

@Entity
@Table(name = "invoices")
public class Invoice {

    @Id
    @Column(name = "invoice_id", nullable = false, length = 255)
    private String invoiceId;

    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "user_id")
    private User user;

    @Column(name = "address")
    private String address;


    @Column(name = "payment_method", nullable = false)
    private String paymentMethod;

    @Column(name = "purchased_items", columnDefinition = "TEXT")
    private String purchasedItems;

    @Column(name = "total_price")
    private Long totalPrice;

    @Column(name = "status", nullable = false)
    private String status;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "created_at", updatable = false)
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private Date createdAt;

    public Invoice() {

    }

    public Invoice(String status, Long totalPrice, String purchasedItems, String paymentMethod, Date createdAt, String address, User user, String invoiceId) {
        this.status = status;
        this.totalPrice = totalPrice;
        this.purchasedItems = purchasedItems;
        this.paymentMethod = paymentMethod;
        this.createdAt = createdAt;
        this.address = address;
        this.user = user;
        this.invoiceId = invoiceId;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = new Date();

    }


    public String getInvoiceId() {
        return invoiceId;
    }

    public void setInvoiceId(String invoiceId) {
        this.invoiceId = invoiceId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getPurchasedItems() {
        return purchasedItems;
    }

    public void setPurchasedItems(String purchasedItems) {
        this.purchasedItems = purchasedItems;
    }

    public Long getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(Long totalPrice) {
        this.totalPrice = totalPrice;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}