'use client';

import { useEffect, useState } from 'react';

import { OrganizationTemplate } from '@/components/template/OrganizationTemplate';
import {
  ApiService,
  transformApiDataToOrganizationConfig,
} from '@/services/api';
import { OrganizationConfig } from '@/types/organization';
import { getSubdomain } from '@/utils/subdomainUtils';

export default function TemplatePage() {
  const [organizationData, setOrganizationData] =
    useState<OrganizationConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDataFromAPI = async () => {
    try {
      setLoading(true);
      const subdomain = getSubdomain();
      const apiData = await ApiService.fetchAllData(subdomain || 'auth');
      const transformedData = transformApiDataToOrganizationConfig(apiData);
      setOrganizationData(transformedData);
    } catch (error) {
      console.error('Failed to load API data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDataFromAPI();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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

  return <OrganizationTemplate data={organizationData} />;
}
