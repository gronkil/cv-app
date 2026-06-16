Jesteś orkiestratorem procesu szukania i automatycznego aplikowania na pracę w imieniu Mateusza Markowskiego.

---

## KROK 0 — Setup MCP + wczytaj dane

### 0A — Skonfiguruj Playwright MCP (jeśli brak)

Sprawdź czy `.mcp.json` istnieje i zawiera konfigurację Playwright:

```bash
cat .mcp.json 2>/dev/null || echo "BRAK"
```

Jeśli brak lub nie ma sekcji `playwright` → utwórz plik `.mcp.json`:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "playwright-mcp",
      "args": [
        "--browser", "chromium",
        "--executable-path", "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
        "--headless",
        "--ignore-https-errors"
      ]
    }
  }
}
```

Sprawdź też `settings.json` czy ma `"enableAllProjectMcpServers": true`:
```bash
cat .claude/settings.json
```
Jeśli nie ma → dodaj tę właściwość do pliku.

Następnie sprawdź czy `playwright-mcp` jest zainstalowany:
```bash
which playwright-mcp || npm install -g @playwright/mcp@latest
```

Po konfiguracji przetestuj MCP — spróbuj wykonać `browser_snapshot`. Jeśli błąd "tool not found" → napisz:
> ⚠️ Playwright MCP wymaga restartu sesji Claude po pierwszej konfiguracji. Pliki `.mcp.json` zostały utworzone — zrestartuj sesję i uruchom pipeline ponownie.
> Kontynuuję bez Playwright (aplikacje będą oznaczone jako manual).

### 0B — Wczytaj dane kandydata

Wykonaj równolegle:

**A) Dane kandydata:**
- `src/data/defaultCv.ts` → skille (level 4-5), stack, summary, email
- `.claude/user-profile.json` → oczekiwania finansowe, noticePeriod (jeśli plik nie istnieje → przyjmij: min. 21 000 PLN brutto, notice period nieznany)
- `applications/applied-jobs.json` → lista URLi już zaaplikowanych (jeśli nie istnieje → utwórz: `{"applied":[]}`)

**B) Hasło Google:**
Sprawdź w tej kolejności:
1. Zmienna środowiskowa: `echo $GOOGLE_PASSWORD`
2. Plik: `.env` (szukaj linii `GOOGLE_PASSWORD=...`)
3. `.claude/user-profile.json` → pole `googlePassword`

Jeśli hasło znalezione → zapisz jako `GOOGLE_PASS` do użycia w Kroku 4.
Jeśli nie znaleziono → kontynuuj pipeline, aplikacje będą oznaczone jako "manual" (bez auto-logowania).

**C) Weryfikuj Playwright MCP:**
Spróbuj `browser_snapshot` — jeśli błąd "tool not found" → napisz użytkownikowi:
> ⚠️ Playwright MCP niedostępny. Sprawdź `.mcp.json` i zrestartuj sesję.
Kontynuuj mimo to (aplikacje będą manual).

Przygotuj `CV_SUMMARY`:
> "Senior Fullstack Developer, 7+ lat (PZU od 2017). Stack: React/TypeScript/JavaScript (lv5), Kotlin/Spring Boot (lv4-5), REST API (lv5), Prompt Engineering/GPT-4/Claude/GenAI API (lv5), SQL (lv4), CI/CD (lv4). Projekt: Assistance AI — GenAI dla 1000 pracowników PZU, 11 dni realizacji, nagroda Rzeczpospolitej Cyfrowej 2024. AI Ambassador PZU od 05.2025. Lokalizacja: Warszawa. Oczekiwania: [z user-profile / 21k PLN brutto]. Remote/hybrid."

---

## KROK 1 — Równoległe szukanie (9 sub-agentów jednocześnie)

Uruchom **wszystkich 9 agentów jednocześnie** (Agent tool). Każdemu przekaż: CV_SUMMARY + przypisany portal + lista URLi do pominięcia z `applied-jobs.json`.

Format odpowiedzi każdego agenta: JSON array, max 5 ofert:
```json
[{"url":"...","company":"...","role":"...","salary":"...","remote":true,"skills_match":["..."]}]
```

### Agent 1 — JustJoin.it
WebSearch: `"React TypeScript senior Warszawa site:justjoin.it"`, `"Kotlin Spring Warszawa site:justjoin.it"`, `"AI fullstack developer Warszawa site:justjoin.it"`, `"senior fullstack remote site:justjoin.it"`

### Agent 2 — NoFluffJobs
WebSearch: `"fullstack warszawa react site:nofluffjobs.com"`, `"senior react typescript site:nofluffjobs.com"`, `"kotlin spring warszawa site:nofluffjobs.com"`
Jeśli portal niedostępny → użyj JustJoin.it jako fallback.

### Agent 3 — Pracuj.pl
WebSearch: `"programista fullstack warszawa react site:pracuj.pl"`, `"senior react developer warszawa site:pracuj.pl"`, `"fullstack AI developer warszawa site:pracuj.pl"`

### Agent 4 — LinkedIn Jobs
WebSearch: `"senior fullstack developer warsaw react typescript site:linkedin.com/jobs"`, `"kotlin spring developer warsaw site:linkedin.com/jobs"`, `"AI developer fullstack warsaw remote site:linkedin.com/jobs"`

### Agent 5 — Bulldogjob.pl
WebSearch: `"fullstack developer react typescript site:bulldogjob.pl"`, `"senior developer warszawa kotlin site:bulldogjob.pl"`, `"senior fullstack remote site:bulldogjob.pl"`

### Agent 6 — TheProtocol.it
WebSearch: `"fullstack developer warszawa site:theprotocol.it"`, `"senior react warszawa site:theprotocol.it"`, `"kotlin spring developer warszawa site:theprotocol.it"`

### Agent 7 — Solid.jobs
WebSearch: `"fullstack warszawa site:solid.jobs"`, `"senior react developer warszawa site:solid.jobs"`, `"kotlin developer remote site:solid.jobs"`

### Agent 8 — RocketJobs.pl
WebSearch: `"fullstack developer warszawa site:rocketjobs.pl"`, `"senior react developer remote site:rocketjobs.pl"`

### Agent 9 — 4programmers.net
WebSearch: `"react typescript warszawa site:4programmers.net"`, `"fullstack senior developer site:4programmers.net"`, `"kotlin developer warszawa site:4programmers.net"`

---

## KROK 2 — Deduplikacja i ranking

1. Połącz wszystkie listy
2. Usuń duplikaty (ten sam URL lub firma+stanowisko)
3. Usuń URLe z `applied-jobs.json`
4. Oceń każdą ofertę (0–100 pkt):
   - **40 pkt** — pokrycie skillów must-have (ile z wymaganych tech Mateusz ma na lv4-5)
   - **20 pkt** — seniority fit (rola Senior/Lead = 20, Mid = 10, Junior = 0)
   - **20 pkt** — wynagrodzenie (≥21k PLN brutto = 20, 15–21k = 10, nieznane = 10, <15k = 0)
   - **10 pkt** — AI/GenAI w ofercie (jeśli tak → +10 za nagrodę Rzeczpospolitej Cyfrowej)
   - **10 pkt** — remote/hybrid (remote = 10, hybrid = 7, on-site = 0)
5. Wybierz TOP 3 (najwyższy wynik)

---

## KROK 3 — Dla każdej z TOP 3 ofert: pobierz szczegóły

Dla każdej oferty z TOP 3 uruchom osobny Agent (równolegle):
- WebFetch URL oferty → wymagania, email HR, URL formularza/przycisku Apply
- Zidentyfikuj: jaki portal (JustJoin / RocketJobs / Pracuj / TheProtocol / inne)
- Zwróć: `{portal, company, role, requirements, hr_email, apply_url, apply_method}`

---

## KROK 4 — Automatyczne logowanie Google i aplikowanie

Dla każdej z TOP 3 ofert wykonaj poniższy proces:

### 4a. Napisz cover letter

3 akapity, max 180 słów, spersonalizowany (nie generyczny):
- **Akapit 1:** Dlaczego ta konkretna firma/rola — nawiąż do czegoś specyficznego z ogłoszenia
- **Akapit 2:** 2-3 konkretne osiągnięcia z CV pasujące do wymagań (z liczbami: 7+ lat, 1000 użytkowników, 11 dni, ~60% skrócenie czasu konfiguracji)
- **Akapit 3:** Call to action + dostępność
- Podpisz: `Mateusz Markowski`
- Jeśli oferta po angielsku → pisz po angielsku

### 4b. Zaloguj się przez Google

**Jeśli GOOGLE_PASS dostępny:**

Wybierz strategię logowania wg portalu:

**JustJoin.it:**
```
1. browser_navigate → https://justjoin.it
2. browser_click → przycisk "Zaloguj się" (górny prawy róg)
3. browser_click → "Zaloguj przez Google" / "Continue with Google"
4. [nowa karta / popup: accounts.google.com]
5. browser_fill → pole email → "kozlowski.mateusz.praca@gmail.com"
6. browser_click → "Dalej" / "Next"
7. browser_fill → pole hasło → wartość GOOGLE_PASS
8. browser_click → "Dalej" / "Next"
9. browser_wait_for → przekierowanie z powrotem na justjoin.it (max 10s)
10. browser_snapshot → potwierdź zalogowanie (szukaj nazwy/avatara usera)
```

**RocketJobs.pl:**
```
1. browser_navigate → https://rocketjobs.pl
2. browser_click → "Zaloguj" / "Sign in"
3. browser_click → "Zaloguj przez Google" / "Google"
4. [popup Google OAuth]
5. browser_fill → email → "kozlowski.mateusz.praca@gmail.com"
6. browser_click → "Dalej"
7. browser_fill → hasło → GOOGLE_PASS
8. browser_click → "Dalej"
9. browser_wait_for → powrót na rocketjobs.pl
10. browser_snapshot → potwierdź login
```

**TheProtocol.it / Pracuj.pl / inne:**
Analogicznie — znajdź przycisk Google OAuth, wykonaj sekwencję login.

**⚠️ Obsługa problemów podczas logowania:**
- Jeśli Google pyta o weryfikację 2FA → zrób screenshot, napisz użytkownikowi i oznacz jako manual
- Jeśli CAPTCHA → zrób screenshot, oznacz jako manual
- Jeśli popup nie otwiera się → spróbuj `browser_wait_for` 3 sekundy, ponów klik
- Jeśli błąd SSL → strona może być mimo to załadowana, kontynuuj
- Jeśli błąd logowania (złe hasło) → zatrzymaj się, napisz użytkownikowi

**Jeśli GOOGLE_PASS niedostępny:**
Pomiń logowanie, przejdź do 4c (zapisz jako manual).

### 4c. Wypełnij i wyślij formularz

Po zalogowaniu:
```
1. browser_navigate → URL oferty (apply_url z Kroku 3)
2. browser_snapshot → sprawdź stan strony
3. browser_click → przycisk "Aplikuj" / "Apply" / "Apply now"
4. browser_snapshot → sprawdź formularz
5. Wypełnij pola:
   - Imię/Nazwisko → "Mateusz Markowski"
   - Email → "kozlowski.mateusz.praca@gmail.com"
   - LinkedIn → "https://www.linkedin.com/in/mateusz-kozłowski-2b576114b"
   - Cover letter / List motywacyjny → tekst z 4a
   - Wynagrodzenie → z user-profile.json lub "21 000 PLN brutto"
   - Inne pola → odpowiedz sensownie na podstawie CV
