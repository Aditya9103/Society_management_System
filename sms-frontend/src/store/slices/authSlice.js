import { createSlice } from '@reduxjs/toolkit';

const storedUser = localStorage.getItem('user');
let parsedUser = null;
try {
  if (storedUser && storedUser !== 'undefined') {
    parsedUser = JSON.parse(storedUser);
  }
} catch (e) {
  console.error('Failed to parse stored user:', e);
}

const initialState = {
  user: parsedUser,
  accessToken: localStorage.getItem('accessToken') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isSuspended: localStorage.getItem('isSuspended') === 'true',
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken, refreshToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      if (refreshToken) state.refreshToken = refreshToken;
      state.isAuthenticated = true;

      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
    },
    setSuspended: (state, action) => {
      state.isSuspended = action.payload;
      if (action.payload) {
        localStorage.setItem('isSuspended', 'true');
      } else {
        localStorage.removeItem('isSuspended');
      }
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isSuspended = false;

      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('isSuspended');

      // Tell Service Worker to clear user-specific API caches
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_USER_CACHES' });
      }
    },
  },
});

export const { setCredentials, setSuspended, logout } = authSlice.actions;

export default authSlice.reducer;
