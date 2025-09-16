'use client';

import React, { useState, useEffect } from 'react';

export default function AdminStatus() {
  const [status, setStatus] = useState({
    isOnline: false,
    lastChecked: null as Date | null,
    systemHealth: 'checking...'
  });

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/admin/status');
        const data = await response.json();
        
        setStatus({
          isOnline: data.status === 'success',
          lastChecked: new Date(),
          systemHealth: data.data?.systemHealth || 'unknown'
        });
      } catch (error) {
        setStatus({
          isOnline: false,
          lastChecked: new Date(),
          systemHealth: 'error'
        });
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      background: 'white',
      borderRadius: '10px',
      padding: '20px',
      margin: '20px 0',
      boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{
        margin: '0 0 15px 0',
        color: '#333',
        fontSize: '1.2rem'
      }}>
        System Status
      </h3>
      
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '10px'
      }}>
        <div style={{
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          background: status.isOnline ? '#4CAF50' : '#f44336',
          marginRight: '10px'
        }}></div>
        <span style={{
          color: status.isOnline ? '#4CAF50' : '#f44336',
          fontWeight: 'bold'
        }}>
          {status.isOnline ? 'Online' : 'Offline'}
        </span>
      </div>
      
      <div style={{
        fontSize: '0.9rem',
        color: '#666'
      }}>
        <div>Health: {status.systemHealth}</div>
        {status.lastChecked && (
          <div>Last checked: {status.lastChecked.toLocaleTimeString()}</div>
        )}
      </div>
    </div>
  );
}
