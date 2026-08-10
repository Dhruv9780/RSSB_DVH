import { createTheme } from '@mui/material';

export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1f3b4d',
    },
    secondary: {
      main: '#00796b',
    },
    background: {
      default: '#f6f8fb',
    },
  },
  shape: {
    borderRadius: 10,
  },
});
