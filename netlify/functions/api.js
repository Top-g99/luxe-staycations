const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async(event, context) => {
    // Enable CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        const path = event.path.replace('/.netlify/functions/api', '');

        // Route API requests
        switch (path) {
            case '/destinations':
                return await handleDestinations(event, headers);
            case '/villas':
                return await handleVillas(event, headers);
            case '/bookings':
                return await handleBookings(event, headers);
            default:
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({ error: 'API endpoint not found' })
                };
        }
    } catch (error) {
        console.error('API Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};

async function handleDestinations(event, headers) {
    const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data)
    };
}

async function handleVillas(event, headers) {
    const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data)
    };
}

async function handleBookings(event, headers) {
    const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data)
    };
}