import apiClient from "../api/apiClient";

// CMS Landing Page APIs
export const cmsService = {
  // Get landing page data
  getLandingPageData: async () => {
    try {
      const response = await apiClient.get("/cms/landing-page");
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch landing page data: " + error.message);
    }
  },

  // Update landing page data
  updateLandingPageData: async (data) => {
    try {
      const response = await apiClient.put("/cms/landing-page", data);
      return response.data;
    } catch (error) {
      throw new Error("Failed to update landing page data: " + error.message);
    }
  },

  // Create landing page data
  createLandingPageData: async (data) => {
    try {
      const response = await apiClient.post("/cms/landing-page", data);
      return response.data;
    } catch (error) {
      throw new Error("Failed to create landing page data: " + error.message);
    }
  },

  // Delete landing page data
  deleteLandingPageData: async (id) => {
    try {
      const response = await apiClient.delete(`/cms/landing-page/${id}`);
      return response.data;
    } catch (error) {
      throw new Error("Failed to delete landing page data: " + error.message);
    }
  },
};

export default cmsService;