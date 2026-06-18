/**
 * znajdz-top3.cjs
 * Scrape JustJoin → score → wyślij email z top 3 ofertami gdzie Mateusz ma duże szanse
 * Bez aplikowania. Uruchom: node scripts/znajdz-top3.cjs
 */

require('dotenv').config();
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const { parseJustJoinFromPage, detectEnglishFromText } = require('./portal-parsers.cjs');

const SESSION_FILE = path.join(__dirname, '../.google-session.json');
const APPLIED_FILE = path.join(__dirname, '../applications/applied-jobs.json');
const SALARY_MIN   = parseInt(process.env.USER_SALARY_MIN  || '21000');
const NOTICE_DAYS  = parseInt(process.env.NOTICE_PERIOD_DAYS || '3');
const USER_EMAIL   = process.env.GOOGLE_EMAIL;
const SMTP_PASS    = process.env.GMAIL_SMTP_APP_PASSWORD;
const TODAY        = new Date().toISOString().slice(0, 10);

const SKILLS_HIGH = ['react', 'typescript', 'javascript', 'kotlin', 'rest api', 'prompt engineering', 'genai', 'llm', 'gpt'];
const SKILLS_MED  = ['spring', 'spring boot', 'sql', 'node', 'docker', 'rabbitmq', 'java'];

// ─── Scoring ──────────────────────────────────────────────────────────────────

function scoreJob(job) {
  let score = 0;
  const b = {};

  const jSkills = (job.skills || []).map(s => s.toLowerCase());
  let hits = 0;
  jSkills.forEach(s => {
    if (SKILLS_HIGH.some(h => s.includes(h) || h.includes(s))) hits += 1.0;
    else if (SKILLS_MED.some(h => s.includes(h) || h.includes(s))) hits += 0.6;
  });
  b.skills = Math.min(30, Math.round((hits / Math.max(jSkills.length, 1)) * 30 + hits * 2));
  score += b.skills;

  const r = (job.role || '').toLowerCase();
  b.seniority = r.includes('lead') ? 20 : r.includes('senior') ? 18 : r.includes('mid/senior') ? 15 : r.includes('mid') ? 10 : r.includes('junior') ? 2 : 12;
  score += b.seniority;

  b.salary = !job.salaryMax ? 10 : job.salaryMax >= SALARY_MIN ? 20 : job.salaryMax >= SALARY_MIN * 0.9 ? 15 : job.salaryMax >= SALARY_MIN * 0.8 ? 10 : 4;
  score += b.salary;

  b.english = { none: 15, optional: 10, b1: 8, b2: 3, c1: 0, c2: 0 }[job.english] ?? 8;
  score += b.english;

  const txt = ((job.description || '') + ' ' + (job.skills || []).join(' ')).toLowerCase();
  b.ai = /genai|llm|ai engineer|chatgpt|prompt/.test(txt) ? 10 : /\bai\b|machine learning/.test(txt) ? 5 : 0;
  score += b.ai;

  b.remote = { remote: 5, hybrid: 3, onsite: 0 }[job.workMode] ?? 3;
  score += b.remote;

  return { ...job, score, breakdown: b };
}

