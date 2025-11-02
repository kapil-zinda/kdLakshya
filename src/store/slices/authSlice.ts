import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  orgId: string;
  organizationName?: string;
  profilePicture?: string;
}

interface TokenData {
  token: string;
  expiresAt: number;
}

interface AuthState {
  user: User | null;
  token: TokenData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string; expiresAt: number }>,
    ) => {
      state.user = action.payload.user;
      state.token = {
        token: action.payload.token,
        expiresAt: action.payload.expiresAt,
      };
      state.isAuthenticated = true;
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    setToken: (
      state,
      action: PayloadAction<{ token: string; expiresAt: number }>,
    ) => {
      state.token = action.payload;
      state.isAuthenticated = true;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setCredentials,
  setUser,
  setToken,
  setLoading,
  setError,
  logout,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectCurrentUser = (state: { auth: AuthState }) =>
  state.auth.user;
export const selectCurrentToken = (state: { auth: AuthState }) =>
  state.auth.token?.token;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) =>
  state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectOrgId = (state: { auth: AuthState }) =>
  state.auth.user?.orgId;
