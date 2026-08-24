import Link from 'next/link';

import { Button } from '@/components/ui/button';

/**
 * The App Router's built-in fallback for an unmatched route was a bare,
 * unstyled "404" - no way back into the app, and no indication this is a
 * dead link rather than the app itself being broken.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="text-2xl font-semibold text-foreground">Page not found</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        The page you&rsquo;re looking for doesn&rsquo;t exist or may have been
        moved.
      </p>
      <Button asChild className="mt-2">
        <Link href="/">Go home</Link>
      </Button>
    </div>
  );
}
