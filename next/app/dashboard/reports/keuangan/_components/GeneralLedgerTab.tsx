"use client"

import { useRef, useEffect, useState } from "react"
import { reportService, ReportFilters } from "@/services/report.service"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Printer } from "lucide-react"
import { useReactToPrint } from "react-to-print"
import { format } from "date-fns"
import { id } from "date-fns/locale"

export default function GeneralLedgerTab({ filters, trigger }: { filters: ReportFilters, trigger: number }) {
    const [data, setData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [selectedAccount, setSelectedAccount] = useState<string>("")
    const printRef = useRef<HTMLDivElement>(null)

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Buku_Besar_${selectedAccount}_${filters.start_date || 'Awal'}_SD_${filters.end_date || 'Akhir'}`,
    })

    // Kapan pun trigger/filters bisnis berubah, reset akun untuk me-load default 
    useEffect(() => {
        setSelectedAccount("")
        fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [trigger, filters.business_id, filters.start_date, filters.end_date])

    // Fetch data ketika akun spesifik diubah secara manual
    useEffect(() => {
        if (selectedAccount !== "") {
            fetchData(selectedAccount)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedAccount])

    const fetchData = async (accountCode?: string) => {
        setIsLoading(true)
        try {
            const result = await reportService.getGeneralLedger({
                ...filters,
                account_code: accountCode || undefined
            })
            setData(result)

            // Set jika kosong di awal
            if (!selectedAccount && result?.selected_account?.code) {
                setSelectedAccount(result.selected_account.code)
            }
        } catch (error) {
            console.error("Failed to fetch General Ledger", error)
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading && !data) {
        return <div className="py-12 text-center text-muted-foreground animate-pulse">Memuat Buku Besar...</div>
    }

    if (!data || data.accounts.length === 0) {
        return (
            <Card className="print:shadow-none print:border-none">
                <CardHeader>
                    <CardTitle>Buku Besar (General Ledger)</CardTitle>
                </CardHeader>
                <CardContent className="py-12 flex items-center justify-center text-muted-foreground">
                    Tidak ada transaksi pada periode atau usaha yang dipilih.
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="print:shadow-none print:border-none print:w-full">
            <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
                <div>
                    <CardTitle>Buku Besar (General Ledger)</CardTitle>
                    <CardDescription>Rincian mutasi debit dan kredit berdasarkan akun spesifik.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Pilih Akun:</span>
                    <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                        <SelectTrigger className="w-[240px]">
                            <SelectValue placeholder="Pilih Akun..." />
                        </SelectTrigger>
                        <SelectContent>
                            {data.accounts.map((acc: any) => (
                                <SelectItem key={acc.code} value={acc.code}>
                                    {acc.code} - {acc.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {data && data.lines && (
                        <Button onClick={handlePrint} variant="outline" size="icon" className="shrink-0" title="Cetak PDF">
                            <Printer className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div ref={printRef} className="print:p-6 print:bg-white print:text-black">
                    {/* Print Header */}
                    <div className="hidden print:block mb-6 border-b pb-4">
                        <h2 className="text-2xl font-bold">Buku Besar</h2>
                        <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground mr-2">Akun:</span>
                                <strong>{data.selected_account?.code} - {data.selected_account?.name}</strong>
                            </div>
                            <div>
                                <span className="text-muted-foreground mr-2">Periode:</span>
                                <strong>{filters.start_date ? format(new Date(filters.start_date), "dd MMM yyyy", { locale: id }) : 'Awal'} - {filters.end_date ? format(new Date(filters.end_date), "dd MMM yyyy", { locale: id }) : 'Akhir'}</strong>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-md border relative w-full overflow-auto print:border-none print:overflow-visible">
                        {isLoading && (
                            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
                                Memuat data akun...
                            </div>
                        )}
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="w-[120px]">Tanggal</TableHead>
                                    <TableHead className="w-[100px]">Kode Ref</TableHead>
                                    <TableHead>Keterangan</TableHead>
                                    <TableHead className="text-right">Debit</TableHead>
                                    <TableHead className="text-right">Kredit</TableHead>
                                    <TableHead className="text-right">Saldo Berjalan</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow className="bg-gray-50/50">
                                    <TableCell colSpan={5} className="font-medium text-right text-muted-foreground">
                                        Saldo Awal Periode
                                    </TableCell>
                                    <TableCell className="text-right font-medium text-gray-900">
                                        Rp {data.opening_balance?.toLocaleString('id-ID')}
                                    </TableCell>
                                </TableRow>

                                {data.lines && data.lines.length > 0 ? (
                                    data.lines.map((line: any, idx: number) => (
                                        <TableRow key={idx}>
                                            <TableCell>
                                                {format(new Date(line.date), "dd MMM yyyy", { locale: id })}
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-mono">
                                                    {line.event_code}
                                                </span>
                                            </TableCell>
                                            <TableCell className="max-w-[300px] truncate" title={line.description}>
                                                {line.description}
                                            </TableCell>
                                            <TableCell className="text-right text-emerald-600">
                                                {line.debit > 0 ? `Rp ${line.debit.toLocaleString('id-ID')}` : '-'}
                                            </TableCell>
                                            <TableCell className="text-right text-rose-600">
                                                {line.credit > 0 ? `Rp ${line.credit.toLocaleString('id-ID')}` : '-'}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                Rp {line.balance.toLocaleString('id-ID')}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                            Tidak ada mutasi dalam periode ini.
                                        </TableCell>
                                    </TableRow>
                                )}

                                <TableRow className="bg-gray-50/50 border-t-2 border-gray-200">
                                    <TableCell colSpan={5} className="font-bold text-right text-gray-900">
                                        Saldo Akhir Periode
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-primary">
                                        Rp {data.closing_balance?.toLocaleString('id-ID')}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
