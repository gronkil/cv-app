import { renderToString } from 'react-dom/server'
import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import createEmotionServer from '@emotion/server/create-instance'
import { ThemeProvider, CssBaseline, Box, Container, Paper } from '@mui/material'
import { theme } from './theme'
import { cvData } from './data/defaultCv'
import { CvSidebar } from './components/cv/CvSidebar'
import { CvMain } from './components/cv/CvMain'

/**
 * Build-time prerender of the default (Polish) CV into static HTML so that
 * crawlers and link-preview bots receive the full CV text without executing
 * JavaScript. On the client, main.tsx renders the interactive app (with the
 * PL/EN toggle and PDF export) into the same #root, replacing this snapshot.
 */
export function render(): { html: string; styles: string } {
  const cache = createCache({ key: 'css' })
  const { extractCriticalToChunks, constructStyleTagsFromChunks } =
    createEmotionServer(cache)

  const html = renderToString(
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 5 }}>
          <Container maxWidth="lg">
            <Paper id="cv-document" elevation={6} sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'stretch' }}>
                <Box sx={{ width: { xs: '100%', md: '33%' }, flexShrink: 0, bgcolor: '#1C2333' }}>
                  <CvSidebar data={cvData} lang="pl" />
                </Box>
                <Box sx={{ flex: 1, bgcolor: '#FAFAF8', minWidth: 0 }}>
                  <CvMain data={cvData} lang="pl" />
                </Box>
              </Box>
            </Paper>
          </Container>
        </Box>
      </ThemeProvider>
    </CacheProvider>,
  )

  const styles = constructStyleTagsFromChunks(extractCriticalToChunks(html))
  return { html, styles }
}
