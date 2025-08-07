import '../../styles/globals.css';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Organization Template',
  description: 'Professional website template for organizations',
};

export default function TemplateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-white`} suppressHydrationWarning>
        <div className="min-h-screen bg-white">{children}</div>
      </body>
    </html>
  );
}
