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
import { useAuth } from "@/contexts/auth-context"

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
  const { user, isAdmin, isCoWorker } = useAuth();
  
  // Filter menu items based on user role
  const getMenuItems = () => {
    const allItems = [
      {
        title: "Overview",
        icon: Home,
        id: "overview",
        roles: ['admin', 'co-worker']
      },
      {
        title: "Analytics",
        icon: BarChart3,
        id: "analytics",
        roles: ['admin'] // Only admins can see analytics
      },
      {
        title: "Tourists",
        icon: Users,
        id: "tourists",
        roles: ['admin', 'co-worker']
      },
      {
        title: "Bookings",
        icon: Calendar,
        id: "bookings",
        roles: ['admin', 'co-worker']
      },
      {
        title: "Destinations",
        icon: MapPin,
        id: "destinations",
        roles: ['admin', 'co-worker']
      },
    ];
    
    return allItems.filter(item => {
      if (isAdmin()) return true;
      if (isCoWorker()) return item.roles.includes('co-worker');
      return false;
    });
  };

  const filteredMenuItems = getMenuItems();

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
              {filteredMenuItems.map((item) => (
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
            <AvatarFallback className="bg-blue-600 text-white">
              {user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-sm">
            <p className="font-medium text-gray-900">
              {user?.username || 'User'} 
              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {user?.role || 'user'}
              </span>
            </p>
            <p className="text-gray-500">{user?.email || 'user@example.com'}</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
