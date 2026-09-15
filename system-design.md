# System & Architecture Design: oondang.id (MVP Phase 1 & Phase 2 Ready)

Dokumen ini mendokumentasikan rancangan arsitektur sistem, alur kerja 3-subfase, skema basis data NoSQL Cloud Firestore, aturan keamanan (Firestore Security Rules), spesifikasi kontrak layanan (Service Data Contracts), serta arsitektur kesiapan Phase 2 (Undangan Digital).

---

## 1. Alur Kerja 3-Subfase (FE-First Strategy)

Pengembangan sistem oondang.id mengadopsi metodologi **Frontend-First** yang terbagi dalam 3 Sub-Fase terstruktur:

```
[ SUB-FASE 1: FRONTEND SLICING & CONTRACT GENERATION ]
  - Framework: Vue 3 (Composition API) + TypeScript + Vite + Tailwind CSS + Shadcn-vue
  - State Management: Pinia + Local / Mock Storage
  - Menuntaskan 100% interaksi antarmuka, validasi form (Zod), dan visualisasi data
          |
          v
  Menghasilkan Spesifikasi Firestore Data Contract (docs/contracts/*.md):
  - docs/contracts/01-auth-and-profile.md
  - docs/contracts/02-requirements.md
  - docs/contracts/03-vendors-and-payments.md
  - docs/contracts/04-dashboard-overview.md
          |
          v
[ SUB-FASE 2: BACKEND & BAAS SETUP (FIREBASE) ]
  - Inisialisasi Firebase Project & Firebase Authentication
  - Penyusunan Skema Koleksi & Subkoleksi Cloud Firestore
  - Konfigurasi Keamanan Data (firestore.rules) & Indeks Query Komposit
  - Seeder Script / Cloud Functions untuk Template Berkas Legal (KUA & Catatan Sipil)
          |
          v
[ SUB-FASE 3: INTEGRASI SDK, REAL-TIME LISTENER & DEPLOYMENT ]
  - Migrasi driver Pinia Store dari Mock ke Firebase Client SDK (@firebase/firestore, @firebase/auth)
  - Implementasi Real-time Listener (onSnapshot) untuk sinkronisasi otomatis
  - Penanganan Error State, Skeleton Loading, dan Toast Notification (vue3-toastify)
  - QA Responsif (Mobile 360px - 430px s.d. Desktop 1280px+)
  - Deployment ke Firebase Hosting / Cloudflare Pages
```

---

## 2. Arsitektur Sistem (Vue 3 + Firebase BaaS)

Sistem memanfaatkan ekosistem Firebase Serverless BaaS (Backend-as-a-Service) yang memberikan keunggulan latensi rendah, sinkronisasi real-time instan, dan efisiensi biaya operasional:

```
+-------------------------------------------------------------------------------+
|                                 Client Layer                                  |
|            Vue 3 (Composition API) + TypeScript + Vite + Pinia Store          |
|            UI: Tailwind CSS + Shadcn-vue + Lucide Icons + Vue3-Toastify       |
+-------------------------------------------------------------------------------+
       |                                |                              |
       | Web Channel (HTTPS/WSS)       | Direct Upload (HTTPS)        | Static CDN
       v                                v                              v
+-----------------------+     +-------------------+     +-----------------------+
|  Firebase Auth        |     |  Firebase Storage |     |  Firebase Hosting     |
|  - Email/Password     |     |  / Cloudflare R2  |     |  - Global CDN Fastly  |
|  - JWT Token & Session|     |  - Bukti Transfer |     |  - URL Rewrites (SPA) |
+-----------------------+     |  - Galeri Foto    |     |  - Wildcard Subdomain |
       |                      +-------------------+     +-----------------------+
       | uid auth context               ^
       v                                | storage URL ref
+-------------------------------------------------------------------------------+
|                       Cloud Firestore (NoSQL Document Store)                 |
|  - Real-time Sync (onSnapshot via WebSockets / gRPC Web)                     |
|  - Subcollection & Embedded Arrays Optimization                              |
|  - Guarded by: Firestore Security Rules (firestore.rules)                    |
+-------------------------------------------------------------------------------+
```

### Komponen Utama Arsitektur:
1. **Frontend Client (Vue 3 SPA):** Aplikasi web modular berbasis komponen, reactive stores (Pinia), dan type-safety penuh dengan TypeScript.
2. **Firebase Authentication:** Mengelola registrasi, login, reset password, dan penerbitan token autentikasi (JWT) yang diinjeksi ke context rules Firestore (`request.auth`).
3. **Cloud Firestore:** Basis data NoSQL dokumen terdistribusi dengan kemampuan offline-persistence dan push real-time event listener.
4. **Firebase Storage / Cloudflare R2:** Penyimpanan objek biner (media foto galeri undangan digital dan bukti transfer pembayaran vendor).
5. **Firebase Hosting:** Distribusi aset statis terenkripsi SSL otomatis dengan dukungan URL rewrite SPA (`index.html`) dan routing multi-domain/wildcard.

