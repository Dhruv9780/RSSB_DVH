import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import ReportGmailerrorredOutlinedIcon from '@mui/icons-material/ReportGmailerrorredOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import SettingsSuggestOutlinedIcon from '@mui/icons-material/SettingsSuggestOutlined';
import ChevronLeftOutlinedIcon from '@mui/icons-material/ChevronLeftOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';

import { PwaInstallButton } from './pwa-install-button';
import { useAuth } from '../state/auth-context';
import { useEffect, useState } from 'react';

const drawerWidth = 270;

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardOutlinedIcon /> },
  { label: 'User Management', path: '/users', icon: <AdminPanelSettingsOutlinedIcon /> },
  { label: 'Catalog Manager', path: '/catalog', icon: <CategoryOutlinedIcon /> },
  { label: 'Incident Management', path: '/incidents', icon: <ReportGmailerrorredOutlinedIcon /> },
  { label: 'Audit Logs', path: '/activity', icon: <ReceiptLongOutlinedIcon /> },
  { label: 'System & Backups', path: '/system', icon: <SettingsSuggestOutlinedIcon /> },
];

export const AppShell = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerOpen = isMobile ? mobileOpen : isDrawerOpen;

  useEffect(() => {
    if (isMobile) {
      setMobileOpen(false);
    }
  }, [isMobile]);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const toggleDrawer = () => {
    if (isMobile) {
      setMobileOpen((prev) => !prev);
      return;
    }
    setIsDrawerOpen((prev) => !prev);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          ml: { sm: drawerOpen ? `${drawerWidth}px` : 0 },
          transition: (theme) =>
            theme.transitions.create(['margin-left', 'width'], {
              duration: theme.transitions.duration.standard,
            }),
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Button
              startIcon={<MenuIcon />}
              onClick={toggleDrawer}
              variant="outlined"
              size="small"
              sx={{ color: 'text.primary', borderColor: 'divider', minWidth: { xs: 64, sm: 90 } }}
            >
              Menu
            </Button>
            <Typography variant="h6" fontWeight={700}>
              Lost &amp; Found Super Admin
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={2}>
            <PwaInstallButton />
            <Typography variant="body2" color="text.secondary">
              {user?.fullName ?? user?.username}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<LogoutOutlinedIcon />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        open={drawerOpen}
        onClose={toggleDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle1" fontWeight={700}>
            Admin Menu
          </Typography>
          <IconButton edge="end" color="inherit" onClick={toggleDrawer} size="large">
            <ChevronLeftOutlinedIcon />
          </IconButton>
        </Toolbar>
        <List>
          {navItems.map((item) => (
            <ListItemButton
              key={item.path}
              component={NavLink}
              to={item.path}
              onClick={() => {
                if (isMobile) {
                  setMobileOpen(false);
                }
              }}
              sx={{
                '&.active': {
                  bgcolor: 'primary.50',
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          ml: { sm: drawerOpen ? `${drawerWidth}px` : 0 },
          transition: (theme) =>
            theme.transitions.create(['margin-left', 'width'], {
              duration: theme.transitions.duration.standard,
            }),
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};