"use client"

import { useAuth } from "@/contexts/auth-context"
import { LoginForm } from "@/components/auth/login-form"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin-sidebar"
import { DashboardContent } from "@/components/dashboard-content"
import { useState } from "react"

export function ProtectedDashboard() {
  const { isAuthenticated, hasDashboardAccess, loading } = useAuth()
  const [activeSection, setActiveSection] = useState("overview")

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If not authenticated or doesn't have dashboard access, show login form
  if (!isAuthenticated() || !hasDashboardAccess()) {
    return <LoginForm />
  }

  // If authenticated and admin, show dashboard
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-blue-50 to-orange-50">
        <AdminSidebar activeSection={activeSection} setActiveSection={activeSection} />
        <main className="flex-1">
          <DashboardContent activeSection={activeSection} />
        </main>
      </div>
    </SidebarProvider>
  )
}
