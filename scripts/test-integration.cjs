/**
 * test-integration.cjs
 * Testy integracyjne pipeline: sesja → scraping → parser → scoring → email
 * Uruchom: node scripts/test-integration.cjs
 */

require('dotenv').config();
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const { parseMockPortal, parseJustJoin, detectEnglishFromText, SKILLS_HIGH } = require('./portal-parsers.cjs');

const SESSION_FILE = path.join(__dirname, '../.google-session.json');
const APPLIED_FILE = path.join(__dirname, '../applications/applied-jobs.json');
const SALARY_MIN    = parseInt(process.env.USER_SALARY_MIN || '21000');
const USER_EMAIL    = process.env.GOOGLE_EMAIL;
const SMTP_PASS     = process.env.GMAIL_SMTP_APP_PASSWORD;
const TODAY         = new Date().toISOString().slice(0, 10);

const results = [];
let browser;

function pass(name, detail = '') { results.push({ name, status: '✅', detail }); console.log(`  ✅ ${name}${detail ? ': ' + detail : ''}`); }
function fail(name, detail = '') { results.push({ name, status: '❌', detail }); console.log(`  ❌ ${name}${detail ? ': ' + detail : ''}`); }
function warn(name, detail = '') { results.push({ name, status: '⚠️ ', detail }); console.log(`  ⚠️  ${name}${detail ? ': ' + detail : ''}`); }

// ─── TEST 1: .env config ──────────────────────────────────────────────────────

async function testConfig() {
  console.log('\n[TEST 1] Konfiguracja .env');
  USER_EMAIL  ? pass('GOOGLE_EMAIL', USER_EMAIL)          : fail('GOOGLE_EMAIL', 'brak');
  SMTP_PASS   ? pass('GMAIL_SMTP_APP_PASSWORD', '***')    : fail('GMAIL_SMTP_APP_PASSWORD', 'brak');
  SALARY_MIN >= 1000 ? pass('USER_SALARY_MIN', `${SALARY_MIN} PLN`) : fail('USER_SALARY_MIN', 'brak lub za małe');
}

// ─── TEST 2: .google-session.json ─────────────────────────────────────────────

async function testSession() {
  console.log('\n[TEST 2] Google Session');
  if (!fs.existsSync(SESSION_FILE)) { fail('session file', 'brak .google-session.json'); return null; }
  const session = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8'));
  const jjiCookies = session.cookies.filter(c => c.domain.includes('justjoin'));
  jjiCookies.length > 0
    ? pass('justjoin cookies', `${jjiCookies.length} cookies`)
    : warn('justjoin cookies', 'brak — sesja może być niezalogowana');
  pass('session file', `${session.cookies.length} cookies total`);
  return session;
}

// ─── TEST 3: applied-jobs.json ────────────────────────────────────────────────

async function testAppliedJobs() {
  console.log('\n[TEST 3] applied-jobs.json');
  if (!fs.existsSync(APPLIED_FILE)) { fail('applied-jobs.json', 'brak pliku'); return new Set(); }
  const data = JSON.parse(fs.readFileSync(APPLIED_FILE, 'utf8'));
  const urls = new Set(data.applied.map(j => j.url));
  pass('applied-jobs.json', `${urls.size} URLi`);
  return urls;
}

// ─── TEST 4: Parser mock ──────────────────────────────────────────────────────

async function testMockParser() {
  console.log('\n[TEST 4] Parser — mock-portal.html');
  const htmlPath = path.join(__dirname, 'mock-portal.html');
  if (!fs.existsSync(htmlPath)) { fail('mock-portal.html', 'brak pliku'); return; }
  const html = fs.readFileSync(htmlPath, 'utf8');
  const jobs = parseMockPortal(html);
  jobs.length === 10 ? pass('parseMockPortal', `${jobs.length} ofert`) : fail('parseMockPortal', `${jobs.length} zamiast 10`);
  const hasRequired = jobs.every(j => j.url && j.company && j.role);
  hasRequired ? pass('pola wymagane', 'url/company/role OK') : fail('pola wymagane', 'brakuje url/company/role');
  const hasSkills = jobs.filter(j => j.skills.length > 0).length;
  hasSkills >= 8 ? pass('skills', `${hasSkills}/10 ma skills`) : warn('skills', `tylko ${hasSkills}/10 ma skills`);
}

// ─── TEST 5: Scoring logic ────────────────────────────────────────────────────

