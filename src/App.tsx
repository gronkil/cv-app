import { useState } from 'react'
import { Box, Container, Fab, CircularProgress, Paper, Typography } from '@mui/material'
import DownloadIcon from '@mui/icons-material/Download'
import { cvData } from './data/defaultCv'
import { cvDataEn } from './data/defaultCvEn'
import { usePdfExport } from './hooks/usePdfExport'
import { CvSidebar } from './components/cv/CvSidebar'
import { CvMain } from './components/cv/CvMain'
import type { Lang } from './i18n/labels'
import { labels } from './i18n/labels'

const cvByLang = { pl: cvData, en: cvDataEn }

export default function App() {
  const [lang, setLang] = useState<Lang>('pl')
  const { exportPdf, isExporting } = usePdfExport()
  const t = labels[lang]
  const data = cvByLang[lang]

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pt: { xs: 0, sm: 3, md: 5 }, pb: { xs: 10, sm: 3, md: 5 } }}>
      <Container maxWidth="lg" sx={{ px: { xs: 0, sm: 2, md: 3 } }}>
        <Box sx={{ position: 'relative' }}>
          <Paper
            id="cv-document"
            elevation={6}
            sx={{ borderRadius: { xs: 0, sm: 2 }, overflow: 'hidden' }}
          >
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'stretch' }}>
              <Box sx={{ width: { xs: '100%', md: '33%' }, flexShrink: 0, bgcolor: '#1C2333' }}>
                <CvSidebar data={data} lang={lang} />
              </Box>
              <Box sx={{ flex: 1, bgcolor: '#FAFAF8', minWidth: 0 }}>
                <CvMain data={data} lang={lang} />
              </Box>
            </Box>
          </Paper>

          {/* Language toggle — badge on top-right corner of document */}
          <Box sx={{
            position: 'absolute',
            top: { xs: 12, sm: -14 },
            right: { xs: 12, sm: 12 },
            display: 'inline-flex',
            bgcolor: 'white',
            borderRadius: '24px',
            p: '3px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
            gap: '2px',
            zIndex: 10,
          }}>
            {(['pl', 'en'] as Lang[]).map(l => (
              <Box
                key={l}
                component="button"
                onClick={() => setLang(l)}
                sx={{
                  px: 2,
                  py: 0.5,
                  borderRadius: '20px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  cursor: 'pointer',
                  border: 'none',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  bgcolor: lang === l ? '#1C2333' : 'transparent',
                  color: lang === l ? '#C9A84C' : '#94a3b8',
                  boxShadow: lang === l ? '0 2px 6px rgba(28,35,51,0.2)' : 'none',
                  '&:hover': { color: lang === l ? '#C9A84C' : '#1C2333' },
                }}
              >
                {l.toUpperCase()}
              </Box>
            ))}
          </Box>
        </Box>
      </Container>

      <Fab
        variant="extended"
        onClick={() => exportPdf(data, lang)}
        disabled={isExporting}
        aria-label={t.download}
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          bgcolor: '#C9A84C',
          color: '#1C2333',
          px: 3,
          height: 52,
          fontSize: '0.875rem',
          fontWeight: 700,
          letterSpacing: '0.04em',
          boxShadow: '0 4px 20px rgba(201,168,76,0.5)',
          '&:hover': {
            bgcolor: '#b8963a',
            boxShadow: '0 6px 24px rgba(201,168,76,0.65)',
            transform: 'translateY(-1px)',
          },
          '&.Mui-disabled': { bgcolor: '#ccc', boxShadow: 'none' },
          transition: 'all 0.2s ease',
        }}
      >
        {isExporting
          ? <CircularProgress size={20} sx={{ color: '#1C2333', mr: 1.5 }} />
          : <DownloadIcon sx={{ mr: 1.5, fontSize: 20 }} />}
        <Typography component="span" sx={{ fontWeight: 700, fontSize: '0.875rem', letterSpacing: '0.04em' }}>
          {isExporting ? t.generating : t.download}
        </Typography>
      </Fab>
    </Box>
  )
}
