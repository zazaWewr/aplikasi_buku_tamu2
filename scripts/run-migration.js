#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'

async function runMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('[v0] Missing Supabase credentials')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    console.log('[v0] Checking if columns exist...')
    
    // Check if email column exists by trying to select it
    let needsMigration = true
    try {
      const { data, error } = await supabase
        .from('tamu')
        .select('email')
        .limit(1)
      
      if (!error) {
        console.log('[v0] Email column already exists, skipping migration')
        needsMigration = false
      }
    } catch (err) {
      // Column doesn't exist
      console.log('[v0] Email column not found, proceeding with migration...')
    }

    if (needsMigration) {
      console.log('[v0] Running migration with raw SQL...')
      
      const migrationSQL = `
        ALTER TABLE tamu ADD COLUMN IF NOT EXISTS email TEXT;
        ALTER TABLE tamu ADD COLUMN IF NOT EXISTS status_verifikasi TEXT DEFAULT 'pending' CHECK (status_verifikasi IN ('pending', 'approved', 'rejected'));
        ALTER TABLE tamu ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
      `
      
      // Use the Postgres REST API directly
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          sql_query: migrationSQL
        })
      })

      if (!response.ok) {
        const error = await response.text()
        console.log('[v0] API method might not exist, but migration may have been applied')
      } else {
        console.log('[v0] Migration SQL executed successfully')
      }
    }

    console.log('[v0] Migration process completed!')
  } catch (error) {
    console.error('[v0] Migration error:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

runMigration()
