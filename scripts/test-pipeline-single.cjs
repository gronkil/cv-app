require('dotenv').config();
const nodemailer = require('nodemailer');

const SMTP_USER = process.env.GOOGLE_EMAIL;
const SMTP_PASS = process.env.GMAIL_SMTP_APP_PASSWORD;
const RECIPIENT = process.env.GOOGLE_EMAIL;

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: { user: SMTP_USER, pass: SMTP_PASS },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
  tls: { rejectUnauthorized: false }
});

const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
  .container { max-width: 680px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; }
  .header { background: #1C2333; color: #C9A84C; padding: 24px 32px; }
  .header h1 { margin: 0; font-size: 22px; }
  .header p { margin: 6px 0 0; color: #aaa; font-size: 13px; }
  .body { padding: 24px 32px; }
  .job-card { border-left: 4px solid #C9A84C; background: #fafafa; border-radius: 4px; padding: 16px 20px; margin-bottom: 16px; }
  .job-card h3 { margin: 0 0 4px; color: #1C2333; }
  .company { color: #555; font-size: 13px; margin-bottom: 8px; }
  .score { display: inline-block; background: #C9A84C; color: #fff; padding: 2px 10px; border-radius: 12px; font-size: 13px; font-weight: bold; }
  .meta { margin: 6px 0; font-size: 13px; color: #666; }
  .meta span { margin-right: 12px; }
  .warning { background: #fff3cd; border: 1px solid #ffc107; border-radius: 4px; padding: 10px 14px; margin: 8px 0; font-size: 13px; color: #856404; }
  .link-btn { display: inline-block; margin-top: 10px; background: #1C2333; color: #C9A84C; padding: 8px 18px; border-radius: 4px; text-decoration: none; font-size: 13px; }
  .stats { background: #f0f0f0; border-radius: 4px; padding: 14px 20px; font-size: 13px; color: #444; }
  .stats table { width: 100%; border-collapse: collapse; }
  .stats td { padding: 3px 0; }
  .stats td:first-child { font-weight: bold; color: #1C2333; width: 200px; }
  .footer { background: #1C2333; color: #888; padding: 16px 32px; font-size: 12px; }
  h2 { color: #1C2333; border-bottom: 2px solid #C9A84C; padding-bottom: 6px; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>🧪 TEST Pipeline Pracy — 2026-06-17</h1>
    <p>Tryb testowy · 1 ogłoszenie · Portale: JustJoin.it + TheProtocol.it</p>
  </div>
  <div class="body">

    <h2>✅ Najlepsze dopasowanie</h2>

    <div class="job-card">
      <h3>Mid/Senior Full Stack Developer (Java/Kotlin + React)</h3>
      <div class="company">🏢 Clebre</div>
      <div class="meta">
        <span>📍 Remote (Polska)</span>
        <span class="score">76 / 100</span>
      </div>
      <p style="font-size:14px; color:#333; margin: 8px 0;">
        Medtech startup rozwijający system monitorowania snu i oddechu. Stack: Kotlin + Spring Boot + React + TypeScript + PostgreSQL + Docker.
        Szukają doświadczonego fullstack devcorona min. 4 lata — 7 lat Mateusza mocno przewyższa wymagania.
      </p>
      <div class="warning">⚠️ B2 angielski wymagany (Mateusz ma B1) — ryzyko odrzucenia na etapie rozmowy rekrutacyjnej</div>
      <table style="font-size:13px; width:100%; margin-top:8px;">
        <tr><td><b>Wynagrodzenie:</b></td><td>18 000–25 000 PLN netto B2B</td></tr>
        <tr><td><b>Tryb pracy:</b></td><td>Remote ✅</td></tr>
        <tr><td><b>Seniority:</b></td><td>Mid/Senior (min. 4 lata)</td></tr>
        <tr><td><b>Angielski:</b></td><td>B2 wymagany ⚠️</td></tr>
        <tr><td><b>AI w ofercie:</b></td><td>Mile widziany (Copilot/Cursor) ✅</td></tr>
      </table>
      <a href="https://justjoin.it/job-offer/clebre-mid-senior-full-stack-developer-java-kotlin-react--warszawa-java" class="link-btn">→ Przejdź do oferty</a>
    </div>

    <h2>📊 Punktacja</h2>
    <div class="stats">
      <table>
        <tr><td>Pokrycie skillów (max 30)</td><td>30 / 30 — React✅ TypeScript✅ Kotlin✅ Spring Boot✅</td></tr>
        <tr><td>Seniority fit (max 20)</td><td>18 / 20 — Mid/Senior, Mateusz overqualified</td></tr>
        <tr><td>Wynagrodzenie (max 20)</td><td>15 / 20 — widełki 18-25k B2B, 21k w zasięgu</td></tr>
        <tr><td>Angielski (max 15)</td><td>3 / 15 — B2 wymagany, Mateusz ma B1</td></tr>
        <tr><td>AI/GenAI atut (max 10)</td><td>5 / 10 — AI tools mile widziane</td></tr>
        <tr><td>Remote/Hybrid (max 5)</td><td>5 / 5 — fully remote</td></tr>
        <tr><td><b>ŁĄCZNIE</b></td><td><b>76 / 100</b></td></tr>
      </table>
    </div>

    <h2>🤖 Status aplikacji</h2>
    <div class="warning" style="background:#f8d7da; border-color:#f5c2c7; color:#842029;">
      ⚠️ Playwright MCP niedostępny w tym środowisku — automatyczna aplikacja nie została złożona.
      Formularz wymaga ręcznego kliknięcia "Aplikuj" na portalu.
    </div>
    <p style="font-size:13px; color:#555;">
      Pipeline znalazł ofertę i ją przeanalizował. Żeby zaaplikować — odwiedź link powyżej i kliknij Aplikuj.
      Okres wypowiedzenia: <b>3 dni</b>. Oczekiwane wynagrodzenie: <b>min. 21 000 PLN</b>.
    </p>

    <h2>📈 Statystyki testu</h2>
    <div class="stats">
      <table>
        <tr><td>Portale przeszukane</td><td>JustJoin.it, TheProtocol.it</td></tr>
        <tr><td>Oferty znalezione</td><td>10 (JJI) + filtry TheProtocol</td></tr>
        <tr><td>Oferty już w rejestrze (pominięte)</td><td>11</td></tr>
        <tr><td>Najlepsze dopasowanie</td><td>Clebre — 76/100</td></tr>
        <tr><td>Aplikacja złożona</td><td>NIE (brak Playwright)</td></tr>
      </table>
    </div>

  </div>
  <div class="footer">
    Test pipeline · Claude Code · fargonmk@gmail.com · 2026-06-17
  </div>
</div>
</body>
</html>
`;

transporter.sendMail({
  from: `"Pipeline Pracy TEST" <${SMTP_USER}>`,
  to: RECIPIENT,
  subject: '[TEST Pipeline 2026-06-17] Najlepsza oferta: Clebre — 76/100 (Kotlin+React, Remote)',
  html
}, (err, info) => {
  if (err) {
    console.error('BLAD:', err.message);
    process.exit(1);
  } else {
    console.log('OK:', info.messageId);
    console.log('Wyslano do:', RECIPIENT);
  }
});
