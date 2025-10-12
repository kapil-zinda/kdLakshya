'use client';

import { useEffect, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { OrganizationTemplate } from '@/components/template/OrganizationTemplate';
import { useUserData } from '@/hooks/useUserData';
import {
  ApiService,
  transformApiDataToOrganizationConfig,
} from '@/services/api';
import { OrganizationConfig } from '@/types/organization';
import { getTargetSubdomain } from '@/utils/subdomainUtils';

export default function Home() {
  const [organizationData, setOrganizationData] =
    useState<OrganizationConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userData } = useUserData();

  const handleAuth0Callback = async () => {
    try {
      // Check for token in URL hash (both implicit flow and cross-subdomain auth)
      const hash = window.location.hash.substring(1);
      const hashParams = new URLSearchParams(hash);
      const accessToken = hashParams.get('access_token');

      if (accessToken) {
        console.log(
          '🔑 Found access token in URL hash, storing in localStorage',
        );

        // Show loading state while processing authentication
        setLoading(true);

        // Store token in localStorage with TTL
        localStorage.setItem(
          'bearerToken',
          JSON.stringify({
            value: accessToken,
            expiry: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
          }),
        );

        // Fetch and cache user data before reload
        console.log('👤 Fetching and caching user data...');
        try {
          const BaseURLAuth =
            process.env.NEXT_PUBLIC_BaseURLAuth ||
            'https://apis.testkdlakshya.uchhal.in/auth';

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

          if (response.ok) {
            const data = await response.json();
            const userData = data.data;

            console.log('👤 Successfully fetched user data:', userData);

            // Determine user role
            let role = 'student';
            if (userData.attributes && userData.attributes.type === 'faculty') {
              role = 'teacher';
            } else if (userData.user_permissions) {
              if (
                userData.user_permissions['admin'] ||
                userData.user_permissions['organization_admin'] ||
                userData.user_permissions['org']
              ) {
                role = 'admin';
              } else if (
                userData.user_permissions['teacher'] ||
                userData.user_permissions['instructor']
              ) {
                role = 'teacher';
              }
            }

            // Cache user data in localStorage
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
                userData.attributes.permissions ||
                userData.user_permissions ||
                {},
              orgId: userData.attributes.org_id || userData.attributes.org,
              accessToken,
              cacheTimestamp: Date.now(),
            };

            localStorage.setItem(
              'cachedUserData',
              JSON.stringify(processedUserData),
            );
            console.log('💾 User data cached successfully');
          } else {
            console.error('❌ Failed to fetch user data:', response.status);
          }
        } catch (userDataError) {
          console.error('❌ Error fetching user data:', userDataError);
        }

        // Clean URL and redirect to appropriate dashboard based on role
        console.log('🔑 Cleaning URL and redirecting to dashboard');

        // Determine dashboard based on role
        let dashboardPath = '/dashboard';
        const cachedUserStr = localStorage.getItem('cachedUserData');
        if (cachedUserStr) {
          try {
            const cachedUser = JSON.parse(cachedUserStr);
            const userRole = cachedUser.role;

            console.log('👤 User role:', userRole);

            if (userRole === 'teacher' || userRole === 'faculty') {
              dashboardPath = '/teacher-dashboard';
              console.log('👨‍🏫 Redirecting to teacher dashboard');
            } else if (userRole === 'student') {
              dashboardPath = '/student-dashboard';
              console.log('👨‍🎓 Redirecting to student dashboard');
            } else {
              console.log('👔 Redirecting to admin dashboard');
            }
          } catch (e) {
            console.error('Error parsing cached user data:', e);
          }
        }

        window.history.replaceState({}, '', dashboardPath);

        // Redirect directly to dashboard instead of reloading
        console.log('🚀 Redirecting to:', dashboardPath);
        router.push(dashboardPath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Auth callback error:', error);
      window.history.replaceState({}, '', '/');
      return false;
    }
  };

  const checkStudentAuth = () => {
    // Check if user is logged in as a student and redirect accordingly
    const studentAuth = localStorage.getItem('studentAuth');
    if (studentAuth) {
      try {
        JSON.parse(studentAuth); // Validate JSON
        console.log(
          '👨‍🎓 Student authenticated, redirecting to student dashboard',
        );
        router.push('/student-dashboard');
        return true;
      } catch (error) {
        console.error('Error parsing student auth:', error);
        localStorage.removeItem('studentAuth');
      }
    }
    return false;
  };

  const loadDataFromAPI = async () => {
    try {
      setLoading(true);
      console.log('Fetching data from APIs...');

      // Get the correct subdomain to use
      const targetSubdomain = await getTargetSubdomain(
        userData?.orgId,
        userData?.accessToken,
      );

      // Fetch all API data using the determined subdomain
      const apiData = await ApiService.fetchAllData(targetSubdomain);
      console.log('API Data received for subdomain:', targetSubdomain, apiData);

      // Transform API data to OrganizationConfig format
      const transformedData = transformApiDataToOrganizationConfig(apiData);
      console.log('Transformed data:', transformedData);

      setOrganizationData(transformedData);
    } catch (error) {
      console.error('Failed to load API data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      // Check if student is already authenticated
      if (checkStudentAuth()) {
        return;
      }

      // Check if this is an Auth0 callback with token in hash (cross-subdomain or direct)
      if (window.location.hash.includes('access_token')) {
        console.log('🔍 Detected access token in URL hash');
        await handleAuth0Callback();
        return;
      }

      // Try to load data from API first
      loadDataFromAPI();
    };

    initializeAuth();
  }, [userData]); // Reload when user data changes

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-gray-600">Loading data from APIs...</p>
        </div>
      </div>
    );
  }

  if (!organizationData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            No Data Available
          </h1>
          <p className="text-gray-600">
            Unable to load organization data from API
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Debug indicator to show data source */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-0 right-0 z-50 bg-blue-500 text-white px-3 py-1 text-xs">
          API Data
        </div>
      )}
      <OrganizationTemplate data={organizationData} />
    </>
  );
}