---

## 3. Format Standar Firestore Data Contract

Setiap fitur yang diselesaikan pada Sub-Fase 1 menghasilkan dokumen kontrak data di dalam direktori `docs/contracts/` dengan format standar berikut:

```markdown
# Firestore Data Contract: [Nama Fitur]

## 1. Target Path Dokumen / Koleksi
- **Path:** `weddingProfiles/{profileId}/[subcollection]`
- **Tipe Operasi:** Read / Create / Update / Delete / Real-time Listener (`onSnapshot`)
- **Autentikasi:** Diperlukan (`request.auth != null`)

## 2. Struktur Schema Dokumen (TypeScript Interface)
```typescript
interface ExampleDocument {
  id: string;
  fieldA: string;
  fieldB: number;
  createdAt: Timestamp;
}
```

## 3. Kebutuhan Query & Indeks
- Filter: `where("status", "==", "terkontrak")`
- Urutan: `orderBy("createdAt", "desc")`
- Indeks Komposit: Diperlukan (status ASC + createdAt DESC) / Single-field Index

## 4. Aturan Keamanan (Security Rules Requirement)
- Hanya pemilik profil yang dapat membaca dan memodifikasi data.

## 5. Service Function Signature (@firebase/firestore)
```typescript
export async function createExample(profileId: string, data: ExampleDTO): Promise<string>;
export function subscribeExamples(profileId: string, callback: (items: ExampleDocument[]) => void): Unsubscribe;
```
```

---

## 4. Desain Basis Data Cloud Firestore (NoSQL)

### 4.1 Hierarki Koleksi & Subkoleksi

```
(root)
  |-- users/{userId}                                 [Profil Pengguna Auth]
  |
  |-- weddingProfiles/{profileId}                    [Profil Pernikahan Catin]
  |     |-- requirements/{reqId}                     [Subkoleksi Berkas Legal]
  |     |-- vendors/{vendorId}                       [Subkoleksi Vendor & Embedded Payments]
  |
  |-- invitations/{subdomain}                        [Phase 2: Undangan Digital Publik]
        |-- guests/{guestId}                         [Subkoleksi Buku Tamu]
        |-- wishes/{wishId}                          [Subkoleksi Ucapan & Doa]
```

---

### 4.2 Detail Definisi Dokumen & Tipe Data

#### A. Koleksi Root: `users`
Menyimpan profil dasar akun yang berelasi 1:1 dengan Firebase Auth UID.
- **Path:** `users/{userId}` (dengan `{userId}` setara `request.auth.uid`)
- **Fields:**
  | Field | Tipe Data | Keterangan |
  |---|---|---|
  | `id` | `String` | Identik dengan Auth UID |
  | `email` | `String` | Alamat email terdaftar |
  | `name` | `String` | Nama lengkap pengguna |
  | `photoUrl` | `String \| null` | Avatar URL (opsional) |
  | `createdAt` | `Timestamp` | Waktu registrasi |
  | `updatedAt` | `Timestamp` | Waktu pembaruan terakhir |

---

#### B. Koleksi Root: `weddingProfiles`
Menyimpan data induk persiapan pernikahan calon pengantin.
- **Path:** `weddingProfiles/{profileId}`
- **Fields:**
  | Field | Tipe Data | Keterangan |
  |---|---|---|
  | `id` | `String` | Auto-generated ID atau custom UUID |
  | `ownerId` | `String` | Relasi ke `users/{userId}` (Foreign Key) |
  | `groomName` | `String` | Nama calon mempelai pria |
  | `brideName` | `String` | Nama calon mempelai wanita |
  | `eventDate` | `String` | Format standar ISO `YYYY-MM-DD` |
  | `weddingType` | `String` | Enum: `'muslim'` (KUA) atau `'non_muslim'` (Catatan Sipil) |
  | `locationCity` | `String \| null` | Kota pelaksanaan akad/resepsi |
  | `targetBudget` | `Number` | Target plafon anggaran (Rupiah, default: 0) |
  | `createdAt` | `Timestamp` | Waktu pembuatan dokumen |
  | `updatedAt` | `Timestamp` | Waktu pembaruan dokumen |

---

