import type { CvData } from '../types/cv.types'

export const defaultCv: CvData = {
  personal: {
    name: 'Twoje Imię i Nazwisko',
    title: 'Frontend Developer',
    email: 'email@example.com',
    phone: '+48 000 000 000',
    location: 'Warszawa, Polska',
    linkedin: 'https://linkedin.com/in/twoj-profil',
    github: 'https://github.com/twoj-profil',
    avatarUrl: '',
    summary:
      'Doświadczony developer z pasją do tworzenia eleganckich i wydajnych aplikacji webowych. Specjalizuję się w React i TypeScript, ze szczególnym naciskiem na jakość kodu i doświadczenie użytkownika.',
  },
  experience: [
    {
      id: crypto.randomUUID(),
      company: 'Nazwa Firmy',
      role: 'Senior Frontend Developer',
      startDate: '2022-01',
      endDate: 'obecnie',
      description:
        'Projektowanie i implementacja interfejsów użytkownika w React. Optymalizacja wydajności aplikacji, mentoring junior developerów oraz prowadzenie code review.',
    },
    {
      id: crypto.randomUUID(),
      company: 'Poprzednia Firma',
      role: 'Frontend Developer',
      startDate: '2019-06',
      endDate: '2021-12',
      description:
        'Tworzenie responsywnych aplikacji webowych, współpraca z zespołem designerów i backend developerów. Wdrożenie systemu komponentów zgodnego z design systemem.',
    },
  ],
  education: [
    {
      id: crypto.randomUUID(),
      school: 'Politechnika Warszawska',
      degree: 'Magister',
      field: 'Informatyka',
      startDate: '2015',
      endDate: '2020',
    },
  ],
  skills: [
    { id: crypto.randomUUID(), name: 'React', level: 5 },
    { id: crypto.randomUUID(), name: 'TypeScript', level: 5 },
    { id: crypto.randomUUID(), name: 'Node.js', level: 4 },
    { id: crypto.randomUUID(), name: 'Tailwind CSS', level: 4 },
    { id: crypto.randomUUID(), name: 'GraphQL', level: 3 },
    { id: crypto.randomUUID(), name: 'Docker', level: 3 },
  ],
  languages: [
    { id: crypto.randomUUID(), language: 'Polski', level: 'Ojczysty' },
    { id: crypto.randomUUID(), language: 'Angielski', level: 'C1 – Zaawansowany' },
    { id: crypto.randomUUID(), language: 'Niemiecki', level: 'B1 – Średniozaawansowany' },
  ],
}
