import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Checkbox, FormControlLabel, Grid2, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { z } from 'zod';

import { foundItemsApi } from '../services/found-items-api';
import { lostReportsApi } from '../services/lost-reports-api';
import { returnsApi } from '../services/returns-api';

const returnSchema = z.object({
  foundItemId: z.coerce.number().int().positive(),
  lostReportId: z.preprocess(
    (value) => (value === '' || value === null ? undefined : value),
    z.coerce.number().int().positive().optional(),
  ),
  returnedTo: z.string().min(2),
  phoneNumber: z.string().min(7),
  identityVerified: z.boolean(),
  returnDate: z.string().date(),
  returnTime: z.string().min(5),
  remarks: z.string().optional(),
});

type ReturnForm = z.infer<typeof returnSchema>;

export const ReturnsPage = () => {
  const queryClient = useQueryClient();
  const [receiverPhoto, setReceiverPhoto] = useState<File | null>(null);

  const foundItemsQuery = useQuery({
    queryKey: ['found-items'],
    queryFn: () => foundItemsApi.list(),
  });
  const lostReportsQuery = useQuery({
    queryKey: ['lost-reports'],
    queryFn: () => lostReportsApi.list(),
  });

  const form = useForm<ReturnForm>({
    resolver: zodResolver(returnSchema),
    defaultValues: {
      identityVerified: true,
      returnDate: new Date().toISOString().slice(0, 10),
      returnTime: '12:00',
    },
  });

  const createMutation = useMutation({
    mutationFn: returnsApi.create,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['found-items'] });
      await queryClient.invalidateQueries({ queryKey: ['lost-reports'] });
      setReceiverPhoto(null);
      form.reset({
        identityVerified: true,
        returnDate: new Date().toISOString().slice(0, 10),
        returnTime: '12:00',
      });
    },
  });

  const onSubmit = form.handleSubmit((values) => createMutation.mutate({ ...values, receiverPhoto: receiverPhoto ?? undefined }));

  return (
    <Paper sx={{ p: 2, maxWidth: 760 }}>
      <Typography variant="h6" mb={2}>
        Return Item
      </Typography>

      {createMutation.isSuccess ? <Alert severity="success" sx={{ mb: 2 }}>Item returned successfully.</Alert> : null}
      {createMutation.isError ? <Alert severity="error" sx={{ mb: 2 }}>Failed to return item.</Alert> : null}

      <Stack component="form" spacing={1.5} onSubmit={onSubmit}>
        <Grid2 container spacing={1.5}>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <TextField select fullWidth label="Found Item" {...form.register('foundItemId')}>
              {foundItemsQuery.data?.items.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.itemCode} - {item.itemName} ({item.status})
                </MenuItem>
              ))}
            </TextField>
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <TextField select fullWidth label="Related Lost Report (optional)" {...form.register('lostReportId')}>
              <MenuItem value="">None</MenuItem>
              {lostReportsQuery.data?.reports.map((report) => (
                <MenuItem key={report.id} value={report.id}>
                  {report.reportCode} - {report.itemName}
                </MenuItem>
              ))}
            </TextField>
          </Grid2>
        </Grid2>

        <TextField label="Returned To" {...form.register('returnedTo')} />
        <TextField label="Phone Number" {...form.register('phoneNumber')} />

        <FormControlLabel
          control={<Checkbox checked={form.watch('identityVerified')} onChange={(e) => form.setValue('identityVerified', e.target.checked)} />}
          label="Identity Verified"
        />

        <Grid2 container spacing={1.5}>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <TextField label="Return Date" type="date" fullWidth InputLabelProps={{ shrink: true }} {...form.register('returnDate')} />
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <TextField label="Return Time" type="time" fullWidth InputLabelProps={{ shrink: true }} {...form.register('returnTime')} />
          </Grid2>
        </Grid2>

        <TextField label="Remarks" multiline minRows={3} {...form.register('remarks')} />
        <Button variant="outlined" component="label">
          {receiverPhoto ? `Photo selected: ${receiverPhoto.name}` : 'Attach Receiver Photo (Optional)'}
          <input
            hidden
            type="file"
            accept="image/*"
            onChange={(event) => setReceiverPhoto(event.target.files?.[0] ?? null)}
          />
        </Button>
        <Button type="submit" variant="contained" disabled={createMutation.isPending}>
          {createMutation.isPending ? 'Processing...' : 'Return Item'}
        </Button>
      </Stack>
    </Paper>
  );
};