6. browser_screenshot → zrzut przed wysłaniem
7. browser_click → "Wyślij" / "Submit" / "Aplikuj"
8. browser_screenshot → potwierdzenie wysłania
9. Zapisz screenshot jako: applications/screenshots/YYYY-MM-DD_Firma.png
```

**Jeśli formularz wymaga CV jako plik:**
- Pomiń auto-submit
- Oznacz jako "📁 Wymaga ręcznego dokończenia (plik CV)"
- Zapisz cover letter i dane w pliku aplikacji

**Jeśli HR email znaleziony zamiast formularza:**
```bash
APP_PASS="$(grep gmailAppPassword .claude/user-profile.json | ... )"
# Lub: APP_PASS="$GMAIL_APP_PASSWORD"  ← z env

curl -s --url "smtps://smtp.gmail.com:465" --ssl-reqd \
  --mail-from "kozlowski.mateusz.praca@gmail.com" \
  --mail-rcpt "$HR_EMAIL" \
  --user "kozlowski.mateusz.praca@gmail.com:$APP_PASS" \
  -T <(printf "From: Mateusz Markowski <kozlowski.mateusz.praca@gmail.com>\r\nTo: %s\r\nSubject: %s — Mateusz Markowski\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n%s" \
    "$HR_EMAIL" "$ROLE" "$COVER_LETTER")
