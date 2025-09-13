"use client";

import { useEffect, useState } from 'react';
import { propertyManager } from '@/lib/dataManager';

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>({ status: 'Loading...' });

  useEffect(() => {
    const runDebug = () => {
      try {
        console.log('Debug: Starting test');
        setDebugInfo({ status: 'Starting...' });

        // Initialize the property manager
        propertyManager.initialize();
        console.log('Debug: PropertyManager initialized');
        setDebugInfo({ status: 'Initialized, getting properties...' });

        // Get all properties
        const allProperties = propertyManager.getAll();
        console.log('Debug: All properties:', allProperties.length);

        // Get featured properties
        const featuredProperties = propertyManager.getFeatured();
        console.log('Debug: Featured properties:', featuredProperties.length);

        setDebugInfo({
          status: 'Completed',
          allPropertiesCount: allProperties.length,
          featuredPropertiesCount: featuredProperties.length,
          allProperties: allProperties.slice(0, 2), // Show only first 2 for brevity
          featuredProperties: featuredProperties.slice(0, 2),
          windowAvailable: typeof window !== 'undefined',
          localStorage: typeof window !== 'undefined' ? localStorage.getItem('luxeProperties') : 'N/A (server)'
        });

      } catch (error) {
        console.error('Debug: Error during test:', error);
        setDebugInfo({ status: 'Error', error: String(error) });
      }
    };

    // Small delay to ensure component is mounted
    setTimeout(runDebug, 100);
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>PropertyManager Debug Page</h1>
      <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
    </div>
  );
}
