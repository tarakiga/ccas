/**
 * Permission and Role-Based Access Control Tests
 * Tests for permission levels, workbook access, and role-based functionality
 */

import {
  TEST_USERS,
  getUserByUsername,
  getUserByEmail,
  validateCredentials,
  getUsersByDepartment,
  getUsersByDivision,
  canUserAccessStep,
  getUserAccessibleSteps,
  canUserEdit,
  canUserDelete,
  getPermissionLevelDescription,
  getWorkbookAccessDescription,
  type TestUser,
} from '../test-users'

describe('Permission System Tests', () => {
  describe('Permission Levels', () => {
    test('should have correct permission levels assigned', () => {
      // Level 1 (Read Only) users
      const rajeev = getUserByUsername('rajeev')
      const simon = getUserByUsername('simon.turner')
      const nasafi = getUserByUsername('nasafi')
      
      expect(rajeev?.permissionLevel).toBe(1)
      expect(simon?.permissionLevel).toBe(1)
      expect(nasafi?.permissionLevel).toBe(1)

      // Level 2 (Read & Edit) users
      const rajendran = getUserByUsername('rajendran.p')
      const bala = getUserByUsername('bala')
      const salim = getUserByUsername('salim')
      
      expect(rajendran?.permissionLevel).toBe(2)
      expect(bala?.permissionLevel).toBe(2)
      expect(salim?.permissionLevel).toBe(2)

      // Level 3 (Full Access) users
      const raj = getUserByUsername('raj.nair')
      const mario = getUserByUsername('mario.r')
      const admin = getUserByUsername('admin')
      
      expect(raj?.permissionLevel).toBe(3)
      expect(mario?.permissionLevel).toBe(3)
      expect(admin?.permissionLevel).toBe(3)
    })

    test('should correctly identify users who can edit', () => {
      const rajeev = getUserByUsername('rajeev')! // Level 1
      const rajendran = getUserByUsername('rajendran.p')! // Level 2
      const raj = getUserByUsername('raj.nair')! // Level 3

      expect(canUserEdit(rajeev)).toBe(false)
      expect(canUserEdit(rajendran)).toBe(true)
      expect(canUserEdit(raj)).toBe(true)
    })

    test('should correctly identify users who can delete', () => {
      const rajeev = getUserByUsername('rajeev')! // Level 1
      const rajendran = getUserByUsername('rajendran.p')! // Level 2
      const raj = getUserByUsername('raj.nair')! // Level 3

      expect(canUserDelete(rajeev)).toBe(false)
      expect(canUserDelete(rajendran)).toBe(false)
      expect(canUserDelete(raj)).toBe(true)
    })

    test('should return correct permission level descriptions', () => {
      expect(getPermissionLevelDescription(1)).toBe('Read Only')
      expect(getPermissionLevelDescription(2)).toBe('Read and Edit')
      expect(getPermissionLevelDescription(3)).toBe('Read, Edit, and Delete')
    })
  })

  describe('Workbook Access Levels', () => {
    test('should have correct workbook access assigned', () => {
      // Full Access
      const raj = getUserByUsername('raj.nair')
      const mario = getUserByUsername('mario.r')
      const admin = getUserByUsername('admin')
      
      expect(raj?.workbookAccess).toBe('full')
      expect(mario?.workbookAccess).toBe('full')
      expect(admin?.workbookAccess).toBe('full')

      // Shared Access
      const rajendran = getUserByUsername('rajendran.p')
      const bala = getUserByUsername('bala')
      const salim = getUserByUsername('salim')
      
      expect(rajendran?.workbookAccess).toBe('shared')
      expect(bala?.workbookAccess).toBe('shared')
      expect(salim?.workbookAccess).toBe('shared')

      // Restricted Access
      const rajeev = getUserByUsername('rajeev')
      const simon = getUserByUsername('simon.turner')
      const nasafi = getUserByUsername('nasafi')
      
      expect(rajeev?.workbookAccess).toBe('restricted')
      expect(simon?.workbookAccess).toBe('restricted')
      expect(nasafi?.workbookAccess).toBe('restricted')
    })

    test('should return correct workbook access descriptions', () => {
      expect(getWorkbookAccessDescription('full')).toContain('Full Access')
      expect(getWorkbookAccessDescription('shared')).toContain('Shared Access')
      expect(getWorkbookAccessDescription('restricted')).toContain('Restricted Access')
    })

    test('should correlate workbook access with permission levels', () => {
      TEST_USERS.forEach(user => {
        if (user.workbookAccess === 'full') {
          expect(user.permissionLevel).toBe(3)
        }
        if (user.workbookAccess === 'restricted') {
          expect(user.permissionLevel).toBe(1)
        }
      })
    })
  })

  describe('Role-Based Access Control', () => {
    test('Business Unit users should access correct steps', () => {
      const rajendran = getUserByUsername('rajendran.p')!
      const steps = getUserAccessibleSteps(rajendran)
      
      expect(steps).toContain('1.1')
      expect(steps).toContain('2.6')
      expect(steps).toContain('3.3')
      expect(steps).not.toContain('4.0') // Finance step
      expect(steps).not.toContain('8.0') // C&C step
    })

    test('Finance users should access correct steps', () => {
      const bala = getUserByUsername('bala')!
      const steps = getUserAccessibleSteps(bala)
      
      expect(steps).toContain('3.1')
      expect(steps).toContain('4.0')
      expect(steps).toContain('5.0')
      expect(steps).toContain('13.0')
      expect(steps).not.toContain('1.1') // Business Unit step
      expect(steps).not.toContain('8.0') // C&C step
    })

    test('C&C users should access correct steps', () => {
      const salim = getUserByUsername('salim')!
      const steps = getUserAccessibleSteps(salim)
      
      expect(steps).toContain('3.4')
      expect(steps).toContain('8.0')
      expect(steps).toContain('9.0')
      expect(steps).toContain('15.0')
      expect(steps).not.toContain('1.1') // Business Unit step
      expect(steps).not.toContain('4.0') // Finance step
    })

    test('Warehouse users should access correct steps', () => {
      const warehouse = getUserByUsername('warehouse.manager')!
      const steps = getUserAccessibleSteps(warehouse)
      
      expect(steps).toContain('16.0')
      expect(steps).toContain('17.0')
      expect(steps).toContain('18.0')
      expect(steps).not.toContain('1.1')
      expect(steps).not.toContain('8.0')
    })

    test('Management users should access all steps', () => {
      const raj = getUserByUsername('raj.nair')!
      const steps = getUserAccessibleSteps(raj)
      
      expect(steps.length).toBeGreaterThan(15)
      expect(steps).toContain('1.1')
      expect(steps).toContain('4.0')
      expect(steps).toContain('8.0')
      expect(steps).toContain('16.0')
    })

    test('should correctly validate step access', () => {
      const rajendran = getUserByUsername('rajendran.p')!
      const bala = getUserByUsername('bala')!
      
      // Rajendran can access Business Unit steps
      expect(canUserAccessStep(rajendran, '1.1')).toBe(true)
      expect(canUserAccessStep(rajendran, '2.5')).toBe(true)
      
      // Rajendran cannot access Finance steps
      expect(canUserAccessStep(rajendran, '4.0')).toBe(false)
      expect(canUserAccessStep(rajendran, '5.0')).toBe(false)
      
      // Bala can access Finance steps
      expect(canUserAccessStep(bala, '3.1')).toBe(true)
      expect(canUserAccessStep(bala, '4.0')).toBe(true)
      
      // Bala cannot access Business Unit steps
      expect(canUserAccessStep(bala, '1.1')).toBe(false)
    })
  })

  describe('Department and Division Filtering', () => {
    test('should filter users by department', () => {
      const businessUnit = getUsersByDepartment('Business Unit')
      const finance = getUsersByDepartment('Finance')
      const cnc = getUsersByDepartment('C&C')
      const management = getUsersByDepartment('Management')
      
      expect(businessUnit.length).toBeGreaterThan(0)
      expect(finance.length).toBe(3) // Bala, Kamran, Shijith
      expect(cnc.length).toBe(1) // Salim
      expect(management.length).toBeGreaterThan(5)
      
      businessUnit.forEach(user => {
        expect(user.department).toBe('Business Unit')
      })
    })

    test('should filter users by division', () => {
      const tble = getUsersByDivision('TBLE')
      const lvd = getUsersByDivision('LVD')
      const hvd = getUsersByDivision('HVD')
      
      expect(tble.length).toBeGreaterThan(0)
      expect(lvd.length).toBeGreaterThan(0)
      expect(hvd.length).toBeGreaterThan(0)
      
      tble.forEach(user => {
        expect(user.division).toBe('TBLE')
      })
    })
  })

  describe('User Authentication', () => {
    test('should validate correct credentials', () => {
      const user = validateCredentials('rajendran.p', 'Test@123')
      
      expect(user).not.toBeNull()
      expect(user?.username).toBe('rajendran.p')
      expect(user?.name).toBe('Rajendran P.')
    })

    test('should reject incorrect password', () => {
      const user = validateCredentials('rajendran.p', 'WrongPassword')
      
      expect(user).toBeNull()
    })

    test('should reject non-existent username', () => {
      const user = validateCredentials('nonexistent', 'Test@123')
      
      expect(user).toBeNull()
    })

    test('should find user by email', () => {
      const user = getUserByEmail('Rajendran.P@alhashargroup.com')
      
      expect(user).not.toBeUndefined()
      expect(user?.username).toBe('rajendran.p')
    })
  })

  describe('Permission Combinations', () => {
    test('Level 1 users should have restricted workbook access', () => {
      const level1Users = TEST_USERS.filter(u => u.permissionLevel === 1)
      
      level1Users.forEach(user => {
        expect(user.workbookAccess).toBe('restricted')
        expect(canUserEdit(user)).toBe(false)
        expect(canUserDelete(user)).toBe(false)
      })
    })

    test('Level 2 users should have shared workbook access', () => {
      const level2Users = TEST_USERS.filter(u => u.permissionLevel === 2)
      
      level2Users.forEach(user => {
        expect(user.workbookAccess).toBe('shared')
        expect(canUserEdit(user)).toBe(true)
        expect(canUserDelete(user)).toBe(false)
      })
    })

    test('Level 3 users should have full workbook access', () => {
      const level3Users = TEST_USERS.filter(u => u.permissionLevel === 3)
      
      level3Users.forEach(user => {
        expect(user.workbookAccess).toBe('full')
        expect(canUserEdit(user)).toBe(true)
        expect(canUserDelete(user)).toBe(true)
      })
    })
  })

  describe('Audit and Oversight Roles', () => {
    test('audit users should have read-only access to all data', () => {
      const rajeev = getUserByUsername('rajeev')! // GCSO
      const simon = getUserByUsername('simon.turner')! // I.A. Manager
      
      expect(rajeev.permissionLevel).toBe(1)
      expect(simon.permissionLevel).toBe(1)
      
      expect(canUserEdit(rajeev)).toBe(false)
      expect(canUserEdit(simon)).toBe(false)
      
      // But they can access all steps for viewing
      const rajeevSteps = getUserAccessibleSteps(rajeev)
      const simonSteps = getUserAccessibleSteps(simon)
      
      expect(rajeevSteps.length).toBeGreaterThan(15)
      expect(simonSteps.length).toBeGreaterThan(15)
    })

    test('audit users should have audit permission', () => {
      const rajeev = getUserByUsername('rajeev')!
      const simon = getUserByUsername('simon.turner')!
      
      expect(rajeev.permissions).toContain('audit')
      expect(simon.permissions).toContain('audit')
    })
  })

  describe('New Users from Responsibility List', () => {
    test('Simon Turner should exist with correct properties', () => {
      const simon = getUserByUsername('simon.turner')
      
      expect(simon).toBeDefined()
      expect(simon?.name).toBe('Simon Turner')
      expect(simon?.role).toBe('I.A. Manager')
      expect(simon?.email).toBe('Simon.Turner@alhashargroup.com')
      expect(simon?.permissionLevel).toBe(1)
      expect(simon?.workbookAccess).toBe('restricted')
    })

    test('Nasafi Rahman should exist with correct properties', () => {
      const nasafi = getUserByUsername('nasafi')
      
      expect(nasafi).toBeDefined()
      expect(nasafi?.name).toBe('Nasafi Rahman')
      expect(nasafi?.role).toBe('Exec PA')
      expect(nasafi?.email).toBe('nasafi.rahman@alhasharauto.com')
      expect(nasafi?.permissionLevel).toBe(1)
      expect(nasafi?.workbookAccess).toBe('restricted')
    })
  })

  describe('Total User Count', () => {
    test('should have exactly 16 users', () => {
      expect(TEST_USERS.length).toBe(16)
    })

    test('should have correct distribution of permission levels', () => {
      const level1 = TEST_USERS.filter(u => u.permissionLevel === 1)
      const level2 = TEST_USERS.filter(u => u.permissionLevel === 2)
      const level3 = TEST_USERS.filter(u => u.permissionLevel === 3)
      
      expect(level1.length).toBe(3) // 19%
      expect(level2.length).toBe(10) // 62%
      expect(level3.length).toBe(3) // 19%
    })
  })

  describe('Edge Cases', () => {
    test('should handle undefined user gracefully', () => {
      const user = getUserByUsername('nonexistent')
      expect(user).toBeUndefined()
    })

    test('should handle empty step access list', () => {
      const raj = getUserByUsername('raj.nair')!
      // Management users have empty canAccessSteps but should get all steps
      expect(raj.canAccessSteps.length).toBe(0)
      
      const steps = getUserAccessibleSteps(raj)
      expect(steps.length).toBeGreaterThan(0)
    })

    test('all users should have required fields', () => {
      TEST_USERS.forEach(user => {
        expect(user.id).toBeDefined()
        expect(user.username).toBeDefined()
        expect(user.password).toBe('Test@123')
        expect(user.email).toBeDefined()
        expect(user.name).toBeDefined()
        expect(user.role).toBeDefined()
        expect(user.department).toBeDefined()
        expect(user.permissions).toBeDefined()
        expect(user.permissionLevel).toBeDefined()
        expect(user.canAccessSteps).toBeDefined()
      })
    })
  })
})
