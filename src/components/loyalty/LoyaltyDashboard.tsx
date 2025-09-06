"use client";

import React, { useState, useEffect } from 'react';
import GuestLoyaltyAuth from './GuestLoyaltyAuth';
import GuestLoyaltyDashboard from './GuestLoyaltyDashboard';

export default function LoyaltyDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [guestId, setGuestId] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  useEffect(() => {
    // Check if guest is already authenticated
    const storedGuestId = localStorage.getItem('loyaltyGuestId');
    const storedGuestEmail = localStorage.getItem('loyaltyGuestEmail');
    
    if (storedGuestId && storedGuestEmail) {
      setGuestId(storedGuestId);
      setGuestEmail(storedGuestEmail);
      setIsAuthenticated(true);
    }
  }, []);

  const handleAuthSuccess = (id: string, email: string) => {
    setGuestId(id);
    setGuestEmail(email);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    // Clear loyalty authentication
    localStorage.removeItem('loyaltyGuestId');
    localStorage.removeItem('loyaltyGuestEmail');
    
    // Reset state
    setIsAuthenticated(false);
    setGuestId('');
    setGuestEmail('');
  };

  if (isAuthenticated) {
    return (
      <GuestLoyaltyDashboard
        guestId={guestId}
        guestEmail={guestEmail}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <GuestLoyaltyAuth onAuthSuccess={handleAuthSuccess} />
  );
}
