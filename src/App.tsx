import { useState } from 'react'
import { Box, Container, Fab, CircularProgress, Paper, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material'
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
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: { xs: 2, sm: 0 }, mb: 1.5 }}>
          <ToggleButtonGroup
            value={lang}
            exclusive
            onChange={(_, v) => v && setLang(v)}
            size="small"
            sx={{
              bgcolor: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              '& .MuiToggleButton-root': {
                px: 2,
                py: 0.5,
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                color: '#718096',
                border: 'none',
                borderRadius: '8px !important',
                '&.Mui-selected': { bgcolor: '#1C2333', color: '#C9A84C' },
              },
            }}
          >
            <ToggleButton value="pl">PL</ToggleButton>
            <ToggleButton value="en">EN</ToggleButton>
          </ToggleButtonGroup>
        </Box>

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
      </Container>

      <Fab
        variant="extended"
        onClick={exportPdf}
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
