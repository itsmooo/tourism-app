"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Plus, MoreHorizontal, Eye, Edit, Trash2, Calendar, CheckCircle, Clock, XCircle, RefreshCw, AlertCircle, Save, X } from "lucide-react"
import { useDashboardData } from "@/hooks/use-dashboard-data"
import { format } from "date-fns"
import { apiService } from "@/lib/api-service"
import toast, { Toaster } from "react-hot-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function BookingsSection() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isUpdating, setIsUpdating] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [viewingBooking, setViewingBooking] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingBooking, setEditingBooking] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editForm, setEditForm] = useState({
    numberOfPeople: 1,
    bookingDate: '',
    status: 'pending',
    paymentStatus: 'pending'
  })
  
  const { 
    bookings, 
    stats, 
    loading, 
    error, 
    refreshData, 
    updateBookingStatus 
  } = useDashboardData()

  // Filter bookings based on search term and status
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch = 
      (typeof booking.user === 'string' ? '' : booking.user.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (typeof booking.place === 'string' ? '' : booking.place.name_eng || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking._id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = selectedStatus === "all" || booking.status === selectedStatus
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: { color: "bg-green-100 text-green-800 hover:bg-green-100", label: "Confirmed" },
      pending: { color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100", label: "Pending" },
      cancelled: { color: "bg-red-100 text-red-800 hover:bg-red-100", label: "Cancelled" },
      completed: { color: "bg-blue-100 text-blue-800 hover:bg-blue-100", label: "Completed" },
    }
    return statusConfig[status] || statusConfig.pending
  }

  const getPaymentBadge = (status) => {
    const statusConfig = {
      paid: { color: "bg-green-100 text-green-800 hover:bg-green-100", label: "Paid" },
      pending: { color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100", label: "Pending" },
      failed: { color: "bg-red-100 text-red-800 hover:bg-red-100", label: "Failed" },
    }
    return statusConfig[status] || statusConfig.pending
  }

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      setIsUpdating(true)
      const loadingToast = toast.loading(`Updating booking status to ${newStatus}...`)
      await updateBookingStatus(bookingId, newStatus)
      toast.dismiss(loadingToast)
      toast.success(`Booking status updated to ${newStatus}`)
    } catch (error) {
      console.error('Failed to update booking status:', error)
      toast.error('Failed to update booking status')
    } finally {
      setIsUpdating(false)
    }
  }

  // Handle view booking
  const handleViewBooking = (booking) => {
    setViewingBooking(booking)
    setIsViewModalOpen(true)
  }

  // Handle edit booking
  const handleEditBooking = (booking) => {
    setEditingBooking(booking)
    setEditForm({
      numberOfPeople: booking.numberOfPeople || 1,
      bookingDate: booking.bookingDate ? new Date(booking.bookingDate).toISOString().split('T')[0] : '',
      status: booking.status || 'pending',
      paymentStatus: booking.paymentStatus || 'pending'
    })
    setIsEditModalOpen(true)
  }

  // Handle form input changes
  const handleFormChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Handle form submission
  const handleUpdateBooking = async () => {
    if (!editingBooking) return

    try {
      setIsUpdating(true)
      const loadingToast = toast.loading('Updating booking...')
      
      await updateBookingStatus(editingBooking._id, editForm.status, editForm.paymentStatus)
      
      toast.dismiss(loadingToast)
      toast.success('Booking updated successfully')
      
      setIsEditModalOpen(false)
      setEditingBooking(null)
      setEditForm({
        numberOfPeople: 1,
        bookingDate: '',
        status: 'pending',
        paymentStatus: 'pending'
      })
      
      // Refresh data
      refreshData()
    } catch (error) {
      console.error('Error updating booking:', error)
      toast.error('Failed to update booking')
    } finally {
      setIsUpdating(false)
    }
  }

  // Handle delete booking
  const handleDeleteBooking = async (bookingId, touristName, destinationName) => {
    if (window.confirm(`Are you sure you want to delete the booking for ${touristName} to ${destinationName}?`)) {
      try {
        setIsDeleting(true)
        const loadingToast = toast.loading('Deleting booking...')
        
        await apiService.deleteBooking(bookingId)
        
        toast.dismiss(loadingToast)
        toast.success('Booking deleted successfully')
        
        // Refresh data
        refreshData()
      } catch (error) {
        console.error('Error deleting booking:', error)
        toast.error('Failed to delete booking')
      } finally {
        setIsDeleting(false)
      }
    }
  }

  // Close edit modal
  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setEditingBooking(null)
    setEditForm({
      numberOfPeople: 1,
      bookingDate: '',
      status: 'pending',
      paymentStatus: 'pending'
    })
  }

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy')
    } catch {
      return dateString
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  // Calculate stats from real data
  const bookingStats = [
    {
      title: "Total Bookings",
      value: stats?.totalBookings?.toString() || "0",
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Confirmed",
      value: stats?.totalBookings ? bookings.filter(b => b.status === 'confirmed').length.toString() : "0",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Pending",
      value: stats?.pendingBookings?.toString() || "0",
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Cancelled",
      value: stats?.totalBookings ? bookings.filter(b => b.status === 'cancelled').length.toString() : "0",
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-gray-600">Loading bookings...</span>
          </div>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Bookings</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={refreshData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
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
          <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
          <p className="text-gray-600 mt-1">Track and manage all tourist bookings</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={refreshData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            New Booking
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {bookingStats.map((stat, index) => (
          <Card key={index} className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bookings Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-blue-50 border-b">
          <div className="flex items-center justify-between">
            <CardTitle>All Bookings ({filteredBookings.length})</CardTitle>
            <div className="flex items-center gap-4">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-600">
                {searchTerm || selectedStatus !== "all" 
                  ? "Try adjusting your search or filter criteria." 
                  : "No bookings have been made yet."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Tourist</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Visit Date</TableHead>
                  <TableHead>Guests</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => {
                  const statusBadge = getStatusBadge(booking.status)
                  const paymentBadge = getPaymentBadge(booking.paymentStatus)
                  const touristName = typeof booking.user === 'string' ? 'Unknown User' : (booking.user?.username || 'Unknown User')
                  const destinationName = typeof booking.place === 'string' ? 'Unknown Place' : (booking.place?.name_eng || 'Unknown Place')

                  return (
                    <TableRow key={booking._id} className="hover:bg-gray-50">
                      <TableCell>
                        <span className="font-medium text-blue-600">{booking._id.slice(-8)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-gray-900">{touristName}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-gray-900">{destinationName}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{formatDate(booking.bookingDate)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{booking.numberOfPeople}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-blue-600">{formatCurrency(booking.totalPrice)}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusBadge.color}>{statusBadge.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={paymentBadge.color}>{paymentBadge.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{formatDate(booking.createdAt)}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" disabled={isUpdating}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewBooking(booking)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditBooking(booking)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Booking
                            </DropdownMenuItem>
                            {booking.status === 'pending' && (
                              <DropdownMenuItem onClick={() => handleStatusUpdate(booking._id, 'confirmed')}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Confirm Booking
                              </DropdownMenuItem>
                            )}
                            {booking.status === 'confirmed' && (
                              <DropdownMenuItem onClick={() => handleStatusUpdate(booking._id, 'completed')}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark Complete
                              </DropdownMenuItem>
                            )}
                            {booking.status !== 'cancelled' && (
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancel Booking
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDeleteBooking(booking._id, touristName, destinationName)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Booking
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Booking Details Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              View detailed information about this booking.
            </DialogDescription>
          </DialogHeader>
          {viewingBooking && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Booking ID</Label>
                  <p className="text-gray-900 font-mono text-sm">{viewingBooking._id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Created Date</Label>
                  <p className="text-gray-900">{formatDate(viewingBooking.createdAt)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Tourist</Label>
                  <p className="text-gray-900">
                    {typeof viewingBooking.user === 'string' ? 'Unknown User' : (viewingBooking.user?.username || 'Unknown User')}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Destination</Label>
                  <p className="text-gray-900">
                    {typeof viewingBooking.place === 'string' ? 'Unknown Place' : (viewingBooking.place?.name_eng || 'Unknown Place')}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Visit Date</Label>
                  <p className="text-gray-900">{formatDate(viewingBooking.bookingDate)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Number of People</Label>
                  <p className="text-gray-900">{viewingBooking.numberOfPeople}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Total Price</Label>
                  <p className="text-gray-900 font-medium text-blue-600">{formatCurrency(viewingBooking.totalPrice)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <Badge className={getStatusBadge(viewingBooking.status).color}>
                    {getStatusBadge(viewingBooking.status).label}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Payment Status</Label>
                  <Badge className={getPaymentBadge(viewingBooking.paymentStatus).color}>
                    {getPaymentBadge(viewingBooking.paymentStatus).label}
                  </Badge>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              Close
            </Button>
            <Button 
              onClick={() => {
                setIsViewModalOpen(false);
                handleEditBooking(viewingBooking);
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Booking Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
            <DialogDescription>
              Update booking information. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="numberOfPeople" className="text-right">
                Number of People
              </Label>
              <Input
                id="numberOfPeople"
                type="number"
                min="1"
                value={editForm.numberOfPeople}
                onChange={(e) => handleFormChange('numberOfPeople', parseInt(e.target.value))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bookingDate" className="text-right">
                Visit Date
              </Label>
              <Input
                id="bookingDate"
                type="date"
                value={editForm.bookingDate}
                onChange={(e) => handleFormChange('bookingDate', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select
                value={editForm.status}
                onValueChange={(value) => handleFormChange('status', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="paymentStatus" className="text-right">
                Payment Status
              </Label>
              <Select
                value={editForm.paymentStatus}
                onValueChange={(value) => handleFormChange('paymentStatus', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select payment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeEditModal} disabled={isUpdating}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleUpdateBooking} disabled={isUpdating}>
              <Save className="h-4 w-4 mr-2" />
              {isUpdating ? 'Updating...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* React Hot Toast Container */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  )
}
