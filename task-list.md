# Task List & Roadmap: oondang.id (MVP Phase 1)

Pendekatan pengembangan MVP Phase 1 dipecah menjadi **3 Sub-Fase** dengan strategi **Frontend-First**:
1. **Sub-Fase 1 (Frontend Slicing & Firestore Data Contracts):** Menyelesaikan UI/UX, interaktivitas dengan Mock / Local Storage di Pinia, dan menghasilkan file spesifikasi Firestore Data Contract (`docs/contracts/*.md`) per modul.
2. **Sub-Fase 2 (Firebase BaaS & Backend Setup):** Menyiapkan Firebase Project, memvalidasi pemodelan data Firestore, konfigurasi `firestore.rules`, serta menyusun script seeder berkas legal dan indeks query.
3. **Sub-Fase 3 (Integrasi Firebase SDK & Deployment):** Menghubungkan Pinia stores dengan `@firebase/firestore` & `@firebase/auth`, mengaktifkan real-time listener (`onSnapshot`), pengujian responsif, dan rilis ke Firebase Hosting.

---

## Sub-Fase 1: Frontend Slicing & Firestore Contract Generation (FE-First)

Tujuan: Semua tampilan, state interaktif (Pinia / Local Storage / Mock JSON), validasi form Zod, dan flow antarmuka selesai 100%. Setiap modul menghasilkan spesifikasi skema dokumen Firestore dalam file Markdown terpisah.

### 1.1 Setup Project & Design System
- [x] Inisialisasi project: `Vue 3 + TypeScript + Vite + Tailwind CSS`.
- [x] Install & konfigurasi komponen dasar: `shadcn-vue` (Radix Vue) + `lucide-vue-next`.
- [x] Setup global routing (`vue-router`) & state management (`pinia`).
- [x] Setup notifikasi toast modern menggunakan `vue3-toastify`.
- [x] Buat shared components: Sidebar (responsive / collapse), Navbar, Mobile Bottom Navigation, Modal Dialog, Metric Card, Empty State, dan Form Inputs.

### 1.2 Slicing: Auth & Onboarding Wizard
- [x] Slicing Halaman Login & Registrasi (validasi form Zod).
- [x] Slicing Onboarding Wizard:
  - Input nama mempelai pria & wanita.
  - Pilihan tipe pernikahan (`Muslim - KUA` / `Non-Muslim - Catatan Sipil`).
  - Target tanggal pernikahan (Datepicker) & kota pelaksanaan acara.
  - Rekomendasi otomatis checklist berkas & vendor sesuai tipe pernikahan.
- [x] Simpan data wizard ke Pinia / LocalStorage sebagai profil aktif.
- [x] **Deliverable Firestore Contract:** Dokumen `docs/contracts/01-auth-and-profile.md` (Spesifikasi dokumen `users/{userId}` dan `weddingProfiles/{profileId}`).

### 1.3 Slicing: Checklist Persyaratan Pernikahan
- [x] Siapkan data statis / mock JSON persyaratan bawaan KUA & Catatan Sipil (N1-N4, surat pengantar, pas foto, dll.).
- [x] Slicing Halaman Checklist Persyaratan:
  - Progress bar dinamis (persentase kelengkapan berkas selesai).
  - List item interaktif (checkbox toggle selesai/belum).
  - Modal tambah berkas kustom catin.
  - Filter berkas (Semua / Belum Selesai / Selesai / Kategori).
- [x] **Deliverable Firestore Contract:** Dokumen `docs/contracts/02-requirements.md` (Spesifikasi subkoleksi `weddingProfiles/{profileId}/requirements/{reqId}`).

### 1.4 Slicing: Vendor Checklist & Management Hub
- [x] Slicing Halaman Vendor Hub:
  - Default Locked Card: **"Undangan Digital - oondang.id"** (Badge: *Phase 2 - Segera Hadir*).
  - Grid / List Vendor aktif.
  - Tab status vendor: `Semua`, `Riset`, `Dealing`, `Terkontrak`, `Selesai`.
  - Filter kategori: Catering, Venue, MUA, WO, Dekorasi, Foto/Video, dll.
  - Modal Form: Tambah & Edit Vendor (Nama, kontak PIC, nomor WA, status, catatan).
- [x] **Deliverable Firestore Contract:** Dokumen `docs/contracts/03-vendors-and-payments.md` (Spesifikasi subkoleksi `weddingProfiles/{profileId}/vendors/{vendorId}`).

