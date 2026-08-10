import { CircularProgress, Stack } from '@mui/material';
import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { AppShell } from './components/app-shell';
import { ProtectedRoute } from './components/protected-route';

const LoginPage = lazy(async () => import('./pages/login-page').then((module) => ({ default: module.LoginPage })));
const DashboardPage = lazy(async () =>
  import('./pages/dashboard-page').then((module) => ({ default: module.DashboardPage })),
);
const UsersPage = lazy(async () => import('./pages/users-page').then((module) => ({ default: module.UsersPage })));
const CatalogPage = lazy(async () =>
  import('./pages/catalog-page').then((module) => ({ default: module.CatalogPage })),
);
const ActivityPage = lazy(async () =>
  import('./pages/activity-page').then((module) => ({ default: module.ActivityPage })),
);
const IncidentsPage = lazy(async () =>
  import('./pages/incidents-page').then((module) => ({ default: module.IncidentsPage })),
);
const SystemPage = lazy(async () => import('./pages/system-page').then((module) => ({ default: module.SystemPage })));

const AppFallback = () => (
  <Stack minHeight="70vh" alignItems="center" justifyContent="center">
    <CircularProgress />
  </Stack>
);

export const App = () => {
  return (
    <Suspense fallback={<AppFallback />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="catalog" element={<CatalogPage />} />
          <Route path="incidents" element={<IncidentsPage />} />
          <Route path="activity" element={<ActivityPage />} />
          <Route path="system" element={<SystemPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
};
