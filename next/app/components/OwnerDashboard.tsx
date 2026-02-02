"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    TrendingUp,
    TrendingDown,
    Users,
    Building2,
    DollarSign,
    Activity,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react"

// Dummy data for business statistics
const stats = [
    {
        title: "Total Usaha Anda",
        value: "2",
        change: "+12.5%",
        trend: "up",
        icon: Building2,
        color: "text-blue-600",
        bgColor: "bg-blue-50"
    },
    {
        title: "Total Pendapatan",
        value: "Rp 45.2M",
        change: "+23.1%",
        trend: "up",
        icon: DollarSign,
        color: "text-green-600",
        bgColor: "bg-green-50"
    },
    {
        title: "Total Pengguna",
        value: "5",
        change: "+18.2%",
        trend: "up",
        icon: Users,
        color: "text-purple-600",
        bgColor: "bg-purple-50"
    },
    {
        title: "Pertumbuhan Bulanan",
        value: "15.8%",
        change: "-2.4%",
        trend: "down",
        icon: Activity,
        color: "text-orange-600",
        bgColor: "bg-orange-50"
    }
]

const businessPerformance = [
    { name: "WiFi Corner Jakarta Pusat", customers: 1250, revenue: "Rp 12.5M", growth: "+15%", status: "active", type: "WiFi" },
    { name: "Kopi Kenangan Bandung", customers: 980, revenue: "Rp 9.8M", growth: "+12%", status: "active", type: "Cafe" },
    { name: "Indomaret Surabaya Timur", customers: 2100, revenue: "Rp 18.0M", growth: "+18%", status: "active", type: "Minimarket" },
    { name: "Laundry Express Medan", customers: 650, revenue: "Rp 6.5M", growth: "+8%", status: "active", type: "Laundry" },
    { name: "Barbershop Premium Semarang", customers: 420, revenue: "Rp 4.2M", growth: "-3%", status: "warning", type: "Barbershop" },
]

const recentActivities = [
    { business: "WiFi Corner Jakarta Pusat", action: "New customer subscription", time: "2 minutes ago", type: "success" },
    { business: "Kopi Kenangan Bandung", action: "Payment received", time: "15 minutes ago", type: "success" },
    { business: "Indomaret Surabaya Timur", action: "Premium plan activated", time: "1 hour ago", type: "info" },
    { business: "Laundry Express Medan", action: "Support ticket opened", time: "2 hours ago", type: "warning" },
    { business: "Barbershop Premium Semarang", action: "Payment pending", time: "3 hours ago", type: "warning" },
]

const topPerformers = [
    { rank: 1, name: "Indomaret Surabaya Timur", score: 98, badge: "🏆" },
    { rank: 2, name: "WiFi Corner Jakarta Pusat", score: 95, badge: "🥈" },
    { rank: 3, name: "Kopi Kenangan Bandung", score: 92, badge: "🥉" },
]

export default function AdminDashboard() {
    const [date, setDate] = useState<string>("")

    useEffect(() => {
        setDate(new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }))
    }, [])

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard Owner</h1>
                    <p className="text-gray-500 mt-1">Ringkasan dari semua statistik dan performa bisnis</p>
                </div>
                <Badge variant="outline" className="px-4 py-2">
                    Last updated: {date}
                </Badge>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                        <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                    <h3 className="text-2xl font-bold mt-2 text-gray-900">{stat.value}</h3>
                                    <div className="flex items-center mt-2">
                                        {stat.trend === "up" ? (
                                            <ArrowUpRight className="w-4 h-4 text-green-600" />
                                        ) : (
                                            <ArrowDownRight className="w-4 h-4 text-red-600" />
                                        )}
                                        <span className={`text-sm ml-1 ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                                            {stat.change}
                                        </span>
                                        <span className="text-sm text-gray-500 ml-1">vs last month</span>
                                    </div>
                                </div>
                                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                                    <Icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                            </div>
                        </Card>
                    )
                })}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Business Performance Table */}
                <Card className="lg:col-span-2 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Performa Usaha</h2>
                        <Badge>Top 5</Badge>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Business Name</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Customers</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Revenue</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Growth</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {businessPerformance.map((business, index) => (
                                    <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-4 font-medium text-gray-900">{business.name}</td>
                                        <td className="py-3 px-4 text-gray-600">{business.customers.toLocaleString()}</td>
                                        <td className="py-3 px-4 text-gray-600">{business.revenue}</td>
                                        <td className="py-3 px-4">
                                            <span className={`flex items-center ${business.growth.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                                                {business.growth.startsWith('+') ? (
                                                    <TrendingUp className="w-4 h-4 mr-1" />
                                                ) : (
                                                    <TrendingDown className="w-4 h-4 mr-1" />
                                                )}
                                                {business.growth}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <Badge variant={business.status === "active" ? "default" : "outline"}>
                                                {business.status}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Top Performers */}
                <Card className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Top Performa Usaha</h2>
                    <div className="space-y-4">
                        {topPerformers.map((performer) => (
                            <div key={performer.rank} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border">
                                <div className="flex items-center space-x-3">
                                    <span className="text-2xl">{performer.badge}</span>
                                    <div>
                                        <p className="font-semibold text-gray-900">{performer.name}</p>
                                        <p className="text-sm text-gray-500">Rank #{performer.rank}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-gray-900">{performer.score}</p>
                                    <p className="text-xs text-gray-500">Score</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Recent Activities */}
            <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Aktivitas Terbaru</h2>
                <div className="space-y-3">
                    {recentActivities.map((activity, index) => (
                        <div key={index} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="flex items-start space-x-3">
                                <div className={`w-2 h-2 rounded-full mt-2 ${activity.type === 'success' ? 'bg-green-500' :
                                    activity.type === 'warning' ? 'bg-yellow-500' :
                                        'bg-blue-500'
                                    }`} />
                                <div>
                                    <p className="font-medium text-gray-900">{activity.business}</p>
                                    <p className="text-sm text-gray-600">{activity.action}</p>
                                </div>
                            </div>
                            <span className="text-sm text-gray-500">{activity.time}</span>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    )
}