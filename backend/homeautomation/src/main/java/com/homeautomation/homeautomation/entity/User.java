package com.homeautomation.homeautomation.entity;

import java.time.Instant;
import java.time.LocalDateTime;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import com.homeautomation.homeautomation.Enums.Role;

@Entity 
@Table(
    name = "app_users",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_app_users_email",
            columnNames = "email"
        )
    }
)
public class User {
@Id 
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

@Column(nullable = false, length = 100)
private String name;

@Column(nullable = false, length = 255)
private String email;

@Column(nullable = false)
private String password;
@Enumerated(EnumType.STRING)
@Column(nullable = false, length = 20)
private  Role role=Role.USER;

@Column(nullable =false, updatable=false)
    private Instant createdAt;


protected User() {
        // Required by JPA
}

public User(String name, String email, String password) {
    this.name = name;
    this.email = email;
    this.password = password;
}

@PrePersist
protected void onCreate() {
    if (createdAt == null) {
        createdAt = Instant.now();
    }

}

public Long getId() {
    return id;
}
// public void setId(Long id) {
//     this.id = id;
// }
public String getName() {
    return name;
}
public void setName(String name) {
    this.name = name;
}
public String getEmail() {
    return email;
}
public void setEmail(String email) {
    this.email = email;
}
public String getPassword() {
    return password;
}
public void setPassword(String password) {
    this.password = password;
}

public Role getRole(){
    return role;
}

public Instant getCreatedAt(){
    return  createdAt;
}



}
