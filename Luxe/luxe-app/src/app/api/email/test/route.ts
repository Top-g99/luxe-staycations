import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  let emailConfig: any, emailAddress: string;
  
  try {
    let config, testEmail;
    try {
      const body = await request.json();
      config = body.config;
      testEmail = body.testEmail;
    } catch (parseError) {
      console.error('Failed to parse request JSON:', parseError);
      return NextResponse.json(
        { success: false, message: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Handle both formats: {config: {...}, testEmail: "..."} and direct config object
    emailConfig = config.config || config;
    emailAddress = testEmail || config.testEmail;
    
    if (!emailConfig || !emailAddress) {
      return NextResponse.json(
        { success: false, message: 'Missing configuration or test email' },
        { status: 400 }
      );
    }

    // Validate required fields
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

    // Validate email address format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailAddress)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid email address format' 
        },
        { status: 400 }
      );
    }

    // Create transporter with Hostinger configuration
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

    // Test connection first
    await transporter.verify();

    // Create test email content
    const testEmailContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Email - Luxe Staycations</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #d97706;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #5a3d35;
            margin-bottom: 10px;
        }
        .tagline {
            color: #666;
            font-style: italic;
        }
        .success-message {
            background-color: #d4edda;
            color: #155724;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border: 1px solid #c3e6cb;
        }
        .config-details {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }
        .detail-row:last-child {
            border-bottom: none;
        }
        .detail-label {
            font-weight: bold;
            color: #5a3d35;
        }
        .detail-value {
            color: #333;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Luxe Staycations</div>
            <div class="tagline">Luxury Redefined</div>
        </div>

        <h2>🎉 Email Configuration Test Successful!</h2>
        
        <div class="success-message">
            <strong>✅ Congratulations!</strong><br>
            Your email configuration is working perfectly. This test email was successfully sent using your Hostinger SMTP settings.
        </div>

        <p>Dear Admin,</p>
        <p>This is a test email to confirm that your email configuration is working correctly. If you're receiving this email, it means:</p>
        
        <ul>
            <li>✅ SMTP connection is successful</li>
            <li>✅ Authentication is working</li>
            <li>✅ Email delivery is functional</li>
            <li>✅ Your Hostinger email setup is correct</li>
        </ul>

        <div class="config-details">
            <h3>Configuration Used:</h3>
            <div class="detail-row">
                <span class="detail-label">SMTP Host:</span>
                <span class="detail-value">${emailConfig.smtpHost}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">SMTP Port:</span>
                <span class="detail-value">${emailConfig.smtpPort}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">SSL/TLS:</span>
                <span class="detail-value">${emailConfig.enableSSL ? 'Enabled' : 'Disabled'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">From Email:</span>
                <span class="detail-value">${emailConfig.fromEmail || emailConfig.smtpUser}</span>
            </div>
        </div>

        <p><strong>Next Steps:</strong></p>
        <p>Your email system is now ready to send booking confirmations, notifications, and other automated emails to your guests.</p>

        <div class="footer">
            <p>This is a test email from Luxe Staycations Admin Panel</p>
            <p>&copy; 2025 Luxe Staycations. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;

    // Send the actual test email
    const info = await transporter.sendMail({
      from: `"${emailConfig.fromName || 'Luxe Staycations'}" <${emailConfig.fromEmail || emailConfig.smtpUser}>`,
      to: emailAddress,
      subject: '✅ Email Configuration Test - Luxe Staycations',
      html: testEmailContent,
    });

    return NextResponse.json({
      success: true,
      message: `Test email sent successfully to ${emailAddress}! Check your inbox.`,
      details: {
        to: emailAddress,
        from: emailConfig.fromEmail || emailConfig.smtpUser,
        subject: '✅ Email Configuration Test - Luxe Staycations',
        messageId: info.messageId,
        config: {
          host: emailConfig.smtpHost,
          port: emailConfig.smtpPort,
          secure: emailConfig.enableSSL,
          user: emailConfig.smtpUser
        }
      }
    });

  } catch (error) {
    console.error('Error sending test email:', error);
    console.error('Configuration used:', {
      host: emailConfig.smtpHost,
      port: emailConfig.smtpPort,
      secure: emailConfig.enableSSL,
      user: emailConfig.smtpUser,
      // Don't log password for security
    });
    
    let errorMessage = 'Failed to send test email';
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
