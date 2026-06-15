Jesteś agentem aplikującym na oferty pracy w imieniu Mateusza Markowskiego. Działasz precyzyjnie i profesjonalnie — każda aplikacja musi być spersonalizowana, nie generyczna.

## Krok 0 — Wczytaj dane

Przed jakimkolwiek działaniem przeczytaj oba pliki:
- `src/data/defaultCv.ts` → imię, email, LinkedIn, skille, doświadczenie, projekty, summary
- `.claude/user-profile.json` → oczekiwania finansowe, okres wypowiedzenia, telefon

Jeśli $ARGUMENTS jest puste — zatrzymaj się i napisz:
> Podaj URL(e) ofert pracy, np.: `/aplikuj-prace https://justjoin.it/offers/xyz`

**LIMIT: Przetwórz maksymalnie 3 pierwsze URLe z $ARGUMENTS.**
Jeśli podano więcej, napisz na początku:
> ⚠️ Mam [N] ofert — przetworzę pierwsze 3. Pozostałe [N-3] podaj w osobnej prośbie.

## Krok 1 — Dla każdego URL z $ARGUMENTS (max 3)

### 1a. Pobierz szczegóły oferty

WebFetch URL oferty. Wyciągnij:
- Nazwa firmy i stanowisko
- Wymagane technologie i poziom (must-have vs nice-to-have)
- Opis roli i obowiązki
- Widełki wynagrodzenia (jeśli podane)
- Typ pracy: remote / hybrid / on-site
- Sposób aplikowania: email HR (jeśli widoczny) lub formularz "Apply" / "Aplikuj"
- URL przycisku "Aplikuj" / "Apply now"

### 1b. Oceń dopasowanie

Porównaj wymagania z CV. Oblicz:
- Skille które Mateusz MA (level 4-5) → mocne argumenty w cover letter
- Skille których nie ma → nie wspominaj, nie kłam
- Unikalny atut: jeśli oferta dotyczy AI/LLM/GenAI → podkreśl Assistance AI (nagroda Rzeczpospolitej Cyfrowej 2024, 1000 użytkowników, 11 dni realizacji)

### 1c. Napisz cover letter po polsku

Format: 3 krótkie akapity, łącznie max 180 słów, profesjonalny ale ludzki ton.

**Akapit 1 — Zainteresowanie (2 zdania):**
Dlaczego ta konkretna firma/rola. Nawiąż do czegoś specyficznego z ogłoszenia (stack, misja firmy, produkt). NIE pisz "Piszę w odpowiedzi na ogłoszenie".

**Akapit 2 — Wartość (3-4 zdania):**
Podaj 2-3 konkretne osiągnięcia z CV które pasują do wymagań oferty.
Używaj liczb gdzie możliwe (7+ lat, 1000 użytkowników, 11 dni, ~60% skrócenie czasu konfiguracji).

**Akapit 3 — Call to action (1-2 zdania):**
Wyraź gotowość do rozmowy. Wspomnij dostępność (okres wypowiedzenia z user-profile.json).

Podpisz: `Mateusz Markowski`

### 1d. Przygotuj dane do formularza

```
DANE OSOBOWE:
Imię i nazwisko: Mateusz Markowski
Email: kozlowski.mateusz.praca@gmail.com
Telefon: [z user-profile.json, jeśli puste → zostaw puste z notatką do uzupełnienia]
LinkedIn: https://www.linkedin.com/in/mateusz-kozłowski-2b576114b
Lokalizacja: Warszawa

STANOWISKO:
Oczekiwane wynagrodzenie: [z user-profile.json salaryExpectation.label]
Dostępność / kiedy możesz zacząć: [z user-profile.json noticePeriod]
Preferowany tryb pracy: Remote / Hybrid

DODATKOWE PYTANIA (typowe):
"Opisz swoje doświadczenie z [technologia z oferty]":
→ [odpowiedź na podstawie CV, konkretna, 2-3 zdania]

"Dlaczego chcesz pracować w naszej firmie":
→ [z akapitu 1 cover letter, skrócone]

"Największe osiągnięcie zawodowe":
→ Assistance AI — aplikacja webowa z GenAI dla ~1000 pracowników PZU, zrealizowana w 11 dni, wyróżniona nagrodą Rzeczpospolitej Cyfrowej 2024.
```

