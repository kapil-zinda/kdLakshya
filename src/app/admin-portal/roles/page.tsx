'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import { DashboardWrapper } from '@/components/auth/DashboardWrapper';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useUserDataRedux } from '@/hooks/useUserDataRedux';
import { ApiService } from '@/services/api';
import { useGetFacultyQuery } from '@/store/api/facultyApi';
import { toast } from 'react-toastify';

interface AdminUser {
  userId: string;
  name: string;
  email: string;
  role: string;
}

const ADMIN_ROLES = [
  { value: 'head', label: 'Head Admin (full access to this school)' },
  {
    value: 'superwise',
    label: 'Clerk (manage students, attendance, fees)',
  },
];

export default function RoleManagement() {
  return (
    <DashboardWrapper allowedRoles={['admin']} redirectTo="/">
      {() => <RoleManagementContent />}
    </DashboardWrapper>
  );
}

function RoleManagementContent() {
  const confirm = useConfirm();
  const { userData } = useUserDataRedux();
  const orgId = userData?.orgId;

  const { data: facultyResponse } = useGetFacultyQuery(orgId!, {
    skip: !orgId,
  });

  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [selectedRole, setSelectedRole] = useState('head');
  const [isPromoting, setIsPromoting] = useState(false);

  const loadAdmins = async () => {
    if (!orgId) return;
    setLoadingAdmins(true);
    try {
      const [headResponse, superAdminResponse, clerkResponse] =
        await Promise.all([
          ApiService.getUsersByRole(orgId, 'head'),
          ApiService.getUsersByRole(orgId, '*'),
          ApiService.getUsersByRole(orgId, 'superwise'),
        ]);

      const merged = [
        ...(headResponse?.data || []),
        ...(superAdminResponse?.data || []),
        ...(clerkResponse?.data || []),
      ].map((entry) => ({
        userId: entry.attributes.user_id ?? '',
        name: entry.attributes.name || '(unnamed)',
        email: entry.attributes.email ?? '',
        role: entry.attributes.role ?? '',
      }));

      setAdmins(merged);
    } catch (error) {
      console.error('Error loading admins:', error);
      toast.error('Failed to load current admins.');
    } finally {
      setLoadingAdmins(false);
    }
  };

  useEffect(() => {
    loadAdmins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  const faculty = facultyResponse?.data || [];
  // Faculty who aren't already admin/clerk, so the dropdown only offers
  // people this action would actually change something for.
  const promotableFaculty = faculty.filter(
    (f) => !admins.some((a) => a.userId === f.id),
  );

  const handlePromote = async () => {
    if (!orgId || !selectedFacultyId) {
      toast.error('Please select a teacher to promote.');
      return;
    }
    setIsPromoting(true);
    try {
      await ApiService.assignUserRole(orgId, selectedFacultyId, selectedRole);
      toast.success('Role assigned! They can now log in with admin access.');
      setSelectedFacultyId('');
      loadAdmins();
    } catch (error) {
      console.error('Error assigning role:', error);
      toast.error('Failed to assign role. Please try again.');
    } finally {
      setIsPromoting(false);
    }
  };

  const handleRemoveAdmin = async (admin: AdminUser) => {
    if (!orgId) return;
    if (
      !(await confirm(
        `Remove admin access from ${admin.name}? They'll keep their regular teacher login, just without admin permissions.`,
      ))
    )
      return;

    try {
      await ApiService.removeUserRole(orgId, admin.userId);
      toast.success('Admin access removed.');
      loadAdmins();
    } catch (error) {
      console.error('Error removing admin role:', error);
      toast.error('Failed to remove admin access. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link
                href="/admin-portal/dashboard"
                className="text-muted-foreground hover:text-foreground mr-4"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </Link>
              <h1 className="text-xl font-semibold text-foreground">
                Role Management
              </h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Promote a Teacher to Admin
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Gives an existing teacher account admin access using their current
            login - no new account or password needed.
          </p>

          {promotableFaculty.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {faculty.length === 0
                ? 'Add a teacher first (Teacher Management), then come back here to give them admin access.'
                : 'All teachers already have admin or clerk access.'}
            </p>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={selectedFacultyId}
                onChange={(e) => setSelectedFacultyId(e.target.value)}
                className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select a teacher...</option>
                {promotableFaculty.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.attributes.name} ({f.attributes.email})
                  </option>
                ))}
              </select>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {ADMIN_ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <button
                onClick={handlePromote}
                disabled={!selectedFacultyId || isPromoting}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPromoting ? 'Assigning...' : 'Give Admin Access'}
              </button>
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Current Admins
          </h2>

          {loadingAdmins ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            </div>
          ) : admins.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No admins found besides the account you&apos;re using now.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">
                      Name
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">
                      Email
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">
                      Role
                    </th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {admins.map((admin) => (
                    <tr key={admin.userId}>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {admin.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {admin.email}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground capitalize">
                        {admin.role === '*' ? 'Super Admin' : admin.role}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {admin.role !== '*' && (
                          <button
                            onClick={() => handleRemoveAdmin(admin)}
                            className="text-sm text-red-600 hover:text-red-800 font-medium"
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
