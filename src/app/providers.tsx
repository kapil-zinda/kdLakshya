'use client';

import * as React from 'react';

import { usePathname } from 'next/navigation';

import axios from 'axios';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';

import { updateUserData } from './interfaces/userInterface';

const BaseURLAuth = process.env.NEXT_PUBLIC_BaseURLAuth || '';
const AUTH0_Client_Id = process.env.NEXT_PUBLIC_AUTH0_Client_Id || '';
const AUTH0_Client_Secreate =
  process.env.NEXT_PUBLIC_AUTH0_Client_Secreat || '';
const AUTH0_Domain_Name = process.env.NEXT_PUBLIC_Auth0_DOMAIN_NAME || '';
const login_redirect = process.env.NEXT_PUBLIC_AUTH0_LOGIN_REDIRECT_URL || '';

export function Providers({ children }: ThemeProviderProps) {
  const [accessTkn, setAccessTkn] = React.useState<string | null>(null);
  const [isClient, setIsClient] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const userMeData = async (bearerToken: string) => {
    if (!bearerToken) return;

    try {
      const res = await axios.get(`/api/users/me`, {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
          'Content-Type': 'application/json',
        },
      });

      const userData = res.data;

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

      // Role-based redirection logic
      // if (
      //   pathname &&
      //   (pathname === '/template' || pathname.startsWith('/template'))
      // ) {
      //   const role = userData.role;

      //   switch (role) {
      //     case 'admin':
      //       window.location.href = '/admin';
      //       break;
      //     case 'teacher':
      //       window.location.href = '/teacher';
      //       break;
      //     case 'student':
      //       window.location.href = '/student';
      //       break;
      //     default:
      //       // If role is not recognized, redirect to student dashboard
      //       window.location.href = '/student';
      //   }
      // }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // If we get a 401 or 403, the token is invalid
      if (
        axios.isAxiosError(error) &&
        (error.response?.status === 401 || error.response?.status === 403)
      ) {
        localStorage.removeItem('bearerToken');
        setAccessTkn(null);
        if (
          pathname &&
          pathname !== '/template' &&
          !pathname.startsWith('/template/')
        ) {
          loginHandler();
        }
      }
    }
  };

  const setItemWithTTL = (key: string, value: any, ttlHours: number) => {
    const now = new Date().getTime();
    const ttlMilliseconds = ttlHours * 60 * 60 * 1000;
    const item = {
      value: value,
      expiry: now + ttlMilliseconds,
    };
    localStorage.setItem(key, JSON.stringify(item));
  };

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

  const fetchAuthToken = async (code: string) => {
    try {
      const data = new URLSearchParams();
      data.append('grant_type', 'authorization_code');
      data.append('client_id', AUTH0_Client_Id);
      data.append('client_secret', AUTH0_Client_Secreate);
      data.append('code', code);
      data.append('redirect_uri', login_redirect);

      const response = await axios({
        method: 'post',
        url: `https://${AUTH0_Domain_Name}/oauth/token`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: data,
      });

      const token = response.data.access_token;
      setAccessTkn(token);
      setItemWithTTL('bearerToken', token, 23);
      await userMeData(token);
    } catch (error) {
      console.error('Error fetching auth token:', error);
      if (
        pathname &&
        pathname !== '/template' &&
        !pathname.startsWith('/template/')
      ) {
        loginHandler();
      }
    }
  };

  const loginHandler = () => {
    try {
      window.location.href = `https://${AUTH0_Domain_Name}/authorize?response_type=code&client_id=${AUTH0_Client_Id}&redirect_uri=${login_redirect}&scope=${encodeURIComponent('openid profile email')}`;
    } catch (error) {
      console.error('Login redirect error:', error);
    }
  };

  // Initialize auth state
  // React.useEffect(() => {
  //   if (typeof window !== 'undefined') {
  //     const token = getItemWithTTL('bearerToken');
  //     if (token) {
  //       setAccessTkn(token);
  //       userMeData(token);
  //     } else if (pathname && pathname !== '/template' && !pathname.startsWith('/template/')) {
  //       loginHandler();
  //     }
  //   }
  // }, [pathname]);

  // Handle auth code from URL
  // React.useEffect(() => {
  //   if (typeof window !== 'undefined') {
  //     const urlParams = new URLSearchParams(window.location.search);
  //     const parsedAuthCode = urlParams.get('code');

  //     if (parsedAuthCode && !accessTkn) {
  //       fetchAuthToken(parsedAuthCode);
  //     }
  //   }
  // }, [accessTkn]);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
