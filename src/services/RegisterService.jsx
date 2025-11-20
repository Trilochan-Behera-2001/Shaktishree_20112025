import apiClient from "../api/apiClient";
import { endpoints } from "../api/endpoints";

export const userRegi = (data) => {
  return apiClient.post(endpoints.userCreate.add, data);
};

export const memberListAll = async() => {
  try {
    const res = await apiClient.get(endpoints.userCreate.memberList);
    return res.data.data;
  } catch (error) {
    console.error("Error in memberListAll:", error);
    throw error;
  }
};

export const staffDetailsAdd = (data) => {
  return  apiClient.post(endpoints.userCreate.staffDetails, data);
};

export const userGenderListAll = async() => {
  const res =await apiClient.get(endpoints.userCreate.userGenderList);
  return res.data.data;
};

export const memberNameSend = (data) => apiClient.get(endpoints.userCreate.memberNameCheck, { params: { memberName: data } })
export const adharNumberDuplichk = (data) => apiClient.get(endpoints.userCreate.adharCheck, { params: { aadharNumber: data } })
export const emailDuplichk = (data) => apiClient.get(endpoints.userCreate.emailCheck, { params: { email: data } })