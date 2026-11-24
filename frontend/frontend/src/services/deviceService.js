
import api from "./api";

const deviceService = {
  // Get all devices in a room
  getDevices: async (homeId, roomId) => {
    const response = await api.get(
      `/homes/${homeId}/rooms/${roomId}/devices`
    );
    return response.data;
  },

  // Register a device and assign its controller port
  createDevice: async (homeId, roomId, deviceData) => {
    const response = await api.post(
      `/homes/${homeId}/rooms/${roomId}/devices`,
      deviceData
    );
    return response.data;
  },

  // Get one device
  getDevice: async (homeId, roomId, deviceId) => {
    const response = await api.get(
      `/homes/${homeId}/rooms/${roomId}/devices/${deviceId}`
    );
    return response.data;
  },

  // Update device details
  updateDevice: async (homeId, roomId, deviceId, deviceData) => {
    const response = await api.put(
      `/homes/${homeId}/rooms/${roomId}/devices/${deviceId}`,
      deviceData
    );
    return response.data;
  },

  // Delete device
  deleteDevice: async (homeId, roomId, deviceId) => {
    await api.delete(
      `/homes/${homeId}/rooms/${roomId}/devices/${deviceId}`
    );
  },

  // Assign or reassign controller port
  assignPort: async (homeId, roomId, deviceId, assignment) => {
    const response = await api.put(
      `/homes/${homeId}/rooms/${roomId}/devices/${deviceId}/assign-port`,
      assignment
    );
    return response.data;
  },

  // Turn device ON
  turnOn: async (homeId, roomId, deviceId) => {
    const response = await api.post(
      `/homes/${homeId}/rooms/${roomId}/devices/${deviceId}/turn-on`
    );
    return response.data;
  },

  // Turn device OFF
  turnOff: async (homeId, roomId, deviceId) => {
    const response = await api.post(
      `/homes/${homeId}/rooms/${roomId}/devices/${deviceId}/turn-off`
    );
    return response.data;
  },
};

export default deviceService;
