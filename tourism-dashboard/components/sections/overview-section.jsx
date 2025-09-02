"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  MapPin, 
  Users, 
  Calendar, 
  DollarSign,
  TrendingUp,
  Eye,
  RefreshCw,
  AlertCircle
} from "lucide-react"
import { useDashboardData } from "@/hooks/use-dashboard-data"
import { useToast } from "@/hooks/use-toast"

export function OverviewSection() {
  const { toast } = useToast()
  const { 
    stats, 
    places, 
    loading, 
    error, 
    refreshData 
  } = useDashboardData()

  const getCategoryColor = (category) => {
    const colors = {
      beach: "bg-blue-100 text-blue-800",
      historical: "bg-amber-100 text-amber-800",
      cultural: "bg-purple-100 text-purple-800",
      religious: "bg-green-100 text-green-800",
      suburb: "bg-gray-100 text-gray-800",
      "urban park": "bg-emerald-100 text-emerald-800"
    }
    return colors[category] || "bg-gray-100 text-gray-800"
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Overview</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={refreshData}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4 mr-2 inline" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Real-time summary of your tourism business</p>
        </div>
        <button 
          onClick={refreshData}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Data
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Places</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPlaces}</div>
            <p className="text-xs text-muted-foreground">
              Tourist destinations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Registered tourists
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              Trip reservations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              From completed bookings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Places by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(stats.categoryDistribution).map(([category, count]) => (
              <div key={category} className="text-center">
                <Badge className={`${getCategoryColor(category)} mb-2`}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Badge>
                <div className="text-2xl font-bold">{count}</div>
                <p className="text-xs text-muted-foreground">places</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Places */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Places Added</CardTitle>
        </CardHeader>
        <CardContent>
          {places && places.length > 0 ? (
            <div className="space-y-4">
              {places.slice(0, 5).map((place) => (
                <div key={place._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{place.name_eng}</h4>
                      <p className="text-sm text-muted-foreground">{place.location}</p>
                      <Badge className={`${getCategoryColor(place.category)} text-xs`}>
                        {place.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{formatCurrency(place.pricePerPerson)}</div>
                    <p className="text-xs text-muted-foreground">per person</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No places available yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <MapPin className="mr-2 h-4 w-4" />
              View All Places
            </Button>
            <Button variant="outline">
              <TrendingUp className="mr-2 h-4 w-4" />
              View Analytics
            </Button>
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Manage Bookings
            </Button>
            <Button variant="outline">
              <Users className="mr-2 h-4 w-4" />
              View Users
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
