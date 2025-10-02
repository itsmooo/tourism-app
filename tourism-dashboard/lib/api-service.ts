// API Service for connecting to Node.js backend
import { env } from './env';
const API_BASE_URL = env.api.baseUrl;
const LOCALHOST_API_URL = env.api.localhostUrl;

export interface Place {
  _id: string;
  name_eng: string;
  name_som: string;
  desc_eng: string;
  desc_som: string;
  location: string;
  category: 'beach' | 'historical' | 'cultural' | 'religious' | 'suburb' | 'urban park';
  image_path: string;
  image_data?: string;
  pricePerPerson: number;
  maxCapacity: number;
  availableDates: Date[];
  createdAt: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  full_name?: string;
  role: 'tourist' | 'admin';
  favorites: string[];
  createdAt: string;
}

export interface Booking {
  _id: string;
  user: User;
  place: Place;
  bookingDate: string;
  numberOfPeople: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'failed';
  createdAt: string;
}

export interface Payment {
  _id: string;
  booking: string;
  amount: number;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalPlaces: number;
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  pendingBookings: number;
  completedBookings: number;
  categoryDistribution: { [key: string]: number };
  monthlyRevenue: { month: string; revenue: number }[];
  recentBookings: Booking[];
  topDestinations: { place: Place; bookingCount: number }[];
  // Include full datasets to avoid duplicate fetching on the client
  places?: Place[];
  bookings?: Booking[];
  users?: User[];
}

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Get auth token from localStorage
    const token = localStorage.getItem('authToken');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  private async requestWithUrl<T>(baseUrl: string, endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${baseUrl}${endpoint}`;
    
    // Get auth token from localStorage
    const token = localStorage.getItem('authToken');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      // Handle wrapped response format from localhost API
      return result.data || result;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Places API - using localhost for all operations to avoid Vercel file system issues
  async getAllPlaces(): Promise<Place[]> {
    return this.requestWithUrl<Place[]>(LOCALHOST_API_URL, '/places');
  }

  async getPlaceById(id: string): Promise<Place> {
    return this.requestWithUrl<Place>(LOCALHOST_API_URL, `/places/${id}`);
  }

  async getPlacesByCategory(category: string): Promise<Place[]> {
    return this.requestWithUrl<Place[]>(LOCALHOST_API_URL, `/places/category/${category}`);
  }

  async createPlace(placeData: FormData): Promise<Place> {
    const url = `${LOCALHOST_API_URL}/places`;
    
    // Get auth token from localStorage
    const token = localStorage.getItem('authToken');
    console.log('🔑 Frontend token for createPlace:', token);
    
    const config: RequestInit = {
      method: 'POST',
      body: placeData,
      headers: {
        // Don't set Content-Type for FormData - let browser set it
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    };
    
    console.log('📤 Frontend request config:', config);

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      // Handle wrapped response format from localhost API
      return result.data || result;
    } catch (error) {
      console.error(`API request failed for /places:`, error);
      throw error;
    }
  }

  async updatePlace(id: string, placeData: FormData): Promise<Place> {
    const url = `${LOCALHOST_API_URL}/places/${id}`;
    
    // Get auth token from localStorage
    const token = localStorage.getItem('authToken');
    
    const config: RequestInit = {
      method: 'PUT',
      body: placeData,
      headers: {
        // Don't set Content-Type for FormData - let browser set it
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      // Handle wrapped response format from localhost API
      return result.data || result;
    } catch (error) {
      console.error(`API request failed for /places/${id}:`, error);
      throw error;
    }
  }

  async deletePlace(id: string): Promise<void> {
    return this.requestWithUrl<void>(LOCALHOST_API_URL, `/places/${id}`, {
      method: 'DELETE',
    });
  }

  // Bookings API
  async getAllBookings(): Promise<Booking[]> {
    return this.request<Booking[]>('/bookings');
  }

  async updateBookingStatus(id: string, status: string, paymentStatus?: string): Promise<Booking> {
    const body: any = { status };
    if (paymentStatus) {
      body.paymentStatus = paymentStatus;
    }
    
    return this.request<Booking>(`/bookings/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async getBookingById(id: string): Promise<Booking> {
    return this.request<Booking>(`/bookings/${id}`);
  }

  async cancelBooking(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/bookings/${id}`, {
      method: 'DELETE',
    });
  }

  async deleteBooking(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/bookings/${id}`, {
      method: 'DELETE',
    });
  }

  // Users API
  async getAllUsers(): Promise<User[]> {
    return this.request<User[]>('/users');
  }

  async getUserById(id: string): Promise<User> {
    return this.request<User>(`/users/${id}`);
  }

  async createUser(userData: Partial<User>): Promise<User> {
    // Backend does not expose POST /users; use registration endpoint instead
    return this.request<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    return this.request<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Dashboard Statistics
  async getDashboardStats(): Promise<DashboardStats> {
    // This would be a custom endpoint on your backend
    // For now, we'll aggregate data from existing endpoints
    const [places, bookings, users] = await Promise.all([
      this.getAllPlaces(),
      this.getAllBookings(),
      this.getAllUsers(),
    ]);

    // Handle different data formats - check if data is wrapped in an object
    const placesArray = Array.isArray(places) ? places : (places as any)?.data || [];
    const bookingsArray = Array.isArray(bookings) ? bookings : (bookings as any)?.data || [];
    const usersArray = Array.isArray(users) ? users : (users as any)?.data || [];

    // Calculate statistics
    const totalRevenue = bookingsArray
      .filter((b: any) => b.paymentStatus === 'paid')
      .reduce((sum: number, b: any) => sum + b.totalPrice, 0);

    const pendingBookings = bookingsArray.filter((b: any) => b.status === 'pending').length;
    const completedBookings = bookingsArray.filter((b: any) => b.status === 'completed').length;

    // Category distribution
    const categoryDistribution = placesArray.reduce((acc: { [key: string]: number }, place: any) => {
      acc[place.category] = (acc[place.category] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    // Monthly revenue (last 6 months)
    const monthlyRevenue = this.calculateMonthlyRevenue(bookingsArray);

    // Top destinations
    const topDestinations = this.calculateTopDestinations(placesArray, bookingsArray);

    return {
      totalPlaces: placesArray.length,
      totalUsers: usersArray.length,
      totalBookings: bookingsArray.length,
      totalRevenue,
      pendingBookings,
      completedBookings,
      categoryDistribution,
      monthlyRevenue,
      recentBookings: bookingsArray.slice(0, 5), // Last 5 bookings
      topDestinations,
      places: placesArray,
      bookings: bookingsArray,
      users: usersArray,
    };
  }

  private calculateMonthlyRevenue(bookings: Booking[]) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData: { [key: string]: number } = {};
    
    // Initialize last 6 months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${months[month.getMonth()]} ${month.getFullYear()}`;
      monthlyData[monthKey] = 0;
    }

    // Calculate revenue for each month
    bookings.forEach(booking => {
      if (booking.paymentStatus === 'paid') {
        const date = new Date(booking.createdAt);
        const monthKey = `${months[date.getMonth()]} ${date.getFullYear()}`;
        if (monthlyData[monthKey] !== undefined) {
          monthlyData[monthKey] += booking.totalPrice;
        }
      }
    });

    return Object.entries(monthlyData).map(([month, revenue]) => ({ month, revenue }));
  }

  private calculateTopDestinations(places: Place[], bookings: Booking[]) {
    const placeBookingCounts: { [key: string]: number } = {};
    
    bookings.forEach(booking => {
      const placeId = typeof booking.place === 'string' ? booking.place : booking.place._id;
      placeBookingCounts[placeId] = (placeBookingCounts[placeId] || 0) + 1;
    });

    return places
      .map(place => ({
        place,
        bookingCount: placeBookingCounts[place._id] || 0,
      }))
      .sort((a, b) => b.bookingCount - a.bookingCount)
      .slice(0, 5); // Top 5 destinations
  }

  // Search functionality
  async searchPlaces(query: string): Promise<Place[]> {
    const allPlaces = await this.getAllPlaces();
    const searchTerm = query.toLowerCase();
    
    return allPlaces.filter(place => 
      place.name_eng.toLowerCase().includes(searchTerm) ||
      place.name_som.toLowerCase().includes(searchTerm) ||
      place.location.toLowerCase().includes(searchTerm) ||
      place.category.toLowerCase().includes(searchTerm)
    );
  }

  async searchBookings(query: string): Promise<Booking[]> {
    const allBookings = await this.getAllBookings();
    const searchTerm = query.toLowerCase();
    
    return allBookings.filter(booking => 
      (typeof booking.user === 'string' ? '' : booking.user.username.toLowerCase().includes(searchTerm)) ||
      (typeof booking.place === 'string' ? '' : booking.place.name_eng.toLowerCase().includes(searchTerm)) ||
      booking.status.toLowerCase().includes(searchTerm) ||
      booking.paymentStatus.toLowerCase().includes(searchTerm)
    );
  }
}

export const apiService = new ApiService();
