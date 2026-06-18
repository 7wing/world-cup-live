import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()

page.on('console', msg => console.log(`[${msg.type()}] ${msg.text()}`))
page.on('pageerror', err => console.log(`[PAGE ERROR] ${err.message}`))

await page.goto('http://localhost:5174/profile/test-user-id', { waitUntil: 'networkidle' })
await page.waitForTimeout(2000)

await page.screenshot({ path: '.kimchi/docs/profile-page.png' })

const settingsBtn = page.locator('button[aria-label="Settings"]').first()
const editBtn = page.locator('button[aria-label="Edit profile"]').first()

const settingsVisible = await settingsBtn.isVisible().catch(() => false)
const editVisible = await editBtn.isVisible().catch(() => false)

console.log('Settings button visible:', settingsVisible)
console.log('Edit profile button visible:', editVisible)

if (settingsVisible) {
  await settingsBtn.click()
  await page.waitForTimeout(500)
  await page.screenshot({ path: '.kimchi/docs/after-settings-click.png' })
  const modal = page.locator('text=Settings').first()
  console.log('Settings modal text visible:', await modal.isVisible().catch(() => false))
}

if (editVisible) {
  await editBtn.click()
  await page.waitForTimeout(500)
  await page.screenshot({ path: '.kimchi/docs/after-edit-click.png' })
  const modal = page.locator('text=Edit Profile').first()
  console.log('Edit modal text visible:', await modal.isVisible().catch(() => false))
}

await browser.close()
