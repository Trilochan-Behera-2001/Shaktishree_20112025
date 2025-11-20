import apiClient from "../api/apiClient";
import { endpoints } from "../api/endpoints";

export const saveQuizMasterdata = (formData) => {
  return apiClient.post(endpoints.quizMaster.saveQuizMaster, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};


export const getQuizMasterTableList = () => {
  return apiClient.get(endpoints.quizMaster.tableListQuizmasterData);
};

export const editQuizMasterdata= (data) => {
  return apiClient.post(endpoints.quizMaster.editQuizMaster, data);
};

export const statusQuizMasterdata = (encryptedPayload) => {
 
  return apiClient.post(endpoints.quizMaster.statusQuizMaster, encryptedPayload);
};
