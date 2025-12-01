// src/api/axiosInstance.js
import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000/api";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// 🔹 Request Interceptor — attach access token
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("access");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔹 Response Interceptor — auto-refresh on 401
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If unauthorized and refresh not already tried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh");
        if (!refreshToken) throw new Error("No refresh token found");

        // Get new access token
        const res = await axios.post(`${BASE_URL}/token/refresh/`, {
          refresh: refreshToken,
        });

        const newAccess = res.data.access;
        localStorage.setItem("access", newAccess);

        // Update header and retry
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("🔐 Token refresh failed:", refreshError);
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
