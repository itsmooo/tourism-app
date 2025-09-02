import { useState, useEffect, useCallback } from 'react';
import { apiService, DashboardStats, Place, Booking, User } from '../lib/api-service';

export function useDashboardData() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard statistics
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const dashboardStats = await apiService.getDashboardStats();
      setStats(dashboardStats);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard stats');
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all places
  const fetchPlaces = useCallback(async () => {
    try {
      const placesData = await apiService.getAllPlaces();
      setPlaces(placesData);
    } catch (err) {
      console.error('Error fetching places:', err);
    }
  }, []);

  // Fetch all bookings
  const fetchBookings = useCallback(async () => {
    try {
      console.log('🔄 Fetching bookings from API...');
      const bookingsData = await apiService.getAllBookings();
      console.log('📥 Received bookings data:', bookingsData);
      
      // Debug: Check first booking structure
      if (bookingsData.length > 0) {
        const firstBooking = bookingsData[0];
        console.log('🔍 First booking structure:');
        console.log('- ID:', firstBooking._id);
        console.log('- User:', firstBooking.user);
        console.log('- Place:', firstBooking.place);
        console.log('- Place type:', typeof firstBooking.place);
        console.log('- Place name_eng:', firstBooking.place?.name_eng);
      }
      
      setBookings(bookingsData);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  }, []);

  // Fetch all users
  const fetchUsers = useCallback(async () => {
    try {
      const usersData = await apiService.getAllUsers();
      setUsers(usersData);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  }, []);

  // Refresh all data
  const refreshData = useCallback(async () => {
    await Promise.all([
      fetchStats(),
      fetchPlaces(),
      fetchBookings(),
      fetchUsers(),
    ]);
  }, [fetchStats, fetchPlaces, fetchBookings, fetchUsers]);

  // Update booking status
  const updateBookingStatus = useCallback(async (bookingId: string, status: string) => {
    try {
      await apiService.updateBookingStatus(bookingId, status);
      // Refresh bookings data
      await fetchBookings();
      // Refresh stats to get updated counts
      await fetchStats();
    } catch (err) {
      console.error('Error updating booking status:', err);
      throw err;
    }
  }, [fetchBookings, fetchStats]);

  // Create new place
  const createPlace = useCallback(async (placeData: FormData) => {
    try {
      await apiService.createPlace(placeData);
      // Refresh places data
      await fetchPlaces();
      // Refresh stats
      await fetchStats();
    } catch (err) {
      console.error('Error creating place:', err);
      throw err;
    }
  }, [fetchPlaces, fetchStats]);

  // Update place
  const updatePlace = useCallback(async (placeId: string, placeData: FormData) => {
    try {
      await apiService.updatePlace(placeId, placeData);
      // Refresh places data
      await fetchPlaces();
      // Refresh stats
      await fetchStats();
    } catch (err) {
      console.error('Error updating place:', err);
      throw err;
    }
  }, [fetchPlaces, fetchStats]);

  // Delete place
  const deletePlace = useCallback(async (placeId: string) => {
    try {
      await apiService.deletePlace(placeId);
      // Refresh places data
      await fetchPlaces();
      // Refresh stats
      await fetchStats();
    } catch (err) {
      console.error('Error deleting place:', err);
      throw err;
    }
  }, [fetchPlaces, fetchStats]);

  // Search functionality
  const searchPlaces = useCallback(async (query: string) => {
    try {
      return await apiService.searchPlaces(query);
    } catch (err) {
      console.error('Error searching places:', err);
      return [];
    }
  }, []);

  const searchBookings = useCallback(async (query: string) => {
    try {
      return await apiService.searchBookings(query);
    } catch (err) {
      console.error('Error searching bookings:', err);
      return [];
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, [refreshData]);

  return {
    // Data
    stats,
    places,
    bookings,
    users,
    
    // State
    loading,
    error,
    
    // Actions
    refreshData,
    fetchStats,
    fetchPlaces,
    fetchBookings,
    fetchUsers,
    updateBookingStatus,
    createPlace,
    updatePlace,
    deletePlace,
    searchPlaces,
    searchBookings,
  };
}
