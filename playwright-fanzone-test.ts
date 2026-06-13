import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  page.on('console', (msg) => {
    console.log(`[browser ${msg.type()}] ${msg.text()}`);
  });
  page.on('pageerror', (error) => {
    console.log(`[PAGE ERROR] ${error.message}`);
    console.log(`[PAGE ERROR STACK] ${error.stack || 'no stack'}`);
  });

  // Capture ALL network to see what's happening
  page.on('request', (req) => {
    console.log(`[REQUEST] ${req.method()} ${req.url().substring(0, 250)}`);
  });
  page.on('response', async (res) => {
    const status = res.status();
    const body = await res.text().catch(() => '');
    console.log(`[RESPONSE] ${status} ${res.url().substring(0, 250)}`);
    if (status >= 400 || body.toLowerCase().includes('error') || body.toLowerCase().includes('fail')) {
      console.log(`[RESPONSE BODY] ${body.substring(0, 800)}`);
    }
  });

  try {
    console.log('Navigating to login...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });

    console.log('Filling login credentials...');
    await page.fill('input[type="email"]', 'qa_agent@worldcuplive.test');
    await page.fill('input[type="password"]', 'QA_Pass_2026!');

    console.log('Submitting login...');
    await Promise.all([
      page.waitForURL('**/matches', { timeout: 15000 }),
      page.click('button[type="submit"]'),
    ]);
    console.log('Logged in successfully');

    console.log('Navigating to fan zone...');
    await page.goto('http://localhost:5173/fan-zone', { waitUntil: 'networkidle' });
    await page.waitForSelector('h1:has-text("Fan Zone")', { timeout: 15000 });
    await page.waitForTimeout(3000);

    console.log('Looking for FAB button...');
    const fabButton = page.locator('button.fixed').first();
    await fabButton.waitFor({ timeout: 10000 });
    console.log('Clicking FAB...');
    await fabButton.click();

    await page.waitForSelector('textarea[placeholder*="Share your match energy"]', { timeout: 10000 });

    const testContent = `QA Test Post ${Date.now()}`;
    console.log(`Typing post: "${testContent}"`);
    await page.fill('textarea[placeholder*="Share your match energy"]', testContent);

    console.log('Clicking Post button...');
    const postButton = page.locator('button:has-text("Post")').last();
    await postButton.waitFor({ timeout: 5000 });

    // Check if button is disabled
    const isDisabled = await postButton.isDisabled();
    console.log(`Post button disabled: ${isDisabled}`);

    await postButton.click();

    // Wait for the popup to close
    await page.waitForTimeout(1000);
    const popupVisible = await page.locator('textarea[placeholder*="Share your match energy"]').isVisible().catch(() => false);
    console.log(`Popup still visible after click: ${popupVisible}`);

    // Wait for any posts network request
    console.log('Waiting 10 seconds for any posts network request...');
    await page.waitForTimeout(10000);

    // Check if post appears
    const count = await page.locator(`text=${testContent}`).count();
    console.log(`Post content occurrences: ${count}`);

    // Also check body for specific text
    const bodyText = await page.locator('body').innerText();
    if (bodyText.includes(testContent)) {
      console.log('✅ SUCCESS: Post text found in page body!');
      process.exitCode = 0;
    } else if (bodyText.includes('No posts yet')) {
      console.log('❌ FAILURE: Page shows "No posts yet" — post was not created/displayed');
      await page.screenshot({ path: '/tmp/fanzone-failure.png', fullPage: true });
      process.exitCode = 1;
    } else {
      console.log('❌ Post not found in body');
      await page.screenshot({ path: '/tmp/fanzone-failure.png', fullPage: true });
      process.exitCode = 1;
    }

  } catch (err) {
    console.error('Error during test:', err);
    await page.screenshot({ path: '/tmp/fanzone-error.png', fullPage: true });
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
