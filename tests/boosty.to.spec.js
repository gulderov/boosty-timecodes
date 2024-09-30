import path from 'path';
import { test, expect } from '@playwright/test';

const URL = 'https://boosty.to/gulderov/posts/2cedc29e-8a91-4130-92f7-32c20e1a781f';

test.describe('Boosty.to Seek Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
    await page.waitForLoadState('networkidle');
    await page.addScriptTag({ path: path.join(__dirname, '../Shared (Extension)/Resources/content.js') });
    await page.waitForFunction(() => window.boostyTimecodesProcessPosts !== undefined);
    await page.evaluate(() => window.boostyTimecodesProcessPosts());
    await page.waitForSelector('.boosty-timecode');
  });

  test('Timecodes are converted to clickable links', async ({ page }) => {
    const timecodeLinks = await page.$$('.boosty-timecode');
    expect(timecodeLinks.length).toBeGreaterThan(0);
  });

  test('Clicking a timecode seeks the video', async ({ page }) => {
    const timecodeLink = await page.$('.boosty-timecode');
    expect(timecodeLink).not.toBeNull();

    const timecode = await timecodeLink.getAttribute('data-timecode');
    expect(timecode).not.toBeNull();

    await timecodeLink.click();

    const videoElement = await page.waitForSelector('video', { state: 'visible' });
    const currentTime = await videoElement.evaluate(video => video.currentTime);
    const expectedSeconds = await page.evaluate(({ timecode }) => window.convertTimecodeToSeconds(timecode), { timecode });
    const diff = currentTime - expectedSeconds;
    expect(diff).toBeLessThan(1);
  });
});
