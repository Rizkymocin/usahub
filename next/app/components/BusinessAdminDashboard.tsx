"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    TrendingUp,
    TrendingDown,
    Users,
    DollarSign,
    ShoppingCart,
    Clock,
    ArrowUpRight,
    ArrowDownRight,
    UserCheck,
    UserX,
    Calendar,
    BarChart3,
    Download,
    Filter,
    RefreshCw
} from "lucide-react"

// Business overview statistics
const businessStats = [
    {
        title: "Today's Revenue",
        value: "Rp 2.4M",
        change: "+15.3%",
        trend: "up",
        icon: DollarSign,
        color: "text-green-600",
        bgColor: "bg-green-50",
        description: "vs yesterday"
    },
    {
        title: "Active Customers",
        value: "342",
        change: "+8.2%",
        trend: "up",
        icon: Users,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        description: "currently active"
    },
    {
        title: "Transactions",
        value: "156",
        change: "+12.5%",
        trend: "up",
        icon: ShoppingCart,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
        description: "completed today"
    },
    {
        title: "Staff On Duty",
        value: "12/15",
        change: "80%",
        trend: "up",
        icon: UserCheck,
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        description: "attendance rate"
    }
]

// Staff performance data
const staffPerformance = [
    { name: "Ahmad Rizki", role: "Cashier", sales: "Rp 850K", transactions: 45, rating: 4.8, status: "active" },
    { name: "Siti Aminah", role: "Server", sales: "Rp 720K", transactions: 38, rating: 4.9, status: "active" },
    { name: "Budi Santoso", role: "Kitchen", sales: "Rp 650K", transactions: 32, rating: 4.7, status: "active" },
    { name: "Dewi Lestari", role: "Cashier", sales: "Rp 580K", transactions: 28, rating: 4.6, status: "break" },
    { name: "Eko Prasetyo", role: "Server", sales: "Rp 520K", transactions: 25, rating: 4.5, status: "active" },
]

// Customer analytics
const customerAnalytics = [
    { timeSlot: "06:00 - 09:00", customers: 45, revenue: "Rp 380K", avgSpend: "Rp 8.4K" },
    { timeSlot: "09:00 - 12:00", customers: 78, revenue: "Rp 720K", avgSpend: "Rp 9.2K" },
    { timeSlot: "12:00 - 15:00", customers: 124, revenue: "Rp 1.1M", avgSpend: "Rp 8.9K" },
    { timeSlot: "15:00 - 18:00", customers: 95, revenue: "Rp 850K", avgSpend: "Rp 8.9K" },
]

// Recent transactions
const recentTransactions = [
    { id: "#TRX-1234", customer: "Walk-in Customer", amount: "Rp 125K", time: "2 min ago", status: "completed", method: "Cash" },
    { id: "#TRX-1233", customer: "Member #4521", amount: "Rp 89K", time: "5 min ago", status: "completed", method: "E-Wallet" },
    { id: "#TRX-1232", customer: "Walk-in Customer", amount: "Rp 156K", time: "8 min ago", status: "completed", method: "Debit" },
    { id: "#TRX-1231", customer: "Member #3892", amount: "Rp 78K", time: "12 min ago", status: "completed", method: "Cash" },
    { id: "#TRX-1230", customer: "Walk-in Customer", amount: "Rp 234K", time: "15 min ago", status: "completed", method: "Credit" },
]

// Weekly revenue comparison
const weeklyRevenue = [
    { day: "Mon", revenue: 2.1, target: 2.5 },
    { day: "Tue", revenue: 2.3, target: 2.5 },
    { day: "Wed", revenue: 2.8, target: 2.5 },
    { day: "Thu", revenue: 2.4, target: 2.5 },
    { day: "Fri", revenue: 3.2, target: 2.5 },
    { day: "Sat", revenue: 3.8, target: 3.0 },
    { day: "Sun", revenue: 2.4, target: 2.5 },
]

