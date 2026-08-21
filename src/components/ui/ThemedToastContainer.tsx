'use client';

import { useTheme } from 'next-themes';
import { ToastContainer } from 'react-toastify';

export function ThemedToastContainer() {
  const { resolvedTheme } = useTheme();

  return (
    <ToastContainer
      theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
    />
  );
}
