// Netlify function to handle API routes for static export
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// Create Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

exports.handler = async(event, context) => {
    try {
        // Parse the request
        const { pathname, query } = parse(event.path, true);

        // Handle API routes
        if (pathname.startsWith('/api/')) {
            // For static export, we'll redirect API calls to Supabase directly
            // or handle them through Netlify functions

            // Example: Handle specific API routes
            if (pathname === '/api/properties') {
                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Content-Type',
                        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
                    },
                    body: JSON.stringify({
                        message: 'API route handled by Netlify function',
                        path: pathname,
                        method: event.httpMethod
                    })
                };
            }

            // For other API routes, return a message
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
                },
                body: JSON.stringify({
                    message: 'API route not implemented in static export',
                    path: pathname,
                    method: event.httpMethod,
                    note: 'Consider using Supabase Edge Functions for server-side logic'
                })
            };
        }

        // For non-API routes, serve the static files
        return {
            statusCode: 404,
            body: 'Not Found'
        };

    } catch (error) {
        console.error('Error in Netlify function:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                error: 'Internal Server Error',
                message: error.message
            })
        };
    }
};