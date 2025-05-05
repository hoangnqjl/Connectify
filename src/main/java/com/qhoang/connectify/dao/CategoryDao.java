package com.qhoang.connectify.dao;

import com.qhoang.connectify.entities.Category;
import org.springframework.stereotype.Repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@Repository

public class CategoryDao {
    private Connection connection;

    public CategoryDao(Connection connection) {
        this.connection = connection;
    }

    public void insertCategory(Category category) throws SQLException {
        String sql = "INSERT INTO categories (cat_name) VALUES (?)";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setString(1, category.getCat_name());
            ps.executeUpdate();
        }
    }

    public List<Category> getAllCategories() throws SQLException {
        List<Category> list = new ArrayList<>();
        String sql = "SELECT * FROM categories";
        try (PreparedStatement ps = connection.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                Category c = new Category(rs.getInt("cat_id"), rs.getString("cat_name"));
                list.add(c);
            }
        }
        return list;
    }
}
