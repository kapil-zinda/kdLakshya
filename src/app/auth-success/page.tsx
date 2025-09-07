'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

export default function AuthSuccess() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthSuccess = async () => {
      try {
        // Get the access token from the API
        const response = await fetch('/api/auth/token');
        if (response.ok) {
          const { accessToken } = await response.json();

          if (accessToken) {
            // Store token in localStorage with TTL
            localStorage.setItem(
              'bearerToken',
              JSON.stringify({
                value: accessToken,
                expiry: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
              }),
            );
          }
        }

        // Redirect to dashboard
        router.push('/dashboard');
      } catch (error) {
        console.error('Auth success error:', error);
        router.push('/');
      }
    };

    handleAuthSuccess();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Completing Login...
        </h2>
        <p className="text-gray-600">
          Please wait while we set up your session.
        </p>
      </div>
    </div>
  );
}
