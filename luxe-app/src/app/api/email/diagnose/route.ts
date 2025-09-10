import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const config = body.config || body;

    if (!config || !config.smtpHost || !config.smtpUser || !config.smtpPassword) {
      return NextResponse.json(
        { success: false, message: 'Missing configuration' },
        { status: 400 }
      );
    }

    const diagnostics = {
      smtpConfig: {
        host: config.smtpHost,
        port: config.smtpPort,
        user: config.smtpUser,
        fromEmail: config.fromEmail,
        fromName: config.fromName
      },
      tests: [] as any[],
      recommendations: [] as string[]
    };

    // Test 1: Basic SMTP Connection
    try {
      const port = parseInt(config.smtpPort);
      const isSecure = port === 465;
      
      const transporter = nodemailer.createTransport({
        host: config.smtpHost,
        port: port,
        secure: isSecure,
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

      await transporter.verify();
      diagnostics.tests.push({
        test: 'SMTP Connection',
        status: 'PASS',
        message: 'Successfully connected to SMTP server'
      });
    } catch (error) {
      diagnostics.tests.push({
        test: 'SMTP Connection',
        status: 'FAIL',
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      diagnostics.recommendations.push('Check SMTP credentials and server settings');
    }

    // Test 2: Send Test Email
    try {
      const port = parseInt(config.smtpPort);
      const isSecure = port === 465;
      
      const transporter = nodemailer.createTransport({
        host: config.smtpHost,
        port: port,
        secure: isSecure,
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

      const testEmail = {
        from: `"${config.fromName}" <${config.fromEmail}>`,
        to: config.testEmail || config.smtpUser, // Send to self if no test email provided
        subject: 'Luxe Staycations - Email Delivery Test',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #8B4513;">Email Delivery Test</h2>
            <p>This is a test email to verify email delivery functionality.</p>
            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
            <p><strong>SMTP Host:</strong> ${config.smtpHost}</p>
            <p><strong>From:</strong> ${config.fromEmail}</p>
            <hr>
            <p style="color: #666; font-size: 12px;">
              If you receive this email, your SMTP configuration is working correctly.
            </p>
          </div>
        `,
        text: `Email Delivery Test - ${new Date().toISOString()}`
      };

      const info = await transporter.sendMail(testEmail);
      diagnostics.tests.push({
        test: 'Email Sending',
        status: 'PASS',
        message: `Test email sent successfully. Message ID: ${info.messageId}`
      });
    } catch (error) {
      diagnostics.tests.push({
        test: 'Email Sending',
        status: 'FAIL',
        message: `Failed to send test email: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      diagnostics.recommendations.push('Check email sending permissions and authentication');
    }

    // Test 3: Configuration Analysis
    const configIssues = [];
    
    if (config.smtpHost.includes('gmail.com') && !config.smtpPassword.includes('App Password')) {
      configIssues.push('Gmail requires App Password, not regular password');
      diagnostics.recommendations.push('Generate App Password in Google Account settings');
    }
    
    if (config.fromEmail && !config.fromEmail.includes('@')) {
      configIssues.push('Invalid from email format');
      diagnostics.recommendations.push('Use a valid email address format');
    }
    
    if (config.smtpPort && (config.smtpPort < 25 || config.smtpPort > 65535)) {
      configIssues.push('Invalid SMTP port');
      diagnostics.recommendations.push('Use standard SMTP ports: 25, 465, 587, or 2525');
    }

    if (configIssues.length > 0) {
      diagnostics.tests.push({
        test: 'Configuration Analysis',
        status: 'WARN',
        message: `Configuration issues found: ${configIssues.join(', ')}`
      });
    } else {
      diagnostics.tests.push({
        test: 'Configuration Analysis',
        status: 'PASS',
        message: 'Configuration appears valid'
      });
    }

    // Add general recommendations
    diagnostics.recommendations.push('Check spam/junk folders in recipient email');
    diagnostics.recommendations.push('Verify domain reputation and SPF/DKIM records');
    diagnostics.recommendations.push('Consider using a dedicated email service like SendGrid or Mailgun');
    diagnostics.recommendations.push('Monitor email delivery logs for bounce rates');

    return NextResponse.json({
      success: true,
      diagnostics
    });

  } catch (error) {
    console.error('Email diagnostics failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: `Diagnostics failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        diagnostics: {
          tests: [{
            test: 'System Error',
            status: 'FAIL',
            message: error instanceof Error ? error.message : 'Unknown error'
          }],
          recommendations: ['Check server logs and configuration']
        }
      },
      { status: 500 }
    );
  }
}