#### C. Subkoleksi: `weddingProfiles/{profileId}/requirements/{reqId}`
Menyimpan daftar tugas kelengkapan dokumen persyaratan legal pernikahan (KUA / Catatan Sipil / Kustom).
- **Path:** `weddingProfiles/{profileId}/requirements/{reqId}`
- **Fields:**
  | Field | Tipe Data | Keterangan |
  |---|---|---|
  | `id` | `String` | Auto-generated ID |
  | `title` | `String` | Nama berkas (misal: "Surat Pengantar RT/RW (N1)") |
  | `category` | `String` | Enum: `'kua'`, `'civil_registry'`, atau `'custom'` |
  | `isCompleted` | `Boolean` | Status centang checklist (default: false) |
  | `dueDate` | `String \| null` | Tenggat waktu (format `YYYY-MM-DD`) |
  | `notes` | `String \| null` | Catatan tambahan pengurusan berkas |
  | `isDefault` | `Boolean` | Penanda berkas bawaan sistem (true) atau kustom (false) |
  | `createdAt` | `Timestamp` | Waktu pembuatan berkas |
  | `updatedAt` | `Timestamp` | Waktu pembaruan berkas |

---

#### D. Subkoleksi: `weddingProfiles/{profileId}/vendors/{vendorId}`
Menyimpan vendor rekanan dan pencatatan termin pembayaran pengeluaran.
- **Path:** `weddingProfiles/{profileId}/vendors/{vendorId}`
- **Fields:**
  | Field | Tipe Data | Keterangan |
  |---|---|---|
  | `id` | `String` | Auto-generated ID |
  | `name` | `String` | Nama vendor (misal: "Diamond Catering") |
  | `category` | `String` | Enum: `'catering'`, `'venue'`, `'mua'`, `'wo'`, `'invitation'`, `'decor'`, `'photo_video'`, `'attire'`, `'entertainment'`, `'other'` |
  | `contactPerson`| `String \| null` | Nama PIC vendor |
  | `contactPhone` | `String \| null` | Nomor kontak / WhatsApp |
  | `status` | `String` | Enum tahapan: `'riset'`, `'dealing'`, `'terkontrak'`, `'selesai'` |
  | `isLocked` | `Boolean` | Flag proteksi: `true` khusus untuk vendor bawaan `Undangan Digital - oondang.id` agar tidak bisa dihapus |
  | `notes` | `String \| null` | Rincian paket atau catatan penting |
  | `payments` | `Array<VendorPayment>` | **Embedded Array of Objects** rincian termin pembayaran |
  | `createdAt` | `Timestamp` | Waktu pembuatan dokumen vendor |
  | `updatedAt` | `Timestamp` | Waktu pembaruan dokumen vendor |

##### Struktur Objek `VendorPayment` (Embedded dalam Array `payments`):
Keputusan arsitektur: data termin pembayaran disimpan langsung sebagai array of objects di dalam dokumen vendor (bukan subkoleksi terpisah). Hal ini menghemat kuota operasi baca (read quota) Firestore, karena saat memuat vendor, seluruh histori pembayarannya otomatis terambil dalam 1 dokumen bacaan tunggal.

```typescript
interface VendorPayment {
  id: string;               // UUID / NanoID lokal
  title: string;            // Contoh: "DP 1 (Booking Tanggal)", "Pelunasan"
  amount: number;           // Nilai nominal rupiah (misal: 15000000)
  status: 'pending' | 'paid'; // Status pembayaran
  paymentDate: string | null; // Tanggal transaksi (YYYY-MM-DD)
  proofFileUrl: string | null; // URL file bukti bayar di Firebase Storage
  createdAt: Timestamp;
}
```

---

## 5. Firestore Security Rules (`firestore.rules`)

