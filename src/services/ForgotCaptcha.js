import apiClient from "../api/apiClient";
import { endpoints } from "../api/endpoints";

export const forgotCaptcha = async() => {
 const res = await apiClient.get(endpoints.forgotCaptcha.list);
 const { captchaImage, captchaToken } = res.data.data; 
  return { captchaImage, captchaToken };
};

export const otpgeneratefn = async(data) => {
 const res = await apiClient.post(endpoints.forgotCaptcha.otpGenerate, (data));
 return res; 
};

export const updatePasswordFn = async(data) => {
 const res = await apiClient.post(endpoints.forgotCaptcha.updatePassword, (data));
 return res; 
};