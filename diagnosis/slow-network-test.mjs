import { chromium } from 'playwright'

const CHROME_PATH = '/home/blueclouds/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome'
const BASE = 'http://localhost:5173'

async function main() {
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  })
  const context = await browser.newContext()
  const page = await context.newPage({ viewport: { width: 1280, height: 800 } })

  // Intercept Supabase requests and delay them
  await page.route('https://lrsphlbeqdqgsxwkmrlf.supabase.co/**', async route => {
    const url = route.request().url()
    console.log(`DELAYING: ${url}`)
    await new Promise(r => setTimeout(r, 10000))
    await route.continue()
  })

  const logs = []
  page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`))
  page.on('pageerror', err => logs.push(`[pageerror] ${err.message}`))

  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 30000 })
  console.log('Page loaded, waiting 15s with slow Supabase...')
  await page.waitForTimeout(15000)

  const html = await page.content()
  console.log('Has Loading text:', html.includes('Loading…'))
  console.log('Has Schedule:', html.includes('Schedule'))
  console.log('Has matches:', html.includes('matches'))
  console.log('Has animate-pulse:', html.includes('animate-pulse'))

  console.log('\n=== Console logs ===')
  logs.forEach(l => console.log(l))

  await browser.close()
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
