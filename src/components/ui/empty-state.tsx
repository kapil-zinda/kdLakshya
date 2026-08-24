import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Inbox, type LucideIcon } from 'lucide-react';

export interface EmptyStateProps {
  /** What's missing, in the user's terms - "No students yet", not "No data". */
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

/**
 * A list, table, or grid with nothing in it yet is not an error and should
 * not look like one. This replaces the blank space (or a raw "No data"
 * string) that most pages fell back to with something that explains what's
 * missing and, where there's an obvious next step, offers it directly.
 */
export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-12 text-center',
        className,
      )}
    >
      <Icon className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? (
        <Button size="sm" onClick={action.onClick} className="mt-2">
          {action.label}
        </Button>
      ) : null}
    </div>
  );
}
