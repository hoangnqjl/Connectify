package com.qhoang.connectify.entities;

import java.util.Date;

public class User {
    private String user_id, fullname, username, email, phonenumber, password, avatar;
    private Date birthday, created_at, updated_at;

    public User(String user_id, String fullname, String username, String email, String phonenumber, String password, Date birthday, Date created_at, Date updated_at, String avatar) {
        this.user_id = user_id;
        this.fullname = fullname;
        this.username = username;
        this.email = email;
        this.phonenumber = phonenumber;
        this.password = password;
        this.birthday = birthday;
        this.created_at = created_at;
        this.updated_at = updated_at;
        this.avatar = avatar;
    }

    public User(String user_id, String fullname, String username, String email, String phonenumber, String password, Date birthday) {
        this.user_id = user_id;
        this.fullname = fullname;
        this.username = username;
        this.email = email;
        this.phonenumber = phonenumber;
        this.password = password;
        this.birthday = birthday;
    }

    public User(String email, String password) {
        this.email = email;
        this.password = password;
    }

    public User() {

    }


    public String getUser_id() {
        return user_id;
    }

    public void setUser_id(String user_id) {
        this.user_id = user_id;
    }

    public String getFullname() {
        return fullname;
    }

    public void setFullname(String fullname) {
        this.fullname = fullname;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhonenumber() {
        return phonenumber;
    }

    public void setPhonenumber(String phonenumber) {
        this.phonenumber = phonenumber;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Date getBirthday() {
        return birthday;
    }

    public void setBirthday(Date birthday) {
        this.birthday = birthday;
    }

    public Date getCreated_at() {
        return created_at;
    }

    public void setCreated_at(Date created_at) {
        this.created_at = created_at;
    }

    public Date getUpdated_at() {
        return updated_at;
    }

    public void setUpdated_at(Date updated_at) {
        this.updated_at = updated_at;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }
}
