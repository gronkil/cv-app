import { useState, useCallback } from 'react'
import {
  Fab,
  Drawer,
  Box,
  Typography,
  Chip,
  CircularProgress,
  Stack,
  IconButton,
  Alert,
} from '@mui/material'
import WorkOutlinedIcon from '@mui/icons-material/WorkOutlined'
import CloseIcon from '@mui/icons-material/Close'
import SearchIcon from '@mui/icons-material/Search'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import type { SkillEntry } from '../types/cv.types'

const NAVY = '#1C2333'
const GOLD = '#C9A84C'
const CREAM = '#F5F4F0'

interface JjtOffer {
  id: string
  title: string
  company_name: string
  city: string
  skills: { name: string; level: number }[]
  salary_from: number | null
  salary_to: number | null
  currency: string
  experience_level: string
  marker_icon: string
  remote: boolean
  workplace_type?: string
}

function scoreOffer(offer: JjtOffer, selectedSkills: string[]): number {
  const offerSkills = offer.skills.map(s => s.name.toLowerCase())
  return selectedSkills.reduce((score, skill) => {
    const normalized = skill
      .toLowerCase()
      .replace('.js', '')
      .replace(' boot', '')
      .replace(' api', '')
      .replace(' engineering', '')
    const hit = offerSkills.some(
      s => s.includes(normalized) || normalized.includes(s)
    )
    return score + (hit ? 1 : 0)
  }, 0)
}

function salaryLabel(offer: JjtOffer): string | null {
  if (!offer.salary_from && !offer.salary_to) return null
  const f = offer.salary_from ? offer.salary_from.toLocaleString('pl') : ''
  const t = offer.salary_to ? offer.salary_to.toLocaleString('pl') : ''
  const range = f && t ? `${f}–${t}` : f || t
  return `${range} ${offer.currency}/mies.`
}

const BOARDS = [
  {
    name: 'JustJoin.it',
    buildUrl: (q: string) => `https://justjoin.it/?q=${q}`,
  },
  {
    name: 'NoFluffJobs',
    buildUrl: (q: string) => `https://nofluffjobs.com/pl/jobs/search?q=${q}`,
  },
  {
    name: 'Pracuj.pl IT',
    buildUrl: (q: string) =>
      `https://it.pracuj.pl/praca;et=17%2C4?q=${q}`,
  },
]

interface Props {
  skills: SkillEntry[]
}

