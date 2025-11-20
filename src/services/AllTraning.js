import apiClient from "../api/apiClient";
import { endpoints } from "../api/endpoints";

export const addvcTraning = (data) => {
  return apiClient.post(endpoints.allTraining.add, data);
};

export const getAllTraning = () => {
  return apiClient.get(endpoints.allTraining.list);
};