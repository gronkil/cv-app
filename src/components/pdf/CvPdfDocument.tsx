import { Document, Page, View, Text, StyleSheet, Font, Link } from '@react-pdf/renderer'
import type { CvData } from '../../types/cv.types'

Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/roboto/v51/KFOMCnqEu92Fr1ME7kSn66aGLdTylUAMQXC89YmC2DPNWubEbVmaiA8.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://fonts.gstatic.com/s/roboto/v51/KFOMCnqEu92Fr1ME7kSn66aGLdTylUAMQXC89YmC2DPNWuYjalmaiA8.ttf',
      fontWeight: 700,
    },
  ],
})

Font.registerHyphenationCallback(word => [word])

const NAVY = '#1C2333'
const GOLD = '#C9A84C'
const LIGHT = '#CBD5E0'
const DIM = '#718096'
const BODY = '#4A5568'
const SIDEBAR_BG = '#1C2333'
const MAIN_BG = '#FAFAF8'
const DIVIDER_DARK = '#2D3748'
const DIVIDER_LIGHT = '#E8E9EC'

const s = StyleSheet.create({
  page: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    fontFamily: 'Roboto',
  },

  // ── SIDEBAR ──
  sidebar: {
    width: '33%',
    backgroundColor: SIDEBAR_BG,
    padding: 20,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 14,
  },
  avatarInitials: {
    color: NAVY,
    fontSize: 26,
    fontWeight: 700,
  },
  sidebarSectionLabel: {
    color: GOLD,
    fontSize: 6,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 1.8,
    marginBottom: 7,
  },
  sidebarDivider: {
    borderBottomWidth: 1,
    borderBottomColor: DIVIDER_DARK,
    marginVertical: 11,
  },
  contactText: {
    color: LIGHT,
    fontSize: 7.5,
    marginBottom: 5,
    lineHeight: 1.4,
  },
  contactLink: {
    color: GOLD,
    fontSize: 7.5,
    marginBottom: 5,
    textDecoration: 'none',
  },
  categoryLabel: {
    color: GOLD,
    fontSize: 6,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginTop: 7,
    marginBottom: 4,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    backgroundColor: '#2D3748',
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 2,
    marginRight: 3,
    marginBottom: 3,
  },
  chipText: {
    color: LIGHT,
    fontSize: 6.5,
  },
  langRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  langName: {
    color: LIGHT,
    fontSize: 7.5,
    fontWeight: 700,
  },
  langLevel: {
    color: GOLD,
    fontSize: 7,
    fontWeight: 700,
  },
  progressTrack: {
    height: 3,
    backgroundColor: '#2D3748',
    borderRadius: 2,
    marginBottom: 7,
  },
  progressFill: {
    height: 3,
    backgroundColor: GOLD,
    borderRadius: 2,
  },
  eduSchool: {
    color: LIGHT,
    fontSize: 7.5,
    fontWeight: 700,
    lineHeight: 1.3,
  },
  eduField: {
    color: GOLD,
    fontSize: 7,
    marginTop: 2,
  },
  eduLocation: {
    color: DIM,
    fontSize: 6.5,
    marginTop: 1,
  },

  // ── MAIN CONTENT ──
  main: {
    width: '67%',
    backgroundColor: MAIN_BG,
    padding: 24,
  },
  name: {
    fontSize: 26,
    fontWeight: 700,
    color: NAVY,
    lineHeight: 1.1,
    letterSpacing: -0.3,
  },
  jobTitle: {
    fontSize: 8,
    fontWeight: 700,
    color: GOLD,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  goldAccent: {
    width: 36,
    height: 3,
    backgroundColor: GOLD,
    borderRadius: 2,
    marginTop: 9,
    marginBottom: 15,
  },
  mainSectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
  },
  mainSectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: GOLD,
    marginRight: 6,
  },
  mainSectionLabel: {
    fontSize: 7.5,
    fontWeight: 700,
    color: NAVY,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  summary: {
    fontSize: 8.5,
    color: BODY,
    lineHeight: 1.75,
    marginBottom: 13,
  },
  mainDivider: {
    marginBottom: 11,
  },
  expHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  expRole: {
    fontSize: 9.5,
    fontWeight: 700,
    color: NAVY,
    lineHeight: 1.25,
  },
  expCompany: {
    fontSize: 8,
    fontWeight: 700,
    color: GOLD,
    marginTop: 2,
  },
  expBadge: {
    backgroundColor: '#F5F2E7',
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexShrink: 0,
  },
  expBadgeText: {
    fontSize: 6.5,
    fontWeight: 700,
    color: NAVY,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 2.5,
  },
  bulletDot: {
    width: 3.5,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: GOLD,
    marginTop: 3.5,
    marginRight: 5,
    flexShrink: 0,
  },
  bulletText: {
    fontSize: 7.5,
    color: BODY,
    lineHeight: 1.6,
    flex: 1,
  },
  expGap: {
    marginVertical: 9,
  },
})

function langPercent(level: string): string {
  const map: Record<string, number> = {
    Ojczysty: 100, Native: 100, C2: 95, C1: 80, B2: 65, B1: 50, A2: 35, A1: 20,
  }
  return `${map[level] ?? 50}%`
}

