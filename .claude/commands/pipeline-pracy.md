Jesteś orkiestratorem pipeline pracy dla Mateusza Markowskiego.
Uruchamiasz skrypt, czytasz top 3, decydujesz akcję per oferta, wykonujesz, wysyłasz podsumowanie.

## Profil
Senior Fullstack Dev, 7+ lat PZU, React/TypeScript/Kotlin/GenAI, Warszawa, 21 000 PLN B2B, 3 dni wypowiedzenia.
Nagroda Rzeczpospolitej Cyfrowej 2024 za Assistance AI (1000 użytkowników, 11 dni).
Email: kozlowski.mateusz.praca@gmail.com | CV: https://cv-app-ta9g.vercel.app/

## Krok 1 — Znajdź top 3

```bash
node scripts/znajdz-top3.cjs
```

Poczekaj na zakończenie. Skrypt wysyła email z top 3 i zapisuje `applications/oferty-{DATA}.txt`.

## Krok 2 — Wczytaj top 3 URL-e

Odczytaj `applications/oferty-{DZISIEJSZA_DATA}.txt`.
Wyciągnij 3 URL-e z sekcji `★★★ TOP 3 ★★★` — linie zaczynające się od `   https://`.
Sprawdź `applications/applied-jobs.json` — pomiń URL-e które już tam są.

## Krok 3 — Zdecyduj akcję per oferta

Dla każdego URL wykonaj WebFetch → przeczytaj treść ogłoszenia.

```
znaleziony email HR w treści? (@, hr@, rekrutacja@, jobs@, careers@)
  → TAK  → AKCJA = "email_hr"
  → NIE, URL z portalu (justjoin/pracuj/nofluff/bulldogjob/solid/rocketjobs/theprotocol/linkedin/indeed/inhire)
          → AKCJA = "playwright_form"
  → NIE, pozostałe
          → AKCJA = "manual"
```

## Krok 4 — Wykonaj akcję

### email_hr
Postępuj zgodnie z instrukcją w `.claude/commands/aplikuj-email-hr.md`.
Przekaż: url, email_hr, nazwa firmy, rola, treść ogłoszenia.

### playwright_form
Postępuj zgodnie z instrukcją w `.claude/commands/aplikuj-formularz.md`.
Przekaż: url, nazwa firmy, rola.

### manual
Napisz cover letter (patrz szablon w `aplikuj-email-hr.md`).
Zapisz do `applications/{DATA}_{Firma}_coverLetter.txt`.
Status: `⏳ Wymaga ręcznej akcji`

## Krok 5 — Zapisz do applied-jobs.json

Po każdej próbie dopisz do tablicy `applied` w `applications/applied-jobs.json`:
```json
{
  "url": "URL",
  "company": "FIRMA",
  "role": "ROLA",
  "date": "YYYY-MM-DD",
  "status": "submitted | email_sent | manual_needed | playwright_blocked",
  "action": "email_hr | playwright_form | manual",
  "score": 0
}
```

## Krok 6 — Wyślij podsumowanie

```bash
node scripts/send-pipeline-report.cjs
```

Skrypt czyta dane z `applications/applied-jobs.json` (ostatnie 3 wpisy z dzisiaj) i wysyła HTML email.
Nie pisz własnego maila inline — zawsze używaj tego skryptu.

## Zasady — czego NIE robić
- NIE uruchamiaj skryptu więcej niż raz — jeśli błąd, zatrzymaj się i opisz
- NIE szukaj emaila HR poza treścią ogłoszenia (LinkedIn, Google, strona firmy)
- NIE zapisuj "submitted" jeśli nie masz potwierdzenia sukcesu z portalu
- NIE aplikuj do więcej niż 3 ofert per uruchomienie
- NIE wysyłaj emaila do HR bez pytania — `aplikuj-email-hr.md` musi zapytać "tak/nie"
- NIE aplikuj do URL-i z applied-jobs.json
- Jeśli skrypt lub txt nie istnieje → zatrzymaj się, napisz błąd, NIE próbuj WebSearch
- Podsumowanie wysyłaj ZAWSZE — nawet gdy wszystkie 3 to "manual"

$ARGUMENTS
