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
  redirectTo = '/',
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
          // Redirect based on user role
          if (data.role === 'admin') {
            router.push('/admin-portal/dashboard');
          } else {
            router.push('/dashboard');
          }
          return;
        }

        setUserData(data);
      } catch (error) {
        console.error('Auth check failed:', error);
        // Check if it's a network/server error vs auth error
        if (axios.isAxiosError(error)) {
          if (
            error.response?.status === 401 ||
            error.response?.status === 403
          ) {
            // Auth error - likely expired token, clear and redirect to login
            console.log(
              'Auth error - token likely expired, clearing auth data',
            );
            localStorage.removeItem('bearerToken');
            sessionStorage.removeItem('authCodeProcessed');
            router.push(redirectTo);
          } else if (error.response?.status >= 500) {
            // Server error - could be expired token causing backend issues
            console.error('Server error - checking if token is expired');
            // Check token validity
            const tokenStr = localStorage.getItem('bearerToken');
            if (tokenStr) {
              try {
                const tokenItem = JSON.parse(tokenStr);
                const now = new Date().getTime();
                if (now > tokenItem.expiry) {
                  console.log('Token expired, clearing auth data');
                  localStorage.removeItem('bearerToken');
                  sessionStorage.removeItem('authCodeProcessed');
                  router.push(redirectTo);
                } else {
                  // Token valid but server error - redirect to home but keep token
                  router.push('/');
                }
              } catch (e) {
                console.log('Error parsing token, clearing auth data');
                localStorage.removeItem('bearerToken');
                sessionStorage.removeItem('authCodeProcessed');
                router.push(redirectTo);
              }
            } else {
              router.push(redirectTo);
            }
          } else {
            // Other errors - clear auth and redirect
            localStorage.removeItem('bearerToken');
            sessionStorage.removeItem('authCodeProcessed');
            router.push(redirectTo);
          }
        } else {
          // Network or other error
          localStorage.removeItem('bearerToken');
          sessionStorage.removeItem('authCodeProcessed');
          router.push(redirectTo);
        }
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
