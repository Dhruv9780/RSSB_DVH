import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Button,
  CircularProgress,
  Grid2,
  Link,
  MenuItem,
  Paper,
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
import { lostReportsApi } from '../services/lost-reports-api';
import type { MatchingSuggestion } from '../types/api';
import { toMediaUrl } from '../utils/media';

const lostReportSchema = z.object({
  personName: z.string().min(2),
  phoneNumber: z.string().min(7),
  itemName: z.string().min(2),
  categoryId: z.coerce.number().int().positive().optional(),
  brand: z.string().optional(),
  color: z.string().optional(),
  description: z.string().optional(),
  specialIdentification: z.string().optional(),
  approximateValue: z.coerce.number().nonnegative().optional(),
  locationLostId: z.coerce.number().int().positive().optional(),
  lostDate: z.string().date(),
  lostTime: z.string().min(5),
  status: z.enum(['OPEN', 'MATCHED', 'RETURNED', 'CLOSED']),
});

type LostReportForm = z.infer<typeof lostReportSchema>;

export const LostReportsPage = () => {
  const queryClient = useQueryClient();
  const [suggestions, setSuggestions] = useState<MatchingSuggestion[]>([]);
  const [uploadReportId, setUploadReportId] = useState<number | ''>('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: catalogApi.getCategories,
  });
  const locationsQuery = useQuery({
    queryKey: ['locations'],
    queryFn: catalogApi.getLocations,
  });
  const reportsQuery = useQuery({
    queryKey: ['lost-reports'],
    queryFn: () => lostReportsApi.list(),
  });

  const form = useForm<LostReportForm>({
    resolver: zodResolver(lostReportSchema),
    defaultValues: {
      status: 'OPEN',
      lostDate: new Date().toISOString().slice(0, 10),
      lostTime: '12:00',
    },
  });

  const createMutation = useMutation({
    mutationFn: lostReportsApi.create,
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['lost-reports'] });
      setSuggestions(data.suggestions);
      form.reset({
        status: 'OPEN',
        lostDate: new Date().toISOString().slice(0, 10),
        lostTime: '12:00',
      });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: ({ reportId, file }: { reportId: number; file: File }) =>
      lostReportsApi.uploadPhoto(reportId, file),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['lost-reports'] });
      setUploadFile(null);
    },
  });

  const reportOptions = useMemo(() => reportsQuery.data?.reports ?? [], [reportsQuery.data?.reports]);

  const onSubmit = form.handleSubmit((values) => createMutation.mutate(values));

  if (categoriesQuery.isLoading || locationsQuery.isLoading || reportsQuery.isLoading) {
    return <CircularProgress />;
  }

  return (
    <Grid2 container spacing={2}>
      <Grid2 size={{ xs: 12, lg: 5 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" mb={2}>
            Add Lost Report
          </Typography>
          {createMutation.isError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              Failed to create lost report.
            </Alert>
          ) : null}

          <Stack component="form" spacing={1.5} onSubmit={onSubmit}>
            <TextField label="Person Name" {...form.register('personName')} />
            <TextField label="Phone Number" {...form.register('phoneNumber')} />
            <TextField label="Item Name" {...form.register('itemName')} />
            <TextField select label="Category" {...form.register('categoryId')}>
              {categoriesQuery.data?.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField label="Brand" {...form.register('brand')} />
            <TextField label="Color" {...form.register('color')} />
            <TextField label="Description" {...form.register('description')} multiline minRows={2} />
            <TextField label="Special Identification" {...form.register('specialIdentification')} multiline minRows={2} />
            <TextField label="Approx Value" type="number" {...form.register('approximateValue')} />
            <TextField select label="Location Lost" {...form.register('locationLostId')}>
              {locationsQuery.data?.map((location) => (
                <MenuItem key={location.id} value={location.id}>
                  {location.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField label="Lost Date" type="date" InputLabelProps={{ shrink: true }} {...form.register('lostDate')} />
            <TextField label="Lost Time" type="time" InputLabelProps={{ shrink: true }} {...form.register('lostTime')} />
            <TextField select label="Status" {...form.register('status')}>
              <MenuItem value="OPEN">OPEN</MenuItem>
              <MenuItem value="MATCHED">MATCHED</MenuItem>
              <MenuItem value="RETURNED">RETURNED</MenuItem>
              <MenuItem value="CLOSED">CLOSED</MenuItem>
            </TextField>
            <Button type="submit" variant="contained" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Saving...' : 'Create Lost Report'}
            </Button>
          </Stack>
        </Paper>
      </Grid2>

      <Grid2 size={{ xs: 12, lg: 7 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" mb={1}>
            Lost Reports
          </Typography>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} mb={2}>
            <TextField
              fullWidth
              select
              label="Report for Photo Upload"
              value={uploadReportId}
              onChange={(e) => setUploadReportId(Number(e.target.value))}
            >
              {reportOptions.map((report) => (
                <MenuItem key={report.id} value={report.id}>
                  {report.reportCode} - {report.itemName}
                </MenuItem>
              ))}
            </TextField>
            <Button variant="outlined" component="label">
              Select Photo
              <input
                hidden
                type="file"
                accept="image/*"
                onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
              />
            </Button>
            <Button
              variant="contained"
              disabled={uploadMutation.isPending || uploadReportId === '' || !uploadFile}
              onClick={() => {
                if (uploadReportId !== '' && uploadFile) {
                  uploadMutation.mutate({ reportId: uploadReportId, file: uploadFile });
                }
              }}
            >
              Upload
            </Button>
          </Stack>

          {suggestions.length > 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              Matching Suggestions: {suggestions.map((s) => `${s.foundItem.itemCode} (${s.confidence}%)`).join(', ')}
            </Alert>
          ) : null}

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Person</TableCell>
                <TableCell>Item</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Photo</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportsQuery.data?.reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>{report.reportCode}</TableCell>
                  <TableCell>{report.personName}</TableCell>
                  <TableCell>{report.itemName}</TableCell>
                  <TableCell>{report.status}</TableCell>
                  <TableCell>
                    {report.photoPath ? (
                      <Link href={toMediaUrl(report.photoPath)} target="_blank" rel="noreferrer">
                        View
                      </Link>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Grid2>
    </Grid2>
  );
};