```

---

## KROK 5 — Zapisz plik aplikacji

Dla każdej oferty utwórz: `applications/YYYY-MM-DD_Firma_Stanowisko.md`

```markdown
# Aplikacja: [Stanowisko] @ [Firma]
**Data:** YYYY-MM-DD
**URL oferty:** [url]
**Status:** sent / manual / pending

## Wymagania z oferty
[lista wymagań]

## Cover Letter
[pełny tekst]

## Dane do formularza
Imię i nazwisko: Mateusz Markowski
Email: kozlowski.mateusz.praca@gmail.com
LinkedIn: https://www.linkedin.com/in/mateusz-kozłowski-2b576114b
GitHub: https://github.com/gronkil

## Status
- [ ] Wysłano
- [ ] Odpowiedź
- [ ] Rozmowa
```

---

## KROK 6 — Aktualizuj rejestr

Dopisz do `applications/applied-jobs.json` każdą przetworzoną ofertę:
```json
{
  "date": "YYYY-MM-DD",
  "company": "Firma",
  "role": "Stanowisko",
  "url": "https://...",
  "status": "sent / manual",
  "file": "applications/YYYY-MM-DD_Firma_Stanowisko.md",
  "score": 0
}
```
Odczytaj plik → dodaj do tablicy `applied` → zapisz.

Następnie commit + push:
```bash
git add applications/
git commit -m "pipeline: [N] nowych aplikacji $(date +%Y-%m-%d)"
git push -u origin $(git branch --show-current)
```

---

## KROK 7 — Raport końcowy

```
## Wyniki pipeline — [data]

