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

      // Both admin and faculty users redirect to their organization's subdomain
      try {
        // Get organization data to determine subdomain
        const orgData = await ApiService.getOrganizationById(userData.orgId);
        const subdomain = orgData.data.attributes.subdomain;

        if (subdomain) {
          // Redirect to the organization's subdomain
          const currentHost = window.location.host;
          const isLocalhost =
            currentHost.includes('localhost') ||
            currentHost.includes('127.0.0.1');

          if (isLocalhost) {
            // For development, redirect to subdomain on localhost
            const port = currentHost.split(':')[1] || '3000';
            window.location.href = `http://${subdomain}.localhost:${port}`;
          } else {
            // For production, redirect to the actual subdomain
            const domain = currentHost.split('.').slice(1).join('.'); // Get base domain
            window.location.href = `https://${subdomain}.${domain}`;
          }
        } else {
          // Fallback to dashboard if no subdomain found
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error fetching organization data for redirect:', error);
        // Fallback to dashboard on error
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error during login flow:', error);
      // On error, still try to redirect to dashboard to avoid stuck state
      router.push('/dashboard');
    }
  };

  return null; // This component doesn't render anything
}
