import { configureStore } from '@reduxjs/toolkit';
import { authApi } from './api/authApi';
import { superAdminApi } from './api/superAdminApi';
import { societyAdminApi } from './api/societyAdminApi';
import { residentApi } from './api/residentApi';
import { staffApi } from './api/staffApi';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [superAdminApi.reducerPath]: superAdminApi.reducer,
    [societyAdminApi.reducerPath]: societyAdminApi.reducer,
    [residentApi.reducerPath]: residentApi.reducer,
    [staffApi.reducerPath]: staffApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(superAdminApi.middleware)
      .concat(societyAdminApi.middleware)
      .concat(residentApi.middleware)
      .concat(staffApi.middleware),
});
