import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    primary: { main: '#1C2333' },
    secondary: { main: '#C9A84C' },
    background: { default: '#F5F4F0', paper: '#ffffff' },
    text: { primary: '#1C2333', secondary: '#5a6478' },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h3: { fontWeight: 800 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 700 },
  },
  components: {
    MuiChip: {
      styleOverrides: { root: { fontWeight: 500 } },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: 'none' } },
    },
  },
})
