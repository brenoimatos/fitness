const { chromium } = require('playwright');
const fs = require('fs');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcon(page, size) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<!DOCTYPE html>
<html>
<head><style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: ${size}px; height: ${size}px;
    background: #cc0000;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    font-family: Arial Black, Arial, sans-serif;
  }
  .top {
    color: white;
    font-size: ${Math.round(size * 0.28)}px;
    font-weight: 900;
    line-height: 1;
    letter-spacing: -1px;
  }
  .top span { color: #ffcc00; font-style: italic; }
  .bottom {
    color: rgba(255,255,255,0.7);
    font-size: ${Math.round(size * 0.10)}px;
    font-weight: 700;
    letter-spacing: 2px;
    margin-top: ${Math.round(size * 0.04)}px;
    text-transform: uppercase;
  }
</style></head>
<body>
  <div class="top">FF<span>Qs</span></div>
  <div class="bottom">Hybrid</div>
</body>
</html>`);

  await page.waitForTimeout(100);
  const buf = await page.screenshot({ type: 'png' });
  fs.writeFileSync(`icons/icon-${size}x${size}.png`, buf);
  console.log(`Generated icons/icon-${size}x${size}.png`);
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  for (const size of sizes) {
    await generateIcon(page, size);
  }

  await browser.close();
  console.log('All icons generated!');
})();
