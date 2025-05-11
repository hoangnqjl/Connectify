package com.qhoang.connectify.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;

import javax.persistence.*;

@Entity
@Table(name = "cart_items")
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long cart_item_id;

    // Mỗi item thuộc về 1 cart
    @ManyToOne
    @JoinColumn(name = "cart_id")
    @JsonBackReference
    private Cart cart;

    // Mỗi item ứng với 1 sản phẩm điện tử
    @ManyToOne
    @JoinColumn(name = "electronic_id")
    private Electronic electronic;

    private Integer quantity;

    public CartItem() {}

    public CartItem(Cart cart, Electronic electronic, Integer quantity) {
        this.cart = cart;
        this.electronic = electronic;
        this.quantity = quantity;
    }

    // Getters và Setters


    public Long getCart_item_id() {
        return cart_item_id;
    }

    public void setCart_item_id(Long cart_item_id) {
        this.cart_item_id = cart_item_id;
    }

    public Cart getCart() {
        return cart;
    }

    public void setCart(Cart cart) {
        this.cart = cart;
    }

    public Electronic getElectronic() {
        return electronic;
    }

    public void setElectronic(Electronic electronic) {
        this.electronic = electronic;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
