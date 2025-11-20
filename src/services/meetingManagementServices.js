import apiClient from "../api/apiClient";
import { endpoints } from "../api/endpoints";

export const getMeetingList = () => apiClient.get(endpoints.meetingManagement.getMeetingList)