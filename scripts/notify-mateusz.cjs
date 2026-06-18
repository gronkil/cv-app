require('dotenv').config();
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const USER_EMAIL = process.env.GOOGLE_EMAIL;
const PASS = process.env.GMAIL_SMTP_APP_PASSWORD;

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: { user: USER_EMAIL, pass: PASS },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
  tls: { rejectUnauthorized: false }
});

// Wczytaj szablon HTML
const templatePath = path.join(__dirname, 'email-template.html');
let htmlTemplate = fs.readFileSync(templatePath, 'utf8');

// Przykładowe dane (później będą z agentów)
const jobData = {
  TOTAL_FOUND: 35,
  TOTAL_DEDUPLICATED: 32,
  TOTAL_WORTH_CONSIDERING: 7,
  TOP3_JOBS: `
    <div class="job-card">
      <h3>Fullstack Developer & Vibe Coder (AI + Automatyzacje)</h3>
      <div class="company">Odylion</div>
      <div class="meta">
        <span>📍 Remote/Hybrid</span>
        <span class="score">82/100</span>
      </div>
      <p>Szukają seniora do szybkiego buildowania AI automatyzacji. Stack: React, Node, AI integrations. Okres wypowiedzenia: 3 miesiące akceptowalny.</p>
      <div class="cover-letter">
        Szanowna Rekrutacja, W Assistance AI — platformie GenAI dla ok. 1 000 pracownikow PZU — spedzilam zaledwie 11 dni od koncepcji do wdrozenia produkcyjnego...
      </div>
      <a href="https://www.pracuj.pl/..." class="link-btn">Przejdź do oferty</a>
    </div>
    <div class="job-card">
      <h3>Senior React Developer / Senior Frontend Developer</h3>
      <div class="company">Pivotal Polska</div>
      <div class="meta">
        <span>📍 Remote</span>
        <span class="score">75/100</span>
      </div>
      <p>Architektura frontendu na serio. React, TypeScript, enterprise patterns. Szukają doświadczonego seniora.</p>
      <a href="https://theprotocol.it/..." class="link-btn">Przejdź do oferty</a>
    </div>
    <div class="job-card">
      <h3>React Developer (MUI 9 migration)</h3>
      <div class="company">YOUR ITEAMS sp. z o.o.</div>
      <div class="meta">
        <span>📍 Remote</span>
        <span class="score">65/100</span>
      </div>
      <p>Idealna oferta — razem pracujesz z MUI 9! Migracja komponentów, refactoring, czystość kodu.</p>
      <a href="https://theprotocol.it/..." class="link-btn">Przejdź do oferty</a>
    </div>
  `,
  WORTH_CONSIDERING: `
    <div class="job-card" style="border-left-color: #999;">
      <h3>Senior React/Fullstack Developer</h3>
      <div class="company">Jit Team</div>
      <span class="score">78/100</span> — React match 100%, remote, competitive salary
    </div>
    <div class="job-card" style="border-left-color: #999;">
      <h3>Fullstack AI Engineer</h3>
      <div class="company">WeNet</div>
      <span class="score">75/100</span> — AI focus, pełny stack, dobrze płacą
    </div>
    <div class="job-card" style="border-left-color: #999;">
      <h3>React Developer</h3>
      <div class="company">apreel</div>
      <span class="score">63/100</span> — Wymaga B2 angielski (ryzyko), ale ciekawa oferta
    </div>
  `
};

// Wstaw dane do szablonu
let htmlBody = htmlTemplate;
Object.keys(jobData).forEach(key => {
  htmlBody = htmlBody.replace(`{${key}}`, jobData[key]);
});

// Wyślij email
transporter.sendMail({
  from: `"Pipeline Pracy" <${USER_EMAIL}>`,
  to: USER_EMAIL,
  subject: '[Pipeline pracy 2026-06-17] Znalazlem 35 ofert — top 3 do przejrzenia',
  html: htmlBody
}, (err, info) => {
  if (err) {
    console.log('BLAD:', err.message);
    process.exit(1);
  } else {
    console.log('OK:', info.messageId);
  }
});
