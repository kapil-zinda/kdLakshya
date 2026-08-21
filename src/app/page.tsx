'use client';

import { useCallback, useEffect, useRef } from 'react';

import { useRouter } from 'next/navigation';

import { OrganizationTemplate } from '@/components/template/OrganizationTemplate';
import { useOrganizationData } from '@/hooks/useOrganizationData';
import { determineUserRole } from '@/store/api/authApi';

export default function Home() {
  const { organizationData, loading } = useOrganizationData();
  const router = useRouter();
  const hasInitialized = useRef(false);

  const handleAuth0Callback = useCallback(async () => {
    try {
      // Check for auth data in URL hash (both Auth0 and student auth cross-subdomain)
      const hash = window.location.hash.substring(1);
      const hashParams = new URLSearchParams(hash);
      const accessToken = hashParams.get('access_token');
      const studentAuthData = hashParams.get('student_auth');

      // Handle student authentication callback
      if (studentAuthData) {
        console.log('🎓 Found student auth data in URL hash');

        try {
          const decodedStudentAuth = JSON.parse(
            decodeURIComponent(studentAuthData),
          );
          console.log('💾 Processing student auth data:', decodedStudentAuth);

          // Store student auth data
          localStorage.setItem(
            'studentAuth',
            JSON.stringify(decodedStudentAuth),
          );
          localStorage.setItem(
            'bearerToken',
            JSON.stringify({
              value: decodedStudentAuth.basicAuthToken,
              expiry: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
            }),
          );

          console.log(
            '✅ Student authenticated on org subdomain, cleaning URL',
          );
          // Clean URL and redirect to dashboard
          window.history.replaceState({}, '', '/dashboard');
          router.push('/dashboard');
          return true;
        } catch (error) {
          console.error('❌ Error processing student auth data:', error);
          window.history.replaceState({}, '', '/');
          return false;
        }
      }

      // Handle admin/teacher Auth0 callback
      if (accessToken) {
        console.log(
          '🔑 Found access token in URL hash, storing in localStorage',
        );

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
          const { makeApiCall } = await import('@/utils/ApiRequest');

          const data = await makeApiCall({
            path: '/users/me?include=permission',
            method: 'GET',
            baseUrl: 'auth',
            customAuthHeaders: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          const userData = data.data;

          console.log('👤 Successfully fetched user data:', userData);

          // Determine user role (shared with authApi.ts - same /users/me shape)
          const role = determineUserRole(userData);

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
            type: userData.attributes.type || userData.attributes.role,
          };

          localStorage.setItem(
            'cachedUserData',
            JSON.stringify(processedUserData),
          );
          console.log('💾 User data cached successfully');
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
              dashboardPath = '/dashboard';
              console.log('👨‍🏫 Redirecting to teacher dashboard');
            } else {
              dashboardPath = '/dashboard';
              console.log('👔 Redirecting to dashboard');
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
  }, [router]);

  const checkStudentAuth = useCallback(() => {
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
  }, [router]);

  useEffect(() => {
    // Prevent infinite loop - only run once on mount
    if (hasInitialized.current) {
      return;
    }

    const initializeAuth = async () => {
      hasInitialized.current = true;

      // Check if student is already authenticated
      if (checkStudentAuth()) {
        return;
      }

      // Check if this is an auth callback with token or student data in hash (cross-subdomain)
      if (
        window.location.hash.includes('access_token') ||
        window.location.hash.includes('student_auth')
      ) {
        console.log('🔍 Detected auth data in URL hash');
        await handleAuth0Callback();
        return;
      }

      // Organization data will be loaded by useOrganizationData hook
      console.log('✅ Auth initialization complete');
    };

    initializeAuth();
    // Both callbacks are useCallback-stable, and the hasInitialized ref above
    // keeps this to a single run regardless.
  }, [checkStudentAuth, handleAuth0Callback]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!organizationData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            No Data Available
          </h1>
          <p className="text-muted-foreground">
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
