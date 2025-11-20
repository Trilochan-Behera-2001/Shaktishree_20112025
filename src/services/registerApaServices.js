import apiClient from "../api/apiClient";
import { endpoints } from "../api/endpoints";

export const getOptions =()=>apiClient.get(endpoints.registerApa.options)
export const generateOTP =(data)=>apiClient.get(endpoints.registerApa.generateOTP,{params:{cipherText:data}})
export const verifyOtp =(data)=>apiClient.get(endpoints.registerApa.verifyOtp, {params:{cipherText:data}})
export const saveApaDetails =(data)=>apiClient.post(endpoints.registerApa.apaDetails,data)

export const getaparegisterlisttable =()=>apiClient.get(endpoints.registerApa.getApaList)
export const emailDuplichkApa = (data) => apiClient.get(endpoints.registerApa.emailCheck, { params: { email: data } })