const nodemailer = require('nodemailer');

const USER_EMAIL = process.env.CLAUDE_CODE_USER_EMAIL || 'fargonmk@gmail.com';
const PASS = process.env.GOOGLE_PASSWORD;

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

const body = `PIPELINE PRACY — 2026-06-17
Przeszukano 9 portali, znaleziono 35 ofert, wybrano TOP 3.

==================================================
TOP 3 OFERTY — WYŚLIJ COVER LETTER RĘCZNIE
==================================================

--- OFERTA #1 ---
Firma:     Odylion
Stanowisko: Fullstack Developer & Vibe Coder (AI + Automatyzacje)
Wynik:     82/100 pkt
Link:      https://www.pracuj.pl/praca/fullstack-developer-vibe-coder-ai-+-automatyzacje-warszawa-syta-114z,oferta,1004266129
Email HR:  hello@odylion.com
Wynagrodzenie: brak danych
Remote:    remote/hybrid

COVER LETTER (wyslij na hello@odylion.com):
---
Szanowna Rekrutacja,

W Assistance AI — platformie GenAI dla ok. 1 000 pracownikow PZU — spedzilam zaledwie 11 dni od koncepcji do wdrozenia produkcyjnego. Ten projekt wyrozniomy nagroda Rzeczpospolitej Cyfrowej 2024 to dla mnie najlepsza ilustracja tego, czym jest vibe coding: szybkie budowanie realnej wartosci z wykorzystaniem AI jako kopilota.

W ciagu 7+ lat w PZU zbudowalem kilka krytycznych systemow od zera — CRA (centralny rejestr systemow IT), Dlug Technologiczny (scoring ryzyka dla repozytoriow Bitbucket), pipeline DevEx mierzacy efektywnosc deweloperow. Kazdy z nich to fullstack: React/TypeScript na froncie, Kotlin/Spring Boot na backendzie, integracje REST. Jako AI Ambassador PZU (od 05.2025) wspolksztaltuje strategie wdrazania AI w IT — buduje agenty, testuje skille do code review, ucze pracownikow jak faktycznie przyspieszyc prace z AI.

Wasza oferta trafia dokladnie w punkt. Chetnie porozmawiam o tym, jak moge wsprzec cyfrowa transformacje Odylion.

Z powazaniem,
Mateusz Markowski
kozlowski.mateusz.praca@gmail.com
https://www.linkedin.com/in/mateusz-kozlowski-2b576114b
---

--- OFERTA #2 ---
Firma:     Pivotal Polska
Stanowisko: Senior React Developer / Senior Frontend Developer
Wynik:     75/100 pkt
Link:      https://theprotocol.it/praca/senior-react-developer---senior-frontend-developer-warszawa-powazkowska-44c,oferta,a68b0000-d467-42c7-73dc-08de32bfd60d
Email HR:  rekrutacja@pivotal.pl
Strona:    https://www.pivotal.pl/kariera
Wynagrodzenie: brak danych
Remote:    remote

COVER LETTER (wyslij na rekrutacja@pivotal.pl):
---
Szanowna Rekrutacja,

Pivotal Polska to firma, o ktorej slyszam od lat jako o miejscu, gdzie architektura frontendu traktowana jest powazanie — nie jako ozdobnik, lecz fundament systemu. Wlasnie dlatego pisze bezposrednio na Wasz adres rekrutacyjny.

Przez 7+ lat w PZU zbudowalem kilka systemow React od zera i utrzymywalem je w srodowisku enterprise. Assistance AI — platforma GenAI dla ok. 1 000 pracownikow — to moj najszybszy dowod dostawy: koncepcja do produkcji w 11 dni, nagroda Rzeczpospolitej Cyfrowej 2024. Oprocz tego CRA (centralny rejestr systemow IT w React.js), DevEx (dashboard metryk efektywnosci deweloperow) i panel testow automatycznych uzywany codziennie przez QA. Stack: React 18/19, TypeScript, REST API, Kotlin/Spring Boot. Aktywnie pracuje z MUI v9 i Zustand.

Poza kodowaniem prowadze onboarding i szkolenia z AI dla zespolow PZU. Chetnie omowie szczegoly — moj okres wypowiedzenia to 3 miesiace.

Z powazaniem,
Mateusz Markowski
kozlowski.mateusz.praca@gmail.com
https://www.linkedin.com/in/mateusz-kozlowski-2b576114b
---

--- OFERTA #3 ---
Firma:     YOUR ITEAMS sp. z o.o.
Stanowisko: React Developer (MUI 9 migration)
Wynik:     65/100 pkt
Link:      https://theprotocol.it/szczegoly/praca/react-developer-mui-9-migration-warszawa,oferta,cb780000-1098-7a89-51f6-08dea506e90b
Email HR:  anna.sudol@youriteams.com  (Talent Acquisition Manager)
Wynagrodzenie: brak danych
Remote:    remote

COVER LETTER (wyslij na anna.sudol@youriteams.com):
---
Szanowna Pani Anno,

Rzadko zdarza sie, zeby ogloszenie trafalo tak precyzyjnie w projekt, ktorym aktualnie zyje na co dzien. Wasza oferta na React Developer (MUI 9 migration) to wlasnie taki przypadek.

W tej chwili rozwijam aplikacje webowa zbudowana na React 19, TypeScript i Material UI v9 — sam stack i ta sama wersja biblioteki. Mam bezposrednie, produkcyjne doswiadczenie z MUI v9: system komponentow, theming, breakpointy, integracja z Tailwind CSS. W PZU zbudowalem i przez lata utrzymywalem kilka systemow React, w tym CRA i Assistance AI — platforme GenAI dla ok. 1 000 pracownikow wyroznioma nagroda Rzeczpospolitej Cyfrowej 2024.

Rozumiem, ze migracja biblioteki komponentow to nie tylko zmiana importow. Moj okres wypowiedzenia to 3 miesiace.

Z powazaniem,
Mateusz Markowski
kozlowski.mateusz.praca@gmail.com
https://www.linkedin.com/in/mateusz-kozlowski-2b576114b
---

==================================================
WARTO ROZWAZYC (kolejna runda)
==================================================
4. Jit Team — Senior React/Fullstack (~78 pkt)
   https://justjoin.it/job-offer/jit-team-senior-react-fullstack-developer-warszawa-javascript

5. WeNet — Fullstack AI Engineer (~75 pkt)
   https://www.pracuj.pl/praca/fullstack-ai-engineer-dzial-produktu-zespol-technologii-web-warszawa-postepu-14,oferta,1004763599

6. Pivotal Polska — Senior React Developer (~75 pkt) — juz w top 3

7. apreel — React Developer (~63 pkt, wymaga B2 angielski)
   https://solid.jobs/offer/31657/apreel-react-developer

==================================================
STATYSTYKI
==================================================
Portale: 9 (JustJoin, NoFluffJobs, Pracuj, LinkedIn, Bulldogjob, TheProtocol, Solid, RocketJobs, 4programmers)
Znaleziono lacznie: ~45 wynikow
Po deduplicacji/filtracji: 35
Cover lettery przygotowane: 3
Aplikacje przez Playwright: 0 (narzedzia niedostepne w tej sesji)
Emaile do HR wyslane: 0 (ZAKAZ — tylko powiadomienie do Ciebie)

Szczegoly w: applications/2026-06-17_*.md
`;

transporter.sendMail({
  from: `"Pipeline Pracy" <${USER_EMAIL}>`,
  to: USER_EMAIL,
  subject: '[Pipeline pracy 2026-06-17] Znalazlem 35 ofert — top 3 do przejrzenia',
  text: body
}, (err, info) => {
  if (err) {
    console.log('BLAD:', err.message);
    process.exit(1);
  } else {
    console.log('OK:', info.messageId);
  }
});
