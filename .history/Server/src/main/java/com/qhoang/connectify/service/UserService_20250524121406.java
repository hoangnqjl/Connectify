package com.qhoang.connectify.service;

import com.qhoang.connectify.entities.User;
import com.qhoang.connectify.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public void saveUser(User user) {
        userRepository.save(user);
    }

    public boolean checkUserCredentials(String email, String password) {
        return userRepository.findByEmailAndPassword(email, password).isPresent();
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    public User getUserByUserId(String userId) {
        return userRepository.findByUserId(userId).orElse(null);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public void updateUser(User user) {
        userRepository.save(user); // save() tự động cập nhật nếu entity đã tồn tại
    }
}