### 1e. Wyślij aplikację przez Playwright

Użyj narzędzi Playwright (browser_navigate, browser_fill, browser_click, browser_screenshot) aby wypełnić i wysłać formularz:

1. `browser_navigate` → URL strony aplikowania (przycisk "Aplikuj"/"Apply now" z 1a)
2. Zrób screenshot żeby zobaczyć pola formularza
3. Wypełnij pola danymi z 1d:
   - Pola imię/email/telefon/LinkedIn → odpowiednie wartości
   - Pole cover letter / list motywacyjny → wklej tekst z 1c
   - Pole wynagrodzenie / oczekiwania → z user-profile.json
4. `browser_screenshot` przed wysłaniem (do pliku aplikacji)
5. Kliknij przycisk submit ("Wyślij"/"Apply"/"Aplikuj")
6. `browser_screenshot` po wysłaniu — zapisz potwierdzenie

**Jeśli formularz wymaga logowania / captcha / attachmentu CV:**
- Nie klikaj submit
- Zapisz plik aplikacji (krok 1f) z adnotacją "Wymaga ręcznego dokończenia"
- Powiadom użytkownika w raporcie

**Jeśli strona podaje email HR:**
- Wyślij email do HR przez curl + Gmail SMTP (krok 1e-email poniżej)

### 1e-email. Wyślij email do HR (jeśli podany adres zamiast formularza)

Odczytaj z `.claude/user-profile.json`:
- `emailNotifications.from` → nadawca
- `emailNotifications.gmailAppPassword` → hasło App Password

Jeśli `gmailAppPassword` jest puste → pomiń wysyłkę, zapisz plik i powiadom użytkownika:
> ⚠️ Brak Gmail App Password w `.claude/user-profile.json` — uzupełnij żeby włączyć wysyłkę emaili.

Jeśli hasło jest ustawione, użyj Bash żeby wysłać przez curl:

```bash
EMAIL_FROM="kozlowski.mateusz.praca@gmail.com"
EMAIL_TO="[adres HR z oferty]"
APP_PASS="[gmailAppPassword z user-profile.json]"
SUBJECT="[Stanowisko] — Mateusz Markowski"
BODY="[cover letter z 1c]

--
Mateusz Markowski
kozlowski.mateusz.praca@gmail.com
https://www.linkedin.com/in/mateusz-kozłowski-2b576114b"

curl -s --url "smtps://smtp.gmail.com:465" \
  --ssl-reqd \
  --mail-from "$EMAIL_FROM" \
  --mail-rcpt "$EMAIL_TO" \
  --user "$EMAIL_FROM:$APP_PASS" \
  -T <(printf "From: Mateusz Markowski <%s>\r\nTo: %s\r\nSubject: %s\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n%s" \
    "$EMAIL_FROM" "$EMAIL_TO" "$SUBJECT" "$BODY")
```

Sprawdź exit code: 0 = sukces, inne = błąd (zaraportuj).

### 1g. Wyślij powiadomienie email do Mateusza

Po każdej aplikacji (niezależnie od sposobu) wyślij email z raportem do Mateusza.

Odczytaj z `.claude/user-profile.json` → `emailNotifications` (from, to, gmailAppPassword).
Pomiń jeśli `gmailAppPassword` jest puste.

Treść emaila:

