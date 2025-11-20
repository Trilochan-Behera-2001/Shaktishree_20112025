import apiClient from "../api/apiClient";
import { endpoints } from "../api/endpoints";

export const addlearningType = (data) => {
  return apiClient.post(endpoints.learningtype.addlearningtype, data);
};

export const getAlllearningTypes = () => {
  return apiClient.get(endpoints.learningtype.list);
};

export const editlearningType = (data) => {

  return apiClient.post(endpoints.learningtype.update, data);
};

export const statusLearningType = (data) => {
  return apiClient.post(endpoints.learningtype.learningstatus, data);
};

export const getaddlearndropdownandlist = () => {
  return apiClient.get(endpoints.addlearning.dropdownaddlearning);
};
export const saveaddlearning = (data) => {
  return apiClient.post(endpoints.addlearning.savelearning, data);
};

export const editaddlearning = (data) => {
  return apiClient.post(endpoints.addlearning.editaddlearning, data);
};

export const statusaddlearning = (data) => {
  return apiClient.post(endpoints.addlearning.statusaddlearn, data);
};

export const viewDocumentAdd = (data, config) => {
  return apiClient.get(endpoints.addlearning.viewDocuments, config);
};

