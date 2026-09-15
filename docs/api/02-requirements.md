# API Contract: 02. Ceklist Persyaratan Legal Pernikahan

Dokumen ini mendefinisikan spesifikasi kontrak REST API untuk modul kelola berkas persyaratan pernikahan (KUA, Catatan Sipil, dan berkas kustom catin) pada **oondang.id (MVP Phase 1)**.

---

## 1. Endpoint: Ambil Daftar Berkas Persyaratan

- **Method & Path:** `GET /api/v1/requirements`
- **Deskripsi:** Mengambil seluruh daftar berkas persyaratan pernikahan milik profil catin yang sedang login, dengan dukungan filter status dan kategori.
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
| `status` | string | `completed` / `pending` | Filter status kelengkapan berkas |
| `category` | string | `kua` / `civil_registry` / `custom` | Filter kategori berkas |

### Response Sukses (200 OK)
```json
{
  "success": true,
  "message": "Daftar berkas berhasil diambil.",
  "data": [
    {
      "id": "req-01",
      "wedding_profile_id": "wed-1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
      "title": "Surat Pengantar Nikah dari RT / RW",
      "category": "kua",
      "is_completed": true,
      "due_date": "2026-10-01",
      "notes": "Sudah ditandatangani Ketua RT 05 dan RW 02.",
      "is_default": true,
      "created_at": "2026-09-14T15:00:00Z",
      "updated_at": "2026-09-14T15:10:00Z"
    },
    {
      "id": "req-02",
      "wedding_profile_id": "wed-1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
      "title": "Formulir N1 (Surat Pengantar Nikah Kelurahan)",
      "category": "kua",
      "is_completed": false,
      "due_date": "2026-10-15",
      "notes": "Diurus di Kantor Kelurahan domisili calon mempelai.",
      "is_default": true,
      "created_at": "2026-09-14T15:00:00Z",
      "updated_at": "2026-09-14T15:00:00Z"
    }
  ]
}
```

---

## 2. Endpoint: Toggle Status Selesai Berkas

- **Method & Path:** `PATCH /api/v1/requirements/{id}/toggle`
- **Deskripsi:** Mengubah status kelengkapan berkas antara selesai (`true`) dan belum selesai (`false`).
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
  "message": "Status berkas berhasil diubah.",
  "data": {
    "id": "req-02",
    "wedding_profile_id": "wed-1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
    "title": "Formulir N1 (Surat Pengantar Nikah Kelurahan)",
    "category": "kua",
    "is_completed": true,
    "due_date": "2026-10-15",
    "notes": "Diurus di Kantor Kelurahan domisili calon mempelai.",
    "is_default": true,
    "created_at": "2026-09-14T15:00:00Z",
    "updated_at": "2026-09-14T15:20:00Z"
  }
}
```

### Response Error Resource Tidak Ditemukan (404 Not Found)
```json
{
  "success": false,
  "message": "Berkas persyaratan tidak ditemukan atau bukan milik akun Anda."
}
```

---

## 3. Endpoint: Tambah Berkas Persyaratan Kustom

- **Method & Path:** `POST /api/v1/requirements`
- **Deskripsi:** Menambahkan dokumen persyaratan khusus catin di luar daftar resmi bawaan.
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
  "title": "Surat Izin Atasan / Instansi Pasangan",
  "category": "custom",
  "due_date": "2026-11-01",
  "notes": "Disiapkan 3 lembar fotokopi legalisir kantor."
}
```

### Response Sukses (201 Created)
```json
{
  "success": true,
  "message": "Berkas baru berhasil ditambahkan.",
  "data": {
    "id": "req-custom-12345678",
    "wedding_profile_id": "wed-1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
    "title": "Surat Izin Atasan / Instansi Pasangan",
    "category": "custom",
    "is_completed": false,
    "due_date": "2026-11-01",
    "notes": "Disiapkan 3 lembar fotokopi legalisir kantor.",
    "is_default": false,
    "created_at": "2026-09-14T15:25:00Z",
    "updated_at": "2026-09-14T15:25:00Z"
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
      "Nama berkas persyaratan wajib diisi."
    ],
    "due_date": [
      "Format tanggal batas waktu harus berupa tanggal yang valid (YYYY-MM-DD)."
    ]
  }
}
```

---

## 4. Endpoint: Hapus Berkas Persyaratan Kustom

- **Method & Path:** `DELETE /api/v1/requirements/{id}`
- **Deskripsi:** Menghapus dokumen persyaratan kustom. Dokumen bawaan resmi (`is_default = true`) dilindungi dan tidak dapat dihapus oleh pengguna.
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
  "message": "Berkas persyaratan berhasil dihapus."
}
```

### Response Error Larangan Hapus Berkas Resmi (403 Forbidden)
```json
{
  "success": false,
  "message": "Dokumen persyaratan resmi bawaan regulasi tidak dapat dihapus."
}
```
