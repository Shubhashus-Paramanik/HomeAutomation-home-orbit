
package com.homeautomation.homeautomation.service;

import com.homeautomation.homeautomation.dto.controller.CreateControllerRequest;
import com.homeautomation.homeautomation.dto.controller.UpdateControllerRequest;
import com.homeautomation.homeautomation.dto.controller.ControllerResponse;
import com.homeautomation.homeautomation.entity.HardwareController;
import com.homeautomation.homeautomation.entity.Room;
import com.homeautomation.homeautomation.repository.HardwareControllerRepository;
import com.homeautomation.homeautomation.repository.RoomRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.homeautomation.homeautomation.dto.controller.ControllerPortResponse;
import com.homeautomation.homeautomation.entity.Device;
import com.homeautomation.homeautomation.repository.DeviceRepository;

import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.List;

@Service
public class ControllerService {

    private final HardwareControllerRepository controllerRepository;
    private final RoomRepository roomRepository;
    private final DeviceRepository deviceRepository;
    public ControllerService(
            HardwareControllerRepository controllerRepository,
            RoomRepository roomRepository,
            DeviceRepository deviceRepository
    ) {
        this.controllerRepository = controllerRepository;
        this.roomRepository = roomRepository;
        this.deviceRepository = deviceRepository;
    }

    // 1. Register controller
    @Transactional
    public ControllerResponse createController(
            Long homeId,
            Long roomId,
            CreateControllerRequest request,
            String email
    ) {

        Room room = getRoom(homeId, roomId, email);

        if (controllerRepository.existsByRoom_IdAndNameIgnoreCase(
                roomId, request.name())) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "A controller with this name already exists in this room"
            );
        }

        HardwareController controller = new HardwareController();

        controller.setName(request.name().trim());
        controller.setModel(request.model());
        controller.setRoom(room);
        controller.setSimulated(true);

        HardwareController saved =
                controllerRepository.save(controller);

        return mapToResponse(saved);
    }

    // 2. Get all controllers in a room
    @Transactional(readOnly = true)
    public List<ControllerResponse> getControllers(
            Long homeId,
            Long roomId,
            String email
    ) {

        getRoom(homeId, roomId, email);

        return controllerRepository
                .findAllByRoom_IdAndRoom_Home_IdAndRoom_Home_User_EmailOrderByCreatedAtDesc(
                        roomId, homeId, email
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // 3. Get one controller
    @Transactional(readOnly = true)
    public ControllerResponse getController(
            Long homeId,
            Long roomId,
            Long controllerId,
            String email
    ) {

        HardwareController controller =
                getControllerEntity(homeId, roomId, controllerId, email);

        return mapToResponse(controller);
    }

    // 4. Update controller name
    @Transactional
    public ControllerResponse updateController(
            Long homeId,
            Long roomId,
            Long controllerId,
            UpdateControllerRequest request,
            String email
    ) {

        HardwareController controller =
                getControllerEntity(homeId, roomId, controllerId, email);

        if (controllerRepository
                .existsByRoom_IdAndNameIgnoreCaseAndIdNot(
                        roomId, request.name(), controllerId
                )) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Another controller already uses this name in this room"
            );
        }

        controller.setName(request.name().trim());

        return mapToResponse(controller);
    }

    // 5. Delete controller
    @Transactional
    public void deleteController(
            Long homeId,
            Long roomId,
            Long controllerId,
            String email
    ) {
// 1. Verify controller ownership
        HardwareController controller =
                getControllerEntity(homeId, roomId, controllerId, email);

// 2. Count devices assigned to this controller
    long assignedDeviceCount = deviceRepository.countByController_Id(controllerId);

 // 3. Prevent deletion if devices are still assigned
    if (assignedDeviceCount > 0) {

        throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Cannot delete this controller because "
                        + assignedDeviceCount
                        + " device(s) are still assigned to it. "
                        + "Reassign or delete those devices first."
        );
    }
        controllerRepository.delete(controller);
    }

    // Verify room ownership
    private Room getRoom(
            Long homeId,
            Long roomId,
            String email
    ) {

        return roomRepository
                .findByIdAndHome_IdAndHome_User_Email(
                        roomId, homeId, email
                )
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Room not found"
                ));
    }

    // Verify controller belongs to this room and user
    private HardwareController getControllerEntity(
            Long homeId,
            Long roomId,
            Long controllerId,
            String email
    ) {

        return controllerRepository
                .findByIdAndRoom_IdAndRoom_Home_IdAndRoom_Home_User_Email(
                        controllerId, roomId, homeId, email
                )
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Controller not found"
                ));
    }

    // Convert entity into response DTO
    private ControllerResponse mapToResponse(
            HardwareController controller
    ) {

        return new ControllerResponse(
                controller.getId(),
                controller.getName(),
                controller.getControllerCode(),
                controller.getModel(),
                controller.getStatus(),
                controller.isSimulated(),
                controller.getTotalPorts(),
                controller.getRoom().getId(),
                controller.getRoom().getName(),
                controller.getCreatedAt()
        );
    }

@Transactional(readOnly = true)
public List<ControllerPortResponse> getControllerPorts(
        Long homeId,
        Long roomId,
        Long controllerId,
        String email) {

    // 1. Verify controller belongs to this user's room
    HardwareController controller = getControllerEntity(
            homeId,
            roomId,
            controllerId,
            email
    );

    // 2. Get all devices assigned to this controller
    List<Device> devices = deviceRepository
            .findAllByController_IdOrderByPortNumberAsc(controllerId);

    // 3. Create a map using port number as the key
    Map<Integer, Device> assignedDevices = devices.stream()
            .filter(device -> device.getPortNumber() != null)
            .collect(Collectors.toMap(
                    Device::getPortNumber,
                    Function.identity()
            ));

    // 4. Generate every physical port
    int totalPorts = controller.getTotalPorts();

    return IntStream.rangeClosed(1, totalPorts)
            .mapToObj(portNumber -> {

                Device device = assignedDevices.get(portNumber);

                if (device == null) {
                    // Port is available
                    return new ControllerPortResponse(
                            portNumber,
                            true,
                            null,
                            null,
                            null
                    );
                }

                // Port is occupied
                return new ControllerPortResponse(
                        portNumber,
                        false,
                        device.getId(),
                        device.getName(),
                        device.getDeviceType()
                );
            })
            .toList();
}


}
