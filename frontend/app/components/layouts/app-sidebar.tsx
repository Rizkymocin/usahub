"use client"

import * as React from "react"
import {
  BookOpen,
  Bot,
  Home,
  School,
  Settings2,
  SquareTerminal,
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

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  appInfo: [
    {
      name: "Absensee",
      logo: School,
      slogan: "Presensi Tanpa Ribet",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: Home,
    },
    {
      title: "Pengaturan Umum",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      roles: ["administrator"],
      items: [
        {
          title: "Jurusan",
          url: "#",
        },
        {
          title: "Kelas",
          url: "#",
        },
        {
          title: "Siswa",
          url: "#",
        },
      ],
    },
    {
      title: "Pengaturan Presensi",
      url: "#",
      icon: Bot,
      roles: ["administrator", "teacher"],
      items: [
        {
          title: "Presensi",
          url: "#",
        },
      ],
    },
    {
      title: "Laporan",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Presensi",
          url: "#",
        },
        {
          title: "Absensi",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      roles: ["administrator"],
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  const [navMain, setNavMain] = React.useState(data.navMain)
  const [user, setUser] = React.useState(data.user)

  React.useEffect(() => {
    const role = localStorage.getItem("role") || "guest"
    const filteredNav = data.navMain.filter((item: any) => {
      if (!item.roles) return true;
      return item.roles.includes(role)
    })
    setNavMain(filteredNav)

    // Update user info if available (this assumes you might store user details in localStorage too, or fetch them)
    // For now, let's just leave the user as is or maybe update name if you had used it.
    // user details usually come from an API /user endpoint.
    // But we can update the role at least if we want to display it?
    // The current NavUser just shows name/email.

    // Check if we have user data in localStorage (from login)
    // You might want to store the whole user object in localStorage on login to display it here.
    // In login page you did: localStorage.setItem("role", user.role)
    // You didn't store name/email.
  }, [])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <AppName appInfo={data.appInfo} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
