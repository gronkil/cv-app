import { Box, Typography, Stack, Chip } from '@mui/material'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import WorkOutlinedIcon from '@mui/icons-material/WorkOutlined'
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined'
import type { CvData } from '../../types/cv.types'

const NAVY = '#1C2333'
const GOLD = '#C9A84C'
const BODY = '#4a5568'

interface Props { data: CvData }

export function CvMain({ data }: Props) {
  const { personal, experience, projects } = data

  return (
    <Box sx={{ p: { xs: 3, md: 4 } }}>
      {/* Name & Title */}
      <Box sx={{ mb: 3.5 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            color: NAVY,
            lineHeight: 1.1,
            fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
            letterSpacing: '-0.02em',
          }}
        >
          {personal.name}
        </Typography>
        <Typography
          sx={{
            color: GOLD,
            fontWeight: 600,
            mt: 0.75,
            fontSize: { xs: '0.8rem', md: '0.9rem' },
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          {personal.title}
        </Typography>
        <Box sx={{ mt: 2, width: 48, height: 3, bgcolor: GOLD, borderRadius: 2 }} />
      </Box>

      {/* Summary */}
      <SectionHeader icon={<PersonOutlinedIcon fontSize="small" />} title="Profil osobisty" />
      <Typography sx={{ color: BODY, lineHeight: 1.85, mb: 3.5, fontSize: '0.875rem' }}>
        {personal.summary}
      </Typography>

      {/* Experience */}
      <SectionHeader icon={<WorkOutlinedIcon fontSize="small" />} title="Doświadczenie zawodowe" />
      <Stack spacing={2.5}>
        {experience.map(exp => (
          <Box key={exp.id}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'flex-start' },
                gap: 0.75,
                mb: 1,
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 700, color: NAVY, fontSize: '0.95rem', lineHeight: 1.3 }}>
                  {exp.role}
                </Typography>
                <Typography sx={{ color: GOLD, fontWeight: 600, fontSize: '0.8rem', mt: 0.25 }}>
                  {exp.company}
                </Typography>
              </Box>
              <Chip
                label={`${exp.startDate} – ${exp.endDate}`}
                size="small"
                sx={{
                  bgcolor: `${GOLD}22`,
                  color: NAVY,
                  fontWeight: 600,
                  fontSize: '0.68rem',
                  height: 22,
                  flexShrink: 0,
                  borderRadius: '4px',
                }}
              />
            </Box>
            <Stack spacing={0.75}>
              {exp.description.map((line, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: GOLD, mt: '10px', flexShrink: 0 }} />
                  <Typography sx={{ color: BODY, fontSize: '0.82rem', lineHeight: 1.65, minWidth: 0, wordBreak: 'break-word' }}>
                    {line}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        ))}
      </Stack>

      {projects.length > 0 && (
        <>
          <Box sx={{ mt: 3 }} />
          <SectionHeader icon={<CodeOutlinedIcon fontSize="small" />} title="Projekty własne" />
          <Stack spacing={2}>
            {projects.map(proj => (
              <Box key={proj.id}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, mb: 0.75 }}>
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: NAVY, fontSize: '0.95rem', lineHeight: 1.3 }}>
                      {proj.name}
                    </Typography>
                    <Typography sx={{ color: GOLD, fontWeight: 600, fontSize: '0.72rem', mt: 0.25 }}>
                      {proj.tech}
                    </Typography>
                  </Box>
                  {proj.url && (
                    <Chip
                      component="a"
                      href={proj.url}
                      target="_blank"
                      label="GitHub"
                      size="small"
                      clickable
                      sx={{
                        bgcolor: `${GOLD}22`,
                        color: NAVY,
                        fontWeight: 600,
                        fontSize: '0.68rem',
                        height: 22,
                        flexShrink: 0,
                        borderRadius: '4px',
                      }}
                    />
                  )}
                </Box>
                <Stack spacing={0.75}>
                  {proj.description.map((line, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: GOLD, mt: '10px', flexShrink: 0 }} />
                      <Typography sx={{ color: BODY, fontSize: '0.82rem', lineHeight: 1.65, minWidth: 0, wordBreak: 'break-word' }}>
                        {line}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            ))}
          </Stack>
        </>
      )}
    </Box>
  )
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
      <Box sx={{ color: GOLD, display: 'flex' }}>{icon}</Box>
      <Typography sx={{ fontWeight: 700, color: NAVY, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        {title}
      </Typography>
    </Stack>
  )
}
