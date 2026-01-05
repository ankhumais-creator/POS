# 🏪 POS Kasir - Modern Point of Sale System

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-2.0-3ECF8E?logo=supabase)

**Aplikasi Point of Sale Modern dengan Offline-First Architecture & PWA Support**

[Demo](#) · [Documentation](#) · [Report Bug](https://github.com/ankhumais-creator/POS/issues) · [Request Feature](https://github.com/ankhumais-creator/POS/issues)

</div>

---

## 📖 Tentang Proyek

**POS Kasir** adalah aplikasi Point of Sale berbasis web yang dirancang khusus untuk bisnis retail, cafe, restoran, dan toko kelontong di Indonesia. Dibangun dengan teknologi modern dan mengusung konsep **Offline-First**, memastikan bisnis Anda tetap berjalan lancar bahkan tanpa koneksi internet.

### ✨ Kenapa POS Kasir?

- 🚀 **Super Cepat** - Built with React 19 & Vite for blazing fast performance
- 📱 **Mobile-First** - Responsive design yang sempurna di semua perangkat
- 🔒 **Secure** - Row Level Security (RLS) dengan Supabase
- 💾 **Offline-First** - Tetap berfungsi tanpa internet, auto-sync saat online
- 🎨 **4 Tema Filosofis** - Pilihan tema elegan dengan makna mendalam
- 📊 **Analytics** - Dashboard interaktif dengan grafik real-time
- 📤 **Export** - Export laporan ke Excel & PDF

---

## 🎯 Fitur Lengkap

### 💰 Point of Sale (Kasir)
- ✅ Interface kasir intuitif dan cepat
- ✅ Barcode scanner support (keyboard & dedicated scanner)
- ✅ Keranjang belanja dinamis dengan quantity controls
- ✅ Multiple payment methods (Cash, QRIS, Transfer, Debit/Credit)
- ✅ Live price calculation dengan diskon
- ✅ Print receipt (thermal printer 58mm/80mm)
- ✅ Hold & resume transactions
- ✅ Customer selection & loyalty tracking
- ✅ Mobile-optimized dengan tab navigation

### 📦 Manajemen Produk
- ✅ CRUD produk lengkap
- ✅ Categories dengan visual color coding
- ✅ Barcode generation & scanning
- ✅ Product images
- ✅ Price & stock management
- ✅ Low stock alerts
- ✅ Bulk import via Excel

### 📊 Inventory & Stock
- ✅ Real-time stock tracking
- ✅ Stock opname (physical count)
- ✅ Stock adjustment history (In/Out/Opname)
- ✅ Stock alerts & notifications
- ✅ Automatic stock deduction on sales

### 💳 Discount & Promotions
- ✅ Coupon code management
- ✅ Fixed amount & percentage discounts
- ✅ Validity period (start/end date)
- ✅ Usage limits
- ✅ Apply to entire transaction or specific items

### 👥 Customer Management
- ✅ Customer database
- ✅ Purchase history
- ✅ Loyalty points (optional)
- ✅ Contact information

### 📈 Reports & Analytics
- ✅ Sales dashboard dengan grafik interaktif
- ✅ Daily/Weekly/Monthly reports
- ✅ Top-selling products
- ✅ Revenue trends
- ✅ **Export to Excel** (Multi-sheet dengan summary)
- ✅ **Export to CSV** (Compatible dengan semua spreadsheet)
- ✅ **Export receipt to PDF**

### 🔐 User Management
- ✅ Multi-level authentication (Admin, Cashier, Owner)
- ✅ Row Level Security (RLS)
- ✅ Activity logging & audit trail
- ✅ Shift management (open/close shift)
- ✅ Cash reconciliation

### 🎨 Themes & Customization
**4 Tema Filosofis:**

1. **🌌 Midnight Void** (Default)
   - *Filosofi:* "Kepercayaan, teknologi, dan kedalaman samudra malam"
   - Deep indigo dengan aksen futuristik

2. **🏳️ Porcelain White**
   - *Filosofi:* "Kenyamanan visual, kejernihan, dan efisiensi kerja"
   - Clean light theme untuk visibilitas maksimal

3. **🍃 Aurora Zen**
   - *Filosofi:* "Keseimbangan alam, pertumbuhan, dan ketenangan abadi"
   - Emerald green untuk brand natural/organic

4. **👑 Royal Velvet**
   - *Filosofi:* "Kemewahan, kreativitas tanpa batas, dan prestige"
   - Purple luxury untuk brand premium

### 📱 PWA Features
- ✅ Install to home screen (Android & iOS)
- ✅ Offline functionality
- ✅ Push notifications (coming soon)
- ✅ Background sync
- ✅ App-like experience

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** [React 19](https://react.dev/) - Latest React with concurrent features
- **Build Tool:** [Vite 7](https://vitejs.dev/) - Next generation frontend tooling
- **Language:** [TypeScript 5.9](https://www.typescriptlang.org/) - Type-safe development
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/) - Utility-first CSS
- **Routing:** [React Router 7](https://reactrouter.com/) - Client-side routing

### State & Data
- **State Management:** [Zustand](https://github.com/pmndrs/zustand) - Lightweight & flexible
- **Local Database:** [Dexie.js](https://dexie.org/) - IndexedDB wrapper
- **Server State:** [TanStack Query](https://tanstack.com/query) - Powerful async state management
- **Backend:** [Supabase](https://supabase.com/) - PostgreSQL + Auth + Storage

### UI & Components
- **Icons:** [Lucide React](https://lucide.dev/) - Beautiful & consistent icons
- **Charts:** [Recharts](https://recharts.org/) - Composable charting library
- **PDF:** [@react-pdf/renderer](https://react-pdf.org/) - PDF generation
- **Excel:** [xlsx](https://sheetjs.com/) - Excel reading & writing

### Development & Testing
- **Testing:** [Playwright](https://playwright.dev/) - E2E testing framework
- **Linting:** [ESLint 9](https://eslint.org/) - Code quality
- **Type Checking:** TypeScript strict mode
- **PWA:** [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) - PWA integration

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** >= 18.0.0
- **npm** or **yarn** or **pnpm**
- **Supabase account** (free tier available)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ankhumais-creator/POS.git
   cd POS
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. **Database setup**
   - Create a new project in [Supabase](https://supabase.com)
   - Run migrations from `supabase/migrations/` in Supabase SQL Editor:
     - `20260104000000_initial_schema.sql` - Database tables
     - `20260104000001_rls_policies.sql` - Security policies
     - `20260104000002_functions.sql` - Database functions

5. **Run development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173)

6. **Default login**
   ```
   Username: admin
   Password: admin
   ```
   ⚠️ **Change this immediately in production!**

---

## 📦 Build & Deploy

### Build for Production
```bash
npm run build
```
Output will be in `dist/` folder.

### Preview Production Build
```bash
npm run preview
```

### Deploy to Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ankhumais-creator/POS)

1. Import your GitHub repository to Vercel
2. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy! 🚀

### Deploy to Netlify
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/ankhumais-creator/POS)

---

## 🧪 Testing

### Run E2E Tests
```bash
npm run test:e2e
```

### Run Tests with UI
```bash
npm run test:e2e:ui
```

### Test Coverage
- ✅ Authentication flow
- ✅ POS transaction flow
- ✅ Product CRUD operations
- ✅ Stock management
- ✅ Report generation

---

## 📱 Mobile App (PWA Install)

### Android
1. Open app in **Chrome**
2. Tap **Menu** (3 dots) → **Add to Home Screen**
3. Icon will appear on home screen
4. Launch like a native app!

### iOS
1. Open app in **Safari**
2. Tap **Share** button
3. Select **Add to Home Screen**
4. App will work offline!

---

## 📚 Documentation

### Project Structure
```
drifting-exoplanet/
├── public/                 # Static assets (icons, manifest)
├── src/
│   ├── components/         # Reusable components
│   │   ├── layout/        # Layout components (Sidebar, Header)
│   │   └── pos/           # POS-specific components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities & helpers
│   │   ├── db.ts          # Dexie database setup
│   │   ├── supabase.ts    # Supabase client
│   │   ├── sync.ts        # Offline sync logic
│   │   ├── export.ts      # Excel/CSV/PDF export
│   │   └── utils.ts       # General utilities
│   ├── pages/             # Page components (routes)
│   ├── stores/            # Zustand stores
│   │   ├── authStore.ts   # Authentication
│   │   ├── cartStore.ts   # Shopping cart
│   │   ├── settingsStore.ts
│   │   └── themeStore.ts  # Theme management
│   ├── types/             # TypeScript type definitions
│   ├── App.tsx            # Main app component
│   └── main.tsx           # App entry point
├── supabase/              # Supabase config & migrations
├── e2e/                   # Playwright E2E tests
└── vite.config.ts         # Vite configuration
```

### Key Concepts

#### Offline-First Architecture
Data flows:
```
User Action → IndexedDB (Local) → Sync Queue → Supabase (Cloud)
              ↓
         Instant UI Update
```
When online: Changes sync immediately to Supabase
When offline: Changes queued locally, auto-sync when reconnected

#### State Management
- **Zustand** for global state (auth, cart, settings)
- **TanStack Query** for server state (products, transactions)
- **Dexie** for persistent local state

---

## 🎨 Customization

### Change Brand Colors
Edit `src/index.css`:
```css
:root {
  --primary: #6366F1;      /* Main brand color */
  --background: #0B1120;   /* Background color */
  --surface: #1E293B;      /* Card/surface color */
}
```

### Add New Theme
1. Edit `src/stores/themeStore.ts`:
   ```typescript
   export const themes = [
     // ... existing themes
     {
       id: 'my-theme' as ThemeType,
       name: 'My Custom Theme',
       description: 'Description here',
       primary: '#COLOR',
       background: '#COLOR'
     }
   ]
   ```

2. Add CSS in `src/index.css`:
   ```css
   html.theme-my-theme {
     --primary: #COLOR;
     --background: #COLOR;
     /* ... other variables */
   }
   ```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript strict mode
- Write E2E tests for new features
- Update documentation
- Follow existing code style

---

## 🐛 Known Issues & Roadmap

### Known Issues
- [ ] Barcode scanner may not work on some browsers (use manual input)
- [ ] PWA install prompt doesn't show on iOS Safari (manual install required)

### Roadmap
- [ ] Multi-store support
- [ ] WhatsApp order integration
- [ ] Kitchen display system (KDS)
- [ ] Customer-facing display
- [ ] Advanced analytics (ML-powered predictions)
- [ ] Multi-language support
- [ ] Dark mode toggle in UI
- [ ] Loyalty points system
- [ ] Integration with payment gateways

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Ankhumais Creator**
- GitHub: [@ankhumais-creator](https://github.com/ankhumais-creator)
- Repository: [POS](https://github.com/ankhumais-creator/POS)

---

## 🙏 Acknowledgments

- [React Team](https://react.dev) for the amazing framework
- [Supabase](https://supabase.com) for the backend infrastructure
- [Tailwind CSS](https://tailwindcss.com) for the utility-first CSS
- [Lucide](https://lucide.dev) for beautiful icons
- All open-source contributors

---

## 💬 Support

Jika Anda memiliki pertanyaan atau butuh bantuan:

- 📧 Create an issue: [GitHub Issues](https://github.com/ankhumais-creator/POS/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/ankhumais-creator/POS/discussions)

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ in Indonesia 🇮🇩

</div>
