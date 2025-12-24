'use client';

import { useEffect, useRef } from 'react';

import {
  ApiService,
  transformApiDataToOrganizationConfig,
} from '@/services/api';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setOrganizationData,
  setOrganizationError,
  setOrganizationLoading,
} from '@/store/slices/organizationSlice';
import { getTargetSubdomain } from '@/utils/subdomainUtils';

import { useUserDataRedux } from './useUserDataRedux';

/**
 * Hook to fetch and cache organization data in Redux
 * Data is fetched once and persists across page navigation
 */
export function useOrganizationData() {
  const dispatch = useAppDispatch();
  const { userData } = useUserDataRedux();
  const { data, loading, error, lastFetched } = useAppSelector(
    (state) => state.organization,
  );
  const fetchingRef = useRef(false);

  useEffect(() => {
    const loadOrganizationData = async () => {
      console.log('useOrganizationData effect running:', {
        hasData: !!data,
        loading,
        fetchingRef: fetchingRef.current,
        lastFetched,
      });

      // Don't fetch if we already have data that's less than 5 minutes old
      const FIVE_MINUTES = 5 * 60 * 1000;
      if (data && lastFetched && Date.now() - lastFetched < FIVE_MINUTES) {
        console.log('Using cached organization data');
        return;
      }

      // Don't fetch if already fetching (use ref instead of loading state)
      if (fetchingRef.current) {
        console.log('Already fetching organization data, skipping...');
        return;
      }

      try {
        console.log('Fetching organization data...');
        fetchingRef.current = true;
        dispatch(setOrganizationLoading(true));

        const targetSubdomain = await getTargetSubdomain(
          userData?.orgId,
          userData?.accessToken,
        );
        console.log('Target subdomain:', targetSubdomain);

        const apiData = await ApiService.fetchAllData(targetSubdomain);
        const transformedData = transformApiDataToOrganizationConfig(apiData);

        dispatch(setOrganizationData(transformedData));
        console.log('Organization data cached in Redux');
      } catch (err) {
        console.error('Failed to load organization data:', err);
        dispatch(
          setOrganizationError(
            err instanceof Error ? err.message : 'Failed to load data',
          ),
        );
      } finally {
        fetchingRef.current = false;
      }
    };

    loadOrganizationData();
  }, [userData, data, lastFetched, dispatch]);

  return {
    organizationData: data,
    loading,
    error,
  };
}
