'use client';

import { useEffect } from 'react';

import { useOrganizationData } from '@/hooks/useOrganizationData';

/**
 * DynamicTitle Component
 *
 * Updates the browser tab title dynamically based on the organization name
 */
export function DynamicTitle() {
  const { organizationData } = useOrganizationData();

  useEffect(() => {
    if (organizationData?.name) {
      document.title = organizationData.name;
    }
  }, [organizationData]);

  return null; // This component doesn't render anything
}
