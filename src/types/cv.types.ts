export interface PersonalInfo {
  name: string
  title: string
  email: string
  phone: string
  location: string
  linkedin: string
  github: string
  avatarUrl: string
  summary: string
}

export interface ExperienceEntry {
  id: string
  company: string
  role: string
  startDate: string
  endDate: string
  description: string
}

export interface EducationEntry {
  id: string
  school: string
  degree: string
  field: string
  startDate: string
  endDate: string
}

export interface SkillEntry {
  id: string
  name: string
  level: 1 | 2 | 3 | 4 | 5
}

export interface LanguageEntry {
  id: string
  language: string
  level: string
}

export interface CvData {
  personal: PersonalInfo
  experience: ExperienceEntry[]
  education: EducationEntry[]
  skills: SkillEntry[]
  languages: LanguageEntry[]
}
