import { chromium } from 'playwright'
import fs from 'fs'

const CHROME_PATH = '/home/blueclouds/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome'
const BASE = 'http://localhost:5173'
const OUT_DIR = '/home/blueclouds/workspace/github/7wing/world-cup-live/diagnosis'

const routes = ['/', '/login', '/matches', '/fan-zone', '/stadiums']

async function main() {
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  })

  for (const route of routes) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
    const logs = []
    page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`))
    page.on('pageerror', err => logs.push(`[pageerror] ${err.message}`))
    page.on('requestfailed', req => logs.push(`[requestfailed] ${req.url()} — ${req.failure()?.errorText}`))

    await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(5000)

    const safe = route.replace(/\//g, '_') || 'root'
    await page.screenshot({ path: `${OUT_DIR}/screenshot-${safe}.png`, fullPage: false })
    fs.writeFileSync(`${OUT_DIR}/console-${safe}.log`, logs.join('\n'), 'utf-8')
    console.log(`Captured ${route} — ${logs.length} log lines`)
    await page.close()
  }

  await browser.close()
  console.log('All routes captured.')
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
