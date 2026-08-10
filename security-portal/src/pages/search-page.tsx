import { Button, CircularProgress, Grid2, Paper, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import { searchApi } from '../services/search-api';

export const SearchPage = () => {
  const [q, setQ] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [status, setStatus] = useState('');

  const searchMutation = useMutation({
    mutationFn: searchApi.global,
  });

  const onSearch = () => {
    searchMutation.mutate({
      q: q || undefined,
      phoneNumber: phoneNumber || undefined,
      status: status || undefined,
    });
  };

  return (
    <Grid2 container spacing={2}>
      <Grid2 size={{ xs: 12 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" mb={2}>
            Global Search
          </Typography>
          <Grid2 container spacing={1.5}>
            <Grid2 size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label="Keyword" value={q} onChange={(e) => setQ(e.target.value)} />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 3 }}>
              <TextField fullWidth label="Status" value={status} onChange={(e) => setStatus(e.target.value)} />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 2 }}>
              <Button fullWidth variant="contained" onClick={onSearch} sx={{ height: '56px' }}>
                Search
              </Button>
            </Grid2>
          </Grid2>
        </Paper>
      </Grid2>

      {searchMutation.isPending ? (
        <Grid2 size={{ xs: 12 }}>
          <CircularProgress />
        </Grid2>
      ) : null}

      <Grid2 size={{ xs: 12, lg: 6 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" mb={1}>
            Found Items ({searchMutation.data?.pagination.foundTotal ?? 0})
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Item</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {searchMutation.data?.foundItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.itemCode}</TableCell>
                  <TableCell>{item.itemName}</TableCell>
                  <TableCell>{item.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Grid2>

      <Grid2 size={{ xs: 12, lg: 6 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" mb={1}>
            Lost Reports ({searchMutation.data?.pagination.lostTotal ?? 0})
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Person</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {searchMutation.data?.lostReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>{report.reportCode}</TableCell>
                  <TableCell>{report.personName}</TableCell>
                  <TableCell>{report.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Grid2>
    </Grid2>
  );
};
