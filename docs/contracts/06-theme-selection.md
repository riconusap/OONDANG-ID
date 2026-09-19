# 06. Theme Selection API & Firestore Contract

Dokumen ini menjelaskan struktur data dan mutasi Firestore untuk fitur pemilihan tema undangan digital di platform `oondang.id`.

## 1. Lokasi Data

Pemilihan tema disimpan secara langsung di dalam dokumen profil pengguna (koleksi `weddingProfiles`).

- **Koleksi**: `weddingProfiles`
- **Dokumen ID**: `{profileId}` (Biasanya setara dengan Firebase Auth `uid`)
- **Field Target**: `selectedThemeId`

## 2. Struktur Data (Tipe TypeScript)

### Tipe Template Tema (`ThemeTemplate`)
Data referensi template tema (saat ini statis di `src/data/templates.ts`, namun struktur ini disiapkan untuk integrasi database master ke depan jika diperlukan).

```typescript
export type ThemeCategory = 'modern' | 'rustic' | 'traditional' | 'luxury';

export interface ThemePalette {
  primary: string;
  secondary: string;
  accent: string;
}

export interface ThemeTemplate {
  id: string;              // Identifier unik tema (misal: 'rustic-floral')
  name: string;            // Nama tema yang ditampilkan ke user
  category: ThemeCategory; // Kategori filter
  description: string;     // Deskripsi singkat tema
  thumbnailUrl: string;    // URL untuk cover/thumbnail kartu
  previewUrl: string;      // URL untuk interaktif iframe mockup
  isPremium: boolean;      // Menandakan apakah tema berbayar
  tags: string[];          // Tag keywords
  defaultPalette: ThemePalette; // Skema warna utama
}
```

## 3. Payload Firestore (Update Dokumen)

Ketika pengguna memilih tema dan menyimpannya, UI akan menembak update ke dokumen Firestore.

**Action:** `updateDoc`

**Path:** `weddingProfiles/{profileId}`

**Payload yang dikirim:**

```typescript
{
  selectedThemeId: string, // Berisi id dari ThemeTemplate (misal: 'rustic-floral')
  updatedAt: FieldValue    // serverTimestamp() dari Firebase
}
```

### Keamanan (Security Rules)

Pastikan ada *rule* yang mengizinkan user yang telah terotentikasi (Auth) untuk melakukan perubahan *hanya* pada dokumen profil miliknya sendiri.

```text
match /weddingProfiles/{profileId} {
  allow read: if request.auth != null && request.auth.uid == profileId;
  allow update: if request.auth != null && request.auth.uid == profileId
                && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['selectedThemeId', 'updatedAt']);
}
```

*Catatan: Rule di atas hanya contoh pembatasan ketat untuk field ini, sesuaikan dengan aturan profil pernikahan secara keseluruhan.*