export default function BusinessAdminDashboard() {
    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            {/* Header with Controls */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Business Dashboard</h1>
                    <p className="text-gray-500 mt-1">Kopi Kenangan - Bandung Branch</p>
                </div>
                <div className="flex items-center space-x-3">
                    <Button variant="outline" size="sm">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                    </Button>
                    <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                    <Button size="sm">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {businessStats.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                        <Card key={index} className="p-6 hover:shadow-lg transition-all duration-200 bg-white">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                    <h3 className="text-3xl font-bold mt-2 text-gray-900">{stat.value}</h3>
                                    <div className="flex items-center mt-2">
                                        {stat.trend === "up" ? (
                                            <ArrowUpRight className="w-4 h-4 text-green-600" />
                                        ) : (
                                            <ArrowDownRight className="w-4 h-4 text-red-600" />
                                        )}
                                        <span className={`text-sm ml-1 font-semibold ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                                            {stat.change}
                                        </span>
                                        <span className="text-xs text-gray-500 ml-2">{stat.description}</span>
                                    </div>
                                </div>
                                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                                    <Icon className={`w-7 h-7 ${stat.color}`} />
                                </div>
                            </div>
                        </Card>
                    )
                })}
            </div>

            {/* Staff Performance & Customer Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Staff Performance */}
                <Card className="p-6 bg-white">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Staff Performance Today</h2>
                        <Badge className="bg-blue-100 text-blue-700">5 Active</Badge>
                    </div>
                    <div className="space-y-3">
                        {staffPerformance.map((staff, index) => (
                            <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                                        {staff.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{staff.name}</p>
                                        <p className="text-sm text-gray-500">{staff.role}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-900">{staff.sales}</p>
                                    <div className="flex items-center justify-end space-x-2">
                                        <p className="text-xs text-gray-500">{staff.transactions} txn</p>
                                        <Badge variant={staff.status === "active" ? "default" : "outline"} className="text-xs">
                                            {staff.status}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Customer Analytics by Time */}
                <Card className="p-6 bg-white">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Customer Traffic by Time</h2>
                        <Badge className="bg-purple-100 text-purple-700">Today</Badge>
                    </div>
                    <div className="space-y-4">
                        {customerAnalytics.map((slot, index) => (
                            <div key={index} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Clock className="w-4 h-4 text-gray-500" />
                                        <span className="font-medium text-gray-900">{slot.timeSlot}</span>
                                    </div>
                                    <span className="text-sm text-gray-600">{slot.customers} customers</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${(slot.customers / 124) * 100}%` }}
                                        />
                                    </div>
                                    <div className="text-right min-w-[100px]">
                                        <p className="text-sm font-bold text-gray-900">{slot.revenue}</p>
                                        <p className="text-xs text-gray-500">Avg: {slot.avgSpend}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Weekly Revenue & Recent Transactions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Weekly Revenue Chart */}
                <Card className="lg:col-span-2 p-6 bg-white">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Weekly Revenue Performance</h2>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500" />
                                <span className="text-sm text-gray-600">Actual</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 rounded-full bg-gray-300" />
                                <span className="text-sm text-gray-600">Target</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-end justify-between space-x-3 h-64">
                        {weeklyRevenue.map((data, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center space-y-2">
                                <div className="w-full flex flex-col items-center justify-end space-y-1 h-52">
                                    {/* Target line */}
                                    <div className="w-full relative">
                                        <div
                                            className="w-full bg-gray-200 rounded-t-lg"
                                            style={{ height: `${(data.target / 4) * 200}px` }}
                                        />
                                        {/* Actual revenue */}
                                        <div
                                            className={`absolute bottom-0 w-full rounded-t-lg transition-all duration-500 ${data.revenue >= data.target
                                                ? 'bg-gradient-to-t from-green-500 to-green-400'
                                                : 'bg-gradient-to-t from-blue-500 to-blue-400'
                                                } hover:opacity-80 cursor-pointer group`}
                                            style={{ height: `${(data.revenue / 4) * 200}px` }}
                                        >
                                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                                Rp {data.revenue}M
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <span className="text-sm font-medium text-gray-600">{data.day}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Recent Transactions */}
                <Card className="p-6 bg-white">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Transactions</h2>
                    <div className="space-y-3">
                        {recentTransactions.map((transaction, index) => (
                            <div key={index} className="flex items-start justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 text-sm">{transaction.id}</p>
                                    <p className="text-xs text-gray-600 truncate">{transaction.customer}</p>
                                    <div className="flex items-center space-x-2 mt-1">
                                        <Badge variant="outline" className="text-xs">
                                            {transaction.method}
                                        </Badge>
                                        <span className="text-xs text-gray-400">{transaction.time}</span>
                                    </div>
                                </div>
                                <div className="text-right ml-2">
                                    <p className="font-bold text-green-600">{transaction.amount}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button variant="outline" className="w-full mt-4">
                        View All Transactions
                    </Button>
                </Card>
            </div>
        </div>
    )
}