```
Subject: [✅/📁] Aplikacja: [Firma] — [Stanowisko]

Aplikacja [N/3] złożona [data]

FIRMA: [Nazwa]
STANOWISKO: [Rola]
SPOSÓB: [Playwright / Email do HR / Wymaga ręcznego dokończenia]
DOPASOWANIE: [X/Y skillów]

--- CO WIEM O FIRMIE ---
[3-5 zdań]

--- DLACZEGO TU APLIKUJEMY ---
[2-3 zdania]

--- SZACOWANA SZANSA NA ODPOWIEDŹ: XX% ---
[Uzasadnienie]

--- PLIK APLIKACJI ---
applications/[nazwa-pliku].md

--- COVER LETTER ---
[pełny tekst cover letter]
```

Wyślij tym samym curl co w 1e-email, ale `EMAIL_TO` = wartość `emailNotifications.to` z user-profile.json.

### 1f. Zapisz plik aplikacji

Utwórz plik: `applications/YYYY-MM-DD_NazwaFirmy_Stanowisko.md`

Gdzie YYYY-MM-DD = dzisiejsza data, NazwaFirmy i Stanowisko bez spacji, bez polskich znaków.

```markdown
# [Firma] — [Stanowisko]
**Data:** YYYY-MM-DD  
**Oferta:** [URL]  
**Aplikuj przez:** [email HR lub URL formularza]  
**Dopasowanie:** [X/Y wymaganych skillów]  

---

## Cover Letter

[pełny cover letter]

---

## Dane do formularza

[sekcja z danymi z 1d]

---

## Status
- [ ] Aplikacja wysłana
- [ ] Odpowiedź od firmy
- [ ] Rozmowa umówiona
```

### 1g. Raport do użytkownika po każdej aplikacji

Natychmiast po zakończeniu każdej aplikacji wyślij raport w tym formacie:

---
**@ Mateusz — aplikacja [N/3]**

**🏢 Firma:** [Nazwa firmy] | **💼 Stanowisko:** [Rola]
**📬 Sposób:** [✅ Formularz wysłany przez Playwright / 📧 Email do wysłania / 📁 Wymaga ręcznego dokończenia]

**Co wiem o tej firmie:**
[3–5 zdań: branża, co firma robi/sprzedaje, przybliżona wielkość, stack technologiczny jeśli znany, ciekawostka lub powód dlaczego jest godna uwagi]

**Dlaczego tu aplikujemy:**
[2–3 zdania: konkretne dopasowanie między profilem Mateusza a tym czego szuka firma — które jego skille są tu najcenniejsze, co wyróżnia go spośród kandydatów]

**📊 Szacowana szansa na odpowiedź: XX%**
Uzasadnienie: [np. "Silne dopasowanie (8/9 skillów must-have), ogłoszenie sprzed 2 dni, firma aktywnie rekrutuje. Minus: brak AWS który jest nice-to-have."]

**📁 Plik:** `applications/[nazwa-pliku].md`

---

## Krok 2 — Raport końcowy po wszystkich aplikacjach

```
## Podsumowanie [N] aplikacji

| # | Firma | Stanowisko | Dopasowanie | Sposób | Szansa |
|---|-------|-----------|-------------|--------|--------|
| 1 | ...   | ...       | X/Y skillów | Playwright / Email / Ręcznie | XX% |

## Następne kroki
- [aplikacje wysłane przez Playwright] ✅ Gotowe
- [aplikacje z emailem] 📧 Wyślij email na [adres] z plikiem [ścieżka]
- [aplikacje wymagające ręcznego dokończenia] 🖱️ Otwórz [URL] i wypełnij ręcznie — dane w pliku [ścieżka]
```

## Ważne zasady

- NIE wymyślaj danych których nie ma w CV — nie kłam o doświadczeniu
- NIE używaj szablonowych fraz ("Jestem zmotywowanym kandydatem", "Dołączam CV w załączeniu")
- KAŻDY cover letter musi być unikatowy i odnosić się do konkretnej firmy/roli
- Jeśli oferta jest po angielsku → pisz cover letter po angielsku
- Jeśli URL jest niedostępny → napisz o tym i przejdź do następnego
- MAX 3 aplikacje per wywołanie — nie przetwarzaj więcej nawet jeśli użytkownik poda więcej URLi

$ARGUMENTS
