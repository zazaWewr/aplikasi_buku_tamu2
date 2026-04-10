"use client"

import { useState, useTransition, useMemo } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  GraduationCap,
  Download,
  LogOut,
  MoreVertical,
  RefreshCw,
  Search,
  Trash2,
  Users,
  CalendarDays,
  FileSpreadsheet,
  FileText,
  TrendingUp,
  Clock,
  Filter,
} from "lucide-react"
import type { Tamu } from "@/lib/types"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"

interface AdminDashboardProps {
  initialData: Tamu[]
  userEmail: string
}

const MONTHS = [
  { value: "1", label: "Januari" },
  { value: "2", label: "Februari" },
  { value: "3", label: "Maret" },
  { value: "4", label: "April" },
  { value: "5", label: "Mei" },
  { value: "6", label: "Juni" },
  { value: "7", label: "Juli" },
  { value: "8", label: "Agustus" },
  { value: "9", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
]

const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 10 }, (_, i) => ({
  value: String(currentYear - i),
  label: String(currentYear - i),
}))

export function AdminDashboard({ initialData, userEmail }: AdminDashboardProps) {
  const [data, setData] = useState<Tamu[]>(initialData)
  const [searchTerm, setSearchTerm] = useState("")
  const [isPending, startTransition] = useTransition()
  const [exportMonth, setExportMonth] = useState<string>("")
  const [exportYear, setExportYear] = useState<string>(String(currentYear))
  const [exportStartDate, setExportStartDate] = useState<string>("")
  const [exportEndDate, setExportEndDate] = useState<string>("")
  const [exportMode, setExportMode] = useState<"period" | "range">("period")
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const router = useRouter()

  const filteredData = useMemo(() => {
    return data.filter(
      (tamu) =>
        tamu.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tamu.instansi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tamu.tujuan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tamu.keperluan.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [data, searchTerm])

  const getExportData = () => {
    return data.filter((tamu) => {
      const visitDate = new Date(tamu.created_at)
      
      if (exportMode === "range" && exportStartDate && exportEndDate) {
        const startDate = new Date(exportStartDate)
        startDate.setHours(0, 0, 0, 0)
        const endDate = new Date(exportEndDate)
        endDate.setHours(23, 59, 59, 999)
        return visitDate >= startDate && visitDate <= endDate
      }
      
      // Period mode (month/year)
      const matchYear = visitDate.getFullYear() === parseInt(exportYear)
      const matchMonth = exportMonth ? visitDate.getMonth() + 1 === parseInt(exportMonth) : true
      return matchYear && matchMonth
    })
  }

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh()
    })
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from("tamu").delete().eq("id", id)
    
    if (error) {
      console.error("Error deleting:", error)
      return
    }
    
    setData(data.filter((tamu) => tamu.id !== id))
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    })
  }

  const formatDateForExport = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getExportPeriodLabel = () => {
    if (exportMode === "range") {
      if (!exportStartDate || !exportEndDate) {
        return "Pilih tanggal mulai dan akhir"
      }
      const formatDateLabel = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric"
        })
      }
      return `${formatDateLabel(exportStartDate)} - ${formatDateLabel(exportEndDate)}`
    }
    
    const monthLabel = exportMonth 
      ? MONTHS.find(m => m.value === exportMonth)?.label 
      : "Semua Bulan"
    return `${monthLabel} ${exportYear}`
  }

  const exportToCSV = () => {
    setIsExporting(true)
    const exportData = getExportData()
    
    const headers = ["No", "Nama", "Instansi", "No HP", "Tujuan", "Keperluan", "Waktu Kunjungan"]
    const csvContent = [
      headers.join(","),
      ...exportData.map((tamu, index) =>
        [
          index + 1,
          `"${tamu.nama}"`,
          `"${tamu.instansi || "-"}"`,
          `"${tamu.no_hp}"`,
          `"${tamu.tujuan}"`,
          `"${tamu.keperluan.replace(/"/g, '""')}"`,
          `"${formatDateForExport(tamu.created_at)}"`,
        ].join(",")
      ),
    ].join("\n")

    const BOM = "\uFEFF"
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    const fileName = `buku-tamu-sma-muhammadiyah-kupang-${getExportPeriodLabel().replace(/ /g, "-").toLowerCase()}.csv`
    link.setAttribute("href", url)
    link.setAttribute("download", fileName)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    setTimeout(() => {
      setIsExporting(false)
      setIsExportDialogOpen(false)
    }, 500)
  }

  const exportToPDF = () => {
    setIsExporting(true)
    const exportData = getExportData()
    const periodLabel = getExportPeriodLabel()
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Buku Tamu - SMA Muhammadiyah Kupang - ${periodLabel}</title>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #1a1a1a; }
          .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #166534; }
          .logo { font-size: 24px; font-weight: bold; color: #166534; margin-bottom: 5px; }
          .subtitle { font-size: 14px; color: #666; margin-top: 5px; }
          .period { font-size: 16px; font-weight: 600; color: #166534; margin-top: 10px; padding: 8px 16px; background: #f0fdf4; border-radius: 8px; display: inline-block; }
          .stats { display: flex; justify-content: center; gap: 30px; margin-bottom: 25px; }
          .stat-item { text-align: center; padding: 15px 25px; background: #f8fafc; border-radius: 10px; }
          .stat-value { font-size: 28px; font-weight: bold; color: #166534; }
          .stat-label { font-size: 12px; color: #666; margin-top: 5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
          th { background: #166534; color: white; padding: 12px 8px; text-align: left; font-weight: 600; }
          td { padding: 10px 8px; border-bottom: 1px solid #e5e7eb; }
          tr:nth-child(even) { background: #f9fafb; }
          .no-col { width: 40px; text-align: center; }
          .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #666; padding-top: 20px; border-top: 1px solid #e5e7eb; }
          .print-date { margin-bottom: 5px; }
          .print-btn { display: block; margin: 20px auto; padding: 12px 30px; background: #166534; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; }
          .print-btn:hover { background: #14532d; }
          @media print {
            body { padding: 10px; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <button class="print-btn no-print" onclick="window.print()">Cetak / Simpan PDF</button>
        
        <div class="header">
          <div class="logo">SMA MUHAMMADIYAH KUPANG</div>
          <div class="subtitle">Buku Tamu Digital</div>
          <div class="period">Periode: ${periodLabel}</div>
        </div>
        
        <div class="stats">
          <div class="stat-item">
            <div class="stat-value">${exportData.length}</div>
            <div class="stat-label">Total Pengunjung</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th class="no-col">No</th>
              <th>Nama</th>
              <th>Instansi/Asal</th>
              <th>No HP</th>
              <th>Tujuan</th>
              <th>Keperluan</th>
              <th>Waktu Kunjungan</th>
            </tr>
          </thead>
          <tbody>
            ${exportData.length === 0 
              ? '<tr><td colspan="7" style="text-align: center; padding: 40px; color: #666;">Tidak ada data pengunjung pada periode ini</td></tr>'
              : exportData.map((tamu, index) => `
                <tr>
                  <td class="no-col">${index + 1}</td>
                  <td><strong>${tamu.nama}</strong></td>
                  <td>${tamu.instansi || "-"}</td>
                  <td>${tamu.no_hp}</td>
                  <td>${tamu.tujuan}</td>
                  <td>${tamu.keperluan}</td>
                  <td>${formatDateForExport(tamu.created_at)}</td>
                </tr>
              `).join("")
            }
          </tbody>
        </table>

        <div class="footer">
          <div class="print-date">Dicetak pada: ${formatDateForExport(new Date().toISOString())}</div>
          <div>SMA Muhammadiyah Kupang - Buku Tamu Digital</div>
        </div>
      </body>
      </html>
    `

    // Try opening new window first
    const printWindow = window.open("", "_blank")
    
    if (printWindow) {
      printWindow.document.write(htmlContent)
      printWindow.document.close()
    } else {
      // Fallback: create iframe and print
      const iframe = document.createElement("iframe")
      iframe.style.position = "fixed"
      iframe.style.right = "0"
      iframe.style.bottom = "0"
      iframe.style.width = "0"
      iframe.style.height = "0"
      iframe.style.border = "none"
      document.body.appendChild(iframe)
      
      const iframeDoc = iframe.contentWindow?.document
      if (iframeDoc) {
        iframeDoc.open()
        iframeDoc.write(htmlContent)
        iframeDoc.close()
        
        setTimeout(() => {
          iframe.contentWindow?.print()
          setTimeout(() => {
            document.body.removeChild(iframe)
          }, 1000)
        }, 500)
      } else {
        alert("Tidak dapat membuat preview. Mohon izinkan popup di browser Anda.")
      }
    }
    
    setTimeout(() => {
      setIsExporting(false)
      setIsExportDialogOpen(false)
    }, 500)
  }

  // Statistics - using created_at
  const todayCount = useMemo(() => {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0] // YYYY-MM-DD format
    
    return data.filter((tamu) => {
      if (!tamu.created_at) return false
      const visitDateStr = new Date(tamu.created_at).toISOString().split('T')[0]
      return visitDateStr === todayStr
    }).length
  }, [data])

  const thisMonthCount = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    return data.filter((tamu) => {
      if (!tamu.created_at) return false
      const date = new Date(tamu.created_at)
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear
    }).length
  }, [data])

  const thisYearCount = useMemo(() => {
    const now = new Date()
    const currentYear = now.getFullYear()
    
    return data.filter((tamu) => {
      if (!tamu.created_at) return false
      const date = new Date(tamu.created_at)
      return date.getFullYear() === currentYear
    }).length
  }, [data])

  return (
    <div className="min-h-screen bg-background">
      {/* Decorative Background */}
      <div className="absolute inset-x-0 top-0 h-64 bg-primary/5 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      </div>

      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-2 sm:gap-4 animate-fade-in group min-w-0">
            <div className="relative flex-shrink-0">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25 transition-transform group-hover:scale-105">
                <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
              </div>
            </div>
            <div className="min-w-0 hidden xs:block sm:block">
              <h1 className="font-bold text-sm sm:text-lg text-foreground truncate">Admin Dashboard</h1>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">SMA Muhammadiyah Kupang</p>
            </div>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <span className="text-xs sm:text-sm text-muted-foreground hidden lg:inline px-2 sm:px-3 py-1 rounded-full bg-muted truncate max-w-[200px]">
              {userEmail}
            </span>
            <ThemeToggle />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors h-9 px-2 sm:px-3"
            >
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Keluar</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-8">
          <Card className="animate-fade-in border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="p-3 sm:pb-2 sm:p-6">
              <div className="flex items-center justify-between gap-2">
                <CardDescription className="text-muted-foreground text-xs sm:text-sm">Total Tamu</CardDescription>
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-foreground">{data.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="animate-fade-in animate-delay-100 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="p-3 sm:pb-2 sm:p-6">
              <div className="flex items-center justify-between gap-2">
                <CardDescription className="text-muted-foreground text-xs sm:text-sm">Hari Ini</CardDescription>
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                </div>
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-foreground">{todayCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="animate-fade-in animate-delay-200 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="p-3 sm:pb-2 sm:p-6">
              <div className="flex items-center justify-between gap-2">
                <CardDescription className="text-muted-foreground text-xs sm:text-sm">Bulan Ini</CardDescription>
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-chart-3/20 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-chart-3" />
                </div>
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-foreground">{thisMonthCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="animate-fade-in animate-delay-300 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="p-3 sm:pb-2 sm:p-6">
              <div className="flex items-center justify-between gap-2">
                <CardDescription className="text-muted-foreground text-xs sm:text-sm">Tahun Ini</CardDescription>
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-chart-4/20 flex items-center justify-center flex-shrink-0">
                  <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5 text-chart-4" />
                </div>
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-foreground">{thisYearCount}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Data Table */}
        <Card className="border-0 shadow-xl animate-scale-in overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-primary via-primary/80 to-accent" />
          <CardHeader className="p-3 sm:p-6">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-foreground text-base sm:text-lg">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Daftar Pengunjung
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  {filteredData.length} pengunjung ditemukan
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isPending}
                  className="transition-all duration-200 h-8 sm:h-9 text-xs sm:text-sm"
                >
                  <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 ${isPending ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
                
                {/* Export Dialog */}
                <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="default" size="sm" className="shadow-md shadow-primary/25 h-8 sm:h-9 text-xs sm:text-sm">
                      <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Export
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5 text-primary" />
                        Export Data Pengunjung
                      </DialogTitle>
                      <DialogDescription>
                        Pilih periode data yang ingin di-export
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      {/* Mode Selection */}
                      <div className="grid gap-2">
                        <Label>Mode Pilih Tanggal</Label>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant={exportMode === "period" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setExportMode("period")}
                            className="flex-1"
                          >
                            <CalendarDays className="h-4 w-4 mr-2" />
                            Bulan/Tahun
                          </Button>
                          <Button
                            type="button"
                            variant={exportMode === "range" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setExportMode("range")}
                            className="flex-1"
                          >
                            <CalendarDays className="h-4 w-4 mr-2" />
                            Rentang Tanggal
                          </Button>
                        </div>
                      </div>

                      {exportMode === "period" ? (
                        <>
                          <div className="grid gap-2">
                            <Label htmlFor="export-year">Tahun</Label>
                            <Select value={exportYear} onValueChange={setExportYear}>
                              <SelectTrigger id="export-year">
                                <SelectValue placeholder="Pilih tahun" />
                              </SelectTrigger>
                              <SelectContent>
                                {YEARS.map((year) => (
                                  <SelectItem key={year.value} value={year.value}>
                                    {year.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="export-month">Bulan (Opsional)</Label>
                            <Select value={exportMonth} onValueChange={setExportMonth}>
                              <SelectTrigger id="export-month">
                                <SelectValue placeholder="Semua bulan" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">Semua Bulan</SelectItem>
                                {MONTHS.map((month) => (
                                  <SelectItem key={month.value} value={month.value}>
                                    {month.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="grid gap-2">
                            <Label htmlFor="export-start-date">Tanggal Mulai</Label>
                            <Input
                              id="export-start-date"
                              type="date"
                              value={exportStartDate}
                              onChange={(e) => setExportStartDate(e.target.value)}
                              className="w-full"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="export-end-date">Tanggal Akhir</Label>
                            <Input
                              id="export-end-date"
                              type="date"
                              value={exportEndDate}
                              onChange={(e) => setExportEndDate(e.target.value)}
                              min={exportStartDate}
                              className="w-full"
                            />
                          </div>
                        </>
                      )}

                      <div className="p-3 rounded-lg bg-muted/50 border">
                        <p className="text-sm text-muted-foreground">
                          Data yang akan di-export: <strong className="text-foreground">{getExportData().length} pengunjung</strong>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Periode: {getExportPeriodLabel()}
                        </p>
                      </div>
                    </div>
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        onClick={exportToCSV}
                        disabled={isExporting || (exportMode === "range" && (!exportStartDate || !exportEndDate))}
                        className="w-full sm:w-auto"
                      >
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Export CSV
                      </Button>
                      <Button
                        onClick={exportToPDF}
                        disabled={isExporting || (exportMode === "range" && (!exportStartDate || !exportEndDate))}
                        className="w-full sm:w-auto shadow-md shadow-primary/25"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Export PDF
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
            <div className="mb-3 sm:mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari nama, instansi, tujuan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 sm:h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 text-sm"
                />
              </div>
            </div>

            {/* Mobile Cards View */}
            <div className="block sm:hidden space-y-3">
              {filteredData.length === 0 ? (
                <div className="text-center py-8">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                      <Users className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {searchTerm ? "Tidak ada data yang cocok" : "Belum ada data pengunjung"}
                    </p>
                  </div>
                </div>
              ) : (
                filteredData.map((tamu) => (
                  <Card key={tamu.id} className="p-3 border shadow-sm">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-foreground text-sm truncate">{tamu.nama}</p>
                        <p className="text-xs text-muted-foreground truncate">{tamu.instansi || "-"}</p>
                      </div>
                      <AlertDialog>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted flex-shrink-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Hapus Data
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus Data Pengunjung?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Data pengunjung atas nama <strong>{tamu.nama}</strong> akan dihapus secara permanen.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(tamu.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground w-14 flex-shrink-0">No HP:</span>
                        <span className="text-foreground">{tamu.no_hp}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground w-14 flex-shrink-0">Tujuan:</span>
                        <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 text-[10px] px-1.5 py-0">
                          {tamu.tujuan}
                        </Badge>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-muted-foreground w-14 flex-shrink-0">Keperluan:</span>
                        <span className="text-foreground line-clamp-2">{tamu.keperluan}</span>
                      </div>
                      <div className="flex items-center gap-2 pt-1 border-t mt-2">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">{formatDate(tamu.created_at)}</span>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>

            {/* Desktop Table View */}
            <div className="rounded-xl border overflow-hidden hidden sm:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="font-semibold text-foreground text-xs sm:text-sm">Nama</TableHead>
                    <TableHead className="font-semibold text-foreground text-xs sm:text-sm">Instansi</TableHead>
                    <TableHead className="font-semibold text-foreground text-xs sm:text-sm">No HP</TableHead>
                    <TableHead className="font-semibold text-foreground text-xs sm:text-sm">Tujuan</TableHead>
                    <TableHead className="font-semibold text-foreground text-xs sm:text-sm">Keperluan</TableHead>
                    <TableHead className="font-semibold text-foreground text-xs sm:text-sm">Waktu</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                            <Users className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <p className="text-muted-foreground">
                            {searchTerm ? "Tidak ada data yang cocok" : "Belum ada data pengunjung"}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((tamu, index) => (
                      <TableRow 
                        key={tamu.id} 
                        className="hover:bg-muted/30 transition-colors duration-200"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <TableCell className="font-medium text-foreground text-xs sm:text-sm">{tamu.nama}</TableCell>
                        <TableCell className="text-muted-foreground text-xs sm:text-sm">{tamu.instansi || "-"}</TableCell>
                        <TableCell className="text-muted-foreground text-xs sm:text-sm">{tamu.no_hp}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 text-xs">
                            {tamu.tujuan}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-muted-foreground text-xs sm:text-sm">
                          {tamu.keperluan}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                          {formatDate(tamu.created_at)}
                        </TableCell>
                        <TableCell>
                          <AlertDialog>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="hover:bg-muted h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Hapus Data
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Data Pengunjung?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Data pengunjung atas nama <strong>{tamu.nama}</strong> akan dihapus secara permanen.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(tamu.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Hapus
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
