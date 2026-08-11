import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import ReportGmailerrorredOutlinedIcon from '@mui/icons-material/ReportGmailerrorredOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import ChevronLeftOutlinedIcon from '@mui/icons-material/ChevronLeftOutlined';
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

const drawerWidth = 250;

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardOutlinedIcon /> },
  { label: 'Incident Management', path: '/incidents', icon: <ReportGmailerrorredOutlinedIcon /> },
  { label: 'Found Items', path: '/found-items', icon: <Inventory2OutlinedIcon /> },
  { label: 'Lost Reports', path: '/lost-reports', icon: <ReportProblemOutlinedIcon /> },
  { label: 'Global Search', path: '/search', icon: <SearchOutlinedIcon /> },
  { label: 'Return Item', path: '/returns', icon: <TaskAltOutlinedIcon /> },
];

const getNavItemsForRole = (role?: 'SECURITY_SEWADAR' | 'SUPER_ADMIN') => {
  if (role === 'SECURITY_SEWADAR') {
    return navItems.filter((item) => ['/incidents', '/found-items', '/lost-reports'].includes(item.path));
  }

  return navItems;
};

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
              Lost &amp; Found Security Portal
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
            Security Menu
          </Typography>
          <IconButton edge="end" color="inherit" onClick={toggleDrawer} size="large">
            <ChevronLeftOutlinedIcon />
          </IconButton>
        </Toolbar>
        <List>
          {getNavItemsForRole(user?.role).map((item) => (
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
