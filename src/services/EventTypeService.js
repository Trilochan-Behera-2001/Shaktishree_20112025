import apiClient from "../api/apiClient";
import { endpoints } from "../api/endpoints";
import { encryptPayload } from "../crypto/encryption";

export const addEventType = (data) => {

  return apiClient.post(endpoints.addeventtype.add, data);
};

export const getAllEventTypes = () => {
  return apiClient.get(endpoints.addeventtype.list);
};

export const editEventType = (data) => {
  return apiClient.post(endpoints.addeventtype.update, data);
};

export const statusEventType = (encryptedPayload) => {
 
  return apiClient.post(endpoints.addeventtype.eventstatustype, encryptedPayload);
};


export const getdropdownevent = () => {
  return apiClient.get(endpoints.addevent.dropdowneventtype);
};

export const addeventsavedata = (formData) => {
  return apiClient.post(endpoints.addevent.saveevent, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const geteventlist = () => {
  return apiClient.get(endpoints.addevent.eventlist);
};

export const updateeventlist = (eventId) => {

  const encryptedId = encodeURIComponent(encryptPayload(eventId.toString()));

  return apiClient.get(`${endpoints.addevent.eventupdate}?eventId=${encryptedId}`);
};


export const eventstatus = (data) => {
  return apiClient.post(endpoints.addevent.eventstatus, data);
};


export const viewaddeventimage = (moduleName, filePath) => {
  return apiClient.get(
    `${endpoints.addevent.viewimage}?moduleName=${encodeURIComponent(moduleName)}&filePath=${encodeURIComponent(filePath)}`,
    { responseType: "blob" }
  );
};

export const geteventregiDetails = () => {
  return apiClient.get(endpoints.addeventtype.eventregiDetails);
};



