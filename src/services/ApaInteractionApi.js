import apiClient from "../api/apiClient";
import { endpoints } from "../api/endpoints";

export const addapaInteraction = (data) => apiClient.post(endpoints.apaInteraction.add, data, {headers: {
    "Content-Type": "multipart/form-data", 
}},)

export const getapaInteraction = () => {
  return apiClient.get(endpoints.apaInteraction.list);
};

export const getTableapaInteraction = () => {
  return apiClient.get(endpoints.apaInteraction.apatableList);
};