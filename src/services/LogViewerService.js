import apiClient from "../api/apiClient";
import { endpoints } from "../api/endpoints";


export const getlogviewerlist = () => {
  return apiClient.get(endpoints.logViewer.logviewerlist);
};

export const getcatloglist = () => {
  return apiClient.get(endpoints.logViewer.catlogviewerlist);
};

export const downloadlog = () => {
  return apiClient.get(endpoints.logViewer.downlodeLog, {
    responseType: "blob", 
  });
};

export const downloadcatlog = () => {
  return apiClient.get(endpoints.logViewer.downlodcatlog, {
    responseType: "blob", 
  });
};
