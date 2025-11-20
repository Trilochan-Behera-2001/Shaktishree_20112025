import apiClient from "../api/apiClient"
import { endpoints } from "../api/endpoints"

export const registeredUsers = ()=>apiClient.get(endpoints.administration.registeredUsers)
export const incidentReports = ()=>apiClient.get(endpoints.administration.incidentReports)
export const safetyCheckins = ()=>apiClient.get(endpoints.administration.safetyCheckins)
export const shaktiRaKahani =()=>apiClient.get(endpoints.administration.shaktiKahani)