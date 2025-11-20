
import apiClient from "../api/apiClient";
import { endpoints } from "../api/endpoints";

export const knowledgeTypeSave = (data)=>apiClient.post(endpoints.knowledgeType.knowledgeTypeAdd,data) 
export const getDocType = ()=>apiClient.get(endpoints.knowledgeType.getDocType)
export const toggleDocTypeStatus =(data)=>apiClient.get(endpoints.knowledgeType.toggleDocTypeStatus,{params:{cipherText:data}})
export const updateDocType = (data)=> apiClient.get(endpoints.knowledgeType.updateDocType,{params:{cipherText:data}})


export const addKnowledgeOptions = ()=>apiClient.get(endpoints.addKnowledge.getDocument)
export const saveKnowledgeDoc = (data)=>apiClient.post(endpoints.addKnowledge.saveDocument,data)
export const editDoc = (data)=>apiClient.get(endpoints.addKnowledge.updateDoc,{params:{cipherText:data}})
export const changeDocStatus = (data)=>apiClient.get(endpoints.addKnowledge.changeDocStatus,{params:{cipherText: data}})