"use client"

import { useState } from "react"
import { Bell, Search, User, Settings, LogOut } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { Badge } from "./ui/badge"
import { useAuth } from "../contexts/auth-context"

export function DashboardHeader({ activeSection }) {
  const [notifications] = useState(3)
  const { user, logout } = useAuth()

  const getSectionTitle = (section) => {
    const titles = {
      overview: "Dashboard Overview",
      analytics: "Analytics & Reports",
      tourists: "Tourist Management",
      bookings: "Booking Management",
      destinations: "Destination Management"
    }
    return titles[section] || "Dashboard"
  }

  const getSectionIcon = (section) => {
    const icons = {
      overview: "📊",
      analytics: "📈",
      tourists: "👥",
      bookings: "📅",
      destinations: "🗺️"
    }
    return icons[section] || "🏠"
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left side - Section title and breadcrumb */}
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{getSectionIcon(activeSection)}</div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {getSectionTitle(activeSection)}
            </h1>
            <p className="text-sm text-gray-500">
              Somalia Tourism Dashboard
            </p>
          </div>
        </div>

        {/* Center - Search bar */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search destinations, bookings, tourists..."
              className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
            />
          </div>
        </div>

        {/* Right side - Actions and user menu */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5 text-gray-600" />
            {notifications > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
              >
                {notifications}
              </Badge>
            )}
          </Button>

          {/* Settings */}
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5 text-gray-600" />
          </Button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-user.jpg" alt="Admin User" />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">{user?.full_name || user?.username || 'Admin User'}</p>
                  <p className="text-xs text-gray-500">{user?.email || 'admin@somalia-tourism.com'}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
