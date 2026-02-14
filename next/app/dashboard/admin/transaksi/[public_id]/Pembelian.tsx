"use client"

import { useParams } from "next/navigation"
import { useEffect, useState, useMemo } from "react"
import { useIspPurchaseStore, IspPurchase } from "@/stores/isp-purchase.store"
import { useBusiness } from "@/stores/business.selectors"
import { useBusinessActions } from "@/stores/business.selectors"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, RefreshCw, Trash2, Loader2, Calendar as CalendarIcon, Search, Filter } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { useForm, useFieldArray, ControllerRenderProps } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
// Assuming we have a maintenance item store or we fetch them here
// For now, let's fetch maintenance items inside the component or use a hook if exists
import axios from "@/lib/axios"

const formSchema = z.object({
    purchase_date: z.date(),
    type: z.enum(["maintenance", "general"]),
    supplier_name: z.string().optional(),
    invoice_number: z.string().optional(),
    notes: z.string().optional(),
    items: z.array(z.object({
        item_name: z.string().min(1, "Item name is required"),
        quantity: z.number().min(1, "Quantity must be at least 1"),
        unit: z.string().min(1, "Unit is required"),
        unit_price: z.number().min(0, "Price must be positive"),
        isp_maintenance_item_id: z.number().optional().nullable(),
    })).min(1, "At least one item is required")
})

type FormValues = z.infer<typeof formSchema>

