import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminDashboard } from "@/components/admin-dashboard"
import type { Tamu } from "@/lib/types"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const supabase = await createClient()
  
  // Handle case when Supabase is not configured
  if (!supabase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8 max-w-md">
          <h1 className="text-2xl font-bold text-foreground mb-4">Supabase Belum Dikonfigurasi</h1>
          <p className="text-muted-foreground mb-4">
            Aplikasi memerlukan koneksi ke Supabase. Silakan tambahkan environment variables berikut:
          </p>
          <ul className="text-left text-sm bg-muted p-4 rounded-lg space-y-2">
            <li><code className="text-primary">NEXT_PUBLIC_SUPABASE_URL</code></li>
            <li><code className="text-primary">NEXT_PUBLIC_SUPABASE_ANON_KEY</code></li>
          </ul>
        </div>
      </div>
    )
  }
  
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
