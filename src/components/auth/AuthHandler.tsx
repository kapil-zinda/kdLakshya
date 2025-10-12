'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { updateUserData } from '@/app/interfaces/userInterface';
import { useUserData } from '@/hooks/useUserData';
import { ApiService } from '@/services/api';
import { useUser } from '@auth0/nextjs-auth0/client';

export function AuthHandler() {
  const { user, isLoading } = useUser();
  const { fetchUserDataFromBackend } = useUserData();
  const router = useRouter();
  const [hasProcessed, setHasProcessed] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!isLoading && user && !hasProcessed) {
      handleUserLogin();
      setHasProcessed(true);
    }
  }, [user, isLoading, hasProcessed]);

  const handleUserLogin = async () => {
    if (!user?.sub) return;

    try {
      // Get access token from Auth0
      const tokenResponse = await fetch('/api/auth/token');
      const { accessToken } = await tokenResponse.json();

      if (!accessToken) {
        console.error('No access token available');
        return;
      }

      // Fetch user data directly from backend and cache it
      const userData = await fetchUserDataFromBackend(accessToken);

      // Update the legacy user data interface for backward compatibility
      updateUserData({
        userId: userData.id,
        keyId: 'user-' + userData.id,
        orgKeyId: 'org-' + userData.orgId,
        orgId: userData.orgId,
        userEmail: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        permission: userData.permissions,
        allowedTeams: Object.keys(userData.permissions || {})
          .filter((key) => key.startsWith('team-'))
          .map((key) => key.match(/team-(\d+)/)?.[1])
          .filter(Boolean) as string[],
      });

      // After successful authentication on auth subdomain, redirect to user's org subdomain
      try {
        // Get organization data to determine subdomain
        const orgData = await ApiService.getOrganizationById(
          userData.orgId,
          accessToken,
        );
        const expectedSubdomain = orgData.data.attributes.subdomain;

        console.log('🔍 User orgId:', userData.orgId);
        console.log('🏢 Organization data:', orgData);
        console.log('🎯 Expected subdomain:', expectedSubdomain);

        if (expectedSubdomain) {
          // Check current subdomain
          const currentHost = window.location.host;
          const currentHostParts = currentHost.split('.');
          const currentSubdomain =
            currentHostParts.length > 2
              ? currentHostParts[0]
              : currentHostParts.length === 2 &&
                  !currentHost.includes('localhost')
                ? currentHostParts[0]
                : null;

          const isLocalhost =
            currentHost.includes('localhost') ||
            currentHost.includes('127.0.0.1');

          console.log('🌐 Current host:', currentHost);
          console.log('📍 Current subdomain:', currentSubdomain);
          console.log('💻 Is localhost:', isLocalhost);

          // If user is on 'auth' subdomain or different subdomain, redirect to their org subdomain
          if (
            currentSubdomain === 'auth' ||
            (currentSubdomain && currentSubdomain !== expectedSubdomain)
          ) {
            console.log(
              '🔄 Redirecting from',
              currentSubdomain,
              'to user org subdomain:',
              expectedSubdomain,
            );

            // Show loader during redirect
            setIsRedirecting(true);

            // Pass the access token via URL hash for cross-subdomain authentication
            const tokenParam = accessToken
              ? `#access_token=${encodeURIComponent(accessToken)}`
              : '';

            if (isLocalhost) {
              // For development, redirect to subdomain on localhost
              const port = currentHost.split(':')[1] || '3000';
              const redirectUrl = `http://${expectedSubdomain}.localhost:${port}/dashboard${tokenParam}`;
              console.log('🚀 Dev: Redirecting to:', redirectUrl);
              window.location.href = redirectUrl;
            } else {
              // For production, redirect to the actual subdomain
              const domain = currentHost.split('.').slice(1).join('.'); // Get base domain
              const redirectUrl = `https://${expectedSubdomain}.${domain}/dashboard${tokenParam}`;
              console.log('🚀 Prod: Redirecting to:', redirectUrl);
              console.log('🔑 Including access token in URL hash');
              window.location.href = redirectUrl;
            }
          } else {
            console.log(
              '✅ User is already on correct subdomain, redirecting to dashboard',
            );
            // User is on correct subdomain, redirect to dashboard
            router.push('/dashboard');
          }
        } else {
          console.log('⚠️ No subdomain found, redirecting to dashboard');
          // Fallback to dashboard if no subdomain found
          router.push('/dashboard');
        }
      } catch (error) {
        console.error(
          '❌ Error fetching organization data for redirect:',
          error,
        );
        // Fallback to dashboard on error
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error during login flow:', error);
      // On error, still try to redirect to dashboard to avoid stuck state
      router.push('/dashboard');
    }
  };

  // Show loader when redirecting to correct subdomain
  if (isRedirecting) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900">
              Redirecting to your organization...
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Please wait while we take you to the right place
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null; // This component doesn't render anything when not redirecting
}
