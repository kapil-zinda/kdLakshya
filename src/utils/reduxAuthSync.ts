/**
 * Helper utilities to sync authentication state with Redux
 * This allows gradual migration from localStorage to Redux
 */

import { store } from '@/store';
import {
  logout,
  setCredentials,
  setToken,
  type User,
} from '@/store/slices/authSlice';

/**
 * Sync token to Redux store
 * Call this whenever you receive a new token
 */
export const syncTokenToRedux = (token: string, expiresIn: number) => {
  const expiresAt = Date.now() + expiresIn * 1000; // Convert seconds to milliseconds
  store.dispatch(setToken({ token, expiresAt }));
  console.log('✅ Token synced to Redux store');
};

/**
 * Sync user data to Redux store
 * Call this after fetching user profile from API
 */
export const syncUserToRedux = (userData: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  orgId: string;
  permissions?: Record<string, any>;
}) => {
  const user: User = {
    id: userData.id,
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
    role: userData.role,
    orgId: userData.orgId,
  };

  store.dispatch(
    setCredentials({
      user,
      token: '', // Token already set by syncTokenToRedux
      expiresAt: 0, // Will be set by syncTokenToRedux
    }),
  );

  console.log('✅ User data synced to Redux store');
};

/**
 * Sync both token and user data to Redux
 * Use this when you have both available
 */
export const syncAuthToRedux = (
  token: string,
  expiresIn: number,
  userData: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    orgId: string;
  },
) => {
  const expiresAt = Date.now() + expiresIn * 1000;
  const user: User = {
    id: userData.id,
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
    role: userData.role,
    orgId: userData.orgId,
  };

  store.dispatch(setCredentials({ user, token, expiresAt }));
  console.log('✅ Auth state fully synced to Redux store');
};

/**
 * Clear Redux auth state
 * Call this on logout
 */
export const clearReduxAuth = () => {
  store.dispatch(logout());
  console.log('✅ Redux auth state cleared');
};

/**
 * Load token from localStorage and sync to Redux
 * Call this on app initialization
 */
export const loadTokenFromStorage = () => {
  try {
    const tokenStr = localStorage.getItem('bearerToken');
    if (!tokenStr) return false;

    const tokenData = JSON.parse(tokenStr);
    const now = Date.now();

    // Check if token is expired
    if (now >= tokenData.expiry) {
      console.log('Token in localStorage is expired');
      localStorage.removeItem('bearerToken');
      return false;
    }

    // Calculate remaining time in seconds
    const expiresIn = Math.floor((tokenData.expiry - now) / 1000);
    syncTokenToRedux(tokenData.value, expiresIn);
    return true;
  } catch (error) {
    console.error('Error loading token from storage:', error);
    return false;
  }
};

/**
 * Load user data from localStorage cache and sync to Redux
 * This is a temporary migration helper
 */
export const loadUserFromStorage = () => {
  try {
    const cachedUserStr = localStorage.getItem('cachedUserData');
    if (!cachedUserStr) return false;

    const cachedUser = JSON.parse(cachedUserStr);

    // Check cache validity (24 hours)
    const CACHE_DURATION = 24 * 60 * 60 * 1000;
    const now = Date.now();
    if (now - cachedUser.cacheTimestamp > CACHE_DURATION) {
      console.log('Cached user data is stale');
      localStorage.removeItem('cachedUserData');
      return false;
    }

    syncUserToRedux({
      id: cachedUser.id,
      email: cachedUser.email,
      firstName: cachedUser.firstName,
      lastName: cachedUser.lastName,
      role: cachedUser.role,
      orgId: cachedUser.orgId,
      permissions: cachedUser.permissions,
    });

    return true;
  } catch (error) {
    console.error('Error loading user from storage:', error);
    return false;
  }
};
