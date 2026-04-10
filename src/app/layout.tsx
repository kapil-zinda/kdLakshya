import '../styles/globals.css';

import { Analytics } from '@vercel/analytics/react';

import 'react-toastify/dist/ReactToastify.css';

import type { Metadata } from 'next';
import {
  Inter,
  Lato,
  Montserrat,
  Open_Sans,
  Pacifico,
  Poppins,
  Press_Start_2P,
  Roboto,
} from 'next/font/google';

import { ConditionalLayout } from '@/components/layout/ConditionalLayout';
import { ThemedToastContainer } from '@/components/ui/ThemedToastContainer';
import { ReduxProvider } from '@/store/ReduxProvider';

import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto',
});
const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-open-sans',
});
const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-lato',
});
const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-montserrat',
});
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});
const pressStart2P = Press_Start_2P({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-press-start-2p',
});
const pacifico = Pacifico({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-pacifico',
});

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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${roboto.variable} ${openSans.variable} ${lato.variable} ${montserrat.variable} ${poppins.variable} ${pressStart2P.variable} ${pacifico.variable} ${inter.className}`}
      >
        <ReduxProvider>
          <Providers>
            <ConditionalLayout>{children}</ConditionalLayout>
          </Providers>
        </ReduxProvider>
        <Analytics />
        <ThemedToastContainer />
      </body>
    </html>
  );
}
