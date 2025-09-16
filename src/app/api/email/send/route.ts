import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { emailSecurityValidator } from '@/lib/security/emailSecurity';
import { emailSendRateLimiter } from '@/lib/security/emailRateLimiter';

export async function POST(request: NextRequest) {
  let emailConfig: any = null;
  const clientIP = emailSecurityValidator.getClientIP(request);
  
  // Check rate limiting
  const rateLimitResult = await emailSendRateLimiter.checkRateLimit(clientIP);
  if (!rateLimitResult.allowed) {
    emailSecurityValidator.logSecurityEvent('RATE_LIMIT_EXCEEDED', {
      clientIP,
      operation: 'email_send',
      remaining: rateLimitResult.remaining,
      resetTime: rateLimitResult.resetTime
    }, 'medium');

    return NextResponse.json(
      { 
        success: false, 
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: rateLimitResult.resetTime
      },
      { 
        status: 429,
        headers: {
          'Retry-After': rateLimitResult.resetTime.toString(),
          'X-RateLimit-Limit': '50',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitResult.resetTime.toString()
        }
      }
    );
  }
  
  try {
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Failed to parse request JSON:', parseError);
      emailSecurityValidator.logSecurityEvent('INVALID_JSON_REQUEST', { clientIP, error: parseError }, 'medium');
      return NextResponse.json(
        { success: false, message: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Comprehensive security validation
    const validation = emailSecurityValidator.validateEmailRequest(request, body);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Request validation failed',
          errors: validation.errors
        },
        { status: 400 }
      );
    }

    const { config, to, template } = validation.sanitizedBody || body;
    emailConfig = config;
    
    if (!emailConfig || !to || !template) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: config, to, or template' },
        { status: 400 }
      );
    }

    // Additional SMTP configuration validation
    const smtpValidation = emailSecurityValidator.validateSmtpConfig(emailConfig);
    if (!smtpValidation.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid SMTP configuration',
          errors: smtpValidation.errors
        },
        { status: 400 }
      );
    }

    // Log email sending attempt
    emailSecurityValidator.logSecurityEvent('EMAIL_SEND_ATTEMPT', {
      to,
      subject: template.subject,
      clientIP
    }, 'low');

    console.log('Sending email with config:', {
      host: emailConfig.smtpHost,
      port: emailConfig.smtpPort,
      secure: emailConfig.enableSSL,
      user: emailConfig.smtpUser,
      to: to,
      subject: template.subject
    });

    // Create secure transporter
    const transporter = nodemailer.createTransport({
      host: emailConfig.smtpHost,
      port: parseInt(emailConfig.smtpPort),
      secure: emailConfig.enableSSL,
      auth: {
        user: emailConfig.smtpUser,
        pass: emailConfig.smtpPassword,
      },
      // Enhanced security configuration
      tls: {
        rejectUnauthorized: true,
        minVersion: 'TLSv1.2',
        ciphers: 'HIGH:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA'
      },
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 5000,    // 5 seconds
      socketTimeout: 10000      // 10 seconds
    });

    // Verify SMTP connection before sending
    try {
      await transporter.verify();
    } catch (verifyError) {
      emailSecurityValidator.logSecurityEvent('SMTP_VERIFICATION_FAILED', {
        error: verifyError instanceof Error ? verifyError.message : 'Unknown error',
        clientIP
      }, 'high');
      
      return NextResponse.json(
        { 
          success: false, 
          message: 'SMTP connection verification failed',
          error: 'Invalid email credentials. Please check your username and password.'
        },
        { status: 500 }
      );
    }

    // Send email with security headers
    const info = await transporter.sendMail({
      from: `"${emailConfig.fromName || 'Luxe Staycations'}" <${emailConfig.fromEmail || emailConfig.smtpUser}>`,
      to: to,
      subject: template.subject,
      html: template.html,
      text: template.text,
      // Security headers
      headers: {
        'X-Mailer': 'Luxe Staycations Email System',
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY'
      }
    });

    // Increment rate limit counter
    emailSendRateLimiter.incrementRateLimit(request, true);

    // Log successful email send
    emailSecurityValidator.logSecurityEvent('EMAIL_SENT_SUCCESS', {
      messageId: info.messageId,
      to,
      subject: template.subject,
      clientIP
    }, 'low');

    console.log('Email sent successfully:', {
      messageId: info.messageId,
      to: to,
      subject: template.subject
    });

    return NextResponse.json({
      success: true,
      message: `Email sent successfully to ${to}`,
      details: {
        to: to,
        subject: template.subject,
        messageId: info.messageId
      }
    });

  } catch (error) {
    // Increment rate limit counter for failed request
    emailSendRateLimiter.incrementRateLimit(request, false);

    // Log email sending error
    emailSecurityValidator.logSecurityEvent('EMAIL_SEND_ERROR', {
      error: error instanceof Error ? error.message : 'Unknown error',
      clientIP
    }, 'high');

    console.error('Error sending email:', error);
    
    if (emailConfig) {
      console.error('Configuration used:', {
        host: emailConfig.smtpHost,
        port: emailConfig.smtpPort,
        secure: emailConfig.enableSSL,
        user: emailConfig.smtpUser,
      });
    }
    
    let errorMessage = 'Failed to send email';
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
      } else if (error.message.includes('EAUTH')) {
        errorMessage = 'Authentication failed. Please check your email credentials.';
      } else if (error.message.includes('EENVELOPE')) {
        errorMessage = 'Invalid recipient email address.';
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
