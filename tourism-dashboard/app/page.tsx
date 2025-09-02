"use client"

import { useState } from "react"
import { SidebarProvider } from "../components/ui/sidebar"
import { AdminSidebar } from "../components/admin-sidebar"
import { DashboardContent } from "../components/dashboard-content"
import { DashboardHeader } from "../components/dashboard-header"
import { AuthProvider, useAuth } from "../contexts/auth-context"
import { LoginForm } from "../components/auth/login-form"

function DashboardApp() {
  const [activeSection, setActiveSection] = useState("overview")
  const { user, loading, login } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm onLogin={login} />
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-gray-50">
        <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <div className="flex-1 min-w-0 flex flex-col">
          <DashboardHeader activeSection={activeSection} />
          <main className="flex-1 min-w-0 overflow-auto">
            <DashboardContent activeSection={activeSection} />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default function SyntheticV0PageForDeployment() {
  return (
    <AuthProvider>
      <DashboardApp />
    </AuthProvider>
  )
}