
package com.homeautomation.homeautomation.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.homeautomation.homeautomation.dto.device.AssignDevicePortRequest;
import com.homeautomation.homeautomation.dto.device.CreateDeviceRequest;
import com.homeautomation.homeautomation.dto.device.UpdateDeviceRequest;
import com.homeautomation.homeautomation.dto.device.DeviceResponse;

import com.homeautomation.homeautomation.entity.Device;
import com.homeautomation.homeautomation.entity.Room;
import com.homeautomation.homeautomation.entity.HardwareController;

import com.homeautomation.homeautomation.repository.DeviceRepository;
import com.homeautomation.homeautomation.repository.RoomRepository;
import com.homeautomation.homeautomation.repository.HardwareControllerRepository;
import com.homeautomation.homeautomation.Enums.DevicePowerState;

@Service
public class DeviceService {

    private final DeviceRepository deviceRepository;
    private final RoomRepository roomRepository;
    private final HardwareControllerRepository controllerRepository;

    public DeviceService(
            DeviceRepository deviceRepository,
            RoomRepository roomRepository,
            HardwareControllerRepository controllerRepository) {

        this.deviceRepository = deviceRepository;
        this.roomRepository = roomRepository;
        this.controllerRepository = controllerRepository;
    }

    // 1. Register Device
    @Transactional
    public DeviceResponse createDevice(
            Long homeId,
            Long roomId,
            CreateDeviceRequest request,
            String email) {

        // Verify room ownership
        Room room = findUserRoom(homeId, roomId, email);

        String deviceName = request.getName().trim();

        // Prevent duplicate device names inside one room
        if (deviceRepository.existsByRoom_IdAndNameIgnoreCase(
                roomId, deviceName)) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "A device with this name already exists in this room"
            );
        }

        // Find controller belonging to this exact room and user
        HardwareController controller = controllerRepository
                .findByIdAndRoom_IdAndRoom_Home_IdAndRoom_Home_User_Email(
                        request.getControllerId(),
                        roomId,
                        homeId,
                        email
                )
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Controller not found in this room"
                ));

        // Validate port range according to controller model
        int totalPorts = controller.getTotalPorts();

        if (request.getPortNumber() > totalPorts) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid port number. This controller supports ports 1 to "
                            + totalPorts
            );
        }

        // Check whether requested port is already occupied
        if (deviceRepository.existsByController_IdAndPortNumber(
                controller.getId(),
                request.getPortNumber())) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This controller port is already assigned to another device"
            );
        }

        // Create device
        Device device = new Device(
                deviceName,
                request.getDeviceType(),
                request.getDescription(),
                room
        );

        // Assign controller and physical port
        device.setController(controller);
        device.setPortNumber(request.getPortNumber());

        Device savedDevice = deviceRepository.save(device);

        return DeviceResponse.from(savedDevice);
    }

    // 2. Get all devices of a room
    @Transactional(readOnly = true)
    public List<DeviceResponse> getDevices(
            Long homeId,
            Long roomId,
            String email) {

        findUserRoom(homeId, roomId, email);

        return deviceRepository
                .findAllByRoom_IdAndRoom_Home_IdAndRoom_Home_User_EmailOrderByCreatedAtDesc(
                        roomId, homeId, email)
                .stream()
                .map(DeviceResponse::from)
                .toList();
    }

    // 3. Get a particular device
    @Transactional(readOnly = true)
    public DeviceResponse getDeviceById(
            Long homeId,
            Long roomId,
            Long deviceId,
            String email) {

        Device device = findUserDevice(
                homeId, roomId, deviceId, email
        );

        return DeviceResponse.from(device);
    }

    // 4. Update Device
    @Transactional
    public DeviceResponse updateDevice(
            Long homeId,
            Long roomId,
            Long deviceId,
            UpdateDeviceRequest request,
            String email) {

        Device device = findUserDevice(
                homeId, roomId, deviceId, email
        );

        String deviceName = request.getName().trim();

        if (!device.getName().equalsIgnoreCase(deviceName)
                && deviceRepository.existsByRoom_IdAndNameIgnoreCaseAndIdNot(
                        roomId, deviceName, deviceId)) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "A device with this name already exists in this room"
            );
        }

        device.setName(deviceName);
        device.setDeviceType(request.getDeviceType());
        device.setDescription(request.getDescription());

        Device updatedDevice = deviceRepository.save(device);

        return DeviceResponse.from(updatedDevice);
    }

    // 5. Delete Device
    @Transactional
    public void deleteDevice(
            Long homeId,
            Long roomId,
            Long deviceId,
            String email) {

        Device device = findUserDevice(
                homeId, roomId, deviceId, email
        );

        // Deleting the device also releases its assigned port
        deviceRepository.delete(device);
    }

    // Verify that room belongs to authenticated user
    private Room findUserRoom(
            Long homeId,
            Long roomId,
            String email) {

        return roomRepository
                .findByIdAndHome_IdAndHome_User_Email(
                        roomId, homeId, email)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Room not found"
                        )
                );
    }

    // Verify device ownership
    private Device findUserDevice(
            Long homeId,
            Long roomId,
            Long deviceId,
            String email) {

        return deviceRepository
                .findByIdAndRoom_IdAndRoom_Home_IdAndRoom_Home_User_Email(
                        deviceId, roomId, homeId, email)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Device not found"
                        )
                );
    }


@Transactional
public DeviceResponse assignDevicePort(
        Long homeId,
        Long roomId,
        Long deviceId,
        AssignDevicePortRequest request,
        String email) {

    // 1. Verify device belongs to the authenticated user's room
    Device device = findUserDevice(
            homeId, roomId, deviceId, email
    );

    // 2. Find the new controller and verify room ownership
    HardwareController controller = controllerRepository
            .findByIdAndRoom_IdAndRoom_Home_IdAndRoom_Home_User_Email(
                    request.getControllerId(),
                    roomId,
                    homeId,
                    email
            )
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Controller not found in this room"
            ));

    // 3. Validate port number
    int totalPorts = controller.getTotalPorts();

    if (request.getPortNumber() > totalPorts) {
        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Invalid port number. This controller supports ports 1 to "
                        + totalPorts
        );
    }

    // 4. Check whether another device occupies this port
    boolean portOccupied =
            deviceRepository.existsByController_IdAndPortNumberAndIdNot(
                    controller.getId(),
                    request.getPortNumber(),
                    deviceId
            );

    if (portOccupied) {
        throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "This controller port is already assigned to another device"
        );
    }

    // 5. Assign the new controller and port
    device.setController(controller);
    device.setPortNumber(request.getPortNumber());

    // 6. Save changes
    Device updatedDevice = deviceRepository.save(device);

    return DeviceResponse.from(updatedDevice);
}


@Transactional
public DeviceResponse turnOnDevice(
        Long homeId,
        Long roomId,
        Long deviceId,
        String email) {

    Device device = findUserDevice(
            homeId, roomId, deviceId, email
    );

    device.setPowerState(DevicePowerState.ON);

    Device updatedDevice = deviceRepository.save(device);

    return DeviceResponse.from(updatedDevice);
}

@Transactional
public DeviceResponse turnOffDevice(
        Long homeId,
        Long roomId,
        Long deviceId,
        String email) {

    Device device = findUserDevice(
            homeId, roomId, deviceId, email
    );

    device.setPowerState(DevicePowerState.OFF);

    Device updatedDevice = deviceRepository.save(device);

    return DeviceResponse.from(updatedDevice);
}

}