interface Props { data: CvData }

export function CvPdfDocument({ data }: Props) {
  const { personal, experience, education, skills, languages, interests, projects } = data
  const categories = [...new Set(skills.map(s => s.category))]
  const initials = personal.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <Document title={`${personal.name} – CV`} author={personal.name}>
      <Page size="A4" style={s.page}>

        {/* ── SIDEBAR ── */}
        <View style={s.sidebar}>
          <View style={s.avatar}>
            <Text style={s.avatarInitials}>{initials}</Text>
          </View>

          <Text style={s.sidebarSectionLabel}>Dane kontaktowe</Text>
          {personal.email && <Text style={s.contactText}>{personal.email}</Text>}
          {personal.phone && <Text style={s.contactText}>{personal.phone}</Text>}
          {personal.location && <Text style={s.contactText}>{personal.location}</Text>}
          {personal.linkedin && (
            <Link src={personal.linkedin} style={s.contactLink}>LinkedIn</Link>
          )}

          <View style={s.sidebarDivider} />

          <Text style={s.sidebarSectionLabel}>Umiejętności</Text>
          {categories.map(cat => (
            <View key={cat}>
              <Text style={s.categoryLabel}>{cat}</Text>
              <View style={s.chipsWrap}>
                {skills.filter(sk => sk.category === cat).map(sk => (
                  <View key={sk.id} style={s.chip}>
                    <Text style={s.chipText}>{sk.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}

          <View style={s.sidebarDivider} />

          <Text style={s.sidebarSectionLabel}>Języki</Text>
          {languages.map(lang => (
            <View key={lang.id}>
              <View style={s.langRow}>
                <Text style={s.langName}>{lang.language}</Text>
                <Text style={s.langLevel}>{lang.level}</Text>
              </View>
              <View style={s.progressTrack}>
                <View style={[s.progressFill, { width: langPercent(lang.level) }]} />
              </View>
            </View>
          ))}

          <View style={s.sidebarDivider} />

          <Text style={s.sidebarSectionLabel}>Wykształcenie</Text>
          {education.map(edu => (
            <View key={edu.id} style={{ marginBottom: 6 }}>
              <Text style={s.eduSchool}>{edu.school}</Text>
              <Text style={s.eduField}>{edu.field} · {edu.degree}</Text>
              {edu.endDate && <Text style={s.eduLocation}>{edu.endDate}</Text>}
            </View>
          ))}

          {interests.length > 0 && (
            <>
              <View style={s.sidebarDivider} />
              <Text style={s.sidebarSectionLabel}>Zainteresowania</Text>
              <View style={s.chipsWrap}>
                {interests.map(item => (
                  <View key={item} style={s.chip}>
                    <Text style={s.chipText}>{item}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>

        {/* ── MAIN ── */}
        <View style={s.main}>
          <Text style={s.name}>{personal.name}</Text>
          <Text style={s.jobTitle}>{personal.title}</Text>
          <View style={s.goldAccent} />

          <View style={s.mainSectionRow}>
            <View style={s.mainSectionDot} />
            <Text style={s.mainSectionLabel}>Profil osobisty</Text>
          </View>
          <Text style={s.summary}>{personal.summary}</Text>

          <View style={s.mainDivider} />

          <View style={s.mainSectionRow}>
            <View style={s.mainSectionDot} />
            <Text style={s.mainSectionLabel}>Doświadczenie zawodowe</Text>
          </View>

          {experience.map((exp, idx) => (
            <View key={exp.id}>
              <View style={s.expHeader}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={s.expRole}>{exp.role}</Text>
                  <Text style={s.expCompany}>{exp.company}</Text>
                </View>
                <View style={s.expBadge}>
                  <Text style={s.expBadgeText}>{exp.startDate} – {exp.endDate}</Text>
                </View>
              </View>
              {exp.description.map((line, i) => (
                <View key={i} style={s.bulletRow}>
                  <View style={s.bulletDot} />
                  <Text style={s.bulletText}>{line}</Text>
                </View>
              ))}
              {idx < experience.length - 1 && <View style={s.expGap} />}
            </View>
          ))}

          {projects.length > 0 && (
            <>
              <View style={s.mainDivider} />
              <View style={s.mainSectionRow}>
                <View style={s.mainSectionDot} />
                <Text style={s.mainSectionLabel}>Projekty własne</Text>
              </View>
              {projects.map((proj, idx) => (
                <View key={proj.id}>
                  <View style={s.expHeader}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={s.expRole}>{proj.name}</Text>
                      <Text style={s.expCompany}>{proj.tech}</Text>
                    </View>
                  </View>
                  {proj.description.map((line, i) => (
                    <View key={i} style={s.bulletRow}>
                      <View style={s.bulletDot} />
                      <Text style={s.bulletText}>{line}</Text>
                    </View>
                  ))}
                  {idx < projects.length - 1 && <View style={s.expGap} />}
                </View>
              ))}
            </>
          )}
        </View>

      </Page>
    </Document>
  )
}
