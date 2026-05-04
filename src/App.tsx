import { Box, Container, Fab, CircularProgress, Paper, Typography } from '@mui/material'
import DownloadIcon from '@mui/icons-material/Download'
import { cvData } from './data/defaultCv'
import { usePdfExport } from './hooks/usePdfExport'
import { CvSidebar } from './components/cv/CvSidebar'
import { CvMain } from './components/cv/CvMain'

export default function App() {
  const { exportPdf, isExporting } = usePdfExport()

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: { xs: 0, sm: 3, md: 5 } }}>
      <Container maxWidth="lg" sx={{ px: { xs: 0, sm: 2, md: 3 } }}>
        <Paper
          id="cv-document"
          elevation={6}
          sx={{ borderRadius: { xs: 0, sm: 2 }, overflow: 'hidden' }}
        >
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'stretch' }}>
            <Box sx={{ width: { xs: '100%', md: '33%' }, flexShrink: 0, bgcolor: '#1C2333' }}>
              <CvSidebar data={cvData} />
            </Box>
            <Box sx={{ flex: 1, bgcolor: '#FAFAF8', minWidth: 0 }}>
              <CvMain data={cvData} />
            </Box>
          </Box>
        </Paper>
      </Container>

      <Fab
        variant="extended"
        onClick={exportPdf}
        disabled={isExporting}
        aria-label="Pobierz PDF"
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
          {isExporting ? 'Generuję…' : 'Pobierz CV'}
        </Typography>
      </Fab>
    </Box>
  )
}
