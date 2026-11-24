
import api from "./api";

const scheduleService = {
  // Get all schedules belonging to the logged-in user
  getSchedules: async () => {
    const response = await api.get("/schedules");
    return response.data;
  },

  // Get schedules for one device
  getDeviceSchedules: async (homeId, roomId, deviceId) => {
    const response = await api.get(
      `/homes/${homeId}/rooms/${roomId}/devices/${deviceId}/schedules`
    );

    return response.data;
  },

  // Create a schedule for a device
  createSchedule: async (homeId, roomId, deviceId, scheduleData) => {
    const response = await api.post(
      `/homes/${homeId}/rooms/${roomId}/devices/${deviceId}/schedules`,
      scheduleData
    );

    return response.data;
  },

  // Enable or disable a schedule
  setEnabled: async (scheduleId, enabled) => {
    const response = await api.patch(
      `/schedules/${scheduleId}/enabled`,
      null,
      {
        params: { enabled },
      }
    );

    return response.data;
  },

  // Delete a schedule
  deleteSchedule: async (scheduleId) => {
    await api.delete(`/schedules/${scheduleId}`);
  },
};

export default scheduleService;
