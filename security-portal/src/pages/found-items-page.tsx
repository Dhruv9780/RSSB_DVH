import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Box,
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
import { foundItemsApi } from '../services/found-items-api';
import { toMediaUrl } from '../utils/media';

const foundItemSchema = z.object({
  categoryId: z.preprocess(
    (value) => (value === '' || value === null || value === undefined ? undefined : value),
    z.coerce.number().int().positive().optional(),
  ),
  itemName: z.string().optional(),
  description: z.string().optional(),
  brand: z.string().optional(),
  color: z.string().optional(),
  locationFoundId: z.preprocess(
    (value) => (value === '' || value === null || value === undefined ? undefined : value),
    z.coerce.number().int().positive().optional(),
  ),
  foundDate: z.string().optional(),
  foundTime: z.string().optional(),
  storageLocation: z.string().optional(),
  status: z.enum(['STORED', 'CLAIMED', 'RETURNED', 'ARCHIVED']).optional(),
});

type FoundItemForm = z.infer<typeof foundItemSchema>;

export const FoundItemsPage = () => {
  const queryClient = useQueryClient();
  const [uploadItemId, setUploadItemId] = useState<number | ''>('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: catalogApi.getCategories,
  });
  const locationsQuery = useQuery({
    queryKey: ['locations'],
    queryFn: catalogApi.getLocations,
  });
  const itemsQuery = useQuery({
    queryKey: ['found-items'],
    queryFn: () => foundItemsApi.list(),
  });

  const form = useForm<FoundItemForm>({
    resolver: zodResolver(foundItemSchema),
    defaultValues: {
      status: 'STORED',
      foundDate: new Date().toISOString().slice(0, 10),
      foundTime: '12:00',
    },
  });

  const createMutation = useMutation({
    mutationFn: foundItemsApi.create,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['found-items'] });
      form.reset({
        status: 'STORED',
        foundDate: new Date().toISOString().slice(0, 10),
        foundTime: '12:00',
      });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: ({ itemId, files }: { itemId: number; files: File[] }) =>
      foundItemsApi.uploadImages(itemId, files),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['found-items'] });
      setSelectedFiles([]);
    },
  });

  const uploadOptions = useMemo(() => itemsQuery.data?.items ?? [], [itemsQuery.data?.items]);

  const onSubmit = form.handleSubmit((values) =>
    createMutation.mutate({
      categoryId: values.categoryId ?? categoriesQuery.data?.[0]?.id ?? 1,
      itemName: values.itemName?.trim() || 'Unknown Item',
      description: values.description?.trim() || undefined,
      brand: values.brand?.trim() || undefined,
      color: values.color?.trim() || undefined,
      locationFoundId: values.locationFoundId ?? locationsQuery.data?.[0]?.id ?? 1,
      foundDate: values.foundDate || new Date().toISOString().slice(0, 10),
      foundTime: values.foundTime || '12:00',
      storageLocation: values.storageLocation?.trim() || 'Not specified',
      status: values.status ?? 'STORED',
    }),
  );

  if (categoriesQuery.isLoading || locationsQuery.isLoading || itemsQuery.isLoading) {
    return <CircularProgress />;
  }

  return (
    <Grid2 container spacing={2}>
      <Grid2 size={{ xs: 12, lg: 5 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" mb={2}>
            Add Found Item
          </Typography>
          {createMutation.isError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              Failed to create found item.
            </Alert>
          ) : null}

          <Stack component="form" spacing={1.5} onSubmit={onSubmit}>
            <TextField select label="Category" {...form.register('categoryId')}>
              <MenuItem value="">None</MenuItem>
              {categoriesQuery.data?.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField label="Item Name" {...form.register('itemName')} />
            <TextField label="Description" {...form.register('description')} multiline minRows={2} />
            <TextField label="Brand" {...form.register('brand')} />
            <TextField label="Color" {...form.register('color')} />
            <TextField select label="Location Found" {...form.register('locationFoundId')}>
              <MenuItem value="">None</MenuItem>
              {locationsQuery.data?.map((location) => (
                <MenuItem key={location.id} value={location.id}>
                  {location.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField label="Found Date" type="date" InputLabelProps={{ shrink: true }} {...form.register('foundDate')} />
            <TextField label="Found Time" type="time" InputLabelProps={{ shrink: true }} {...form.register('foundTime')} />
            <TextField label="Storage Location" {...form.register('storageLocation')} />
            <TextField select label="Status" {...form.register('status')}>
              <MenuItem value="STORED">STORED</MenuItem>
              <MenuItem value="CLAIMED">CLAIMED</MenuItem>
              <MenuItem value="RETURNED">RETURNED</MenuItem>
              <MenuItem value="ARCHIVED">ARCHIVED</MenuItem>
            </TextField>
            <Button type="submit" variant="contained" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Saving...' : 'Create Found Item'}
            </Button>
          </Stack>
        </Paper>
      </Grid2>

      <Grid2 size={{ xs: 12, lg: 7 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" mb={1}>
            Found Items
          </Typography>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} mb={2}>
            <TextField
              fullWidth
              select
              label="Item for Image Upload"
              value={uploadItemId}
              onChange={(e) => setUploadItemId(Number(e.target.value))}
            >
              {uploadOptions.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.itemCode} - {item.itemName}
                </MenuItem>
              ))}
            </TextField>
            <Button variant="outlined" component="label">
              Select Images
              <input
                hidden
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setSelectedFiles(Array.from(e.target.files ?? []))}
              />
            </Button>
            <Button
              variant="contained"
              disabled={
                uploadMutation.isPending || uploadItemId === '' || selectedFiles.length === 0 || selectedFiles.length > 5
              }
              onClick={() => {
                if (uploadItemId !== '' && selectedFiles.length > 0) {
                  uploadMutation.mutate({ itemId: uploadItemId, files: selectedFiles });
                }
              }}
            >
              Upload
            </Button>
          </Stack>
          {selectedFiles.length > 0 ? (
            <Typography variant="body2" color="text.secondary" mb={1}>
              Selected: {selectedFiles.length} file(s)
            </Typography>
          ) : null}
          {selectedFiles.length > 5 ? (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Maximum 5 images allowed per upload.
            </Alert>
          ) : null}

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Item</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Images</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {itemsQuery.data?.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.itemCode}</TableCell>
                  <TableCell>{item.itemName}</TableCell>
                  <TableCell>{item.category.name}</TableCell>
                  <TableCell>{item.status}</TableCell>
                  <TableCell>
                    <Box display="flex" gap={1} flexWrap="wrap">
                      {item.images?.map((image) => (
                        <Link key={image.id} href={toMediaUrl(image.path)} target="_blank" rel="noreferrer">
                          View
                        </Link>
                      ))}
                    </Box>
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
