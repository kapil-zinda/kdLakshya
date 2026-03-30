'use client';

import { useCallback, useEffect, useRef } from 'react';

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
  const hasFetchedRef = useRef(false);

  // Use refs to access current values without triggering re-renders
  const dataRef = useRef(data);
  const lastFetchedRef = useRef(lastFetched);

  // Keep refs in sync with state
  useEffect(() => {
    dataRef.current = data;
    lastFetchedRef.current = lastFetched;
  }, [data, lastFetched]);

  const loadOrganizationData = useCallback(async () => {
    // Don't fetch if we already have data that's less than 5 minutes old
    const FIVE_MINUTES = 5 * 60 * 1000;
    if (
      dataRef.current &&
      lastFetchedRef.current &&
      Date.now() - lastFetchedRef.current < FIVE_MINUTES
    ) {
      return;
    }

    // Don't fetch if already fetching
    if (fetchingRef.current) {
      return;
    }

    // Don't fetch if we've already fetched in this session
    if (hasFetchedRef.current && dataRef.current) {
      return;
    }

    try {
      fetchingRef.current = true;
      hasFetchedRef.current = true;
      dispatch(setOrganizationLoading(true));

      const targetSubdomain = await getTargetSubdomain(
        userData?.orgId,
        userData?.accessToken,
      );

      const apiData = await ApiService.fetchAllData(targetSubdomain);
      const transformedData = transformApiDataToOrganizationConfig(apiData);

      dispatch(setOrganizationData(transformedData));
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
  }, [userData?.orgId, userData?.accessToken, dispatch]);

  useEffect(() => {
    loadOrganizationData();
    // Only depend on the memoized callback, not on data/lastFetched
  }, [loadOrganizationData]);

  return {
    organizationData: data,
    loading,
    error,
  };
}
