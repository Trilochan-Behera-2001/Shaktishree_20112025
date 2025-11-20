import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { store } from "./redux/store";
import AppRoutes from "./routes/AppRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { isTokenValid } from "./utils/authUtils";
import { logoutUser } from "./redux/slices/authSlice";
import FrameGuard from "./hooks/FrameGuard";
// import './App.css';

// Function to get token from cookie
function getAuthTokenFromCookie() {
  const name = "jwtToken=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

const queryClient = new QueryClient();

function App() {
  return (
    <Provider store={store}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter >
            <TokenValidationHandler />
            <ToastContainer
              position="top-right"
              autoClose={2000}
              toastStyle={{ zIndex: 9999 }}
            />
            <FrameGuard>
              <AppRoutes />
            </FrameGuard>
          </BrowserRouter>
        </QueryClientProvider>
      </LocalizationProvider>
    </Provider>
  );
}

// Component to handle token validation on app initialization
const TokenValidationHandler = () => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    // Check for token in cookie if not in Redux store
    if (!token) {
      const cookieToken = getAuthTokenFromCookie();
      if (cookieToken && isTokenValid(cookieToken)) {
        // Token is valid, we could dispatch an action to set it in Redux if needed
        // For now, we'll let the API client handle it via the cookie
      } else if (cookieToken) {
        // Token exists but is invalid, remove it
        document.cookie =
          "jwtToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        dispatch(logoutUser());
      }
    }

    const handleStorageChange = (event) => {
      if (event.key === "isLoggedIn" && event.newValue === "false") {
        dispatch(logoutUser());
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [dispatch, token]);

  return null;
};

export default App;
