import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { isTokenValid } from "../../utils/authUtils";
import { getJwtToken } from "../../utils/cookieUtils";
import { clearAuthData } from "../../utils/authHelpers";

const ProtectedRoute = () => {
  const token = useSelector((state) => state.auth.token);
  
  // Check if user is authenticated with a valid token
  // First check Redux token, then check cookie
  let isAuthenticated = token && isTokenValid(token);
  
  // If not authenticated via Redux, check cookie
  if (!isAuthenticated) {
    const cookieToken = getJwtToken();
    isAuthenticated = cookieToken && isTokenValid(cookieToken);
  }
  
  // If token exists but is invalid, clear auth data
  if (token && !isTokenValid(token)) {
    clearAuthData();
  }
  
  if (getJwtToken() && !isTokenValid(getJwtToken())) {
    clearAuthData();
  }
  
  // Redirect to login if not authenticated, otherwise render children
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;