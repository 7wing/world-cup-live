import { chromium } from 'playwright'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://lrsphlbeqdqgsxwkmrlf.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxyc3BobGJlcWRxZ3N4d2ttcmxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMDMxMDIsImV4cCI6MjA5NDU3OTEwMn0.XiSHi9k_uxnB8oNjWfUc_JOzKz2ywz98W7yfgbrpNu0'

const TEST_EMAIL = 'qa_agent@worldcuplive.test'
const TEST_PASSWORD = 'QA_Pass_2026!'

;(async () => {
  // 1) Sign in with Supabase
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  const { data, error } = await supabase.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  })
  if (error) {
    console.error('Login failed:', error.message)
    process.exit(1)
  }
  console.log('Signed in as', data.user.email, 'id=', data.user.id)

  // 2) Launch browser
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    baseURL: 'http://localhost:5173',
    viewport: { width: 1280, height: 800 },
  })
  const page = await context.newPage()

  // 3) Set auth token in localStorage
  const projectRef = new URL(SUPABASE_URL).hostname.split('.')[0]
  const authTokenKey = `sb-${projectRef}-auth-token`

  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await page.evaluate(
    (key, token) => {
      localStorage.setItem(key, JSON.stringify(token))
    },
    authTokenKey,
    {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
      expires_in: data.session.expires_in,
      token_type: data.session.token_type,
    }
  )
  console.log('Auth token injected into localStorage')

  // 3b) Reload so the app picks up the auth state
  await page.goto('/events')
  await page.waitForSelector('h1', { timeout: 10000 })

  // 4) Click Host Event
  const hostBtn = page.getByRole('button', { name: /Host Event/i })
  await hostBtn.click()
  console.log('Opened Host Event modal')

  // 5) Fill form
  const eventName = 'Demo Virtual Watch Party'
  await page.getByLabel(/Event Name/i).fill(eventName)
  await page.getByLabel(/Description/i).fill('Created by the test account via automation!')
  await page.getByLabel(/Link/i).fill('https://zoom.us/j/123456789')

  const future = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
  const dateStr = future.toISOString().slice(0, 16)
  await page.getByLabel(/Starts At/i).fill(dateStr)
  console.log('Form filled')

  // 6) Submit
  const submitBtn = page.getByRole('button', { name: /Host Event/i }).filter({ hasText: /^Host Event$/i })
  await submitBtn.click()
  console.log('Form submitted')

  // 7) Wait for modal to close and event to appear
  await page.waitForTimeout(2000)

  // 8) Screenshot
  await page.screenshot({ path: '/home/blueclouds/workspace/github/7wing/world-cup-live/events-page.png', fullPage: true })
  console.log('Screenshot saved to events-page.png')

  await browser.close()
})()
