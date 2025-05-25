package com.qhoang.connectify;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class TestConnection {
    public static void main(String[] args) {
        String url = "jdbc:mysql://hoangmysql.zapto.org:11135/connectify";
        String username = "connectify_db";
        String password = "connectify@2025";
        
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            Connection connection = DriverManager.getConnection(url, username, password);
            System.out.println("✅ Kết nối database thành công!");
            System.out.println("Database URL: " + url);
            connection.close();
        } catch (ClassNotFoundException e) {
            System.out.println("❌ Không tìm thấy MySQL driver: " + e.getMessage());
        } catch (SQLException e) {
            System.out.println("❌ Lỗi kết nối database: " + e.getMessage());
        }
    }
}
