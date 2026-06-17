import { configureStore } from '@reduxjs/toolkit';
import { authApi } from './api/authApi';
import { superAdminApi } from './api/superAdminApi';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [superAdminApi.reducerPath]: superAdminApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(superAdminApi.middleware),
});
