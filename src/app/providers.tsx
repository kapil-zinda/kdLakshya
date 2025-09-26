'use client';

import * as React from 'react';

import { usePathname } from 'next/navigation';

import { ApiService } from '@/services/api';
import axios from 'axios';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';

import { updateUserData } from './interfaces/userInterface';

const AUTH0_Client_Id = process.env.NEXT_PUBLIC_AUTH0_Client_Id || '';
const AUTH0_Client_Secret = process.env.NEXT_PUBLIC_AUTH0_Client_Secret || '';
const AUTH0_Domain_Name = process.env.NEXT_PUBLIC_Auth0_DOMAIN_NAME || '';
const login_redirect = process.env.NEXT_PUBLIC_AUTH0_LOGIN_REDIRECT_URL || '';

export function Providers({ children }: ThemeProviderProps) {
  const [accessTkn, setAccessTkn] = React.useState<string | null>(null);
  const [isProcessingCode, setIsProcessingCode] = React.useState(false);
  const [isRedirecting, setIsRedirecting] = React.useState(false);
  const pathname = usePathname();

  const redirectToOrgSubdomain = async (
    orgId: string,
    accessToken?: string,
  ) => {
    console.log('🔧 redirectToOrgSubdomain CALLED with:', {
      orgId,
      hasToken: !!accessToken,
    });
    try {
      // Show loader during redirect
      setIsRedirecting(true);
      console.log('🔧 Set isRedirecting to true');

      // Get organization data to determine subdomain
      console.log('🔧 Fetching organization data for orgId:', orgId);
      const orgData = await ApiService.getOrganizationById(orgId, accessToken);
      console.log('🔧 Raw organization response:', orgData);
      const expectedSubdomain = orgData.data.attributes.subdomain;
      console.log('🔧 Extracted subdomain:', expectedSubdomain);

      console.log('🔄 Redirecting user to org subdomain:', expectedSubdomain);

      if (expectedSubdomain) {
        // Check current subdomain to avoid unnecessary redirects
        const currentHost = window.location.host;
        const currentHostParts = currentHost.split('.');
        const currentSubdomain =
          currentHostParts.length > 2 ? currentHostParts[0] : null;

        console.log(
          '🌐 Current subdomain:',
          currentSubdomain,
          'Expected:',
          expectedSubdomain,
        );
        console.log('🌐 Current host:', currentHost);
        console.log('🌐 Host parts:', currentHostParts);

        // Only redirect if user is on wrong subdomain
        if (currentSubdomain !== expectedSubdomain) {
          console.log('🚀 SUBDOMAIN MISMATCH - INITIATING REDIRECT');
          console.log('🚀 From:', currentSubdomain, 'To:', expectedSubdomain);
          const isLocalhost =
            currentHost.includes('localhost') ||
            currentHost.includes('127.0.0.1');

          // Pass the access token via URL hash for cross-subdomain authentication
          const tokenParam = accessToken
            ? `#access_token=${encodeURIComponent(accessToken)}`
            : '';

          if (isLocalhost) {
            // For development, redirect to subdomain on localhost
            const port = currentHost.split(':')[1] || '3000';
            const redirectUrl = `http://${expectedSubdomain}.localhost:${port}${tokenParam}`;
            console.log('🖥️ LOCALHOST REDIRECT TO:', redirectUrl);
            window.location.href = redirectUrl;
          } else {
            // For production, redirect to the actual subdomain
            const domain = currentHost.split('.').slice(1).join('.'); // Get base domain
            const redirectUrl = `https://${expectedSubdomain}.${domain}${tokenParam}`;
            console.log('🌍 PRODUCTION REDIRECT TO:', redirectUrl);
            console.log('🌍 Domain calculated as:', domain);
            console.log('🌍 Full redirect URL:', redirectUrl);
            console.log('🌍 Including access token in URL hash');

            // Add a small delay to ensure logs are visible
            setTimeout(() => {
              console.log('🌍 EXECUTING REDIRECT NOW...');
              window.location.href = redirectUrl;
            }, 100);
          }
        } else {
          // User is already on correct subdomain, just go to dashboard
          console.log('User already on correct subdomain, going to dashboard');
          setIsRedirecting(false);
          window.location.href = '/dashboard';
        }
      } else {
        // Fallback to dashboard if no subdomain found
        console.log('No subdomain found, going to dashboard');
        setIsRedirecting(false);
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Error fetching organization data for redirect:', error);
      // Fallback to dashboard on error
      setIsRedirecting(false);
      window.location.href = '/dashboard';
    }
  };

  const userMeData = async (
    bearerToken: string,
    shouldRedirect: boolean = false,
  ) => {
    if (!bearerToken) return;

    try {
      const res = await axios.get(
        `https://apis.testkdlakshya.uchhal.in/auth/users/me?include=permission`,
        {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const userData = res.data.data; // Extract from nested structure
      const attributes = userData.attributes;
      const permissions = res.data.data.user_permissions || {};

      // Handle both possible field names for org ID
      const orgId = attributes.org_id || attributes.org;
      console.log('🔍 Provider: Raw attributes:', attributes);
      console.log('🏢 Provider: Extracted orgId:', orgId);

      updateUserData({
        userId: attributes.user_id || attributes.id,
        keyId: 'user-' + (attributes.user_id || attributes.id),
        orgKeyId: 'org-' + orgId,
        orgId: orgId,
        userEmail: attributes.email,
        firstName: attributes.first_name || attributes.name?.split(' ')[0],
        lastName:
          attributes.last_name ||
          attributes.name?.split(' ').slice(1).join(' '),
        permission: permissions,
        allowedTeams: Object.keys(permissions || {})
          .filter((key) => key.startsWith('team-'))
          .map((key) => key.match(/team-(\d+)/)?.[1])
          .filter(Boolean) as string[],
      });

      // Only redirect on initial login, not when navigating back to homepage
      if (shouldRedirect && orgId) {
        console.log('🚀 CALLING redirectToOrgSubdomain with orgId:', orgId);
        console.log('🚀 shouldRedirect:', shouldRedirect);
        console.log('🚀 bearerToken exists:', !!bearerToken);
        await redirectToOrgSubdomain(orgId, bearerToken);
      } else {
        console.log('❌ NOT calling redirectToOrgSubdomain:', {
          shouldRedirect,
          orgId,
          hasToken: !!bearerToken,
        });
      }
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
        console.log('Token expired, removing from storage');
        localStorage.removeItem(key);
        setAccessTkn(null);
        return null;
      }

      // Check if token expires soon (within 5 minutes)
      const fiveMinutes = 5 * 60 * 1000;
      if (now > item.expiry - fiveMinutes) {
        console.log('Token expires soon, should refresh');
        // TODO: Implement token refresh here
      }

      return item.value;
    } catch (e) {
      console.log('Error parsing token from storage:', e);
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
      const expiresIn = response.data.expires_in || 3600; // Default to 1 hour if not provided
      const expiresInHours = Math.max(1, Math.floor(expiresIn / 3600)); // Convert seconds to hours, minimum 1 hour

      console.log(
        'Token expires in:',
        expiresIn,
        'seconds (',
        expiresInHours,
        'hours)',
      );
      setAccessTkn(token);
      setItemWithTTL('bearerToken', token, expiresInHours);

      // Mark code as processed temporarily
      sessionStorage.setItem('authCodeProcessed', 'true');

      // Only redirect immediately after OAuth callback, not on normal homepage visits
      const wasAuthCallback = sessionStorage.getItem('isAuthCallback');
      console.log('🔍 Auth callback check:', {
        pathname: window.location.pathname,
        wasAuthCallback: !!wasAuthCallback,
        fullUrl: window.location.href,
        currentHost: window.location.host,
      });

      // Check if this is SLS domain and should trigger redirect
      const currentHost = window.location.host;
      const isSlsOrLocalhost =
        currentHost.includes('sls.') ||
        currentHost.includes('localhost') ||
        currentHost.includes('127.0.0.1');

      if (
        window.location.pathname === '/' &&
        wasAuthCallback &&
        isSlsOrLocalhost
      ) {
        console.log(
          '✅ This is an auth callback on SLS - will trigger redirect',
        );
        sessionStorage.removeItem('isAuthCallback'); // Clear the flag
        await userMeData(token, true); // Pass true to trigger subdomain redirect
      } else {
        console.log(
          '❌ Not an auth callback, not on SLS, or not on homepage - no redirect',
          {
            isHomepage: window.location.pathname === '/',
            wasAuthCallback: !!wasAuthCallback,
            isSlsOrLocalhost,
          },
        );
        await userMeData(token, false); // Don't redirect for normal visits
      }
    } catch (error) {
      console.error('Error fetching auth token:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
      }
      sessionStorage.setItem('authCodeProcessed', 'true');
      loginHandler();
    } finally {
      setIsProcessingCode(false);
    }
  };

  const loginHandler = () => {
    try {
      // Clear all auth state for fresh start
      sessionStorage.removeItem('authCodeProcessed');
      localStorage.removeItem('bearerToken');
      localStorage.removeItem('authState');
      localStorage.removeItem('codeVerifier');
      setAccessTkn(null);

      console.log(
        'Initiating login to:',
        `https://${AUTH0_Domain_Name}/authorize`,
      );
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
          userMeData(token, false); // Don't redirect on page load
        }
      }
    }
  }, []);

  // Handle auth code from URL
  React.useEffect(() => {
    if (typeof window !== 'undefined' && !isProcessingCode) {
      const urlParams = new URLSearchParams(window.location.search);
      const parsedAuthCode = urlParams.get('code');
      const codeProcessed = sessionStorage.getItem('authCodeProcessed');

      console.log('Auth code check:', {
        parsedAuthCode: !!parsedAuthCode,
        accessTkn: !!accessTkn,
        hasToken: !!getItemWithTTL('bearerToken'),
        codeProcessed: !!codeProcessed,
      });

      if (
        parsedAuthCode &&
        !accessTkn &&
        !getItemWithTTL('bearerToken') &&
        !codeProcessed
      ) {
        console.log('Processing auth code...');
        // Mark this as an auth callback so we can redirect after token exchange
        sessionStorage.setItem('isAuthCallback', 'true');

        // Clear the code from URL immediately to prevent reprocessing
        const newUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);

        fetchAuthToken(parsedAuthCode);
      }
    }
  }, [accessTkn, isProcessingCode]);

  // Show loader when processing auth code or redirecting
  if (isProcessingCode || isRedirecting) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900">
              {isProcessingCode
                ? 'Authenticating...'
                : 'Redirecting to your organization...'}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {isProcessingCode
                ? 'Please wait while we verify your credentials'
                : 'Please wait while we take you to the right place'}
            </p>
          </div>
        </div>
      </div>
    );
  }

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
