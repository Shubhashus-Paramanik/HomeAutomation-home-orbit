
import api from "./api";

const homeService = {
  getHomes: async () => {
    const response = await api.get("/homes");
    return response.data;
  },

  getHome: async (homeId) => {
    const response = await api.get(`/homes/${homeId}`);
    return response.data;
  },

  createHome: async (homeData) => {
    const response = await api.post("/homes", homeData);
    return response.data;
  },

  updateHome: async (homeId, homeData) => {
    const response = await api.put(`/homes/${homeId}`, homeData);
    return response.data;
  },

  deleteHome: async (homeId) => {
    await api.delete(`/homes/${homeId}`);
  },
};

export default homeService;
