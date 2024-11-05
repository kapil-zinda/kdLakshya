import React, { useEffect, useState } from 'react';

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
import { makeApiCall } from '@/utils/ApiRequest';
import { Check, Trash2, UserPlus, X } from 'lucide-react';

interface User {
  type: 'users';
  id: string;
  attributes: {
    email: string;
    role: 'view' | 'edit' | 'lead' | 'manage';
    user_id: string;
  };
}

interface PendingRoleChange {
  userId: string;
  newRole: User['attributes']['role'];
}

interface UserGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team_id: string;
  team_name: string;
}

const UserGroupModal: React.FC<UserGroupModalProps> = ({
  open,
  onOpenChange,
  team_id,
  team_name,
}) => {
  const [pendingRoleChanges, setPendingRoleChanges] = useState<{
    [key: string]: PendingRoleChange;
  }>({});
  const [successfulChanges, setSuccessfulChanges] = useState<{
    [key: string]: boolean;
  }>({});
  const [newUserRole, setNewUserRole] =
    useState<User['attributes']['role']>('view');
  const [users, setUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [newUserEmail, setNewUserEmail] = useState<string>('');
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [emailError, setEmailError] = useState<string>('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [hasManagePermission, setHasManagePermission] = useState(false);
  const [hasOrgPermission, setHasOrgPermission] = useState(false);

  const getCurrentRole = (user: User): User['attributes']['role'] => {
    return pendingRoleChanges[user.id]?.newRole ?? user.attributes.role;
  };

  const handleEmailInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewUserEmail(value);
    setEmailError('');

    if (value.length > 0) {
      const filtered = allUsers.filter(
        (user) =>
          user.attributes.email.toLowerCase().includes(value.toLowerCase()) &&
          !users.some(
            (existingUser) =>
              existingUser.attributes.email === user.attributes.email,
          ),
      );
      setFilteredUsers(filtered);
      setShowDropdown(true);
    } else {
      setFilteredUsers([]);
      setShowDropdown(false);
    }
  };

  const handleEmailSelect = (user: User) => {
    setNewUserEmail(user.attributes.email);
    setShowDropdown(false);
    setEmailError('');
  };

  const handleAddUser = async () => {
    if (!hasManagePermission && !hasOrgPermission) return;

    const selectedUser = allUsers.find(
      (user) => user.attributes.email === newUserEmail,
    );

    if (!selectedUser) {
      setEmailError('Please select a user from the dropdown');
      return;
    }

    if (users.find((user) => user.attributes.email === newUserEmail)) {
      setEmailError('User already exists in the group');
      return;
    }

    try {
      const team_key_id = `team-${team_id}`;

      await makeApiCall({
        path: `auth/users/${selectedUser.id}/relationships`,
        method: 'POST',
        payload: {
          data: {
            type: 'relation',
            attributes: {
              [team_key_id]: newUserRole,
            },
          },
        },
      });
      const newUser: User = {
        ...selectedUser,
        attributes: {
          ...selectedUser.attributes,
          role: newUserRole,
        },
      };

      setUsers([...users, newUser]);
      setNewUserEmail('');
      setNewUserRole('view');
      setEmailError('');
    } catch (error) {
      console.error('Error adding user to group:', error);
      setEmailError('Error adding user to group');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch team users
        const res = await makeApiCall({
          path: `auth/users?filter[team]=${team_id}`,
          method: 'GET',
        });
        setUsers(res.data);

        // Fetch current user's permissions
        const permissionsRes = await makeApiCall({
          path: 'auth/users/{user_id}/relationships',
          method: 'GET',
        });

        // Set manage permission if user has team manage role or org permission
        const team_key_id = `team-${team_id}`;
        setHasManagePermission(
          permissionsRes.data.attributes.permissions?.[team_key_id] ===
            'manage',
        );
        setHasOrgPermission(
          permissionsRes.data.attributes.permission.org ? true : false,
        );

        // Only fetch all users if user has manage permissions
        if (
          permissionsRes.data.attributes.permission?.org ||
          permissionsRes.data.attributes.permissions?.[team_key_id] === 'manage'
        ) {
          const allUsersRes = await makeApiCall({
            path: `auth/users`,
            method: 'GET',
          });
          setAllUsers(allUsersRes.data);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, [team_id]);

  const handleRemoveUser = async (user: User) => {
    if (!hasManagePermission && !hasOrgPermission) return;
    try {
      await makeApiCall({
        path: `auth/users/${user.id}/relationships?team=${team_id}`,
        method: 'DELETE',
      });
      setUsers(users.filter((u) => u.id !== user.id));
      setUserToDelete(null);
    } catch (error) {
      console.error('Error deleting role:', error);
    }
  };

  const initiateRoleChange = (
    userId: string,
    newRole: User['attributes']['role'],
  ): void => {
    if (!hasManagePermission && !hasOrgPermission) return;
    setPendingRoleChanges((prev) => ({
      ...prev,
      [userId]: { userId, newRole },
    }));
  };

  const confirmRoleChange = async (userId: string): Promise<void> => {
    if (!hasManagePermission && !hasOrgPermission) return;

    const pendingChange = pendingRoleChanges[userId];
    if (!pendingChange) return;

    try {
      const team_key_id = `team-${team_id}`;

      await makeApiCall({
        path: `auth/users/${userId}/relationships`,
        method: 'PATCH',
        payload: {
          data: {
            type: 'relation',
            attributes: {
              [team_key_id]: pendingChange.newRole,
            },
          },
        },
      });

      setUsers(
        users.map((user) =>
          user.id === userId
            ? {
                ...user,
                attributes: { ...user.attributes, role: pendingChange.newRole },
              }
            : user,
        ),
      );

      setSuccessfulChanges((prev) => ({ ...prev, [userId]: true }));

      setPendingRoleChanges((prev) => {
        const newPending = { ...prev };
        delete newPending[userId];
        return newPending;
      });

      setTimeout(() => {
        setSuccessfulChanges((prev) => {
          const newSuccessful = { ...prev };
          delete newSuccessful[userId];
          return newSuccessful;
        });
      }, 2000);
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const cancelRoleChange = (userId: string): void => {
    setPendingRoleChanges((prev) => {
      const newPending = { ...prev };
      delete newPending[userId];
      return newPending;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            User Group Settings
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 space-y-4">
          <div>
            <label className="text-sm font-medium">Group Name</label>
            <Input
              value={team_name}
              className="mt-1 cursor-not-allowed bg-white text-gray-900"
              disabled
              style={{ opacity: 1 }}
            />
          </div>

          {/* Show Add User section only if user has permissions */}
          {(hasManagePermission || hasOrgPermission) && (
            <div className="flex gap-2">
              <div className="flex-1 relative">
                {emailError && (
                  <p className="text-red-500 text-sm mt-1 absolute -top-6">
                    {emailError}
                  </p>
                )}
                <Input
                  placeholder="Enter email address"
                  value={newUserEmail}
                  onChange={handleEmailInputChange}
                  className={`w-full ${emailError ? 'border-red-500' : ''}`}
                  type="email"
                />
                {showDropdown && filteredUsers.length > 0 && (
                  <div className="absolute w-full mt-1 bg-gray-700 border rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                    {filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className="px-4 py-2 hover:bg-gray-600 cursor-pointer"
                        onClick={() => handleEmailSelect(user)}
                      >
                        {user.attributes.email}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Select
                value={newUserRole}
                onValueChange={(value: User['attributes']['role']) =>
                  setNewUserRole(value)
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">View</SelectItem>
                  <SelectItem value="edit">Edit</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="manage">Manage</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleAddUser}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </div>
          )}

          <div className="border rounded-lg flex flex-col min-h-0 max-h-[40vh] overflow-y-auto">
            <div className="grid grid-cols-12 gap-4 p-3 bg-gray-500 rounded-t-lg border-b">
              <div className="col-span-5 font-medium">Email</div>
              <div
                className={`${hasManagePermission || hasOrgPermission ? 'col-span-5' : 'col-span-7'} font-medium`}
              >
                Permission
              </div>
              {(hasManagePermission || hasOrgPermission) && (
                <div className="col-span-2 font-medium">Actions</div>
              )}
            </div>

            <div className="divide-y">
              {users.map((user: User) => (
                <div
                  key={user.id}
                  className="grid grid-cols-12 gap-4 p-3 items-center"
                >
                  <div className="col-span-5">{user.attributes.email}</div>
                  <div
                    className={`${hasManagePermission || hasOrgPermission ? 'col-span-5' : 'col-span-7'}`}
                  >
                    {hasManagePermission || hasOrgPermission ? (
                      <Select
                        value={getCurrentRole(user)}
                        onValueChange={(value: User['attributes']['role']) =>
                          initiateRoleChange(user.id, value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="view">View</SelectItem>
                          <SelectItem value="edit">Edit</SelectItem>
                          <SelectItem value="lead">Lead</SelectItem>
                          <SelectItem value="manage">Manage</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-gray-700">
                        {user.attributes.role}
                      </span>
                    )}
                  </div>
                  {(hasManagePermission || hasOrgPermission) && (
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
                  )}
                </div>
              ))}
            </div>
          </div>

          {userToDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
              <div className="bg-gray-400 rounded-lg p-6 shadow-lg w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Confirm User Removal</h3>
                  <button
                    className="text-gray-800 hover:text-gray-600"
                    onClick={() => setUserToDelete(null)}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-gray-700 mb-6">
                  Are you sure you want to remove{' '}
                  {userToDelete.attributes.email} from this group? This action
                  cannot be undone.
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
                    onClick={() => handleRemoveUser(userToDelete)}
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
  );
};

export default UserGroupModal;
