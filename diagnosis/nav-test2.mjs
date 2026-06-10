import { chromium } from 'playwright'

const CHROME_PATH = '/home/blueclouds/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome'
const BASE = 'http://localhost:5173'

async function main() {
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  })
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })

  page.on('console', msg => console.log(`[${msg.type()}] ${msg.text()}`))
  page.on('pageerror', err => console.log(`[pageerror] ${err.message}`))
  page.on('requestfailed', req => console.log(`[requestfailed] ${req.url()} — ${req.failure()?.errorText}`))

  await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 30000 })
  console.log('Loaded /')

  const loginLink = await page.$('a[href="/login"]')
  if (loginLink) {
    await loginLink.click()
    await page.waitForTimeout(3000)
    const html = await page.content()
    console.log('\nAfter /login nav:')
    console.log('URL:', page.url())
    console.log('Has Welcome Back:', html.includes('Welcome Back'))

    // Check for skeleton-specific pattern
    console.log('Has PageSkeleton grid:', html.includes('lg:col-span-8'))
    console.log('Has glass-card h-28:', html.includes('glass-card h-28'))

    // Count animate-pulse occurrences
    const pulseCount = (html.match(/animate-pulse/g) || []).length
    console.log('animate-pulse count:', pulseCount)

    // Check if there's a nested dark bg-background inside (would indicate duplicate App wrapper)
    const darkCount = (html.match(/class="dark min-h-screen bg-background"/g) || []).length
    console.log('dark bg-background count:', darkCount)
  }

  await browser.close()
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
