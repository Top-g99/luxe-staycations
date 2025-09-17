'use client';

import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Villa as VillaIcon,
  LocationOn as LocationIcon,
  BookOnline as BookingIcon,
  People as PeopleIcon,
  Phone as PhoneIcon,
  LocalOffer as OfferIcon,
  Schedule as ScheduleIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  Home as HomeIcon,
  ArrowOutward as ArrowOutwardIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  Email as EmailIcon,
  Star as StarIcon,
  Storage as DatabaseIcon
} from '@mui/icons-material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const drawerWidth = 280;

const menuItems = [
  { text: 'Home', icon: <HomeIcon />, href: '/' },
  { text: 'Dashboard', icon: <DashboardIcon />, href: '/admin' },
  { text: 'Properties', icon: <VillaIcon />, href: '/admin/properties' },
  { text: 'Destinations', icon: <LocationIcon />, href: '/admin/destinations' },
  { text: 'Bookings', icon: <BookingIcon />, href: '/admin/bookings' },
  { text: 'Callback Requests', icon: <PhoneIcon />, href: '/admin/callbacks' },
  { text: 'Deal Banner', icon: <OfferIcon />, href: '/admin/banners' },
  { text: 'Hero Backgrounds', icon: <HomeIcon />, href: '/admin/hero' },
  { text: 'Special Requests', icon: <AssignmentIcon />, href: '/admin/special-requests' },
  { text: 'Consultation Requests', icon: <ScheduleIcon />, href: '/admin/consultations' },
  { text: 'Partner Applications', icon: <BusinessIcon />, href: '/admin/partners' },
  { text: 'Owner Bookings', icon: <BookingIcon />, href: '/admin/owner-bookings' },
  { text: 'Payments', icon: <AnalyticsIcon />, href: '/admin/payments' },
  { text: 'Data Monitor', icon: <AnalyticsIcon />, href: '/admin/analytics' }
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const pathname = usePathname();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const drawer = (
    <Box>
      {/* Logo Section */}
      <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Luxe Admin
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Property Management Dashboard
        </Typography>
      </Box>

      {/* Navigation Menu */}
      <List sx={{ px: 2, py: 1 }}>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <Link href={item.href} style={{ textDecoration: 'none', width: '100%' }}>
                <ListItemButton
                  sx={{
                    borderRadius: 2,
                    backgroundColor: isActive ? 'primary.main' : 'transparent',
                    color: isActive ? 'white' : 'text.primary',
                    '&:hover': {
                      backgroundColor: isActive ? 'primary.dark' : 'action.hover',
                    },
                    position: 'relative'
                  }}
                >
                  <ListItemIcon sx={{ color: isActive ? 'white' : 'text.primary', minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 600 : 400
                    }}
                  />
                  {isActive && (
                    <Box
                      sx={{
                        position: 'absolute',
                        right: 8,
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        borderRadius: 1,
                        px: 1,
                        py: 0.5
                      }}
                    >
                      <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                        Active
                      </Typography>
                    </Box>
                  )}
                </ListItemButton>
              </Link>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: 'grey.900',
          boxShadow: 'none',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ color: 'white' }}>
              Luxe Staycations
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <IconButton color="inherit" title="Go to Home Page">
                <HomeIcon />
              </IconButton>
            </Link>
            <IconButton color="inherit">
              <Badge badgeContent={4} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton color="inherit">
              <ArrowOutwardIcon />
            </IconButton>
            <IconButton
              color="inherit"
              onClick={handleProfileMenuOpen}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                A
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleProfileMenuClose}>Profile</MenuItem>
        <MenuItem onClick={handleProfileMenuClose}>Settings</MenuItem>
        <MenuItem onClick={handleProfileMenuClose}>Logout</MenuItem>
      </Menu>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
          backgroundColor: 'grey.50',
          minHeight: 'calc(100vh - 64px)'
        }}
      >
        {children}
      </Box>
    </Box>
  );
}