require('dotenv').config();
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const USER_EMAIL = process.env.GOOGLE_EMAIL || 'kozlowski.mateusz.praca@gmail.com';
const PASS = process.env.GMAIL_SMTP_APP_PASSWORD;
const TODAY = new Date().toISOString().slice(0, 10);

// --- Czytaj dane -------------------------------------------------------

const appliedPath = path.join(__dirname, '../applications/applied-jobs.json');
const offerPath = path.join(__dirname, `../applications/oferty-${TODAY}.txt`);

const applied = JSON.parse(fs.readFileSync(appliedPath, 'utf8')).applied;
const todayJobs = applied.filter(j => j.date === TODAY);

// Top 3 = ostatnie 3 dodane dziś (kolejność dodania = kolejność pipeline)
const top3 = todayJobs.slice(-3);

function statusIcon(job) {
  if (job.status === 'email_sent')       return '✅ Email wysłany';
  if (job.status === 'submitted')        return '✅ Formularz wysłany';
  if (job.status === 'playwright_blocked') return '⏳ Wymaga ręcznej aplikacji';
  if (job.status === 'manual_needed')    return '⏳ Wymaga ręcznej aplikacji';
  if (job.status === 'cover_letter_ready') return '📝 Cover letter gotowy';
  return `⏳ ${job.status}`;
}

function actionLabel(job) {
  if (job.action === 'email_hr')        return `Email HR → ${job.hr_email || '?'}`;
  if (job.action === 'playwright_form') return `Formularz portal (${job.portal || '?'})`;
  if (job.action === 'manual')          return 'Ręczna aplikacja';
  return job.action || '?';
}

function jobCard(job, idx) {
  const blocked = job.status === 'playwright_blocked' || job.status === 'manual_needed';
  const cardClass = blocked ? 'job-card blocked' : 'job-card';
  const coverFile = `applications/${TODAY}_${job.company.replace(/[^a-zA-Z0-9]/g,'')}_coverLetter.txt`;
  const hasCover = ['playwright_blocked','manual_needed','cover_letter_ready'].includes(job.status);

  return `
  <div class="${cardClass}">
    <div class="job-title">#${idx+1} ${job.role} &nbsp;<span class="score">${job.score || '?'}/100</span></div>
    <div class="meta">🏢 ${job.company || 'nieznana firma'}</div>
    <div class="meta">🔧 ${actionLabel(job)}</div>
    <div class="meta status-line">${statusIcon(job)}</div>
    ${hasCover ? `<div class="meta" style="color:#856404">📄 Cover letter: <code>${coverFile}</code></div>` : ''}
    <a href="${job.url}" class="link-btn">Otwórz ofertę →</a>
  </div>`;
}

const nAuto = top3.filter(j => ['email_sent','submitted'].includes(j.status)).length;
const nManual = top3.length - nAuto;
const subject = `[Pipeline ${TODAY}] ${nAuto}/3 auto · ${nManual}/3 ręcznie`;


const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><style>
body{font-family:Arial,sans-serif;background:#f5f4f0;color:#1c2333;margin:0;padding:20px;}
.w{max-width:700px;margin:0 auto;}
.header{background:#1C2333;color:#C9A84C;padding:24px 28px;border-radius:8px 8px 0 0;}
.header h1{margin:0;font-size:22px;}
.header p{margin:6px 0 0;color:#aaa;font-size:13px;}
.body{background:#fff;padding:24px 28px;border-radius:0 0 8px 8px;}
.job-card{border-left:4px solid #C9A84C;padding:14px 16px;margin:12px 0;background:#fafaf8;border-radius:4px;}
.job-card.blocked{border-left-color:#e07b00;}
.job-title{font-weight:bold;font-size:16px;margin-bottom:6px;}
.score{background:#C9A84C;color:#fff;padding:2px 8px;border-radius:12px;font-size:13px;font-weight:bold;}
.meta{color:#555;font-size:13px;margin:3px 0;}
.status-line{font-weight:bold;color:#333;}
.note{color:#888;font-style:italic;}
.link-btn{display:inline-block;background:#1C2333;color:#fff;padding:6px 14px;border-radius:4px;text-decoration:none;font-size:13px;margin-top:8px;}
.stats{background:#1C2333;color:#fff;padding:16px 20px;border-radius:8px;margin-top:24px;}
.stats h3{color:#C9A84C;margin-top:0;}
.stats p{margin:4px 0;font-size:14px;}
.warning{background:#fff3cd;border:1px solid #ffc107;padding:12px 16px;border-radius:4px;margin:12px 0;font-size:14px;}
.footer{text-align:center;color:#999;font-size:12px;margin-top:16px;}
code{background:#eee;padding:1px 4px;border-radius:3px;font-size:12px;}
</style></head>
<body><div class="w">
  <div class="header">
    <h1>Pipeline Pracy — ${TODAY}</h1>
    <p>Auto: ${nAuto}/3 &nbsp;|&nbsp; Ręcznie: ${nManual}/3</p>
  </div>
  <div class="body">
    <h2 style="color:#1C2333;border-bottom:2px solid #C9A84C;padding-bottom:8px;">Top 3 oferty</h2>
    ${top3.map((j, i) => jobCard(j, i)).join('')}

    <div class="stats">
      <h3>📊 Statystyki</h3>
      <p>✅ Auto-aplikacje: ${nAuto}/3</p>
      <p>⏳ Ręczne: ${nManual}/3</p>
      <p>📦 Łącznie zaaplikowanych (all time): ${applied.length}</p>
    </div>
  </div>
  <div class="footer">Pipeline Pracy · ${TODAY} · ${USER_EMAIL}</div>
</div></body></html>`;

// --- Wyślij -----------------------------------------------------------

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', port: 587, secure: false,
  auth: { user: USER_EMAIL, pass: PASS },
  connectionTimeout: 10000, greetingTimeout: 10000,
  socketTimeout: 10000, tls: { rejectUnauthorized: false }
});

transporter.sendMail({
  from: `"Pipeline Pracy" <${USER_EMAIL}>`,
  to: USER_EMAIL,
  subject,
  html
}, (err, info) => {
  if (err) { console.error('BLAD:', err.message); process.exit(1); }
  console.log(`✅ Email HTML wysłany: ${info.messageId}`);
  console.log(`   Temat: ${subject}`);
  console.log(`   Do: ${USER_EMAIL}`);
});
