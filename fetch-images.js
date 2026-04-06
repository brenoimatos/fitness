const { chromium } = require('playwright');
const fs = require('fs');

const exercises = [
  "Romanian Deadlift",
  "Overhead Press",
  "Pull-Up",
  "Push-Up",
  "Sissy Squat",
  "Band Rear Delt Fly",
  "Incline Bicep Curl",
  "Vertical Push-Up",
  "DB Pullover",
  "Lunge",
  "Larsen Bench Press",
  "DB Row",
  "DB Chest Fly",
  "Calf Raise",
  "BW Tricep Extension",
  "Squat",
  "Dip",
  "Chin-Up",
  "Nordic Curl",
  "BW Row",
  "DB Lateral Raise",
  "Ring Bicep Curl",
  "Pendlay Row",
  "Incline Bench Press",
  "Neutral Pull-Up",
  "Back Extension",
  "Lu Lateral Raise",
  "DB Skull Crusher",
  "DB Rear Delt Fly",
  "Good Morning",
  "Reverse Nordic",
  "Ring Rear Delt Fly",
  "BB Braced Curl",
  "BW Pullover",
  "Split Squat",
  "Ring Chest Fly",
  "DB Spider Curl",
  "Bodyweight Hamstring Curl",
  "Band Lateral Raise",
  "Reverse Hyper",
  "DB Tricep Kickback",
  "Ring Pelican Curl",
  "Hip Thrust",
  "Band Leg Extension",
  "Single Leg Squat",
  "Band Pullover",
  "DB Hammer Curl",
  "Band Hamstring Curl",
  "BW Hamstring Curl"
];

async function searchBingImage(page, exercise) {
  const query = encodeURIComponent(`${exercise} exercise`);
  const url = `https://www.bing.com/images/search?q=${query}&form=HDRSC2&first=1`;

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1500);

    const imageUrl = await page.evaluate(() => {
      // Try iusc items first (Bing image search results)
      const items = document.querySelectorAll('.iusc');
      for (const item of items) {
        try {
          const m = JSON.parse(item.getAttribute('m') || '{}');
          if (m.murl) return m.murl;
          if (m.turl) return m.turl;
        } catch {}
      }

      // Fallback: grab any img with a src that looks like a real image
      const imgs = document.querySelectorAll('img');
      for (const img of imgs) {
        const src = img.src || img.getAttribute('data-src') || '';
        if (src.startsWith('http') && !src.includes('bing.com') && src.match(/\.(jpg|jpeg|png|webp)/i)) {
          return src;
        }
      }

      return null;
    });

    return imageUrl;
  } catch (err) {
    console.warn(`  Warning: failed to fetch image for "${exercise}": ${err.message}`);
    return null;
  }
}

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  const results = {};

  for (let i = 0; i < exercises.length; i++) {
    const exercise = exercises[i];
    console.log(`[${i + 1}/${exercises.length}] Searching: ${exercise}`);
    const imgUrl = await searchBingImage(page, exercise);
    results[exercise] = imgUrl || '';
    console.log(`  → ${imgUrl ? imgUrl.substring(0, 80) + '...' : 'NOT FOUND'}`);

    // Small delay to avoid rate limiting
    await page.waitForTimeout(800);
  }

  await browser.close();

  fs.writeFileSync('exercises-images.json', JSON.stringify(results, null, 2));
  console.log('\nDone! Saved to exercises-images.json');
  console.log(`Found images for ${Object.values(results).filter(v => v).length}/${exercises.length} exercises`);
})();
