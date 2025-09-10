import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    // Read the SQL migration file
    const migrationPath = path.join(process.cwd(), 'src/lib/email/migrations/loyalty-redemption-migration.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`Executing ${statements.length} SQL statements for loyalty redemption tables...`);
    
    const results = [];
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
          if (error) {
            console.error('SQL execution error:', error);
            results.push({ statement: statement.substring(0, 100) + '...', error: error.message });
          } else {
            results.push({ statement: statement.substring(0, 100) + '...', success: true });
          }
        } catch (err) {
          console.error('Statement execution error:', err);
          results.push({ statement: statement.substring(0, 100) + '...', error: err instanceof Error ? err.message : 'Unknown error' });
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Loyalty redemption tables creation completed',
      results: results,
      tables_created: [
        'loyalty_redemption_requests',
        'loyalty_redemption_options', 
        'loyalty_redemption_history'
      ]
    });
    
  } catch (error) {
    console.error('Error creating redemption tables:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to create loyalty redemption tables'
      },
      { status: 500 }
    );
  }
}
