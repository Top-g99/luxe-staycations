import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const results = {
      timestamp: new Date().toISOString(),
      tests: [] as any[],
      overallStatus: 'PASS',
      recommendations: [] as string[]
    };

    // Test 1: Check Supabase Connection
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('email_configurations')
        .select('*')
        .limit(1);
      
      if (error) {
        results.tests.push({
          test: 'Supabase Connection',
          status: 'FAIL',
          message: `Supabase error: ${error.message}`,
          details: error
        });
        results.overallStatus = 'FAIL';
      } else {
        results.tests.push({
          test: 'Supabase Connection',
          status: 'PASS',
          message: 'Successfully connected to Supabase',
          details: { recordCount: data?.length || 0 }
        });
      }
    } catch (error) {
      results.tests.push({
        test: 'Supabase Connection',
        status: 'FAIL',
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error
      });
      results.overallStatus = 'FAIL';
    }

    // Test 2: Check Email Configuration
    try {
      const supabase = getSupabaseClient();
      const { data: configs, error } = await supabase
        .from('email_configurations')
        .select('*')
        .eq('is_active', true)
        .limit(1);

      if (error) {
        results.tests.push({
          test: 'Email Configuration',
          status: 'FAIL',
          message: `Failed to load configuration: ${error.message}`,
          details: error
        });
        results.overallStatus = 'FAIL';
      } else if (!configs || configs.length === 0) {
        results.tests.push({
          test: 'Email Configuration',
          status: 'FAIL',
          message: 'No active email configuration found',
          details: { configs: configs || [] }
        });
        results.overallStatus = 'FAIL';
        results.recommendations.push('Configure email settings in Admin → Settings → Email Settings');
      } else {
        const config = configs[0];
        const hasRequiredFields = config.smtp_host && config.smtp_user && config.smtp_password;
        
        if (!hasRequiredFields) {
          results.tests.push({
            test: 'Email Configuration',
            status: 'FAIL',
            message: 'Email configuration missing required fields',
            details: { 
              hasHost: !!config.smtp_host,
              hasUser: !!config.smtp_user,
              hasPassword: !!config.smtp_password
            }
          });
          results.overallStatus = 'FAIL';
          results.recommendations.push('Complete email configuration with all required fields');
        } else {
          results.tests.push({
            test: 'Email Configuration',
            status: 'PASS',
            message: 'Email configuration is complete',
            details: { 
              host: config.smtp_host,
              port: config.smtp_port,
              user: config.smtp_user,
              fromEmail: config.from_email
            }
          });
        }
      }
    } catch (error) {
      results.tests.push({
        test: 'Email Configuration',
        status: 'FAIL',
        message: `Configuration check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error
      });
      results.overallStatus = 'FAIL';
    }

    // Test 3: SMTP Connection Test
    try {
      const supabase = getSupabaseClient();
      const { data: configs, error } = await supabase
        .from('email_configurations')
        .select('*')
        .eq('is_active', true)
        .limit(1);

      if (!error && configs && configs.length > 0) {
        const config = configs[0];
        
        const transporter = nodemailer.createTransport({
          host: config.smtp_host,
          port: parseInt(config.smtp_port) || 587,
          secure: config.smtp_port === '465',
          auth: {
            user: config.smtp_user,
            pass: config.smtp_password,
          },
          tls: {
            rejectUnauthorized: false,
            minVersion: 'TLSv1.2',
            ciphers: 'HIGH:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!PSK:!SRP:!CAMELLIA'
          }
        });

        await transporter.verify();
        
        results.tests.push({
          test: 'SMTP Connection',
          status: 'PASS',
          message: 'Successfully connected to SMTP server',
          details: { 
            host: config.smtp_host,
            port: config.smtp_port,
            secure: config.smtp_port === '465'
          }
        });
      } else {
        results.tests.push({
          test: 'SMTP Connection',
          status: 'SKIP',
          message: 'Skipped - no valid configuration found',
          details: {}
        });
      }
    } catch (error) {
      results.tests.push({
        test: 'SMTP Connection',
        status: 'FAIL',
        message: `SMTP connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error
      });
      results.overallStatus = 'FAIL';
      
      // Add specific recommendations based on error
      if (error instanceof Error) {
        if (error.message.includes('authentication')) {
          results.recommendations.push('Check SMTP username and password');
          results.recommendations.push('For Gmail, use App Password instead of regular password');
        } else if (error.message.includes('connection')) {
          results.recommendations.push('Check SMTP host and port settings');
          results.recommendations.push('Verify network connectivity');
        } else if (error.message.includes('TLS') || error.message.includes('SSL')) {
          results.recommendations.push('Check SSL/TLS settings');
          results.recommendations.push('Try different port (587 for TLS, 465 for SSL)');
        }
      }
    }

    // Test 4: Email Templates
    try {
      const supabase = getSupabaseClient();
      const { data: templates, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('is_active', true);

      if (error) {
        results.tests.push({
          test: 'Email Templates',
          status: 'FAIL',
          message: `Failed to load templates: ${error.message}`,
          details: error
        });
        results.overallStatus = 'FAIL';
      } else {
        results.tests.push({
          test: 'Email Templates',
          status: 'PASS',
          message: `Found ${templates?.length || 0} active email templates`,
          details: { 
            templateCount: templates?.length || 0,
            templates: templates?.map((t: any) => ({ id: t.id, name: t.name, type: t.type })) || []
          }
        });
      }
    } catch (error) {
      results.tests.push({
        test: 'Email Templates',
        status: 'FAIL',
        message: `Template check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error
      });
      results.overallStatus = 'FAIL';
    }

    // Test 5: Environment Variables
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    ];

    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missingEnvVars.length > 0) {
      results.tests.push({
        test: 'Environment Variables',
        status: 'FAIL',
        message: `Missing required environment variables: ${missingEnvVars.join(', ')}`,
        details: { missing: missingEnvVars }
      });
      results.overallStatus = 'FAIL';
      results.recommendations.push('Configure missing environment variables in deployment settings');
    } else {
      results.tests.push({
        test: 'Environment Variables',
        status: 'PASS',
        message: 'All required environment variables are configured',
        details: { checked: requiredEnvVars }
      });
    }

    // Add general recommendations
    if (results.overallStatus === 'FAIL') {
      results.recommendations.push('Check email delivery logs in Admin → Email Delivery');
      results.recommendations.push('Test email sending with a simple test email');
      results.recommendations.push('Verify recipient email addresses are valid');
      results.recommendations.push('Check spam/junk folders in recipient email');
    }

    return NextResponse.json({
      success: true,
      results
    });

  } catch (error) {
    console.error('Email system test failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: `System test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        results: {
          timestamp: new Date().toISOString(),
          tests: [{
            test: 'System Test',
            status: 'FAIL',
            message: error instanceof Error ? error.message : 'Unknown error'
          }],
          overallStatus: 'FAIL',
          recommendations: ['Check server logs and configuration']
        }
      },
      { status: 500 }
    );
  }
}
