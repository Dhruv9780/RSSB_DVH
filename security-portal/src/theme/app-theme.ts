import { createTheme } from '@mui/material';

export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0f4c5c',
    },
    secondary: {
      main: '#2f855a',
    },
    background: {
      default: '#f4f7f8',
    },
  },
  shape: {
    borderRadius: 10,
  },
});
