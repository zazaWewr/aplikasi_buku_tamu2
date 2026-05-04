"use client"

import { useState, useTransition } from "react"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
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
  data: Tamu[]
  userEmail: string
  onStatusChange: () => void
}

export function VerificationTab({
  data,
  userEmail,
  onStatusChange,
}: VerificationTabProps) {
  const [isPending, startTransition] = useTransition()
  const [rejectReason, setRejectReason] = useState("")
  const [selectedTamuId, setSelectedTamuId] = useState<string | null>(null)

  // Get today's pending guests
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const pendingToday = data.filter((tamu) => {
    const created = new Date(tamu.created_at)
    return (
      tamu.status === "pending" &&
      created >= today &&
      created < tomorrow
    )
  })

  const acceptedCount = pendingToday.filter(
    (t) => t.status === "accepted"
  ).length
  const rejectedCount = pendingToday.filter(
    (t) => t.status === "rejected"
  ).length
  const pendingCount = pendingToday.filter(
    (t) => t.status === "pending"
  ).length

  const handleApprove = (tamuId: string) => {
    startTransition(async () => {
      const result = await approveTamu(tamuId, userEmail)
      if (result.success) {
        setSelectedTamuId(null)
        onStatusChange()
      }
    })
  }

  const handleReject = (tamuId: string) => {
    if (!rejectReason.trim()) {
      alert("Silakan masukkan alasan penolakan")
      return
    }
    startTransition(async () => {
      const result = await rejectTamu(tamuId, userEmail, rejectReason)
      if (result.success) {
        setRejectReason("")
        setSelectedTamuId(null)
        onStatusChange()
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
              Dari {pendingToday.length} hari ini
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
          {pendingToday.length === 0 ? (
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
                  {pendingToday.map((tamu) => (
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
                                    dari {tamu.nama}? Email notifikasi
                                    akan dikirim.
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

                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="gap-1 text-destructive hover:text-destructive"
                                  disabled={isPending}
                                >
                                  <X className="h-4 w-4" />
                                  Tolak
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>
                                    Tolak Kunjungan
                                  </DialogTitle>
                                  <DialogDescription>
                                    Masukkan alasan penolakan
                                    kunjungan dari {tamu.nama}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="reject-reason">
                                      Alasan Penolakan
                                    </Label>
                                    <Textarea
                                      id="reject-reason"
                                      placeholder="Jelaskan alasan penolakan kunjungan..."
                                      value={rejectReason}
                                      onChange={(e) =>
                                        setRejectReason(
                                          e.target.value
                                        )
                                      }
                                      rows={4}
                                    />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button
                                    variant="outline"
                                    onClick={() =>
                                      setRejectReason("")
                                    }
                                  >
                                    Batal
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() =>
                                      handleReject(tamu.id)
                                    }
                                    disabled={
                                      isPending ||
                                      !rejectReason.trim()
                                    }
                                  >
                                    {isPending
                                      ? "Memproses..."
                                      : "Tolak"}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
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
