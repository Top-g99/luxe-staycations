// Debug script to check property storage logic
console.log('=== Property Storage Debug ===');

// Check environment variables
console.log('Environment Variables:');
console.log('NEXT_PUBLIC_USE_LOCAL_STORAGE:', process.env.NEXT_PUBLIC_USE_LOCAL_STORAGE);
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');

// Check localStorage (if available)
if (typeof window !== 'undefined') {
    console.log('\n=== localStorage Check ===');
    const stored = localStorage.getItem('luxe_properties');
    console.log('localStorage luxe_properties:', stored);

    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            console.log('Parsed properties:', parsed);
            console.log('Number of properties:', parsed.length);
        } catch (e) {
            console.error('Error parsing localStorage:', e);
        }
    }
} else {
    console.log('\nlocalStorage not available (server-side)');
}

// Test the shouldUseLocalStorage logic
const shouldUseLocalStorage = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_USE_LOCAL_STORAGE === 'true';
console.log('\n=== Storage Logic ===');
console.log('shouldUseLocalStorage:', shouldUseLocalStorage);
console.log('Will use:', shouldUseLocalStorage ? 'localStorage' : 'Supabase (with localStorage fallback)');