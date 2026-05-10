"use server"

import { createClient } from "@/lib/supabase/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function approveTamu(
  tamuId: string,
  adminEmail: string
) {
  try {
    const supabase = await createClient()

    // Get tamu data
    const { data: tamuData, error: fetchError } = await supabase
      .from("tamu")
      .select("*")
      .eq("id", tamuId)
      .single()

    if (fetchError || !tamuData) {
      throw new Error("Tamu data not found")
    }

    // Update status to accepted
    const { error: updateError } = await supabase
      .from("tamu")
      .update({
        status: "accepted",
        verified_at: new Date().toISOString(),
        verified_by: adminEmail,
      })
      .eq("id", tamuId)

    if (updateError) throw updateError

    // Send email notification
    const emailResult = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: tamuData.email,
      subject: "Kunjungan Anda Telah Disetujui",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb;">Kunjungan Anda Telah Disetujui</h2>
            <p>Halo ${tamuData.nama},</p>
            <p>Kami dengan senang hati mengumumkan bahwa kunjungan Anda ke SMA Muhammadiyah Kupang telah <strong>disetujui</strong>.</p>
            
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1f2937; margin-top: 0;">Detail Kunjungan Anda:</h3>
              <p><strong>Nama:</strong> ${tamuData.nama}</p>
              <p><strong>Instansi:</strong> ${tamuData.instansi || "Tidak disebutkan"}</p>
              <p><strong>Nomor HP:</strong> ${tamuData.no_hp}</p>
              <p><strong>Tujuan Bertemu:</strong> ${tamuData.tujuan}</p>
              <p><strong>Keperluan:</strong> ${tamuData.keperluan}</p>
            </div>
            
            <p>Silakan datang sesuai dengan waktu yang telah ditentukan. Jika ada perubahan, silakan hubungi kami sesegera mungkin.</p>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              Terima kasih,<br>
              SMA Muhammadiyah Kupang
            </p>
          </div>
        </div>
      `,
    })

    if (emailResult.error) {
      console.error("Email send error:", emailResult.error)
    }

    return { success: true, message: "Kunjungan disetujui dan email dikirim" }
  } catch (error) {
    console.error("Approve tamu error:", error)
    return { success: false, message: "Gagal menyetujui kunjungan" }
  }
}

export async function rejectTamu(
  tamuId: string,
  adminEmail: string,
  reason: string
) {
  try {
    const supabase = await createClient()

    // Get tamu data
    const { data: tamuData, error: fetchError } = await supabase
      .from("tamu")
      .select("*")
      .eq("id", tamuId)
      .single()

    if (fetchError || !tamuData) {
      throw new Error("Tamu data not found")
    }

    // NOTE: Data ditolak HANYA disimpan di client-side state, TIDAK disimpan ke database
    // Hanya kirim email notifikasi ke pengunjung

    // Send email notification
    const emailResult = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: tamuData.email,
      subject: "Pemberitahuan Kunjungan Anda",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #dc2626;">Kunjungan Anda Belum Dapat Disetujui</h2>
            <p>Halo ${tamuData.nama},</p>
            <p>Terima kasih atas kunjungan Anda ke SMA Muhammadiyah Kupang. Sayangnya, kunjungan Anda pada saat ini belum dapat kami setujui.</p>
            
            <div style="background-color: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
              <h3 style="color: #991b1b; margin-top: 0;">Alasan:</h3>
              <p>${reason}</p>
            </div>
            
            <p>Silakan hubungi kami untuk informasi lebih lanjut atau untuk menjadwalkan kunjungan di waktu lain.</p>
            <p><strong>Nomor HP:</strong> (hubungi sekolah untuk informasi kontak)</p>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              Terima kasih,<br>
              SMA Muhammadiyah Kupang
            </p>
          </div>
        </div>
      `,
    })

    if (emailResult.error) {
      console.error("Email send error:", emailResult.error)
    }

    return { success: true, message: "Kunjungan ditolak dan email pemberitahuan dikirim" }
  } catch (error) {
    console.error("Reject tamu error:", error)
    return { success: false, message: "Gagal menolak kunjungan" }
  }
}
