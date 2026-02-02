"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Topups() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Topup Outlet</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-muted-foreground text-center py-8">
                    Fitur Topup Outlet akan segera hadir via Mobile App atau interface kasir.
                    <br />
                    (Backend API sudah siap: <code>/outlets/&#123;id&#125;/topup</code>)
                </div>
            </CardContent>
        </Card>
    )
}
