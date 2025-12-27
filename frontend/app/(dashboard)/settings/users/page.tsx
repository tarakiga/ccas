'use client'

import { useState } from 'react'
import { Card, Button, Badge, Input } from '@/components/ui'
import { usePermissions } from '@/lib/hooks/usePermissions'
import { TEST_USERS, type TestUser } from '@/lib/mocks/test-users'

export default function UsersManagementPage() {
  const permissions = usePermissions()
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<TestUser | null>(null)
  const [users, setUsers] = useState<TestUser[]>(TEST_USERS)
  const [showConfirmDeactivate, setShowConfirmDeactivate] = useState<TestUser | null>(null)
  
  // Form states
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: '',
    department: 'Business Unit' as TestUser['department'],
    division: undefined as TestUser['division'],
    permissionLevel: 2 as 1 | 2 | 3,
    workbookAccess: 'shared' as 'full' | 'shared' | 'restricted',
  })
  
  const [editUser, setEditUser] = useState<Partial<TestUser>>({})

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

  // Handler functions
  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.role) {
      alert('Please fill in all required fields')
      return
    }
    
    const user: TestUser = {
      id: `user-${Date.now()}`,
      username: newUser.email.split('@')[0].toLowerCase(),
      password: 'Test@123',
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      department: newUser.department,
      division: newUser.division,
      permissions: getDefaultPermissions(newUser.permissionLevel, newUser.department),
      permissionLevel: newUser.permissionLevel,
      workbookAccess: newUser.workbookAccess,
      canAccessSteps: getDefaultSteps(newUser.department),
    }
    
    setUsers([...users, user])
    setNewUser({
      name: '',
      email: '',
      role: '',
      department: 'Business Unit',
      division: undefined,
      permissionLevel: 2,
      workbookAccess: 'shared',
    })
    setShowAddModal(false)
    alert('User created successfully!')
  }
  
  const handleEditUser = () => {
    if (!selectedUser || !editUser.name || !editUser.email || !editUser.role) {
      alert('Please fill in all required fields')
      return
    }
    
    const updatedUser: TestUser = {
      ...selectedUser,
      name: editUser.name,
      email: editUser.email,
      role: editUser.role,
      department: editUser.department || selectedUser.department,
      division: editUser.division,
      permissionLevel: editUser.permissionLevel || selectedUser.permissionLevel,
      workbookAccess: editUser.workbookAccess || selectedUser.workbookAccess,
      permissions: getDefaultPermissions(
        editUser.permissionLevel || selectedUser.permissionLevel,
        editUser.department || selectedUser.department
      ),
      canAccessSteps: getDefaultSteps(editUser.department || selectedUser.department),
    }
    
    setUsers(users.map(u => u.id === selectedUser.id ? updatedUser : u))
    setSelectedUser(null)
    setEditUser({})
    alert('User updated successfully!')
  }
  
  const handleDeactivateUser = (user: TestUser) => {
    setUsers(users.filter(u => u.id !== user.id))
    setShowConfirmDeactivate(null)
    alert(`User ${user.name} has been deactivated successfully!`)
  }
  
  const getDefaultPermissions = (level: 1 | 2 | 3, department: TestUser['department']): string[] => {
    const basePermissions = ['view_shipments']
    
    if (level >= 2) {
      basePermissions.push('edit_shipments', 'complete_steps')
      if (department === 'Finance') {
        basePermissions.push('manage_payments')
      } else if (department === 'C&C') {
        basePermissions.push('customs_clearance', 'bayan_submission')
      } else if (department === 'Business Unit') {
        basePermissions.push('upload_documents')
      }
    }
    
    if (level === 3) {
      basePermissions.push('view_all', 'edit_all', 'approve_all', 'reports', 'analytics')
    }
    
    if (department === 'Management') {
      basePermissions.push('reports', 'analytics')
      if (level === 1) {
        basePermissions.push('audit')
      }
    }
    
    return basePermissions
  }
  
  const getDefaultSteps = (department: TestUser['department']): string[] => {
    switch (department) {
      case 'Business Unit':
        return ['1.1', '1.2', '1.3', '1.4', '1.6', '2.1', '2.2', '2.3', '2.4', '2.5', '2.6', '3.3']
      case 'Finance':
        return ['3.1', '3.2', '3.5', '4.0', '5.0', '6.1', '13.0']
      case 'C&C':
        return ['3.4', '6.2', '8.0', '9.0', '10.0', '11.0', '12.0', '14.0', '15.0']
      case 'Business Unit - Stores':
        return ['16.0', '17.0', '18.0']
      default:
        return []
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Add, edit, and manage user accounts
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add New User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="p-6">
          <p className="text-sm font-medium text-gray-600">Total Users</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{users.length}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm font-medium text-gray-600">Active Users</p>
          <p className="mt-2 text-3xl font-bold text-green-600">{users.length}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm font-medium text-gray-600">Admins</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {users.filter((u) => u.role === 'Admin').length}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm font-medium text-gray-600">Departments</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">5</p>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-6">
        <Input
          placeholder="Search users by name, email, or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Card>

      {/* Users Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white font-semibold">
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-500">{user.role}</p>
                </div>
              </div>
              <Badge variant={user.permissionLevel === 3 ? 'success' : user.permissionLevel === 2 ? 'info' : 'default'}>
                Level {user.permissionLevel}
              </Badge>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-gray-600 truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <span className="text-gray-600">{user.department}</span>
              </div>
              {user.division && (
                <div className="flex items-center gap-2 text-sm">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  <span className="text-gray-600">{user.division}</span>
                </div>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1" 
                onClick={() => {
                  setSelectedUser(user)
                  setEditUser({
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    department: user.department,
                    division: user.division,
                    permissionLevel: user.permissionLevel,
                    workbookAccess: user.workbookAccess,
                  })
                }}
              >
                Edit
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1 text-red-600 hover:bg-red-50 hover:border-red-300"
                onClick={() => setShowConfirmDeactivate(user)}
              >
                Deactivate
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-2xl p-6">
            <h2 className="text-xl font-bold text-gray-900">Add New User</h2>
            
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                <Input 
                  placeholder="John Doe" 
                  className="mt-1" 
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email *</label>
                <Input 
                  type="email" 
                  placeholder="john.doe@alhashargroup.com" 
                  className="mt-1" 
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Role *</label>
                <Input 
                  placeholder="Operations Manager" 
                  className="mt-1" 
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <select 
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                    value={newUser.department}
                    onChange={(e) => setNewUser({...newUser, department: e.target.value as TestUser['department']})}
                  >
                    <option value="Business Unit">Business Unit</option>
                    <option value="Finance">Finance</option>
                    <option value="C&C">C&C</option>
                    <option value="Business Unit - Stores">Business Unit - Stores</option>
                    <option value="Management">Management</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Division</label>
                  <select 
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                    value={newUser.division || ''}
                    onChange={(e) => setNewUser({...newUser, division: e.target.value as TestUser['division']})}
                  >
                    <option value="">None</option>
                    <option value="TBLE">TBLE</option>
                    <option value="LVD">LVD</option>
                    <option value="HVD">HVD</option>
                    <option value="Parts">Parts</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Permission Level</label>
                <select 
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                  value={newUser.permissionLevel}
                  onChange={(e) => setNewUser({...newUser, permissionLevel: parseInt(e.target.value) as 1 | 2 | 3})}
                >
                  <option value={1}>Level 1 - Read Only</option>
                  <option value={2}>Level 2 - Read & Edit</option>
                  <option value={3}>Level 3 - Full Access</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Workbook Access</label>
                <select 
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                  value={newUser.workbookAccess}
                  onChange={(e) => setNewUser({...newUser, workbookAccess: e.target.value as 'full' | 'shared' | 'restricted'})}
                >
                  <option value="restricted">Restricted</option>
                  <option value="shared">Shared</option>
                  <option value="full">Full</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddUser}>
                Create User
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Edit User Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-2xl p-6">
            <h2 className="text-xl font-bold text-gray-900">Edit User</h2>
            
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                <Input 
                  className="mt-1" 
                  value={editUser.name || ''}
                  onChange={(e) => setEditUser({...editUser, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email *</label>
                <Input 
                  type="email" 
                  className="mt-1" 
                  value={editUser.email || ''}
                  onChange={(e) => setEditUser({...editUser, email: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Role *</label>
                <Input 
                  className="mt-1" 
                  value={editUser.role || ''}
                  onChange={(e) => setEditUser({...editUser, role: e.target.value})}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <select 
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" 
                    value={editUser.department || selectedUser.department}
                    onChange={(e) => setEditUser({...editUser, department: e.target.value as TestUser['department']})}
                  >
                    <option value="Business Unit">Business Unit</option>
                    <option value="Finance">Finance</option>
                    <option value="C&C">C&C</option>
                    <option value="Business Unit - Stores">Business Unit - Stores</option>
                    <option value="Management">Management</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Division</label>
                  <select 
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" 
                    value={editUser.division || selectedUser.division || ''}
                    onChange={(e) => setEditUser({...editUser, division: e.target.value as TestUser['division']})}
                  >
                    <option value="">None</option>
                    <option value="TBLE">TBLE</option>
                    <option value="LVD">LVD</option>
                    <option value="HVD">HVD</option>
                    <option value="Parts">Parts</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Permission Level</label>
                <select 
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" 
                  value={editUser.permissionLevel || selectedUser.permissionLevel}
                  onChange={(e) => setEditUser({...editUser, permissionLevel: parseInt(e.target.value) as 1 | 2 | 3})}
                >
                  <option value={1}>Level 1 - Read Only</option>
                  <option value={2}>Level 2 - Read & Edit</option>
                  <option value={3}>Level 3 - Full Access</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Workbook Access</label>
                <select 
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" 
                  value={editUser.workbookAccess || selectedUser.workbookAccess}
                  onChange={(e) => setEditUser({...editUser, workbookAccess: e.target.value as 'full' | 'shared' | 'restricted'})}
                >
                  <option value="restricted">Restricted</option>
                  <option value="shared">Shared</option>
                  <option value="full">Full</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => {
                setSelectedUser(null)
                setEditUser({})
              }}>
                Cancel
              </Button>
              <Button onClick={handleEditUser}>
                Save Changes
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Confirm Deactivate Modal */}
      {showConfirmDeactivate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Deactivate User</h3>
                <p className="text-sm text-gray-600">This action cannot be undone.</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-700">
                Are you sure you want to deactivate <strong>{showConfirmDeactivate.name}</strong>? 
                They will lose access to the system immediately.
              </p>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowConfirmDeactivate(null)}>
                Cancel
              </Button>
              <Button 
                variant="outline" 
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={() => handleDeactivateUser(showConfirmDeactivate)}
              >
                Deactivate User
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
