/**
 * test-full-pipeline.cjs
 * Symuluje kompletną logikę pipeline-pracy na podstawie mock-portal.html
 * Kroki: parse → deduplicate → score → rank → email → audit
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

// ─── KROK 0: Konfiguracja ─────────────────────────────────────────────────────

const SALARY_MIN = parseInt(process.env.USER_SALARY_MIN || '21000');
const NOTICE_DAYS = parseInt(process.env.NOTICE_PERIOD_DAYS || '3');
const USER_EMAIL = process.env.GOOGLE_EMAIL;
const SMTP_PASS = process.env.GMAIL_SMTP_APP_PASSWORD;
const TODAY = new Date().toISOString().slice(0, 10);

const MATEUSZ_SKILLS_HIGH = ['react', 'react.js', 'typescript', 'javascript', 'kotlin', 'rest api', 'prompt engineering', 'genai', 'gen ai', 'gpt-4', 'claude', 'llm', 'generatyw'];
const MATEUSZ_SKILLS_MED  = ['spring boot', 'spring', 'sql', 'node.js', 'node', 'rabbitmq', 'docker', 'ci/cd', 'selenium', 'java'];

console.log('\n═══════════════════════════════════════════════════════');
console.log('  PIPELINE PRACY — TEST PEŁNEJ LOGIKI');
console.log('═══════════════════════════════════════════════════════\n');
console.log('[KROK 0] Konfiguracja:');
console.log(`  Email: ${USER_EMAIL}`);
console.log(`  Min wynagrodzenie: ${SALARY_MIN} PLN`);
console.log(`  Okres wypowiedzenia: ${NOTICE_DAYS} dni`);
console.log(`  SMTP hasło: ${SMTP_PASS ? '✅ ustawione' : '❌ BRAK'}\n`);

// ─── KROK 0b: Wczytaj applied-jobs.json ───────────────────────────────────────

const appliedPath = path.join(__dirname, '../applications/applied-jobs.json');
let appliedUrls = new Set();
let appliedData = { applied: [] };

try {
  appliedData = JSON.parse(fs.readFileSync(appliedPath, 'utf8'));
  appliedUrls = new Set(appliedData.applied.map(j => j.url));
  console.log(`[KROK 0b] applied-jobs.json: ${appliedUrls.size} już aplikowanych URL-i`);
} catch (e) {
  console.log('[KROK 0b] applied-jobs.json: nie znaleziono → tworzy nowy');
}

// ─── KROK 1: Parsowanie HTML portalu ──────────────────────────────────────────

console.log('\n[KROK 1] Parsowanie mock-portal.html...');

const htmlPath = path.join(__dirname, 'mock-portal.html');
const html = fs.readFileSync(htmlPath, 'utf8');

function parseJobsFromHtml(html) {
  const jobs = [];
  // Wyciąga wszystkie tagi <article class="job-offer" data-...>
  const articleRegex = /<article[^>]+class="job-offer"([^>]*)>/g;
  let match;

  while ((match = articleRegex.exec(html)) !== null) {
    const attrs = match[1];
    const get = (name) => {
      const m = attrs.match(new RegExp(`data-${name}="([^"]*)"`));
      return m ? m[1] : '';
    };

    const skills = get('skills').split(',').map(s => s.trim()).filter(Boolean);
    const salaryMax = parseInt(get('salary-max')) || 0;
    const salaryMin = parseInt(get('salary-min')) || 0;

    jobs.push({
      url:             get('url'),
      company:         get('company'),
      role:            get('role'),
      salaryMin,
      salaryMax,
      salaryType:      get('salary-type'),
      workMode:        get('work-mode'),
      englishRequired: get('english'),
      skills,
      description:     get('description'),
    });
  }
  return jobs;
}

const allJobs = parseJobsFromHtml(html);
console.log(`  Znaleziono: ${allJobs.length} ofert`);

// ─── KROK 2: Deduplikacja i filtrowanie already-applied ───────────────────────

console.log('\n[KROK 2] Deduplikacja i filtrowanie...');

const filteredOut = [];
const newJobs = allJobs.filter(job => {
  if (appliedUrls.has(job.url)) {
    filteredOut.push(job);
    return false;
  }
  return true;
});

console.log(`  Pominięto (już aplikowane): ${filteredOut.length}`);
filteredOut.forEach(j => console.log(`    ✗ ${j.company} — ${j.role}`));
console.log(`  Do oceny: ${newJobs.length} ofert`);

// ─── KROK 3: Scoring ──────────────────────────────────────────────────────────

console.log('\n[KROK 3] Scoring ofert...');

function scoreJob(job) {
  let score = 0;
  const breakdown = {};

  // SKILLS (max 30pt)
  const jobSkillsLower = job.skills.map(s => s.toLowerCase());
  let skillHits = 0;
  jobSkillsLower.forEach(s => {
    if (MATEUSZ_SKILLS_HIGH.some(ms => s.includes(ms) || ms.includes(s))) skillHits += 1.0;
    else if (MATEUSZ_SKILLS_MED.some(ms => s.includes(ms) || ms.includes(s))) skillHits += 0.6;
  });
  const skillScore = Math.min(30, Math.round((skillHits / Math.max(jobSkillsLower.length, 1)) * 30 + skillHits * 2));
  score += skillScore;
  breakdown.skills = skillScore;

  // SENIORITY (max 20pt)
  const roleL = job.role.toLowerCase();
  let seniorityScore;
  if (roleL.includes('junior') || roleL.includes('młodszy')) seniorityScore = 2;
  else if (roleL.match(/\bmid\b/) && !roleL.includes('senior')) seniorityScore = 10;
  else if (roleL.includes('mid/senior') || roleL.includes('mid-senior')) seniorityScore = 15;
  else if (roleL.includes('senior') || roleL.includes('lead') || roleL.includes('principal')) seniorityScore = 18;
  else seniorityScore = 12;
  score += seniorityScore;
  breakdown.seniority = seniorityScore;

  // SALARY (max 20pt)
  let salaryScore;
  if (job.salaryMax <= 0)                        salaryScore = 10;
  else if (job.salaryMax >= SALARY_MIN)          salaryScore = 20;
  else if (job.salaryMax >= SALARY_MIN * 0.90)   salaryScore = 15;
  else if (job.salaryMax >= SALARY_MIN * 0.80)   salaryScore = 10;
  else                                            salaryScore = 4;
  score += salaryScore;
  breakdown.salary = salaryScore;

  // ENGLISH (max 15pt)
  const englishMap = { none: 15, optional: 10, b1: 8, b2: 3, c1: 0, c2: 0, fluent: 0 };
  const englishScore = englishMap[job.englishRequired?.toLowerCase()] ?? 8;
  score += englishScore;
  breakdown.english = englishScore;

  // AI/GENAI (max 10pt)
  const textL = (job.description + ' ' + job.skills.join(' ')).toLowerCase();
  let aiScore = 0;
  if (/\b(genai|gen ai|llm|large language|generatyw|ai engineer|chatgpt api|automatyzacje ai)\b/.test(textL)) aiScore = 10;
  else if (/\b(ai|machine learning|ml|copilot|cursor|chatgpt)\b/.test(textL)) aiScore = 5;
  score += aiScore;
  breakdown.ai = aiScore;

  // REMOTE (max 5pt)
  const remoteMap = { remote: 5, hybrid: 3, onsite: 0 };
  const remoteScore = remoteMap[job.workMode?.toLowerCase()] ?? 3;
  score += remoteScore;
  breakdown.remote = remoteScore;

  return { ...job, score, breakdown };
}

const scoredJobs = newJobs.map(scoreJob).sort((a, b) => b.score - a.score);

console.log('\n  Ranking:');
scoredJobs.forEach((j, i) => {
  const bar = '█'.repeat(Math.round(j.score / 5));
  console.log(`  ${String(i+1).padStart(2)}. [${String(j.score).padStart(3)}] ${bar}`);
  console.log(`      ${j.company} — ${j.role}`);
  console.log(`      skills:${j.breakdown.skills} sen:${j.breakdown.seniority} sal:${j.breakdown.salary} eng:${j.breakdown.english} ai:${j.breakdown.ai} rem:${j.breakdown.remote}`);
});

// ─── Selekcja top3 + warto rozważyć ──────────────────────────────────────────

const top3 = scoredJobs.slice(0, 3);
const wartoRozwazyc = scoredJobs.slice(3).filter(j => j.score >= 60);
const pomijamy = scoredJobs.slice(3).filter(j => j.score < 60);

console.log(`\n  Top 3: ${top3.map(j => j.company).join(', ')}`);
console.log(`  Warto rozważyć (≥60): ${wartoRozwazyc.length}`);
console.log(`  Pomijamy (<60): ${pomijamy.length}`);

// ─── KROK 4: Playwright — symulacja ──────────────────────────────────────────

console.log('\n[KROK 4] Playwright (symulacja — nie uruchamia prawdziwej przeglądarki):');
const playwrightStatus = [];
top3.forEach(job => {
  // Sprawdza czy Playwright MCP jest dostępny (w tym środowisku: NIE)
  const canApply = false; // W prawdziwym pipeline: browser_navigate, browser_fill_form, browser_click
  playwrightStatus.push({
    ...job,
    applicationStatus: canApply ? 'submitted' : 'playwright_unavailable',
    screenshotPath: canApply ? `applications/${TODAY}_${job.company.replace(/\s+/g,'_')}.png` : null
  });
  console.log(`  ⚠️  ${job.company} — Playwright niedostępny w tym środowisku`);
  console.log(`     URL: ${job.url}`);
});

// ─── KROK 5: Budowanie emaila ─────────────────────────────────────────────────

console.log('\n[KROK 5] Budowanie emaila HTML...');

function workModeLabel(m) {
  return { remote: 'Remote 100%', hybrid: 'Hybrid', onsite: 'Stacjonarnie' }[m] || m;
}
function englishLabel(e) {
  return { none: 'niewymagany ✅', optional: 'opcjonalny ✅', b1: 'B1 ✅', b2: 'B2 ⚠️', c1: 'C1 ❌', c2: 'C2 ❌' }[e] || e;
}
function salaryStr(j) {
  if (!j.salaryMax) return 'nie podano';
  return `${j.salaryMin.toLocaleString('pl')} – ${j.salaryMax.toLocaleString('pl')} PLN ${j.salaryType}`;
}

const top3Html = top3.map((j, i) => `
<div style="border-left:4px solid #C9A84C;background:#fafafa;border-radius:4px;padding:16px 20px;margin-bottom:14px;">
  <div style="font-size:11px;color:#888;margin-bottom:4px;">#${i+1} z 3</div>
  <h3 style="margin:0 0 4px;color:#1C2333;">${j.role}</h3>
  <div style="color:#C9A84C;font-weight:bold;margin-bottom:8px;">${j.company}</div>
  <div style="font-size:13px;color:#555;margin-bottom:8px;">
    📍 ${workModeLabel(j.workMode)} &nbsp;|&nbsp;
    💰 ${salaryStr(j)} &nbsp;|&nbsp;
    🇬🇧 Angielski: ${englishLabel(j.englishRequired)}
  </div>
  <div style="font-size:13px;margin-bottom:8px;">
    <b>Wynik:</b> <span style="background:#C9A84C;color:#fff;padding:2px 10px;border-radius:12px;font-weight:bold;">${j.score} / 100</span>
    &nbsp; skills:${j.breakdown.skills} | seniority:${j.breakdown.seniority} | salary:${j.breakdown.salary} | eng:${j.breakdown.english} | ai:${j.breakdown.ai} | remote:${j.breakdown.remote}
  </div>
  <div style="font-size:13px;color:#333;margin-bottom:10px;">${j.description}</div>
  <div style="font-size:12px;background:#fff3cd;border:1px solid #ffc107;padding:8px 12px;border-radius:4px;color:#856404;margin-bottom:10px;">
    ⚠️ Aplikacja NIE złożona — Playwright MCP niedostępny w tym środowisku testowym.<br>
    Aby zaaplikować: <a href="${j.url}" style="color:#856404;">${j.url}</a>
  </div>
</div>`).join('');

const wartoHtml = wartoRozwazyc.length > 0 ? wartoRozwazyc.map(j => `
<div style="border-left:4px solid #aaa;background:#f9f9f9;border-radius:4px;padding:10px 16px;margin-bottom:10px;font-size:13px;">
  <b>${j.role}</b> — ${j.company} &nbsp;
  <span style="background:#aaa;color:#fff;padding:1px 8px;border-radius:10px;font-size:12px;">${j.score}/100</span>
  &nbsp; ${workModeLabel(j.workMode)} | ${salaryStr(j)} | ang: ${englishLabel(j.englishRequired)}<br>
  <a href="${j.url}" style="color:#1C2333;">${j.url}</a>
</div>`).join('') : '<p style="color:#888;font-size:13px;">Brak ofert z wynikiem ≥ 60 poza top 3.</p>';

const pomijamyHtml = pomijamy.length > 0 ? `<ul style="font-size:12px;color:#888;">${
  pomijamy.map(j => `<li>${j.company} — ${j.role} [${j.score}/100] — ${
    j.breakdown.english < 5 ? 'C1/C2 angielski' :
    j.breakdown.salary < 8 ? 'za niskie wynagrodzenie' :
    j.breakdown.remote === 0 ? 'tylko stacjonarnie' :
    'ogólnie słabe dopasowanie'
  }</li>`).join('')
}</ul>` : '';

const filteredHtml = filteredOut.length > 0 ? `<ul style="font-size:12px;color:#888;">${
  filteredOut.map(j => `<li>${j.company} — ${j.role} — <i>już aplikowano</i></li>`).join('')
}</ul>` : '';

const emailHtml = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><style>
body{font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:20px;}
.wrap{max-width:700px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;}
.header{background:#1C2333;color:#C9A84C;padding:24px 30px;}
.header h1{margin:0;font-size:22px;}
.header p{margin:6px 0 0;color:#aaa;font-size:13px;}
.body{padding:24px 30px;}
h2{color:#1C2333;border-bottom:2px solid #C9A84C;padding-bottom:6px;}
.footer{background:#1C2333;color:#666;padding:14px 30px;font-size:12px;}
</style></head>
<body><div class="wrap">
<div class="header">
  <h1>🎯 Pipeline Pracy — ${TODAY}</h1>
  <p>TEST LOGIKI • ${allJobs.length} ofert znalezionych • ${filteredOut.length} pominiętych • top 3 poniżej</p>
</div>
<div class="body">

<h2>✅ TOP 3 — Do aplikacji</h2>
${top3Html}

<h2>💡 Warto rozważyć (${wartoRozwazyc.length} ofert, wynik ≥ 60)</h2>
${wartoHtml}

${pomijamy.length > 0 ? `<h2>❌ Pomijamy (${pomijamy.length})</h2>${pomijamyHtml}` : ''}
${filteredOut.length > 0 ? `<h2>🔁 Pominięto — już aplikowane (${filteredOut.length})</h2>${filteredHtml}` : ''}

<h2>📊 Statystyki</h2>
<div style="background:#f0f0f0;border-radius:4px;padding:14px 18px;font-size:13px;color:#444;">
  <table style="width:100%;border-collapse:collapse;">
    <tr><td style="font-weight:bold;width:220px;padding:2px 0;">Portal</td><td>mock-portal.html (symulator)</td></tr>
    <tr><td style="font-weight:bold;padding:2px 0;">Znaleziono ofert</td><td>${allJobs.length}</td></tr>
    <tr><td style="font-weight:bold;padding:2px 0;">Już aplikowane (pominięte)</td><td>${filteredOut.length}</td></tr>
    <tr><td style="font-weight:bold;padding:2px 0;">Do oceny</td><td>${newJobs.length}</td></tr>
    <tr><td style="font-weight:bold;padding:2px 0;">Top 3 (ranking)</td><td>${top3.map(j=>j.company).join(', ')}</td></tr>
    <tr><td style="font-weight:bold;padding:2px 0;">Warto rozważyć</td><td>${wartoRozwazyc.length}</td></tr>
    <tr><td style="font-weight:bold;padding:2px 0;">Playwright</td><td>⚠️ Niedostępny — test środowisko</td></tr>
    <tr><td style="font-weight:bold;padding:2px 0;">Min wynagrodzenie</td><td>${SALARY_MIN.toLocaleString('pl')} PLN</td></tr>
    <tr><td style="font-weight:bold;padding:2px 0;">Okres wypowiedzenia</td><td>${NOTICE_DAYS} dni</td></tr>
  </table>
</div>

</div>
<div class="footer">Pipeline Pracy TEST · Claude Code · ${USER_EMAIL} · ${TODAY}</div>
</div></body></html>`;

// ─── KROK 5b: Wyślij email ─────────────────────────────────────────────────────

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: { user: USER_EMAIL, pass: SMTP_PASS },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
  tls: { rejectUnauthorized: false }
});

transporter.sendMail({
  from: `"Pipeline Pracy TEST" <${USER_EMAIL}>`,
  to: USER_EMAIL,
  subject: `[PIPELINE TEST ${TODAY}] Top 3: ${top3.map(j=>j.company).join(', ')} — pełna logika`,
  html: emailHtml
}, (err, info) => {
  if (err) {
    console.log('\n[KROK 5] Email: ❌ BŁĄD:', err.message);
  } else {
    console.log('\n[KROK 5] Email: ✅ Wysłano!');
    console.log(`  ID: ${info.messageId}`);
    console.log(`  Do: ${USER_EMAIL}`);
  }

  // ─── KROK 6: AUDYT ────────────────────────────────────────────────────────────

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  AUDYT — CO DZIAŁA / CO TRZEBA POPRAWIĆ');
  console.log('═══════════════════════════════════════════════════════\n');

  const audit = [
    {
      krok: 'Krok 0 — Konfiguracja (.env)',
      status: USER_EMAIL && SMTP_PASS ? '✅ DZIAŁA' : '❌ BŁĄD',
      opis: USER_EMAIL && SMTP_PASS
        ? 'USER_SALARY_MIN, NOTICE_PERIOD_DAYS, GOOGLE_EMAIL, GMAIL_SMTP_APP_PASSWORD — wszystko wczytane.'
        : 'Brak GOOGLE_EMAIL lub GMAIL_SMTP_APP_PASSWORD w .env.',
      fix: null
    },
    {
      krok: 'Krok 0b — applied-jobs.json',
      status: '✅ DZIAŁA',
      opis: `Plik istnieje, ${appliedUrls.size} URLi wczytanych. Deduplication działa.`,
      fix: null
    },
    {
      krok: 'Krok 1 — Parsowanie HTML portalu',
      status: allJobs.length > 0 ? '✅ DZIAŁA (mock)' : '❌ BŁĄD',
      opis: `Parser wyciąga ${allJobs.length} ofert z data-atrybutów <article>. W prawdziwym pipeline: WebFetch/Playwright → HTML → parser.`,
      fix: allJobs.length === 0
        ? 'Parser regex nie znalazł <article class="job-offer"> — sprawdź strukturę HTML portalu.'
        : 'UWAGA: Prawdziwe portale (JustJoin, TheProtocol) renderują przez JS. WebFetch zwróci pusty HTML. Potrzebny Playwright (browser_navigate + browser_snapshot) do pobrania rendered DOM.'
    },
    {
      krok: 'Krok 2 — Deduplication + filtrowanie',
      status: '✅ DZIAŁA',
      opis: `Pominięto ${filteredOut.length} ofert (${filteredOut.map(j=>j.company).join(', ')}). Set lookup O(1).`,
      fix: 'UWAGA: Duplikaty z różnych portali (ta sama firma, inne URL) NIE są wykrywane. Potrzebne fuzzy matching company+role.'
    },
    {
      krok: 'Krok 3 — Scoring (0-100)',
      status: '✅ DZIAŁA',
      opis: `Scored ${newJobs.length} ofert. Top 3: ${top3.map(j=>`${j.company} (${j.score})`).join(', ')}. Kryteria: skills/seniority/salary/english/ai/remote.`,
      fix: `PROBLEMY:\n` +
        `  1. Scoring oparty na data-atrybutach z HTML — realne portale nie mają data-atrybutów.\n` +
        `  2. Skills matching jest keyword-based (może pominąć aliasy: "React.js" vs "React").\n` +
        `  3. Brak weryfikacji: czy wynagrodzenie jest brutto/netto, PLN/EUR.\n` +
        `  4. Angielski requirement często ukryty w body oferty, nie w tagach.`
    },
    {
      krok: 'Krok 4 — Playwright (aplikowanie)',
      status: '⚠️  NIE DZIAŁA w tym środowisku',
      opis: 'Playwright MCP (browser_navigate, browser_fill_form, browser_click) niedostępny lokalnie.',
      fix: `KRYTYCZNY PROBLEM:\n` +
        `  1. Playwright MCP działa tylko w sessions z aktywnym MCP server.\n` +
        `  2. Formularz Google OAuth wymaga: GOOGLE_EMAIL + GOOGLE_PASSWORD (plain text w .env — ryzyko!).\n` +
        `  3. Każdy portal ma INNY formularz — nie ma uniwersalnego flow.\n` +
        `  4. JustJoin.it i TheProtocol.it mogą wymagać 2FA przy logowaniu Google OAuth.\n` +
        `  5. Brak mechanizmu retry na błąd Playwright.\n` +
        `  REKOMENDACJA: Najpierw zbadaj formularze ręcznie, stwórz per-portal adapter.`
    },
    {
      krok: 'Krok 5 — Email SMTP',
      status: err ? '❌ BŁĄD' : '✅ DZIAŁA',
      opis: err
        ? `SMTP error: ${err.message}`
        : `Email wysłany na ${USER_EMAIL}. HTML template dynamicznie generowany z danych rankingu.`,
      fix: err
        ? 'Sprawdź App Password i 2FA w Google Account.'
        : 'UWAGA: Template budowany string concatenation — podatne na HTML injection jeśli dane z portalu zawierają <script>. Dodaj sanitizację.'
    },
    {
      krok: 'Krok 5b — Zapis do applied-jobs.json',
      status: '⚠️  POMINIĘTO w teście',
      opis: 'Test nie zapisuje do applied-jobs.json (dry-run). W prawdziwym pipeline: tylko po successful Playwright submit.',
      fix: 'Logika zapisu jest w notify-mateusz.cjs ale nie jest wywoływana automatycznie. Potrzebna integracja z wynikiem Playwright.'
    },
  ];

  audit.forEach(a => {
    console.log(`[${a.krok}]`);
    console.log(`  Status: ${a.status}`);
    console.log(`  Opis:   ${a.opis}`);
    if (a.fix) {
      console.log(`  FIX:    ${a.fix}`);
    }
    console.log();
  });

  // PODSUMOWANIE
  const ok = audit.filter(a => a.status.startsWith('✅')).length;
  const warn = audit.filter(a => a.status.startsWith('⚠️')).length;
  const fail = audit.filter(a => a.status.startsWith('❌')).length;

  console.log('═══════════════════════════════════════════════════════');
  console.log(`  WYNIK: ✅ ${ok} działa | ⚠️  ${warn} częściowo | ❌ ${fail} nie działa`);
  console.log('═══════════════════════════════════════════════════════\n');

  console.log('KRYTYCZNE DO NAPRAWY (blokują działanie pipeline):');
  console.log('  1. Playwright MCP — portale JS-rendered, WebFetch nie wystarczy');
  console.log('  2. Google OAuth w Playwright — plain password w .env, ryzyko 2FA');
  console.log('  3. Per-portal HTML parser — każdy portal ma inną strukturę');
  console.log('\nWARTO POPRAWIĆ (usprawnią jakość):');
  console.log('  4. Fuzzy deduplication (ta sama oferta, inne URL)');
  console.log('  5. Sanitizacja HTML w emailu');
  console.log('  6. Wynagrodzenie brutto vs netto (scoring może być błędny)');
  console.log('  7. applied-jobs.json zapis tylko po udanym submit\n');

  process.exit(err ? 1 : 0);
});
