Jesteś orkiestratorem procesu szukania i aplikowania na pracę w imieniu Mateusza Markowskiego.
Koordynujesz sub-agentów, zbierasz wyniki, weryfikujesz oferty i aplikujesz do top 3.

## Krok 0 — Przygotowanie danych

Przeczytaj równolegle:
- `src/data/defaultCv.ts` → top skille (level 4-5), stack, lata doświadczenia, summary
- `.claude/user-profile.json` → oczekiwane wynagrodzenie, okres wypowiedzenia
- `applications/applied-jobs.json` → lista już aplikowanych URLi (jeśli plik nie istnieje → utwórz: `{"applied":[]}`)

Przygotuj `CV_SUMMARY` (1 akapit) do przekazania sub-agentom:
> "Senior Fullstack Developer, 7+ lat, stack: React/TypeScript/Kotlin/Spring Boot, doświadczenie z AI/GenAI (Assistance AI — nagroda Rzeczpospolitej Cyfrowej 2024). Lokalizacja: Warszawa. Oczekiwania: [z user-profile]. Preferuje: remote/hybrid."

## Krok 1 — Równoległe przeszukiwanie (9 sub-agentów)

Uruchom wszystkich 9 sub-agentów **jednocześnie** (Agent tool, każdy oddzielnie).

Każdemu sub-agentowi przekaż:
- CV_SUMMARY
- Przypisany portal + frazy wyszukiwania
- Listę URLi z `applied-jobs.json` do pominięcia
- Format odpowiedzi (JSON)

### Sub-agent 1 — JustJoin.it
Użyj WebSearch żeby znaleźć oferty na JustJoin.it pasujące do profilu:
Szukaj: "React TypeScript Warszawa site:justjoin.it", "Kotlin Spring Warszawa site:justjoin.it", "AI developer Warszawa site:justjoin.it", "Fullstack senior Warszawa site:justjoin.it"
Zwróć JSON: `[{"url":"...","company":"...","role":"...","salary":"...","remote":true/false,"skills_match":["..."]}]` (max 5 ofert)

### Sub-agent 2 — NoFluffJobs
Szukaj: "fullstack warszawa react site:nofluffjobs.com", "senior react typescript site:nofluffjobs.com", "kotlin spring warszawa site:nofluffjobs.com"
Zwróć JSON (max 5 ofert)

### Sub-agent 3 — Pracuj.pl
Szukaj: "programista fullstack warszawa site:pracuj.pl", "senior react developer warszawa site:pracuj.pl"
Zwróć JSON (max 5 ofert)

### Sub-agent 4 — LinkedIn Jobs
Szukaj: "fullstack developer warsaw react site:linkedin.com/jobs", "senior frontend developer warsaw typescript site:linkedin.com/jobs"
Zwróć JSON (max 5 ofert)

### Sub-agent 5 — Bulldogjob.pl
Szukaj: "fullstack developer react typescript site:bulldogjob.pl", "senior developer warszawa site:bulldogjob.pl"
Zwróć JSON (max 5 ofert)

### Sub-agent 6 — TheProtocol.it
Szukaj: "fullstack developer warszawa site:theprotocol.it", "senior react warszawa site:theprotocol.it"
Zwróć JSON (max 5 ofert)

### Sub-agent 7 — Solid.jobs
Szukaj: "fullstack warszawa site:solid.jobs", "react developer warszawa site:solid.jobs"
Zwróć JSON (max 5 ofert)

### Sub-agent 8 — RocketJobs.pl
Szukaj: "fullstack developer warszawa site:rocketjobs.pl", "senior react site:rocketjobs.pl"
Zwróć JSON (max 5 ofert)

### Sub-agent 9 — 4programmers.net
Szukaj: "react typescript warszawa site:4programmers.net", "fullstack senior site:4programmers.net"
Zwróć JSON (max 5 ofert)

## Krok 2 — Deduplikacja i agregacja

Po zebraniu wyników wszystkich sub-agentów:
1. Połącz wszystkie listy w jedną
2. Usuń duplikaty (ten sam URL lub ta sama firma + stanowisko)
3. Usuń oferty których URL jest już w `applications/applied-jobs.json`
4. Wynik: lista unikalnych, nowych ofert

## Krok 3 — Weryfikacja i ranking (Agent)

Uruchom jednego sub-agenta weryfikacyjnego. Przekaż mu:
- Połączoną listę ofert z Kroku 2
- CV_SUMMARY
- Instrukcję:

