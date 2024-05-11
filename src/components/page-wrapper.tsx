"use client"
import { ReactNode } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';

export default function PageWrapper({ children }: { children: ReactNode }) {

  const { user, error, isLoading } = useUser();
  console.log("user>>>>> ", user)
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;
  return (
    <div className="flex flex-col pt-2 px-4 space-y-2 flex-grow pb-4">
      {children}
      <a href="/api/auth/login" style={{}}>Login</a>
     { user && (
      <div>
        <img src={user.picture} alt={user.name} />
        <h2>{user.name}</h2>
        <p>{user.email}</p>
        <a href="/api/auth/logout">Logout</a>
      </div>
    )}
    </div>

  );
}
