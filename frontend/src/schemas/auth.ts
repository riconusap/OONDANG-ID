import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email wajib diisi.')
    .email('Format alamat email tidak valid.'),
  password: z
    .string()
    .min(6, 'Kata sandi minimal 6 karakter.'),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Nama lengkap minimal 2 karakter.')
    .max(100, 'Nama lengkap maksimal 100 karakter.'),
  email: z
    .string()
    .min(1, 'Email wajib diisi.')
    .email('Format alamat email tidak valid.'),
  password: z
    .string()
    .min(8, 'Kata sandi minimal 8 karakter.'),
  confirmPassword: z
    .string()
    .min(1, 'Konfirmasi kata sandi wajib diisi.'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Konfirmasi kata sandi tidak cocok.',
  path: ['confirmPassword'],
})

export type RegisterFormData = z.infer<typeof registerSchema>

export const weddingWizardStep1Schema = z.object({
  groom_name: z
    .string()
    .min(2, 'Nama calon mempelai pria minimal 2 karakter.')
    .max(100, 'Nama terlalu panjang (maksimal 100 karakter).'),
  bride_name: z
    .string()
    .min(2, 'Nama calon mempelai wanita minimal 2 karakter.')
    .max(100, 'Nama terlalu panjang (maksimal 100 karakter).'),
  vision_note: z
    .string()
    .max(250, 'Catatan visi maksimal 250 karakter.')
    .optional(),
})

export const weddingWizardStep2Schema = z.object({
  wedding_type: z.enum(['muslim', 'non_muslim'], {
    error: 'Pilih tipe prosedur pernikahan.',
  }),
  event_date: z
    .string()
    .min(1, 'Target tanggal pernikahan wajib ditentukan.')
    .refine((val) => {
      const date = new Date(val)
      return !isNaN(date.getTime())
    }, 'Format tanggal tidak valid.'),
  location_city: z
    .string()
    .min(2, 'Kota atau kabupaten lokasi acara wajib diisi.')
    .max(100, 'Nama kota maksimal 100 karakter.'),
  initial_budget: z
    .number()
    .min(10000000, 'Pagu anggaran awal minimal Rp 10.000.000.')
    .max(10000000000, 'Pagu anggaran maksimal Rp 10.000.000.000.')
    .default(150000000),
})

export const weddingWizardStep3Schema = z.object({
  selected_recommendation_ids: z
    .array(z.string())
    .min(1, 'Pilih minimal 1 rekomendasi checklist untuk mengaktifkan ruang rencana.'),
})

export const weddingWizardFullSchema = weddingWizardStep1Schema
  .and(weddingWizardStep2Schema)
  .and(weddingWizardStep3Schema)

export type WeddingWizardFormData = z.infer<typeof weddingWizardFullSchema>
