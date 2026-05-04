import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { defaultCv } from '../data/defaultCv'
import type { CvData, ExperienceEntry, EducationEntry, SkillEntry, LanguageEntry } from '../types/cv.types'

interface CvStore {
  cv: CvData
  isEditMode: boolean
  toggleEditMode: () => void
  updatePersonal: (field: keyof CvData['personal'], value: string) => void
  addExperience: () => void
  updateExperience: (id: string, field: keyof ExperienceEntry, value: string) => void
  removeExperience: (id: string) => void
  addEducation: () => void
  updateEducation: (id: string, field: keyof EducationEntry, value: string) => void
  removeEducation: (id: string) => void
  addSkill: () => void
  updateSkill: (id: string, field: keyof SkillEntry, value: string | number) => void
  removeSkill: (id: string) => void
  addLanguage: () => void
  updateLanguage: (id: string, field: keyof LanguageEntry, value: string) => void
  removeLanguage: (id: string) => void
  resetCv: () => void
}

export const useCvStore = create<CvStore>()(
  persist(
    (set) => ({
      cv: defaultCv,
      isEditMode: false,

      toggleEditMode: () => set((s) => ({ isEditMode: !s.isEditMode })),

      updatePersonal: (field, value) =>
        set((s) => ({ cv: { ...s.cv, personal: { ...s.cv.personal, [field]: value } } })),

      addExperience: () =>
        set((s) => ({
          cv: {
            ...s.cv,
            experience: [
              {
                id: crypto.randomUUID(),
                company: 'Nowa Firma',
                role: 'Stanowisko',
                startDate: '',
                endDate: '',
                description: '',
              },
              ...s.cv.experience,
            ],
          },
        })),
      updateExperience: (id, field, value) =>
        set((s) => ({
          cv: {
            ...s.cv,
            experience: s.cv.experience.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
          },
        })),
      removeExperience: (id) =>
        set((s) => ({ cv: { ...s.cv, experience: s.cv.experience.filter((e) => e.id !== id) } })),

      addEducation: () =>
        set((s) => ({
          cv: {
            ...s.cv,
            education: [
              {
                id: crypto.randomUUID(),
                school: 'Uczelnia',
                degree: 'Stopień',
                field: 'Kierunek',
                startDate: '',
                endDate: '',
              },
              ...s.cv.education,
            ],
          },
        })),
      updateEducation: (id, field, value) =>
        set((s) => ({
          cv: {
            ...s.cv,
            education: s.cv.education.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
          },
        })),
      removeEducation: (id) =>
        set((s) => ({ cv: { ...s.cv, education: s.cv.education.filter((e) => e.id !== id) } })),

      addSkill: () =>
        set((s) => ({
          cv: {
            ...s.cv,
            skills: [...s.cv.skills, { id: crypto.randomUUID(), name: 'Umiejętność', level: 3 }],
          },
        })),
      updateSkill: (id, field, value) =>
        set((s) => ({
          cv: {
            ...s.cv,
            skills: s.cv.skills.map((sk) => (sk.id === id ? { ...sk, [field]: value } : sk)),
          },
        })),
      removeSkill: (id) =>
        set((s) => ({ cv: { ...s.cv, skills: s.cv.skills.filter((sk) => sk.id !== id) } })),

      addLanguage: () =>
        set((s) => ({
          cv: {
            ...s.cv,
            languages: [...s.cv.languages, { id: crypto.randomUUID(), language: 'Język', level: 'Poziom' }],
          },
        })),
      updateLanguage: (id, field, value) =>
        set((s) => ({
          cv: {
            ...s.cv,
            languages: s.cv.languages.map((l) => (l.id === id ? { ...l, [field]: value } : l)),
          },
        })),
      removeLanguage: (id) =>
        set((s) => ({ cv: { ...s.cv, languages: s.cv.languages.filter((l) => l.id !== id) } })),

      resetCv: () => set({ cv: defaultCv }),
    }),
    { name: 'cv-storage' }
  )
)
