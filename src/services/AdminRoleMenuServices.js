import apiClient from "../api/apiClient";
import { endpoints } from "../api/endpoints";


export const adminrolelist = () => {
  return apiClient.get(endpoints.adminrolemenumap.getrolemenulist);
};

export const getAssignedMenu = (roleCode) => {
  return apiClient.get(`${endpoints.adminrolemenumap.getAssignedMenu}/${roleCode}`);
};

export const saveAdminRoleMenu = (data) => {
  return apiClient.post(endpoints.adminrolemenumap.assignRolemenusave, data);
};