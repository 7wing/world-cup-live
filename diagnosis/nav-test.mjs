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

  const logs = []
  page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`))
  page.on('pageerror', err => logs.push(`[pageerror] ${err.message}`))
  page.on('requestfailed', req => logs.push(`[requestfailed] ${req.url()} — ${req.failure()?.errorText}`))

  // Load root
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 30000 })
  console.log('Loaded /', await page.title())

  // Click login link in TopBar or BottomNav
  const loginLink = await page.$('a[href="/login"]')
  if (loginLink) {
    console.log('Found login link, clicking...')
    await loginLink.click()
    await page.waitForTimeout(3000)
    const html = await page.content()
    console.log('After click URL:', page.url())
    console.log('Contains Welcome Back:', html.includes('Welcome Back'))
    console.log('Contains animate-pulse:', html.includes('animate-pulse'))
  } else {
    console.log('No login link found on root page')
  }

  // Try navigating to fan-zone via link
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 30000 })
  const fanzoneLink = await page.$('a[href="/fan-zone"]')
  if (fanzoneLink) {
    console.log('Found fan-zone link, clicking...')
    await fanzoneLink.click()
    await page.waitForTimeout(3000)
    const html = await page.content()
    console.log('After click URL:', page.url())
    console.log('Contains Fan Zone:', html.includes('Fan Zone'))
    console.log('Contains animate-pulse:', html.includes('animate-pulse'))
  } else {
    console.log('No fan-zone link found')
  }

  console.log('\n=== Console logs ===')
  logs.forEach(l => console.log(l))

  await browser.close()
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
