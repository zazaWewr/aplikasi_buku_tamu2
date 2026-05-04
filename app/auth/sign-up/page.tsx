"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Loader2, AlertCircle, CheckCircle2, UserPlus, ArrowLeft, Mail } from "lucide-react"
import Link from "next/link"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (password !== confirmPassword) {
      setError("Password tidak cocok")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter")
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/admin`,
        },
      })

      if (authError) {
        setError(authError.message)
        return
      }

      setSuccess(true)
    } catch (err) {
      console.error("Sign up error:", err)
      setError("Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-primary/5" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        </div>

        <Card className="w-full max-w-md shadow-2xl border-0 overflow-hidden animate-scale-in">
          <div className="h-2 bg-gradient-to-r from-primary via-primary/80 to-accent" />
          <CardHeader className="text-center pt-8">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 animate-pulse-soft">
                <Mail className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Cek Email Anda</CardTitle>
            <CardDescription className="text-base mt-2">
              Kami telah mengirim link konfirmasi ke <strong className="text-foreground">{email}</strong>. Silakan cek email Anda untuk mengaktifkan akun.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pb-8">
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 mb-6">
              <div className="flex items-center gap-3 justify-center text-primary">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Pendaftaran berhasil!</span>
              </div>
            </div>
            <Link href="/auth/login">
              <Button className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/25">
                Ke Halaman Login
              </Button>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Tidak menerima email?{" "}
              <button 
                onClick={() => setSuccess(false)} 
                className="text-primary hover:underline"
              >
                Kirim ulang
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-primary/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Back Button */}
      <Link 
        href="/auth/login" 
        className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors animate-fade-in"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm">Kembali ke Login</span>
      </Link>

      <div className="w-full max-w-md animate-scale-in">
        <Card className="shadow-2xl border-0 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-accent via-primary/80 to-primary" />
          <CardHeader className="text-center pt-8 pb-4">
            <div className="flex justify-center mb-4">
              <Link href="/" className="group">
                <div className="relative">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/25 transition-transform group-hover:scale-105">
                    <GraduationCap className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-accent border-2 border-background flex items-center justify-center">
                    <UserPlus className="h-3 w-3 text-accent-foreground" />
                  </div>
                </div>
              </Link>
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Daftar Admin</CardTitle>
            <CardDescription className="text-base">
              Buat akun untuk mengakses dashboard
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
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2 animate-fade-in animate-delay-300">
                <Label htmlFor="confirmPassword" className="text-foreground font-medium">Konfirmasi Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Ulangi password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 animate-fade-in animate-delay-400" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Daftar Sekarang"
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t text-center animate-fade-in animate-delay-500">
              <p className="text-sm text-muted-foreground">
                Sudah punya akun?{" "}
                <Link href="/auth/login" className="text-primary font-medium hover:underline">
                  Login di sini
                </Link>
              </p>
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
