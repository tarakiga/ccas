/**
 * Test User Credentials for Role-Based Testing
 * Based on real personnel from SOP and Responsibility List
 * 
 * All passwords are set to: Test@123
 */

export interface TestUser {
  id: string
  username: string
  password: string
  email: string
  name: string
  role: string
  department: 'Business Unit' | 'Finance' | 'C&C' | 'Business Unit - Stores' | 'Management'
  division?: 'TBLE' | 'LVD' | 'HVD' | 'Parts'
  permissions: string[]
  permissionLevel: 1 | 2 | 3 // 1=read only, 2=read+edit, 3=read+edit+delete
  canAccessSteps: string[] // Step numbers they are responsible for
  workbookAccess?: 'shared' | 'restricted' | 'full'
}

export const TEST_USERS: TestUser[] = [
  // Business Unit - TBLE
  {
    id: 'user-rajendran',
    username: 'rajendran.p',
    password: 'Test@123',
    email: 'Rajendran.P@alhashargroup.com',
    name: 'Rajendran P.',
    role: 'TBLE Ops',
    department: 'Business Unit',
    division: 'TBLE',
    permissions: ['view_shipments', 'edit_shipments', 'complete_steps', 'upload_documents'],
    permissionLevel: 2, // read and edit
    canAccessSteps: ['1.1', '1.2', '1.3', '1.4', '1.6', '2.1', '2.2', '2.3', '2.4', '2.5', '2.6', '3.3'],
    workbookAccess: 'shared',
  },
  
  // Business Unit - LVD
  {
    id: 'user-rajan',
    username: 'tble.rajan',
    password: 'Test@123',
    email: 'rajan@alhashargroup.com',
    name: 'TBLE-Rajan',
    role: 'LVD Ops',
    department: 'Business Unit',
    division: 'LVD',
    permissions: ['view_shipments', 'edit_shipments', 'complete_steps', 'upload_documents'],
    permissionLevel: 2, // read and edit
    canAccessSteps: ['1.1', '1.2', '1.3', '1.4', '1.6', '2.1', '2.2', '2.3', '2.4', '2.5', '2.6', '3.3'],
    workbookAccess: 'shared',
  },
  
  // Business Unit - HVD
  {
    id: 'user-hilal-ops',
    username: 'tble.hilal',
    password: 'Test@123',
    email: 'hilal.ops@alhashargroup.com',
    name: 'TBLE-Hilal',
    role: 'HVD Ops',
    department: 'Business Unit',
    division: 'HVD',
    permissions: ['view_shipments', 'edit_shipments', 'complete_steps', 'upload_documents'],
    permissionLevel: 2, // read and edit
    canAccessSteps: ['1.1', '1.2', '1.3', '1.4', '1.6', '2.1', '2.2', '2.3', '2.4', '2.5', '2.6', '3.3'],
    workbookAccess: 'shared',
  },
  
  // Business Unit - C&C Consultant (Hilal)
  {
    id: 'user-hilal',
    username: 'hilal',
    password: 'Test@123',
    email: 'hilal@alhashargroup.com',
    name: 'Hilal',
    role: 'TBLE C&C Consultant',
    department: 'Business Unit',
    division: 'TBLE',
    permissions: ['view_shipments', 'edit_shipments', 'complete_steps', 'ministry_approval'],
    permissionLevel: 2, // read and edit
    canAccessSteps: ['7.0'],
    workbookAccess: 'shared',
  },
  
  // Finance - Trade Finance (Bala)
  {
    id: 'user-bala',
    username: 'bala',
    password: 'Test@123',
    email: 'Balak@alhashargroup.com',
    name: 'Bala',
    role: 'Trade Finance',
    department: 'Finance',
    permissions: ['view_shipments', 'edit_shipments', 'complete_steps', 'manage_payments', 'upload_documents'],
    permissionLevel: 2, // read and edit
    canAccessSteps: ['3.1', '3.2', '3.5', '4.0', '5.0', '6.1', '13.0'],
    workbookAccess: 'shared',
  },
  
  // Finance - Document Collection (Kamran)
  {
    id: 'user-kamran',
    username: 'kamran',
    password: 'Test@123',
    email: 'kamran@alhashargroup.com',
    name: 'Kamran',
    role: 'Finance - Document Collection',
    department: 'Finance',
    permissions: ['view_shipments', 'complete_steps', 'collect_documents'],
    permissionLevel: 2, // read and edit
    canAccessSteps: ['6.0'],
    workbookAccess: 'shared',
  },
  
  // Finance - Alternate (Shijith)
  {
    id: 'user-shijith',
    username: 'shijith',
    password: 'Test@123',
    email: 'shijith@alhashargroup.com',
    name: 'Shijith',
    role: 'Finance Alternate',
    department: 'Finance',
    permissions: ['view_shipments', 'edit_shipments', 'complete_steps', 'manage_payments'],
    permissionLevel: 2, // read and edit
    canAccessSteps: ['3.1', '3.2', '3.5', '4.0', '5.0', '6.1'],
    workbookAccess: 'shared',
  },
  
  // C&C - Consultant (Salim)
  {
    id: 'user-salim',
    username: 'salim',
    password: 'Test@123',
    email: 'salim.alwahaibi@alhashargroup.com',
    name: 'Salim',
    role: 'C&C Consultant',
    department: 'C&C',
    permissions: ['view_shipments', 'edit_shipments', 'complete_steps', 'customs_clearance', 'bayan_submission'],
    permissionLevel: 2, // read and edit
    canAccessSteps: ['3.4', '6.2', '8.0', '9.0', '10.0', '11.0', '12.0', '14.0', '15.0'],
    workbookAccess: 'shared',
  },
  
  // Business Unit - Stores (Warehouse Manager)
  {
    id: 'user-warehouse',
    username: 'warehouse.manager',
    password: 'Test@123',
    email: 'warehouse@alhashargroup.com',
    name: 'Warehouse Manager',
    role: 'Warehouse Manager',
    department: 'Business Unit - Stores',
    permissions: ['view_shipments', 'complete_steps', 'goods_receipt', 'insurance_claims'],
    permissionLevel: 2, // read and edit
    canAccessSteps: ['16.0', '17.0', '18.0'],
    workbookAccess: 'shared',
  },
  
  // Management - TBLE GM
  {
    id: 'user-raj',
    username: 'raj.nair',
    password: 'Test@123',
    email: 'raj.nair@alhashargroup.com',
    name: 'Raj Nair',
    role: 'TBLE GM',
    department: 'Management',
    division: 'TBLE',
    permissions: ['view_all', 'edit_all', 'approve_all', 'reports', 'analytics'],
    permissionLevel: 3, // read, edit, delete
    canAccessSteps: [], // Can access all steps as alternate
    workbookAccess: 'full',
  },
  
  // Management - Finance Controller
  {
    id: 'user-mario',
    username: 'mario.r',
    password: 'Test@123',
    email: 'Mario.R@alhashargroup.com',
    name: 'Mario R.',
    role: 'AHC FC',
    department: 'Management',
    permissions: ['view_all', 'edit_all', 'approve_payments', 'reports', 'analytics'],
    permissionLevel: 3, // read, edit, delete
    canAccessSteps: [], // Can access all Finance steps as alternate
    workbookAccess: 'full',
  },
  
  // Management - Logistics Manager
  {
    id: 'user-moataz',
    username: 'moataz',
    password: 'Test@123',
    email: 'moataz.yahia@alhashargroup.com',
    name: 'Moataz Yahia',
    role: 'Logistics Manager',
    department: 'Management',
    permissions: ['view_all', 'reports', 'analytics'],
    permissionLevel: 2, // read and edit
    canAccessSteps: [], // Can access all C&C steps as alternate
    workbookAccess: 'shared',
  },
  
  // Management - GCSO
  {
    id: 'user-rajeev',
    username: 'rajeev',
    password: 'Test@123',
    email: 'Rajeev.Sharma@alhashargroup.com',
    name: 'Rajeev Sharma',
    role: 'GCSO',
    department: 'Management',
    permissions: ['view_all', 'reports', 'analytics', 'audit'],
    permissionLevel: 1, // read only (for audit purposes)
    canAccessSteps: [], // Can view all
    workbookAccess: 'restricted',
  },
  
  // Group I.A. - Simon Turner
  {
    id: 'user-simon',
    username: 'simon.turner',
    password: 'Test@123',
    email: 'Simon.Turner@alhashargroup.com',
    name: 'Simon Turner',
    role: 'I.A. Manager',
    department: 'Management',
    permissions: ['view_all', 'audit', 'reports', 'analytics'],
    permissionLevel: 1, // read only (audit purposes)
    canAccessSteps: [], // Can view all for audit
    workbookAccess: 'restricted',
  },
  
  // Group Management - Executive PA
  {
    id: 'user-nasafi',
    username: 'nasafi',
    password: 'Test@123',
    email: 'nasafi.rahman@alhasharauto.com',
    name: 'Nasafi Rahman',
    role: 'Exec PA',
    department: 'Management',
    permissions: ['view_all', 'reports'],
    permissionLevel: 1, // read only
    canAccessSteps: [], // Can view all
    workbookAccess: 'restricted',
  },
  
  // Admin - System Administrator
  {
    id: 'user-admin',
    username: 'admin',
    password: 'Test@123',
    email: 'admin@alhashargroup.com',
    name: 'System Administrator',
    role: 'Admin',
    department: 'Management',
    permissions: ['full_access', 'user_management', 'system_config'],
    permissionLevel: 3, // read, edit, delete
    canAccessSteps: [], // Can access everything
    workbookAccess: 'full',
  },
]

