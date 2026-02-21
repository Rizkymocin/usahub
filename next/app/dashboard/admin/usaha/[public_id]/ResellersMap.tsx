import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Map as MapIcon, Loader2 } from "lucide-react"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { useResellerStore } from "@/stores/reseller.store"

// Fix for Leaflet marker icons in Next.js
const icon = L.icon({
    iconUrl: "/images/marker-icon.png",
    shadowUrl: "/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
})

// Default center (Indonesia)
const CENTER_LAT = -2.5489
const CENTER_LNG = 118.0149
const ZOOM_LEVEL = 1

// Component to update map view based on markers
function MapUpdater({ markers }: { markers: { lat: number, lng: number }[] }) {
    const map = useMap()

    useEffect(() => {
        if (markers.length > 0) {
            const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]))
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
        }
    }, [markers, map])

    return null
}

export default function ResellersMap() {
    const { activeResellers } = useResellerStore()
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)

        // Fix for missing marker icons
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        })
    }, [])

    if (!isMounted) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapIcon className="h-5 w-5" />
                        Peta Distribusi Jaringan
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-[500px] flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        )
    }

    // Filter resellers with valid coordinates
    const markers = activeResellers
        .filter(r => r.latitude && r.longitude)
        .map(reseller => ({
            ...reseller,
            lat: Number(reseller.latitude),
            lng: Number(reseller.longitude)
        }))

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MapIcon className="h-5 w-5" />
                    Peta Distribusi Jaringan
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="h-[500px] w-full relative z-0">
                    <MapContainer
                        center={[CENTER_LAT, CENTER_LNG]}
                        zoom={ZOOM_LEVEL}
                        scrollWheelZoom={true}
                        style={{ height: "100%", width: "100%", borderRadius: "0 0 0.5rem 0.5rem" }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <MapUpdater markers={markers} />
                        {markers.map((marker) => {
                            // Find uplink
                            const uplink = markers.find(m => m.id === marker.uplink_reseller_id)

                            return (
                                <div key={marker.code}>
                                    {uplink && (
                                        <Polyline
                                            positions={[
                                                [uplink.lat, uplink.lng],
                                                [marker.lat, marker.lng]
                                            ]}
                                            pathOptions={{ color: 'blue', weight: 2, dashArray: '5, 3' }}
                                        />
                                    )}
                                    <Marker position={[marker.lat, marker.lng]}>
                                        <Popup>
                                            <div className="font-semibold">{marker.name}</div>
                                            <div className="text-sm text-muted-foreground">{marker.address || "Alamat tidak tersedia"}</div>
                                            <div className="text-xs mt-1">
                                                Outlet: {marker.outlet?.name}
                                            </div>
                                            <div className="text-xs">
                                                Telp: {marker.phone}
                                            </div>
                                            <div className="text-xs">
                                                IP Address: {marker.ip_address}
                                            </div>
                                            {uplink && (
                                                <div className="text-xs text-blue-600 mt-1">
                                                    Uplink: {uplink.name}
                                                </div>
                                            )}
                                        </Popup>
                                    </Marker>
                                </div>
                            )
                        })}
                    </MapContainer>
                </div>
            </CardContent>
        </Card>
    )
}
