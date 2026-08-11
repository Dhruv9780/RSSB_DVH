import {
  Alert,
  Button,
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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { catalogApi } from '../services/catalog-api';
import { incidentsApi } from '../services/incidents-api';
import type { IncidentPriority, IncidentStatus } from '../types/api';

const getErrorMessage = (error: unknown) => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: { data?: { message?: unknown } } }).response?.data?.message === 'string'
  ) {
    return (error as { response: { data: { message: string } } }).response.data.message;
  }
  return 'Failed to process incident request';
};

const incidentStatuses: IncidentStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

export const IncidentsPage = () => {
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [priority, setPriority] = useState<IncidentPriority>('MEDIUM');
  const [location, setLocation] = useState('');
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().slice(0, 10));
  const [incidentTime, setIncidentTime] = useState('12:00');
  const [reporterName, setReporterName] = useState('');
  const [reporterContact, setReporterContact] = useState('');

  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | IncidentPriority>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | IncidentStatus>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<number | 'ALL'>('ALL');

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const categoriesQuery = useQuery({
    queryKey: ['admin-categories'],
    queryFn: catalogApi.listCategories,
  });

  const listQueryKey = useMemo(
    () => ['admin-incidents', search, priorityFilter, statusFilter, categoryFilter],
    [search, priorityFilter, statusFilter, categoryFilter],
  );

  const incidentsQuery = useQuery({
    queryKey: listQueryKey,
    queryFn: () =>
      incidentsApi.list({
        page: 1,
        pageSize: 20,
        search: search || undefined,
        priority: priorityFilter === 'ALL' ? undefined : priorityFilter,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        categoryId: categoryFilter === 'ALL' ? undefined : categoryFilter,
      }),
  });

  const createMutation = useMutation({
    mutationFn: incidentsApi.create,
    onSuccess: async (incident) => {
      setSuccessMessage(`Incident created: ${incident.incidentCode}`);
      setErrorMessage(null);
      setTitle('');
      setDescription('');
      setCategoryId('');
      setPriority('MEDIUM');
      setLocation('');
      setIncidentDate(new Date().toISOString().slice(0, 10));
      setIncidentTime('12:00');
      setReporterName('');
      setReporterContact('');
      await queryClient.invalidateQueries({ queryKey: ['admin-incidents'] });
    },
    onError: (mutationError) => {
      setSuccessMessage(null);
      setErrorMessage(getErrorMessage(mutationError));
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ incidentId, status }: { incidentId: number; status: IncidentStatus }) =>
      incidentsApi.updateStatus(incidentId, { status }),
    onSuccess: async () => {
      setErrorMessage(null);
      await queryClient.invalidateQueries({ queryKey: ['admin-incidents'] });
    },
    onError: (mutationError) => {
      setErrorMessage(getErrorMessage(mutationError));
    },
  });

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={700}>
        Incident Management
      </Typography>

      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
      {successMessage ? <Alert severity="success">{successMessage}</Alert> : null}

      <Paper sx={{ p: 2 }}>
        <Stack spacing={2}>
          <TextField label="Incident Id (Auto Generated)" value="Generated on submit" disabled />
          <TextField label="Title" value={title} onChange={(event) => setTitle(event.target.value)} required />
          <TextField
            label="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            multiline
            minRows={3}
          />

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <FormControl fullWidth>
              <InputLabel id="incident-category-label">Category</InputLabel>
              <Select
                labelId="incident-category-label"
                label="Category"
                value={categoryId === '' ? '' : String(categoryId)}
                onChange={(event) => {
                  const value = event.target.value;
                  setCategoryId(value === '' ? '' : Number(value));
                }}
              >
                <MenuItem value="">None</MenuItem>
                {categoriesQuery.data?.map((category) => (
                  <MenuItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="incident-priority-label">Priority</InputLabel>
              <Select
                labelId="incident-priority-label"
                label="Priority"
                value={priority}
                onChange={(event) => setPriority(event.target.value as IncidentPriority)}
              >
                <MenuItem value="LOW">LOW</MenuItem>
                <MenuItem value="MEDIUM">MEDIUM</MenuItem>
                <MenuItem value="HIGH">HIGH</MenuItem>
                <MenuItem value="CRITICAL">CRITICAL</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          <TextField label="Location" value={location} onChange={(event) => setLocation(event.target.value)} required />

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              label="Incident Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={incidentDate}
              onChange={(event) => setIncidentDate(event.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Incident Time"
              type="time"
              InputLabelProps={{ shrink: true }}
              value={incidentTime}
              onChange={(event) => setIncidentTime(event.target.value)}
              required
              fullWidth
            />
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              label="Reporter Name"
              value={reporterName}
              onChange={(event) => setReporterName(event.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Reporter Contact"
              value={reporterContact}
              onChange={(event) => setReporterContact(event.target.value)}
              required
              fullWidth
            />
          </Stack>

          <TextField label="Status" value="OPEN" disabled />

          <Button
            variant="contained"
            onClick={() => {
              setSuccessMessage(null);
              setErrorMessage(null);

              createMutation.mutate({
                title,
                description: description || undefined,
                categoryId: categoryId === '' ? undefined : categoryId,
                priority,
                location,
                incidentDate,
                incidentTime,
                reporterName,
                reporterContact,
                status: 'OPEN',
              });
            }}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? 'Submitting...' : 'Create Incident'}
          </Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2, overflowX: 'auto' }}>
        <Stack spacing={2}>
          <Typography variant="h6" fontWeight={700}>
            Incident Records
          </Typography>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Search"
              placeholder="Code, title, location, reporter"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <FormControl fullWidth>
              <InputLabel id="incident-priority-filter">Priority</InputLabel>
              <Select
                labelId="incident-priority-filter"
                label="Priority"
                value={priorityFilter}
                onChange={(event) => setPriorityFilter(event.target.value as 'ALL' | IncidentPriority)}
              >
                <MenuItem value="ALL">All Priorities</MenuItem>
                <MenuItem value="LOW">LOW</MenuItem>
                <MenuItem value="MEDIUM">MEDIUM</MenuItem>
                <MenuItem value="HIGH">HIGH</MenuItem>
                <MenuItem value="CRITICAL">CRITICAL</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="incident-status-filter">Status</InputLabel>
              <Select
                labelId="incident-status-filter"
                label="Status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as 'ALL' | IncidentStatus)}
              >
                <MenuItem value="ALL">All Statuses</MenuItem>
                <MenuItem value="OPEN">OPEN</MenuItem>
                <MenuItem value="IN_PROGRESS">IN_PROGRESS</MenuItem>
                <MenuItem value="RESOLVED">RESOLVED</MenuItem>
                <MenuItem value="CLOSED">CLOSED</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="incident-category-filter">Category</InputLabel>
              <Select
                labelId="incident-category-filter"
                label="Category"
                value={categoryFilter === 'ALL' ? 'ALL' : String(categoryFilter)}
                onChange={(event) => {
                  const value = event.target.value;
                  setCategoryFilter(value === 'ALL' ? 'ALL' : Number(value));
                }}
              >
                <MenuItem value="ALL">All Categories</MenuItem>
                {categoriesQuery.data?.map((category) => (
                  <MenuItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <Typography variant="body2" color="text.secondary">
            Showing {incidentsQuery.data?.incidents.length ?? 0} of {incidentsQuery.data?.pagination.total ?? 0} incidents.
          </Typography>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Incident Id</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Reported By</TableCell>
                <TableCell>Date/Time</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {incidentsQuery.data?.incidents.map((incident) => (
                <TableRow key={incident.id} hover>
                  <TableCell>{incident.incidentCode}</TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Typography variant="body2" fontWeight={600}>
                        {incident.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {incident.location}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{incident.priority}</TableCell>
                  <TableCell>{incident.category?.name ?? '-'}</TableCell>
                  <TableCell>{incident.reporterName}</TableCell>
                  <TableCell>{new Date(incident.incidentAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <FormControl size="small" fullWidth>
                      <Select
                        value={incident.status}
                        onChange={(event) =>
                          updateStatusMutation.mutate({
                            incidentId: incident.id,
                            status: event.target.value as IncidentStatus,
                          })
                        }
                        disabled={updateStatusMutation.isPending}
                      >
                        {incidentStatuses.map((status) => (
                          <MenuItem key={status} value={status}>
                            {status}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Stack>
      </Paper>
    </Stack>
  );
};
