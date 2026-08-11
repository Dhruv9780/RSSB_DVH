import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Button,
  CircularProgress,
  FormControl,
  Grid2,
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
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { catalogApi } from '../services/catalog-api';
import { incidentsApi } from '../services/incidents-api';
import type { IncidentPriority, IncidentStatus } from '../types/api';

const incidentSchema = z.object({
  title: z.string().trim().min(2),
  description: z.string().trim().optional(),
  categoryId: z.preprocess(
    (value) => (value === '' || value === null || value === undefined ? undefined : value),
    z.coerce.number().int().positive().optional(),
  ),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  location: z.string().trim().min(2),
  incidentDate: z.string().date(),
  incidentTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  reporterName: z.string().trim().min(2),
  reporterContact: z.string().trim().min(7),
  status: z.literal('OPEN').default('OPEN'),
});

type IncidentForm = z.infer<typeof incidentSchema>;

const getErrorMessage = (error: unknown) => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: { data?: { message?: unknown } } }).response?.data?.message === 'string'
  ) {
    return (error as { response: { data: { message: string } } }).response.data.message;
  }
  return 'Unable to process the incident request';
};

const incidentStatuses: IncidentStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

export const IncidentsPage = () => {
  const queryClient = useQueryClient();
  const [createdIncidentCode, setCreatedIncidentCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | IncidentPriority>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | IncidentStatus>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<number | 'ALL'>('ALL');

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: catalogApi.getCategories,
  });

  const locationsQuery = useQuery({
    queryKey: ['locations'],
    queryFn: catalogApi.getLocations,
  });

  const listQueryKey = useMemo(
    () => ['incidents', search, priorityFilter, statusFilter, categoryFilter],
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

  const form = useForm<IncidentForm>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      priority: 'MEDIUM',
      incidentDate: new Date().toISOString().slice(0, 10),
      incidentTime: '12:00',
      status: 'OPEN',
    },
  });

  const createMutation = useMutation({
    mutationFn: incidentsApi.create,
    onSuccess: async (incident) => {
      setCreatedIncidentCode(incident.incidentCode);
      setErrorMessage(null);
      form.reset({
        priority: 'MEDIUM',
        incidentDate: new Date().toISOString().slice(0, 10),
        incidentTime: '12:00',
        status: 'OPEN',
      });
      await queryClient.invalidateQueries({ queryKey: ['incidents'] });
    },
    onError: (mutationError) => {
      setCreatedIncidentCode(null);
      setErrorMessage(getErrorMessage(mutationError));
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ incidentId, status }: { incidentId: number; status: IncidentStatus }) =>
      incidentsApi.updateStatus(incidentId, { status }),
    onSuccess: async () => {
      setErrorMessage(null);
      await queryClient.invalidateQueries({ queryKey: ['incidents'] });
    },
    onError: (mutationError) => {
      setErrorMessage(getErrorMessage(mutationError));
    },
  });

  const onSubmit = form.handleSubmit((values) => createMutation.mutate(values));

  if (categoriesQuery.isLoading || locationsQuery.isLoading || incidentsQuery.isLoading) {
    return <CircularProgress />;
  }

  return (
    <Grid2 container spacing={2}>
      <Grid2 size={{ xs: 12, lg: 5 }}>
        <Paper sx={{ p: 2 }}>
          <Stack spacing={1.5}>
            <Typography variant="h5" fontWeight={700}>
              Incident Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Report a new incident. Incident Id is generated automatically after submit.
            </Typography>

            {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
            {createdIncidentCode ? (
              <Alert severity="success">Incident created successfully: {createdIncidentCode}</Alert>
            ) : null}

            <Stack component="form" spacing={1.5} onSubmit={onSubmit}>
              <TextField label="Incident Id (Auto Generated)" value="Generated on submit" disabled />
              <TextField label="Title" {...form.register('title')} />
              <TextField label="Description" multiline minRows={3} {...form.register('description')} />

              <TextField select label="Category" {...form.register('categoryId')}>
                <MenuItem value="">None</MenuItem>
                {categoriesQuery.data?.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField select label="Priority" {...form.register('priority')}>
                <MenuItem value="LOW">LOW</MenuItem>
                <MenuItem value="MEDIUM">MEDIUM</MenuItem>
                <MenuItem value="HIGH">HIGH</MenuItem>
                <MenuItem value="CRITICAL">CRITICAL</MenuItem>
              </TextField>

              <TextField select label="Location" {...form.register('location')}>
                <MenuItem value="">None</MenuItem>
                {locationsQuery.data?.map((location) => (
                  <MenuItem key={location.id} value={location.name}>
                    {location.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField label="Incident Date" type="date" InputLabelProps={{ shrink: true }} {...form.register('incidentDate')} />
              <TextField label="Incident Time" type="time" InputLabelProps={{ shrink: true }} {...form.register('incidentTime')} />
              <TextField label="Reporter Name" {...form.register('reporterName')} />
              <TextField label="Reporter Contact" {...form.register('reporterContact')} />
              <TextField label="Status" value="OPEN" disabled />

              <Button type="submit" variant="contained" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Submitting...' : 'Create Incident'}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Grid2>

      <Grid2 size={{ xs: 12, lg: 7 }}>
        <Paper sx={{ p: 2 }}>
          <Stack spacing={1.5}>
            <Typography variant="h6" fontWeight={700}>
              Incident Records
            </Typography>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
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
      </Grid2>
    </Grid2>
  );
};
