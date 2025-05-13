package com.qhoang.connectify.utils;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.persistence.EntityManagerFactory;
import javax.sql.DataSource;
import java.util.Properties;

@Configuration
@EnableTransactionManagement
@ComponentScan(basePackages = "com.qhoang.connectify")
@EnableJpaRepositories(basePackages = "com.qhoang.connectify.repository")

public class AppConfig {

    @Bean
    public LocalContainerEntityManagerFactoryBean entityManagerFactory(DataSource dataSource) {
        LocalContainerEntityManagerFactoryBean emfBean = new LocalContainerEntityManagerFactoryBean();
        emfBean.setDataSource(dataSource);
        emfBean.setPackagesToScan("com.qhoang.connectify.entities"); // Chỉ định package chứa các entities
        emfBean.setPersistenceUnitName("persistenceUnit");

        // Cấu hình Hibernate làm JPA provider
        HibernateJpaVendorAdapter vendorAdapter = new HibernateJpaVendorAdapter();
        emfBean.setJpaVendorAdapter(vendorAdapter);

        // Cấu hình các thuộc tính Hibernate (tùy chọn)
        Properties jpaProperties = new Properties();
        jpaProperties.setProperty("hibernate.dialect", "org.hibernate.dialect.MySQL8Dialect");
        jpaProperties.setProperty("hibernate.hbm2ddl.auto", "update"); // Tùy chọn: update schema
        jpaProperties.setProperty("hibernate.show_sql", "true"); // Hiển thị SQL log (tùy chọn)
        jpaProperties.setProperty("hibernate.format_sql", "true"); // Định dạng SQL log (tùy chọn)
        emfBean.setJpaProperties(jpaProperties);

        return emfBean;
    }

    @Bean
    public PlatformTransactionManager transactionManager(EntityManagerFactory entityManagerFactory) {
        return new JpaTransactionManager(entityManagerFactory);
    }

    @Bean
    public DataSource dataSource() {
        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setDriverClassName("com.mysql.cj.jdbc.Driver");
        dataSource.setJdbcUrl("jdbc:mysql://hoangmysql.zapto.org:11135/connectify");
        dataSource.setUsername("connectify_db");
        dataSource.setPassword("connectify@2025");
        return dataSource;
    }
}