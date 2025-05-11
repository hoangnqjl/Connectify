package com.qhoang.connectify.utils;

import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

public class DBUtils {
    private static String DRIVER, SERVER_NAME, DB_NAME, USER_NAME, PASSWORD;
    static final String FILE_NAME = "/DBConfig.properties";
    public static Connection getConnection() throws IOException, ClassNotFoundException, SQLException {
        Properties properties = new Properties();

        properties.load(DBUtils.class.getResourceAsStream(FILE_NAME));

        DRIVER = properties.getProperty("driver");
        SERVER_NAME = properties.getProperty("server");
        DB_NAME = properties.getProperty("dbname");
        USER_NAME = properties.getProperty("username");
        PASSWORD = properties.getProperty("password");

        Class.forName(DRIVER);

        return DriverManager.getConnection(SERVER_NAME + "/" + DB_NAME, USER_NAME, PASSWORD);
    }

    public static void closeConnection(Connection connection) throws SQLException {
        if (connection != null) {
            connection.close();
            System.out.println("close connection");
        }
    }

    public static void main(String [] args) throws ClassNotFoundException, SQLException {
        Connection con = null;
        try {
            con = getConnection();
            if (con != null) {
                System.out.println("Connection successful!");
            }
            else {
                System.out.println("Connection failed!");
            }
        }
        catch (Exception e) {
            e.printStackTrace();
        }
    }

}

