import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { config } = await request.json();

    if (!config) {
      return NextResponse.json(
        { success: false, message: 'Missing configuration' },
        { status: 400 }
      );
    }

    // Create transporter with provided configuration
    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: parseInt(config.smtpPort),
      secure: config.enableSSL, // true for 465, false for other ports
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
