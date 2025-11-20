import apiClient from "../api/apiClient";
import { endpoints } from "../api/endpoints";


export const getSpeakOutmsg = (data) => apiClient.get(endpoints.speakOutMsg.allSpeakOutMsg, { params: { shareCode: data } })