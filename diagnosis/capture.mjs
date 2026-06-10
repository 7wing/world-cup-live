import { chromium } from 'playwright'
import fs from 'fs'

const CHROME_PATH = '/home/blueclouds/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome'
const URL = 'http://localhost:5173/'
const OUT_DIR = '/home/blueclouds/workspace/github/7wing/world-cup-live/diagnosis'

async function main() {
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  })
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })

  const logs = []
  page.on('console', msg => {
    const text = `[${msg.type()}] ${msg.text()}`
    logs.push(text)
    console.log(text)
  })
  page.on('pageerror', err => {
    const text = `[pageerror] ${err.message}`
    logs.push(text)
    console.log(text)
  })
  page.on('requestfailed', req => {
    const text = `[requestfailed] ${req.url()} — ${req.failure()?.errorText}`
    logs.push(text)
    console.log(text)
  })

  await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 })
  await page.waitForTimeout(5000)

  await page.screenshot({ path: `${OUT_DIR}/screenshot-before.png`, fullPage: false })
  fs.writeFileSync(`${OUT_DIR}/console.log`, logs.join('\n'), 'utf-8')

  await browser.close()
  console.log('Done.')
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