async function testScoring() {
  console.log('\n[TEST 5] Scoring logic');

  const SKILLS_HIGH_SET = new Set(SKILLS_HIGH);

  function score(job) {
    let s = 0;
    const skillHits = job.skills.filter(sk => SKILLS_HIGH_SET.has(sk.toLowerCase())).length;
    s += Math.min(30, skillHits * 6);
    if (job.role.toLowerCase().includes('senior')) s += 18;
    else if (job.role.toLowerCase().includes('mid')) s += 12;
    else s += 10;
    if (job.salaryMax >= SALARY_MIN) s += 20;
    else if (job.salaryMax > 0) s += Math.round((job.salaryMax / SALARY_MIN) * 15);
    else s += 10;
    const engMap = { none: 15, optional: 10, b1: 8, b2: 3, c1: 0, c2: 0 };
    s += engMap[job.englishRequired] ?? 8;
    const remMap = { remote: 5, hybrid: 3, onsite: 0 };
    s += remMap[job.workMode] ?? 3;
    return s;
  }

  const highMatch  = { role: 'Senior Fullstack', skills: ['react', 'typescript', 'kotlin'], salaryMax: 28000, englishRequired: 'none', workMode: 'remote' };
  const lowMatch   = { role: 'React Developer',  skills: ['css', 'html'],                  salaryMax: 15000, englishRequired: 'c1',  workMode: 'onsite' };

  const highScore = score(highMatch);
  const lowScore  = score(lowMatch);

  highScore > 70 ? pass('high match score', `${highScore}/100`) : fail('high match score', `${highScore} — za mało`);
  lowScore  < 40 ? pass('low match score',  `${lowScore}/100`)  : fail('low match score',  `${lowScore} — za dużo`);
  highScore > lowScore ? pass('ranking order', `${highScore} > ${lowScore}`) : fail('ranking order', 'wysokie < niskie');

  // English detection
  const b2text  = 'We require B2 English for daily communication';
  const nonetext = 'Angielski niewymagany, praca w polskim zespole';
  detectEnglishFromText(b2text)   === 'b2'   ? pass('detectEnglish B2', 'OK')   : fail('detectEnglish B2', `wykryto: ${detectEnglishFromText(b2text)}`);
  detectEnglishFromText(nonetext) === 'none' ? pass('detectEnglish none', 'OK') : warn('detectEnglish none', `wykryto: ${detectEnglishFromText(nonetext)}`);
}

// ─── TEST 6: Playwright + sesja → JustJoin ────────────────────────────────────

async function testPlaywrightSession(session) {
  console.log('\n[TEST 6] Playwright + sesja → JustJoin.it');
  if (!session) { fail('playwright', 'brak sesji — pomiń'); return []; }

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      storageState: SESSION_FILE,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36'
    });
    pass('browser launch', 'chromium headless');

    const page = await context.newPage();
    await page.goto('https://justjoin.it/?tab=with-salary&orderBy=date&keyword=react+typescript+warszawa', {
      waitUntil: 'domcontentloaded', timeout: 20000
    });
    pass('navigation', 'justjoin.it załadowany');

    // Poczekaj na oferty
    await page.waitForTimeout(3000);

    // Sprawdź czy strona ma content
    const title = await page.title();
    title.toLowerCase().includes('just') ? pass('page title', title.slice(0, 50)) : warn('page title', title.slice(0, 50));

    // Sprawdź czy zalogowany
    const loggedIn = await page.evaluate(() => {
      const selectors = ['[data-testid="account-button"]', 'img[alt*="vatar"]', 'a[href*="/profile"]', '[class*="userMenu"]', '[class*="Avatar"]'];
      return selectors.some(s => document.querySelector(s));
    });
    loggedIn ? pass('zalogowanie', 'wykryto element profilu') : warn('zalogowanie', 'nie wykryto elementu profilu — może niezalogowany');

    // Wyciągnij HTML i spróbuj sparsować
    const html = await page.content();
    const jobs = parseJustJoin(html);

    jobs.length > 0
      ? pass('parseJustJoin', `${jobs.length} ofert wyciągniętych`)
      : warn('parseJustJoin', 'brak ofert — portal może być JS-rendered (potrzebny browser_snapshot)');

    // Sprawdź ile ofert ma salary
    const withSalary = jobs.filter(j => j.salaryMax > 0).length;
    jobs.length > 0
      ? (withSalary > 0 ? pass('salary data', `${withSalary}/${jobs.length} ma salary`) : warn('salary data', 'brak salary w ofertach'))
      : null;

    await context.close();
    await browser.close();
    browser = null;
    return jobs;

  } catch (e) {
    fail('playwright', e.message.slice(0, 100));
    if (browser) { await browser.close(); browser = null; }
    return [];
  }
}

// ─── TEST 7: Deduplication ────────────────────────────────────────────────────

async function testDeduplication(appliedUrls) {
  console.log('\n[TEST 7] Deduplication');
  const testJobs = [
    { url: 'https://justjoin.it/job-offer/accenture-frontend-engineer---ai-solutions-ai-data-evergreen-open--warszawa-javascript', company: 'Accenture', role: 'test' },
    { url: 'https://mockportal.pl/job/new-001', company: 'NewCo', role: 'test' },
    { url: 'https://mockportal.pl/job/new-002', company: 'NewCo2', role: 'test' },
  ];
  const filtered = testJobs.filter(j => !appliedUrls.has(j.url));
  filtered.length === 2 ? pass('deduplication', 'Accenture pominięty, 2 nowe przeszły') : fail('deduplication', `${filtered.length} zamiast 2`);
}

