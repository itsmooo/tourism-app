import { useState, useEffect, useCallback } from 'react';
import { apiService, DashboardStats, Place, Booking, User } from '../lib/api-service';

export function useDashboardData() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  // Fetch dashboard statistics (now returns places, bookings, users too)
  const fetchStats = useCallback(async (forceRefresh = false) => {
    // Don't fetch if we have recent data and don't need to force refresh
    if (!forceRefresh && stats && lastFetch) {
      const timeSinceLastFetch = Date.now() - lastFetch.getTime();
      if (timeSinceLastFetch < 5 * 60 * 1000) { // 5 minutes
        setLoading(false);
        return;
      }
    }

    try {
      setLoading(true);
      const dashboardStats = await apiService.getDashboardStats();
      setStats(dashboardStats);
      // If server returned full datasets, set them to avoid extra requests
      if (Array.isArray((dashboardStats as any).places)) {
        setPlaces((dashboardStats as any).places as Place[]);
      }
      if (Array.isArray((dashboardStats as any).bookings)) {
        setBookings((dashboardStats as any).bookings as Booking[]);
      }
      if (Array.isArray((dashboardStats as any).users)) {
        setUsers((dashboardStats as any).users as User[]);
      }
      setLastFetch(new Date());
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
      const bookingsData = await apiService.getAllBookings();
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
    // Single call: fetchStats already hydrates places/bookings/users
    await fetchStats();
  }, [fetchStats]);

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

  // Auto-refresh data every 30 seconds, pause when tab is hidden
  useEffect(() => {
    let interval: any;
    const start = () => {
      interval = setInterval(() => {
        if (typeof document === 'undefined' || document.visibilityState === 'visible') {
          refreshData();
        }
      }, 30000);
    };
    const handleVisibility = () => {
      if (typeof document === 'undefined') return;
      if (document.visibilityState === 'visible') {
        refreshData();
      }
    };
    start();
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibility);
    }
    return () => {
      clearInterval(interval);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibility);
      }
    };
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
