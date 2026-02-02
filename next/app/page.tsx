"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2, LayoutDashboard, LineChart, Receipt, Store, Users, Zap } from "lucide-react"

export default function LandingPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    useEffect(() => {
        // Check if user is logged in
        const storage = localStorage.getItem("auth-storage")
        if (storage) {
            try {
                const parsed = JSON.parse(storage)
                if (parsed.state?.token) {
                    setIsAuthenticated(true)
                }
            } catch (e) {
                console.error("Failed to parse auth storage", e)
            }
        }
        setIsLoading(false)
    }, [router])

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="border-b bg-white/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <Store className="h-8 w-8 text-blue-600" />
                            <span className="ml-2 text-xl font-bold text-gray-900">UsaHub</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            {isAuthenticated ? (
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white" asChild>
                                    <Link href="/dashboard">
                                        Ke Dashboard
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Button variant="ghost" className="text-gray-600 hover:text-gray-900" asChild>
                                        <Link href="/auth/login">
                                            Masuk
                                        </Link>
                                    </Button>
                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white" asChild>
                                        <Link href="/auth/register">
                                            Daftar Sekarang
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-20 pb-32 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                        <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
                            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl">
                                <span className="block">Kelola Bisnis Anda</span>
                                <span className="block text-blue-600">dengan Tenang dan Nyaman</span>
                            </h1>
                            <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                                UsaHub menyediakan platform yang kamu butuhkan untuk UMKM. Lacak penjualan, kelola stok, dan analisis pertumbuhan semuanya di satu tempat.
                            </p>
                            <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                                <div className="space-y-4 sm:space-y-0 sm:flex sm:space-x-4">
                                    <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg" asChild>
                                        <Link href="/auth/register">
                                            Mulai Sekarang
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </Link>
                                    </Button>
                                    <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 py-3 text-lg" asChild>
                                        <Link href="#features">
                                            Lihat Demo
                                        </Link>
                                    </Button>
                                </div>
                                <p className="mt-3 text-sm text-gray-500">
                                    Gratis · Tanpa Kartu Kredit · Berhenti Kapan Saja
                                </p>
                            </div>
                        </div>
                        <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
                            <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md">
                                <div className="relative block w-full bg-white rounded-lg overflow-hidden">
                                    <img
                                        src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                        alt="Dashboard Preview"
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Fitur</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            Semua yang kamu butuhkan untuk menjalankan bisnismu
                        </p>
                        <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
                            Mulai dari manajemen inventaris hingga penjadwalan staf, UsaHub menangani kompleksitas sehingga kamu dapat fokus pada pertumbuhan.
                        </p>
                    </div>

                    <div className="mt-20">
                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {[
                                {
                                    name: 'Analitik Real-time',
                                    description: 'Lacak penjualan, pendapatan, dan pertumbuhan pelanggan secara real-time dengan dashboard live kami.',
                                    icon: LineChart,
                                },
                                {
                                    name: 'Dukungan Multi-Store',
                                    description: 'Kelola beberapa lokasi dari satu akun. Sempurna untuk franchise yang berkembang.',
                                    icon: Store,
                                },
                                {
                                    name: 'Manajemen Staf',
                                    description: 'Jadwalkan shift, lacak kinerja, dan kelola akses peran dengan mudah.',
                                    icon: Users,
                                },
                            ].map((feature) => (
                                <div key={feature.name} className="pt-6">
                                    <div className="flow-root bg-white rounded-lg px-6 pb-8">
                                        <div className="-mt-6">
                                            <div>
                                                <span className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-md shadow-lg">
                                                    <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                                                </span>
                                            </div>
                                            <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">{feature.name}</h3>
                                            <p className="mt-5 text-base text-gray-500">{feature.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Harga</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            Pilih paket yang tepat untukmu
                        </p>
                        <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
                            Harga yang sederhana dan transparan yang berkembang seiring bisnismu.
                        </p>
                    </div>

                    <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {/* Free Plan */}
                        <div className="flex flex-col p-8 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-shadow">
                            <h3 className="text-xl font-semibold text-gray-900">Gratis</h3>
                            <p className="mt-4 flex items-baseline text-gray-900">
                                <span className="text-5xl font-extrabold tracking-tight">Rp 0</span>
                                <span className="ml-1 text-xl font-semibold text-gray-500">/bulan</span>
                            </p>
                            <p className="mt-6 text-gray-500">Sempurna untuk bisnis kecil yang baru memulai.</p>
                            <ul role="list" className="mt-6 space-y-4 flex-1">
                                <li className="flex text-gray-500">
                                    <CheckCircle2 className="flex-shrink-0 w-6 h-6 text-green-500 mr-2" />
                                    Max 1 UMKM
                                </li>
                                <li className="flex text-gray-500">
                                    <CheckCircle2 className="flex-shrink-0 w-6 h-6 text-green-500 mr-2" />
                                    Max 2 User
                                </li>
                                <li className="flex text-gray-500">
                                    <CheckCircle2 className="flex-shrink-0 w-6 h-6 text-green-500 mr-2" />
                                    Analitik Dasar
                                </li>
                            </ul>
                            <Button className="w-full bg-blue-50 text-blue-700 hover:bg-blue-100" asChild>
                                <Link href="/auth/register?plan=free" className="mt-8">
                                    Mulai Sekarang
                                </Link>
                            </Button>
                        </div>

                        {/* Starter Plan */}
                        <div className="flex flex-col p-8 bg-white border border-blue-200 rounded-2xl shadow-lg ring-1 ring-blue-500 relative">
                            <div className="absolute top-0 right-0 -mr-1 -mt-1 w-32 rounded-bl-xl rounded-tr-xl bg-blue-600 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                                Popular
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900">Perintis</h3>
                            <p className="mt-4 flex items-baseline text-gray-900">
                                <span className="text-5xl font-extrabold tracking-tight">Rp. 99k</span>
                                <span className="ml-1 text-xl font-semibold text-gray-500">/bulan</span>
                            </p>
                            <p className="mt-6 text-gray-500">Untuk bisnis yang sedang berkembang dengan beberapa staf.</p>
                            <ul role="list" className="mt-6 space-y-4 flex-1">
                                <li className="flex text-gray-500">
                                    <CheckCircle2 className="flex-shrink-0 w-6 h-6 text-green-500 mr-2" />
                                    Max 3 UMKM
                                </li>
                                <li className="flex text-gray-500">
                                    <CheckCircle2 className="flex-shrink-0 w-6 h-6 text-green-500 mr-2" />
                                    Max 5 User
                                </li>
                                <li className="flex text-gray-500">
                                    <CheckCircle2 className="flex-shrink-0 w-6 h-6 text-green-500 mr-2" />
                                    Analitik Lanjutan
                                </li>
                                <li className="flex text-gray-500">
                                    <CheckCircle2 className="flex-shrink-0 w-6 h-6 text-green-500 mr-2" />
                                    Dukungan Prioritas
                                </li>
                            </ul>
                            <Button className="w-full bg-blue-600 text-white hover:bg-blue-700" asChild>
                                <Link href="/auth/register?plan=starter" className="mt-8">
                                    Mulai Sekarang
                                </Link>
                            </Button>
                        </div>

                        {/* Growth Plan */}
                        <div className="flex flex-col p-8 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-shadow">
                            <h3 className="text-xl font-semibold text-gray-900">Usaha Maju</h3>
                            <p className="mt-4 flex items-baseline text-gray-900">
                                <span className="text-5xl font-extrabold tracking-tight">Rp. 249k</span>
                                <span className="ml-1 text-xl font-semibold text-gray-500">/bulan</span>
                            </p>
                            <p className="mt-6 text-gray-500">Untuk bisnis yang sedang berkembang dengan beberapa staf.</p>
                            <ul role="list" className="mt-6 space-y-4 flex-1">
                                <li className="flex text-gray-500">
                                    <CheckCircle2 className="flex-shrink-0 w-6 h-6 text-green-500 mr-2" />
                                    Max 10 UMKM
                                </li>
                                <li className="flex text-gray-500">
                                    <CheckCircle2 className="flex-shrink-0 w-6 h-6 text-green-500 mr-2" />
                                    Max 20 User
                                </li>
                                <li className="flex text-gray-500">
                                    <CheckCircle2 className="flex-shrink-0 w-6 h-6 text-green-500 mr-2" />
                                    Kustomisasi Laporan
                                </li>
                                <li className="flex text-gray-500">
                                    <CheckCircle2 className="flex-shrink-0 w-6 h-6 text-green-500 mr-2" />
                                    Dukungan Prioritas 24/7
                                </li>
                            </ul>
                            <Button className="w-full bg-blue-50 text-blue-700 hover:bg-blue-100" asChild>
                                <Link href="/auth/register?plan=growth" className="mt-8">
                                    Mulai Sekarang
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-blue-600">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
                    <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                        <span className="block">Siap untuk memulai?</span>
                        <span className="block text-blue-200">Daftarkan UMKM Anda sekarang.</span>
                    </h2>
                    <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
                        <div className="inline-flex rounded-md shadow">
                            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50 text-lg px-8 py-3" asChild>
                                <Link href="/auth/register">
                                    Mulai Sekarang
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="col-span-1 md:col-span-2">
                            <span className="text-2xl font-bold flex items-center">
                                <Store className="h-6 w-6 mr-2 text-blue-400" />
                                UsaHub
                            </span>
                            <p className="mt-4 text-gray-400 max-w-sm">
                                UsaHub adalah platform digitalisasi UMKM untuk kemajuan ekonomi digital Indonesia
                            </p>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Produk</h3>
                            <ul className="mt-4 space-y-4">
                                <li><Link href="#" className="text-base text-gray-300 hover:text-white">Fitur</Link></li>
                                <li><Link href="#" className="text-base text-gray-300 hover:text-white">Harga</Link></li>
                                <li><Link href="#" className="text-base text-gray-300 hover:text-white">API</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">KawanLab</h3>
                            <ul className="mt-4 space-y-4">
                                <li><Link href="#" className="text-base text-gray-300 hover:text-white">Tentang</Link></li>
                                <li><Link href="#" className="text-base text-gray-300 hover:text-white">Blog</Link></li>
                                <li><Link href="#" className="text-base text-gray-300 hover:text-white">Kontak</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-8 border-t border-gray-800 pt-8 flex items-center justify-between">
                        <p className="text-base text-gray-400">&copy; 2026 UsaHub, oleh PT Kawanlab Teknologi Nusantara. Hak Cipta Dilindungi.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}