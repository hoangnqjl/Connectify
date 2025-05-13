package com.qhoang.connectify.service;


import com.qhoang.connectify.entities.Cart;
import com.qhoang.connectify.entities.User;
import com.qhoang.connectify.repository.CartRepository;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.Optional;

@Service
public class CartService {

    private final CartRepository cartRepository;

    @Autowired
    public CartService(CartRepository cartRepository) {
        this.cartRepository = cartRepository;
    }

    public Cart getCartByUser(User user) {
        Optional<Cart> cartOptional = cartRepository.findByUser(user);
        Cart cart = cartOptional.orElse(null);

        if (cart != null) {
            // Khởi tạo các items trong Cart trước khi trả về
            Hibernate.initialize(cart.getItems());
        }

        return cart;
    }

    // Thêm hoặc cập nhật giỏ hàng
    public Cart saveCart(Cart cart) {
        return cartRepository.save(cart);  // Lưu hoặc cập nhật giỏ hàng
    }

    // Xóa giỏ hàng
    public void deleteCart(Cart cart) {
        cartRepository.delete(cart);  // Xóa giỏ hàng
    }

}
