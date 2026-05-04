import { createClient } from '@supabase/supabase-js'
import { sendApprovalEmail, sendRejectionEmail } from '@/lib/email'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { tamuId, action, rejectionReason } = await request.json()

    // Validate input
    if (!tamuId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    if (action === 'reject' && !rejectionReason) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      )
    }

    // Get tamu data
    const { data: tamu, error: fetchError } = await supabase
      .from('tamu')
      .select('id, nama, email, status_verifikasi')
      .eq('id', tamuId)
      .single()

    if (fetchError || !tamu) {
      return NextResponse.json(
        { error: 'Tamu not found' },
        { status: 404 }
      )
    }

    // Check if already verified
    if (tamu.status_verifikasi !== 'pending') {
      return NextResponse.json(
        { error: 'Tamu sudah diverifikasi sebelumnya' },
        { status: 400 }
      )
    }

    // Update status in database
    const updateData = action === 'approve'
      ? { status_verifikasi: 'approved' }
      : { status_verifikasi: 'rejected', rejection_reason: rejectionReason }

    const { error: updateError } = await supabase
      .from('tamu')
      .update(updateData)
      .eq('id', tamuId)

    if (updateError) {
      console.error('[DB Error]', updateError)
      return NextResponse.json(
        { error: 'Failed to update verification status' },
        { status: 500 }
      )
    }

    // Send email
    let emailResult
    if (action === 'approve') {
      emailResult = await sendApprovalEmail(tamu.email, tamu.nama)
    } else {
      emailResult = await sendRejectionEmail(tamu.email, tamu.nama, rejectionReason)
    }

    if (!emailResult.success) {
      console.error('[Email Error]', emailResult.error)
      return NextResponse.json(
        { error: 'Verification updated but email failed to send' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Kunjungan ${action === 'approve' ? 'disetujui' : 'ditolak'} dan email telah dikirim`,
      data: tamu,
    })
  } catch (error) {
    console.error('[API Error]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
