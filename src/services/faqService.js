import apiClient from "../api/apiClient"
import { endpoints } from "../api/endpoints"


// ! FAQ-TYPE

export const faqSave = (data) => apiClient.post(endpoints.faqType.faqTypeSave, data)
export const getAllFaqTypes = () => apiClient.get(endpoints.faqType.faqAll)
export const toggleFAQTypeStatus = (data) => apiClient.post(endpoints.faqType.statuschange, null, { params: { faqTypeCode: data } })
export const faqEdit = (data) => apiClient.get(endpoints.faqType.editFAQtype, {
    params: { faqTypeCode: data }
})


// ! FAQ-QUESTION-ANSWER

export const getAllFaq = () => apiClient.get(endpoints.faqQuestionAnswer.getFaQs)
export const toggleFAQStatus = (data) => apiClient.post(endpoints.faqQuestionAnswer.statusChange, null, { params: { questionAnswerCode: data } })
export const saveOrUpdateFaq = (formData) => apiClient.post(endpoints.faqQuestionAnswer.saveFaq, formData, {headers: {
    "Content-Type": "multipart/form-data", 
}},)
export const editFaqQuestion = (data) => apiClient.get(endpoints.faqQuestionAnswer.editFaqQuestion, { params: { questionAnswerCode: data } })



