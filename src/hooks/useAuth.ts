'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { useUser } from '@auth0/nextjs-auth0/client';
import axios from 'axios';

export interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'teacher' | 'student';
  permissions: Record<string, any>;
  orgId: string;
}

export function useAuth() {
  const { user, error, isLoading } = useUser();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoadingUserData, setIsLoadingUserData] = useState(false);

  const fetchUserData = async (accessToken: string) => {
    setIsLoadingUserData(true);
    try {
      const response = await axios.get('/api/users/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setUserData(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    } finally {
      setIsLoadingUserData(false);
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

  const login = () => {
    window.location.href = '/api/auth/login';
  };

  const logout = () => {
    setUserData(null);
    window.location.href = '/api/auth/logout';
  };

  return {
    user,
    userData,
    isLoading: isLoading || isLoadingUserData,
    error,
    login,
    logout,
    fetchUserData,
    redirectBasedOnRole,
    isAuthenticated: !!user,
  };
}
