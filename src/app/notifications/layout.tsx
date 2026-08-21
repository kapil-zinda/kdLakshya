import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Notifications & Announcements',
  description:
    'Latest school announcements — admissions updates, events, and academic notices.',
  keywords: [
    'school announcements',
    'school notices',
    'admission updates',
    'school events',
  ],
  alternates: { canonical: '/notifications' },
  openGraph: {
    title: 'Notifications & Announcements',
    description:
      'Latest school announcements — admissions updates, events, and academic notices.',
    url: '/notifications',
  },
};

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
