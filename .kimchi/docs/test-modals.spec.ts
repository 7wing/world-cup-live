import { test, expect } from '@playwright/test'

test('profile page modals open', async ({ page }) => {
  page.on('console', msg => console.log(`[${msg.type()}] ${msg.text()}`))
  page.on('pageerror', err => console.log(`[PAGE ERROR] ${err.message}`))

  await page.goto('http://localhost:5174/profile/test-user-id')
  await page.waitForTimeout(2000)

  await page.screenshot({ path: '.kimchi/docs/profile-page.png' })

  // Check if Settings button exists and click it
  const settingsBtn = page.locator('button[aria-label="Settings"]').first()
  const editBtn = page.locator('button[aria-label="Edit profile"]').first()

  if (await settingsBtn.isVisible().catch(() => false)) {
    console.log('Settings button visible')
    await settingsBtn.click()
    await page.waitForTimeout(500)
    await page.screenshot({ path: '.kimchi/docs/after-settings-click.png' })
    const modal = page.locator('text=Settings').first()
    console.log('Settings modal text visible:', await modal.isVisible().catch(() => false))
  } else {
    console.log('Settings button NOT visible')
  }

  if (await editBtn.isVisible().catch(() => false)) {
    console.log('Edit profile button visible')
    await editBtn.click()
    await page.waitForTimeout(500)
    await page.screenshot({ path: '.kimchi/docs/after-edit-click.png' })
    const modal = page.locator('text=Edit Profile').first()
    console.log('Edit modal text visible:', await modal.isVisible().catch(() => false))
  } else {
    console.log('Edit profile button NOT visible')
  }
})
