"use client";

import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Chip,
  Button,
  Divider,
  Paper,
  Badge,
  Tooltip
} from '@mui/material';
import {
  Info,
  CheckCircle,
  Warning,
  Error,
  Close,
  CheckCircleOutline,
  DeleteOutline,
  NotificationsOff,
  Refresh
} from '@mui/icons-material';
import { useNotifications, Notification } from '@/contexts/NotificationsContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface NotificationsPanelProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'info':
      return <Info color="info" />;
    case 'success':
      return <CheckCircle color="success" />;
    case 'warning':
      return <Warning color="warning" />;
    case 'error':
      return <Error color="error" />;
    default:
      return <Info color="info" />;
  }
};

const getNotificationColor = (type: Notification['type']) => {
  switch (type) {
    case 'info':
      return 'info.light';
    case 'success':
      return 'success.light';
    case 'warning':
      return 'warning.light';
    case 'error':
      return 'error.light';
    default:
      return 'grey.100';
  }
};

const formatTimestamp = (timestamp: Date) => {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return timestamp.toLocaleDateString();
};

export default function NotificationsPanel({ open, anchorEl, onClose }: NotificationsPanelProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll, triggerCheck, getStatistics } = useNotifications();
  const router = useRouter();
  const [statistics, setStatistics] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load statistics when panel opens
  useEffect(() => {
    if (open) {
      loadStatistics();
    }
  }, [open]);

  const loadStatistics = async () => {
    try {
      const stats = await getStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await triggerCheck();
      await loadStatistics();
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
      onClose();
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleClearAll = () => {
    clearAll();
  };

  if (!open) return null;

  return (
    <Paper
      sx={{
        position: 'absolute',
        top: anchorEl ? anchorEl.getBoundingClientRect().bottom + 8 : 0,
        right: anchorEl ? 16 : 0,
        width: 400,
        maxHeight: 600,
        overflow: 'hidden',
        zIndex: 1300,
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: 2
      }}
    >
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'var(--primary-light)',
        color: 'white'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NotificationsOff />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Badge badgeContent={unreadCount} color="error" />
          )}
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </Box>

      {/* Statistics */}
      {statistics && (
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,0.08)', backgroundColor: '#f8f9fa' }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'text.primary' }}>
            Live Statistics
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {statistics.properties}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Properties
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                {statistics.bookings}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Bookings
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'info.main' }}>
                {statistics.callbacks}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Callbacks
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* Actions */}
      <Box sx={{ p: 1, borderBottom: '1px solid rgba(0,0,0,0.08)', display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Button
          size="small"
          startIcon={<Refresh />}
          onClick={handleRefresh}
          disabled={isRefreshing}
          sx={{ fontSize: '0.75rem' }}
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
        {notifications.length > 0 && (
          <>
            <Button
              size="small"
              startIcon={<CheckCircleOutline />}
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
              sx={{ fontSize: '0.75rem' }}
            >
              Mark all read
            </Button>
            <Button
              size="small"
              startIcon={<DeleteOutline />}
              onClick={handleClearAll}
              color="error"
              sx={{ fontSize: '0.75rem' }}
            >
              Clear all
            </Button>
          </>
        )}
      </Box>

      {/* Notifications List */}
      <Box sx={{ maxHeight: 500, overflow: 'auto' }}>
        {notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
            <NotificationsOff sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
            <Typography variant="body2">
              No notifications yet
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  sx={{
                    p: 2,
                    cursor: notification.actionUrl ? 'pointer' : 'default',
                    backgroundColor: notification.read ? 'transparent' : 'rgba(25, 118, 210, 0.04)',
                    '&:hover': {
                      backgroundColor: notification.read ? 'rgba(0,0,0,0.02)' : 'rgba(25, 118, 210, 0.08)'
                    }
                  }}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: notification.read ? 400 : 600 }}>
                          {notification.title}
                        </Typography>
                        {!notification.read && (
                          <Chip 
                            label="New" 
                            size="small" 
                            color="primary" 
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>
                    }
                    secondaryTypographyProps={{
                      component: 'div',
                      sx: { 
                        '& > div:first-of-type': { 
                          mb: 1, 
                          color: 'text.secondary',
                          fontSize: '0.875rem'
                        },
                        '& > div:last-of-type': { 
                          color: 'text.secondary', 
                          fontSize: '0.75rem' 
                        }
                      }
                    }}
                    secondary={
                      <>
                        <div>{notification.message}</div>
                        <div>{formatTimestamp(notification.timestamp)}</div>
                      </>
                    }
                  />
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(notification.id);
                    }}
                    sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>
    </Paper>
  );
}
