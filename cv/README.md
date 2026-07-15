# CV — clean PDF pipeline (PL + EN)

Standalone generator for Mateusz Markowski's CV, targeting AI-engineering / agentic-systems
contracts. Renders **HTML + CSS → PDF via Chromium (Playwright)** — deliberately a different
toolchain from the app's `@react-pdf/renderer`, which corrupted the `fi`/`fl` ligatures in the
PDF text layer (`workfow`, `frma`, `konfguracja`). Chromium writes a correct ToUnicode map and
the CSS additionally forces `font-variant-ligatures: none`, so the corruption cannot recur.

## Files
- `data.mjs` — single source of truth for both PL and EN content.
- `build.mjs` — renders both PDFs (+ intermediate HTML) into `out/`.
- `verify.mjs` — acceptance tests: extracts the text layer with `pdfjs-dist`, asserts required
  strings present / forbidden strings absent, page count ≤ 2, and a non-empty (selectable) layer.

## Output (`out/`)
- `Mateusz_Markowski_CV_PL.pdf`, `Mateusz_Markowski_CV_EN.pdf` — the deliverables.
- `preview-pl.png`, `preview-en.png` — visual previews.

## Regenerate
```bash
npm run cv:build     # -> cv/out/*.pdf
npm run cv:verify    # acceptance tests
```

Font: **Inter** (`@fontsource/inter`, weights 400/600/700, latin + latin-ext for Polish
diacritics), embedded as base64 so the output is self-contained. Layout is single-column,
no tables / text boxes / images in the content layer → ATS-safe.

## Environment note
`build.mjs` points Playwright at the pre-installed Chromium
(`/opt/pw-browsers/chromium-1194/chrome-linux/chrome`). On another machine, remove the
`executablePath` and run `npx playwright install chromium` first.

## Notes
- The flagship agentic project is framed around **working flows**, not an agent headcount:
  Echo-word is presented as a reusable orchestrator that composes specialized subagents
  (web search / API collection / RAG), demonstrated by real flows (job-offer + car search),
  with `AI Agent` (Jira → PR) as the deep-tech reactive-Kotlin instance.
