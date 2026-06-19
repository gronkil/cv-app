/**
 * test-portals.cjs
 * Szybki test — ile ofert każdy portal zwraca. Bez scoringu, bez emaila.
 * Uruchom: node scripts/test-portals.cjs
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SESSION_FILE = path.join(__dirname, '../.google-session.json');

const portals = [
  { url: 'https://justjoin.it/?tab=with-salary&orderBy=date&keyword=react+typescript+senior', label: 'JustJoin',    sel: 'a[href*="/job-offer/"]',                                  waitIdle: false },
  { url: 'https://nofluffjobs.com/pl/jobs/senior?criteria=requirement%3Areact%20city%3Awarszawa,remote', label: 'NoFluffJobs', sel: 'a[href*="/pl/job/"]',                         waitIdle: false },
  { url: 'https://it.pracuj.pl/praca/senior%20fullstack%20developer;kw?rd=30&sc=0',          label: 'Pracuj.pl',   sel: 'a[href*="pracuj.pl/praca/"]',                             waitIdle: false },
  { url: 'https://bulldogjob.pl/companies/jobs?role=fullstack&exp=senior&remote=1',          label: 'Bulldogjob',  sel: 'a[href*="/companies/jobs/"]',                             waitIdle: false },
  { url: 'https://solid.jobs/offers/it?q=react+senior&location=remote',                      label: 'Solid.jobs',  sel: 'a[href*="/offer/"]',                                      waitIdle: false },
  { url: 'https://rocketjobs.pl/oferty-pracy?query=senior+react&location=remote',            label: 'RocketJobs',  sel: 'a[href*="/oferty-pracy/"][href*="-"]',                    waitIdle: false },
  { url: 'https://www.linkedin.com/jobs/search/?keywords=senior%20fullstack%20react&location=Warszawa', label: 'LinkedIn',    sel: 'a[href*="/jobs/view/"]',                       waitIdle: false },
  { url: 'https://pl.indeed.com/jobs?q=senior+react+developer&l=Polska',                     label: 'Indeed.pl',   sel: 'h2.jobTitle a, a[class*="jcs-JobTitle"]',                waitIdle: false },
  { url: 'https://inhire.io/job-offers?query=react+senior&workMode=REMOTE',                  label: 'Inhire.io',   sel: 'a[href*="/praca/"]',                                      waitIdle: false },
  { url: 'https://crossweb.pl/job/oferty-pracy/?q=react+senior',                             label: 'Crossweb',        sel: 'a[href*="/job/oferty-pracy/"][href*="-"]',                    waitIdle: true  },
  { url: 'https://remotive.com/remote-jobs/software-development?search=react+senior',        label: 'Remotive',        sel: 'a[href*="/remote-jobs/software-development/"][href*="-"]',    waitIdle: false },
  { url: 'https://4programmers.net/Job?q=react+typescript&remote=1',                         label: '4programmers',    sel: 'a[href*="/Job/"][href*="-"]',                                  waitIdle: false },
  { url: 'https://theprotocol.it/praca/react-typescript;t?sort=publishedAt',                 label: 'TheProtocol',     sel: 'a[href*="/szczegoly/"]',                                       waitIdle: false },
  { url: 'https://www.glassdoor.com/Job/poland-senior-react-developer-jobs-SRCH_IL.0,6_IN193_KO7,29.htm', label: 'Glassdoor', sel: 'a[href*="/job-listing/"]',                          waitIdle: false },
  { url: 'https://weworkremotely.com/categories/remote-programming-jobs',                    label: 'WeWorkRemotely',  sel: 'a[href*="/remote-jobs/"]:not([href*="?"])',                    waitIdle: false },
];

(async () => {
  const ctx = fs.existsSync(SESSION_FILE)
    ? { storageState: SESSION_FILE }
    : {};

  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  });
  const context = await browser.newContext({
    ...ctx,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1366, height: 768 },
    ignoreHTTPSErrors: true,
    extraHTTPHeaders: { 'Accept-Language': 'pl-PL,pl;q=0.9,en;q=0.8' }
  });
  const page = await context.newPage();
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  });

  const results = [];
  const W = 14;

  console.log('\n' + '─'.repeat(60));
  console.log('Portal'.padEnd(W) + 'Linki  Status');
  console.log('─'.repeat(60));

  for (const p of portals) {
    try {
      const waitUntil = p.waitIdle ? 'networkidle' : 'domcontentloaded';
      await page.goto(p.url, { waitUntil, timeout: 25000 });
      await page.waitForTimeout(p.waitIdle ? 3000 : 2000);

      const { count, blocked } = await page.evaluate((sel) => {
        const links = [...document.querySelectorAll(sel)];
        const bodyText = document.body.innerText.slice(0, 500).toLowerCase();
        const blocked = /captcha|robot|access denied|403|cloudflare|checking your browser/.test(bodyText);
        return { count: links.length, blocked };
      }, p.sel);

      const status = blocked ? '🚫 BLOKADA' : count === 0 ? '⚠️  brak pasującego selektora' : '✅';
      console.log(p.label.padEnd(W) + String(count).padStart(4) + '   ' + status);
      results.push({ label: p.label, count, blocked, status: blocked ? 'blocked' : count > 0 ? 'ok' : 'no-match' });
    } catch (e) {
      const msg = e.message.includes('timeout') ? '⏱ timeout' : `❌ ${e.message.slice(0, 40)}`;
      console.log(p.label.padEnd(W) + '   0   ' + msg);
      results.push({ label: p.label, count: 0, status: 'error' });
    }
  }

  await browser.close();

  const ok      = results.filter(r => r.status === 'ok').length;
  const noMatch = results.filter(r => r.status === 'no-match').length;
  const blocked = results.filter(r => r.status === 'blocked').length;
  const errors  = results.filter(r => r.status === 'error').length;

  console.log('─'.repeat(60));
  console.log(`Działające: ${ok}/${portals.length}  |  brak selektora: ${noMatch}  |  blokady: ${blocked}  |  błędy: ${errors}`);
  console.log('─'.repeat(60) + '\n');

  if (noMatch > 0) {
    console.log('Portale bez pasujących linków — selektor do poprawki:');
    results.filter(r => r.status === 'no-match').forEach(r => console.log(`  • ${r.label}`));
  }
})();
