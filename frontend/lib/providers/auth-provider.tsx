'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { 
  TestUser, 
  validateCredentials, 
  canUserAccessStep, 
  getUserAccessibleSteps,
  canUserEdit,
  canUserDelete,
  getPermissionLevelDescription,
  getWorkbookAccessDescription,
} from '@/lib/mocks/test-users'

interface AuthContextType {
  user: TestUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  canAccessStep: (stepNumber: string) => boolean
  getAccessibleSteps: () => string[]
  canEdit: () => boolean
  canDelete: () => boolean
  getPermissionLevel: () => 1 | 2 | 3 | null
  getPermissionDescription: () => string
  getWorkbookAccess: () => 'full' | 'shared' | 'restricted' | null
  getWorkbookAccessDescription: () => string
  hasPermission: (permission: string) => boolean
  isManagement: () => boolean
  isAudit: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<TestUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for stored session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('auth_user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Failed to parse stored user:', error)
        localStorage.removeItem('auth_user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      const validatedUser = validateCredentials(username, password)
      if (validatedUser) {
        // Remove password before storing
        const { password: _, ...userWithoutPassword } = validatedUser
        setUser(userWithoutPassword as TestUser)
        localStorage.setItem('auth_user', JSON.stringify(userWithoutPassword))
        return true
      }
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('auth_user')
  }

  const canAccessStep = (stepNumber: string): boolean => {
    if (!user) return false
    return canUserAccessStep(user, stepNumber)
  }

  const getAccessibleSteps = (): string[] => {
    if (!user) return []
    return getUserAccessibleSteps(user)
  }

  const canEdit = (): boolean => {
    if (!user) return false
    return canUserEdit(user)
  }

  const canDelete = (): boolean => {
    if (!user) return false
    return canUserDelete(user)
  }

  const getPermissionLevel = (): 1 | 2 | 3 | null => {
    return user?.permissionLevel ?? null
  }

  const getPermissionDescription = (): string => {
    if (!user) return 'No Access'
    return getPermissionLevelDescription(user.permissionLevel)
  }

  const getWorkbookAccess = (): 'full' | 'shared' | 'restricted' | null => {
    return user?.workbookAccess ?? null
  }

  const getUserWorkbookAccessDescription = (): string => {
    if (!user) return 'No Access'
    return getWorkbookAccessDescription(user.workbookAccess)
  }

  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    return user.permissions.includes(permission)
  }

  const isManagement = (): boolean => {
    return user?.department === 'Management'
  }

  const isAudit = (): boolean => {
    if (!user) return false
    return user.permissions.includes('audit')
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    canAccessStep,
    getAccessibleSteps,
    canEdit,
    canDelete,
    getPermissionLevel,
    getPermissionDescription,
    getWorkbookAccess,
    getWorkbookAccessDescription: getUserWorkbookAccessDescription,
    hasPermission,
    isManagement,
    isAudit,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