export function JobSearch({ skills }: Props) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(skills.filter(s => s.level >= 4).map(s => s.name))
  )
  const [offers, setOffers] = useState<JjtOffer[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  const toggleSkill = (name: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
    setStatus('idle')
    setOffers([])
  }

  const search = useCallback(async () => {
    if (selected.size === 0) return
    setStatus('loading')
    setOffers([])
    try {
      const res = await fetch('https://justjoin.it/api/offers', {
        headers: { Version: '2' },
      })
      if (!res.ok) throw new Error('api-error')
      const all: JjtOffer[] = await res.json()
      const sel = Array.from(selected)
      const results = all
        .map(o => ({ o, score: scoreOffer(o, sel) }))
        .filter(x => x.score > 0)
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score
          const bSal = (b.o.salary_from ?? 0) + (b.o.salary_to ?? 0)
          const aSal = (a.o.salary_from ?? 0) + (a.o.salary_to ?? 0)
          return bSal - aSal
        })
        .slice(0, 30)
        .map(x => x.o)
      setOffers(results)
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }, [selected])

  const searchQuery = encodeURIComponent(
    Array.from(selected).slice(0, 3).join(' ')
  )

  return (
    <>
      <Fab
        variant="extended"
        onClick={() => setOpen(true)}
        aria-label="Znajdź pracę"
        sx={{
          position: 'fixed',
          bottom: 100,
          right: 32,
          bgcolor: NAVY,
          color: GOLD,
          px: 3,
          height: 48,
          fontSize: '0.85rem',
          fontWeight: 700,
          letterSpacing: '0.04em',
          boxShadow: '0 4px 20px rgba(28,35,51,0.35)',
          '&:hover': {
            bgcolor: '#2a3448',
            transform: 'translateY(-1px)',
            boxShadow: '0 6px 24px rgba(28,35,51,0.5)',
          },
          transition: 'all 0.2s ease',
          zIndex: 1200,
        }}
      >
        <WorkOutlinedIcon sx={{ mr: 1, fontSize: 18 }} />
        Znajdź pracę
      </Fab>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: { xs: '100vw', sm: 500 },
              bgcolor: CREAM,
              display: 'flex',
              flexDirection: 'column',
            },
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            bgcolor: NAVY,
            color: 'white',
            px: 3,
            py: 2.5,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <Box>
            <Typography
              sx={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '0.02em' }}
            >
              Znajdź pracę
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', mt: 0.25 }}>
              oferty dopasowane do Twoich umiejętności
            </Typography>
          </Box>
          <IconButton
            onClick={() => setOpen(false)}
            size="small"
            sx={{ color: '#94a3b8', '&:hover': { color: 'white' } }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Scrollable body */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
          {/* Skills picker */}
          <Typography
            sx={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: '#94a3b8',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              mb: 1.5,
            }}
          >
            Wybierz umiejętności ({selected.size} zaznaczonych)
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {skills.map(skill => {
              const active = selected.has(skill.name)
              return (
                <Chip
                  key={skill.id}
                  label={skill.name}
                  onClick={() => toggleSkill(skill.name)}
                  sx={{
                    bgcolor: active ? GOLD : 'white',
                    color: active ? NAVY : '#64748b',
                    fontWeight: active ? 700 : 400,
                    fontSize: '0.78rem',
                    border: `1px solid ${active ? GOLD : '#e2e8f0'}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    '&:hover': { opacity: 0.8 },
                  }}
                />
              )
            })}
          </Box>

          {/* Search button */}
          <Box
            component="button"
            onClick={search}
            disabled={selected.size === 0 || status === 'loading'}
            sx={{
              width: '100%',
              py: 1.5,
              bgcolor: GOLD,
              color: NAVY,
              fontWeight: 700,
              fontSize: '0.9rem',
              border: 'none',
              borderRadius: '10px',
              cursor: selected.size === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              mb: 3,
              opacity: selected.size === 0 ? 0.5 : 1,
              transition: 'all 0.2s',
              '&:hover:not(:disabled)': { bgcolor: '#b8963a' },
            }}
          >
            {status === 'loading' ? (
              <>
                <CircularProgress size={16} sx={{ color: NAVY }} />
                Szukam ofert…
              </>
            ) : (
              <>
                <SearchIcon sx={{ fontSize: 18 }} />
                Szukaj ofert
              </>
            )}
          </Box>

          {/* API error fallback */}
          {status === 'error' && (
            <Alert
              severity="warning"
              sx={{ mb: 2, fontSize: '0.82rem', borderRadius: '8px' }}
            >
              Nie udało się pobrać ofert bezpośrednio (CORS). Skorzystaj z linków poniżej.
            </Alert>
          )}

          {/* Results */}
          {status === 'done' && (
            <Box sx={{ mb: 3 }}>
              <Typography
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: '#94a3b8',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  mb: 1.5,
                }}
              >
                {offers.length > 0
                  ? `${offers.length} dopasowanych ofert`
                  : 'Brak bezpośrednich dopasowań'}
              </Typography>
              <Stack spacing={1.5}>
                {offers.map(offer => {
                  const sal = salaryLabel(offer)
                  return (
                    <Box
                      key={offer.id}
                      component="a"
                      href={`https://justjoin.it/offers/${offer.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        display: 'block',
                        bgcolor: 'white',
                        borderRadius: '10px',
                        p: 2,
                        textDecoration: 'none',
                        border: '1px solid #e2e8f0',
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: GOLD,
                          boxShadow: `0 2px 16px ${GOLD}30`,
                          transform: 'translateY(-1px)',
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          gap: 1,
                        }}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            sx={{
                              fontWeight: 700,
                              color: NAVY,
                              fontSize: '0.875rem',
                              lineHeight: 1.3,
                            }}
                          >
                            {offer.title}
                          </Typography>
                          <Typography
                            sx={{
                              color: GOLD,
                              fontWeight: 600,
                              fontSize: '0.78rem',
                              mt: 0.25,
                            }}
                          >
                            {offer.company_name}
                          </Typography>
                        </Box>
                        <OpenInNewIcon
                          sx={{ fontSize: 14, color: '#cbd5e1', flexShrink: 0, mt: 0.25 }}
                        />
                      </Box>

                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          mt: 0.75,
                          flexWrap: 'wrap',
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.25,
                          }}
                        >
                          <LocationOnOutlinedIcon
                            sx={{ fontSize: 12, color: '#94a3b8' }}
                          />
                          <Typography sx={{ fontSize: '0.72rem', color: '#64748b' }}>
                            {offer.city || 'Zdalnie'}
                            {offer.remote ? ' · Zdalnie' : ''}
                          </Typography>
                        </Box>
                        {sal && (
                          <Typography
                            sx={{
                              fontSize: '0.72rem',
                              color: '#16a34a',
                              fontWeight: 700,
                            }}
                          >
                            {sal}
                          </Typography>
                        )}
                      </Box>

                      {offer.skills.length > 0 && (
                        <Box
                          sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 0.5,
                            mt: 1,
                          }}
                        >
                          {offer.skills.slice(0, 6).map(s => {
                            const matched = Array.from(selected).some(sel => {
                              const n = sel.toLowerCase().replace('.js', '').replace(' boot', '')
                              return s.name.toLowerCase().includes(n) || n.includes(s.name.toLowerCase())
                            })
                            return (
                              <Chip
                                key={s.name}
                                label={s.name}
                                size="small"
                                sx={{
                                  fontSize: '0.65rem',
                                  height: 18,
                                  bgcolor: matched ? `${GOLD}20` : '#f1f5f9',
                                  color: matched ? NAVY : '#94a3b8',
                                  fontWeight: matched ? 700 : 400,
                                  border: matched
                                    ? `1px solid ${GOLD}50`
                                    : '1px solid transparent',
                                  '& .MuiChip-label': { px: 0.75 },
                                }}
                              />
                            )
                          })}
                        </Box>
                      )}
                    </Box>
                  )
                })}
              </Stack>
            </Box>
          )}

          {/* Always-visible direct links */}
          <Box
            sx={{
              borderTop: '1px solid #e2e8f0',
              pt: 2.5,
              mt: status === 'idle' ? 0 : 1,
            }}
          >
            <Typography
              sx={{
                fontSize: '0.7rem',
                fontWeight: 700,
                color: '#94a3b8',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                mb: 1.5,
              }}
            >
              Szukaj bezpośrednio
            </Typography>
            <Stack spacing={1}>
              {BOARDS.map(board => (
                <Box
                  key={board.name}
                  component="a"
                  href={board.buildUrl(searchQuery)}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 2.5,
                    py: 1.5,
                    bgcolor: 'white',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: NAVY,
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: GOLD,
                      bgcolor: `${GOLD}08`,
                    },
                  }}
                >
                  {board.name}
                  <OpenInNewIcon sx={{ fontSize: 15, color: GOLD }} />
                </Box>
              ))}
            </Stack>
          </Box>
        </Box>
      </Drawer>
    </>
  )
}
