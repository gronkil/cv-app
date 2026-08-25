# CV App — Claude Context

## Project
"CV as code": one typed data source renders both the on-screen CV and a
one-page A4 PDF. Bilingual (PL/EN). Static — no backend, no in-app editing,
no persistence. Built to be edited by an agent, not through a UI.

## Stack
- Vite 8 + React 19 + TypeScript
- MUI v9 (Material UI, styled via the `sx` prop + a shared theme)
- `@react-pdf/renderer` (PDF document, generated client-side from the same data)
- Build-time prerender via Vite SSR + `react-dom/server` + `@emotion/server`
- Deploy: GitHub Actions → FTPS to home.pl (`mateusz-markowski.kapatech.pl`)

Note: `zustand`, `sonner`, `tailwindcss` may appear in dependency history but
are not used by the app; MUI `sx` + theme is the only styling system.

## Color palette (60-30-10)
- 60% background: `#F5F4F0` (warm cream)
- 30% surface: `#1C2333` (deep navy — sidebar/header)
- 10% accent: `#C9A84C` (matte gold — links, chips, skill bars)

## Key files
- `src/data/defaultCv.ts` — CV content, Polish (the source of truth for content)
- `src/data/defaultCvEn.ts` — CV content, English
- `src/types/cv.types.ts` — TypeScript interfaces for the CV data
- `src/App.tsx` — page shell: renders sidebar + main, PL/EN toggle, PDF button
- `src/components/cv/CvSidebar.tsx` — avatar, contact, skills, languages, education, interests
- `src/components/cv/CvMain.tsx` — name/title, profile, experience, projects
- `src/components/pdf/CvPdfDocument.tsx` — the A4 PDF layout (`@react-pdf/renderer`)
- `src/hooks/usePdfExport.tsx` — renders `CvPdfDocument` to a blob and downloads it
- `src/i18n/labels.ts` — PL/EN section labels
- `src/theme.ts` — MUI theme
- `src/entry-server.tsx` + `scripts/prerender.mjs` — build-time static prerender

## Architecture
- Data flows one way: the two `defaultCv*.ts` files → components (props), no store.
- `App.tsx` holds only local UI state: the selected language and the PDF-export
  loading flag. There is no edit mode and nothing is written to localStorage.
- The same `CvData` object feeds the web components and `CvPdfDocument`, so the
  page and the PDF cannot disagree.
- SEO: `npm run build` also runs a Vite SSR build of `src/entry-server.tsx` and
  `scripts/prerender.mjs` injects the rendered CV (+ critical CSS) into
  `dist/index.html`, so crawlers get the full CV without executing JS. On the
  client, `main.tsx` renders the interactive app into the same `#root`.

## Editing the CV
Change the data in `src/data/defaultCv.ts` (PL) and `src/data/defaultCvEn.ts`
(EN). Keep the two in sync. The PDF must stay on a single A4 page — verify after
content changes. Do not invent facts (technologies, employers, dates, metrics)
that are not already supported.

## Commands
```bash
npm run dev      # dev server
npm run build    # tsc + Vite build + SSR prerender → dist/
npm run preview  # preview the production build
npm run lint     # eslint
```
