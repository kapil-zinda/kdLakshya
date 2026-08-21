'use client';

import { useMemo } from 'react';

import { useGetUserProfileQuery } from '@/store/api/authApi';
import { baseApi, classApi, workspaceApi } from '@/store/api/baseApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout as logoutAction } from '@/store/slices/authSlice';

export interface CachedUserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: Record<string, unknown>;
  orgId: string;
  accessToken?: string;
  type?: string;
  phone?: string;
  designation?: string;
  experience?: string;
  profilePhoto?: string;
}

/**
 * Redux-based user data hook using RTK Query
 * This replaces the old localStorage-based caching with Redux state and RTK Query caching
 *
 * Usage:
 * const { userData, isLoading, refetch } = useUserDataRedux();
 */
export function useUserDataRedux() {
  const dispatch = useAppDispatch();
  // Get token from Redux store
  const token = useAppSelector((state) => state.auth.token?.token);
  const reduxUser = useAppSelector((state) => state.auth.user);

  // Fetch user profile using RTK Query (with automatic caching)
  const {
    data: fetchedUserData,
    isLoading,
    error,
    refetch,
  } = useGetUserProfileQuery(undefined, {
    skip: !token, // Skip if no token
  });

  // Merge user data with token for backward compatibility - memoized to prevent infinite re-renders
  const userData: CachedUserData | null = useMemo(() => {
    if (fetchedUserData) {
      return { ...fetchedUserData, accessToken: token };
    }
    if (reduxUser) {
      return { ...reduxUser, accessToken: token, permissions: {} };
    }
    return null;
  }, [fetchedUserData, reduxUser, token]);

  // Fully logs the user out: clears Redux auth state, the persisted
  // redux-persist snapshot, and legacy auth keys some older screens still read.
  const clearUserData = () => {
    dispatch(logoutAction());
    // Purge all cached query results app-wide, not just wait for their
    // 5-minute keepUnusedDataFor TTL to expire - without this, a
    // previous user's PII (fees, attendance, profile) could still render
    // from cache for up to 5 minutes on a shared device after logout.
    dispatch(baseApi.util.resetApiState());
    dispatch(classApi.util.resetApiState());
    dispatch(workspaceApi.util.resetApiState());
    if (typeof window !== 'undefined') {
      localStorage.removeItem('persist:root');
      localStorage.removeItem('bearerToken');
      localStorage.removeItem('studentAuth');
      localStorage.removeItem('adminAuth');
      localStorage.removeItem('cachedUserData');
      localStorage.removeItem('authState');
      localStorage.removeItem('codeVerifier');
    }
  };

  const refreshUserData = async () => {
    const result = await refetch();
    return result.data || null;
  };

  return {
    userData,
    isLoading,
    error,
    refetch,
    clearUserData, // Deprecated but kept for compatibility
    refreshUserData,
  };
}
