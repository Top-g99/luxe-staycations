'use client';

import React, { useState, useEffect } from 'react';
import { supabase, TABLES } from '@/lib/supabaseClient';

export default function TestSupabase() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    testSupabaseConnection();
  }, []);

  const testSupabaseConnection = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Testing Supabase connection...');
      console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

      // Test basic connection
      const { data: testData, error: testError } = await supabase
        .from('properties')
        .select('*')
        .limit(1);

      console.log('Test query result:', { testData, testError });

      if (testError) {
        throw testError;
      }

      // Test count queries
      const [propertiesResult, bookingsResult, destinationsResult] = await Promise.all([
        supabase.from('properties').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('*', { count: 'exact', head: true }),
        supabase.from('destinations').select('*', { count: 'exact', head: true })
      ]);

      console.log('Count results:', {
        properties: propertiesResult.count,
        bookings: bookingsResult.count,
        destinations: destinationsResult.count
      });

      setResult({
        testData,
        counts: {
          properties: propertiesResult.count,
          bookings: bookingsResult.count,
          destinations: destinationsResult.count
        },
        errors: {
          properties: propertiesResult.error,
          bookings: bookingsResult.error,
          destinations: destinationsResult.error
        }
      });

      setLoading(false);
    } catch (err: any) {
      console.error('Supabase test error:', err);
      setError(err.message || 'Unknown error');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Testing Supabase Connection...</h1>
        <p>Please wait...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Supabase Test Failed</h1>
        <p style={{ color: 'red' }}>Error: {error}</p>
        <button onClick={testSupabaseConnection}>Retry</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Supabase Test Results</h1>
      
      <h2>Environment Variables</h2>
      <p>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set'}</p>
      <p>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set'}</p>

      <h2>Test Data</h2>
      <pre>{JSON.stringify(result?.testData, null, 2)}</pre>

      <h2>Count Results</h2>
      <pre>{JSON.stringify(result?.counts, null, 2)}</pre>

      <h2>Errors</h2>
      <pre>{JSON.stringify(result?.errors, null, 2)}</pre>

      <button onClick={testSupabaseConnection}>Test Again</button>
    </div>
  );
}