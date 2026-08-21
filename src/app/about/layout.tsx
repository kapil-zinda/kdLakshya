import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Learn about our school — our mission, history, and the values that guide how we teach and support every student.',
  keywords: [
    'about the school',
    'school mission and vision',
    'school history',
    'about kdLakshya',
  ],
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About Us',
    description:
      'Learn about our school — our mission, history, and the values that guide how we teach and support every student.',
    url: '/about',
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