### 1.5 Slicing: Financial Tracker & Termin Pembayaran
- [x] Slicing Halaman Keuangan:
  - Card ringkasan: Target Anggaran, Total Terkontrak, Terbayar, Sisa Hutang.
  - Modal set / ubah Target Anggaran Pernikahan.
  - Tabel rincian pengeluaran per vendor.
  - Modal "Catat Termin Pembayaran" (DP 1, DP 2, Pelunasan, nominal rupiah masker, tgl bayar, status).
- [x] Logic kalkulasi otomatis di Pinia computed property untuk memverifikasi akurasi rumus finansial secara lokal.
- [x] **Deliverable Firestore Contract:** Terangkum dalam `docs/contracts/03-vendors-and-payments.md` (Spesifikasi embedded array of objects `payments` di dokumen vendor).

### 1.6 Slicing: Executive Dashboard Overview
- [x] Slicing Halaman Utama (Dashboard Overview):
  - Banner countdown pernikahan dinamis (H-X hari).
  - 3 Quick Widget (Kelengkapan Dokumen, Progres Vendor, Snapshot Finansial).
  - Quick action buttons ke modul masing-masing.
- [x] **Deliverable Firestore Contract:** Dokumen `docs/contracts/04-dashboard-overview.md` (Spesifikasi agregasi data real-time berbasis snapshot listener Pinia).

---

## Sub-Fase 2: Backend & BaaS Setup (Firebase)

Tujuan: Menyiapkan infrastruktur Firebase BaaS, mendefinisikan skema NoSQL Firestore, menyusun aturan keamanan ketat (`firestore.rules`), serta menyediakan seeder berkas default.

### 2.1 Inisialisasi Firebase Project & Authentication
- [x] Buat dan inisialisasi Firebase Project di Firebase Console.
- [x] Aktifkan provider **Firebase Authentication**:
  - Email & Password sign-in method.
  - Google Sign-In dengan deteksi fresh account (routing ke onboarding vs dashboard).
  - Konfigurasi token persistence (LOCAL storage).
- [x] Buat file konfigurasi Firebase client di frontend: `src/lib/firebase.ts` (Firebase App, Auth, Firestore initialization).

### 2.2 Desain Dokumen & Subkoleksi Cloud Firestore
- [x] Validasi struktur koleksi NoSQL sesuai desain arsitektur:
  - `users/{userId}`: Profil auth dan metadata akun.
  - `weddingProfiles/{profileId}`: Profil pernikahan utama dan target anggaran.
  - `weddingProfiles/{profileId}/requirements/{reqId}`: Subkoleksi item berkas persyaratan.
  - `weddingProfiles/{profileId}/vendors/{vendorId}`: Subkoleksi vendor beserta embedded array `payments: [{ ... }]`.
- [x] Konfigurasi Single-Field dan Composite Indexes di Firestore:
  - Composite Index `requirements`: `category ASC + isCompleted ASC`.
  - Composite Index `vendors`: `status ASC + createdAt DESC`.

### 2.3 Konfigurasi Firestore Security Rules (`firestore.rules`)
- [x] Implementasi aturan keamanan multi-tenant:
  - Proteksi dokumen `users/{userId}`: Hanya `request.auth.uid == userId` yang dapat membaca dan memperbarui.
  - Proteksi dokumen `weddingProfiles/{profileId}`: Hanya pemilik profil (`request.auth.uid == resource.data.ownerId`) yang memiliki akses penuh.
  - Proteksi subkoleksi `requirements` dan `vendors`: Divalidasi via fungsi kepemilikan parent profile `isProfileOwner(profileId)`.
  - Guard anti-hapus vendor default: Mencegah operasi `delete` pada vendor jika `resource.data.isLocked == true`.
- [ ] Aturan keamanan untuk Phase 2 (`invitations/{subdomain}`):
  - Public read untuk undangan aktif.
  - Write hanya untuk pemilik undangan (`resource.data.ownerId == request.auth.uid`).
  - Public create untuk subkoleksi ucapan (`wishes`) dan konfirmasi RSVP (`guests`).
- [ ] Unit testing aturan keamanan menggunakan Firebase Emulator Suite (`@firebase/rules-unit-testing`).

