'use client';

import * as React from 'react';

import { usePathname } from 'next/navigation';

import axios from 'axios';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';

import { updateUserData } from './interfaces/userInterface';

const BaseURLAuth = process.env.NEXT_PUBLIC_BaseURLAuth || '';
const AUTH0_Client_Id = process.env.NEXT_PUBLIC_AUTH0_Client_Id || '';
const AUTH0_Client_Secret = process.env.NEXT_PUBLIC_AUTH0_Client_Secret || '';
const AUTH0_Domain_Name = process.env.NEXT_PUBLIC_Auth0_DOMAIN_NAME || '';
const login_redirect = process.env.NEXT_PUBLIC_AUTH0_LOGIN_REDIRECT_URL || '';

export function Providers({ children }: ThemeProviderProps) {
  const [accessTkn, setAccessTkn] = React.useState<string | null>(null);
  const [isClient, setIsClient] = React.useState(false);
  const [isProcessingCode, setIsProcessingCode] = React.useState(false);
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
    } catch (error) {
      console.error('Error fetching user data:', error);
      // If we get a 401 or 403, the token is invalid
      if (
        axios.isAxiosError(error) &&
        (error.response?.status === 401 || error.response?.status === 403)
      ) {
        localStorage.removeItem('bearerToken');
        setAccessTkn(null);
        loginHandler();
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
    if (isProcessingCode) return;
    setIsProcessingCode(true);

    console.log('Processing auth code:', code);
    console.log('Auth0 Config:', {
      AUTH0_Client_Id,
      AUTH0_Domain_Name,
      login_redirect,
    });

    try {
      const data = new URLSearchParams();
      data.append('grant_type', 'authorization_code');
      data.append('client_id', AUTH0_Client_Id);
      data.append('client_secret', AUTH0_Client_Secret);
      data.append('code', code);
      data.append('redirect_uri', login_redirect);

      console.log('Token request data:', Object.fromEntries(data));

      const response = await axios({
        method: 'post',
        url: `https://${AUTH0_Domain_Name}/oauth/token`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: data,
      });

      console.log('Token response:', response.data);
      const token = response.data.access_token;
      setAccessTkn(token);
      setItemWithTTL('bearerToken', token, 23);

      // Mark code as processed in localStorage to prevent reprocessing
      localStorage.setItem('authCodeProcessed', 'true');

      await userMeData(token);
    } catch (error) {
      console.error('Error fetching auth token:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
      }
      localStorage.setItem('authCodeProcessed', 'true');
      loginHandler();
    } finally {
      setIsProcessingCode(false);
    }
  };

  const loginHandler = () => {
    try {
      // Clear any previous auth processing flags
      localStorage.removeItem('authCodeProcessed');
      window.location.href = `https://${AUTH0_Domain_Name}/authorize?response_type=code&client_id=${AUTH0_Client_Id}&redirect_uri=${login_redirect}&scope=${encodeURIComponent('openid profile email')}`;
    } catch (error) {
      console.error('Login redirect error:', error);
    }
  };

  // Initialize auth state
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = getItemWithTTL('bearerToken');
      if (token) {
        setAccessTkn(token);
        // Only call userMeData if not on dashboard page (DashboardWrapper handles it)
        if (pathname !== '/dashboard') {
          userMeData(token);
        }
      }
    }
  }, []);

  // Handle auth code from URL
  React.useEffect(() => {
    if (typeof window !== 'undefined' && !isProcessingCode) {
      const urlParams = new URLSearchParams(window.location.search);
      const parsedAuthCode = urlParams.get('code');
      const codeProcessed = localStorage.getItem('authCodeProcessed');

      if (
        parsedAuthCode &&
        !accessTkn &&
        !localStorage.getItem('bearerToken') &&
        !codeProcessed
      ) {
        // Clear the code from URL immediately to prevent reprocessing
        const newUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);

        fetchAuthToken(parsedAuthCode);
      }
    }
  }, []);

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
