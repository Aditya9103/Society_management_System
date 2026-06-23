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
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;
