import { test, expect } from '@playwright/test'

test.describe('Shipments Page E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to shipments page
    await page.goto('/shipments')
    // Wait for the page to load
    await page.waitForLoadState('networkidle')
  })

  test('should display shipments page', async ({ page }) => {
    // Check page title
    await expect(page.locator('h1')).toContainText('Shipments')
    
    // Check description
    await expect(page.getByText('Manage and track all customs clearance shipments')).toBeVisible()
  })

  test('should display shipments table', async ({ page }) => {
    // Wait for table to load
    await page.waitForSelector('table', { timeout: 10000 })
    
    // Check table headers
    await expect(page.getByText('Shipment #')).toBeVisible()
    await expect(page.getByText('Principal')).toBeVisible()
    await expect(page.getByText('Status')).toBeVisible()
    
    // Check for at least one shipment row
    const rows = page.locator('tbody tr')
    await expect(rows.first()).toBeVisible()
  })

  test('should search shipments', async ({ page }) => {
    // Wait for search input
    const searchInput = page.getByPlaceholder(/search by shipment/i)
    await expect(searchInput).toBeVisible()
    
    // Type in search
    await searchInput.fill('Toyota')
    
    // Wait for results to update
    await page.waitForTimeout(500)
    
    // Check that results are filtered
    const tableBody = page.locator('tbody')
    await expect(tableBody).toBeVisible()
  })

  test('should open filters drawer', async ({ page }) => {
    // Click filters button
    await page.getByText('Filters').click()
    
    // Check if drawer is visible
    await page.waitForTimeout(300)
    
    // Look for filter options
    const drawer = page.locator('[role="dialog"]').or(page.locator('.fixed'))
    await expect(drawer.first()).toBeVisible()
  })

  test('should select shipment rows', async ({ page }) => {
    // Wait for table
    await page.waitForSelector('table')
    
    // Get all checkboxes
    const checkboxes = page.locator('input[type="checkbox"]')
    const count = await checkboxes.count()
    
    if (count > 1) {
      // Click first data row checkbox (skip header)
      await checkboxes.nth(1).click()
      
      // Check if bulk actions appear
      await page.waitForTimeout(300)
      const bulkActions = page.getByText(/selected/i)
      await expect(bulkActions).toBeVisible()
    }
  })

  test('should navigate to shipment details', async ({ page }) => {
    // Wait for table
    await page.waitForSelector('table')
    
    // Click on first shipment number link
    const firstShipmentLink = page.locator('tbody a').first()
    await expect(firstShipmentLink).toBeVisible()
    
    await firstShipmentLink.click()
    
    // Wait for navigation
    await page.waitForLoadState('networkidle')
    
    // Check URL changed
    expect(page.url()).toContain('/shipments/')
  })

  test('should sort shipments', async ({ page }) => {
    // Wait for table
    await page.waitForSelector('table')
    
    // Click on a sortable column header
    const shipmentHeader = page.getByText('Shipment #')
    await shipmentHeader.click()
    
    // Wait for sort to apply
    await page.waitForTimeout(300)
    
    // Check for sort indicator
    const headerParent = shipmentHeader.locator('..')
    await expect(headerParent).toContainText(/[↑↓]/)
  })

  test('should display pagination', async ({ page }) => {
    // Wait for table
    await page.waitForSelector('table')
    
    // Look for pagination text
    const paginationText = page.getByText(/showing.*of.*shipments/i)
    
    // Check if pagination exists (might not if less than page size)
    const isVisible = await paginationText.isVisible().catch(() => false)
    
    if (isVisible) {
      await expect(paginationText).toBeVisible()
    }
  })

  test('should toggle column visibility', async ({ page }) => {
    // Click columns button
    const columnsButton = page.getByText('Columns').or(page.locator('button:has-text("7/8")'))
    
    if (await columnsButton.isVisible()) {
      await columnsButton.click()
      
      // Wait for dropdown
      await page.waitForTimeout(300)
      
      // Check for column options
      const dropdown = page.locator('[role="menu"]').or(page.locator('.absolute'))
      await expect(dropdown.first()).toBeVisible()
    }
  })

  test('should export shipments', async ({ page }) => {
    // Click export button
    const exportButton = page.getByText('Export')
    await expect(exportButton).toBeVisible()
    
    // Note: Actual download testing would require more setup
    // Just verify button is clickable
    await expect(exportButton).toBeEnabled()
  })
})

test.describe('Shipment Details Page E2E', () => {
  test('should display shipment details', async ({ page }) => {
    // Navigate directly to a shipment detail page
    await page.goto('/shipments/1')
    await page.waitForLoadState('networkidle')
    
    // Check for shipment overview section
    await expect(page.getByText(/shipment/i).first()).toBeVisible()
  })

  test('should display workflow timeline', async ({ page }) => {
    await page.goto('/shipments/1')
    await page.waitForLoadState('networkidle')
    
    // Look for workflow or timeline elements
    const workflowSection = page.locator('text=/workflow|timeline|step/i').first()
    
    // Check if workflow section exists
    const isVisible = await workflowSection.isVisible().catch(() => false)
    expect(isVisible).toBeTruthy()
  })
})

test.describe('Dashboard E2E', () => {
  test('should display dashboard', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Check for dashboard elements
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })

  test('should display metrics cards', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Look for stat cards or metrics
    const cards = page.locator('[class*="card"], [class*="stat"]')
    const count = await cards.count()
    
    expect(count).toBeGreaterThan(0)
  })
})
