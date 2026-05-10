"use client"

import React, { useState, useTransition } from "react"
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
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { Check, X, Clock, AlertCircle } from "lucide-react"
import type { Tamu } from "@/lib/types"
import { approveTamu, rejectTamu } from "@/lib/actions/verification"

interface VerificationTabProps {
  userEmail: string
  onDataRefresh: () => void
}

export function VerificationTab({
  userEmail,
  onDataRefresh,
}: VerificationTabProps) {
  const [data, setData] = useState<Tamu[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  // Fetch today's pending guests on mount
  React.useEffect(() => {
    const fetchPendingGuests = async () => {
      if (typeof window === "undefined") return
      
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      console.log("[v0] Fetching guests from", today.toISOString(), "to", tomorrow.toISOString())

      const { data: tamu, error } = await supabase
        .from("tamu")
        .select("*")
        .gte("created_at", today.toISOString())
        .lt("created_at", tomorrow.toISOString())
        .order("created_at", { ascending: false })

      console.log("[v0] Fetch result:", { count: tamu?.length, error: error?.message })

      if (!error && tamu) {
        setData(tamu)
      } else {
        console.error("[v0] Error fetching guests:", error)
      }
      setIsLoading(false)
    }

    fetchPendingGuests()
  }, [])

  const acceptedCount = data.filter(
    (t) => t.status === "accepted"
  ).length
  const rejectedCount = data.filter(
    (t) => t.status === "rejected"
  ).length
  const pendingCount = data.filter(
    (t) => t.status === "pending"
  ).length

  const handleApprove = (tamuId: string) => {
    startTransition(async () => {
      const result = await approveTamu(tamuId, userEmail)
      if (result.success) {
        console.log("[v0] Approve successful, updating data")
        setData(data.map(t => t.id === tamuId ? { ...t, status: "accepted" } : t))
        onDataRefresh()
      } else {
        console.error("[v0] Approve failed:", result.error)
        alert("Gagal menyetujui kunjungan: " + result.error)
      }
    })
  }

  const handleReject = (tamuId: string) => {
    startTransition(async () => {
      const result = await rejectTamu(tamuId, userEmail)
      console.log("[v0] Reject result:", result)
      if (result.success) {
        console.log("[v0] Reject successful, removing from data")
        setData(data.filter(t => t.id !== tamuId))
        onDataRefresh()
      } else {
        console.error("[v0] Reject failed:", result.error)
        alert("Gagal menolak kunjungan: " + result.error)
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              Menunggu Verifikasi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {pendingCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Dari {data.length} hari ini
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              Diterima
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {acceptedCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Kunjungan disetujui
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <X className="h-4 w-4 text-red-500" />
              Ditolak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {rejectedCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Kunjungan ditolak
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Verification Table */}
      <Card>
        <CardHeader>
          <CardTitle>Verifikasi Kunjungan Hari Ini</CardTitle>
          <CardDescription>
            Kelola permintaan kunjungan yang perlu diverifikasi
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <div className="text-center py-10">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">
                Tidak ada permintaan kunjungan hari ini
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>No HP</TableHead>
                    <TableHead>Tujuan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((tamu) => (
                    <TableRow key={tamu.id}>
                      <TableCell className="font-medium">
                        {tamu.nama}
                      </TableCell>
                      <TableCell className="text-sm">
                        {tamu.email}
                      </TableCell>
                      <TableCell className="text-sm">
                        {tamu.no_hp}
                      </TableCell>
                      <TableCell className="text-sm">
                        {tamu.tujuan}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            tamu.status === "pending"
                              ? "secondary"
                              : tamu.status === "accepted"
                                ? "default"
                                : "destructive"
                          }
                        >
                          {tamu.status === "pending"
                            ? "Menunggu"
                            : tamu.status === "accepted"
                              ? "Diterima"
                              : "Ditolak"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {tamu.status === "pending" && (
                          <div className="flex gap-2 justify-end">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="gap-1"
                                  disabled={isPending}
                                >
                                  <Check className="h-4 w-4" />
                                  Terima
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Setujui Kunjungan?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Anda yakin ingin menyetujui kunjungan
                                    dari {tamu.nama}?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    Batal
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleApprove(tamu.id)
                                    }
                                    disabled={isPending}
                                  >
                                    {isPending
                                      ? "Memproses..."
                                      : "Setujui"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="gap-1 text-destructive hover:text-destructive"
                                  disabled={isPending}
                                >
                                  <X className="h-4 w-4" />
                                  Tolak
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Yakin ingin menolak kunjungan?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Kunjungan dari <strong>{tamu.nama}</strong> akan dihapus dari database.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    Batal
                                  </AlertDialogCancel>
                                  <Button
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={() => {
                                      console.log("[v0] Reject clicked for tamu:", tamu.id)
                                      handleReject(tamu.id)
                                    }}
                                    disabled={isPending}
                                  >
                                    {isPending
                                      ? "Menghapus..."
                                      : "Ya, Tolak"}
                                  </Button>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                        {tamu.status !== "pending" && (
                          <span className="text-xs text-muted-foreground">
                            {tamu.status === "accepted"
                              ? "✓ Diterima"
                              : "✗ Ditolak"}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
