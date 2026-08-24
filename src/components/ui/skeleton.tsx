import { cn } from '@/lib/utils';

/**
 * A placeholder that mirrors the shape of the content it stands in for,
 * shown while data is loading. Nothing in this codebase rendered anything
 * for a pending fetch before this - the screen was just blank until data
 * arrived, which reads as broken rather than as "working on it".
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
}

export { Skeleton };
