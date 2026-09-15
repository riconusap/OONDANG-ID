import type {
  User,
  WeddingProfile,
  RequirementItem,
  Vendor,
  WeddingBudget,
  VendorPayment,
  FinancialSummary
} from '@/types'

export const mockUser: User = {
  id: 'usr-01',
  email: 'dimas.anissa@example.com',
  name: 'Dimas Prasetyo',
  created_at: '2026-09-01T10:00:00Z',
}

export const mockProfile: WeddingProfile = {
  id: 'wed-01',
  user_id: 'usr-01',
  groom_name: 'Dimas Prasetyo',
  bride_name: 'Anissa Rahmawati',
  event_date: '2026-12-20',
  wedding_type: 'muslim',
  location_city: 'Jakarta Selatan',
  created_at: '2026-09-01T10:00:00Z',
}

export const defaultKuaRequirements: RequirementItem[] = [
  {
    id: 'req-01',
    wedding_profile_id: 'wed-01',
    title: 'Surat Pengantar Nikah dari RT / RW',
    category: 'kua',
    is_completed: true,
    due_date: '2026-10-01',
    notes: 'Sudah ditandatangani Ketua RT 05 dan RW 02.',
    is_default: true,
  },
  {
    id: 'req-02',
    wedding_profile_id: 'wed-01',
    title: 'Formulir N1 (Surat Pengantar Nikah Kelurahan)',
    category: 'kua',
    is_completed: true,
    due_date: '2026-10-15',
    notes: 'Diurus di Kantor Kelurahan domisili.',
    is_default: true,
  },
  {
    id: 'req-03',
    wedding_profile_id: 'wed-01',
    title: 'Formulir N2 (Permohonan Kehendak Nikah)',
    category: 'kua',
    is_completed: false,
    due_date: '2026-10-25',
    notes: 'Diserahkan langsung ke KUA Kecamatan.',
    is_default: true,
  },
  {
    id: 'req-04',
    wedding_profile_id: 'wed-01',
    title: 'Formulir N4 (Persetujuan Calon Mempelai)',
    category: 'kua',
    is_completed: false,
    due_date: '2026-10-25',
    notes: 'Ditandatangani kedua calon mempelai.',
    is_default: true,
  },
  {
    id: 'req-05',
    wedding_profile_id: 'wed-01',
    title: 'Sertifikat Imunisasi / Surat Keterangan Sehat Puskesmas',
    category: 'kua',
    is_completed: true,
    due_date: '2026-10-10',
    notes: 'Pemeriksaan kesehatan pranikah di Puskesmas Tebet.',
    is_default: true,
  },
  {
    id: 'req-06',
    wedding_profile_id: 'wed-01',
    title: 'Pas Foto 2x3 (4 lembar) dan 4x6 (2 lembar) Latar Biru',
    category: 'kua',
    is_completed: false,
    due_date: '2026-10-20',
    notes: 'Foto formal kemeja putih dengan latar biru polos.',
    is_default: true,
  },
]

export const defaultCivilRegistryRequirements: RequirementItem[] = [
  {
    id: 'req-c01',
    wedding_profile_id: 'wed-01',
    title: 'Salinan Akta Kelahiran Legalisir',
    category: 'civil_registry',
    is_completed: true,
    due_date: '2026-10-01',
    notes: 'Masing-masing calon mempelai.',
    is_default: true,
  },
  {
    id: 'req-c02',
    wedding_profile_id: 'wed-01',
    title: 'Surat Keterangan Belum Menikah dari Kelurahan',
    category: 'civil_registry',
    is_completed: false,
    due_date: '2026-10-15',
    notes: 'Berlaku maksimal 3 bulan sebelum pencatatan.',
    is_default: true,
  },
  {
    id: 'req-c03',
    wedding_profile_id: 'wed-01',
    title: 'Surat Pemberkatan / Perkawinan Agama',
    category: 'civil_registry',
    is_completed: false,
    due_date: '2026-12-15',
    notes: 'Dari pihak pemuka agama / tempat ibadah.',
    is_default: true,
  },
]

export const mockVendors: Vendor[] = [
  {
    id: 'ven-locked-01',
    wedding_profile_id: 'wed-01',
    name: 'oondang.id (Undangan Digital)',
    category: 'invitation',
    contact_person: 'Tim Support oondang.id',
    contact_phone: '081299887766',
    status: 'terkontrak',
    is_locked: true,
    notes: 'Undangan digital premium oondang.id (Phase 2 - Segera Hadir).',
    created_at: '2026-09-01T10:00:00Z',
  },
  {
    id: 'ven-02',
    wedding_profile_id: 'wed-01',
    name: 'Sasana Kriya Grand Ballroom',
    category: 'venue',
    contact_person: 'Ibu Ratna',
    contact_phone: '081311223344',
    status: 'terkontrak',
    is_locked: false,
    notes: 'Paket Gedung siang hari 4 jam + fasilitas AC dan listrik 10.000 watt.',
    created_at: '2026-09-02T11:00:00Z',
  },
  {
    id: 'ven-03',
    wedding_profile_id: 'wed-01',
    name: 'Dapur Nusantara Catering',
    category: 'catering',
    contact_person: 'Pak Hendro',
    contact_phone: '081822334455',
    status: 'dealing',
    is_locked: false,
    notes: 'Menu 800 porsi buffet + 4 stall premium.',
    created_at: '2026-09-05T14:30:00Z',
  },
  {
    id: 'ven-04',
    wedding_profile_id: 'wed-01',
    name: 'Lensa Cerita Photography',
    category: 'photo_video',
    contact_person: 'Rian',
    contact_phone: '085733445566',
    status: 'riset',
    is_locked: false,
    notes: 'Sedang membandingkan portofolio engagement dan wedding day.',
    created_at: '2026-09-08T09:00:00Z',
  },
]

export const mockBudget: WeddingBudget = {
  id: 'bud-01',
  wedding_profile_id: 'wed-01',
  target_budget: 150000000,
  notes: 'Anggaran gabungan pihak pria dan wanita.',
}

export const mockPayments: VendorPayment[] = [
  {
    id: 'pay-01',
    vendor_id: 'ven-02',
    title: 'DP 1 Booking Tanggal Gedung',
    amount: 15000000,
    payment_date: '2026-09-05',
    status: 'paid',
    proof_file_url: null,
  },
  {
    id: 'pay-02',
    vendor_id: 'ven-02',
    title: 'Termin 2 (50% Biaya Gedung)',
    amount: 20000000,
    payment_date: '2026-11-01',
    status: 'pending',
    proof_file_url: null,
  },
  {
    id: 'pay-03',
    vendor_id: 'ven-03',
    title: 'Down Payment Uji Rasa Catering',
    amount: 10000000,
    payment_date: '2026-09-10',
    status: 'paid',
    proof_file_url: null,
  },
]

export function calculateFinancialSummary(
  targetBudget: number,
  _vendors: Vendor[],
  payments: VendorPayment[]
): FinancialSummary {
  const totalContracted = 95000000 // Total estimasi kontrak vendor aktif
  const totalPaid = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + Number(p.amount), 0)
  const remainingDebt = Math.max(0, totalContracted - totalPaid)

  return {
    target_budget: targetBudget,
    total_contracted: totalContracted,
    total_paid: totalPaid,
    remaining_debt: remainingDebt,
  }
}
