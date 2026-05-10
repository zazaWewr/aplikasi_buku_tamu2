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
      to: "mariaremama962@gmail.com",
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
  adminEmail: string
) {
  try {
    console.log("[v0] Starting rejectTamu for ID:", tamuId)
    const supabase = await createClient()

    // Delete the record from database (permanent deletion)
    const { error: deleteError } = await supabase
      .from("tamu")
      .delete()
      .eq("id", tamuId)

    if (deleteError) {
      console.error("[v0] Delete failed:", deleteError)
      throw new Error("Failed to delete tamu data: " + deleteError.message)
    }

    console.log("[v0] Tamu data deleted successfully")

    return {
      success: true,
      message: "Kunjungan ditolak dan data dihapus.",
    }
  } catch (error) {
    console.error("[v0] Error rejecting tamu:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
