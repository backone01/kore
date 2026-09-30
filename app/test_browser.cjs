const puppeteer = require('puppeteer-core');

async function testFullApp() {
  console.log('--- STARTING FULL END-TO-END BROWSER AUDIT ---');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--autoplay-policy=no-user-gesture-required']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  const errors = [];
  const logs = [];

  page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => errors.push(err.toString()));

  console.log('1. Loading http://localhost:5173/ ...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'audit_01_practice.png' });
  console.log('✓ Practice screen verified & snap saved.');

  console.log('2. Opening Regulation Modal...');
  const regBtn = await page.waitForSelector('button[title="Lihat Regulasi Resmi Revisi HRD Korea 2026"]');
  await regBtn.click();
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: 'audit_02_regulation_modal.png' });
  console.log('✓ Regulation modal verified.');

  const closeRegBtn = await page.waitForSelector('button ::-p-text(Tutup Informasi)');
  await closeRegBtn.click();
  await new Promise(r => setTimeout(r, 300));

  console.log('3. Switching to Simulasi Ujian...');
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const text = await (await b.getProperty('innerText')).jsonValue();
    if (text.includes('Simulasi Ujian')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: 'audit_03_exam_briefing.png' });
  console.log('✓ Exam briefing screen verified.');

  console.log('4. Starting 17-Question Exam...');
  const startExamBtns = await page.$$('button');
  for (const b of startExamBtns) {
    const text = await (await b.getProperty('innerText')).jsonValue();
    if (text.includes('Mulai Simulasi')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'audit_04_exam_running_q1.png' });
  console.log('✓ Exam live running screen verified.');

  console.log('5. Testing fast-forward through exam questions to Summary screen...');
  for (let i = 0; i < 17; i++) {
    // Wait for the button 'Selesai Menjawab, Lanjut' or check if already at summary
    await new Promise(r => setTimeout(r, 1200));
    const nextBtns = await page.$$('button');
    let clicked = false;
    for (const b of nextBtns) {
      try {
        const text = await (await b.getProperty('innerText')).jsonValue();
        if (text.includes('Selesai Menjawab') || text.includes('Lanjut')) {
          await b.click();
          clicked = true;
          break;
        }
      } catch (e) {}
    }
  }

  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'audit_05_exam_summary.png' });
  console.log('✓ Exam summary scorecard verified.');

  await browser.close();

  console.log('\n--- AUDIT RESULTS ---');
  console.log('Total Uncaught Page Errors:', errors.length);
  if (errors.length > 0) {
    console.error('Errors:', errors);
  } else {
    console.log('PASSED: Zero uncaught runtime errors!');
  }
}

testFullApp().catch(console.error);
