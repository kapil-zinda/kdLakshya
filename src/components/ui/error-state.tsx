import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';

export interface ErrorStateProps {
  /** What went wrong, in the user's terms - not the raw exception message. */
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

/**
 * A failed fetch used to mean either a blank screen or, in several places,
 * a raw `alert(err.message)` - so a Mongo timeout or a stack trace could
 * land directly in front of a parent or student. This is the one place a
 * caught error should be shown to a user: a plain explanation and, when the
 * failure might be transient, a retry.
 */
export function ErrorState({
  title = 'Something went wrong',
  description = 'Please try again in a moment.',
  onRetry,
  retryLabel = 'Try again',
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-6 py-12 text-center',
        className,
      )}
    >
      <AlertTriangle
        className="h-10 w-10 text-destructive"
        aria-hidden="true"
      />
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {onRetry ? (
        <Button size="sm" variant="outline" onClick={onRetry} className="mt-2">
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}
