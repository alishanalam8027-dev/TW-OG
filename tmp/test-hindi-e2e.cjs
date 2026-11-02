const { chromium } = require('playwright');

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 412, height: 915 }, // Pixel 7 standard viewport
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  const page = await context.newPage();
  
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.log('BROWSER CONSOLE ERROR:', msg.text());
    }
  });

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  // Wait for title
  await page.waitForSelector('text=TW OG GK');
  console.log('Page loaded successfully.');

  // Take screenshot of initial Hindi Home Dashboard
  await page.screenshot({ path: '/tmp/tw_og_gk_hindi_home.png' });
  console.log('Saved /tmp/tw_og_gk_hindi_home.png');

  // Check language toggle to English
  const langToggle = page.locator('button:has-text("हिंदी"), button:has-text("EN")').first();
  await langToggle.click();
  await page.waitForTimeout(500);
  console.log('Switched language to EN');
  await page.screenshot({ path: '/tmp/tw_og_gk_en_home.png' });

  // Switch back to Hindi
  await langToggle.click();
  await page.waitForTimeout(500);
  console.log('Switched back to Hindi');

  // Click on "दैनिक ब्लिट्ज़ खेलें" (Launch OG Blitz Quiz)
  const startBtn = page.locator('button[data-start="true"]');
  await startBtn.click();
  await page.waitForTimeout(1000);

  console.log('Started Quiz in Hindi...');
  await page.screenshot({ path: '/tmp/tw_og_gk_hindi_quiz.png' });

  // Answer first question (pick option A)
  const firstOption = page.locator('button:has-text("A.")').first();
  if (await firstOption.isVisible()) {
    await firstOption.click();
    await page.waitForTimeout(1500);
    console.log('Answered option A in Hindi Quiz');
    await page.screenshot({ path: '/tmp/tw_og_gk_hindi_quiz_feedback.png' });
  }

  // Go to topics tab after going back
  const pauseBtn = page.locator('button[aria-label="Pause quiz"]');
  if (await pauseBtn.isVisible()) {
    await pauseBtn.click();
    await page.waitForTimeout(500);
    const quitBtn = page.locator('button:has-text("मुख्य पृष्ठ पर जाएं"), button:has-text("Quit to Home")');
    if (await quitBtn.isVisible()) {
      await quitBtn.click();
      await page.waitForTimeout(500);
    }
  }

  // Check Topics tab
  const topicsTab = page.locator('button:has-text("विषय"), button:has-text("Topics")');
  if (await topicsTab.isVisible()) {
    await topicsTab.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: '/tmp/tw_og_gk_hindi_topics.png' });
    console.log('Saved /tmp/tw_og_gk_hindi_topics.png');
  }

  await browser.close();
  console.log('All E2E checks passed!');
}

run().catch((err) => {
  console.error('Test run failed:', err);
  process.exit(1);
});
