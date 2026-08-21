import { noIndexMetadata } from '../_private-route-metadata';

export const metadata = noIndexMetadata;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
