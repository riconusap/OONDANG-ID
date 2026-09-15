# API Contract: 04. Pelacak Keuangan & Termin Pembayaran

Dokumen ini mendefinisikan spesifikasi kontrak REST API untuk modul pelacak anggaran pernikahan, agregasi ringkasan finansial, dan manajemen termin pembayaran vendor pada **oondang.id (MVP Phase 1)**.

---

## 1. Endpoint: Ringkasan Finansial Pernikahan (Agregasi)

- **Method & Path:** `GET /api/v1/finances/summary`
- **Deskripsi:** Mengambil agregasi metrik finansial terkini untuk profil catin: target anggaran, total biaya terkontrak, total kas dibayarkan, dan sisa kewajiban hutang.
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
  "message": "Ringkasan keuangan berhasil diambil.",
  "data": {
    "target_budget": 150000000,
    "total_contracted": 95000000,
    "total_paid": 25000000,
    "remaining_debt": 70000000
  }
}
```

---

## 2. Endpoint: Ubah Target Pagu Anggaran

- **Method & Path:** `PUT /api/v1/finances/target-budget`
- **Deskripsi:** Menetapkan atau memperbarui pagu maksimal anggaran pernikahan pasangan.
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
  "target_budget": 175000000
}
```

### Response Sukses (200 OK)
```json
{
  "success": true,
  "message": "Target anggaran berhasil diperbarui.",
  "data": {
    "id": "bud-01",
    "wedding_profile_id": "wed-1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
    "target_budget": 175000000,
    "notes": "Anggaran gabungan pihak pria dan wanita.",
    "updated_at": "2026-09-14T16:00:00Z"
  }
}
```

### Response Validasi Error (422 Unprocessable Entity)
```json
{
  "success": false,
  "message": "The given data was invalid.",
  "errors": {
    "target_budget": [
      "Target anggaran harus berupa angka nominal dan bernilai lebih besar dari 0."
    ]
  }
}
```

---

## 3. Endpoint: Ambil Daftar Termin Pembayaran Vendor

- **Method & Path:** `GET /api/v1/vendors/{vendor_id}/payments`
- **Deskripsi:** Mengambil riwayat dan jadwal termin pembayaran untuk vendor tertentu.
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
  "message": "Daftar pembayaran vendor berhasil diambil.",
  "data": [
    {
      "id": "pay-01",
      "vendor_id": "ven-02",
      "title": "DP 1 Booking Tanggal Gedung",
      "amount": 15000000,
      "payment_date": "2026-09-05",
      "status": "paid",
      "proof_file_url": null,
      "created_at": "2026-09-14T15:00:00Z",
      "updated_at": "2026-09-14T15:00:00Z"
    },
    {
      "id": "pay-02",
      "vendor_id": "ven-02",
      "title": "Termin 2 (50% Biaya Gedung)",
      "amount": 20000000,
      "payment_date": "2026-11-01",
      "status": "pending",
      "proof_file_url": null,
      "created_at": "2026-09-14T15:00:00Z",
      "updated_at": "2026-09-14T15:00:00Z"
    }
  ]
}
```

---

## 4. Endpoint: Catat Termin Pembayaran Baru

- **Method & Path:** `POST /api/v1/vendors/{vendor_id}/payments`
- **Deskripsi:** Menambahkan jadwal termin atau bukti pengeluaran pembayaran baru untuk suatu vendor.
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
  "title": "Pelunasan Gedung (Sisa 50%)",
  "amount": 20000000,
  "payment_date": "2026-12-01",
  "status": "pending"
}
```

### Response Sukses (201 Created)
```json
{
  "success": true,
  "message": "Termin pembayaran berhasil dicatat.",
  "data": {
    "id": "pay-03",
    "vendor_id": "ven-02",
    "title": "Pelunasan Gedung (Sisa 50%)",
    "amount": 20000000,
    "payment_date": "2026-12-01",
    "status": "pending",
    "proof_file_url": null,
    "created_at": "2026-09-14T16:05:00Z",
    "updated_at": "2026-09-14T16:05:00Z"
  }
}
```

### Response Validasi Error (422 Unprocessable Entity)
```json
{
  "success": false,
  "message": "The given data was invalid.",
  "errors": {
    "title": [
      "Keterangan termin pembayaran wajib diisi."
    ],
    "amount": [
      "Nominal pembayaran harus berupa angka positif."
    ]
  }
}
```

---

## 5. Endpoint: Perbarui Status Pembayaran Termin

- **Method & Path:** `PATCH /api/v1/payments/{id}/status`
- **Deskripsi:** Mengubah status pembayaran suatu termin menjadi `paid` (lunas) atau `pending` (menunggu).
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
  "status": "paid"
}
```

### Response Sukses (200 OK)
```json
{
  "success": true,
  "message": "Status pembayaran berhasil diubah.",
  "data": {
    "id": "pay-02",
    "vendor_id": "ven-02",
    "title": "Termin 2 (50% Biaya Gedung)",
    "amount": 20000000,
    "status": "paid",
    "updated_at": "2026-09-14T16:10:00Z"
  }
}
```

---

## 6. Endpoint: Hapus Catatan Termin Pembayaran

- **Method & Path:** `DELETE /api/v1/payments/{id}`
- **Deskripsi:** Menghapus catatan termin pembayaran dari sistem.
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
  "message": "Catatan pembayaran berhasil dihapus."
}
```
