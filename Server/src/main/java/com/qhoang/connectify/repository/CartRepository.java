package com.qhoang.connectify.repository;

import com.qhoang.connectify.entities.Cart;
import com.qhoang.connectify.entities.User;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.*;
import java.util.List;

@Repository
public class CartRepository {

    @PersistenceContext
    private EntityManager entityManager;

    @Transactional(readOnly = true)
    public Cart findCartByUser(User user) {
        String jpql = "SELECT c FROM Cart c LEFT JOIN FETCH c.items WHERE c.user = :user";
        List<Cart> result = entityManager.createQuery(jpql, Cart.class)
                .setParameter("user", user)
                .getResultList();
        return result.isEmpty() ? null : result.get(0);
    }
    @Transactional
    public void saveCart(Cart cart) {
        if (cart.getCart_id() == null) {
            entityManager.persist(cart);
        } else {
            entityManager.merge(cart);
        }
    }

    @Transactional
    public void deleteCart(Cart cart) {
        if (entityManager.contains(cart)) {
            entityManager.remove(cart);
        } else {
            entityManager.remove(entityManager.merge(cart));
        }
    }
}