> Oceń każdą ofertę (0-100 pkt) według:
> - Pokrycie skillów must-have (30 pkt) — ile wymaganych technologii Mateusz ma na level 4-5
> - Seniority fit (20 pkt) — czy rola pasuje do 7+ lat
> - Wynagrodzenie (20 pkt) — czy widełki są ≥ 21 000 PLN brutto (lub nie podano → 10 pkt)
> - Język angielski (15 pkt) — WAŻNE: Mateusz ma angielski B1, oferty wymagające B2/C1 są ryzykiem odrzucenia:
>   - oferta po polsku / angielski niewymagany = 15 pkt
>   - angielski opcjonalny lub "mile widziany" = 10 pkt
>   - B1 akceptowalny wprost = 8 pkt
>   - B2 wymagany = 3 pkt
>   - C1/C2 lub "fluent English" wymagany = 0 pkt
> - AI/GenAI atut (10 pkt) — jeśli oferta wymaga AI doświadczenia → +10 pkt za nagrodę Rzeczpospolitej Cyfrowej
> - Remote/hybrid (5 pkt) — fully remote = 5, hybrid = 3, on-site = 0
>
> Zwróć:
> - `top3`: 3 oferty z najwyższym wynikiem (z uzasadnieniem)
> - `warto_rozwazyc`: oferty 4-10 (wynik ≥ 60) z krótkim komentarzem
> - `pomijamy`: reszta z jednozdaniowym powodem

## Krok 4 — Aplikowanie do top 3 (w pełni automatyczne, orkiestrator działa bezpośrednio)

**WAŻNE: Ten krok wykonuje orkiestrator SAMODZIELNIE — nie deleguj do sub-agentów.**
Tylko główna sesja ma dostęp do narzędzi Playwright MCP (browser_navigate, browser_click, browser_fill, browser_screenshot, browser_snapshot).

Dla każdej z 3 ofert z `top3` wykonaj pełen proces bez ingerencji użytkownika:

1. WebFetch URL oferty → wymagania, email HR, URL formularza
2. Napisz spersonalizowany cover letter (3 akapity, max 180 słów)
3. **Zaloguj się przez Playwright + Google OAuth:**
   - `browser_navigate` → strona portalu
   - Kliknij "Zaloguj przez Google" / "Sign in with Google"
   - Wpisz `google_email` i `google_password` z `.claude/user-profile.json`
   - Poczekaj na redirect z powrotem do portalu
4. Wypełnij i wyślij formularz aplikacyjny przez Playwright:
   - `browser_navigate` → URL oferty
   - Kliknij "Aplikuj" / "Apply"
   - Wypełnij pola: imię, email, cover letter, wynagrodzenie, okres wypowiedzenia
   - `browser_screenshot` przed submit
   - Kliknij Submit
   - `browser_screenshot` po submit — zapisz potwierdzenie
5. Jeśli jest email HR → wyślij przez Gmail SMTP (nodemailer, dane z user-profile.json)
6. Zapisz plik: `applications/YYYY-MM-DD_Firma_Stanowisko.md` ze statusem i screenshotami
7. **Zawsze wyślij email powiadomienie do Mateusza** (niezależnie czy sukces czy błąd):
   - Nadawca/odbiorca: `google_email` z user-profile.json
   - Przez nodemailer z `gmail_smtp_app_password`
   - Temat: `[✅ Wysłano / ❌ Błąd] Aplikacja: Firma — Stanowisko`
   - Treść: cover letter + status + link do oferty + powód błędu jeśli wystąpił

## Krok 5 — Aktualizacja rejestru

Po udanym wysłaniu każdej aplikacji dopisz do `applications/applied-jobs.json`:

```json
{
  "url": "[URL oferty]",
  "company": "[Firma]",
  "role": "[Stanowisko]",
  "date": "[YYYY-MM-DD]",
  "status": "sent"
}
```

Odczytaj plik → dopisz do tablicy `applied` → zapisz z powrotem (Write).

## Krok 6 — Raport końcowy

```
## Wyniki pipeline — [data]

### ✅ Zaaplikowano (3)
| # | Firma | Stanowisko | Wynik | Sposób |
|---|-------|-----------|-------|--------|
| 1 | ...   | ...       | 94 pkt | Playwright |

### 💡 Warto rozważyć ([N] ofert)
Czy chcesz żebym zaaplikował do którejś z poniższych?

| # | Firma | Stanowisko | Wynik | Powód rekomendacji | Link |
|---|-------|-----------|-------|--------------------|------|
| 4 | ...   | ...       | 78 pkt | "React match 100%, brak Kotlin ale nice-to-have" | [link] |

### ❌ Pomijamy ([N] ofert)
[lista z jednozdaniowym powodem dla każdej]

### 📊 Statystyki
- Przeszukano portali: 9
- Znaleziono łącznie: [N]
- Po deduplicacji: [N]
- Zaaplikowano: 3
- Do rozważenia: [N]
```

## Ważne zasady

- NIE aplikuj do ofert których URL jest w `applied-jobs.json` — sprawdź PRZED aplikowaniem
- NIE wymyślaj danych których nie ma w CV
- Każdy cover letter musi być unikatowy i spersonalizowany
- Jeśli sub-agent zwróci pustą listę → pomiń, nie blokuj reszty pipeline
- BRAK "📁 Wymaga ręcznego dokończenia" — zawsze próbuj zalogować się przez Google OAuth i aplikować automatycznie
- Jeśli logowanie przez Google nie działa (2FA, captcha, błąd sieci) → zapisz plik z opisem błędu i wyślij email z informacją o problemie
- Email do Mateusza wysyłaj ZAWSZE — zarówno po sukcesie jak i po błędzie

$ARGUMENTS
