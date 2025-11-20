import { removeJwtToken } from "./cookieUtils";

// Function to clear auth data
export function clearAuthData() {
  // Clear cookies
  removeJwtToken();
}