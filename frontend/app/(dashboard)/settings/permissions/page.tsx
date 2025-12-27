'use client'

import { useState } from 'react'
import { Card, Button, Badge, Input } from '@/components/ui'
import { usePermissions } from '@/lib/hooks/usePermissions'
import { TEST_USERS, type TestUser } from '@/lib/mocks/test-users'
import { getPermissionLevelDescription, getWorkbookAccessDescription } from '@/lib/mocks/test-users'

export default function PermissionsPage() {
  const permissions = usePermissions()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<TestUser | null>(null)

  // Redirect if not admin
  if (permissions.user?.role !== 'Admin') {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="p-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-gray-600">
            Only System Administrators can access this page.
          </p>
          <Button className="mt-4" onClick={() => (window.location.href = '/')}>
            Go to Dashboard
          </Button>
        </Card>
      </div>
    )
  }

  const filteredUsers = TEST_USERS.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getPermissionBadgeColor = (level: 1 | 2 | 3) => {
    switch (level) {
      case 1:
        return 'default'
      case 2:
        return 'info'
      case 3:
        return 'success'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Permissions Management</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage user permissions and access levels
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{TEST_USERS.length}</p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Level 3 Users</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {TEST_USERS.filter((u) => u.permissionLevel === 3).length}
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Departments</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">5</p>
            </div>
            <div className="rounded-full bg-purple-100 p-3">
              <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search users by name, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Filter
          </Button>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Permission Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Workbook Access
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm text-gray-900">{user.role}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm text-gray-900">{user.department}</div>
                    {user.division && (
                      <div className="text-xs text-gray-500">{user.division}</div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <Badge variant={getPermissionBadgeColor(user.permissionLevel)}>
                      Level {user.permissionLevel} - {getPermissionLevelDescription(user.permissionLevel)}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="text-sm capitalize text-gray-900">{user.workbookAccess}</span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedUser(user)}
                    >
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-2xl p-6">
            <div className="flex items-start justify-between">
              <h2 className="text-xl font-bold text-gray-900">User Details</h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Name</label>
                <p className="mt-1 text-gray-900">{selectedUser.name}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-gray-900">{selectedUser.email}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Role</label>
                <p className="mt-1 text-gray-900">{selectedUser.role}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Department</label>
                <p className="mt-1 text-gray-900">{selectedUser.department}</p>
              </div>

              {selectedUser.division && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Division</label>
                  <p className="mt-1 text-gray-900">{selectedUser.division}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700">Permission Level</label>
                <p className="mt-1">
                  <Badge variant={getPermissionBadgeColor(selectedUser.permissionLevel)}>
                    Level {selectedUser.permissionLevel} - {getPermissionLevelDescription(selectedUser.permissionLevel)}
                  </Badge>
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Workbook Access</label>
                <p className="mt-1 capitalize text-gray-900">{selectedUser.workbookAccess}</p>
                <p className="mt-1 text-sm text-gray-500">
                  {getWorkbookAccessDescription(selectedUser.workbookAccess)}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Permissions</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedUser.permissions.map((perm) => (
                    <Badge key={perm} variant="default">
                      {perm}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Accessible Steps</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedUser.canAccessSteps.length > 0 ? (
                    selectedUser.canAccessSteps.map((step) => (
                      <Badge key={step} variant="info">
                        Step {step}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">All steps (Management/Admin)</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setSelectedUser(null)}>
                Close
              </Button>
              <Button>Edit Permissions</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
