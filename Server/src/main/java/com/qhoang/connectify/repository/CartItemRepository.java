package com.qhoang.connectify.repository;


import com.qhoang.connectify.entities.CartItem;
import com.qhoang.connectify.entities.Cart;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.*;
import java.util.List;

@Repository
public class CartItemRepository {

    @PersistenceContext
    private EntityManager entityManager;

    @Transactional(readOnly = true)
    public List<CartItem> findItemsByCart(Cart cart) {
        String jpql = "SELECT ci FROM CartItem ci WHERE ci.cart = :cart";
        return entityManager.createQuery(jpql, CartItem.class)
                .setParameter("cart", cart)
                .getResultList();
    }

    @Transactional
    public void saveCartItem(CartItem item) {
        if (item.getCart_item_id() == null) {
            entityManager.persist(item);
        } else {
            entityManager.merge(item);
        }
    }

    @Transactional
    public void deleteCartItem(CartItem item) {
        if (entityManager.contains(item)) {
            entityManager.remove(item);
        } else {
            entityManager.remove(entityManager.merge(item));
        }
    }

    @Transactional
    public void deleteItemsByCart(Cart cart) {
        String jpql = "DELETE FROM CartItem ci WHERE ci.cart = :cart";
        entityManager.createQuery(jpql)
                .setParameter("cart", cart)
                .executeUpdate();
    }
}
