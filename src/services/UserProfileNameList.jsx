import apiClient from "../api/apiClient";
import { endpoints } from "../api/apiEndpoints";

export const userProfileName = (data) => {
  return apiClient.get(endpoints.userProfilename.list, data);
};