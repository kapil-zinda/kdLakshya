'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { UserData } from '@/app/interfaces/userInterface';
import axios from 'axios';

interface DashboardWrapperProps {
  children: (userData: UserData) => React.ReactNode;
  allowedRoles?: ('admin' | 'teacher' | 'student')[];
  redirectTo?: string;
}

export function DashboardWrapper({
  children,
  allowedRoles = ['admin', 'teacher', 'student'],
  redirectTo = '/template',
}: DashboardWrapperProps) {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get token from localStorage with TTL check
        const getItemWithTTL = (key: string) => {
          const itemStr = localStorage.getItem(key);
          if (!itemStr) return null;

          try {
            const item = JSON.parse(itemStr);
            const now = new Date().getTime();

            if (now > item.expiry) {
              localStorage.removeItem(key);
              return null;
            }

            return item.value;
          } catch (e) {
            localStorage.removeItem(key);
            return null;
          }
        };

        const token = getItemWithTTL('bearerToken');

        if (!token) {
          router.push(redirectTo);
          return;
        }

        // Fetch user data
        const response = await axios.get('/api/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = response.data;

        // Check if user has required role
        if (!allowedRoles.includes(data.role)) {
          // Redirect to dashboard
          router.push('/dashboard');
          return;
        }

        setUserData(data);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push(redirectTo);
      } finally {
        setIsLoading(false);
      }
    };

    // Only run auth check once when component mounts
    if (isLoading) {
      checkAuth();
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  return <>{children(userData)}</>;
}