### 2.4 Data Seeding & Template Otomatis
- [x] Inisialisasi template berkas nikah bawaan saat profil pertama kali dibuat pada onboarding:
  - Template berkas KUA (Surat Pengantar RT/RW N1, Surat Permohonan Kehendak Nikah N2, Persetujuan Calon Mempelai N4, Surat Izin Orang Tua N5, Pas Foto latar biru, Fotokopi berkas kependudukan, Surat Keterangan Sehat/Suntik TT).
  - Template berkas Catatan Sipil (Surat Pemberitahuan Perkawinan, Bukti Pemberkatan Agama, Fotokopi berkas, Surat Keterangan Belum Menikah).
- [x] Seeding otomatis vendor bawaan sistem: **"Undangan Digital - oondang.id"** dengan atribut `isLocked: true`.

---

## Sub-Fase 3: Integrasi Firebase SDK & Deployment

Tujuan: Mengalihkan mock frontend ke Firebase Client SDK secara langsung, menerapkan real-time snapshot listener, menangani seluruh error state, dan melakukan rilis ke Firebase Hosting.

### 3.1 Integrasi Pinia Store dengan Firebase Client SDK
- [x] Buat Firebase Service Layer modular di `src/services/`:
  - `auth`: Register, login, Google Sign-In, logout, dan listener status autentikasi (`onAuthStateChanged`).
  - `weddingProfiles`: Simpan & perbarui profil pernikahan dan target anggaran.
  - `requirementService.ts`: CRUD persyaratan legal dan real-time listener `onSnapshot`.
  - `vendorService.ts`: CRUD vendor dan mutasi array payments (`arrayUnion`, update, delete).
  - `financeService.ts`: Agregasi metrik finansial real-time (`calculateFinanceMetrics`) & `updateTargetBudget`.
- [x] Sambungkan Views dan Pinia Stores ke Service Layer Firebase:
  - `useAuthStore`: Sinkronisasi sesi pengguna aktif dengan Firebase Auth & auto-seed onboarding.
  - `RequirementsView`: Checklist tersinkronisasi real-time via `subscribeRequirements` `onSnapshot`.
  - `VendorsView`: List vendor dan payment tracking tersinkronisasi real-time via `subscribeVendors` `onSnapshot`.
  - `FinancesView`: Menghitung metrik finansial secara otomatis dari data reaktif snapshot vendor (`totalContracted`, `totalPaid`, `remainingDebt`).
  - `DashboardView`: Agregasi ringkasan berkas, vendor, countdown hari H, dan finansial dari listener snapshot aktif.

### 3.2 Error Handling, Loading State & UX Polish
- [x] Mapping Firebase Error Code ke pesan bahasa Indonesia yang ramah pengguna:
  - `auth/user-not-found` atau `auth/wrong-password` -> "Email atau kata sandi tidak cocok. Silakan periksa kembali."
  - `auth/email-already-in-use` -> "Alamat email ini sudah terdaftar. Silakan masuk atau gunakan email lain."
  - `auth/weak-password` -> "Kata sandi terlalu lemah. Gunakan minimal 8 karakter."
- [x] Tampilkan toast error dan konfirmasi sukses via `vue3-toastify`.
- [x] Skeleton loaders saat inisialisasi koneksi snapshot awal ke Firestore.

### 3.3 End-to-End QA & Responsive Audit
- [ ] Uji flow calon pengantin dari nol:
  1. Registrasi akun baru di Firebase Auth.
  2. Menyelesaikan Onboarding Wizard (auto-create profil, checklist KUA/Catatan Sipil, dan vendor default).
  3. Toggle checklist berkas dan tambah berkas kustom.
  4. Input vendor baru, set status, dan catat termin pembayaran.
  5. Periksa kartu overview dashboard (countdown, progres berkas, dan ringkasan budget ter-update otomatis secara real-time).
- [ ] Audit antarmuka pada berbagai ukuran viewport layar:
  - Mobile (360px, 390px, 414px)
  - Tablet (768px, 820px)
  - Desktop (1280px, 1440px, 1920px)

### 3.4 Production Deployment (Firebase Hosting)
- [ ] Setup `firebase.json` untuk konfigurasi Firebase Hosting:
  - Rewrites rule untuk Single Page Application (semua route diarahkan ke `/index.html`).
  - Cache-control headers untuk static assets Vite (`/assets/**`).
- [ ] Konfigurasi deployment target domain di Firebase Hosting (support wildcard untuk Phase 2: `*.oondang.id`).
- [ ] Build static bundle: `npm run build`.
- [ ] Deploy ke staging / production via Firebase CLI: `npx firebase deploy --only hosting,firestore:rules`.