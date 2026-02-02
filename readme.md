# SaaS Multi-Tenant Application

Aplikasi **SaaS Multi-Tenant** yang dirancang untuk mendukung banyak bisnis/tenant dalam satu sistem, dengan pemisahan data yang aman, fleksibel, dan scalable. Cocok untuk kebutuhan **POS, ISP, UMKM, pendidikan, dan operasional bisnis lainnya**.

---

## ✨ Fitur Utama

- 🔐 **Multi-Tenant Architecture**
  - Isolasi data per tenant
  - Dukungan multi bisnis / multi outlet

- 👥 **Role & Permission Management**
  - Menggunakan Spatie Permission
  - Role fleksibel per konteks bisnis

- 🏢 **Manajemen Bisnis & Outlet**
  - Satu user bisa memiliki banyak bisnis
  - Setiap bisnis bisa memiliki banyak outlet

- 💰 **Manajemen Transaksi & Keuangan**
  - Pencatatan transaksi (penjualan, top-up, operasional)
  - Dukungan pencatatan debit & kredit

- 📊 **Dashboard & Laporan**
  - Ringkasan transaksi
  - Monitoring performa bisnis

- 🔄 **Scalable & Modular**
  - Mudah dikembangkan untuk domain lain (POS, ISP, Edu, dll)

---

## 🧱 Arsitektur

- **Backend**: Laravel
- **Auth**: Laravel Auth + Spatie Permission
- **Database**: MySQL / PostgreSQL
- **Frontend**: Next JS
- **UI**: Tailwind CSS
- **Multi-Tenancy**: Shared Database, Tenant Scoped Data

---

## 🗂️ Konsep Multi-Tenant

Aplikasi ini menggunakan pendekatan:

- **Single Application**
- **Single Database**
- **Tenant-aware table design**

Contoh:
- `tenants`
- `businesses`
- `outlets`
- `users`
- `financial_transactions`

Semua data bisnis selalu terikat pada **tenant_id / business_id**.