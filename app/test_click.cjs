const puppeteer = require('puppeteer-core');

async function check() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.error('BROWSER PAGE ERROR:', err));

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  console.log('Clicking Simulasi Ujian...');

  const buttons = await page.$$('button');
  for (const b of buttons) {
    const text = await (await b.getProperty('innerText')).jsonValue();
    if (text.includes('Simulasi Ujian')) {
      console.log('Found button, clicking...');
      await b.click();
      break;
    }
  }

  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'debug_exam_click.png' });
  await browser.close();
}

check().catch(console.error);
