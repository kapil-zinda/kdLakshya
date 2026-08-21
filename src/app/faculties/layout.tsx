import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Faculty',
  description:
    'Meet our faculty — experienced teachers and staff dedicated to helping every student learn and grow.',
  keywords: [
    'school faculty',
    'school teachers',
    'meet our teachers',
    'teaching staff',
  ],
  alternates: { canonical: '/faculties' },
  openGraph: {
    title: 'Our Faculty',
    description:
      'Meet our faculty — experienced teachers and staff dedicated to helping every student learn and grow.',
    url: '/faculties',
  },
};

export default function FacultiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
