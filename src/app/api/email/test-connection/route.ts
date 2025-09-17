import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  let emailConfig: any = null;
  
  try {
    let config;
    try {
      config = await request.json();
    } catch (parseError) {
      console.error('Failed to parse request JSON:', parseError);
      return NextResponse.json(
        { success: false, message: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Handle both formats: {config: {...}} and direct config object
    emailConfig = config.config || config;
    
    if (!emailConfig) {
      return NextResponse.json(
        { success: false, message: 'Missing email configuration' },
        { status: 400 }
      );
    }

    // For now, just validate the configuration without actually testing SMTP
    // This will help us identify if the issue is with the API or with Nodemailer
    const requiredFields = ['smtpHost', 'smtpPort', 'smtpUser', 'smtpPassword'];
    const missingFields = requiredFields.filter(field => !emailConfig[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Missing required fields: ${missingFields.join(', ')}` 
        },
        { status: 400 }
      );
    }

    console.log('Testing SMTP connection with config:', {
      host: emailConfig.smtpHost,
      port: emailConfig.smtpPort,
      secure: emailConfig.enableSSL,
      user: emailConfig.smtpUser
    });

    // Create transporter and test actual SMTP connection
    const transporter = nodemailer.createTransport({
      host: emailConfig.smtpHost,
      port: parseInt(emailConfig.smtpPort),
      secure: emailConfig.enableSSL, // true for 465, false for other ports
      auth: {
        user: emailConfig.smtpUser,
        pass: emailConfig.smtpPassword,
      },
      // Enhanced security configuration for better compatibility
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates for Hostinger
        minVersion: 'TLSv1.2',
        ciphers: 'HIGH:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA'
      },
      // Connection timeout
      connectionTimeout: 30000, // 30 seconds
      greetingTimeout: 15000,   // 15 seconds
      socketTimeout: 30000,     // 30 seconds
    });

    // Test the actual SMTP connection
    await transporter.verify();

    return NextResponse.json({
      success: true,
      message: 'SMTP connection successful! Your email configuration is working perfectly.',
      config: {
        host: emailConfig.smtpHost,
        port: emailConfig.smtpPort,
        secure: emailConfig.enableSSL,
        user: emailConfig.smtpUser
        // Don't include password in response
      }
    });

  } catch (error) {
    console.error('SMTP connection test failed:', error);
    
    if (emailConfig) {
      console.error('Configuration used:', {
        host: emailConfig.smtpHost,
        port: emailConfig.smtpPort,
        secure: emailConfig.enableSSL,
        user: emailConfig.smtpUser,
        // Don't log password for security
      });
    }
    
    let errorMessage = 'SMTP connection failed';
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Provide more specific error messages for common issues
      if (error.message.includes('Invalid login')) {
        errorMessage = 'Invalid email credentials. Please check your username and password.';
      } else if (error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Connection refused. Please check your SMTP host and port settings.';
      } else if (error.message.includes('ETIMEDOUT')) {
        errorMessage = 'Connection timeout. Please check your SMTP host and port settings.';
      } else if (error.message.includes('self signed certificate')) {
        errorMessage = 'SSL certificate issue. Try disabling SSL or use port 587 with TLS.';
      } else if (error.message.includes('ENOTFOUND')) {
        errorMessage = 'SMTP host not found. Please check your SMTP host address.';
      }
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: errorMessage,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
