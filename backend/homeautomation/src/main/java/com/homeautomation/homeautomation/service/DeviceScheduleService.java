
package com.homeautomation.homeautomation.service;

import com.homeautomation.homeautomation.dto.device.CreateDeviceScheduleRequest;
import com.homeautomation.homeautomation.dto.device.DeviceScheduleResponse;
import com.homeautomation.homeautomation.entity.Device;
import com.homeautomation.homeautomation.entity.DeviceSchedule;
import com.homeautomation.homeautomation.repository.DeviceRepository;
import com.homeautomation.homeautomation.repository.DeviceScheduleRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class DeviceScheduleService {

    private final DeviceRepository deviceRepository;
    private final DeviceScheduleRepository scheduleRepository;

    public DeviceScheduleService(
            DeviceRepository deviceRepository,
            DeviceScheduleRepository scheduleRepository
    ) {
        this.deviceRepository = deviceRepository;
        this.scheduleRepository = scheduleRepository;
    }

    // Create schedule
    @Transactional
    public DeviceScheduleResponse createSchedule(
            Long homeId,
            Long roomId,
            Long deviceId,
            CreateDeviceScheduleRequest request,
            String email
    ) {

        Device device = findUserDevice(
                homeId, roomId, deviceId, email
        );

        DeviceSchedule schedule = new DeviceSchedule();

        schedule.setName(request.name().trim());
        schedule.setDevice(device);
        schedule.setAction(request.action());
        schedule.setExecutionTime(request.executionTime());
        schedule.setDays(request.days());
        schedule.setEnabled(true);

        return DeviceScheduleResponse.from(
                scheduleRepository.save(schedule)
        );
    }

    // Get schedules for a device
    @Transactional(readOnly = true)
    public List<DeviceScheduleResponse> getDeviceSchedules(
            Long homeId,
            Long roomId,
            Long deviceId,
            String email
    ) {

        findUserDevice(homeId, roomId, deviceId, email);

        return scheduleRepository
                .findAllByDevice_IdAndDevice_Room_IdAndDevice_Room_Home_IdAndDevice_Room_Home_User_EmailOrderByExecutionTimeAsc(
                        deviceId, roomId, homeId, email
                )
                .stream()
                .map(DeviceScheduleResponse::from)
                .toList();
    }

    // Get all schedules for the logged-in user
    @Transactional(readOnly = true)
    public List<DeviceScheduleResponse> getMySchedules(String email) {

        return scheduleRepository
                .findAllByDevice_Room_Home_User_EmailOrderByExecutionTimeAsc(
                        email
                )
                .stream()
                .map(DeviceScheduleResponse::from)
                .toList();
    }

    // Enable or disable a schedule
    @Transactional
    public DeviceScheduleResponse setScheduleEnabled(
            Long scheduleId,
            boolean enabled,
            String email
    ) {

        DeviceSchedule schedule = scheduleRepository
                .findById(scheduleId)
                .filter(item ->
                        item.getDevice()
                                .getRoom()
                                .getHome()
                                .getUser()
                                .getEmail()
                                .equals(email)
                )
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Schedule not found"
                ));

        schedule.setEnabled(enabled);

        return DeviceScheduleResponse.from(schedule);
    }

    // Delete schedule
    @Transactional
    public void deleteSchedule(Long scheduleId, String email) {

        DeviceSchedule schedule = scheduleRepository
                .findById(scheduleId)
                .filter(item ->
                        item.getDevice()
                                .getRoom()
                                .getHome()
                                .getUser()
                                .getEmail()
                                .equals(email)
                )
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Schedule not found"
                ));

        scheduleRepository.delete(schedule);
    }

    // Verify device ownership
    private Device findUserDevice(
            Long homeId,
            Long roomId,
            Long deviceId,
            String email
    ) {

        return deviceRepository
                .findByIdAndRoom_IdAndRoom_Home_IdAndRoom_Home_User_Email(
                        deviceId, roomId, homeId, email
                )
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Device not found"
                ));
    }
}
