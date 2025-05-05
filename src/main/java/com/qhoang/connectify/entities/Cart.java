package com.qhoang.connectify.entities;

import java.util.List;

public class Cart {
    private String cart_id;
    private String customer_id;
    private List<CartItem> items;
    private double total_amount;

    public Cart(String cart_id, String customer_id, List<CartItem> items, double total_amount) {
        this.cart_id = cart_id;
        this.customer_id = customer_id;
        this.items = items;
        this.total_amount = total_amount;
    }

    public String getCart_id() {
        return cart_id;
    }

    public void setCart_id(String cart_id) {
        this.cart_id = cart_id;
    }

    public String getCustomer_id() {
        return customer_id;
    }

    public void setCustomer_id(String customer_id) {
        this.customer_id = customer_id;
    }

    public List<CartItem> getItems() {
        return items;
    }

    public void setItems(List<CartItem> items) {
        this.items = items;
    }

    public double getTotal_amount() {
        return total_amount;
    }

    public void setTotal_amount(double total_amount) {
        this.total_amount = total_amount;
    }
}

class CartItem {
    private String product_id;         // Mã sản phẩm
    private String product_name;       // Tên sản phẩm
    private int quantity;              // Số lượng sản phẩm
    private double unit_price;         // Giá sản phẩm đơn vị
    private double total_price;        // Tổng giá của sản phẩm (quantity x unit_price)

    // Getters and Setters
    public String getProduct_id() {
        return product_id;
    }

    public void setProduct_id(String product_id) {
        this.product_id = product_id;
    }

    public String getProduct_name() {
        return product_name;
    }

    public void setProduct_name(String product_name) {
        this.product_name = product_name;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
        this.total_price = quantity * unit_price; // Cập nhật tổng giá mỗi khi thay đổi số lượng
    }

    public double getUnit_price() {
        return unit_price;
    }

    public void setUnit_price(double unit_price) {
        this.unit_price = unit_price;
        this.total_price = quantity * unit_price; // Cập nhật tổng giá khi thay đổi giá đơn vị
    }

    public double getTotal_price() {
        return total_price;
    }

    public void setTotal_price(double total_price) {
        this.total_price = total_price;
    }
}
