'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { updateUserData } from '@/app/interfaces/userInterface';
import { useUser } from '@auth0/nextjs-auth0/client';
import axios from 'axios';

export function AuthHandler() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    if (!isLoading && user && !hasRedirected) {
      handleUserLogin();
      setHasRedirected(true);
    }
  }, [user, isLoading, hasRedirected]);

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

      // Fetch user data from your API
      const response = await axios.get('/api/users/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const userData = response.data;

      // Update user data in your system
      await updateUserData({
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

      // Redirect based on role
      redirectBasedOnRole(userData.role);
    } catch (error) {
      console.error('Error during login flow:', error);
    }
  };

  const redirectBasedOnRole = (role: string) => {
    switch (role) {
      case 'admin':
        router.push('/admin-portal/dashboard');
        break;
      case 'teacher':
        router.push('/teacher-dashboard');
        break;
      case 'student':
        router.push('/student-dashboard');
        break;
      default:
        router.push('/student-dashboard');
    }
  };

  return null; // This component doesn't render anything
}
