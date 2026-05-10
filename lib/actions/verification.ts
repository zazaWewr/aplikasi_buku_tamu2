"use server"

import { createClient } from "@/lib/supabase/server"

export async function approveTamu(
  tamuId: string,
  adminEmail: string
) {
  try {
    console.log("[v0] Starting approveTamu for ID:", tamuId)
    const supabase = await createClient()

    // Get tamu data
    const { data: tamuData, error: fetchError } = await supabase
      .from("tamu")
      .select("*")
      .eq("id", tamuId)
      .single()

    if (fetchError || !tamuData) {
      console.error("[v0] Tamu data not found:", fetchError)
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

    if (updateError) {
      console.error("[v0] Update error:", updateError)
      throw updateError
    }

    console.log("[v0] Tamu status updated successfully")

    // Email notification disabled for now
    // Will be re-enabled once Resend API is properly configured
    console.log("[v0] Email notification skipped (disabled)")

    return { success: true, message: "Kunjungan disetujui" }
  } catch (error) {
    console.error("[v0] Approve tamu error:", error)
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Gagal menyetujui kunjungan" 
    }
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
