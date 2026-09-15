# API Contract: 05. Executive Dashboard Overview

Dokumen ini mendefinisikan spesifikasi kontrak REST API untuk agregasi tunggal data ringkasan dashboard eksekutif pada **oondang.id (MVP Phase 1)**.

---

## 1. Endpoint: Ambil Ringkasan Dashboard (Single Aggregation Endpoint)

- **Method & Path:** `GET /api/v1/dashboard/overview`
- **Deskripsi:** Mengambil seluruh data agregasi terpusat untuk memuat halaman utama (Home Dashboard) dalam satu pemanggilan API yang efisien, mencakup profil acara, hitung mundur hari H, ringkasan berkas persyaratan legal, ringkasan progres vendor, dan agregasi finansial.
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
  "message": "Data dashboard berhasil diambil.",
  "data": {
    "profile": {
      "id": "wed-1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
      "user_id": "usr-9a8b7c6d-5e4f-4a3b-2c1d-0e9f8a7b6c5d",
      "groom_name": "Dimas Prasetyo",
      "bride_name": "Anissa Rahmawati",
      "event_date": "2026-12-20",
      "wedding_type": "muslim",
      "location_city": "Jakarta Selatan",
      "created_at": "2026-09-14T15:00:00Z"
    },
    "days_remaining": 97,
    "requirements_summary": {
      "total": 6,
      "completed": 3,
      "percentage": 50
    },
    "vendors_summary": {
      "total": 4,
      "contracted": 2,
      "in_discussion": 2
    },
    "financial_summary": {
      "target_budget": 160000000,
      "total_contracted": 95000000,
      "total_paid": 37000000,
      "remaining_debt": 58000000
    }
  }
}
```

### Penjelasan Struktur Data Response:
1. **`profile`:**
   - Menyediakan identitas pasangan, target tanggal akad/resepsi, tipe pernikahan (`muslim` untuk KUA atau `non_muslim` untuk Catatan Sipil), dan kota lokasi acara.
2. **`days_remaining`:**
   - Angka bilangan bulat positif yang mengindikasikan selisih hari antara tanggal hari ini dengan `event_date`. Jika tanggal sudah lewat, bernilai `0`.
3. **`requirements_summary`:**
   - Agregasi dari tabel `requirement_items` milik catin:
     - `total`: Total seluruh berkas (bawaan resmi + kustom).
     - `completed`: Jumlah berkas berstatus `is_completed = true`.
     - `percentage`: Pembulatan persentase kelengkapan `(completed / total) * 100`.
4. **`vendors_summary`:**
   - Agregasi dari tabel `vendors` milik catin:
     - `total`: Total mitra vendor terdaftar.
     - `contracted`: Jumlah vendor berstatus `terkontrak`.
     - `in_discussion`: Jumlah vendor yang masih berstatus `dealing` atau `riset`.
5. **`financial_summary`:**
   - Agregasi dari tabel `wedding_budgets` dan `vendor_payments`:
     - `target_budget`: Pagu pagu anggaran catin.
     - `total_contracted`: Estimasi total biaya komitmen kontrak vendor aktif.
     - `total_paid`: Total kas keluar yang sudah berstatus `paid`.
     - `remaining_debt`: Sisa kewajiban pembayaran yang belum diselesaikan (`total_contracted - total_paid`).

---

## 2. Response Error Autentikasi (401 Unauthorized)
```json
{
  "success": false,
  "message": "Sesi autentikasi telah kedaluwarsa. Silakan masuk kembali."
}
```