/**
 * Get user by username
 */
export function getUserByUsername(username: string): TestUser | undefined {
  return TEST_USERS.find((user) => user.username === username)
}

/**
 * Get user by email
 */
export function getUserByEmail(email: string): TestUser | undefined {
  return TEST_USERS.find((user) => user.email === email)
}

/**
 * Validate user credentials
 */
export function validateCredentials(username: string, password: string): TestUser | null {
  const user = getUserByUsername(username)
  if (user && user.password === password) {
    return user
  }
  return null
}

/**
 * Get users by department
 */
export function getUsersByDepartment(department: string): TestUser[] {
  return TEST_USERS.filter((user) => user.department === department)
}

/**
 * Get users by division
 */
export function getUsersByDivision(division: string): TestUser[] {
  return TEST_USERS.filter((user) => user.division === division)
}

/**
 * Check if user can access step
 */
export function canUserAccessStep(user: TestUser, stepNumber: string): boolean {
  // Admin can access everything
  if (user.role === 'Admin') return true
  
  // Management can view all
  if (user.department === 'Management') return true
  
  // Check if step is in user's accessible steps
  return user.canAccessSteps.includes(stepNumber)
}

/**
 * Get user's accessible steps
 */
export function getUserAccessibleSteps(user: TestUser): string[] {
  if (user.role === 'Admin' || user.department === 'Management') {
    // Return all step numbers
    return [
      '1.1', '1.2', '1.3', '1.4', '1.5', '1.6',
      '2.1', '2.2', '2.3', '2.4', '2.5', '2.6',
      '3.1', '3.2', '3.3', '3.4', '3.5',
      '4.0', '5.0', '6.0', '6.1', '6.2',
      '7.0', '8.0', '9.0', '10.0', '11.0', '12.0', '13.0', '14.0', '15.0',
      '16.0', '17.0', '18.0',
    ]
  }
  return user.canAccessSteps
}

/**
 * Check if user can edit data (permission level 2 or 3)
 */
export function canUserEdit(user: TestUser): boolean {
  return user.permissionLevel >= 2
}

/**
 * Check if user can delete data (permission level 3)
 */
export function canUserDelete(user: TestUser): boolean {
  return user.permissionLevel === 3
}

/**
 * Get permission level description
 */
export function getPermissionLevelDescription(level: 1 | 2 | 3): string {
  switch (level) {
    case 1:
      return 'Read Only'
    case 2:
      return 'Read and Edit'
    case 3:
      return 'Read, Edit, and Delete'
    default:
      return 'Unknown'
  }
}

/**
 * Get workbook access description
 */
export function getWorkbookAccessDescription(access?: string): string {
  switch (access) {
    case 'full':
      return 'Full Access - Can modify all data and settings'
    case 'shared':
      return 'Shared Access - Can edit assigned data fields'
    case 'restricted':
      return 'Restricted Access - Read-only with limited viewing rights'
    default:
      return 'Standard Access'
  }
}
