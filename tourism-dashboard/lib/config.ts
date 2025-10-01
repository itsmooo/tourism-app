// Configuration for the dashboard
export const config = {
  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://tourism-app-ruddy.vercel.app/api',
    timeout: 10000, // 10 seconds
  },

  // Dashboard Configuration
  dashboard: {
    autoRefreshInterval: 30000, // 30 seconds
    maxRetries: 3,
  },

  // Features
  features: {
    realTimeUpdates: true,
    searchEnabled: true,
    exportEnabled: true,
  },

  // Pagination
  pagination: {
    defaultPageSize: 10,
    maxPageSize: 100,
  },
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${config.api.baseUrl}${endpoint}`;
};
