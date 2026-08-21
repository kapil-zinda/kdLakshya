'use client';

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ConfirmOptions {
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

type ConfirmFn = (
  message: string,
  options?: ConfirmOptions,
) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

/**
 * Promise-based replacement for window.confirm() — mounted once in
 * layout.tsx. Lets `if (!(await confirm(msg))) return;` read the same as
 * the native call it replaces, but through the app's own themed dialog
 * instead of a jarring browser-native popup.
 */
export function ConfirmDialogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<{
    open: boolean;
    message: string;
    options: ConfirmOptions;
  }>({ open: false, message: '', options: {} });
  const resolver = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((message, options = {}) => {
    setState({ open: true, message, options });
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const handleClose = (result: boolean) => {
    setState((s) => ({ ...s, open: false }));
    resolver.current?.(result);
    resolver.current = null;
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Dialog
        open={state.open}
        onOpenChange={(open) => {
          if (!open) handleClose(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{state.options.title || 'Please confirm'}</DialogTitle>
            <DialogDescription>{state.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleClose(false)}>
              {state.options.cancelLabel || 'Cancel'}
            </Button>
            <Button
              variant={state.options.destructive ? 'destructive' : 'default'}
              onClick={() => handleClose(true)}
            >
              {state.options.confirmLabel || 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error('useConfirm must be used within a ConfirmDialogProvider');
  }
  return ctx;
}
