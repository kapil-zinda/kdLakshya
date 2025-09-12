'use client';

import { useEffect, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { OrganizationTemplate } from '@/components/template/OrganizationTemplate';
import {
  ApiService,
  transformApiDataToOrganizationConfig,
} from '@/services/api';
import { OrganizationConfig } from '@/types/organization';
import { getSubdomain } from '@/utils/subdomainUtils';

export default function Home() {
  const [organizationData, setOrganizationData] =
    useState<OrganizationConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleAuth0Callback = () => {
    try {
      // Check for token in URL hash (implicit flow)
      const hash = window.location.hash.substring(1);
      const hashParams = new URLSearchParams(hash);
      const accessToken = hashParams.get('access_token');

      if (accessToken) {
        // Store token in localStorage with TTL
        localStorage.setItem(
          'bearerToken',
          JSON.stringify({
            value: accessToken,
            expiry: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
          }),
        );

        // Clean URL and redirect to dashboard
        window.history.replaceState({}, '', '/');
        router.push('/dashboard');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Auth callback error:', error);
      window.history.replaceState({}, '', '/');
      return false;
    }
  };

  const loadDataFromAPI = async () => {
    try {
      setLoading(true);
      console.log('Fetching data from APIs...');

      // Get current subdomain from URL or fallback methods
      const subdomain = getSubdomain();
      console.log('Detected subdomain:', subdomain);

      // Fetch all API data in sequence
      const apiData = await ApiService.fetchAllData(subdomain || 'sls');
      console.log('API Data received:', apiData);

      // Transform API data to OrganizationConfig format
      const transformedData = transformApiDataToOrganizationConfig(apiData);
      console.log('Transformed data:', transformedData);

      setOrganizationData(transformedData);
    } catch (error) {
      console.error('Failed to load API data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if this is an Auth0 callback with token in hash
    if (window.location.hash.includes('access_token')) {
      handleAuth0Callback();
      return;
    }

    // Try to load data from API first
    loadDataFromAPI();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-gray-600">Loading data from APIs...</p>
        </div>
      </div>
    );
  }

  if (!organizationData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            No Data Available
          </h1>
          <p className="text-gray-600">
            Unable to load organization data from API
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Debug indicator to show data source */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-0 right-0 z-50 bg-blue-500 text-white px-3 py-1 text-xs">
          API Data
        </div>
      )}
      <OrganizationTemplate data={organizationData} />
    </>
  );
}
