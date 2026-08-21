import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with our school — address, phone, email, and a contact form for admissions and general inquiries.',
  keywords: [
    'contact school',
    'school phone number',
    'school address',
    'school admissions contact',
  ],
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact Us',
    description:
      'Get in touch with our school — address, phone, email, and a contact form for admissions and general inquiries.',
    url: '/contact',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
