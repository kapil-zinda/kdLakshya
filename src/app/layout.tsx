import '../styles/globals.css';
import { Analytics } from "@vercel/analytics/react";

import type { Metadata } from 'next';
// import type { Viewport } from 'next'
import { Inter } from 'next/font/google';
import { Providers } from "./providers";
import HeaderMobile from '@/components/header-mobile';
import MarginWidthWrapper from '@/components/margin-width-wrapper';
import PageWrapper from '@/components/page-wrapper';
import SideNav from '@/components/globalComponents/SideNav';
import Header from '@/components/globalComponents/Header';
import MobileNav from '@/components/globalComponents/MobileNav';
import UserMenu from '@/components/globalComponents/UserMenu';
import { NewSideBar } from '@/components/sidebar/NewSideBar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title:
    "10k Hours",
  description:
    "Elevate your productivity with 10k Hours — simplifying task management with seamless efficiency and mastering your time effectively.",
  authors: [
    { name: "ansh chaudhary" },
    {
      name: "kapil chaudhary"
    },
    {
      name: "rishabh gaud"
    }
  ],
  icons: [
    { rel: "apple-touch-icon", url: "/icons/icon-192x192.png" },
    { rel: "icon", url: "/icons/icon-192x192.png" },
    { rel: "favicon", url: "/icons/favicon.ico" },
  ],
};

// export const viewport: Viewport = {
//   themeColor: "#ffffff",
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
      <Providers>
      <div className="grid min-h-screen w-full ">
            {/* <SideNav /> */}
            <div className="flex flex-col">
              {/* <Header />
              <MobileNav />
              <UserMenu /> */}
              <main className="flex-1 p-4 lg:gap-6 lg:p-6">
                <NewSideBar>{children}</NewSideBar>
              </main>
            </div>
          </div>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
