# CV App — AI Agent Documentation

## Purpose

A "CV as code" single-page app. One typed data source renders both the
on-screen CV and a one-page A4 PDF, in Polish or English. It is static: no
backend, no accounts, no in-app editing, no `localStorage`. The CV is changed by
editing data files (by an agent or by hand) and redeploying — not through a UI.

---

## What the app does

1. Loads the CV content from two typed data modules (`defaultCv.ts` for Polish,
   `defaultCvEn.ts` for English).
2. Renders it as a two-column document: a navy sidebar and a light main column.
3. A PL/EN toggle switches which data module is displayed.
4. A "Download CV" button renders the same data through `@react-pdf/renderer`
   and downloads a one-page A4 PDF.

There is no edit mode. The only runtime state is the selected language and the
PDF-export loading flag, both local to `App.tsx`.

---

## Architecture at a glance

```
main.tsx  (ThemeProvider + CssBaseline)
└── App.tsx
    ├── language toggle (PL / EN)            ← local useState
    ├── Download CV button → usePdfExport    ← @react-pdf/renderer
    └── #cv-document
        ├── CvSidebar   ← avatar, contact, skills, languages, education, interests
        └── CvMain      ← name/title, profile, experience, projects
```

Data flows one way: `defaultCv.ts` / `defaultCvEn.ts` → components as props.
There is no state store. The same `CvData` object also feeds `CvPdfDocument`, so
the web page and the PDF are two renderings of one source and cannot drift apart.

---

## Data model — `src/types/cv.types.ts`

```typescript
PersonalInfo {
  name, title, email, phone, location,
  linkedin, github, website, avatarUrl, summary
}

ExperienceEntry { id, company, role, startDate, endDate, description: string[] }
EducationEntry  { id, school, degree, field, startDate, endDate }
SkillEntry      { id, name, level, category }   // level 1–5 → filled bars, grouped by category
LanguageEntry   { id, language, level }         // level string ("Native"/"B1"…) → progress bar
ProjectEntry    { id, name, tech, description: string[], url? }

CvData {
  personal: PersonalInfo
  experience: ExperienceEntry[]
  education: EducationEntry[]
  skills: SkillEntry[]
  languages: LanguageEntry[]
  interests: string[]
  projects: ProjectEntry[]
}
```

Contact rows render only when the field is non-empty (e.g. an empty `linkedin`
is simply omitted). Skills are grouped by `category`, in array order — the first
category listed appears first, so ordering in the data controls emphasis.

---

## Key components

### `CvMain` — `src/components/cv/CvMain.tsx`
Name, title, gold accent rule, then Profile (summary), Work Experience and
Personal Projects. Each experience/project bullet comes from a `description[]`.

### `CvSidebar` — `src/components/cv/CvSidebar.tsx`
Avatar (initials), contact (email, location, website, GitHub, LinkedIn),
skills grouped by category with 1–5 bars, languages with progress bars,
education, interests.

### `CvPdfDocument` — `src/components/pdf/CvPdfDocument.tsx`
The A4 PDF layout using `@react-pdf/renderer` primitives (`Page`, `View`,
`Text`, `Link`, `StyleSheet`). It mirrors the web sections. Fonts are Roboto,
registered from Google Fonts. Keep the output on a single A4 page — spacing
constants here are tuned for that, so re-check after adding content.

### `usePdfExport` — `src/hooks/usePdfExport.tsx`
`pdf(<CvPdfDocument …/>).toBlob()` → object URL → programmatic download as
`<Name>_CV.pdf`. Toggles an `isExporting` flag while running.

---

## Prerender / SEO

The app is client-rendered, so `npm run build` adds a static prerender step:

1. `vite build` — the client bundle and `dist/index.html`.
2. `vite build --ssr src/entry-server.tsx --outDir dist-ssr` — an SSR module
   that renders the default (Polish) CV with `react-dom/server` and extracts
   MUI critical CSS via `@emotion/server`.
3. `scripts/prerender.mjs` — injects that HTML and CSS into `dist/index.html`
   and deletes `dist-ssr`.

Result: crawlers and link-preview bots receive the full CV text and styling
without executing JavaScript. `index.html` also carries the title, description,
Open Graph and Twitter tags, and `public/` holds `og-image.png`, `robots.txt`
and `sitemap.xml`.

---

## Styling

- MUI v9 via the `sx` prop and a shared theme (`src/theme.ts`). No Tailwind.
- Palette (60-30-10): `#F5F4F0` cream background, `#1C2333` navy surface,
  `#C9A84C` gold accent.
- `src/index.css` is a minimal reset plus print rules.

---

## What NOT to change

- `id="cv-document"` on the root CV element — the prerender targets `#root`, and
  this id anchors the document region.
- The single-A4-page constraint of the PDF — verify it after any content change.
- Ground truth: do not add technologies, employers, dates, certifications or
  metrics that the CV's facts do not already support.

## What NOT to add back

This repo previously carried a private job-application pipeline (scraping,
auto-apply, SMTP) and personal credentials. Those were removed from the tree and
from git history. Do not reintroduce private data, credentials, or that pipeline
into this public repository.

---

## Dev commands

```bash
npm run dev      # Vite dev server (hot reload)
npm run build    # tsc + Vite build + SSR prerender → dist/
npm run preview  # preview the production build
npm run lint     # eslint
```
