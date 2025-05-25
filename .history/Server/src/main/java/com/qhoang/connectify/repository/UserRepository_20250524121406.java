package com.qhoang.connectify.repository;

import com.qhoang.connectify.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    Optional<User> findByEmailAndPassword(String email, String password);

    Optional<User> findByEmail(String email);

    Optional<User> findByUserId(String userId); // Nếu userId là khóa chính, có thể dùng findById()
}
