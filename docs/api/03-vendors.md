# API Contract: 03. Manajemen Vendor Pernikahan

Dokumen ini mendefinisikan spesifikasi kontrak REST API untuk modul kelola vendor pernikahan (riset, negosiasi dealing, kontrak, hingga vendor default sistem) pada **oondang.id (MVP Phase 1)**.

---

## 1. Endpoint: Ambil Daftar Vendor

- **Method & Path:** `GET /api/v1/vendors`
- **Deskripsi:** Mengambil seluruh daftar mitra vendor milik profil pernikahan yang sedang aktif, termasuk item vendor bawaan terkunci `oondang.id`.
- **Auth Diperlukan:** Ya (Bearer Token).

### Request Headers
| Key | Value |
|---|---|
| Content-Type | application/json |
| Authorization | Bearer {token} |
| Accept | application/json |

### Query Parameters (Opsional)
| Parameter | Tipe | Contoh | Keterangan |
|---|---|---|---|
| `status` | string | `riset` / `dealing` / `terkontrak` / `selesai` | Filter berdasarkan tahap kesepakatan vendor |
| `category` | string | `catering` / `venue` / `mua` / dll. | Filter berdasarkan kategori spesialisasi |
| `q` | string | `nusantara` | Pencarian nama vendor atau nama PIC |

### Response Sukses (200 OK)
```json
{
  "success": true,
  "message": "Daftar vendor berhasil diambil.",
  "data": [
    {
      "id": "ven-locked-01",
      "wedding_profile_id": "wed-1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
      "name": "oondang.id (Undangan Digital)",
      "category": "invitation",
      "contact_person": "Tim Support oondang.id",
      "contact_phone": "081299887766",
      "status": "terkontrak",
      "is_locked": true,
      "notes": "Undangan digital premium oondang.id (Phase 2: Segera Hadir).",
      "created_at": "2026-09-14T15:00:00Z",
      "updated_at": "2026-09-14T15:00:00Z"
    },
    {
      "id": "ven-02",
      "wedding_profile_id": "wed-1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
      "name": "Sasana Kriya Grand Ballroom",
      "category": "venue",
      "contact_person": "Ibu Ratna",
      "contact_phone": "081311223344",
      "status": "terkontrak",
      "is_locked": false,
      "notes": "Paket Gedung siang hari 4 jam + fasilitas AC dan listrik 10.000 watt.",
      "created_at": "2026-09-14T15:02:00Z",
      "updated_at": "2026-09-14T15:10:00Z"
    }
  ]
}
```

---

## 2. Endpoint: Tambah Mitra Vendor Baru

- **Method & Path:** `POST /api/v1/vendors`
- **Deskripsi:** Menambahkan catatan vendor baru ke dalam perencanaan catin.
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
  "name": "Dapur Nusantara Catering",
  "category": "catering",
  "contact_person": "Pak Hendro",
  "contact_phone": "081822334455",
  "status": "dealing",
  "notes": "Menu 800 porsi buffet + 4 stall makanan pondokan."
}
```

### Response Sukses (201 Created)
```json
{
  "success": true,
  "message": "Vendor baru berhasil ditambahkan.",
  "data": {
    "id": "ven-03",
    "wedding_profile_id": "wed-1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
    "name": "Dapur Nusantara Catering",
    "category": "catering",
    "contact_person": "Pak Hendro",
    "contact_phone": "081822334455",
    "status": "dealing",
    "is_locked": false,
    "notes": "Menu 800 porsi buffet + 4 stall makanan pondokan.",
    "created_at": "2026-09-14T15:30:00Z",
    "updated_at": "2026-09-14T15:30:00Z"
  }
}
```

### Response Validasi Error (422 Unprocessable Entity)
```json
{
  "success": false,
  "message": "The given data was invalid.",
  "errors": {
    "name": [
      "Nama vendor atau perusahaan wajib diisi."
    ],
    "category": [
      "Kategori layanan vendor tidak valid."
    ],
    "status": [
      "Status awal vendor harus berupa riset, dealing, terkontrak, atau selesai."
    ]
  }
}
```

---

## 3. Endpoint: Perbarui Data Vendor (Edit)

- **Method & Path:** `PUT /api/v1/vendors/{id}`
- **Deskripsi:** Memperbarui data informasi detail, PIC, atau catatan paket vendor.
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
  "name": "Dapur Nusantara Catering Premium",
  "category": "catering",
  "contact_person": "Pak Hendro (Owner)",
  "contact_phone": "081822334455",
  "status": "terkontrak",
  "notes": "Deal paket 800 pax + bonus es krim dan kambing guling 2 ekor."
}
```

### Response Sukses (200 OK)
```json
{
  "success": true,
  "message": "Data vendor berhasil diperbarui.",
  "data": {
    "id": "ven-03",
    "wedding_profile_id": "wed-1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
    "name": "Dapur Nusantara Catering Premium",
    "category": "catering",
    "contact_person": "Pak Hendro (Owner)",
    "contact_phone": "081822334455",
    "status": "terkontrak",
    "is_locked": false,
    "notes": "Deal paket 800 pax + bonus es krim dan kambing guling 2 ekor.",
    "created_at": "2026-09-14T15:30:00Z",
    "updated_at": "2026-09-14T15:35:00Z"
  }
}
```

### Response Error Vendor Terkunci (403 Forbidden)
```json
{
  "success": false,
  "message": "Vendor bawaan sistem oondang.id dilindungi dan tidak dapat dimodifikasi."
}
```

---

## 4. Endpoint: Perbarui Status Vendor (Quick Status Transition)

- **Method & Path:** `PATCH /api/v1/vendors/{id}/status`
- **Deskripsi:** Mengubah status kesepakatan vendor secara cepat.
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
  "status": "terkontrak"
}
```

### Response Sukses (200 OK)
```json
{
  "success": true,
  "message": "Status vendor berhasil diperbarui.",
  "data": {
    "id": "ven-03",
    "wedding_profile_id": "wed-1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
    "name": "Dapur Nusantara Catering Premium",
    "category": "catering",
    "status": "terkontrak",
    "updated_at": "2026-09-14T15:40:00Z"
  }
}
```

---

## 5. Endpoint: Hapus Vendor

- **Method & Path:** `DELETE /api/v1/vendors/{id}`
- **Deskripsi:** Menghapus data vendor dari daftar perencanaan. Vendor bawaan sistem (`is_locked = true`) memiliki guard pencegah penghapusan.
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
  "message": "Vendor berhasil dihapus dari daftar."
}
```

### Response Error Guard Vendor Terkunci (403 Forbidden)
```json
{
  "success": false,
  "message": "Vendor default oondang.id tidak dapat dihapus."
}
```
