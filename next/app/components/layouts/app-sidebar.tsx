"use client"

import * as React from "react"
import {
  BookOpen,
  Settings,
  Users,
  ShieldAlert,
  Wallet,
  Wrench,
  FileText,
  Home,
  Store,
  MonitorCog,
  Database,
  Bot,
  BriefcaseBusiness,
  CheckSquare
} from "lucide-react"

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user"
import { AppName } from "./app-name"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useAuthUser } from "@/stores/auth.selectors";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useAuthUser()

  const data = {
    user: {
      name: user?.name ?? "",
      email: user?.email ?? "",
    },
    appInfo: [
      {
        name: "UsaHub",
        logo: Store,
        slogan: "Kontrol Penuh Bisnis Anda",
      },
    ],
    navMain: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: Home,
      },
      // Super Admin Menu
      {
        title: "Platform Management",
        url: "#",
        icon: MonitorCog,
        roles: ["super-admin"],
        items: [
          {
            title: "Tenants",
            url: "/dashboard/tenants",
          },
          {
            title: "Plans",
            url: "/dashboard/plans",
          },
        ]
      },
      // Owner & Admin Menu - Master Data
      {
        title: "Master Data",
        url: "#",
        icon: Database,
        roles: ["owner"],
        items: [
          {
            title: "Usaha",
            url: "/dashboard/usaha",
          },
        ],
      },
      {
        title: "Administrasi Usaha",
        url: "#",
        icon: Database,
        roles: ["business_admin"],
        items: [
          {
            title: "Usaha",
            url: "/dashboard/admin/usaha",
          },
          {
            title: "Transaksi",
            url: "/dashboard/admin/transaksi",
          },
          {
            title: "Aktivitas",
            url: "/dashboard/admin/activity",
          },
          {
            title: "Akuntansi",
            url: "/dashboard/admin/accounting",
          },
        ],
      },
      // Reports
      {
        title: "Laporan",
        url: "#",
        icon: FileText,
        roles: ["owner", "business_admin", "super-admin"],
        items: [
          {
            title: "Ringkasan Eksekutif",
            url: "/dashboard/reports/keuangan",
          },
        ],
      },
    ],
  }

  const [navMain, setNavMain] = React.useState<typeof data.navMain>([])
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)

    // Retrieve role from auth-storage
    const storage = localStorage.getItem("auth-storage")
    let userRoles: string[] = ["guest"]

    if (storage) {
      try {
        const parsed = JSON.parse(storage)
        // Access roles array from user object
        const roles = parsed.state?.user?.roles || []
        // Map to strings if they are objects
        userRoles = roles.map((r: any) => typeof r === 'string' ? r : r.name)
      } catch (e) {
        console.error("Failed to parse auth storage", e)
      }
    }

    const filteredNav = data.navMain.filter((item) => {
      const itemWithRoles = item as { roles?: string[] };
      // If no roles defined, accessible by everyone
      if (!itemWithRoles.roles) return true;
      // Check if user has at least one of the required roles
      return itemWithRoles.roles.some(role => userRoles.includes(role))
    })
    setNavMain(filteredNav)

  }, [])

  if (!mounted) {
    return null
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <AppName appInfo={data.appInfo} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
