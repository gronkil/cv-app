# CV App — Claude Context

## Project
React 19 + TypeScript CV editor with inline editing and PDF export.

## Stack
- Vite + React 19 + TypeScript
- MUI v9 (Material UI components)
- Zustand (state + localStorage persist via `cv-storage` key)
- Tailwind CSS v4 (via `@tailwindcss/vite` plugin)
- Framer Motion (animations)
- @react-pdf/renderer (PDF export)
- Lucide React (icons)
- Sonner (toast notifications)

## Color palette (60-30-10)
- 60% background: `#F5F4F0` (warm cream)
- 30% surface: `#1C2333` (deep navy — used in header/cards)
- 10% accent: `#C9A84C` (matte gold — links, buttons, skill bars)

## Key files
- `src/store/cvStore.ts` — all state and actions (Zustand)
- `src/types/cv.types.ts` — TypeScript interfaces for CV data
- `src/data/defaultCv.ts` — seed data shown to new users
- `src/hooks/usePdfExport.ts` — PDF generation logic
- `src/components/editor/EditableField.tsx` — core inline edit component
- `src/components/editor/EditToolbar.tsx` — floating toolbar (Edit/Save/PDF)
- `src/components/pdf/CvPdfDocument.tsx` — PDF document layout (@react-pdf/renderer)

## Architecture
- Edit mode is a global boolean in Zustand (`isEditMode`)
- `EditableField` renders `<span>` in view mode, `<input>/<textarea>` in edit mode
- Data auto-persists to localStorage on every change
- PDF export: rendered via `@react-pdf/renderer` as a separate document component

## Commands
```bash
npm run dev    # dev server
npm run build  # production build
npm run preview # preview build
```
