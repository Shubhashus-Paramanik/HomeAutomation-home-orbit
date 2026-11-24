package com.homeautomation.homeautomation.dto.home;
import java.time.Instant;
import com.homeautomation.homeautomation.entity.Home;

public class HomeResponse {

    private Long id;
    private String name;
    private String address;
    private String description;
    private Instant createdAt;

    public HomeResponse(
            Long id,
            String name,
            String address,
            String description,
            Instant createdAt) {

        this.id = id;
        this.name = name;
        this.address = address;
        this.description = description;
        this.createdAt = createdAt;
    }

    public static HomeResponse from(Home home) {
        return new HomeResponse(
                home.getId(),
                home.getName(),
                home.getAddress(),
                home.getDescription(),
                home.getCreatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getAddress() {
        return address;
    }

    public String getDescription() {
        return description;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
