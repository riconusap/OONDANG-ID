import type { OnboardingRecommendationItem, WeddingType } from '@/types'

export function getSystemRecommendations(
  weddingType: WeddingType,
  _eventDateStr?: string
): OnboardingRecommendationItem[] {
  const isMuslim = weddingType === 'muslim'

  const legalItems: OnboardingRecommendationItem[] = isMuslim
    ? [
        {
          id: 'rec-legal-rt',
          category: 'legal',
          title: 'Surat Pengantar Nikah dari RT / RW',
          description: 'Surat pengantar domisili awal untuk pengurusan berkas kelurahan.',
          badgeText: 'Regulasi Wajib',
          isRecommended: true,
          targetDeadline: 'H-90 Hari',
        },
        {
          id: 'rec-legal-n1',
          category: 'legal',
          title: 'Formulir N1 (Surat Pengantar Nikah Kelurahan)',
          description: 'Diterbitkan kelurahan setempat berdasarkan pengantar RT/RW.',
          badgeText: 'Regulasi Wajib',
          isRecommended: true,
          targetDeadline: 'H-75 Hari',
        },
        {
          id: 'rec-legal-n2',
          category: 'legal',
          title: 'Formulir N2 (Permohonan Kehendak Nikah)',
          description: 'Diserahkan langsung ke Kantor Urusan Agama (KUA) kecamatan acara.',
          badgeText: 'Regulasi Wajib',
          isRecommended: true,
          targetDeadline: 'H-60 Hari',
        },
        {
          id: 'rec-legal-n4',
          category: 'legal',
          title: 'Formulir N4 (Persetujuan Calon Mempelai)',
          description: 'Pernyataan kerelaan kedua calon mempelai ditandatangani bersama.',
          badgeText: 'Regulasi Wajib',
          isRecommended: true,
          targetDeadline: 'H-60 Hari',
        },
        {
          id: 'rec-legal-health',
          category: 'legal',
          title: 'Sertifikat Imunisasi & Cek Kesehatan Catin',
          description: 'Pemeriksaan kesehatan pranikah (Elsimil / Puskesmas domisili).',
          badgeText: 'Kesehatan Catin',
          isRecommended: true,
          targetDeadline: 'H-45 Hari',
        },
        {
          id: 'rec-legal-photo',
          category: 'legal',
          title: 'Pas Foto Berlatar Biru (2x3 & 4x6)',
          description: 'Foto resmi catin berbusana sopan untuk buku nikah resmi Kemenag.',
          badgeText: 'Administrasi',
          isRecommended: true,
          targetDeadline: 'H-45 Hari',
        },
      ]
    : [
        {
          id: 'rec-legal-church',
          category: 'legal',
          title: 'Surat Keterangan Pemberkatan / Agama',
          description: 'Bukti sah pelaksanaan perkawinan menurut agama atau kepercayaan.',
          badgeText: 'Regulasi Wajib',
          isRecommended: true,
          targetDeadline: 'H-60 Hari',
        },
        {
          id: 'rec-legal-civil-n1',
          category: 'legal',
          title: 'Surat Pengantar Kelurahan untuk Catatan Sipil',
          description: 'Surat keterangan domisili untuk pencatatan sipil Disdukcapil.',
          badgeText: 'Regulasi Wajib',
          isRecommended: true,
          targetDeadline: 'H-60 Hari',
        },
        {
          id: 'rec-legal-birth',
          category: 'legal',
          title: 'Fotokopi Akta Kelahiran & Ijazah Terakhir',
          description: 'Verifikasi identitas legal nama dan tanggal lahir kedua mempelai.',
          badgeText: 'Regulasi Wajib',
          isRecommended: true,
          targetDeadline: 'H-45 Hari',
        },
        {
          id: 'rec-legal-witness',
          category: 'legal',
          title: 'KTP Dua Orang Saksi Pencatatan',
          description: 'Identitas saksi hadir yang membubuhkan tanda tangan akta perkawinan.',
          badgeText: 'Saksi Nikah',
          isRecommended: true,
          targetDeadline: 'H-30 Hari',
        },
      ]

  const vendorItems: OnboardingRecommendationItem[] = [
    {
      id: 'rec-ven-venue',
      category: 'vendor',
      title: 'Gedung / Venue Acara Pernikahan',
      description: 'Penguncian tanggal dan konfirmasi kapasitas tamu undangan.',
      badgeText: 'Prioritas Utama',
      isRecommended: true,
      targetDeadline: 'H-180 Hari',
    },
    {
      id: 'rec-ven-catering',
      category: 'vendor',
      title: 'Catering & Konsumsi Tamu',
      description: 'Test food menu prasmanan, gubukan, dan penetapan porsi konsumsi.',
      badgeText: 'Prioritas Utama',
      isRecommended: true,
      targetDeadline: 'H-120 Hari',
    },
    {
      id: 'rec-ven-mua',
      category: 'vendor',
      title: 'MUA & Busana / Kebaya Pengantin',
      description: 'Rias wajah akad & resepsi serta fitting busana mempelai dan orang tua.',
      badgeText: 'Esensial',
      isRecommended: true,
      targetDeadline: 'H-90 Hari',
    },
    {
      id: 'rec-ven-photo',
      category: 'vendor',
      title: 'Fotografi & Videografi Acara',
      description: 'Dokumentasi momen sakral akad, resepsi, dan video highlight kenangan.',
      badgeText: 'Esensial',
      isRecommended: true,
      targetDeadline: 'H-90 Hari',
    },
    {
      id: 'rec-ven-decor',
      category: 'vendor',
      title: 'Dekorasi & Pelaminan',
      description: 'Penataan panggung akad, pelaminan resepsi, photobooth, dan lorong masuk.',
      badgeText: 'Estetika',
      isRecommended: true,
      targetDeadline: 'H-60 Hari',
    },
  ]

  const financeItems: OnboardingRecommendationItem[] = [
    {
      id: 'rec-fin-budget',
      category: 'finance',
      title: 'Penetapan Pagu Anggaran Utama',
      description: 'Mengunci batas maksimal seluruh pos pengeluaran pernikahan.',
      badgeText: 'Kontrol Bujet',
      isRecommended: true,
      targetDeadline: 'H-180 Hari',
    },
    {
      id: 'rec-fin-dp-venue',
      category: 'finance',
      title: 'Pembayaran DP Venue & Penguncian Tanggal',
      description: 'Uang muka pengesahan jadwal acara pada kalender pengelola gedung.',
      badgeText: 'Termin Awal',
      isRecommended: true,
      targetDeadline: 'H-150 Hari',
    },
    {
      id: 'rec-fin-emergency',
      category: 'finance',
      title: 'Alokasi Dana Cadangan Darurat (10%)',
      description: 'Dana proteksi untuk biaya tak terduga menjelang hari bahagia.',
      badgeText: 'Keamanan Kas',
      isRecommended: true,
      targetDeadline: 'H-90 Hari',
    },
  ]

  return [...legalItems, ...vendorItems, ...financeItems]
}
