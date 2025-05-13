package com.qhoang.connectify.repository;

import com.qhoang.connectify.entities.Electronic;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;
import java.util.List;

@Repository
public class ElectronicRepository {

    @PersistenceContext
    private EntityManager entityManager;

    @Transactional
    public List<Electronic> getAllElectronics() {
        String jpql = "SELECT e FROM Electronic e";
        TypedQuery<Electronic> query = entityManager.createQuery(jpql, Electronic.class);
        return query.getResultList();
    }

    @Transactional
    public void insertElectronic(Electronic electronic) {
        entityManager.persist(electronic);
    }

    @Transactional
    public void updateElectronic(Electronic electronic) {
        entityManager.merge(electronic);
    }

    @Transactional
    public void deleteElectronic(String id) {
        Electronic electronic = entityManager.find(Electronic.class, id);
        if (electronic != null) {
            entityManager.remove(electronic);
        }
    }

    @Transactional
    public Electronic getElectronicById(String id) {
        return entityManager.find(Electronic.class, id);
    }

    @Transactional
    public List<Electronic> searchElectronics(String keyword) {
        String jpql = "SELECT e FROM Electronic e WHERE " +
                "e.name LIKE :keyword OR " +
                "e.cpu LIKE :keyword OR " +
                "e.ram LIKE :keyword OR " +
                "e.gpu LIKE :keyword OR " +
                "e.material LIKE :keyword OR " +
                "e.powerRating LIKE :keyword OR " +
                "e.operatingSystem LIKE :keyword OR " +
                "e.storageCapacity LIKE :keyword OR " +
                "e.batteryLife LIKE :keyword OR " +
                "e.manufactureYear LIKE :keyword OR " +
                "e.description LIKE :keyword";

        TypedQuery<Electronic> query = entityManager.createQuery(jpql, Electronic.class);
        query.setParameter("keyword", "%" + keyword + "%");

        return query.getResultList();
    }
}
