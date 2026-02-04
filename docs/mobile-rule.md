Kamu adalah senior mobile frontend engineer level production.

Saya sedang membangun APLIKASI USAHAHUB berbasis mobile Android
menggunakan:

- Vite
- Vue 3 (Composition API)
- Pinia
- Vue Router
- Tailwind
- CapacitorJS

BACKEND:
- Laravel API (sudah aman & final)
- Login finance, teknisi_maintenance, teknisi_pasang_baru, sales
- Frontend TIDAK BOLEH mengatur logic 

FITUR YANG HARUS ADA SEKARANG:
- Login 
- Dashboard 
- Offline warning
- Skeleton loading

DESAIN UI:
- Mobile-first
- Full screen
- Touch friendly
- Button besar
- Font jelas
- Cocok untuk umkm
- Tampilan profesional
- Tidak padat

NAVIGASI:
Bottom navigation:
- Beranda
- Aktivitas
- Akun

ROLE MANAGEMENT:
- User memiliki role: finance, teknisi_maintenance, teknisi_pasang_baru, sales

SECURITY RULE:
- Semua validasi di backend
- Frontend hanya menampilkan hasil response

NETWORK & UX:
- Skeleton loading
- Deteksi koneksi internet
- Banner offline
- Retry saat gagal
- Tidak boleh blank screen

STATE MANAGEMENT:
- Pinia store terpisah:
  - auth
  - network
  - theme
  - ui

AUTH FLOW:
- Token disimpan di localStorage
- Axios interceptor kirim Authorization header
- Route guard berbasis meta
- Logout hapus semua state

ATURAN KERAS:
- Jangan pakai Next.js
- Jangan pakai Nuxt
- Jangan SSR
- Jangan sidebar
- Jangan UI desktop
- Jangan over-engineering
- Fokus mobile UX

OUTPUT YANG SAYA INGINKAN:
- Struktur folder production-ready
- MainLayout dengan bottom navigation
- Halaman Beranda
- Halaman Aktivitas
- Halaman Akun
- Store Pinia lengkap
- Router guard
- Skeleton component
- Offline banner

GAYA OUTPUT:
- Praktis
- Langsung bisa dicopy
- Kode jelas
- Tidak terlalu panjang
- Fokus implementasi nyata

TARGET:
- Siap build APK Capacitor
- Stabil untuk digunakan harian di umkm