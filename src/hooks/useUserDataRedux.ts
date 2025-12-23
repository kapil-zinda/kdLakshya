'use client';

import { useMemo } from 'react';

import { useGetUserProfileQuery } from '@/store/api/authApi';
import { useAppSelector } from '@/store/hooks';

export interface CachedUserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: Record<string, any>;
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

  // For backward compatibility with old code
  const clearUserData = () => {
    console.warn(
      'clearUserData is deprecated. Use logout action from Redux instead.',
    );
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
