import { Navigate, Route, Routes } from 'react-router-dom';

import { AppShell } from './components/app-shell';
import { ProtectedRoute } from './components/protected-route';
import { DashboardPage } from './pages/dashboard-page';
import { FoundItemsPage } from './pages/found-items-page';
import { IncidentsPage } from './pages/incidents-page';
import { LoginPage } from './pages/login-page';
import { LostReportsPage } from './pages/lost-reports-page';
import { ReturnsPage } from './pages/returns-page';
import { SearchPage } from './pages/search-page';

export const App = () => {
  return (
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
        <Route path="incidents" element={<IncidentsPage />} />
        <Route path="found-items" element={<FoundItemsPage />} />
        <Route path="lost-reports" element={<LostReportsPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="returns" element={<ReturnsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
