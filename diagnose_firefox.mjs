import { firefox } from 'playwright';

(async () => {
  const browser = await firefox.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Enable console log collection
  const logs = [];
  page.on('console', msg => {
    logs.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    });
  });

  // Enable page error collection
  const pageErrors = [];
  page.on('pageerror', err => {
    pageErrors.push({
      message: err.message,
      stack: err.stack
    });
  });

  // Enable request failed collection
  const failedRequests = [];
  page.on('requestfailed', request => {
    failedRequests.push({
      url: request.url(),
      failure: request.failure()
    });
  });

  // Enable response collection for non-2xx
  const failedResponses = [];
  page.on('response', response => {
    if (!response.ok()) {
      failedResponses.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText()
      });
    }
  });

  await page.goto('http://localhost:5177/', { waitUntil: 'networkidle' });
  // Wait an additional 5 seconds to let any dynamic content load
  await page.waitForTimeout(5000);

  // Take screenshot
  await page.screenshot({ path: 'loading-state.png' });

  // Gather storage info
  const localStorage = await page.evaluate(() => Object.entries(localStorage));
  const sessionStorage = await page.evaluate(() => Object.entries(sessionStorage));

  // Output results
  console.log('=== SCREENSHOT SAVED ===');
  console.log('=== CONSOLE LOGS ===');
  logs.forEach(log => {
    console.log(`${log.type.toUpperCase()}: ${log.text}`);
    if (log.location) {
      console.log(`   at ${log.location.url}:${log.location.lineNumber}:${log.location.columnNumber}`);
    }
  });

  console.log('=== PAGE ERRORS ===');
  pageErrors.forEach(err => {
    console.log(`ERROR: ${err.message}`);
    if (err.stack) {
      console.log(err.stack);
    }
  });

  console.log('=== FAILED REQUESTS ===');
  failedRequests.forEach(req => {
    console.log(`FAILED REQUEST: ${req.url}`);
    console.log(`  Failure: ${JSON.stringify(req.failure)}`);
  });

  console.log('=== FAILED RESPONSES (non-2xx) ===');
  failedResponses.forEach(res => {
    console.log(`FAILED RESPONSE: ${res.url} - ${res.status} ${res.statusText}`);
  });

  console.log('=== LOCALSTORAGE ===');
  console.log(JSON.stringify(localStorage, null, 2));

  console.log('=== SESSIONSTORAGE ===');
  console.log(JSON.stringify(sessionStorage, null, 2));

  await browser.close();
})();
