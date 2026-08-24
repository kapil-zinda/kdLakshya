'use client';

import { useEffect } from 'react';

import { ErrorState } from '@/components/ui/error-state';

/**
 * Catches a render/data error thrown anywhere in this route segment (or a
 * nested one without its own error.tsx) so it becomes a message with a
 * retry, not a blank page or the Next.js dev overlay in production.
 */
export default function Error({
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
        description="Something went wrong while rendering this page. Try again, or come back later."
        onRetry={reset}
      />
    </div>
  );
}
