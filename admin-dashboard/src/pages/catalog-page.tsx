import {
  Alert,
  Button,
  CircularProgress,
  Grid2,
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
import { useState } from 'react';

import { catalogApi } from '../services/catalog-api';

const getErrorMessage = (error: unknown) => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: { data?: { message?: unknown } } }).response?.data?.message === 'string'
  ) {
    return (error as { response: { data: { message: string } } }).response.data.message;
  }
  return 'Request failed';
};

export const CatalogPage = () => {
  const queryClient = useQueryClient();

  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [locationDescription, setLocationDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const categoriesQuery = useQuery({
    queryKey: ['catalog-categories'],
    queryFn: catalogApi.listCategories,
  });

  const locationsQuery = useQuery({
    queryKey: ['catalog-locations'],
    queryFn: catalogApi.listLocations,
  });

  const upsertCategoryMutation = useMutation({
    mutationFn: catalogApi.upsertCategory,
    onSuccess: async () => {
      setCategoryName('');
      setCategoryDescription('');
      setError(null);
      await queryClient.invalidateQueries({ queryKey: ['catalog-categories'] });
    },
    onError: (mutationError) => setError(getErrorMessage(mutationError)),
  });

  const upsertLocationMutation = useMutation({
    mutationFn: catalogApi.upsertLocation,
    onSuccess: async () => {
      setLocationName('');
      setLocationDescription('');
      setError(null);
      await queryClient.invalidateQueries({ queryKey: ['catalog-locations'] });
    },
    onError: (mutationError) => setError(getErrorMessage(mutationError)),
  });

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={700}>
        Catalog Manager
      </Typography>

      {error ? <Alert severity="error">{error}</Alert> : null}

      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12, lg: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Stack spacing={2} component="form" onSubmit={(event) => {
              event.preventDefault();
              upsertCategoryMutation.mutate({
                name: categoryName,
                description: categoryDescription || undefined,
                isActive: true,
              });
            }}>
              <Typography variant="h6">Add or Update Category</Typography>
              <TextField
                label="Category Name"
                value={categoryName}
                onChange={(event) => setCategoryName(event.target.value)}
                required
              />
              <TextField
                label="Description"
                value={categoryDescription}
                onChange={(event) => setCategoryDescription(event.target.value)}
              />
              <Button type="submit" variant="contained" disabled={upsertCategoryMutation.isPending}>
                Save Category
              </Button>
            </Stack>
          </Paper>
        </Grid2>

        <Grid2 size={{ xs: 12, lg: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Stack spacing={2} component="form" onSubmit={(event) => {
              event.preventDefault();
              upsertLocationMutation.mutate({
                name: locationName,
                description: locationDescription || undefined,
                isActive: true,
              });
            }}>
              <Typography variant="h6">Add or Update Location</Typography>
              <TextField
                label="Location Name"
                value={locationName}
                onChange={(event) => setLocationName(event.target.value)}
                required
              />
              <TextField
                label="Description"
                value={locationDescription}
                onChange={(event) => setLocationDescription(event.target.value)}
              />
              <Button type="submit" variant="contained" disabled={upsertLocationMutation.isPending}>
                Save Location
              </Button>
            </Stack>
          </Paper>
        </Grid2>

        <Grid2 size={{ xs: 12, lg: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" mb={1}>
              Active Categories
            </Typography>
            {categoriesQuery.isLoading ? (
              <CircularProgress size={24} />
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categoriesQuery.data?.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>{category.name}</TableCell>
                      <TableCell>{category.description || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Paper>
        </Grid2>

        <Grid2 size={{ xs: 12, lg: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" mb={1}>
              Active Locations
            </Typography>
            {locationsQuery.isLoading ? (
              <CircularProgress size={24} />
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {locationsQuery.data?.map((location) => (
                    <TableRow key={location.id}>
                      <TableCell>{location.name}</TableCell>
                      <TableCell>{location.description || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Paper>
        </Grid2>
      </Grid2>
    </Stack>
  );
};