'use client';

import { useRouter } from 'next/navigation';

import { useGetUserProfileQuery } from '@/store/api/authApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout as logoutAction } from '@/store/slices/authSlice';
import { useUser } from '@auth0/nextjs-auth0/client';

export interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'teacher' | 'student';
  permissions: Record<string, any>;
  orgId: string;
}

/**
 * Redux-based authentication hook
 * This is the new version that uses Redux Toolkit and RTK Query
 *
 * Usage:
 * const { userData, isLoading, isAuthenticated, login, logout } = useAuthRedux();
 */
export function useAuthRedux() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, error, isLoading: authLoading } = useUser();

  // Get auth state from Redux
  const reduxUser = useAppSelector((state) => state.auth.user);
  const reduxToken = useAppSelector((state) => state.auth.token);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  // Fetch user profile using RTK Query (only if we have a token)
  const {
    data: fetchedUserData,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchUserData,
  } = useGetUserProfileQuery(undefined, {
    skip: !reduxToken, // Skip query if no token
  });

  // Determine which user data to use (Redux store or fetched)
  const userData: UserData | null = reduxUser || fetchedUserData || null;

  const login = () => {
    // Always redirect to auth subdomain for authentication
    const currentHost = window.location.host;
    const currentSubdomain = currentHost.split('.')[0];
    const isLocalhost =
      currentHost.includes('localhost') || currentHost.includes('127.0.0.1');

    // Store the origin subdomain for post-authentication redirect
    if (currentSubdomain && currentSubdomain !== 'auth') {
      sessionStorage.setItem('loginOriginSubdomain', currentSubdomain);
      console.log('💾 Stored origin subdomain for return:', currentSubdomain);
    }

    let authUrl;
    if (isLocalhost) {
      // For development, use auth.localhost for authentication
      const port = currentHost.split(':')[1] || '3000';
      authUrl = `http://auth.localhost:${port}/login`;
    } else {
      // For production, always redirect to auth.uchhal.in for authentication
      const domain = currentHost.split('.').slice(1).join('.'); // Get base domain (uchhal.in)
      authUrl = `https://auth.${domain}/login`;
    }

    console.log(
      '🔑 useAuthRedux: Redirecting to AUTH subdomain for authentication:',
      authUrl,
    );
    console.log('🔙 Origin subdomain:', currentSubdomain);
    window.location.href = authUrl;
  };

  const logout = () => {
    // Dispatch Redux logout action
    dispatch(logoutAction());

    // Clear localStorage (legacy cleanup)
    localStorage.removeItem('bearerToken');
    localStorage.removeItem('authState');
    localStorage.removeItem('codeVerifier');
    localStorage.removeItem('studentAuth');
    localStorage.removeItem('cachedUserData');
    sessionStorage.removeItem('authCodeProcessed');
    sessionStorage.removeItem('isAuthCallback');
    sessionStorage.removeItem('userData');

    // Redirect to home
    window.location.href = '/';
  };

  const redirectBasedOnRole = () => {
    router.push('/dashboard');
  };

  const fetchUserData = async () => {
    try {
      const result = await refetchUserData();
      return result.data || null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  return {
    user, // Auth0 user (for backward compatibility)
    userData, // Our processed user data
    isLoading: authLoading || profileLoading,
    error: error || profileError,
    login,
    logout,
    fetchUserData,
    refetchUserData,
    redirectBasedOnRole,
    isAuthenticated: isAuthenticated && !!userData,
  };
}
