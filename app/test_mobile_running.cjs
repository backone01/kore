const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 393, height: 852, isMobile: true, hasTouch: true });

  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.toString()));

  await page.goto('http://192.168.1.100:5173/', { waitUntil: 'networkidle0' });

  // Switch to Simulasi Ujian
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(el => el.innerText.includes('Simulasi Ujian'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 500));

  // Click "Mulai Simulasi"
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(el => el.innerText.includes('Mulai Simulasi'));
    if (b) b.click();
  });

  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(__dirname, 'mobile_04_exam_live_q1.png') });
  console.log('Saved mobile_04_exam_live_q1.png');

  console.log('Errors:', errors);
  await browser.close();
})();
