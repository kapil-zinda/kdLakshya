import '../../styles/globals.css';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { ChatWidget } from '@/components/chat/ChatWidget';

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
  // Context data that could be passed to the chat widget
  const contextData = {
    platform: 'Educational Platform',
    organization: 'SHREE LAHARI SINGH MEMO. INTER COLLEGE',
    location: 'GHANGHAULI, ALIGARH',
    supportType: 'Student Support',
    features: [
      'Academic support',
      'Assignment help',
      'Study guidance',
      'Platform navigation',
      'General queries',
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-white`} suppressHydrationWarning>
        <div className="min-h-screen bg-white">
          {children}
          <ChatWidget contextData={contextData} />
        </div>
      </body>
    </html>
  );
}
