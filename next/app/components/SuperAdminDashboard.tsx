"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    TrendingUp,
    TrendingDown,
    Users,
    Building2,
    DollarSign,
    CreditCard,
    ArrowUpRight,
    ArrowDownRight,
    Wifi,
    Coffee,
    Store,
    Shirt,
    Scissors,
    Crown,
    Star,
    Clock
} from "lucide-react"

// Tenant overview statistics
const tenantStats = [
    {
        title: "Total Tenants",
        value: "847",
        change: "+12.5%",
        trend: "up",
        icon: Users,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        description: "Active business owners"
    },
    {
        title: "Monthly Revenue",
        value: "Rp 127.5M",
        change: "+23.1%",
        trend: "up",
        icon: DollarSign,
        color: "text-green-600",
        bgColor: "bg-green-50",
        description: "Total subscription fees"
    },
    {
        title: "Premium Tenants",
        value: "234",
        change: "+18.2%",
        trend: "up",
        icon: Crown,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
        description: "Premium subscribers"
    },
    {
        title: "Avg. Retention",
        value: "8.4 mo",
        change: "+2.1%",
        trend: "up",
        icon: Clock,
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        description: "Average tenant lifetime"
    }
]

// Subscription tier breakdown
const subscriptionTiers = [
    { tier: "Free Trial", count: 145, revenue: "Rp 0", percentage: 17, color: "bg-gray-400" },
    { tier: "Basic", count: 312, revenue: "Rp 31.2M", percentage: 37, color: "bg-blue-500" },
    { tier: "Professional", count: 156, revenue: "Rp 46.8M", percentage: 18, color: "bg-purple-500" },
    { tier: "Premium", count: 234, revenue: "Rp 93.6M", percentage: 28, color: "bg-yellow-500" },
]

// Business type distribution
const businessTypes = [
    { type: "WiFi Provider", icon: Wifi, count: 187, revenue: "Rp 28.5M", growth: "+15%", color: "text-blue-600", bgColor: "bg-blue-50" },
    { type: "Cafe & Restaurant", icon: Coffee, count: 245, revenue: "Rp 42.3M", growth: "+22%", color: "text-amber-600", bgColor: "bg-amber-50" },
    { type: "Minimarket", icon: Store, count: 156, revenue: "Rp 31.2M", growth: "+18%", color: "text-green-600", bgColor: "bg-green-50" },
    { type: "Laundry", icon: Shirt, count: 134, revenue: "Rp 15.8M", growth: "+8%", color: "text-purple-600", bgColor: "bg-purple-50" },
    { type: "Barbershop & Salon", icon: Scissors, count: 125, revenue: "Rp 9.7M", growth: "+12%", color: "text-pink-600", bgColor: "bg-pink-50" },
]

// Top performing tenants
const topTenants = [
    { rank: 1, name: "WiFi Corner Network", owner: "Budi Santoso", plan: "Premium", revenue: "Rp 2.4M", rating: 4.9, badge: "🏆" },
    { rank: 2, name: "Kopi Kenangan Chain", owner: "Siti Nurhaliza", plan: "Premium", revenue: "Rp 2.1M", rating: 4.8, badge: "🥈" },
    { rank: 3, name: "Indomaret Franchise", owner: "Ahmad Wijaya", plan: "Professional", revenue: "Rp 1.8M", rating: 4.7, badge: "🥉" },
]

// Recent tenant activities
const recentActivities = [
    { tenant: "WiFi Corner Network", action: "Upgraded to Premium", time: "5 minutes ago", type: "success", icon: ArrowUpRight },
    { tenant: "Laundry Express", action: "Payment received", time: "23 minutes ago", type: "success", icon: DollarSign },
    { tenant: "Barbershop Deluxe", action: "New tenant registered", time: "1 hour ago", type: "info", icon: Users },
    { tenant: "Cafe Aroma", action: "Subscription renewed", time: "2 hours ago", type: "success", icon: CreditCard },
    { tenant: "Minimart 24/7", action: "Support ticket resolved", time: "3 hours ago", type: "info", icon: Star },
]

// Monthly growth data (simplified visualization)
const monthlyGrowth = [
    { month: "Jan", tenants: 645, revenue: 87 },
    { month: "Feb", tenants: 698, revenue: 95 },
    { month: "Mar", tenants: 742, revenue: 108 },
    { month: "Apr", tenants: 789, revenue: 115 },
    { month: "May", tenants: 821, revenue: 122 },
    { month: "Jun", tenants: 847, revenue: 127 },
]

