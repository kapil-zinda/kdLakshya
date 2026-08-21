import { noIndexMetadata } from '../_private-route-metadata';

export const metadata = noIndexMetadata;

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
