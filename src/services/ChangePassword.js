import apiClient from "../api/apiClient";
import { endpoints } from "../api/endpoints";

export const ChangeCaptcha = async() => {
 const res = await apiClient.get(endpoints.changeCaptch.list);
  return res.data.data;
};

export const ChangePasswords = async(data) => {
 const res = await apiClient.post(endpoints.changeCaptch.add, (data));
 return res.data; // Return the actual data from the response
};