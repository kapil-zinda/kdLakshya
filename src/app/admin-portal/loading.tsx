import { Skeleton } from '@/components/ui/skeleton';

export default function AdminPortalLoading() {
  return (
    <div className="flex min-h-[50vh] flex-col gap-4 p-6">
      <Skeleton className="h-8 w-1/4" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
