const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  page.on('requestfailed', req => console.log('REQ FAILED:', req.url(), req.failure().errorText));

  console.log('Testing http://192.168.1.100:5173/ ...');
  await page.goto('http://192.168.1.100:5173/', { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 2000));

  console.log('Testing http://localhost:5173/ ...');
  await page.goto('http://localhost:5173/', { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 2000));

  await browser.close();
})();
