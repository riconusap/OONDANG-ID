# API Contract: 01. Autentikasi & Profil Pernikahan Catin

Dokumen ini mendefinisikan spesifikasi kontrak REST API untuk modul registrasi, login, logout, pemeriksaan sesi, dan inisialisasi profil pernikahan catin pada **oondang.id (MVP Phase 1)**.

---

## 1. Endpoint: Registrasi Akun Pengantin

- **Method & Path:** `POST /api/v1/auth/register`
- **Deskripsi:** Mendaftarkan akun catin baru ke sistem.
- **Auth Diperlukan:** Tidak.

### Request Headers
| Key | Value |
|---|---|
| Content-Type | application/json |
| Accept | application/json |

### Request Body
```json
{
  "name": "Dimas Prasetyo",
  "email": "dimas.anissa@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

### Response Sukses (201 Created)
```json
{
  "success": true,
  "message": "Registrasi berhasil.",
  "data": {
    "user": {
      "id": "usr-9a8b7c6d-5e4f-4a3b-2c1d-0e9f8a7b6c5d",
      "email": "dimas.anissa@example.com",
      "name": "Dimas Prasetyo",
      "created_at": "2026-09-14T15:00:00Z"
    },
    "token": "1|sanctum_plain_text_token_string_here"
  }
}
```

### Response Validasi Error (422 Unprocessable Entity)
```json
{
  "success": false,
  "message": "The given data was invalid.",
  "errors": {
    "email": [
      "Alamat email sudah terdaftar dalam sistem."
    ],
    "password": [
      "Kata sandi minimal terdiri dari 8 karakter."
    ]
  }
}
```

---

## 2. Endpoint: Masuk ke Akun (Login)

- **Method & Path:** `POST /api/v1/auth/login`
- **Deskripsi:** Autentikasi akun catin dan penerbitan Bearer Token Sanctum.
- **Auth Diperlukan:** Tidak.

### Request Headers
| Key | Value |
|---|---|
| Content-Type | application/json |
| Accept | application/json |

### Request Body
```json
{
  "email": "dimas.anissa@example.com",
  "password": "password123"
}
```

### Response Sukses (200 OK)
```json
{
  "success": true,
  "message": "Login berhasil.",
  "data": {
    "user": {
      "id": "usr-9a8b7c6d-5e4f-4a3b-2c1d-0e9f8a7b6c5d",
      "email": "dimas.anissa@example.com",
      "name": "Dimas Prasetyo",
      "created_at": "2026-09-14T15:00:00Z"
    },
    "token": "2|sanctum_plain_text_token_string_here"
  }
}
```

### Response Error Autentikasi (401 Unauthorized)
```json
{
  "success": false,
  "message": "Email atau kata sandi yang Anda masukkan salah."
}
```

---

## 3. Endpoint: Periksa Sesi User & Profil (Get Current User)

- **Method & Path:** `GET /api/v1/auth/me`
- **Deskripsi:** Mengambil identitas user login beserta ringkasan profil pernikahan aktif.
- **Auth Diperlukan:** Ya (Bearer Token).

### Request Headers
| Key | Value |
|---|---|
| Content-Type | application/json |
| Authorization | Bearer {token} |
| Accept | application/json |

### Response Sukses (200 OK)
```json
{
  "success": true,
  "message": "Data user berhasil diambil.",
  "data": {
    "user": {
      "id": "usr-9a8b7c6d-5e4f-4a3b-2c1d-0e9f8a7b6c5d",
      "email": "dimas.anissa@example.com",
      "name": "Dimas Prasetyo",
      "created_at": "2026-09-14T15:00:00Z"
    },
    "profile": {
      "id": "wed-1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
      "user_id": "usr-9a8b7c6d-5e4f-4a3b-2c1d-0e9f8a7b6c5d",
      "groom_name": "Dimas Prasetyo",
      "bride_name": "Anissa Rahmawati",
      "event_date": "2026-12-20",
      "wedding_type": "muslim",
      "location_city": "Jakarta Selatan",
      "created_at": "2026-09-14T15:05:00Z"
    }
  }
}
```

---

## 4. Endpoint: Simpan / Perbarui Profil Pernikahan (Wizard)

- **Method & Path:** `POST /api/v1/wedding-profile`
- **Deskripsi:** Menyimpan profil mempelai dari Onboarding Wizard sekaligus secara otomatis melakukan *auto-seed* berkas persyaratan default (KUA untuk `muslim`, Catatan Sipil untuk `non_muslim`) dan default vendor terkunci `oondang.id`.
- **Auth Diperlukan:** Ya (Bearer Token).

### Request Headers
| Key | Value |
|---|---|
| Content-Type | application/json |
| Authorization | Bearer {token} |
| Accept | application/json |

### Request Body
```json
{
  "groom_name": "Dimas Prasetyo",
  "bride_name": "Anissa Rahmawati",
  "event_date": "2026-12-20",
  "wedding_type": "muslim",
  "location_city": "Jakarta Selatan"
}
```

### Response Sukses (200 OK / 201 Created)
```json
{
  "success": true,
  "message": "Profil pernikahan berhasil disimpan.",
  "data": {
    "id": "wed-1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
    "user_id": "usr-9a8b7c6d-5e4f-4a3b-2c1d-0e9f8a7b6c5d",
    "groom_name": "Dimas Prasetyo",
    "bride_name": "Anissa Rahmawati",
    "event_date": "2026-12-20",
    "wedding_type": "muslim",
    "location_city": "Jakarta Selatan",
    "created_at": "2026-09-14T15:05:00Z",
    "updated_at": "2026-09-14T15:05:00Z"
  }
}
```

### Response Validasi Error (422 Unprocessable Entity)
```json
{
  "success": false,
  "message": "The given data was invalid.",
  "errors": {
    "groom_name": [
      "Nama calon mempelai pria wajib diisi."
    ],
    "bride_name": [
      "Nama calon mempelai wanita wajib diisi."
    ],
    "wedding_type": [
      "Pilihan tipe pernikahan harus berupa muslim atau non_muslim."
    ],
    "event_date": [
      "Format tanggal acara harus berupa tanggal yang valid (YYYY-MM-DD)."
    ]
  }
}
```

---

## 5. Endpoint: Keluar dari Akun (Logout)

- **Method & Path:** `POST /api/v1/auth/logout`
- **Deskripsi:** Mencabut token akses aktif user saat ini dari basis data Sanctum.
- **Auth Diperlukan:** Ya (Bearer Token).

### Request Headers
| Key | Value |
|---|---|
| Content-Type | application/json |
| Authorization | Bearer {token} |
| Accept | application/json |

### Response Sukses (200 OK)
```json
{
  "success": true,
  "message": "Berhasil keluar dari akun."
}
```

---

## 6. Endpoint: Inisialisasi Onboarding & Ceklist Rekomendasi Seluruh Modul

- **Method & Path:** `POST /api/v1/onboarding/setup`
- **Deskripsi:** Inisialisasi awal profil pernikahan sekaligus mengaktifkan ceklist rekomendasi lintas modul (berkas legal, vendor acuan, dan pagu bujet) secara atomik.
- **Auth Diperlukan:** Ya (Bearer Token).

### Request Headers
| Key | Value |
|---|---|
| Content-Type | application/json |
| Authorization | Bearer {token} |
| Accept | application/json |

### Request Body
```json
{
  "groom_name": "Dimas Prasetyo",
  "bride_name": "Anissa Rahmawati",
  "wedding_type": "muslim",
  "event_date": "2026-12-20",
  "location_city": "Jakarta Selatan",
  "initial_budget": 150000000,
  "selected_recommendation_ids": [
    "rec-legal-rt",
    "rec-legal-n1",
    "rec-legal-n2",
    "rec-legal-n4",
    "rec-legal-health",
    "rec-legal-photo",
    "rec-ven-venue",
    "rec-ven-catering",
    "rec-ven-mua",
    "rec-ven-photo",
    "rec-ven-decor",
    "rec-fin-budget",
    "rec-fin-dp-venue",
    "rec-fin-emergency",
    "rec-eve-committee",
    "rec-eve-rundown"
  ]
}
```

### Response Sukses (201 Created)
```json
{
  "success": true,
  "message": "Persiapan awal pernikahan dan seluruh modul berhasil diaktifkan.",
  "data": {
    "profile": {
      "id": "wed-1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
      "user_id": "usr-9a8b7c6d-5e4f-4a3b-2c1d-0e9f8a7b6c5d",
      "groom_name": "Dimas Prasetyo",
      "bride_name": "Anissa Rahmawati",
      "event_date": "2026-12-20",
      "wedding_type": "muslim",
      "location_city": "Jakarta Selatan",
      "created_at": "2026-09-14T15:10:00Z"
    },
    "initialized_counts": {
      "requirements": 6,
      "vendors": 5,
      "budget": 150000000
    }
  }
}
```

