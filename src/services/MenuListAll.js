import apiClient from "../api/apiClient";
import { endpoints } from "../api/endpoints";

export const getAllMenuList = () => {
  return apiClient.get(endpoints.menuListAll.list);
};