import { Box, Avatar, Typography, Stack, Divider, Chip, LinearProgress } from '@mui/material'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import type { CvData } from '../../types/cv.types'
import type { Lang } from '../../i18n/labels'
import { labels } from '../../i18n/labels'

const GOLD = '#C9A84C'
const LIGHT = 'rgba(255,255,255,0.85)'
const DIM = 'rgba(255,255,255,0.70)'
const DIVIDER = 'rgba(255,255,255,0.15)'

interface Props { data: CvData; lang: Lang }

export function CvSidebar({ data, lang }: Props) {
  const t = labels[lang]
  const { personal, skills, languages, education, interests } = data
  const categories = [...new Set(skills.map(s => s.category))]
  const initials = personal.name.split(' ').map(n => n[0]).join('').slice(0, 2)

  return (
    <Box sx={{ p: { xs: 3, md: 3.5 }, height: '100%' }}>
      {/* Avatar */}
      <Stack sx={{ alignItems: 'center', mb: 3 }}>
        <Avatar
          src={personal.avatarUrl || undefined}
          sx={{
            width: { xs: 80, md: 100 },
            height: { xs: 80, md: 100 },
            bgcolor: GOLD,
            color: '#1C2333',
            fontSize: { xs: '1.75rem', md: '2rem' },
            fontWeight: 800,
            border: '3px solid rgba(201,168,76,0.4)',
          }}
        >
          {!personal.avatarUrl && initials}
        </Avatar>
      </Stack>

      {/* Contact */}
      <SectionLabel text={t.contact} />
      <Stack spacing={1.25} sx={{ mb: 3 }}>
        {personal.email && (
          <ContactRow icon={<EmailOutlinedIcon sx={{ fontSize: 15 }} />} text={personal.email} href={`mailto:${personal.email}`} />
        )}
        {personal.location && (
          <ContactRow icon={<LocationOnOutlinedIcon sx={{ fontSize: 15 }} />} text={personal.location} />
        )}
        {personal.linkedin && (
          <ContactRow icon={<LinkedInIcon sx={{ fontSize: 15 }} />} text="LinkedIn" href={personal.linkedin} />
        )}
      </Stack>

      <Divider sx={{ borderColor: DIVIDER, mb: 2.5 }} />

      {/* Skills */}
      <SectionLabel text={t.skills} />
      {categories.map(cat => (
        <Box key={cat} sx={{ mb: 2 }}>
          <Typography sx={{ color: GOLD, fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 0.75 }}>
            {cat}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {skills.filter(s => s.category === cat).map(skill => (
              <Chip
                key={skill.id}
                label={
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '3px', py: '3px' }}>
                    <span>{skill.name}</span>
                    <Box sx={{ display: 'flex', gap: '2px' }}>
                      {[1,2,3,4,5].map(i => (
                        <Box key={i} sx={{ flex: 1, height: 3, borderRadius: 1, bgcolor: i <= skill.level ? GOLD : 'rgba(255,255,255,0.2)' }} />
                      ))}
                    </Box>
                  </Box>
                }
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.08)',
                  color: LIGHT,
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  height: 'auto',
                  border: '1px solid rgba(255,255,255,0.12)',
                  '& .MuiChip-label': { display: 'flex', px: 1 },
                  '&:hover': { bgcolor: 'rgba(201,168,76,0.2)', borderColor: GOLD },
                }}
              />
            ))}
          </Box>
        </Box>
      ))}

      <Divider sx={{ borderColor: DIVIDER, mb: 2.5 }} />

      {/* Languages */}
      <SectionLabel text={t.languages} />
      <Stack spacing={1.5} sx={{ mb: 3 }}>
        {languages.map(lang => (
          <Box key={lang.id}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography sx={{ color: LIGHT, fontSize: '0.8rem', fontWeight: 500 }}>{lang.language}</Typography>
              <Typography sx={{ color: GOLD, fontSize: '0.72rem', fontWeight: 700 }}>{lang.level}</Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={langLevelToPercent(lang.level)}
              sx={{
                height: 7,
                borderRadius: 2,
                bgcolor: 'rgba(255,255,255,0.1)',
                '& .MuiLinearProgress-bar': { bgcolor: GOLD, borderRadius: 2 },
              }}
            />
          </Box>
        ))}
      </Stack>

      <Divider sx={{ borderColor: DIVIDER, mb: 2.5 }} />

      {/* Education */}
      <SectionLabel text={t.education} />
      <Stack spacing={1.5} sx={{ mb: interests.length ? 2.5 : 0 }}>
        {education.map(edu => (
          <Box key={edu.id}>
            <Typography sx={{ color: LIGHT, fontSize: '0.8rem', fontWeight: 600, lineHeight: 1.3 }}>{edu.school}</Typography>
            <Typography sx={{ color: GOLD, fontSize: '0.72rem', fontWeight: 600, mt: 0.25 }}>{edu.field} · {edu.degree}</Typography>
            {edu.endDate && (
              <Typography sx={{ color: DIM, fontSize: '0.68rem', mt: 0.25 }}>{edu.endDate}</Typography>
            )}
          </Box>
        ))}
      </Stack>

      {/* Interests */}
      {interests.length > 0 && (
        <>
          <Divider sx={{ borderColor: DIVIDER, mb: 2.5 }} />
          <SectionLabel text={t.interests} />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {interests.map(item => (
              <Chip
                key={item}
                label={item}
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.07)',
                  color: LIGHT,
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  height: 22,
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              />
            ))}
          </Box>
        </>
      )}
    </Box>
  )
}

function SectionLabel({ text }: { text: string }) {
  return (
    <Typography sx={{ color: GOLD, fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', mb: 1.25 }}>
      {text}
    </Typography>
  )
}

function ContactRow({ icon, text, href }: { icon: React.ReactNode; text: string; href?: string }) {
  const inner = (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <Box sx={{ color: GOLD, display: 'flex', flexShrink: 0 }}>{icon}</Box>
      <Typography sx={{ color: LIGHT, fontSize: '0.75rem', wordBreak: 'break-all', lineHeight: 1.4 }}>
        {text}
      </Typography>
    </Stack>
  )

  if (href) {
    return (
      <Box
        component="a"
        href={href}
        target={href.startsWith('http') ? '_blank' : undefined}
        rel="noopener noreferrer"
        sx={{ textDecoration: 'none', '&:hover .MuiTypography-root': { color: GOLD } }}
      >
        {inner}
      </Box>
    )
  }
  return <Box>{inner}</Box>
}

function langLevelToPercent(level: string): number {
  const map: Record<string, number> = {
    'Ojczysty': 100, 'Native': 100,
    'C2': 95, 'C1': 80, 'B2': 65, 'B1': 50, 'A2': 35, 'A1': 20,
  }
  return map[level] ?? 50
}
