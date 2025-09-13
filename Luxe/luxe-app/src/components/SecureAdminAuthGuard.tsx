"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography, Alert, Button } from '@mui/material';
import { SecureAuthManager } from '@/lib/security/secureAuth';
import { SecurityAuditLogger } from '@/lib/security/securityUtils';

interface SecureAdminAuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export default function SecureAdminAuthGuard({ 
  children, 
  requiredRole = 'admin' 
}: SecureAdminAuthGuardProps) {
  const [authState, setAuthState] = useState<{
    isAuthenticated: boolean | null;
    session?: any;
    error?: string;
    remainingTime?: number;
  }>({ isAuthenticated: null });
  
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const sessionInfo = SecureAuthManager.getSessionInfo();
        
        if (!sessionInfo.isLoggedIn) {
          SecurityAuditLogger.logSecurityEvent('AUTH_GUARD_FAILED', {
            reason: sessionInfo.error || 'No valid session',
            requiredRole,
            path: window.location.pathname
          }, 'medium');
          
          setAuthState({ 
            isAuthenticated: false, 
            error: sessionInfo.error || 'Authentication required' 
          });
          
          // Redirect to login after a short delay
          setTimeout(() => {
            router.push('/admin/login');
          }, 2000);
          
          return;
        }

        // Check role if required
        if (requiredRole && sessionInfo.session?.role !== requiredRole) {
          SecurityAuditLogger.logSecurityEvent('AUTH_GUARD_INSUFFICIENT_ROLE', {
            userRole: sessionInfo.session?.role,
            requiredRole,
            path: window.location.pathname
          }, 'high');
          
          setAuthState({ 
            isAuthenticated: false, 
            error: 'Insufficient permissions' 
          });
          
          setTimeout(() => {
            router.push('/admin/login');
          }, 2000);
          
          return;
        }

        setAuthState({
          isAuthenticated: true,
          session: sessionInfo.session,
          remainingTime: sessionInfo.remainingTime
        });

      } catch (error) {
        SecurityAuditLogger.logSecurityEvent('AUTH_GUARD_ERROR', {
          error: error instanceof Error ? error.message : 'Unknown error',
          path: window.location.pathname
        }, 'high');
        
        setAuthState({ 
          isAuthenticated: false, 
          error: 'Authentication check failed' 
        });
      }
    };

    checkAuth();

    // Set up periodic session validation
    const interval = setInterval(checkAuth, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [router, requiredRole]);

  // Show loading while checking authentication
  if (authState.isAuthenticated === null) {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2,
        backgroundColor: '#f5f5f5'
      }}>
        <CircularProgress size={60} sx={{ color: 'var(--primary-dark)' }} />
        <Typography variant="h6" color="text.secondary">
          Verifying secure access...
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 400 }}>
          This may take a moment while we validate your session and permissions.
        </Typography>
      </Box>
    );
  }

  // If not authenticated, show error and redirect info
  if (!authState.isAuthenticated) {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 3,
        backgroundColor: '#f5f5f5',
        padding: 3
      }}>
        <Alert 
          severity="error" 
          sx={{ 
            maxWidth: 500, 
            width: '100%',
            '& .MuiAlert-message': {
              width: '100%'
            }
          }}
        >
          <Typography variant="h6" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body2" paragraph>
            {authState.error || 'You are not authorized to access this page.'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You will be redirected to the login page automatically.
          </Typography>
        </Alert>
        
        <Button 
          variant="contained" 
          onClick={() => router.push('/admin/login')}
          sx={{ 
            backgroundColor: 'var(--primary-dark)',
            '&:hover': {
              backgroundColor: 'var(--primary-light)'
            }
          }}
        >
          Go to Login
        </Button>
      </Box>
    );
  }

  // If authenticated, render children with session info
  return (
    <Box>
      {/* Session status indicator */}
      {authState.remainingTime && authState.remainingTime < 30 * 60 * 1000 && ( // Less than 30 minutes
        <Alert 
          severity="warning" 
          sx={{ 
            position: 'fixed',
            top: 80,
            right: 20,
            zIndex: 1000,
            maxWidth: 300,
            '& .MuiAlert-action': {
              alignItems: 'flex-start'
            }
          }}
          action={
            <Button 
              size="small" 
              onClick={() => {
                // Refresh session or extend
                const newSessionInfo = SecureAuthManager.getSessionInfo();
                setAuthState(prev => ({
                  ...prev,
                  remainingTime: newSessionInfo.remainingTime
                }));
              }}
            >
              Refresh
            </Button>
          }
        >
          <Typography variant="body2">
            Session expires in {Math.round(authState.remainingTime / 60000)} minutes
          </Typography>
        </Alert>
      )}
      
      {children}
    </Box>
  );
}
