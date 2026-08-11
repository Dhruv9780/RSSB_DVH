import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
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

import { adminApi } from '../services/admin-api';

const getErrorMessage = (error: unknown) => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: { data?: { message?: unknown } } }).response?.data?.message === 'string'
  ) {
    return (error as { response: { data: { message: string } } }).response.data.message;
  }
  return 'Something went wrong';
};

export const UsersPage = () => {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [role, setRole] = useState<'ALL' | 'SECURITY_SEWADAR' | 'SUPER_ADMIN'>('ALL');
  const [status, setStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [formUsername, setFormUsername] = useState('');
  const [formFullName, setFormFullName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<'SECURITY_SEWADAR' | 'SUPER_ADMIN'>('SECURITY_SEWADAR');
  const [formPassword, setFormPassword] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  const queryKey = useMemo(() => ['admin-users', search, role, status], [search, role, status]);

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      adminApi.listUsers({
        search: search || undefined,
        role: role === 'ALL' ? undefined : role,
        isActive: status === 'ALL' ? undefined : status === 'ACTIVE',
      }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: number; isActive: boolean }) =>
      adminApi.setUserStatus(userId, isActive),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setError(null);
    },
    onError: (mutationError) => {
      setError(getErrorMessage(mutationError));
    },
  });

  const createUserMutation = useMutation({
    mutationFn: adminApi.createUser,
    onSuccess: async () => {
      setIsCreateOpen(false);
      setFormUsername('');
      setFormFullName('');
      setFormPhone('');
      setFormRole('SECURITY_SEWADAR');
      setFormPassword('');
      setFormIsActive(true);
      setError(null);
      await queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (mutationError) => setError(getErrorMessage(mutationError)),
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ userId, payload }: { userId: number; payload: Parameters<typeof adminApi.updateUser>[1] }) =>
      adminApi.updateUser(userId, payload),
    onSuccess: async () => {
      setEditingUserId(null);
      setFormFullName('');
      setFormPhone('');
      setFormRole('SECURITY_SEWADAR');
      setFormPassword('');
      setFormIsActive(true);
      setError(null);
      await queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (mutationError) => setError(getErrorMessage(mutationError)),
  });

  const exportUsersMutation = useMutation({
    mutationFn: () =>
      adminApi.exportUsersCsv({
        search: search || undefined,
        role: role === 'ALL' ? undefined : role,
        isActive: status === 'ALL' ? undefined : status === 'ACTIVE',
      }),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `users-${new Date().toISOString().slice(0, 10)}.csv`;
      anchor.click();
      window.URL.revokeObjectURL(url);
    },
    onError: (mutationError) => setError(getErrorMessage(mutationError)),
  });

  const openEditDialog = (user: {
    id: number;
    fullName: string;
    phone?: string | null;
    role: 'SECURITY_SEWADAR' | 'SUPER_ADMIN';
    isActive: boolean;
  }) => {
    setEditingUserId(user.id);
    setFormFullName(user.fullName);
    setFormPhone(user.phone || '');
    setFormRole(user.role);
    setFormPassword('');
    setFormIsActive(user.isActive);
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={700}>
        User Management
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <Button variant="contained" onClick={() => setIsCreateOpen(true)}>
          Create User
        </Button>
        <Button
          variant="outlined"
          onClick={() => exportUsersMutation.mutate()}
          disabled={exportUsersMutation.isPending}
        >
          Export CSV
        </Button>
      </Stack>

      {error ? <Alert severity="error">{error}</Alert> : null}

      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            fullWidth
            label="Search user"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <FormControl fullWidth>
            <InputLabel id="role-filter-label">Role</InputLabel>
            <Select
              labelId="role-filter-label"
              label="Role"
              value={role}
              onChange={(event) =>
                setRole(event.target.value as 'ALL' | 'SECURITY_SEWADAR' | 'SUPER_ADMIN')
              }
            >
              <MenuItem value="ALL">All Roles</MenuItem>
              <MenuItem value="SUPER_ADMIN">Super Admin</MenuItem>
              <MenuItem value="SECURITY_SEWADAR">Security Sewadar</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              label="Status"
              value={status}
              onChange={(event) => setStatus(event.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')}
            >
              <MenuItem value="ALL">All</MenuItem>
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="INACTIVE">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      <Paper sx={{ p: 0, overflowX: 'auto' }}>
        {isLoading || !data ? (
          <Box p={3} display="grid" sx={{ placeItems: 'center' }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Full Name</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Last Login</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Set Active</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : '-'}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      color={user.isActive ? 'success' : 'default'}
                      label={user.isActive ? 'Active' : 'Inactive'}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Switch
                      checked={user.isActive}
                      onChange={(event) =>
                        updateStatusMutation.mutate({
                          userId: user.id,
                          isActive: event.target.checked,
                        })
                      }
                      disabled={updateStatusMutation.isPending}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Button size="small" onClick={() => openEditDialog(user)}>
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Dialog open={isCreateOpen} onClose={() => setIsCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create User</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Username" value={formUsername} onChange={(e) => setFormUsername(e.target.value)} required />
            <TextField label="Full Name" value={formFullName} onChange={(e) => setFormFullName(e.target.value)} required />
            <TextField label="Phone" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} />
            <FormControl>
              <InputLabel id="create-role-label">Role</InputLabel>
              <Select
                labelId="create-role-label"
                label="Role"
                value={formRole}
                onChange={(e) => setFormRole(e.target.value as 'SECURITY_SEWADAR' | 'SUPER_ADMIN')}
              >
                <MenuItem value="SECURITY_SEWADAR">Security Sewadar</MenuItem>
                <MenuItem value="SUPER_ADMIN">Super Admin</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Password"
              type="password"
              value={formPassword}
              onChange={(e) => setFormPassword(e.target.value)}
              helperText="Minimum 8 characters"
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() =>
              createUserMutation.mutate({
                username: formUsername,
                fullName: formFullName,
                phone: formPhone || undefined,
                role: formRole,
                password: formPassword,
                isActive: true,
              })
            }
            disabled={createUserMutation.isPending}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editingUserId !== null} onClose={() => setEditingUserId(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Full Name" value={formFullName} onChange={(e) => setFormFullName(e.target.value)} required />
            <TextField label="Phone" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} />
            <FormControl>
              <InputLabel id="edit-role-label">Role</InputLabel>
              <Select
                labelId="edit-role-label"
                label="Role"
                value={formRole}
                onChange={(e) => setFormRole(e.target.value as 'SECURITY_SEWADAR' | 'SUPER_ADMIN')}
              >
                <MenuItem value="SECURITY_SEWADAR">Security Sewadar</MenuItem>
                <MenuItem value="SUPER_ADMIN">Super Admin</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="New Password (optional)"
              type="password"
              value={formPassword}
              onChange={(e) => setFormPassword(e.target.value)}
            />
            <FormControl>
              <InputLabel id="edit-status-label">Status</InputLabel>
              <Select
                labelId="edit-status-label"
                label="Status"
                value={formIsActive ? 'ACTIVE' : 'INACTIVE'}
                onChange={(e) => setFormIsActive(e.target.value === 'ACTIVE')}
              >
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="INACTIVE">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingUserId(null)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (editingUserId === null) {
                return;
              }

              updateUserMutation.mutate({
                userId: editingUserId,
                payload: {
                  fullName: formFullName,
                  phone: formPhone || null,
                  role: formRole,
                  isActive: formIsActive,
                  password: formPassword || undefined,
                },
              });
            }}
            disabled={updateUserMutation.isPending}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};