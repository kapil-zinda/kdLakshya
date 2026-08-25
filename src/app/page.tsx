'use client';

import { useCallback, useEffect, useRef } from 'react';

import { useRouter } from 'next/navigation';

import { OrganizationTemplate } from '@/components/template/OrganizationTemplate';
import { useOrganizationData } from '@/hooks/useOrganizationData';

export default function Home() {
  const { organizationData, loading } = useOrganizationData();
  const router = useRouter();
  const hasInitialized = useRef(false);

  // Auth callback processing (Auth0 access_token / student_auth in the URL
  // hash) used to live here too, duplicating what Providers.tsx already does
  // globally for every route - and this copy is what forced the extra
  // homepage stopover on the way to a dashboard (see R3 fix, 2026-08-25).
  // Every login flow now redirects straight to its canonical dashboard route
  // with the hash attached, so Providers' single global handler processes it
  // on arrival there; this page no longer needs its own copy. What's left
  // here is homepage-specific: bounce an already-logged-in student away from
  // the marketing page to their dashboard.
  const checkStudentAuth = useCallback(() => {
    // Check if user is logged in as a student and redirect accordingly
    const studentAuth = localStorage.getItem('studentAuth');
    if (studentAuth) {
      try {
        JSON.parse(studentAuth); // Validate JSON
        console.log(
          '👨‍🎓 Student authenticated, redirecting to student dashboard',
        );
        router.push('/student-dashboard');
        return true;
      } catch (error) {
        console.error('Error parsing student auth:', error);
        localStorage.removeItem('studentAuth');
      }
    }
    return false;
  }, [router]);

  useEffect(() => {
    // Prevent infinite loop - only run once on mount
    if (hasInitialized.current) {
      return;
    }
    hasInitialized.current = true;

    // Check if student is already authenticated
    checkStudentAuth();
    // checkStudentAuth is useCallback-stable, and the hasInitialized ref
    // above keeps this to a single run regardless.
  }, [checkStudentAuth]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!organizationData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            No Data Available
          </h1>
          <p className="text-muted-foreground">
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
