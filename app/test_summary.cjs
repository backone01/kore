const puppeteer = require('puppeteer-core');

async function reachSummary() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--autoplay-policy=no-user-gesture-required']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1000 });

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });

  // Click Simulasi Ujian
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const t = await (await b.getProperty('innerText')).jsonValue();
    if (t.includes('Simulasi Ujian')) { await b.click(); break; }
  }
  await new Promise(r => setTimeout(r, 500));

  // Click Mulai Simulasi
  const startBtns = await page.$$('button');
  for (const b of startBtns) {
    const t = await (await b.getProperty('innerText')).jsonValue();
    if (t.includes('Mulai Simulasi')) { await b.click(); break; }
  }

  // Rapidly click Selesai Menjawab / Lanjut through all 17 questions
  for (let step = 0; step < 25; step++) {
    await new Promise(r => setTimeout(r, 400));
    const isSummary = await page.evaluate(() => {
      const h2 = document.querySelector('h2');
      if (h2 && h2.innerText.includes('Laporan Hasil')) return true;
      const btns = Array.from(document.querySelectorAll('button'));
      const nextBtn = btns.find(b => b.innerText.includes('Selesai Menjawab') || b.innerText.includes('Lanjut') || b.innerText.includes('Selesai & Lihat Skor'));
      if (nextBtn) {
        nextBtn.click();
      }
      return false;
    });
    if (isSummary) {
      console.log('Summary reached at iteration', step);
      break;
    }
  }

  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'audit_final_summary_scorecard.png' });
  console.log('Saved audit_final_summary_scorecard.png!');

  await browser.close();
}

reachSummary().catch(console.error);
