'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, CardContent, Alert, Container } from '@mui/material';
import { supabaseConsultationService } from '@/lib/supabaseConsultationService';

export default function DebugConsultationsPage() {
  const [consultations, setConsultations] = useState<any[]>([]);
  const [localStorageData, setLocalStorageData] = useState<any>({});

  useEffect(() => {
    // Load current data
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const allConsultations = await supabaseConsultationService.getAllConsultations();
      setConsultations(allConsultations);

      // Get localStorage data for debugging
      const storageData: any = {};
      const keys = ['luxe_consultations', 'consultation_requests', 'consultations'];
      keys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
          try {
            storageData[key] = JSON.parse(value);
          } catch {
            storageData[key] = value;
          }
        }
      });
      setLocalStorageData(storageData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const clearAllData = async () => {
    try {
      await supabaseConsultationService.clearAllConsultations();
      alert('All consultation data cleared from database!');
      loadData(); // Reload data
    } catch (error) {
      console.error('Error clearing data:', error);
      alert('Error clearing data');
    }
  };

  const testSubmission = async () => {
    try {
      const testData = {
        name: "Test User",
        email: "test@example.com",
        phone: "+91 98765 43210",
        propertyType: "Villa",
        location: "Test Location",
        bedrooms: 3,
        bathrooms: 2,
        maxGuests: 6,
        propertyDescription: "Test property description",
        consultationType: "phone",
        preferredDate: "2024-12-15",
        preferredTime: "10:00 AM",
        additionalNotes: "Test consultation request"
      };

      const response = await fetch('/api/consultations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      if (response.ok) {
        alert('Test consultation submitted successfully!');
        loadData(); // Reload data
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error submitting test consultation:', error);
      alert('Error submitting test consultation');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Consultation Debug Page
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Actions
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button variant="contained" color="primary" onClick={loadData}>
              Reload Data
            </Button>
            <Button variant="contained" color="secondary" onClick={testSubmission}>
              Submit Test Consultation
            </Button>
            <Button variant="outlined" color="error" onClick={clearAllData}>
              Clear All Data
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Current Consultations ({consultations.length})
          </Typography>
          {consultations.length === 0 ? (
            <Alert severity="info">No consultations found</Alert>
          ) : (
            <Box>
              {consultations.map((consultation, index) => (
                <Box key={consultation.id || index} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                  <Typography variant="subtitle1"><strong>Name:</strong> {consultation.name}</Typography>
                  <Typography variant="body2"><strong>Email:</strong> {consultation.email}</Typography>
                  <Typography variant="body2"><strong>Location:</strong> {consultation.location}</Typography>
                  <Typography variant="body2"><strong>Type:</strong> {consultation.consultationType}</Typography>
                  <Typography variant="body2"><strong>Status:</strong> {consultation.status}</Typography>
                  <Typography variant="body2"><strong>Submitted:</strong> {consultation.submittedDate}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            LocalStorage Data
          </Typography>
          <pre style={{ background: '#f5f5f5', padding: '16px', borderRadius: '4px', overflow: 'auto' }}>
            {JSON.stringify(localStorageData, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </Container>
  );
}
