const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  // Mobile device: iPhone 14 Pro (393 x 852)
  await page.setViewport({ width: 393, height: 852, isMobile: true, hasTouch: true });

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.toString()));

  const networkUrl = 'http://192.168.1.100:5173/';
  console.log('Navigating to', networkUrl);
  await page.goto(networkUrl, { waitUntil: 'networkidle0' });

  // 1. Mobile Home / Practice Screen
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(__dirname, 'mobile_01_home.png') });
  console.log('Saved mobile_01_home.png');

  // 2. Open HRDK Regulation Modal
  const regBtn = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(el => el.innerText.includes('HRDK'));
    if (b) { b.click(); return true; }
    return false;
  });
  if (regBtn) {
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(__dirname, 'mobile_02_regulation.png') });
    console.log('Saved mobile_02_regulation.png');
    // Close modal
    await page.evaluate(() => {
      const close = document.querySelector('button[title*="Tutup"]') || document.querySelector('div.fixed button');
      if (close) close.click();
    });
    await new Promise(r => setTimeout(r, 400));
  }

  // 3. Switch to Simulasi Ujian
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(el => el.innerText.includes('Simulasi Ujian'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(__dirname, 'mobile_03_exam_briefing.png') });
  console.log('Saved mobile_03_exam_briefing.png');

  // 4. Click Mulai Simulasi Ujian
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(el => el.innerText.includes('Mulai Simulasi Ujian'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(__dirname, 'mobile_04_exam_running.png') });
  console.log('Saved mobile_04_exam_running.png');

  console.log('Page Errors on Mobile:', errors);
  await browser.close();
})();
