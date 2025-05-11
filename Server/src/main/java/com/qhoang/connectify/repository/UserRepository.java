package com.qhoang.connectify.repository;

import com.qhoang.connectify.entities.User;
import org.springframework.stereotype.Repository;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.transaction.Transactional;
import java.util.List;

@Repository
public class UserRepository {

    @PersistenceContext
    private EntityManager entityManager;

    // Thêm người dùng mới
    @Transactional
    public void save(User user) {
        entityManager.persist(user); // Sử dụng persist() để lưu người dùng
    }

    // Kiểm tra người dùng theo email và mật khẩu
    public boolean retrieveUser(String email, String password) {
        String query = "SELECT u FROM User u WHERE u.email = :email AND u.password = :password";
        try {
            User user = entityManager.createQuery(query, User.class)
                    .setParameter("email", email)
                    .setParameter("password", password)
                    .getSingleResult();
            return user != null;
        } catch (Exception e) {
            return false; // Không tìm thấy người dùng
        }
    }

    // Tìm người dùng theo email
    public User findByEmail(String email) {
        String query = "SELECT u FROM User u WHERE u.email = :email";
        try {
            return entityManager.createQuery(query, User.class)
                    .setParameter("email", email)
                    .getSingleResult();
        } catch (Exception e) {
            return null;
        }
    }

    // Tìm người dùng theo userId
    public User findByUserId(String userId) {
        return entityManager.find(User.class, userId); // Tìm bằng cách sử dụng find()
    }

    // Lấy tất cả người dùng
    public List<User> getAllUsers() {
        String query = "SELECT u FROM User u";
        return entityManager.createQuery(query, User.class).getResultList();
    }

    // Cập nhật người dùng
    @Transactional
    public void updateUser(User user) {
        entityManager.merge(user); // Sử dụng merge() để cập nhật người dùng
    }
}