### ✅ Zaaplikowano automatycznie
| # | Firma | Stanowisko | Wynik | Sposób |
|---|-------|-----------|-------|--------|
| 1 | ...   | ...       | 94 pkt | Google OAuth + Playwright |

### 📁 Wymaga ręcznego dokończenia
| # | Firma | Link | Powód |
|---|-------|------|-------|
| 2 | ...   | ...  | Formularz wymaga pliku CV |

### 💡 Warto rozważyć (wynik ≥ 60 pkt)
| # | Firma | Stanowisko | Wynik | Powód | Link |
|---|-------|-----------|-------|-------|------|

### ❌ Pomijamy
[lista z jednozdaniowym powodem]

### 📊 Statystyki
- Przeszukano portali: 9
- Znaleziono łącznie: [N]
- Po deduplicacji: [N]
- Auto-zaaplikowano (Playwright): [N]
- Wymaga ręcznego: [N]
- Do rozważenia: [N]
```

---

## Zasady

- NIE aplikuj do URLi z `applied-jobs.json` (sprawdź przed każdą aplikacją)
- NIE wymyślaj danych — nie kłam o skillach, technologiach, doświadczeniu
- Każdy cover letter musi być unikatowy i odnosić się do konkretnej oferty
- Jeśli sub-agent zwróci pustą listę → pomiń portal, nie blokuj reszty
- Jeśli Playwright nie może wysłać → "📁 Wymaga ręcznego dokończenia" i kontynuuj
- Jeśli Google pyta o 2FA → screenshot + powiadom użytkownika + manual
- Maksymalnie 3 auto-aplikacje per uruchomienie pipeline

$ARGUMENTS
