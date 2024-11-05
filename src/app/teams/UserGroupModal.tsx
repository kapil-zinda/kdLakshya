import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Check, Trash2, UserPlus, X } from 'lucide-react';

interface User {
  id: number;
  email: string;
  role: 'view' | 'edit' | 'manage';
}

interface PendingRoleChange {
  userId: number;
  newRole: User['role'];
}

interface UserGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UserGroupModal: React.FC<UserGroupModalProps> = ({
  open,
  onOpenChange,
}) => {
  const [groupName, setGroupName] = useState<string>('Marketing Team');
  const [pendingRoleChanges, setPendingRoleChanges] = useState<{
    [key: number]: PendingRoleChange;
  }>({});
  const [successfulChanges, setSuccessfulChanges] = useState<{
    [key: number]: boolean;
  }>({});
  const [newUserRole, setNewUserRole] = useState<User['role']>('view');
  const [users, setUsers] = useState<User[]>([
    { id: 1, email: 'john@example.com', role: 'manage' },
    { id: 2, email: 'sarah@example.com', role: 'edit' },
    { id: 3, email: 'mike@example.com', role: 'view' },
    // Adding more users to demonstrate scrolling
    ...Array.from({ length: 10 }, (_, i) => ({
      id: i + 4,
      email: `user${i + 4}@example.com`,
      role: 'view' as const,
    })),
  ]);
  const [newUserEmail, setNewUserEmail] = useState<string>('');
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const handleAddUser = (): void => {
    if (newUserEmail && !users.find((user) => user.email === newUserEmail)) {
      setUsers([
        ...users,
        { id: users.length + 1, email: newUserEmail, role: newUserRole },
      ]);
      setNewUserEmail('');
      setNewUserRole('view'); // Reset role to default after adding
    }
  };

  const handleRemoveUser = (user: User): void => {
    setUsers(users.filter((u) => u.id !== user.id));
    setUserToDelete(null);
  };

  const initiateRoleChange = (userId: number, newRole: User['role']): void => {
    setPendingRoleChanges((prev) => ({
      ...prev,
      [userId]: { userId, newRole },
    }));
  };

  const confirmRoleChange = async (userId: number): Promise<void> => {
    const pendingChange = pendingRoleChanges[userId];
    if (!pendingChange) return;

    try {
      // Simulate API call
      // await new Promise(resolve => setTimeout(resolve, 1000));

      // Update local state after successful API call
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, role: pendingChange.newRole } : user,
        ),
      );

      // Show success state temporarily
      setSuccessfulChanges((prev) => ({ ...prev, [userId]: true }));

      // Clear pending change
      setPendingRoleChanges((prev) => {
        const newPending = { ...prev };
        delete newPending[userId];
        return newPending;
      });

      // Clear success state after delay
      setTimeout(() => {
        setSuccessfulChanges((prev) => {
          const newSuccessful = { ...prev };
          delete newSuccessful[userId];
          return newSuccessful;
        });
      }, 2000);
    } catch (error) {
      console.error('Error updating role:', error);
      // Handle error case
    }
  };

  const cancelRoleChange = (userId: number): void => {
    setPendingRoleChanges((prev) => {
      const newPending = { ...prev };
      delete newPending[userId];
      return newPending;
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              User Group Settings
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 min-h-0 space-y-4">
            {/* Group Name */}
            <div>
              <label className="text-sm font-medium">Group Name</label>
              <Input
                value={groupName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setGroupName(e.target.value)
                }
                className="mt-1"
              />
            </div>

            {/* Add New User */}
            {/* Add New User */}
            <div className="flex gap-2">
              <Input
                placeholder="Enter email address"
                value={newUserEmail}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewUserEmail(e.target.value)
                }
                className="flex-1"
                type="email"
              />
              <Select
                value={newUserRole}
                onValueChange={(value: User['role']) => setNewUserRole(value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">View</SelectItem>
                  <SelectItem value="edit">Edit</SelectItem>
                  <SelectItem value="manage">Manage</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleAddUser}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </div>

            {/* Users List */}
            <div className="border rounded-lg flex flex-col min-h-0 max-h-[40vh] overflow-y-auto">
              <div className="grid grid-cols-12 gap-4 p-3 bg-gray-500 rounded-t-lg border-b">
                <div className="col-span-5 font-medium">Email</div>
                <div className="col-span-5 font-medium">Permission</div>
                <div className="col-span-2 font-medium">Actions</div>
              </div>

              <div className="divide-y">
                {users.map((user: User) => (
                  <div
                    key={user.id}
                    className="grid grid-cols-12 gap-4 p-3 items-center"
                  >
                    <div className="col-span-5">{user.email}</div>
                    <div className="col-span-5">
                      <Select
                        value={user.role}
                        onValueChange={(value: User['role']) =>
                          initiateRoleChange(user.id, value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="view">View</SelectItem>
                          <SelectItem value="edit">Edit</SelectItem>
                          <SelectItem value="manage">Manage</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      {successfulChanges[user.id] ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : pendingRoleChanges[user.id] ? (
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => confirmRoleChange(user.id)}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 p-0 h-auto"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => cancelRoleChange(user.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 p-0 h-auto"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setUserToDelete(user)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Delete Confirmation */}
            {userToDelete && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
                <div className="bg-gray-400 rounded-lg p-6 shadow-lg w-full max-w-md">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">
                      Confirm User Removal
                    </h3>
                    <button
                      className="text-gray-800 hover:text-gray-600"
                      onClick={() => setUserToDelete(null)}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-gray-700 mb-6">
                    Are you sure you want to remove {userToDelete.email} from
                    this group? This action cannot be undone.
                  </p>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setUserToDelete(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => {
                        handleRemoveUser(userToDelete);
                      }}
                    >
                      Remove User
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={() => onOpenChange(false)}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserGroupModal;