function whyGoodMatch(job) {
  const reasons = [];
  if (job.breakdown.skills >= 24) reasons.push(`Stack dopasowany (${job.skills.slice(0,3).join(', ')})`);
  if (job.breakdown.seniority >= 15) reasons.push('Poziom Senior — 7 lat doświadczenia pasuje');
  if (job.breakdown.salary >= 15) reasons.push(`Wynagrodzenie ${job.salaryMax >= SALARY_MIN ? '≥' : '~'} ${SALARY_MIN.toLocaleString('pl')} PLN`);
  if (job.breakdown.english >= 10) reasons.push('Angielski niewymagany lub opcjonalny');
  if (job.breakdown.ai >= 5)  reasons.push('AI/GenAI doświadczenie — nagroda Rzeczpospolitej Cyfrowej');
  if (job.breakdown.remote >= 5) reasons.push('Remote 100%');
  if (reasons.length === 0) reasons.push('Ogólne dopasowanie profilu');
  return reasons;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

(async () => {
  console.log(`\n[${TODAY}] Szukam top 3 ofert dla Mateusza...\n`);

  // Wczytaj już aplikowane
  let appliedUrls = new Set();
  try {
    const d = JSON.parse(fs.readFileSync(APPLIED_FILE, 'utf8'));
    appliedUrls = new Set(d.applied.map(j => j.url));
    console.log(`Pominę ${appliedUrls.size} już aplikowanych ofert`);
  } catch {}

  // Playwright — scrape JustJoin
  if (!fs.existsSync(SESSION_FILE)) {
    console.error('Brak .google-session.json — uruchom setup-google-session.cjs');
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    storageState: SESSION_FILE,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
    viewport: { width: 1280, height: 900 }
  });
  const page = await context.newPage();

  // ─── Sprawdź sesję JustJoin ─────────────────────────────────────────────────
  console.log('Sprawdzam sesję JustJoin...');
  try {
    await page.goto('https://justjoin.it', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);
    const loggedIn = await page.evaluate(() => {
      const sel = ['[data-testid="account-button"]','a[href*="/profile"]','[class*="Avatar"]','a.offer_list_offer_title_link'];
      // Sprawdź też czy nie ma przycisku "Zaloguj się"
      const loginBtn = document.body.innerText.includes('Zaloguj się') || document.body.innerText.includes('Sign in');
      return { found: sel.some(s => document.querySelector(s)), loginBtn };
    });
    if (loggedIn.loginBtn && !loggedIn.found) {
      console.log('⚠️  SESJA WYGASŁA — odśwież przez: node scripts/setup-google-session.cjs');
      console.log('   Kontynuuję — większość portali nie wymaga logowania do przeglądania.\n');
    } else {
      console.log('✅ Sesja JustJoin aktywna\n');
    }
  } catch (e) {
    console.log(`⚠️  Nie udało się sprawdzić sesji: ${e.message.slice(0,50)}\n`);
  }

  // Portale do przeszukania — wszystkie 9
  const portals = [
    // 1. JustJoin — zalogowany (sesja)
    { url: 'https://justjoin.it/?tab=with-salary&orderBy=date&keyword=react+typescript+senior', label: 'JustJoin (react/ts)', type: 'justjoin' },
    { url: 'https://justjoin.it/?tab=with-salary&orderBy=date&keyword=kotlin+spring+senior',   label: 'JustJoin (kotlin)',   type: 'justjoin' },
    { url: 'https://justjoin.it/?tab=with-salary&orderBy=date&keyword=fullstack+ai+senior',    label: 'JustJoin (AI)',       type: 'justjoin' },
    // 2. TheProtocol.it
    { url: 'https://theprotocol.it/praca/react-typescript;t?sort=publishedAt',   label: 'TheProtocol (react)', type: 'theprotocol' },
    { url: 'https://theprotocol.it/praca/kotlin-spring-boot;t?sort=publishedAt', label: 'TheProtocol (kotlin)', type: 'theprotocol' },
    // 3. NoFluffJobs
    { url: 'https://nofluffjobs.com/pl/jobs/senior?criteria=requirement%3Areact%20city%3Awarszawa,remote',  label: 'NoFluffJobs (react)',  type: 'nofluff' },
    { url: 'https://nofluffjobs.com/pl/jobs/senior?criteria=requirement%3Akotlin%20city%3Awarszawa,remote', label: 'NoFluffJobs (kotlin)', type: 'nofluff' },
    // 4. Pracuj.pl
    { url: 'https://it.pracuj.pl/praca/senior%20fullstack%20developer;kw?rd=30&sc=0', label: 'Pracuj.pl (fullstack)', type: 'pracuj' },
    { url: 'https://it.pracuj.pl/praca/senior%20react%20developer;kw?rd=30&sc=0',     label: 'Pracuj.pl (react)',    type: 'pracuj' },
    // 5. Bulldogjob
    { url: 'https://bulldogjob.pl/companies/jobs?role=fullstack&exp=senior&remote=1', label: 'Bulldogjob (fullstack)', type: 'bulldogjob' },
    // 6. Solid.jobs
    { url: 'https://solid.jobs/offers/it?q=react+senior&location=remote', label: 'Solid.jobs (react)', type: 'solid' },
    // 7. RocketJobs
    { url: 'https://rocketjobs.pl/oferty-pracy?query=senior+react&location=remote', label: 'RocketJobs (react)', type: 'rocketjobs' },
    // 8. 4programmers.net
    { url: 'https://4programmers.net/Praca?q=senior+react&remote=1', label: '4programmers (react)', type: '4programmers' },
    // 9. LinkedIn — próbujemy ale może blokować
    { url: 'https://www.linkedin.com/jobs/search/?keywords=senior%20fullstack%20developer%20react&location=Warszawa', label: 'LinkedIn (fullstack)', type: 'linkedin' },
  ];

  // Selektory per portal — pary [selektor_linku, prefiks_url]
  const PORTAL_SELECTORS = {
    theprotocol: { sel: 'a[href*="/szczegoly/praca/"], a[href*=",oferta,"]', base: '' },
    nofluff:     { sel: 'a[href*="/pl/job/"]',              base: 'https://nofluffjobs.com' },
    pracuj:      { sel: 'a[href*="pracuj.pl/praca/"]',      base: '' },
    bulldogjob:  { sel: 'a[href*="/companies/jobs/"]',      base: 'https://bulldogjob.pl' },
    solid:       { sel: 'a[href*="/offers/"]',              base: 'https://solid.jobs' },
    rocketjobs:  { sel: 'a[href*="/oferty-pracy/"][href*="-"]', base: 'https://rocketjobs.pl' },
    '4programmers': { sel: 'a[href*="/Praca/"][href*="-"]', base: 'https://4programmers.net' },
    linkedin:    { sel: 'a[href*="/jobs/view/"]',           base: '' },
  };

  let allJobs = [];
  for (const portal of portals) {
    try {
      process.stdout.write(`  ${portal.label}... `);
      await page.goto(portal.url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(2000);

      let jobs = [];
      if (portal.type === 'justjoin') {
        jobs = await parseJustJoinFromPage(page).catch(() => []);
      } else {
        const cfg = PORTAL_SELECTORS[portal.type] || { sel: 'a[href*="/job"]', base: '' };
        jobs = await page.evaluate(({ sel, base, source }) => {
          const seen = new Set();
          return [...document.querySelectorAll(sel)]
            .map(a => {
              const href = a.getAttribute('href') || '';
              const url = href.startsWith('http') ? href : base + href;
              const role = (a.title || a.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80);
              return { url, role, source };
            })
            .filter(j => j.url && j.url.startsWith('http') && !seen.has(j.url) && seen.add(j.url))
            .slice(0, 10)
            .map(j => ({ ...j, company: '', salaryMin: 0, salaryMax: 0, salaryType: 'unknown', workMode: 'unknown', english: 'unknown', skills: [], description: '' }));
        }, { sel: cfg.sel, base: cfg.base, source: portal.type });
      }

      console.log(`${jobs.length} ofert`);
      allJobs.push(...jobs);
    } catch (e) {
      console.log(`błąd: ${e.message.slice(0, 50)}`);
    }
  }

  // Deduplikacja po URL
  const seen = new Set();
  allJobs = allJobs.filter(j => {
    if (!j.url || seen.has(j.url) || appliedUrls.has(j.url)) return false;
    seen.add(j.url);
    return true;
  });
  console.log(`\nPo deduplicacji: ${allJobs.length} unikalnych ofert`);

  // Top 2 z każdego portalu + top globalny — żeby każdy portal miał reprezentację
  const PER_PORTAL = 2;
  const GLOBAL_TOP = 6;
  const scored0 = allJobs.map(j => scoreJob({ ...j, english: 'unknown' }));

  const byPortal = {};
  scored0.forEach(j => { byPortal[j.source] = byPortal[j.source] || []; byPortal[j.source].push(j); });
  const perPortalPicks = Object.values(byPortal).flatMap(jobs => jobs.sort((a,b) => b.score - a.score).slice(0, PER_PORTAL));
  const globalTop = scored0.sort((a,b) => b.score - a.score).slice(0, GLOBAL_TOP);
  const combined = [...perPortalPicks, ...globalTop];
  const seenPre = new Set();
  const preSorted = combined.filter(j => !seenPre.has(j.url) && seenPre.add(j.url)).slice(0, 20);

  console.log(`Pobiorę szczegóły ${preSorted.length} ofert (top 2 z portalu + global top ${GLOBAL_TOP})...`);

  console.log(`Pobieram szczegóły...`);
  const detailed = [];
  for (const job of preSorted) {
    try {
      await page.goto(job.url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(1500);
      const text = await page.evaluate(() => document.body.innerText.slice(0, 3000));
      const english = detectEnglishFromText(text);
      detailed.push({ ...job, english, description: text.slice(0, 400) });
      process.stdout.write('.');
    } catch {
      detailed.push({ ...job, english: 'unknown' });
      process.stdout.write('x');
    }
  }
  console.log();

  await browser.close();

  // Finalny scoring i top 3
  const finalScored = detailed.map(j => scoreJob(j)).sort((a, b) => b.score - a.score);
  const top3 = finalScored.slice(0, 3);

  console.log('\nTOP 3:');
  top3.forEach((j, i) => console.log(`  ${i+1}. [${j.score}] ${j.company} — ${j.role} | ${j.workMode} | eng:${j.english} | sal:${j.salaryMin}-${j.salaryMax}`));

  // ─── Zapisz pełną listę do txt ────────────────────────────────────────────
  const txtPath = path.join(__dirname, `../applications/oferty-${TODAY}.txt`);
  const engLabel = { none: 'ang:brak', optional: 'ang:opcj', b1: 'ang:B1', b2: 'ang:B2', c1: 'ang:C1', c2: 'ang:C2', unknown: 'ang:?' };
  const modeLabel = { remote: 'remote', hybrid: 'hybrid', onsite: 'stacj', unknown: '?' };

  let txt = `OFERTY PRACY — ${TODAY}\n`;
  txt += `Portale: JustJoin, TheProtocol, NoFluffJobs, Pracuj, Bulldogjob, Solid, RocketJobs, 4programmers, LinkedIn\n`;
  txt += `Znaleziono: ${allJobs.length} | Po ocenie: ${finalScored.length}\n`;
  txt += `${'─'.repeat(80)}\n\n`;

  txt += `★★★ TOP 3 — NAJLEPSZE DOPASOWANIE ★★★\n\n`;
  top3.forEach((j, i) => {
    const sal = j.salaryMax ? `${j.salaryMin.toLocaleString('pl')}-${j.salaryMax.toLocaleString('pl')} PLN` : 'salary: nie podano';
    txt += `${i+1}. [${j.score}/100] ${j.company || '?'} — ${j.role}\n`;
    txt += `   ${modeLabel[j.workMode]||j.workMode} | ${sal} | ${engLabel[j.english]||j.english} | ${j.source}\n`;
    txt += `   ${j.url}\n`;
    const reasons = whyGoodMatch(j);
    txt += `   Dlaczego: ${reasons.join(' · ')}\n\n`;
  });

  txt += `${'─'.repeat(80)}\n`;
  txt += `POZOSTAŁE OFERTY (${finalScored.length - 3} — posortowane wg wyniku)\n\n`;
  finalScored.slice(3).forEach((j, i) => {
    const sal = j.salaryMax ? `${j.salaryMin.toLocaleString('pl')}-${j.salaryMax.toLocaleString('pl')} PLN` : '---';
    txt += `${String(i+4).padStart(2)}. [${j.score}/100] ${(j.company||'?').padEnd(25)} ${j.role.slice(0,40).padEnd(40)} ${modeLabel[j.workMode]||'?'} ${sal}\n`;
    txt += `    ${j.url}\n`;
  });

  fs.writeFileSync(txtPath, '﻿' + txt, 'utf8'); // BOM dla Windows Notatnik
  console.log(`\n📄 Lista zapisana: ${txtPath}`);

  // ─── Email HTML ───────────────────────────────────────────────────────────

  const jobCards = top3.map((j, i) => {
    const reasons = whyGoodMatch(j);
    const salaryStr = j.salaryMax ? `${j.salaryMin.toLocaleString('pl')} – ${j.salaryMax.toLocaleString('pl')} PLN ${j.salaryType}` : 'nie podano';
    const modeStr = { remote: '🟢 Remote 100%', hybrid: '🟡 Hybrid', onsite: '🔴 Stacjonarnie' }[j.workMode] || j.workMode;
    const engStr  = { none: '✅ niewymagany', optional: '✅ opcjonalny', b1: '✅ B1 wystarczy', b2: '⚠️ B2 wymagany', c1: '❌ C1 wymagany', unknown: '❓ nieznany' }[j.english] || j.english;

    return `
<div style="border-left:4px solid #C9A84C;background:#fafafa;border-radius:4px;padding:18px 22px;margin-bottom:16px;">
  <div style="font-size:11px;color:#aaa;margin-bottom:2px;">OFERTA #${i+1} Z 3 — WYNIK: <b style="color:#C9A84C">${j.score}/100</b></div>
  <h3 style="margin:0 0 4px;color:#1C2333;font-size:17px;">${j.role}</h3>
  <div style="color:#C9A84C;font-weight:bold;margin-bottom:10px;font-size:14px;">${j.company}</div>
  <table style="font-size:13px;width:100%;border-collapse:collapse;margin-bottom:10px;">
    <tr><td style="padding:2px 0;font-weight:bold;width:140px;color:#555;">Wynagrodzenie</td><td>${salaryStr}</td></tr>
    <tr><td style="padding:2px 0;font-weight:bold;color:#555;">Tryb pracy</td><td>${modeStr}</td></tr>
    <tr><td style="padding:2px 0;font-weight:bold;color:#555;">Angielski</td><td>${engStr}</td></tr>
    <tr><td style="padding:2px 0;font-weight:bold;color:#555;">Skills</td><td>${j.skills.slice(0,6).join(', ')}</td></tr>
  </table>
  <div style="background:#e8f5e9;border-radius:4px;padding:10px 14px;margin-bottom:10px;font-size:13px;">
    <b style="color:#2e7d32;">Dlaczego duże szanse:</b>
    <ul style="margin:4px 0 0;padding-left:18px;color:#333;">
      ${reasons.map(r => `<li>${r}</li>`).join('')}
    </ul>
  </div>
  <a href="${j.url}" style="display:inline-block;background:#1C2333;color:#C9A84C;padding:8px 18px;border-radius:4px;text-decoration:none;font-size:13px;font-weight:bold;">→ Otwórz ofertę i aplikuj</a>
</div>`;
  }).join('');

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
body{font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:20px;}
.w{max-width:680px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;}
.h{background:#1C2333;color:#C9A84C;padding:24px 28px;}
.h h1{margin:0;font-size:22px;} .h p{margin:6px 0 0;color:#aaa;font-size:13px;}
.b{padding:24px 28px;}
h2{color:#1C2333;border-bottom:2px solid #C9A84C;padding-bottom:6px;margin-top:0;}
.footer{background:#1C2333;color:#666;padding:14px 28px;font-size:12px;}
</style></head><body><div class="w">
<div class="h">
  <h1>🎯 Top 3 Oferty — ${TODAY}</h1>
  <p>Znaleziono ${allJobs.length} ofert · Po ocenie: ${finalScored.length} · Poniżej 3 najlepiej dopasowane</p>
</div>
<div class="b">
<h2>✅ 3 Oferty gdzie masz największe szanse</h2>
${jobCards}
<div style="background:#fff3cd;border:1px solid #ffc107;border-radius:4px;padding:12px 16px;font-size:13px;color:#856404;margin-top:8px;">
  <b>ℹ️ Jak aplikować:</b> Kliknij "Otwórz ofertę" → zaloguj się przez Google → kliknij Aplikuj → wypełnij formularz.<br>
  Okres wypowiedzenia: <b>${NOTICE_DAYS} dni</b>. Oczekiwane wynagrodzenie: <b>${SALARY_MIN.toLocaleString('pl')} PLN</b>.<br>
  Twoje CV online: <a href="https://cv-app-ta9g.vercel.app/" style="color:#856404;">cv-app-ta9g.vercel.app</a> — dołącz link do aplikacji.
</div>
</div>
<div class="footer">Pipeline Pracy · ${TODAY} · ${USER_EMAIL}</div>
</div></body></html>`;

  // ─── Wyślij email ─────────────────────────────────────────────────────────

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', port: 587, secure: false,
    auth: { user: USER_EMAIL, pass: SMTP_PASS },
    connectionTimeout: 10000, greetingTimeout: 10000,
    socketTimeout: 10000, tls: { rejectUnauthorized: false }
  });

  const info = await transporter.sendMail({
    from: `"Pipeline Pracy" <${USER_EMAIL}>`,
    to: USER_EMAIL,
    subject: `[${TODAY}] Top 3 oferty — ${top3.map(j => j.company).join(', ')}`,
    html
  });

  console.log(`\n✅ Email wysłany: ${info.messageId}`);
  console.log(`   Do: ${USER_EMAIL}\n`);
})();
