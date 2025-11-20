import apiClient from "../api/apiClient";
import { endpoints } from "../api/endpoints";



export const getDashboardCard = () => {
  return apiClient.get(endpoints.dashboardCard.list);
};
export const getregisteredUser = () => {
  return apiClient.get(endpoints.dashboardCard.registeredUserList);
};
export const getsafetyCheckin = () => {
  return apiClient.get(endpoints.dashboardCard.safetyCheckinsList);
};
export const getreportIncident = () => {
  return apiClient.get(endpoints.dashboardCard.reportIncidentList);
};
export const getspeakOutCirclePage = () => {
  return apiClient.get(endpoints.dashboardCard.speakOutCirclePageList);
};

export const getsosReport = () => {
  return apiClient.get(endpoints.dashboardCard.sosReportList);
};

export const getMonthWiseIncidentList = (data) => apiClient.get(endpoints.dashboardCard.monthWiseIncidentList, { params: { year: data } })

export const getchartTrainingList = (data) => apiClient.get(endpoints.dashboardCard.chartTrainingList, { params: { year: data } })

export const getTopFiveIncident = () => {
  return apiClient.get(endpoints.dashboardCard.topFiveIncident);
};

export const getbottomIncident = () => {
  return apiClient.get(endpoints.dashboardCard.bottomIncident);
};