# Kuis Interaktif Kampus

Aplikasi kuis berbasis kiosk untuk layar sentuh kampus. Peserta dapat bermain sendiri (1 pemain) atau berduel (2 pemain) pada satu layar, dengan papan skor dan dashboard statistik untuk panitia.

## Fitur

- **Dua mode bermain**: 1 pemain, atau 2 pemain (duel) dengan pilihan tema masing-masing dan hitung mundur serentak.
- **Tiga tema**: Teknologi & AI, Pengetahuan Umum, Literasi Digital.
- **Bank 90 soal** (30 per tema). Setiap permainan mengacak 10 soal, dan urutan pilihan A-D juga diacak.
- **Papan skor**: skor, predikat, ketepatan, rata-rata waktu, jawaban tercepat, total waktu, serta rincian jawaban yang bisa dibuka per soal.
- **Panel admin** (dilindungi password): tambah, ubah, hapus soal, dan saklar **"Di kuis"** untuk memasukkan atau mengeluarkan soal dari kuis tanpa menghapusnya.
- **Dashboard** statistik peserta secara real-time (Socket.IO).
- **Kunci jawaban tidak dikirim ke kiosk**: jawaban diperiksa di server.

## Teknologi

Next.js (App Router), React, TypeScript, Tailwind CSS, Framer Motion, XState, Socket.IO, Prisma, dan SQLite.

## Prasyarat

- Node.js (gunakan versi LTS terbaru)
- npm

## Instalasi

```bash
git clone https://github.com/yeremia-ganteng/quiz-expo.git
cd quiz-expo
npm install
```

Buat file `.env` dari contoh, lalu isi password admin:

```bash
copy .env.example .env      # Windows
# cp .env.example .env      # macOS / Linux
```

```env
DATABASE_URL="file:./dev.db"
ADMIN_PASSWORD="ganti-dengan-password-admin"
```

Siapkan database dan isi soal:

```bash
npx prisma migrate deploy
npx prisma db seed
```

## Menjalankan

```bash
npm run dev
```

| Halaman | Alamat | Keterangan |
|---|---|---|
| Kiosk | `http://localhost:3000/kiosk` | Tampilan peserta |
| Admin | `http://localhost:3000/admin` | Kelola soal (perlu login) |
| Dashboard | `http://localhost:3000/dashboard` | Statistik peserta (perlu login) |

Server berjalan lewat `server.ts` (Next.js + Socket.IO), jadi gunakan script `dev` dari `package.json`, bukan `next dev` langsung.

## Mengelola soal

1. Buka `/admin` dan masuk dengan `ADMIN_PASSWORD`.
2. Gunakan saklar **Di kuis** untuk menyalakan atau mematikan soal. Soal yang dimatikan tidak muncul di kiosk.
3. Setiap tema sebaiknya punya minimal 10 soal aktif. Jika kurang, kuis tema itu menjadi lebih pendek (panel admin menampilkan peringatan).
4. Kiosk mengambil soal saat halaman dimuat, jadi refresh kiosk (`F5`) setelah mengubah soal.

> Menjalankan `npx prisma db seed` menghapus **semua** soal, data peserta, dan jawaban, lalu membuat ulang 90 soal bawaan dengan status aktif.

## Tips penggunaan kiosk

- Klik layar sekali untuk masuk mode layar penuh.
- Tekan 5 kali berturut-turut di pojok kanan bawah layar untuk mengembalikan kiosk ke halaman awal (reset darurat).

## Struktur proyek

```
app/
  kiosk/            Halaman kuis dan komponen papan skor
  admin/            Panel admin dan halaman login
  dashboard/        Dashboard statistik
  api/              Route API (soal, statistik, admin)
machines/           State machine kuis (XState)
prisma/             Skema, migrasi, dan seed.ts
lib/                Klien Socket.IO
server.ts           Server kustom (Next.js + Socket.IO)
proxy.ts            Proteksi halaman dan API admin
```

## Keamanan

- Jangan commit `.env` dan file database (`*.db`). Keduanya sudah diabaikan lewat `.gitignore`.
- Ganti `ADMIN_PASSWORD` sebelum dipakai di acara sungguhan.
- Aplikasi ini memakai server Node dan SQLite lokal, jadi tidak cocok untuk hosting serverless seperti Vercel. Jalankan di komputer kiosk atau VPS.