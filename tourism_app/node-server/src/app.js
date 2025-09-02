const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./config/connectDB');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect to MongoDB (ensure single connection in serverless by checking connection state inside connectDB)
connectDB();

// Middleware
app.use(express.json());
app.use(cors());

// Static files (note: on Vercel, writing to /uploads will not persist)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/places', require('./routes/placeRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/favorites', require('./routes/favoritesRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));

// Health check
app.get('/', (_req, res) => {
  res.send('Tourism App API is running...');
});

module.exports = app;


