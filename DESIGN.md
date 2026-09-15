# Design System & Direction: oondang.id

Dokumen arah desain dan identitas visual untuk platform perencanaan pernikahan oondang.id. Dokumen ini menjadi acuan antislop agar seluruh antarmuka terasa personal, hangat, fungsional, dan tidak generik.

## 1. Design Read & Dials

- **Persona & Konteks:** Aplikasi web pendamping calon pengantin (catin) Indonesia dalam menyiapkan pernikahan impian secara tenang, terstruktur, dan transparan.
- **Karakter Visual:** Warm editorial, tenang, terpercaya, dan elegan tanpa kesan berlebihan.
- **Dials (Part 3 antislop):**
  - **ENERGY 2 (Balanced):** Hangat dan ramah, tidak kaku seperti spreadsheet korporat, namun tidak bising atau mencolok seperti media sosial hiburan.
  - **RHYTHM 2 (Consistent with clear section breaks):** Modul berkas, kartu vendor, dan pelacak keuangan memiliki struktur yang konsisten dengan penekanan visual yang tegas pada aksi utama.
  - **MOTION 1 (Calm):** Transisi status halus (fade/scale ringan untuk modal dan menu), tanpa animasi mengambang atau efek memantul yang mengganggu konsentrasi input data.

---

## 2. Palet Warna (Sesuai Aturan R-29 & R-25)

Maksimal 3 warna inti + 1 warna aksen fungsional:

1. **Base / Background (`bg-sand` / `bg-canvas`):**
   - Light: `#FDFBF7` (warm alabaster / warm white lembut yang nyaman di mata, bukan putih silau `#FFFFFF` flat).
   - Card/Surface: `#FFFFFF` dengan border tipis `#EAE4DC` yang hangat.
   - Dark mode surface: `#1E1B18` dengan border `#332E29`.
2. **Text / Neutral Utama (`text-ink`):**
   - Primary Text: `#201D1A` (dark warm charcoal/slate, kontras tinggi WCAG AA 11:1 terhadap latar).
   - Secondary Text: `#5F5852` (warm muted brown/grey, kontras > 5.5:1).
   - Dark mode text: `#F7F4F0` / `#A39A92`.
3. **Primary Brand Tone (`terracotta` / `rosewood`):**
   - `#B4533C` (warm terracotta / brick rose yang elegan, melambangkan kehangatan perayaan pernikahan Nusantara).
   - Hover / Active: `#98422F`.
   - Text on Primary: `#FFFFFF` (rasio kontras 5.2:1).
4. **Functional Accent (`sage` / `olive`):**
   - `#3D6B52` (muted forest sage untuk indikator berkas selesai, status lunas, dan progres positif).
   - Alert / Pending: `#C27803` (warm amber untuk termin jatuh tempo).

*Catatan: Tidak menggunakan gradien ungu-biru default AI, tidak ada neon glow, dan tidak ada teks abu-abu pudar.*

---

## 3. Tipografi (Sesuai Aturan R-06)

- **Font Utama (Body & UI):** `Plus Jakarta Sans` / `Inter`, sans-serif modern dengan keterbacaan tinggi untuk label formulir, angka nominal, dan status berkas.
- **Heading / Display Accent:** `Plus Jakarta Sans` dengan font-weight 600-700 untuk judul modul utama agar terasa modern dan tegas.
- **Aturan:**
  - Tidak ada font monospace berukuran besar untuk judul.
  - Tidak ada teks uppercase dengan spasi berlebih (`H O W  I T  W O R K S`).

---

## 4. Bentuk & Komponen (Sesuai Aturan R-11, R-10, R-12, R-13)

- **Border Radius:** Konsisten `rounded-xl` (12px) untuk kartu modul, `rounded-lg` (8px) untuk tombol dan input formulir. Tidak ada elemen berbentuk kapsul/pill seragam yang dipaksakan.
- **Elevasi & Bayangan:** Bayangan sangat subtil (`shadow-sm` hingga `shadow-md` lembut) hanya pada kartu yang melayang atau modal dialog. Tidak ada efek mengambang di setiap elemen.
- **Glassmorphism:** Dibatasi maksimal pada navbar atas saat di-scroll untuk mempertahankan keterbacaan latar.
- **Glow & Border:** Tidak ada border menyala (glow) tanpa fungsi.

---

## 5. Tata Letak & Responsivitas Mobile (Sesuai Aturan R-03)

- **Mobile First:** Target tap minimal 44px untuk seluruh tombol dan checkbox.
- **Navigasi:** Sidebar untuk layar desktop (>= 1024px) dan Mobile Bottom Navigation bar yang ergonomis untuk layar ponsel.
- **Kerapian:** Tidak ada overflow horizontal pada resolusi 360px hingga 430px.
