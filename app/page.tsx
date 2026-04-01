"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Loader2, GraduationCap, Settings, Users, Clock, BookOpen } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"

const TUJUAN_OPTIONS = [
  "Kepala Sekolah",
  "Wakil Kepala Sekolah",
  "Bagian Kurikulum",
  "Bagian Kesiswaan",
  "Bagian Humas",
  "Bagian Sarana Prasarana",
  "Tata Usaha",
  "Guru/Wali Kelas",
  "BK (Bimbingan Konseling)",
  "Lainnya",
]

export default function BukuTamuPage() {
  const [formData, setFormData] = useState({
    nama: "",
    instansi: "",
    no_hp: "",
    tujuan: "",
    keperluan: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      const supabase = createClient()
      const { error: insertError } = await supabase.from("tamu").insert([
        {
          nama: formData.nama,
          instansi: formData.instansi || null,
          no_hp: formData.no_hp,
          tujuan: formData.tujuan,
          keperluan: formData.keperluan,
        },
      ])

      if (insertError) throw insertError

      setIsSuccess(true)
      setFormData({
        nama: "",
        instansi: "",
        no_hp: "",
        tujuan: "",
        keperluan: "",
      })

      setTimeout(() => setIsSuccess(false), 5000)
    } catch (err) {
      console.error("Error submitting form:", err)
      setError("Gagal menyimpan data. Silakan coba lagi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Decorative Header Background */}
      <div className="absolute inset-x-0 top-0 h-72 bg-primary/5 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4 animate-fade-in min-w-0">
            <div className="relative flex-shrink-0">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25">
                <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-accent border-2 border-background" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-sm sm:text-lg text-foreground truncate">SMA Muhammadiyah Kupang</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Buku Tamu Digital</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <ThemeToggle />
            <Link href="/admin" className="animate-fade-in animate-delay-200">
              <Button variant="outline" size="sm" className="gap-2 hover:bg-primary hover:text-primary-foreground transition-colors duration-300 h-9 px-2 sm:px-3">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Admin</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-4 sm:mb-8 animate-fade-in">
          <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2 sm:mb-3 text-balance px-2">
            Selamat Datang di SMA Muhammadiyah Kupang
          </h2>
          <p className="text-muted-foreground text-sm sm:text-lg max-w-2xl mx-auto text-pretty px-2">
            Silakan isi buku tamu digital kami untuk mencatat kunjungan Anda
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
          <div className="animate-fade-in animate-delay-100">
            <Card className="text-center p-2 sm:p-4 hover:shadow-md transition-shadow duration-300 border-primary/10">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 mx-auto text-primary mb-1 sm:mb-2" />
              <p className="text-[10px] sm:text-xs text-muted-foreground">Pengunjung</p>
              <p className="font-semibold text-foreground text-xs sm:text-base">Setiap Hari</p>
            </Card>
          </div>
          <div className="animate-fade-in animate-delay-200">
            <Card className="text-center p-2 sm:p-4 hover:shadow-md transition-shadow duration-300 border-primary/10">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 mx-auto text-primary mb-1 sm:mb-2" />
              <p className="text-[10px] sm:text-xs text-muted-foreground">Jam Layanan</p>
              <p className="font-semibold text-foreground text-xs sm:text-base">07:00 - 15:00</p>
            </Card>
          </div>
          <div className="animate-fade-in animate-delay-300">
            <Card className="text-center p-2 sm:p-4 hover:shadow-md transition-shadow duration-300 border-primary/10">
              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 mx-auto text-primary mb-1 sm:mb-2" />
              <p className="text-[10px] sm:text-xs text-muted-foreground">Pencatatan</p>
              <p className="font-semibold text-foreground text-xs sm:text-base">Otomatis</p>
            </Card>
          </div>
        </div>

        {/* Form Card */}
        <Card className="shadow-xl border-0 bg-card animate-scale-in overflow-hidden">
          <div className="h-1.5 sm:h-2 bg-gradient-to-r from-primary via-primary/80 to-accent" />
          <CardHeader className="text-center pb-2 pt-4 sm:pt-6 px-4 sm:px-6">
            <CardTitle className="text-xl sm:text-2xl text-foreground">Form Buku Tamu</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Lengkapi data kunjungan Anda di bawah ini
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-6 sm:pb-8 px-4 sm:px-6">
            {isSuccess && (
              <div className="mb-6 flex items-center gap-3 rounded-xl bg-primary/10 p-4 text-primary animate-scale-in border border-primary/20">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">Data berhasil disimpan!</p>
                  <p className="text-sm opacity-80">
                    Terima kasih telah mengisi buku tamu.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 rounded-xl bg-destructive/10 p-4 text-destructive border border-destructive/20 animate-scale-in">
                <p className="font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                <div className="space-y-1.5 sm:space-y-2 animate-fade-in animate-delay-100">
                  <Label htmlFor="nama" className="text-foreground font-medium text-sm">
                    Nama Lengkap <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="nama"
                    placeholder="Masukkan nama lengkap"
                    value={formData.nama}
                    onChange={(e) =>
                      setFormData({ ...formData, nama: e.target.value })
                    }
                    required
                    className="h-10 sm:h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 text-sm sm:text-base"
                  />
                </div>

                <div className="space-y-1.5 sm:space-y-2 animate-fade-in animate-delay-200">
                  <Label htmlFor="instansi" className="text-foreground font-medium text-sm">Instansi / Asal</Label>
                  <Input
                    id="instansi"
                    placeholder="Instansi atau asal (opsional)"
                    value={formData.instansi}
                    onChange={(e) =>
                      setFormData({ ...formData, instansi: e.target.value })
                    }
                    className="h-10 sm:h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 text-sm sm:text-base"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                <div className="space-y-1.5 sm:space-y-2 animate-fade-in animate-delay-300">
                  <Label htmlFor="no_hp" className="text-foreground font-medium text-sm">
                    Nomor HP / WhatsApp <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="no_hp"
                    type="tel"
                    placeholder="Contoh: 08123456789"
                    value={formData.no_hp}
                    onChange={(e) =>
                      setFormData({ ...formData, no_hp: e.target.value })
                    }
                    required
                    className="h-10 sm:h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 text-sm sm:text-base"
                  />
                </div>

                <div className="space-y-1.5 sm:space-y-2 animate-fade-in animate-delay-400">
                  <Label htmlFor="tujuan" className="text-foreground font-medium text-sm">
                    Tujuan Bertemu <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.tujuan}
                    onValueChange={(value) =>
                      setFormData({ ...formData, tujuan: value })
                    }
                    required
                  >
                    <SelectTrigger id="tujuan" className="h-10 sm:h-11 text-sm sm:text-base">
                      <SelectValue placeholder="Pilih tujuan bertemu" />
                    </SelectTrigger>
                    <SelectContent>
                      {TUJUAN_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5 sm:space-y-2 animate-fade-in animate-delay-500">
                <Label htmlFor="keperluan" className="text-foreground font-medium text-sm">
                  Keperluan <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="keperluan"
                  placeholder="Jelaskan keperluan kunjungan Anda"
                  rows={3}
                  value={formData.keperluan}
                  onChange={(e) =>
                    setFormData({ ...formData, keperluan: e.target.value })
                  }
                  required
                  className="resize-none transition-all duration-200 focus:ring-2 focus:ring-primary/20 text-sm sm:text-base min-h-[80px] sm:min-h-[100px]"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                disabled={isSubmitting || !formData.tujuan}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    Menyimpan Data...
                  </>
                ) : (
                  "Simpan Data Kunjungan"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="mt-6 sm:mt-8 text-center animate-fade-in px-2">
          <p className="text-xs sm:text-sm text-muted-foreground mb-2">
            Data yang Anda masukkan akan digunakan untuk keperluan administrasi sekolah.
          </p>
          <p className="text-[10px] sm:text-xs text-muted-foreground/70">
            SMA Muhammadiyah Kupang - Buku Tamu Digital
          </p>
        </div>
      </main>
    </div>
  )
}
