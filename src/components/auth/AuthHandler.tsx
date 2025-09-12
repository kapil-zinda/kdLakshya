'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { updateUserData } from '@/app/interfaces/userInterface';
import { useUserData } from '@/hooks/useUserData';
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

      // Navigate to dashboard without page refresh
      router.push('/dashboard');
    } catch (error) {
      console.error('Error during login flow:', error);
      // On error, still try to redirect to dashboard to avoid stuck state
      router.push('/dashboard');
    }
  };

  return null; // This component doesn't render anything
}
