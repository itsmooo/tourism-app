// Environment configuration for the dashboard
export const env = {
  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://tourism-app-ruddy.vercel.app/api',
    timeout: 10000,
  },
  
  // Environment
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Debug Mode
  debug: process.env.NEXT_PUBLIC_DEBUG === 'true',
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${env.api.baseUrl}${endpoint}`;
};
