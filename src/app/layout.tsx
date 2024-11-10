import '../styles/globals.css';

import { Analytics } from '@vercel/analytics/react';
import { ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { NewSideBar } from '@/components/sidebar/NewSideBar';

import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '10k-hours',
  description:
    'Elevate your productivity with 10k-hours — simplifying task management with seamless efficiency and mastering your time effectively.',
  authors: [
    { name: 'ansh chaudhary' },
    {
      name: 'kapil chaudhary',
    },
    {
      name: 'rishabh gaud',
    },
  ],
  icons: [
    { rel: 'apple-touch-icon', url: '/icons/icon-192x192.png' },
    { rel: 'icon', url: '/icons/icon-192x192.png' },
    { rel: 'favicon', url: '/icons/favicon.ico' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="grid min-h-screen w-full ">
          <div className="flex flex-col">
            <main className="flex-1 p-4 lg:gap-6 lg:p-6">
              <Providers>
                <NewSideBar>{children}</NewSideBar>
                {/* <HomePageComponent /> */}
                {/* {children} */}
              </Providers>
            </main>
          </div>
        </div>
        <Analytics />
        <ToastContainer />
      </body>
    </html>
  );
}
