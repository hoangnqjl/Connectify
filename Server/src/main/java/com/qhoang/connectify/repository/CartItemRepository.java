package com.qhoang.connectify.repository;

import com.qhoang.connectify.entities.CartItem;
import com.qhoang.connectify.entities.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    // Lấy tất cả các CartItem của một giỏ hàng
    List<CartItem> findByCart(Cart cart);

    // Xóa tất cả các CartItem của một giỏ hàng
    void deleteByCart(Cart cart);
}
