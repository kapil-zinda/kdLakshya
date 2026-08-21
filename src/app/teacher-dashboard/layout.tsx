import { noIndexMetadata } from '../_private-route-metadata';

export const metadata = noIndexMetadata;

export default function TeacherDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
