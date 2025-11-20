import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  logAuth,
  loginCap,
  logoutAuth,
} from "../../services/AuthService";
import { isTokenValid } from "../../utils/authUtils";
import { getJwtToken } from "../../utils/cookieUtils";

console.log("token", getJwtToken);


function setAuthTokenInCookie(token) {
  const expirationSeconds = 3600;
  const date = new Date();
  date.setTime(date.getTime() + (expirationSeconds * 1000));
  const expires = "expires=" + date.toUTCString();
  document.cookie = "jwtToken=" + token + ";" + expires + ";path=/";
}

function removeAuthTokenFromCookie() {
  document.cookie = "jwtToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

const MIN_LOADING_TIME = 500;

const withMinimumLoadingTime = (asyncOperation) => {
  return async (...args) => {
    const startTime = Date.now();
    const result = await asyncOperation(...args);
    const elapsed = Date.now() - startTime;
    
    if (elapsed < MIN_LOADING_TIME) {
      await new Promise(resolve => setTimeout(resolve, MIN_LOADING_TIME - elapsed));
    }
    
    return result;
  };
};

// 🔹 Fetch Captcha
export const fetchCaptcha = createAsyncThunk(
  "auth/fetchCaptcha",
  withMinimumLoadingTime(async (_, { rejectWithValue }) => {
    try {
      const res = await loginCap();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to load captcha");
    }
  })
);

// 🔹 Login User
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  withMinimumLoadingTime(async (encryptedPayload, { rejectWithValue }) => {
    try {
      const res = await logAuth(encryptedPayload);
      
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Login failed");
    }
  })
);

// 🔹 Logout User
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  withMinimumLoadingTime(async (_, { rejectWithValue }) => {
    try {
      const res = await logoutAuth();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Logout failed");
    }
  })
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: null, 
    user: null,
    menu: [],
    captchaId: null,
    captchaImage: null,
    loading: false,
    error: null,
  },
  reducers: {
    // Action to clear auth state when token expires
    clearAuthState: (state) => {
      state.token = null;
      state.user = null;
      state.menu = [];
      removeAuthTokenFromCookie();
    },
    // Action to check and update token validity
    checkTokenValidity: (state) => {
      if (state.token && !isTokenValid(state.token)) {
        state.token = null;
        state.user = null;
        state.menu = [];
        removeAuthTokenFromCookie();
      }
    }
  },
  extraReducers: (builder) => {
    // 🔹 Captcha
    builder
      .addCase(fetchCaptcha.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCaptcha.fulfilled, (state, action) => {
        state.loading = false;
        // state.captchaId = action.payload.captchaId;
        state.captchaImage = action.payload.captchaImage;
        state.captchaToken = action.payload.captchaToken;
      })
      .addCase(fetchCaptcha.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // 🔹 Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.outcome === true && action.payload.data) {
          state.token = action.payload.data.token || action.payload.data;
          state.user = action.payload.data.user;
          state.menu = action.payload.data.menu || [];
          // Store token in cookie
          if (state.token) {
            setAuthTokenInCookie(state.token);
          }
        } else if (action.payload && action.payload.token) {
          
          state.token = action.payload.token;
          state.user = action.payload.user;
          state.menu = action.payload.menu || [];
          
          if (state.token) {
            setAuthTokenInCookie(state.token);
          }
        } else if (action.payload && action.payload.outcome === false) {
         
          state.token = null;
          state.user = null;
          state.menu = [];
          
          removeAuthTokenFromCookie();
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
       
        state.token = null;
        state.user = null;
        state.menu = [];
        
      });

    // 🔹 Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.token = null;
        state.user = null;
        state.menu = [];
        state.captchaId = null;
        state.captchaImage = null;
        
        removeAuthTokenFromCookie();
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.token = null;
        state.user = null;
        state.menu = [];
        
        removeAuthTokenFromCookie();
      });
  },
});

export const { clearAuthState, checkTokenValidity } = authSlice.actions;
export default authSlice.reducer;