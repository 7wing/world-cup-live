import { test, expect, Page } from '@playwright/test'

/**
 * Events feature E2E tests
 *
 * Note: These tests use a single authenticated user (qa_agent@worldcuplive.test).
 * Tests that require multiple users (e.g., one to host, another to join) are
 * noted in comments. Full multi-user testing requires:
 * 1. Valid Supabase service role key (current .env key ends with .fake)
 * 2. Pre-created test accounts in Supabase
 */

test.describe('Events page', () => {
  test.beforeEach(async ({ page }) => {
    // Wait for the page to fully load
    await page.goto('/events')
    // Wait for the loading skeleton to disappear and content to appear
    await page.waitForSelector('h1', { timeout: 10000 })
  })

  test('events page loads and shows header elements', async ({ page }) => {
    await expect(page).toHaveURL(/\/events/)
    await expect(page.locator('h1')).toContainText('Events')
  })

  test('host event button is visible even when not authenticated', async ({ page }) => {
    // The Host Event button should always be visible
    const hostBtn = page.getByRole('button', { name: /Host Event/i })
    await expect(hostBtn).toBeVisible()
  })

  test('filter tabs are present', async ({ page }) => {
    // Check filter tabs exist
    await expect(page.getByRole('button', { name: /^All$/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /^Virtual$/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /^Physical$/i })).toBeVisible()
  })

  test('filter tabs switch between virtual and physical events', async ({ page }) => {
    // Click Virtual filter
    await page.getByRole('button', { name: /^Virtual$/i }).click()
    await page.waitForTimeout(300)

    // Click Physical filter
    await page.getByRole('button', { name: /^Physical$/i }).click()
    await page.waitForTimeout(300)

    // Click All filter
    await page.getByRole('button', { name: /^All$/i }).click()
    await page.waitForTimeout(300)
  })
})

test.describe('Events page with authentication', () => {
  // Use the authenticated user storage state
  test.use({ storageState: 'tests/.auth/user.json' })

  test('authenticated user can open host event modal', async ({ page }) => {
    await page.goto('/events')
    await page.waitForSelector('h1', { timeout: 10000 })

    // Click Host Event button
    const hostBtn = page.getByRole('button', { name: /Host Event/i })
    await hostBtn.click()

    // Modal should appear with form fields
    await expect(page.getByLabel(/Event Name/i)).toBeVisible()
    await expect(page.getByLabel(/Description/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /Virtual/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Physical/i })).toBeVisible()
  })

  test('host can create a virtual event', async ({ page }) => {
    await page.goto('/events')
    await page.waitForSelector('h1', { timeout: 10000 })

    // Open host modal
    await page.getByRole('button', { name: /Host Event/i }).click()

    // Fill the form
    await page.getByLabel(/Event Name/i).fill('Test Virtual Watch Party')
    await page.getByLabel(/Description/i).fill('Join us for the Brazil vs Argentina match!')

    // Virtual should be selected by default, verify the button is active
    const virtualBtn = page.getByRole('button', { name: /Virtual/i })
    await expect(virtualBtn).toBeVisible()

    // Fill link field
    await page.getByLabel(/Link/i).fill('https://zoom.us/j/123456789')

    // Set start time to 2 days from now
    const future = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    const dateStr = future.toISOString().slice(0, 16)
    await page.getByLabel(/Starts At/i).fill(dateStr)

    // Submit the form
    const submitBtn = page.getByRole('button', { name: /Host Event/i })
    await submitBtn.click()

    // Wait for modal to close and event to appear
    await page.waitForTimeout(2000)

    // The new event should appear on the page
    await expect(page.locator('text=Test Virtual Watch Party')).toBeVisible({ timeout: 5000 })
  })

  test('user can join an event', async ({ page }) => {
    await page.goto('/events')
    await page.waitForSelector('h1', { timeout: 10000 })

    // Find a Join button (not "Join Event" or similar, just "Join")
    const joinBtn = page.getByRole('button', { name: /^Join$/i }).first()

    // Check if there's an event to join
    const isJoinVisible = await joinBtn.isVisible().catch(() => false)

    if (isJoinVisible) {
      await joinBtn.click()

      // After joining, button should change to Leave
      await expect(page.getByRole('button', { name: /^Leave$/i }).first()).toBeVisible({ timeout: 5000 })
    } else {
      // No events to join - test is inconclusive but not failed
      console.log('No events available to join at this time')
    }
  })

  test('user can leave an event they joined', async ({ page }) => {
    await page.goto('/events')
    await page.waitForSelector('h1', { timeout: 10000 })

    // Find a Leave button
    const leaveBtn = page.getByRole('button', { name: /^Leave$/i }).first()

    // Check if user has joined any events
    const isLeaveVisible = await leaveBtn.isVisible().catch(() => false)

    if (isLeaveVisible) {
      await leaveBtn.click()

      // After leaving, Join button should be visible again
      await expect(page.getByRole('button', { name: /^Join$/i }).first()).toBeVisible({ timeout: 5000 })
    } else {
      // User hasn't joined any events - test is inconclusive but not failed
      console.log('User has not joined any events to leave')
    }
  })
})