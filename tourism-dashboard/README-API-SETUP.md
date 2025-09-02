# 🚀 Somalia Tourism Dashboard - API Integration Setup

This dashboard is now connected to your Node.js backend server to display real data instead of mock data.

## 📋 Prerequisites

1. **Node.js Server Running**: Ensure your Node.js server is running on port 9000
2. **MongoDB Database**: Make sure your MongoDB is running and accessible
3. **Environment Variables**: Set up the necessary environment variables

## 🔧 Setup Instructions

### 1. Start Your Node.js Server

Navigate to your Node.js server directory and start it:

```bash
cd tourism_app/node-server
npm install
npm start
```

Your server should be running on `http://localhost:9000`

### 2. Environment Configuration

Create a `.env.local` file in your dashboard root directory:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:9000/api

# Environment
NODE_ENV=development
```

### 3. Database Seeding (Optional)

If you need sample data, run the seeding script:

```bash
cd tourism_app/node-server
npm run seed
```

### 4. Start the Dashboard

In a new terminal, start your Next.js dashboard:

```bash
cd somalia-tourism-dashboard
npm run dev
```

## 🌐 API Endpoints

The dashboard connects to these endpoints:

- **Places**: `GET /api/places` - Fetch all tourist destinations
- **Bookings**: `GET /api/bookings` - Fetch all bookings
- **Users**: `GET /api/users` - Fetch all users
- **Booking Status**: `PUT /api/bookings/:id/status` - Update booking status

## 📊 Real Data Features

### Dashboard Overview
- ✅ **Real-time Statistics**: Total users, bookings, places, and revenue
- ✅ **Live Bookings**: Recent bookings with real user and destination data
- ✅ **Top Destinations**: Popular places based on actual booking counts
- ✅ **Auto-refresh**: Data updates every 30 seconds

### Data Management
- ✅ **CRUD Operations**: Create, read, update, delete places
- ✅ **Booking Management**: Update booking statuses
- ✅ **Search Functionality**: Search across places and bookings
- ✅ **Error Handling**: Graceful error handling with retry options

## 🔍 Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure Node.js server is running on port 9000
   - Check if MongoDB is accessible

2. **CORS Errors**
   - Verify CORS is enabled in your Node.js server
   - Check browser console for CORS-related errors

3. **Data Not Loading**
   - Check browser network tab for failed API calls
   - Verify API endpoints are working with tools like Postman

4. **Environment Variables**
   - Ensure `.env.local` file exists and has correct values
   - Restart Next.js dev server after adding environment variables

### Debug Mode

Enable debug logging by adding to your `.env.local`:

```bash
NEXT_PUBLIC_DEBUG=true
```

## 🚀 Next Steps

1. **Add Authentication**: Implement JWT-based authentication
2. **Real-time Updates**: Add WebSocket support for live updates
3. **File Uploads**: Enable image uploads for places
4. **Advanced Analytics**: Add more detailed reporting features
5. **Export Functionality**: Implement data export to CSV/PDF

## 📁 File Structure

```
somalia-tourism-dashboard/
├── lib/
│   ├── api-service.ts      # API service for backend communication
│   └── config.ts           # Configuration settings
├── hooks/
│   └── use-dashboard-data.ts # Custom hook for data management
├── components/
│   └── sections/
│       └── overview-section.jsx # Updated with real data
└── README-API-SETUP.md     # This file
```

## 🤝 Support

If you encounter any issues:

1. Check the browser console for error messages
2. Verify your Node.js server logs
3. Ensure all dependencies are installed
4. Check MongoDB connection status

---

**Happy Coding! 🎉**
