# Tourism Dashboard Integration Guide

This guide explains how to set up and use the tourism dashboard with the Node.js backend for managing tourist destinations.

## 🚀 Quick Start

### 1. Start the Node.js Backend

```bash
cd tourism_app/node-server

# Create environment file
echo "MONGO_URI=mongodb://localhost:27017/tourism_app
JWT_SECRET=your_secret_key_here
PORT=9000
NODE_ENV=development" > .env

# Install dependencies
npm install

# Start the server
npm start
```

### 2. Start the Dashboard

```bash
cd tourism-dashboard

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

The dashboard will be available at `http://localhost:3000`

## 🔧 Backend Setup

### Environment Variables

Create a `.env` file in `tourism_app/node-server/`:

```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/tourism_app

# JWT Secret (generate a random string)
JWT_SECRET=your_jwt_secret_key_here

# Server Port
PORT=9000

# Node Environment
NODE_ENV=development
```

### Database Setup

1. Ensure MongoDB is running
2. The server will automatically create the database and collections
3. You can seed initial data using: `npm run seed`

## 📱 Dashboard Features

### Overview Section
- **Statistics Cards**: Total places, users, bookings, and revenue
- **Category Distribution**: Places grouped by category
- **Recent Places**: Latest added destinations
- **Quick Actions**: Navigation to different sections

### Destinations Section
- **View All Places**: Browse all tourist destinations
- **Search & Filter**: Find places by name, location, or category
- **Add New Place**: Create new tourist destinations
- **Manage Places**: Edit, delete, and view place details

### Place Management
- **Create Place**: Add new destinations with images
- **Edit Place**: Modify existing place information
- **Delete Place**: Remove destinations from the system
- **Image Upload**: Support for multiple image uploads

## 🖼️ Image Upload

The system supports image uploads for places:

- **Supported Formats**: JPG, PNG, WebP
- **File Size**: Up to 5MB per image
- **Multiple Images**: Up to 5 images per place
- **Storage**: Images stored in `uploads/` directory
- **Access**: Images served at `/uploads/` endpoint

## 🔐 Authentication

### Protected Routes
- **Admin Only**: Create, update, delete places
- **Public**: View places, search, filter

### JWT Token
- Stored in localStorage as `authToken`
- Automatically included in API requests
- Required for admin operations

## 📊 API Endpoints

### Places
- `GET /api/places` - Get all places
- `GET /api/places/:id` - Get place by ID
- `GET /api/places/category/:category` - Get places by category
- `POST /api/places` - Create new place (admin)
- `PUT /api/places/:id` - Update place (admin)
- `DELETE /api/places/:id` - Delete place (admin)
- `POST /api/places/test-upload` - Test image upload

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/users` - Get all users (admin)

### Bookings
- `GET /api/bookings` - Get all bookings
- `PUT /api/bookings/:id/status` - Update booking status

## 🧪 Testing

### Test API Connection
```bash
cd tourism-dashboard
node test-api.js
```

This will test:
- Server connection
- Places endpoint
- Image upload
- Authentication

### Expected Output
```
🧪 Testing API endpoints...

1️⃣ Testing server connection...
✅ Server is running

2️⃣ Testing GET /places endpoint...
✅ Places endpoint working
📊 Response format: object
📊 Data structure: data,cached,version,timestamp,count
📊 Places count: 5

3️⃣ Testing POST /places/test-upload endpoint...
✅ Image upload test working

4️⃣ Testing GET /auth endpoint...
✅ Auth endpoint working

🏁 API testing completed!
```

## 🐛 Troubleshooting

### Common Issues

1. **Server Won't Start**
   - Check if port 9000 is available
   - Verify MongoDB is running
   - Check environment variables

2. **Database Connection Failed**
   - Verify MongoDB URI in `.env`
   - Check if MongoDB service is running
   - Ensure database name is correct

3. **Image Upload Fails**
   - Check `uploads/` directory permissions
   - Verify file size limits
   - Check supported file formats

4. **Authentication Errors**
   - Verify JWT_SECRET in `.env`
   - Check token expiration
   - Ensure user role is 'admin'

5. **CORS Issues**
   - Backend has CORS enabled for all origins
   - Check if frontend URL is correct

### Debug Mode

Enable debug mode in the dashboard:

```env
NEXT_PUBLIC_DEBUG=true
```

This will show additional console logs and error details.

## 📁 File Structure

```
tourism-dashboard/
├── components/
│   ├── sections/
│   │   ├── overview-section.jsx      # Dashboard overview
│   │   └── destinations-section.jsx   # Places management
│   └── create-place-modal.jsx        # Add/edit place form
├── lib/
│   ├── api-service.ts                # API communication
│   └── env.ts                        # Environment config
└── test-api.js                       # API testing script

tourism_app/node-server/
├── src/
│   ├── controllers/
│   │   └── placeController.js        # Place business logic
│   ├── models/
│   │   └── Place.js                  # Place data model
│   ├── routes/
│   │   └── placeRoutes.js            # API endpoints
│   └── middleware/
│       └── authMiddleware.js         # Authentication
├── uploads/                          # Image storage
└── server.js                         # Main server file
```

## 🚀 Deployment

### Production Environment

1. **Backend**
   - Set `NODE_ENV=production`
   - Use production MongoDB URI
   - Set strong JWT_SECRET
   - Configure proper CORS origins

2. **Frontend**
   - Set `NEXT_PUBLIC_API_URL` to production backend
   - Build and deploy to hosting service
   - Configure environment variables

### Environment Variables

```env
# Production
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/tourism_app
JWT_SECRET=very_strong_secret_key_here
PORT=9000
CORS_ORIGIN=https://yourdomain.com
```

## 📞 Support

If you encounter issues:

1. Check the console logs in both frontend and backend
2. Verify all environment variables are set
3. Test API endpoints using `test-api.js`
4. Check MongoDB connection and data
5. Review server logs for error messages

## 🔄 Updates

To update the system:

1. Pull latest changes
2. Install new dependencies: `npm install` / `pnpm install`
3. Restart both backend and frontend servers
4. Test functionality using `test-api.js`

---

**Happy Tourism Management! 🏖️✈️**
