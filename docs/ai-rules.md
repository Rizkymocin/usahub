## Architecture Rules

- Project menggunakan Laravel 10+
- Menggunakan pendekatan:
  - Controller → Request → Service → Repository → Model
- Controller TIDAK boleh:
  - Mengandung query database
  - Mengandung logika bisnis kompleks
- Semua logika bisnis HARUS berada di Service
- Semua response API menggunakan JSON standar

## Database Rules

- Gunakan repository untuk mengakses data (opsional)
- Gunakan service untuk mengakses data (opsional)

## Folder Structure Rules

- app/
  - Http/
    - Controllers/
    - Requests/
  - Services/
  - Repositories/
  - Policies/
  - Traits/
- Model hanya berada di app/Models
- Tidak boleh membuat folder baru tanpa alasan arsitektural

## API Rules

- Semua endpoint harus menggunakan RESTful API
- Semua endpoint harus menggunakan JSON standard
- Semua endpoint harus menggunakan token authentication
- Semua endpoint harus menggunakan tenant_id dan business_id
- Semua endpoint harus menggunakan tenant_id dan business_id
- Semua endpoint harus menggunakan tenant_id dan business_id

## Naming Convention

- Controller:
  - Singular
  - Contoh: UserController, InvoiceController

- Service:
  - {Domain}Service
  - Contoh: InvoiceService

- Repository:
  - {Domain}Repository
  - Contoh: InvoiceRepository

## Controller Rules

- Maksimal 7–10 baris logika
- Hanya boleh:
  - Menerima Request
  - Memanggil Service
  - Mengembalikan Response
- Tidak boleh:
  - Query DB
  - Validasi manual
  - Perhitungan bisnis

## Service & Action Rules

- Service:
  - Berisi logika bisnis utama
  - Boleh memanggil banyak Action

- Action:
  - Satu tugas spesifik
  - Tidak lebih dari 1 use-case

- Action HARUS:
  - Stateless
  - Mudah dites

## Model Rules

- Model hanya berisi:
  - Relasi
  - Scope
  - Attribute casting
- Tidak boleh:
  - Logika bisnis berat
  - Query kompleks lintas domain

## API Response Rules

- Semua response HARUS menggunakan format:

{
  "success": true,
  "message": "string",
  "data": {}
}

- Error response:

{
  "success": false,
  "message": "string",
  "errors": {}
}

## Security Rules

- Semua input harus divalidasi
- Semua output harus di-sanitize
- Gunakan prepared statements untuk query
- Jangan pernah menyimpan password dalam bentuk plain text
- Gunakan bcrypt untuk hashing password
- Gunakan HTTPS
- Gunakan token authentication
- Gunakan tenant_id dan business_id untuk memfilter data
- Gunakan tenant_id dan business_id untuk memfilter data
- Gunakan tenant_id dan business_id untuk memfilter data

## Seeder Rules

- Seeder data master HARUS menggunakan DB::table() atau Model::insert()
- Tidak boleh menggunakan Model::create()
- Seeder tidak boleh memicu event, observer, atau mutator