'use client';

import { useCallback, useEffect, useState } from 'react';

import { determineUserRole } from '@/store/api/authApi';

export interface CachedUserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: Record<string, unknown>;
  orgId: string;
  accessToken: string;
  cacheTimestamp: number;
  type?: string;
  phone?: string;
  designation?: string;
  experience?: string;
  profilePhoto?: string;
}

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const USER_DATA_KEY = 'cachedUserData';

export function useUserData() {
  const [userData, setUserData] = useState<CachedUserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load cached user data from localStorage
  const loadCachedData = useCallback(() => {
    try {
      if (typeof window === 'undefined') return null;

      const cached = localStorage.getItem(USER_DATA_KEY);
      if (!cached) return null;

      const parsedData = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is still valid
      if (now - parsedData.cacheTimestamp > CACHE_DURATION) {
        localStorage.removeItem(USER_DATA_KEY);
        return null;
      }

      return parsedData;
    } catch (error) {
      console.error('Error loading cached user data:', error);
      return null;
    }
  }, []);

  // Save user data to cache
  const cacheUserData = useCallback(
    (data: Omit<CachedUserData, 'cacheTimestamp'>) => {
      try {
        if (typeof window === 'undefined') return;

        const dataWithTimestamp = {
          ...data,
          cacheTimestamp: Date.now(),
        };

        localStorage.setItem(USER_DATA_KEY, JSON.stringify(dataWithTimestamp));
        setUserData(dataWithTimestamp);
      } catch (error) {
        console.error('Error caching user data:', error);
      }
    },
    [],
  );

  // Clear cached user data
  const clearUserData = () => {
    try {
      if (typeof window === 'undefined') return;

      localStorage.removeItem(USER_DATA_KEY);
      setUserData(null);
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  };

  // Fetch user data from backend API
  const fetchUserDataFromBackend = useCallback(
    async (accessToken: string) => {
      try {
        const { makeApiCall } = await import('@/utils/ApiRequest');

        console.log('Fetching user data from API...');

        const data = await makeApiCall({
          path: '/users/me?include=permission',
          method: 'GET',
          baseUrl: 'auth',
        });
        const userData = data.data;

        console.log(
          'Full user data from API:',
          JSON.stringify(userData, null, 2),
        );

        // Determine user role (shared with authApi.ts - same /users/me shape)
        const role = determineUserRole(userData);

        console.log('Determined role:', role);

        // For localhost development, use hardcoded orgId
        const LOCALHOST_ORG_ID = '68d6b128d88f00c8b1b4a89a';
        const isLocalhost =
          typeof window !== 'undefined' &&
          (window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.hostname.startsWith('localhost:'));

        const orgId = isLocalhost
          ? LOCALHOST_ORG_ID
          : userData.attributes.org_id ||
            userData.attributes.orgId ||
            userData.attributes.org;

        if (isLocalhost) {
          console.log('🏠 Using hardcoded localhost orgId:', LOCALHOST_ORG_ID);
        }

        console.log('Extracted orgId:', orgId);

        const processedUserData = {
          id: userData.id,
          email: userData.attributes.email,
          firstName:
            userData.attributes.first_name ||
            userData.attributes.name?.split(' ')[0] ||
            'User',
          lastName:
            userData.attributes.last_name ||
            userData.attributes.name?.split(' ').slice(1).join(' ') ||
            '',
          role: role as 'admin' | 'teacher' | 'student',
          permissions:
            userData.attributes.permissions || userData.user_permissions || {},
          orgId: orgId || '',
          accessToken,
          type: userData.attributes.type || userData.attributes.role,
          phone: userData.attributes.phone || '',
          designation: userData.attributes.designation || '',
          experience: userData.attributes.experience || '',
          profilePhoto:
            userData.attributes.profile_photo ||
            userData.attributes.photo ||
            '',
        };

        // Cache the data
        cacheUserData(processedUserData);
        return processedUserData;
      } catch (error) {
        console.error('Error fetching user data from backend:', error);
        throw error;
      }
    },
    [cacheUserData],
  );

  // Initialize user data on component mount
  useEffect(() => {
    const initializeUserData = async () => {
      setIsLoading(true);

      try {
        // Check if student is logged in
        const studentAuth = localStorage.getItem('studentAuth');
        if (studentAuth) {
          console.log(
            'Student authentication detected, using stored student data',
          );
          try {
            const studentData = JSON.parse(studentAuth);
            // Convert student data to CachedUserData format
            const userData: CachedUserData = {
              id: studentData.id || studentData.studentId,
              email: studentData.email,
              firstName: studentData.firstName,
              lastName: studentData.lastName,
              role: 'student',
              permissions: studentData.permissions || { role: 'student' },
              orgId: studentData.orgId,
              accessToken: studentData.basicAuthToken,
              cacheTimestamp: Date.now(),
            };
            setUserData(userData);
            setIsLoading(false);
            return;
          } catch (error) {
            console.error('Error parsing student auth:', error);
          }
        }

        // Clear old cache to force fresh data fetch
        // localStorage.removeItem(USER_DATA_KEY);
        console.log('Cleared cached user data');

        // First, try to load cached data (should be null after removal)
        const cached = loadCachedData();
        if (cached) {
          console.log('Found cached data (unexpected):', cached);
          setUserData(cached);
          setIsLoading(false);
          return;
        }

        console.log('No cached data, fetching fresh...');

        // If no cached data, check for access token
        const tokenData = localStorage.getItem('bearerToken');
        if (tokenData) {
          const parsed = JSON.parse(tokenData);
          const now = Date.now();

          if (now < parsed.expiry && parsed.value) {
            // Token is valid, fetch fresh data from backend
            await fetchUserDataFromBackend(parsed.value);
          }
        }
      } catch (error) {
        console.error('Error initializing user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeUserData();
    // Both callbacks are useCallback-stable, so this still runs once on mount.
  }, [loadCachedData, fetchUserDataFromBackend]);

  return {
    userData,
    isLoading,
    cacheUserData,
    clearUserData,
    fetchUserDataFromBackend,
    refreshUserData: () => {
      const tokenData = localStorage.getItem('bearerToken');
      if (tokenData) {
        const parsed = JSON.parse(tokenData);
        if (parsed.value) {
          return fetchUserDataFromBackend(parsed.value);
        }
      }
      throw new Error('No valid access token available');
    },
  };
}
