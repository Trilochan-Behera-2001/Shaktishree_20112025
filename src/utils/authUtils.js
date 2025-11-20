import { jwtDecode } from "jwt-decode";

export const isTokenValid = (token) => {
  if (!token) return false;
  
  try {
    const decoded = jwtDecode(token);
    
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (error) {
   
    console.error("Token validation error:", error.message);
    return false;
  }
};

export const getUserFromToken = (token) => {
  if (!token) return null;
  
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error("Token decode error:", error.message); 
    return null;
  }
};