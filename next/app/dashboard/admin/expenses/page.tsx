'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth.store'
import { useExpenseStore } from '@/stores/expense.store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Calendar, Download, Filter, Loader2, Trash2 } from 'lucide-react'

export default function ExpensesPage() {
    const { user } = useAuthStore()
    const { expenses, loading, fetchExpenses, deleteExpense } = useExpenseStore()

    const [filters, setFilters] = useState({
        category: '',
        date_from: '',
        date_to: ''
    })

    useEffect(() => {
        if (user?.business_public_id) {
            fetchExpenses(user.business_public_id, filters)
        }
    }, [user])

    const handleFilter = () => {
        if (user?.business_public_id) {
            fetchExpenses(user.business_public_id, filters)
        }
    }

    const handleDelete = async (expensePublicId: string) => {
        if (!user?.business_public_id) return
        if (!confirm('Hapus pengeluaran ini?')) return

        try {
            await deleteExpense(user.business_public_id, expensePublicId)
        } catch (error) {
            console.error('Failed to delete expense:', error)
        }
    }

    const getCategoryLabel = (category: string) => {
        const labels: Record<string, string> = {
            transport: 'Transport',
            food_drink: 'Makan & Minum',
            other: 'Lainnya'
        }
        return labels[category] || category
    }

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'transport': return 'bg-blue-100 text-blue-700'
            case 'food_drink': return 'bg-green-100 text-green-700'
            case 'other': return 'bg-orange-100 text-orange-700'
            default: return 'bg-slate-100 text-slate-700'
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount.toString()), 0)

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Pengeluaran Teknisi</h1>
                    <p className="text-muted-foreground">Kelola dan review pengeluaran pribadi teknisi</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
                        <p className="text-xs text-muted-foreground">{expenses.length} transaksi</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Transport</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(
                                expenses
                                    .filter(e => e.category === 'transport')
                                    .reduce((sum, e) => sum + parseFloat(e.amount.toString()), 0)
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Makan & Minum</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(
                                expenses
                                    .filter(e => e.category === 'food_drink')
                                    .reduce((sum, e) => sum + parseFloat(e.amount.toString()), 0)
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        Filter
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Kategori</label>
                            <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Semua kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Semua kategori</SelectItem>
                                    <SelectItem value="transport">Transport</SelectItem>
                                    <SelectItem value="food_drink">Makan & Minum</SelectItem>
                                    <SelectItem value="other">Lainnya</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">Dari Tanggal</label>
                            <Input
                                type="date"
                                value={filters.date_from}
                                onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">Sampai Tanggal</label>
                            <Input
                                type="date"
                                value={filters.date_to}
                                onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                            />
                        </div>

                        <div className="flex items-end">
                            <Button onClick={handleFilter} className="w-full">
                                Terapkan Filter
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Expense Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Daftar Pengeluaran</CardTitle>
                    <CardDescription>Semua pengeluaran pribadi teknisi</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                    ) : expenses.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Tidak ada pengeluaran
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Teknisi</TableHead>
                                    <TableHead>Tugas</TableHead>
                                    <TableHead>Kategori</TableHead>
                                    <TableHead>Keterangan</TableHead>
                                    <TableHead className="text-right">Jumlah</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {expenses.map((expense) => (
                                    <TableRow key={expense.id}>
                                        <TableCell className="text-sm">{formatDate(expense.created_at)}</TableCell>
                                        <TableCell className="font-medium">{expense.technician?.name || '-'}</TableCell>
                                        <TableCell className="text-sm">{expense.maintenance_issue?.title || '-'}</TableCell>
                                        <TableCell>
                                            <Badge className={getCategoryColor(expense.category)}>
                                                {getCategoryLabel(expense.category)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                                            {expense.description || '-'}
                                        </TableCell>
                                        <TableCell className="text-right font-bold">{formatCurrency(expense.amount)}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(expense.public_id)}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
