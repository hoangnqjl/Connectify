package com.qhoang.connectify.entities;

import javax.persistence.*;

@Entity
@Table(name = "electronics")
public class Electronic {

    @Id
    @Column(name = "id")
    private String id;

    @ManyToOne
    @JoinColumn(name = "cat_id", referencedColumnName = "cat_id")
    private Category category;

    @ManyToOne
    @JoinColumn(name = "brand_id", referencedColumnName = "brand_id")
    private Brand brand;

    @Column(name = "name")
    private String name;

    @Column(name = "image")
    private String image;

    @Column(name = "cpu")
    private String cpu;

    @Column(name = "ram")
    private String ram;

    @Column(name = "gpu")
    private String gpu;

    @Column(name = "material")
    private String material;

    @Column(name = "power_rating")
    private String powerRating;

    @Column(name = "operating_system")
    private String operatingSystem;

    @Column(name = "storage_capacity")
    private String storageCapacity;

    @Column(name = "battery_life")
    private String batteryLife;

    @Column(name = "price")
    private String price;

    @Column(name = "manufacture_year")
    private String manufactureYear;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "quantity")
    private Integer quantity;

    @Column(name = "status")
    private String status;

    public Electronic() {
    }

    public Electronic(String id, Category category, Brand brand, String name, String image, String material,
                      String powerRating, String operatingSystem, String storageCapacity,
                      String batteryLife, String price, String manufactureYear, String description, Integer quantity) {
        this.id = id;
        this.category = category;
        this.brand = brand;
        this.name = name;
        this.image = image;
        this.material = material;
        this.powerRating = powerRating;
        this.operatingSystem = operatingSystem;
        this.storageCapacity = storageCapacity;
        this.batteryLife = batteryLife;
        this.price = price;
        this.manufactureYear = manufactureYear;
        this.description = description;
        this.quantity = quantity;
    }


    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public Brand getBrand() {
        return brand;
    }

    public void setBrand(Brand brand) {
        this.brand = brand;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public String getMaterial() {
        return material;
    }

    public void setMaterial(String material) {
        this.material = material;
    }

    public String getPowerRating() {
        return powerRating;
    }

    public void setPowerRating(String powerRating) {
        this.powerRating = powerRating;
    }

    public String getOperatingSystem() {
        return operatingSystem;
    }

    public void setOperatingSystem(String operatingSystem) {
        this.operatingSystem = operatingSystem;
    }

    public String getStorageCapacity() {
        return storageCapacity;
    }

    public void setStorageCapacity(String storageCapacity) {
        this.storageCapacity = storageCapacity;
    }

    public String getBatteryLife() {
        return batteryLife;
    }

    public void setBatteryLife(String batteryLife) {
        this.batteryLife = batteryLife;
    }

    public String getPrice() {
        return price;
    }

    public void setPrice(String price) {
        this.price = price;
    }

    public String getManufactureYear() {
        return manufactureYear;
    }

    public void setManufactureYear(String manufactureYear) {
        this.manufactureYear = manufactureYear;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public String getCpu() {
        return cpu;
    }

    public void setCpu(String cpu) {
        this.cpu = cpu;
    }

    public String getRam() {
        return ram;
    }

    public void setRam(String ram) {
        this.ram = ram;
    }

    public String getGpu() {
        return gpu;
    }

    public void setGpu(String gpu) {
        this.gpu = gpu;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
