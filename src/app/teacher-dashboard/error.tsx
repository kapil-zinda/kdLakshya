'use client';

import { useEffect } from 'react';

import { ErrorState } from '@/components/ui/error-state';

export default function TeacherDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6">
      <ErrorState
        title="This page couldn't be loaded"
        description="Something went wrong loading this data. Try again, or reload the dashboard."
        onRetry={reset}
      />
    </div>
  );
}
