import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Photo Gallery',
  description: 'Browse photos from school events, activities, and campus life.',
  keywords: [
    'school gallery',
    'school photos',
    'school events photos',
    'campus life',
  ],
  alternates: { canonical: '/gallery' },
  openGraph: {
    title: 'Photo Gallery',
    description:
      'Browse photos from school events, activities, and campus life.',
    url: '/gallery',
  },
};

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
