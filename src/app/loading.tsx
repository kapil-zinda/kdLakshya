import { Skeleton } from '@/components/ui/skeleton';

/**
 * Shown automatically by the App Router while this route segment (or any
 * segment nested under it that doesn't declare its own loading.tsx) is
 * fetching data server-side. Before this existed the screen was simply
 * blank until the request resolved.
 */
export default function Loading() {
  return (
    <div className="flex min-h-[50vh] flex-col gap-4 p-6">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    </div>
  );
}
