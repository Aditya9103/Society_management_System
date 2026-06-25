import axios from 'axios';
import { setCredentials, logout } from '../slices/authSlice';

// Standard Axios instance
export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject token if we have one
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Enhanced setup function to inject Redux dispatch safely into the response interceptor.
 * This completely prevents circular dependency build loops.
 */
export const setupResponseInterceptor = (dispatch) => {
  // Clear any existing interceptors to prevent duplicate attachments
  axiosInstance.interceptors.response.handlers = [];

  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Catch 401 Unauthorized errors (excluding the refresh endpoint itself to prevent loops)
      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        !originalRequest.url?.includes('/auth/refresh')
      ) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers['Authorization'] = 'Bearer ' + token;
              return axiosInstance(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          dispatch(logout()); // Clean Redux + LocalStorage
          window.location.href = '/login';
          return Promise.reject(error);
        }

        try {
          const { data } = await axios.post(
            `${import.meta.env.VITE_API_URL}/auth/refresh`,
            { refreshToken }
          );

          // The backend returns new tokens inside data.data
          const newAccessToken = data?.data?.accessToken;
          const newRefreshToken = data?.data?.refreshToken;

          if (newAccessToken) {
            localStorage.setItem('accessToken', newAccessToken);
            if (newRefreshToken) {
              localStorage.setItem('refreshToken', newRefreshToken);
            }

            // Parse safe user fallback if missing
            let currentUser = null;
            try {
              const localUser = localStorage.getItem('user');
              if (localUser && localUser !== 'undefined') {
                currentUser = JSON.parse(localUser);
              }
            } catch (e) {
              console.error(e);
            }

            // Sync the fresh tokens back to Redux state instantly
            dispatch(
              setCredentials({
                user: currentUser,
                accessToken: newAccessToken,
                refreshToken: newRefreshToken || refreshToken,
              })
            );

            axiosInstance.defaults.headers.common['Authorization'] =
              'Bearer ' + newAccessToken;
            originalRequest.headers['Authorization'] =
              'Bearer ' + newAccessToken;

            processQueue(null, newAccessToken);
            return axiosInstance(originalRequest);
          }
        } catch (err) {
          processQueue(err, null);
          dispatch(logout()); // Clean Redux + LocalStorage
          window.location.href = '/login';
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
};

/**
 * Custom baseQuery for RTK Query using Axios.
 * Grabs the API's `dispatch` function dynamically on every call.
 */
export const axiosBaseQuery =
  () =>
    async ({ url, method, data, params, headers }, api) => {
      // Dynamically inject dispatch into interceptor setup
      setupResponseInterceptor(api.dispatch);

      try {
        const result = await axiosInstance({
          url,
          method,
          data,
          params,
          headers,
        });
        return { data: result.data };
      } catch (axiosError) {
        const err = axiosError;
        return {
          error: {
            status: err.response?.status,
            data: err.response?.data || err.message,
          },
        };
      }
    };
