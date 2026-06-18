import { test as setup } from '@playwright/test'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: resolve(__dirname, '../../.env') })

const TEST_ACCOUNTS = [
  {
    email: 'qa_agent@worldcuplive.test',
    password: 'QA_Pass_2026!',
    storagePath: 'tests/.auth/user.json',
  },
]

setup('authenticate test user', async ({ browser }) => {
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL!
  const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY!

  // Import Supabase client dynamically to use the env vars
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  for (const account of TEST_ACCOUNTS) {
    // Sign in with the existing test account
    const { data, error } = await supabase.auth.signInWithPassword({
      email: account.email,
      password: account.password,
    })

    if (error) {
      console.error(`Failed to sign in as ${account.email}:`, error.message)
      throw error
    }

    console.log(`Signed in as ${account.email}, user ID: ${data.user?.id}`)

    // Create browser context to save storage state
    const context = await browser.newContext({
      baseURL: 'http://localhost:5173',
    })
    const page = await context.newPage()

    // Navigate to the app to initialize Supabase auth state
    await page.goto('/')

    // Set the auth token in localStorage directly
    // The key format is sb-<project-ref>-auth-token
    const projectRef = new URL(SUPABASE_URL).hostname.split('.')[0]
    const authTokenKey = `sb-${projectRef}-auth-token`

    if (data.session) {
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
    }

    // Save storage state for use in tests
    await context.storageState({ path: resolve(__dirname, '../..', account.storagePath) })
    console.log(`Saved auth state to ${account.storagePath}`)

    await context.close()
  }
})