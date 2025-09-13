'use client';

import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress
} from '@mui/material';
import { getSupabaseClient } from '@/lib/supabase';

export default function DebugBookingPage() {
  const [bookingId, setBookingId] = useState('booking_1757476658252_w2iggdwi4');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const debugBooking = async () => {
    setLoading(true);
    setResult(null);

    try {
      const supabase = getSupabaseClient();
      
      // First, let's see what tables exist
      const results: any = {
        tableCheck: {},
        bookingLookup: {},
        allTables: []
      };

      // Check all possible tables
      const tables = ['bookings', 'host_bookings', 'guest_bookings', 'reservations', 'complete_bookings'];
      
      for (const table of tables) {
        try {
          // Try to get a sample record to see if table exists
          const { data: sampleData, error: sampleError } = await supabase
            .from(table)
            .select('*')
            .limit(1);
          
          results.tableCheck[table] = { 
            exists: !sampleError, 
            error: sampleError?.message,
            sampleCount: sampleData?.length || 0
          };

          // If table exists, try to find our specific booking
          if (!sampleError) {
            const { data: bookingData, error: bookingError } = await supabase
              .from(table)
              .select('*')
              .eq('id', bookingId.trim())
              .single();
            
            results.bookingLookup[table] = { 
              data: bookingData, 
              error: bookingError?.message,
              found: !!bookingData
            };
          }
        } catch (err) {
          results.tableCheck[table] = { 
            exists: false, 
            error: 'Table does not exist or error',
            sampleCount: 0
          };
        }
      }

      // Try to find booking by partial ID match
      for (const table of tables) {
        if (results.tableCheck[table]?.exists) {
          try {
            const { data: partialMatch, error: partialError } = await supabase
              .from(table)
              .select('*')
              .ilike('id', `%${bookingId.trim()}%`)
              .limit(5);
            
            if (partialMatch && partialMatch.length > 0) {
              results.partialMatches = results.partialMatches || {};
              results.partialMatches[table] = partialMatch;
            }
          } catch (err) {
            // Ignore partial match errors
          }
        }
      }

      // Get all table names from Supabase
      try {
        const { data: allTables, error: tablesError } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public');
        
        results.allTables = allTables?.map((t: any) => t.table_name) || [];
      } catch (err) {
        results.allTables = ['Could not fetch table list'];
      }

      setResult(results);
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Debug Booking Lookup
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <TextField
            fullWidth
            label="Booking ID"
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            onClick={debugBooking}
            disabled={loading}
            sx={{
              background: 'linear-gradient(45deg, #5a3d35, #d97706)',
              '&:hover': {
                background: 'linear-gradient(45deg, #4a332c, #b45309)',
              }
            }}
          >
            {loading ? <CircularProgress size={20} /> : 'Debug Booking'}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Debug Results
            </Typography>
            <pre style={{ 
              background: '#f5f5f5', 
              padding: '16px', 
              borderRadius: '8px', 
              overflow: 'auto',
              fontSize: '12px'
            }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}
