# Plan projektu „auto-scout" — agent szukający samochodów

> Dokument jest samowystarczalny: opisuje wszystko, co potrzebne do zbudowania projektu
> od zera w nowym, pustym repozytorium. Na końcu znajduje się opcjonalna sekcja
> z gotowym kodem do skopiowania z innego projektu — ale można ją pominąć.

## 1. Cel projektu

Agent (orkiestrator + subagenci Claude Code), który **codziennie rano**:

1. przeszukuje kilka portali z ogłoszeniami samochodowymi według kryteriów użytkownika,
2. zapisuje znaleziska do lokalnej bazy SQLite (ze statusami i datami),
3. dla obiecujących ofert pobiera VIN, numer rejestracyjny i datę pierwszej rejestracji,
   po czym sprawdza **historię pojazdu na historiapojazdu.gov.pl**,
4. wykrywa duplikaty i wznowione ogłoszenia,
5. ocenia każdą ofertę w skali 0–100 (w tym pobieżną analizę zdjęć pod kątem rys i uszkodzeń),
6. wysyła e-mail z **TOP 5** ofert + informacją „masz jeszcze X ofert z oceną >70%",
   wymieniając przy każdym aucie **wszystkie wykryte wady**
   (np. „historia gov czysta, ale na zdjęciach widoczna rysa na tylnym zderzaku").

Zasady nadrzędne:

- **Kryteria wyszukiwania są łatwo edytowalne** — jeden plik `config/kryteria.json`,
  nigdy zahardkodowane w skryptach.
- Agent **może sam poluzować kryteria**, gdy brakuje ofert, ale **tylko informując
  o tym użytkownika w mailu** — nigdy nie nadpisuje configu użytkownika.
- Praca **oszczędna tokenowo** (miękki wymóg): cała mechanika w deterministycznych
  skryptach Node, LLM tylko orkiestruje, ocenia opisy i ogląda zdjęcia finalistów.
- Użytkownik obsługuje agenta **z telefonu** (Claude Code na webie + codzienny
  harmonogram); **testy robione na komputerze**, bo Playwright w środowisku
  zdalnym bywa zawodny.

## 2. Struktura repozytorium

```
auto-scout/
├── README.md                      # instrukcja uruchomienia — patrz sekcja 3
├── CLAUDE.md                      # kontekst projektu dla Claude (stack, pliki, komendy)
├── config/
│   └── kryteria.json              # EDYTOWALNE kryteria wyszukiwania — patrz sekcja 4
├── .claude/
│   ├── settings.json              # Playwright MCP + permissions + hook (sekcja 10)
│   ├── hooks/
│   │   └── session-start.sh       # npm install w sesjach webowych
│   ├── agents/                    # SUBAGENCI — patrz sekcja 6
│   │   ├── scout-otomoto.md
│   │   ├── scout-olx.md
│   │   ├── scout-gratka.md
│   │   ├── scout-autoscout.md
│   │   ├── historia-pojazdu.md
│   │   └── inspektor-zdjec.md
│   └── commands/
│       ├── szukaj-aut.md          # ORKIESTRATOR — główny pipeline (sekcja 5)
│       └── raport-aut.md          # podgląd bazy / raport na żądanie
├── scripts/
│   ├── db.cjs                     # warstwa SQLite (better-sqlite3) — patrz sekcja 7
│   ├── scrape-otomoto.cjs         # deterministyczne scrapery per portal (sekcja 8)
│   ├── scrape-olx.cjs
│   ├── scrape-gratka.cjs
│   ├── scrape-autoscout.cjs
│   ├── historia-gov.cjs           # sprawdzenie historiapojazdu.gov.pl (sekcja 9)
│   ├── pobierz-zdjecia.cjs        # ściąga max 4–6 zdjęć finalisty, pomniejszone
│   ├── send-report.cjs            # e-mail HTML z TOP 5 (sekcja 11)
│   └── setup-session.cjs          # jednorazowy zapis sesji przeglądarki (sekcja 8)
├── data/                          # CAŁY katalog w .gitignore
│   ├── auta.db                    # baza SQLite
│   ├── zdjecia/                   # tymczasowe zdjęcia finalistów
│   └── raporty/                   # kopie raportów, gdy e-mail nie wyjdzie
├── .env.example                   # wzór zmiennych środowiskowych (sekcja 11)
├── .gitignore                     # data/, .env, .browser-session.json, node_modules
└── package.json                   # zależności: better-sqlite3, playwright, nodemailer, dotenv
```

## 3. README.md — instrukcja uruchomienia

README pełni podwójną rolę: krótko wyjaśnia, co robi projekt, i jest **sekwencyjną
checklistą, którą agent (Claude) wykonuje krok po kroku, żeby odpalić orkiestrator**.
Człowiek tylko czyta i podaje to, czego agent sam nie zdobędzie (hasła, decyzje).
Piszemy go prostym, przyjaznym językiem, krótkie zdania, bez żargonu.

Zawartość:

1. **Co to jest** — 2–3 zdania: agent, który codziennie szuka samochodów, sprawdza
   ich historię i wysyła maila z najlepszymi ofertami.
2. **Checklista uruchomienia** (agent wykonuje po kolei, każdy krok z opisem
   „co zobaczysz, gdy się uda" i „co zrobić, gdy się nie uda"):
   1. `npm install`
   2. Skopiuj `.env.example` do `.env`. Poproś użytkownika o adres Gmail oraz
      16-znakowe **hasło aplikacji** (generuje się je na
      https://myaccount.google.com/apppasswords — wymaga włączonej weryfikacji
      dwuetapowej). Wpisz oba do `.env`.
   3. `node scripts/setup-session.cjs` — otworzy się okno przeglądarki; użytkownik
      loguje się na portale (Otomoto/OLX), po zamknięciu okna sesja zapisze się sama.
      (Krok wykonalny tylko na komputerze — w sesji webowej pomiń i zaznacz to użytkownikowi.)
   4. Otwórz `config/kryteria.json` i zapytaj użytkownika o kryteria auta
      (budżet, marka/model, rocznik, przebieg, paliwo, skrzynia, lokalizacja + promień).
      Wpisz odpowiedzi do pliku.
   5. Test: `node scripts/scrape-otomoto.cjs --limit 5`, potem
      `node scripts/db.cjs --stats` — sprawdź, czy oferty trafiły do bazy.
   6. Uruchom komendę `/szukaj-aut` — pełny pipeline zakończony e-mailem.
   7. Zaproponuj użytkownikowi ustawienie codziennego harmonogramu (sekcja 12).

## 4. Kryteria wyszukiwania — `config/kryteria.json`

Jedyne źródło prawdy o tym, czego szukamy. Przykładowa zawartość startowa
(użytkownik podmienia wartości na swoje — przy pierwszym uruchomieniu agent
pyta o nie zgodnie z README):

```json
{
  "marki_modele": [
    { "marka": "Toyota", "model": "Corolla" },
    { "marka": "Mazda", "model": "3" }
  ],
  "budzet_pln": { "min": 25000, "max": 45000 },
  "rocznik_min": 2015,
  "przebieg_max_km": 180000,
  "paliwo": ["benzyna", "hybryda"],
  "skrzynia": "dowolna",
  "lokalizacja": { "miasto": "Warszawa", "promien_km": 150 },
  "wyklucz": { "uszkodzone": true, "anglik": true, "po_taxi": true },

  "prog_wysylki": 70,
  "top_n_w_mailu": 5,
  "max_nowych_ofert_dziennie": 20,

  "wagi_scoringu": {
    "cena_vs_rynek": 20,
    "historia_gov": 25,
    "przebieg": 15,
    "zgodnosc_z_kryteriami": 15,
    "zdjecia": 15,
    "rocznik_wyposazenie": 10
  },

  "drabinka_luzowania": [
    { "opis": "budżet +10%", "budzet_mnoznik": 1.10 },
    { "opis": "przebieg +20 tys. km", "przebieg_plus_km": 20000 },
    { "opis": "rocznik -2 lata", "rocznik_minus": 2 }
  ]
}
```

Zasada luzowania: jeśli po scoringu jest **mniej niż 5 ofert nad progiem**, agent
stosuje kolejne szczeble drabinki (w pamięci, na czas jednego przebiegu) i **wyraźnie
oznacza w mailu**, które wyniki pochodzą z poluzowanych kryteriów oraz który szczebel
zastosowano. Plik `kryteria.json` pozostaje nietknięty.

## 5. Pipeline dzienny — orkiestrator `/szukaj-aut`

Komenda `.claude/commands/szukaj-aut.md` (prosty plik markdown z instrukcją po polsku,
placeholder `$ARGUMENTS` na końcu). Kroki:

1. **Wczytaj** `config/kryteria.json`.
2. **Scouci równolegle** — uruchom po jednym subagencie na portal (sekcja 6).
   Każdy scout odpala swój deterministyczny skrypt `scrape-*.cjs`; LLM tylko nadzoruje
   wynik i naprawia, gdy portal zmieni strukturę strony. Nowe oferty lądują w SQLite.
3. **Uzupełnienie danych** — dla nowych ofert scout dociąga ze strony ogłoszenia:
   VIN, numer rejestracyjny, datę pierwszej rejestracji, pełny opis, listę adresów zdjęć.
4. **Weryfikacja publikacji i duplikaty** (przed scoringiem, w `db.cjs`):
   - dopasowanie po **VIN** — ten sam VIN pod innym URL/portalem = duplikat pewny;
   - dopasowanie przybliżone bez VIN: marka + model + rocznik + przebieg (± tolerancja)
     + moc + kolor + lokalizacja; pomocniczo porównanie hashów miniatur zdjęć;
   - porównanie `data_publikacji` z `data_znalezienia` i z wcześniejszymi wpisami —
     wykrywa ogłoszenia **wznowione/odświeżone**, które udają świeże;
   - duplikat **nie jest po cichu odrzucany** — w mailu przy ofercie pojawia się
     ostrzeżenie: „⚠ to może być duplikat ogłoszenia [link], pierwotnie opublikowanego
     DD.MM (portal X, cena wtedy Y zł)" — różnica cen między duplikatami to argument
     negocjacyjny.
5. **Subagent `historia-pojazdu`** — dla ofert z kompletem danych sprawdza
   historiapojazdu.gov.pl (sekcja 9). Brak kompletu danych → flaga
   `historia_niezweryfikowana` i obniżony sufit oceny (np. max 75/100).
   Auta z zagranicy niezarejestrowane w PL → flaga `import_bez_historii_pl`.
6. **Scoring 0–100** według wag z configu (deterministycznie w skrypcie; LLM może
   skorygować ±10 pkt na podstawie treści opisu — np. „pilne, wyjazd" to sygnał
   negocjacyjny, „garażowany, serwisowany w ASO" to plus).
7. **Subagent `inspektor-zdjec`** — tylko dla finalistów (wynik >70 przed zdjęciami):
   `pobierz-zdjecia.cjs` ściąga max 4–6 zdjęć (pomniejszonych), Claude ogląda je
   **pobieżnie** — szuka czerwonych flag: rysy, wgniecenia, rdza, różnice odcienia
   lakieru (ślad po lakierowaniu), stan wnętrza niespójny z deklarowanym przebiegiem,
   brakujące elementy. Nie robi głębokiej analizy. Koryguje ocenę i dopisuje wady do bazy.
8. **E-mail TOP 5** — `send-report.cjs` (sekcja 11).
9. **Aktualizacja statusów** w bazie (wysłane → `wyslana`), zapis logu przebiegu.

Zabezpieczenia orkiestratora (sekcja „czego NIE robić" w komendzie):

- nie uruchamiaj scraperów drugi raz w tym samym przebiegu,
- nie przetwarzaj w pełni więcej niż `max_nowych_ofert_dziennie` (reszta czeka w bazie
  na kolejny dzień),
- zawsze wyślij raport, nawet jeśli 0 nowych ofert (krótszy mail: „nic nowego,
  w bazie czeka X ofert"),
- nigdy nie modyfikuj `config/kryteria.json`,
- każdy subagent, do którego delegujesz, musi istnieć jako plik w `.claude/agents/`.

## 6. Subagenci — `.claude/agents/*.md`

Każdy subagent to plik markdown z frontmatterem YAML. Scouci działają na tańszym
modelu (oszczędność tokenów). Wzór frontmatteru:

```markdown
---
name: scout-otomoto
description: Szuka ofert samochodów na Otomoto wg config/kryteria.json i zapisuje do bazy
tools: Bash, Read, Grep
model: haiku
---

Jesteś scoutem portalu Otomoto. Twoje zadanie:
1. Uruchom `node scripts/scrape-otomoto.cjs` (kryteria czyta sam z config/kryteria.json).
2. Sprawdź kod wyjścia i podsumowanie (ile nowych ofert, ile błędów).
3. Jeśli skrypt zgłasza, że selektory nie pasują (portal zmienił układ strony),
   obejrzyj zapisany przez skrypt zrzut HTML w data/debug/ i zaproponuj poprawkę selektorów.
4. Zwróć orkiestratorowi TYLKO podsumowanie: liczba nowych ofert, liczba duplikatów,
   błędy. Nie wklejaj treści ogłoszeń.
```

Lista subagentów:

| Plik | Model | Rola |
|---|---|---|
| `scout-otomoto.md` | haiku | Otomoto — najlepsze źródło (często podany VIN) |
| `scout-olx.md` | haiku | OLX Motoryzacja — dużo ofert prywatnych, VIN rzadko |
| `scout-gratka.md` | haiku | Gratka/Autoplac — oferty spoza Otomoto |
| `scout-autoscout.md` | haiku | AutoScout24/mobile.de — import; flaga `import_bez_historii_pl` |
| `historia-pojazdu.md` | domyślny | weryfikacja na historiapojazdu.gov.pl (Playwright) |
| `inspektor-zdjec.md` | domyślny | pobieżna ocena zdjęć finalistów (multimodalna) |

Orkiestrator działa na modelu domyślnym sesji.

## 7. Baza danych — SQLite (`data/auta.db`, warstwa `scripts/db.cjs`)

Zależność: `better-sqlite3`. Schemat:

```sql
CREATE TABLE oferty (
  id INTEGER PRIMARY KEY,
  vin TEXT,                        -- może być NULL (nie każde ogłoszenie podaje)
  url TEXT UNIQUE NOT NULL,
  portal TEXT NOT NULL,            -- otomoto | olx | gratka | autoscout
  marka TEXT, model TEXT, rocznik INTEGER,
  przebieg_km INTEGER, cena_pln INTEGER,
  paliwo TEXT, skrzynia TEXT, moc_km INTEGER, kolor TEXT,
  lokalizacja TEXT,
  nr_rejestracyjny TEXT,           -- do sprawdzenia historii gov
  data_pierwszej_rejestracji TEXT, -- do sprawdzenia historii gov
  opis TEXT,
  zdjecia_urls TEXT,               -- JSON array

  -- cykl życia
  status TEXT NOT NULL DEFAULT 'nowa',
    -- nowa -> oceniona -> wyslana | odrzucona | wygasla | duplikat
  data_znalezienia TEXT NOT NULL,      -- kiedy agent pierwszy raz zobaczył ofertę
  data_publikacji TEXT,                -- deklarowana przez portal
  data_ostatniego_sprawdzenia TEXT,
  data_zmiany_statusu TEXT,

  -- ocena
  ocena INTEGER,                   -- 0-100
  ocena_szczegoly TEXT,            -- JSON: punkty per kategoria
  wady TEXT,                       -- JSON array: wszystkie wykryte wady
  zalety TEXT,                     -- JSON array

  -- flagi
  historia_niezweryfikowana INTEGER DEFAULT 0,
  import_bez_historii_pl INTEGER DEFAULT 0,
  z_poluzowanych_kryteriow TEXT,   -- NULL albo opis szczebla drabinki

  -- historia gov (JSON: wypadki, przebiegi z badań, właściciele, kradzież, badanie)
  historia_gov TEXT,
  duplikat_oferty_id INTEGER REFERENCES oferty(id)
);

CREATE TABLE ceny (                -- historia zmian ceny
  id INTEGER PRIMARY KEY,
  oferta_id INTEGER NOT NULL REFERENCES oferty(id),
  cena_pln INTEGER NOT NULL,
  data TEXT NOT NULL
);

CREATE TABLE przebiegi_agenta (    -- log dziennych uruchomień
  id INTEGER PRIMARY KEY,
  data TEXT NOT NULL,
  nowych_ofert INTEGER, duplikatow INTEGER, wyslanych INTEGER,
  bledy TEXT,                      -- JSON
  poluzowano_kryteria TEXT         -- NULL albo opis
);

CREATE INDEX idx_oferty_vin ON oferty(vin);
CREATE INDEX idx_oferty_status ON oferty(status);
```

Reguły:

- **Dedup przy insercie**: najpierw po VIN, potem po URL, potem dopasowanie przybliżone
  (sekcja 5 pkt 4). Duplikat dostaje `status='duplikat'` i `duplikat_oferty_id`.
- Raz wysłana oferta (`wyslana`) **nie wraca** w kolejnych mailach — chyba że spadła
  cena (nowy wpis w `ceny`), wtedy trafia do osobnej sekcji maila „Spadek ceny".
- Oferta, której nie ma już na portalu przy ponownym sprawdzeniu → `wygasla`.
- `node scripts/db.cjs --stats` wypisuje podsumowanie bazy (do testów i README).

## 8. Scrapery — `scripts/scrape-*.cjs`

Wzorzec wspólny dla wszystkich portali:

- **Playwright** (pakiet `playwright`, nie MCP): `chromium.launch({ headless: true })`
  z argumentami anty-detekcyjnymi (`--disable-blink-features=AutomationControlled`),
  realistyczny User-Agent.
- **Sesja**: `browser.newContext({ storageState: 'data/.browser-session.json' })` —
  plik tworzy jednorazowo `setup-session.cjs`: otwiera przeglądarkę **headed**,
  użytkownik loguje się ręcznie na portale, skrypt zapisuje `context.storageState()`.
  Plik jest w `.gitignore`.
- **Mapa selektorów per portal** w jednym miejscu na górze pliku (łatwa naprawa,
  gdy portal zmieni layout). Gdy selektory nic nie znajdą → zapisz HTML strony do
  `data/debug/{portal}-{data}.html` i zakończ kodem błędu z czytelnym komunikatem —
  scout to zobaczy i zaproponuje poprawkę.
- **Fallback bez przeglądarki**: Otomoto i OLX to aplikacje Next.js — strona zawiera
  `<script id="__NEXT_DATA__">` z pełnym JSON-em ofert. Gdy Playwright zawiedzie
  (np. w środowisku zdalnym), scraper robi zwykły `fetch` HTML i parsuje
  `__NEXT_DATA__` / JSON-LD. Dzięki temu pipeline działa nawet bez przeglądarki.
- Wejście: kryteria z `config/kryteria.json` (budowa URL-a wyszukiwarki portalu).
  Wyjście: upsert do bazy przez `db.cjs` + podsumowanie na stdout
  (`{ nowe: 12, duplikaty: 3, bledy: 0 }`).
- Flagi CLI: `--limit N` (do testów), `--details <url>` (dociągnięcie szczegółów
  jednej oferty: VIN, rejestracja, opis, zdjęcia).

## 9. Historia pojazdu — `scripts/historia-gov.cjs`

Serwis **historiapojazdu.gov.pl** nie ma publicznego API — sprawdzamy przez Playwright.
Formularz wymaga **trzech** danych: numer rejestracyjny + VIN + data pierwszej
rejestracji. Wszystkie trzy bywają w ogłoszeniach Otomoto (VIN czasem za przyciskiem
„Wyświetl VIN" — scraper klika go w trybie `--details`).

Skrypt: `node scripts/historia-gov.cjs --oferta <id>` →

1. bierze dane z bazy, wypełnia formularz gov, czyta raport;
2. zapisuje do `oferty.historia_gov` (JSON): szkody/wypadki odnotowane, lista przebiegów
   z badań technicznych (**wykrycie cofniętego licznika**: przebieg z ogłoszenia niższy
   niż ostatni z badania), liczba właścicieli, status badania technicznego, adnotacja
   o kradzieży;
3. przy braku danych/captchy/blokadzie: ustawia `historia_niezweryfikowana=1`
   i **nie blokuje pipeline'u** — oferta dalej może trafić do maila, z wyraźną
   adnotacją „historia niezweryfikowana".

Auta z AutoScout24/mobile.de niezarejestrowane w Polsce nie mają historii w gov —
flaga `import_bez_historii_pl`, adnotacja w mailu.

## 10. Konfiguracja Claude Code — `.claude/settings.json` i hook

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest", "--browser", "chromium", "--headless"]
    }
  },
  "enableAllProjectMcpServers": true,
  "permissions": {
    "allow": [
      "Bash(node scripts/*)",
      "Bash(npm install)", "Bash(npm run *)",
      "Bash(git status)", "Bash(git log *)", "Bash(git diff *)",
      "Bash(ls *)", "Bash(cat *)", "Bash(grep *)", "Bash(head *)", "Bash(tail *)"
    ]
  },
  "hooks": {
    "SessionStart": [
      { "hooks": [{ "type": "command", "command": ".claude/hooks/session-start.sh" }] }
    ]
  }
}
```

`session-start.sh`: gdy `CLAUDE_CODE_REMOTE == "true"` (sesja webowa) → `npm install`;
lokalnie nic nie robi. Uwaga na środowisko webowe: Chromium bywa preinstalowany
(zmienna `PLAYWRIGHT_BROWSERS_PATH`) — hook nie powinien pobierać przeglądarki od nowa.

## 11. E-mail — `scripts/send-report.cjs`

Wysyłka przez **Gmail SMTP** (nodemailer):

```js
nodemailer.createTransport({
  host: 'smtp.gmail.com', port: 465, secure: true,
  auth: { user: process.env.GOOGLE_EMAIL, pass: process.env.GMAIL_SMTP_APP_PASSWORD }
})
```

`.env.example`:

```
GOOGLE_EMAIL=twoj@gmail.com
GMAIL_SMTP_APP_PASSWORD=xxxxxxxxxxxxxxxx   # 16 znaków, https://myaccount.google.com/apppasswords
NOTIFICATION_EMAIL=twoj@gmail.com          # adresat raportów (domyślnie ten sam)
```

Treść maila (HTML, czytelny na telefonie — jedna kolumna):

1. Nagłówek: data, liczba nowych ofert, ewentualna adnotacja o poluzowaniu kryteriów.
2. **TOP 5 kart** — każda: zdjęcie, marka/model/rocznik/przebieg/cena, **ocena X/100**,
   link do ogłoszenia, status historii (✅ czysta / ⚠ niezweryfikowana / ❌ szkody),
   **zalety** i **WSZYSTKIE wykryte wady** (z opisu, z historii gov, ze zdjęć —
   np. „historia gov czysta, ale na zdjęciach rysa na tylnym zderzaku"),
   ewentualne ostrzeżenie o duplikacie (sekcja 5 pkt 4).
3. Sekcja „Spadki cen" (jeśli są).
4. Stopka: „**masz jeszcze X ofert z oceną >70%** — odpisz /raport-aut, żeby je zobaczyć".

Fallback: gdy SMTP jest zablokowany (zdarza się w środowiskach zdalnych) → raport
zapisywany do `data/raporty/{data}.md`, commit do repo, wyraźna informacja w sesji.

## 12. Harmonogram — codziennie rano

Docelowo: **Routine w Claude Code na webie** (cron, np. `0 7 * * *`), która codziennie
uruchamia sesję z komendą `/szukaj-aut`. Alternatywa na komputerze: systemowy cron /
Harmonogram zadań Windows odpalający `claude -p "/szukaj-aut"`.
Harmonogram ustawiamy dopiero po udanych testach ręcznych (etap 4).

## 13. Oszczędność tokenów (miękki wymóg)

- Scraping, dedup, scoring bazowy, e-mail = deterministyczne skrypty `.cjs`;
  LLM nie czyta surowego HTML ani pełnych list ofert.
- Scouci na modelu **haiku**; zwracają orkiestratorowi tylko liczbowe podsumowania.
- Zdjęcia: wyłącznie finaliści (>70 pkt), max 4–6 zdjęć, pomniejszone przed odczytem.
- Limit `max_nowych_ofert_dziennie` (domyślnie 20) — nadmiar czeka w bazie.

## 14. Etapy implementacji

1. **Etap 1 — MVP (test na komputerze):** szkielet repo, `kryteria.json`, `db.cjs`,
   `scrape-otomoto.cjs`, scoring, `send-report.cjs` — pełny przepływ E2E na jednym portalu.
2. **Etap 2:** `historia-gov.cjs` + subagent `historia-pojazdu`; pozostałe portale
   i ich scouci; wykrywanie duplikatów przybliżonych.
3. **Etap 3:** `inspektor-zdjec` + korekta ocen na podstawie zdjęć.
4. **Etap 4:** Routine „codziennie rano" + hardening (retry, fallbacki, obsługa
   wygasania ofert, sekcja spadków cen).

Po każdym etapie: test ręczny na komputerze (`/szukaj-aut` + sprawdzenie maila i bazy).

## 15. Do uzupełnienia przez użytkownika

- [ ] **Kryteria startowe** w `config/kryteria.json` (marka/model, budżet, rocznik,
      przebieg, paliwo, lokalizacja) — wartości w sekcji 4 są przykładowe.
- [ ] Nazwa repozytorium (propozycja: `auto-scout`).
- [ ] Adres Gmail + hasło aplikacji do `.env`.

## 16. (Opcjonalnie) gotowy kod do skopiowania z projektu cv-app

Jeśli masz dostęp do repozytorium `gronkil/cv-app`, poniższe pliki są sprawdzonymi
wzorcami — można je skopiować i przerobić zamiast pisać od zera. Ta sekcja jest
opcjonalna; wszystko, co niezbędne, opisano wyżej.

| Skąd (cv-app) | Do czego w auto-scout |
|---|---|
| `scripts/znajdz-top3.cjs` | wzorzec scrapera Playwright: anty-detekcja, storageState, mapa selektorów per portal, scoring, dedup, mail HTML |
| `scripts/send-pipeline-report.cjs` | wzorzec raportu HTML wysyłanego nodemailerem |
| `scripts/setup-google-session.cjs` | wzorzec `setup-session.cjs` (headed login → zapis storageState) |
| `scripts/portal-parsers.cjs` | wzorzec parsera DOM jednej strony portalu |
| `.claude/settings.json` | wzorzec konfiguracji MCP Playwright + permissions + hook |
| `.claude/hooks/session-start.sh` | wzorzec hooka instalującego zależności w sesji webowej |
| `.claude/commands/pipeline-pracy.md` | wzorzec orkiestratora (kroki + sekcja „czego NIE robić") |

Znane słabości cv-app, których **nie** kopiujemy: kryteria zahardkodowane w skrypcie
(u nas: `config/kryteria.json`), orkiestrator delegujący do nieistniejących plików
(u nas: wszyscy subagenci istnieją od pierwszego commita), brak zapisanego fallbacku
gdy SMTP/przeglądarka zawiodą (u nas: sekcje 8 i 11).
