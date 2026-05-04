import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendApprovalEmail(email: string, guestName: string) {
  try {
    const result = await resend.emails.send({
      from: 'Buku Tamu <noreply@buku-tamu.com>',
      to: email,
      subject: 'Kunjungan Anda Telah Disetujui ✅',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2ecc71;">Kunjungan Anda Telah Disetujui</h2>
          <p>Halo ${guestName},</p>
          <p>Kami dengan senang hati mengumumkan bahwa kunjungan Anda telah <strong>disetujui</strong> oleh admin.</p>
          <p>Terima kasih telah mengisi buku tamu digital kami. Silakan datang pada waktu yang telah Anda daftarkan.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">Ini adalah email otomatis. Mohon jangan reply ke email ini.</p>
        </div>
      `,
    })

    if (result.error) {
      console.error('[Resend Error]', result.error)
      return { success: false, error: result.error }
    }

    return { success: true, data: result.data }
  } catch (error) {
    console.error('[Email Service Error]', error)
    return { success: false, error }
  }
}

export async function sendRejectionEmail(email: string, guestName: string, reason: string) {
  try {
    const result = await resend.emails.send({
      from: 'Buku Tamu <noreply@buku-tamu.com>',
      to: email,
      subject: 'Notifikasi Kunjungan Anda',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #e74c3c;">Kunjungan Anda Tidak Dapat Disetujui</h2>
          <p>Halo ${guestName},</p>
          <p>Kami minta maaf, tetapi kunjungan Anda <strong>tidak dapat disetujui</strong> dengan alasan berikut:</p>
          <p style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #e74c3c;">
            <strong>Alasan:</strong> ${reason}
          </p>
          <p>Jika Anda merasa ini adalah kesalahan, silakan hubungi admin untuk informasi lebih lanjut.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">Ini adalah email otomatis. Mohon jangan reply ke email ini.</p>
        </div>
      `,
    })

    if (result.error) {
      console.error('[Resend Error]', result.error)
      return { success: false, error: result.error }
    }

    return { success: true, data: result.data }
  } catch (error) {
    console.error('[Email Service Error]', error)
    return { success: false, error }
  }
}
