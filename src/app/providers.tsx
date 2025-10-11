'use client';

import * as React from 'react';

import { usePathname } from 'next/navigation';

import { ApiService } from '@/services/api';
import { getAuthHeaders, isStudentUser } from '@/utils/authHeaders';
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
    try {
      // Show loader during redirect
      setIsRedirecting(true);

      // Get organization data to determine subdomain
      const orgData = await ApiService.getOrganizationById(orgId, accessToken);
      const expectedSubdomain = orgData.data.attributes.subdomain;

      if (expectedSubdomain) {
        // Check current subdomain to avoid unnecessary redirects
        const currentHost = window.location.host;
        const currentHostParts = currentHost.split('.');
        const currentSubdomain =
          currentHostParts.length > 2 ? currentHostParts[0] : null;

        // Only redirect if user is on wrong subdomain or on AUTH
        const isOnAuth = currentSubdomain === 'auth';
        const needsRedirect =
          currentSubdomain !== expectedSubdomain || isOnAuth;

        if (needsRedirect) {
          const isLocalhost =
            currentHost.includes('localhost') ||
            currentHost.includes('127.0.0.1');

          // Pass the access token via URL hash for cross-subdomain authentication
          const tokenParam = accessToken
            ? `#access_token=${encodeURIComponent(accessToken)}`
            : '';

          if (isLocalhost) {
            // For development, redirect to subdomain on localhost with dashboard
            const port = currentHost.split(':')[1] || '3000';
            const redirectUrl = `http://${expectedSubdomain}.localhost:${port}/dashboard${tokenParam}`;
            window.location.href = redirectUrl;
          } else {
            // For production, redirect to the actual subdomain with dashboard
            const domain = currentHost.split('.').slice(1).join('.'); // Get base domain
            const redirectUrl = `https://${expectedSubdomain}.${domain}/dashboard${tokenParam}`;

            // Add a small delay to ensure logs are visible
            window.location.href = redirectUrl;
          }
        } else {
          // User is already on correct subdomain, just go to dashboard
          setIsRedirecting(false);
          // Use router.push instead of window.location.href to stay on current domain
          window.location.href = '/dashboard';
        }
      } else {
        // Fallback to dashboard if no subdomain found
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

    // Skip /users/me call for students as we already have their data
    if (isStudentUser()) {
      console.log('Student user detected, skipping /users/me call');
      return;
    }

    try {
      // Get auth headers (will use Bearer for admin/teachers)
      const authHeaders = getAuthHeaders();

      const res = await axios.get(
        `https://apis.testkdlakshya.uchhal.in/auth/users/me?include=permission`,
        {
          headers: {
            ...authHeaders,
            'Content-Type': 'application/json',
          },
        },
      );

      const userData = res.data.data; // Extract from nested structure
      const attributes = userData.attributes;
      const permissions = res.data.data.user_permissions || {};

      // Handle both possible field names for org ID
      const orgId = attributes.org_id || attributes.org;

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

      // Only redirect if explicitly requested and has org ID
      if (shouldRedirect && orgId) {
        await redirectToOrgSubdomain(orgId, bearerToken);
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
      // Use dynamic redirect URI based on current domain
      const tokenExchangeHost = window.location.host;
      const tokenIsLocalhost =
        tokenExchangeHost.includes('localhost') ||
        tokenExchangeHost.includes('127.0.0.1');
      const dynamicRedirectUri = tokenIsLocalhost
        ? login_redirect
        : `https://${tokenExchangeHost}/`;

      data.append('redirect_uri', dynamicRedirectUri);

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

      // Check if this is an auth callback that should trigger redirect to dashboard
      const currentHost = window.location.host;
      const isLocalhost =
        currentHost.includes('localhost') || currentHost.includes('127.0.0.1');

      if (window.location.pathname === '/' && wasAuthCallback) {
        sessionStorage.removeItem('isAuthCallback'); // Clear the flag

        // Get user data first to determine their organization
        await userMeData(token, false); // Don't auto-redirect in userMeData

        // Skip redirect logic for students
        if (isStudentUser()) {
          console.log(
            'Student user detected, skipping organization subdomain redirect',
          );
          return;
        }

        // Get user's organization subdomain from their orgId
        let userOrgSubdomain = null;
        try {
          // Get auth headers
          const authHeaders = getAuthHeaders();

          // Get user data from the API to find their orgId
          const userResponse = await axios.get(
            `https://apis.testkdlakshya.uchhal.in/auth/users/me?include=permission`,
            {
              headers: {
                ...authHeaders,
                'Content-Type': 'application/json',
              },
            },
          );

          const userData = userResponse.data.data;
          const orgId = userData.attributes.org_id || userData.attributes.org;

          if (orgId) {
            // Fetch organization data to get the subdomain
            const orgResponse = await axios.get(
              `https://apis.testkdlakshya.uchhal.in/auth/organizations/${orgId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              },
            );

            userOrgSubdomain = orgResponse.data.data.attributes.subdomain;
          }
        } catch (error) {
          console.error('❌ Error fetching user organization:', error);
        }

        const currentSubdomain = currentHost.split('.')[0];

        // Redirect to user's organization subdomain if different from current
        if (
          userOrgSubdomain &&
          userOrgSubdomain !== currentSubdomain &&
          !isLocalhost
        ) {
          // Redirect to the user's organization subdomain
          const domain = currentHost.split('.').slice(1).join('.');
          const redirectUrl = `https://${userOrgSubdomain}.${domain}/dashboard#access_token=${encodeURIComponent(token)}`;
          sessionStorage.removeItem('loginOriginSubdomain');
          window.location.href = redirectUrl;
        } else {
          // Stay on current domain but go to dashboard
          window.location.href = '/dashboard';
        }
      } else {
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

      // Use dynamic redirect URI based on current domain
      const loginHost = window.location.host;
      const loginIsLocalhost =
        loginHost.includes('localhost') || loginHost.includes('127.0.0.1');
      const loginRedirectUri = loginIsLocalhost
        ? login_redirect
        : `https://${loginHost}/`;

      console.log(
        'Initiating login to:',
        `https://${AUTH0_Domain_Name}/authorize`,
      );
      console.log('Using redirect URI:', loginRedirectUri);

      window.location.href = `https://${AUTH0_Domain_Name}/authorize?response_type=code&client_id=${AUTH0_Client_Id}&redirect_uri=${encodeURIComponent(loginRedirectUri)}&scope=${encodeURIComponent('openid profile email')}`;
    } catch (error) {
      console.error('Login redirect error:', error);
    }
  };

  // Initialize auth state
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check for access token in URL hash first (from cross-subdomain redirect)
      const urlHash = window.location.hash;
      const hashParams = new URLSearchParams(urlHash.substring(1));
      const tokenFromHash = hashParams.get('access_token');

      if (tokenFromHash) {
        console.log('🔑 Found access token in URL hash, storing it');
        setAccessTkn(tokenFromHash);
        setItemWithTTL('bearerToken', tokenFromHash, 24); // Store for 24 hours

        // Clean the URL by removing the hash
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname + window.location.search,
        );

        // Load user data with this token
        userMeData(tokenFromHash, false);
        return;
      }

      // Check for stored token
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
