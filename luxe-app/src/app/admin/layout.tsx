"use client";

import React, { useState } from 'react';
import { useNotifications } from '@/contexts/NotificationsContext';
import NotificationsPanel from '@/components/NotificationsPanel';
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
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Chip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Villa,
  LocationOn,
  Phone,
  Campaign,
  Analytics,
  Settings,
  AccountCircle,
  Notifications,
  Logout,
  BookOnline,
  Payment,
  Business,
  Support,
  People,
  PhotoCamera,
  CalendarToday,
  Home,
  Storage,
  Diamond,
  Search,
  Security,
  Email
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import { AdminAuthManager } from '@/lib/adminAuth';

const drawerWidth = 280;

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/admin' },
  { text: 'Properties', icon: <Villa />, path: '/admin/properties' },
  { text: 'Destinations', icon: <LocationOn />, path: '/admin/destinations' },
  { text: 'Bookings', icon: <BookOnline />, path: '/admin/bookings' },
    { text: 'Booking Calendar', icon: <CalendarToday />, path: '/admin/booking-calendar' },
  { text: 'Profile Management', icon: <AccountCircle />, path: '/admin/profile-management' },
  { text: 'Host Management', icon: <People />, path: '/admin/host-management' },
  { text: 'Security Dashboard', icon: <Security />, path: '/admin/security' },
  { text: 'Email Templates', icon: <Email />, path: '/admin/email-templates' },
  { text: 'Email Delivery', icon: <Email />, path: '/admin/email-delivery' },
  { text: 'Email System', icon: <Email />, path: '/admin/email-system' },
  { text: 'Callback Requests', icon: <Phone />, path: '/admin/callback-requests' },
  { text: 'Deal Banner', icon: <Campaign />, path: '/admin/deal-banner' },
  { text: 'Offers Banner', icon: <Campaign />, path: '/admin/offers-banner' },
  { text: 'Coupon Analytics', icon: <Analytics />, path: '/admin/coupon-analytics' },
  { text: 'Hero Backgrounds', icon: <PhotoCamera />, path: '/admin/hero-backgrounds' },
  { text: 'Special Requests', icon: <Support />, path: '/admin/special-requests' },
  { text: 'Consultation Requests', icon: <People />, path: '/admin/consultation-requests' },
  { text: 'Partner Applications', icon: <Business />, path: '/admin/partner-applications' },
  { text: 'Owner Bookings', icon: <CalendarToday />, path: '/admin/owner-bookings' },
  { text: 'Payments', icon: <Payment />, path: '/admin/payments' },
          { text: 'Loyalty Redemption', icon: <Diamond />, path: '/admin/loyalty-redemption' },
        { text: 'Loyalty Rules', icon: <Settings />, path: '/admin/loyalty-rules' },
  { text: 'Data Monitor', icon: <Storage />, path: '/admin/data-monitor' },
  { text: 'Analytics', icon: <Analytics />, path: '/admin/analytics' },
  { text: 'SEO Management', icon: <Search />, path: '/admin/seo' },
  { text: 'Settings', icon: <Settings />, path: '/admin/settings' }
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState<null | HTMLElement>(null);
  const { unreadCount } = useNotifications();
  const router = useRouter();
  const pathname = usePathname();

  // Don't apply auth guard to login page
  const isLoginPage = pathname === '/admin/login';

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchorEl(event.currentTarget);
    setNotificationsOpen(true);
  };

  const handleNotificationsClose = () => {
    setNotificationsOpen(false);
    setNotificationsAnchorEl(null);
  };

  const handleLogout = () => {
    AdminAuthManager.logout();
    router.push('/admin/login');
  };

  const drawer = (
    <Box>
      <Box sx={{ 
        p: 3, 
        textAlign: 'center',
        background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--secondary-dark) 100%)',
        color: 'white'
      }}>
        <Typography variant="h5" sx={{ 
          fontFamily: 'Playfair Display, serif',
          fontWeight: 700,
          mb: 1
        }}>
          Luxe Admin
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          Property Management Dashboard
        </Typography>
      </Box>
      
      <Divider />
      
      <List sx={{ pt: 2 }}>
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding>
              <Link href={item.path} style={{ textDecoration: 'none', width: '100%' }}>
                <ListItemButton
                  sx={{
                    mx: 1,
                    borderRadius: 2,
                    mb: 0.5,
                    backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                    color: isActive ? 'white' : 'inherit',
                    '&:hover': {
                      backgroundColor: isActive ? 'var(--primary-light)' : 'rgba(0, 0, 0, 0.04)',
                    }
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: isActive ? 'white' : 'inherit',
                    minWidth: 40
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    sx={{ 
                      '& .MuiListItemText-primary': {
                        fontWeight: isActive ? 600 : 400
                      }
                    }}
                  />
                  {isActive && (
                    <Chip 
                      label="Active" 
                      size="small" 
                      sx={{ 
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        fontSize: '0.75rem'
                      }} 
                    />
                  )}
                </ListItemButton>
              </Link>
            </ListItem>
          );
        })}
      </List>
      
      {/* Sign Out Section */}
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => handleLogout()}
            sx={{
              mx: 1,
              borderRadius: 2,
              backgroundColor: 'rgba(220, 38, 38, 0.1)',
              color: '#dc2626',
              '&:hover': {
                backgroundColor: 'rgba(220, 38, 38, 0.2)',
              }
            }}
          >
            <ListItemIcon sx={{ 
              color: '#dc2626',
              minWidth: 40
            }}>
              <Logout />
            </ListItemIcon>
            <ListItemText 
              primary="Sign Out" 
              sx={{ 
                '& .MuiListItemText-primary': {
                  fontWeight: 600
                }
              }}
            />
          </ListItemButton>
        </ListItem>
      </Box>
    </Box>
  );

  // If it's the login page, render without auth guard and layout
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <AdminAuthGuard>
      <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: 'white',
          color: 'var(--primary-dark)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={() => handleDrawerToggle()}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find(item => item.path === pathname)?.text || 'Admin Dashboard'}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton 
              color="inherit" 
              onClick={() => router.push('/')}
              sx={{ 
                '&:hover': { 
                  backgroundColor: 'rgba(0, 0, 0, 0.04)' 
                } 
              }}
              title="Go to Home"
            >
              <Home />
            </IconButton>
            
            <IconButton 
              color="inherit"
              onClick={handleNotificationsOpen}
              sx={{ 
                '&:hover': { 
                  backgroundColor: 'rgba(0, 0, 0, 0.04)' 
                } 
              }}
              title="Notifications"
            >
              <Badge badgeContent={unreadCount} color="error">
                <Notifications />
              </Badge>
            </IconButton>
            
            <IconButton 
              color="inherit"
              onClick={() => handleLogout()}
              sx={{ 
                ml: 1,
                '&:hover': { 
                  backgroundColor: 'rgba(220, 38, 38, 0.1)',
                  color: '#dc2626'
                } 
              }}
              title="Sign Out"
            >
              <Logout />
            </IconButton>
            
            <IconButton
              onClick={handleProfileMenuOpen}
              sx={{ ml: 1 }}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'var(--primary-light)' }}>
                <AccountCircle />
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundColor: 'white'
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundColor: 'white',
              borderRight: '1px solid rgba(0, 0, 0, 0.12)'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
          backgroundColor: '#f5f5f5',
          minHeight: '100vh'
        }}
      >
        {children}
      </Box>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={() => handleProfileMenuClose()}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => handleProfileMenuClose()}>
          <AccountCircle sx={{ mr: 2 }} />
          Profile
        </MenuItem>
        <MenuItem onClick={() => handleProfileMenuClose()}>
          <Settings sx={{ mr: 2 }} />
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleLogout()}>
          <Logout sx={{ mr: 2 }} />
          Logout
        </MenuItem>
      </Menu>

      {/* Notifications Panel */}
      <NotificationsPanel
        open={notificationsOpen}
        anchorEl={notificationsAnchorEl}
        onClose={handleNotificationsClose}
      />
      </Box>
    </AdminAuthGuard>
  );
}
