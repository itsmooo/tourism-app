# Localhost Setup for Destinations

## Overview

The destinations section has been configured to use localhost API instead of Vercel deployment to avoid file system issues. Vercel's serverless functions have a read-only file system, which prevents file uploads to the `/uploads` directory.

## Configuration

### Environment Variables

The following environment variables are used:

- `NEXT_PUBLIC_API_URL`: Main API URL (defaults to Vercel deployment)
- `NEXT_PUBLIC_LOCALHOST_API_URL`: Localhost API URL for file uploads (defaults to `http://localhost:9000/api`)

### API Service Changes

The API service has been updated to:

1. Use localhost for all places operations (GET, POST, PUT, DELETE)
2. Use Vercel deployment for other operations (bookings, users, etc.)
3. Use localhost for image URL construction

## Setup Instructions

1. **Start the local Node.js server:**
   ```bash
   cd tourism_app/node-server
   npm start
   ```

2. **Start the dashboard:**
   ```bash
   cd tourism-dashboard
   npm run dev
   ```

3. **Verify the setup:**
   - Destinations section should now work with file uploads
   - Other sections (bookings, users) will continue to use Vercel deployment
   - Images should load from localhost:9000

## Troubleshooting

### Common Issues

1. **CORS errors**: Make sure the localhost server is running and configured to allow requests from the dashboard
2. **Image loading issues**: Verify that the localhost server is serving static files from the `/uploads` directory
3. **API connection errors**: Check that the localhost server is running on port 9000

### File Structure

The localhost server should have the following structure:
```
tourism_app/node-server/
├── uploads/          # Directory for uploaded images
├── server.js         # Main server file
└── ...
```

## Notes

- This setup only affects the destinations section
- Other dashboard sections continue to use the Vercel deployment
- The localhost server must be running for destinations to work properly
- Images are served from the localhost server's `/uploads` directory
