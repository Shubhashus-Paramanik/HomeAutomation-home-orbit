package com.homeautomation.homeautomation.entity;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.*;

import com.homeautomation.homeautomation.Enums.DeviceType;
import com.homeautomation.homeautomation.Enums.DeviceConnectionStatus;
import com.homeautomation.homeautomation.entity.HardwareController;
import com.homeautomation.homeautomation.Enums.DevicePowerState;

@Entity
@Table(
    name = "devices",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_devices_room_name",
            columnNames = {"room_id", "name"}
        ),
        @UniqueConstraint(
            name = "uk_controller_port",
            columnNames = {"controller_id", "port_number"}
        )
    }
)
public class Device {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Device display name
    @Column(nullable = false, length = 100)
    private String name;

    // Unique identifier for the device
    @Column(
        nullable = false,
        unique = true,
        updatable = false,
        length = 36
    )
    private String deviceCode;

    // Device category
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private DeviceType deviceType;

    // Device connection status
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DeviceConnectionStatus connectionStatus =
            DeviceConnectionStatus.OFFLINE;

    @Column(length = 500)
    private String description;

    // True means this is currently a simulated device
    @Column(nullable = false)
    private boolean simulated = true;

    // Device belongs to one room
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "controller_id")
    private HardwareController controller;
    
    @Column(name = "port_number")
    private Integer portNumber;

    @Enumerated(EnumType.STRING)
@Column(name = "power_state", nullable = false)
private DevicePowerState powerState = DevicePowerState.OFF;

    protected Device() {
        // Required by JPA
    }

    public Device(
            String name,
            DeviceType deviceType,
            String description,
            Room room) {

        this.name = name;
        this.deviceType = deviceType;
        this.description = description;
        this.room = room;
        this.simulated = true;
        this.connectionStatus = DeviceConnectionStatus.OFFLINE;
    }

    @PrePersist
    protected void onCreate() {

        if (createdAt == null) {
            createdAt = Instant.now();
        }

        if (deviceCode == null) {
            deviceCode = UUID.randomUUID().toString();
        }
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDeviceCode() {
        return deviceCode;
    }

    public DeviceType getDeviceType() {
        return deviceType;
    }

    public void setDeviceType(DeviceType deviceType) {
        this.deviceType = deviceType;
    }

    public DeviceConnectionStatus getConnectionStatus() {
        return connectionStatus;
    }

    public void setConnectionStatus(
            DeviceConnectionStatus connectionStatus) {
        this.connectionStatus = connectionStatus;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isSimulated() {
        return simulated;
    }

    public Room getRoom() {
        return room;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public HardwareController getController() {
    return controller;
}

public void setController(HardwareController controller) {
    this.controller = controller;
}

public Integer getPortNumber() {
    return portNumber;
}

public void setPortNumber(Integer portNumber) {
    this.portNumber = portNumber;
}

public DevicePowerState getPowerState() {
    return powerState;
}

public void setPowerState(DevicePowerState powerState) {
    this.powerState = powerState;
}
}
