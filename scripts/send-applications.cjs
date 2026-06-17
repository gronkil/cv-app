const nodemailer = require('nodemailer');

const SENDER_ACCOUNT = process.env.CLAUDE_CODE_USER_EMAIL || 'fargonmk@gmail.com';
const GOOGLE_PASS = process.env.GOOGLE_PASSWORD;
const REPLY_TO = 'kozlowski.mateusz.praca@gmail.com';
const SENDER_NAME = 'Mateusz Markowski';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: { user: SENDER_ACCOUNT, pass: GOOGLE_PASS },
  tls: { rejectUnauthorized: false }
});

const emails = [
  {
    to: 'hello@odylion.com',
    subject: 'Aplikacja: Fullstack Developer & Vibe Coder (AI + Automatyzacje) — Mateusz Markowski',
    text: [
      'Szanowna Rekrutacja,',
      '',
      'W Assistance AI — platformie GenAI dla ok. 1 000 pracownikow PZU — spedzilam zaledwie 11 dni od koncepcji do wdrozenia produkcyjnego. Ten projekt wyrozniomy nagroda Rzeczpospolitej Cyfrowej 2024 to dla mnie najlepsza ilustracja tego, czym jest vibe coding: szybkie budowanie realnej wartosci z wykorzystaniem AI jako kopilota.',
      '',
      'W ciagu 7+ lat w PZU zbudowalem kilka krytycznych systemow od zera — CRA (centralny rejestr systemow IT), Dlug Technologiczny (scoring ryzyka dla repozytoriow Bitbucket), pipeline DevEx mierzacy efektywnosc deweloperow. Kazdy z nich to fullstack: React/TypeScript na froncie, Kotlin/Spring Boot na backendzie, integracje REST. Jako AI Ambassador PZU (od 05.2025) wspolksztaltuje strategie wdrazania AI w IT — buduje agenty, testuje skille do code review, ucze pracownikow jak faktycznie przyspieszyc prace z AI.',
      '',
      'Wasza oferta trafia dokladnie w punkt: szukacie kogos, kto nie boi sie uzyc AI do automatyzacji i dostarczy dzialajace rozwiazanie. Chetnie porozmawiam o tym, jak moge wsprzec cyfrowa transformacje Odylion.',
      '',
      'Z powazaniem,',
      'Mateusz Markowski',
      'kozlowski.mateusz.praca@gmail.com',
      'https://www.linkedin.com/in/mateusz-kozlowski-2b576114b',
      '',
      'Oferta: https://www.pracuj.pl/praca/fullstack-developer-vibe-coder-ai-+-automatyzacje-warszawa-syta-114z,oferta,1004266129'
    ].join('\n')
  },
  {
    to: 'rekrutacja@pivotal.pl',
    subject: 'Aplikacja: Senior React Developer — Mateusz Markowski',
    text: [
      'Szanowna Rekrutacja,',
      '',
      'Pivotal Polska to firma, o ktorej slyszalam od lat jako o miejscu, gdzie architektura frontendu traktowana jest powazanie — nie jako ozdobnik, lecz fundament systemu. Wlasnie dlatego pisze bezposrednio na Wasz adres rekrutacyjny.',
      '',
      'Przez 7+ lat w PZU zbudowalem kilka systemow React od zera i utrzymywalem je w srodowisku enterprise. Assistance AI — platforma GenAI dla ok. 1 000 pracownikow — to moj najszybszy dowod dostawy: koncepcja do produkcji w 11 dni, nagroda Rzeczpospolitej Cyfrowej 2024. Oprocz tego CRA (centralny rejestr systemow IT w React.js), DevEx (dashboard metryk efektywnosci deweloperow) i panel testow automatycznych uzywany codziennie przez QA. Stack: React 18/19, TypeScript, REST API, Kotlin/Spring Boot na backendzie. Aktywnie pracuje z MUI v9 i Zustand.',
      '',
      'Poza kodowaniem prowadze onboarding i szkolenia z AI dla zespolow PZU — potrafia przekazywac wiedze tak, zeby zostawala. Na stanowisku Senior wychodze ponad "dostarczam feature" — dbam o to, zeby kolejni programisci nie przeklinali kodu, ktory po sobie zostawiam.',
      '',
      'Chetnie omowie szczegoly. Moj okres wypowiedzenia to 3 miesiace.',
      '',
      'Z powazaniem,',
      'Mateusz Markowski',
      'kozlowski.mateusz.praca@gmail.com',
      'https://www.linkedin.com/in/mateusz-kozlowski-2b576114b',
      '',
      'Oferta: https://theprotocol.it/praca/senior-react-developer---senior-frontend-developer-warszawa-powazkowska-44c,oferta,a68b0000-d467-42c7-73dc-08de32bfd60d'
    ].join('\n')
  },
  {
    to: 'anna.sudol@youriteams.com',
    subject: 'Aplikacja: React Developer (MUI 9 migration) — Mateusz Markowski',
    text: [
      'Szanowna Pani Anno,',
      '',
      'Rzadko zdarza sie, zeby ogloszenie trafalo tak precyzyjnie w projekt, ktorym aktualnie zyje na co dzien. Wasza oferta na React Developer (MUI 9 migration) to wlasnie taki przypadek.',
      '',
      'W tej chwili rozwijam aplikacje webowa zbudowana na React 19, TypeScript i Material UI v9 — sam stack i ta sama wersja biblioteki. Mam bezposrednie, produkcyjne doswiadczenie z MUI v9: system komponentow, theming, breakpointy, integracja z Tailwind CSS. W PZU zbudowalem i przez lata utrzymywalem kilka systemow React, w tym CRA (centralny rejestr systemow IT) i Assistance AI — platforme GenAI dla ok. 1 000 pracownikow wyroznioma nagroda Rzeczpospolitej Cyfrowej 2024.',
      '',
      'Rozumiem, ze migracja biblioteki komponentow to nie tylko zmiana importow — to tez praca z breaking changes, utrzymanie spojnosci designu i minimalizacja regresji. Mam doswiadczenie wlasnie w takim rodzaju refactoringu w srodowiskach produkcyjnych.',
      '',
      'Chetnie porozmawiam o projekcie. Moj okres wypowiedzenia to 3 miesiace.',
      '',
      'Z powazaniem,',
      'Mateusz Markowski',
      'kozlowski.mateusz.praca@gmail.com',
      'https://www.linkedin.com/in/mateusz-kozlowski-2b576114b',
      '',
      'Oferta: https://theprotocol.it/szczegoly/praca/react-developer-mui-9-migration-warszawa,oferta,cb780000-1098-7a89-51f6-08dea506e90b'
    ].join('\n')
  }
];

async function sendAll() {
  const results = [];
  for (const email of emails) {
    try {
      const info = await transporter.sendMail({
        from: `"${SENDER_NAME}" <${SENDER_ACCOUNT}>`,
        to: email.to,
        replyTo: REPLY_TO,
        subject: email.subject,
        text: email.text
      });
      results.push({ to: email.to, status: 'SENT', messageId: info.messageId });
      console.log('OK:', email.to, info.messageId);
    } catch (err) {
      results.push({ to: email.to, status: 'ERROR', error: err.message });
      console.log('ERR:', email.to, err.message);
    }
  }
  return results;
}

sendAll()
  .then(r => { console.log('\nSUMMARY:', JSON.stringify(r)); })
  .catch(err => { console.error('FATAL:', err.message); process.exit(1); });
