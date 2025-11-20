import axios from "axios";


const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, 
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthTokenFromCookie();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// let redirecting = false;
// function safeRedirect(path) {
//   if (!redirecting) {
//     redirecting = true;
//     window.location.href = path;
//   }
// }

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      console.log(error.response);
      
    }

    return Promise.reject(error);
  }
);

function getAuthTokenFromCookie() {
  const name = "jwtToken=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

export default apiClient;