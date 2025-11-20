import apiClient from "../api/apiClient";
import { endpoints } from "../api/endpoints";

export const saveCategorydata = (data) => {
  return apiClient.post(endpoints.commonCategory.saveDataCategory, data);
};

export const getCategoryTableList = () => {
  return apiClient.get(endpoints.commonCategory.getCategoryTableData);
};

export const editCategorydata= (data) => {
  return apiClient.post(endpoints.commonCategory.editCategorydata, data);
};

export const statusCategorydata = (encryptedPayload) => {
 
  return apiClient.post(endpoints.commonCategory.statusCategory, encryptedPayload);
};


// -------------------------------------------question paper-------------------------------------------------


export const questiondropdownandlist = () => {
  return apiClient.get(endpoints.addquestionpaper.questionpaperlist);
};

export const checkcategorylistpresent = (cipherText) => {
  return apiClient.get(`${endpoints.addquestionpaper.checkcategorypresent}?cipherText=${cipherText}`);
};

export const savequestionpaper = (data) => {
  return apiClient.post(endpoints.addquestionpaper.quationpapersave, data);
};


export const editquestionpaper = (data) => {
  return apiClient.post(endpoints.addquestionpaper.quationpaperedit, data);
};

