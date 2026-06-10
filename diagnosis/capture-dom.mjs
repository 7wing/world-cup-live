import { chromium } from 'playwright'
import fs from 'fs'

const CHROME_PATH = '/home/blueclouds/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome'
const BASE = 'http://localhost:5173'
const OUT_DIR = '/home/blueclouds/workspace/github/7wing/world-cup-live/diagnosis'

const routes = ['/', '/login', '/matches', '/fan-zone']

async function main() {
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  })

  for (const route of routes) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
    await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(3000)

    const html = await page.content()
    const rootHtml = await page.evaluate(() => document.getElementById('root')?.innerHTML || 'NO ROOT')

    const safe = route.replace(/\//g, '_') || 'root'
    fs.writeFileSync(`${OUT_DIR}/dom-${safe}.html`, rootHtml, 'utf-8')
    console.log(`=== ${route} ===`)
    console.log(rootHtml.slice(0, 800))
    console.log('\n')
    await page.close()
  }

  await browser.close()
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
