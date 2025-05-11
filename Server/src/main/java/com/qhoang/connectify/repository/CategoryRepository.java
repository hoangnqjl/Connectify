package com.qhoang.connectify.repository;

import com.qhoang.connectify.entities.Category;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;
import java.util.List;

@Repository
public class CategoryRepository {

    @PersistenceContext
    private EntityManager entityManager;

    @Transactional
    public List<Category> getAllCategories() {
        String jpql = "SELECT c FROM Category c";
        TypedQuery<Category> query = entityManager.createQuery(jpql, Category.class);
        return query.getResultList();
    }

    @Transactional
    public void insertCategory(Category category) {
        entityManager.persist(category);
    }

    @Transactional
    public void updateCategory(Category category) {
        entityManager.merge(category);
    }

    @Transactional
    public void deleteCategory(int catId) {
        Category category = entityManager.find(Category.class, catId);
        if (category != null) {
            entityManager.remove(category);
        }
    }
}
