package com.qhoang.connectify.service;

import com.qhoang.connectify.entities.CartItem;
import com.qhoang.connectify.entities.Cart;
import com.qhoang.connectify.entities.Electronic;
import com.qhoang.connectify.repository.CartItemRepository;
import com.qhoang.connectify.repository.CartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CartItemService {

    private final CartItemRepository cartItemRepository;
    private final CartRepository cartRepository;

    @Autowired
    public CartItemService(CartItemRepository cartItemRepository, CartRepository cartRepository) {
        this.cartItemRepository = cartItemRepository;
        this.cartRepository = cartRepository;
    }

    // Lấy tất cả các items trong giỏ hàng
    public List<CartItem> getItemsByCart(Cart cart) {
        return cartItemRepository.findByCart(cart);  // Lấy các item từ repository
    }

    // Thêm hoặc cập nhật một CartItem
    public void saveCartItem(CartItem item) {
        cartItemRepository.save(item);  // Lưu hoặc cập nhật CartItem vào cơ sở dữ liệu
    }

    // Xóa một CartItem
    public void deleteCartItem(CartItem item) {
        cartItemRepository.delete(item);  // Xóa CartItem
    }

    // Xóa tất cả CartItem của một giỏ hàng
    public void deleteItemsByCart(Cart cart) {
        cartItemRepository.deleteByCart(cart);  // Xóa tất cả các CartItem của giỏ hàng
    }

    public CartItem getByCartAndElectronic(Cart cart, Electronic electronic) {
        return cartItemRepository.findByCartAndElectronic(cart, electronic);
    }

    public void deleteCartItemByCartIdAndElectronicId(String cartId, String electronicId) {
        cartItemRepository.deleteByCartIdAndElectronicId(cartId, electronicId);
    }



}
