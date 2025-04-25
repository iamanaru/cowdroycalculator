import { useState } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { Box, Container, CssBaseline, Paper } from '@mui/material'
import Calculator from './components/Calculator'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#4caf50',
    },
  },
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Calculator />
          </Paper>
        </Box>
      </Container>
    </ThemeProvider>
  )
}

export default App
