import { Alert, Chip, CircularProgress, List, ListItem, ListItemText, Paper, Stack, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';

import { systemApi } from '../services/system-api';

export const SystemPage = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['system-health'],
    queryFn: systemApi.health,
    refetchInterval: 30000,
  });

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={700}>
        System & Backups
      </Typography>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" mb={1}>
          API Health
        </Typography>
        {isLoading ? <CircularProgress size={24} /> : null}
        {isError ? <Alert severity="error">Backend health check failed.</Alert> : null}
        {data ? (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <Chip
              color={data.status === 'ok' ? 'success' : 'warning'}
              label={`Status: ${data.status}`}
            />
            <Typography variant="body2" color="text.secondary">
              Service: {data.service}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Checked: {new Date(data.timestamp).toLocaleString()}
            </Typography>
          </Stack>
        ) : null}
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" mb={1}>
          Backup Checklist
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText primary="Database backups" secondary="Use Supabase scheduled backups or point-in-time restore policy." />
          </ListItem>
          <ListItem>
            <ListItemText primary="Media backups" secondary="Store uploads in Supabase Storage/S3 and apply lifecycle policy." />
          </ListItem>
          <ListItem>
            <ListItemText primary="Env and secret recovery" secondary="Keep JWT and deployment env values in Vercel/Supabase secret manager." />
          </ListItem>
          <ListItem>
            <ListItemText primary="Restore drill" secondary="Perform monthly restore verification in staging." />
          </ListItem>
        </List>
      </Paper>
    </Stack>
  );
};