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
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 animate-fade-in">
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-accent border-2 border-background" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-foreground">SMA Muhammadiyah Kupang</h1>
              <p className="text-sm text-muted-foreground">Buku Tamu Digital</p>
            </div>
          </div>
          <Link href="/admin" className="animate-fade-in animate-delay-200">
            <Button variant="outline" size="sm" className="gap-2 hover:bg-primary hover:text-primary-foreground transition-colors duration-300">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Admin</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-8 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3 text-balance">
            Selamat Datang di SMA Muhammadiyah Kupang
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
            Silakan isi buku tamu digital kami untuk mencatat kunjungan Anda
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="animate-fade-in animate-delay-100">
            <Card className="text-center p-4 hover:shadow-md transition-shadow duration-300 border-primary/10">
              <Users className="h-6 w-6 mx-auto text-primary mb-2" />
              <p className="text-xs text-muted-foreground">Pengunjung</p>
              <p className="font-semibold text-foreground">Setiap Hari</p>
            </Card>
          </div>
          <div className="animate-fade-in animate-delay-200">
            <Card className="text-center p-4 hover:shadow-md transition-shadow duration-300 border-primary/10">
              <Clock className="h-6 w-6 mx-auto text-primary mb-2" />
              <p className="text-xs text-muted-foreground">Jam Layanan</p>
              <p className="font-semibold text-foreground">07:00 - 15:00</p>
            </Card>
          </div>
          <div className="animate-fade-in animate-delay-300">
            <Card className="text-center p-4 hover:shadow-md transition-shadow duration-300 border-primary/10">
              <BookOpen className="h-6 w-6 mx-auto text-primary mb-2" />
              <p className="text-xs text-muted-foreground">Pencatatan</p>
              <p className="font-semibold text-foreground">Otomatis</p>
            </Card>
          </div>
        </div>

        {/* Form Card */}
        <Card className="shadow-xl border-0 bg-card animate-scale-in overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-primary via-primary/80 to-accent" />
          <CardHeader className="text-center pb-2 pt-6">
            <CardTitle className="text-2xl text-foreground">Form Buku Tamu</CardTitle>
            <CardDescription className="text-base">
              Lengkapi data kunjungan Anda di bawah ini
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
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

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-2 animate-fade-in animate-delay-100">
                  <Label htmlFor="nama" className="text-foreground font-medium">
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
                    className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-2 animate-fade-in animate-delay-200">
                  <Label htmlFor="instansi" className="text-foreground font-medium">Instansi / Asal</Label>
                  <Input
                    id="instansi"
                    placeholder="Instansi atau asal (opsional)"
                    value={formData.instansi}
                    onChange={(e) =>
                      setFormData({ ...formData, instansi: e.target.value })
                    }
                    className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-2 animate-fade-in animate-delay-300">
                  <Label htmlFor="no_hp" className="text-foreground font-medium">
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
                    className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-2 animate-fade-in animate-delay-400">
                  <Label htmlFor="tujuan" className="text-foreground font-medium">
                    Tujuan Bertemu <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.tujuan}
                    onValueChange={(value) =>
                      setFormData({ ...formData, tujuan: value })
                    }
                    required
                  >
                    <SelectTrigger id="tujuan" className="h-11">
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

              <div className="space-y-2 animate-fade-in animate-delay-500">
                <Label htmlFor="keperluan" className="text-foreground font-medium">
                  Keperluan <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="keperluan"
                  placeholder="Jelaskan keperluan kunjungan Anda"
                  rows={4}
                  value={formData.keperluan}
                  onChange={(e) =>
                    setFormData({ ...formData, keperluan: e.target.value })
                  }
                  required
                  className="resize-none transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                disabled={isSubmitting || !formData.tujuan}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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
        <div className="mt-8 text-center animate-fade-in">
          <p className="text-sm text-muted-foreground mb-2">
            Data yang Anda masukkan akan digunakan untuk keperluan administrasi sekolah.
          </p>
          <p className="text-xs text-muted-foreground/70">
            SMA Muhammadiyah Kupang - Buku Tamu Digital
          </p>
        </div>
      </main>
    </div>
  )
}
