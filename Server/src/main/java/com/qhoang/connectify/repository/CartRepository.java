package com.qhoang.connectify.repository;

import com.qhoang.connectify.entities.Cart;
import com.qhoang.connectify.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {

    // Tìm giỏ hàng theo người dùng
    Optional<Cart> findByUser(User user);  // JpaRepository đã cung cấp phương thức findBy

    boolean existsByUser_UserId(String userId);

    // Các phương thức save() và delete() đã được JpaRepository cung cấp sẵn.
}