export default function AdminDashboard() {
    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Tenant Management Dashboard</h1>
                    <p className="text-gray-500 mt-1">Monitor and analyze your business tenants performance</p>
                </div>
                <Badge variant="outline" className="px-4 py-2 bg-white">
                    <Clock className="w-3 h-3 mr-2" />
                    Last updated: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </Badge>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {tenantStats.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                        <Card key={index} className="p-6 hover:shadow-lg transition-all duration-200 border-l-4 border-l-transparent hover:border-l-blue-500 bg-white">
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

            {/* Subscription Tiers & Business Types */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Subscription Tiers */}
                <Card className="p-6 bg-white">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Subscription Distribution</h2>
                        <Badge className="bg-blue-100 text-blue-700">4 Tiers</Badge>
                    </div>
                    <div className="space-y-4">
                        {subscriptionTiers.map((tier, index) => (
                            <div key={index} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-3 h-3 rounded-full ${tier.color}`} />
                                        <span className="font-medium text-gray-900">{tier.tier}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-bold text-gray-900">{tier.count}</span>
                                        <span className="text-sm text-gray-500 ml-2">({tier.percentage}%)</span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                        <div className={`${tier.color} h-2 rounded-full transition-all duration-500`} style={{ width: `${tier.percentage}%` }} />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-700 min-w-[80px] text-right">{tier.revenue}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Business Type Distribution */}
                <Card className="p-6 bg-white">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Business Categories</h2>
                        <Badge className="bg-purple-100 text-purple-700">{businessTypes.length} Types</Badge>
                    </div>
                    <div className="space-y-3">
                        {businessTypes.map((business, index) => {
                            const Icon = business.icon
                            return (
                                <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center space-x-3">
                                        <div className={`p-2 rounded-lg ${business.bgColor}`}>
                                            <Icon className={`w-5 h-5 ${business.color}`} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{business.type}</p>
                                            <p className="text-sm text-gray-500">{business.count} tenants</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900">{business.revenue}</p>
                                        <p className={`text-sm flex items-center justify-end ${business.growth.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                                            {business.growth.startsWith('+') ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                                            {business.growth}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </Card>
            </div>

            {/* Top Tenants & Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Performing Tenants */}
                <Card className="lg:col-span-2 p-6 bg-white">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Top Performing Tenants</h2>
                        <Badge className="bg-yellow-100 text-yellow-700">⭐ Top 3</Badge>
                    </div>
                    <div className="space-y-4">
                        {topTenants.map((tenant) => (
                            <div key={tenant.rank} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 via-white to-gray-50 rounded-xl border-2 border-gray-100 hover:border-blue-200 transition-all">
                                <div className="flex items-center space-x-4">
                                    <div className="text-4xl">{tenant.badge}</div>
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <p className="font-bold text-gray-900">{tenant.name}</p>
                                            <Badge variant="outline" className="text-xs">{tenant.plan}</Badge>
                                        </div>
                                        <p className="text-sm text-gray-600">Owner: {tenant.owner}</p>
                                        <div className="flex items-center mt-1">
                                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                            <span className="text-sm font-semibold text-gray-700 ml-1">{tenant.rating}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Monthly Revenue</p>
                                    <p className="text-2xl font-bold text-green-600">{tenant.revenue}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Recent Activities */}
                <Card className="p-6 bg-white">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activities</h2>
                    <div className="space-y-3">
                        {recentActivities.map((activity, index) => {
                            const Icon = activity.icon
                            return (
                                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className={`p-2 rounded-lg ${activity.type === 'success' ? 'bg-green-100' : 'bg-blue-100'}`}>
                                        <Icon className={`w-4 h-4 ${activity.type === 'success' ? 'text-green-600' : 'text-blue-600'}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 text-sm truncate">{activity.tenant}</p>
                                        <p className="text-xs text-gray-600">{activity.action}</p>
                                        <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </Card>
            </div>

            {/* Monthly Growth Trend */}
            <Card className="p-6 bg-white">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">6-Month Growth Trend</h2>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500" />
                            <span className="text-sm text-gray-600">Tenants</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                            <span className="text-sm text-gray-600">Revenue (M)</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-end justify-between space-x-4 h-64">
                    {monthlyGrowth.map((data, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center space-y-2">
                            <div className="w-full flex flex-col items-center space-y-1">
                                <div className="w-full bg-blue-500 rounded-t-lg hover:bg-blue-600 transition-colors relative group" style={{ height: `${(data.tenants / 900) * 200}px` }}>
                                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded">
                                        {data.tenants}
                                    </div>
                                </div>
                                <div className="w-full bg-green-500 rounded-t-lg hover:bg-green-600 transition-colors relative group" style={{ height: `${(data.revenue / 130) * 100}px` }}>
                                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded">
                                        {data.revenue}M
                                    </div>
                                </div>
                            </div>
                            <span className="text-sm font-medium text-gray-600">{data.month}</span>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    )
}