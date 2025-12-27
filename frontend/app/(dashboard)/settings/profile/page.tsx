'use client'

import { useAuth } from '@/lib/auth'
import { Card, Avatar, Badge, Button } from '@/components/ui'
import { FadeIn } from '@/components/animations'

export default function ProfilePage() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <FadeIn>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="mt-2 text-gray-600">Manage your account settings and preferences</p>
        </div>

        {/* Profile Card */}
        <Card>
          <div className="flex items-start gap-6">
            <Avatar src={user.avatar} name={user.name} size="xl" />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <p className="mt-1 text-gray-600">{user.email}</p>
              <div className="mt-3">
                <Badge variant="info">{user.role.replace('_', ' ').toUpperCase()}</Badge>
              </div>
            </div>
            <Button variant="outline">Edit Profile</Button>
          </div>
        </Card>

        {/* Account Information */}
        <Card>
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Account Information</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">User ID</label>
              <p className="mt-1 text-gray-900">{user.id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-gray-900">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Role</label>
              <p className="mt-1 text-gray-900">
                {user.role.replace('_', ' ').toUpperCase()}
              </p>
            </div>
          </div>
        </Card>

        {/* Security */}
        <Card>
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Security</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Password</p>
                <p className="text-sm text-gray-600">Managed by Auth0</p>
              </div>
              <Button variant="outline" onClick={() => alert('Redirect to Auth0 password change')}>
                Change Password
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                <p className="text-sm text-gray-600">Add an extra layer of security</p>
              </div>
              <Button variant="outline" onClick={() => alert('Redirect to Auth0 MFA setup')}>
                Enable 2FA
              </Button>
            </div>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card variant="bordered">
          <h3 className="mb-4 text-lg font-semibold text-error-600">Danger Zone</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Sign Out</p>
              <p className="text-sm text-gray-600">Sign out from your account</p>
            </div>
            <Button variant="danger" onClick={() => (window.location.href = '/api/auth/logout')}>
              Sign Out
            </Button>
          </div>
        </Card>
      </div>
    </FadeIn>
  )
}
