import {
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid2,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';

import { dashboardApi } from '../services/dashboard-api';

export const DashboardPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard-summary'],
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
            Found Items by Status
          </Typography>
          <Grid2 container spacing={1}>
            {data.foundByStatus.map((entry) => (
              <Grid2 key={entry.status}>
                <Chip label={`${entry.status}: ${entry._count._all}`} />
              </Grid2>
            ))}
          </Grid2>
        </Paper>
      </Grid2>

      <Grid2 size={{ xs: 12, lg: 6 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" mb={1}>
            Lost Reports by Status
          </Typography>
          <Grid2 container spacing={1}>
            {data.lostByStatus.map((entry) => (
              <Grid2 key={entry.status}>
                <Chip label={`${entry.status}: ${entry._count._all}`} color="secondary" />
              </Grid2>
            ))}
          </Grid2>
        </Paper>
      </Grid2>

      <Grid2 size={{ xs: 12, lg: 6 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" mb={1}>
            Recent Found Items
          </Typography>
          <List dense>
            {data.recentFound.map((item) => (
              <ListItem key={item.id} disableGutters divider>
                <ListItemText
                  primary={`${item.itemCode} - ${item.itemName}`}
                  secondary={`Status: ${item.status}`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Grid2>

      <Grid2 size={{ xs: 12, lg: 6 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" mb={1}>
            Recent Lost Reports
          </Typography>
          <List dense>
            {data.recentLost.map((item) => (
              <ListItem key={item.id} disableGutters divider>
                <ListItemText
                  primary={`${item.reportCode} - ${item.itemName}`}
                  secondary={`Status: ${item.status}`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Grid2>
    </Grid2>
  );
};