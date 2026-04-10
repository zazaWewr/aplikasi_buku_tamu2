export interface Tamu {
  id: string
  nama: string
  instansi: string | null
  no_hp: string
  tujuan: string
  keperluan: string
  created_at: string
}

export interface TamuFormData {
  nama: string
  instansi: string
  no_hp: string
  tujuan: string
  keperluan: string
}
