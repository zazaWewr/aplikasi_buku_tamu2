"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Loader2, AlertCircle, Shield, ArrowLeft, Info } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        if (authError.message.includes("Invalid login")) {
          setError("Email atau password salah")
        } else {
          setError(authError.message)
        }
        return
      }

      router.push("/admin")
      router.refresh()
    } catch (err) {
      console.error("Login error:", err)
      setError("Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }

  const fillDemoCredentials = () => {
    setEmail("admin@smamuhkupang.sch.id")
    setPassword("admin123")
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-primary/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Top Bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors animate-fade-in"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Kembali</span>
        </Link>
        <div className="animate-fade-in">
          <ThemeToggle />
        </div>
      </div>

      <div className="w-full max-w-md animate-scale-in">
        <Card className="shadow-2xl border-0 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-primary via-primary/80 to-accent" />
          <CardHeader className="text-center pt-8 pb-4">
            <div className="flex justify-center mb-4">
              <Link href="/" className="group">
                <div className="relative">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/25 transition-transform group-hover:scale-105">
                    <GraduationCap className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-accent border-2 border-background flex items-center justify-center">
                    <Shield className="h-3 w-3 text-accent-foreground" />
                  </div>
                </div>
              </Link>
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Portal Admin</CardTitle>
            <CardDescription className="text-base">
              SMA Muhammadiyah Kupang
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            {error && (
              <div className="mb-6 flex items-center gap-3 rounded-xl bg-destructive/10 p-4 text-destructive border border-destructive/20 animate-scale-in">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/20 flex-shrink-0">
                  <AlertCircle className="h-4 w-4" />
                </div>
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2 animate-fade-in animate-delay-100">
                <Label htmlFor="email" className="text-foreground font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@sekolah.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2 animate-fade-in animate-delay-200">
                <Label htmlFor="password" className="text-foreground font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 animate-fade-in animate-delay-300" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Masuk ke Dashboard"
                )}
              </Button>
            </form>

           {/* Demo Credentials Info */}
<div className="mt-6 pt-6 border-t animate-fade-in animate-delay-400">
  <div className="rounded-xl bg-muted/50 p-4 border border-border">
    <div className="flex items-start gap-3">
      
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
        <Info className="h-4 w-4 text-primary" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground mb-2">
          KHUSUS ADMIN !!!
        </p>
      </div>

    </div>
  </div>
</div>

</CardContent>
</Card>

<p className="text-center text-xs text-muted-foreground mt-6 animate-fade-in animate-delay-500">
  SMA Muhammadiyah Kupang - Buku Tamu Digital
</p>
      </div>
    </div>
  )
}
