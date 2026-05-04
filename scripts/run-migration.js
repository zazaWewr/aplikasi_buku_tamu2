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
    console.log('[v0] Adding email column to tamu table...')
    
    // Add email column
    const { error: emailError } = await supabase
      .from('tamu')
      .select('email')
      .limit(1)
      .catch(() => ({ error: { code: 'EMAIL_COLUMN_MISSING' } }))

    if (emailError?.code === 'EMAIL_COLUMN_MISSING') {
      console.log('[v0] Email column does not exist, using raw SQL...')
      
      // Try using the SQL endpoint
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          sql: `
            ALTER TABLE tamu ADD COLUMN IF NOT EXISTS email TEXT;
            ALTER TABLE tamu ADD COLUMN IF NOT EXISTS status_verifikasi TEXT DEFAULT 'pending' CHECK (status_verifikasi IN ('pending', 'approved', 'rejected'));
            ALTER TABLE tamu ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
          `
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to run migration: ${response.statusText}`)
      }
    }

    console.log('[v0] Migration completed successfully!')
  } catch (error) {
    console.error('[v0] Migration error:', error)
    process.exit(1)
  }
}

runMigration()
