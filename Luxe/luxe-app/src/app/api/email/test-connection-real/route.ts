import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle both { config: ... } and direct config formats
    const config = body.config || body;

    if (!config || !config.smtpHost || !config.smtpUser || !config.smtpPassword) {
      return NextResponse.json(
        { success: false, message: 'Missing configuration' },
        { status: 400 }
      );
    }

    // Create transporter with provided configuration
    const port = parseInt(config.smtpPort);
    const isSecure = port === 465; // SSL for 465, TLS for 587
    
    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: port,
      secure: isSecure, // true for 465, false for other ports
      auth: {
        user: config.smtpUser,
        pass: config.smtpPassword,
      },
      tls: {
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2',
        ciphers: 'HIGH:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA'
      }
    });

    // Test the connection
    await transporter.verify();

    console.log('SMTP connection test successful');

    return NextResponse.json({
      success: true,
      message: 'SMTP connection test successful'
    });

  } catch (error) {
    console.error('SMTP connection test failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: `SMTP connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      },
      { status: 500 }
    );
  }
}
