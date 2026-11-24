
package com.homeautomation.homeautomation.entity;

import com.homeautomation.homeautomation.Enums.ControllerModel;
import com.homeautomation.homeautomation.Enums.ControllerStatus;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
    name = "hardware_controllers",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_controller_code",
            columnNames = "controller_code"
        )
    }
)
public class HardwareController {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(
        name = "controller_code",
        nullable = false,
        unique = true,
        updatable = false
    )
    private String controllerCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ControllerModel model;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ControllerStatus status = ControllerStatus.OFFLINE;

    @Column(nullable = false)
    private boolean simulated = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    public void onCreate() {
        if (controllerCode == null) {
            controllerCode = UUID.randomUUID().toString();
        }

        createdAt = Instant.now();
    }

    public HardwareController() {
    }

    // Getters and setters

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getControllerCode() {
        return controllerCode;
    }

    public ControllerModel getModel() {
        return model;
    }

    public void setModel(ControllerModel model) {
        this.model = model;
    }

    public ControllerStatus getStatus() {
        return status;
    }

    public void setStatus(ControllerStatus status) {
        this.status = status;
    }

    public boolean isSimulated() {
        return simulated;
    }

    public void setSimulated(boolean simulated) {
        this.simulated = simulated;
    }

    public Room getRoom() {
        return room;
    }

    public void setRoom(Room room) {
        this.room = room;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public int getTotalPorts() {
        return model.getTotalPorts();
    }
}
