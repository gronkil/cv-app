# CV App — AI Agent Documentation

## Purpose

A single-page React application that lets users create and export a professional CV/resume. Users fill in their data through inline editing directly on the rendered CV layout, then download it as a PDF. Data persists automatically to `localStorage` — no backend, no accounts, no server.

---

## What the App Does (User Flow)

1. User opens the app and sees a pre-filled CV template (warm cream layout, navy/gold accents)
2. Clicks **Edit** button (floating toolbar, bottom-right) → all text fields become editable inline
3. Edits name, title, contact info, summary, work experience, education, skills, languages
4. Adds or removes entries in any section via + / × buttons
5. Clicks **Save** → fields return to styled view mode
6. Clicks **Download PDF** → html2canvas captures the DOM, jsPDF generates the file

---

## Architecture at a Glance

```
App.tsx
├── EditToolbar          ← floating action bar (Edit/Save/PDF/Reset)
└── #cv-document div     ← the entire CV layout; this is what gets captured for PDF
    ├── CvHeader         ← avatar, name, title, contact, social links
    └── 2-column grid
        ├── main column: CvSummary, CvExperience, CvEducation
        └── sidebar:     CvSkills, CvLanguages
```

**State flows one way:** Zustand store → components. All writes go through store actions. `EditableField` is the only component that calls store actions directly.

---

## State Management — `src/store/cvStore.ts`

Single Zustand store, persisted to `localStorage` under key `cv-storage`.

**Shape:**
```typescript
{
  cv: CvData          // all CV content
  isEditMode: boolean // global toggle
}
```

**Actions (complete list):**
| Action | What it does |
|--------|-------------|
| `toggleEditMode()` | flip edit/view mode |
| `updatePersonal(field, value)` | update any PersonalInfo field |
| `addExperience()` | append blank experience entry |
| `updateExperience(id, field, value)` | update one field of one entry |
| `removeExperience(id)` | delete by UUID |
| `addEducation()` / `updateEducation()` / `removeEducation()` | same pattern |
| `addSkill()` / `updateSkill()` / `removeSkill()` | same pattern |
| `addLanguage()` / `updateLanguage()` / `removeLanguage()` | same pattern |
| `resetCv()` | overwrite with `defaultCv` from `src/data/defaultCv.ts` |

---

## Data Model — `src/types/cv.types.ts`

```typescript
PersonalInfo {
  name, title, email, phone, location,
  linkedin, github, avatarUrl, summary
}

ExperienceEntry { id, company, role, startDate, endDate, description }
EducationEntry  { id, school, degree, field, startDate, endDate }
SkillEntry      { id, name, level }          // level: 1–5 (renders as filled bars)
LanguageEntry   { id, language, level }      // level: string ("Native", "C1", etc.)

CvData {
  personal: PersonalInfo
  experience: ExperienceEntry[]
  education: EducationEntry[]
  skills: SkillEntry[]
  languages: LanguageEntry[]
}
```

---

## Key Components

### `EditableField` — `src/components/editor/EditableField.tsx`
The single most important component. Reads `isEditMode` from the store.
- **View mode:** renders a `<span>` with styled text
- **Edit mode:** renders `<input>` (single line) or `<textarea>` (multiline)
- Takes an `onSave` callback that calls the appropriate store action
- Used everywhere text is editable

### `EditToolbar` — `src/components/editor/EditToolbar.tsx`
Fixed-position floating bar. Three buttons:
- **Reset** — calls `resetCv()`, guarded by confirmation
- **PDF** — calls `usePdfExport()` hook
- **Edit / Save** — calls `toggleEditMode()`

### `usePdfExport` — `src/hooks/usePdfExport.ts`
1. Disables edit mode (so inputs become spans)
2. Waits 300ms for React to re-render
3. `html2canvas` captures `#cv-document`
4. `jsPDF` builds the PDF (splits across pages if tall)
5. Re-enables edit mode if it was active before
6. Saves as `<name>-cv.pdf`

---

## Styling Rules

- **Tailwind CSS v4** via `@tailwindcss/vite` plugin — no `tailwind.config.js`
- **Color palette (60-30-10):**
  - 60% background: `#F5F4F0` (warm cream)
  - 30% surfaces/headers: `#1C2333` (deep navy)
  - 10% accent: `#C9A84C` (matte gold) — used on links, buttons, skill bars
- `.no-print` class hides the toolbar during PDF export
- **Framer Motion** used for staggered entrance animations on all list items

---

## Seed Data — `src/data/defaultCv.ts`

Polish-language placeholder CV shown to new users (or after reset). Contains:
- Placeholder personal info ("Twoje Imię i Nazwisko", Frontend Developer)
- 2 experience entries, 1 education entry
- 6 skills (React, TypeScript, Node.js, Tailwind CSS, GraphQL, Docker)
- 3 languages (Polish native, English C1, German B1)

All IDs generated with `crypto.randomUUID()` at module load time.

---

## Common Tasks

**Add a new CV section** (e.g. Certifications):
1. Add types to `cv.types.ts`
2. Add array + actions to `cvStore.ts`
3. Add seed entries to `defaultCv.ts`
4. Create `src/components/cv/CvCertifications.tsx` using `CvSection` + `EditableField`
5. Mount it in `App.tsx` inside `#cv-document`

**Change a field label or placeholder:**
Edit the relevant component in `src/components/cv/`.

**Change color palette:**
Update Tailwind utility classes globally — grep for `#C9A84C`, `#1C2333`, `#F5F4F0`.

**PDF export broken / blank:**
Check that `#cv-document` div ID is present in `App.tsx`. The hook targets this selector.

---

## What NOT to Change

- The `id="cv-document"` attribute on the root CV div — PDF export depends on it
- The 300ms delay in `usePdfExport` — it waits for React to flush edit→view DOM changes
- Zustand persist key `cv-storage` — changing it loses all user data in existing sessions

---

## Dev Commands

```bash
npm run dev      # Vite dev server (hot reload)
npm run build    # tsc + Vite production build
npm run preview  # preview the production build locally
```
