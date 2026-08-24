import { PravahaChat } from '@/components/PravahaChat';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

/**
 * Historically branched on pathname to render a sidebar on some routes and
 * not others. That sidebar was removed at some point and both branches were
 * left rendering exactly `{children}` + `<PravahaChat />` - so the ten
 * pathname checks (including one for a `/template` route that does not
 * exist anywhere in this app) had no effect on anything, while still
 * subscribing every navigation to `usePathname()` for no reason. This is
 * what that component actually did at runtime; now it does only that.
 */
export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  return (
    <>
      {children}
      <PravahaChat />
    </>
  );
}
