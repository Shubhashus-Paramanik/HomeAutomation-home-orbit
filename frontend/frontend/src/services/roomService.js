
import api from "./api";

const roomService = {
  // Get all rooms belonging to a home
  getRooms: async (homeId) => {
    const response = await api.get(`/homes/${homeId}/rooms`);
    return response.data;
  },

  // Create a room inside a home
  createRoom: async (homeId, roomData) => {
    const response = await api.post(
      `/homes/${homeId}/rooms`,
      roomData
    );

    return response.data;
  },

  // Get a particular room
  getRoom: async (homeId, roomId) => {
    const response = await api.get(
      `/homes/${homeId}/rooms/${roomId}`
    );

    return response.data;
  },

  // Update a room
  updateRoom: async (homeId, roomId, roomData) => {
    const response = await api.put(
      `/homes/${homeId}/rooms/${roomId}`,
      roomData
    );

    return response.data;
  },

  // Delete a room
  deleteRoom: async (homeId, roomId) => {
    await api.delete(`/homes/${homeId}/rooms/${roomId}`);
  },
};

export default roomService;
