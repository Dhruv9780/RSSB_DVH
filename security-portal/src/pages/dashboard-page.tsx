import {
  Card,
  CardContent,
  CircularProgress,
  Grid2,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';

import { dashboardApi } from '../services/dashboard-api';

export const DashboardPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: dashboardApi.getSummary,
  });

  if (isLoading || !data) {
    return <CircularProgress />;
  }

  return (
    <Grid2 container spacing={2}>
      <Grid2 size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Total Found Items
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {data.counters.foundItemTotal}
            </Typography>
          </CardContent>
        </Card>
      </Grid2>
      <Grid2 size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Total Lost Reports
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {data.counters.lostReportTotal}
            </Typography>
          </CardContent>
        </Card>
      </Grid2>

      <Grid2 size={{ xs: 12, lg: 6 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" mb={1}>
            Recent Found Items
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
              {data.recentFound.map((item) => (
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
          <Typography variant="h6" mb={1}>
            Recent Lost Reports
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
              {data.recentLost.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.reportCode}</TableCell>
                  <TableCell>{item.itemName}</TableCell>
                  <TableCell>{item.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Grid2>
    </Grid2>
  );
};
