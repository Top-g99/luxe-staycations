import { NextRequest, NextResponse } from 'next/server';
import { setupEmailDatabase, checkEmailTablesExist, EMAIL_DATABASE_SQL } from '@/lib/setupEmailDatabase';

export async function GET() {
  try {
    const tableStatus = await checkEmailTablesExist();
    
    return NextResponse.json({
      success: true,
      message: 'Email database status checked',
      tables: tableStatus,
      allTablesExist: Object.values(tableStatus).every(exists => exists),
      sqlScript: EMAIL_DATABASE_SQL
    });
  } catch (error) {
    console.error('Error checking email database:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error checking email database',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const result = await setupEmailDatabase();
    
    return NextResponse.json({
      success: result.success,
      message: result.message,
      tablesCreated: result.tablesCreated,
      errors: result.errors
    });
  } catch (error) {
    console.error('Error setting up email database:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error setting up email database',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
