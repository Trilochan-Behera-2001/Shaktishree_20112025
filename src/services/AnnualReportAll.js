import apiClient from "../api/apiClient";
import { endpoints } from "../api/endpoints";

export const addAnnual = (data) => {
  return apiClient.post(endpoints.annualReportApi.saveAnnualReport, data);
};

export const getAnnualRepo = () => {
  return apiClient.get(endpoints.annualReportApi.getAnnualReport);
};