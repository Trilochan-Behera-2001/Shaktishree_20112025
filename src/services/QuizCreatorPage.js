import apiClient from "../api/apiClient";
import { endpoints } from "../api/endpoints";
import { encryptPayload } from "../crypto/encryption"; // Import encryptPayload

export const getquizCreatorAll = () => {
  return apiClient.get(endpoints.quizCreatorAll.listFiled);
};


export const quizListIdSend = (data) => {
  return apiClient.get(endpoints.quizCreatorAll.quizListSelect, {
    params: { cipherText: data }
  });
};

export const getFilterSubmit = (encryptedIds) => {
  const params = new URLSearchParams();
  if (encryptedIds && encryptedIds.length > 0) {
    encryptedIds.forEach(id => params.append('category', id));
  }

  return apiClient.get(`${endpoints.quizCreatorAll.filterSubmit}?${params.toString()}`);
};

export const quizCreatorSave = (data) => apiClient.post(endpoints.quizCreatorAll.saveQuizCreator, data)
export const quizCreatorEdit = (data) => apiClient.post(endpoints.quizCreatorAll.editListFiled, data)
export const quizCreatorStatusChange = (quizId, status) => {
  // Encrypt both the quizId and status values
  const encryptedQuizId = encryptPayload(quizId.toString());
  const encryptedStatus = encryptPayload(status.toString());
  
  // Send encrypted values as query parameters
  return apiClient.get(endpoints.quizCreatorAll.statusChange, {
    params: { 
      quizId: encryptedQuizId, 
      status: encryptedStatus 
    }
  });
}