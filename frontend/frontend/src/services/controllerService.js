
import api from "./api";

const controllerService = {
  // Get all controllers in a room
  getControllers: async (homeId, roomId) => {
    const response = await api.get(
      `/homes/${homeId}/rooms/${roomId}/controllers`
    );

    return response.data;
  },

  // Register a controller
  createController: async (homeId, roomId, controllerData) => {
    const response = await api.post(
      `/homes/${homeId}/rooms/${roomId}/controllers`,
      controllerData
    );

    return response.data;
  },

  // Get a particular controller
  getController: async (homeId, roomId, controllerId) => {
    const response = await api.get(
      `/homes/${homeId}/rooms/${roomId}/controllers/${controllerId}`
    );

    return response.data;
  },

  // Get all eight ports of a controller
  getControllerPorts: async (homeId, roomId, controllerId) => {
    const response = await api.get(
      `/homes/${homeId}/rooms/${roomId}/controllers/${controllerId}/ports`
    );

    return response.data;
  },

  // Update controller
  updateController: async (
    homeId,
    roomId,
    controllerId,
    controllerData
  ) => {
    const response = await api.put(
      `/homes/${homeId}/rooms/${roomId}/controllers/${controllerId}`,
      controllerData
    );

    return response.data;
  },

  // Delete controller
  deleteController: async (homeId, roomId, controllerId) => {
    await api.delete(
      `/homes/${homeId}/rooms/${roomId}/controllers/${controllerId}`
    );
  },
};

export default controllerService;
