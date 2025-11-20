import apiClient from "../api/apiClient";
import { endpoints } from "../api/endpoints";

export const logAuth = (data) => {
  return apiClient.post(endpoints.authtype.login, data);
};

export const logoutAuth = (data) => {
  return apiClient.post(endpoints.authtype.logout, data);
};

export const loginCap = () => {
  return apiClient.get(endpoints.authtype.getCaptcha);
};

export const userProfileName = () => {
  return apiClient.get(endpoints.authtype.userProfile);
};