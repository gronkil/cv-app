export type Lang = 'pl' | 'en'

export const labels = {
  pl: {
    contact: 'Dane kontaktowe',
    skills: 'Umiejętności',
    languages: 'Języki',
    education: 'Wykształcenie',
    interests: 'Zainteresowania',
    profile: 'Profil osobisty',
    experience: 'Doświadczenie zawodowe',
    projects: 'Projekty własne',
    download: 'Pobierz CV',
    generating: 'Generuję…',
  },
  en: {
    contact: 'Contact',
    skills: 'Skills',
    languages: 'Languages',
    education: 'Education',
    interests: 'Interests',
    profile: 'Personal Profile',
    experience: 'Work Experience',
    projects: 'Personal Projects',
    download: 'Download CV',
    generating: 'Generating…',
  },
} satisfies Record<Lang, Record<string, string>>
