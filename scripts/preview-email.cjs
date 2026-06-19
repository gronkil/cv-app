/**
 * preview-email.cjs — generuje podgląd HTML emaila z przykładowymi danymi
 * Uruchom: node scripts/preview-email.cjs
 * Otwórz:  applications/email-preview.html
 */
const fs = require('fs');
const path = require('path');

const TODAY = new Date().toISOString().slice(0, 10);
const SALARY_MIN = 21000;

const top3 = [
  {
    score: 87,
    role: 'Senior Fullstack Developer (React/TypeScript)',
    company: 'Allegro',
    salaryMin: 22000, salaryMax: 28000, salaryType: 'B2B',
    workMode: 'hybrid',
    english: 'optional',
    skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'Docker', 'AWS'],
    source: 'justjoin',
    url: 'https://justjoin.it/job-offer/allegro-senior-fullstack-developer',
    breakdown: { skills: 28, seniority: 18, salary: 20, english: 10, ai: 0, remote: 3 }
  },
  {
    score: 81,
    role: 'Lead AI/GenAI Engineer',
    company: 'Netguru',
    salaryMin: 24000, salaryMax: 32000, salaryType: 'B2B',
    workMode: 'remote',
    english: 'b2',
    skills: ['Python', 'LLM', 'React', 'GenAI', 'Prompt Engineering', 'OpenAI API'],
    source: 'nofluffjobs',
    url: 'https://nofluffjobs.com/pl/job/netguru-lead-ai-engineer',
    breakdown: { skills: 26, seniority: 20, salary: 20, english: 3, ai: 10, remote: 5 }
  },
  {
    score: 74,
    role: 'Senior React Developer',
    company: 'CD Projekt RED',
    salaryMin: 20000, salaryMax: 25000, salaryType: 'B2B',
    workMode: 'hybrid',
    english: 'none',
    skills: ['React', 'TypeScript', 'Redux', 'REST API', 'Jest', 'CI/CD'],
    source: 'pracuj',
    url: 'https://it.pracuj.pl/praca/cd-projekt-senior-react-developer',
    breakdown: { skills: 24, seniority: 18, salary: 15, english: 15, ai: 0, remote: 3 }
  }
];

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
  <div style="background:#e3f2fd;border:1px solid #90caf9;border-radius:4px;padding:12px 16px;margin-bottom:10px;font-size:13px;">
    <div style="color:#1565c0;font-weight:bold;margin-bottom:4px;">💬 DM na LinkedIn (skopiuj i wyślij):</div>
    <div style="color:#555;font-size:11.5px;margin-bottom:8px;line-height:1.5;">
      🔍 Jak znaleźć komu wysłać: LinkedIn → wpisz <b>"${j.company} rekruter"</b> lub otwórz stronę firmy
      → zakładka <b>Pracownicy</b> → filtruj: <i>HR / Talent / Recruiter</i> → wyślij DM do pierwszej osoby.
      Mała firma (&lt;20 osób)? → wyślij do CTO lub CEO.
    </div>
    <div style="background:#fff;border:1px solid #ccc;border-radius:4px;padding:10px 14px;font-family:monospace;font-size:12.5px;color:#222;line-height:1.6;white-space:pre-wrap;">Dzień dobry,

natrafiłem na ofertę ${j.role} w ${j.company} i myślę że dobrze pasuję do tego czego szukacie.

Mam 7 lat w fullstack (React, TypeScript, Kotlin, GenAI). W PZU dostarczyłem platformę AI dla 1000 pracowników w 11 dni — za to dostałem nagrodę Rzeczpospolitej Cyfrowej 2024.

Czy możemy porozmawiać?

Mateusz Markowski
CV: https://cv-app-ta9g.vercel.app/</div>
  </div>
  <div style="background:#e8f5e9;border-radius:4px;padding:10px 14px;margin-bottom:10px;font-size:13px;">
    <b style="color:#2e7d32;">Dlaczego duże szanse:</b>
    <ul style="margin:4px 0 0;padding-left:18px;color:#333;">
      ${reasons.map(r => `<li>${r}</li>`).join('')}
    </ul>
  </div>
  <a href="${j.url}" style="display:inline-block;background:#1C2333;color:#C9A84C;padding:8px 18px;border-radius:4px;text-decoration:none;font-size:13px;font-weight:bold;">→ Otwórz ofertę i aplikuj</a>
</div>`;
}).join('');

const statusBlock = `
<div style="background:#1C2333;color:#fff;border-radius:6px;padding:18px 22px;margin-bottom:20px;">
  <div style="font-size:15px;font-weight:bold;color:#C9A84C;margin-bottom:12px;">📋 PLAN DZIAŁANIA — ${TODAY}</div>
  <table style="width:100%;font-size:13px;border-collapse:collapse;">
    ${top3.map((j,i) => `
    <tr style="border-bottom:1px solid #2d3748;">
      <td style="padding:8px 0;color:#C9A84C;font-weight:bold;width:24px;">#${i+1}</td>
      <td style="padding:8px 8px;color:#fff;width:180px;">${j.company}<br><span style="color:#aaa;font-size:11px;">${j.role.slice(0,30)}</span></td>
      <td style="padding:8px 4px;">
        <a href="${j.url}" style="color:#C9A84C;text-decoration:none;">📝 Aplikuj formularz</a>
      </td>
      <td style="padding:8px 4px;color:#aaa;font-size:12px;">
        💬 LinkedIn → wpisz <b style="color:#fff;">"${j.company} rekruter"</b><br>
        lub firma → Pracownicy → HR/Talent → wyślij DM (szablon poniżej)
      </td>
    </tr>`).join('')}
  </table>
</div>`;

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
  <p>Znaleziono 634 ofert · Po ocenie: 45 · Poniżej 3 najlepiej dopasowane</p>
</div>
<div class="b">
${statusBlock}
<h2>✅ 3 Oferty gdzie masz największe szanse</h2>
${jobCards}
<div style="background:#fff3cd;border:1px solid #ffc107;border-radius:4px;padding:12px 16px;font-size:13px;color:#856404;margin-top:8px;">
  <b>ℹ️ Jak aplikować:</b> Kliknij "Otwórz ofertę" → zaloguj się przez Google → kliknij Aplikuj → wypełnij formularz.<br>
  Okres wypowiedzenia: <b>3 dni</b>. Oczekiwane wynagrodzenie: <b>21 000 PLN</b>.<br>
  Twoje CV online: <a href="https://cv-app-ta9g.vercel.app/" style="color:#856404;">cv-app-ta9g.vercel.app</a> — dołącz link do aplikacji.
</div>
</div>
<div class="footer">Pipeline Pracy · ${TODAY} · fargonmk@gmail.com</div>
</div></body></html>`;

const outPath = path.join(__dirname, '../applications/email-preview.html');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, html, 'utf8');
console.log('Podgląd zapisany:', outPath);
