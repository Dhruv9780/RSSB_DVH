import {
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { adminApi } from '../services/admin-api';

export const ActivityPage = () => {
  const [action, setAction] = useState('');
  const [entity, setEntity] = useState('');

  const queryKey = useMemo(() => ['admin-activity', action, entity], [action, entity]);

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      adminApi.listActivity({
        action: action || undefined,
        entity: entity || undefined,
      }),
  });

  const exportMutation = useMutation({
    mutationFn: () => adminApi.exportActivityCsv({ action: action || undefined, entity: entity || undefined }),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `activity-${new Date().toISOString().slice(0, 10)}.csv`;
      anchor.click();
      window.URL.revokeObjectURL(url);
    },
  });

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={700}>
        Audit Logs
      </Typography>

      <Button variant="outlined" onClick={() => exportMutation.mutate()} disabled={exportMutation.isPending}>
        Export CSV
      </Button>

      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            fullWidth
            label="Action filter"
            value={action}
            onChange={(event) => setAction(event.target.value)}
          />

          <FormControl fullWidth>
            <InputLabel id="entity-filter-label">Entity</InputLabel>
            <Select
              labelId="entity-filter-label"
              label="Entity"
              value={entity}
              onChange={(event) => setEntity(event.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="User">User</MenuItem>
              <MenuItem value="FoundItem">Found Item</MenuItem>
              <MenuItem value="LostReport">Lost Report</MenuItem>
              <MenuItem value="Category">Category</MenuItem>
              <MenuItem value="Location">Location</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      <Paper sx={{ p: 0, overflowX: 'auto' }}>
        {isLoading || !data ? (
          <Stack p={3} alignItems="center">
            <CircularProgress size={28} />
          </Stack>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Entity</TableCell>
                <TableCell>Entity ID</TableCell>
                <TableCell>IP</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                  <TableCell>{log.user?.fullName || log.user?.username || 'System'}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>{log.entity}</TableCell>
                  <TableCell>{log.entityId || '-'}</TableCell>
                  <TableCell>{log.ipAddress || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Stack>
  );
};