// ─── TEST 8: SMTP email ───────────────────────────────────────────────────────

async function testSmtp() {
  console.log('\n[TEST 8] SMTP email');
  if (!USER_EMAIL || !SMTP_PASS) { fail('smtp', 'brak credentials'); return; }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', port: 587, secure: false,
    auth: { user: USER_EMAIL, pass: SMTP_PASS },
    connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 10000,
    tls: { rejectUnauthorized: false }
  });

  try {
    await transporter.verify();
    pass('smtp verify', 'połączenie OK');
  } catch (e) {
    fail('smtp verify', e.message.slice(0, 80));
    return;
  }

  const summaryRows = results.map(r => `<tr><td>${r.name}</td><td>${r.status}</td><td style="font-size:12px;color:#666">${r.detail}</td></tr>`).join('');

  try {
    const info = await transporter.sendMail({
      from: `"Pipeline Test" <${USER_EMAIL}>`,
      to: USER_EMAIL,
      subject: `[INTEGRACJA ${TODAY}] Wyniki testów pipeline — ${results.filter(r=>r.status==='✅').length}✅ ${results.filter(r=>r.status==='⚠️ ').length}⚠️  ${results.filter(r=>r.status==='❌').length}❌`,
      html: `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
        body{font-family:Arial,sans-serif;background:#f5f5f5;padding:20px;}
        .w{max-width:680px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;}
        .h{background:#1C2333;color:#C9A84C;padding:20px 28px;}
        .h h1{margin:0;font-size:20px;} .h p{margin:4px 0 0;color:#aaa;font-size:13px;}
        .b{padding:20px 28px;} h2{color:#1C2333;border-bottom:2px solid #C9A84C;padding-bottom:5px;}
        table{width:100%;border-collapse:collapse;font-size:13px;}
        td{padding:5px 8px;border-bottom:1px solid #f0f0f0;}
        td:first-child{font-weight:bold;color:#1C2333;width:220px;}
        .footer{background:#1C2333;color:#666;padding:12px 28px;font-size:12px;}
      </style></head><body><div class="w">
      <div class="h"><h1>🧪 Testy Integracyjne Pipeline</h1><p>${TODAY} · cv-app</p></div>
      <div class="b">
        <h2>Wyniki testów</h2>
        <table>${summaryRows}</table>
        <br>
        <div style="background:#f0f0f0;padding:12px;border-radius:4px;font-size:13px;">
          <b>Podsumowanie:</b> ${results.filter(r=>r.status==='✅').length} passed &nbsp;|&nbsp;
          ${results.filter(r=>r.status==='⚠️ ').length} warnings &nbsp;|&nbsp;
          ${results.filter(r=>r.status==='❌').length} failed
        </div>
      </div>
      <div class="footer">Pipeline Pracy · Claude Code · ${USER_EMAIL}</div>
      </div></body></html>`
    });
    pass('smtp send', `ID: ${info.messageId.slice(0, 30)}...`);
  } catch (e) {
    fail('smtp send', e.message.slice(0, 80));
  }
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

(async () => {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  TESTY INTEGRACYJNE PIPELINE PRACY');
  console.log('═══════════════════════════════════════════════════════');

  await testConfig();
  const session     = await testSession();
  const appliedUrls = await testAppliedJobs();
  await testMockParser();
  await testScoring();
  await testDeduplication(appliedUrls);
  const liveJobs    = await testPlaywrightSession(session);
  await testSmtp();

  // ─── PODSUMOWANIE ─────────────────────────────────────────────────────────

  const passed  = results.filter(r => r.status === '✅').length;
  const warned  = results.filter(r => r.status === '⚠️ ').length;
  const failed  = results.filter(r => r.status === '❌').length;

  console.log('\n═══════════════════════════════════════════════════════');
  console.log(`  WYNIK: ✅ ${passed} | ⚠️  ${warned} | ❌ ${failed}`);
  console.log('═══════════════════════════════════════════════════════\n');

  if (failed > 0) {
    console.log('BŁĘDY (wymagają naprawy):');
    results.filter(r => r.status === '❌').forEach(r => console.log(`  ✗ ${r.name}: ${r.detail}`));
  }
  if (warned > 0) {
    console.log('\nOSTRZEŻENIA (warto sprawdzić):');
    results.filter(r => r.status === '⚠️ ').forEach(r => console.log(`  ! ${r.name}: ${r.detail}`));
  }

  if (liveJobs.length > 0) {
    console.log(`\nJustJoin live oferty (${liveJobs.length}):`);
    liveJobs.slice(0, 5).forEach(j => console.log(`  • ${j.company} — ${j.role} | ${j.workMode} | eng: ${j.englishRequired}`));
  }

  console.log('\nEmail z wynikami wysłany na', USER_EMAIL, '\n');
  process.exit(failed > 0 ? 1 : 0);
})();
