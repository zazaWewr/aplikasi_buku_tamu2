export interface Tamu {
  id: string
  nama: string
  instansi: string | null
  no_hp: string
  email: string
  tujuan: string
  keperluan: string
  status_verifikasi: 'pending' | 'approved' | 'rejected'
  rejection_reason: string | null
  created_at: string
}

export interface TamuFormData {
  nama: string
  instansi: string
  no_hp: string
  email: string
  tujuan: string
  keperluan: string
}

export type VerificationStatus = 'pending' | 'approved' | 'rejected'
