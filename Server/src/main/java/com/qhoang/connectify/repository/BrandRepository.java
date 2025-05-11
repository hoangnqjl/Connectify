package com.qhoang.connectify.repository;

import com.qhoang.connectify.entities.Brand;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.*;
import java.util.List;

@Repository
public class BrandRepository {

    @PersistenceContext
    private EntityManager entityManager;

    @Transactional
    public List<Brand> getAllBrands() {
        String jpql = "SELECT b FROM Brand b";
        return entityManager.createQuery(jpql, Brand.class).getResultList();
    }

    @Transactional
    public void addBrand(Brand brand) {
        entityManager.persist(brand);
    }
}
