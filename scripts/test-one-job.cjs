/**
 * test-one-job.cjs
 * Scrape 1 prawdziwej oferty z JustJoin → pełny pipeline → audyt
 */

require('dotenv').config();
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const { parseJustJoinFromPage, detectEnglishFromText } = require('./portal-parsers.cjs');

const SESSION_FILE = path.join(__dirname, '../.google-session.json');
const SALARY_MIN   = parseInt(process.env.USER_SALARY_MIN || '21000');
const USER_EMAIL   = process.env.GOOGLE_EMAIL;
const SMTP_PASS    = process.env.GMAIL_SMTP_APP_PASSWORD;
const TODAY        = new Date().toISOString().slice(0, 10);

const SKILLS_HIGH = ['react', 'typescript', 'javascript', 'kotlin', 'rest api', 'prompt engineering', 'genai', 'llm', 'gpt', 'claude'];
const SKILLS_MED  = ['spring', 'spring boot', 'sql', 'node', 'docker', 'rabbitmq', 'java'];

const audit = [];
function log(step, status, detail, fix = null) {
  audit.push({ step, status, detail, fix });
  const icon = status === 'OK' ? '✅' : status === 'WARN' ? '⚠️ ' : '❌';
  console.log(`  ${icon} [${step}] ${detail}`);
  if (fix) console.log(`     → FIX: ${fix}`);
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

function scoreJob(job) {
  let score = 0;
  const b = {};

  // Skills (30)
  const jSkills = (job.skills || []).map(s => s.toLowerCase());
  let hits = 0;
  jSkills.forEach(s => {
    if (SKILLS_HIGH.some(h => s.includes(h) || h.includes(s))) hits += 1.0;
    else if (SKILLS_MED.some(h => s.includes(h) || h.includes(s))) hits += 0.6;
  });
  b.skills = Math.min(30, Math.round((hits / Math.max(jSkills.length, 1)) * 30 + hits * 2));
  score += b.skills;

  // Seniority (20)
  const r = (job.role || '').toLowerCase();
  b.seniority = r.includes('lead') || r.includes('principal') ? 20
    : r.includes('senior') ? 18
    : r.includes('mid/senior') ? 15
    : r.includes('mid') ? 10
    : r.includes('junior') ? 2 : 12;
  score += b.seniority;

  // Salary (20)
  b.salary = !job.salaryMax ? 10
    : job.salaryMax >= SALARY_MIN ? 20
    : job.salaryMax >= SALARY_MIN * 0.9 ? 15
    : job.salaryMax >= SALARY_MIN * 0.8 ? 10 : 4;
  score += b.salary;

  // English (15)
  b.english = { none: 15, optional: 10, b1: 8, b2: 3, c1: 0, c2: 0 }[job.english] ?? 8;
  score += b.english;

  // AI (10)
  const txt = ((job.description || '') + ' ' + (job.skills || []).join(' ')).toLowerCase();
  b.ai = /genai|llm|ai engineer|chatgpt|prompt engineering/.test(txt) ? 10
       : /\bai\b|machine learning/.test(txt) ? 5 : 0;
  score += b.ai;

  // Remote (5)
  b.remote = { remote: 5, hybrid: 3, onsite: 0 }[job.workMode] ?? 3;
  score += b.remote;

  return { ...job, score, breakdown: b };
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

(async () => {
  console.log('\n══════════════════════════════════════════════════');
  console.log('  TEST: 1 OFERTA Z JUSTJOIN → PIPELINE → AUDYT');
  console.log('══════════════════════════════════════════════════\n');

  // KROK 1: Session
  console.log('[KROK 1] Wczytuję sesję...');
  if (!fs.existsSync(SESSION_FILE)) {
    log('session', 'FAIL', 'brak .google-session.json', 'Uruchom setup-google-session.cjs');
    process.exit(1);
  }
  log('session', 'OK', 'plik istnieje');

  // KROK 2: Playwright
  console.log('\n[KROK 2] Playwright → JustJoin...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    storageState: SESSION_FILE,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
    viewport: { width: 1280, height: 900 }
  });
  const page = await context.newPage();

  // Otwórz listing z filtrami
  const url = 'https://justjoin.it/?tab=with-salary&orderBy=date&keyword=react+typescript';
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  log('navigation', 'OK', `załadowano: ${url}`);

  // Czekaj na JS render ofert
  console.log('  Czekam na render ofert (JS)...');
  let jobsRendered = false;
  try {
    await page.waitForSelector('[data-index]', { timeout: 15000 });
    jobsRendered = true;
    log('js-render', 'OK', 'oferty załadowane przez JS');
  } catch {
    // próbuj alternatywnych selektorów
    try {
      await page.waitForSelector('article', { timeout: 5000 });
      jobsRendered = true;
      log('js-render', 'OK', 'oferty załadowane (article)');
    } catch {
      log('js-render', 'WARN', 'timeout — strona może wymagać więcej czasu lub zmieniła strukturę',
        'Zwiększ timeout lub sprawdź selektor w DevTools');
    }
  }

  // Screenshot dla audytu
  const screenshotPath = path.join(__dirname, '../applications/debug-justjoin.png');
  await page.screenshot({ path: screenshotPath, fullPage: false });
  log('screenshot', 'OK', `zapisano: ${screenshotPath}`);

  // KROK 3+4: Wyciągnij + znormalizuj wszystkie oferty z DOM
  console.log('\n[KROK 3] Wyciągam oferty przez parseJustJoinFromPage...');
  let jobs = [];
  try {
    jobs = await parseJustJoinFromPage(page);
    log('dom-extract', jobs.length > 0 ? 'OK' : 'WARN',
      `${jobs.length} ofert wyciągniętych z listingu`);
  } catch (e) {
    log('dom-extract', 'FAIL', e.message.slice(0, 80));
  }

  const rawJob = jobs[0] || null;
  if (rawJob) {
    console.log('\n  Pierwsza oferta:');
    console.log(`    role:     ${rawJob.role}`);
    console.log(`    company:  ${rawJob.company}`);
    console.log(`    salary:   ${rawJob.salaryMin}-${rawJob.salaryMax} ${rawJob.salaryType}`);
    console.log(`    workMode: ${rawJob.workMode}`);
    console.log(`    skills:   ${rawJob.skills.join(', ')}`);
    console.log(`    url:      ${rawJob.url}`);
  }

  console.log('\n[KROK 4] Pobieranie szczegółów oferty (english, opis)...');
  let job = rawJob;
  if (rawJob?.url) {
    try {
      await page.goto(rawJob.url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(2000);
      const details = await page.evaluate(() => {
        const body = document.body.innerText;
        return { text: body.slice(0, 2000) };
      });
      const english = detectEnglishFromText(details.text);
      job = { ...rawJob, english, description: details.text.slice(0, 300) };
      log('detail-page', 'OK', `english: ${english} | opis: ${details.text.slice(0, 60)}...`);
    } catch (e) {
      log('detail-page', 'WARN', `nie udało się pobrać szczegółów: ${e.message.slice(0, 60)}`);
    }
  }

  // Logi jakości danych
  if (!job) {
    log('normalization', 'FAIL', 'brak oferty do oceny');
  } else {
    log('normalization', 'OK', `salary: ${job.salaryMin}-${job.salaryMax} | mode: ${job.workMode}`);
    if (job.salaryMax === 0) log('salary-parse', 'WARN', 'salary = 0 — brak salary w karcie lub poza filtrem',
      'Upewnij się że URL ma &tab=with-salary');
    if (job.english === 'unknown') log('english-detect', 'WARN', 'angielski nieznany',
      'Strona szczegółów nie zwróciła tekstu lub nie zawiera wzorców B1/B2');
  }

  // KROK 5: Scoring
  console.log('\n[KROK 5] Scoring...');
  if (job) {
    const scored = scoreJob(job);
    log('scoring', 'OK', `wynik: ${scored.score}/100 | skills:${scored.breakdown.skills} sen:${scored.breakdown.seniority} sal:${scored.breakdown.salary} eng:${scored.breakdown.english} ai:${scored.breakdown.ai} rem:${scored.breakdown.remote}`);

    console.log('\n  ┌─────────────────────────────────┐');
    console.log(`  │  ${(job.company || '').padEnd(31)} │`);
    console.log(`  │  ${(job.role || '').slice(0, 31).padEnd(31)} │`);
    console.log(`  │  Wynik: ${String(scored.score).padEnd(24)} │`);
    console.log('  └─────────────────────────────────┘');

    if (scored.score < 50) log('score-quality', 'WARN', `niski wynik ${scored.score} — prawdopodobnie brakuje danych (skills/salary)`,
      'Uzupełnij scraping o dane ze strony szczegółów oferty');
  }

  await browser.close();

  // ─── AUDYT KOŃCOWY ────────────────────────────────────────────────────────

  console.log('\n══════════════════════════════════════════════════');
  console.log('  AUDYT — CO DZIAŁA / CO TRZEBA POPRAWIĆ');
  console.log('══════════════════════════════════════════════════\n');

  const ok   = audit.filter(a => a.status === 'OK').length;
  const warn = audit.filter(a => a.status === 'WARN').length;
  const fail = audit.filter(a => a.status === 'FAIL').length;

  // Dodaj audyt JustJoin struktury
  const domOk = rawJob && rawJob.method !== 'debug';
  console.log('WYNIKI KROK PO KROKU:');
  audit.forEach(a => {
    const icon = a.status === 'OK' ? '✅' : a.status === 'WARN' ? '⚠️ ' : '❌';
    console.log(`  ${icon} ${a.step}: ${a.detail}`);
    if (a.fix) console.log(`     → ${a.fix}`);
  });

  console.log('\nCO TRZEBA POPRAWIĆ (priorytety):');

  const fixes = [];

  if (!domOk) {
    fixes.push({
      p: 1,
      title: 'JustJoin DOM selektor',
      desc: 'portal-parsers.cjs używa [data-index] — JustJoin może zmienić strukturę.',
      fix: 'Otwórz justjoin.it w DevTools → Inspect element oferty → znajdź aktualny selektor → zaktualizuj w portal-parsers.cjs'
    });
  }

  if (!rawJob?.salaryText || (job && job.salaryMax === 0)) {
    fixes.push({
      p: 2,
      title: 'Salary parsing',
      desc: `Regex nie pasuje do formatu salary na JustJoin (current: "${rawJob?.salaryText}").`,
      fix: 'Zaktualizuj regex w test-one-job.cjs: salaryMatch = text.match(/(\\d[\\d\\s]+)[–-](\\d[\\d\\s]+)/) z usunięciem spacji'
    });
  }

  fixes.push({
    p: 3,
    title: 'English requirement',
    desc: 'Angielski nie jest w karcie oferty — jest tylko na stronie szczegółów.',
    fix: 'Po zebraniu listy ofert: dla top 5 zrób page.goto(url) i wyciągnij tekst requirements → detectEnglishFromText()'
  });

  fixes.push({
    p: 4,
    title: 'Skills z karty oferty',
    desc: 'Tagi skills na JustJoin mogą mieć zmienne class names (generowane przez CSS-in-JS).',
    fix: 'Użyj page.evaluate() z document.querySelectorAll("[data-test-id=skill]") lub szukaj po tekście w karcie'
  });

  if (!job || (job && job.salaryMax === 0)) {
    fixes.push({
      p: 5,
      title: 'Scraping szczegółów oferty',
      desc: 'Karta na listingu ma ograniczone dane. Pełne dane (opis, angielski, widełki) są na stronie oferty.',
      fix: 'Pipeline: listing → zbierz URLe → dla top N zrób page.goto(oferta_url) → pełny scraping'
    });
  }

  fixes.sort((a, b) => a.p - b.p).forEach((f, i) => {
    console.log(`\n  ${i+1}. [PRIORYTET ${f.p}] ${f.title}`);
    console.log(`     Problem: ${f.desc}`);
    console.log(`     Fix: ${f.fix}`);
  });

  console.log(`\n══════════════════════════════════════════════════`);
  console.log(`  ✅ ${ok} OK | ⚠️  ${warn} WARN | ❌ ${fail} FAIL`);
  console.log(`══════════════════════════════════════════════════\n`);

  process.exit(fail > 0 ? 1 : 0);
})();
