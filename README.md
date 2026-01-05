# POS Kasir (Point of Sales System)

Aplikasi Kasir Modern berbasis Web yang dibangun dengan teknologi terkini untuk membantu pengelolaan bisnis retail, cafe, atau toko kelontong. Aplikasi ini mengusung konsep **Offline-First**, memungkinkan transaksi tetap berjalan lancar tanpa koneksi internet dan otomatis melakukan sinkronisasi saat kembali online.

## 🚀 Fitur Utama

- **Offline-First Architecture**: Menggunakan IndexedDB (Dexie.js) untuk penyimpanan lokal, memastikan aplikasi tetap cepat dan responsif meski tanpa internet.
- **Cloud Sync**: Sinkronisasi data otomatis dua arah ke Supabase (PostgreSQL) saat online.
- **Point of Sales (Kasir)**:
    - Interface kasir yang intuitif dan cepat.
    - Support barcode scanner.
    - Keranjang belanja dinamis.
    - Berbagai metode pembayaran (Tunai, QRIS, Transfer).
    - Cetak struk (Receipt).
- **Manajemen Produk**: CRUD produk lengkap dengan kategori, barcode, harga, dan stok.
- **Manajemen Stok**:
    - Stok opname.
    - Riwayat penyesuaian stok (Masuk/Keluar/Opname).
    - Notifikasi stok menipis.
- **Manajemen Kategori**: Pengelompokan produk dengan warna visual.
- **Laporan & Analitik**:
    - Dashboard ringkasan penjualan harian.
    - Grafik tren penjualan.
    - Laporan detail transaksi.
    - Export laporan ke Excel/PDF.
- **Manajemen Shift**: Buka dan tutup shift kasir dengan perhitungan uang kas (Cash Reconciliation).
- **Diskon & Promosi**: Manajemen kode diskon (Fixed/Percentage).
- **Pelanggan**: Database pelanggan dan riwayat belanja.
- **Activity Log**: Audit trail untuk memantau semua aktivitas pengguna.
- **Responsive Design**: Tampilan yang optimal di Desktop, Tablet, dan Mobile (dilengkapi dengan Mobile Drawer Navigation).
- **Multilevel User**: Role-based access (Admin, Kasir, Owner) dengan Row Level Security (RLS).

## 🛠️ Teknologi yang Digunakan

- **Frontend**: [React 18](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Local Database**: [Dexie.js](https://dexie.org/) (IndexedDB wrapper)
- **Backend / Cloud Database**: [Supabase](https://supabase.com/) (PostgreSQL + Auth)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **PDF/Excel**: @react-pdf/renderer, xlsx

## 🏁 Memulai (Getting Started)

### Prasyarat
- Node.js (v18 atau lebih baru)
- NPM atau Yarn

### Instalasi

1. **Clone repository**
   ```bash
   git clone https://github.com/ankhumais-creator/POS.git
   cd POS
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variables**
   Salin file `.env.example` menjadi `.env.local` dan isi kredensial Supabase Anda.
   ```bash
   cp .env.example .env.local
   ```
   Isi variable berikut di `.env.local`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

### Menjalankan Aplikasi

1. **Mode Development**
   ```bash
   npm run dev
   ```
   Akses di `http://localhost:5173` (atau port yang tertera diconsole).

2. **Build Production**
   ```bash
   npm run build
   ```

## 🗄️ Database & Deployment

### Supabase Setup
Proyek ini membutuhkan database Supabase yang terkonfigurasi. File migrasi database tersedia di folder `supabase/migrations/`.

1. Buat project baru di Supabase.
2. Jalankan script SQL yang ada di `supabase/migrations/20260104000000_initial_schema.sql` di SQL Editor Supabase.
3. Jalankan script kebijakan keamanan (RLS) di `supabase/migrations/20260104000001_rls_policies.sql`.

### Deployment ke Vercel
Aplikasi ini dioptimalkan untuk dideploy ke [Vercel](https://vercel.com/).

1. Import repository ke Vercel.
2. Di pengaturan proyek Vercel, tambahkan **Environment Variables** (`VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`).
3. Deploy!

## 📱 Fitur PWA (Progressive Web App)
Aplikasi ini dikonfigurasi sebagai PWA (via `vite-plugin-pwa`), sehingga dapat diinstal di perangkat pengguna layaknya aplikasi native dan mendukung kemampuan offline.

---

Dibuat dengan ❤️ oleh [Your Name/Team]
