import { NextRequest, NextResponse } from 'next/server';
import { settingsManager } from '@/lib/settingsManager';

export async function GET(request: NextRequest) {
  try {
    // Initialize SettingsManager if not already done
    if (typeof window === 'undefined') {
      settingsManager.initialize();
    }
    
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    
    let data;
    if (category) {
      data = settingsManager.getSettingsByCategory(category as any);
    } else {
      data = {
        settings: settingsManager.getAllSettings(),
        businessProfile: settingsManager.getBusinessProfile(),
        paymentSettings: settingsManager.getPaymentSettings(),
        notificationSettings: settingsManager.getNotificationSettings(),
        securitySettings: settingsManager.getSecuritySettings(),
        stats: settingsManager.getSettingsStats()
      };
    }
    
    return NextResponse.json({
      success: true,
      data,
      count: category ? data.length : Object.keys(data).length
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch settings' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;
    
    switch (action) {
      case 'updateSetting':
        if (!data.key || data.value === undefined) {
          return NextResponse.json(
            { success: false, error: 'Missing key or value' },
            { status: 400 }
          );
        }
        const success = settingsManager.updateSetting(data.key, data.value);
        return NextResponse.json({
          success,
          message: success ? 'Setting updated successfully' : 'Failed to update setting'
        });
        
      case 'updateBusinessProfile':
        const profileSuccess = settingsManager.updateBusinessProfile(data);
        return NextResponse.json({
          success: profileSuccess,
          message: profileSuccess ? 'Business profile updated successfully' : 'Failed to update business profile'
        });
        
      case 'updatePaymentSettings':
        const paymentSuccess = settingsManager.updatePaymentSettings(data);
        return NextResponse.json({
          success: paymentSuccess,
          message: paymentSuccess ? 'Payment settings updated successfully' : 'Failed to update payment settings'
        });
        
      case 'updateNotificationSettings':
        const notificationSuccess = settingsManager.updateNotificationSettings(data);
        return NextResponse.json({
          success: notificationSuccess,
          message: notificationSuccess ? 'Notification settings updated successfully' : 'Failed to update notification settings'
        });
        
      case 'updateSecuritySettings':
        const securitySuccess = settingsManager.updateSecuritySettings(data);
        return NextResponse.json({
          success: securitySuccess,
          message: securitySuccess ? 'Security settings updated successfully' : 'Failed to update security settings'
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update settings' 
      },
      { status: 500 }
    );
  }
}

