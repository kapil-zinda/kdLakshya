'use client';

import { useEffect, useState } from 'react';

export interface CachedUserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'teacher' | 'student';
  permissions: Record<string, any>;
  orgId: string;
  accessToken: string;
  cacheTimestamp: number;
}

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const USER_DATA_KEY = 'cachedUserData';

export function useUserData() {
  const [userData, setUserData] = useState<CachedUserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load cached user data from localStorage
  const loadCachedData = () => {
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
  };

  // Save user data to cache
  const cacheUserData = (data: Omit<CachedUserData, 'cacheTimestamp'>) => {
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
  };

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
  const fetchUserDataFromBackend = async (accessToken: string) => {
    try {
      const BaseURLAuth = process.env.NEXT_PUBLIC_BaseURLAuth || '';

      const response = await fetch(
        `${BaseURLAuth}/users/me?include=permission`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/vnd.api+json',
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status}`);
      }

      const data = await response.json();
      const userData = data.data;

      // Determine user role based on permissions
      let role = 'student';
      if (userData.user_permissions) {
        if (
          userData.user_permissions['admin'] ||
          userData.user_permissions['organization_admin']
        ) {
          role = 'admin';
        } else if (
          userData.user_permissions['teacher'] ||
          userData.user_permissions['instructor']
        ) {
          role = 'teacher';
        }
      }

      const processedUserData = {
        id: userData.id,
        email: userData.attributes.email,
        firstName: userData.attributes.first_name,
        lastName: userData.attributes.last_name,
        role: role as 'admin' | 'teacher' | 'student',
        permissions: userData.user_permissions,
        orgId: userData.attributes.org,
        accessToken,
      };

      // Cache the data
      cacheUserData(processedUserData);
      return processedUserData;
    } catch (error) {
      console.error('Error fetching user data from backend:', error);
      throw error;
    }
  };

  // Initialize user data on component mount
  useEffect(() => {
    const initializeUserData = async () => {
      setIsLoading(true);

      try {
        // First, try to load cached data
        const cached = loadCachedData();
        if (cached) {
          setUserData(cached);
          setIsLoading(false);
          return;
        }

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
  }, []);

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
