"use client"

import { BarChart3, Calendar, Home, MapPin, Users, Plane } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const menuItems = [
  {
    title: "Overview",
    icon: Home,
    id: "overview",
  },
  {
    title: "Analytics",
    icon: BarChart3,
    id: "analytics",
  },
  {
    title: "Tourists",
    icon: Users,
    id: "tourists",
  },
  {
    title: "Bookings",
    icon: Calendar,
    id: "bookings",
  },
  {
    title: "Destinations",
    icon: MapPin,
    id: "destinations",
  },

]

export function AdminSidebar({ activeSection, setActiveSection }) {
  return (
    <Sidebar className="border-r border-blue-200">
      <SidebarHeader className="border-b border-blue-200 bg-blue-600 text-white">
        <div className="flex items-center gap-3 px-3 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
            <Plane className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Somalia Tourism</h2>
            <p className="text-sm text-white/80">Admin Dashboard</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-white">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-600 font-semibold">Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => setActiveSection(item.id)}
                    isActive={activeSection === item.id}
                    className={`w-full justify-start gap-3 ${
                      activeSection === item.id
                        ? "bg-blue-600 text-white"
                        : "hover:bg-blue-50 text-gray-700"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-blue-200 bg-white">
        <div className="flex items-center gap-3 px-3 py-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg?height=32&width=32" />
            <AvatarFallback className="bg-blue-600 text-white">AD</AvatarFallback>
          </Avatar>
          <div className="flex-1 text-sm">
            <p className="font-medium text-gray-900">Admin User</p>
            <p className="text-gray-500">admin@somalia-tourism.so</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
