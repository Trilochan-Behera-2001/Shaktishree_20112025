import apiClient from "../api/apiClient";
import { endpoints } from "../api/endpoints";


export const reportincedentgetlist = () => {
  return apiClient.get(endpoints.reportIncedentList.getreportIncedent);
};

export const viewdetailsprofileget = (encryptedData) => {
 
  const encodedCipherText = encodeURIComponent(encryptedData);
  
  return apiClient.get(`${endpoints.reportIncedentList.viewdetailsprofile}?cipherText=${encodedCipherText}`);
};


export const viewVideoAndAudio = (payload) => {
  return apiClient.get(endpoints.reportIncedentList.viewvideoandaudio, {
    params: payload,
    responseType: 'blob'
  });
};
export const modelapprovedatasaveed = (encryptedPayload, attachedFile) => {
  const formData = new FormData();
  formData.append("uploadFile", attachedFile);

  return apiClient.post(
    `${endpoints.reportIncedentList.modelapprovedatasave}?cipherText=${encodeURIComponent(encryptedPayload)}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};
