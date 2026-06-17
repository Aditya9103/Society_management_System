import axios from 'axios';

// Standard Axios instance
export const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
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

/**
 * A custom baseQuery for RTK Query that uses Axios under the hood.
 */
export const axiosBaseQuery =
  () =>
    async ({ url, method, data, params, headers }) => {
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
