import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminDashboard } from "@/components/admin-dashboard"
import type { Tamu } from "@/lib/types"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/auth/login")
  }

  const { data: tamuList, error } = await supabase
    .from("tamu")
    .select("*")
    .order("waktu_kunjungan", { ascending: false })

  if (error) {
    console.error("Error fetching tamu:", error)
  }

  return <AdminDashboard initialData={tamuList as Tamu[] || []} userEmail={user.email || ""} />
}
