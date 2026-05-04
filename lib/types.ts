export interface Tamu {
  id: string
  nama: string
  instansi: string | null
  no_hp: string
  tujuan: string
  keperluan: string
  email: string
  status: "pending" | "accepted" | "rejected"
  verified_at: string | null
  verified_by: string | null
  rejection_reason: string | null
  created_at: string
}

export interface TamuFormData {
  nama: string
  instansi: string
  no_hp: string
  tujuan: string
  keperluan: string
  email: string
}
