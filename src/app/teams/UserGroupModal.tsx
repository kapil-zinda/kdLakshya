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
import { Trash2, UserPlus, X } from 'lucide-react';

interface User {
  id: number;
  email: string;
  role: 'view' | 'edit' | 'manage';
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
        { id: users.length + 1, email: newUserEmail, role: 'view' },
      ]);
      setNewUserEmail('');
    }
  };

  const handleRemoveUser = (user: User): void => {
    setUsers(users.filter((u) => u.id !== user.id));
    setUserToDelete(null);
  };

  const handleRoleChange = (userId: number, newRole: User['role']): void => {
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, role: newRole } : user,
      ),
    );
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
                          handleRoleChange(user.id, value)
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setUserToDelete(user)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
