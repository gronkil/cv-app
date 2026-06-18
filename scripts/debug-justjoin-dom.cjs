// Zbiera pełny HTML pierwszej karty JustJoin → zapisuje do pliku
require('dotenv').config();
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SESSION_FILE = path.join(__dirname, '../.google-session.json');
const OUT = path.join(__dirname, '../applications/debug-card.html');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    storageState: SESSION_FILE,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
    viewport: { width: 1280, height: 900 }
  });
  const page = await context.newPage();
  await page.goto('https://justjoin.it/?tab=with-salary&orderBy=date&keyword=react+typescript', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('[data-index]', { timeout: 15000 });
  await page.waitForTimeout(2000);

  const data = await page.evaluate(() => {
    const card = document.querySelector('[data-index]');
    if (!card) return { error: 'brak [data-index]' };

    // Zbierz WSZYSTKIE elementy w karcie z ich textContent i atrybutami
    const elements = [];
    card.querySelectorAll('*').forEach(el => {
      const text = el.textContent.trim().replace(/\s+/g, ' ').slice(0, 100);
      if (text && el.children.length === 0) { // tylko leaf nodes
        elements.push({
          tag: el.tagName.toLowerCase(),
          class: el.className?.toString().slice(0, 60),
          text,
          href: el.getAttribute('href'),
          title: el.getAttribute('title'),
          src: el.getAttribute('src') || el.getAttribute('data') ,
          dataTestId: el.getAttribute('data-testid')
        });
      }
    });

    // Też sprawdź a[href*=job-offer]
    const links = [...document.querySelectorAll('a[href*="/job-offer/"]')].slice(0, 3).map(a => ({
      href: a.href,
      title: a.title,
      text: a.textContent.trim().slice(0, 80)
    }));

    return { cardHtml: card.innerHTML, elements, links };
  });

  fs.writeFileSync(OUT, `<html><body><pre>${JSON.stringify(data, null, 2).replace(/</g,'&lt;')}</pre></body></html>`);

  // Wydrukuj leaf nodes — szukamy company/salary/skills
  console.log('\nLEAF NODES w karcie:');
  (data.elements || []).forEach(e => {
    if (e.text && e.text.length > 1) {
      console.log(`  <${e.tag}> class="${e.class}" title="${e.title||''}" text="${e.text}"`);
    }
  });

  console.log('\nLINKI job-offer:');
  (data.links || []).forEach(l => console.log(`  href="${l.href}" title="${l.title}"`));

  console.log(`\nPełny HTML → ${OUT}`);
  await browser.close();
})();
