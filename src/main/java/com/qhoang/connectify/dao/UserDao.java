package com.qhoang.connectify.dao;

import com.qhoang.connectify.entities.User;
import com.qhoang.connectify.utils.DBUtils;
import org.springframework.stereotype.Repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

@Repository
public class UserDao {
    public void insertUser(User user) {
        String sql = "INSERT INTO users (user_id, fullname, username, email, phonenumber, password, birthday, avatar, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        long currentTime = System.currentTimeMillis();

        try{
            Connection con = DBUtils.getConnection();
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setString(1, user.getUser_id());
            ps.setString(2, user.getFullname());
            ps.setString(3, user.getUsername());
            ps.setString(4, user.getEmail());
            ps.setString(5, user.getPhonenumber());
            ps.setString(6, user.getPassword());
            ps.setDate(7, new java.sql.Date(user.getBirthday().getTime()));
            ps.setString(8, user.getAvatar());
            ps.setTimestamp(9, new java.sql.Timestamp(currentTime));
            ps.setTimestamp(10, new java.sql.Timestamp(currentTime));
            ps.executeUpdate();

        }
        catch(Exception e){
            e.printStackTrace();
            System.out.printf("Error inserting user: %s\n", e.getMessage());
        }
    }

    public boolean retrieveUser(String email, String password) {
        String sql = "SELECT * FROM users WHERE email = ? AND password = ?";
        try {
            Connection con = DBUtils.getConnection();
            PreparedStatement ps = con.prepareStatement(sql);

            ps.setString(1, email);
            ps.setString(2, password);

            ResultSet rs = ps.executeQuery();
            return rs.next();
        }
        catch (Exception e) {
            System.out.printf("Error in retrieving user: %s\n", e.getMessage());
        }
        return false;
    }

    public User findByEmail(String email) {
        String sql = "SELECT * FROM users WHERE email = ?";
        try {
            Connection con = DBUtils.getConnection();
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setString(1, email);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                User user = new User();
                user.setUser_id(rs.getString("user_id"));
                user.setFullname(rs.getString("fullname"));
                user.setUsername(rs.getString("username"));
                user.setEmail(rs.getString("email"));
                user.setPhonenumber(rs.getString("phonenumber"));
                user.setPassword(rs.getString("password"));
                user.setBirthday(rs.getDate("birthday"));
                user.setAvatar(rs.getString("avatar"));
                user.setCreated_at(rs.getTimestamp("created_at"));
                user.setUpdated_at(rs.getTimestamp("updated_at"));
                return user;
            }
        } catch (Exception e) {
            System.out.printf("Error in finding user by email: %s\n", e.getMessage());
        }
        return null;
    }


}