Aturan keamanan wajib menjamin isolasi data multi-tenant antar pengguna sehingga calon pengantin hanya memiliki akses baca dan tulis pada data miliknya sendiri:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    function isProfileOwner(profileId) {
      return isAuthenticated() &&
        request.auth.uid == get(/databases/$(database)/documents/weddingProfiles/$(profileId)).data.ownerId;
    }

    // 1. User Profiles: Hanya pemilik akun yang bisa baca & tulis datanya
    match /users/{userId} {
      allow read, write: if isOwner(userId);
    }

    // 2. Wedding Profiles: Hanya pemilik dokumen yang dapat membaca & memperbarui
    match /weddingProfiles/{profileId} {
      allow create: if isAuthenticated() && request.resource.data.ownerId == request.auth.uid;
      allow read, update, delete: if isAuthenticated() && resource.data.ownerId == request.auth.uid;

      // 2.1 Subkoleksi Requirements: Divalidasi melalui kepemilikan parent profile
      match /requirements/{reqId} {
        allow read, write: if isProfileOwner(profileId);
      }

      // 2.2 Subkoleksi Vendors: Divalidasi melalui kepemilikan parent profile
      match /vendors/{vendorId} {
        allow read, create: if isProfileOwner(profileId);
        allow update: if isProfileOwner(profileId);
        // Guard: Item yang di-lock (Undangan Digital - oondang.id) tidak boleh dihapus
        allow delete: if isProfileOwner(profileId) && resource.data.isLocked != true;
      }
    }

    // 3. Phase 2: Undangan Digital (invitations)
    match /invitations/{subdomain} {
      // Publik dapat membaca undangan aktif
      allow read: if true;
      // Pemilik profil dapat memodifikasi isi undangan
      allow write: if isAuthenticated() && resource.data.ownerId == request.auth.uid;
      allow create: if isAuthenticated() && request.resource.data.ownerId == request.auth.uid;

      // Buku tamu dan ucapan doa: publik dapat mengisi (create), pemilik dapat mengelola
      match /guests/{guestId} {
        allow read, write: if isAuthenticated() &&
          get(/databases/$(database)/documents/invitations/$(subdomain)).data.ownerId == request.auth.uid;
        allow create: if true; // RSVP publik
      }

      match /wishes/{wishId} {
        allow read, create: if true; // Semua pengunjung bisa melihat & mengirim ucapan
        allow delete: if isAuthenticated() &&
          get(/databases/$(database)/documents/invitations/$(subdomain)).data.ownerId == request.auth.uid;
      }
    }
  }
}
```

---

## 6. Spesifikasi Kontrak Layanan (Service Data Contracts)

Menggantikan endpoints REST API monolitik, interaksi aplikasi Vue 3 ke Firestore menggunakan pustaka modular `@firebase/firestore` dan `@firebase/auth`:

### 6.1 Modul Autentikasi & Akun (`authService.ts`)
- `registerWithEmail(email, password, name)`: Mendaftarkan akun di Firebase Auth dan membuat dokumen `users/{userId}`.
- `loginWithEmail(email, password)`: Melakukan otentikasi kredensial pengguna.
- `logoutUser()`: Mengakhiri sesi pengguna aktif.
- `getCurrentUserProfile()`: Mengambil dokumen `users/{userId}`.

### 6.2 Modul Profil Pernikahan (`profileService.ts`)
- `createWeddingProfile(payload)`: Inisialisasi dokumen `weddingProfiles/{profileId}` dan memicu pembuatan checklist default (KUA/Catatan Sipil serta vendor bawaan).
- `getWeddingProfile(profileId)`: Mengambil data profil pernikahan.
- `updateWeddingProfile(profileId, payload)`: Memperbarui nama pengantin, tanggal, atau kota.
- `updateTargetBudget(profileId, targetBudget)`: Memperbarui plafon anggaran pernikahan.

### 6.3 Modul Persyaratan Berkas Legal (`requirementService.ts`)
- `subscribeRequirements(profileId, callback)`: Real-time listener (`onSnapshot`) untuk memantau koleksi `weddingProfiles/{profileId}/requirements` secara live.
- `toggleRequirementStatus(profileId, reqId, isCompleted)`: Mengubah status penyelesaian berkas (`updateDoc`).
- `addCustomRequirement(profileId, item)`: Menambahkan berkas persyaratan kustom (`addDoc`).
- `deleteRequirement(profileId, reqId)`: Menghapus item berkas (`deleteDoc`).

### 6.4 Modul Vendor & Termin Keuangan (`vendorService.ts`)
- `subscribeVendors(profileId, callback)`: Real-time listener (`onSnapshot`) untuk memantau seluruh dokumen vendor dan array embedded payments miliknya.
- `addVendor(profileId, vendorData)`: Menambahkan dokumen vendor baru.
- `updateVendor(profileId, vendorId, vendorData)`: Memperbarui informasi vendor atau status tahapan.
- `deleteVendor(profileId, vendorId)`: Menghapus vendor (dicegah jika `isLocked == true`).
- `addVendorPayment(profileId, vendorId, paymentData)`: Menambahkan object pembayaran baru ke array `payments` menggunakan `arrayUnion()`.
- `updateVendorPayment(profileId, vendorId, paymentId, updatedData)`: Memperbarui status pembayaran termin atau bukti bayar di dalam array `payments`.
- `deleteVendorPayment(profileId, vendorId, paymentId)`: Menghapus item termin pembayaran dari array `payments`.

### 6.5 Agregasi Data Dashboard di Sisi Klien (Pinia Store)
Dengan arsitektur Firebase, agregasi data overview dashboard tidak memerlukan endpoint backend terpisah. Pinia Store memanfaatkan data reaktif dari snapshot listener:
- **Countdown Pernikahan:** Dihitung langsung dari `weddingProfile.eventDate` dikurangi tanggal sekarang.
- **Progres Dokumen:** Total item selesai dibagi total dokumen di `requirements`.
- **Statistik Vendor:** Pengelompokan vendor berdasarkan status (`riset`, `dealing`, `terkontrak`, `selesai`).
- **Ringkasan Finansial:**
  - `totalContracted`: Akumulasi nilai `amount` dari seluruh pembayaran vendor yang berstatus `terkontrak` atau `selesai`.
  - `totalPaid`: Akumulasi nominal `amount` pada pembayaran dengan `status == 'paid'`.
  - `remainingDebt`: Selisih antara `totalContracted` dan `totalPaid`.

---

## 7. Kesiapan Menuju Phase 2 (Undangan Digital SaaS)

Modul Phase 2 menghadirkan undangan digital web interaktif dengan subdomain mandiri untuk calon pengantin.

### 7.1 Koleksi `invitations/{subdomain}`
Dokumen konfigurasi tema dan konten undangan disimpan pada koleksi root publik:
- **Path:** `invitations/{subdomain}` (Contoh: `invitations/dimas-anissa`)
- **Fields:**
  | Field | Tipe Data | Keterangan |
  |---|---|---|
  | `subdomain` | `String` | Identifier unik subdomain (misal: "dimas-anissa") |
  | `ownerId` | `String` | Relasi ke `users/{userId}` pemilik undangan |
  | `weddingProfileId` | `String` | Relasi ke dokumen `weddingProfiles/{profileId}` |
  | `themeId` | `String` | ID tema undangan (misal: "floral-classic", "minimalist-noir") |
  | `layoutConfig` | `Map` | Pengaturan layout visual, warna tema, font, dan urutan seksi |
  | `groomBio` | `Map` | Data mempelai pria (nama, panggilan, orang tua, instagram) |
  | `brideBio` | `Map` | Data mempelai wanita (nama, panggilan, orang tua, instagram) |
  | `eventSchedules` | `Array<Map>` | Daftar agenda acara (Akad/Pemberkatan, Resepsi, Alamat, Google Maps Embed) |
  | `loveStory` | `Array<Map>` | Rangkaian kisah cinta (tahun, judul, cerita) |
  | `galleryPhotos` | `Array<String>` | Kumpulan URL gambar dari Firebase Storage / Cloudflare R2 |
  | `musicBackgroundUrl`| `String \| null` | URL berkas audio latar undangan |
  | `isActive` | `Boolean` | Status publikasi undangan online |
  | `createdAt` | `Timestamp` | Waktu penerbitan |
  | `updatedAt` | `Timestamp` | Waktu pembaruan |

### 7.2 Subkoleksi Undangan:
1. **`invitations/{subdomain}/guests/{guestId}`:** Daftar tamu undangan, tautan personal (`?to=NamaTamu`), status kehadiran RSVP, dan jumlah tamu hadir.
2. **`invitations/{subdomain}/wishes/{wishId}`:** Ucapan doa dari kerabat dan konfirmasi kehadiran real-time.

### 7.3 Optimasi Dokumen Firestore 1 MiB & Media Storage:
- Dokumen Firestore memiliki batasan ukuran 1 MiB. Seluruh media biner berukuran besar (foto galeri resolusi tinggi, audio lagu, dan video latar) tidak disimpan sebagai base64, melainkan diunggah langsung ke **Firebase Storage** atau **Cloudflare R2**.
- Dokumen Firestore hanya menyimpan string URL CDN berbobot ringan, sehingga dokumen undangan tetap sangat ramping (< 50 KiB), menjaga kecepatan pemuatan halaman tetap instan.

### 7.4 Mekanisme Routing Dinamis Subdomain:
1. Pengguna membuka URL: `https://dimas-anissa.oondang.id`
2. Frontend Vue 3 mendeteksi hostname pada lifecycle inisialisasi aplikasi (`window.location.hostname`).
3. Parser URL mengekstrak slug subdomain `dimas-anissa`.
4. Jika subdomain terdeteksi dan bukan domain utama (`app.oondang.id` atau `oondang.id`), router memuat komponen tampilan undangan tamu (`PublicInvitationView.vue`).
5. Komponen langsung melakukan pembacaan dokumen `invitations/dimas-anissa` via Firebase Client SDK secara cepat.