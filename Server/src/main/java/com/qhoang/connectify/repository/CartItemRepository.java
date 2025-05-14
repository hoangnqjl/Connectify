package com.qhoang.connectify.repository;

import com.qhoang.connectify.entities.CartItem;
import com.qhoang.connectify.entities.Cart;
import com.qhoang.connectify.entities.Electronic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    // Lấy tất cả các CartItem của một giỏ hàng
    List<CartItem> findByCart(Cart cart);

    // Xóa tất cả các CartItem của một giỏ hàng
    void deleteByCart(Cart cart);

    @Query("SELECT ci FROM CartItem ci WHERE ci.cart = :cart AND ci.electronic = :electronic")
    CartItem findByCartAndElectronic(@Param("cart") Cart cart, @Param("electronic") Electronic electronic);

    @Query("DELETE FROM CartItem ci WHERE ci.cart.cart_id = :cartId AND ci.electronic.id = :electronicId")
    @Modifying
    void deleteByCartIdAndElectronicId(@Param("cartId") String cartId, @Param("electronicId") String electronicId);

}
