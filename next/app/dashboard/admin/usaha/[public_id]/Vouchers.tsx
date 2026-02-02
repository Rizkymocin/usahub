"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import axios from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"

export default function Vouchers() {
    const { public_id } = useParams()
    const [vouchers, setVouchers] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (public_id) fetchVouchers()
    }, [public_id])

    const fetchVouchers = async () => {
        try {
            const id = Array.isArray(public_id) ? public_id[0] : public_id
            const res = await axios.get(`/api/businesses/${id}/vouchers`)
            setVouchers(res.data.data)
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Manajemen Voucher</CardTitle>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Import Voucher
                </Button>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div>Loading...</div>
                ) : (
                    <div className="rounded-md border">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="p-3">Kode Voucher</th>
                                    <th className="p-3">Harga</th>
                                    <th className="p-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vouchers.map((item: any) => (
                                    <tr key={item.id} className="border-t">
                                        <td className="p-3 font-medium font-mono">{item.code}</td>
                                        <td className="p-3">Rp {item.price?.toLocaleString()}</td>
                                        <td className="p-3">{item.status}</td>
                                    </tr>
                                ))}
                                {vouchers.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="p-4 text-center text-muted-foreground">
                                            Belum ada data voucher
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
