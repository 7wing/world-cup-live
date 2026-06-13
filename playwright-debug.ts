import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', (msg) => console.log(`[CONSOLE ${msg.type()}] ${msg.text()}`));

  try {
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', 'qa_agent@worldcuplive.test');
    await page.fill('input[type="password"]', 'QA_Pass_2026!');
    await Promise.all([
      page.waitForURL('**/matches', { timeout: 15000 }),
      page.click('button[type="submit"]'),
    ]);

    // Get auth token
    const session = await page.evaluate(() => {
      const raw = localStorage.getItem('sb-lrsphlbeqdqgsxwkmrlf-auth-token');
      return raw ? JSON.parse(raw) : null;
    });
    const accessToken = session?.access_token;
    const userId = session?.user?.id;
    console.log('User ID:', userId);

    // 1. Insert a post directly
    const testContent = 'Direct API Test ' + Date.now();
    console.log('Inserting post directly via Supabase REST API...');
    const insertRes = await page.evaluate(async (token, user_id, content) => {
      const res = await fetch('https://lrsphlbeqdqgsxwkmrlf.supabase.co/rest/v1/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxyc3BobGJlcWRxZ3N4d2ttcmxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMDMxMDIsImV4cCI6MjA5NDU3OTEwMn0.XiSHi9k_uxnB8oNjWfUc_JOzKz2ywz98W7yfgbrpNu0',
          'Authorization': `Bearer ${token}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({ user_id, content, media_url: null, media_type: null, match_id: null }),
      });
      return { status: res.status, body: await res.text() };
    }, accessToken, userId, testContent);

    console.log('Insert result:', insertRes);

    // 2. Fetch recent posts
    console.log('Fetching recent posts...');
    const fetchRes = await page.evaluate(async (token) => {
      const res = await fetch('https://lrsphlbeqdqgsxwkmrlf.supabase.co/rest/v1/posts?select=*,user:users(id,username,avatar_url)&order=created_at.desc&limit=5', {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxyc3BobGJlcWRxZ3N4d2ttcmxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMDMxMDIsImV4cCI6MjA5NDU3OTEwMn0.XiSHi9k_uxnB8oNjWfUc_JOzKz2ywz98W7yfgbrpNu0',
          'Authorization': `Bearer ${token}`,
        },
      });
      return { status: res.status, body: await res.text() };
    }, accessToken);

    console.log('Fetch result:', fetchRes);

    // 3. Navigate to fan zone and see if post appears
    await page.goto('http://localhost:5173/fan-zone');
    await page.waitForTimeout(5000);

    const bodyText = await page.locator('body').innerText();
    if (bodyText.includes(testContent)) {
      console.log('✅ Post is VISIBLE on fan zone page');
    } else {
      console.log('❌ Post is NOT visible on fan zone page');
    }

    // 4. Also test clicking the composer button and see network
    await page.click('button.fixed');
    await page.waitForTimeout(500);
    await page.fill('textarea[placeholder*="Share your match energy"]', 'Playwright click test ' + Date.now());
    
    // Capture network during click
    const requests: string[] = [];
    const handler = (req: any) => {
      if (req.url().includes('posts') || req.url().includes('supabase')) {
        requests.push(`${req.method()} ${req.url()}`);
      }
    };
    page.on('request', handler);
    
    await page.click('button:has-text("Post")');
    await page.waitForTimeout(5000);
    page.off('request', handler);
    
    console.log('Network requests during post click:');
    requests.forEach(r => console.log('  -', r));

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await browser.close();
  }
})();
