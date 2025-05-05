package com.qhoang.connectify.dao;


import com.qhoang.connectify.entities.Electronic;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Repository
public class ElectronicDao {
    private Connection connection;

    public ElectronicDao(Connection connection) {
        this.connection = connection;
    }

    public void insertElectronic(Electronic e) throws SQLException {
        String sql = "INSERT INTO electronics (id, cat_id, name, description, image, color, material, power_rating, features, operating_system, storage_capacity, battery_life, price, brand, manufacture_year) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setString(1, e.getId());
            ps.setString(2, e.getCat_id());
            ps.setString(3, e.getName());
            ps.setString(4, e.getDescription());
            ps.setString(5, e.getImage());
            ps.setString(6, e.getColor());
            ps.setString(7, e.getMaterial());
            ps.setString(8, e.getPower_rating());
            ps.setString(9, e.getFeatures());
            ps.setString(10, e.getOperating_system());
            ps.setString(11, e.getStorage_capacity());
            ps.setString(12, e.getBattery_life());
            ps.setString(13, e.getPrice());
            ps.setString(14, e.getBrand());
            ps.setString(15, e.getManufacture_year());
            ps.executeUpdate();
        }
    }

    public List<Electronic> getAllElectronics() throws SQLException {
        List<Electronic> list = new ArrayList<>();
        String sql = "SELECT * FROM electronics";
        try (PreparedStatement ps = connection.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                Electronic e = new Electronic();
                e.setId(rs.getString("id"));
                e.setCat_id(rs.getString("cat_id"));
                e.setName(rs.getString("name"));
                e.setDescription(rs.getString("description"));
                e.setImage(rs.getString("image"));
                e.setColor(rs.getString("color"));
                e.setMaterial(rs.getString("material"));
                e.setPower_rating(rs.getString("power_rating"));
                e.setFeatures(rs.getString("features"));
                e.setOperating_system(rs.getString("operating_system"));
                e.setStorage_capacity(rs.getString("storage_capacity"));
                e.setBattery_life(rs.getString("battery_life"));
                e.setPrice(rs.getString("price"));
                e.setBrand(rs.getString("brand"));
                e.setManufacture_year(rs.getString("manufacture_year"));
                list.add(e);
            }
        }
        return list;
    }
}
