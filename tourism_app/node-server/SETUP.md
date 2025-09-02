# Node.js Server Setup Guide

## Environment Variables

Create a `.env` file in the `tourism_app/node-server` directory with the following variables:

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

## Installation & Startup

1. **Install dependencies:**
   ```bash
   cd tourism_app/node-server
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

   The server will start on port 9000.

## API Endpoints

### Public Endpoints (No Authentication Required)
- `GET /api/places` - Get all places
- `GET /api/places/:id` - Get place by ID
- `GET /api/places/category/:category` - Get places by category
- `POST /api/places/test-upload` - Test image upload

### Protected Endpoints (Admin Authentication Required)
- `POST /api/places` - Create new place
- `PUT /api/places/:id` - Update place
- `DELETE /api/places/:id` - Delete place

## Testing the API

Run the test script to verify all endpoints are working:

```bash
cd tourism-dashboard
node test-api.js
```

## Database Setup

Make sure MongoDB is running and accessible at the URI specified in your `.env` file.

## Image Upload

Images are stored in the `uploads/` directory and served statically at `/uploads/` endpoint.

## Troubleshooting

1. **Port already in use:** Change the PORT in `.env` file
2. **MongoDB connection failed:** Check if MongoDB is running and the URI is correct
3. **JWT errors:** Ensure JWT_SECRET is set in `.env`
4. **Image upload fails:** Check if `uploads/` directory exists and has write permissions