export default function Pembelian() {
    const { public_id } = useParams()
    const finalPublicId = Array.isArray(public_id) ? public_id[0] : public_id
    const business = useBusiness()
    const { fetchBusiness } = useBusinessActions()
    const { purchases, isLoading, fetchPurchases, createPurchase } = useIspPurchaseStore()

    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [maintenanceItems, setMaintenanceItems] = useState<any[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Filter States
    const [searchTerm, setSearchTerm] = useState("")
    const [typeFilter, setTypeFilter] = useState("all")
    const [dateRange, setDateRange] = useState<{ from: Date | undefined, to: Date | undefined }>({
        from: undefined,
        to: undefined
    })
    const [currentPage, setCurrentPage] = useState(1)
    const ITEMS_PER_PAGE = 10

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, typeFilter, dateRange])

    // Filter Logic
    const filteredPurchases = useMemo(() => {
        return purchases.filter(purchase => {
            // Text Search
            const searchLower = searchTerm.toLowerCase()
            const matchesSearch =
                (purchase.invoice_number?.toLowerCase().includes(searchLower) || false) ||
                (purchase.supplier_name?.toLowerCase().includes(searchLower) || false) ||
                (purchase.items.some(item => item.item_name.toLowerCase().includes(searchLower)))

            // Type Filter
            let matchesType = true
            if (typeFilter !== 'all') {
                matchesType = purchase.type === typeFilter
            }

            // Date Range Filter
            let matchesDate = true
            if (dateRange.from && dateRange.to) {
                const purchaseDate = new Date(purchase.purchase_date)
                // Reset times for accurate date comparison
                const from = new Date(dateRange.from)
                from.setHours(0, 0, 0, 0)
                const to = new Date(dateRange.to)
                to.setHours(23, 59, 59, 999)
                matchesDate = purchaseDate >= from && purchaseDate <= to
            }

            return matchesSearch && matchesType && matchesDate
        })
    }, [purchases, searchTerm, typeFilter, dateRange])

    const totalPages = Math.ceil(filteredPurchases.length / ITEMS_PER_PAGE)
    const paginatedPurchases = filteredPurchases.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            purchase_date: new Date(),
            type: "general",
            items: [{ item_name: "", quantity: 1, unit: "pcs", unit_price: 0 }]
        }
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items"
    })

    const watchType = form.watch("type")

    useEffect(() => {
        if (finalPublicId) {
            if (!business) fetchBusiness(finalPublicId)
            fetchPurchases(finalPublicId)
            fetchMaintenanceItems()
        }
    }, [finalPublicId, business, fetchBusiness, fetchPurchases])

    const fetchMaintenanceItems = async () => {
        if (!finalPublicId) return
        try {
            const response = await axios.get(`businesses/${finalPublicId}/maintenance-items`)
            if (response.data.success) {
                setMaintenanceItems(response.data.data)
            } else if (Array.isArray(response.data)) {
                setMaintenanceItems(response.data)
            }
        } catch (error) {
            console.error("Failed to fetch maintenance items", error)
        }
    }

    const onSubmit = async (values: FormValues) => {
        if (!finalPublicId) return
        setIsSubmitting(true)
        try {
            // Transform date to string if needed by backend, or let axios handle it (usually needs ISO string)
            // Backend validation says 'date', so YYYY-MM-DD HH:mm:ss is best
            const payload = {
                ...values,
                purchase_date: format(values.purchase_date, "yyyy-MM-dd HH:mm:ss"),
            }

            await createPurchase(finalPublicId, payload)
            toast.success("Purchase created successfully")
            setIsCreateOpen(false)
            form.reset({
                purchase_date: new Date(),
                type: "general",
                items: [{ item_name: "", quantity: 1, unit: "pcs", unit_price: 0 }]
            })
        } catch (error) {
            toast.error("Failed to create purchase")
        } finally {
            setIsSubmitting(false)
        }
    }

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(val)
    }

    // Effect to update item names if maintenance item is selected
    useEffect(() => {
        const subscription = form.watch((value, { name, type }) => {
            if (name?.includes('isp_maintenance_item_id')) {
                const index = parseInt(name.split('.')[1])
                const itemId = value.items?.[index]?.isp_maintenance_item_id
                if (itemId) {
                    const selectedItem = maintenanceItems.find(i => i.id === itemId)
                    if (selectedItem) {
                        form.setValue(`items.${index}.item_name`, selectedItem.name)
                        // Optional: set price if we tracked last price
                    }
                }
            }
        })
        return () => subscription.unsubscribe()
    }, [form.watch, maintenanceItems, form])


    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Pembelian</h1>
                    <p className="text-muted-foreground">Riwayat pembelian barang dan stok maintenance</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> Buat Pembelian</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Buat Pembelian Baru</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="purchase_date"
                                        render={({ field }: { field: ControllerRenderProps<FormValues, "purchase_date"> }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Tanggal Pembelian</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant={"outline"}
                                                                className={cn(
                                                                    "w-full pl-3 text-left font-normal",
                                                                    !field.value && "text-muted-foreground"
                                                                )}
                                                            >
                                                                {field.value ? (
                                                                    format(field.value, "PPP", { locale: id })
                                                                ) : (
                                                                    <span>Pick a date</span>
                                                                )}
                                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={field.value}
                                                            onSelect={field.onChange}
                                                            disabled={(date) =>
                                                                date > new Date() || date < new Date("1900-01-01")
                                                            }
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="type"
                                        render={({ field }: { field: ControllerRenderProps<FormValues, "type"> }) => (
                                            <FormItem>
                                                <FormLabel>Tipe Pembelian</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="general">Umum</SelectItem>
                                                        <SelectItem value="maintenance">Maintenance Item</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="supplier_name"
                                        render={({ field }: { field: ControllerRenderProps<FormValues, "supplier_name"> }) => (
                                            <FormItem>
                                                <FormLabel>Supplier (Opsional)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Nama Toko/Supplier" {...field} value={field.value ?? ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="invoice_number"
                                        render={({ field }: { field: ControllerRenderProps<FormValues, "invoice_number"> }) => (
                                            <FormItem>
                                                <FormLabel>Nomor Invoice (Opsional)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Nomor Invoice" {...field} value={field.value ?? ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="notes"
                                        render={({ field }: { field: ControllerRenderProps<FormValues, "notes"> }) => (
                                            <FormItem>
                                                <FormLabel>Catatan</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Catatan tambahan..." {...field} value={field.value ?? ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-sm font-medium">Items</h3>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => append({ item_name: "", quantity: 1, unit: "pcs", unit_price: 0 })}
                                        >
                                            <Plus className="h-3 w-3 mr-1" /> Add Item
                                        </Button>
                                    </div>

                                    <div className="border rounded-md p-2 space-y-2 max-h-[300px] overflow-y-auto">
                                        {fields.map((field, index) => (
                                            <div key={field.id} className="grid grid-cols-1 gap-4 p-4 border rounded-lg mb-4 bg-gray-50/50">
                                                {watchType === 'maintenance' && (
                                                    <div>
                                                        <FormField
                                                            control={form.control}
                                                            name={`items.${index}.isp_maintenance_item_id`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className="text-xs">Pilih Barang Maintenance</FormLabel>
                                                                    <Select
                                                                        onValueChange={(value) => {
                                                                            const id = parseInt(value);
                                                                            field.onChange(id === 0 || Number.isNaN(id) ? null : id);
                                                                            if (id !== 0) {
                                                                                const selectedItem = maintenanceItems.find(i => i.id === id);
                                                                                if (selectedItem) {
                                                                                    form.setValue(`items.${index}.item_name`, selectedItem.name);
                                                                                    form.setValue(`items.${index}.unit`, selectedItem.unit || 'pcs');
                                                                                }
                                                                            } else {
                                                                                form.setValue(`items.${index}.item_name`, '');
                                                                                form.setValue(`items.${index}.unit`, 'pcs');
                                                                            }
                                                                        }}
                                                                        value={field.value?.toString() || "0"}
                                                                    >
                                                                        <FormControl>
                                                                            <SelectTrigger className="h-8">
                                                                                <SelectValue placeholder="Pilih item..." />
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent>
                                                                            <SelectItem value="0">Buat Baru / Lainnya</SelectItem>
                                                                            {maintenanceItems.map(item => (
                                                                                <SelectItem key={item.id} value={item.id.toString()}>
                                                                                    {item.name} (Stok: {item.stock})
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                )}

                                                <div>
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${index}.item_name`}
                                                        render={({ field }: { field: ControllerRenderProps<FormValues, any> }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-xs">Nama Item</FormLabel>
                                                                <FormControl>
                                                                    <Input {...field} value={field.value ?? ''} className="h-8" placeholder="Nama Barang" />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>

                                                <div>
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${index}.quantity`}
                                                        render={({ field }: { field: ControllerRenderProps<FormValues, any> }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-xs">Qty</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        type="number"
                                                                        {...field}
                                                                        onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value))}
                                                                        value={Number.isNaN(field.value) ? '' : (field.value ?? '')}
                                                                        className="h-8"
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                                <div>
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${index}.unit`}
                                                        render={({ field }: { field: ControllerRenderProps<FormValues, any> }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-xs">Satuan</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        {...field}
                                                                        value={field.value ?? ''}
                                                                        className="h-8"
                                                                        placeholder="Pcs"
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                                <div>
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${index}.unit_price`}
                                                        render={({ field }: { field: ControllerRenderProps<FormValues, any> }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-xs">Harga Satuan</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        type="number"
                                                                        {...field}
                                                                        onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                                                                        value={Number.isNaN(field.value) ? '' : (field.value ?? '')}
                                                                        className="h-8"
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                                <div className="flex justify-end pt-2">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => remove(index)}
                                                        disabled={fields.length === 1}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" /> Hapus Item
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button type="button" variant="outline" className="mr-2" onClick={() => setIsCreateOpen(false)}>Batal</Button>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Simpan Pembelian
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4 space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari Invoice, Supplier, atau Item..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <SelectValue placeholder="Tipe" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Tipe</SelectItem>
                                    <SelectItem value="general">Umum</SelectItem>
                                    <SelectItem value="maintenance">Maintenance</SelectItem>
                                </SelectContent>
                            </Select>

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className={cn("w-[240px] justify-start text-left font-normal", !dateRange.from && "text-muted-foreground")}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateRange.from ? (
                                            dateRange.to ? (
                                                <>
                                                    {format(dateRange.from, "dd/MM/y")} - {format(dateRange.to, "dd/MM/y")}
                                                </>
                                            ) : (
                                                format(dateRange.from, "dd/MM/y")
                                            )
                                        ) : (
                                            <span>Pilih Tanggal</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="end">
                                    <Calendar
                                        mode="range"
                                        selected={{ from: dateRange.from, to: dateRange.to || undefined }}
                                        onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>

                            {(searchTerm || typeFilter !== 'all' || dateRange.from) && (
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        setSearchTerm("")
                                        setTypeFilter("all")
                                        setDateRange({ from: undefined, to: undefined })
                                    }}
                                >
                                    Reset
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Tipe</TableHead>
                                <TableHead>Invoice</TableHead>
                                <TableHead>Supplier</TableHead>
                                <TableHead>Items</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Loading data...
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : purchases.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                        Belum ada data pembelian.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedPurchases.map((purchase) => (
                                    <TableRow key={purchase.id}>
                                        <TableCell>
                                            {format(new Date(purchase.purchase_date), "dd MMM yyyy", { locale: id })}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={cn(purchase.type === 'maintenance' ? "bg-blue-50 text-blue-700" : "")}>
                                                {purchase.type === 'maintenance' ? 'Maintenance' : 'Umum'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{purchase.invoice_number || '-'}</TableCell>
                                        <TableCell>{purchase.supplier_name || '-'}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1 text-sm">
                                                {purchase.items.map((item, idx) => (
                                                    <div key={idx}>
                                                        <span className="font-medium">{item.quantity} {item.unit}</span> {item.item_name}
                                                    </div>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {formatCurrency(purchase.total_amount)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
                <div className="flex items-center justify-end space-x-2 p-4 pt-0">
                    <div className="flex-1 text-sm text-muted-foreground">
                        Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredPurchases.length)} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredPurchases.length)} of {filteredPurchases.length} entries
                    </div>
                    <div className="space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages || totalPages === 0}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    )
}